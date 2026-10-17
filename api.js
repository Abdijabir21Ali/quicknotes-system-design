// QuickNotes API client (practice backend: JSONPlaceholder)
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE = 100;

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const list = document.getElementById("notes-list");

/* ---------- UI helpers ---------- */
function setStatus(message, type) {
  statusEl.textContent = message;          // textContent only
  statusEl.className = type || "";         // loading | success | error
}

function setBusy(busy) {                   // disable buttons while requests run
  loadBtn.disabled = busy;
  submitBtn.disabled = busy;
}

function showEmptyState() {
  list.textContent = "";
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes to show. Click \"Load notes\" or add one.";
  list.appendChild(li);
}

function removeEmptyState() {
  const empty = list.querySelector(".empty");
  if (empty) empty.remove();
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

/* ---------- POST: create a note ---------- */
function validateTitle(title) {
  if (!title) return "Please enter a title.";
  if (title.length > MAX_TITLE) return `Title must be ${MAX_TITLE} characters or fewer.`;
  return null;
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  const problem = validateTitle(title);
  if (problem) {
    setStatus(problem, "error");
    titleInput.focus();
    return;
  }

  setBusy(true);
  setStatus("Saving note...", "loading");
  try {
    const { status, data } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    removeEmptyState();
    // Insert the server-returned note at the top of the list
    list.prepend(createNoteElement({ id: data.id, title: data.title, body: data.body }));

    setStatus(`Note created (status ${status}, id ${data.id}).`, "success");
    form.reset();                          // clear the form afterwards
    titleInput.focus();
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we could not save your note. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

/* ---------- Wire up ---------- */
loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);
showEmptyState();