import { expect, test } from "@playwright/test";
import { normalizePreferences } from "../src/domain/preferences";

test("malformed saved preferences fall back to safe defaults without importing actions", () => {
  const defaults = normalizePreferences(undefined);
  for (const input of [
    null,
    [],
    "corrupt",
    {
      language: { code: "ps" },
      theme: "unknown",
      reminders: "true",
      reminderDay: 999,
      rentViewCalendar: "invalid",
      lastBackupAt: "broken",
      setLanguage: "replace action",
      setTheme: "replace action",
    },
  ]) {
    expect(normalizePreferences(input)).toEqual(defaults);
  }
});

test("valid saved preferences retain language, theme, calendar and backup time", () => {
  const saved = {
    language: "ps",
    theme: "dark",
    reminders: true,
    reminderDay: 28,
    rentViewCalendar: "shamsi",
    lastBackupAt: "2026-10-18T10:00:00Z",
  };
  expect(normalizePreferences({ ...saved, extra: "ignored" })).toEqual(saved);
  for (const reminderDay of [0, 29, 1.5, "5", NaN])
    expect(normalizePreferences({ reminderDay }).reminderDay).toBe(5);
});
