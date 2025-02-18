# Seed Data Documentation

## Overview
The seed data provides initial test data for the Sentra Layanan UKM platform's master data tables. This includes transportation modes, cargo types, and facilities that serve as the foundation for the service.

## Included Data

### Transportation Modes (Angkutan)
1. Motor Roda Dua
   - Capacity: 20kg
   - Base Price: Rp 10,000
   - Price per KM: Rp 2,000
   - Best for: Quick deliveries, small packages

2. Pickup
   - Capacity: 1,000kg
   - Base Price: Rp 50,000
   - Price per KM: Rp 5,000
   - Best for: Medium-sized deliveries

3. Truk Box
   - Capacity: 4,000kg
   - Base Price: Rp 200,000
   - Price per KM: Rp 10,000
   - Best for: Large deliveries

### Cargo Types (Muatan)
1. Umum (General)
   - Price Multiplier: 1.0
   - Standard handling procedures
   
2. Mudah Pecah (Fragile)
   - Price Multiplier: 1.5
   - Special handling required
   
3. Berat (Heavy)
   - Price Multiplier: 1.3
   - Special equipment required

### Facilities
1. AC (Air Conditioning)
   - For temperature-sensitive cargo
   
2. Tracking
   - Real-time location tracking
   
3. Asuransi (Insurance)
   - Additional cargo protection

## Loading the Seed Data

### Method 1: Using Bun Script
```bash
bun run src/seed.ts
```

### Method 2: Manual SQL Import
The seed data is also available in SQL format:
```bash
sqlite3 data.db < sql/seed.sql
```

## Modifying Seed Data
To modify the seed data:
1. Edit `src/seed.ts`
2. Update the relevant data arrays
3. Re-run the seed script

## Verification
After loading seed data, verify through:
1. Admin Dashboard UI
2. Direct API calls:
   - GET /api/transportation-modes
   - GET /api/cargo-types
   - GET /api/facilities

## Notes
- Seed data is designed for testing and initial setup
- Prices and capacities can be adjusted based on market conditions
- Additional modes, types, and facilities can be added through the admin interface