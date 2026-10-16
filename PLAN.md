# Create the implementation reference: PLAN.md

Create a detailed, self-contained document that preserves the interview decisions and supports implementation in reviewable stages.

## Document contents

- Product purpose, intended users, priorities, v1 scope, and explicitly deferred features.
- Confirmed technology choices, exact verified versions, compatibility checks still required, and the existing starter’s migration from Expo Router to direct React Navigation.
- Screen-by-screen journeys for onboarding, collection, goods, expenses, tenancy management, reporting, settings, backup, and device exchange.
- Data entities, relationships, constraints, financial invariants, transaction boundaries, migrations, and opening-balance handling.
- Worked accounting examples covering partial payments, shared shopkeeper balances, construction credits, advances, goods payables, allocation, proration, mid-month rent changes, departures, reversals, and month closing.
- Bilingual design requirements, instant RTL behavior, accessibility, themes, local formatting, and Pashto review.
- Backup encryption, restore validation, independently edited devices, duplicate detection, conflict rejection, and interrupted-transfer recovery.
- Explicit assumptions, unresolved risks, release blockers, and deferred decisions.

## Ordered implementation stages

1. **Validate feasibility:** dependency compatibility, live RTL, nearby Android/iPhone transfer, and sustainable private iPhone distribution. Record findings before dependent implementation.
2. **Build foundations:** project structure, navigation, design tokens, localization, local settings, and error handling.
3. **Implement persistence:** SQLite migrations, financial transactions, stable identities, history, and integrity checks.
4. **Implement management:** shops, people, tenancies, rent schedules, vacancy, opening balances, and onboarding.
5. **Implement collection:** monthly charges, statuses, payments, editable allocations, credits, advances, and arrears.
6. **Implement spending:** expenses, goods payables, cash settlement, rent offsets, and personal/property categorization.
7. **Implement lifecycle controls:** departures, final settlements, reversals, archival, month closing, and reopening.
8. **Implement reports:** cash-only primary reporting, other payment methods, noncash settlements, outstanding balances, charts, and CSV.
9. **Implement recovery:** encrypted exports, validated imports, recovery copies, and reminders.
10. **Implement device exchange:** compatible-history merging, conflict checks, paired local-network transfer, and retry handling.
11. **Polish and validate:** bilingual layouts, dark mode, accessibility, realistic accounting scenarios, airplane-mode operation, and both physical phones.
12. **Prepare delivery:** private builds, installation instructions, backup/recovery guidance, and README.

Each stage will include prerequisites, concrete tasks, acceptance criteria, necessary tests, and completion checkboxes.

## Required validation

Cover financial calculations and reconciliation, atomic writes, repeated imports, conflicting offline changes, interrupted transfers, migrations, backup recovery, closed-month behavior, and complete offline operation.

Keep confirmed decisions separate from assumptions. Preserve unresolved release blockers explicitly rather than silently choosing substitutes.
