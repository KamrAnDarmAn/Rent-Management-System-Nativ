import { FinancialDonut } from "../../../components/charts/FinancialDonut";
import { FinancialTrend } from "../../../components/charts/FinancialTrend";
import { Badge } from "../../../components/feedback/Badge";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { Section } from "../../../components/layout/Section";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import { useText } from "../../../hooks/useText";
import { type RentReport } from "../../../domain/reports";
import { reportMonthLabel } from "../../../utils/reports/monthLabel";
import { formatRentMonth } from "../../../utils/calendar";
import { money } from "../../../utils/format";

export function ReportCharts({ report }: { report: RentReport }) {
  const { c, language } = useUI();
  const t = useText();
  const colors = [c.primary, c.blue, c.purple, c.orange, c.red, c.green];
  const points = report.series.map((point) => ({
    id: point.start,
    label: reportMonthLabel(point.start, report.calendar, language),
    fullLabel: formatRentMonth(point.start, report.calendar, language),
    received: point.received,
    spent: point.spent,
    known: point.hasData,
  }));
  return (
    <>
      <Card>
        <Section title="Cash Collection Trend">
          <FinancialTrend
            data={report.series.map((point, index) => ({
              id: point.start,
              label: points[index].label,
              value: point.cash,
              known: point.hasData,
            }))}
          />
        </Section>
      </Card>
      <Card>
        <Section title="Rent Coverage">
          <FinancialDonut
            key={`${report.start}-${report.scopeId ?? "all"}`}
            center={`${Math.round(report.percent)}%`}
            caption="Settled"
            parts={[
              {
                label: "Settled Rent",
                value: report.settled,
                color: c.primary,
              },
              { label: "Remaining Rent", value: report.due, color: c.red },
            ]}
          />
          {!report.expected && (
            <T size={10} color={c.sub}>
              No rent charges recorded for this period.
            </T>
          )}
          <Row wrap gap={6}>
            {report.statuses.map((status) => (
              <Badge
                key={status.label}
                label={t("{{status}}: {{count}}", {
                  status: t(status.label),
                  count: status.count,
                })}
                tone={
                  status.label === "Paid"
                    ? "green"
                    : status.label === "Partial"
                      ? "orange"
                      : status.label === "Unpaid"
                        ? "red"
                        : "muted"
                }
                small
              />
            ))}
          </Row>
          <T size={9} color={c.sub}>
            Shop statuses refer to rent charged in this period.
          </T>
        </Section>
      </Card>
      <Card>
        <Section title="Expenses by Category">
          {report.categories.length ? (
            <FinancialDonut
              key={`${report.start}-${report.scopeId ?? "all"}`}
              parts={report.categories.map((category, index) => ({
                ...category,
                color: colors[index % colors.length],
              }))}
            />
          ) : (
            <T size={11} color={c.sub}>
              No expenses recorded for this period.
            </T>
          )}
          <T size={9} color={c.sub}>
            Expense categories include paid and credit purchases.
          </T>
        </Section>
      </Card>
      <Card>
        <Section title="Payment Methods">
          <Row>
            <Badge label="Cash" tone="green" small />
            <T style={{ flex: 1 }} size={12} weight="semibold">
              {money(report.cash)}
            </T>
          </Row>
          <Row>
            <Badge label="Other" tone="purple" small />
            <T style={{ flex: 1 }} size={12} weight="semibold">
              {money(report.other)}
            </T>
          </Row>
        </Section>
      </Card>
    </>
  );
}
