import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";
import type { RentCalendar } from "../types/shop";
import { afghanMonths, formatAfghanDate } from "./afghanDate";

export const calendarLabel = (calendar: RentCalendar = "gregorian") =>
  calendar === "shamsi" ? "Afghan Shamsi" : "Gregorian";

export function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 0x6f0 : 0x660)),
  );
}

export function isoDate(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function validIsoDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "0001-01-01" &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function calendarParts(
  iso: string,
  calendar: RentCalendar = "gregorian",
) {
  const [year, month, day] = iso.split("-").map(Number);
  if (calendar === "gregorian") return { year, month, day };
  const { jy, jm, jd } = toJalaali(year, month, day);
  return { year: jy, month: jm, day: jd };
}

export function parseCalendarDate(
  value: string,
  calendar: RentCalendar,
): string | null {
  const normalized = normalizeDigits(value.trim());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  if (calendar === "gregorian")
    return validIsoDate(normalized) ? normalized : null;
  const [year, month, day] = normalized.split("-").map(Number);
  // Limit to the conversion library's supported civil years; reject invalid leap days.
  if (year < 1 || year > 3177 || !isValidJalaaliDate(year, month, day))
    return null;
  const { gy, gm, gd } = toGregorian(year, month, day);
  return isoDate(gy, gm, gd);
}

export function calendarInputDate(iso: string, calendar: RentCalendar) {
  if (!supportedCalendarDate(iso, calendar)) return "";
  const parts = calendarParts(iso, calendar);
  return isoDate(parts.year, parts.month, parts.day);
}

export function supportedCalendarDate(iso: string, calendar: RentCalendar) {
  if (!validIsoDate(iso)) return false;
  try {
    const { year } = calendarParts(iso, calendar);
    return year >= 1 && year <= (calendar === "shamsi" ? 3177 : 9999);
  } catch {
    return false;
  }
}

export function addCalendarMonths(
  start: string,
  offset: number,
  calendar: RentCalendar = "gregorian",
): string {
  const { year, month, day } = calendarParts(start, calendar);
  const index = year * 12 + month - 1 + offset;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  if (calendar === "shamsi") {
    const nextDay = Math.min(day, jalaaliMonthLength(nextYear, nextMonth));
    const { gy, gm, gd } = toGregorian(nextYear, nextMonth, nextDay);
    return isoDate(gy, gm, gd);
  }
  const end = new Date(0);
  end.setUTCFullYear(nextYear, nextMonth, 0);
  return isoDate(nextYear, nextMonth, Math.min(day, end.getUTCDate()));
}

export function calendarMonthDifference(
  start: string,
  end: string,
  calendar: RentCalendar = "gregorian",
) {
  const a = calendarParts(start, calendar);
  const b = calendarParts(end, calendar);
  return (b.year - a.year) * 12 + b.month - a.month;
}

export function calendarMonthStart(date: string, calendar: RentCalendar) {
  const { year, month } = calendarParts(date, calendar);
  return parseCalendarDate(isoDate(year, month, 1), calendar)!;
}

export function formatRentDate(
  iso: string,
  calendar: RentCalendar = "gregorian",
  language = "en",
) {
  if (!supportedCalendarDate(iso, calendar)) return iso;
  return calendar === "shamsi" ? formatAfghanDate(iso, language) : iso;
}

export function formatRentMonth(
  iso: string,
  calendar: RentCalendar = "gregorian",
  language = "en",
) {
  const { year, month } = calendarParts(iso, calendar);
  if (calendar === "shamsi") {
    const text = `${afghanMonths[language === "ps" ? "ps" : "en"][month - 1]} ${year}`;
    return language === "ps"
      ? text.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
      : text;
  }
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
