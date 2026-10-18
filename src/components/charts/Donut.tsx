import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { money } from "../../utils/format";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Donut({
  compact = false,
  value = 92500,
}: {
  compact?: boolean;
  value?: number;
}) {
  const { c } = useUI();
  const size = compact ? 94 : 132;
  const colors = [
    "#2188ff",
    "#08b5a3",
    "#6de5d1",
    "#8b5cf6",
    "#ff9f24",
    "#a7b5c8",
  ];
  const parts = [35, 22, 18, 10, 8, 7];
  let offset = 0;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        style={StyleSheet.absoluteFill}
      >
        {parts.map((p, i) => {
          const start = offset;
          offset += p;
          return (
            <Circle
              key={i}
              cx="60"
              cy="60"
              r="47"
              fill="none"
              stroke={colors[i]}
              strokeWidth="18"
              strokeDasharray={`${p * 2.953} ${295.3 - p * 2.953}`}
              strokeDashoffset={-start * 2.953}
              transform="rotate(-90 60 60)"
            />
          );
        })}
      </Svg>
      <T size={compact ? 11 : 13} weight="bold">
        {money(value)}
      </T>
      <T size={10} color={c.sub}>
        Total
      </T>
    </View>
  );
}
