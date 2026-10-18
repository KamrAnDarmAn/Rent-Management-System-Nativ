import { kabulDate } from "../domain/rentSchedule";
import { formatAfghanDate } from "./afghanDate";

export function formatSavedAt(value: string, language: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  const time = new Intl.DateTimeFormat(language === "ps" ? "ps-AF" : "en-GB", {
    timeZone: "Asia/Kabul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatAfghanDate(kabulDate(date), language)} · ${time}`;
}
