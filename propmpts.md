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

-------------- done

Create a UI prompot for chatgpt

```txt
Generate an image of a complete modern mobile app UI design system and all screen designs for an AI-powered travel planning app called "Roamly".

Roamly is a modern AI travel companion that helps users discover destinations, build personalized itineraries, organize trips, track travel plans, and share travel experiences.

## The app helps users:

- Discover destinations around the world
- Generate AI-powered travel itineraries
- Organize flights, hotels, and activities
- Save places to visit
- Create day-by-day travel schedules
- Explore restaurants, attractions, and hidden gems
- Collaborate with friends on trips
- Share travel memories and photos
- Track travel budgets
- Receive personalized recommendations

## Design Style

- Ultra modern 2026 startup aesthetic
- Minimalistic, clean, editorial layouts
- Premium travel-magazine feel
- Light mode first with airy white space
- Large immersive destination photography as the hero of every screen
- Soft rounded corners (16–20px radius)
- Subtle depth, premium shadows, floating cards
- Pill-shaped buttons and filter chips
- Smooth spacing and polished interactions
- Aspirational, adventurous, inspiring vibe
- NOT cluttered, NOT corporate, NOT generic travel agency style
- Apple-level clean UI mixed with luxury travel branding

## Color Palette

- Crisp white and soft off-white backgrounds (#FFFFFF / #FAFAF8)
- Deep ocean blue primary accent (#3A86FF)
- Sky blue gradients and sunset orange highlights
- Deep charcoal text (#1F1F1F)
- Soft gray secondary text (#8A8A8A)
- Subtle teal and emerald accents for recommendations
- Premium glassmorphism effects on selected components

## Typography

- Clean modern sans-serif (SF Pro / Inter style)
- Large editorial destination headlines
- Strong hierarchy: bold headings, medium subheads
- Comfortable readable body text
- Prominent travel metadata pills ("4 Days", "Budget", "Family Friendly", "Adventure")

## Screens

### 1. Splash Screen

- Roamly logo centered
- Beautiful destination image blurred in background
- Minimal branding
- Premium travel startup feel

### 2. Welcome / Onboarding Screen

- Full-screen breathtaking travel photography
- Soft gradient overlay
- Headline: "Your next adventure starts here"
- Subheadline: "Let AI build the perfect trip for you"
- Continue with Email
- Continue with Google
- Continue with Apple
- Pill-shaped buttons
- Small terms and privacy text

### 3. Authentication Screens

- Sign In
- Sign Up
- Google Login
- Apple Login
- Clean rounded inputs
- Modern travel aesthetic
- Ocean-blue primary CTA

### 4. Travel Preferences Onboarding

- Trip style selection chips: Adventure, Luxury, Budget, Nature, Food, Culture, Beach, Solo, Family
- Favorite destinations selector
- Budget range slider
- Travel pace selector
- Interests selection grid
- Progress indicator at top

### 5. Home / Explore Screen

Include:

- Large search bar: "Where do you want to go?"
- AI prompt input
- Horizontal destination categories: Beach, City, Mountains, Road Trips, Luxury, Food
- Featured destination hero card
- Personalized recommendations section
- Trending destinations carousel
- Large destination cards with: destination image, country, rating, estimated budget, trip duration, save button

### 6. AI Trip Planner Screen

- AI chat-style interface
- Trip generation form
- Destination field
- Travel dates
- Budget selector
- Travel companions selector
- Interests chips
- Large CTA: "Generate My Trip"
- Beautiful generated itinerary preview cards

### 7. Trip Details Screen

- Large immersive destination image carousel
- Destination overview
- Weather summary
- Budget estimate
- Interactive map preview
- Trip highlights
- Recommended restaurants
- Top attractions
- Save trip button
- Share button

### 8. Itinerary Screen

- Beautiful timeline layout
- Day-by-day schedule
- Morning / afternoon / evening sections
- Activity cards
- Maps integration preview
- Transport suggestions
- Editable itinerary blocks
- Floating add activity button

### 9. Explore Places Screen

- Search places
- Restaurants, cafes, attractions, hidden gems, shopping, nightlife
- Interactive filter chips
- Large destination imagery
- Save-to-trip action

### 10. Budget Tracker Screen

- Trip spending summary
- Budget progress bars
- Expense categories: accommodation, food, transportation, activities, shopping
- Beautiful financial cards
- Travel-friendly visualizations

### 11. Travel Memories Screen

- Photo gallery grid
- Travel journal entries
- Timeline layout
- Large destination photos
- Location tags
- Share memories CTA

### 12. Saved Trips Screen

- Grid of saved trips
- Organized collections: Dream Trips, Upcoming, Completed, Favorites
- Warm empty state
- Beautiful travel illustrations

### 13. Profile Screen

- Large circular avatar
- Travel stats: countries visited, trips completed, saved destinations
- Follower/following counts
- Tabs: Trips, Saved, Memories
- Grid of travel photos
- Settings rows: notifications, preferences, account, help
- Red log out button

## Direction

Design the app like a real App Store travel startup product. Make every screen feel connected through one cohesive design system.

The experience should feel: premium, aspirational, luxurious, modern, minimal, travel-focused, beautiful, highly polished, emotionally inspiring.

Generate high-quality mobile app mockups in iPhone style with realistic spacing, premium destination photography, modern travel UX, and production-ready startup design quality.



Depending on the plan that I have I want you to generate a prompt like this that will generate a UI design: # Create the implementation reference: PLAN.md\
\
Create a detailed, self-contained document that preserves the interview decisions and supports implementation in reviewable stages.\
\
\## Document contents\
\
\- Product purpose, intended users, priorities, v1 scope, and explicitly deferred features.\
\- Confirmed technology choices, exact verified versions, compatibility checks still required, and the existing starter’s migration from Expo Router to direct React Navigation.\
\- Screen-by-screen journeys for onboarding, collection, goods, expenses, tenancy management, reporting, settings, backup, and device exchange.\
\- Data entities, relationships, constraints, financial invariants, transaction boundaries, migrations, and opening-balance handling.\
\- Worked accounting examples covering partial payments, shared shopkeeper balances, construction credits, advances, goods payables, allocation, proration, mid-month rent changes, departures, reversals, and month closing.\
\- Bilingual design requirements, instant RTL behavior, accessibility, themes, local formatting, and Pashto review.\
\- Backup encryption, restore validation, independently edited devices, duplicate detection, conflict rejection, and interrupted-transfer recovery.\
\- Explicit assumptions, unresolved risks, release blockers, and deferred decisions.\
\
\## Ordered implementation stages\
\
1\. \*\*Validate feasibility:\*\* dependency compatibility, live RTL, nearby Android/iPhone transfer, and sustainable private iPhone distribution. Record findings before dependent implementation.\
2\. \*\*Build foundations:\*\* project structure, navigation, design tokens, localization, local settings, and error handling.\
3\. \*\*Implement persistence:\*\* SQLite migrations, financial transactions, stable identities, history, and integrity checks.\
4\. \*\*Implement management:\*\* shops, people, tenancies, rent schedules, vacancy, opening balances, and onboarding.\
5\. \*\*Implement collection:\*\* monthly charges, statuses, payments, editable allocations, credits, advances, and arrears.\
6\. \*\*Implement spending:\*\* expenses, goods payables, cash settlement, rent offsets, and personal/property categorization.\
7\. \*\*Implement lifecycle controls:\*\* departures, final settlements, reversals, archival, month closing, and reopening.\
8\. \*\*Implement reports:\*\* cash-only primary reporting, other payment methods, noncash settlements, outstanding balances, charts, and CSV.\
9\. \*\*Implement recovery:\*\* encrypted exports, validated imports, recovery copies, and reminders.\
10\. \*\*Implement device exchange:\*\* compatible-history merging, conflict checks, paired local-network transfer, and retry handling.\
11\. \*\*Polish and validate:\*\* bilingual layouts, dark mode, accessibility, realistic accounting scenarios, airplane-mode operation, and both physical phones.\
12\. \*\*Prepare delivery:\*\* private builds, installation instructions, backup/recovery guidance, and README.\
\
Each stage will include prerequisites, concrete tasks, acceptance criteria, necessary tests, and completion checkboxes.\
\
\## Required validation\
\
Cover financial calculations and reconciliation, atomic writes, repeated imports, conflicting offline changes, interrupted transfers, migrations, backup recovery, closed-month behavior, and complete offline operation.\
\
Keep confirmed decisions separate from assumptions. Preserve unresolved release blockers explicitly rather than silently choosing substitutes.\
```

---

in loop

---

```
Alright, so now I want you to go ahead and build the [...screens] and just take a look at [...screens]  reference images that I have right here, and I want you to put yourself into that loop where you compare it with the end result and you keep it trading util it is identical
```
