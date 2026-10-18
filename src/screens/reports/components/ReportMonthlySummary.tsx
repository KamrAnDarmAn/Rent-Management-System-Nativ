import { Pressable, View } from "react-native";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { Section } from "../../../components/layout/Section";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import { useText } from "../../../hooks/useText";
import type { RentReport } from "../../../domain/reports";
import { formatRentMonth } from "../../../utils/calendar";

export function ReportMonthlySummary({
  report,
  onMonth,
}: {
  report: RentReport;
  onMonth: (date: string) => void;
}) {
  const { c, language } = useUI();
  const t = useText();
  return (
    <Card>
      <Section title="Monthly Summary">
        <T size={9} color={c.sub}>
          Amounts in AFN. Tap a row to open that month.
        </T>
        <Row
          gap={4}
          style={{
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: c.border,
          }}
        >
          {["Month", "Received", "Paid Expenses", "Net Cash Flow"].map(
            (label) => (
              <T
                key={label}
                size={9}
                weight="semibold"
                color={c.sub}
                style={{ flex: 1, textAlign: "center" }}
              >
                {label}
              </T>
            ),
          )}
        </Row>
        {report.series.map((point) => (
          <Pressable
            key={point.start}
            accessibilityRole="button"
            accessibilityLabel={t("Open {{month}} report", {
              month: formatRentMonth(point.start, report.calendar, language),
            })}
            onPress={() => onMonth(point.start)}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Row gap={4}>
              <View style={{ flex: 1 }}>
                <T size={10} weight="medium">
                  {
                    formatRentMonth(
                      point.start,
                      report.calendar,
                      language,
                    ).split(" ")[0]
                  }
                </T>
                <T size={8} color={c.sub}>
                  {formatRentMonth(point.start, report.calendar, language)
                    .split(" ")
                    .at(-1)}
                </T>
              </View>
              {[point.received, point.spent, point.net].map((amount, index) => (
                <T
                  key={index}
                  size={9}
                  color={
                    index === 2 ? (amount < 0n ? c.red : c.primary) : c.text
                  }
                  style={{ flex: 1, textAlign: "center" }}
                >
                  {point.hasData ? amount.toLocaleString("en-US") : "—"}
                </T>
              ))}
            </Row>
          </Pressable>
        ))}
      </Section>
    </Card>
  );
}
