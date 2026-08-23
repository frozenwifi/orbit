# Orbit acceptance report

## Visual regression

Dashboard v1 was captured before migration and again from the production Next.js build at the same 1920 × 1397 CSS viewport.

The measured component geometry was unchanged:

| Region | Before | After |
| --- | --- | --- |
| Sidebar | `0, 0, 330 × 1397` | `0, 0, 330 × 1397` |
| Sales report | `380, 180, 924 × 387` | `380, 180, 924 × 387` |
| Earnings | `1334, 180, 536 × 545` | `1334, 180, 536 × 545` |
| Recent orders | `380, 754, 1490 × 503` | `380, 754, 1490 × 503` |

The shared 1920 × 1226 capture area has a mean absolute RGB difference of `1.209 / 255`; `98.11%` of pixels have no channel differing by more than 16. The amplified difference image is retained for inspection. The current capture backend clipped the post-refactor raster at 1226px while the page's measured CSS viewport remained 1397px.

Files:

- `screenshots/dashboard-before.png`
- `screenshots/dashboard-after.png`
- `screenshots/dashboard-diff.png`

## Functional checks

- Production build and TypeScript validation pass.
- `/` and `/esims` are statically generated.
- Shell remains mounted and the active navigation state updates across routes.
- Dark mode applies and restores its persisted theme state.
- Dropdowns expose state, close on Escape and restore trigger focus.
- Pagination and global order search update the rendered table.
- At 390 × 844 CSS pixels, the mobile drawer opens/closes with matching ARIA state and no horizontal overflow.
- Keyboard focus styles, skip navigation, reduced-motion overrides, modal focus management and tab keyboard handling are present in the shared foundation.

## eSIM Management v1 acceptance

The production build was checked again after implementing `/esims`:

- `pnpm typecheck` passes.
- `pnpm build` passes; `/` and `/esims` remain statically generated.
- The desktop eSIM view renders 12 typed records, four summary metrics, six rows per page and no horizontal page overflow.
- Status, plan and destination filters work; a zero-result query renders the empty state and clears cleanly.
- Refresh renders the loading state and restores the inventory.
- Pagination moves between both data pages.
- Row-action menus move focus to the first item, close with Escape and restore their trigger state.
- Selecting an eSIM opens the focus-managed detail drawer. Overview and Activity tabs support arrow-key navigation.
- The Add eSIM modal validates and submits typed form data, updates metrics and opens the new record's details.
- Dark mode updates the eSIM surface and component tokens, then restores light mode.
- At the narrow browser test width (`358 × 774` CSS pixels), summary metrics stack, table rows become management cards, the mobile navigation remains operable and document overflow is false.
- Runtime console errors: none.

Dashboard was recaptured after the feature work. The final capture viewport was two CSS pixels wider than the saved baseline (`1922` versus `1920`), and every flexible region grew by exactly those two pixels while fixed dimensions and positions remained unchanged. Normalizing the screenshots to the same raster produced a mean absolute RGB difference of `0.774 / 255`; `98.71%` of pixels had no channel differ by more than 16.

Phase files:

- `screenshots/esims-desktop.png`
- `screenshots/esims-mobile.png`
- `screenshots/dashboard-before-esims.png`
- `screenshots/dashboard-after-esims.png`
- `screenshots/dashboard-esims-diff.png`

## Customer Management v1 acceptance

The Customer phase was validated against the optimized production build:

- `pnpm typecheck` equivalent (`tsc --noEmit`) passes.
- `next build` passes and statically generates `/`, `/esims` and `/customers`.
- `/customers` renders 12 typed customer records, four live summary metrics, six rows per page and no horizontal page overflow.
- Search covers customer name, email, phone and customer ID. Customer status, eSIM status, country/market and joined-date filters are present and keyboard accessible.
- The detail drawer exposes keyboard tabs for Overview, eSIMs, Usage and Activity. Linked eSIMs navigate to the existing `/esims` drawer; assigned customers navigate back to the existing customer drawer.
- Add/edit customer, optional initial assignment, Assign eSIM and Add eSIM flows update the shared in-memory domain state. Archive uses the reusable confirmation modal.
- Loading, empty/search-no-results and error states reuse the shared collection-state primitive.
- At 390 × 844 CSS pixels, metrics stack, table rows become management cards, the mobile menu remains available, dark mode has token parity and document overflow is false.
- Dashboard, eSIM and Customer routes were checked at desktop and mobile widths in light and dark mode. Application console/page errors: none.

