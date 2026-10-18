import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { reportPercent } from "../../domain/reports";
import { money } from "../../utils/format";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export type DonutPart = { label: string; value: bigint; color: string };
export function FinancialDonut({
  parts,
  center,
  caption = "Total",
}: {
  parts: DonutPart[];
  center?: string;
  caption?: string;
}) {
  const { c } = useUI();
  const [active, setActive] = useState<string>();
  const selected = parts.find((part) => part.label === active);
  const total = parts.reduce((sum, part) => sum + part.value, 0n);
  const circumference = 2 * Math.PI * 51;
  let offset = 0;
  return (
    <View testID="financial-donut" style={{ gap: 15 }}>
      <View
        style={{
          width: 150,
          height: 150,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg
          width={150}
          height={150}
          style={StyleSheet.absoluteFill}
          accessibilityElementsHidden
        >
          <Circle
            cx={75}
            cy={75}
            r={51}
            stroke={c.border}
            strokeWidth={16}
            fill="none"
          />
          {parts
            .filter((part) => part.value > 0n)
            .map((part) => {
              const length =
                (reportPercent(part.value, total) / 100) * circumference;
              const start = offset;
              offset += length;
              return (
                <Circle
                  key={part.label}
                  cx={75}
                  cy={75}
                  r={51}
                  stroke={part.color}
                  strokeWidth={16}
                  fill="none"
                  opacity={!active || active === part.label ? 1 : 0.25}
                  strokeDasharray={`${length} ${Math.max(0, circumference - length)}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 75 75)"
                />
              );
            })}
        </Svg>
        <T
          size={selected || !center ? 12 : 26}
          weight="bold"
          style={{ maxWidth: 96, textAlign: "center" }}
        >
          {selected ? money(selected.value) : (center ?? money(total))}
        </T>
        <T size={9} color={c.sub} style={{ maxWidth: 96, textAlign: "center" }}>
          {selected?.label ?? caption}
        </T>
      </View>
      <View style={{ gap: 5 }}>
        {parts.map((part) => (
          <Pressable
            key={part.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active === part.label }}
            onPress={() =>
              setActive(active === part.label ? undefined : part.label)
            }
            style={{
              padding: 8,
              backgroundColor: active === part.label ? c.muted : "transparent",
              borderRadius: 8,
            }}
          >
            <Row gap={7}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 4,
                  backgroundColor: part.color,
                }}
              />
              <T size={11} style={{ flex: 1 }}>
                {part.label}
              </T>
              <T size={11} weight="semibold">
                {money(part.value)}
              </T>
              <T
                size={9}
                color={c.sub}
              >{`${Math.round(reportPercent(part.value, total))}%`}</T>
            </Row>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
