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
      <T
        size={language === "ps" ? 16 : 14}
        color={c.text}
        style={{ opacity: 0.72 }}
      >
        No transactions recorded for this shop yet.
      </T>
    );
  return (
    <View style={{ gap: 12 }}>
      {transactions.map((entry) => {
        const receipt = shop.rentReceipts?.find(
          (item) => item.id === entry.receiptId,
        );
        const allocations = entry.receiptId
          ? (account.allocations[entry.receiptId] ?? [])
          : [];
        const advance = entry.receiptId
          ? (account.advanceByReceipt[entry.receiptId] ?? 0)
          : 0;
        return (
          <View
            key={entry.id}
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: c.muted,
              borderWidth: 1,
              borderColor: c.border,
              gap: 8,
            }}
          >
            <Row gap={12} style={{ alignItems: "flex-start" }}>
              <T
                size={language === "ps" ? 17 : 15}
                weight="semibold"
                style={{ flex: 1 }}
              >
                {receipt?.reversedAt
                  ? "Reversed Payment"
                  : entry.source === "goods"
                    ? "Goods Rent Deduction"
                    : entry.kind === "credit"
                      ? "Credit Applied"
                      : "Rent Payment"}
              </T>
              <T
                size={language === "ps" ? 18 : 16}
                weight="bold"
                color={receipt?.reversedAt ? c.sub : c.primary}
                style={{ flexShrink: 1, maxWidth: "48%" }}
              >
                {money(entry.amount)}
              </T>
            </Row>
            <T
              size={language === "ps" ? 15 : 13}
              color={c.text}
              style={{ opacity: 0.72 }}
            >
              {formatRentDate(entry.date, entry.calendar, language)}
            </T>
            {entry.receiptId ? (
              <>
                <T
                  size={language === "ps" ? 15 : 13}
                  color={c.text}
                  style={{ opacity: 0.72 }}
                >
                  {receipt?.method ?? "Cash"}
                </T>
                {!!receipt?.reversedAt && !!receipt.reversalReason && (
                  <T size={language === "ps" ? 16 : 14}>
                    {receipt.reversalReason}
                  </T>
                )}
                {(allocations.length > 0 || advance > 0) && (
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: c.surface,
                      gap: 5,
                    }}
                  >
                    {allocations.map((allocation, allocationIndex) => (
                      <SummaryLine
                        key={allocation.period + ":" + allocationIndex}
                        size={language === "ps" ? 15 : 13}
                        label={formatRentDate(
                          allocation.period,
                          shop.rentCalendar,
                          language,
                        )}
                        value={money(allocation.amount)}
                      />
                    ))}
                    {advance > 0 && (
                      <SummaryLine
                        size={language === "ps" ? 15 : 13}
                        label="Rent Advance Available"
                        value={money(advance)}
                      />
                    )}
                  </View>
                )}
              </>
            ) : (
              <T
                size={language === "ps" ? 15 : 13}
                color={c.text}
                style={{ opacity: 0.72 }}
              >
                {t("For rental period: {{date}}", {
                  date: formatRentDate(entry.period, entry.calendar, language),
                })}
              </T>
            )}
            {!!entry.note && (
              <T size={language === "ps" ? 16 : 14}>{entry.note}</T>
            )}
          </View>
        );
      })}
    </View>
  );
}
