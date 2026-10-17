# QuickNotes System Design

QuickNotes is moving from a browser-only app to an online service for 1 million users. This repository has two parts: a small front-end **API client** that talks to the JSONPlaceholder practice API (GET, POST, DELETE), and the **design documents** the backend team will build from.

## How to run the API client

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdijabir21Ali/quicknotes-system-design.git
   cd quicknotes-system-design
   ```
2. Open `index.html` in a browser (double-click it, or run `npx serve .` / VS Code Live Server).
3. Click **Load notes** to fetch 10 notes, use the form to add a note, and use **Delete** on any note.

Note: JSONPlaceholder does not store changes, so created and deleted notes only exist on the page until you reload.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- `fetch` does not throw on HTTP errors, so a reusable `request()` must check `response.ok` and throw itself.
- Showing loading, success, error and empty states, and disabling buttons during requests, makes an interface feel reliable and prevents double submits.
- Using `textContent` instead of `innerHTML` keeps user text from running as HTML (XSS protection).
- A good REST API uses nouns in paths, correct status codes (201, 204, 400, 401, 403, 404) and consistent error bodies.
- Designing for scale means estimating load first, then adding caches, replicas, queues and redundancy to remove single points of failure.
