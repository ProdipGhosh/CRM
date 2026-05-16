import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  convertLeadToOpportunity,
} from '../controllers/lead.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function leadRoutes(fastify) {
  fastify.get('/', { preHandler: [authenticate] }, getLeads);
  fastify.post('/', { preHandler: [authenticate] }, createLead);
  fastify.get('/:id', { preHandler: [authenticate] }, getLeadById);
  fastify.put('/:id', { preHandler: [authenticate] }, updateLead);
  fastify.post('/:id/convert-to-opportunity', { preHandler: [authenticate] }, convertLeadToOpportunity);
}
