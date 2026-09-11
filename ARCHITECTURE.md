# Orbit frontend architecture

## Foundation

The root App Router layout owns `OrbitShell`, which route-gates the original Superadmin shell and the separate `/admin` application shell. Sidebar and top-bar state persist within either application boundary, while product pages supply only their route content through the relevant main-content slot. The Admin shell is opt-in and cannot change the Superadmin presentation.

Orbit's visual decisions live in `styles/tokens.css`; components consume semantic variables instead of introducing page-local colours, radii, shadows or motion timings. Existing Dashboard selectors remain in `styles.css` to preserve the approved v1 rendering while the layout is decomposed into components.

## Persistent application sidebar

`useSidebarPreference` is the shared desktop/tablet mechanics boundary for both applications. It keeps independent `orbit-superadmin-sidebar` and `orbit-admin-sidebar` preferences, mirrors them to root data attributes, and listens for storage changes across tabs. The root layout bootstrap reads both values before the shell HTML paints, so a saved compact rail does not render an expanded frame during hydration. React state then synchronizes accessibility labels and interaction state without moving the already-correct layout.

The approved expanded sidebars remain separate visual implementations: Superadmin continues to use the blue asset system and navigation order, while Admin continues to use its green masked assets and organization navigation. Both compose the same collapse button, tooltip layer and nested-flyout primitives. The logo transition keeps one full Orbit wordmark mounted and animates only its clipping edge; the compact result is the real first Orbit glyph rather than a swapped or duplicated mark. Grid-track, clip, label, chevron and navigation-padding transitions share the `260ms` emphasized motion curve, and reduced-motion media rules shorten the entire sequence to an effectively immediate state change.

Collapsed nested navigation is rendered in a body portal so flyouts are not clipped by the sticky/scrolling rails. Position is resolved from the trigger on open, resize and scroll. Escape restores trigger focus; Arrow/Home/End navigation is supported; Tab exits to the next logical rail item; outside pointer interaction dismisses the layer. Inline expanded submenus are inert when hidden. At `720px` and below the preference becomes visually and behaviorally inactive, preserving the existing `280px` mobile drawer, full wordmark and inline nested navigation.

## Reusable layers

- Providers: persisted theme, global search query, non-blocking status toasts and a shared client-side domain/data-access boundary.
- Shell: responsive primary navigation, independently persisted desktop/tablet rails, unchanged mobile drawers, top bar and page-transition boundary.
- Primitives: buttons, semantic status badges, progress indicators, filter selects, pagination, collection states, accessible dropdowns, modal/drawer focus management, keyboard tabs and shared motion classes.
- Dashboard: sales report, metric cards, earnings chart, order table and footer sections.
- Admin dashboard: an independent green Admin shell plus typed report/KPI/earnings/order composition reproducing the supplied populated and empty light/dark frames.
- Admin eSIMs: Admin-specific green catalog, workspace, QR activation and confirmation views composed above organization-scoped canonical eSIM/customer/plan selectors and guarded mutations.
- Admin Data plans: Admin-specific green compact catalog reproducing the supplied Search/Export/nine-column table/pagination frames above an organization-scoped canonical Plan projection.
- Admin Networks: separate green Regions and Network operators views reproduce the supplied Admin frames above organization-guarded canonical Country/Operator/Network selectors.
- eSIM management: the blue Superadmin inventory composition, compact responsive table/card presentation, Excel export, Figma-aligned Add eSIM flow and a routed Summary/Activation/usage-log detail workspace backed by the shared domain.
- Customer management: typed customer records, summary metrics, multi-filter table/card presentation, tabbed detail drawer, activity/usage views, add/edit/assign flows and destructive confirmation.
- Data Plans management: typed commercial catalog, calculated pricing metrics, coverage/network-ready records, responsive table/card presentation, tabbed detail drawer, activity history and add/edit/duplicate/archive flows.
- Networks management: Figma-aligned Superadmin Regions and Network operators projections share one routed region-tab/toolbar/table system. Exact operator assets, APN capability and radio-technology presentation sit above the retained canonical Network detail/edit/enable/disable flows.
- Operations management: normalized cross-product operation records, derived health metrics, responsive event table, failure context, canonical linked-entity navigation, lifecycle timeline and deterministic retry.
- API Keys management: the blue Superadmin compact application/key table, shared catalog toolbar and pagination, accessible full-frame Figma dialogs, transient success state and in-session create/revoke mutations.
- Team management: the blue Superadmin compact user table, inline Admin/Manager controls, password-recovery command, reusable permission form and Figma-aligned add/edit/remove dialogs.

