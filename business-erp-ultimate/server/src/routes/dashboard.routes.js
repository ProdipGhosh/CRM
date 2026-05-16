import { getStats } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function dashboardRoutes(fastify) {
  fastify.get('/stats', { preHandler: [authenticate] }, getStats);
}
