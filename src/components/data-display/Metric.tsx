import { StyleProp, ViewStyle } from "react-native";
import { type IconName } from "../icons/Icon";
import { IconTile } from "../icons/IconTile";
import { Card } from "../layout/Card";
import { type Tone, toneColors } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Metric({
  label,
  value,
  tone = "teal",
  icon,
  detail,
  style,
  compact = false,
}: {
  label: string;
  value: string;
  tone?: Tone;
  icon?: IconName;
  detail?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const { c } = useUI();
  return (
    <Card
      tone={tone}
      style={[
        {
          flex: 1,
          gap: compact ? 3 : 5,
          padding: compact ? 7 : 10,
          minWidth: 0,
        },
        style,
      ]}
    >
      {icon && <IconTile name={icon} tone={tone} size={compact ? 24 : 30} />}
      <T size={compact ? 9 : 10} color={c.sub}>
        {label}
      </T>
      <T
        size={value.length > 10 ? 12 : value.length >= 6 ? 14 : 20}
        weight="bold"
      >
        {value}
      </T>
      {detail && (
        <T size={compact ? 8 : 9} color={toneColors(c, tone).fg}>
          {detail}
        </T>
      )}
    </Card>
  );
}
