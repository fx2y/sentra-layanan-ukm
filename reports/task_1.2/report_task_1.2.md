# Task 1.2 Report: Data Model Definition for Sentra Layanan UKM Platform

## Task Overview
Implementation of the core data model for the Sentra Layanan UKM Transport & Delivery platform, focusing on simplicity and SQLite optimization while ensuring comprehensive coverage of all required functionality.

## Deliverables Status

### 1. Data Model Documentation
- ✅ Complete documentation created in `docs/data_model_task_1.2.md`
- ✅ SQLite schema defined in `sql/schema.sql`
- ⏳ Data model diagram pending (to be created with ER diagram tool)

## Key Implementation Details

### Core Entities Overview

1. **Users System**
   - Unified user table with role-based differentiation
   - Roles: admin, customer, driver, mitra
   - WhatsApp integration ready (unique phone numbers)
   - Security features: password hashing, soft delete capability

2. **Business Operations**
   - Mitra (Business) profile management
   - Driver registration and verification
   - Transportation modes with facilities
   - Cargo type categorization

3. **Order Management**
   - Comprehensive order tracking
   - Location-based services integration
   - Status history logging
   - Review system implementation

### Design Decisions and Trade-offs

1. **Simplification Choices**
   - Single users table instead of separate tables per role
   - Denormalized location data in orders table
   - Direct relationships over complex joins
   
2. **Performance Optimizations**
   - Strategic use of indexes on foreign keys
   - Separation of status history for efficient queries
   - Minimal use of complex SQLite features

3. **Scalability Considerations**
   - Extensible facility system
   - Flexible status tracking
   - Review system foundation
   - Future-proof attribute selections

## Technical Implementation

### Database Schema Highlights
```sql
-- Key tables implemented:
- users
- businesses (mitra)
- drivers
- transportation_modes
- cargo_types
- orders
- order_status_history
- driver_reviews
- facilities
- mode_facilities
```

### Data Integrity Measures
1. Foreign Key Constraints
   - All relationships properly constrained
   - Referential integrity enforced

2. Business Rules
   - Status validation via CHECK constraints
   - Rating range enforcement (1-5)
   - Unique constraints on critical fields

3. Automatic Updates
   - Timestamp management via triggers
   - Status history tracking

## Challenges and Solutions

1. **Role Management**
   - Challenge: Multiple user types with different attributes
   - Solution: Unified user table with role-based extension tables

2. **Location Services**
   - Challenge: Efficient storage of geographical data
   - Solution: Direct lat/long storage with future geocoding capability

3. **Price Calculation**
   - Challenge: Multiple factors affecting pricing
   - Solution: Modular approach with base price, distance, and multipliers

## Future Considerations

1. **Immediate Next Steps**
   - Create visual ER diagram
   - Develop seed data for testing
   - Implement geocoding integration

2. **Future Enhancements**
   - Payment system integration
   - Route optimization
   - Document storage system
   - Subscription features

## Testing Status
- ✅ Schema validation completed
- ✅ Constraint testing completed
- ⏳ Seed data creation pending

## References and Links
- [Data Model Documentation](../docs/data_model_task_1.2.md)
- [SQLite Schema](../sql/schema.sql)
- Data Model Diagram (Pending)

## Conclusion
The implemented data model provides a solid foundation for the Sentra Layanan UKM platform, balancing simplicity with functionality while maintaining room for future growth. The focus on SQLite optimization and straightforward relationships ensures efficient operation while meeting all core requirements.