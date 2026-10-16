```txt
You are my senior technical co-founder and product architect. I'm about to build a
new software project and I want us to be in complete alignment BEFORE any code or
final plan is written. Your job right now is NOT to write code, scaffold, or produce
a plan. Your job is to INTERVIEW me.

## How to run this interview

1. Ask me questions in small batches (3–6 at a time), grouped by topic. Do NOT dump all questions at once — it's overwhelming and I'll give shallow answers.
2. Ask the highest-leverage, most ambiguous questions first — the ones where a wrong
   assumption would force a costly rewrite later.
3. After each batch, briefly reflect back what you understood in 1–2 sentences, then
   continue to the next batch.
4. When I'm vague, push back. Offer 2–3 concrete options with a recommended default
   and explain the trade-off, instead of accepting "whatever you think is best."
5. If I make a choice that conflicts with something I said earlier, flag the conflict.
6. Track open questions. If I say "I don't know," propose a sensible default, label it
   clearly as an ASSUMPTION, and move on so we don't get stuck.
7. Prefer my explicitly stated tech stack and constraints. Do not silently swap tools.
8. Stay version-accurate: if a library or framework version matters, confirm the exact
   version and check current docs rather than relying on memory.

## Topics to cover (adapt to what's relevant; skip what doesn't apply)

- **Product & users**: What problem does this solve? Who is the user? What's the single
  most important thing the app must do well? What is explicitly OUT of scope for v1?
- **Core user journeys**: Walk through the primary flows screen-by-screen / step-by-step.
  What does a brand-new user see first? What's the "aha" moment?
- **Data model**: What are the core entities, their fields, and relationships? What's
  the source of truth? What must be unique, required, or validated?
- **Authentication & authorization**: Who can sign in and how? What are the roles/tiers?
  What can each role see and do? What happens on first sign-up vs returning user?
- **Architecture & boundaries**: Client/server split, API style, where business logic
  lives, third-party services and exactly what each is responsible for.
- **Background work & async**: What happens asynchronously? Triggers, retries, idempotency,
  what the user sees while waiting, and failure behavior.
- **External integrations & APIs**: Which third-party APIs? Rate limits, costs, keys,
  quotas, and fallback behavior when they fail.
- **State & data flow**: Caching, optimistic updates, real-time vs polling, offline
  behavior, source-of-truth conflicts.
- **Edge cases & failure modes**: Empty states, errors, slow networks, partial failures,
  abuse/spam, and what "graceful degradation" looks like.
- **Permissions & platform specifics**: Device/OS permissions, push notifications, deep
  links, platform differences (e.g. iOS vs Android, web vs native).
- **Non-functional requirements**: Performance targets, scale expectations, security,
  privacy/PII, compliance, accessibility, internationalization.
- **Cost & limits**: What budget/usage constraints exist on infra, APIs, or AI tokens?
  What should we do when a limit is hit?
- **Observability**: What do we need to log, track, and alert on? How do we know it works
  in production?
- **Monetization** (if any): Free vs paid, what's gated, billing provider, trial logic.
- **Environments & delivery**: Local dev, staging, production. How is it deployed and
  released? Any CI/CD expectations?
- **Testing & quality bar**: What must be tested? What's the definition of "done" for v1?
- **Constraints & non-negotiables**: Deadlines, must-use technologies, things I've already
  decided that are not up for debate.
- **Future-proofing**: What's likely in v2 that we should not paint ourselves into a
  corner on (but also not over-engineer for now)?

## When the interview is done

Once you have enough to remove guesswork, STOP asking and produce:
1. A concise **spec summary**: product, users, scope (in and out), core flows, data model,
   architecture, and integrations.
2. A list of every **ASSUMPTION** we made where I didn't give a firm answer.
3. A list of **OPEN RISKS / unknowns** that could still bite us.
4. Only then, ask me: "Ready for me to turn this into an implementation plan?"

Begin now by asking me your first batch of questions about the project I'm about to describe.

I want to Build a complete, production-ready React Native mobile application (using Expo for easiest setup) for managing rents of 20–30 shops in a small town. The app must be fully offline-first, support English + Pashto languages, and have an extremely clean, modern, beautiful, and highly intuitive UI.
Core Purpose
The app is used by a single landlord/property owner to:
- Manage shopkeepers and their shops
- Track monthly rent collection (including partial payments)
- Handle cases where the shopkeeper previously paid for building/construction expenses (these amounts should be treated as advance/credit that reduces future monthly rent)
- Track when the owner takes goods/materials/daily needs from shops (these should be recorded as deductions against rent or as expenses)
- Have two primary tabs: Collect and Spend
- Provide full management features needed for this use case
Tech Stack Requirements
- React Native with Expo (SDK 51 or latest stable)
- TypeScript
- Offline-first database: use expo-sqlite (or better, WatermelonDB / Realm if more suitable for complex relations). All data must work 100% offline.
- Navigation: React Navigation (bottom tabs + stack)
- State management: Zustand or React Context + hooks (keep it simple)
- UI: React Native Paper or NativeWind (Tailwind) + custom beautiful components. Prefer a clean, modern design system.
- nativewind: For design.
- Internationalization: i18next + react-i18next with full English and Pashto support (RTL support for Pashto)
- Date handling: dayjs or date-fns
- Beautiful icons: @expo/vector-icons or lucide-react-native
- Charts for reports: react-native-gifted-charts or victory-native
- Form handling: react-hook-form + zod validation
- Secure local storage for settings
Main Features & Screens
1. Bottom Tab Navigation (Primary)
- Collect tab (main focus)
- Spend tab
- Shops / Shopkeepers tab
- Reports tab
- Settings tab
2. Shopkeeper & Shop Management
- Add / Edit / Delete shopkeeper
- Fields: Name, Phone, Shop Name/Number, Address/Location, Monthly Rent Amount, Start Date, Notes
- Ability to mark a shop as vacant or occupied
- Record initial construction/building expenses paid by shopkeeper (this creates a credit balance that can be applied against future rents)
- View full history of each shopkeeper (payments, credits, goods taken, notes)
3. Collect Tab (Rent Collection)
- List of all shops with clear status: Paid, Partial, Unpaid, Overdue
- Beautiful card UI showing:
  - Shop name + shopkeeper name
  - Monthly rent
  - Amount already paid this month
  - Remaining balance
  - Credit balance (from previous construction payments)
  - Color coding (green = paid, orange = partial, red = unpaid/overdue)
- Quick actions:
  - Collect Payment (support full or partial payment)
  - Apply Credit (from construction expenses)
  - Record Goods Taken (owner took materials/items → deduct from rent or record as expense)
  - Add Note
- Monthly view with ability to switch months
- Support for advance payments and carrying balances to next months
- Payment history per shop with date, amount, method (cash/other), notes
4. Spend Tab
- Record expenses related to the properties (repairs, maintenance, utilities paid by owner, etc.)
- Record personal goods/materials taken from shops (with option to link to a specific shop and deduct from their rent)
- Categories for expenses
- Ability to attach notes and date
- Monthly summary of total spent
5. Reports & Dashboard
- Monthly overview: Total expected rent, Total collected, Total outstanding, Total credits applied, Total goods taken, Net income
- Shop-wise performance
- Outstanding balances list (sorted by highest first)
- Yearly summary
- Beautiful charts (collected vs expected, payment trends)
- Export simple text/CSV summary (optional, offline)
6. Settings
- Language switcher (English / Pashto) — must change entire app instantly, including RTL layout for Pashto
- Currency symbol (default PKR or custom)
- Default monthly rent reminder day
- Backup/Restore data (export/import SQLite or JSON file)
- App theme (Light / Dark / System) — beautiful dark mode support
- About & version
Important Business Logic
- Fully support partial payments. A shop can pay multiple times in a month.
- Construction expense paid by shopkeeper → stored as Credit Balance. When collecting rent, user can choose to apply part or all of the credit.
- Goods taken by owner from shop → can either:
  a) Deduct from current month’s rent, or
  b) Record as separate expense (owner’s personal spending)
- Overdue tracking: clearly show months that are still unpaid
- Ability to record payments for previous months
- Soft delete for shopkeepers (keep history) + option for hard delete
UI / UX Requirements (Very Important)
- Extremely clean, modern, and beautiful design
- High contrast, large touch targets, excellent readability
- Use a refined color palette (primary: deep teal or indigo, success green, warning orange, danger red)
- Soft shadows, rounded cards, smooth animations
- Empty states with helpful illustrations/messages
- Loading skeletons
- Confirmation dialogs for delete actions
- Toast notifications for success/error
- Search and filter on lists (search by shopkeeper name or shop number)
- Pull-to-refresh where relevant
- The design should feel premium and trustworthy (like a banking/finance app)
- Fully support both LTR (English) and RTL (Pashto)
Localization
- Complete English and Pashto translations for every string
- Proper Pashto translations (use natural, commonly understood terms)
- RTL layout support when Pashto is selected
- Language preference persisted offline
Data Models (suggested)
- Shopkeeper
- Shop (linked to shopkeeper)
- RentPayment
- Credit (construction advances)
- GoodsTaken / Expense
- MonthlyRentRecord (for tracking status per month)
Additional Smart Features to Include
- Dashboard summary cards on Collect tab
- Quick “Collect All” or bulk actions if useful
- Notes system everywhere
- Ability to mark a month as “Closed”
- Simple reminder system (local notifications optional)
- Data integrity: prevent negative balances where it doesn’t make sense
- Beautiful onboarding / first-time setup screen (add first shops)
Deliverables Expected
1. Complete working Expo React Native project
2. All screens fully implemented
3. Full offline database with migrations
4. Complete English + Pashto translation files
5. Clean folder structure
6. README with setup instructions
7. Beautiful, consistent design system
8. Type-safe code (TypeScript)
9. Error handling and edge cases covered
Make the app feel simple for a non-technical user in a small town while being powerful enough to handle all real-world rent management scenarios (partial payments, credits, goods taken, history, multi-month tracking).
Prioritize:
1. Reliability (never lose data)
2. Clarity (user always understands current status)
3. Beauty & polish
4. Offline-first
5. Bilingual support
Start by setting up the project structure, database schema, navigation, and i18n, then implement feature by feature.

```





```
for now create a PLAN.md file with all the details so that later you can implement this step by step.

```