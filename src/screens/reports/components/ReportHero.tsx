import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { Icon } from "../../../components/icons/Icon";
import { Row } from "../../../components/layout/Row";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import { useText } from "../../../hooks/useText";
import type { RentReport } from "../../../domain/reports";
import { formatRentMonth } from "../../../utils/calendar";
import { money } from "../../../utils/format";

export function ReportHero({ report }: { report: RentReport }) {
  const t = useText();
  const { language } = useUI();
  const negative = report.net < 0n;
  const delta = report.net - report.previous.net;
  return (
    <LinearGradient
      testID="report-hero"
      colors={negative ? ["#842d4f", "#b5395d"] : ["#075e61", "#07948a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 18, borderRadius: 18, gap: 12 }}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={11} color="#c5f4e9">
            Net Cash Flow
          </T>
          <T
            size={money(report.net).length > 18 ? 19 : 29}
            color="#ffffff"
            weight="bold"
          >
            {money(report.net)}
          </T>
        </View>
        <View
          style={{
            padding: 10,
            borderRadius: 14,
            backgroundColor: "#ffffff20",
          }}
        >
          <Icon name="ChartNoAxesColumnIncreasing" size={27} color="#ffffff" />
        </View>
      </Row>
      <T size={10} color="#dcfff6">
        {report.mode === "monthly"
          ? formatRentMonth(report.start, report.calendar, language)
          : formatRentMonth(report.start, report.calendar, language)
              .split(" ")
              .at(-1)}
      </T>
      <Row
        style={{
          paddingTop: 12,
          borderTopWidth: 1,
          borderColor: "#ffffff30",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <T size={10} color="#d0f6ec">
            Payments Received
          </T>
          <T size={15} color="#ffffff" weight="semibold">
            {money(report.received)}
          </T>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={10} color="#d0f6ec">
            Paid Expenses
          </T>
          <T size={15} color="#ffffff" weight="semibold">
            {money(report.spent)}
          </T>
        </View>
      </Row>
      <T size={10} color="#e0fff6">
        {report.previous.hasData
          ? t("Change from previous period: {{amount}}", {
              amount: `${delta > 0n ? "+" : ""}${money(delta)}`,
            })
          : "No recorded comparison for the previous period."}
      </T>
    </LinearGradient>
  );
}
