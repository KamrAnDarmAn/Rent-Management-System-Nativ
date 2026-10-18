import { View } from "react-native";
import { Logo } from "../../../components/branding/Logo";
import { IconButton } from "../../../components/buttons/IconButton";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { useGo } from "../../../hooks/useGo";
import { formatAfghanDate } from "../../../utils/afghanDate";

export function CollectionGreeting({ today }: { today: string }) {
  const { c, language } = useUI();
  const go = useGo();
  return (
    <Row
      gap={10}
      style={{ minHeight: 60, paddingVertical: 6, marginBottom: 2 }}
    >
      <Logo size={44} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T weight="semibold" size={14} translate={false}>
          {formatAfghanDate(today, language)}
        </T>
        <T color={c.sub} size={11}>
          Manage Collections with Ease
        </T>
      </View>
      <View>
        <IconButton
          name="Bell"
          label="Reminders"
          size={44}
          onPress={() => go("reminders")}
        />
        <View
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 5,
            borderWidth: 1.5,
            borderColor: c.surface,
            backgroundColor: c.red,
            top: 8,
            right: 9,
          }}
        />
      </View>
    </Row>
  );
}
