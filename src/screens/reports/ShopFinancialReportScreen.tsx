import { useShop } from "../../hooks/useShop";
import { CalendarRentHistoryScreen } from "../rent/CalendarRentHistoryScreen";

export function ShopFinancialReportScreen({ shopId = 1 }: { shopId?: number }) {
  const shop = useShop(shopId);
  return <CalendarRentHistoryScreen key={shop.id} shop={shop} report />;
}