Status presentation, usage progress, pagination, form controls, modal/drawer behavior, entity references, loading/empty/error feedback, confirmation and button treatments live in the reusable UI layer. Product routes own composition and ephemeral view state only.

## Shared domain and data access

`types/domain.ts` defines the canonical `Customer`, `ESim`, `Plan`, `PlanCoverage`, `Country`, `Operator`, `Network`, `ActivityEvent`, `Operation`, `OperationEvent`, `ApiApplication` and `TeamUser` contracts. Persisted relationships use IDs: customers reference `countryId`; eSIMs reference `customerId`, `planId` and `networkId`; plan coverage references `countryId` and `networkIds`; networks reference `countryId` and `operatorId`; activities reference an `entityType` and `entityId`; operations optionally reference `customerId`, `esimId`, `planId` and `networkId`. API applications own a stable canonical ID plus mock key/secret values and creation timestamp; Team users own a stable ID, role and typed permission set. All credentials and passwords are deterministic non-production fixtures; no genuine credential or remote service is used. `Country.networkRegion`/ISO/APN capabilities, `Operator.logoAsset` and `Network.plmn` extend those canonical records for the approved Superadmin catalog without duplicating their identity or relationships. Display labels and relationship collections are resolved projections and are never stored as parallel identity fields.

`data/mock-domain.ts` contains fixture records only. `LocalOrbitRepository` in `data/domain-repository.ts` is the API-shaped read boundary: it exposes entity lookups plus relationship queries such as eSIMs for a customer/plan/network, the customer for an eSIM, plans for a network, unified activity queries, operation/event lookups and resolved cross-product operations. Its Superadmin catalog selectors and organization-guarded Admin `resolveAdminDataPlanCatalog`, `getAdminRegionCatalog` and `resolveAdminOperatorCatalog` selectors are ordered projections of those same entities; neither product maintains a second plan/country/operator identity set. Route components receive resolved projections from `DomainProvider` and do not import raw fixtures. Replacing the local repository with a remote implementation can therefore preserve the normalized contracts and UI composition.

`DomainProvider` owns one `OrbitDomainState` and applies customer, eSIM, plan, network, operation, API-application and Team-user mutations atomically. API creation generates deterministic non-production credentials behind `createApiApplication`; revoke removes the canonical entity through `revokeApiApplication`. Team creation, edit, role update, recovery request and removal likewise remain behind typed provider commands rather than page-local business logic. Presentation receives current collections but does not own credential or access-state rules. Assignment mutations validate customer and plan eligibility, select an eligible network and immediately update every resolved route projection. Customer creation, eSIM creation, eSIM assignment, plan reassignment, suspension, activation and reactivation generate normalized operation records in the same commit as their domain change. Lifecycle rules preserve readable historical relationships, prevent new assignments to archived customers/inactive plans/disabled networks and keep plan coverage valid after related changes. `data/domain-validation.ts` rejects duplicate Team-user IDs and incomplete user records alongside its existing relationship and API-key checks.

## Superadmin API Keys presentation

`/api-keys` uses the supplied blue/light `API keys tab-1` export as its geometry and information-architecture authority; `API keys tab-3` supplies dark-mode parity. The green Admin exports are excluded. Search, its separate submit control, Excel export, compact table and pagination reuse shared Orbit primitives. API-specific styling is confined to `styles/api-keys.css`.

The shared `Modal` supports an opt-in body portal so this Figma overlay can cover the full shell instead of inheriting the route-transition containing block. The default remains unchanged for existing product modals. The API dialogs use that opt-in path for the exact 516 × 264 desktop frame while retaining focus trapping, Escape dismissal, scroll locking and focus restoration.

## Operation lifecycle and retry

An `Operation` stores status and entity IDs; ordered `OperationEvent` records store its requested, processing, provider/change and terminal steps. Repository resolution supplies Customer, eSIM, Plan and Network display projections only at the presentation boundary. Metrics, filters, duration and success rate are derived from the current operation collection rather than stored as unrelated page values.

`retryOperation` accepts an eligible failed record, creates a new processing Operation linked through `retryOfOperationId`, and adds its initial lifecycle events in one shared-store commit. A fixed mock timer deterministically appends provider acceptance and completion events and moves the retry to `completed`; it never calls an external service and never uses randomness. This makes the interaction testable while retaining the eventual asynchronous shape expected from an API-backed implementation.