Dashboard and eSIM baselines were captured before the Customer phase and recaptured from the final production build at the same 1922 × 1227 raster. Flexible geometry and rendered content remain unchanged. The image comparison measured:

| Route | Mean absolute RGB difference | Pixels within 16/channel |
| --- | ---: | ---: |
| Dashboard | `1.578 / 255` | `96.74%` |
| eSIM Management | `1.375 / 255` | `97.71%` |

The residual differences are rasterization/JPEG antialiasing noise; the amplified difference images show matching component geometry and content.

Customer phase files:

- `screenshots/customers-desktop.png`
- `screenshots/customers-mobile.png`
- `screenshots/customers-mobile-dark.png`
- `screenshots/dashboard-before-customers.png`
- `screenshots/dashboard-after-customers.png`
- `screenshots/dashboard-customers-diff.png`
- `screenshots/esims-before-customers.png`
- `screenshots/esims-after-customers.png`
- `screenshots/esims-customers-diff.png`

## Data Plans v1 acceptance

The Data Plans phase was validated against the final optimized production build:

- TypeScript validation (`tsc --noEmit`) passes.
- `next build` passes and statically generates `/`, `/esims`, `/customers` and `/data-plans`.
- `/data-plans` renders 10 normalized typed plans, four calculated summary metrics, six rows per page and no desktop table or document overflow at 1922 × 1227.
- Search by plan/coverage/ID, status/coverage/allowance/validity filters, pagination and search-no-results state were exercised successfully.
- The plan drawer renders calculated pricing, five coverage markets, linked eSIM inventory and activity tabs. Plan → eSIM/customer and eSIM → Plan route-query drawer navigation all resolve the existing entity detail experiences.
- Add, edit and duplicate flows update the shared provider state; duplication produced a separate `PLAN-1101` entity. The pricing preview calculated £8.19 gross profit and 54.6% gross margin from £6.80 wholesale and £14.99 retail values.
- Archive uses the reusable destructive confirmation modal. Shared modal stacking was verified above an already-open detail drawer, with working pointer and keyboard focus behavior.
- All four routes were tested at 390 × 844: Data Plans metrics stack to one column, the table becomes management cards, mobile navigation remains available and document overflow is false.
- All four routes were tested in persisted dark mode at desktop. `/data-plans` was also checked in dark mode at mobile width; document overflow is false.
- Final in-app browser console/page errors: none. HTTP error responses: none.

Dashboard, eSIM and Customer baselines were captured before this phase and recaptured from the final production build at the same 1922 × 1227 raster:

| Route | Mean absolute RGB difference | Pixels within 16/channel | Exact pixels |
| --- | ---: | ---: | ---: |
| Dashboard | `0.000 / 255` | `100.00%` | `100.00%` |
| eSIM Management | `0.039 / 255` | `99.94%` | `99.79%` |
| Customer Management | `0.000 / 255` | `100.00%` | `100.00%` |

The eSIM residual is limited to subpixel/raster timing noise; layout, text and component geometry are unchanged. Dashboard and Customer captures are pixel-identical.

Data Plans phase files:

- `screenshots/data-plans-desktop.png`
- `screenshots/data-plans-desktop-dark.png`
- `screenshots/data-plans-mobile.png`
- `screenshots/data-plans-mobile-dark.png`
- `screenshots/dashboard-before-data-plans.png`
- `screenshots/dashboard-after-data-plans.png`
- `screenshots/dashboard-data-plans-diff.png`
- `screenshots/esims-before-data-plans.png`
- `screenshots/esims-after-data-plans.png`
- `screenshots/esims-data-plans-diff.png`
- `screenshots/customers-before-data-plans.png`
- `screenshots/customers-after-data-plans.png`
- `screenshots/customers-data-plans-diff.png`

## Networks v1 acceptance

The Networks phase was validated against the final optimized production build:

