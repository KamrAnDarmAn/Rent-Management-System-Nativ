import { Select } from "../../../components/forms/Select";
import { Card } from "../../../components/layout/Card";
import { RentCalendarBadge } from "../../../components/shops/RentCalendarBadge";
import { useText } from "../../../hooks/useText";
import type { Shop } from "../../../types/shop";

export function RentShopPicker({
  shops,
  shopId,
  onSelect,
}: {
  shops: Shop[];
  shopId?: number;
  onSelect: (id: number) => void;
}) {
  const t = useText();
  const options = shops.map((shop) => ({
    id: shop.id,
    label: `${t("Shop #{{number}}", { number: shop.number })} · ${t(shop.name)} · ${t(shop.keeper)}`,
  }));
  const selected = shops.find((shop) => shop.id === shopId);
  return (
    <Card style={{ gap: 10 }}>
      <Select
        label="Select Shop"
        value={
          options.find((option) => option.id === shopId)?.label ??
          "Choose a shop"
        }
        options={options.map((option) => option.label)}
        onChange={(label) => {
          const option = options.find((option) => option.label === label);
          if (option) onSelect(option.id);
        }}
      />
      {selected && <RentCalendarBadge calendar={selected.rentCalendar} />}
    </Card>
  );
}
