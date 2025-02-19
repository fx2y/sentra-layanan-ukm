# Mitra Admin Dashboard Seed Data Documentation

## Overview

This document describes the seed data used to initialize the Mitra Admin Dashboard. The seed data includes sample records for:
- Mitra profile
- Service instances
- Drivers
- Orders

## Seed Data Structure

### Mitra Profile

```json
{
  "name": "PT Logistik Nusantara",
  "address": "Jl. Raya Serpong No. 123, Tangerang Selatan",
  "contact_info": {
    "phone": "+62811234567",
    "email": "contact@logistiknusantara.id"
  }
}
```

### Service Instance

```json
{
  "template_id": 1,
  "config": {
    "service_area": ["Tangerang Selatan", "Jakarta Selatan"],
    "operating_hours": "08:00-20:00",
    "vehicle_types": ["motor", "mobil"],
    "pricing": {
      "base_fare": 10000,
      "per_km": 2000
    }
  }
}
```

### Drivers

```json
[
  {
    "name": "Budi Santoso",
    "phone": "+62812345678",
    "vehicle_info": {
      "type": "motor",
      "plate": "B 1234 ABC",
      "model": "Honda PCX"
    }
  },
  {
    "name": "Dewi Putri",
    "phone": "+62823456789",
    "vehicle_info": {
      "type": "mobil",
      "plate": "B 5678 DEF",
      "model": "Toyota Avanza"
    }
  }
]
```

### Orders

```json
[
  {
    "status": "completed",
    "pickup_address": "Jl. BSD Green Office Park, Tangerang Selatan",
    "delivery_address": "Jl. Sudirman No. 123, Jakarta Selatan",
    "cargo_type": "paket"
  },
  {
    "status": "in_progress",
    "pickup_address": "Jl. Alam Sutera No. 45, Tangerang Selatan",
    "delivery_address": "Jl. Fatmawati No. 78, Jakarta Selatan",
    "cargo_type": "dokumen"
  }
]
```

## Loading the Seed Data

The seed data can be loaded using the provided script:

```bash
bun run scripts/seed_mitra_data.ts
```

This script will:
1. Create a Mitra profile
2. Create a service instance using an existing service template
3. Add two drivers to the service instance
4. Create two sample orders

## Dependencies

The seed data script requires:
- An existing service template in the database
- Empty or non-conflicting tables for new data

## Verification

After loading the seed data, you can verify it by:
1. Logging into the Mitra Admin Dashboard
2. Checking each tab for the sample data
3. Verifying relationships between entities

## Notes

- The seed data is designed for testing and development purposes
- All sample data uses realistic Indonesian addresses and names
- The script includes error handling for missing dependencies
- Foreign key relationships are maintained throughout the seeding process 