import { useText } from "../../hooks/useText";
import { Pressable } from "react-native";
import { type IconName, Icon } from "../icons/Icon";
import { useUI } from "../theme/UIContext";

export function IconButton({
  name,
  onPress,
  label,
  size = 38,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  size?: number;
}) {
  const t = useText();
  const { c } = useUI();
  return (
    <Pressable
      cssInterop={false}
      onPress={onPress}
      accessibilityLabel={t(label)}
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={name} size={20} color={c.text} />
    </Pressable>
  );
}
