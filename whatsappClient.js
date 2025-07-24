// import pkg from "whatsapp-web.js";
// import qrcode from "qrcode";
// import fs from "fs";
// import path from "path";
// import puppeteer from "puppeteer";
// const { executablePath } = puppeteer;

// import { sendQrCodeEmail } from "./utils/emailService.js";

// const { Client, LocalAuth } = pkg;

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: true, // schimbi în true pe server
//     executablePath: executablePath(),
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     takeoverOnConflict: true,
//     dumpio: true,
//   },
// });

// client.on("qr", async (qr) => {
//   console.log("📱 QR primit. Se generează imagine...");

//   const qrImagePath = path.resolve("qr-code.png");

//   try {
//     await qrcode.toFile(qrImagePath, qr, {
//       width: 250, // sau 600 pentru siguranță
//       margin: 2,
//       errorCorrectionLevel: "H", // high quality
//     });

//     console.log("✅ QR salvat ca qr-code.png");

//     await new Promise((res) => setTimeout(res, 500)); // așteaptă 0.5 secunde
//     await sendQrCodeEmail(qrImagePath); // ✅ trimite calea fișierului
//     console.log("✅ Email cu QR trimis cu succes!");
//   } catch (err) {
//     console.error("❌ Eroare la generarea sau trimiterea QR-ului:", err);
//   }
// });

// client.on("ready", () => {
//   console.log("✅ WhatsApp client is ready!");
// });

// client.on("authenticated", () => {
//   console.log("✅ WhatsApp autentificat!");
// });

// client.on("auth_failure", (msg) => {
//   console.error("❌ Autentificare eșuată:", msg);
// });

// client.on("disconnected", (reason) => {
//   console.warn("⚠️ Deconectat:", reason);
// });

// client.initialize();

// export default client;

import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
const { executablePath } = puppeteer;

import { sendQrCodeEmail } from "./utils/emailService.js";

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // schimbă în false local dacă vrei debug
    executablePath: executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    takeoverOnConflict: true,
    dumpio: true,
  },
});

let qrSent = false; // ✅ flag pentru prevenire spam QR email

client.on("qr", async (qr) => {
  if (qrSent) {
    console.log("📭 QR deja trimis, nu retrimitem.");
    return;
  }

  console.log("📱 QR primit. Se generează imagine...");

  const qrImagePath = path.resolve("qr-code.png");

  try {
    await qrcode.toFile(qrImagePath, qr, {
      width: 250,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    console.log("✅ QR salvat ca qr-code.png");

    await new Promise((res) => setTimeout(res, 500));
    await sendQrCodeEmail(qrImagePath);
    console.log("📤 Email cu QR trimis cu succes!");

    qrSent = true; // ✅ NU se mai retrimite
  } catch (err) {
    console.error("❌ Eroare la generarea sau trimiterea QR-ului:", err);
  }
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
});

client.on("authenticated", () => {
  console.log("✅ WhatsApp autentificat!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Autentificare eșuată:", msg);
});

client.on("disconnected", (reason) => {
  console.warn("⚠️ Deconectat:", reason);
  qrSent = false; // 🔁 resetează dacă e nevoie din nou de QR
});

client.initialize();

export default client;
