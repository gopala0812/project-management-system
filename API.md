# API Documentation

Base URL: `http://localhost:4000/api`

Use `Authorization: Bearer <token>` for all protected endpoints.

## Authentication

### POST `/auth/register`

Body:

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "password123"
}
```

Returns a public user object and JWT token.

### POST `/auth/login`

Body:

```json
{
  "email": "ada@example.com",
  "password": "password123"
}
```

### POST `/auth/logout`

Protected. The API is stateless, so clients remove the stored token.

### GET `/auth/me`

Protected. Returns the authenticated user.

## Dashboard

### GET `/dashboard`

Protected. Returns:

```json
{
  "totalProjects": 2,
  "totalTasks": 5,
  "completedTasks": 1,
  "pendingTasks": 3,
  "projectsInProgress": 1
}
```

## Projects

### GET `/projects`

Protected. Query parameters:

- `search`
- `status`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- `page`
- `limit`
- `sortBy`: `name`, `status`, `startDate`, `endDate`, `createdAt`
- `sortOrder`: `asc`, `desc`

### GET `/projects/:id`

Protected. Returns one owned project with tasks.

### POST `/projects`

Protected. Body:

```json
{
  "name": "Website Refresh",
  "description": "Update public website",
  "status": "IN_PROGRESS",
  "startDate": "2026-06-01",
  "endDate": "2026-07-01"
}
```

### PUT `/projects/:id`

Protected. Accepts partial project fields.

### DELETE `/projects/:id`

Protected. Deletes an owned project and cascades its tasks.

## Tasks

### GET `/tasks`

Protected. Query parameters:

- `search`
- `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `projectId`
- `page`
- `limit`
- `sortBy`: `name`, `status`, `priority`, `dueDate`, `createdAt`
- `sortOrder`: `asc`, `desc`

### GET `/tasks/:id`

Protected. Returns one owned task.

### POST `/tasks`

Protected. Body:

```json
{
  "projectId": "project_id",
  "name": "Write API docs",
  "description": "Document required endpoints",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-06-30"
}
```

### PUT `/tasks/:id`

Protected. Accepts partial task fields. Set `status` to `COMPLETED` to mark a task completed.

### DELETE `/tasks/:id`

Protected. Deletes an owned task.
