import { type IconName } from "../components/icons/Icon";
import { type TabId } from "./types";

export const tabItems: {
  id: TabId;
  label: string;
  icon: IconName;
}[] = [
  { id: "collect", label: "Collect", icon: "House" },
  { id: "spend", label: "Spend", icon: "Wallet" },
  { id: "shops", label: "Shops", icon: "Store" },
  { id: "reports", label: "Reports", icon: "ChartNoAxesColumnIncreasing" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export const isTab = (id: string): id is TabId =>
  tabItems.some((t) => t.id === id);
