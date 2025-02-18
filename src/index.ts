import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { Database } from 'bun:sqlite';
import { setupTransportationModeRoutes } from './routes/transportationModes';
import { setupCargoTypeRoutes } from './routes/cargoTypes';
import { setupFacilityRoutes } from './routes/facilities';

// Initialize SQLite database
const db = new Database('data.db');

// Basic auth middleware
const auth = (app: Elysia) => app.derive(({ headers }) => {
    const authHeader = headers.authorization;
    const expectedAuth = `Basic ${btoa(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`)}`;
    
    if (authHeader !== expectedAuth) {
        throw new Error('Unauthorized');
    }
    
    return {};
});

// Initialize server
const app = new Elysia()
    .use(html())
    .use(staticPlugin())
    .use(auth) // Apply auth middleware
    .use(app => {
        // Setup API routes
        setupTransportationModeRoutes(app, db);
        setupCargoTypeRoutes(app, db);
        setupFacilityRoutes(app, db);
        return app;
    })
    .onError(({ error }) => {
        return new Response(JSON.stringify({
            error: error.message
        }), { 
            status: error.message === 'Unauthorized' ? 401 : 400,
            headers: { 'Content-Type': 'application/json' }
        });
    })
    .listen(3000);

console.log(`🚀 Server running at ${app.server?.hostname}:${app.server?.port}`);