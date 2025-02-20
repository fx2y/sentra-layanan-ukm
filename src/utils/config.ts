import { z } from 'zod';
import logger from './logger';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ADMIN_USER: z.string(),
  ADMIN_PASSWORD: z.string(),
  DATABASE_PATH: z.string().default('data.db')
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({
        msg: 'Environment validation failed',
        issues: error.issues
      });
      process.exit(1);
    }
    throw error;
  }
}