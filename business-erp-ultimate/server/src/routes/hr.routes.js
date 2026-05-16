import { getEmployees, createEmployee, updateEmployee } from '../controllers/hr.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function hrRoutes(fastify) {
  fastify.get('/', { preHandler: [authenticate] }, getEmployees);
  fastify.post('/', { preHandler: [authenticate] }, createEmployee);
  fastify.put('/:id', { preHandler: [authenticate] }, updateEmployee);
}
