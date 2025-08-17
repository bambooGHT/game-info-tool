import type { onRequestHookHandler } from "fastify";

export const setCors: onRequestHookHandler = (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  // 允许的请求方法
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  done();
};
