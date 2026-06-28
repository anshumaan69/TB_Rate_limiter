# Token Bucket Rate Limiter Service

A standalone rate-limiting microservice that can be used by any application to enforce API request limits.

Instead of embedding rate limiting logic into every service, applications can query this service to determine whether a request should be allowed or denied.

---

## 🚀 Features

### Core Features

* Token Bucket Rate Limiting
* Sliding Window Rate Limiting
* Per-client configurable limits
* Persistent bucket state
* Race-condition safe updates
* Standard rate-limit headers
* REST API interface
* Load tested for 500+ requests/sec

### Stretch Goals

* Distributed mode using Redis
* Real-time dashboard
* Metrics and analytics
* Prometheus integration
* Kubernetes deployment

---

## 📖 Why This Project?

Most developers use rate-limiting libraries.

This project focuses on building a rate limiter as an independent product that other applications can consume.

It teaches:

* Concurrency Control
* Database Transactions
* Distributed Systems
* System Design
* Load Testing
* Backend Architecture
* API Design

---

## 🏗️ System Architecture

```text
                ┌──────────────┐
                │ Client API   │
                └──────┬───────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Rate Limiter API│
              └──────┬──────────┘
                     │
                     ▼
              ┌─────────────┐
              │ PostgreSQL  │
              └─────────────┘
```

Distributed Mode:

```text
           ┌───────────┐
           │ Instance1 │
           └─────┬─────┘
                 │
          ┌──────▼──────┐
          │    Redis    │
          └──────▲──────┘
                 │
           ┌─────┴─────┐
           │ Instance2 │
           └───────────┘
```

---

# 🛠 Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL

## ORM

* Prisma

## Testing

* Jest
* Supertest

## Load Testing

* k6

## Containerization

* Docker
* Docker Compose

---

# 📂 Project Structure

```text
src/
│
├── controllers/
│
├── services/
│   ├── tokenBucket/
│   └── slidingWindow/
│
├── repositories/
│
├── middleware/
│
├── routes/
│
├── utils/
│
├── prisma/
│
├── tests/
│
└── app.ts
```

---

# ⚙️ Rate Limiting Algorithms

## Token Bucket

Each client owns a bucket.

Example:

```text
Capacity = 10 tokens
Refill Rate = 1 token/sec
```

Every request consumes one token.

If no tokens remain:

```text
DENY
```

Otherwise:

```text
ALLOW
```

---

## Sliding Window

Stores timestamps of previous requests.

Example:

```text
Limit = 5 requests
Window = 60 seconds
```

If a client has already made 5 requests in the last minute:

```text
DENY
```

Otherwise:

```text
ALLOW
```

---

# 🗄 Database Schema

## clients

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    client_key TEXT UNIQUE,
    algorithm TEXT,
    rate INTEGER,
    burst INTEGER,
    created_at TIMESTAMP
);
```

---

## bucket_state

```sql
CREATE TABLE bucket_state (
    client_key TEXT PRIMARY KEY,
    tokens DOUBLE PRECISION,
    last_refill TIMESTAMP
);
```

---

## request_logs

```sql
CREATE TABLE request_logs (
    id UUID PRIMARY KEY,
    client_key TEXT,
    request_time TIMESTAMP
);
```

---

# 🔌 API Endpoints

## Create Client

### POST /admin/client

```json
{
  "clientKey": "user123",
  "algorithm": "token_bucket",
  "rate": 10,
  "burst": 20
}
```

Response:

```json
{
  "message": "Client created"
}
```

---

## Update Client

### PUT /admin/client/:clientKey

```json
{
  "rate": 20,
  "burst": 40
}
```

---

## Check Request

### POST /check

Request:

```json
{
  "clientKey": "user123"
}
```

Response:

```json
{
  "allowed": true,
  "remaining": 9
}
```

---

## Get Client

### GET /admin/client/:clientKey

Response:

```json
{
  "clientKey": "user123",
  "algorithm": "token_bucket",
  "rate": 10,
  "burst": 20
}
```

---

# 📋 Rate Limit Headers

Every response should include:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 72
X-RateLimit-Reset: 1718456200
```

If limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
```

---

# 🔒 Concurrency Handling

Multiple requests for the same client may arrive simultaneously.

To prevent double-spending tokens:

```sql
SELECT *
FROM bucket_state
WHERE client_key = $1
FOR UPDATE;
```

The row is locked until the transaction completes.

Benefits:

* No race conditions
* Accurate token consumption
* Consistent state

---

# 🧪 Testing

Run unit tests:

```bash
npm run test
```

Run integration tests:

```bash
npm run test:integration
```

---

# 🚦 Load Testing

Install k6:

```bash
brew install k6
```

Run:

```bash
k6 run tests/load-test.js
```

Target:

* 500+ requests/sec
* No negative token counts
* No race conditions
* Stable response times

---

# 🐳 Docker Setup

Build:

```bash
docker compose build
```

Start:

```bash
docker compose up
```

Stop:

```bash
docker compose down
```

---

# 🚀 Deployment

## Local

* Docker Compose
* PostgreSQL Container
* Node.js Container

## Cloud

Recommended:

* Railway
* Render
* Fly.io
* DigitalOcean

Deployment Architecture:

```text
Internet
    │
    ▼
