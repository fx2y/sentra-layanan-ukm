import { Database } from 'bun:sqlite';

export class FacilityRepository {
    constructor(private db: Database) {}

    getAll() {
        return this.db.query('SELECT * FROM facilities').all();
    }

    getById(id: number) {
        return this.db.query('SELECT * FROM facilities WHERE facility_id = $id')
            .get({ $id: id });
    }

    create(data: any) {
        return this.db.query(`
            INSERT INTO facilities (name, description)
            VALUES ($name, $description)
            RETURNING *
        `).get(data);
    }

    update(id: number, data: any) {
        return this.db.query(`
            UPDATE facilities 
            SET name = $name,
                description = $description
            WHERE facility_id = $id
            RETURNING *
        `).get({ ...data, $id: id });
    }

    delete(id: number) {
        return this.db.query('DELETE FROM facilities WHERE facility_id = $id')
            .run({ $id: id });
    }

    // Get facilities for a transportation mode
    getByModeId(modeId: number) {
        return this.db.query(`
            SELECT f.* FROM facilities f
            JOIN mode_facilities mf ON f.facility_id = mf.facility_id
            WHERE mf.mode_id = $modeId
        `).all({ $modeId: modeId });
    }

    // Add facility to a transportation mode
    addToMode(modeId: number, facilityId: number) {
        return this.db.query(`
            INSERT INTO mode_facilities (mode_id, facility_id)
            VALUES ($modeId, $facilityId)
        `).run({ $modeId: modeId, $facilityId: facilityId });
    }

    // Remove facility from a transportation mode
    removeFromMode(modeId: number, facilityId: number) {
        return this.db.query(`
            DELETE FROM mode_facilities 
            WHERE mode_id = $modeId AND facility_id = $facilityId
        `).run({ $modeId: modeId, $facilityId: facilityId });
    }
}