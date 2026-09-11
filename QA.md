# Orbit acceptance report

## Admin eSIM Figma parity acceptance

The `/admin/esims` phase was implemented from the 11 light and 11 dark states isolated from the supplied green Admin `eSIMs tab.svg` and `eSIMs tab-3.svg` exports. The blue Superadmin exports were excluded.

- Default catalog: eSIMs heading, green Add eSIM, compact Search/separate submit, Export excel, exact ID/DATE ASSIGNED/ESIM ICCID/ESIM STATUS/TOTAL USAGE/CUSTOMER/ESIM TAG structure, red remove control, pagination and footer.
- New eSIM: exact three-field order, View products control, validation messages, Cancel/Save geometry and full-shell portal overlay. The flow resolves only organization-owned plans/customers and creates a canonical eSIM through `DomainProvider`.
- Workspace: canonical query-backed Summary, Activation and eSIM usage logs tabs; exact identity treatment; details/network chart/data-plan cards; extracted Figma QR; instructions/tips; and supplied empty-log state.
- Actions: tag edit, block, reactivate and remove are guarded by organization scope. Confirmation layers retain the Figma modal geometry; remove renders the supplied success notice.
- Supplied loading: `/admin/esims?state=loading` reproduces the full-frame spinner/`Loading..`/footer treatment.
- Desktop geometry was measured in the optimized app: New eSIM `702,185,516 × 499`; invalid New eSIM `702,185,516 × 564`; confirmation `702,185,516 × 257`; detail tabs `380,180,1490 × 75`; and Summary cards beginning at the Figma `y=286` baseline. The delete-success notice measures `388 × 80` at `1482,90`.
- Responsive QA at desktop (`1920px`), tablet (`1280px`) and mobile (`390px`) reported no document horizontal overflow. The mobile catalog becomes labelled cards, the Admin navigation opens as a `280px` accessible drawer, and the activation QR remains bounded at `243.5px` inside the mobile viewport.
- Light and dark catalog/workspace/dialog states use the green Admin palettes; persisted theme selection remains shared with the approved shell.
- Keyboard checks cover modal initial focus, forward/reverse Tab trapping, Escape dismissal, Add eSIM trigger-focus restoration, tab activation and visible focus states. Reduced-motion behavior inherits the Admin shell override.
- Search, search-no-results, Excel export and both pagination pages were exercised. Page 2 renders the remaining three seeded records and reports `Showing 10 to 12 of 12 entries`.
- Add eSIM created scoped record `ES-9900` with the selected organization-owned plan/customer; the repository projection immediately surfaced its generated ICCID, `Lena Ortiz` relationship and `QA Admin` tag in the catalog.
- Direct Summary/Activation/usage URLs reconstruct the selected tab. Block, reactivate and remove mutations were exercised against the organization-guarded commands.
- `/admin`, `/`, and Superadmin `/esims` were reopened from the same production build at desktop width. Each retained its approved heading, reported zero horizontal overflow and produced no runtime console messages.
- TypeScript (`tsc --noEmit`) and the optimized Next.js build pass; the final output contains 19 routes and `/admin/esims` is statically generated.

All 11 supplied light states and all 11 dark states are stored under `screenshots/admin-esims-*`. `admin-esims-light-comparison-sheet.png` and `admin-esims-dark-comparison-sheet.png` pair every exact Figma crop with its corresponding production capture. Protected-route captures are retained as `admin-dashboard-regression-final.png`, `superadmin-dashboard-regression-final.png` and `superadmin-esims-regression-final.png`.

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

## Superadmin Subtenants Figma parity acceptance

The Subtenants route family was implemented from the ten blue/light Superadmin frames isolated from `Subtenants.svg`; the dark export supplies theme parity. No unrelated green Admin screen was used as a presentation reference.

