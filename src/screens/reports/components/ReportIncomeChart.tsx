import { FinancialBars } from "../../../components/charts/FinancialBars";
import { Card } from "../../../components/layout/Card";
import { Section } from "../../../components/layout/Section";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import type { RentReport } from "../../../domain/reports";
import { reportMonthLabel } from "../../../utils/reports/monthLabel";
import { formatRentMonth } from "../../../utils/calendar";

export function ReportIncomeChart({ report }: { report: RentReport }) {
  const { c, language } = useUI();
  const points = report.series.map((point) => ({
    id: point.start,
    label: reportMonthLabel(point.start, report.calendar, language),
    fullLabel: formatRentMonth(point.start, report.calendar, language),
    received: point.received,
    spent: point.spent,
    known: point.hasData,
  }));
  return (
    <Card>
      <Section title="Income and Spending">
        <T size={10} color={c.sub}>
          {report.mode === "monthly"
            ? "Last 6 months through the selected month"
            : "Monthly breakdown for the selected year"}
        </T>
        <FinancialBars
          key={`${report.start}-${report.mode}-${report.scopeId ?? "all"}-${report.calendar}`}
          data={points}
        />
        <T size={9} color={c.sub}>
          Tap a month to see its exact amounts. Swipe to see more months.
        </T>
      </Section>
    </Card>
  );
}
