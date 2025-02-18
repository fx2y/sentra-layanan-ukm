import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { CargoTypeRepository } from '../repositories/CargoTypeRepository';
import { cargoTypeSchema } from '../schemas';

export function setupCargoTypeRoutes(app: Elysia, db: Database) {
    const repository = new CargoTypeRepository(db);

    return app.group('/api/cargo-types', app => app
        .get('/', () => repository.getAll())
        .get('/:id', ({ params: { id } }) => {
            const type = repository.getById(Number(id));
            if (!type) throw new Error('Cargo type not found');
            return type;
        })
        .post('/', ({ body }) => {
            const validatedData = cargoTypeSchema.parse(body);
            try {
                return repository.create(validatedData);
            } catch (error) {
                throw new Error('Invalid cargo type data');
            }
        })
        .put('/:id', ({ params: { id }, body }) => {
            const validatedData = cargoTypeSchema.parse(body);
            try {
                const type = repository.update(Number(id), validatedData);
                if (!type) throw new Error('Cargo type not found');
                return type;
            } catch (error) {
                throw new Error('Invalid cargo type data');
            }
        })
        .delete('/:id', ({ params: { id } }) => {
            try {
                repository.delete(Number(id));
                return { success: true };
            } catch (error) {
                throw new Error('Failed to delete cargo type');
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