import { useShop } from "../../hooks/useShop";
import { CollectCalendarRentScreen } from "./CollectCalendarRentScreen";
export function ApplyCreditScreen({ shopId }: { shopId?: number }) {
  return <CollectCalendarRentScreen shop={useShop(shopId)} credit />;
}
