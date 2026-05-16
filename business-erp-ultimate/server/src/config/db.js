import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Serverless-optimized pool: keep connections small.
// Vercel can spin up many function instances simultaneously — a large pool
// per instance exhausts Neon's connection limit fast.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,                // one connection per serverless instance
  idleTimeoutMillis: 10000, // release idle connections quickly
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export default pool;
