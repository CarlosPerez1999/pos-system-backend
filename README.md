# 🧾 PΩS System API (NestJS + PostgreSQL)

A RESTful API for product management in a Point of Sale system. Built with **NestJS**, **PostgreSQL**, and documented with **Swagger**. Currently under development.

---

## 🚧 Project Status

🔨 In progress — features implemented:

- [✔️] Products module
- [✔️] Sales module
- [✔️] Inventories module
- [✔️] Users module
- [✔️] Authentication with JWT
- [✔️] Route protection with AuthGuard
- [✔️] Automatic Admin Seeding

📝 Upcoming tasks:

- [ ] Role-based access control (@Roles(), RolesGuard) - _Partially implemented_
- [ ] /me endpoint for authenticated user profile

---

## 🚀 Technologies

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Swagger
- class-validator
- Passport / JWT

---

## ⚙️ Environment Configuration

Create a `.env` file at the root of the project.

**Development (`.env`):**

```env
DB_HOST=postgres
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=posdb
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Production (`.env`):**

```env
DB_HOST=postgres
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=posdb_prod
PORT=3000
JWT_SECRET=complex_secure_secret
NODE_ENV=production
```

---

## 🛠️ Installation & Running

### 🐳 Using Docker (Recommended)

**Development:**

```bash
# Starts API and DB with hot-reload
docker-compose up --build
```

**Production:**

```bash
# Starts optimized API and DB for production
docker-compose -f docker-compose.prod.yml up --build -d
```

### 💻 Local (Without Docker)

```bash
# Install dependencies
pnpm install

# Run in development
pnpm run start:dev

# Build and run in production
pnpm run build
pnpm run start:prod
```

### 🔐 Automatic Admin Seeding

When the application starts, if no users exist in the database, a default admin user is created automatically:

- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** `ADMIN`

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
