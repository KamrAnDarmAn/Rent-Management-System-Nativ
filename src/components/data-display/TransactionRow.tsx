import { Pressable, View } from "react-native";
import { money } from "../../utils/format";
import { Icon, type IconName } from "../icons/Icon";
import { IconTile } from "../icons/IconTile";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function TransactionRow({
  title,
  subtitle,
  amount,
  icon = "Wallet",
  tone = "teal",
  onPress,
}: {
  title: string;
  subtitle: string;
  amount: number;
  icon?: IconName;
  tone?: "teal" | "blue" | "orange" | "red" | "purple";
  onPress?: () => void;
}) {
  const { c } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: c.border,
      }}
    >
      <Row>
        <IconTile name={icon} tone={tone} size={29} />
        <View style={{ flex: 1 }}>
          <T size={10} weight="medium">
            {title}
          </T>
          <T size={9} color={c.sub}>
            {subtitle}
          </T>
        </View>
        <T size={10} weight="semibold">
          {money(amount)}
        </T>
        {onPress && <Icon name="ChevronRight" size={13} color={c.sub} />}
      </Row>
    </Pressable>
  );
}
