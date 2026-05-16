-- Business ERP Ultimate - PostgreSQL Schema
-- Run this file in your Neon SQL editor before running seed.js

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS manufacturing_orders CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads table (CRM)
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  requirement TEXT,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opportunities table (Sales)
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_value NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Manufacturing Orders table
CREATE TABLE manufacturing_orders (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  required_materials JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'Pending',
  inventory_deducted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory table (Warehouse)
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  reorder_level INTEGER DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Employees table (HR)
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100),
  designation VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);
