import { View } from "react-native";
import { type Tone, toneColors } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { type IconName, Icon } from "./Icon";

export function IconTile({
  name,
  tone = "teal",
  size = 40,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={size * 0.52} color={colors.fg} />
    </View>
  );
}
