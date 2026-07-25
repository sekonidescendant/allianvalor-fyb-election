import { getRedis, POSITIONS, slugifyPosition } from "../../../lib/redis";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(req) {
  try {
    const { position, candidateId, email } = await req.json();

    if (!position || !POSITIONS.includes(position)) {
      return Response.json({ error: "Invalid position." }, { status: 400 });
    }
    if (!candidateId) {
      return Response.json({ error: "Select a candidate first." }, { status: 400 });
    }
    const normEmail = normalizeEmail(email);
    if (!normEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const redis = getRedis();

    const votingOpen = (await redis.get("vote:open")) === "1";
    if (!votingOpen) {
      return Response.json({ error: "Voting is not currently open." }, { status: 403 });
    }

    const candRaw = await redis.hget("vote:candidates", candidateId);
    if (!candRaw) {
      return Response.json({ error: "Candidate not found." }, { status: 404 });
    }
    const candidate = JSON.parse(candRaw);
    if (candidate.position !== position || !candidate.approved) {
      return Response.json({ error: "Candidate not valid for this position." }, { status: 400 });
    }

    const slug = slugifyPosition(position);
    const votedSetKey = `vote:voted:${slug}`;
    const tallyKey = `vote:tally:${slug}`;

    const added = await redis.sadd(votedSetKey, normEmail);
    if (added === 0) {
      return Response.json(
        { error: "This email has already voted for this position." },
        { status: 409 }
      );
    }

    await redis.hincrby(tallyKey, candidateId, 1);

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Vote error:", err);
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
