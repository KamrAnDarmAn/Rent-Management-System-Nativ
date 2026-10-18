import { IconButton } from "../buttons/IconButton";
import { Icon } from "../icons/Icon";
import { Card } from "../layout/Card";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function MonthPicker({
  month,
  onChange,
}: {
  month: number;
  onChange: (v: number) => void;
}) {
  const { c } = useUI();
  const date = new Date(2026, month, 1);
  const label = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <Row>
      <IconButton
        name="ChevronLeft"
        label="Previous month"
        onPress={() => onChange(month - 1)}
      />
      <Card style={{ flex: 1, paddingVertical: 9 }}>
        <Row style={{ justifyContent: "center" }}>
          <T weight="semibold">{label}</T>
          <Icon name="ChevronDown" size={13} color={c.sub} />
          <Icon name="CalendarDays" size={16} color={c.sub} />
        </Row>
      </Card>
      <IconButton
        name="ChevronRight"
        label="Next month"
        onPress={() => onChange(month + 1)}
      />
    </Row>
  );
}
