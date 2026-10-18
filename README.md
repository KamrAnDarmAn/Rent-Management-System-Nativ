# GMM

Offline rent and expense management for a single owner, built with Expo SDK 57, React Native, TypeScript, React Navigation, NativeWind and Zustand. English and Pashto include RTL layouts. The app uses `assets/images/logos/logo.png` for its branding.

## Run locally

Use Node 24 and Yarn 4.18.0. Dependency versions are recorded in `yarn.lock`.

```sh
yarn install --immutable
yarn start
```

For native runtime testing, use an Android/iOS development environment with this SDK, or an EAS preview build. First launch opens language/property setup, with an option to restore a backup. No sample shops or payments are created. Returning launches open the saved ledger.

For the browser verification build:

```sh
yarn export:web --max-workers 2
yarn serve:web
```

Open `http://localhost:8090`. The included server sends the cross-origin isolation headers required by SQLite's web worker. Expo's web SQLite support is experimental; Android and iOS are the intended production platforms. Browser data belongs to that browser profile and origin. Clearing site storage removes it.

## SQLite and Drizzle ORM

`src/storage/schema.ts` is the typed Drizzle schema. `src/storage/ledgerRepository.ts` contains the database queries and transactional writes. The local adapter in `src/storage/database.ts` connects Drizzle's asynchronous SQLite query interface directly to **expo-sqlite**. It never calls a server. Async queries also avoid blocking the UI and bypass an SDK 57 web synchronous bridge issue affecting larger query results.

Database tables store shops, rent receipts, rent settlements, expenses, goods, audit entries, closed months and recovery snapshots. Indexed columns and foreign keys enforce relational identity. Typed JSON columns retain agreement details and calendar settlement maps. Keep indexed fields and their typed payload consistent when adding repository methods.

To change the schema:

1. Edit `src/storage/schema.ts`.
2. Run `yarn db:generate`.
3. Review and commit the generated SQL, snapshots, journal in `drizzle/`, and `src/storage/migrations.ts` together.
4. Test an upgrade from an existing database and a fresh installation.

`yarn db:check` checks that bundled migrations match the SQL. The bundle lets Metro and Node tests execute the same migration statements without a runtime SQL file loader. Applied migration hashes are tracked in `__drizzle_migrations`; never edit an applied migration. Newer or mismatched databases fail safely instead of being reset. The earlier pre-ORM schema is adopted without dropping its tables. If startup fails, the recovery screen can validate a backup and activate a separately committed database; the original file is retained. The active filename pointer is a nonsecret device preference.

The initial native database is `gmm-ledger.db` in Expo SQLite's application database directory. SQLite enables foreign keys, WAL, full synchronous durability, and an integrity check at startup. Mutations are serialized and balances are derived after earlier writes commit. Zustand publishes changes and forms show success only after a successful transaction. A failed write rolls back; saved state is retained. Financial records do not use AsyncStorage. AsyncStorage holds nonsecret preferences only.

## Accounting behavior

- Whole AFN amounts use safe integers; summaries use exact integer totals.
- Gregorian rent follows the tenancy anniversary with short-month clamping. Afghan Shamsi rent falls on the first day of each month, with the first partial month prorated by actual days.
- Any positive rent payment settles the oldest unpaid rent first, then the current period. Excess stays as a rent advance. Later allocation does not count as new cash income.
- Backdated receipts retain their actual receipt dates. Reports distinguish cash received from rent settled and include late settlement of previous periods.
- Construction credit is separate and applied manually within available credit and unpaid rent. The original prepaid agreement remains separate from new cash advances.
- Goods can offset rent, remain payable, or be paid in cash. Later cash/offset settlements reduce the payable without counting the original acquisition twice.
- Rate changes retain the original rate and effective-date history; a change or departure during a month is prorated by days. Use Tenancy Lifecycle for departure and rate changes. Financial history protects the tenancy's original calendar, tracking start and advance agreement from accidental replacement.
- A receipt reversal retains the receipt and reason, and recalculates balances. It is a correction, not a cash refund.
- Closing a completed calendar month blocks records dated in that interval. Later payments may still settle its old debt. Reopen it to correct an earlier dated record.
- Delete/Archive removes a shop from active lists while retaining its financial history and freezing future rent accrual at the last issued period. Data Management provides archived records and restore. No destructive financial-history deletion is exposed.

