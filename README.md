# 🧾 PΩS System API (NestJS + PostgreSQL)

A RESTful API for product management in a Point of Sale system. Built with **NestJS**, **PostgreSQL**, and documented with **Swagger**. Currently under development.

---

## 🚧 Project Status

🔨 In progress — initial features implemented:

- [✔️] Products module
- [✔️] Sales module
- [✔️] Inventories module
- [ ] Users module

📝 Upcoming tasks:

- [ ] Authentication with JWT
- [ ] Role-based access control (@Roles(), RolesGuard)
- [ ] /me endpoint for authenticated user profile
- [ ] Route protection with AuthGuard
- [ ] Token expiration handling and error responses

Frontend Tasks (Next Phase)

- [ ] Design main views (login, dashboard, products, sales, inventory, users)
- [ ] Connect frontend to backend via REST API
- [ ] Manage session and JWT storage
- [ ] Role-based UI guards (redirects, conditional rendering)
- [ ] Apply branding: logo, colors, typography, favicon
- [ ] Build dashboard with key metrics
- [ ] Implement pagination, filters, and form validations

📦 Future Enhancements

- [ ] Export reports (PDF, Excel)
- [ ] Stock alerts and sales notifications

---

## 🚀 Technologies

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Swagger
- class-validator

---

## 📦 Requirements

- Node.js >= 18
- npm or pnpm
- Docker (optional, recommended for database)
- PostgreSQL (if not using Docker)

---

## ⚙️ Environment Configuration

Create a `.env` file at the root of the project with the required variables. Minimal example:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=secret
DB_NAME=pos_db
```

---

## 🛠️ Installation

```bash
# Clone the repository
git clone
cd pos-api

# Install dependencies
pnpm install

# Docker container with database
docker-compose up -d
```

---

## 🧪 Running the App

```bash
# Development (hot-reload)
npm run start:dev

# Production (build and run)
npm run build
npm run start:prod
```

---

## 📚 Swagger Documentation

Swagger available at:

```
http://localhost:3000/api
```

(Ensure the app is running and `PORT` matches.)

---

## 📁 Current Project Structure

```
src/
├── common/
│   └── dto/
│       ├── pagination.dto.ts
│       └── paginated-response.dto.ts
├── products/
│   ├── dto/
│   ├── entities/
│   ├── products.controller.ts
│   └── products.service.ts
└── main.ts
```

---

## 🧠 Author

**Carlos Alfredo Pérez Hernández** — Computer Systems Engineer

---
