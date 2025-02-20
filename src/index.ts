import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { Database } from 'bun:sqlite';
import { setupTransportationModeRoutes } from './routes/transportationModes';
import { setupCargoTypeRoutes } from './routes/cargoTypes';
import { setupFacilityRoutes } from './routes/facilities';
import { mitraProfileRoutes } from './routes/mitra/profile';
import { serviceInstanceRoutes } from './routes/mitra/service-instances';
import { driverRoutes } from './routes/mitra/drivers';
import { orderRoutes } from './routes/mitra/orders';
import { customerServiceRoutes } from './routes/customer/services';
import { customerOrderRoutes } from './routes/customer/orders';
import { logger, createRequestLogger } from './utils/logger';
import { validateEnv } from './utils/config';
import { HealthCheck } from './utils/health';
import { AppError, AuthorizationError } from './utils/errors';
import { DatabaseDebugger } from './utils/database';
import { MemoryMonitor } from './utils/memory';
import { PerformanceMonitor } from './utils/performance';

// Initialize monitoring
const memoryMonitor = new MemoryMonitor();
const performanceMonitor = new PerformanceMonitor();

// Start memory monitoring if in debug mode
if (process.env.DEBUG === 'true') {
  memoryMonitor.startMonitoring(30000);
}

// Validate environment variables
const env = validateEnv();

// Initialize database with debugging
const db = new Database(env.DATABASE_PATH);
const dbDebugger = new DatabaseDebugger(db);
const healthCheck = new HealthCheck(db);

type AppStore = {
  reqLogger?: ReturnType<typeof createRequestLogger>;
  trackResponse?: (status: number, error: Error) => void;
};

// Request tracking middleware with performance monitoring
const requestTracking = (app: Elysia<{ store: AppStore }>) =>
  app.derive(({ request }) => {
    const reqLogger = createRequestLogger(request);
    const requestId = reqLogger.bindings().requestId as string;
    const start = Date.now();
    
    return {
      reqLogger,
      trackResponse: (status: number, error?: Error) => {
        const duration = Date.now() - start;
        const logData = {
          status,
          duration,
          ...(error && { 
            error: {
              name: error.name,
              message: error.message,
              ...(process.env.DEBUG === 'true' && { stack: error.stack })
            }
          })
        };
        
        if (error || status >= 400) {
          reqLogger.error(logData, 'Request failed');
        } else if (process.env.DEBUG === 'true') {
          reqLogger.info(logData, 'Request completed');
        }
      }
    };
  });

// Auth middleware with simpler debugging
const auth = (app: Elysia<{ store: AppStore }>) =>
  app.derive(({ headers, store: { reqLogger } }) => {
    if (!reqLogger) {
      throw new Error('Request logger not initialized');
    }

    const authHeader = headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      throw new AuthorizationError('Unauthorized');
    }

    try {
      const [username, password] = Buffer.from(authHeader.slice(6), 'base64')
        .toString()
        .split(':');

      if (username === env.ADMIN_USER && password === env.ADMIN_PASSWORD) {
        if (process.env.DEBUG === 'true') {
          reqLogger.debug({ username }, 'Auth successful');
        }
        return { mitraId: '1', isAuthenticated: true };
      }
      
      throw new AuthorizationError('Invalid credentials');
    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthorizationError('Invalid authorization header');
    }
  });

// Initialize server
const app = new Elysia<{ store: AppStore }>()
  .onRequest(({ request, store }) => {
    if (!store.reqLogger) {
      store.reqLogger = createRequestLogger(request);
    }
  })
  .use(html())
  .use(staticPlugin())
  .use(requestTracking)
  .use(auth)
  .get('/health', async ({ store: { reqLogger } }) => {
    const status = await healthCheck.check();
    if (process.env.DEBUG === 'true') {
      return { 
        ...status, 
        debug: { memory: memoryMonitor.getStats() } 
      };
    }
    return status;
  })
  .get('/debug', ({ store: { reqLogger } }) => {
    if (process.env.DEBUG !== 'true') {
      return { error: 'Debug mode not enabled' };
    }

    return {
      memory: memoryMonitor.getStats(),
      database: {
        slowQueries: dbDebugger.getSlowQueries()
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid
      }
    };
  })
  .use((app) => {
    setupTransportationModeRoutes(app, dbDebugger);
    setupCargoTypeRoutes(app, dbDebugger);
    setupFacilityRoutes(app, dbDebugger);
    return app;
  })
  .use(mitraProfileRoutes)
  .use(serviceInstanceRoutes)
  .use(driverRoutes)
  .use(orderRoutes)
  .use(customerServiceRoutes)
  .use(customerOrderRoutes)
  .get('/mitra/', () => {
    return new Response(Bun.file('public/mitra/index.html'));
  })
  .get('/', () => {
    return new Response(Bun.file('public/customer/index.html'));
  })
  .onError(({ error, set, store }) => {
    const status = error instanceof AppError ? error.status : 500;
    set.status = status;
    
    if (store?.trackResponse) {
      store.trackResponse(status, error);
    }

    const response = {
      error: error instanceof AppError ? error.message : 'Internal Server Error',
      code: error instanceof AppError ? error.code : undefined,
      requestId: store?.reqLogger?.bindings().requestId
    };

    if (process.env.DEBUG === 'true' && error instanceof Error) {
      Object.assign(response, {
        debug: { stack: error.stack }
      });
    }

    return response;
  })
  .listen(env.PORT);

logger.info({
  msg: '🦊 Sentra Layanan UKM API is running',
  port: env.PORT,
  environment: env.NODE_ENV
});