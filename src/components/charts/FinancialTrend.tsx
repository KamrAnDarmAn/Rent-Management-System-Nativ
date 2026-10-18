import { useState } from "react";
import { ScrollView, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { reportPercent } from "../../domain/reports";
import { money } from "../../utils/format";
import { useText } from "../../hooks/useText";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function FinancialTrend({
  data,
}: {
  data: { id: string; label: string; value: bigint; known: boolean }[];
}) {
  const { c, rtl } = useUI();
  const t = useText();
  const [available, setAvailable] = useState(300);
  const width = Math.max(available, data.length * 45);
  const maximum = data.reduce(
    (max, point) => (point.value > max ? point.value : max),
    0n,
  );
  const points = data.map((point, index) => ({
    ...point,
    x:
      20 +
      (rtl ? data.length - 1 - index : index) *
        ((width - 40) / Math.max(1, data.length - 1)),
    y: 130 - reportPercent(point.value, maximum) * 1.1,
  }));
  let connected = false;
  const path = points
    .map((point) => {
      if (!point.known) {
        connected = false;
        return "";
      }
      const command = `${connected ? "L" : "M"}${point.x},${point.y}`;
      connected = true;
      return command;
    })
    .join(" ");
  return (
    <View
      testID="financial-trend"
      style={{ gap: 10 }}
      onLayout={(event) => setAvailable(event.nativeEvent.layout.width)}
    >
      <T size={10} color={c.sub}>
        {t("Chart maximum: {{amount}}", { amount: money(maximum) })}
      </T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width }}>
          <Svg width={width} height={150} accessibilityElementsHidden>
            {[20, 56, 93, 130].map((y) => (
              <Line
                key={y}
                x1={15}
                x2={width - 15}
                y1={y}
                y2={y}
                stroke={c.border}
                strokeDasharray="4 5"
              />
            ))}
            <Path
              d={path}
              fill="none"
              stroke={c.primary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points
              .filter((point) => point.known)
              .map((point) => (
                <Circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={c.surface}
                  stroke={c.primary}
                  strokeWidth={3}
                />
              ))}
          </Svg>
          <Row gap={0}>
            {data.map((point) => (
              <T
                key={point.id}
                size={9}
                color={c.sub}
                style={{ flex: 1, textAlign: "center" }}
              >
                {point.label}
              </T>
            ))}
          </Row>
        </View>
      </ScrollView>
      <T size={10} color={c.sub}>
        Blank months have no recorded data.
      </T>
    </View>
  );
}
