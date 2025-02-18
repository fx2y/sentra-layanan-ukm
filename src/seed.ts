import { Database } from 'bun:sqlite';

// Initialize database connection
const db = new Database('data.db');

// Create tables if they don't exist
db.query(`
    CREATE TABLE IF NOT EXISTS transportation_modes (
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
    CREATE TABLE IF NOT EXISTS cargo_types (
        cargo_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
        type_name TEXT NOT NULL UNIQUE,
        description TEXT,
        handling_instructions TEXT,
        price_multiplier REAL DEFAULT 1.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

db.query(`
    CREATE TABLE IF NOT EXISTS facilities (
        facility_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

db.query(`
    CREATE TABLE IF NOT EXISTS mode_facilities (
        mode_id INTEGER NOT NULL,
        facility_id INTEGER NOT NULL,
        PRIMARY KEY (mode_id, facility_id),
        FOREIGN KEY (mode_id) REFERENCES transportation_modes(mode_id),
        FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
    )
`).run();

// Seed data
const transportationModes = [
    {
        mode_name: 'Motor Roda Dua',
        description: 'Sepeda motor untuk pengiriman cepat',
        capacity_kg: 20,
        base_price: 10000,
        price_per_km: 2000
    },
    {
        mode_name: 'Pickup',
        description: 'Mobil pickup untuk barang sedang',
        capacity_kg: 1000,
        base_price: 50000,
        price_per_km: 5000
    },
    {
        mode_name: 'Truk Box',
        description: 'Truk box untuk pengiriman besar',
        capacity_kg: 4000,
        base_price: 200000,
        price_per_km: 10000
    }
];

const cargoTypes = [
    {
        type_name: 'Umum',
        description: 'Barang umum tanpa penanganan khusus',
        handling_instructions: 'Penanganan standar',
        price_multiplier: 1.0
    },
    {
        type_name: 'Mudah Pecah',
        description: 'Barang pecah belah atau sensitif',
        handling_instructions: 'Tangani dengan sangat hati-hati, hindari tumpukan',
        price_multiplier: 1.5
    },
    {
        type_name: 'Berat',
        description: 'Barang berbobot tinggi',
        handling_instructions: 'Gunakan peralatan angkat yang sesuai',
        price_multiplier: 1.3
    }
];

const facilities = [
    {
        name: 'AC',
        description: 'Kendaraan berpendingin udara'
    },
    {
        name: 'Tracking',
        description: 'Pelacakan real-time'
    },
    {
        name: 'Asuransi',
        description: 'Perlindungan asuransi pengiriman'
    }
];

async function clearDatabase() {
    // Clear existing data
    db.query('DELETE FROM mode_facilities').run();
    db.query('DELETE FROM transportation_modes').run();
    db.query('DELETE FROM cargo_types').run();
    db.query('DELETE FROM facilities').run();
}

async function seedDatabase() {
    try {
        await clearDatabase();
        
        // Insert transportation modes
        for (const mode of transportationModes) {
            db.query(`
                INSERT INTO transportation_modes (mode_name, description, capacity_kg, base_price, price_per_km)
                VALUES ($name, $desc, $cap, $base, $km)
            `).run({
                $name: mode.mode_name,
                $desc: mode.description,
                $cap: mode.capacity_kg,
                $base: mode.base_price,
                $km: mode.price_per_km
            });
        }

        // Insert cargo types
        for (const type of cargoTypes) {
            db.query(`
                INSERT INTO cargo_types (type_name, description, handling_instructions, price_multiplier)
                VALUES ($name, $desc, $inst, $mult)
            `).run({
                $name: type.type_name,
                $desc: type.description,
                $inst: type.handling_instructions,
                $mult: type.price_multiplier
            });
        }

        // Insert facilities
        for (const facility of facilities) {
            db.query(`
                INSERT INTO facilities (name, description)
                VALUES ($name, $desc)
            `).run({
                $name: facility.name,
                $desc: facility.description
            });
        }

        console.log('✅ Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        db.close();
    }
}

seedDatabase();