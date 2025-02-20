import pino from 'pino';
import { randomUUID } from 'crypto';

const level = process.env.DEBUG === 'true' ? 'debug' : (process.env.LOG_LEVEL || 'info');

export const logger = pino({
  level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname,env',
      messageFormat: '{msg}',
      singleLine: true,
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  ...(process.env.NODE_ENV === 'production' && {
    redact: ['req.headers.authorization', 'body.password']
  })
});

export function createRequestLogger(req: Request): pino.Logger {
  const url = new URL(req.url);
  return logger.child({
    requestId: randomUUID(),
    method: req.method,
    path: url.pathname,
    ...(process.env.DEBUG === 'true' && {
      query: Object.fromEntries(url.searchParams)
    })
  });
}

export default logger;