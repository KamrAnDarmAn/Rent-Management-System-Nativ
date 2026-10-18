import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { useLedger } from "../../store/ledgerStore";
import { RentShopPicker } from "./components/RentShopPicker";
import { RentCollectionScreen } from "./RentCollectionScreen";

export function CollectRentScreen({ shopId }: { shopId?: number }) {
  const activeShops = useLedger((state) => state.shops);
  const archivedShops = useLedger((state) => state.archivedShops);
  const shops = [...activeShops, ...archivedShops];
  const [selectedId, setSelectedId] = useState<number>();
  const go = useGo();
  if (shopId !== undefined) {
    const shop = shops.find((shop) => shop.id === shopId);
    return shop ? (
      <RentCollectionScreen key={shop.id} shop={shop} />
    ) : (
      <Page title="Collect Rent">
        <Card>
          <T>Shop not found</T>
        </Card>
        <Button title="Back to Shops" onPress={() => go("shops")} />
      </Page>
    );
  }
  const occupied = shops.filter(
    (shop) => shop.occupied || !!shop.tenancyEndDate,
  );
  const selected = occupied.find((shop) => shop.id === selectedId);
  const picker = (
    <RentShopPicker
      shops={occupied}
      shopId={selected?.id}
      onSelect={setSelectedId}
    />
  );
  if (selected)
    return (
      <RentCollectionScreen key={selected.id} shop={selected} header={picker} />
    );
  return (
    <Page
      title="Collect Rent"
      footer={
        <Button
          title="Save Payment"
          icon="CircleCheck"
          disabled
          onPress={() => {}}
        />
      }
    >
      {occupied.length ? (
        <>
          {picker}
          <Card tone="teal">
            <T>Select a shop to view its balance and collect rent.</T>
          </Card>
        </>
      ) : (
        <Card style={{ gap: 12 }}>
          <T>
            No occupied shops are available. Add an occupied shop to collect
            rent.
          </T>
          <Button title="Add Shop" icon="Plus" onPress={() => go("add-shop")} />
        </Card>
      )}
    </Page>
  );
}
