// Formats seconds into mm:ss
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Curated Spotify-style vibrant gradients for track covers
const GRADIENTS = [
  "linear-gradient(135deg, #1db954 0%, #191414 100%)",
  "linear-gradient(135deg, #8420e2 0%, #e11d48 100%)",
  "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #10b981 0%, #065f46 100%)",
  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
  "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
];

export function getTrackGradient(idOrTitle = "") {
  let hash = 0;
  for (let i = 0; i < idOrTitle.length; i++) {
    hash = (hash << 5) - hash + idOrTitle.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

// Initial letters for cover art
export function getInitials(title = "") {
  return title
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "♪";
}
