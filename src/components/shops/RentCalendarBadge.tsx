import type { RentCalendar } from "../../types/shop";
import { calendarLabel } from "../../utils/calendar";
import { Badge } from "../feedback/Badge";

export function RentCalendarBadge({
  calendar = "gregorian",
}: {
  calendar?: RentCalendar;
}) {
  return (
    <Badge
      label={calendarLabel(calendar)}
      icon="CalendarDays"
      tone="muted"
      small
    />
  );
}
