import { useShop } from "../../hooks/useShop";
import { CalendarRentHistoryScreen } from "./CalendarRentHistoryScreen";
export function RentHistoryScreen({ shopId = 1 }: { shopId?: number }) {
  return <CalendarRentHistoryScreen shop={useShop(shopId)} />;
}
