import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import leadRoutes from './routes/lead.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import manufacturingRoutes from './routes/manufacturing.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import hrRoutes from './routes/hr.routes.js';

dotenv.config();

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: [
    'http://localhost:5173',
    'https://crm-one-gold.vercel.app',
  ],
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_me',
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(leadRoutes, { prefix: '/api/leads' });
await app.register(opportunityRoutes, { prefix: '/api/opportunities' });
await app.register(manufacturingRoutes, {
  prefix: '/api/manufacturing-orders',
});
await app.register(inventoryRoutes, { prefix: '/api/inventory' });
await app.register(hrRoutes, { prefix: '/api/employees' });

app.get('/', async () => {
  return {
    status: 'ok',
    message: 'API Running',
  };
});

await app.ready();

export default async function handler(req, res) {
  app.server.emit('request', req, res);
}