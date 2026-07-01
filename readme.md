# FlashBurst ⚡
### High-Concurrency Multi-Tenant Flash Sale Engine

FlashBurst is an enterprise-grade, multi-tenant e-commerce backend engine built with Laravel 13, Inertia.js, and React. It is architected specifically to handle catastrophic traffic spikes (e.g., 1,000+ concurrent requests per second) during localized tenant flash sales without drowning the relational database infrastructure.

---

## 🏗️ Architectural Overview

In a typical multi-tenant application, a viral flash sale on a single tenant can cause database lock contention, freezing operations for all other tenants on the shared infrastructure. FlashBurst eliminates this bottleneck by offloading the high-traffic gatekeeping layer to Redis memory spaces isolated by tenant contexts.

```text
[Incoming Request]
│
▼
[Tenant Routing] ──► [Auth & Form Validation]
│
▼
[Redis High-Speed Gate]
Key: "tenant:{id}:product:{id}:stock"
│
(If Stock Decoupled)
│
▼
[Laravel Queue System]
Job: ProcessFlashSaleOrder
│
▼
[Relational Database]
Row updated smoothly off-peak
```

### Key Technical Implementations:

Atomic Inventory Gates: Leverages atomic operations (Redis::decr) at the front door to guarantee exact stock control before requests ever touch a database connection pool.

Decoupled Database Persistence: Validated orders are immediately pushed to background queues, keeping HTTP response times under 15ms even during extreme concurrency.

Worker Optimization: Uses memory-based race-condition blocks instead of database-level table row locks (lockForUpdate), preventing background workers from idling or timing out.

Strict Multi-Tenancy Boundary: All high-performance caching structures, database layers, and queue contexts are segmented explicitly using global tenant scoping middleware (tenant:{tenant_id}:*).

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology |
|---|---|
| Backend Framework | Laravel 13 (PHP 8.3+) |
| Multi-Tenancy | Spatie Laravel Multitenancy |
| Frontend SPA Engine | Inertia.js with React (TypeScript) |
| State & Cache Layers | Redis (Atomic execution tokens) |
| Styling & UI | Tailwind CSS & Lucide Icons |
| Containerization | Docker (Nginx, MySQL 8.0, Redis, phpMyAdmin) |
| Stress Testing Layer | Apache JMeter / Guzzle HTTP Core |

---

## 🚀 Installation & Local Setup

### Prerequisites

- Docker & Docker Compose installed on your machine

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-profile/flashburst.git
cd flashburst
cp .env.example .env
```

Update your `.env` to use the Docker service hostnames:
```env
DB_CONNECTION=mysql
DB_HOST=saas_mysql
DB_PORT=3306
DB_DATABASE=saas_landlord
DB_USERNAME=root
DB_PASSWORD=root

CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=saas_redis
REDIS_PORT=6379
```

### 2. Start Docker Containers
```bash
sudo docker compose up -d
```

This spins up the following services:

| Service | Container | Host Port |
|---|---|---|
| Laravel App (PHP + Node) | `saas_app` | `5173` (Vite HMR) |
| Nginx Web Server | `saas_nginx` | `4000` |
| MySQL 8.0 | `saas_mysql` | `3304` |
| phpMyAdmin | `saas_phpmyadmin` | `4001` |
| Redis | `saas_redis` | `6379` |

### 3. Install Dependencies & Migrate
```bash
sudo docker compose exec app composer install
sudo docker compose exec app npm install
sudo docker compose exec app php artisan migrate:fresh --seed
```

### 4. Start the Dev Server
```bash
sudo docker compose exec app npm run dev
```

The application will be accessible at `http://localhost:4000`.

### 5. Activating Concurrency Workers
Open a dedicated terminal to monitor incoming high-volume jobs:
```bash
sudo docker compose exec app php artisan queue:work --queue=high,default
```

---

## 📊 Simulating 1,000 Concurrent Requests

To view the system under stress, navigate to the "Run Simulation" interface inside the custom administration dashboard panel.

The dashboard fires a load-test script that hits the route concurrently.

### The Success Matrix Look-Ahead:

The Request Influx: 1,000 incoming requests are verified for token authorization and evaluated simultaneously.

The Front Gate Filter: Redis decrements the real-time stock key down to zero instantly. 950 excess orders are rejected with high-speed 422 Unprocessable Entity payloads without consuming MySQL connection limits.

The Data Integrity Verification: The remaining 50 valid purchases are queued smoothly. Check your database tables post-run to confirm that database inventory state matches stock deductions perfectly with 0% over-selling.