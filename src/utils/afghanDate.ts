import { toJalaali } from "jalaali-js";

// Afghan civil month names, in Solar Hijri order (rather than Iranian names).
export const afghanMonths = {
  en: [
    "Hamal",
    "Saur",
    "Jawza",
    "Saratan",
    "Asad",
    "Sunbula",
    "Mizan",
    "Aqrab",
    "Qaus",
    "Jadi",
    "Dalw",
    "Hut",
  ],
  ps: [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ],
};

/** Format a Kabul civil date (YYYY-MM-DD) without using the device's timezone. */
export function formatAfghanDate(today: string, language: string): string {
  const [year, month, day] = today.split("-").map(Number);
  const { jy, jm, jd } = toJalaali(year, month, day);
  const locale = language === "ps" ? "ps" : "en";
  const date = `${jd} ${afghanMonths[locale][jm - 1]} ${jy}`;
  return locale === "ps"
    ? date.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
    : date;
}
