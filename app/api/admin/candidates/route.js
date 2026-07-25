import { getRedis, POSITIONS, slugifyPosition } from "../../../../lib/redis";

function checkAuth(password) {
  return process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { password, action } = body;

    if (!checkAuth(password)) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    const redis = getRedis();

    if (action === "list") {
      const rawApps = await redis.lrange("ad26:applications", 0, -1);
      const applications = rawApps
        .map((r) => {
          try {
            return JSON.parse(r);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      const candRaw = await redis.hgetall("vote:candidates");
      const candidateMap = {};
      for (const [id, val] of Object.entries(candRaw)) {
        try {
          candidateMap[id] = JSON.parse(val);
        } catch {}
      }

      const merged = applications.map((a) => ({
        id: a.refCode,
        fullName: a.fullName,
        position: a.position,
        manifesto: a.manifesto,
        email: a.email,
        phone: a.phone,
        level: a.level,
        submittedAt: a.submittedAt,
        approved: candidateMap[a.refCode]?.approved || false,
        photo: candidateMap[a.refCode]?.photo || null,
      }));

      const votingOpen = (await redis.get("vote:open")) === "1";

      return Response.json({ ok: true, applications: merged, votingOpen });
    }

    if (action === "approve") {
      const { id, fullName, position, manifesto, photo, approved } = body;
      if (!id || !POSITIONS.includes(position)) {
        return Response.json({ error: "Invalid candidate data." }, { status: 400 });
      }
      const record = {
        id,
        fullName,
        position,
        manifesto,
        photo: photo || null,
        approved: !!approved,
      };
      await redis.hset("vote:candidates", id, JSON.stringify(record));
      return Response.json({ ok: true });
    }

    if (action === "setVotingOpen") {
      const { open } = body;
      await redis.set("vote:open", open ? "1" : "0");
      return Response.json({ ok: true });
    }

    if (action === "resetTally") {
      const { position } = body;
      const slug = slugifyPosition(position);
      await redis.del(`vote:tally:${slug}`);
      await redis.del(`vote:voted:${slug}`);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Admin route error:", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
