import emailRoutes from './emails.js';
import aiRoutes from './ai.js';

export default async function routes(fastify, options) {
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });

  await fastify.register(emailRoutes);
  await fastify.register(aiRoutes);
}
