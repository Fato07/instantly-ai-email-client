// ESM
import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './src/routes/index.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
});

fastify.register(routes);

fastify.listen({ port: process.env.PORT || 3002, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
