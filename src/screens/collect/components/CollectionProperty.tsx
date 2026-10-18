import { Pressable } from "react-native";
import { Offline } from "../../../components/feedback/Offline";
import { Icon } from "../../../components/icons/Icon";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { useGo } from "../../../hooks/useGo";

export function CollectionProperty({
  propertyName,
  monthLabel,
}: {
  propertyName: string;
  monthLabel: string;
}) {
  const go = useGo();
  const { c } = useUI();
  return (
    <Card style={{ paddingVertical: 9 }}>
      <Row>
        <Icon name="Store" size={29} />
        <Pressable onPress={() => go("setup-property")} style={{ flex: 1 }}>
          <Row>
            <T size={15} weight="bold">
              {propertyName}
            </T>
            <Icon name="ChevronDown" size={14} color={c.text} />
          </Row>
          <Row gap={5}>
            <T size={11} color={c.sub}>
              {monthLabel}
            </T>
            <Icon name="CalendarDays" size={12} color={c.sub} />
          </Row>
        </Pressable>
        <Offline />
      </Row>
    </Card>
  );
}
