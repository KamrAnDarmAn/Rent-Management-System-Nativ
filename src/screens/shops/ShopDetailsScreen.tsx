import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { IconButton } from "../../components/buttons/IconButton";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { PrepaidSummary } from "../../components/shops/PrepaidSummary";
import { useUI } from "../../components/theme/UIContext";
import { SummaryLine } from "../../components/data-display/SummaryLine";
import { money } from "../../utils/format";
import { T } from "../../components/typography/T";
import { rentalPeriod, rentPosition } from "../../domain/rent";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import { type RootStackParams } from "../../navigation/types";
import { useLedger } from "../../store/ledgerStore";
import { DeleteShopDialog } from "./components/DeleteShopDialog";
import { ShopBalanceCards } from "./components/ShopBalanceCards";
import { ShopDetailsHeader } from "./components/ShopDetailsHeader";
import { ShopDetailTabs } from "./components/ShopDetailTabs";
import { ShopManagementActions } from "./components/ShopManagementActions";
import { ShopOverview } from "./components/ShopOverview";
import { ShopRecentActivity } from "./components/ShopRecentActivity";
export function ShopDetailsScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const go = useGo();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const shop = useLedger((state) => state.shops.find((s) => s.id === shopId));
  const deleteShop = useLedger((state) => state.deleteShop);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const today = useToday();
  const returnToShops = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs", params: { screen: "shops" } }],
    });
  if (!shop)
    return (
      <Page title="Shop Details">
        <Card style={{ gap: 12 }}>
          <T size={18} weight="bold">
            Shop not found
          </T>
          <T color={c.sub}>This shop is no longer available.</T>
          <Button title="Back to Shops" onPress={returnToShops} />
        </Card>
      </Page>
    );
  const position = rentPosition(shop, today);
  const footer = (
    <Button
      title="Collect Rent"
      icon="Banknote"
      onPress={() => go("collect-rent", shop.id)}
    />
  );
  return (
    <Page
      title="Shop Details"
      trailing={
        <IconButton
          name="Ellipsis"
          label="More shop actions"
          onPress={() => go("shop-financial-report", shop.id)}
        />
      }
      footer={footer}
    >
      <DeleteShopDialog
        shop={shop}
        visible={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!(await deleteShop(shop.id)))
            return notify(useLedger.getState().error!);
          setConfirmDelete(false);
          returnToShops();
          notify(
            "Shop removed. Financial history is preserved in Archived Shops.",
          );
        }}
      />
      <ShopDetailsHeader shop={shop} />
      {position.prepaid && shop.prepaidRent && (
        <PrepaidSummary
          shop={shop}
          plan={shop.prepaidRent}
          today={today}
          calendar={shop.rentCalendar}
        />
      )}
      <ShopBalanceCards shop={shop} due={position.totalDue} today={today} />
      <Card>
        <SummaryLine
          label="Rent Advance Available"
          value={money(position.advanceBalance)}
        />
      </Card>
      <ShopDetailTabs shopId={shop.id} />
      <ShopOverview
        shop={shop}
        nextRentDue={
          position.prepaid?.remaining
            ? position.prepaid.firstCashDueDate
            : rentalPeriod(shop.startDate, today, shop.rentCalendar).nextDueDate
        }
      />
      <ShopRecentActivity shopId={shop.id} />
      <ShopManagementActions
        shopId={shop.id}
        onDelete={() => setConfirmDelete(true)}
      />
    </Page>
  );
}
