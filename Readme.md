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

## License

MIT License
