import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { FinancialDonut } from "../../components/charts/FinancialDonut";
import { Metric } from "../../components/data-display/Metric";
import { TransactionRow } from "../../components/data-display/TransactionRow";
import { CalendarMonthPicker } from "../../components/filters/CalendarMonthPicker";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import { addCalendarMonths, calendarMonthStart } from "../../utils/calendar";
import { money } from "../../utils/format";

export function SpendScreen() {
  const go = useGo(),
    today = useToday(),
    state = useLedger();
  const calendar = usePreferences((s) => s.rentViewCalendar);
  const [date, setDate] = useState(today);
  const start = calendarMonthStart(date, calendar),
    end = addCalendarMonths(start, 1, calendar);
  const expenses = state.expenses.filter(
    (e) => e.date! >= start && e.date! < end,
  );
  const sum = (rows: typeof expenses) =>
    rows.reduce((n, e) => n + BigInt(e.amount), 0n);
  const paid = sum(
    expenses.filter((e) => e.method !== "Credit" && e.method !== "Rent Offset"),
  );
  const owed = state.goods
    .filter((g) => g.mode === "owed")
    .reduce(
      (n, g) =>
        n + BigInt(g.amount - g.settlements.reduce((n, s) => n + s.amount, 0)),
      0n,
    );
  const categories = Array.from(new Set(expenses.map((e) => e.category))).map(
    (label) => ({
      label,
      value: sum(
        expenses.filter((e) => e.category === label && !e.settlementFor),
      ),
    }),
  );
  return (
    <Page title="Expenses" back={false}>
      <CalendarMonthPicker
        value={date}
        calendar={calendar}
        onChange={setDate}
      />
      <Row>
        <Metric
          label="Total Expenses"
          value={money(
            sum(expenses.filter((e) => e.category !== "Goods Settlement")),
          )}
          tone="teal"
          icon="Receipt"
        />
        <Metric
          label="Paid Expenses"
          value={money(paid)}
          tone="red"
          icon="Wallet"
        />
      </Row>
      <Row>
        <Metric
          label="Property Expenses"
          value={money(
            sum(expenses.filter((e) => e.type === "Property Expense")),
          )}
          tone="blue"
        />
        <Metric
          label="Unsettled Goods Payables"
          value={money(owed)}
          tone="orange"
        />
      </Row>
      <Row>
        <Button
          title="Add Expense"
          icon="Plus"
          compact
          style={{ flex: 1 }}
          onPress={() => go("add-expense")}
        />
        <Button
          title="Record Goods Taken"
          icon="Package"
          variant="secondary"
          compact
          style={{ flex: 1 }}
          onPress={() => go("goods-taken")}
        />
      </Row>
      <Button
        title="Goods Settlement"
        variant="outline"
        onPress={() => go("goods-settlement")}
      />
      <Card>
        <Section title="Expense Categories">
          <FinancialDonut
            parts={categories.map((p, i) => ({
              ...p,
              color: ["#0d9488", "#3b82f6", "#f59e0b", "#a855f7"][i % 4],
            }))}
          />
        </Section>
      </Card>
      <Card>
        <Section title="Recent Spending Transactions">
          {!expenses.length && <T>No expenses recorded for this month.</T>}
          {expenses
            .slice()
            .sort((a, b) => b.date!.localeCompare(a.date!))
            .map((e) => (
              <TransactionRow
                key={e.id}
                title={e.description}
                subtitle={`${e.date} · ${e.category} · ${e.method}`}
                amount={e.amount}
                icon="Receipt"
                tone={e.method === "Credit" ? "orange" : "teal"}
              />
            ))}
        </Section>
      </Card>
    </Page>
  );
}
