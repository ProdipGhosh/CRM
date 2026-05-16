import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await client.query('DELETE FROM manufacturing_orders');
    await client.query('DELETE FROM opportunities');
    await client.query('DELETE FROM leads');
    await client.query('DELETE FROM inventory');
    await client.query('DELETE FROM employees');
    await client.query('DELETE FROM users');

    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE leads_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE opportunities_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE manufacturing_orders_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE employees_id_seq RESTART WITH 1');

    // --- Admin User ---
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
      ['Administrator', 'admin1234@example.com', hashedPassword, 'admin']
    );
    console.log('✓ Admin user created');

    // --- CRM Leads ---
    const leads = [
      ['Rahul Sharma', 'TechNova Solutions', 'rahul@technova.in', '+91-9876543210', 'Need 500 units of Industrial Sensor Kit', 'New'],
      ['Priya Mehta', 'BuildRight Corp', 'priya@buildright.com', '+91-9988776655', 'Require 200 units of Steel Frame Assembly', 'Contacted'],
      ['Arjun Patel', 'AutoDrive Ltd', 'arjun@autodrive.in', '+91-9123456789', 'Looking for 1000 units of Circuit Boards', 'Qualified'],
      ['Sunita Rao', 'GreenField Industries', 'sunita@greenfield.com', '+91-9345678901', 'Interested in 300 units of Solar Panel Mounts', 'Converted'],
      ['Vikram Singh', 'PowerTech Pvt Ltd', 'vikram@powertech.in', '+91-9876501234', 'Want 150 units of Motor Controllers', 'New'],
    ];
    for (const lead of leads) {
      await client.query(
        `INSERT INTO leads (customer_name, company_name, email, phone, requirement, status) VALUES ($1,$2,$3,$4,$5,$6)`,
        lead
      );
    }
    console.log('✓ 5 CRM leads created');

    // --- Sales Opportunities ---
    const opportunities = [
      [3, 'Arjun Patel', 'Circuit Board PCB-X200', 1000, 850000.00, 'Open'],
      [4, 'Sunita Rao', 'Solar Panel Mount SPM-100', 300, 420000.00, 'Converted'],
      [2, 'Priya Mehta', 'Steel Frame Assembly SFA-50', 200, 310000.00, 'Open'],
    ];
    for (const opp of opportunities) {
      await client.query(
        `INSERT INTO opportunities (lead_id, customer_name, product_name, quantity, estimated_value, status) VALUES ($1,$2,$3,$4,$5,$6)`,
        opp
      );
    }
    console.log('✓ 3 sales opportunities created');

    // --- Manufacturing Orders ---
    const manufacturingOrders = [
      [
        1,
        'Circuit Board PCB-X200',
        1000,
        JSON.stringify([
          { material: 'Copper Sheet', sku: 'RAW-001', required_qty: 200 },
          { material: 'Resistors Pack', sku: 'RAW-002', required_qty: 500 },
          { material: 'Capacitors Set', sku: 'RAW-003', required_qty: 300 },
        ]),
        'In Progress',
        false,
      ],
      [
        2,
        'Solar Panel Mount SPM-100',
        300,
        JSON.stringify([
          { material: 'Aluminum Profile', sku: 'RAW-004', required_qty: 150 },
          { material: 'Steel Bolts Box', sku: 'RAW-005', required_qty: 100 },
        ]),
        'Pending',
        false,
      ],
      [
        3,
        'Steel Frame Assembly SFA-50',
        200,
        JSON.stringify([
          { material: 'Steel Rod Bundle', sku: 'RAW-006', required_qty: 80 },
          { material: 'Welding Wire Spool', sku: 'RAW-007', required_qty: 40 },
        ]),
        'Pending',
        false,
      ],
    ];
    for (const mo of manufacturingOrders) {
      await client.query(
        `INSERT INTO manufacturing_orders (opportunity_id, product_name, quantity, required_materials, status, inventory_deducted) VALUES ($1,$2,$3,$4,$5,$6)`,
        mo
      );
    }
    console.log('✓ 3 manufacturing orders created');

    // --- Inventory ---
    const inventory = [
      ['Copper Sheet', 'RAW-001', 500, 'sheets', 50],
      ['Resistors Pack', 'RAW-002', 1200, 'packs', 100],
      ['Capacitors Set', 'RAW-003', 800, 'sets', 80],
      ['Aluminum Profile', 'RAW-004', 300, 'pcs', 30],
      ['Steel Bolts Box', 'RAW-005', 150, 'boxes', 20],
      ['Steel Rod Bundle', 'RAW-006', 90, 'bundles', 15],
      ['Welding Wire Spool', 'RAW-007', 45, 'spools', 10],
      ['Plastic Housing Kit', 'RAW-008', 8, 'kits', 20],
    ];
    for (const item of inventory) {
      await client.query(
        `INSERT INTO inventory (item_name, sku, quantity, unit, reorder_level) VALUES ($1,$2,$3,$4,$5)`,
        item
      );
    }
    console.log('✓ 8 inventory items created');

    // --- Employees ---
    const employees = [
      ['Ankit Verma', 'ankit.verma@erp.com', 'Manufacturing', 'Production Manager', 'Active'],
      ['Divya Nair', 'divya.nair@erp.com', 'Sales', 'Sales Executive', 'Active'],
      ['Rohit Kapoor', 'rohit.kapoor@erp.com', 'HR', 'HR Manager', 'Active'],
      ['Sneha Joshi', 'sneha.joshi@erp.com', 'Warehouse', 'Warehouse Supervisor', 'Active'],
      ['Karan Malhotra', 'karan.malhotra@erp.com', 'CRM', 'CRM Analyst', 'Inactive'],
    ];
    for (const emp of employees) {
      await client.query(
        `INSERT INTO employees (name, email, department, designation, status) VALUES ($1,$2,$3,$4,$5)`,
        emp
      );
    }
    console.log('✓ 5 employees created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('📧 Admin Login: admin1234@example.com');
    console.log('🔑 Password: admin1234');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
