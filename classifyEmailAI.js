import fetch from "node-fetch";
import fs from "fs/promises";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
let cachedSystemPrompt = null;

async function loadPrompt() {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = await fs.readFile("agent_email_prompts.txt", "utf-8");
  }
  return cachedSystemPrompt;
}

// Funcție pentru trunchierea textului, să consumăm mai puțini tokeni
const truncate = (text, max = 200) =>
  text.length > max ? text.slice(0, max) + "..." : text;

// Lista validă de categorii
const validCategories = [
  "Urgente",
  "Joburi",
  "Cursuri",
  "Clienti",
  "ComenziServicii",
  "Newslettere",
  "DeIgnorat",
];

/**
 * Clasifică un email, evitând procesarea dacă există deja o etichetă validă.
 * @param {string} subject Subiect email
 * @param {string} from Expeditor email
 * @param {string} body Conținut email
 * @param {string|null} existingLabel Etichetă existentă (opțional)
 * @returns {string} Categoria emailului
 */
export default async function classifyEmailAI(
  subject,
  from,
  body = "",
  existingLabel = null
) {
  // Dacă există o etichetă validă deja, o returnăm direct fără apel API
  if (existingLabel && validCategories.includes(existingLabel)) {
    console.log(
      `⚡️ Email are deja etichetă validă: ${existingLabel}. Sărim peste clasificare.`
    );
    return existingLabel;
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error("⚠️ OPENROUTER_API_KEY lipsă în .env");
  }

  const systemPrompt = await loadPrompt();

  // Trunchiem conținutul emailului pentru a limita consumul de tokeni
  const shortBody = truncate(body, 200);

  const userMessage = `
Te rog să clasifici următorul email conform regulilor și exemplelor.

Subiect: "${subject}"
Expeditor: "${from}"
Conținut: "${shortBody}"

Răspunde DOAR cu una dintre aceste etichete exacte:
🔔 Urgente
💼 Joburi
🎓 Cursuri
👥 Clienti
📦 ComenziServicii
🧾 Newslettere
🗑️ DeIgnorat
`;

  const payload = {
    model: "mistralai/mistral-7b-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 30,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText} - ${errText}`
    );
  }

  const data = await response.json();
  const rawReply = data.choices?.[0]?.message?.content || "";
  const reply = rawReply.trim().toLowerCase();

  console.log("📥 Răspuns AI normalizat:", reply);

  const categoryMap = {
    "🔔 urgente": "Urgente",
    "💼 joburi": "Joburi",
    "👥 clienti": "Clienti",
    "📦 comenziservicii": "ComenziServicii",
    "🎓 cursuri": "Cursuri",
    "🧾 newslettere": "Newslettere",
    "🗑️ deignorat": "DeIgnorat",
  };

  const normalizedReply = reply
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "");

  for (const key in categoryMap) {
    const normKey = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "");

    if (normalizedReply === normKey) {
      return categoryMap[key];
    }
  }

  // Fallback sigur
  return "DeIgnorat";
}
