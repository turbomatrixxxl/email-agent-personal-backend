// // ✅ sendSummaryMessage.js - actualizat să trimită mesajul chiar dacă nu reușește să șteargă cele vechi
// import fs from "fs/promises";
// import client from "../whatsappClient.js";

// /**
//  * Trimite mesaj pe WhatsApp, șterge toate mesajele anterioare dacă există
//  * @param {string} number - Număr fără "+" (ex: 40712345678)
//  * @param {string} message - Mesajul complet, fiecare linie va fi trimisă separat
//  */
// export async function sendSummaryMessage(number, message) {
//   const filePath = "./lastMessage.json";
//   const chatId = `${number}@c.us`;
//   let lastMessages = {};

//   try {
//     const data = await fs.readFile(filePath, "utf-8");
//     lastMessages = JSON.parse(data);
//   } catch {
//     lastMessages = {};
//   }

//   // Șterge mesajele anterioare dacă există
//   if (Array.isArray(lastMessages[chatId]) && lastMessages[chatId].length > 0) {
//     for (const msgId of lastMessages[chatId]) {
//       try {
//         if (!client.info || !client.info.wid) {
//           console.warn("⚠️ Clientul WhatsApp nu e conectat corect.");
//         }

//         const msg = await client.getMessageById(msgId);
//         if (msg) {
//           await msg.delete(true);
//           console.log(`🗑️ Mesaj ${msgId} șters.`);
//         } else {
//           console.warn(`⚠️ Mesajul ${msgId} nu a fost găsit.`);
//         }
//       } catch (err) {
//         console.warn(`⚠️ Nu s-a putut șterge mesajul ${msgId}:`, err.message);
//       }
//     }
//   } else {
//     console.info("ℹ️ Nu există mesaje anterioare de șters.");
//   }

//   // Trimite mesajul nou
//   const lines = message.split("\n").filter(Boolean);
//   const sentIds = [];

//   for (const line of lines) {
//     try {
//       const sent = await client.sendMessage(chatId, line);
//       sentIds.push(sent.id.id);
//       console.log("📤 Mesaj trimis:", sent.body);
//     } catch (err) {
//       console.error("❌ Eroare la trimiterea unui mesaj:", err.message);
//     }
//   }

//   // Salvează noile ID-uri doar dacă s-a trimis ceva
//   if (sentIds.length > 0) {
//     lastMessages[chatId] = sentIds;
//     await fs.writeFile(filePath, JSON.stringify(lastMessages, null, 2));
//   }
// }

// ✅ sendSummaryMessage.js - varianta simplificată (NU mai șterge mesaje vechi)
import client from "../whatsappClient.js";

/**
 * Trimite mesaj pe WhatsApp, fiecare linie va fi trimisă separat
 * @param {string} number - Număr fără "+" (ex: 40712345678)
 * @param {string} message - Mesajul complet, fiecare linie va fi trimisă separat
 */
export async function sendSummaryMessage(number, message) {
  const chatId = `${number}@c.us`;

  const lines = message.split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      await client.sendMessage(chatId, line);
      console.log("📤 Mesaj trimis:", line);
    } catch (err) {
      console.error("❌ Eroare la trimiterea unui mesaj:", err.message);
    }
  }
}