- Brand-VNO, Business roaming and Influencers reproduce the compact Figma title/action, search/export toolbar, table density, pagination and Nova/Orbit footer. Each creation dialog uses the supplied modal geometry and feeds the shared in-session domain state.
- The Brand-VNO workspace resolves organization details, recent eSIM orders, customers and influencers through repository relationships. Edit, block/unblock and delete/archive actions update the canonical entity; destructive actions use the supplied confirmation treatment.
- Sidebar child routes, detail links, browser Back/Forward and direct URLs are stable. The scoped API child is intentionally limited to the title/footer state represented by the supplied information architecture rather than inventing an API product surface.
- Desktop, mobile and dark-mode checks reported no document horizontal overflow. Search, pagination, all three creation flows, success state, block/unblock, delete confirmation, modal autofocus and Escape dismissal were exercised in the browser with an empty runtime error log.
- Dashboard, eSIMs, Customers, Data Plans, Networks, Operations and API Keys were reopened from the same application shell and retained their approved headings, geometry and behavior.
- `pnpm typecheck` and the optimized `next build` pass. The production output contains 16 routes, including all five Subtenants destinations and the dynamic Brand-VNO detail route.

Subtenants phase files:

- `screenshots/subtenants-brand-vno.png`
- `screenshots/subtenants-business-roaming.png`
- `screenshots/subtenants-influencers.png`
- `screenshots/subtenants-new-subtenant-modal.png`
- `screenshots/subtenants-business-roaming-modal.png`
- `screenshots/subtenants-add-influencer-modal.png`
- `screenshots/subtenants-success.png`
- `screenshots/subtenants-brand-vno-detail.png`
- `screenshots/subtenants-blocked-state.png`
- `screenshots/subtenants-delete-confirmation.png`
- `screenshots/subtenants-brand-vno-comparison.png`
- `screenshots/subtenants-business-roaming-comparison.png`
- `screenshots/subtenants-influencers-comparison.png`
- `screenshots/subtenants-new-subtenant-modal-comparison.png`
- `screenshots/subtenants-business-roaming-modal-comparison.png`
- `screenshots/subtenants-add-influencer-modal-comparison.png`
- `screenshots/subtenants-success-comparison.png`
- `screenshots/subtenants-brand-vno-detail-comparison.png`
- `screenshots/subtenants-blocked-state-comparison.png`
- `screenshots/subtenants-delete-confirmation-comparison.png`

## Superadmin Team Figma parity acceptance

The `/team` implementation was audited against the supplied Superadmin exports before coding. `Users.svg` contains the light default, New user and remove-user frames; `Team-2.svg` contains the equivalent dark frames. The green Admin `Team.svg` and `Team-1.svg` boards were excluded.

- TypeScript validation and the optimized Next.js build pass. The production output now contains 17 routes and `/team` is statically generated.
- The light default catalog measures `380, 180, 1490 × 742` at the exact 1920 × 1397 CSS viewport. It reproduces Team heading/action placement, separate search control, compact NAME/EMAIL/USER TYPE table, recovery/edit/remove actions, pagination, entries copy and Nova/Orbit footer.
- The New user dialog measures `702, 185, 516 × 768` in the light frame and `702, 197, 516 × 768` in the dark frame. Name, Email, Password, Admin/Manager role, four permission switches and Cancel/Save match the supplied order and geometry.
- The destructive confirmation measures `516 × 217`, reproduces the supplied immediate/permanent warning copy, and uses the Figma Cancel/Confirm treatment. Cancel restores focus; Confirm removes the canonical Team user.
- Creating a typed mock user updated the shared collection from 12 to 13 records. Editing reused the same form and retained the user's canonical values; inline role changes, permission toggles and the deterministic recovery command all updated shared in-session state. Removing the created user restored the original 12-record catalog.
- Search matched by name/email/role and rendered a zero-row result with correct entries copy. Clearing restored both pages; page 2 rendered the remaining records with `aria-current="page"` on its control.
- Modal dialog focus, forward and reverse focus wrapping, Escape dismissal and trigger-focus restoration were exercised. Permission switches expose `role="switch"` and `aria-checked`; every row action has an accessible name.
- Desktop light/dark and 390 × 844 mobile light/dark checks reported zero document horizontal overflow. The mobile table converts to labelled management cards and the 358px-wide user dialog remains inside the 390px viewport.
- Dashboard, eSIMs, Data Plans, Networks, Operations, API Keys, Customers, Brand-VNO, Business roaming and Influencers were reopened from the final production build at 1920 × 1397. All retained their approved heading and reported zero horizontal overflow. The final browser runtime log was empty.

Team phase files:

