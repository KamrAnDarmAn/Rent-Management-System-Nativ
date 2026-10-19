import { useLedger } from "../../../store/ledgerStore";
import { Pressable, View } from "react-native";
import { Metric } from "../../../components/data-display/Metric";
import { Row } from "../../../components/layout/Row";
import { useGo } from "../../../hooks/useGo";
import type { Shop } from "../../../types/shop";
import { money } from "../../../utils/format";
import { rentCollections } from "../../../domain/rentCollections";
import { addCalendarMonths, calendarMonthStart } from "../../../utils/calendar";

export function ShopBalanceCards({
  shop,
  due,
  advance,
  today,
}: {
  shop: Shop;
  due: number;
  advance: number;
  today: string;
}) {
  const go = useGo();
  const goods = useLedger((s) => s.goods);
  const payable = goods
    .filter((g) => g.shopId === shop.id && g.mode === "owed")
    .reduce(
      (n, g) =>
        n + BigInt(g.amount - g.settlements.reduce((n, s) => n + s.amount, 0)),
      0n,
    );
  const calendar = shop.rentCalendar ?? "gregorian";
  const start = calendarMonthStart(today, calendar);
  const received = rentCollections(
    [shop],
    start,
    addCalendarMonths(start, 1, calendar),
    today,
  ).total;
  return (
    <View style={{ gap: 6 }}>
      <Row gap={6} style={{ alignItems: "stretch" }}>
        <Pressable
          onPress={() => go("rent-history", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            style={{ flexGrow: 1 }}
            label="Payments Received (This Month)"
            value={money(received)}
            tone="green"
            icon="Banknote"
            detail="Cash and other payments"
          />
        </Pressable>
        <Pressable
          onPress={() => go("rent-history", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            style={{ flexGrow: 1 }}
            label="Outstanding Rent"
            value={money(due)}
            tone="red"
            icon="FileWarning"
            detail="View rent history"
          />
        </Pressable>
      </Row>
      <Row gap={6} style={{ alignItems: "stretch" }}>
        <Pressable
          onPress={() => go("construction-credit", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            style={{ flexGrow: 1 }}
            label="Available Credit"
            value={money(shop.credit)}
            tone="teal"
            icon="Building2"
            detail="Construction Credit"
          />
        </Pressable>
        <Pressable
          onPress={() => go("goods-settlement", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            style={{ flexGrow: 1 }}
            label="Goods Payable"
            value={money(payable)}
            tone="orange"
            icon="Package"
            detail="View goods history"
          />
        </Pressable>
      </Row>
      <Row gap={6} style={{ alignItems: "stretch" }}>
        <Pressable
          onPress={() => go("rent-history", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            style={{ flexGrow: 1 }}
            label="Rent Advance Available"
            value={money(advance)}
            tone="blue"
            icon="Wallet"
            detail="View rent history"
          />
        </Pressable>
      </Row>
    </View>
  );
}
