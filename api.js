// QuickNotes API client (practice backend: JSONPlaceholder)
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const list = document.getElementById("notes-list");

/* ---------- UI helpers ---------- */
function setStatus(message, type) {
  statusEl.textContent = message;          // textContent only
  statusEl.className = type || "";         // loading | success | error
}

function setBusy(busy) {                   // disable the load button while fetching
  loadBtn.disabled = busy;
}

function showEmptyState() {
  list.textContent = "";
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes to show. Click \"Load notes\" or add one.";
  list.appendChild(li);
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.className = "note";
  li.dataset.id = note.id;

  const h2 = document.createElement("h2");
  h2.textContent = note.title;             // user text via textContent
  const p = document.createElement("p");
  p.textContent = note.body || "";

  li.append(h2, p);
  return li;
}

/* ---------- Reusable request function ---------- */
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  // Parse defensively so empty bodies (204) don't crash
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}

/* ---------- GET: load 10 notes ---------- */
async function loadNotes() {
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    const { data } = await request(`${API_URL}?_limit=10`);
    list.textContent = "";
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyState();
      setStatus("The server returned no notes.", "success");
      return;
    }
    data.forEach((note) => list.appendChild(createNoteElement(note)));
    setStatus(`Loaded ${data.length} notes from the server.`, "success");
  } catch (error) {
    console.error(error);
    setStatus(
      "Sorry, we could not load your notes. Check your connection and try again.",
      "error"
    );
  } finally {
    setBusy(false);
  }
}

/* ---------- Wire up ---------- */
loadBtn.addEventListener("click", loadNotes);
showEmptyState();