const { DatabaseSync } = process.getBuiltinModule(
  "node:sqlite",
) as typeof import("node:sqlite");
import {
  LedgerRepository,
  type SqlConnection,
} from "../../src/storage/ledgerRepository";
import { connectLedger } from "../../src/storage/connection";
import { useLedger } from "../../src/store/ledgerStore";

export async function testRepository(filename = ":memory:") {
  const db = new DatabaseSync(filename);
  const connection: SqlConnection = {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    query: async (sql, params, method) => {
      const statement = db.prepare(sql);
      if (method === "run") {
        statement.run(...params);
        return { rows: [] };
      }
      statement.setReturnArrays(true);
      const rows = statement.all(...params) as unknown as unknown[][];
      return { rows: method === "get" ? rows[0] : rows };
    },
  };
  const repository = new LedgerRepository(connection);
  await repository.initialize();
  return { db, connection, repository };
}
export async function connectTestLedger() {
  const { repository } = await testRepository();
  connectLedger(repository);
  useLedger.getState().hydrate(await repository.read());
  return repository;
}