## Canonical entity navigation

`useEntityNavigation` maps entities to stable detail URLs: `/customers?customer=…`, `/esims?esim=…`, `/data-plans?plan=…`, `/networks?network=…` and `/operations?operation=…`. Opening or crossing to an entity pushes a history entry; closing a drawer or the eSIM workspace replaces only the current detail URL. eSIM workspace tabs extend the canonical URL with `tab=activation` or `tab=usage`. Direct URLs, browser Back/Forward and refresh therefore reconstruct the correct destination experience without maintaining parallel local selection state or stacking duplicates.

`EntityReference` is the shared interaction primitive used across entity detail experiences. A Customer → eSIM → Plan → Network journey always navigates to the canonical destination route and reuses that route's drawer or workspace. The modal and drawer layers restore focus, close only the top interactive layer on Escape and lock background scrolling; dropdowns dynamically place above their trigger when the viewport would clip them.

## Adding a product route

Add a page under `app/<route>/page.tsx`; map it in `data/navigation.ts` only when the approved shell design includes a navigation entry. The page automatically receives the shell, theme, search affordance and transition treatment.

Prefer extending a semantic token or shared primitive before adding route-specific presentation. Respect `prefers-reduced-motion`, preserve visible focus states, and verify both desktop and mobile widths before merging.

## Admin application boundary

`OrbitShell` delegates only `/admin` and future `/admin/*` paths to `AdminShell`; all existing paths continue through the original Superadmin `Sidebar` and `Topbar`. `AdminShell`, `AdminSidebar` and `AdminTopbar` therefore own their navigation state, responsive drawer and green shell presentation without changing global Superadmin navigation data or selectors.

`components/admin/AdminDashboard.tsx` owns composition and transient view state only. The typed fixtures in `data/admin-dashboard.ts` are consumed through `types/admin-dashboard.ts`; report export remains behind the shared `downloadExcelTable` utility. The dashboard exposes the supplied empty state through `/admin?state=empty`, while light/dark selection continues through the shared theme provider. Search, dropdown, toast and transition behavior reuse existing shared primitives.

`styles/admin.css` is fully scoped beneath `.admin-shell`. It defines Admin-specific green/light and dark semantic values plus the exact 330px sidebar, 80px topbar, 50px desktop gutters, 924 × 387 report card, 536 × 544 earnings card and populated/empty order-card dimensions. The canonical Admin icon masks in `public/assets/admin/` were extracted from the green/light Figma export. The blue Superadmin Dashboard exports and existing shell assets are not presentation inputs for this route.

## Admin eSIM application boundary

`/admin/esims` remains inside `AdminShell` but owns a deliberately Admin-specific presentation in `components/admin/esims/` and `styles/admin-esims.css`. The supplied green Admin frames—not the Superadmin `/esims` implementation—define its compact list, New eSIM dialog, full Summary/Activation/usage-log workspace, status actions, loading treatment and light/dark values. The exact QR bitmap is extracted from the supplied Admin export and stored at `public/assets/admin/esim-qr.png`.

`data/admin-session.ts` exposes the current mock Admin organization ID. `LocalOrbitRepository.resolveCustomersForSubtenant`, `resolvePlansForSubtenant`, `resolveESimsForSubtenant` and `resolveAdminEsimCatalog` are the scoped read boundary. `DomainProvider` guards create, status, tag and remove commands with the same organization ID, rejecting cross-organization entities before mutation. The route therefore follows Admin presentation → shared application state → repository/data-access boundary without importing global fixtures or filtering Superadmin records in the page.

Detail state uses canonical URL parameters (`?esim=…&tab=summary|activation|usage`) so direct load and browser history reconstruct the selected entity and tab. The shared modal primitive provides portal overlay, focus trapping, Escape dismissal, body scroll locking and focus restoration. Responsive table rows become labelled cards below the mobile breakpoint, while the desktop coordinates remain aligned to the 1920 × 1397 Figma baseline.

## Superadmin Subtenants

Subtenants are canonical domain entities rather than presentation-only labels. `Subtenant` records distinguish Brand-VNO and Business roaming organizations; `Influencer` records reference their owning Brand-VNO by `subtenantId`. Customers, eSIMs, plans, operations and API applications may also reference a subtenant by ID. `LocalOrbitRepository` exposes relationship selectors for each collection, while `DomainProvider` owns create, edit, block/unblock and delete mutations in the shared in-session state.

