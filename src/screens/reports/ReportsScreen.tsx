import { Platform } from "react-native";
import { Button } from "../../components/buttons/Button";
import { Info } from "../../components/feedback/Info";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useText } from "../../hooks/useText";
import { reportCsv } from "../../utils/reports/csv";
import { exportReport } from "../../utils/reports/export";
import { useRentReport } from "./hooks/useRentReport";
import { ReportFilters } from "./components/ReportFilters";
import { ReportHero } from "./components/ReportHero";
import { ReportIncomeChart } from "./components/ReportIncomeChart";
import { ReportMetrics } from "./components/ReportMetrics";
import { ReportCharts } from "./components/ReportCharts";
import { ReportShopPerformance } from "./components/ReportShopPerformance";
import { ReportMonthlySummary } from "./components/ReportMonthlySummary";

export function ReportsScreen() {
  const model = useRentReport();
  const { report } = model;
  const { c, language, notify } = useUI();
  const t = useText();
  const exportCurrent = async () => {
    try {
      await exportReport(
        reportCsv(report, t, language),
        `rent-report-${report.calendar}-${report.start}.csv`,
        t("Reports"),
      );
    } catch {
      notify("Could not export the report. Please try again.");
    }
  };
  return (
    <Page
      title="Reports"
      subtitle="A clear view of your property finances"
      back={false}
      contentGap={12}
    >
      <ReportFilters model={model} />
      <ReportHero report={report} />
      {!report.hasData && (
        <Info
          title="No records for this period"
          text="Choose another month or record payments and expenses to build your reports."
        />
      )}
      <ReportIncomeChart report={report} />
      <ReportMetrics report={report} />
      <ReportCharts report={report} />
      <ReportShopPerformance report={report} />
      <ReportMonthlySummary
        report={report}
        onMonth={(date) => {
          model.setDate(date);
          model.setMode("monthly");
        }}
      />
      <Card style={{ gap: 7 }}>
        <T size={10} weight="semibold">
          How to read this report
        </T>
        <T size={9} color={c.sub}>
          Payments follow their receipt dates. Rent coverage includes late
          payments recorded through today.
        </T>
        <T size={9} color={c.sub}>
          Opening balances have no receipt date and do not count as new money
          received.
        </T>
        <T size={9} color={c.sub}>
          Unlinked and personal expenses appear only under All Shops.
        </T>
        <T size={9} color={c.sub}>
          Rent charges follow recorded effective dates and rate changes.
        </T>
        <T size={9} color={c.sub}>
          Ended and archived tenancies retain their historical rent.
        </T>
        {!!report.unknownExpenseDates && (
          <T size={9} color={c.orange}>
            Expenses without a valid date are excluded from period totals.
          </T>
        )}
      </Card>
      <Button
        title={Platform.OS === "web" ? "Export CSV Summary" : "Share Report"}
        icon="Download"
        variant="outline"
        onPress={exportCurrent}
      />
      <T size={9} color={c.sub}>
        Charts show recorded ledger data only.
      </T>
    </Page>
  );
}
