import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { Field } from "../../components/forms/Field";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Section } from "../../components/layout/Section";
import { RentTransactionList } from "../../components/shops/RentTransactionList";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useGo } from "../../hooks/useGo";
import { useShop } from "../../hooks/useShop";
import { useLedger } from "../../store/ledgerStore";
import { money } from "../../utils/format";
import { validAmount } from "../../utils/validation";
export function ConstructionCreditScreen({ shopId = 1 }: { shopId?: number }) {
  const { notify } = useUI(),
    go = useGo(),
    shop = useShop(shopId);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const audit = useLedger((s) => s.audit);
  return (
    <Page title="Construction Credit">
      <ShopIdentity shop={shop} />
      <Metric
        label="Available Construction Credit"
        value={money(shop.credit)}
        tone="teal"
      />
      <Card style={{ gap: 12 }}>
        <Field
          label="Additional Construction Credit"
          value={amount}
          onChangeText={setAmount}
          numeric
          suffix="AFN"
        />
        <Field
          label="Description"
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Button
          title="Add Credit"
          icon="Plus"
          onPress={async () => {
            const n = validAmount(amount);
            if (!n || !note.trim())
              return notify(
                "Enter a positive whole-AFN amount and description.",
              );
            if (
              !(await useLedger.getState().addCredit(shop.id, n, note.trim()))
            )
              return notify(useLedger.getState().error!);
            setAmount("");
            setNote("");
            notify("Construction credit saved.");
          }}
        />
      </Card>
      <Card>
        <Section title="Credit Application History">
          <RentTransactionList shop={shop} kind="credit" />
        </Section>
      </Card>
      {audit
        .filter(
          (a) =>
            a.shopId === shop.id && a.action === "Construction credit added",
        )
        .slice()
        .reverse()
        .map((a) => (
          <Card key={a.id}>
            <T>{a.date.slice(0, 10)}</T>
            <T>{a.note}</T>
          </Card>
        ))}
      <Button
        title="Apply Credit"
        icon="CircleCheck"
        onPress={() => go("apply-credit", shop.id)}
      />
    </Page>
  );
}
