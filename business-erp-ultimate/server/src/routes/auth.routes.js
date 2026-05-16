import { login } from '../controllers/auth.controller.js';

export default async function authRoutes(fastify) {
  fastify.post('/login', login);
}
