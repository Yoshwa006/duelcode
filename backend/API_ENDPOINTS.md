# DuelCode API Endpoints Documentation

Base URL: `http://localhost:8080`

## Authentication

All endpoints except `/api/auth/**` require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters

**Response:**
- **200 OK**: `"User registered successfully"`
- **400 Bad Request**: Validation error or email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

### 1.2 Login
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters

**Response:**
- **200 OK**: JWT token string
- **401 Unauthorized**: `"Invalid email or password"`

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 2. Question Endpoints (`/api/question`)

**Authentication Required:** Yes

### 2.1 Get All Questions
**GET** `/api/question`

Retrieve all questions from the database.

**Response:**
- **200 OK**: Array of `QuestionDTO` objects

**QuestionDTO Structure:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "difficulty": "string",
  "stdIn": "string",
  "expectedOutput": "string"
}
```

**Example:**
```bash
curl -X GET http://localhost:8080/api/question \
  -H "Authorization: Bearer <token>"
```

---

### 2.2 Get Question by ID
**GET** `/api/question/{id}`

Retrieve a specific question by its UUID.

**Path Parameters:**
- `id` (UUID): Question identifier

**Response:**
- **200 OK**: `Question` object
- **404 Not Found**: Question not found

**Example:**
```bash
curl -X GET http://localhost:8080/api/question/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### 2.3 Save Question (Elasticsearch)
**POST** `/api/question`

Save a question to Elasticsearch.

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "title": "string",
  "description": "string",
  "difficulty": "string",
  "stdIn": "string",
  "expectedOutput": "string"
}
```

**Response:**
- **200 OK**: `"Question saved successfully with ID: <uuid>"`
- **500 Internal Server Error**: Error message

**Example:**
```bash
curl -X POST http://localhost:8080/api/question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Two Sum",
    "description": "Find two numbers that add up to target",
    "difficulty": "Easy",
    "stdIn": "2,7,11,15\n9",
    "expectedOutput": "0,1"
  }'
```

---

### 2.4 Get Question by Title
**GET** `/api/question/title/{name}`

Find a question in Elasticsearch by its title.

**Path Parameters:**
- `name` (String): Question title

**Response:**
- **200 OK**: `QuestionElastic` object
- **404 Not Found**: `"No question found with title: <name>"`

**Example:**
```bash
curl -X GET http://localhost:8080/api/question/title/Two%20Sum \
  -H "Authorization: Bearer <token>"
```

---

### 2.5 Check if Question Exists by Title
**GET** `/api/question/existsByTitle/{title}`

Check if a question with the given title exists in Elasticsearch.

**Path Parameters:**
- `title` (String): Question title

**Response:**
- **200 OK**: `true` or `false`

**Example:**
```bash
curl -X GET http://localhost:8080/api/question/existsByTitle/Two%20Sum \
  -H "Authorization: Bearer <token>"
```

---

## 3. Session & Battle Endpoints (`/api`)

**Authentication Required:** Yes

### 3.1 Generate Session Token
**POST** `/api/generate`

Create a new battle session for a specific question.

**Request Body:**
```json
"123e4567-e89b-12d3-a456-426614174000"
```
(UUID string of the question ID)

**Response:**
- **200 OK**: Session token string (4 characters)

**Example:**
```bash
curl -X POST http://localhost:8080/api/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '"123e4567-e89b-12d3-a456-426614174000"'
```

---

### 3.2 Submit Code
**POST** `/api/submit`

Submit code solution for evaluation in a battle session.

**Request Body:**
```json
{
  "source_code": "def solution():\n    return True",
  "language_id": 71,
  "question": {
    "id": "uuid",
    "title": "string",
    "stdIn": "string",
    "expectedOutput": "string"
  },
  "token": "ABCD"
}
```

**Response:**
- **200 OK**: `OperationStatusResponse`
  ```json
  {
    "status": "success" | "failure",
    "message": "string",
    "errorCode": 0
  }
  ```
- **400 Bad Request**: Invalid session or user not in session
- **401 Unauthorized**: User not authenticated

**Status Messages:**
- `"Correct answer. You won the battle"` - Solution accepted
- `"Wrong answer"` - Solution incorrect
- `"Session does not exist"` - Invalid token
- `"Battle already completed"` - Session finished
- `"You are not part of this session"` - User not authorized
- `"Judge API failed"` - External judge service error

**Example:**
```bash
curl -X POST http://localhost:8080/api/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "print(\"Hello\")",
    "language_id": 71,
    "question": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "stdIn": "test"
    },
    "token": "ABCD"
  }'
