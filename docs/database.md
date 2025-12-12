# Database Schema

## Overview

The application uses PostgreSQL 15+ as its database. The schema consists of two main tables: `people` and `gifts`.

## Entity Relationship Diagram

```mermaid
erDiagram
    PEOPLE ||--o{ GIFTS : has
    PEOPLE {
        uuid id PK
        text name
        timestamp created_at
    }
    GIFTS {
        uuid id PK
        uuid person_id FK
        text title
        text description
        boolean is_selected
        timestamp created_at
    }
```

## Tables

### people

Stores information about people on the gift list.

| Column     | Type      | Constraints           | Description        |
| ---------- | --------- | --------------------- | ------------------ |
| id         | UUID      | PRIMARY KEY, NOT NULL | Unique identifier  |
| name       | TEXT      | NOT NULL              | Person's name      |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Creation timestamp |

**Indexes:**

- Primary key on `id`

### gifts

Stores gift ideas for each person.

| Column      | Type      | Constraints                       | Description                    |
| ----------- | --------- | --------------------------------- | ------------------------------ |
| id          | UUID      | PRIMARY KEY, NOT NULL             | Unique identifier              |
| person_id   | UUID      | FOREIGN KEY (people.id), NOT NULL | Reference to person            |
| title       | TEXT      | NOT NULL                          | Gift title                     |
| description | TEXT      | NOT NULL                          | Gift description               |
| is_selected | BOOLEAN   | NOT NULL, DEFAULT FALSE           | Whether this is the final gift |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT NOW             | Creation timestamp             |

**Indexes:**

- Primary key on `id`
- Index on `person_id` (for faster lookups)
- Index on `is_selected` (for filtering selected gifts)

**Foreign Keys:**

- `person_id` references `people(id)` with ON DELETE CASCADE

## Migrations

Migrations are located in `backend/migrations/` and use the golang-migrate tool.

### Running Migrations

```bash
# Using Make
make migrate

# Manually
cd backend && ./scripts/migrate.sh
```

### Creating New Migrations

```bash
cd backend/migrations
# Create up and down migration files
touch 002_migration_name.up.sql
touch 002_migration_name.down.sql
```

## Seeding

Sample data can be seeded using the seed script:

```bash
# Using Make
make seed

# Manually
cd backend && go run scripts/seed.go
```

The seed script creates:

- 4 sample people (Santa Claus, Mrs. Claus, Rudolph, Frosty)
- 3 gift ideas for each person

## Database Configuration

Connection string format:

```
postgres://username:password@host:port/database?sslmode=disable
```

Default (Docker):

```
postgres://postgres:postgres@localhost:5432/christmas_gifts?sslmode=disable
```

Set via environment variable:

```bash
export DATABASE_URL="your-connection-string"
```

## Reset Database

To completely reset the database:

```bash
make db-reset
make migrate
make seed
```