- `screenshots/team-users-default.png`
- `screenshots/team-users-new-user.png`
- `screenshots/team-users-remove-user.png`
- `screenshots/team-users-default-dark.png`
- `screenshots/team-users-new-user-dark.png`
- `screenshots/team-users-remove-user-dark.png`
- `screenshots/team-users-default-comparison.png`
- `screenshots/team-users-new-user-comparison.png`
- `screenshots/team-users-remove-user-comparison.png`
- `screenshots/team-users-default-dark-comparison.png`
- `screenshots/team-users-new-user-dark-comparison.png`
- `screenshots/team-users-remove-user-dark-comparison.png`
- `screenshots/regression-dashboard-after-team.png`
- `screenshots/regression-esims-after-team.png`
- `screenshots/regression-data-plans-after-team.png`
- `screenshots/regression-networks-after-team.png`
- `screenshots/regression-operations-after-team.png`
- `screenshots/regression-api-keys-after-team.png`
- `screenshots/regression-customers-after-team.png`
- `screenshots/regression-subtenants-brand-vno-after-team.png`
- `screenshots/regression-subtenants-business-roaming-after-team.png`
- `screenshots/regression-subtenants-influencers-after-team.png`

## Admin Customers Figma parity acceptance

The `/admin/customers` implementation was audited against all five 1920 × 1397 light frames in `Customers tab.svg` and all five dark counterparts in `Customers tab-1.svg`. The Superadmin Customer route and all blue exports were excluded as visual references.

- The desktop list measures the approved `330px` sidebar, `80px` top bar, `50px` content gutters, `380px` content origin, `1490px` card width and approximately `742px` catalog height. It reproduces the exact notice copy, separated Search control, Export excel action, six supplied data columns, 60px rows, edit/delete actions, entries copy, pagination and footer placement.
- New Customer measures `702, 185, 516 × 594`; delete confirmation measures `702, 185, 516 × 264`. Both use the shared portal dialog with panel announcement, forward/reverse Tab trapping, Escape dismissal, body scroll locking and trigger-focus restoration.
- Add and edit update canonical organization-scoped Customers through provider commands. Delete removes the Customer, detaches its eSIMs to the organization root, dismisses the dialog and renders the supplied success copy. Search, no-results, pagination and Export excel invocation were exercised.
- Customer detail is URL-backed with `?customer=…`; direct load plus browser Back/Forward reconstruct list/detail state. The details card, canonical eSIM projection, eSIM-to-`/admin/esims` navigation, date-range control and typed green expense chart were exercised.
- The 390 × 844 light/dark list, modal and detail checks report zero document horizontal overflow. The desktop light/dark checks also report zero overflow. Modal width remains within the mobile viewport and each detail card resolves to the available content width.
- Direct Figma-to-production comparisons cover all ten supplied light/dark states. Mean absolute channel deltas are `1.630–6.665 / 255`; the form and confirmation dialogs measure `1.630–3.673 / 255`, with matching overlay and panel geometry.
- `pnpm typecheck` and the optimized Next.js build pass across all 20 routes. The runtime console error log and failed-response log are empty. Protected Admin Dashboard, Admin eSIMs, Superadmin Dashboard and Superadmin eSIMs routes were recaptured with zero document overflow by `work/admin-customers-visual-qa.mjs`.

Admin Customers phase files:

- `screenshots/admin-customers-list-light.png`
- `screenshots/admin-customers-new-modal-light.png`
- `screenshots/admin-customers-delete-confirmation-light.png`
- `screenshots/admin-customers-delete-success-light.png`
- `screenshots/admin-customers-detail-light.png`
- `screenshots/admin-customers-list-dark.png`
- `screenshots/admin-customers-new-modal-dark.png`
- `screenshots/admin-customers-delete-confirmation-dark.png`
- `screenshots/admin-customers-delete-success-dark.png`
- `screenshots/admin-customers-detail-dark.png`
- `screenshots/admin-customers-mobile-light.png`
- `screenshots/admin-customers-mobile-dark.png`
- `screenshots/admin-customers-*-comparison.png`
- `screenshots/regression-admin-dashboard-after-admin-customers.png`
- `screenshots/regression-admin-esims-after-admin-customers.png`
- `screenshots/regression-superadmin-dashboard-after-admin-customers.png`
- `screenshots/regression-superadmin-esims-after-admin-customers.png`

## Admin Dashboard Figma parity acceptance

The separate `/admin` application was implemented from the green Admin dashboard exports only. `Dashboard tab-1.svg` supplied the populated and empty light states, and `Dashboard tab-3.svg` supplied the populated and empty dark states. The blue Superadmin dashboard exports were explicitly excluded from the Admin presentation audit.

