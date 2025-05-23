const SUPABASE_URL = "https://zizkkhileflcroydfnrb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppemtraGlsZWZsY3JveWRmbnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDMxOTIsImV4cCI6MjA2MzUxOTE5Mn0.SRAaLgYcy3cLSmfGuNugurUg5TFUmk7lIDVCLHk9Vlk";

const chatEl = document.getElementById("chat");
const messageInput = document.querySelector("textarea");
const sendBtn = document.getElementById("send-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

function updateThemeIcon() {
  if (document.body.classList.contains("light-mode")) {
    // Sonne
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#651fff" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" />
        <g stroke="#651fff" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
        </g>
      </svg>`;
  } else {
    // Mond
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#b39ddb" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
      </svg>`;
  }
}

// Theme toggeln und lokal speichern
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  updateThemeIcon();
  localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

// Lade Theme aus localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
  updateThemeIcon();
}

// Nachrichten laden
async function loadMessages() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.desc`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await res.json();

    // Filter: nur Nachrichten jünger als 24h
    const now = new Date();
    const filtered = data.filter(msg => {
      const created = new Date(msg.created_at);
      return (now - created) < 24 * 60 * 60 * 1000;
    });

    // Chatbereich leeren
    chatEl.innerHTML = "";

    // Nachrichten anzeigen (neueste unten)
    filtered.reverse().forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("msg");
      div.innerHTML = `
        <p>${escapeHtml(msg.text)}</p>
        <small>${new Date(msg.created_at).toLocaleString()}</small>
      `;
      chatEl.appendChild(div);
    });

    // Scroll ganz nach unten
    chatEl.scrollTop = chatEl.scrollHeight;

  } catch (error) {
    console.error("Fehler beim Laden der Nachrichten:", error);
  }
}

// Nachricht senden
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  sendBtn.disabled = true;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ text }),
    });
    messageInput.value = "";
    loadMessages();
  } catch (error) {
    console.error("Fehler beim Senden:", error);
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Hilfsfunktion für sichere Ausgabe
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Event-Listener
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
themeToggleBtn.addEventListener("click", toggleTheme);

// Initial
loadTheme();
loadMessages();
setInterval(loadMessages, 10000); // alle 10 Sekunden aktualisieren
