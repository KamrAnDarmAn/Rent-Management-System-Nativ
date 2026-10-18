import { useText } from "../../hooks/useText";
import { Pressable, View } from "react-native";
import { Icon } from "../icons/Icon";
import { useUI } from "../theme/UIContext";

export function Check({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label?: string;
}) {
  const t = useText();
  const { c } = useUI();
  return (
    <Pressable
      hitSlop={13}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      aria-checked={checked}
      accessibilityLabel={t(label ?? "Select")}
      onPress={onPress}
    >
      <View
        style={{
          width: 18,
          height: 18,
          backgroundColor: checked ? c.primary : c.surface,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: checked ? c.primary : c.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Icon name="Check" size={13} color="#fff" />}
      </View>
    </Pressable>
  );
}
