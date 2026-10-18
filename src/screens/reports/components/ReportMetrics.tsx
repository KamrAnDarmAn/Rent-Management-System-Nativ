import { View } from "react-native";
import { Metric } from "../../../components/data-display/Metric";
import { SummaryLine } from "../../../components/data-display/SummaryLine";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import type { RentReport } from "../../../domain/reports";
import type { IconName } from "../../../components/icons/Icon";
import type { Tone } from "../../../components/theme/palette";
import { money } from "../../../utils/format";

export function ReportMetrics({ report }: { report: RentReport }) {
  const { c } = useUI();
  const metrics: {
    label: string;
    value: bigint;
    icon: IconName;
    tone: Tone;
  }[] = [
    {
      label: "Expected Rent",
      value: report.expected,
      icon: "Store",
      tone: "blue",
    },
    {
      label: "Settled Rent",
      value: report.settled,
      icon: "CircleCheck",
      tone: "green",
    },
    {
      label: "Cash Collected",
      value: report.cash,
      icon: "Banknote",
      tone: "teal",
    },
    {
      label: "Other-Method Collections",
      value: report.other,
      icon: "CreditCard",
      tone: "purple",
    },
    {
      label: "Total Expenses",
      value: report.expenses,
      icon: "Receipt",
      tone: "orange",
    },
    {
      label: "Outstanding Rent",
      value: report.outstanding,
      icon: "FileWarning",
      tone: "red",
    },
    {
      label: "Credits Applied",
      value: report.credits,
      icon: "Building2",
      tone: "purple",
    },
    {
      label: "Advance Applied",
      value: report.prepaid,
      icon: "Wallet",
      tone: "blue",
    },
    {
      label: "Goods Taken",
      value: report.goodsTaken,
      icon: "Package",
      tone: "orange",
    },
    {
      label: "Goods Rent Deduction",
      value: report.goodsOffsets,
      icon: "Wallet",
      tone: "teal",
    },
  ];
  return (
    <View testID="report-metrics" style={{ gap: 8 }}>
      {[0, 2, 4, 6, 8].map((offset) => (
        <Row key={offset} gap={8} style={{ alignItems: "stretch" }}>
          {metrics.slice(offset, offset + 2).map((metric) => (
            <Metric
              key={metric.label}
              label={metric.label}
              value={money(metric.value)}
              tone={metric.tone}
              icon={metric.icon}
            />
          ))}
        </Row>
      ))}
      <Card style={{ gap: 5 }}>
        <SummaryLine
          label="Previous Months Due"
          value={money(report.arrears)}
        />
        <SummaryLine
          label="Unpaid Expenses"
          value={money(report.unpaidExpenses)}
        />
        <T size={9} color={c.sub}>
          Net cash flow includes all money received, minus paid expenses. Credit
          purchases are excluded.
        </T>
        <T size={9} color={c.sub}>
          Settled rent includes credits and advances. It can differ from money
          received this period.
        </T>
      </Card>
    </View>
  );
}
