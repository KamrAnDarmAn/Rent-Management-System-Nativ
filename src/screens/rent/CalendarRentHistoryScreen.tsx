import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { Select } from "../../components/forms/Select";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { RentTransactionList } from "../../components/shops/RentTransactionList";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { rentAccount } from "../../domain/rentAccount";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import type { Shop } from "../../types/shop";
import { calendarParts, formatRentDate } from "../../utils/calendar";
import { money } from "../../utils/format";

export function CalendarRentHistoryScreen({
  shop,
  report = false,
}: {
  shop: Shop;
  report?: boolean;
}) {
  const today = useToday();
  const { c, language } = useUI();
  const calendar = shop.rentCalendar ?? "gregorian";
  const account = rentAccount(shop, today);
  const currentYear = calendarParts(today, calendar).year;
  const firstYear = calendarParts(account.trackingStart, calendar).year;
  const [year, setYear] = useState(String(currentYear));
  const rows = account.periods.filter(
    (row) => calendarParts(row.date, calendar).year === Number(year),
  );
  const go = useGo();
  const expected = rows.reduce((sum, row) => sum + row.charge, 0);
  const settled = rows.reduce(
    (sum, row) => sum + Math.min(row.paid, row.charge),
    0,
  );
  return (
    <Page title={report ? "Shop Financial Report" : "Rent History"}>
      <ShopIdentity shop={shop} />
      <Button
        title="Correct a Payment"
        icon="Undo2"
        variant="outline"
        onPress={() => go("reverse-transaction", shop.id)}
      />
      <Select
        label="Rental Year"
        value={year}
        options={Array.from(
          { length: Math.max(1, currentYear - firstYear + 1) },
          (_, i) => String(currentYear - i),
        )}
        onChange={setYear}
      />
      <Row>
        <Metric label="Expected Rent" value={money(expected)} />
        <Metric label="Settled Rent" value={money(settled)} tone="green" />
      </Row>
      <Metric
        label="Outstanding Rent"
        value={money(Math.max(0, expected - settled))}
        tone="red"
      />
      <Card>
        <Section title="Monthly History">
          {!rows.length && (
            <T size={11} color={c.sub}>
              No rent is due for this year yet.
            </T>
          )}
          {rows
            .slice()
            .reverse()
            .map((row) => (
              <Row
                key={row.date}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: c.border,
                }}
              >
                <T size={11} style={{ flex: 1 }}>
                  {formatRentDate(row.date, calendar, language)}
                </T>
                <T size={10} style={{ flex: 1 }}>
                  {row.due === 0 ? "Paid" : row.paid ? "Partial" : "Unpaid"}
                </T>
                <T size={11} color={row.due ? c.red : c.green}>
                  {money(row.due)}
                </T>
              </Row>
            ))}
        </Section>
      </Card>
      <Card>
        <Section title="Transaction History">
          <RentTransactionList shop={shop} />
        </Section>
      </Card>
      <Button
        title="Collect Payment"
        icon="Banknote"
        onPress={() => go("collect-rent", shop.id)}
      />
    </Page>
  );
}
