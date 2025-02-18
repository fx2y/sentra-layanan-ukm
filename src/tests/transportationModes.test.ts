import { expect, describe, it, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";

describe("Transportation Mode API", () => {
    let db: Database;

    beforeAll(() => {
        // Use in-memory database for testing
        db = new Database(":memory:");
        
        // Create tables
        db.query(`
            CREATE TABLE transportation_modes (
                mode_id INTEGER PRIMARY KEY AUTOINCREMENT,
                mode_name TEXT NOT NULL UNIQUE,
                description TEXT,
                capacity_kg REAL,
                base_price REAL NOT NULL,
                price_per_km REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
    });

    it("should create a transportation mode", () => {
        const result = db.query(`
            INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
            VALUES ('Test Mode', 'Test Description', 100, 10000, 2000)
            RETURNING *
        `).get();

        expect(result).toBeTruthy();
        expect(result.mode_name).toBe('Test Mode');
    });

    it("should get all transportation modes", () => {
        const modes = db.query('SELECT * FROM transportation_modes').all();
        expect(modes).toBeInstanceOf(Array);
        expect(modes.length).toBeGreaterThan(0);
    });
});