import { monthlyRentAt } from "../../domain/rentSchedule";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { SummaryLine } from "../../components/data-display/SummaryLine";
import { CalendarMonthPicker } from "../../components/filters/CalendarMonthPicker";
import { Field } from "../../components/forms/Field";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { rentalPeriod, rentDueDate, rentPosition } from "../../domain/rent";
import { rentAccount } from "../../domain/rentAccount";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import type { Shop } from "../../types/shop";
import {
  calendarMonthDifference,
  formatRentDate,
  normalizeDigits,
} from "../../utils/calendar";
import { money } from "../../utils/format";
import { validAmount } from "../../utils/validation";
import { RentCollectionScreen } from "./RentCollectionScreen";
export function CollectCalendarRentScreen({
  shop,
  credit = false,
}: {
  shop: Shop;
  credit?: boolean;
}) {
  const { c, language, notify } = useUI();
  const today = useToday();
  const calendar = shop.rentCalendar ?? "gregorian";
  const [month, setMonth] = useState(today);
  const offset = calendarMonthDifference(shop.startDate, month, calendar);
  const period =
    offset >= 0 ? rentDueDate(shop.startDate, offset, calendar) : null;
  const base = rentPosition(shop, period ?? month);
  const account = rentAccount(shop, period && period > today ? period : today);
  const row = account.periods.find((row) => row.date === period);
  const position = { ...base, due: row?.due ?? 0, paid: row?.paid ?? 0 };
  const current = rentalPeriod(shop.startDate, today, calendar);
  const apply = useLedger((s) => s.applyCredit);
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [attempted, setAttempted] = useState(false);
  const save = async () => {
    setAttempted(true);
    const value = validAmount(normalizeDigits(amount));
    if (!period || !value || value > position.due || value > shop.credit)
      return;
    const latest = useLedger
      .getState()
      .shops.find((item) => item.id === shop.id);
    if (
      !latest ||
      value > latest.credit ||
      value >
        (rentAccount(latest, period > today ? period : today).periods.find(
          (item) => item.date === period,
        )?.due ?? 0)
    )
      return notify(
        "Choose an amount within available credit and unpaid rent.",
      );
    if (!(await apply(shop.id, value, period)))
      return notify(useLedger.getState().error!);
    notify(credit ? "Credit applied." : "Payment saved.");
    if (navigation.canGoBack()) navigation.goBack();
  };
  if (!credit) return <RentCollectionScreen key={shop.id} shop={shop} />;
  return (
    <Page
      title={credit ? "Apply Credit" : "Collect Rent"}
      footer={
        <Button
          title={credit ? "Apply Credit" : "Save Payment"}
          icon="CircleCheck"
          disabled={
            !period || position.due === 0 || (credit && shop.credit === 0)
          }
          onPress={save}
        />
      }
    >
      <ShopIdentity shop={shop} />
      <CalendarMonthPicker
        value={month}
        calendar={calendar}
        onChange={(date) => {
          setMonth(date);
          setAmount("");
          setAttempted(false);
        }}
      />
      <Card style={{ gap: 10 }}>
        <SummaryLine
          label="Rent Due Date"
          value={
            period ? formatRentDate(period, calendar, language) : "Not started"
          }
        />
        <SummaryLine
          label="Next Rent Due"
          value={formatRentDate(current.nextDueDate, calendar, language)}
        />
        <Row>
          <Metric
            label="Monthly Rent"
            value={money(monthlyRentAt(shop))}
            tone="muted"
          />
          <Metric
            label="Previously Settled"
            value={money(position.paid)}
            tone="green"
          />
        </Row>
        {position.charge !== shop.rent && (
          <SummaryLine
            label="First partial-month rent"
            value={money(position.charge)}
          />
        )}
        <Metric
          label="Remaining Balance"
          value={money(position.due)}
          tone="teal"
        />
        {credit && (
          <SummaryLine label="Available Credit" value={money(shop.credit)} />
        )}
        {!position.due && (
          <T color={c.primary}>
            No cash payment is due for this rental period.
          </T>
        )}
      </Card>
      <Card style={{ gap: 12 }}>
        <Field
          label={credit ? "Credit Amount to Apply" : "Payment Amount"}
          value={amount}
          onChangeText={setAmount}
          numeric
          suffix="AFN"
          error={
            attempted &&
            (!validAmount(amount) ||
              Number(amount.replace(/,/g, "")) >
                Math.min(position.due, credit ? shop.credit : Infinity))
              ? "Enter a positive amount no greater than the remaining rent."
              : undefined
          }
        />
        <Button
          title="Full"
          variant="secondary"
          compact
          onPress={() =>
            setAmount(
              String(Math.min(position.due, credit ? shop.credit : Infinity)),
            )
          }
        />
        <T size={10} color={c.sub}>
          This payment settles the selected rental period only.
        </T>
      </Card>
    </Page>
  );
}
