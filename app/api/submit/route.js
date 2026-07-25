import nodemailer from "nodemailer";
import { getRedis, POSITIONS, ADMIN_EMAILS } from "../../../lib/redis";

function makeRefCode() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AD26-${rand}`;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, phone, level, email, position, manifesto } = body || {};

    if (!fullName || !String(fullName).trim())
      return Response.json({ error: "Full name is required." }, { status: 400 });
    if (!phone || !/^[\d+\s-]{7,15}$/.test(String(phone).trim()))
      return Response.json({ error: "A valid phone number is required." }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()))
      return Response.json({ error: "A valid email is required." }, { status: 400 });
    if (!position || !POSITIONS.includes(position))
      return Response.json({ error: "A valid position is required." }, { status: 400 });
    if (!manifesto || String(manifesto).trim().length < 40)
      return Response.json({ error: "Manifesto is too short." }, { status: 400 });

    const refCode = makeRefCode();
    const submittedAt = new Date().toISOString();

    const record = {
      refCode,
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      level: level ? String(level).trim() : "400 Level",
      email: String(email).trim(),
      position,
      manifesto: String(manifesto).trim(),
      submittedAt,
    };

    const redis = getRedis();
    try {
      await redis.lpush("ad26:applications", JSON.stringify(record));
    } catch (kvErr) {
      console.error("Redis store error:", kvErr);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const adminHtml = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#0B1E3D;">
        <h2 style="border-bottom:2px solid #0B1E3D;padding-bottom:10px;">New Candidacy Application — Allianvalor Decides '26</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
          <tr><td style="padding:6px 0;color:#555;width:140px;">Reference</td><td style="padding:6px 0;"><strong>${escapeHtml(refCode)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#555;">Full name</td><td style="padding:6px 0;">${escapeHtml(record.fullName)}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Phone</td><td style="padding:6px 0;">${escapeHtml(record.phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Level</td><td style="padding:6px 0;">${escapeHtml(record.level)}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Email</td><td style="padding:6px 0;">${escapeHtml(record.email)}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Position</td><td style="padding:6px 0;"><strong>${escapeHtml(record.position)}</strong></td></tr>
        </table>
        <div style="margin-top:18px;">
          <div style="color:#555;font-size:13px;margin-bottom:6px;">Manifesto</div>
          <div style="border-left:3px solid #C41E3A;padding:8px 14px;background:#F7F8FA;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(record.manifesto)}</div>
        </div>
        <p style="margin-top:20px;color:#888;font-size:12px;">Submitted ${new Date(submittedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
      </div>
    `;

    const applicantHtml = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#0B1E3D;">
        <h2>Allianvalor Decides '26</h2>
        <p style="font-size:15px;line-height:1.6;">Dear ${escapeHtml(record.fullName)},</p>
        <p style="font-size:15px;line-height:1.6;">
          Your candidacy application for <strong>${escapeHtml(record.position)}</strong>
          in the 2026/27 FYB Committee elections has been received and logged
          with the electoral desk.
        </p>
        <div style="border:1px solid #0B1E3D;padding:14px 18px;margin:20px 0;font-family:monospace;font-size:13px;">
          Reference code: <strong>${escapeHtml(refCode)}</strong>
        </div>
        <p style="font-size:15px;line-height:1.6;">
          Keep this reference for your records. If you applied for
          <strong>Chairman</strong> or <strong>Vice Chairman</strong>, please
          also reach out directly to the organizing desk — additional
          eligibility criteria apply to these two positions and will be
          shared with you privately.
        </p>
        <p style="font-size:15px;line-height:1.6;margin-top:20px;">Good luck.<br />— Allianvalor Decides '26 Electoral Desk</p>
      </div>
    `;

    const sendResults = await Promise.allSettled([
      transporter.sendMail({
        from: `"Allianvalor Decides '26" <${process.env.GMAIL_USER}>`,
        to: ADMIN_EMAILS.join(","),
        subject: `New Application: ${record.position} — ${record.fullName}`,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: `"Allianvalor Decides '26" <${process.env.GMAIL_USER}>`,
        to: record.email,
        subject: `Application received — ${refCode}`,
        html: applicantHtml,
      }),
    ]);

    if (sendResults[0].status === "rejected") console.error("Admin email failed:", sendResults[0].reason);
    if (sendResults[1].status === "rejected") console.error("Applicant email failed:", sendResults[1].reason);

    return Response.json({ ok: true, refCode });
  } catch (err) {
    console.error("Submit error:", err);
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
