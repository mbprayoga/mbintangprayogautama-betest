# ms-mbintangprayogautama-betest

A Node.js microservices project with two services:

- **auth-service** — issues and validates JWT tokens via gRPC and HTTP
- **user-service** — CRUD REST API for users, backed by MongoDB and Redis

---

## Architecture

```
┌─────────────────┐        gRPC :50051        ┌──────────────────┐
│   user-service  │ ────────────────────────► │   auth-service   │
│   HTTP :3000    │                            │   HTTP :3001     │
└────────┬────────┘                            └──────────────────┘
         │
    ┌────┴────┐
    │         │
 MongoDB   Redis
 :27017    :6379
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+
- [Docker](https://www.docker.com/) & Docker Compose (for containerised setup)

---

## Running with Docker Compose (recommended)

```bash
# 1. Copy and fill in env files (see Environment Variables section below)
cp auth-service/.env.example auth-service/.env
cp user-service/.env.example user-service/.env

# 2. Build and start all services
docker compose up --build

# 3. Stop all services
docker compose down
```

Services will be available at:

| Service      | HTTP                  | gRPC            |
| ------------ | --------------------- | --------------- |
| auth-service | http://localhost:3001 | localhost:50051 |
| user-service | http://localhost:3000 | —               |

---

## Running Locally (without Docker)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure

```bash
# MongoDB and Redis via Docker
docker compose up mongo redis -d
```

### 3. Start auth-service

```bash
cd auth-service
cp .env.example .env   # fill in JWT_SECRET
pnpm dev
```

### 4. Start user-service

```bash
cd user-service
cp .env.example .env   # fill in MONGO_URI, REDIS_URL, etc.
pnpm dev
```

---

## Environment Variables

### `auth-service/.env`

```env
# Secret key used to sign and verify JWTs (required)
JWT_SECRET=your_super_secret_key_here

# Token expiry duration (optional, default: 1h)
JWT_EXPIRES_IN=1h

# gRPC server port (optional, default: 50051)
GRPC_PORT=50051

# HTTP server port (optional, default: 3001)
HTTP_PORT=3001
```

### `user-service/.env`

```env
# MongoDB connection URI (optional, default: mongodb://localhost:27017/db_mbintangprayogautama_betest)
MONGO_URI=mongodb://localhost:27017/db_mbintangprayogautama_betest

# Redis connection URL (optional, default: redis://localhost:6379)
REDIS_URL=redis://localhost:6379

# HTTP server port (optional, default: 3000)
PORT=3000

# auth-service gRPC address (optional, default: localhost:50051)
AUTH_SERVICE_GRPC_URL=localhost:50051
```

---

## MongoDB Schema

Collection: **`users`**

| Field            | Type     | Constraints                          |
| ---------------- | -------- | ------------------------------------ |
| `_id`            | ObjectId | Auto-generated primary key           |
| `userName`       | String   | Required, trimmed                    |
| `accountNumber`  | String   | Required, unique, trimmed            |
| `emailAddress`   | String   | Required, unique, lowercase, trimmed |
| `identityNumber` | String   | Required, unique, trimmed            |
| `createdAt`      | Date     | Auto-managed by Mongoose timestamps  |
| `updatedAt`      | Date     | Auto-managed by Mongoose timestamps  |

---

## API Endpoints

### auth-service (HTTP :3001)

| Method | Path          | Auth | Description          |
| ------ | ------------- | ---- | -------------------- |
| POST   | `/auth/token` | None | Generate a JWT token |
| GET    | `/health`     | None | Health check         |

#### `POST /auth/token`

**Response `200 OK`**

```json
{
  "token": "<jwt_token>"
}
```

---

### user-service (HTTP :3000)

All `/users` endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

| Method | Path                              | Auth     | Description                     |
| ------ | --------------------------------- | -------- | ------------------------------- |
| GET    | `/health`                         | None     | Health check                    |
| POST   | `/users`                          | Required | Create a new user               |
| GET    | `/users`                          | Required | Get all users                   |
| GET    | `/users/:id`                      | Required | Get user by MongoDB ObjectId    |
| GET    | `/users/account/:accountNumber`   | Required | Get user by account number      |
| GET    | `/users/identity/:identityNumber` | Required | Get user by identity number     |
| PUT    | `/users/:id`                      | Required | Update user by MongoDB ObjectId |
| DELETE | `/users/:id`                      | Required | Delete user by MongoDB ObjectId |

---

#### `POST /users`

**Request body**

```json
{
  "userName": "John Doe",
  "accountNumber": "ACC-001",
  "emailAddress": "john@example.com",
  "identityNumber": "ID-001"
}
```

| Field            | Type   | Required | Constraints             |
| ---------------- | ------ | -------- | ----------------------- |
| `userName`       | string | Yes      | 1–100 characters        |
| `accountNumber`  | string | Yes      | 1–50 characters, unique |
| `emailAddress`   | string | Yes      | Valid email, unique     |
| `identityNumber` | string | Yes      | 1–50 characters, unique |

**Response `201 Created`**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userName": "John Doe",
  "accountNumber": "ACC-001",
  "emailAddress": "john@example.com",
  "identityNumber": "ID-001",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

#### `GET /users`

**Response `200 OK`** — array of user objects (same shape as above)

---

#### `GET /users/:id`

**Response `200 OK`** — single user object, or `404` if not found

---

#### `GET /users/account/:accountNumber`

**Response `200 OK`** — single user object, or `404` if not found

---

#### `GET /users/identity/:identityNumber`

**Response `200 OK`** — single user object, or `404` if not found

---

#### `PUT /users/:id`

**Request body** (at least one field required)

```json
{
  "userName": "Jane Doe",
  "emailAddress": "jane@example.com"
}
```

**Response `200 OK`** — updated user object, or `404` if not found

---

#### `DELETE /users/:id`

**Response `204 No Content`**, or `404` if not found

---

## Running Tests

```bash
# Run all tests from workspace root
pnpm --filter "@ms-mbintangprayogautama-betest/auth-service" test
pnpm --filter "@ms-mbintangprayogautama-betest/user-service" test

# Or from each service directory
cd auth-service && pnpm test
cd user-service && pnpm test
```

Tests include coverage reports output to each service's `coverage/` directory.

---

## Rate Limiting

The user-service applies a rate limit of **100 requests per 15 minutes** per IP address.

---

## gRPC Proto (auth-service)

Located at `proto/auth.proto`:

```protobuf
service AuthService {
  rpc GenerateToken (GenerateTokenRequest) returns (TokenResponse);
  rpc ValidateToken (ValidateTokenRequest) returns (ValidationResponse);
}
```

The gRPC interface is used internally by user-service to validate Bearer tokens on every protected request.
