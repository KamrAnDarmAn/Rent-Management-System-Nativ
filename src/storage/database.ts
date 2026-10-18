import AsyncStorage from "@react-native-async-storage/async-storage";
import { openDatabaseAsync } from "expo-sqlite";
import type { LedgerData } from "../types/ledger";
import { LedgerRepository } from "./ledgerRepository";
import { connectLedger } from "./connection";

const DATABASE_KEY = "gmm-active-database-v1";
let opening: Promise<LedgerRepository> | undefined;
async function openRepository(filename: string) {
  const db = await openDatabaseAsync(filename);
  const candidate = new LedgerRepository({
    execAsync: (sql) => db.execAsync(sql),
    query: async (sql, params, method) => {
      const statement = await db.prepareAsync(sql);
      try {
        if (method === "run") {
          await statement.executeAsync(params);
          return { rows: [] };
        }
        const result = await statement.executeForRawResultAsync(params);
        const rows = await result.getAllAsync();
        return { rows: method === "get" ? rows[0] : rows };
      } finally {
        await statement.finalizeAsync();
      }
    },
  });
  try {
    await candidate.initialize();
    return candidate;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}
export async function openLedger() {
  if (!opening)
    opening = (async () => {
      const filename =
        (await AsyncStorage.getItem(DATABASE_KEY)) ?? "gmm-ledger.db";
      if (!/^gmm-[\w-]+\.db$/.test(filename))
        throw new Error("Invalid database location.");
      const repository = await openRepository(filename);
      connectLedger(repository);
      return repository;
    })().catch((error) => {
      opening = undefined;
      throw error;
    });
  return (await opening).read();
}

/** A failed database is retained untouched. Activate a verified replacement only
 * after the imported ledger has committed successfully in a separate file. */
export async function recoverDatabase(data: LedgerData) {
  const filename = `gmm-recovery-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
  const repository = await openRepository(filename);
  await repository.save(data, "Restore backup");
  const verified = await repository.read();
  await AsyncStorage.setItem(DATABASE_KEY, filename);
  connectLedger(repository);
  opening = Promise.resolve(repository);
  return verified;
}
