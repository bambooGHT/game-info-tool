import Fastify from 'fastify';
import { setCors } from './plugins';
import { routes } from './routes';

const fastify = Fastify();

const start = async () => {
  fastify.addHook("onRequest", setCors);
  await fastify.register(import("@fastify/rate-limit"), {
    global: true,
    max: 250,
    timeWindow: 1000 * 60 * 5,
    errorResponseBuilder: (res, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Requests exceed limit,Please try again later`,
        date: Date.now(),
        expiresIn: context.ttl
      };
    }
  });
  routes.forEach(r => fastify.route(r));

  fastify.listen({ port: 7777, host: '0.0.0.0' }, (err, address) => {
    console.log(`server listening on ${address}`);

    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
};

start();