- The production desktop composition was verified at the Figma viewport of `1920 × 1397`: `330px` sidebar, `80px` top bar, `50px` content gutters, `924 × 387` Sales reports card, `536 × 544` Earnings card, three KPI cards and the exact recent-orders table/footer composition.
- The Admin shell has its own logo, navigation order, labels, icons, active/expanded states, top-bar search and Jane Doe account controls. It is route-gated beneath `/admin`; existing Superadmin routes continue through the original shell unchanged.
- Populated and empty dashboard data states were checked in light and dark mode. `/admin?state=empty` exposes the supplied empty-frame state without adding visible product functionality.
- Sales/recent-order date selectors, earnings period selection, dashboard search, table pagination, report export feedback, theme switching, notifications/profile menus and expandable Networks/API navigation were exercised in the production browser.
- Search was regression-tested after navigating to page 2 and correctly reset pagination before rendering the matching order.
- Desktop (`1920 × 1397`), tablet (`805px`) and mobile (`375px`) light/dark checks reported zero document horizontal overflow. Mobile navigation is an accessible off-canvas panel and the order table converts to labelled cards.
- Controls use native buttons/inputs, explicit accessible names, shared keyboard-aware dropdown behavior, visible focus states and reduced-motion media handling. No Next.js error overlay or runtime console error was present during the final browser pass.
- The optimized production build succeeds with 18 routes; `/admin` is a dynamic server route because it reads the supplied state query. TypeScript validation passes.
- Superadmin `/`, `/esims` and `/api-keys` were reopened from the same production build at `1920px`; their approved headings, shell geometry and zero-overflow behavior were retained. The Dashboard before/after capture is visually unchanged apart from the chart's capture-time animation position and image encoding.
- Each final Admin state is paired directly with its corresponding exact `1920 × 1397` Figma reference in a side-by-side comparison artifact.

Admin Dashboard phase files:

- `screenshots/admin-dashboard-final-light.jpg`
- `screenshots/admin-dashboard-final-dark.jpg`
- `screenshots/admin-dashboard-final-light-empty.jpg`
- `screenshots/admin-dashboard-final-dark-empty.jpg`
- `screenshots/admin-dashboard-mobile-light.jpg`
- `screenshots/admin-dashboard-mobile-dark.jpg`
- `screenshots/admin-dashboard-light-comparison.png`
- `screenshots/admin-dashboard-dark-comparison.png`
- `screenshots/admin-dashboard-light-empty-comparison.png`
- `screenshots/admin-dashboard-dark-empty-comparison.png`
- `screenshots/admin-phase-superadmin-after.jpg`
- `screenshots/admin-phase-superadmin-diff.png`

## Admin Billing Figma parity acceptance

`/admin/billing` was audited against all five `1920 × 1397` green/light frames in `Billing tab.svg` and all five green/dark counterparts in `Billing tab-1.svg`. No blue Superadmin billing or generic finance interface was used as a presentation reference.

- TypeScript validation passes. The optimized Next.js production build passes and statically generates `/admin/billing` alongside all existing routes.
- Final desktop geometry matches the Figma baseline: `330px` sidebar, `80px` topbar, `380px` content origin, `326 × 320` credit card, `29px` card gap, `1490 × 503` invoice card, `516px` standard-dialog width at `y=185`, and `652 × 1046` invoice dialog. The page footer finishes inside the `1397px` frame without creating a scrollbar.
- Credit submission changed the scoped balance from `$0.00 USD` to `$50.00 USD`. Adding the deterministic mock `•••• 9911 (GBP)` method expanded the methods card instead of clipping the new row; setting it primary moved the visible primary state; confirming removal returned the organization to three methods.
- Invoice pagination rendered two page-2 records with `Showing 11 to 12 of 12 entries`. View more opened the Figma invoice modal. Download PDF retained the Billing URL and resolved `/assets/admin/invoice-2024111834033.pdf`.
- The PDF is a valid one-page PDF 1.4 document with the correct invoice number, total and exchange-rate disclaimer. Its raster render was visually inspected after correcting the Rate/Line total alignment and applying the green Orbit mark.
- Modal focus starts on the announced dialog panel; Tab moves to Cancel, reverse Tab wraps to the last action, Escape dismisses, and focus restores to the originating View more control. Shared body scroll locking remained active while dialogs were open.
- Desktop, `768 × 1024` tablet and `390 × 844` mobile checks passed. Mobile cards measure within the available width, invoice rows convert to labelled cards, the add-method dialog remains approximately `354px` wide, the invoice sheet scrolls only inside its modal, and document horizontal overflow is false in light and dark mode.
- The final Billing interaction run and protected-route regression run returned empty browser diagnostic logs. Every visible payment/profile image completed with a non-zero natural width, and no page exposed an error alert.
- Admin Dashboard, Admin eSIMs, Admin Customers, Superadmin Dashboard and Superadmin eSIMs were recaptured from the final production build with their approved headings, no missing images and zero document horizontal overflow. The remaining existing Superadmin routes were also reopened and checked for their approved heading and zero overflow; Billing styles remain route-scoped.

