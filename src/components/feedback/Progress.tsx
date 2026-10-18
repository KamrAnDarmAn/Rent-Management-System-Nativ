import { View } from "react-native";
import { useUI } from "../theme/UIContext";
import { dark } from "../theme/palette";

export function Progress({
  value,
  color,
  height = 8,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const { c } = useUI();
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: c === dark ? "#173d45" : "#d0faf4",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <View
        style={{
          height,
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color ?? c.primary,
          borderRadius: height,
        }}
      />
    </View>
  );
}
