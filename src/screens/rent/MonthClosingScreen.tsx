import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { Info } from "../../components/feedback/Info";
import { CalendarMonthPicker } from "../../components/filters/CalendarMonthPicker";
import { CalendarChoice } from "../../components/forms/CalendarChoice";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import { buildRentReport } from "../../domain/reports";
import { addCalendarMonths, calendarMonthStart } from "../../utils/calendar";
import { money } from "../../utils/format";
export function MonthClosingScreen() {
  const { notify } = useUI(),
    today = useToday(),
    state = useLedger(),
    prefs = usePreferences();
  const [date, setDate] = useState(today);
  const calendar = prefs.rentViewCalendar;
  const start = calendarMonthStart(date, calendar),
    end = addCalendarMonths(start, 1, calendar);
  const closed = state.closedMonths.some(
    (m) => m.calendar === calendar && m.start === start,
  );
  const report = buildRentReport(
    [...state.shops, ...state.archivedShops],
    state.expenses,
    { date, calendar, mode: "monthly", today },
  );
  return (
    <Page
      title="Month Closing"
      subtitle="Review your finances before closing the month"
    >
      <CalendarChoice value={calendar} onChange={prefs.setRentViewCalendar} />
      <CalendarMonthPicker
        value={date}
        calendar={calendar}
        onChange={setDate}
      />
      <Row>
        <Metric
          style={{ flex: 1 }}
          label="Total Cash Collected"
          value={money(report.received)}
          tone="green"
        />
        <Metric
          style={{ flex: 1 }}
          label="Paid Expenses"
          value={money(report.spent)}
          tone="red"
        />
      </Row>
      <Row>
        <Metric
          style={{ flex: 1 }}
          label="Outstanding Rent"
          value={money(report.outstanding)}
          tone="orange"
        />
        <Metric
          style={{ flex: 1 }}
          label="Net Cash Flow"
          value={money(report.net)}
          tone="teal"
        />
      </Row>
      <Info
        text="Closing prevents new receipts and expenses dated in that month. Later-dated payments can still settle older unpaid rent. Reopen the month to correct a dated record."
        tone="orange"
      />
      <Card>
        <Button
          title={closed ? "Reopen Month" : "Close Month"}
          icon={closed ? "LockOpen" : "LockKeyhole"}
          disabled={!closed && end > today}
          onPress={async () => {
            const ok = closed
              ? await state.reopenMonth(calendar, start)
              : await state.closeMonth(calendar, start, end);
            notify(
              ok
                ? closed
                  ? "Month reopened."
                  : "Month closed."
                : useLedger.getState().error!,
            );
          }}
        />
      </Card>
    </Page>
  );
}
