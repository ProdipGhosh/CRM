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
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

// Register plugins
await app.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_me',
});

// Register routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(leadRoutes, { prefix: '/api/leads' });
await app.register(opportunityRoutes, { prefix: '/api/opportunities' });
await app.register(manufacturingRoutes, { prefix: '/api/manufacturing-orders' });
await app.register(inventoryRoutes, { prefix: '/api/inventory' });
await app.register(hrRoutes, { prefix: '/api/employees' });

// Health check
app.get('/', async () => ({
  status: 'ok',
  message: 'Business ERP Ultimate API is running',
  version: '1.0.0',
}));

app.get('/health', async () => ({ status: 'healthy' }));
export default app;
// Start server
const PORT = parseInt(process.env.PORT) || 5000;
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base: http://localhost:${PORT}/api`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
