-- Mitra Profiles
CREATE TABLE IF NOT EXISTS mitra_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service Instances (linked to Service Templates)
CREATE TABLE IF NOT EXISTS service_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mitra_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    config TEXT NOT NULL, -- JSON configuration specific to this instance
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mitra_id) REFERENCES mitra_profiles(id),
    FOREIGN KEY (template_id) REFERENCES service_templates(id)
);

-- Drivers (associated with Service Instances)
CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_instance_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_info TEXT NOT NULL, -- JSON with vehicle details
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_instance_id) REFERENCES service_instances(id)
);

-- Orders (basic structure for task 1.4, will be extended in task 1.7)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_instance_id INTEGER NOT NULL,
    driver_id INTEGER,
    status TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_instance_id) REFERENCES service_instances(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
); 