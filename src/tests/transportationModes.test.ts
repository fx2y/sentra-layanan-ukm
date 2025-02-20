import { expect, describe, it, beforeAll, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { DatabaseDebugger } from "../utils/database";
import { TransportationModeRepository } from "../repositories/TransportationModeRepository";
import { NotFoundError } from "../utils/errors";

// Disable debug logging in tests
process.env.DEBUG = 'false';

describe("Transportation Mode Repository", () => {
    let db: Database;
    let dbDebugger: DatabaseDebugger;
    let repository: TransportationModeRepository;

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

        dbDebugger = new DatabaseDebugger(db);
        repository = new TransportationModeRepository(dbDebugger);
    });

    beforeEach(async () => {
        // Clear the table before each test
        db.query('DELETE FROM transportation_modes').run();
    });

    it("should create a transportation mode", async () => {
        const mode = await repository.create({
            mode_name: 'Test Mode',
            description: 'Test Description',
            capacity_kg: 100,
            base_price: 10000,
            price_per_km: 2000
        });

        expect(mode).toBeTruthy();
        expect(mode.mode_name).toBe('Test Mode');
    });

    it("should get all transportation modes", async () => {
        await repository.create({
            mode_name: 'Test Mode 1',
            description: 'Test Description 1',
            capacity_kg: 100,
            base_price: 10000,
            price_per_km: 2000
        });

        const modes = await repository.getAll();
        expect(modes).toBeInstanceOf(Array);
        expect(modes.length).toBe(1);
    });

    it("should get a transportation mode by id", async () => {
        const created = await repository.create({
            mode_name: 'Test Mode',
            description: 'Test Description',
            capacity_kg: 100,
            base_price: 10000,
            price_per_km: 2000
        });

        const mode = await repository.getById(1);
        expect(mode).toEqual(created);
    });

    it("should throw NotFoundError when getting non-existent mode", async () => {
        await expect(repository.getById(999)).rejects.toThrow(NotFoundError);
    });

    it("should update a transportation mode", async () => {
        const created = await repository.create({
            mode_name: 'Test Mode',
            description: 'Test Description',
            capacity_kg: 100,
            base_price: 10000,
            price_per_km: 2000
        });

        const updated = await repository.update(1, {
            ...created,
            mode_name: 'Updated Mode'
        });

        expect(updated.mode_name).toBe('Updated Mode');
    });

    it("should delete a transportation mode", async () => {
        await repository.create({
            mode_name: 'Test Mode',
            description: 'Test Description',
            capacity_kg: 100,
            base_price: 10000,
            price_per_km: 2000
        });

        await repository.delete(1);
        await expect(repository.getById(1)).rejects.toThrow(NotFoundError);
    });
});