import { type ShopStatus } from "../../types/shop";
import { type IconName } from "../icons/Icon";

export const statusTone = (status: ShopStatus) =>
  status === "Paid"
    ? "green"
    : status === "Partial"
      ? "orange"
      : status === "Settled by Credit"
        ? "blue"
        : "red";

export const statusIcon = (status: ShopStatus): IconName =>
  status === "Paid"
    ? "CircleCheck"
    : status === "Partial" || status === "Overdue"
      ? "Clock3"
      : status === "Settled by Credit"
        ? "CreditCard"
        : "CircleAlert";
