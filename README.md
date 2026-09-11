# Orbit frontend

The production React/Next.js foundation for Orbit. It preserves the supplied Dashboard v1 while separating the application shell, page composition, reusable UI primitives, design tokens, data and routes.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://127.0.0.1:4173`. Use `pnpm build` and `pnpm start` for the production build.

## Persistent sidebars

At desktop and tablet widths, the Superadmin and Admin sidebars can be collapsed to a compact `92px` icon rail with the discreet arrow control beneath the Orbit mark. Each application boundary stores its preference independently, applies it before first paint, and retains it across route changes and refreshes. Collapsed navigation exposes hover/focus tooltips and anchored keyboard-operable flyouts for nested destinations. At `720px` and below the existing `280px` off-canvas mobile drawer remains the only navigation mode.

## Routes

- `/` — Dashboard v1
- `/esims` — blue Superadmin eSIM inventory with the compact Figma table, Excel export, Add eSIM flow and deep-linked Summary/Activation/usage-log workspace
- `/customers` — Orbit Customer Management v1 with customer metrics, linked eSIM inventory, responsive management table, detail tabs and customer lifecycle flows
- `/data-plans` — Orbit Data Plans v1 with catalog metrics, coverage and pricing management, linked inventory, detail tabs and add/edit/duplicate/archive flows
- `/networks` — blue Superadmin Regions catalog with Figma-aligned regional tabs, compact APN capability table, Excel export and canonical Network deep links
- `/networks/operators` — blue Superadmin Network operators catalog with the supplied operator logos, PLMN/MCCMNC and 3G/4G LTE/5G capability columns
- `/operations` — Orbit Operations v1 with cross-product lifecycle metrics, search/filtering, deep-linked detail history, failure context and deterministic retry
- `/api-keys` — blue Superadmin API Keys catalog with the supplied compact table, Excel export, Figma-aligned create/success/remove states and shared in-session mutations
- `/subtenants/brand-vno` — Figma-aligned Brand-VNO catalog and canonical organization management
- `/subtenants/brand-vno/[id]` — Brand-VNO detail workspace with details, recent orders, customers and influencers
- `/subtenants/business-roaming` — compact Business roaming catalog and creation flow
- `/subtenants/influencers` — compact influencer catalog and creation flow
- `/subtenants/api` — the scoped Subtenants API destination represented in the supplied navigation
- `/team` — blue Superadmin Team/Users catalog with Figma-aligned add, edit, role, password-recovery and remove-user flows
- `/admin` — separate green Admin application shell and complete Figma-aligned Admin dashboard; `/admin?state=empty` exposes the supplied empty dashboard state
- `/admin/esims` — green Admin organization-scoped eSIM catalog and full Figma workspace; `?esim=…&tab=summary|activation|usage` deep-links detail state and `?state=loading` exposes the supplied loading frame
- `/admin/customers` — green Admin organization-scoped Customers catalog with the supplied notice, add/edit/delete states and deep-linked Customer/eSIM/expenses workspace
- `/admin/billing` — green Admin organization-scoped Billing workspace with the Figma credit balance, payment-method flows, invoice table, invoice preview and local PDF download
- `/admin/data-plans` — green Admin organization-scoped Data plans catalog reproducing the supplied compact Search/Export/table/pagination light and dark frames
- `/admin/networks` — green Admin organization-scoped Regions catalog with the exact geographic tabs, APN capability table, search, Excel export and Figma pagination
- `/admin/networks/operators` — green Admin Network operators catalog with the supplied logos, PLMN/MCCMNC and 3G/4G LTE/5G capability columns

## Structure

