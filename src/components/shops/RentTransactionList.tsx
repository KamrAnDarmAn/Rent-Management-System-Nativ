import { rentAccount } from "../../domain/rentAccount";
import { useToday } from "../../hooks/useToday";
import { SummaryLine } from "../data-display/SummaryLine";
import type { Shop } from "../../types/shop";
import { formatRentDate } from "../../utils/calendar";
import { money } from "../../utils/format";
import { useText } from "../../hooks/useText";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { View } from "react-native";

export function RentTransactionList({
  shop,
  kind,
}: {
  shop: Shop;
  kind?: "cash" | "credit";
}) {
  const { c, language } = useUI();
  const t = useText();
  const today = useToday();
  const account = rentAccount(shop, today);
  const transactions = (shop.rentTransactions ?? [])
    .filter(
      (entry) =>
        (!kind || entry.kind === kind) &&
        (kind !== "credit" || entry.source !== "goods"),
    )
    .slice()
    .reverse();
  if (!transactions.length)
    return (
      <T size={11} color={c.sub}>
        No transactions recorded for this shop yet.
      </T>
    );
  return (
    <>
      {transactions.map((entry) => {
        const receipt = shop.rentReceipts?.find(
          (item) => item.id === entry.receiptId,
        );
        return (
          <Row
            key={entry.id}
            style={{
              paddingVertical: 9,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <T size={12} weight="semibold">
                {receipt?.reversedAt
                  ? "Reversed Payment"
                  : entry.source === "goods"
                    ? "Goods Rent Deduction"
                    : entry.kind === "credit"
                      ? "Credit Applied"
                      : "Rent Payment"}
              </T>
              <T size={10} color={c.sub}>
                {formatRentDate(entry.date, entry.calendar, language)}
              </T>
              {entry.receiptId ? (
                <>
                  <T size={10} color={c.sub}>
                    {receipt?.method ?? "Cash"}
                  </T>
                  {!!receipt?.reversedAt && !!receipt.reversalReason && (
                    <T size={10} color={c.sub}>
                      {receipt.reversalReason}
                    </T>
                  )}
                  {(account.allocations[entry.receiptId] ?? []).map(
                    (allocation, index) => (
                      <SummaryLine
                        key={`${allocation.period}-${index}`}
                        label={formatRentDate(
                          allocation.period,
                          shop.rentCalendar,
                          language,
                        )}
                        value={money(allocation.amount)}
                      />
                    ),
                  )}
                  {!!account.advanceByReceipt[entry.receiptId] && (
                    <SummaryLine
                      label="Rent Advance Available"
                      value={money(account.advanceByReceipt[entry.receiptId])}
                    />
                  )}
                </>
              ) : (
                <T size={10} color={c.sub}>
                  {t("For rental period: {{date}}", {
                    date: formatRentDate(
                      entry.period,
                      entry.calendar,
                      language,
                    ),
                  })}
                </T>
              )}
              {!!entry.note && <T size={10}>{entry.note}</T>}
            </View>
            <T
              size={12}
              weight="semibold"
              color={receipt?.reversedAt ? c.sub : c.primary}
            >
              {money(entry.amount)}
            </T>
          </Row>
        );
      })}
    </>
  );
}
