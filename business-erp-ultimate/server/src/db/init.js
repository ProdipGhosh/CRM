import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  const client = await pool.connect();

  try {
    console.log("🛠 Creating database tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        company_name VARCHAR(150),
        email VARCHAR(150),
        phone VARCHAR(50),
        requirement TEXT,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
        customer_name VARCHAR(150),
        product_name VARCHAR(150),
        quantity INTEGER DEFAULT 0,
        estimated_value NUMERIC(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_orders (
        id SERIAL PRIMARY KEY,
        opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
        product_name VARCHAR(150),
        quantity INTEGER DEFAULT 0,
        required_materials JSONB,
        status VARCHAR(50) DEFAULT 'Pending',
        inventory_deducted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(150) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        quantity INTEGER DEFAULT 0,
        unit VARCHAR(50),
        reorder_level INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE,
        department VARCHAR(100),
        designation VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database tables created successfully");
  } catch (err) {
    console.error("❌ DB init failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();