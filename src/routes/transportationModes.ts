import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { TransportationModeRepository } from '../repositories/TransportationModeRepository';
import { transportationModeSchema } from '../schemas';

export function setupTransportationModeRoutes(app: Elysia, db: Database) {
    const repository = new TransportationModeRepository(db);

    return app.group('/api/transportation-modes', app => app
        .get('/', () => repository.getAll())
        .get('/:id', ({ params: { id } }) => {
            const mode = repository.getById(Number(id));
            if (!mode) throw new Error('Transportation mode not found');
            return mode;
        })
        .post('/', ({ body }) => {
            const validatedData = transportationModeSchema.parse(body);
            try {
                return repository.create(validatedData);
            } catch (error) {
                throw new Error('Invalid transportation mode data');
            }
        })
        .put('/:id', ({ params: { id }, body }) => {
            const validatedData = transportationModeSchema.parse(body);
            try {
                const mode = repository.update(Number(id), validatedData);
                if (!mode) throw new Error('Transportation mode not found');
                return mode;
            } catch (error) {
                throw new Error('Invalid transportation mode data');
            }
        })
        .delete('/:id', ({ params: { id } }) => {
            try {
                repository.delete(Number(id));
                return { success: true };
            } catch (error) {
                throw new Error('Failed to delete transportation mode');
            }
        })
        .onError(({ error }) => {
            return new Response(
                JSON.stringify({ error: error.message }),
                { 
                    status: error.message.includes('not found') ? 404 : 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        })
    );
}