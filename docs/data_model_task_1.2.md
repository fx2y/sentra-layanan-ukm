# Sentra Layanan UKM - Data Model Documentation

## Overview
This document describes the data model for the Sentra Layanan UKM Transport & Delivery Platform. The model is designed with simplicity and efficiency in mind, using SQLite as the database system.

## Core Entities

### Users
- **Purpose**: Central entity for all user types (admin, customer, driver, mitra)
- **Key Attributes**:
  - `user_id`: Primary identifier
  - `username`: Unique login identifier
  - `role`: User type (admin/customer/driver/mitra)
  - `phone_number`: Primary contact method, used for WhatsApp integration
- **Design Decisions**:
  - Single users table with role differentiation for simpler auth management
  - Phone number as UNIQUE for WhatsApp integration
  - Soft delete via `is_active` flag

### Businesses (Mitra)
- **Purpose**: Represents UKM businesses using the platform
- **Key Attributes**:
  - `business_id`: Primary identifier
  - `user_id`: Link to user account
  - `location_lat/long`: Coordinates for mapping
- **Relationships**:
  - One-to-one with Users table

### Drivers
- **Purpose**: Registered transport service providers
- **Key Attributes**:
  - `driver_id`: Primary identifier
  - `user_id`: Link to user account
  - `license_details`: Required documentation
  - `vehicle_details`: Transport capacity information
- **Relationships**:
  - One-to-one with Users table
  - One-to-many with Orders

### Transportation Modes (Angkutan)
- **Purpose**: Available transport types
- **Key Attributes**:
  - `capacity_kg`: Maximum load
  - `base_price`: Starting fee
  - `price_per_km`: Distance-based pricing
- **Relationships**:
  - Many-to-many with Facilities
  - One-to-many with Orders

### Cargo Types (Muatan)
- **Purpose**: Different types of cargo with specific handling needs
- **Key Attributes**:
  - `price_multiplier`: Adjusts base price based on cargo type
- **Relationships**:
  - One-to-many with Orders

### Orders
- **Purpose**: Core business transaction records
- **Key Attributes**:
  - `status`: Order lifecycle tracking
  - `location_details`: Pickup and delivery coordinates
  - `pricing`: Based on distance, mode, and cargo type
- **Relationships**:
  - Many-to-one with Users (customer)
  - Many-to-one with Drivers
  - Many-to-one with Transportation Modes
  - Many-to-one with Cargo Types
  - One-to-many with Status History
  - One-to-one with Driver Reviews

## Design Considerations

### Simplicity
- Minimal use of complex SQLite features
- Straightforward relationships with standard foreign keys
- Use of simple data types (INTEGER, TEXT, REAL)

### Performance
- Indexed foreign keys for faster joins
- Denormalized location data in Orders table
- Status history in separate table for efficient main table queries

### Scalability
- Status history design allows for future status types
- Facilities system allows adding new features to transport modes
- Review system can be extended for business reviews

### Data Integrity
- Foreign key constraints ensure referential integrity
- CHECK constraints for valid status values and ratings
- UNIQUE constraints on critical fields
- Automatic timestamp management via triggers

## Future Considerations
1. Geocoding integration for address validation
2. Payment tracking system
3. Subscription or membership features
4. Route optimization data
5. Automated pricing rules
6. Document storage for licenses and permits

## Schema Location
The complete SQLite schema is available in `task_1.2/sql/schema.sql`

Note: The visual data model diagram will be created using an ER diagram tool and added to this documentation.