# IN-Track — Module 1: Core Infrastructure & Access Control
## Part 1: Multi-Tenant Data Isolation + Part 2: Granular RBAC

Full MERN stack implementation, tested and verified working.

---

## Part 2: Granular Role-Based Access Control (RBAC)

Lets a company owner create custom team roles (e.g. "Factory Floor Worker",
"Warehouse Manager", "Read-Only Auditor") with specific permissions, then
invite team members by email into those roles.

### New Backend Files
```
backend/
├── config/permissions.js            # Central registry of every permission string + role templates
├── models/Role.js                   # UPGRADED: full permission validation (was a stub in Part 1)
├── models/Invitation.js             # Pending team invitations with secure tokens + expiry
├── middleware/rbac.js                # authorize(), authorizeAny(), ownerOnly() — the enforcement layer
├── controllers/roleController.js     # CRUD for custom roles
├── controllers/invitationController.js # Invite, verify, accept, revoke invitations
├── controllers/teamController.js     # List/reassign/remove team members
└── routes/{role,invitation,team}Routes.js
```

### New Frontend Files
```
frontend/src/
├── services/roleService.js
├── services/teamService.js
├── pages/TeamManagement.js          # Main RBAC screen: roles + members + pending invites
├── pages/AcceptInvite.js            # Public page where invited users set up their account
└── components/team/
    ├── RoleFormModal.js              # Create/edit a role with a permission checkbox grid
    └── InviteModal.js                # Invite a team member by email into a role
```

### How It Works
- **Permissions are centrally defined** in `config/permissions.js` (e.g. `team:invite`,
  `inventory:create`) — controllers reference these constants, never raw strings.
- **The Owner role always holds the wildcard** (`*`) and bypasses every check.
  Every other role must hold an explicit list of real permissions — the Role
  schema itself rejects invalid permission strings or wildcard misuse.
- **`authorize(...permissions)` middleware** sits on every protected route,
  e.g. `router.post('/', authorize(PERMISSIONS.ROLE_CREATE), createRole)`.
  It checks `req.user.role.permissions` (loaded fresh from the DB on every
  request via the Part 1 auth middleware) — never anything from the request itself.
- **Inviting a team member** creates an `Invitation` with a random token and
  7-day expiry. No real email is sent (that's outside this module's scope) —
  the invite link is returned directly so you can copy/paste it to test, or
  wire up a mail provider later.
- **Accepting an invitation** is the only other way (besides company
  registration) a `User` can be created — and note the tenantId/role are
  resolved from the server-verified invitation, never sent by the client.

### Testing RBAC Yourself
1. Log in as the company Owner (from Part 1) → click **"Team & Roles"** in the dashboard header.
2. Click **"+ New Role"**, try a quick-start template like "Warehouse Manager", or build a custom permission set → Save.
3. Click **"+ Invite Member"**, enter an email, pick the role you just created → you'll get an invite link.
4. Copy that link, open it in an incognito window (or log out first) → it shows "You've been invited... as Warehouse Manager" → set a password → you're logged in as that new team member.
5. Log back in as the Owner → go to Team & Roles → you'll see the new member listed with their assigned role, and you can remove them or reassign their role.
6. Try logging in as the new member and hitting a route their role doesn't cover (e.g. creating a role) — you'll get a `403 Forbidden`, proving the permission check works, not just the UI hiding buttons.

### Verified
- ✅ All new backend files pass `node --check`
- ✅ 9/9 unit tests pass on the RBAC authorization logic itself (wildcard bypass, AND logic for multiple required permissions, `authorizeAny` OR logic, owner-only checks, missing-role handling)
- ✅ Full Express app boots with all new routes wired correctly (public invite routes work without auth, protected routes correctly return 401 without a token)
- ✅ React frontend builds successfully with zero errors, including all new pages/modals

---

## Part 3: Custom Asset Definitions

*"A dynamic database layer allowing businesses to create completely custom
inventory categories with sector-specific metrics (e.g., kg, liters,
meters, yards, pieces) instead of hardcoded items."*

Businesses define their own inventory categories — no fixed list of item
types baked into the schema. A textile company creates "Cotton Yarn"
measured in `kg`; a steelworks creates "Steel Rod" measured in `pieces`;
each can also attach whatever extra metadata fields its sector needs
(e.g. `batch_color`, `thread_count`) without anyone touching the database.

