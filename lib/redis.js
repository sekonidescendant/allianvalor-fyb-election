import Redis from "ioredis";

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 8000,
    });
  }
  return redis;
}

export { POSITIONS, slugifyPosition, POSITION_BY_SLUG, ADMIN_EMAILS } from "./constants";

// Redis key layout:
// ad26:applications              -> list of raw application JSON
// vote:candidates                -> hash, field = candidateId (== application refCode), value = candidate JSON
// vote:tally:<positionSlug>      -> hash, field = candidateId, value = vote count
// vote:voted:<positionSlug>      -> set of emails who already voted for that position
// vote:open                      -> "1" or unset — whether voting is currently open
