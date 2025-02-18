import { Database } from 'bun:sqlite';

export class TransportationModeRepository {
    constructor(private db: Database) {}

    getAll() {
        return this.db.query('SELECT * FROM transportation_modes').all();
    }

    getById(id: number) {
        return this.db.query('SELECT * FROM transportation_modes WHERE mode_id = $id')
            .get({ $id: id });
    }

    create(data: any) {
        return this.db.query(`
            INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
            VALUES ($name, $description, $capacity, $basePrice, $pricePerKm)
            RETURNING *
        `).get(data);
    }

    update(id: number, data: any) {
        return this.db.query(`
            UPDATE transportation_modes 
            SET mode_name = $name,
                description = $description,
                capacity_kg = $capacity,
                base_price = $basePrice,
                price_per_km = $pricePerKm
            WHERE mode_id = $id
            RETURNING *
        `).get({ ...data, $id: id });
    }

    delete(id: number) {
        return this.db.query('DELETE FROM transportation_modes WHERE mode_id = $id')
            .run({ $id: id });
    }
}