export function validAmount(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