- TypeScript validation (`tsc --noEmit`) passes.
- `next build` passes and statically generates `/`, `/esims`, `/customers`, `/data-plans` and `/networks`.
- `/networks` resolves 29 normalized networks across 25 countries and 29 operators. The desktop page renders four live summary metrics, six rows per page and no table or document overflow at 1922 × 1227.
- Search by country, operator or MCC/MNC; region, technology, status and operator filters; pagination; loading; and search-no-results behavior were exercised successfully.
- The detail drawer exposes Overview, Plans, Connections and Activity tabs plus typed mock availability, activation success, latency and active-connection metrics.
- Network → Plan → Network → eSIM → Network navigation opens the existing entity drawer on each destination route. eSIM → Customer navigation was also verified against the normalized shared domain.
- Add and edit flows update the shared mock provider. Duplicate combined MCC/MNC `268 / 06` was rejected, while unique `999 / 01` was accepted. Disable uses the reusable destructive confirmation modal; enable restores the catalog entry.
- All five routes were tested at 1922 × 1227 and 390 × 844 in light and persisted dark mode, including reduced-motion mode. Every configuration had zero document overflow, console/page errors and HTTP error responses.

Dashboard, eSIM, Customer and Data Plans baselines were captured before this phase and recaptured from the final production build at the same 1922 × 1227 raster. All four protected routes are pixel-identical:

| Route | Changed pixels | Mean absolute RGB difference | Exact pixels |
| --- | ---: | ---: | ---: |
| Dashboard | `0 / 2,358,294` | `0.000 / 255` | `100.00%` |
| eSIM Management | `0 / 2,358,294` | `0.000 / 255` | `100.00%` |
| Customer Management | `0 / 2,358,294` | `0.000 / 255` | `100.00%` |
| Data Plans | `0 / 2,358,294` | `0.000 / 255` | `100.00%` |

Networks phase files:

- `screenshots/networks-desktop.png`
- `screenshots/networks-desktop-dark.png`
- `screenshots/networks-mobile.png`
- `screenshots/networks-mobile-dark.png`
- `screenshots/dashboard-before-networks.png`
- `screenshots/dashboard-after-networks.png`
- `screenshots/dashboard-networks-diff.png`
- `screenshots/esims-before-networks.png`
- `screenshots/esims-after-networks.png`
- `screenshots/esims-networks-diff.png`
- `screenshots/customers-before-networks.png`
- `screenshots/customers-after-networks.png`
- `screenshots/customers-networks-diff.png`
- `screenshots/data-plans-before-networks.png`
- `screenshots/data-plans-after-networks.png`
- `screenshots/data-plans-networks-diff.png`

## Core Integration v1 acceptance

The architecture-only integration phase was validated against the optimized production build without adding routes or changing approved screens:

- TypeScript validation and `next build` pass. All five approved routes remain statically generated.
- UI modules no longer import raw fixtures. Customer, eSIM, Plan, Network, Operator, Country and unified Activity data resolve through `LocalOrbitRepository` from one `OrbitDomainState`.
- Development-time integrity validation passes for duplicate IDs, missing relationships, invalid coverage/network/operator/country links, duplicate MCC/MNC and orphaned activity targets.
- Direct entity URLs open the correct existing drawer for Customer, eSIM, Plan and Network. Customer → eSIM → Plan → Network and the reverse journey were exercised successfully.
- Browser Back and Forward restore each prior route and drawer state. Closing a drawer removes its query parameter without creating an extra history step.
- A live eSIM reassignment updated the eSIM drawer, destination Customer count, Plan inventory count and Network connection count in the same session. Suspension propagated to linked lists; archiving a customer preserved readable historical references while disabling new assignment actions.
- Escape closes only the top modal, modal close restores trigger focus, detail tabs remain keyboard operable and tablet/mobile row menus reposition inside the viewport.
- Loading/empty/search-no-results/error treatments remain available through the shared collection-state primitive. Invalid or unavailable relationships render guarded UI and cannot be selected by mutation flows.

The final regression matrix covered five routes × three viewports (`1922 × 1227`, `820 × 1180`, `390 × 844`) × light/dark mode: 30 page configurations total. All reported zero document horizontal overflow, runtime console/page errors and failed HTTP responses. At tablet and mobile widths, all four management drawers, Add modals and row menus remained inside the viewport.

Before/after screenshots were compared at the same 1922 × 1227 raster:

