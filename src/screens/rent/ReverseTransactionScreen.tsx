import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Info } from "../../components/feedback/Info";
import { Field } from "../../components/forms/Field";
import { Select } from "../../components/forms/Select";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useShop } from "../../hooks/useShop";
import { useLedger } from "../../store/ledgerStore";
import { money } from "../../utils/format";
export function ReverseTransactionScreen({ shopId = 1 }: { shopId?: number }) {
  const { notify } = useUI(),
    shop = useShop(shopId);
  const [selected, setSelected] = useState<string>();
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const receipts = (shop.rentReceipts ?? [])
    .filter((r) => !r.reversedAt)
    .slice()
    .reverse();
  const label = (r: (typeof receipts)[number]) =>
    `${r.date} · ${money(r.amount)} · ${r.id.slice(-6)}`;
  const receipt = receipts.find((r) => r.id === selected);
  return (
    <Page
      title="Transaction Details"
      subtitle="View and manage this transaction"
    >
      <ShopIdentity shop={shop} />
      <Select
        label="Select Payment"
        value={receipt ? label(receipt) : "Choose a payment"}
        options={receipts.map(label)}
        onChange={(v) => {
          setSelected(receipts.find((r) => label(r) === v)?.id);
          setConfirm(false);
        }}
      />
      {!receipts.length && (
        <Card>
          <T>No payments available to reverse.</T>
        </Card>
      )}
      <Field
        label="Reversal Reason"
        value={reason}
        onChangeText={setReason}
        multiline
      />
      <Info
        text="A reversal keeps the original receipt and reason in history. Rent and advance balances are recalculated. Reopen a closed month before correcting its receipts."
        tone="orange"
      />
      {confirm && (
        <Card tone="red">
          <T>Confirm reversal of this payment?</T>
          <Button
            title="Confirm Reversal"
            variant="danger"
            onPress={async () => {
              if (
                !receipt ||
                !(await useLedger
                  .getState()
                  .reverseReceipt(shop.id, receipt.id, reason))
              )
                return notify(
                  useLedger.getState().error ??
                    "Enter a reason and select a payment.",
                );
              setConfirm(false);
              setSelected(undefined);
              setReason("");
              notify("Payment reversed.");
            }}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setConfirm(false)}
          />
        </Card>
      )}
      <Button
        title="Reverse Transaction"
        icon="Undo2"
        variant="danger"
        disabled={!receipt || !reason.trim()}
        onPress={() => setConfirm(true)}
      />
    </Page>
  );
}
