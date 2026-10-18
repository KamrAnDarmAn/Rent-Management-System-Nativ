import { useLedger } from "../store/ledgerStore";

export function useShop(id = 1) {
  return useLedger((s) =>
    [...s.shops, ...s.archivedShops].find((shop) => shop.id === id)!,
  );
}
