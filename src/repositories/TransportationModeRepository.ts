import { DatabaseDebugger } from '../utils/database';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';

const TransportationModeData = z.object({
    mode_name: z.string(),
    description: z.string(),
    capacity_kg: z.number(),
    base_price: z.number(),
    price_per_km: z.number()
});

type TransportationMode = z.infer<typeof TransportationModeData>;

export class TransportationModeRepository {
    constructor(private db: DatabaseDebugger) {}

    async getAll() {
        return await this.db.query<TransportationMode[]>('SELECT * FROM transportation_modes');
    }

    async getById(id: number) {
        const result = await this.db.query<TransportationMode[]>(
            'SELECT * FROM transportation_modes WHERE mode_id = $id',
            { $id: id }
        );
        if (!result?.length) {
            throw new NotFoundError('Transportation mode');
        }
        return result[0];
    }

    async create(data: TransportationMode) {
        const validated = TransportationModeData.parse(data);
        const result = await this.db.query<TransportationMode[]>(`
            INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
            VALUES ($name, $description, $capacity, $basePrice, $pricePerKm)
            RETURNING *
        `, {
            $name: validated.mode_name,
            $description: validated.description,
            $capacity: validated.capacity_kg,
            $basePrice: validated.base_price,
            $pricePerKm: validated.price_per_km
        });
        if (!result?.length) throw new Error('Failed to create transportation mode');
        return result[0];
    }

    async update(id: number, data: TransportationMode) {
        const validated = TransportationModeData.parse(data);
        const result = await this.db.query<TransportationMode[]>(`
            UPDATE transportation_modes 
            SET mode_name = $name,
                description = $description,
                capacity_kg = $capacity,
                base_price = $basePrice,
                price_per_km = $pricePerKm
            WHERE mode_id = $id
            RETURNING *
        `, {
            $id: id,
            $name: validated.mode_name,
            $description: validated.description,
            $capacity: validated.capacity_kg,
            $basePrice: validated.base_price,
            $pricePerKm: validated.price_per_km
        });
        if (!result?.length) throw new NotFoundError('Transportation mode');
        return result[0];
    }

    async delete(id: number) {
        const result = await this.db.query<{ changes: number }>(
            'DELETE FROM transportation_modes WHERE mode_id = $id',
            { $id: id }
        );
        if (!result?.changes) throw new NotFoundError('Transportation mode');
        return { success: true };
    }
}