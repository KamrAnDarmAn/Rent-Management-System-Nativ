import type { LedgerData } from "../types/ledger";

export interface LedgerPersistence {
  save(data: LedgerData, action: string): Promise<void>;
  recoveries(): Promise<{ id: number; createdAt: string; action: string }[]>;
  recovery(id: number): Promise<LedgerData>;
}
let persistence: LedgerPersistence | undefined;
export function connectLedger(value: LedgerPersistence) {
  persistence = value;
}
export function persistLedger(data: LedgerData, action: string) {
  if (!persistence) throw new Error("Storage is not ready. Please reopen GMM.");
  return persistence.save(data, action);
}
export function ledgerPersistence() {
  if (!persistence) throw new Error("Storage is not ready. Please reopen GMM.");
  return persistence;
}
