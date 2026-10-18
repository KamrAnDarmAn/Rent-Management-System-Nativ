import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useUI } from "../../../components/theme/UIContext";
import { shopImages } from "../../../data/shopImages";
import {
  validateShopFields,
  type ShopFormErrors,
  type ShopFormFields,
} from "../../../domain/shopForm";
import { useGo } from "../../../hooks/useGo";
import { useToday } from "../../../hooks/useToday";
import { useLedger } from "../../../store/ledgerStore";
import { type Shop } from "../../../types/shop";
import { rentalPeriod } from "../../../domain/rent";
import { usePreferences } from "../../../store/preferencesStore";
import { ledgerStartDate } from "../../../domain/rentAccount";
export function useShopForm(shopId?: number) {
  const { notify } = useUI();
  const go = useGo();
  const navigation = useNavigation();
  const add = useLedger((s) => s.addShop);
  const update = useLedger((s) => s.updateShop);
  const activeShops = useLedger((s) => s.shops);
  const archivedShops = useLedger((s) => s.archivedShops);
  const shops = [...activeShops, ...archivedShops];
  const shop = shops.find((s) => s.id === shopId);
  const editing = shopId !== undefined;
  const today = useToday();
  const setViewCalendar = usePreferences((s) => s.setRentViewCalendar);
  const [calendar, setCalendar] = useState(shop?.rentCalendar ?? "gregorian");
  const [rentalType, setRentalType] = useState<"monthly" | "prepaid">(
    shop?.rentalType ?? "monthly",
  );
  const [fields, setFields] = useState<ShopFormFields>({
    number: shop?.number ?? "",
    name: shop?.name ?? "",
    keeper: shop?.keeper ?? "",
    phone: shop?.phone ?? "",
    address: shop?.address ?? "",
    rent: shop ? String(shop.rent) : "",
    date: shop?.startDate ?? today,
    credit: shop ? String(shop.credit) : "",
    notes: shop?.notes ?? "",
    advance: shop?.prepaidRent ? String(shop.prepaidRent.amount) : "",
    advanceDate: shop?.prepaidRent?.startDate ?? today,
    ledgerDate: shop
      ? (shop.rentLedgerStartDate ?? ledgerStartDate(shop, today))
      : today,
  });
  const [occupied, setOccupied] = useState(
    shop?.occupied === false ? "Vacant" : "Occupied",
  );
  const [errors, setErrors] = useState<ShopFormErrors>({});
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    error: errors[key],
    onChangeText: (value: string) => {
      setFields((prev) => ({
        ...prev,
        [key]: value,
        ...(key === "date" &&
        (prev.ledgerDate === prev.date || (value && value > prev.ledgerDate))
          ? { ledgerDate: value }
          : {}),
      }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
  });
  const save = async () => {
    const {
      number,
      rent,
      credit,
      date,
      advance,
      advanceDate,
      ledgerDate,
      errors: nextErrors,
    } = validateShopFields(fields, {
      shopId,
      shops: activeShops,
      rentalType,
      occupied,
      today,
      calendar,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !rent)
      return notify(Object.values(nextErrors)[0] ?? "Check the shop details.");
    setViewCalendar(calendar);
    const values = {
      number,
      name: fields.name.trim(),
      keeper: fields.keeper.trim(),
      phone: fields.phone.trim(),
      address: fields.address.trim(),
      rent,
      startDate: date,
      rentCalendar: calendar,
      rentLedgerStartDate: ledgerDate,
      openingRentPeriod:
        shop?.openingRentPeriod ??
        rentalPeriod(date, today, calendar).dueDate ??
        date,
      credit,
      notes: fields.notes.trim(),
      occupied: occupied === "Occupied",
      rentalType,
      prepaidRent:
        rentalType === "prepaid" && occupied === "Occupied" && advance
          ? {
              amount: advance,
              startDate: advanceDate,
              monthlyRent: shop?.prepaidRent?.monthlyRent ?? rent,
              calendar,
              tenancyStartDate: date,
            }
          : shop?.prepaidRent,
    };
    if (editing) {
      if (!shop) return notify("This shop is no longer available.");
      const status: Shop["status"] =
        shop.paid >= rent
          ? shop.status === "Settled by Credit"
            ? "Settled by Credit"
            : "Paid"
          : shop.status === "Overdue"
            ? "Overdue"
            : shop.paid > 0
              ? "Partial"
              : "Unpaid";
      if (!(await update(shop.id, { ...values, status })))
        return notify(useLedger.getState().error!);
      notify("Shop updated.");
      if (navigation.canGoBack()) navigation.goBack();
      else go("shop-details", shop.id);
    } else {
      const id = Math.max(0, ...shops.map((s) => s.id)) + 1;
      const saved = await add({
        ...values,
        id,
        paid: 0,
        status: "Unpaid",
        image: (id - 1) % shopImages.length,
      });
      if (!saved) return notify(useLedger.getState().error!);
      notify("Shop saved.");
      go("shops");
    }
  };
  return {
    editing,
    shop,
    fields,
    field,
    occupied,
    setOccupied,
    rentalType,
    calendar,
    setCalendar,
    setRentalType,
    today,
    save,
  };
}