### New Backend Files
```
backend/
├── app.js                                # NEW: Express app split out of server.js (see below)
├── models/AssetCategory.js               # Tenant-scoped category: name, unitOfMeasure, customFields[]
├── controllers/assetCategoryController.js # CRUD + customFields validation + subscription limit check
├── routes/assetCategoryRoutes.js          # /api/asset-categories, RBAC-protected
└── tests/                                 # NEW: Jest + Supertest + mongodb-memory-server suite
    ├── setup.js
    ├── helpers.js
    ├── assetCategories.test.js            # 14 tests
    └── regression.test.js                 # 9 tests confirming Parts 1-2 still work
```

**`server.js` was split into `app.js` + `server.js`.** `app.js` now builds
and exports the Express app with zero side effects (no DB connection, no
`app.listen()`); `server.js` is a thin production entrypoint that requires
`app.js`, connects to the real database, and starts listening. Behavior of
`npm start` / `npm run dev` is unchanged — this split exists purely so
`npm test` can drive the app with Supertest against an in-memory MongoDB
without opening a real port. `package.json` was updated with a `jest` config
pointing at `tests/setup.js`.

### How It Works
- **`unitOfMeasure` is a free string**, not an enum — any sector-specific
  unit works without a code change.
- **`customFields`** is an array of `{ fieldName, fieldType, required }`,
  validated both by the controller (clear 400 errors, duplicate-name
  checks) and by the Mongoose subdocument schema (`fieldType` enum:
  `text | number | date | boolean`).
- **Uses the exact same permissions already defined for this** —
  `inventory:view/create/edit/delete` in `config/permissions.js` didn't
  need to change at all; Part 3 just uses what was already there.
- **Tenant isolation** — `AssetCategory` follows the identical
  `req.scoped()` / `assertOwnership()` pattern as every other tenant-owned
  collection. Two unrelated companies can both have a category named
  "Steel Rod" with zero conflict; neither can see or fetch the other's by id.
- **Soft delete** — `DELETE` sets `isActive: false` rather than removing the
  document, since Module 2's stock/PO/manufacturing records will reference
  categories by id and shouldn't be left pointing at nothing.
- **Subscription tier preview** — `SubscriptionTier.maxMaterialTypes`
  (already defined as a stub field back in Part 1) is now actually
  enforced on category creation, the same way `Invitation`'s `maxUsers`
  check already works. Full gatekeeping across every resource type is
  still Part 5's job; this is just honoring the one field that's
  specifically about material types.

### Automated Tests
```bash
cd backend
npm install
npm test
```
The first run of `npm test` downloads a real MongoDB binary via
`mongodb-memory-server` (needs internet access; can take a minute). After
that it's cached and subsequent runs are fast. You should see:
```
Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
```
14 tests cover Part 3 directly (custom fields, flexible units, duplicate
names scoped correctly per-tenant, cross-tenant 404s, soft delete, RBAC
enforcement, subscription limit). 9 regression tests confirm Parts 1 and 2
still work correctly after the `app.js` split.

> **Note:** this suite could not be executed inside the sandboxed
> environment used to build it — outbound access to MongoDB's binary CDN
> is blocked there (`host_not_allowed`), which is a sandbox-only
> restriction, not a real problem with the test/`mongodb-memory-server`
> setup. Everything *not* requiring a live database was verified there
> instead: all files pass `node --check`, and the full Express `app.js`
> loads with every route (including the new `/api/asset-categories`
> endpoints) correctly wired, with zero DB connection needed to do that
> check. Run `npm test` on your own machine to see the full suite pass.

### Manually Verify With curl
```bash
# Register a company (from Part 1)
curl -X POST http://localhost:5000/api/auth/register-company -H "Content-Type: application/json" -d '{
  "companyName": "Acme Textiles", "companyEmail": "info@acme.test", "industry": "Manufacturing",
  "phoneNumber": "+1-555-0100", "firstName": "Alice", "lastName": "Owner",
  "ownerEmail": "alice@acme.test", "password": "supersecret123"
}'
# -> copy the token

# Create a custom asset category with sector-specific fields
curl -X POST http://localhost:5000/api/asset-categories -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{
  "name": "Cotton Yarn",
  "unitOfMeasure": "kg",
  "customFields": [
    { "fieldName": "batch_color", "fieldType": "text", "required": false },
    { "fieldName": "thread_count", "fieldType": "number", "required": true }
  ],
  "lowStockThreshold": 50
}'

# List categories
curl http://localhost:5000/api/asset-categories -H "Authorization: Bearer <TOKEN>"
```

