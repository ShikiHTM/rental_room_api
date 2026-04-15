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

**Rental Room API** is a robust backend service designed for a room rental and management platform (Final Term Project). The system facilitates seamless interactions between three primary stakeholders:

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
- Docker (optional, for database)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ShikiHTM/rental_room_api.git
cd rental_room_api

# Install dependencies
pnpm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Make sure to configure:

-   `DATABASE_CONNECTION`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` for Database
-   `JWT_SECRET` or you can just let it blank, for JWT Token
-   `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` for cloudinary cloud image service

### 4. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev --name init
```

### 5. Running the application

```bash
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