```

---

### 3.3 Join Random Session
**POST** `/api/join-random`

Join the most recent available battle session.

**Response:**
- **200 OK**: `OperationStatusResponse`
  ```json
  {
    "status": "SUCCESS" | "FAILED",
    "message": "Successfully joined a random session" | "No available sessions to join",
    "errorCode": 0 | 404
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8080/api/join-random \
  -H "Authorization: Bearer <token>"
```

---

### 3.4 Join Session by Token
**GET** `/api/join-key?key={token}`

Join a specific battle session using a token.

**Query Parameters:**
- `key` (String): Session token (4 characters)

**Response:**
- **200 OK**: `OperationStatusResponse`
  ```json
  {
    "status": "SUCCESS" | "FAILED",
    "message": "Joined session successfully" | "Failed to join session...",
    "errorCode": 0 | 400 | 404
  }
  ```

**Error Codes:**
- `404`: Session not found
- `400`: Session already joined or cannot join own session

**Example:**
```bash
curl -X GET "http://localhost:8080/api/join-key?key=ABCD" \
  -H "Authorization: Bearer <token>"
```

---

### 3.5 Search Sessions
**POST** `/api/search`

Search and filter battle sessions with pagination.

**Request Body:**
```json
{
  "creatorEmail": "string (optional)",
  "createdUserName": "string (optional)",
  "joinedUserName": "string (optional)",
  "joinedByEmail": "string (optional)",
  "difficulty": "string (optional)",
  "status": "string (optional)",
  "startDate": "ISO-8601 string (optional)",
  "endDate": "ISO-8601 string (optional)",
  "page": 0,
  "size": 10,
  "sortBy": "createdAt",
  "direction": "DESC" | "ASC"
}
```

**Response:**
- **200 OK**: Array of `SessionResponseDTO` objects

**SessionResponseDTO Structure:**
```json
{
  "id": "uuid",
  "token": "string",
  "creatorEmail": "string",
  "createdUserName": "string",
  "joinedUserName": "string",
  "joinedByEmail": "string",
  "questionTitle": "string",
  "difficulty": "string",
  "status": "string",
  "createdAt": "ISO-8601 string"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "Easy",
    "status": "active",
    "page": 0,
    "size": 20,
    "sortBy": "createdAt",
    "direction": "DESC"
  }'
```

---

## 4. Email Endpoints (`/api/mail`)

**Authentication Required:** Yes

### 4.1 Send Welcome Email
**GET** `/api/mail?to={email}`

Send a welcome email to a recipient.

**Query Parameters:**
- `to` (String, optional): Recipient email address. If not provided, uses default from configuration.

**Response:**
- **200 OK**: `"Email sent successfully!"`
- **400 Bad Request**: `"Recipient email is required"`

**Example:**
```bash
curl -X GET "http://localhost:8080/api/mail?to=user@example.com" \
  -H "Authorization: Bearer <token>"
```

---

## Error Responses

All endpoints may return the following error responses:

### Validation Errors (400)
```json
{
  "status": "FAILED",
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  },
  "errorCode": 400
}
```

### Authentication Errors (401)
```json
{
  "status": "FAILED",
  "message": "Authentication failed: ...",
  "errorCode": 401
}
```

### Not Found (404)
```json
{
  "status": "FAILED",
  "message": "Resource not found",
  "errorCode": 404
}
```

### Server Errors (500)
```json
{
  "status": "FAILED",
  "message": "An unexpected error occurred",
  "errorCode": 500
}
```

---

## Language IDs Reference

Common language IDs for code submission:

- `71` - Python (3.8.1)
- `50` - C (GCC 9.2.0)
- `54` - C++ (GCC 9.2.0)
- `62` - Java (OpenJDK 13.0.1)
- `63` - JavaScript (Node.js 12.14.0)

---

## Session Status Values

- `STATUS_ACTIVE` - Session created, waiting for opponent
- `STATUS_PLAYING` - Both players joined, battle in progress
- `STATUS_COMPLETED` - Battle finished, winner determined

---

## Notes

1. **JWT Token Expiration**: Tokens expire after 24 hours (86400000 ms) by default. Configure via `jwt.expiration` in `application.properties`.

2. **Session Tokens**: 4-character alphanumeric tokens (A-Z, 0-9). Generated securely and checked for uniqueness.

3. **Pagination**: Search endpoints support pagination with `page` (0-indexed) and `size` parameters.

4. **Date Format**: Use ISO-8601 format for date parameters (e.g., `2024-01-15T10:30:00Z`).

5. **CORS**: API allows requests from `http://localhost:5173` by default.

---

## Base URL Configuration

Default: `http://localhost:8080`

For production, update the base URL accordingly and ensure:
- Environment variables are set for sensitive configuration
- JWT secret is changed from default
- Database credentials are secured
- CORS origins are configured appropriately