The route family is explicit and deep-linkable: `/subtenants/brand-vno`, `/subtenants/brand-vno/[id]`, `/subtenants/business-roaming`, `/subtenants/influencers` and the Figma-scoped `/subtenants/api`. The sidebar expands Subtenants into those destinations without changing the persistent shell. Brand-VNO detail tables resolve orders, customers and influencers from canonical shared records; they do not maintain parallel page-local identities.

`components/subtenants/` owns the Figma-aligned catalogs, creation/confirmation dialogs and Brand-VNO workspace. `styles/subtenants.css` is route-scoped and consumes Orbit tokens, including dark, responsive, focus-visible and reduced-motion variants. Existing shared modal, pagination, footer and export primitives remain the interaction foundation.

## Superadmin Networks routing

Networks is an expandable shell parent rather than a standalone generic-management link. `/networks` owns the Regions catalog and the canonical `?network=…` detail state; `/networks/operators` owns the operator projection. Both views share URL-backed `?region=…` tabs, search/export controls, pagination and responsive card conversion. Selecting an operator routes to `/networks?network=…`, so the existing canonical detail surface and browser history are reused instead of duplicated.

The supplied blue/light `Networks tab-1` and blue/dark `Networks tab-3` exports are the presentation source of truth. The green Admin `Networks tab` and `Networks tab-2` exports are deliberately excluded from this Superadmin route.

## Superadmin Team presentation

`/team` is based only on the three 1920 × 1397 blue/light frames isolated from `Users.svg` and their three blue/dark counterparts in `Team-2.svg`. The green Admin `Team.svg` and `Team-1.svg` variants are deliberately excluded. The route preserves the approved shell and uses the exported frame geometry for the 1490 × 742 catalog card, 516 × 768 user form and 516 × 217 removal confirmation.

`TeamUsersManagement` owns only query, pagination and open-dialog view state. `TeamUserModal` is shared by create and edit; the permission switches map to the typed `TeamUserPermissions` object. `TeamUsersTable` reuses the Orbit select and pagination primitives and delegates role, recovery, edit and remove commands to `DomainProvider`. The repository exposes the current canonical user collection, while `data/mock-team-users.ts` remains the replaceable local fixture source.

The full-shell dialogs opt into the existing `Modal` portal and its panel-initial-focus mode, so screen readers announce the dialog before Tab moves to the first form control. Scroll locking, Tab trapping, Escape dismissal and focus restoration remain shared. Route-scoped responsive rules transform desktop rows into labelled cards below the table breakpoint; desktop dimensions remain fixed to the Figma while mobile dialogs are viewport-bounded. Theme-scoped coordinates preserve the small modal-placement distinction between the supplied light and dark frames without altering shared shell tokens or other routes.

## Admin Customers application boundary

`/admin/customers` uses the five light and five dark green Admin Customers frames as its exclusive presentation authority. `components/admin/customers/AdminCustomerManagement.tsx` owns only route composition and transient search, pagination, modal and toast state; `styles/admin-customers.css` is scoped to the Admin customer route and preserves the approved shell selectors.

`LocalOrbitRepository.resolveAdminCustomerCatalog`, `resolveAdminCustomerEsims` and `resolveAdminCustomerExpenses` form the organization-scoped read boundary. Figma display rows retain canonical `customerId` and `esimId` links, so the Customer eSIM table opens the existing `/admin/esims` workspace instead of duplicating eSIM identity. `DomainProvider.createCustomerForSubtenant`, `updateCustomerForSubtenant` and `deleteCustomerForSubtenant` guard the active organization before mutation. Deletion removes the canonical Customer, clears its customer activity, detaches related eSIMs to the organization root and clears operation customer links while retaining the underlying eSIM/operation records.

The detail workspace is reconstructed from `?customer=<canonical-id>`, so direct URLs and browser Back/Forward use routing rather than page-local selection state. The shared portal modal supplies scroll locking, focus trapping, Escape dismissal and trigger-focus restoration; responsive styling changes the desktop table into management cards without creating document-level horizontal overflow.

## Admin Billing application boundary

`/admin/billing` uses the five green/light frames in `Billing tab.svg` and their five dark counterparts in `Billing tab-1.svg` as its exclusive presentation authority. `AdminBillingManagement` owns only page composition and transient dialog/pagination selection. Exact route presentation is isolated in `styles/admin-billing.css`; the established Admin shell, navigation hierarchy and green tokens remain unchanged.

