# Shop Rent Manager

An Expo / React Native implementation of the 31 reference designs in `design/`, using TypeScript, direct React Navigation, NativeWind, reusable themed components, and locally bundled artwork and Inter fonts.

## Current build

This milestone implements the **screen designs and interactive UI preview**. It is not yet the production financial application described in [PLAN.md](PLAN.md).

- Every reference has a corresponding screen or variant, including dark mode, Pashto/RTL, empty states, error states, and the design system.
- Bottom tabs, screen navigation, search, filters, month selectors, amount shortcuts, forms, allocation controls, dialogs, and preference changes are interactive.
- Language and appearance preferences persist locally.
- Adding shops, collecting payments, applying credit, editing rent, and recording expenses update an **in-memory sample ledger**. These records reset on application restart. Sample reports use reference fixtures and are not an accounting reconciliation of those records.
- Backup, import, nearby transfer, CSV, notification scheduling, and audited financial posting are **not connected**. Their controls explain this; no actual backup, transfer, notification, or reversal is claimed.
- Translations cover the Pashto dashboard and core navigation/preferences. Additional screens retain English fallbacks pending complete translation and fluent review.

Do not enter real financial records into this preview.

## Run

Use Node.js compatible with Expo SDK 57 and Yarn 4.18.0. Resolved dependency versions are recorded in `yarn.lock`.

```sh
yarn install --immutable
yarn start
```

For a web visual preview:

```sh
yarn web --port 8087 --max-workers 2
```

Open `http://localhost:8087`. The default screen is Collect. Open **Settings → Explore All Screens** to review every design.

Web preview URLs support `?screen=<id>`, for example:

- `/?screen=screen-gallery`
- `/?screen=add-shop`
- `/?screen=collect-rent`
- `/?screen=shop-details`
- `/?screen=backup-restore`
- `/?screen=dark-theme`
- `/?screen=pashto-home`

The full reference-to-screen registry is in `src/data.ts`. Phone frames, operating-system status bars, and decorative backgrounds around phones are presentation elements, not application screens. AFN and the interview's business decisions take precedence over rupee amounts, sign-in links, and security deposits shown in some mockups.

For mobile, use `yarn android` or `yarn ios` with an appropriate Expo development environment. iPhone simulator/runtime checks require Apple tooling or a physical device. Private iPhone distribution remains an open item in the plan.

## Verification and visual comparison loop

```sh
yarn typecheck
yarn expo install --check
yarn format:check
yarn export:web --max-workers 2
```

With the preview server running:

```sh
yarn test:visual
yarn capture:screens
yarn compare:screens
```

- Interaction tests verify navigation, search/filter behavior, expense validation, instant language changes, persisted preferences, narrow-screen forms, and disconnected-service feedback.
- Capture checks visit all 31 designs at 390 × 844, check runtime errors and document overflow, and save top/bottom screenshots.
- Comparison sheets pair cropped reference content with rendered screens; contact sheets make the screen set reviewable.
- Generated screenshots and `results.json` are in `artifacts/visual/` and excluded from Git. Comparison sheets require Python and Pillow.
- Screenshots support visual review; they do not assert pixel identity. Physical Android/iPhone runtime and gesture testing remains necessary.
- Set `PREVIEW_URL` to use another server. Browser tooling defaults to `/usr/bin/google-chrome`; set `CHROME_PATH` for another installed Chromium executable.

Tests can also use a static production export:

```sh
python -m http.server 8087 --bind 127.0.0.1 --directory dist
```

Finish exporting **before** testing against `dist`; rebuilding it temporarily removes the files being served.

Validate native bundles without launching devices:

```sh
yarn expo export --platform android --platform ios --output-dir dist-native --max-workers 2
```

## Source structure

- `App.tsx`, `index.ts`: entry, local fonts, theme/language context, navigation, feedback.
- `src/navigation.tsx`: bottom tabs, detail stack, reference preview routing.
- `src/ui.tsx`: typography, fields, cards, buttons, status indicators, chart primitives, page layout.
- `src/screens/`: main tabs, transaction forms, detail/history screens, preferences, onboarding, variants.
- `src/store.ts`: persisted preferences and a separate in-memory demo store.
- `src/i18n.ts`: English fallback and initial Pashto resources.
- `src/data.ts`: sample fixtures, artwork imports, reference-screen registry.
- `tests/`, `scripts/`: interactions, captures, visual comparison sheets.

Production persistence, accounting, migrations, encrypted recovery, and conflict-safe exchange follow the staged work in `PLAN.md`.
