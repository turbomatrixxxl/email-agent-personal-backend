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
    headless: false, // schimbi în true pe server
    executablePath: executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    takeoverOnConflict: true,
    dumpio: true,
  },
});

client.on("qr", async (qr) => {
  console.log("📱 QR primit. Se generează imagine...");

  const qrImagePath = path.resolve("qr-code.png");

  try {
    await qrcode.toFile(qrImagePath, qr);
    console.log("✅ QR salvat ca qr-code.png");

    await sendQrCodeEmail();
    console.log("✅ Email cu QR trimis cu succes!");
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
});

client.initialize();

export default client;
