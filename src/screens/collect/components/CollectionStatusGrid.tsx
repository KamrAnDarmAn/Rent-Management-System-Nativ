import { Pressable } from "react-native";
import { Icon } from "../../../components/icons/Icon";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";

export function CollectionStatusGrid({
  onSelect,
  counts,
}: {
  onSelect: (filter: string) => void;
  counts: Record<string, number>;
}) {
  const { c } = useUI();
  return (
    <Row gap={7} style={{ flexWrap: "wrap" }}>
      {(
        [
          { label: "Paid", count: 12, tone: "green" },
          { label: "Partial", count: 4, tone: "orange" },
          { label: "Unpaid", count: 3, tone: "red" },
          { label: "Overdue", count: 1, tone: "red" },
        ] as const
      ).map((s) => (
        <Pressable
          key={s.label}
          onPress={() => onSelect(s.label)}
          style={{ flexBasis: "48%", flexGrow: 1 }}
        >
          <Card tone={s.tone} style={{ padding: 8, gap: 2 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <T size={21} weight="bold" color={c[s.tone]}>
                {counts[s.label] ?? 0}
              </T>
              <Icon name="Store" size={15} color={c[s.tone]} />
            </Row>
            <T size={11} weight="medium" color={c[s.tone]}>
              {s.label}
            </T>
          </Card>
        </Pressable>
      ))}
    </Row>
  );
}
