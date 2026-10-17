# Market Management System — Implementation Plan

Updated: 2026-10-17 (Asia/Kabul)

Status: Planning reference. Application features are not implemented by creating this document.

This document records the product interview and provides an ordered implementation checklist. Confirmed decisions take precedence over the original prompt where the interview changed a requirement. Proposed defaults are explicitly labeled. Complete and record feasibility checks before implementing features that depend on their results.

## 1. Product and success criteria

Build a private, production-quality Android and iPhone application for one landlord managing approximately 20–30 shops in a small town. Make financial records reliable, understandable, and usable without internet, with a premium but simple English/Pashto interface.

Priorities, in the owner's stated order:

1. Reliability and protection against data loss.
2. Clear balances and understandable transaction history.
3. Beauty and polish.
4. Offline-first operation.
5. Complete bilingual support.

Success means the owner can set up existing tenancies and balances, collect and allocate rent, account for construction advances and goods taken, explain either party's balance, produce reports, recover from a backup, and exchange compatible records between Android and iPhone without corrupting financial history.

Reliability takes precedence over a fixed delivery date. There is no agreed fixed deadline or spending cap. No implementation stage is considered complete merely because its screens render.

## 2. Confirmed scope and constraints

### Users, devices, and distribution

- One landlord; no staff roles, tenant accounts, online identity, or subscription billing in v1.
- Android and iPhone are both required. Both physical test phones are available; their models and OS versions remain unknown.
- Both phones may be edited independently while offline. This supersedes the earlier one-active-device decision.
- The owner coordinates entry so each real-world payment is entered on only one phone. Warn about similar entries; do not silently delete transactions that merely look similar.
- Private use permanently; no public store launch is planned.
- No paid Apple developer membership is currently available. Sustainable private iPhone installation remains a delivery blocker to resolve.
- Use the phone's lock. No separate app PIN or biometric lock in v1.

### Included

- Collect, Spend, Shops/Shopkeepers, Reports, and Settings tabs.
- Shopkeeper profiles, physical shops, vacancy/occupancy, tenancies, rent schedules, and notes.
- Partial payments, multiple payments per month, arrears, previous-month payments, and cash advances.
- Construction credits, goods owed by the owner, cash settlements, and explicit offsets against rent.
- Opening balances, tenant departures, final settlements, reversals, archival, and month closing/reopening.
- Monthly/yearly reports, charts, shop performance, outstanding balances, and CSV export.
- Password-encrypted file backup, compatible-history import, recovery copies, and backup reminders.
- One-way nearby send/import over the same Wi-Fi or hotspot, without internet. A separate return transfer updates the sender if needed.
- English/Pashto, strict instant language and layout-direction switching, and Light/Dark/System themes.

### Deferred or excluded

- Cloud accounts, automatic cloud backup, automatic internet synchronization, and a hosted backend.
- Staff permissions, tenant access, monetization, and public store submission.
- Refundable security deposits, automatic late fees, and simultaneous shared occupancy of a shop.
- Shareable receipts, rent notifications, bulk collection, and elaborate illustrative onboarding.
- Transfers that require neither a shared network nor a hotspot.
- Automatic conflict resolution, last-write-wins financial merges, and silent duplicate-payment removal.
- Web as a supported ledger platform; the mobile apps are the delivery target.

## 3. Technology baseline and feasibility gates

### Confirmed choices

- Expo SDK 57; the inspected starter declares `expo ~57.0.29`.
- React Native `0.86.3`, React `19.2.3`, and TypeScript (starter declares `~6.0.3`). These are observed manifest versions, not proof of a validated installation.
- NativeWind 4.2.7 with custom reusable components and a coherent design system.
- Direct React Navigation: bottom tabs and stacks. Replace the starter's Expo Router entry, routes, and related configuration deliberately.
- expo-sqlite as the durable local database, with versioned migrations.
- Zustand for transient/UI state; SQLite remains the durable source of truth.
- i18next and react-i18next for localization.
- react-hook-form and Zod for forms and validation.
- Secure local storage for small sensitive settings where appropriate; do not treat it as a replacement for ledger storage or backup encryption.

