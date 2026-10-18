import i18n from "./index";
import { ps } from "./locales/ps";

export type TranslationValues = Record<string, string | number>;
const canonicalKeys = new Map(
  Object.keys(ps).map((key) => [key.toLowerCase(), key]),
);
const monthName =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g;
const dateText =
  /^(?:\d{1,2}\s+)?(?:[A-Za-z]+)(?:\s+\d{1,2},?)?\s+\d{4}(?:\s+▢)?$/;

/** Translate app copy where it is displayed. Never change stored records or enum values. */
export function translateText(
  text: string,
  language: string,
  values?: TranslationValues,
): string {
  const key = text.replace(/\s+/g, " ").trim();
  if (language !== "ps")
    return values ? String(i18n.t(key, { lng: "en", ...values })) : text;
  if (!key || !/[A-Za-z]/.test(key)) return text;

  const canonical = Object.prototype.hasOwnProperty.call(ps, key)
    ? key
    : canonicalKeys.get(key.toLowerCase());
  if (canonical) {
    const localizedValues =
      values &&
      Object.fromEntries(
        Object.entries(values).map(([name, value]) => [
          name,
          typeof value === "string" ? translateText(value, language) : value,
        ]),
      );
    return (
      (text.match(/^\s*/)?.[0] ?? "") +
      String(i18n.t(canonical, { lng: "ps", ...localizedValues })) +
      (text.match(/\s*$/)?.[0] ?? "")
    );
  }

  // Structured display values use the same translated labels with any date, amount or count.
  const amount = /^([−+\-]?\s*)AFN\s+([−+\-]?[\d,]+)$/.exec(key);
  if (amount) return `${amount[1]}${amount[2]} افغانۍ`;
  const count = /^(.+?)\s*\(([\d,]+)\)$/.exec(key);
  if (count && canonicalKeys.has(count[1].toLowerCase()))
    return `${translateText(count[1], language)} (${count[2]})`;
  const percent = /^(\d+)% (Occupied|Vacant)$/.exec(key);
  if (percent) return `${percent[1]}٪ ${translateText(percent[2], language)}`;
  const shop = /^Shop (#?)([\w\u0600-\u06ff-]+)$/.exec(key);
  if (shop) return `دوکان ${shop[1]}${shop[2]}`;
  if (dateText.test(key))
    return key.replace(monthName, (month) => ps[month] ?? month);
  const size = /^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/.exec(key);
  if (size)
    return `${size[1]} ${size[2] === "KB" ? "کیلوبایټ" : size[2] === "MB" ? "مېګابایټ" : "ګېګابایټ"}`;
  if (key.includes(" · "))
    return key
      .split(" · ")
      .map((part) => translateText(part, language))
      .join(" · ");
  if (key.includes(" – "))
    return key
      .split(" – ")
      .map((part) => translateText(part, language))
      .join(" – ");
  return text;
}
