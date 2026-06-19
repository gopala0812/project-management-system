# Project Management System

A full-stack project and task management application with React, Express, PostgreSQL, Prisma, JWT authentication, bcrypt password hashing, request validation, rate limiting, and user-scoped authorization.

## Features

- Register, login, logout, and persistent JWT sessions
- Create, edit, delete, search, filter, and view projects
- Create, edit, delete, search, filter, and complete tasks
- Dashboard statistics scoped to the authenticated user
- Protected REST APIs with ownership checks
- PostgreSQL relational schema with foreign keys and cascade deletes
- Bonus support for pagination and sorting

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Security: bcryptjs, JWT, Helmet, CORS, Zod validation, auth rate limiting

## Setup

Install dependencies:

```bash
npm install
npm run install:all
```

Create server environment file:

```bash
cp server/.env.example server/.env
```

Update `server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_management?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CLIENT_ORIGIN="http://localhost:5173"
PORT=4000
```

Create the PostgreSQL database manually:

```sql
CREATE DATABASE project_management;
```

Or start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

Push the schema and generate Prisma client:

```bash
npm run db:push --prefix server
npm run prisma:generate --prefix server
```

Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000/api`

## Environment Variables

Server:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: secret used to sign JWTs
- `JWT_EXPIRES_IN`: token lifetime, for example `7d`
- `CLIENT_ORIGIN`: allowed frontend origin for CORS
- `PORT`: API server port

Client:

- `VITE_API_URL`: API base URL, defaults to `http://localhost:4000/api`

## Security Notes

- Passwords are hashed with bcrypt before storage.
- API responses never include password hashes.
- Protected routes require JWT authentication.
- Project and task queries include the authenticated user's id.
- Task creation and reassignment verifies ownership of the target project.
- Inputs are validated with Zod.
- Prisma ORM is used instead of raw SQL to reduce SQL injection risk.
- Authentication endpoints are rate-limited.

## Documentation

- API documentation: [API.md](./API.md)
- Database schema and ER diagram: [DATABASE.md](./DATABASE.md)

## Links

- Deployment URL: https://project-management-system-psi-one.vercel.app/