- `app/` — Next.js App Router layouts and routes
- `components/shell/` — persistent sidebar/top bar, shared collapse preference, brand wipe, tooltip and nested-flyout mechanics
- `components/dashboard/` — reusable Dashboard sections
- `components/admin/` — route-isolated Admin shell, responsive navigation/topbar, dashboard cards, chart, earnings, table and empty-state composition
- `components/admin/esims/` — Admin-specific Figma list, creation, confirmation, detail, activation and usage-log presentation backed by shared entities
- `components/admin/customers/` — Admin-specific Figma list, notice, customer form, destructive confirmation and full detail workspace backed by scoped canonical entities
- `components/admin/billing/` — Admin-specific credit, payment-method and invoice presentation using the shared accessible modal foundation
- `components/admin/data-plans/` — Admin-specific Figma catalog composition backed by the organization-scoped canonical Plan projection
- `components/admin/networks/` — Admin-specific Regions and Network operators presentation backed by organization-guarded canonical Country/Operator/Network projections
- `components/esims/` — typed eSIM management composition
- `components/customers/` — customer list, summary, detail tabs, assignment and create/edit flows
- `components/plans/` — data plan catalog, calculated pricing, coverage/inventory detail tabs and plan lifecycle flows
- `components/networks/` — shared Superadmin region tabs/toolbar, responsive Regions and Network operators catalogs, exact supplied logo assets, and retained relationship detail/edit/status flows
- `components/operations/` — operational activity composition, derived metrics, responsive event table, canonical detail drawer and retry flow
- `components/api-keys/` — Figma-aligned API application table, credential visibility controls, create flow, success notice and revoke confirmation
- `components/subtenants/` — Figma-aligned Brand-VNO, Business roaming and Influencer catalogs, creation flows, confirmation states and Brand-VNO detail workspace
- `components/team/` — Figma-aligned Team table, permission form, inline role controls and destructive confirmation flow
- `components/ui/` — buttons, badges, progress, filters, pagination, dropdown, modal, drawer, tabs, states and transition primitives
- `components/providers/` — theme, search, toast and the single shared mock-domain store
- `hooks/useEntityNavigation.ts` — canonical entity-detail URLs and browser-history navigation
- `styles/tokens.css` — Orbit colour, type, spacing, radius, elevation and motion tokens
- `styles/foundation.css` and `styles/components.css` — accessibility and reusable component/motion foundations
- `styles/esims.css` — responsive eSIM composition using the central Orbit tokens
- `styles/customers.css` — responsive Customer Management composition using the same tokens and primitives
- `styles/plans.css` — responsive Data Plans composition using the same tokens and primitives
- `styles/networks.css` — responsive Networks composition using the same tokens and primitives
- `styles/operations.css` — responsive Operations composition using the same tokens and primitives
- `styles/api-keys.css` — route-scoped Superadmin API Keys presentation, modal geometry and responsive/dark variants
- `styles/subtenants.css` — route-scoped Superadmin Subtenants catalogs, workspace, modal geometry and responsive/dark variants
- `styles/team.css` — route-scoped Superadmin Team/Users table, exact dialog geometry and responsive/dark variants
- `styles/admin.css` — route-scoped green Admin shell/dashboard tokens, exact desktop geometry, dark parity and responsive/mobile behavior
- `styles/admin-esims.css` — route-scoped green Admin eSIM table/workspace/modal geometry, dark variants and responsive card adaptation
- `styles/admin-customers.css` — route-scoped green Admin Customers list, dialogs, toast, detail cards, chart, dark variants and responsive adaptation
- `styles/admin-billing.css` — route-scoped green Admin Billing cards, table, exact dialog/invoice geometry, dark variants and responsive adaptation
- `styles/admin-data-plans.css` — route-scoped green Admin Data plans toolbar, compact nine-column table, exact light/dark card geometry and responsive overflow containment
- `styles/admin-networks.css` — route-scoped green Admin Networks tabs, compact tables, supplied light/dark values and responsive card adaptation
- `data/admin-dashboard.ts` and `types/admin-dashboard.ts` — typed Admin dashboard navigation, report, KPI, earnings and order fixtures separated from presentation
- `data/admin-session.ts`, `types/admin-esims.ts`, `types/admin-customers.ts` and `types/admin-data-plans.ts` — explicit Admin organization boundary and typed Figma catalog projections
- `data/mock-subtenants.ts` — typed Subtenant and Influencer fixtures connected to the shared domain by IDs
- `data/mock-team-users.ts` — typed non-production Team user fixtures and permission state
- `data/mock-admin-billing.ts` — deterministic organization-scoped BillingAccount, PaymentMethod and Invoice fixtures
- `data/mock-domain.ts` — normalized fixture data linked only by canonical IDs
- `data/domain-repository.ts` — repository-style query and relationship-resolution boundary
- `data/domain-validation.ts` — referential-integrity and duplicate-identity validation
- `types/operations.ts` and `utils/operations.ts` — resolved operation projections and shared lifecycle presentation helpers
- `data/`, `types/` and `utils/` — typed entities, data access and presentation helpers kept separate from route composition

## Quality checks

```bash
pnpm typecheck
pnpm build
```

The shell is responsive, supports independent persisted Superadmin/Admin rail preferences, persisted light/dark modes, visible keyboard focus, reduced-motion preferences, an accessible mobile drawer, keyboard-operable menus/tabs/modals, and animated route transitions. Networks is an expandable navigation parent with routed Regions and Network operators children in each product boundary. Customer, eSIM, Plan, Network, Operation, API Application, Team User and Admin Billing data resolve through one repository boundary and one client-side store, so assignment, lifecycle, credential, access and payment-state mutations remain consistent across every route. Admin Customer and Billing commands plus Admin Data plans and Network catalog reads are organization-guarded. Eligible eSIM and customer actions create operation records atomically; failed mock operations can be retried through a deterministic processing-to-completed lifecycle. Entity references and Networks view/filter state use canonical URLs, support direct links and browser Back/Forward, and reuse existing destination experiences. Development-time integrity checks reject broken references, duplicate identities and invalid organization billing ownership. Visual-regression captures live in `screenshots/`.
