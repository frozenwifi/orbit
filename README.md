# Orbit frontend

The production React/Next.js foundation for Orbit. It preserves the supplied Dashboard v1 while separating the application shell, page composition, reusable UI primitives, design tokens, data and routes.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://127.0.0.1:4173`. Use `pnpm build` and `pnpm start` for the production build.

## Routes

- `/` — Dashboard v1
- `/esims` — blue Superadmin eSIM inventory with the compact Figma table, Excel export, Add eSIM flow and deep-linked Summary/Activation/usage-log workspace
- `/customers` — Orbit Customer Management v1 with customer metrics, linked eSIM inventory, responsive management table, detail tabs and customer lifecycle flows
- `/data-plans` — Orbit Data Plans v1 with catalog metrics, coverage and pricing management, linked inventory, detail tabs and add/edit/duplicate/archive flows
- `/networks` — blue Superadmin Regions catalog with Figma-aligned regional tabs, compact APN capability table, Excel export and canonical Network deep links
- `/networks/operators` — blue Superadmin Network operators catalog with the supplied operator logos, PLMN/MCCMNC and 3G/4G LTE/5G capability columns
- `/operations` — Orbit Operations v1 with cross-product lifecycle metrics, search/filtering, deep-linked detail history, failure context and deterministic retry
- `/api-keys` — blue Superadmin API Keys catalog with the supplied compact table, Excel export, Figma-aligned create/success/remove states and shared in-session mutations

## Structure

- `app/` — Next.js App Router layouts and routes
- `components/shell/` — persistent sidebar and top bar
- `components/dashboard/` — reusable Dashboard sections
- `components/esims/` — typed eSIM management composition
- `components/customers/` — customer list, summary, detail tabs, assignment and create/edit flows
- `components/plans/` — data plan catalog, calculated pricing, coverage/inventory detail tabs and plan lifecycle flows
- `components/networks/` — shared Superadmin region tabs/toolbar, responsive Regions and Network operators catalogs, exact supplied logo assets, and retained relationship detail/edit/status flows
- `components/operations/` — operational activity composition, derived metrics, responsive event table, canonical detail drawer and retry flow
- `components/api-keys/` — Figma-aligned API application table, credential visibility controls, create flow, success notice and revoke confirmation
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

The shell is responsive, supports persisted light/dark modes, visible keyboard focus, reduced-motion preferences, an accessible mobile drawer, keyboard-operable menus/tabs/modals, and animated route transitions. Networks is an expandable navigation parent with routed Regions and Network operators children. Customer, eSIM, Plan, Network, Operation and API Application data resolve through one normalized repository and one client-side store, so assignment, lifecycle and credential mutations remain consistent across every route. Eligible eSIM and customer actions create operation records atomically; failed mock operations can be retried through a deterministic processing-to-completed lifecycle. Entity references use canonical query URLs, support direct links and browser Back/Forward, and always open the destination entity's existing drawer or eSIM workspace. Development-time integrity checks reject broken references and duplicate identities. Visual-regression captures live in `screenshots/`.
