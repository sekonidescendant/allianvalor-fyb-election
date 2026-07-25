import { getRedis, POSITION_BY_SLUG } from "../../../../lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const slug = params.position;
    const position = POSITION_BY_SLUG[slug];
    if (!position) {
      return Response.json({ error: "Unknown position." }, { status: 404 });
    }

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
      .filter((c) => c && c.position === position && c.approved)
      .map((c) => ({
        id: c.id,
        fullName: c.fullName,
        manifesto: c.manifesto,
        photo: c.photo || null,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    const votingOpen = (await redis.get("vote:open")) === "1";

    return Response.json({ ok: true, position, candidates, votingOpen });
  } catch (err) {
    console.error("Candidates fetch error:", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
