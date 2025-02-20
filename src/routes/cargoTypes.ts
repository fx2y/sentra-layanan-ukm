import { Elysia } from 'elysia';
import { CargoTypeRepository } from '../repositories/CargoTypeRepository';
import { DatabaseDebugger } from '../utils/database';
import { ValidationError } from '../utils/errors';
import { cargoTypeSchema } from '../schemas';

export function setupCargoTypeRoutes(app: Elysia, dbDebugger: DatabaseDebugger) {
    const repository = new CargoTypeRepository(dbDebugger);

    return app.group('/api/cargo-types', app => app
        .get('/', async () => repository.getAll())
        .get('/:id', async ({ params: { id } }) => repository.getById(Number(id)))
        .post('/', async ({ body }) => {
            try {
                const validatedData = cargoTypeSchema.parse(body);
                return await repository.create(validatedData);
            } catch (error) {
                throw new ValidationError('Invalid cargo type data');
            }
        })
        .put('/:id', async ({ params: { id }, body }) => {
            const validatedData = cargoTypeSchema.parse(body);
            return await repository.update(Number(id), validatedData);
        })
        .delete('/:id', async ({ params: { id } }) => repository.delete(Number(id)))
    );
}