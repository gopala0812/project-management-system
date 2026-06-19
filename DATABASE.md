# Database Schema

The application uses PostgreSQL through Prisma ORM. All data is scoped by `ownerId` so users can only access their own projects and tasks.

```mermaid
erDiagram
  users ||--o{ projects : owns
  users ||--o{ tasks : owns
  projects ||--o{ tasks : contains

  users {
    string id PK
    string fullName
    string email UK
    string passwordHash
    datetime createdAt
    datetime updatedAt
  }

  projects {
    string id PK
    string name
    string description
    enum status
    datetime startDate
    datetime endDate
    datetime createdAt
    datetime updatedAt
    string ownerId FK
  }

  tasks {
    string id PK
    string name
    string description
    enum priority
    enum status
    datetime dueDate
    datetime createdAt
    datetime updatedAt
    string projectId FK
    string ownerId FK
  }
```

Enums:

- `ProjectStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- `TaskStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`