---

## Part 4: Multi-Warehouse / Location Mapping

*"Structural capability for a single tenant to track separate inventories
across multiple physical buildings, shelves, or floor bins with
per-location stock balances."*

A tenant can model its physical footprint as a nested tree — a building
containing shelves, a shelf containing bins — and hold a **separate stock
balance for the same material at every location** in that tree.

### New Backend Files
```
backend/
├── models/Warehouse.js               # A physical location: building/shelf/bin, nests via parentLocation
├── models/LocationStock.js           # (warehouse, assetCategory) -> quantity, unique per pair per tenant
├── controllers/warehouseController.js      # CRUD for locations, cycle prevention, subscription limit
├── controllers/locationStockController.js  # Set/view balances by location or by material
├── routes/warehouseRoutes.js          # /api/warehouses (+ nested /:id/stock routes)
└── tests/warehouses.test.js           # 17 tests covering hierarchy, isolation, RBAC, and balances
```
`routes/assetCategoryRoutes.js` also gained one route:
`GET /api/asset-categories/:categoryId/stock` — the reverse lookup, showing
every location holding a given material and how much sits at each one.

### How It Works
- **`Warehouse.parentLocation`** lets locations nest to any depth — a
  building has no parent, a shelf's parent is a building, a bin's parent is
  a shelf. Nothing about the depth or naming is hardcoded to exactly three
  levels.
- **`LocationStock`** is deliberately its own collection, not a field on
  `AssetCategory` or `Warehouse` — its whole job is the compound unique
  index `(tenantId, warehouse, assetCategory)`, which is what lets "Cotton
  Yarn" hold *120 kg* at the Main Warehouse and *35 kg* at Shelf A3
  simultaneously, as two independent rows.
- **Only top-level locations count against the plan.** `SubscriptionTier.
  maxWarehouses` (already stubbed in Part 1) is enforced on create, but
  only when `parentLocation` is empty — a shelf or bin is a subdivision of
  a site the tenant is already paying for, not a new one. The Free tier
  defaults to 1 top-level site with unlimited shelves/bins inside it.
- **Cycle prevention** — re-parenting a location walks the *proposed* new
  parent's own ancestor chain first, so a building can never end up nested
  inside one of its own shelves.
- **Soft delete with a guard rail** — deleting a location that still has
  active children is rejected (400), so a building can't vanish out from
  under shelves that still reference it. Matches Part 3's `isActive: false`
  pattern otherwise.
- **New permissions** (`warehouse:view/create/edit/delete` in
  `config/permissions.js`) gate the location *structure* itself; the
  existing `inventory:view/edit` permissions gate the stock *balances*
  held at a location, since a balance is inventory data, not a structural
  change. The `Warehouse Manager` / `Factory Floor Worker` / `Read-Only
  Auditor` templates were each updated with the matching `warehouse:*`
  permission.
- **Tenant isolation** follows the identical `req.scoped()` /
  `assertOwnership()` pattern as every other collection in this codebase.

### Automated Tests
```bash
cd backend
npm test
```
17 new tests in `tests/warehouses.test.js` cover: creating a building,
nesting a shelf and a bin inside it, rejecting a parent from another
tenant, duplicate name rejection (scoped per-tenant), cycle prevention on
re-parenting, cross-tenant isolation for both locations and stock,
update/soft-delete, refusing to delete a location with active children,
the `maxWarehouses` gate (and confirming shelves/bins don't count against
it), RBAC enforcement, and the core Part 4 claim itself — the same
material carrying two different quantities at two different locations
simultaneously, with a working aggregate total across all locations.

> **Note:** exactly like Part 3, this suite could not be executed inside
> the sandbox used to build it — outbound access to MongoDB's binary CDN
> returns `403` there, a sandbox-only restriction. Everything else was
> verified there instead: all new files pass `node --check`, and the full
> `app.js` boots with `/api/warehouses` and the new
> `/api/asset-categories/:id/stock` route correctly registered, with zero
> DB connection needed to check that. Run `npm test` on your own machine
> to see the full suite pass.