### Proposed defaults, not separately confirmed

- Dayjs for dates, Expo vector icons, and react-native-gifted-charts for charts.
- Tailwind CSS 3 as required by NativeWind 4; do not silently migrate to the NativeWind 5 release candidate.
- Organize source into navigation, features, shared UI/theme, localization, database/repositories, domain services, reports, backup, and transfer modules.
- Financial logic is framework-independent TypeScript. Screens invoke domain services rather than directly editing balances.
- Use an Expo development build when native dependencies require it; Expo Go is not the production acceptance environment.
- Use the existing package-manager convention and produce one reproducible dependency lockfile.

### Mandatory feasibility work

- [ ] Recheck official release/compatibility documentation and pin exact versions of all selected libraries. Do not upgrade to SDK 58 or swap a required tool without recording the decision.
- [ ] Validate NativeWind, navigation, Reanimated/Worklets, forms, charts, and SQLite together on SDK 57.
- [ ] Prove instant English/Pashto switching on Android and iPhone, including navigation, back gestures, dialogs, text input, and native controls. React Native's global RTL switch alone cannot satisfy this requirement because it applies on the next app start.
- [ ] Select and prove a local-network transport that supports Android-to-iPhone transfers, pairing, encrypted/authenticated transport, permission handling, background/interruption behavior, and retry. Record the exact library and build requirements before implementation.
- [ ] Resolve a sustainable private iPhone installation/signing route and its maintenance obligations. Do not assume TestFlight or an unmanaged development installation is permanent distribution.
- [ ] Select maintained backup cryptography and document its format, password derivation, authenticated encryption, and platform compatibility. Do not invent cryptographic primitives.
- [ ] Record actual device/OS targets, build/signing access, and any unavoidable costs.

Prior interview references; revalidate before installing dependencies:

