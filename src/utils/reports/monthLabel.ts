import type { RentCalendar } from "../../types/shop";
import { formatRentMonth } from "../calendar";

export function reportMonthLabel(
  date: string,
  calendar: RentCalendar,
  language: string,
) {
  const month = formatRentMonth(date, calendar, language).split(" ")[0];
  return calendar === "gregorian" ? month.slice(0, 3) : month;
}
