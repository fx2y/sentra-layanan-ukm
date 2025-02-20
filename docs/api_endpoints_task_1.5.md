# Customer API Endpoints Documentation

## Service Discovery

### GET /api/customer/services
Get a list of available services with optional filtering.

**Query Parameters:**
- `search` (optional): Search term to filter services by name, description, or mitra name
- `mode_id` (optional): Filter by transportation mode ID
- `cargo_type_id` (optional): Filter by cargo type ID

**Response:**
```json
[
  {
    "service_id": 1,
    "mitra_name": "PT Logistics Pro",
    "mode_name": "Truck Medium",
    "description": "Medium delivery truck service",
    "capacity_kg": 3000,
    "base_price": 200000,
    "price_per_km": 7000,
    "facilities": "GPS Tracking,Temperature Control"
  }
]
```

### GET /api/customer/services/:id
Get detailed information about a specific service.

**Parameters:**
- `id`: Service instance ID

**Response:**
```json
{
  "service_id": 1,
  "mitra_name": "PT Logistics Pro",
  "mode_name": "Truck Medium",
  "description": "Medium delivery truck service",
  "capacity_kg": 3000,
  "base_price": 200000,
  "price_per_km": 7000,
  "facilities": "GPS Tracking,Temperature Control"
}
```

## Order Placement

### POST /api/customer/orders
Place a new order for a service.

**Headers:**
- `x-customer-id`: Customer ID (required)

**Request Body:**
```json
{
  "service_id": 1,
  "pickup_address": "Jl. Sudirman No. 123",
  "delivery_address": "Jl. Thamrin No. 456",
  "cargo_type": "General",
  "cargo_weight": 1000,
  "notes": "Handle with care"
}
```

**Response:**
```json
{
  "order_id": 1,
  "status": "pending",
  "total_price": 270000
}
```

### GET /api/customer/orders/:id
Get order details and status.

**Headers:**
- `x-customer-id`: Customer ID (required)

**Parameters:**
- `id`: Order ID

**Response:**
```json
{
  "id": 1,
  "service_instance_id": 1,
  "mitra_name": "PT Logistics Pro",
  "mode_name": "Truck Medium",
  "driver_name": "John Doe",
  "status": "pending",
  "pickup_address": "Jl. Sudirman No. 123",
  "delivery_address": "Jl. Thamrin No. 456",
  "cargo_type": "General",
  "cargo_weight": 1000,
  "total_price": 270000,
  "notes": "Handle with care",
  "status_history": [
    {
      "status": "pending",
      "notes": "Order placed",
      "created_at": "2024-02-19T12:00:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
``` 