Each light and dark screenshot was paired directly with its corresponding Figma frame. The in-app capture surface exposes the common top `1920 × 1338` pixels of the `1920 × 1397` CSS viewport; the comparison manifest records that crop explicitly. Across the ten shared regions, mean absolute channel deltas are `1.975–4.958 / 255`, and `94.19–97.138%` of pixels remain within `16` levels per channel. Direct visual inspection confirms matching panel geometry, overlay, card/table placement and state-specific content.

Admin Billing phase files:

- `screenshots/admin-billing-default-light.png`
- `screenshots/admin-billing-add-credit-light.png`
- `screenshots/admin-billing-remove-payment-light.png`
- `screenshots/admin-billing-add-payment-method-light.png`
- `screenshots/admin-billing-invoice-light.png`
- `screenshots/admin-billing-default-dark.png`
- `screenshots/admin-billing-add-credit-dark.png`
- `screenshots/admin-billing-remove-payment-dark.png`
- `screenshots/admin-billing-add-payment-method-dark.png`
- `screenshots/admin-billing-invoice-dark.png`
- `screenshots/admin-billing-*-comparison.png`
- `screenshots/admin-billing-visual-comparison.json`
- `screenshots/admin-billing-mobile-light.png`
- `screenshots/admin-billing-mobile-invoices-light.png`
- `screenshots/admin-billing-tablet-light.png`
- `screenshots/regression-admin-dashboard-after-admin-billing.png`
- `screenshots/regression-admin-esims-after-admin-billing.png`
- `screenshots/regression-admin-customers-after-admin-billing.png`
- `screenshots/regression-superadmin-dashboard-after-admin-billing.png`
- `screenshots/regression-superadmin-esims-after-admin-billing.png`

## Admin Networks Figma parity acceptance

The Admin Networks frame inventory was completed before UI work. `Networks tab.svg` contains the green/light Regions and Network operators frames; `Networks tab-2.svg` contains their green/dark counterparts. The blue `Networks tab-1.svg` and `Networks tab-3.svg` exports were excluded, and no modal, drawer, loading, empty, error, toggle or row-action state exists in the supplied Admin frames.

- `/admin/networks` reproduces the exact Regions title, eight geographic tabs, separate Search button, Export excel action, COUNTRY/ISO3/ISO2/APN NAME/AUTO APN/WI-FI HOTSPOT table, nine supplied first-page rows, entries copy and two-page pagination.
- `/admin/networks/operators` reproduces the distinct tab-free operator frame, COUNTRY/ISO3/NETWORK/LOGO/PLMN/MCCMNC/3G/4G LTE/5G columns, eight supplied first-page rows and exact embedded Ooredoo, Andorra Telecom, FLOW, Movistar, MTS, Setar and Optus assets.
- Both desktop cards match the Figma coordinates at `x=380`, `y=276`, `width=1490`; Regions is `742px` high and Network operators is `683px` high. Sidebar, topbar, title, footer and green Admin identity remain inherited from the approved shell.
- Canonical Country, Operator and Network records are resolved through organization-guarded repository selectors. No Admin fixture import, duplicated identity field or Superadmin visual component is used by the page.
- Search was exercised on both catalogs; page 2 rendered the remaining records with `Showing 11 to 12 of 12 entries`; geographic click and Arrow-key tab selection updated the URL; Export excel completed without navigation or runtime failure.
- The optimized production build and explicit TypeScript check pass. Both routes are statically generated within the 23-page build output.
- Desktop `1920 × 1397`, tablet `768 × 1024` and mobile `390 × 844` checks passed. Light and supplied dark values were verified directly, operator images loaded, and every tested view reported zero document horizontal overflow.
- The production render exposed no Next error portal, missing image or failed route. Development and production route logs contained successful responses only.
- Admin Dashboard, Admin eSIMs, Admin Customers, Admin Billing and all existing Superadmin destinations were reopened after the change. Approved headings, images and overflow behavior remained intact; representative protected views were recaptured.

