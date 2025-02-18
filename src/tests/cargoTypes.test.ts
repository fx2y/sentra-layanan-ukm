import { expect, describe, it, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";

describe("Cargo Type API", () => {
    let db: Database;

    beforeAll(() => {
        // Use in-memory database for testing
        db = new Database(":memory:");
        
        // Create tables
        db.query(`
            CREATE TABLE cargo_types (
                cargo_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_name TEXT NOT NULL UNIQUE,
                description TEXT,
                handling_instructions TEXT,
                price_multiplier REAL DEFAULT 1.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
    });

    it("should create a cargo type", () => {
        const result = db.query(`
            INSERT INTO cargo_types (type_name, description, handling_instructions, price_multiplier)
            VALUES ('Test Cargo', 'Test Description', 'Handle with care', 1.5)
            RETURNING *
        `).get();

        expect(result).toBeTruthy();
        expect(result.type_name).toBe('Test Cargo');
        expect(result.price_multiplier).toBe(1.5);
    });

    it("should get all cargo types", () => {
        const types = db.query('SELECT * FROM cargo_types').all();
        expect(types).toBeInstanceOf(Array);
        expect(types.length).toBeGreaterThan(0);
    });
});