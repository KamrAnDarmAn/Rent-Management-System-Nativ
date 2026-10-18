import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { reportPercent } from "../../domain/reports";
import { useText } from "../../hooks/useText";
import { money } from "../../utils/format";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export type FinancialBarPoint = {
  id: string;
  label: string;
  fullLabel: string;
  received: bigint;
  spent: bigint;
  known: boolean;
};
export function FinancialBars({ data }: { data: FinancialBarPoint[] }) {
  const { c, rtl } = useUI();
  const t = useText();
  const [selectedId, setSelectedId] = useState<string>();
  const selected =
    data.find((point) => point.id === selectedId) ??
    data.filter((point) => point.known).at(-1) ??
    data.at(-1)!;
  const maximum = data.reduce(
    (max, point) =>
      point.received > max
        ? point.spent > point.received
          ? point.spent
          : point.received
        : point.spent > max
          ? point.spent
          : max,
    0n,
  );
  return (
    <View testID="financial-bars" style={{ gap: 12 }}>
      <Row style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
        <T size={10} color={c.sub}>
          {t("Chart maximum: {{amount}}", { amount: money(maximum) })}
        </T>
        <Row gap={10}>
          <T size={10} color={c.primary}>
            Received
          </T>
          <T size={10} color={c.orange}>
            Paid Expenses
          </T>
        </Row>
      </Row>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: rtl ? "row-reverse" : "row",
          gap: 5,
        }}
      >
        {data.map((point) => (
          <Pressable
            key={point.id}
            accessibilityRole="button"
            accessibilityLabel={t(
              "{{month}}: received {{received}}, spent {{spent}}",
              {
                month: point.fullLabel,
                received: money(point.received),
                spent: money(point.spent),
              },
            )}
            accessibilityState={{ selected: selected.id === point.id }}
            onPress={() => setSelectedId(point.id)}
            style={{
              flex: 1,
              minWidth: 43,
              padding: 3,
              backgroundColor:
                selected.id === point.id ? c.teal : "transparent",
              borderRadius: 8,
              gap: 7,
            }}
          >
            <View
              style={{
                height: 145,
                justifyContent: "flex-end",
                borderBottomWidth: 1,
                borderColor: c.border,
              }}
            >
              {[0, 0.5, 1].map((line) => (
                <View
                  key={line}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: `${line * 100}%`,
                    height: 1,
                    backgroundColor: c.border,
                    opacity: 0.65,
                  }}
                />
              ))}
              <Row
                gap={4}
                style={{
                  height: "100%",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: `${reportPercent(point.received, maximum)}%`,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: c.primary,
                  }}
                />
                <View
                  style={{
                    width: 12,
                    height: `${reportPercent(point.spent, maximum)}%`,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: c.orange,
                  }}
                />
              </Row>
            </View>
            <T
              size={9}
              weight={selected.id === point.id ? "bold" : "regular"}
              color={point.known ? c.text : c.sub}
              style={{ textAlign: "center" }}
            >
              {point.label}
            </T>
          </Pressable>
        ))}
      </ScrollView>
      <View
        style={{
          backgroundColor: c.muted,
          padding: 10,
          borderRadius: 10,
          gap: 7,
        }}
      >
        <T size={11} weight="semibold">
          {selected.fullLabel}
        </T>
        {selected.known ? (
          <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <T size={11} color={c.primary}>
              {t("Received: {{amount}}", { amount: money(selected.received) })}
            </T>
            <T size={11} color={c.orange}>
              {t("Spent: {{amount}}", { amount: money(selected.spent) })}
            </T>
          </Row>
        ) : (
          <T size={10} color={c.sub}>
            No recorded data for this month.
          </T>
        )}
      </View>
    </View>
  );
}
