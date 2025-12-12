# API Documentation

## Base URL

Development: `http://localhost:8080/api`

## Endpoints

### People

#### Get All People
```
GET /people
```

**Response**
```json
[
  {
    "id": "uuid",
    "name": "Santa Claus",
    "created_at": "2025-11-22T10:00:00Z"
  }
]
```

#### Get Person by ID
```
GET /people/:id
```

**Response**
```json
{
  "id": "uuid",
  "name": "Santa Claus",
  "created_at": "2025-11-22T10:00:00Z"
}
```

#### Create Person
```
POST /people
```

**Request Body**
```json
{
  "name": "Santa Claus"
}
```

**Response** (201 Created)
```json
{
  "id": "uuid",
  "name": "Santa Claus",
  "created_at": "2025-11-22T10:00:00Z"
}
```

#### Delete Person
```
DELETE /people/:id
```

**Response** (204 No Content)

### Gifts

#### Get Gifts for Person
```
GET /people/:personId/gifts
```

**Response**
```json
[
  {
    "id": "uuid",
    "person_id": "uuid",
    "title": "New Sleigh",
    "description": "A modern, eco-friendly sleigh",
    "is_selected": false,
    "created_at": "2025-11-22T10:00:00Z"
  }
]
```

#### Create Gift
```
POST /gifts
```

**Request Body**
```json
{
  "person_id": "uuid",
  "title": "New Sleigh",
  "description": "A modern, eco-friendly sleigh"
}
```

**Response** (201 Created)
```json
{
  "id": "uuid",
  "person_id": "uuid",
  "title": "New Sleigh",
  "description": "A modern, eco-friendly sleigh",
  "is_selected": false,
  "created_at": "2025-11-22T10:00:00Z"
}
```

#### Update Gift
```
PATCH /gifts/:id
```

**Request Body** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_selected": true
}
```

**Response**
```json
{
  "id": "uuid",
  "person_id": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "is_selected": true,
  "created_at": "2025-11-22T10:00:00Z"
}
```

#### Delete Gift
```
DELETE /gifts/:id
```

**Response** (204 No Content)

#### Select Gift as Final
```
POST /people/:personId/gifts/:giftId/select
```

**Response**
```json
{
  "id": "uuid",
  "person_id": "uuid",
  "title": "New Sleigh",
  "description": "A modern, eco-friendly sleigh",
  "is_selected": true,
  "created_at": "2025-11-22T10:00:00Z"
}
```

**Note**: This endpoint automatically unselects any other gifts for the same person.

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```
Plain text error message
```

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