| Route | Changed pixels | Maximum channel delta | Exact pixels |
| --- | ---: | ---: | ---: |
| Dashboard | `0 / 2,358,294` | `0` | `100.000%` |
| eSIM Management | `0 / 2,358,294` | `0` | `100.000%` |
| Customer Management | `0 / 2,358,294` | `0` | `100.000%` |
| Data Plans | `0 / 2,358,294` | `0` | `100.000%` |
| Networks | `752 / 2,358,294` | `1 / 255` | `99.968%` |

The Networks difference is confined to the 43 × 43 header-avatar raster and never exceeds one RGB level; all UI geometry, content and component pixels outside that codec/raster boundary are exact.

Core Integration phase files:

- `screenshots/dashboard-before-core.png`
- `screenshots/dashboard-after-core.png`
- `screenshots/esims-before-core.png`
- `screenshots/esims-after-core.png`
- `screenshots/customers-before-core.png`
- `screenshots/customers-after-core.png`
- `screenshots/data-plans-before-core.png`
- `screenshots/data-plans-after-core.png`
- `screenshots/networks-before-core.png`
- `screenshots/networks-after-core.png`
- `screenshots/networks-core-diff.png`

## Operations v1 acceptance

Orbit Operations v1 was validated against the final optimized production build:

- TypeScript validation and `next build` pass. `/operations` and all five protected routes are statically generated.
- `/operations` renders 15 normalized typed operation records and lifecycle events. All Customer, eSIM, Plan and Network presentation values resolve from canonical IDs through `LocalOrbitRepository`.
- Summary cards derive two activations today, two pending/processing records, two failures, ten successful operations, an 83% success rate and average terminal duration from the operation collection.
- Search covers operation ID, customer, eSIM/ICCID, Plan and Network/operator. Type, status, Today/7-day/30-day/all-time and Network filters, pagination and search-no-results behavior are present through existing Orbit controls.
- Direct `/operations?operation=OP-2405` opens the failed-operation drawer with `PROVIDER_TIMEOUT`, human-readable context, failed step and four ordered lifecycle events. Closing restores `/operations`.
- Operation → Customer → eSIM → Plan → Network reused the existing canonical drawers. Browser Back returned to the Operation drawer and Forward restored the Customer drawer.
- Retrying `OP-2405` created `OP-6000` in `processing`, linked it to its retry origin, then deterministically added provider acceptance/completion events and moved it to `completed` after the fixed mock interval.
- Changing `ES-9821` from Europe Plus to Global 15 GB through the existing eSIM assignment modal immediately created a completed `Plan assigned` operation with the updated Customer/eSIM/Plan/Network relationships in the same browser session.
- Escape closed the Operation drawer, restored focus to the originating row button and removed the detail query. The shared drawer body scrolls within the shell viewport; tablet/mobile drawers and row menus remain fully inside the viewport.
- The final matrix covered six routes × three viewports (`1922 × 1227`, `820 × 1180`, `390 × 844`) × light/dark mode: 36 configurations. All 36 had zero document horizontal overflow, console/page errors and failed HTTP responses.

Protected routes were captured before and after at 1922 × 1227. Component geometry and content are unchanged. The only intentional high-contrast shell change is the existing `Logs` placeholder becoming the required `Operations` navigation destination, using the same slot, icon and styling. Outside that label, Customers, Data Plans and Networks have no main-content channel delta above `4 / 255`; eSIM Management has no main-content delta above `16 / 255`. Dashboard's capture has `924 / 1,953,384` main-content pixels above `16 / 255` (`0.0473%`), confined to animated/chart and JPEG rasterization edges. Full-image mean absolute channel differences remain between `0.039` and `0.153 / 255`; amplified diffs show matching layout and content.

Operations phase files:

- `screenshots/operations-desktop.png`
- `screenshots/operations-tablet.png`
- `screenshots/operations-mobile.png`
- `screenshots/dashboard-before-operations.png`
- `screenshots/dashboard-after-operations.png`
- `screenshots/dashboard-operations-diff.png`
- `screenshots/esims-before-operations.png`
- `screenshots/esims-after-operations.png`
- `screenshots/esims-operations-diff.png`
- `screenshots/customers-before-operations.png`
- `screenshots/customers-after-operations.png`
- `screenshots/customers-operations-diff.png`
- `screenshots/data-plans-before-operations.png`
- `screenshots/data-plans-after-operations.png`
- `screenshots/data-plans-operations-diff.png`
- `screenshots/networks-before-operations.png`
- `screenshots/networks-after-operations.png`
- `screenshots/networks-operations-diff.png`

