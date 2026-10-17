export type TabId = "collect" | "spend" | "shops" | "reports" | "settings";
export type ScreenId =
  | TabId
  | "splash"
  | "get-started"
  | "setup-property"
  | "add-shop"
  | "edit-shop"
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
  number: string;
  name: string;
  keeper: string;
  phone: string;
  address: string;
  startDate: string;
  notes: string;
  rent: number;
  paid: number;
  credit: number;
  status: ShopStatus;
  occupied: boolean;
  rentalType?: "monthly" | "prepaid";
  prepaidRent?: { amount: number; startDate: string; monthlyRent: number };
  prepaidPayments?: Record<string, number>;
  image: number;
};
