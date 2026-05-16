import {
  getOpportunities,
  getOpportunityById,
  convertOpportunityToManufacturing,
} from '../controllers/opportunity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function opportunityRoutes(fastify) {
  fastify.get('/', { preHandler: [authenticate] }, getOpportunities);
  fastify.get('/:id', { preHandler: [authenticate] }, getOpportunityById);
  fastify.post('/:id/convert-to-manufacturing', { preHandler: [authenticate] }, convertOpportunityToManufacturing);
}