## Superadmin eSIM Figma parity acceptance

The `/esims` presentation was realigned to the supplied blue/light Superadmin `eSIMs tab-1` export without replacing the canonical Customer/eSIM/Plan/Network/Operation repository or shared client-side store:

- The Superadmin inventory now uses the requested compact fields: ID, Date Assigned, eSIM ICCID, eSIM Status, Subtenant, eSIM Tag and actions. The prior four metric cards were removed and Export Excel was restored.
- Subtenant names resolve from canonical `customerId` relationships. Add, assignment, plan and status mutations continue through `DomainProvider` and generate the same normalized cross-product state updates.
- The primary eSIM detail experience is a routed workspace with Summary, Activation and eSIM usage logs tabs. Summary contains eSIM details, Network visualization and Data Plans; Activation contains the QR/manual-install experience; usage logs cover both populated and Figma-aligned empty states.
- Workspace state deep-links through `?esim=…&tab=…`; direct load, browser Back and browser Forward were exercised successfully.
- The Superadmin Add eSIM dialog is keyboard accessible, focuses its first control, closes on Escape and restores focus to Add eSIM.
- The final matrix covered six routes × three viewports (`1922 × 1227`, `820 × 1180`, `390 × 844`) × light/dark mode: all 36 configurations passed with no horizontal overflow, console/page errors or failed HTTP responses.
- TypeScript validation and the optimized production build pass; all six routes remain statically generated.

Protected routes were recaptured at the same 1922 × 1227 raster. Dashboard differs in only `91 / 2,358,294` pixels (`0.0039%`); Customers, Data Plans, Networks and Operations each differ in `659 / 2,358,294` pixels (`0.0279%`). Visual inspection confirms identical geometry and content; the residual is confined to low-level raster/antialiasing noise. A shared three-dot action style formerly colocated with eSIM CSS was moved into `styles/components.css`, eliminating native-button regressions on the protected management routes.

Superadmin eSIM phase files:

- `screenshots/esims-superadmin-desktop.png`
- `screenshots/esims-superadmin-mobile.png`
- `screenshots/esims-superadmin-summary.png`
- `screenshots/esims-superadmin-activation.png`
- `screenshots/esims-superadmin-usage-empty.png`
- `screenshots/esims-superadmin-add-modal.png`
- `screenshots/dashboard-after-esims-superadmin.png`
- `screenshots/customers-after-esims-superadmin.png`
- `screenshots/data-plans-after-esims-superadmin.png`
- `screenshots/networks-after-esims-superadmin.png`
- `screenshots/operations-after-esims-superadmin.png`

## Superadmin Networks Figma parity acceptance

The Networks presentation was realigned to the supplied blue/light and blue/dark Superadmin exports while retaining the normalized Core Integration store, repository, relationships and canonical detail mutations:

- The reference audit identified `Networks tab-1.svg` as the light Superadmin source and `Networks tab-3.svg` as the dark Superadmin source. The green Admin `Networks tab.svg` and `Networks tab-2.svg` were excluded.
- Networks is now an expandable sidebar parent with routed Regions and Network operators children. `/networks` and `/networks/operators` are both statically generated.
- Regions reproduces the eight approved geographic tabs, separate Search button, Export excel action, compact Country/ISO3/ISO2/APN/Auto APN/Wi-Fi Hotspot table, capability pills and footer pagination.
- Network operators reproduces the same tabs/toolbar/card system with Country/ISO3/Network/Logo/PLMN/MCCMNC/3G/4G LTE/5G columns and the exact supplied Ooredoo, Andorra Telecom, FLOW, Movistar, Viva/MTS, Setar and Optus logo assets.
- Superadmin catalog rows resolve through `LocalOrbitRepository` from canonical `Country`, `Operator` and `Network` entities. The pre-existing Plan/eSIM/Customer relationships, network mutations and detail tabs remain available through `/networks?network=…`.
- Regional tabs support Arrow/Home/End keyboard control and store their state in `?region=…`. Direct URLs plus browser Back and Forward were exercised successfully.
- Search/no-results, pagination, Excel export feedback, operator-to-detail routing and Escape dismissal of the retained Network drawer were browser-tested.
- Desktop Figma geometry was measured in the optimized app: sidebar `330px`; content/card x-origin `380px`; tabs ending at `y=247px`; card origin `y=277px`; Regions card height `742.8px`; Network operators card height `682.8px`. No desktop document overflow was present.
- The final browser matrix covered seven routes × three viewports (`1922 × 1227`, `820 × 1180`, `390 × 844`) × light/dark mode: all 42 configurations passed with zero horizontal-overflow failures and zero runtime console errors.
- TypeScript validation and the optimized production build pass; all seven routes are statically generated.

