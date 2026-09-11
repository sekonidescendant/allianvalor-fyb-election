import { getRedis, POSITIONS, slugifyPosition, isAllowedVoterEmail } from "../../../../lib/redis";

export async function POST(req) {
  try {
    const { email, selections } = await req.json();

    const normEmail = String(email || "").trim().toLowerCase();
    if (!isAllowedVoterEmail(normEmail)) {
      return Response.json(
        { error: "Use your school email ending in @fuoye.edu.ng or @liondapt.com." },
        { status: 400 }
      );
    }

    if (!Array.isArray(selections) || selections.length === 0) {
      return Response.json({ error: "Select at least one candidate before submitting." }, { status: 400 });
    }

    const redis = getRedis();
    const votingOpen = (await redis.get("vote:open")) === "1";
    if (!votingOpen) {
      return Response.json({ error: "Voting is not currently open." }, { status: 403 });
    }

    const results = [];

    for (const sel of selections) {
      const { position, candidateId } = sel || {};
      if (!position || !POSITIONS.includes(position) || !candidateId) {
        results.push({ position, status: "invalid" });
        continue;
      }

      const candRaw = await redis.hget("vote:candidates", candidateId);
      if (!candRaw) {
        results.push({ position, status: "invalid" });
        continue;
      }
      const candidate = JSON.parse(candRaw);
      if (candidate.position !== position || !candidate.approved) {
        results.push({ position, status: "invalid" });
        continue;
      }

      const slug = slugifyPosition(position);
      const votedSetKey = `vote:voted:${slug}`;
      const tallyKey = `vote:tally:${slug}`;

      const added = await redis.sadd(votedSetKey, normEmail);
      if (added === 0) {
        results.push({ position, status: "already_voted" });
        continue;
      }

      await redis.hincrby(tallyKey, candidateId, 1);
      results.push({ position, status: "counted" });
    }

    return Response.json({ ok: true, results });
  } catch (err) {
    console.error("Bulk vote error:", err);
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
