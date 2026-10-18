import { desc, eq, notInArray, sql } from "drizzle-orm";
import { drizzle, type AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { validateLedger } from "../domain/ledgerValidation";
import { emptyLedger, type LedgerData } from "../types/ledger";
import type { LedgerPersistence } from "./connection";
import * as schema from "./schema";
import { migrations } from "./migrations";

export interface SqlConnection {
  execAsync(sql: string): Promise<void>;
  query: AsyncRemoteCallback;
}
const journal = sqliteTable("__drizzle_migrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hash: text("hash").notNull(),
  createdAt: integer("created_at").notNull(),
});

/** Local asynchronous Drizzle adapter. No server or network is involved. */
export class LedgerRepository implements LedgerPersistence {
  private orm;
  private pending: Promise<unknown> = Promise.resolve();
  constructor(private db: SqlConnection) {
    this.orm = drizzle((...args) => db.query(...args), { schema });
  }

  async initialize() {
    await this.db.execAsync(
      "PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
    );
    const check = await this.db.query("PRAGMA quick_check", [], "all");
    if (check.rows[0]?.[0] !== "ok")
      throw new Error("The database needs recovery. Restore a GMM backup.");
    const version =
      (await this.db.query("PRAGMA user_version", [], "all")).rows[0]?.[0] ?? 0;
    if (version > 2)
      throw new Error(
        "This database was created by a newer GMM version. Update GMM first.",
      );
    await this.db.execAsync(
      "CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at INTEGER NOT NULL)",
    );
    const applied = await this.orm.select().from(journal).all();
    if (
      applied.some(
        (m) =>
          !migrations.some(
            (known) =>
              known.folderMillis === m.createdAt && known.hash === m.hash,
          ),
      )
    )
      throw new Error(
        "Database migrations do not match this GMM version. Update GMM first.",
      );
    await this.transaction(async () => {
      for (const [index, migration] of migrations.entries()) {
        if (applied.some((m) => m.createdAt === migration.folderMillis))
          continue;
        // Adopt the pre-ORM v1 schema without recreating tables or losing records.
        if (!(version === 1 && index === 0))
          for (const statement of migration.sql)
            await this.db.execAsync(statement);
        await this.orm
          .insert(journal)
          .values({ hash: migration.hash, createdAt: migration.folderMillis })
          .run();
      }
      await this.db.execAsync("PRAGMA user_version=2");
    });
    const references = await this.db.query(
      "PRAGMA foreign_key_check",
      [],
      "all",
    );
    if (references.rows.length)
      throw new Error("The database needs recovery. Restore a GMM backup.");
    return this.read();
  }

  private async transaction(task: () => Promise<void>) {
    await this.db.execAsync("BEGIN IMMEDIATE");
    try {
      await task();
      await this.db.execAsync("COMMIT");
    } catch (error) {
      try {
        await this.db.execAsync("ROLLBACK");
      } catch {
        /* Preserve original error. */
      }
      throw error;
    }
  }

  async read(): Promise<LedgerData> {
    await this.pending;
    return this.readRows();
  }

  private async readRows(): Promise<LedgerData> {
    const metadata = await this.orm.select().from(schema.metadata).all();
    if (!metadata.length) {
      // Missing metadata is safe only for a genuinely new database. Returning an
      // empty ledger for a damaged one would let the next save erase its records.
      for (const table of [
        schema.shops,
        schema.rentReceipts,
        schema.rentSettlements,
        schema.expenses,
        schema.goods,
        schema.auditLog,
        schema.closedMonths,
        schema.recoverySnapshots,
      ]) {
        const existing = await this.orm.select().from(table).limit(1).all();
        if (existing.length)
          throw new Error("The database needs recovery. Restore a GMM backup.");
      }
      return emptyLedger();
    }
    const meta = Object.fromEntries(metadata.map((m) => [m.key, m.value]));
    const receipts = await this.orm
      .select()
      .from(schema.rentReceipts)
      .orderBy(sql`rowid`)
      .all();
    const settlements = await this.orm
      .select()
      .from(schema.rentSettlements)
      .orderBy(sql`rowid`)
      .all();
    const shops = (
      await this.orm.select().from(schema.shops).orderBy(schema.shops.id).all()
    ).map((row) => ({
      archived: row.archived,
      shop: {
        ...row.payload,
        rentReceipts: receipts
          .filter((r) => r.shopId === row.id)
          .map((r) => r.payload),
        rentTransactions: settlements
          .filter((r) => r.shopId === row.id)
          .map((r) => r.payload),
      },
    }));
    return validateLedger({
      propertyName: meta.propertyName,
      setupComplete: meta.setupComplete,
      shops: shops.filter((r) => !r.archived).map((r) => r.shop),
      archivedShops: shops.filter((r) => r.archived).map((r) => r.shop),
      expenses: (
        await this.orm
          .select()
          .from(schema.expenses)
          .orderBy(sql`rowid`)
          .all()
      ).map((r) => r.payload),
      goods: (
        await this.orm
          .select()
          .from(schema.goods)
          .orderBy(sql`rowid`)
          .all()
      ).map((r) => r.payload),
      audit: (
        await this.orm
          .select()
          .from(schema.auditLog)
          .orderBy(sql`rowid`)
          .all()
      ).map((r) => r.payload),
      closedMonths: (
        await this.orm
          .select()
          .from(schema.closedMonths)
          .orderBy(sql`rowid`)
          .all()
      ).map((r) => r.payload),
    });
  }