The in-app capture surface records the common top `1920 × 1338` pixels of the `1920 × 1397` CSS viewport. Direct Figma comparisons report mean absolute channel deltas of `2.200–3.669 / 255`, with `95.864–97.148%` of pixels within `16` levels per channel. Visual inspection confirms the matching shell geometry, selected navigation, title/tab placement, cards, table density, columns, rows, flags, exact operator logos, pills, controls and pagination.

Admin Networks phase files:

- `screenshots/admin-networks-regions-light.png`
- `screenshots/admin-networks-operators-light.png`
- `screenshots/admin-networks-regions-dark.png`
- `screenshots/admin-networks-operators-dark.png`
- `screenshots/admin-networks-regions-light-comparison.png`
- `screenshots/admin-networks-operators-light-comparison.png`
- `screenshots/admin-networks-regions-dark-comparison.png`
- `screenshots/admin-networks-operators-dark-comparison.png`
- `screenshots/admin-networks-visual-comparison.json`
- `screenshots/regression-admin-dashboard-after-admin-networks.png`
- `screenshots/regression-admin-esims-after-admin-networks.png`
- `screenshots/regression-admin-customers-after-admin-networks.png`
- `screenshots/regression-admin-billing-after-admin-networks.png`
- `screenshots/regression-superadmin-dashboard-after-admin-networks.png`
- `screenshots/regression-superadmin-esims-after-admin-networks.png`

## Persistent collapsible sidebar acceptance

The shell-only sidebar enhancement was verified without altering route content, domain state, mutations or entity relationships.

- Before implementation, expanded light captures were taken at a `1920 × 1397` CSS viewport for Superadmin Dashboard, eSIMs, Networks and Brand-VNO plus Admin Dashboard, eSIMs, Customers, Billing and Networks. Each measured the approved `330px` sidebar and zero document horizontal overflow.
- After implementation, the same nine expanded views were recaptured. Each retained the `330px` desktop geometry and zero overflow; direct image comparison confirms the page and shell content remain visually unchanged apart from the intentional `30px` collapse control. Dynamic chart/emoji capture pixels account for the small remaining encoded-image deltas.
- All nine compact captures measure a `92px` rail and `92px` main-content origin with zero horizontal overflow. Superadmin retains blue active/hover treatment and Admin retains green treatment. The single mounted `146px` wordmark clips to its first `50px`, producing the actual Orbit `O` with no crossfade or duplicate glyph.
- Superadmin and Admin preferences persist independently. A production refresh with Admin collapsed measured `92px` both immediately after document load and after hydration; the hydrated control announced `Expand Admin navigation`, confirming the bootstrap prevents a layout flash while React synchronizes semantics.
- At `1024px`, compact Admin measured `92px` and expanded Admin measured `272px`, both with zero overflow. At `390 × 844`, both stored preferences yielded the unchanged hidden `280px` off-canvas drawer, no collapse control, full labels and zero overflow; nested items expanded inline rather than opening desktop flyouts.
- Collapsed Subtenants and both Networks groups opened anchored product-coloured flyouts with no overflow. Trigger focus opened the matching tooltip; flyout Escape dismissal restored trigger focus. Arrow/Home/End and logical Tab exit behavior are implemented in the shared primitive, and hidden inline submenus are inert.
- Light and dark collapsed checks passed in both application boundaries. Dark flyout surfaces resolved to `rgb(51, 51, 51)` with the correct blue/green interaction treatment. Reduced-motion rules disable tooltip/flyout animation and reduce the coordinated shell sequence to `.01ms`.
- Representative collapsed overlays were exercised: Superadmin profile dropdown, Superadmin Add eSIM dialog and Admin Add Customer dialog all retained their focus-managed behavior and produced zero overflow. Route navigation and refresh retained the selected rail preference.
- The final optimized Next.js build compiled all 23 routes, its integrated TypeScript pass succeeded, and the explicit `tsc --noEmit` check succeeded. A final production sweep reopened all Superadmin and Admin destinations; the representative desktop set retained `330px` expanded sidebars, no missing images, no Next error portal and zero horizontal overflow.

