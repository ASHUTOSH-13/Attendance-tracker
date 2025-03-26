# API Documentation

This document provides detailed information about the API endpoints available in the Face Recognition-based Attendance System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

### Register User

```http
POST /users/register
```

Register a new user with face recognition capabilities.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "profileImage": "file",
  "faceDescriptor": "array"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string",
    "faceDescriptor": "array"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data
- 400 Bad Request: User already exists

### Login User

```http
POST /users/login
```

Authenticate a user and return user data.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string",
    "faceDescriptor": "array"
  }
}
```

**Error Responses:**
- 400 Bad Request: Missing credentials
- 401 Unauthorized: Invalid credentials

## Attendance Management

### Mark Attendance

```http
POST /attendance/mark
```

Mark attendance for a user using face recognition.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string"
  }
}
```

**Error Responses:**
- 400 Bad Request: Attendance already marked for today
- 404 Not Found: User not found

### Get Attendance Report

```http
GET /attendance/:userId
```

Retrieve attendance history for a specific user.

**Response (200 OK):**
```json
{
  "success": true,
  "attendance": [
    {
      "date": "string (ISO date)",
      "status": "string"
    }
  ]
}
```

**Error Response:**
- 404 Not Found: User not found

## User Management

### Get All Users

```http
GET /users
```

Retrieve all users for face recognition purposes.

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "name": "string",
      "email": "string",
      "profileImage": "string",
      "faceDescriptor": "array"
    }
  ]
}
```

### Get User Dashboard Data

```http
GET /users/dashboard/:userId
```

Retrieve user dashboard data including attendance history.

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string",
    "attendance": [
      {
        "date": "string (ISO date)",
        "status": "string"
      }
    ]
  }
}
```

**Error Response:**
- 404 Not Found: User not found

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Security

- All endpoints except registration and login require authentication
- Passwords are hashed using bcrypt
- File uploads are validated and sanitized
- CORS is enabled for frontend access
- Input validation is performed on all requests

## File Upload

When uploading profile images:
- Supported formats: JPG, PNG
- Maximum file size: 5MB
- Images are stored in the `/uploads` directory
- File names are unique and timestamped

## Best Practices

1. Always include proper error handling in requests
2. Use appropriate HTTP methods for operations
3. Validate input data before sending requests
4. Handle file uploads with proper error checking
5. Implement proper authentication for protected routes 