import { useText } from "../../hooks/useText";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Metric } from "../../components/data-display/Metric";
import { EmptySearch } from "../../components/feedback/EmptySearch";
import { Offline } from "../../components/feedback/Offline";
import { Chips } from "../../components/filters/Chips";
import { Search } from "../../components/filters/Search";
import { Icon } from "../../components/icons/Icon";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import { ShopListCard } from "./components/ShopListCard";

export function ShopsScreen() {
  const t = useText();
  const { c } = useUI();
  const go = useGo();
  const shops = useLedger((s) => s.shops);
  const occupied = shops.filter((shop) => shop.occupied).length;
  const prepaid = shops.filter(
    (shop) => shop.occupied && shop.rentalType === "prepaid",
  ).length;
  const today = useToday();
  const vacant = shops.length - occupied;
  const occupiedPercent = shops.length
    ? Math.round((occupied / shops.length) * 100)
    : 0;
  const vacantPercent = shops.length ? 100 - occupiedPercent : 0;
  const filters = [
    `All (${shops.length})`,
    `Occupied (${occupied})`,
    `Vacant (${vacant})`,
    `Prepaid (${prepaid})`,
  ];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = shops.filter(
    (s) =>
      `${s.name} ${s.keeper} ${s.number} ${s.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter.startsWith("All") ||
        (filter.startsWith("Prepaid")
          ? s.occupied && s.rentalType === "prepaid"
          : filter.startsWith("Occupied")
            ? s.occupied
            : !s.occupied)),
  );
  return (
    <View style={{ flex: 1 }}>
      <Page
        title="Shops"
        subtitle="Manage Your Shops with Ease"
        back={false}
        trailing={<Offline />}
      >
        <Row gap={8}>
          <Metric
            label="Total Shops"
            value={String(shops.length)}
            icon="Store"
            tone="teal"
          />
          <Metric
            label="Occupied Shops"
            value={String(occupied)}
            icon="Store"
            tone="green"
            detail={`${occupiedPercent}% Occupied`}
          />
          <Metric
            label="Vacant Shops"
            value={String(vacant)}
            icon="Store"
            tone="muted"
            detail={`${vacantPercent}% Vacant`}
          />
        </Row>
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search shops, shopkeeper or number…"
          onFilter={() =>
            setFilter(filter.startsWith("Vacant") ? "All" : "Vacant")
          }
        />
        <Chips
          options={filters}
          selected={
            filters.find((option) =>
              option.startsWith(filter.split(" (")[0]),
            ) ?? filters[0]
          }
          onSelect={setFilter}
        />
        {filtered.map((shop) => (
          <ShopListCard key={shop.id} shop={shop} today={today} />
        ))}
        {filtered.length === 0 && <EmptySearch />}
        <View style={{ height: 65 }} />
      </Page>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Add Shop")}
        onPress={() => go("add-shop")}
        style={{
          position: "absolute",
          right: 15,
          bottom: 15,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: c.primary,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          boxShadow: "0 5px 18px #007e7933",
        }}
      >
        <Icon name="Plus" size={26} color="#fff" />
        <T size={10} color="#fff" weight="semibold">
          Add Shop
        </T>
      </Pressable>
    </View>
  );
}
