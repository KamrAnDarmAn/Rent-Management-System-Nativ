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
  | "data-management"
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
  Tabs:
    | {
        screen?: string;
      }
    | undefined;
  Screen: {
    id: ScreenId;
    shopId?: number;
  };
};
