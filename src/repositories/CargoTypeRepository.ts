import { DatabaseDebugger } from '../utils/database';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';

const CargoTypeData = z.object({
    type_name: z.string().min(1),
    description: z.string(),
    handling_instructions: z.string(),
    price_multiplier: z.number().positive()
});

type CargoType = z.infer<typeof CargoTypeData>;

export class CargoTypeRepository {
    constructor(private db: DatabaseDebugger) {}

    async getAll(): Promise<CargoType[]> {
        const result = await this.db.query<CargoType[]>('SELECT * FROM cargo_types');
        return result || [];
    }

    async getById(id: number): Promise<CargoType> {
        const result = await this.db.query<CargoType[]>(
            'SELECT * FROM cargo_types WHERE cargo_type_id = $id',
            { $id: id }
        );
        if (!result?.length) throw new NotFoundError('Cargo type');
        return result[0];
    }

    async create(data: CargoType): Promise<CargoType> {
        const validated = CargoTypeData.parse(data);
        const result = await this.db.query<CargoType[]>(`
            INSERT INTO cargo_types (type_name, description, handling_instructions, price_multiplier)
            VALUES ($name, $description, $instructions, $multiplier)
            RETURNING *
        `, {
            $name: validated.type_name,
            $description: validated.description,
            $instructions: validated.handling_instructions,
            $multiplier: validated.price_multiplier
        });
        if (!result?.length) throw new Error('Failed to create cargo type');
        return result[0];
    }

    async update(id: number, data: CargoType): Promise<CargoType> {
        const validated = CargoTypeData.parse(data);
        const result = await this.db.query<CargoType[]>(`
            UPDATE cargo_types 
            SET type_name = $name,
                description = $description,
                handling_instructions = $instructions,
                price_multiplier = $multiplier
            WHERE cargo_type_id = $id
            RETURNING *
        `, {
            $id: id,
            $name: validated.type_name,
            $description: validated.description,
            $instructions: validated.handling_instructions,
            $multiplier: validated.price_multiplier
        });
        if (!result?.length) throw new NotFoundError('Cargo type');
        return result[0];
    }

    async delete(id: number): Promise<{ success: boolean }> {
        const result = await this.db.query<{ changes: number }>(
            'DELETE FROM cargo_types WHERE cargo_type_id = $id', 
            { $id: id }
        );
        if (!result?.changes) throw new NotFoundError('Cargo type');
        return { success: true };
    }
}