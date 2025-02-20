import { expect, describe, it, beforeAll, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { DatabaseDebugger } from "../utils/database";
import { CargoTypeRepository } from "../repositories/CargoTypeRepository";
import { NotFoundError } from "../utils/errors";

// Disable debug logging in tests
process.env.DEBUG = 'false';

describe("Cargo Type Repository", () => {
    let db: Database;
    let dbDebugger: DatabaseDebugger;
    let repository: CargoTypeRepository;

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

        dbDebugger = new DatabaseDebugger(db);
        repository = new CargoTypeRepository(dbDebugger);
    });

    beforeEach(async () => {
        // Clear the table before each test
        db.query('DELETE FROM cargo_types').run();
    });

    it("should create a cargo type", async () => {
        const cargoType = await repository.create({
            type_name: 'Test Cargo',
            description: 'Test Description',
            handling_instructions: 'Handle with care',
            price_multiplier: 1.5
        });

        expect(cargoType).toBeTruthy();
        expect(cargoType.type_name).toBe('Test Cargo');
        expect(cargoType.price_multiplier).toBe(1.5);
    });

    it("should get all cargo types", async () => {
        await repository.create({
            type_name: 'Test Cargo',
            description: 'Test Description',
            handling_instructions: 'Handle with care',
            price_multiplier: 1.5
        });

        const types = await repository.getAll();
        expect(types).toBeInstanceOf(Array);
        expect(types.length).toBe(1);
    });

    it("should get a cargo type by id", async () => {
        const created = await repository.create({
            type_name: 'Test Cargo',
            description: 'Test Description',
            handling_instructions: 'Handle with care',
            price_multiplier: 1.5
        });

        const type = await repository.getById(1);
        expect(type).toEqual(created);
    });

    it("should throw NotFoundError when getting non-existent type", async () => {
        await expect(repository.getById(999)).rejects.toThrow(NotFoundError);
    });

    it("should update a cargo type", async () => {
        const created = await repository.create({
            type_name: 'Test Cargo',
            description: 'Test Description',
            handling_instructions: 'Handle with care',
            price_multiplier: 1.5
        });

        const updated = await repository.update(1, {
            ...created,
            type_name: 'Updated Cargo'
        });

        expect(updated.type_name).toBe('Updated Cargo');
    });

    it("should delete a cargo type", async () => {
        await repository.create({
            type_name: 'Test Cargo',
            description: 'Test Description',
            handling_instructions: 'Handle with care',
            price_multiplier: 1.5
        });

        await repository.delete(1);
        await expect(repository.getById(1)).rejects.toThrow(NotFoundError);
    });
});