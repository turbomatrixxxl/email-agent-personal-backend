// import pkg from "whatsapp-web.js";
// import puppeteer from "puppeteer";

// const { Client, LocalAuth } = pkg;

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: false,
//     executablePath: puppeteer.executablePath(),
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     takeoverOnConflict: true,
//     dumpio: true,
//   },
// });

// client.on("loading_screen", (percent, message) => {
//   console.log(`⚙️ Loading: ${percent}% - ${message}`);
// });

// client.on("qr", (qr) => {
//   console.log("📱 QR code received, scan it with WhatsApp mobile app.");
// });

// client.on("ready", async () => {
//   console.log("✅ WhatsApp client is ready!");

//   const number = "40771392871"; // pune aici numărul țintă fără @c.us
//   const chatId = `${number}@c.us`;

//   try {
//     console.log("⏳ Waiting 3 seconds before sending test message...");
//     await delay(3000);
//     await client.sendMessage(chatId, "Test mesaj scurt cu delay 🚀");
//     console.log("✅ Test message sent successfully!");
//     process.exit(0); // opțional: închide scriptul după trimitere
//   } catch (error) {
//     console.error("❌ Error sending WhatsApp message:", error);
//     process.exit(1);
//   }
// });

// client.on("auth_failure", (msg) => {
//   console.error("❌ Authentication failure:", msg);
// });

// client.on("disconnected", (reason) => {
//   console.warn("⚠️ Client disconnected:", reason);
// });

// client.initialize();

// import pkg from "whatsapp-web.js";
// import puppeteer from "puppeteer";

// const { Client, LocalAuth } = pkg;

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: false,
//     executablePath: puppeteer.executablePath(),
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     takeoverOnConflict: true,
//     dumpio: true,
//   },
// });

// // Event listener minimal, doar pentru erori și QR
// client.on("qr", (qr) => console.log("📱 QR primit, scanează cu telefonul."));
// client.on("auth_failure", (msg) => console.error("❌ Auth failed:", msg));
// client.on("disconnected", (reason) => console.warn("⚠️ Deconectat:", reason));

// // Initialize client
// client.initialize();

// // După 15 secunde (suficient să se conecteze), trimitem mesaj
// (async () => {
//   console.log("⏳ Aștept 15 secunde înainte de a trimite mesajul...");
//   await delay(15000);

//   const number = "40771392871"; // număr țintă, fără @c.us
//   const chatId = `${number}@c.us`;
//   try {
//     await client.sendMessage(chatId, "Mesaj direct, fără wait ready 🚀");
//     console.log("✅ Mesaj trimis cu succes!");
//   } catch (e) {
//     console.error("❌ Eroare la trimiterea mesajului:", e);
//   }
//   process.exit(0);
// })();

import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer";

const { Client, LocalAuth } = pkg;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    takeoverOnConflict: true,
    dumpio: true,
  },
});

client.on("qr", (qr) => console.log("📱 QR primit, scanează cu telefonul."));
client.on("authenticated", () => console.log("🔐 Client autentificat."));
client.on("auth_failure", (msg) =>
  console.error("❌ Autentificare eșuată:", msg)
);
client.on("disconnected", (reason) => console.warn("⚠️ Deconectat:", reason));
client.on("ready", () => console.log("✅ WhatsApp client este gata."));
client.on("loading_screen", (percent, message) =>
  console.log(`🔄 Loading: ${percent}% - ${message}`)
);

client.on("ready", async () => {
  console.log("✅ WhatsApp client este gata.");

  const number = "40771392871"; // număr țintă fără @c.us
  const chatId = `${number}@c.us`;

  try {
    console.log("⏳ Aștept 3 secunde înainte de trimitere...");
    await delay(3000);
    await client.sendMessage(chatId, "Mesaj trimis după ready și delay 🚀");
    console.log("✅ Mesaj trimis cu succes!");
    // process.exit(0);
  } catch (e) {
    console.error("❌ Eroare la trimiterea mesajului:", e);
    process.exit(1);
  }
});

client.initialize();
