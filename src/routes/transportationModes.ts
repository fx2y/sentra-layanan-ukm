import { Elysia } from 'elysia';
import { DatabaseDebugger } from '../utils/database';
import { TransportationModeRepository } from '../repositories/TransportationModeRepository';
import { ValidationError } from '../utils/errors';
import { transportationModeSchema } from '../schemas';

export function setupTransportationModeRoutes(app: Elysia, dbDebugger: DatabaseDebugger) {
    const repository = new TransportationModeRepository(dbDebugger);

    return app.group('/api/transportation-modes', app => app
        .get('/', () => repository.getAll())
        .get('/:id', ({ params: { id } }) => repository.getById(Number(id)))
        .post('/', async ({ body }) => {
            const validatedData = transportationModeSchema.parse(body);
            return await repository.create(validatedData);
        })
        .put('/:id', async ({ params: { id }, body }) => {
            const validatedData = transportationModeSchema.parse(body);
            return await repository.update(Number(id), validatedData);
        })
        .delete('/:id', ({ params: { id } }) => repository.delete(Number(id)))
    );
}