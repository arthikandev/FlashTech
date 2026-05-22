/** Strip whitespace and any pasted `https://bey.chat/<id>` URL to a bare agent ID. */
export function normalizeBpAgentId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^https?:\/\/(?:app\.)?bey\.chat\/([^/?#]+)/i);
  const id = match ? match[1] : trimmed;
  return id.replace(/\s+/g, "");
}