- [Expo SDK reference](https://docs.expo.dev/versions/latest/)
- [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)
- [React Native I18nManager](https://reactnative.dev/docs/i18nmanager)
- [Expo localization](https://docs.expo.dev/guides/localization/)

## 4. Financial behavior

### Ownership, occupancy, and balances

- A shopkeeper may rent multiple shops. Each physical shop has at most one active tenancy at a time.
- Shopkeeper balances are shared across their shops, while rent charges remain attributable to a specific shop, tenancy, and rent month.
- Construction credits and goods offsets may settle rent on any shop belonging to that shopkeeper; retain their source shop in history when known.
- Keep unpaid rent, unused construction credit, unused cash advance, and owner payables separately visible. A single net number must not hide their meaning.
- Never transfer an outgoing tenant's debts or credits to the incoming tenant.

### Calendar, rent, and proration

- Gregorian calendar months, using Asia/Kabul for business dates and month boundaries.
- AFN only, whole-afghani amounts. Custom currency labels must not introduce mixed-currency accounting.
- Due day per tenancy, initially suggested from Settings.
- Prorate partial first and last months by the actual days in the calendar month.
- Support effective-dated mid-month rent changes and prorate old/new rate segments.
- Preserve prior rate history and posted charges; changes to historical financial results require explicit corrections and reopening where applicable.
- Generate all missing eligible rent charges on app use/resume, including after months without opening the app. Do not depend on background execution for financial correctness.
- Proposed default: occupancy includes both start and departure dates; a new rate applies on its effective date. Sum unrounded rate segments and round the final monthly charge once to the nearest afghani, with positive halves rounded up.
- Proposed default: due days beyond the month's last day clamp to that last day; unpaid balances become overdue the next Kabul calendar day. Mid-month tenancy starts must not produce an overdue date before occupancy; confirm the first-period due-date treatment before implementation.

### Payments, credits, and allocation

- Support full/partial payments and repeated collection within a month.
- Suggest oldest unpaid charges first across the shopkeeper's shops. Show the proposed allocations and allow editing before saving.
- A payment's transaction date determines when money was received; allocation determines which shop/month's rent is settled. These are separate facts.
- Excess cash becomes an unused cash advance, separate from construction credit. Later application requires explicit confirmation.
- Apply construction credit only when the owner explicitly chooses an amount; never automatically consume it.
- Cap each allocation at the charge's unpaid amount and the source's available amount. Never permit negative available credit or over-settled rent.
- Allocation of already-received cash to later rent is not another receipt of cash.
- Payment method must distinguish physical cash from other confirmed money transfers. Do not count a promise to pay as money received.

### Goods and expenses

- Goods taken create a record of what the owner received and its value, categorized as property-related or personal.
- At entry choose paid, still owed, or offset rent now. Support partial settlements and mixed settlement methods without counting the goods twice.
- Goods recorded as owed do not automatically settle rent. Offsetting explicitly reduces both the owner's payable and the tenant's unpaid rent.
- If goods exceed eligible rent, retain the excess as an owner payable; do not silently turn it into construction credit or negative rent.
- Cash paid for goods reduces cash; rent offsets do not move cash.
- Keep ordinary property expenses and personal goods/spending distinguishable.
- A construction-credit opening balance records a historical obligation, not current-period cash received or spent.

### Opening records and departures

- Choose the ledger start date during setup.
- Enter preexisting unpaid rent by shop/month and opening construction credit, unused cash advances, and unpaid goods by shopkeeper.
- Opening records must not duplicate ordinary charges for the same tenancy/month or fabricate current-period cash flow.
- Mark reports before the opening date as incomplete rather than implying historical detail exists.
- Ending a tenancy stops future rent, prorates the last month, and leaves a final settlement open.
- Support explicit collection, refund/payment, offset, or write-off where needed to finish settlement. Refunds and write-offs remain distinguishable from normal rent collection and expenses.

### Corrections, deletion, and closing

- Preserve posted financial entries; correct through linked reversals and replacements with reasons.
- If a source payment/credit has downstream allocations, reverse or resolve dependencies atomically; never leave allocations referencing unavailable value.
- Archive shopkeepers/shops with history. Permit hard deletion only for unused records without financial or relational dependencies.
- Close a month even if rent remains unpaid. Lock its charges and transactions dated in it until explicitly reopened.
- A later-dated payment may settle rent from a closed month without reopening it or changing that month's cash receipts.
- Proposed reporting distinction: historical month-end arrears use records through month end; current remaining rent for an old month includes subsequent settlements. Label both views clearly.
- Record close/reopen events and reasons. Reopening on one device must not silently defeat a conflicting closure history on another.

## 5. Data model and integrity

Implement an explicit relational schema after the feasibility stage. Minimum entities and responsibilities:

- **Ledger / Device:** ledger identity, schema/protocol version, origin-device identity, and exchange metadata.
- **Shopkeeper:** identity, name, phone, address, notes, archival state. Do not assume phone numbers or personal names are unique.
- **Shop:** stable identity, unique shop identifier within the ledger, display name/number, location, notes, archival state. Occupancy comes from tenancy history.
- **Tenancy:** shopkeeper, shop, start/end dates, due day, notes; prevent overlapping occupancy for one shop.
- **RentRate:** tenancy, effective date, monthly AFN amount; nonoverlapping effective rate history.
- **MonthlyRentCharge:** tenancy, rent month, posted charge and calculation/rate provenance. Enforce one active charge identity per tenancy/month, with explicit correction history.
- **Payment / CashAdvance:** money received, method, business date, shopkeeper, note; distinguish applied and unapplied value without duplicating the receipt.
- **ConstructionCredit:** source, amount, date, optional source shop, and application history.
- **GoodsPurchase / OwnerPayable:** goods description, value, date, shopkeeper/source shop, personal/property category, and settlement history.
- **Expense / CashDisbursement:** cash or other money paid, category, date, notes, and optional property/shop link; distinguish refunds and payable settlements.
- **Allocation / Settlement:** links a specific value source to a rent charge or owner payable and records how much was settled and when.
- **Reversal / Adjustment:** linked correction, reason, origin, and dependent effects.
- **OpeningBalance:** provenance for opening rent debt, credits, advances, and owner payables.
- **Note:** linked to supported records, with text and timestamps.
- **MonthClosure:** closing/reopening history for a business month.
- **Settings / ImportExport metadata:** language, theme, due-day default, backup reminders, schema compatibility, and exchange results.

Persistence requirements:

- Stable globally unique record/operation identities must survive export and import; device-local auto-increment IDs cannot be the exchange identity.
- Keep separate business dates and technical timestamps; timestamps alone must not decide financial conflicts.
- Store money as integer AFN; validate safe arithmetic. Avoid binary floating-point money calculations and round only at defined boundaries.
- Use foreign keys, uniqueness constraints, and atomic transactions alongside domain validation.
- Derived balances must be reproducible from posted entries and allocations. Cached projections are rebuildable, never authoritative independent balances.
- Idempotent charge generation and replay/import. Two devices may independently generate the same month's charge; equivalent charges coalesce, incompatible versions conflict.
- Protect archived records and reversal history from resurrection by old imports.
- Keep migrations versioned, tested against older fixtures, and recoverable; never silently reset a failed database.
- Sensitive ledger contents, passwords, and full backup payloads must not enter diagnostic logs.

## 6. Screens and primary journeys

### Onboarding

1. Choose English or پښتو before ledger setup.
2. Explain local storage, two-device freshness, and off-device backup responsibility in plain language.
3. Confirm AFN, business dates, theme, and default due day.
4. Create shops and shopkeepers, then tenancies and opening balances.
5. Review starting balances and open Collect. Setup must be resumable without duplicating records.

### Collect

- Default to the current month, with month navigation, summary cards, search, filters, and outstanding balances.
- Shop cards show shop/person, monthly charge, cash paid, noncash settlement, remaining rent, and clearly labeled shared shopkeeper credit.
- Avoid implying a shared credit balance belongs independently to every shop or summing it once per card.
- Status precedence: paid when remaining rent is zero; otherwise overdue after its due date, partial if partly settled, unpaid if nothing settled. Include text/icons alongside color.
- Quick actions: Collect Payment, Apply Credit/Advance, Record Goods, Add Note, and View History.
- Collection: select person via shop card, enter date/amount/method, inspect suggested allocations, adjust, confirm, then show durable success and refreshed balances.
- Explain carried arrears separately from the selected month's charge. Do not charge the same debt again next month.

### Spend

- List expenses and goods entries with month selection and personal/property filters.
- Record category, date, amount, notes, optional source shop/person, and settlement state where applicable.
- Goods flow previews the owner payable and any rent-offset allocations before saving.
- Show money spent separately from goods incurred but still owed or settled by rent offsets.

### Shops / Shopkeepers

- Searchable shops and people, vacant/occupied filters, and active/archived views.
- Profile fields: name, phone, shop identifier/name, address/location, notes; tenancy owns rent rate, start/end date, and due day.
- Detail screens show tenancies, shared balance components, rate history, chronological transactions, allocations, notes, and final settlement.
- Support effective-dated rent changes and tenant replacement without rewriting past occupancy.

### Reports

- Monthly totals: expected rent, physical cash received, other money received, outstanding rent, construction credit applied, advances applied, goods offsets, goods taken, and cash spent.
- Main net cash-flow figure uses physical cash only. Separate property cash result, personal cash spending, and resulting available cash movement.
- Other payment methods have separate totals; noncash offsets are not cash income or cash expense.
- Distinguish cash received during a month from cash allocated to that month's charges; a prior advance can settle rent without current cash receipts.
- Yearly summary, shop performance, highest-outstanding-first list, collected/settled versus expected charts, and trend charts with unambiguous legends.
- CSV exports work offline and preserve AFN integer values and correct Unicode; safely escape delimiters, newlines, and spreadsheet-formula-like text.

### Settings

- Immediate English/Pashto switching, persisted offline; owner reviews Pashto terminology and key flows before release.
- Light/Dark/System theme, default due day, AFN display, backup reminders, backup/import/transfer, and About/version.
- Show last export/import times and explain that an export is not proof a backup was saved safely off-device.
- Show each device's known data freshness without claiming unsynchronized balances are globally current.
- Protect unsaved forms during language/theme changes and navigation.

## 7. Design and localization standards

- Deep teal primary palette, green success, orange warning, red danger, and accessible contrast in both themes.
- Large touch targets, readable type, restrained shadows, rounded cards, and subtle animations.
- Reusable money, status, summary, form, empty-state, confirmation, and transaction components.
- Translate every user-facing label, error, validation message, accessibility label, report heading, and export description.
- Use Gregorian dates and 0–9 digits in both languages. Proposed default: accept both familiar and localized digit input, normalizing before validation.
- Bundle an appropriately licensed font with verified Pashto glyph coverage; no network font dependency.
- Instant direction switching must handle component layout, directional icons, text alignment, navigation, gestures, and mixed-direction names/phone numbers without restart.
- Provide real loading/progress states for initialization, reports, imports, and transfers. Do not add artificial loading delays to local operations.
- Empty states explain the next useful action. Confirm consequential changes; show success only after persistence succeeds.
- Refresh re-queries local data; it must not imply cloud synchronization.

## 8. Backup, merge, and nearby exchange

### Encrypted files and recovery

- Export a consistent snapshot with ledger identity, format/schema versions, stable identities, history, and integrity metadata.
- Password-encrypt with a maintained authenticated scheme. Never store the backup password in the exported package or logs.
- Explain password-loss consequences and the need to save files off-device.
- Validate password, authentication, size bounds, schema compatibility, relationships, and financial invariants before any live changes.
- Preserve a recoverable copy of current data before replacement or financial import; define retention and privacy behavior before implementation.
- Make compatible-history merge the agreed import behavior. A separate full-replacement recovery path is a proposed fallback, not an automatic response to conflict.
- Never merge unrelated ledger identities automatically. First-device pairing/recovery must explicitly establish the same ledger identity.

### Merge rules

- Preflight in staging and show a preview: new records, already-known records, potential duplicates, and conflicts.
- Identical stable operations are no-ops. Same identity with divergent contents is a conflict, not a reason to select the newest timestamp.
- Compatible independent history may merge. Validate the resulting ledger, not just each incoming entry separately.
- Reject the whole import for overspent construction credit/advances, over-settled charges/payables, incompatible rent schedules/charges, overlapping occupancy, conflicting closures, broken reversal dependencies, or incompatible record versions.
- Preserve current live data unchanged on conflict or invalid input. Provide an understandable report with affected people/months and a next action.
- Do not silently prefer one phone, drop conflicting records, resurrect archives, or reactivate reversed payments.
- Similar-looking independently entered payments are warnings requiring deliberate resolution; they are not automatically identical.
- Define a recovery procedure before release for blocked merges, including preserving both originals and deciding whether a corrected package or deliberate full restoration is appropriate. A guided per-record conflict editor is outside the agreed v1 scope.

### Local-network transfer

- Phones share Wi-Fi or a hotspot; internet is unnecessary. Denied permissions or unavailable networking must not block ordinary ledger work.
- Require explicit sender/receiver roles, pairing verification, consent, authenticated/encrypted transport, and bounded payload handling.
- One-way transfer: sender exports a consistent package; receiver previews, validates, and atomically imports. Receiver sends back separately if desired.
- Distinguish sent, received, validated, committed, and acknowledged states. A failed acknowledgment must not cause duplicate imports on retry.
- Interrupted transfer/import leaves a valid prior ledger or a committed complete import, never partial financial state.
- File backup/import remains available when nearby transfer is unavailable.

## 9. Worked acceptance examples

1. **Partial rent:** Rent 10,000; receive cash 3,000 then 2,000. Cash received is 5,000 and rent outstanding is 5,000. Both receipts remain in history.
2. **Construction plus goods:** Rent 10,000; construction credit 30,000; goods owed 2,000. Explicitly apply 3,000 construction credit and offset 2,000 goods. Rent remaining is 5,000, construction credit is 27,000, owner goods payable is zero; neither settlement creates cash movement.
3. **Excess goods:** Rent remaining 10,000; goods worth 12,000. Offset 10,000 and retain owner payable 2,000. Paying 2,000 cash later settles that payable without creating another goods purchase.
4. **Advance:** Rent owed 10,000; receive 15,000 cash. Allocate 10,000 and hold 5,000 advance. Next month explicitly apply it; this does not create another cash receipt.
5. **Shared person:** One person owes 4,000 for Shop A and 6,000 for Shop B. A payment of 7,000 suggests oldest charges first; the owner can revise the split and see both shops update.
6. **Partial first month:** Monthly rate 3,000; 30-day month; occupancy begins on day 16. Under inclusive-day default, charge 1,500 for 15 days.
7. **Mid-month rate change:** In a 30-day month, rate is 3,000 for days 1–15 and 6,000 for days 16–30. Charge 4,500; preserve both rates.
8. **Departure:** Outgoing person leaves with debt/credit. End and prorate their tenancy, retain their final settlement, and create the replacement tenancy without moving balances between people.
9. **Closed month:** January rent remains unpaid when January closes. A February-dated payment can settle January debt; January cash receipts do not increase.
10. **Correction:** A mistakenly recorded receipt and its allocations are reversed together before a replacement is posted. Derived balances reconcile and the original remains visible.
11. **Repeated exchange:** Import the same package twice; the second import changes no financial totals.
12. **Credit conflict:** Both phones independently allocate the same available 3,000 credit. An import that would overspend it is rejected with no partial changes.
13. **Equivalent charge generation:** Both phones independently generate the same tenancy/month charge from the same rate history. Import does not double expected rent; inconsistent rate history blocks the merge.
14. **Cash-only reports:** Receive 4,000 cash and 2,000 confirmed noncash; pay 1,000 property cash expense and 500 personal cash. Show 3,000 property net cash, 500 personal cash spending, and 2,500 net cash movement; show 2,000 noncash received separately.
15. **Interrupted recovery:** Wrong password, corrupted package, disk-full failure, or interrupted staging leaves the current ledger intact and retryable.

## 10. Ordered implementation checklist

For each stage: record resolved decisions, implement the tasks, run its meaningful checks, and mark completion only after acceptance. Do not create scaffolding for deferred products or services.

### Stage 0 — Resolve feasibility and record decisions

Prerequisite: this plan and the existing starter.

- [ ] Complete the compatibility, live RTL, nearby-transfer, cryptography, and private-iPhone gates in section 3.
- [ ] Record actual device targets and exact library versions.
- [ ] Settle first-period due-date handling, monetary rounding details, backup recovery/retention, and import conflict recovery.
- [ ] Document default form values, required fields, and uniqueness rules from the domain requirements.

Acceptance: successful proof on both platforms for the risky capabilities, or an explicit recorded scope revision from the owner. Do not silently relax instant RTL or nearby transfer.

### Stage 1 — Application foundations

Prerequisite: selected dependency baseline and RTL approach.

- [ ] Migrate from Expo Router to direct React Navigation and the five tabs/stacks.
- [ ] Establish source boundaries, TypeScript configuration, theme tokens, shared components, fonts, and icon usage.
- [ ] Add localization, persisted settings, live direction switching, error boundaries, toasts, and form conventions.

Acceptance: both phones navigate all tab shells, change language without reload, restore preferences after restart, and render correctly in both themes.

### Stage 2 — Database and financial domain

Prerequisite: approved domain rules and exchange identity design.

- [ ] Implement schema, migration runner, foreign keys, transactional repositories, and stable operation identities.
- [ ] Implement rent/proration, allocation, credit/payable availability, reversal, and derived-balance calculations.
- [ ] Implement idempotent rent generation, dependency validation, and schema/version errors without destructive resets.
- [ ] Add domain and database tests for the financial invariants and worked examples.

Acceptance: deterministic calculations, atomic posting/reversal, and valid migrations; intentional constraint failures leave no partial writes.

### Stage 3 — Setup and management

- [ ] Implement resumable onboarding, profiles, shops, tenancy/rate history, vacancy, notes, and archival.
- [ ] Implement opening balances and prevent overlap with generated rent.
- [ ] Add searchable histories and clear shared-account balance components.

Acceptance: set up a realistic 20–30-shop ledger offline, including multiple shops for one person and replacement tenants, without duplicate charges or inherited balances.

### Stage 4 — Collect

- [ ] Implement month navigation, summaries, shop cards, statuses, search, and filters.
- [ ] Add full/partial collection, allocation preview/editing, arrears, construction-credit application, and cash advances.
- [ ] Refresh related screens after committed writes and prevent accidental repeated submission.

Acceptance: examples 1, 2, 4, and 5 work through the UI, and persist across restart with reconciling totals.

### Stage 5 — Spend and goods settlement

- [ ] Implement property/personal expenses and goods records with paid/owed/offset choices.
- [ ] Implement partial payable settlement, cash disbursement, and rent offset across a person's shops.
- [ ] Make incurred value, money spent, and remaining owner debt visibly distinct.

Acceptance: excess goods and mixed settlements reconcile without duplicate expense or money movements.

### Stage 6 — Corrections and lifecycle

- [ ] Add effective-dated mid-month rent changes, departure proration, and final settlement.
- [ ] Implement reversals/replacements, dependency checks, archive restrictions, and unused-record deletion.
- [ ] Implement month close/reopen and later-dated arrears settlement.

Acceptance: examples 6–10 pass; historical rates and closed-period cash totals remain explainable.

### Stage 7 — Reports and CSV

- [ ] Implement monthly/yearly queries, shop attribution, current outstanding and historical month-end views.
- [ ] Implement cash-only primary reporting, noncash-method breakdowns, settlement breakdowns, and property/personal distinction.
- [ ] Add accessible charts and correctly escaped offline CSV exports.

Acceptance: reports reconcile to source transactions; shared credits are not multiplied per shop; opening data and example 14 are represented correctly.

### Stage 8 — File recovery and merge engine

- [ ] Implement consistent encrypted export, password/authentication validation, format migration, and recovery copies.
- [ ] Build staged merge preview, idempotency, resulting-ledger validation, and atomic commit/rejection.
- [ ] Add backup reminders, freshness indicators, and plain-language conflict/recovery messages.

Acceptance: wrong-password/corruption/interruption tests and repeated-import tests pass; unsafe combinations leave current data unchanged.

### Stage 9 — Nearby exchange

Prerequisite: validated transport and tested import engine.

- [ ] Add pairing, permission handling, one-way send/receive, progress, acknowledgment, cancellation, and retry.
- [ ] Reuse the same package validation and import engine as file exchange.
- [ ] Test both Android-to-iPhone and iPhone-to-Android on Wi-Fi and hotspot without internet.

Acceptance: examples 11–13 pass across devices; disconnection, backgrounding, denied permission, and retry never cause partial financial changes.

### Stage 10 — Polish and release validation

- [ ] Complete every translation; owner/fluent reviewer approves Pashto financial terms and key flows.
- [ ] Validate RTL, long names, mixed-script inputs, text scaling, touch targets, contrast, and screen-reader labels.
- [ ] Exercise empty states, invalid input, low storage, interrupted writes, date/month boundaries, and app restarts.
- [ ] Check responsiveness on actual devices with several years of representative records; record measured performance before defining stricter targets.
- [ ] Complete a realistic offline collection cycle and an off-device backup/recovery drill.

Acceptance: no unresolved data-integrity failures; real-device bilingual workflows, backup recovery, and exchange are verified before entering real financial data.

### Stage 11 — Private delivery and documentation

- [ ] Produce reproducible private builds and document installation/signing renewal obligations for both platforms.
- [ ] Write README setup/build/test instructions, module boundaries, migration rules, and release procedure.
- [ ] Write owner guidance for opening balances, corrections, backups/passwords, stale device balances, conflict handling, and device loss.
- [ ] Add automated type checking, domain/database tests, and migration/import checks to the chosen CI environment. Proposed default: run these on each change; choose the provider when repository hosting is known.

Acceptance: a fresh setup can reproduce builds and tests; the owner can install, operate, export, recover, and exchange data using the documented process.

## 11. Quality, observability, and definition of done

- Automated tests focus on financial calculations, constraints, migration compatibility, reversal dependencies, and recovery/merge safety, rather than mirroring trivial UI code.
- Integration tests use real SQLite behavior where possible, including transaction rollback and failed imports.
- Maintain older-schema and import fixtures; test unsupported future schemas with a clear error rather than destructive conversion.
- Keep local diagnostic events for migration/import/transfer outcomes, version information, and error codes, without financial payloads or credentials. Remote crash reporting is not a confirmed integration.
- The durable ledger is the audit history; ordinary diagnostic logs are not its substitute.
- No silent financial recovery, fake success, swallowed migration failure, or automatic database reset.
- Ordinary ledger operation requires no network request, external font, cloud service, or background-job success.
- Backup reminders can appear when opening the app; notification permissions are not required for the agreed reminder scope.
- Complete offline English/Pashto journeys, successful recovery, and real Android/iPhone testing are mandatory release conditions.
- Financial reliability is an engineering target, not a promise of recovery when every device/backup or the only backup password is lost.

## 12. Assumptions and unresolved risks register

### Proposed assumptions to validate while implementing

- Dayjs, Expo vector icons, and react-native-gifted-charts remain the unconfirmed library defaults.
- No backend, advertising, remote analytics, or mandatory cloud service is introduced.
- Due-day clamping, inclusive occupancy, final-charge rounding, local digit normalization, and historical-report labeling follow the defaults documented above.
- Stable identifiers, transactional staging, reproducible balances, recovery copies, and idempotent operations are engineering requirements supporting the owner's reliability choices.
- Restore/transfer never changes language/theme unexpectedly; define which settings are device-local and which travel with the ledger.
- Default backup reminder interval, retention count, performance thresholds, and the first-period due-date rule are not yet agreed. Resolve them at their prerequisite stage and record the result here.

### Open release risks

- **Private iPhone installation:** no paid Apple membership; route and maintenance remain unresolved.
- **Instant live RTL:** requires device proof across navigation/native controls; no restart fallback is authorized.
- **Native compatibility:** nearby transport, cryptography, charts, and SDK 57 must be validated as a set.
- **Manual multi-device use:** balances are locally known, not globally authoritative until exchange. Duplicate human entry cannot be perfectly inferred.
- **Blocked merges:** integrity checks prevent unsafe combinations but do not themselves resolve conflicting business history; the owner needs an understandable recovery path.
- **Shared-credit contention:** two devices can each appear to have spendable credit that their eventual merged history cannot support.
- **Recovery responsibility:** exports must leave the device; file availability and password retention remain essential.
- **Translation quality:** Pashto requires owner/fluent review before real use.
- **Unverified deployment constraints:** actual OS versions, signing access, recurring costs, and any future deadline/budget cap remain unknown.

When resolving a risk, update this document with the selected behavior, evidence, and affected acceptance criteria. Do not present an unresolved assumption as a confirmed owner decision.
