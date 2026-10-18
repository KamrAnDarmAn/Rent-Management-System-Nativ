import { useText } from "../../hooks/useText";
import { Switch, View } from "react-native";
import { type IconName } from "../icons/Icon";
import { IconTile } from "../icons/IconTile";
import { Row } from "../layout/Row";
import { type Tone } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
  icon = "Bell",
  tone = "teal",
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: IconName;
  tone?: Tone;
}) {
  const t = useText();
  const { c } = useUI();
  return (
    <Row>
      <IconTile name={icon} tone={tone} size={35} />
      <View style={{ flex: 1 }}>
        <T size={12} weight="semibold">
          {title}
        </T>
        {subtitle && (
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        )}
      </View>
      <Switch
        accessibilityLabel={t(title)}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.border, true: "#078b82" }}
        thumbColor="#fff"
      />
    </Row>
  );
}
