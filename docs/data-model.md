# QuickNotes Data Model

## Entities

**users**

| Column        | Type                         | Key |
| ------------- | ---------------------------- | --- |
| id            | BIGINT                       | PK  |
| email         | VARCHAR(255) UNIQUE NOT NULL |     |
| password_hash | VARCHAR(255) NOT NULL        |     |
| created_at    | TIMESTAMP                    |     |

**notes**

| Column                  | Type                  | Key           |
| ----------------------- | --------------------- | ------------- |
| id                      | BIGINT                | PK            |
| user_id                 | BIGINT NOT NULL       | FK → users.id |
| title                   | VARCHAR(100) NOT NULL |               |
| body                    | TEXT                  |               |
| created_at / updated_at | TIMESTAMP             |               |

**tags**

| Column  | Type                 | Key                    |
| ------- | -------------------- | ---------------------- |
| id      | BIGINT               | PK                     |
| user_id | BIGINT NOT NULL      | FK → users.id          |
| name    | VARCHAR(50) NOT NULL | UNIQUE (user_id, name) |

**note_tags** (join table)

| Column  | Type   | Key                      |
| ------- | ------ | ------------------------ |
| note_id | BIGINT | PK (part), FK → notes.id |
| tag_id  | BIGINT | PK (part), FK → tags.id  |

## Relationships

- **One-to-many:** one user has many notes (`notes.user_id → users.id`); one user also has many tags.
- **Many-to-many:** a note can have many tags and a tag can label many notes, resolved by the `note_tags` join table with a composite primary key.

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL,
  tag_id  BIGINT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
```

## Example queries

```sql
-- 1. Latest 10 notes for a user (page 1)
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- 2. JOIN: notes with their tag names for a user
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 1 AND t.name = 'work';

-- 3. Count notes per tag
SELECT t.name, COUNT(*) AS note_count
FROM tags t
JOIN note_tags nt ON nt.tag_id = t.id
WHERE t.user_id = 1
GROUP BY t.name;

-- 4. Delete a note owned by the user
DELETE FROM notes WHERE id = 101 AND user_id = 1;
```

## Index

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
```

**Reason:** the most common query lists one user's newest notes. Without this index the database scans every note; with it, it jumps to that user's rows already in date order. A second index on `note_tags (tag_id)` speeds up "notes by tag".

## SQL vs NoSQL

I chose **SQL (PostgreSQL/MySQL)**. The data is clearly relational (users, notes, tags and a many-to-many link), and foreign keys, unique constraints and transactions keep it consistent, for example deleting a user cleans up all their notes. The load (about 23 writes/s on average) is well within one primary database plus read replicas, so NoSQL's horizontal write scaling is not needed yet. If notes later grow into huge flexible documents, a document store could be added alongside.
