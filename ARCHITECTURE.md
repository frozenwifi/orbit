# Orbit frontend architecture

## Foundation

The root App Router layout owns `OrbitShell`, so sidebar and top-bar state persist while page content changes. Product pages supply only their route content through the shell's main-content slot.

Orbit's visual decisions live in `styles/tokens.css`; components consume semantic variables instead of introducing page-local colours, radii, shadows or motion timings. Existing Dashboard selectors remain in `styles.css` to preserve the approved v1 rendering while the layout is decomposed into components.

## Reusable layers

- Providers: persisted theme, global search query, non-blocking status toasts and a shared client-side domain/data-access boundary.
- Shell: responsive primary navigation, mobile drawer, top bar and page-transition boundary.
- Primitives: buttons, semantic status badges, progress indicators, filter selects, pagination, collection states, accessible dropdowns, modal/drawer focus management, keyboard tabs and shared motion classes.
- Dashboard: sales report, metric cards, earnings chart, order table and footer sections.
- eSIM management: the blue Superadmin inventory composition, compact responsive table/card presentation, Excel export, Figma-aligned Add eSIM flow and a routed Summary/Activation/usage-log detail workspace backed by the shared domain.
- Customer management: typed customer records, summary metrics, multi-filter table/card presentation, tabbed detail drawer, activity/usage views, add/edit/assign flows and destructive confirmation.
- Data Plans management: typed commercial catalog, calculated pricing metrics, coverage/network-ready records, responsive table/card presentation, tabbed detail drawer, activity history and add/edit/duplicate/archive flows.
- Networks management: Figma-aligned Superadmin Regions and Network operators projections share one routed region-tab/toolbar/table system. Exact operator assets, APN capability and radio-technology presentation sit above the retained canonical Network detail/edit/enable/disable flows.
- Operations management: normalized cross-product operation records, derived health metrics, responsive event table, failure context, canonical linked-entity navigation, lifecycle timeline and deterministic retry.
- API Keys management: the blue Superadmin compact application/key table, shared catalog toolbar and pagination, accessible full-frame Figma dialogs, transient success state and in-session create/revoke mutations.

Status presentation, usage progress, pagination, form controls, modal/drawer behavior, entity references, loading/empty/error feedback, confirmation and button treatments live in the reusable UI layer. Product routes own composition and ephemeral view state only.

## Shared domain and data access

`types/domain.ts` defines the canonical `Customer`, `ESim`, `Plan`, `PlanCoverage`, `Country`, `Operator`, `Network`, `ActivityEvent`, `Operation`, `OperationEvent` and `ApiApplication` contracts. Persisted relationships use IDs: customers reference `countryId`; eSIMs reference `customerId`, `planId` and `networkId`; plan coverage references `countryId` and `networkIds`; networks reference `countryId` and `operatorId`; activities reference an `entityType` and `entityId`; operations optionally reference `customerId`, `esimId`, `planId` and `networkId`. API applications own a stable canonical ID plus mock key/secret values and creation timestamp; no genuine credentials or remote service is used. `Country.networkRegion`/ISO/APN capabilities, `Operator.logoAsset` and `Network.plmn` extend those canonical records for the approved Superadmin catalog without duplicating their identity or relationships. Display labels and relationship collections are resolved projections and are never stored as parallel identity fields.

`data/mock-domain.ts` contains fixture records only. `LocalOrbitRepository` in `data/domain-repository.ts` is the API-shaped read boundary: it exposes entity lookups plus relationship queries such as eSIMs for a customer/plan/network, the customer for an eSIM, plans for a network, unified activity queries, operation/event lookups and resolved cross-product operations. Its Superadmin region and operator catalog selectors are ordered projections of those same entities; the page does not maintain a second country/operator dataset. Route components receive resolved projections from `DomainProvider` and do not import raw fixtures. Replacing the local repository with a remote implementation can therefore preserve the normalized contracts and UI composition.

`DomainProvider` owns one `OrbitDomainState` and applies customer, eSIM, plan, network, operation and API-application mutations atomically. API creation generates deterministic non-production credentials behind `createApiApplication`; revoke removes the canonical entity through `revokeApiApplication`. Presentation receives the current collection but does not own credential business rules. Assignment mutations validate customer and plan eligibility, select an eligible network and immediately update every resolved route projection. Customer creation, eSIM creation, eSIM assignment, plan reassignment, suspension, activation and reactivation generate normalized operation records in the same commit as their domain change. Lifecycle rules preserve readable historical relationships, prevent new assignments to archived customers/inactive plans/disabled networks and keep plan coverage valid after related changes. `data/domain-validation.ts` additionally rejects duplicate API application IDs/keys and missing application identity fields alongside its existing relationship checks.

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

## Superadmin Networks routing

Networks is an expandable shell parent rather than a standalone generic-management link. `/networks` owns the Regions catalog and the canonical `?network=…` detail state; `/networks/operators` owns the operator projection. Both views share URL-backed `?region=…` tabs, search/export controls, pagination and responsive card conversion. Selecting an operator routes to `/networks?network=…`, so the existing canonical detail surface and browser history are reused instead of duplicated.

The supplied blue/light `Networks tab-1` and blue/dark `Networks tab-3` exports are the presentation source of truth. The green Admin `Networks tab` and `Networks tab-2` exports are deliberately excluded from this Superadmin route.
