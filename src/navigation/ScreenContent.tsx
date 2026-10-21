import { DataManagementScreen } from "../screens/settings/DataManagementScreen";
import { useLedger } from "../store/ledgerStore";
import { Page } from "../components/layout/Page";
import { T } from "../components/typography/T";
import { Button } from "../components/buttons/Button";
import { useGo } from "../hooks/useGo";
import { CollectScreen } from "../screens/collect/CollectScreen";
import { AddExpenseScreen } from "../screens/expenses/AddExpenseScreen";
import { GoodsSettlementScreen } from "../screens/expenses/GoodsSettlementScreen";
import { GoodsTakenScreen } from "../screens/expenses/GoodsTakenScreen";
import { SpendScreen } from "../screens/expenses/SpendScreen";
import { SetupPropertyScreen } from "../screens/onboarding/SetupPropertyScreen";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { SplashScreen } from "../components/branding/SplashScreen";
import { DesignSystemScreen } from "../screens/reference/DesignSystemScreen";
import { EmptyStatesScreen } from "../screens/reference/EmptyStatesScreen";
import { ErrorStatesScreen } from "../screens/reference/ErrorStatesScreen";
import { ScreenGallery } from "../screens/reference/ScreenGallery";
import { ApplyCreditScreen } from "../screens/rent/ApplyCreditScreen";
import { CollectRentScreen } from "../screens/rent/CollectRentScreen";
import { ConstructionCreditScreen } from "../screens/rent/ConstructionCreditScreen";
import { MonthClosingScreen } from "../screens/rent/MonthClosingScreen";
import { RentHistoryScreen } from "../screens/rent/RentHistoryScreen";
import { ReverseTransactionScreen } from "../screens/rent/ReverseTransactionScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { ShopFinancialReportScreen } from "../screens/reports/ShopFinancialReportScreen";
import { BackupScreen } from "../screens/settings/BackupScreen";
import { DeviceTransferScreen } from "../screens/settings/DeviceTransferScreen";
import { LanguageScreen } from "../screens/settings/LanguageScreen";
import { RemindersScreen } from "../screens/settings/RemindersScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { ShopDetailsScreen } from "../screens/shops/ShopDetailsScreen";
import { ShopFormScreen } from "../screens/shops/ShopFormScreen";
import { ShopkeeperScreen } from "../screens/shops/ShopkeeperScreen";
import { ShopsScreen } from "../screens/shops/ShopsScreen";
import { TenancyScreen } from "../screens/shops/TenancyScreen";
import { type ScreenId } from "./types";

export function ScreenContent({
  id,
  shopId,
}: {
  id: ScreenId;
  shopId?: number;
}) {
  const shops = useLedger((s) => s.shops);
  const archived = useLedger((s) => s.archivedShops);
  const go = useGo();
  const specific = [
    "shop-details",
    "shopkeeper",
    "apply-credit",
    "construction-credit",
    "rent-history",
    "shop-financial-report",
    "tenancy-lifecycle",
    "reverse-transaction",
  ];
  if (specific.includes(id)) {
    const requested = [...shops, ...archived].find(
      (s) => s.id === (shopId ?? shops[0]?.id),
    );
    if (!requested)
      return (
        <Page title="Shop not found">
          <T>This shop is no longer available.</T>
          <Button title="Add Shop" onPress={() => go("add-shop")} />
        </Page>
      );
    shopId = requested.id;
  }
  switch (id) {
    case "data-management":
      return <DataManagementScreen />;
    case "collect":
    case "dark-theme":
    case "pashto-home":
      return <CollectScreen />;
    case "spend":
      return <SpendScreen />;
    case "shops":
      return <ShopsScreen />;
    case "reports":
      return <ReportsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "add-shop":
      return <ShopFormScreen />;
    case "edit-shop":
      return <ShopFormScreen shopId={shopId ?? 1} />;
    case "setup-property":
      return <SetupPropertyScreen />;
    case "collect-rent":
      return <CollectRentScreen shopId={shopId} />;
    case "apply-credit":
      return <ApplyCreditScreen shopId={shopId} />;
    case "add-expense":
      return <AddExpenseScreen />;
    case "goods-taken":
      return <GoodsTakenScreen shopId={shopId} />;
    case "goods-settlement":
      return <GoodsSettlementScreen shopId={shopId} />;
    case "shop-details":
      return <ShopDetailsScreen shopId={shopId} />;
    case "shopkeeper":
      return <ShopkeeperScreen shopId={shopId} />;
    case "construction-credit":
      return <ConstructionCreditScreen shopId={shopId} />;
    case "rent-history":
      return <RentHistoryScreen shopId={shopId} />;
    case "shop-financial-report":
      return <ShopFinancialReportScreen shopId={shopId} />;
    case "tenancy-lifecycle":
      return <TenancyScreen shopId={shopId} />;
    case "month-closing":
      return <MonthClosingScreen />;
    case "reverse-transaction":
      return <ReverseTransactionScreen shopId={shopId} />;
    case "language":
      return <LanguageScreen />;
    case "reminders":
      return <RemindersScreen />;
    case "backup-restore":
      return <BackupScreen />;
    case "device-transfer":
      return <DeviceTransferScreen />;
    case "splash":
      return <SplashScreen animate={false} />;
    case "get-started":
      return <WelcomeScreen />;
    case "empty-states":
      return <EmptyStatesScreen />;
    case "error-states":
      return <ErrorStatesScreen />;
    case "design-system":
      return <DesignSystemScreen />;
    case "screen-gallery":
      return <ScreenGallery />;
  }
}