## Backup and recovery

Settings → Backup & Restore exports a complete versioned JSON backup with ledger data and language/theme/calendar preferences. Native exports are written and read back for verification before opening the share sheet. Browser exports download a real file.

- An optional password of at least 10 characters encrypts the backup with AES-256-GCM and PBKDF2-SHA256 (210,000 iterations), with secure random salt/nonce. Passwords are never stored and cannot be recovered.
- Without a password, backups contain readable private financial data. A checksum detects accidental corruption; it is not an authenticity guarantee.
- Imports validate file size, version, checksums/authentication, amounts, dates, identities and references before showing a preview. Explicit replacement confirmation is required. There is no automatic merge.
- Restore is transactional and keeps a recovery copy of the previous ledger. The latest 20 previous ledger states are available on the device. They do **not** replace an external backup.
- Notifications are disabled after restoring settings until permission is granted on the new device.
- Device Transfer explains copying a backup to another device; it does not simulate nearby discovery or cloud sync.

Save backups outside the app/phone regularly and verify a restore on a second device. Uninstalling the app, losing the phone, or clearing browser storage can remove local records and on-device recovery copies. SQLite is protected by the OS app sandbox, not an app-specific encryption password. Use the device lock for local access protection. No account, cloud storage, remote analytics or server is required.

## Reminders

Optional local notifications require device permission. Scheduling uses 9 AM Afghanistan time and the chosen lead time, skips rent covered by advance, and refreshes when the app opens/resumes or records change. The next 50 reminders are scheduled to stay within platform limits. Keep opening GMM regularly. OS settings, power management and notification permissions can delay/prevent delivery; reminders never change balances. Test reminders on a physical device with the app in the background.

## Structure

- `src/components/`: reusable forms, menus, charts, layouts, branding and theme.
- `src/screens/`: feature-specific screens and smaller sections/hooks.
- `src/domain/`: deterministic rent allocation, calendar rules, reports, validation and backup encoding.
- `src/storage/`: ORM schema, migrations, SQLite adapter and file import/export.
- `src/store/`: durable ledger actions and nonsecret preferences.
- `src/bootstrap/`, `src/navigation/`: startup/setup gating and navigation.
- `src/i18n/`: English display keys and plain Pashto translations.
- `tests/`: financial/storage tests and browser interaction tests. Samples are imported through an explicit test-only backup fixture; production stays empty.

## Verification

```sh
yarn typecheck
yarn check:architecture
yarn check:translations
yarn db:check
yarn format:check
yarn expo install --check
```

Finish the web export and start `yarn serve:web` before running the full suite:

```sh
PREVIEW_URL=http://127.0.0.1:8090 yarn test
```

Browser tests use `/usr/bin/google-chrome`; set `CHROME_PATH` for another installed Chromium executable. Tests cover onboarding, reload/offline persistence, partial/advance payments, Shamsi proration, report reconciliation, transactional rollback, backups, reversals, month locks, language/RTL, dropdown positioning and shop management. Node's SQLite test API is experimental; this does not affect the native database driver.

Validate native JavaScript/assets without launching a device:

```sh
yarn expo export --platform android --platform ios --output-dir dist-native --max-workers 2
```

The GitHub Actions workflow runs these checks against a production web export on pushes and pull requests.

These checks do not produce a signed app or prove native device behavior. Before distributing a release, verify fresh install, upgrade with existing data, process termination/relaunch during a save, backup share/import and encrypted restore, notification permission/delivery, keyboard/safe areas, Android back navigation, and Pashto RTL on physical Android/iOS devices. Confirm release identifiers `com.gmm.marketmanager`, signing credentials, store metadata and privacy declarations for the owner's distribution account. `eas.json` provides an internal Android APK preview profile and a production profile; no build or store publication is performed automatically.
