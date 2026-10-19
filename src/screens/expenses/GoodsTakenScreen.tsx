import { useDismissSavedForm } from "../../hooks/useDismissSavedForm";
import { useRef, useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Chips } from "../../components/filters/Chips";
import { CalendarDateField } from "../../components/forms/CalendarDateField";
import { Field } from "../../components/forms/Field";
import { Select } from "../../components/forms/Select";
import { Info } from "../../components/feedback/Info";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { rentAccount } from "../../domain/rentAccount";
import { useToday } from "../../hooks/useToday";
import { useGo } from "../../hooks/useGo";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import { money } from "../../utils/format";
import { normalizeDigits } from "../../utils/calendar";
import { validAmount } from "../../utils/validation";
import type { GoodsEntry } from "../../types/ledger";
export function GoodsTakenScreen({ shopId }: { shopId?: number }) {
  const { c, notify } = useUI(),
    dismissSavedForm = useDismissSavedForm(),
    go = useGo();
  const shops = useLedger((s) => s.shops);
  const [selected, setSelected] = useState(shopId);
  const shop = shops.find((s) => s.id === selected);
  const prefs = usePreferences();
  const label = (s: (typeof shops)[number]) =>
    `Shop ${s.number} · ${s.name} · ${s.keeper}`;
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Pcs.");
  const today = useToday();
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<GoodsEntry["mode"]>("offset");
  const saved = useRef(false),
    id = useRef(`goods-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const q = Number(normalizeDigits(quantity)),
    p = validAmount(normalizeDigits(price)) ?? 0;
  const total = Math.round(q * p);
  const outstanding = shop ? rentAccount(shop, date || today).outstanding : 0;
  return (
    <Page
      title="Goods Taken from Shop"
      footer={
        <Button
          title="Record Goods"
          icon="CircleCheck"
          disabled={!shop}
          onPress={async () => {
            if (saved.current) return;
            if (
              !shop ||
              !item.trim() ||
              !Number.isFinite(q) ||
              q <= 0 ||
              !Number.isSafeInteger(total) ||
              total <= 0
            )
              return notify(
                "Enter an item and valid quantity and whole-AFN price.",
              );
            if (
              !(await useLedger.getState().addGoods({
                id: id.current,
                shopId: shop.id,
                date,
                item: item.trim(),
                quantity: q,
                unit,
                unitPrice: p,
                amount: total,
                mode,
                notes: notes.trim(),
                settlements: [],
              }))
            )
              return notify(useLedger.getState().error!);
            saved.current = true;
            notify("Goods saved.");
            dismissSavedForm();
          }}
        />
      }
    >
      <Select
        label="Select Shop"
        value={shop ? label(shop) : "Choose a shop"}
        options={shops.map(label)}
        onChange={(v) => setSelected(shops.find((s) => label(s) === v)?.id)}
      />
      {!shops.length && (
        <Button title="Add Shop" onPress={() => go("add-shop")} />
      )}
      <Field label="Item Name" value={item} onChangeText={setItem} required />
      <Row>
        <Field
          style={{ flex: 1 }}
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          numeric
        />
        <Select
          style={{ flex: 1 }}
          label="Unit"
          value={unit}
          options={["Pcs.", "Kg", "Litre", "Box"]}
          onChange={setUnit}
        />
        <Field
          style={{ flex: 1 }}
          label="Unit Price (AFN)"
          value={price}
          onChangeText={setPrice}
          numeric
        />
      </Row>
      <CalendarDateField
        label="Date"
        value={date}
        onChangeText={setDate}
        calendar={shop?.rentCalendar ?? prefs.rentViewCalendar}
      />
      <Field
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Card style={{ gap: 12 }}>
        <T weight="bold">How to Record This?</T>
        <Chips
          options={["offset", "owed", "paid"]}
          selected={mode}
          onSelect={(v) => setMode(v as GoodsEntry["mode"])}
        />
        <T color={c.sub}>
          Paid = paid separately · owed = owner payable · offset = reduce rent.
        </T>
        <T weight="bold" size={24}>
          {money(Number.isSafeInteger(total) && total > 0 ? total : 0)}
        </T>
        <T>Outstanding Rent</T>
        <T>{money(outstanding)}</T>
        <T>New Rent Balance</T>
        <T>
          {money(
            Math.max(0, outstanding - (mode === "offset" ? total || 0 : 0)),
          )}
        </T>
      </Card>
      <Info text="Goods deductions settle the oldest unpaid rent first. If the goods value is larger than unpaid rent, record the extra value as a separate payable." />
    </Page>
  );
}
