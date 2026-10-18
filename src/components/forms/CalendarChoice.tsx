import type { RentCalendar } from "../../types/shop";
import { calendarLabel } from "../../utils/calendar";
import { Select } from "./Select";

export function CalendarChoice({
  value,
  onChange,
  label = "Rent Calendar",
}: {
  value: RentCalendar;
  onChange: (calendar: RentCalendar) => void;
  label?: string;
}) {
  return (
    <Select
      label={label}
      value={calendarLabel(value)}
      options={["Afghan Shamsi", "Gregorian"]}
      onChange={(option) =>
        onChange(option === "Afghan Shamsi" ? "shamsi" : "gregorian")
      }
    />
  );
}
