import { expect, describe, it, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";

describe("Facilities API", () => {
    let db: Database;

    beforeAll(() => {
        // Use in-memory database for testing
        db = new Database(":memory:");
        
        // Create tables
        db.query(`
            CREATE TABLE facilities (
                facility_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        db.query(`
            CREATE TABLE mode_facilities (
                mode_id INTEGER NOT NULL,
                facility_id INTEGER NOT NULL,
                PRIMARY KEY (mode_id, facility_id)
            )
        `).run();
    });

    it("should create a facility", () => {
        const result = db.query(`
            INSERT INTO facilities (name, description)
            VALUES ('Test Facility', 'Test Description')
            RETURNING *
        `).get();

        expect(result).toBeTruthy();
        expect(result.name).toBe('Test Facility');
    });

    it("should get all facilities", () => {
        const facilities = db.query('SELECT * FROM facilities').all();
        expect(facilities).toBeInstanceOf(Array);
        expect(facilities.length).toBeGreaterThan(0);
    });

    it("should associate facility with transportation mode", () => {
        // First create a mode
        db.query(`
            CREATE TABLE IF NOT EXISTS transportation_modes (
                mode_id INTEGER PRIMARY KEY AUTOINCREMENT,
                mode_name TEXT NOT NULL UNIQUE
            )
        `).run();
        
        const mode = db.query("INSERT INTO transportation_modes (mode_name) VALUES ('Test Mode') RETURNING *").get();
        const facility = db.query("SELECT * FROM facilities LIMIT 1").get();

        const result = db.query(`
            INSERT INTO mode_facilities (mode_id, facility_id)
            VALUES ($modeId, $facilityId)
            RETURNING *
        `).get({
            $modeId: mode.mode_id,
            $facilityId: facility.facility_id
        });

        expect(result).toBeTruthy();
    });
});