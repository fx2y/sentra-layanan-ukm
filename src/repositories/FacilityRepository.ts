import { DatabaseDebugger } from '../utils/database';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';

const FacilityData = z.object({
    name: z.string(),
    description: z.string().optional()
});

type Facility = z.infer<typeof FacilityData>;

export class FacilityRepository {
    constructor(private db: DatabaseDebugger) {}

    async getAll() {
        return await this.db.query<Facility[]>('SELECT * FROM facilities');
    }

    async getById(id: number) {
        const result = await this.db.query<Facility[]>(
            'SELECT * FROM facilities WHERE facility_id = $id',
            { $id: id }
        );
        if (!result?.length) {
            throw new NotFoundError('Facility');
        }
        return result[0];
    }

    async create(data: Facility) {
        const validated = FacilityData.parse(data);
        const result = await this.db.query<Facility[]>(`
            INSERT INTO facilities (name, description)
            VALUES ($name, $description)
            RETURNING *
        `, {
            $name: validated.name,
            $description: validated.description || null
        });
        if (!result?.length) throw new Error('Failed to create facility');
        return result[0];
    }

    async update(id: number, data: Facility) {
        const validated = FacilityData.parse(data);
        const result = await this.db.query<Facility[]>(`
            UPDATE facilities 
            SET name = $name,
                description = $description
            WHERE facility_id = $id
            RETURNING *
        `, {
            $id: id,
            $name: validated.name,
            $description: validated.description || null
        });
        if (!result?.length) throw new NotFoundError('Facility');
        return result[0];
    }

    async delete(id: number) {
        const result = await this.db.query<{ changes: number }>(
            'DELETE FROM facilities WHERE facility_id = $id',
            { $id: id }
        );
        if (!result?.changes) throw new NotFoundError('Facility');
        return { success: true };
    }

    async getByModeId(modeId: number) {
        const result = await this.db.query<Facility[]>(`
            SELECT f.* FROM facilities f
            JOIN mode_facilities mf ON f.facility_id = mf.facility_id
            WHERE mf.mode_id = $modeId
        `, { 
            $modeId: modeId 
        });
        return Array.isArray(result) ? result : [];
    }

    async addToMode(modeId: number, facilityId: number) {
        try {
            await this.db.query(`
                INSERT INTO mode_facilities (mode_id, facility_id)
                VALUES ($modeId, $facilityId)
            `, { 
                $modeId: modeId, 
                $facilityId: facilityId 
            });
            return { success: true };
        } catch (error) {
            if ((error as any)?.message?.includes('FOREIGN KEY')) {
                throw new NotFoundError('Mode or facility');
            }
            throw error;
        }
    }

    async removeFromMode(modeId: number, facilityId: number) {
        const result = await this.db.query<{ changes: number }>(`
            DELETE FROM mode_facilities 
            WHERE mode_id = $modeId AND facility_id = $facilityId
        `, {
            $modeId: modeId,
            $facilityId: facilityId
        });
        return { success: result?.changes > 0 };
    }
}