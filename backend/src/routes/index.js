import emailRoutes from './emails.js';
import aiRoutes from './ai.js';

export default async function routes(fastify, options) {
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });

  // Register email routes
  await fastify.register(emailRoutes);
  
  // Register AI routes
  await fastify.register(aiRoutes);
}
