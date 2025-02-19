import { Database } from 'bun:sqlite';

const db = new Database('data.db');

// Ensure mitra_profiles table exists
db.query(`
    CREATE TABLE IF NOT EXISTS mitra_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        contact_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Create service_templates table if missing
db.query(`
    CREATE TABLE IF NOT EXISTS service_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Seed Mitra Profile
db.query(`
    INSERT INTO mitra_profiles (name, address, contact_info)
    VALUES (
        'PT Logistik Nusantara',
        'Jl. Raya Serpong No. 123, Tangerang Selatan',
        '{"phone": "+62811234567", "email": "contact@logistiknusantara.id"}'
    )
`).run();

const mitraId = db.query('SELECT last_insert_rowid() as id').get().id;

// Ensure at least one service template exists
let serviceTemplate = db.query('SELECT id FROM service_templates LIMIT 1').get();

if (!serviceTemplate) {
    db.query(`
        INSERT INTO service_templates (name, description)
        VALUES ('Default Template', 'Default service template description')
    `).run();

    serviceTemplate = db.query('SELECT last_insert_rowid() as id').get();
}

console.log(`Mitra seeded with id: ${mitraId}`);
console.log(`Service template id: ${serviceTemplate.id}`);

db.close(); 