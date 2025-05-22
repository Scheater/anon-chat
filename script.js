const SUPABASE_URL = "https://zizkkhileflcroydfnrb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppemtraGlsZWZsY3JveWRmbnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDMxOTIsImV4cCI6MjA2MzUxOTE5Mn0.SRAaLgYcy3cLSmfGuNugurUg5TFUmk7lIDVCLHk9Vlk";

const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Prüfe, ob User schon ein Theme gespeichert hat
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.classList.toggle("light", savedTheme === "light");
  updateIcon(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const isLight = body.classList.toggle("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  updateIcon(isLight ? "light" : "dark");
});

function updateIcon(theme) {
  const svg = document.getElementById("icon");
  if (theme === "light") {
    // Mond-Symbol (einfach Sonne verstecken & Mond anzeigen)
    svg.innerHTML = `
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>
    `;
  } else {
    // Sonne Symbol
    svg.innerHTML = `
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    `;
  }
}

// Chat Funktionen

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const textarea = document.getElementById("message");
  const text = textarea.value.trim();
  if (!text) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ text })
    });
    textarea.value = "";
    loadMessages();
  } catch (error) {
    console.error("Fehler beim Senden:", error);
  }
}

async function loadMessages() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    const now = new Date();
    const messages = data
      .filter(msg => {
        const created = new Date(msg.created_at);
        const age = (now - created) / (1000 * 60 * 60); // Stunden
        return age < 24;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (const msg of messages) {
      const div = document.createElement("div");
      div.className = "message";
      div.innerHTML = `<p>${escapeHtml(msg.text)}</p><small>${new Date(msg.created_at).toLocaleString()}</small>`;
      chat.appendChild(div);
    }
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

// Escape HTML, damit keine Scripts reinkommen
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace
