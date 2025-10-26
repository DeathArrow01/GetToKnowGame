# RESTful Admin API Design

## Overview

The admin API has been redesigned to follow RESTful principles with proper HTTP methods and resource-oriented URLs. This design leverages header-based authentication to enable full HTTP method support.

## Authentication

All admin endpoints require authentication via headers:

```
Authorization: Bearer your-admin-key-here
```

Or fallback:
```
X-Admin-Key: your-admin-key-here
```

## API Endpoints

### Dashboard & Statistics (Read-Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/stats/visitors` | Time-series visitor data |
| `GET` | `/api/admin/sessions` | List all sessions with pagination |
| `GET` | `/api/admin/performance` | System performance metrics |
| `GET` | `/api/admin/analytics/geographic` | Geographic analytics data |

### Questions Resource (Full CRUD)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/questions` | List all questions grouped by section | - |
| `POST` | `/api/admin/questions` | Create a new question | `{section, questionText}` |
| `PUT` | `/api/admin/questions/:id` | Update a question | `{section, questionText}` |
| `DELETE` | `/api/admin/questions/:id` | Delete a question | - |

### Sections Resource (Full CRUD)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/sections` | List all sections with question counts | - |
| `POST` | `/api/admin/sections` | Create a new section | `{name}` |
| `PUT` | `/api/admin/sections/:oldName` | Rename a section | `{newName}` |
| `DELETE` | `/api/admin/sections/:name` | Delete a section and all its questions | - |

### Bulk Operations

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/admin/questions/bulk` | Bulk create questions | `{questions: [{section, questionText}]}` |
| `DELETE` | `/api/admin/questions/bulk` | Bulk delete questions | `{ids: [string]}` |
| `POST` | `/api/admin/bulk` | Unified bulk operations | `{operation, data}` |

### Analytics (Complex Queries)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/admin/analytics/filtered` | Advanced analytics with filtering | `{startDate, endDate, eventTypes, limit, offset}` |

## RESTful Design Principles

### 1. Resource-Oriented URLs

- **Questions**: `/api/admin/questions` (collection), `/api/admin/questions/:id` (individual)
- **Sections**: `/api/admin/sections` (collection), `/api/admin/sections/:name` (individual)
- **Analytics**: `/api/admin/analytics/filtered` (action on analytics resource)

### 2. Proper HTTP Methods

- **GET**: Read operations (list, retrieve)
- **POST**: Create operations and complex queries
- **PUT**: Update operations (full resource replacement)
- **DELETE**: Delete operations

### 3. Status Codes

- **200**: Success
- **201**: Created (for POST operations)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid admin key)
- **404**: Not Found
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

### 4. Request/Response Format

All requests and responses use JSON format with consistent structure:

```json
// Success Response
{
  "data": {...},
  "message": "Operation successful"
}

// Error Response
{
  "error": "Error description"
}

// Bulk Operation Response
{
  "created": 5,
  "total": 10,
  "errors": ["Error 1", "Error 2"]
}
```

## Key Improvements

### 1. Analytics Endpoint

**Before (GET with query parameters):**
```
GET /api/admin/analytics/filtered?startDate=2024-01-01&endDate=2024-01-31&limit=100
```

**After (POST with request body):**
```
POST /api/admin/analytics/filtered
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "limit": 100
}
```

**Benefits:**
- No URL length limitations
- Complex filter objects in request body
- Better caching behavior
- More secure (no sensitive data in URLs)

### 2. Section Management

**Before:**
- Sections were implicit (derived from questions)
- No direct section creation endpoint

**After:**
- Dedicated section resource with full CRUD
- `POST /api/admin/sections` for creating sections
- Proper resource management

### 3. Bulk Operations

**Before:**
- Separate endpoints for each bulk operation
- Inconsistent request formats

**After:**
- Unified bulk operations endpoint
- Consistent request format
- Extensible for future operations

## Usage Examples

### Create a New Section

```bash
curl -X POST https://yourdomain.com/api/admin/sections \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Section"}'
```

### Bulk Create Questions

```bash
curl -X POST https://yourdomain.com/api/admin/questions/bulk \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {"section": "Getting to Know You", "questionText": "What is your favorite hobby?"},
      {"section": "Getting to Know You", "questionText": "If you could travel anywhere, where would you go?"}
    ]
  }'
```

### Advanced Analytics Query

```bash
curl -X POST https://yourdomain.com/api/admin/analytics/filtered \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "eventTypes": ["page_view", "session_start"],
    "limit": 1000
  }'
```

### Unified Bulk Operations

```bash
curl -X POST https://yourdomain.com/api/admin/bulk \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create_questions",
    "data": [
      {"section": "Values", "questionText": "What matters most to you?"}
    ]
  }'
```

## Migration Guide

### Frontend Changes

1. **Analytics**: Change from `GET` to `POST` for filtered analytics
2. **Section Creation**: Use new `POST /api/admin/sections` endpoint
3. **Bulk Operations**: Optionally use unified `/api/admin/bulk` endpoint

### Backend Changes

1. **Authentication**: Updated to use headers instead of query parameters
2. **Analytics**: Changed from GET to POST for complex queries
3. **Sections**: Added dedicated CRUD endpoints
4. **Bulk Operations**: Added unified bulk operations endpoint

## Benefits

1. **Security**: No sensitive data in URLs
2. **Scalability**: No URL length limitations
3. **Standards Compliance**: Follows REST principles
4. **Maintainability**: Consistent API design
5. **Extensibility**: Easy to add new operations
6. **Caching**: Better HTTP caching behavior
7. **Documentation**: Self-documenting API structure

## Future Enhancements

1. **Pagination**: Standardized pagination parameters
2. **Filtering**: Query parameter filtering for simple cases
3. **Sorting**: Standardized sorting parameters
4. **Field Selection**: Partial response support
5. **Versioning**: API versioning support
6. **Rate Limiting**: Per-endpoint rate limiting
7. **Audit Logging**: Request/response logging
