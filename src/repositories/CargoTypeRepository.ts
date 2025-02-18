import { Database } from 'bun:sqlite';

export class CargoTypeRepository {
    constructor(private db: Database) {}

    getAll() {
        return this.db.query('SELECT * FROM cargo_types').all();
    }

    getById(id: number) {
        return this.db.query('SELECT * FROM cargo_types WHERE cargo_type_id = $id')
            .get({ $id: id });
    }

    create(data: any) {
        return this.db.query(`
            INSERT INTO cargo_types (type_name, description, handling_instructions, price_multiplier)
            VALUES ($name, $description, $instructions, $multiplier)
            RETURNING *
        `).get(data);
    }

    update(id: number, data: any) {
        return this.db.query(`
            UPDATE cargo_types 
            SET type_name = $name,
                description = $description,
                handling_instructions = $instructions,
                price_multiplier = $multiplier
            WHERE cargo_type_id = $id
            RETURNING *
        `).get({ ...data, $id: id });
    }

    delete(id: number) {
        return this.db.query('DELETE FROM cargo_types WHERE cargo_type_id = $id')
            .run({ $id: id });
    }
}