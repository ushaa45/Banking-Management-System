const TONE_MAP = {
  // positive outcomes
  ACTIVE: "success", APPROVED: "success", DISBURSED: "success", SETTLED: "success",
  SUCCESS: "success", VERIFIED: "success", SANCTIONED: "success", MATURED: "success", PAID: "success",
  // in progress / needs attention
  PENDING: "warning", FILED: "warning", UNDER_REVIEW: "warning", APPLIED: "warning",
  KYC_VERIFIED: "warning", CREDIT_EVALUATED: "warning", DUE: "warning",
  // negative outcomes
  REJECTED: "danger", FAILED: "danger", LAPSED: "danger", BLOCKED: "danger",
  FROZEN: "danger", REVERSED: "danger", OVERDUE: "danger", CLOSED_PREMATURE: "danger",
  // terminal / neutral
  CLOSED: "neutral", CANCELLED: "neutral", EXPIRED: "neutral", INACTIVE: "neutral",
};

function formatLabel(status) {
  const words = status.split("_").map((w) => (w === "KYC" ? "KYC" : w.toLowerCase()));
  words[0] = words[0] === "KYC" ? "KYC" : words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
}

export default function StatusBadge({ status }) {
  if (!status) return null;
  const tone = TONE_MAP[status] || "neutral";
  return <span className={`badge badge-${tone}`}>{formatLabel(status)}</span>;
}