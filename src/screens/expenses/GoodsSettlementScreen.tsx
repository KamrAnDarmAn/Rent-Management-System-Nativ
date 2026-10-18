import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Field } from "../../components/forms/Field";
import { CalendarDateField } from "../../components/forms/CalendarDateField";
import { Select } from "../../components/forms/Select";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import { money } from "../../utils/format";
import { validAmount } from "../../utils/validation";
export function GoodsSettlementScreen({ shopId }: { shopId?: number }) {
  const { notify } = useUI(),
    today = useToday();
  const state = useLedger();
  const calendar = usePreferences((s) => s.rentViewCalendar);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [method, setMethod] = useState("Cash");
  const [selected, setSelected] = useState<string>();
  const pending = state.goods.filter(
    (g) =>
      (!shopId || g.shopId === shopId) &&
      g.mode === "owed" &&
      g.settlements.reduce((n, s) => n + s.amount, 0) < g.amount,
  );
  const goods = pending.find((g) => g.id === selected);
  const remaining = (g: (typeof pending)[number]) =>
    g.amount - g.settlements.reduce((n, s) => n + s.amount, 0);
  return (
    <Page title="Goods Settlement">
      {!pending.length && (
        <Card>
          <T>No goods payable remains.</T>
        </Card>
      )}
      {pending.map((g) => (
        <Card
          key={g.id}
          onPress={() => {
            setSelected(g.id);
            setAmount(String(remaining(g)));
          }}
          tone={selected === g.id ? "teal" : undefined}
        >
          <T weight="bold">{g.item}</T>
          <T>
            {
              [...state.shops, ...state.archivedShops].find(
                (s) => s.id === g.shopId,
              )?.name
            }
          </T>
          <T>{g.date}</T>
          <T>{money(remaining(g))}</T>
        </Card>
      ))}
      {goods && (
        <Card style={{ gap: 12 }}>
          <Field
            label="Settlement Amount"
            value={amount}
            onChangeText={setAmount}
            numeric
          />
          <CalendarDateField
            label="Date"
            value={date}
            onChangeText={setDate}
            calendar={calendar}
          />
          <Select
            label="Settlement Method"
            value={method}
            options={["Cash", "Offset Against Rent"]}
            onChange={setMethod}
          />
          <Button
            title="Complete Settlement"
            icon="CircleCheck"
            onPress={async () => {
              const value = validAmount(amount);
              if (
                !value ||
                !(await state.settleGoods(
                  goods.id,
                  value,
                  method as "Cash" | "Offset Against Rent",
                  date,
                ))
              )
                return notify(
                  useLedger.getState().error ??
                    "Enter an amount within the unpaid goods balance and an open date.",
                );
              setSelected(undefined);
              setAmount("");
              notify("Goods settlement saved.");
            }}
          />
        </Card>
      )}
    </Page>
  );
}
