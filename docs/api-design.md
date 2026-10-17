# QuickNotes API Design

Base URL: `https://api.quicknotes.example/v1` · Format: JSON · Auth: `Authorization: Bearer <token>`

## Endpoints

| Method | Path                              | Description                                                      | Success status |
| ------ | --------------------------------- | ---------------------------------------------------------------- | -------------- |
| GET    | `/notes?limit=10&page=1&tag=work` | List the signed-in user's notes (paginated, optional tag filter) | 200 OK         |
| POST   | `/notes`                          | Create a note                                                    | 201 Created    |
| GET    | `/notes/{id}`                     | Get one note                                                     | 200 OK         |
| PUT    | `/notes/{id}`                     | Replace a note's title/body/tags                                 | 200 OK         |
| DELETE | `/notes/{id}`                     | Delete a note                                                    | 204 No Content |
| GET    | `/tags`                           | List the user's tags                                             | 200 OK         |
| POST   | `/notes/{id}/tags`                | Attach a tag to a note                                           | 201 Created    |
| DELETE | `/notes/{id}/tags/{tagId}`        | Remove a tag from a note                                         | 204 No Content |

## Create a note

`POST /notes`

```json
{ "title": "Buy milk", "body": "2 litres, full fat", "tags": ["home"] }
```

Response `201 Created` (with `Location: /v1/notes/101`):

```json
{
  "id": 101,
  "title": "Buy milk",
  "body": "2 litres, full fat",
  "tags": ["home"],
  "userId": 1,
  "createdAt": "2026-10-17T09:30:00Z",
  "updatedAt": "2026-10-17T09:30:00Z"
}
```

## List notes

`GET /notes?limit=2&page=1` → `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "title": "Buy milk",
      "body": "2 litres, full fat",
      "tags": ["home"],
      "createdAt": "2026-10-17T09:30:00Z"
    },
    {
      "id": 100,
      "title": "Call Sam",
      "body": "",
      "tags": [],
      "createdAt": "2026-10-16T18:02:00Z"
    }
  ],
  "page": 1,
  "limit": 2,
  "total": 37
}
```

## Error codes

| Status                    | Meaning in QuickNotes                                                              |
| ------------------------- | ---------------------------------------------------------------------------------- |
| 400 Bad Request           | Invalid JSON or validation failure (e.g. missing title, title over 100 characters) |
| 401 Unauthorized          | Missing, invalid or expired token                                                  |
| 403 Forbidden             | Valid user, but the note belongs to someone else                                   |
| 404 Not Found             | Note or tag does not exist                                                         |
| 500 Internal Server Error | Unexpected server fault                                                            |

Example error body (`400`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required and must be at most 100 characters",
    "details": [{ "field": "title", "issue": "required" }]
  }
}
```

## Design notes

- Nouns in paths, verbs in HTTP methods; plural resource names; stateless requests.
- Pagination (`page`, `limit`) keeps list responses small.
- Versioned under `/v1` so breaking changes can ship as `/v2`.
