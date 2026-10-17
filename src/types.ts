export type TabId = "collect" | "spend" | "shops" | "reports" | "settings";
export type ScreenId =
  | TabId
  | "splash"
  | "get-started"
  | "setup-property"
  | "add-shop"
  | "shop-details"
  | "shopkeeper"
  | "collect-rent"
  | "apply-credit"
  | "construction-credit"
  | "rent-history"
  | "add-expense"
  | "goods-taken"
  | "goods-settlement"
  | "shop-financial-report"
  | "tenancy-lifecycle"
  | "month-closing"
  | "language"
  | "reminders"
  | "backup-restore"
  | "device-transfer"
  | "reverse-transaction"
  | "empty-states"
  | "error-states"
  | "dark-theme"
  | "pashto-home"
  | "design-system"
  | "screen-gallery";
export type RootStackParams = {
  Tabs: { screen?: string } | undefined;
  Screen: { id: ScreenId; shopId?: number };
};
export type ShopStatus =
  "Paid" | "Partial" | "Unpaid" | "Overdue" | "Settled by Credit";
export type Shop = {
  id: number;
  name: string;
  keeper: string;
  phone: string;
  rent: number;
  paid: number;
  credit: number;
  status: ShopStatus;
  occupied: boolean;
  image: number;
};
