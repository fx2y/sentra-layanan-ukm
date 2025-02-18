import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { FacilityRepository } from '../repositories/FacilityRepository';
import { facilitySchema } from '../schemas';

export function setupFacilityRoutes(app: Elysia, db: Database) {
    const repository = new FacilityRepository(db);

    return app.group('/api/facilities', app => app
        .get('/', () => repository.getAll())
        .get('/:id', ({ params: { id } }) => {
            const facility = repository.getById(Number(id));
            if (!facility) throw new Error('Facility not found');
            return facility;
        })
        .get('/mode/:modeId', ({ params: { modeId } }) => {
            return repository.getByModeId(Number(modeId));
        })
        .post('/', ({ body }) => {
            const validatedData = facilitySchema.parse(body);
            try {
                return repository.create(validatedData);
            } catch (error) {
                throw new Error('Invalid facility data');
            }
        })
        .put('/:id', ({ params: { id }, body }) => {
            const validatedData = facilitySchema.parse(body);
            try {
                const facility = repository.update(Number(id), validatedData);
                if (!facility) throw new Error('Facility not found');
                return facility;
            } catch (error) {
                throw new Error('Invalid facility data');
            }
        })
        .delete('/:id', ({ params: { id } }) => {
            try {
                repository.delete(Number(id));
                return { success: true };
            } catch (error) {
                throw new Error('Failed to delete facility');
            }
        })
        .post('/mode/:modeId/facility/:facilityId', ({ params: { modeId, facilityId } }) => {
            try {
                repository.addToMode(Number(modeId), Number(facilityId));
                return { success: true };
            } catch (error) {
                throw new Error('Failed to add facility to mode');
            }
        })
        .delete('/mode/:modeId/facility/:facilityId', ({ params: { modeId, facilityId } }) => {
            try {
                repository.removeFromMode(Number(modeId), Number(facilityId));
                return { success: true };
            } catch (error) {
                throw new Error('Failed to remove facility from mode');
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