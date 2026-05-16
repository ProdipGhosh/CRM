import {
  getManufacturingOrders,
  getManufacturingOrderById,
  updateManufacturingOrderStatus,
} from '../controllers/manufacturing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function manufacturingRoutes(fastify) {
  fastify.get('/', { preHandler: [authenticate] }, getManufacturingOrders);
  fastify.get('/:id', { preHandler: [authenticate] }, getManufacturingOrderById);
  fastify.put('/:id/status', { preHandler: [authenticate] }, updateManufacturingOrderStatus);
}
