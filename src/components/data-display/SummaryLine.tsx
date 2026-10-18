import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function SummaryLine({
  label,
  value,
  color,
  size = 10,
}: {
  label: string;
  value: string;
  color?: string;
  size?: number;
}) {
  const { c } = useUI();
  return (
    <Row
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 3,
      }}
    >
      <T
        size={size}
        color={size >= 13 ? c.text : c.sub}
        style={{ flex: 1, opacity: size >= 13 ? 0.72 : 1 }}
      >
        {label}
      </T>
      <T
        size={size}
        color={color ?? c.text}
        weight="medium"
        style={{ flexShrink: 0 }}
      >
        {value}
      </T>
    </Row>
  );
}
