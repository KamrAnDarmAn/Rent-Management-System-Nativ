import { expect, test } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { testRepository, connectTestLedger } from "./support/database";
import { useLedger, ledgerData } from "../src/store/ledgerStore";
import {
  backupPayload,
  encodeBackup,
  decodeBackup,
} from "../src/domain/backup";
import { emptyLedger } from "../src/types/ledger";
import { initialShops } from "../src/data/shops";
import { rentAccount } from "../src/domain/rentAccount";
import { rentCollections } from "../src/domain/rentCollections";
const preferences = {
  language: "en",
  theme: "system",
  rentViewCalendar: "gregorian",
  reminders: false,
  reminderDay: 5,
} as const;
const fixture = () => ({
  ...initialShops[0],
  id: 77,
  number: "77",
  startDate: "2026-10-01",
  rentLedgerStartDate: "2026-10-01",
  openingRentPeriod: "2026-10-01",
  rentCalendar: "gregorian" as const,
  rent: 1000,
  paid: 0,
  credit: 500,
  status: "Unpaid" as const,
  occupied: true,
  rentalType: "monthly" as const,
  rentPayments: {},
  prepaidRent: undefined,
});
test("SQLite migrations are repeatable; a reopened file retains setup, receipts, expenses and archive history", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "gmm-")),
    file = path.join(dir, "gmm.db");
  try {
    const first = await testRepository(file);
    const data = {
      ...emptyLedger(),
      propertyName: "My Market",
      setupComplete: true,
      shops: [
        {
          ...fixture(),
          rentReceipts: [
            {
              id: "one",
              date: "2026-10-15",
              amount: 300,
              method: "Cash" as const,
            },
          ],
        },
      ],
    };
    await first.repository.save(data, "Collect rent");
    first.db.close();
    const second = await testRepository(file);
    expect(await second.repository.read()).toEqual({
      ...data,
      shops: [{ ...data.shops[0], rentTransactions: [] }],
    });
    expect(
      rentAccount((await second.repository.read()).shops[0], "2026-10-17")
        .outstanding,
    ).toBe(700);
    await second.repository.initialize();
    second.db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("an interrupted multi-table write rolls back and does not publish unsaved Zustand data", async () => {
  const repository = await connectTestLedger();
  expect(await useLedger.getState().completeSetup("GMM Market")).toBe(true);
  expect(await useLedger.getState().addShop(fixture())).toBe(true);
  const before = await repository.read();
  // Disk write failure after several rows have been written.
  const db = (
    repository as unknown as {
      db: import("../src/storage/ledgerRepository").SqlConnection;
    }
  ).db;
  const query = db.query;
  let writes = 0;
  db.query = async (...args) => {
    if (args[2] === "run" && ++writes === 4) throw new Error("disk full");
    return query(...args);
  };
  expect(
    (
      await useLedger.getState().collectRent(77, {
        id: "fail",
        date: "2026-10-16",
        amount: 200,
        method: "Cash",
      })
    ).ok,
  ).toBe(false);
  db.query = query;
  expect(await repository.read()).toEqual(before);
  expect(useLedger.getState().shops[0].rentReceipts ?? []).toEqual([]);
});
test("backup round trips all data, detects corruption and rejects wrong passwords and invalid references", async () => {
  const payload = backupPayload(
    {
      ...emptyLedger(),
      propertyName: "بازار",
      setupComplete: true,
      shops: [fixture()],
    },
    preferences,
  );
  const plain = await encodeBackup(payload);
  expect(await decodeBackup(plain)).toEqual(
    JSON.parse(JSON.stringify(payload)),
  );
  const extended = {
    ...payload,
    data: { ...payload.data, hydrate: "replace action", error: "fake error" },
    preferences: {
      ...payload.preferences,
      setTheme: "replace action",
      setLanguage: "replace action",
    },
  };
  const normalized = await decodeBackup(await encodeBackup(extended));
  expect(normalized.data).not.toHaveProperty("hydrate");
  expect(normalized.data).not.toHaveProperty("error");
  expect(normalized.preferences).not.toHaveProperty("setTheme");
  expect(normalized.preferences).not.toHaveProperty("setLanguage");
  const corrupted = JSON.parse(plain);
  corrupted.payload += "x";
  await expect(decodeBackup(JSON.stringify(corrupted))).rejects.toThrow();
  const encrypted = await encodeBackup(
    payload,
    "a long private password",
    randomBytes,
  );
  expect(encrypted).not.toContain("بازار");
  expect(await decodeBackup(encrypted, "a long private password")).toEqual(
    JSON.parse(JSON.stringify(payload)),
  );
  await expect(decodeBackup(encrypted, "wrong password")).rejects.toThrow(
    "incorrect",
  );
  const damaged = JSON.parse(encrypted);
  damaged.payload = damaged.payload.slice(0, -2) + "ff";
  await expect(
    decodeBackup(JSON.stringify(damaged), "a long private password"),
  ).rejects.toThrow();
  const invalid = {
    ...payload,
    data: {
      ...payload.data,
      expenses: [
        {
          id: "bad",
          shopId: 999,
          date: "2026-10-16",
          amount: 100,
          description: "Repair",
          category: "Repairs",
          method: "Cash",
          type: "Property Expense",
        },
      ],
    },
  };
  await expect(encodeBackup(invalid as typeof payload)).rejects.toThrow();
});
test("restore keeps a validated recovery copy and rejects malformed import without changing live data", async () => {
  const repository = await connectTestLedger(),
    store = useLedger.getState();
  await store.completeSetup("Original");
  await store.addShop(fixture());
  const before = await repository.read();
  expect(
    await store.restoreData({
      ...emptyLedger(),
      propertyName: "Restored",
      setupComplete: true,
    }),
  ).toBe(true);
  const recovery = (await repository.recoveries())[0];
  expect(await repository.recovery(recovery.id)).toEqual(before);
  expect(
    await store.restoreData({ ...emptyLedger(), shops: [{ id: 1 }] } as never),
  ).toBe(false);
  expect((await repository.read()).propertyName).toBe("Restored");
});
test("goods offsets and cash settlements keep rent, cash flow and payable balances separate", async () => {
  await connectTestLedger();
  const store = useLedger.getState();
  await store.completeSetup("Market");
  await store.addShop(fixture());
  expect(
    await store.addGoods({
      id: "g1",
      shopId: 77,
      date: "2026-10-16",
      item: "Rice",
      unit: "Kg",
      quantity: 2,
      unitPrice: 100,
      amount: 200,
      mode: "offset",
      notes: "",
      settlements: [],
    }),
  ).toBe(true);
  expect(
    rentAccount(useLedger.getState().shops[0], "2026-10-17").outstanding,
  ).toBe(800);
  expect(useLedger.getState().shops[0].credit).toBe(500);
  expect(
    await store.addGoods({
      id: "g2",
      shopId: 77,
      date: "2026-10-16",
      item: "Tea",
      unit: "Box",
      quantity: 1,
      unitPrice: 400,
      amount: 400,
      mode: "owed",
      notes: "",
      settlements: [],
    }),
  ).toBe(true);
  expect(await store.settleGoods("g2", 100, "Cash", "2026-10-17")).toBe(true);
  expect(await store.settleGoods("g2", 301, "Cash", "2026-10-17")).toBe(false);
  expect(
    await store.settleGoods("g2", 300, "Offset Against Rent", "2026-10-17"),
  ).toBe(true);
  expect(
    rentAccount(useLedger.getState().shops[0], "2026-10-17").outstanding,
  ).toBe(500);
});
test("receipt reversals retain audit records, restore balances and exclude reversed cash from income", async () => {
  await connectTestLedger();
  const store = useLedger.getState();
  await store.completeSetup("Market");
  await store.addShop(fixture());
  await store.collectRent(77, {
    id: "receipt",
    date: "2026-10-16",
    amount: 300,
    method: "Cash",
  });
  expect(await store.reverseReceipt(77, "receipt", "Mistake")).toBe(true);
  const shop = useLedger.getState().shops[0];
  expect(shop.rentReceipts![0].reversalReason).toBe("Mistake");
  expect(rentAccount(shop, "2026-10-17").outstanding).toBe(1000);
  expect(
    rentCollections([shop], "2026-10-01", "2026-11-01", "2026-10-17").total,
  ).toBe(0n);
  expect(await store.reverseReceipt(77, "receipt", "Again")).toBe(false);
});
test("closed months block backdated writes while later payments can settle old debt", async () => {
  await connectTestLedger();
  const store = useLedger.getState();
  await store.completeSetup("Market");
  await store.addShop({
    ...fixture(),
    startDate: "2026-09-01",
    rentLedgerStartDate: "2026-09-01",
  });
  expect(await store.closeMonth("gregorian", "2026-09-01", "2026-10-01")).toBe(
    true,
  );
  expect(
    (
      await store.collectRent(77, {
        id: "blocked",
        date: "2026-09-15",
        amount: 100,
        method: "Cash",
      })
    ).ok,
  ).toBe(false);
  expect(
    (
      await store.collectRent(77, {
        id: "later",
        date: "2026-10-17",
        amount: 100,
        method: "Cash",
      })
    ).ok,
  ).toBe(true);
  expect(
    rentAccount(useLedger.getState().shops[0], "2026-10-17").periods[0].paid,
  ).toBe(100);
  expect(
    await store.addExpense({
      amount: 100,
      description: "Test",
      category: "Other",
      date: "2026-09-20",
    }),
  ).toBe(false);
});
test("rent changes and departure prorate the affected period without rewriting earlier months", () => {
  const shop = {
    ...fixture(),
    startDate: "2026-08-01",
    rentLedgerStartDate: "2026-08-01",
    initialRent: 1000,
    rent: 2000,
    rentRates: [{ effective: "2026-10-16", amount: 2000 }],
    tenancyEndDate: "2026-10-20",
    occupied: false,
  };
  const account = rentAccount(shop, "2026-12-01");
  expect(account.periods.map((r) => r.charge)).toEqual([1000, 1000, 806]);
});

test("concurrent receipts are serialized against committed balances and duplicate receipts remain idempotent", async () => {
  const repository = await connectTestLedger(),
    store = useLedger.getState();
  await store.completeSetup("Concurrent Market");
  await store.addShop(fixture());
  const receipt = {
    id: "shared",
    date: "2026-10-16",
    amount: 300,
    method: "Cash" as const,
  };
  const results = await Promise.all([
    store.collectRent(77, receipt),
    store.collectRent(77, receipt),
    store.collectRent(77, { ...receipt, id: "second", amount: 450 }),
  ]);
  expect(results.every((r) => r.ok)).toBe(true);
  expect(results.filter((r) => r.ok && r.duplicate)).toHaveLength(1);
  const data = await repository.read();
  expect(data.shops[0].rentReceipts).toHaveLength(2);
  expect(rentAccount(data.shops[0], "2026-10-17").outstanding).toBe(250);
  expect(data.audit.filter((a) => a.action === "Collect rent")).toHaveLength(2);
});

test("archiving preserves receipts, stops future accrual and allows the shop number to be reused", async () => {
  const repository = await connectTestLedger(),
    store = useLedger.getState();
  await store.completeSetup("Market");
  await store.addShop(fixture());
  await store.collectRent(77, {
    id: "archived-receipt",
    date: "2026-10-16",
    amount: 300,
    method: "Cash",
  });
  expect(await store.archiveShop(77)).toBe(true);
  const archived = useLedger.getState().archivedShops[0];
  expect(rentAccount(archived, "2027-10-17").outstanding).toBe(
    rentAccount(archived).outstanding,
  );
  expect(await store.addShop({ ...fixture(), id: 78 })).toBe(true);
  expect(await store.restoreShop(77)).toBe(false);
  const data = await repository.read();
  expect(data.shops[0].id).toBe(78);
  expect(data.archivedShops[0].rentReceipts![0].amount).toBe(300);
});

test("the bounded recovery history retains the latest 20 committed prior states", async () => {
  const repository = await connectTestLedger(),
    store = useLedger.getState();
  await store.completeSetup("Original");
  for (let i = 0; i < 24; i++)
    expect(await store.setPropertyName(`Market ${i}`)).toBe(true);
  const copies = await repository.recoveries();
  expect(copies).toHaveLength(20);
  expect((await repository.recovery(copies[0].id)).propertyName).toBe(
    "Market 22",
  );
  expect((await repository.read()).propertyName).toBe("Market 23");
});

test("a ledger with years of receipts is saved in bounded batches and round-trips without losing rows", async () => {
  const { repository, db } = await testRepository();
  const shops = Array.from({ length: 30 }, (_, i) => ({
    ...fixture(),
    id: i + 1,
    number: String(i + 1),
    rentReceipts: Array.from({ length: 120 }, (_, j) => ({
      id: `${i}:${j}`,
      date: "2026-10-16",
      amount: 10,
      method: "Cash" as const,
    })),
  }));
  const data = {
    ...emptyLedger(),
    propertyName: "Thirty Shops",
    setupComplete: true,
    shops,
  };
  await repository.save(data, "Import years of history");
  const saved = await repository.read();
  expect(saved.shops).toHaveLength(30);
  expect(saved.shops.reduce((n, s) => n + s.rentReceipts!.length, 0)).toBe(
    3600,
  );
  expect(rentAccount(saved.shops[29], "2026-10-17").advanceBalance).toBe(200);
  db.close();
});

test("upgrading the pre-ORM v1 database preserves the existing ledger and records a migration baseline", async () => {
  const { repository, db } = await testRepository();
  const data = {
    ...emptyLedger(),
    propertyName: "Before ORM",
    setupComplete: true,
    shops: [fixture()],
  };
  await repository.save(data, "Before upgrade");
  // v1 used the same persisted table format, with PRAGMA version tracking only.
  db.exec("DROP TABLE __drizzle_migrations; PRAGMA user_version=1");
  const migrated = await repository.initialize();
  expect(migrated.propertyName).toBe("Before ORM");
  expect(migrated.shops[0].credit).toBe(500);
  expect(
    db.prepare("SELECT count(*) AS count FROM __drizzle_migrations").get()
      ?.count,
  ).toBe(1);
  db.exec("PRAGMA user_version=999");
  await expect(repository.initialize()).rejects.toThrow("newer GMM");
  expect(db.prepare("SELECT count(*) AS count FROM shops").get()?.count).toBe(
    1,
  );
  db.close();
});

test("prepaid summaries agree with the ledger after rate changes and construction offsets", async () => {
  const { prepaidAccountSummary } =
    await import("../src/domain/prepaidAccount");
  const shop = {
    ...fixture(),
    startDate: "2026-08-01",
    rentLedgerStartDate: "2026-08-01",
    rentalType: "prepaid" as const,
    prepaidRent: { amount: 4000, startDate: "2026-08-01", monthlyRent: 1000 },
    rent: 2000,
    initialRent: 1000,
    rentRates: [{ effective: "2026-10-01", amount: 2000 }],
    prepaidPayments: { "2026-09-01": 500 },
  };
  const summary = prepaidAccountSummary(shop, "2026-10-17")!;
  expect(summary.applied).toBe(3500);
  expect(summary.remaining).toBe(500);
  expect(summary.applied).toBe(rentAccount(shop, "2026-10-17").prepaidApplied);
  expect(summary.lastCoveredDate).toBe("2026-11-01");
  expect(summary.partialAmount).toBe(500);
  expect(summary.firstCashDueDate).toBe("2026-11-01");
});

test("goods reporting separates construction credit, rent deductions, cash spending and unpaid goods", async () => {
  const { buildRentReport } = await import("../src/domain/reports");
  await connectTestLedger();
  const store = useLedger.getState();
  await store.completeSetup("Market");
  await store.addShop(fixture());
  await store.addGoods({
    id: "offset",
    shopId: 77,
    date: "2026-10-16",
    item: "Rice",
    unit: "Kg",
    quantity: 2,
    unitPrice: 100,
    amount: 200,
    mode: "offset",
    notes: "",
    settlements: [],
  });
  await store.addGoods({
    id: "owed",
    shopId: 77,
    date: "2026-10-16",
    item: "Tea",
    unit: "Box",
    quantity: 1,
    unitPrice: 400,
    amount: 400,
    mode: "owed",
    notes: "",
    settlements: [],
  });
  await store.settleGoods("owed", 100, "Cash", "2026-10-17");
  await store.settleGoods("owed", 200, "Offset Against Rent", "2026-10-17");
  const state = useLedger.getState();
  const report = buildRentReport(state.shops, state.expenses, {
    calendar: "gregorian",
    mode: "monthly",
    date: "2026-10-17",
    today: "2026-10-17",
  });
  expect(report.goodsTaken).toBe(600n);
  expect(report.goodsOffsets).toBe(400n);
  expect(report.credits).toBe(0n);
  expect(report.spent).toBe(100n);
  expect(report.expenses).toBe(600n);
  expect(report.unpaidExpenses).toBe(100n);
  expect(report.outstanding).toBe(600n);
  expect(report.net).toBe(-100n);
});