`types/domain.ts` defines canonical `BillingAccount`, `PaymentMethod`, `Invoice`, `InvoiceLine` and `InvoiceParty` records. Deterministic non-production fixtures live in `data/mock-admin-billing.ts`. `LocalOrbitRepository` exposes organization-scoped account, payment-method and invoice selectors, while `DomainProvider` guards credit, add-method, set-primary and remove-method commands against the active Admin organization from `data/admin-session.ts`. The page never imports fixtures or applies cross-organization filtering itself.

All four Billing dialogs reuse the portal-enabled `Modal` primitive for full-shell overlays, focus trapping, Escape dismissal, scroll locking and trigger-focus restoration. Route-scoped portal variables carry the Admin green/light and dark values into the document-body layer without changing shared modal output. The invoice preview is an HTML recreation of the supplied asset; `public/assets/admin/invoice-2024111834033.pdf` is a lightweight local one-page download containing the same mock invoice and no genuine payment data.

Desktop geometry remains aligned to the `1920 × 1397` Figma frame: content begins at `x=380`, the credit card is `326 × 320`, the payment-method card occupies the remaining approved row width, the invoice card is `1490 × 503`, standard dialogs are `516px` wide at `y=185`, and the invoice dialog is `652 × 1046`. Tablet and mobile rules stack the cards, convert invoice rows to labelled management cards, contain dialogs within the viewport and keep the fixed invoice sheet scrollable inside its modal rather than creating document overflow.

## Admin Networks application boundary

`/admin/networks` and `/admin/networks/operators` use only the two green/light frames in `Networks tab.svg` and their green/dark counterparts in `Networks tab-2.svg`. The blue `Networks tab-1.svg` and `Networks tab-3.svg` exports remain exclusive to Superadmin and were deliberately excluded from the Admin presentation audit. `AdminNetworkManagement` composes the two explicit views; `styles/admin-networks.css` carries the route-specific geometry and supplied theme values without modifying the approved Admin shell.

The repository owns the two Figma orderings as canonical ID projections. `getAdminRegionCatalog(organizationId)` and `resolveAdminOperatorCatalog(organizationId)` first validate the active organization, then resolve Country, Operator and Network records from the shared store. The page does not import mock fixtures, duplicate operator names or use the Superadmin selector as its Admin data boundary. Search, region selection and pagination are encoded into URL query state with router pushes, so direct links and browser history reconstruct the visible catalog.

The desktop contract remains the supplied `1920 × 1397` frame: `330px` sidebar, `80px` top bar, `50px` content gutter, `x=380` content origin, both cards at `y=276`, a `1490 × 742` Regions card and `1490 × 683` operators card. The exact column sets, nine/eight visible first-page rows, supplied operator assets, neutral pills, entries copy and pagination remain separate per view. Below the table breakpoint, rows become labelled cards while geographic tabs remain horizontally usable and the document stays overflow-free. Native controls, roving keyboard tabs, focus-visible styles and reduced-motion overrides remain intact.

## Admin Data Plans application boundary

`/admin/data-plans` is defined only by the green Admin `Data plans-1.svg` light frame and `Data plans.svg` dark frame. The blue Superadmin `Data plans tab.svg` and `Data plans tab-1.svg` exports are excluded. The frame audit found one catalog state and no add/edit/delete/detail/modal/toast/status/tab/filter/empty/loading/error state, so the implementation deliberately adds none of those visible concepts.

`AdminDataPlanManagement` owns URL-backed search and pagination plus the shared Excel-export command. It renders the exact REGION/ID/NAME/WSP/RRP/DATA (GB)/VALIDITY (DAYS)/WI-FI HOTSPOT/COVERAGE composition. `styles/admin-data-plans.css` is route-scoped and preserves the supplied 1490 × 742 desktop card at the 380px content origin, compact controls, table density, light/dark values and footer placement. Mobile keeps the page within the viewport and confines the deliberately wide Figma table to its own horizontal scrolling region.

The presentation does not import raw plan fixtures. `LocalOrbitRepository.resolveAdminDataPlanCatalog` first applies `resolvePlansForSubtenant(adminSession.organizationId)` and then supplies typed `AdminDataPlanRow` display projections that retain canonical `planId` references. The page therefore follows presentation → shared domain state → organization-scoped repository boundary without duplicating Plan identity or changing Superadmin plan behavior.