  save(input: LedgerData, action: string): Promise<void> {
    const data = validateLedger(input);
    const result = this.pending.then(() =>
      this.transaction(async () => {
        const previous = await this.readRows();
        if (previous.setupComplete)
          await this.orm
            .insert(schema.recoverySnapshots)
            .values({
              createdAt: new Date().toISOString(),
              action,
              payload: previous,
            })
            .run();
        // Foreign keys stay enabled throughout every atomic commit.
        for (const table of [
          schema.rentReceipts,
          schema.rentSettlements,
          schema.expenses,
          schema.goods,
          schema.shops,
          schema.auditLog,
          schema.closedMonths,
          schema.metadata,
        ])
          await this.orm.delete(table).run();
        for (const key of ["propertyName", "setupComplete"] as const)
          await this.orm
            .insert(schema.metadata)
            .values({ key, value: data[key] })
            .run();
        const shops = [
          ...data.shops.map((shop) => ({ shop, archived: false })),
          ...data.archivedShops.map((shop) => ({ shop, archived: true })),
        ];
        await writeChunks(
          shops.map(({ shop, archived }) => {
            const { rentReceipts, rentTransactions, ...payload } = shop;
            return {
              id: shop.id,
              number: shop.number.trim(),
              archived,
              payload,
            };
          }),
          (rows) => this.orm.insert(schema.shops).values(rows).run(),
        );
        await writeChunks(
          shops.flatMap(({ shop }) =>
            (shop.rentReceipts ?? []).map((r) => ({
              id: r.id,
              shopId: shop.id,
              date: r.date,
              amount: r.amount,
              payload: r,
            })),
          ),
          (rows) => this.orm.insert(schema.rentReceipts).values(rows).run(),
        );
        await writeChunks(
          shops.flatMap(({ shop }) =>
            (shop.rentTransactions ?? []).map((r) => ({
              id: r.id,
              shopId: shop.id,
              date: r.date,
              amount: r.amount,
              payload: r,
            })),
          ),
          (rows) => this.orm.insert(schema.rentSettlements).values(rows).run(),
        );
        await writeChunks(
          data.expenses.map((e) => ({
            id: e.id!,
            shopId: e.shopId,
            date: e.date!,
            amount: e.amount,
            payload: e,
          })),
          (rows) => this.orm.insert(schema.expenses).values(rows).run(),
        );
        await writeChunks(
          data.goods.map((g) => ({ id: g.id, shopId: g.shopId, payload: g })),
          (rows) => this.orm.insert(schema.goods).values(rows).run(),
        );
        await writeChunks(
          data.audit.map((a) => ({ id: a.id, payload: a })),
          (rows) => this.orm.insert(schema.auditLog).values(rows).run(),
        );
        await writeChunks(
          data.closedMonths.map((m) => ({
            id: `${m.calendar}:${m.start}`,
            payload: m,
          })),
          (rows) => this.orm.insert(schema.closedMonths).values(rows).run(),
        );
        const keep = this.orm
          .select({ id: schema.recoverySnapshots.id })
          .from(schema.recoverySnapshots)
          .orderBy(desc(schema.recoverySnapshots.id))
          .limit(20);
        await this.orm
          .delete(schema.recoverySnapshots)
          .where(notInArray(schema.recoverySnapshots.id, keep))
          .run();
      }),
    );
    this.pending = result.catch(() => {});
    return result;
  }
  async recoveries() {
    await this.pending;
    return this.orm
      .select({
        id: schema.recoverySnapshots.id,
        createdAt: schema.recoverySnapshots.createdAt,
        action: schema.recoverySnapshots.action,
      })
      .from(schema.recoverySnapshots)
      .orderBy(desc(schema.recoverySnapshots.id))
      .all();
  }
  async recovery(id: number) {
    await this.pending;
    const row = await this.orm
      .select()
      .from(schema.recoverySnapshots)
      .where(eq(schema.recoverySnapshots.id, id))
      .get();
    if (!row) throw new Error("Recovery copy not found.");
    return validateLedger(row.payload);
  }
}

async function writeChunks<T>(
  rows: T[],
  write: (batch: T[]) => Promise<unknown>,
) {
  // At most 500 bound parameters per statement, including on older SQLite builds.
  for (let index = 0; index < rows.length; index += 100)
    await write(rows.slice(index, index + 100));
}
