<p align="center">
  <img src="https://raw.githubusercontent.com/ShikiHTM/ShikiHTM/main/.github/images/win_variation.png" width="400" alt="Project Logo">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js" alt="Node Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TS Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma" alt="Prisma"></a>
  <a href="#"><img src="https://img.shields.io/badge/pnpm-9.x-F69220?style=flat&logo=pnpm" alt="pnpm"></a>
</p>

## Project Overview

**Quolifa API** is a robust backend service designed for a room rental and management platform (Final Term Project). The system facilitates seamless interactions between three primary stakeholders:

* **User (Renter):** Search for rooms, view details, and manage bookings.
* **Host (Provider):** Post room listings, manage availability, and handle tenant requests.
* **Admin (Moderator):** Oversee the entire platform, manage users, verify listings, and handle system configurations.

---

## Key Features

### For Users
- Browsing and filtering rooms by location, price, and amenities.
- Real-time room availability checking.
- Booking management and history.

### For Hosts
- Dashboard to manage multiple room listings.
- Image uploads via Cloudinary integration.
- Booking request approval and management.

### For Admins
- User and Host account management.
- Content moderation (verifying room listings).
- Platform analytics and reporting.

---

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **File Storage:** Cloudinary
- **Containerization:** Docker & Docker Compose
- **Package Manager:** pnpm

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- **pnpm** (`npm install -g pnpm`)
- Docker & Docker Compose (required for the full stack: Postgres, RabbitMQ, Meilisearch, nginx, Cloudflare Tunnel)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ShikiHTM/rental_room_api.git
cd rental_room_api

# Install dependencies
pnpm install
```

### 3. Environment Setup

> **Note:** `.env` is gitignored, so every developer must create their own. The Docker Compose stack reads from `.env` directly — without it, services will fail to start.

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Variables you'll need to set:

-   **Database (app-side):** `DATABASE`, `DATABASE_HOST`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_PORT`, `DATABASE_NAME`
-   **Database (Postgres container):** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — should match the app-side credentials
-   **Auth:** `JWT_SECRET` (leave blank to use the fallback, not recommended for production)
-   **Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`
-   **RabbitMQ:** `RABBITMQ_USER` / `RABBITMQ_PASSWORD` (container admin) and `RABBITMQ_NAME` / `RABBITMQ_PASS` / `RABBITMQ_PORT` (app connection — typically the same user/pass)
-   **Meilisearch:** `MEILISEARCH_API_KEY` (the master key)
-   **Cloudflare Tunnel:** `CLOUDFLARE_TUNNEL_TOKEN` (only if you're running the `cloudflared` service)
-   **Mail:** `MAIL_*` block for outgoing email
-   `FRONTEND_URL` — comma-separated list of allowed CORS origins

### 4. Running with Docker (recommended)

The full stack (backend, Postgres, RabbitMQ, Meilisearch, nginx, frontend, admin, Cloudflare Tunnel) is orchestrated via `docker-compose.yml`:

```bash
docker compose up -d --build
```

The backend container runs Prisma migrations on startup. To run them manually:

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Running locally without Docker

If you'd rather run the Node process directly (you'll still need Postgres, RabbitMQ, and Meilisearch available — point your `.env` at them):

```bash
# Apply migrations
npx prisma migrate dev --name init

# Development mode
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Project Structure

```txt
Backend/
├── config/             # System configurations (JWT, Cloudinary, DB)
├── controllers/        # Request handlers for each actor (Admin, Auth, Booking, Room)
├── Database/
│   ├── Migrations/     # Prisma migration history
│   └── Schema/         # Prisma schema definitions
├── routes/             # API Route definitions
├── services/           # Business logic layer
├── Utils/              # Helper functions (Cloudinary, formatters)
└── index.ts            # Entry point
```

## License
This project is open-source and licensed under the MIT License.