Sidebar phase files:

- `screenshots/sidebar-before-*-expanded-light.png`
- `screenshots/sidebar-after-*-expanded-light.png`
- `screenshots/sidebar-after-*-collapsed-light.png`
- `screenshots/sidebar-after-superadmin-esims-collapsed-dark.png`
- `screenshots/sidebar-after-admin-customers-collapsed-dark.png`
- `screenshots/sidebar-production-superadmin-esims-collapsed-light.png`
- `screenshots/sidebar-production-admin-customers-collapsed-light.png`

## Admin Data Plans Figma parity acceptance

The Admin Data Plans frame inventory was completed before implementation. `Data plans-1.svg` is the green/light source and `Data plans.svg` is its green/dark counterpart. The blue `Data plans tab.svg` and `Data plans tab-1.svg` Superadmin exports were excluded. The supplied Admin pair contains only the catalog state: there are no create, edit, delete, detail, modal, status, tab, filter, empty, loading, error or toast frames to implement.

- `/admin/data-plans` reproduces the selected Admin navigation state, `Data plans` title, separate Search button, `Export excel`, compact REGION/ID/NAME/WSP/RRP/DATA (GB)/VALIDITY (DAYS)/WI-FI HOTSPOT/COVERAGE table, supplied repeated APAC rows, entries copy, two-page pagination and Admin footer.
- Desktop measurement at the `1920 × 1397` CSS viewport reports the exact `380px` content/card origin, `1490px` card width and `742px` card height. The document has no horizontal overflow.
- Light and dark desktop captures were directly paired with their corresponding Figma exports. Content-region mean absolute channel differences are `4.0684 / 255` light and `6.1648 / 255` dark; visual inspection confirms matching geometry, controls, columns, row density, pills and pagination. The approved existing shell was preserved instead of being rewritten to compensate for export-only raster differences.
- Tablet and `390 × 844` light/dark checks report zero document horizontal overflow. Search and Export use the available width; the wide desktop table remains usable through its own horizontal scroll region, and the mobile Admin drawer remains the existing shell implementation.
- Search updated the canonical URL to `?q=JW7`. Pagination rendered two page-2 rows with `Showing 11 to 12 of 12 entries`; browser Back and Forward restored page 1 and page 2. The Export excel command was invoked through the established shared download utility without navigation or a runtime error.
- The searchbox has an explicit accessible label; Search, Export and pagination use native named buttons with disabled/current-page semantics. Existing Admin focus-visible, reduced-motion, skip-link and responsive-drawer foundations remain unchanged.
- Plan rows resolve through `LocalOrbitRepository.resolveAdminDataPlanCatalog(adminSession.organizationId)` from canonical organization-scoped Plans and retain `planId`; the page imports no raw fixture data.
- Explicit route generation, TypeScript validation and the optimized Next.js build pass. `/admin/data-plans` is statically generated in the 24-page build output.
- Admin Dashboard, Admin eSIMs, Admin Customers, Admin Billing and Admin Networks were reopened and recaptured from the final production build. Each retained its approved heading, zero document overflow and an empty console warning/error log. Representative same-raster comparisons remain low-noise (`0.126 / 255` Dashboard, `0.356 / 255` Billing and `0.927 / 255` Networks mean absolute RGB difference); scoped Data Plans selectors do not alter protected layouts.
- Superadmin Dashboard, eSIMs, Data Plans, Networks and Operations were also reopened from the final build. All retained their approved headings, zero document overflow and zero browser console warnings/errors.

Admin Data Plans phase files:

- `screenshots/admin-data-plans-light.png`
- `screenshots/admin-data-plans-dark.png`
- `screenshots/admin-data-plans-mobile-light.png`
- `screenshots/admin-data-plans-mobile-dark.png`
- `screenshots/admin-data-plans-light-comparison.png`
- `screenshots/admin-data-plans-dark-comparison.png`
- `screenshots/admin-data-plans-visual-comparison.json`
- `screenshots/admin-dashboard-after-admin-data-plans.png`
- `screenshots/admin-esims-after-admin-data-plans.png`
- `screenshots/admin-customers-after-admin-data-plans.png`
- `screenshots/admin-billing-after-admin-data-plans.png`
- `screenshots/admin-networks-after-admin-data-plans.png`
