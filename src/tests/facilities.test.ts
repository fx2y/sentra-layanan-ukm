import { expect, describe, it, beforeAll, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { DatabaseDebugger } from "../utils/database";
import { FacilityRepository } from "../repositories/FacilityRepository";
import { NotFoundError } from "../utils/errors";

// Disable debug logging in tests
process.env.DEBUG = 'false';

describe("Facility Repository", () => {
    let db: Database;
    let dbDebugger: DatabaseDebugger;
    let repository: FacilityRepository;

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

        db.query(`
            CREATE TABLE mode_facilities (
                mode_id INTEGER NOT NULL,
                facility_id INTEGER NOT NULL,
                PRIMARY KEY (mode_id, facility_id),
                FOREIGN KEY (mode_id) REFERENCES transportation_modes(mode_id),
                FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
            )
        `).run();

        dbDebugger = new DatabaseDebugger(db);
        repository = new FacilityRepository(dbDebugger);
    });

    beforeEach(async () => {
        // Clear the tables before each test
        db.query('DELETE FROM mode_facilities').run();
        db.query('DELETE FROM facilities').run();
        db.query('DELETE FROM transportation_modes').run();
    });

    it("should create a facility", async () => {
        const facility = await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        expect(facility).toBeTruthy();
        expect(facility.name).toBe('Test Facility');
    });

    it("should get all facilities", async () => {
        await repository.create({
            name: 'Test Facility 1',
            description: 'Test Description 1'
        });

        const facilities = await repository.getAll();
        expect(facilities).toBeInstanceOf(Array);
        expect(facilities.length).toBe(1);
    });

    it("should get a facility by id", async () => {
        const created = await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        const facility = await repository.getById(1);
        expect(facility).toEqual(created);
    });

    it("should throw NotFoundError when getting non-existent facility", async () => {
        await expect(repository.getById(999)).rejects.toThrow(NotFoundError);
    });

    it("should update a facility", async () => {
        const created = await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        const updated = await repository.update(1, {
            ...created,
            name: 'Updated Facility'
        });

        expect(updated.name).toBe('Updated Facility');
    });

    it("should delete a facility", async () => {
        await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        await repository.delete(1);
        await expect(repository.getById(1)).rejects.toThrow(NotFoundError);
    });

    it("should associate facility with transportation mode", async () => {
        // Create a mode first
        const mode = await db.query(`
            INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
            VALUES ('Test Mode', 'Description', 1000, 100000, 5000)
            RETURNING *
        `).get();

        const facility = await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        const result = await repository.addToMode(mode.mode_id, facility.facility_id);
        expect(result.success).toBe(true);

        const facilities = await repository.getByModeId(mode.mode_id);
        expect(facilities).toHaveLength(1);
        expect(facilities[0].name).toBe('Test Facility');
    });

    it("should remove facility from transportation mode", async () => {
        // Create a mode first
        const mode = await db.query(`
            INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
            VALUES ('Test Mode', 'Description', 1000, 100000, 5000)
            RETURNING *
        `).get();

        const facility = await repository.create({
            name: 'Test Facility',
            description: 'Test Description'
        });

        await repository.addToMode(mode.mode_id, facility.facility_id);
        const removeResult = await repository.removeFromMode(mode.mode_id, facility.facility_id);
        expect(removeResult.success).toBe(true);

        const facilities = await repository.getByModeId(mode.mode_id);
        expect(facilities).toHaveLength(0);
    });
});