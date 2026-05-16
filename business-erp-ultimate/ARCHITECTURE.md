# 🏗️ Architecture — Business ERP Ultimate

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                             │
│   React + Vite (Port 5173)                                  │
│   ┌──────────┐  ┌──────────┐  ┌───────────────────────┐   │
│   │ Sidebar  │  │  Navbar  │  │     Page Components    │   │
│   └──────────┘  └──────────┘  └───────────────────────┘   │
│          │                              │                    │
│   ┌──────────────────────────────────────────────────┐     │
│   │              React Router DOM v6                  │     │
│   │   /dashboard /crm/leads /sales /manufacturing     │     │
│   │   /warehouse /hr                                  │     │
│   └──────────────────────────────────────────────────┘     │
│          │                                                    │
│   ┌──────────────────────────────────────────────────┐     │
│   │         Axios Instance (api/axios.js)             │     │
│   │   - Attaches JWT from localStorage                │     │
│   │   - 401 interceptor → redirect to login           │     │
│   └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTP REST API
                    (JSON over HTTPS)
                           │
┌─────────────────────────────────────────────────────────────┐
│                     FASTIFY SERVER                           │
│                    Node.js (Port 5000)                       │
│                                                             │
│   ┌─────────────────────────────────────────────────┐      │
│   │           @fastify/cors + @fastify/jwt           │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   Route Handlers:                                           │
│   POST /api/auth/login        (no auth)                     │
│   GET  /api/dashboard/stats   (JWT protected)               │
│   *    /api/leads/*           (JWT protected)               │
│   *    /api/opportunities/*   (JWT protected)               │
│   *    /api/manufacturing-orders/* (JWT protected)          │
│   *    /api/inventory/*       (JWT protected)               │
│   *    /api/employees/*       (JWT protected)               │
│                                                             │
│   Controllers → Raw SQL via pg Pool                         │
└─────────────────────────────────────────────────────────────┘
                           │
                    pg Pool (SSL)
                           │
┌─────────────────────────────────────────────────────────────┐
│               NEON POSTGRESQL (Serverless)                   │
│                                                             │
│   Tables:                                                   │
│   users · leads · opportunities                             │
│   manufacturing_orders · inventory · employees              │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Flow

```
Auth Module
  POST /login → bcrypt.compare → JWT sign → return token

CRM Module
  GET /leads → SELECT * FROM leads
  POST /leads → INSERT INTO leads
  GET /leads/:id → SELECT lead + linked opportunity
  PUT /leads/:id → UPDATE leads
  POST /leads/:id/convert-to-opportunity
    → BEGIN TRANSACTION
    → INSERT INTO opportunities
    → UPDATE leads SET status='Converted'
    → COMMIT

Sales Module
  GET /opportunities → SELECT opportunities JOIN leads
  POST /opportunities/:id/convert-to-manufacturing
    → BEGIN TRANSACTION
    → INSERT INTO manufacturing_orders (with required_materials JSONB)
    → UPDATE opportunities SET status='Converted'
    → COMMIT

Manufacturing Module
  GET /manufacturing-orders → SELECT orders JOIN opportunities
  PUT /manufacturing-orders/:id/status
    → IF status='Completed' AND inventory_deducted=false
        → BEGIN TRANSACTION
        → FOR EACH material IN required_materials
            → SELECT inventory WHERE sku=material.sku
            → UPDATE inventory SET quantity=quantity-required_qty
        → UPDATE manufacturing_orders SET inventory_deducted=true
        → COMMIT
    → ELSE → UPDATE status only

Warehouse Module
  GET /inventory → SELECT * FROM inventory
  POST /inventory → INSERT INTO inventory
  PUT /inventory/:id → UPDATE inventory

HR Module
  GET /employees → SELECT * FROM employees
  POST /employees → INSERT INTO employees
  PUT /employees/:id → UPDATE employees (status toggle etc.)
```

---

## Golden Path Text Diagram

```
STEP 1: CRM — Create Lead
┌──────────────────────────────────┐
│  Lead: Arjun Patel               │
│  Company: AutoDrive Ltd          │
│  Requirement: 1000 Circuit Boards│
│  Status: Qualified               │
└──────────────────┬───────────────┘
                   │ User clicks "Convert to Opportunity"
                   ▼
STEP 2: Sales — Opportunity Created
┌──────────────────────────────────┐
│  Opportunity #4                  │
│  Product: Circuit Board PCB-X200 │
│  Quantity: 1000                  │
│  Estimated Value: ₹8,50,000      │
│  Status: Open                    │
└──────────────────┬───────────────┘
                   │ User clicks "To Manufacturing"
                   │ User defines raw materials
                   ▼
STEP 3: Manufacturing — Order Created
┌──────────────────────────────────┐
│  Manufacturing Order MO-0004     │
│  Product: Circuit Board PCB-X200 │
│  Quantity: 1000                  │
│  Materials:                      │
│    - Copper Sheet (RAW-001): 200 │
│    - Resistors Pack (RAW-002): 500│
│  Status: Pending                 │
│  inventory_deducted: false       │
└──────────────────┬───────────────┘
                   │ User changes status → "Completed"
                   ▼
STEP 4: Warehouse — Auto Inventory Deduction
┌──────────────────────────────────┐
│  Copper Sheet (RAW-001)          │
│    Before: 500 → After: 300 ✅   │
│                                  │
│  Resistors Pack (RAW-002)        │
│    Before: 1200 → After: 700 ✅  │
│                                  │
│  inventory_deducted = TRUE       │
│  (prevents double deduction)     │
└──────────────────────────────────┘
                   │
                   ▼
STEP 5: Dashboard Stats Refresh Automatically ✅
```

---

## Database Relationships

```
users
  id (PK)

leads
  id (PK)
  → Has one opportunity (via opportunities.lead_id)

opportunities
  id (PK)
  lead_id (FK → leads.id)
  → Has one manufacturing_order (via manufacturing_orders.opportunity_id)

manufacturing_orders
  id (PK)
  opportunity_id (FK → opportunities.id)
  required_materials (JSONB array)
  inventory_deducted (BOOLEAN) ← prevents double deduction

inventory
  id (PK)
  sku (UNIQUE) ← matched against required_materials[].sku

employees
  id (PK)
  email (UNIQUE)
```

---

## Inventory Deduction Logic

The core deduction logic lives in `manufacturing.controller.js`:

```
PUT /api/manufacturing-orders/:id/status { status: "Completed" }

IF order.status == "Completed" → skip (already finalized)
IF order.inventory_deducted == true → skip (already deducted, prevents double-hit)

ELSE IF new status == "Completed":
  BEGIN TRANSACTION
    FOR EACH material IN order.required_materials:
      currentQty = SELECT quantity FROM inventory WHERE sku = material.sku
      newQty = MAX(0, currentQty - material.required_qty)
      UPDATE inventory SET quantity = newQty WHERE sku = material.sku
    UPDATE manufacturing_orders
      SET status = 'Completed', inventory_deducted = true
      WHERE id = order.id
  COMMIT TRANSACTION

Response includes inventoryDeductionLog[] showing before/after per material.
```

**Safety guarantees:**
1. **Atomic transaction** — either all deductions succeed or none do
2. **Double-deduction prevention** — `inventory_deducted` flag checked before any deduction
3. **Floor at zero** — stock never goes negative (uses `MAX(0, qty - required)`)
4. **SKU matching** — deduction matched by `sku` field, not item name

---

## Frontend Auth Flow

```
User visits any route
  → ProtectedRoute checks localStorage for 'erp_token'
  → Token missing? Redirect to /login
  → Token present? Render page

Login page
  → POST /api/auth/login
  → Store token in localStorage as 'erp_token'
  → Store user object as 'erp_user'
  → Navigate to /dashboard

Axios interceptor (api/axios.js)
  → Every request: attach Authorization: Bearer <token>
  → Every 401 response: clear localStorage + redirect to /login
```
