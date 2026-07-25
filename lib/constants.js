export const POSITIONS = [
  "Chairman",
  "Vice Chairman",
  "General Secretary",
  "Financial Secretary",
  "Treasurer",
  "Social Director (Security Coordinator)",
  "Welfare Director",
  "Media Director",
  "Member",
];

export function slugifyPosition(position) {
  return position
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const POSITION_BY_SLUG = Object.fromEntries(
  POSITIONS.map((p) => [slugifyPosition(p), p])
);

// Edit these once you have firm dates.
export const KEY_DATES = {
  applicationDeadline: "TBA",
  votingOpens: "TBA",
  votingCloses: "TBA",
  resultsAnnounced: "TBA",
};

export const ADMIN_EMAILS = ["Talkwithsekoni@gmail.com", "Victoriaashefon@gmail.com"];
