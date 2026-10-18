import type { RentCalendar } from "../../types/shop";
import {
  addCalendarMonths,
  calendarMonthStart,
  formatRentMonth,
} from "../../utils/calendar";
import { IconButton } from "../buttons/IconButton";
import { Icon } from "../icons/Icon";
import { Card } from "../layout/Card";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function CalendarMonthPicker({
  value,
  calendar,
  onChange,
}: {
  value: string;
  calendar: RentCalendar;
  onChange: (date: string) => void;
}) {
  const { c, language } = useUI();
  const move = (offset: number) =>
    onChange(
      addCalendarMonths(calendarMonthStart(value, calendar), offset, calendar),
    );
  return (
    <Row>
      <IconButton
        name="ChevronLeft"
        label="Previous month"
        onPress={() => move(-1)}
      />
      <Card style={{ flex: 1, paddingVertical: 9 }}>
        <Row style={{ justifyContent: "center" }}>
          <Icon name="CalendarDays" size={16} color={c.sub} />
          <T weight="semibold">{formatRentMonth(value, calendar, language)}</T>
        </Row>
      </Card>
      <IconButton
        name="ChevronRight"
        label="Next month"
        onPress={() => move(1)}
      />
    </Row>
  );
}