Dashboard, eSIM, Customers, Data Plans and Operations were recaptured from the same production build and inspected against the saved pre-Networks captures. Normalized comparison mean maximum-channel deltas were `2.69–3.62 / 255`; the residual is attributable to the in-app browser screenshot scale/JPEG resampling path. Component geometry, content and protected-route appearance are unchanged. The side-by-side Networks comparisons retain the supplied frame and final implementation in one artifact for direct inspection.

Superadmin Networks phase files:

- `screenshots/networks-superadmin-regions-desktop.png`
- `screenshots/networks-superadmin-operators-desktop.png`
- `screenshots/networks-superadmin-regions-dark-desktop.png`
- `screenshots/networks-superadmin-operators-dark-desktop.png`
- `screenshots/networks-superadmin-regions-comparison.png`
- `screenshots/networks-superadmin-operators-comparison.png`
- `screenshots/dashboard-after-networks-superadmin.png`
- `screenshots/esims-after-networks-superadmin.png`
- `screenshots/customers-after-networks-superadmin.png`
- `screenshots/data-plans-after-networks-superadmin.png`
- `screenshots/operations-after-networks-superadmin.png`

## Superadmin API Keys Figma parity acceptance

The `/api-keys` implementation was checked directly against the four blue/light Superadmin frames isolated from `API keys tab-1.svg`. The green Admin exports were excluded; `API keys tab-3.svg` informed dark parity.

- TypeScript validation passes and the optimized Next.js build succeeds. `/api-keys` and every protected route remain statically generated.
- Default state reproduces the selected API keys navigation item, title/action row, separate search submit, Export excel control, compact APP NAME/API KEY/API SECRET table, mask/reveal icons, red revoke actions, pagination and Nova/Orbit footer.
- New API Application uses the Figma 516 × 264 dialog at the supplied full-frame position. The overlay covers and blurs the complete shell; the name input receives initial focus, Tab/Shift+Tab remain trapped, Escape/Cancel close, and focus restoration is supplied by the shared modal primitive.
- Creating `Nova` added a canonical in-session `ApiApplication`, revealed its generated mock secret in the first row and displayed the exact Figma success copy/placement. No real key material or backend is used.
- Revoke confirmation reproduces the Figma title, warning, buttons and overlay while also showing the requested API-key reference. Confirming removed the entity and changed the table total from 12 to 11.
- Search reduced the table to the single matching key; clearing restored the catalog. Page 2 rendered the remaining records and disabled Next. Export excel completed without a runtime error.
- Desktop light/dark, mobile light/dark and tablet dark checks reported zero document horizontal overflow. The final browser runtime log was empty.
- Dashboard rendered from the same production client with no runtime errors after this phase. The API stylesheet is route-scoped; shared changes are opt-in (`Modal.portal`) or presentation-neutral (`CatalogToolbar` extraction), and no protected-route selectors or tokens changed.
- The final post-fix server restart and subsequent protected-route recapture were not completed because the environment approval service rejected the local-process restart after its execution allowance was exhausted. The final responsive fix itself compiled in the successful optimized build. Existing accepted protected-route baselines remain in `screenshots/`.

API Keys phase files:

- `screenshots/api-keys-default.png`
- `screenshots/api-keys-new-application-modal.png`
- `screenshots/api-keys-created-success.png`
- `screenshots/api-keys-remove-confirmation.png`
- `screenshots/api-keys-default-comparison.png`
- `screenshots/api-keys-new-application-modal-comparison.png`
- `screenshots/api-keys-created-success-comparison.png`
- `screenshots/api-keys-remove-confirmation-comparison.png`
