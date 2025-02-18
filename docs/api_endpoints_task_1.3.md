# API Endpoints Documentation

## Authentication
All endpoints require Basic Authentication with admin credentials configured in environment variables.

## Transportation Modes
- `GET /api/transportation-modes` - List all transportation modes
- `GET /api/transportation-modes/:id` - Get a specific transportation mode
- `POST /api/transportation-modes` - Create a new transportation mode
  ```json
  {
    "mode_name": "string",
    "description": "string?",
    "capacity_kg": "number",
    "base_price": "number",
    "price_per_km": "number"
  }
  ```
- `PUT /api/transportation-modes/:id` - Update a transportation mode (same schema as POST)
- `DELETE /api/transportation-modes/:id` - Delete a transportation mode

## Cargo Types
- `GET /api/cargo-types` - List all cargo types
- `GET /api/cargo-types/:id` - Get a specific cargo type
- `POST /api/cargo-types` - Create a new cargo type
  ```json
  {
    "type_name": "string",
    "description": "string?",
    "handling_instructions": "string?",
    "price_multiplier": "number"
  }
  ```
- `PUT /api/cargo-types/:id` - Update a cargo type (same schema as POST)
- `DELETE /api/cargo-types/:id` - Delete a cargo type

## Facilities
- `GET /api/facilities` - List all facilities
- `GET /api/facilities/:id` - Get a specific facility
- `GET /api/facilities/mode/:modeId` - Get facilities for a transportation mode
- `POST /api/facilities` - Create a new facility
  ```json
  {
    "name": "string",
    "description": "string?"
  }
  ```
- `PUT /api/facilities/:id` - Update a facility (same schema as POST)
- `DELETE /api/facilities/:id` - Delete a facility
- `POST /api/facilities/mode/:modeId/facility/:facilityId` - Add facility to transportation mode
- `DELETE /api/facilities/mode/:modeId/facility/:facilityId` - Remove facility from transportation mode

## Error Responses
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Invalid input
- 401: Unauthorized
- 404: Resource not found
- 500: Server error

Error responses follow the format:
```json
{
  "error": "Error message description"
}
```