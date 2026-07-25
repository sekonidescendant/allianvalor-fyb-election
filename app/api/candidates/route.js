import { getRedis, POSITIONS } from "../../../lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redis = getRedis();
    const raw = await redis.hvals("vote:candidates");
    const candidates = raw
      .map((r) => {
        try {
          return JSON.parse(r);
        } catch {
          return null;
        }
      })
      .filter((c) => c && c.approved);

    const positions = POSITIONS.map((position) => ({
      position,
      candidates: candidates
        .filter((c) => c.position === position)
        .map((c) => ({ id: c.id, fullName: c.fullName, manifesto: c.manifesto, photo: c.photo || null }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    }));

    return Response.json({ ok: true, positions });
  } catch (err) {
    console.error("Aggregate candidates error:", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
