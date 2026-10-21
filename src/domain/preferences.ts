import type { RentCalendar } from "../types/shop";

export type PreferenceValues = {
  language: "en" | "ps";
  theme: "light" | "dark" | "system";
  reminders: boolean;
  lastBackupAt?: string;
  reminderDay: number;
  rentViewCalendar: RentCalendar;
};

/** Device settings are untrusted input too. Never hydrate persisted actions. */
export function normalizePreferences(value: unknown): PreferenceValues {
  const saved =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    language: saved.language === "ps" ? "ps" : "en",
    theme:
      saved.theme === "light" || saved.theme === "dark"
        ? saved.theme
        : "system",
    reminders: saved.reminders === true,
    reminderDay:
      typeof saved.reminderDay === "number" &&
      Number.isInteger(saved.reminderDay) &&
      saved.reminderDay >= 1 &&
      saved.reminderDay <= 28
        ? saved.reminderDay
        : 5,
    rentViewCalendar:
      saved.rentViewCalendar === "shamsi" ? "shamsi" : "gregorian",
    lastBackupAt:
      typeof saved.lastBackupAt === "string" &&
      Number.isFinite(Date.parse(saved.lastBackupAt))
        ? saved.lastBackupAt
        : undefined,
  };
}
