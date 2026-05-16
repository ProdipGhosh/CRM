import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
} from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function inventoryRoutes(fastify) {
  fastify.get('/', { preHandler: [authenticate] }, getInventory);
  fastify.post('/', { preHandler: [authenticate] }, createInventoryItem);
  fastify.put('/:id', { preHandler: [authenticate] }, updateInventoryItem);
}