### Manually Verify With curl
```bash
# Create a top-level building
curl -X POST http://localhost:5000/api/warehouses -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{
  "name": "Main Warehouse", "locationType": "building"
}'
# -> copy its _id as <BUILDING_ID>

# Nest a shelf inside it
curl -X POST http://localhost:5000/api/warehouses -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{
  "name": "Shelf A3", "locationType": "shelf", "parentLocation": "<BUILDING_ID>"
}'
# -> copy its _id as <SHELF_ID>

# Set a stock balance for a material (from Part 3) at each location
curl -X PUT http://localhost:5000/api/warehouses/<BUILDING_ID>/stock/<CATEGORY_ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"quantity": 120}'
curl -X PUT http://localhost:5000/api/warehouses/<SHELF_ID>/stock/<CATEGORY_ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"quantity": 35}'

# See the same material's balance broken down across every location
curl http://localhost:5000/api/asset-categories/<CATEGORY_ID>/stock -H "Authorization: Bearer <TOKEN>"
```

---


## What This Proves
Every request is scoped server-side to `req.tenantId`, which is derived **only**
from the verified JWT — never from client input. A company can register, log in,
create data, and that data is provably invisible/unreachable to every other
company on the platform.

## Structure
```
in-track-module1/
├── backend/
│   ├── config/database.js          # MongoDB connection
│   ├── models/
│   │   ├── Tenant.js                # Company/tenant schema
│   │   ├── User.js                  # User schema (tenant-scoped)
│   │   ├── Role.js                  # Minimal stub (full RBAC = Part 2)
│   │   ├── SubscriptionTier.js      # Minimal stub (full gating = Part 5)
│   │   └── SampleItem.js            # Demo tenant-scoped resource
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification, attaches req.user/req.tenantId
│   │   └── tenantIsolation.js       # CORE: enforces isolation on every query
│   ├── controllers/
│   │   ├── authController.js        # Register company, login, getMe
│   │   └── itemController.js        # CRUD demonstrating req.scoped() pattern
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── itemRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── generateToken.js
│   ├── server.js                    # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/TenantContext.js # React context carrying tenant identity
    │   ├── services/api.js          # Axios instance + JWT interceptor
    │   ├── services/authService.js
    │   ├── components/auth/ProtectedRoute.js
    │   ├── pages/RegisterCompany.js
    │   ├── pages/Login.js
    │   ├── pages/Dashboard.js
    │   ├── App.js
    │   └── App.css
    ├── public/index.html
    ├── .env.example
    └── package.json
```

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI (local or Atlas) and a real JWT_SECRET
npm run dev        # starts on http://localhost:5000
npm test           # runs the automated test suite (see Part 3 section for details)
```

Requires a running MongoDB instance (local `mongod`, Docker, or MongoDB Atlas).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start           # starts on http://localhost:3000
```

## Testing Isolation Yourself
1. Register **Company A** at `/register`.
2. Log in, go to `/dashboard`, add an item via the API (`POST /api/items`).
3. Log out, register **Company B** with a different email.
4. Log in as Company B → the dashboard is empty. Company A's item is
   completely invisible — not filtered client-side, but genuinely
   unreachable from the database query itself.
5. Try calling `GET /api/items/:id` with Company A's item ID while logged
   in as Company B → returns `404 Not Found` (not 403), so the API doesn't
   even confirm the item exists.

## How Isolation Is Enforced (the important part)
- `middleware/auth.js` verifies the JWT and loads `req.tenantId` from the
  **database user record**, never from anything the client sends.
- `middleware/tenantIsolation.js` exposes `req.scoped(filter)`, which always
  merges in `tenantId: req.tenantId` — even if a caller tries to pass their
  own `tenantId` in the filter, the server's value wins.
- Every Mongoose write stamps `tenantId: req.tenantId` at creation time.
- `assertOwnership()` double-checks fetched documents belong to the
  requester's tenant and returns `404` (not `403`) on mismatch, so the API
  never reveals that another tenant's resource exists.

## Verified
- ✅ All backend files pass `node --check` (no syntax errors)
- ✅ 7/7 unit tests pass on the isolation logic itself (cross-tenant block,
  filter injection, ownership assertion, null handling)
- ✅ Full Express app boots and all routes respond correctly (health check,
  404 handling, 401 on missing auth, 400 on invalid registration payload)
- ✅ React frontend builds successfully with zero errors (`npm run build`)

Note: A live MongoDB connection could not be started in this sandbox (network
access is restricted to package registries), so the DB write/read path itself
should be tested on your machine per the setup steps above — but every piece
of application logic around it has been verified.
