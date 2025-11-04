# Personal VPN API Documentation

Base URL: `https://api.personalvpn.dev`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /api/auth/register

Register or login a user (anonymous).

**Request Body:**
```json
{
  "deviceId": "optional-device-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "userId": "uuid",
    "anonymousId": "anon_..."
  }
}
```

### Servers

#### GET /api/servers/list

Get list of available VPN servers.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "US East",
      "location": "New York",
      "countryCode": "US",
      "protocol": "socks5",
      "load": 50
    }
  ]
}
```

#### POST /api/servers/config

Get configuration for a specific server.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "serverId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "US East",
    "host": "1.2.3.4",
    "port": 1080,
    "protocol": "socks5"
  }
}
```

### Analytics

#### POST /api/analytics/track

Track usage analytics.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "event": "connection",
  "serverId": "uuid",
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event tracked"
}
```

### Health

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-04T12:00:00Z",
  "checks": {
    "database": "ok",
    "api": "ok"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Rate Limiting

- `/api/auth/register`: 5 requests per hour
- `/api/servers/list`: 100 requests per 15 minutes
- `/api/servers/config`: 10 requests per 10 minutes

Rate limit exceeded responses return HTTP 429.