Rate Limiter API
    │
    ▼
PostgreSQL
```

---

# 📈 Future Improvements

* Redis Distributed Buckets
* Web Dashboard
* Prometheus Metrics
* Grafana Monitoring
* API Keys
* Multi-region Deployment
* Kubernetes Support

---

# 🎯 Learning Outcomes

By completing this project you will gain hands-on experience with:

* Node.js Backend Development
* TypeScript
* PostgreSQL
* Prisma ORM
* Transactions
* Concurrency Control
* Rate Limiting Algorithms
* System Design
* Docker
* Load Testing
* Distributed Systems Fundamentals

---

# 🗺️ Implementation Roadmap

## ✅ Phase 1 — Project Setup & TypeScript *(Complete)*

> TypeScript project scaffolded with proper folder structure and dev tooling.

**What was done:**

* Installed `typescript`, `ts-node`, `nodemon`
* Installed `prisma`, `@prisma/client`
* Created `tsconfig.json` — target ES2020, strict mode, `src/` → `dist/`
* Added `dev`, `build`, `start` scripts to `package.json`
* Created `src/app.ts` — Express app with health check `GET /`
* Created `src/server.ts` — entry point, listens on PORT 5000
* Scaffolded full `src/` folder structure:

```
src/
├── controllers/
├── services/
│   ├── tokenBucket/
│   └── slidingWindow/
├── repositories/
├── middleware/
├── routes/
├── utils/
├── app.ts        ✅
└── server.ts     ✅
```

**Verified:** `GET /` returns `{ status: "ok", msg: "Rate limiter working" }` ✅

---

## ✅ Phase 2 — Database: Prisma + PostgreSQL Schema *(Complete)*

> Define and migrate the full DB schema via Prisma.

* [x] Run `npx prisma init`
* [x] Define 3 models in `prisma/schema.prisma`:
  * `Client` — stores per-client config (algorithm, rate, burst)
  * `BucketState` — stores live token state per client
  * `RequestLog` — stores timestamps for sliding window
* [x] Run `npx prisma migrate dev --name init`
* [x] Create `src/utils/prismaClient.ts` — singleton Prisma client

---

## ✅ Phase 3 — Repository Layer *(Complete)*

> Isolate all DB queries behind a clean repository pattern.

* `src/repositories/clientRepository.ts`
* `src/repositories/bucketStateRepository.ts` — includes `SELECT FOR UPDATE` support
* `src/repositories/requestLogRepository.ts`

---

## ✅ Phase 4 — Core Rate Limiting Services *(Complete)*

> Implement Token Bucket and Sliding Window algorithms.

* `src/services/tokenBucket/tokenBucketService.ts`
* `src/services/slidingWindow/slidingWindowService.ts`
* `src/services/rateLimiterRouter.ts` — routes to correct algo based on client config

---

## ✅ Phase 5 — REST API Layer *(Complete)*

> Wire controllers and routes to expose the public API.

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/client` | Create a client |
| `PUT` | `/admin/client/:clientKey` | Update client config |
| `GET` | `/admin/client/:clientKey` | Get client details |
| `POST` | `/check` | Check & consume a token |

* `src/controllers/adminController.ts`
* `src/controllers/checkController.ts`
* `src/routes/adminRoutes.ts`
* `src/routes/checkRoutes.ts`
* `src/middleware/rateLimitHeaders.ts` — sets `X-RateLimit-*` headers

---

## ✅ Phase 6 — Testing *(Complete)*

> Unit tests, integration tests, and load tests.

* **Unit** — Jest + ts-jest, mocked Prisma (no real DB needed)
* **Integration** — Supertest against real Express app + test DB
* **Load** — k6 script targeting 500+ req/sec

---

## ✅ Phase 7 — Dockerization *(Complete)*

> Package app + PostgreSQL into Docker Compose.

* `Dockerfile` — multi-stage Node.js build
* `docker-compose.yml` — `app` + `db` services with health check
* `.env.example` — template for environment variables

---


## 🚀 Stretch Goals

| Goal | Tech |
|---|---|
| Redis distributed mode | `ioredis` + Lua atomic scripts |
| Real-time dashboard | Socket.io + React |
| Prometheus metrics | `prom-client` |
| Grafana monitoring | Docker Compose service |
| Kubernetes deployment | `k8s/` manifests |

---

## License

MIT License
