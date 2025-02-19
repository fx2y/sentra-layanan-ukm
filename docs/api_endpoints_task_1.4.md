# Mitra Admin Dashboard API Documentation

## Authentication

Basic authentication is used for all endpoints. Credentials:
- Username: `mitra_admin`
- Password: `password`

The authentication header should be formatted as:
```
Authorization: Basic <base64(username:password)>
```

All endpoints require this authentication header and will return a 401 Unauthorized response if not provided or invalid.

## Endpoints

### Mitra Profile

#### GET /mitra/profile
Retrieves the Mitra's business profile.

Response:
```json
{
  "id": 1,
  "name": "PT Logistik Nusantara",
  "address": "Jl. Raya Serpong No. 123, Tangerang Selatan",
  "contact_info": "{\"phone\": \"+62811234567\", \"email\": \"contact@logistiknusantara.id\"}"
}
```

#### PUT /mitra/profile
Updates the Mitra's business profile.

Request Body:
```json
{
  "name": "PT Logistik Nusantara",
  "address": "Jl. Raya Serpong No. 123, Tangerang Selatan",
  "contact_info": "{\"phone\": \"+62811234567\", \"email\": \"contact@logistiknusantara.id\"}"
}
```

Response:
```json
{
  "success": true
}
```

### Service Instances

#### GET /mitra/service-instances
Lists all service instances for the Mitra.

Response:
```json
[
  {
    "id": 1,
    "template_id": 1,
    "template_name": "Standard Delivery",
    "config": "{\"service_area\": [\"Tangerang Selatan\", \"Jakarta Selatan\"], \"operating_hours\": \"08:00-20:00\", \"vehicle_types\": [\"motor\", \"mobil\"], \"pricing\": {\"base_fare\": 10000, \"per_km\": 2000}}"
  }
]
```

#### POST /mitra/service-instances
Creates a new service instance.

Request Body:
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

Response:
```json
{
  "id": 1
}
```

#### GET /mitra/service-instances/:id
Retrieves a specific service instance.

Response:
```json
{
  "id": 1,
  "template_id": 1,
  "template_name": "Standard Delivery",
  "config": "{\"service_area\": [\"Tangerang Selatan\", \"Jakarta Selatan\"], \"operating_hours\": \"08:00-20:00\", \"vehicle_types\": [\"motor\", \"mobil\"], \"pricing\": {\"base_fare\": 10000, \"per_km\": 2000}}"
}
```

#### PUT /mitra/service-instances/:id
Updates a service instance configuration.

Request Body:
```json
{
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

Response:
```json
{
  "success": true
}
```

#### DELETE /mitra/service-instances/:id
Deletes a service instance.

Response:
```json
{
  "success": true
}
```

### Drivers

#### GET /mitra/service-instances/:serviceInstanceId/drivers
Lists all drivers for a specific service instance.

Response:
```json
[
  {
    "id": 1,
    "name": "Budi Santoso",
    "phone": "+62812345678",
    "vehicle_info": "{\"type\": \"motor\", \"plate\": \"B 1234 ABC\", \"model\": \"Honda PCX\"}"
  }
]
```

#### POST /mitra/service-instances/:serviceInstanceId/drivers
Adds a new driver to a service instance.

Request Body:
```json
{
  "name": "Budi Santoso",
  "phone": "+62812345678",
  "vehicle_info": {
    "type": "motor",
    "plate": "B 1234 ABC",
    "model": "Honda PCX"
  }
}
```

Response:
```json
{
  "id": 1
}
```

#### GET /mitra/drivers/:id
Retrieves a specific driver.

Response:
```json
{
  "id": 1,
  "name": "Budi Santoso",
  "phone": "+62812345678",
  "vehicle_info": "{\"type\": \"motor\", \"plate\": \"B 1234 ABC\", \"model\": \"Honda PCX\"}"
}
```

#### PUT /mitra/drivers/:id
Updates a driver's information.

Request Body:
```json
{
  "name": "Budi Santoso",
  "phone": "+62812345678",
  "vehicle_info": {
    "type": "motor",
    "plate": "B 1234 ABC",
    "model": "Honda PCX"
  }
}
```

Response:
```json
{
  "success": true
}
```

#### DELETE /mitra/drivers/:id
Deletes a driver.

Response:
```json
{
  "success": true
}
```

### Orders

#### GET /mitra/orders
Lists all orders for the Mitra's service instances.

Query Parameters:
- `service_instance_id` (optional): Filter orders by service instance

Response:
```json
[
  {
    "id": 1,
    "status": "completed",
    "pickup_address": "Jl. BSD Green Office Park, Tangerang Selatan",
    "delivery_address": "Jl. Sudirman No. 123, Jakarta Selatan",
    "cargo_type": "paket",
    "service_instance_id": 1,
    "service_config": "{\"service_area\": [\"Tangerang Selatan\", \"Jakarta Selatan\"], \"operating_hours\": \"08:00-20:00\"}",
    "driver_name": "Budi Santoso"
  }
]
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid input"
}
``` 