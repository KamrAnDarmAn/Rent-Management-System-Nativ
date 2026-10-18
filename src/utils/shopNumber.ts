export function normalizeShopNumber(value: string): string {
  const number = value
    .trim()
    .replace(/^shop(?=\s|#|\d)\s*#?\s*/i, "")
    .replace(/^#\s*/, "")
    .trim();
  return /^\d+$/.test(number)
    ? number.replace(/^0+(?=\d)/, "").padStart(2, "0")
    : number;
}
