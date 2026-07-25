import { getRedis, POSITIONS, slugifyPosition } from "../../../lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redis = getRedis();
    const candRaw = await redis.hvals("vote:candidates");
    const candidates = candRaw
      .map((r) => {
        try {
          return JSON.parse(r);
        } catch {
          return null;
        }
      })
      .filter((c) => c && c.approved);

    const results = [];
    for (const position of POSITIONS) {
      const slug = slugifyPosition(position);
      const tally = await redis.hgetall(`vote:tally:${slug}`);
      const posCandidates = candidates.filter((c) => c.position === position);

      const rows = posCandidates
        .map((c) => ({
          id: c.id,
          fullName: c.fullName,
          votes: parseInt(tally[c.id] || "0", 10),
        }))
        .sort((a, b) => b.votes - a.votes);

      const totalVotes = rows.reduce((sum, r) => sum + r.votes, 0);
      results.push({ position, totalVotes, candidates: rows });
    }

    const votingOpen = (await redis.get("vote:open")) === "1";

    return Response.json({ ok: true, votingOpen, results });
  } catch (err) {
    console.error("Results fetch error:", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
