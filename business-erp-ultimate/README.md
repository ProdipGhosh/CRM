# 🏭 Business ERP Ultimate

A **Centralized Business Operations Platform** built as a full-stack demo project covering Manufacturing, Sales, CRM, Warehouse Management, and HR — connected through a complete **Golden Path** business flow.

---

## 🚀 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router DOM v6
- JavaScript only (no TypeScript)

### Backend
- Node.js + Fastify.js
- Neon PostgreSQL (via `pg` Pool)
- JWT Authentication (`@fastify/jwt`)
- bcryptjs password hashing
- REST API

### Database
- Neon PostgreSQL (serverless Postgres)
- Raw SQL queries — no ORM, no Prisma

---

## ✨ Features

| Module | Features |
|---|---|
| 🔐 Auth | JWT login, protected routes, localStorage token |
| 📊 Dashboard | Live stats: leads, opportunities, orders, inventory, HR |
| 👥 CRM | Add/list/view leads, convert lead → opportunity |
| 💼 Sales | List opportunities, convert opportunity → manufacturing order |
| 🏭 Manufacturing | List orders, update status, auto-inventory deduction on Completed |
| 📦 Warehouse | Inventory table, low stock badge, add items |
| 👤 HR | Employee list, add employee, activate/deactivate |

---

## 🌟 Golden Path Demo Flow

```
1. Create a CRM Lead
         ↓
2. View Lead → Click "Convert to Opportunity"
         ↓
3. Sales page → Click "To Manufacturing" → Define raw materials
         ↓
4. Manufacturing page → Change status to "Completed"
         ↓
5. Warehouse inventory auto-deducted ✅
         ↓
6. Dashboard stats refresh automatically ✅
```

---

## 🗄️ Neon Database Setup

1. Go to [https://neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g. `business-erp`)
3. Copy your **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Open the **SQL Editor** in Neon dashboard
5. Paste and run the contents of `server/src/db/schema.sql`

---

## ⚙️ Installation & Setup

### 1. Clone / unzip the project

```bash
cd business-erp-ultimate
```

### 2. Setup Backend

```bash
cd server
cp .env.example .env
# Edit .env and fill in DATABASE_URL and JWT_SECRET
npm install
```

### 3. Run the SQL Schema

Open Neon SQL Editor → paste contents of `server/src/db/schema.sql` → Run

### 4. Seed the Database

```bash
npm run seed
```

Expected output:
```
✓ Admin user created
✓ 5 CRM leads created
✓ 3 sales opportunities created
✓ 3 manufacturing orders created
✓ 8 inventory items created
✓ 5 employees created
🎉 Seed completed successfully!
```

### 5. Start the Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 6. Setup Frontend

```bash
cd ../client
cp .env.example .env
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Field | Value |
|---|---|
| Email | `admin1234@example.com` |
| Password | `admin1234` |

---

## 📁 Project Structure

```
business-erp-ultimate/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios instance with JWT interceptors
│       ├── components/      # Reusable UI components
│       ├── layouts/         # DashboardLayout with sidebar + navbar
│       ├── pages/           # Feature pages (auth, crm, sales, etc.)
│       └── routes/          # ProtectedRoute
├── server/                  # Fastify backend
│   └── src/
│       ├── config/          # Neon PostgreSQL pool
│       ├── controllers/     # Business logic per module
│       ├── db/              # schema.sql + seed.js
│       ├── middleware/       # JWT authentication
│       ├── routes/          # API route definitions
│       └── server.js        # Fastify entry point
├── README.md
├── API_DOCUMENTATION.md
└── ARCHITECTURE.md
```

---

## 🗜️ How to Zip the Project

### On Linux/Mac:
```bash
cd ..   # Go one folder above business-erp-ultimate
zip -r business-erp-ultimate.zip business-erp-ultimate/ \
  --exclude "*/node_modules/*" \
  --exclude "*/.git/*" \
  --exclude "*/.env"
```

### On Windows (PowerShell):
```powershell
Compress-Archive -Path business-erp-ultimate -DestinationPath business-erp-ultimate.zip
# Then manually delete node_modules folders from the zip if needed
```

### Recommended: Use a .zipignore approach
Before zipping, delete node_modules:
```bash
rm -rf client/node_modules server/node_modules
zip -r business-erp-ultimate.zip business-erp-ultimate/
```

The recipient runs `npm install` in both `client/` and `server/` after unzipping.
