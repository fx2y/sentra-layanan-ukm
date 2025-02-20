import { Elysia } from 'elysia';
import { DatabaseDebugger } from '../utils/database';
import { FacilityRepository } from '../repositories/FacilityRepository';
import { ValidationError } from '../utils/errors';
import { facilitySchema } from '../schemas';

export function setupFacilityRoutes(app: Elysia, dbDebugger: DatabaseDebugger) {
    const repository = new FacilityRepository(dbDebugger);

    return app.group('/api/facilities', app => app
        .get('/', () => repository.getAll())
        .get('/:id', ({ params: { id } }) => repository.getById(Number(id)))
        .get('/mode/:modeId', ({ params: { modeId } }) => repository.getByModeId(Number(modeId)))
        .post('/', async ({ body }) => {
            const validatedData = facilitySchema.parse(body);
            return await repository.create(validatedData);
        })
        .put('/:id', async ({ params: { id }, body }) => {
            const validatedData = facilitySchema.parse(body);
            return await repository.update(Number(id), validatedData);
        })
        .delete('/:id', ({ params: { id } }) => repository.delete(Number(id)))
        .post('/mode/:modeId/facility/:facilityId', ({ params: { modeId, facilityId } }) => 
            repository.addToMode(Number(modeId), Number(facilityId)))
        .delete('/mode/:modeId/facility/:facilityId', ({ params: { modeId, facilityId } }) => 
            repository.removeFromMode(Number(modeId), Number(facilityId)))
    );
}