import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function SummaryLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
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
      <T size={10} color={c.sub} style={{ flex: 1 }}>
        {label}
      </T>
      <T
        size={10}
        color={color ?? c.text}
        weight="medium"
        style={{ flexShrink: 0 }}
      >
        {value}
      </T>
    </Row>
  );
}
