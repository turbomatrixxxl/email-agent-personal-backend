import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer";

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    dumpio: true,
  },
});

client.on("qr", () => console.log("📱 QR primit, scanează-l."));
client.on("authenticated", () => console.log("🔐 Autentificat!"));
client.on("ready", () => console.log("✅ Client gata!"));
client.on("auth_failure", (msg) =>
  console.error("❌ Eroare autentificare:", msg)
);
client.on("loading_screen", (percent, msg) =>
  console.log(`🔄 Încarcă: ${percent}% - ${msg}`)
);
client.on("disconnected", (reason) => console.warn("⚠️ Deconectat:", reason));

client.initialize();
