import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { RentCalendar } from "../../types/shop";
import { calendarInputDate, parseCalendarDate } from "../../utils/calendar";
import { Field } from "./Field";

/** The input uses the chosen calendar; its value/callback always use ISO civil dates. */
export function CalendarDateField({
  value,
  onChangeText,
  calendar = "gregorian",
  helper,
  ...props
}: Omit<ComponentProps<typeof Field>, "value" | "onChangeText"> & {
  value: string;
  onChangeText?: (value: string) => void;
  calendar?: RentCalendar;
}) {
  const [draft, setDraft] = useState(() => calendarInputDate(value, calendar));
  const last = useRef({ value, calendar });
  useEffect(() => {
    if (value !== last.current.value || calendar !== last.current.calendar) {
      setDraft(calendarInputDate(value, calendar));
      last.current = { value, calendar };
    }
  }, [value, calendar]);
  return (
    <Field
      {...props}
      icon={props.icon ?? "CalendarDays"}
      value={draft}
      helper={
        helper ??
        (calendar === "shamsi"
          ? "Shamsi date: year-month-day, e.g. 1405-07-25."
          : "Gregorian date: year-month-day, e.g. 2026-10-17.")
      }
      onChangeText={(raw) => {
        setDraft(raw);
        const iso = parseCalendarDate(raw, calendar) ?? "";
        last.current = { value: iso, calendar };
        onChangeText?.(iso);
      }}
    />
  );
}
