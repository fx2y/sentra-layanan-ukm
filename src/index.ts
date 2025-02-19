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

// Initialize SQLite database
const db = new Database('data.db');

// Basic auth middleware
const auth = (app: Elysia) =>
  app.derive(({ headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      return { error: 'Unauthorized' };
    }

    const [username, password] = Buffer.from(authHeader.slice(6), 'base64')
      .toString()
      .split(':');

    // TODO: Replace with proper auth in task 1.10
    if (username === 'mitra_admin' && password === 'password') {
      return { mitraId: '1' }; // Hardcoded for now
    }

    return { error: 'Invalid credentials' };
  });

// Initialize server
const app = new Elysia()
    .use(html())
    .use(staticPlugin())
    .use(auth) // Apply auth middleware
    .use((app) => {
        // Setup API routes with type assertion to any
        setupTransportationModeRoutes(app as any, db);
        setupCargoTypeRoutes(app as any, db);
        setupFacilityRoutes(app as any, db);
        return app;
    })
    .use(mitraProfileRoutes)
    .use(serviceInstanceRoutes)
    .use(driverRoutes)
    .use(orderRoutes)
    .get('/mitra/', () => {
        return new Response(Bun.file('public/mitra/index.html'));
    })
    .onError(({ error }) => {
        const err = error as any;
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
            status: message === 'Unauthorized' ? 401 : 400,
            headers: { 'Content-Type': 'application/json' }
        });
    })
    .listen(3000);

console.log(`🦊 Mitra Admin API is running at ${app.server?.hostname}:${app.server?.port}`);