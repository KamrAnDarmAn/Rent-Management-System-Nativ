import { useNavigation } from "@react-navigation/native";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { SummaryLine } from "../../components/data-display/SummaryLine";
import { Chips } from "../../components/filters/Chips";
import { CalendarDateField } from "../../components/forms/CalendarDateField";
import { Field } from "../../components/forms/Field";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { receiveRent, rentAccount } from "../../domain/rentAccount";
import { useToday } from "../../hooks/useToday";
import { useGo } from "../../hooks/useGo";
import { useLedger } from "../../store/ledgerStore";
import type { RentReceipt, Shop } from "../../types/shop";
import {
  formatRentDate,
  normalizeDigits,
  supportedCalendarDate,
} from "../../utils/calendar";
import { money } from "../../utils/format";
import { validAmount } from "../../utils/validation";
import { PaymentAllocationPreview } from "./components/PaymentAllocationPreview";
const receiptId = () =>
  `rent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function RentCollectionScreen({
  shop,
  header,
}: {
  shop: Shop;
  header?: ReactNode;
}) {
  const { c, language, notify } = useUI();
  const today = useToday();
  const calendar = shop.rentCalendar ?? "gregorian";
  const account = useMemo(() => rentAccount(shop, today), [shop, today]);
  const id = useRef(receiptId());
  const saving = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [enteredAmount, setEnteredAmount] = useState<string | null>(null);
  const amount =
    enteredAmount ?? (account.outstanding ? String(account.outstanding) : "");
  const [enteredDate, setDate] = useState<string | null>(null);
  const date = enteredDate ?? today;
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"Cash" | "Other">("Cash");
  const [attempted, setAttempted] = useState(false);
  const value = validAmount(normalizeDigits(amount).replace(/٬/g, ","));
  const receipt: RentReceipt = {
    id: id.current,
    amount: value ?? 0,
    date,
    method,
    note: note.trim(),
  };
  const preview = useMemo(
    () => receiveRent(shop, receipt, today),
    [shop, amount, date, method, note, today, submitted],
  );
  const after = useMemo(
    () => (preview.ok ? rentAccount(preview.shop, today) : null),
    [preview, today],
  );
  const collect = useLedger((s) => s.collectRent);
  const nav = useNavigation();
  const go = useGo();
  const save = async () => {
    setAttempted(true);
    if (saving.current || !preview.ok) return;
    saving.current = true;
    const result = await collect(shop.id, receipt);
    if (!result.ok) {
      saving.current = false;
      notify(result.error);
      return;
    }
    setSubmitted(true);
    notify("Payment saved.");
    if (nav.canGoBack()) nav.goBack();
  };
  const another = () => {
    id.current = receiptId();
    saving.current = false;
    setSubmitted(false);
    setEnteredAmount(null);
    setAttempted(false);
    setNote("");
    setDate(null);
  };
  return (
    <Page
      title="Collect Rent"
      footer={
        <Button
          title={submitted ? "Record Another Payment" : "Save Payment"}
          icon="CircleCheck"
          disabled={!submitted && (!value || !shop.occupied)}
          onPress={submitted ? another : save}
        />
      }
    >
      {header ?? <ShopIdentity shop={shop} />}
      <Card style={{ gap: 10 }}>
        <T size={11} color={c.sub}>
          Current rental period
        </T>
        <T weight="semibold">
          {account.currentPeriod
            ? formatRentDate(account.currentPeriod.date, calendar, language)
            : "Not started"}
        </T>
        <Row>
          <Metric
            label="Previous Months Due"
            value={money(account.arrears)}
            tone="red"
          />
          <Metric
            label="Current Month Remaining"
            value={money(account.currentPeriod?.due ?? 0)}
            tone="muted"
          />
        </Row>
        <Metric
          label="Remaining Balance"
          value={money(account.outstanding)}
          tone="teal"
        />
        <SummaryLine
          label="Previously Settled"
          value={money(account.currentPeriod?.paid ?? 0)}
        />
        <SummaryLine
          label="Rent Advance Available"
          value={money(account.advanceBalance)}
        />
        <SummaryLine
          label="Track Unpaid Rent From"
          value={formatRentDate(account.trackingStart, calendar, language)}
        />
        <Button
          title="Edit Shop"
          icon="Pencil"
          variant="outline"
          compact
          onPress={() => go("edit-shop", shop.id)}
        />
        {!account.outstanding && (
          <T size={11} color={c.primary}>
            No cash payment is due for this rental period.
          </T>
        )}
      </Card>
      <Card style={{ gap: 12 }}>
        <Field
          label="Payment Amount"
          value={amount}
          onChangeText={setEnteredAmount}
          numeric
          suffix="AFN"
          helper="Any positive whole-afghani amount. Extra money is kept as a rent advance."
          error={
            attempted && !value
              ? "Enter a positive whole-AFN payment amount."
              : undefined
          }
        />
        <Button
          title="Full"
          variant="secondary"
          compact
          onPress={() => setEnteredAmount(String(account.outstanding))}
          disabled={!account.outstanding}
        />
        <T size={11}>Payment Method</T>
        <Chips
          options={["Cash", "Other"]}
          selected={method}
          onSelect={(method) => setMethod(method as "Cash" | "Other")}
        />
        <CalendarDateField
          label="Payment Date"
          value={date}
          onChangeText={setDate}
          calendar={calendar}
          error={
            attempted &&
            (!supportedCalendarDate(date, calendar) || date > today) &&
            !preview.ok
              ? preview.error
              : undefined
          }
        />
        <Field label="Note (Optional)" value={note} onChangeText={setNote} />
      </Card>
      {attempted && !preview.ok && (
        <T size={11} color={c.red}>
          {preview.error}
        </T>
      )}
      {after && !submitted && (
        <PaymentAllocationPreview
          allocations={after.allocations[id.current] ?? []}
          advance={after.advanceBalance}
          remaining={after.outstanding}
          calendar={calendar}
        />
      )}
    </Page>
  );
}
