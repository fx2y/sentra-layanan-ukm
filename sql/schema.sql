-- Core Tables

-- Users table - Base table for all user types
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer', 'driver', 'mitra')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Businesses (Mitra) table
CREATE TABLE businesses (
    business_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    address TEXT NOT NULL,
    location_lat REAL,
    location_long REAL,
    business_license_number TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Drivers table
CREATE TABLE drivers (
    driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    license_type TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    vehicle_type TEXT NOT NULL,
    vehicle_number TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Transportation Modes (Angkutan)
CREATE TABLE transportation_modes (
    mode_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_name TEXT NOT NULL UNIQUE,
    description TEXT,
    capacity_kg REAL,
    base_price REAL NOT NULL,
    price_per_km REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cargo Types (Muatan)
CREATE TABLE cargo_types (
    cargo_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL UNIQUE,
    description TEXT,
    handling_instructions TEXT,
    price_multiplier REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    driver_id INTEGER,
    mode_id INTEGER NOT NULL,
    cargo_type_id INTEGER NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat REAL,
    pickup_long REAL,
    delivery_address TEXT NOT NULL,
    delivery_lat REAL,
    delivery_long REAL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
    cargo_weight REAL NOT NULL,
    total_price REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    FOREIGN KEY (mode_id) REFERENCES transportation_modes(mode_id),
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(cargo_type_id)
);

-- Order Status History
CREATE TABLE order_status_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Driver Reviews
CREATE TABLE driver_reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Facilities
CREATE TABLE facilities (
    facility_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transportation Mode Facilities (Many-to-Many relationship)
CREATE TABLE mode_facilities (
    mode_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    PRIMARY KEY (mode_id, facility_id),
    FOREIGN KEY (mode_id) REFERENCES transportation_modes(mode_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
);

-- Triggers for updated_at timestamps
CREATE TRIGGER users_update_trigger 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER orders_update_trigger 
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = NEW.order_id;
END;