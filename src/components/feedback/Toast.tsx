import { Pressable } from "react-native";
import { dark } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Toast() {
  const { c, toast, dismissToast } = useUI();
  const isDark = c === dark;
  if (!toast) return null;
  return (
    <Pressable
      accessibilityRole="alert"
      onPress={dismissToast}
      style={{
        position: "absolute",
        bottom: 82,
        left: 16,
        right: 16,
        backgroundColor: isDark ? "#dcf8f2" : "#103f3d",
        padding: 14,
        borderRadius: 12,
        boxShadow: "0 5px 20px #0002",
        zIndex: 1000,
      }}
    >
      <T size={12} color={isDark ? "#103f3d" : "#fff"}>
        {toast}
      </T>
    </Pressable>
  );
}
