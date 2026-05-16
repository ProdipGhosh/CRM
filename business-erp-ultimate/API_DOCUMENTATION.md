# 📋 API Documentation — Business ERP Ultimate

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/login` require:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "admin1234@example.com",
  "password": "admin1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrator",
    "email": "admin1234@example.com",
    "role": "admin"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 📊 Dashboard

### GET /api/dashboard/stats

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalLeads": 5,
    "activeOpportunities": 2,
    "totalManufacturingOrders": 3,
    "pendingManufacturingOrders": 2,
    "inProgressManufacturingOrders": 1,
    "completedManufacturingOrders": 0,
    "warehouseItems": 8,
    "activeEmployees": 4,
    "lowStockItems": 1
  }
}
```

---

## 👥 CRM — Leads

### GET /api/leads

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "Rahul Sharma",
      "company_name": "TechNova Solutions",
      "email": "rahul@technova.in",
      "phone": "+91-9876543210",
      "requirement": "Need 500 units of Industrial Sensor Kit",
      "status": "New",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### POST /api/leads

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "company_name": "Acme Corp",
  "email": "john@acme.com",
  "phone": "+91-9876543210",
  "requirement": "Need 200 units of product X",
  "status": "New"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": 6,
    "customer_name": "John Doe",
    "company_name": "Acme Corp",
    "email": "john@acme.com",
    "phone": "+91-9876543210",
    "requirement": "Need 200 units of product X",
    "status": "New",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### GET /api/leads/:id

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "customer_name": "Arjun Patel",
    "company_name": "AutoDrive Ltd",
    "email": "arjun@autodrive.in",
    "phone": "+91-9123456789",
    "requirement": "Looking for 1000 units of Circuit Boards",
    "status": "Qualified",
    "created_at": "2024-01-15T09:00:00.000Z",
    "opportunity": null
  }
}
```

---

### PUT /api/leads/:id

**Request Body:**
```json
{
  "status": "Contacted",
  "requirement": "Updated requirement details"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": { "...updated lead object..." }
}
```

---

### POST /api/leads/:id/convert-to-opportunity

**Request Body:**
```json
{
  "product_name": "Circuit Board PCB-X200",
  "quantity": 1000,
  "estimated_value": 850000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Lead converted to opportunity successfully",
  "data": {
    "id": 4,
    "lead_id": 3,
    "customer_name": "Arjun Patel",
    "product_name": "Circuit Board PCB-X200",
    "quantity": 1000,
    "estimated_value": "850000.00",
    "status": "Open",
    "created_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error (400) — already converted:**
```json
{
  "success": false,
  "message": "Lead has already been converted"
}
```

---

## 💼 Sales — Opportunities

### GET /api/opportunities

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 3,
      "customer_name": "Arjun Patel",
      "company_name": "AutoDrive Ltd",
      "product_name": "Circuit Board PCB-X200",
      "quantity": 1000,
      "estimated_value": "850000.00",
      "status": "Open",
      "created_at": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/opportunities/:id

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_name": "Arjun Patel",
    "product_name": "Circuit Board PCB-X200",
    "quantity": 1000,
    "estimated_value": "850000.00",
    "status": "Open",
    "manufacturing_order": null
  }
}
```

---

### POST /api/opportunities/:id/convert-to-manufacturing

**Request Body:**
```json
{
  "required_materials": [
    { "material": "Copper Sheet", "sku": "RAW-001", "required_qty": 200 },
    { "material": "Resistors Pack", "sku": "RAW-002", "required_qty": 500 }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Opportunity converted to manufacturing order successfully",
  "data": {
    "id": 4,
    "opportunity_id": 1,
    "product_name": "Circuit Board PCB-X200",
    "quantity": 1000,
    "required_materials": [
      { "material": "Copper Sheet", "sku": "RAW-001", "required_qty": 200 },
      { "material": "Resistors Pack", "sku": "RAW-002", "required_qty": 500 }
    ],
    "status": "Pending",
    "inventory_deducted": false,
    "created_at": "2024-01-15T13:00:00.000Z"
  }
}
```

---

## 🏭 Manufacturing Orders

### GET /api/manufacturing-orders

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "opportunity_id": 1,
      "product_name": "Circuit Board PCB-X200",
      "quantity": 1000,
      "required_materials": [...],
      "status": "In Progress",
      "inventory_deducted": false,
      "customer_name": "Arjun Patel",
      "estimated_value": "850000.00",
      "created_at": "2024-01-15T13:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/manufacturing-orders/:id/status

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Response (200) — when Completed:**
```json
{
  "success": true,
  "message": "Manufacturing order completed and inventory automatically deducted",
  "data": {
    "id": 1,
    "status": "Completed",
    "inventory_deducted": true,
    "...": "..."
  },
  "inventoryDeducted": true,
  "inventoryDeductionLog": [
    { "material": "Copper Sheet", "sku": "RAW-001", "deducted": 200, "remaining": 300 },
    { "material": "Resistors Pack", "sku": "RAW-002", "deducted": 500, "remaining": 700 }
  ]
}
```

**Valid status values:** `Pending` | `In Progress` | `Completed` | `Cancelled`

---

## 📦 Warehouse — Inventory

### GET /api/inventory

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_name": "Copper Sheet",
      "sku": "RAW-001",
      "quantity": 500,
      "unit": "sheets",
      "reorder_level": 50,
      "last_updated": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/inventory

**Request Body:**
```json
{
  "item_name": "Aluminum Rod",
  "sku": "RAW-009",
  "quantity": 200,
  "unit": "pcs",
  "reorder_level": 20
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": { "...new item object..." }
}
```

---

### PUT /api/inventory/:id

**Request Body:**
```json
{
  "quantity": 250,
  "reorder_level": 25
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": { "...updated item object..." }
}
```

---

## 👤 HR — Employees

### GET /api/employees

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ankit Verma",
      "email": "ankit.verma@erp.com",
      "department": "Manufacturing",
      "designation": "Production Manager",
      "status": "Active",
      "created_at": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```

---

### POST /api/employees

**Request Body:**
```json
{
  "name": "Neha Gupta",
  "email": "neha.gupta@erp.com",
  "department": "Engineering",
  "designation": "Backend Developer",
  "status": "Active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": { "...new employee object..." }
}
```

---

### PUT /api/employees/:id

**Request Body:**
```json
{
  "status": "Inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": { "...updated employee object..." }
}
```

---

## ⚠️ Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Lead not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Customer name is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
