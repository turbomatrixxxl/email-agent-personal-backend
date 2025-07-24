// import dotenv from "dotenv";
// dotenv.config();

// import { google } from "googleapis";
// import loadToken from "./loadToken.js";
// import classifyEmail from "./classifyEmail.js";
// import {
//   moveEmailToLabel,
//   getOrCreateLabel,
//   LABEL_CACHE,
// } from "./moveEmail.js";
// import cron from "node-cron";
// import client from "./whatsappClient.js";

// // Importăm funcția pentru autentificare interactivă
// import { getTokenInteractive } from "./getToken.js";

// const labelMap = {
//   Urgente: "🔔 Urgente",
//   Joburi: "💼 Joburi",
//   Clienti: "👥 Clienți",
//   Cursuri: "🎓 Cursuri",
//   ComenziServicii: "📦 Comenzi / servicii",
//   Newslettere: "🧾 Newslettere utile",
//   DeIgnorat: "🗑️ De ignorat",
// };

// const GMAIL_ACCOUNTS = process.env.GMAIL_ACCOUNTS
//   ? process.env.GMAIL_ACCOUNTS.split(",").map((acc) => acc.trim())
//   : [];

// async function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function verifyAllTokens() {
//   for (const accountKey of GMAIL_ACCOUNTS) {
//     const authClient = await loadToken(accountKey);
//     if (!authClient) {
//       console.log(
//         `⚠️ Token pentru ${accountKey} lipsește sau este invalid. Încep autentificarea interactivă...`
//       );
//       try {
//         await getTokenInteractive(accountKey);
//         console.log(`✅ Token nou pentru ${accountKey} generat cu succes.`);
//       } catch (err) {
//         console.error(
//           `❌ Eroare la autentificarea contului ${accountKey}:`,
//           err.message
//         );
//       }
//     } else {
//       console.log(`✅ Token pentru ${accountKey} este valid.`);
//     }
//   }
// }

// async function processAccount(accountKey, sendSummary = false) {
//   Object.keys(LABEL_CACHE).forEach((key) => delete LABEL_CACHE[key]);

//   try {
//     const authClient = await loadToken(accountKey);
//     if (!authClient) {
//       console.log(`⚠️ Token pentru ${accountKey} nu a putut fi încărcat.`);
//       return sendSummary ? `⚠️ ${accountKey}: token lipsă sau invalid.\n` : "";
//     }

//     const gmail = google.gmail({ version: "v1", auth: authClient });

//     let messages = [];
//     let nextPageToken = null;

//     do {
//       const res = await gmail.users.messages.list({
//         userId: "me",
//         q: "is:unread",
//         maxResults: 100,
//         pageToken: nextPageToken || undefined,
//         includeSpamTrash: false,
//       });
//       messages = messages.concat(res.data.messages || []);
//       console.log(
//         `🔍 ${accountKey} — mesaje necitite returnate: ${messages.length}`
//       );
//       nextPageToken = res.data.nextPageToken;
//     } while (nextPageToken);

//     if (messages.length === 0) {
//       console.log(`📭 Nu sunt mesaje necitite pentru ${accountKey}.`);
//       return sendSummary ? `📭 ${accountKey}: fără mesaje necitite.\n` : "";
//     }

//     const grouped = {};
//     const failedMoves = [];
//     const categoriesOrdered = [
//       "Urgente",
//       "Joburi",
//       "Clienti",
//       "ComenziServicii",
//       "Cursuri",
//       "Newslettere",
//       "DeIgnorat",
//     ];

//     for (const cat of categoriesOrdered) {
//       grouped[cat] = {};
//     }

//     let index = 1;

//     for (const message of messages) {
//       const msg = await gmail.users.messages.get({
//         userId: "me",
//         id: message.id,
//         format: "metadata",
//         metadataHeaders: ["Subject", "From", "Date"],
//       });

//       const headers = msg.data.payload.headers;
//       const subject =
//         headers.find((h) => h.name === "Subject")?.value || "(fără subiect)";
//       const fromRaw =
//         headers.find((h) => h.name === "From")?.value || "(fără expeditor)";
//       const dateRaw = headers.find((h) => h.name === "Date")?.value || "";

//       const fromMatch = fromRaw.match(/([^<]+)<([^>]+)>/);
//       const sender = fromMatch ? fromMatch[1].trim() : fromRaw;

//       const dateObj = new Date(dateRaw);
//       const formattedDate = isNaN(dateObj.getTime())
//         ? "data necunoscută"
//         : `${dateObj.getDate().toString().padStart(2, "0")}/${(
//             dateObj.getMonth() + 1
//           )
//             .toString()
//             .padStart(2, "0")} ${dateObj
//             .getHours()
//             .toString()
//             .padStart(2, "0")}:${dateObj
//             .getMinutes()
//             .toString()
//             .padStart(2, "0")}`;

//       let emailBody = "";
//       try {
//         const fullMsg = await gmail.users.messages.get({
//           userId: "me",
//           id: message.id,
//           format: "full",
//         });

//         const parts = fullMsg.data.payload.parts || [];
//         const textPart =
//           parts.find((p) => p.mimeType === "text/plain") || parts[0] || null;

//         if (textPart && textPart.body?.data) {
//           const decoded = Buffer.from(textPart.body.data, "base64").toString(
//             "utf-8"
//           );
//           emailBody = decoded;
//         }
//       } catch (err) {
//         console.warn(`⚠️ Nu s-a putut extrage body-ul mesajului ${message.id}`);
//       }

//       const category = await classifyEmail(subject, fromRaw, emailBody);
//       const labelName = labelMap[category] || null;

//       const emailUser = accountKey.includes("@") ? accountKey : "me";
//       const link = `https://mail.google.com/mail/?authuser=${emailUser}#inbox/${message.id}`;

//       let movedSuccessfully = false;

//       if (labelName) {
//         try {
//           const labelId = await getOrCreateLabel(gmail, labelName);

//           const messageDetails = await gmail.users.messages.get({
//             userId: "me",
//             id: message.id,
//             format: "metadata",
//             metadataHeaders: [],
//             includeSpamTrash: true,
//           });

//           const currentLabels = messageDetails.data.labelIds || [];

//           if (currentLabels.includes(labelId)) {
//             movedSuccessfully = true;
//           } else {
//             const moved = await moveEmailToLabel(gmail, message.id, labelId);
//             if (!moved) {
//               failedMoves.push({
//                 id: message.id,
//                 subject,
//                 from: sender,
//                 label: labelName,
//                 error: "Nu s-a confirmat mutarea în label",
//                 link,
//               });
//             }
//             movedSuccessfully = moved;
//           }
//         } catch (err) {
//           failedMoves.push({
//             id: message.id,
//             subject,
//             from: sender,
//             label: labelName,
//             error: err.message,
//             link,
//           });
//         }
//       }

//       if (sendSummary) {
//         if (!grouped[category]) grouped[category] = {};
//         if (!grouped[category][sender]) grouped[category][sender] = [];

//         grouped[category][sender].push({
//           index,
//           subject,
//           date: formattedDate,
//           link,
//           moved: movedSuccessfully,
//         });
//       }

//       index++;
//     }

//     if (!sendSummary) return "";

//     let summary = `📨 ${accountKey} — ${messages.length} mesaje necitite:\n`;

//     for (const cat of categoriesOrdered) {
//       if (!grouped[cat] || Object.keys(grouped[cat]).length === 0) continue;

//       let mutatedCount = 0;
//       let notMutatedCount = 0;

//       for (const sender of Object.keys(grouped[cat])) {
//         for (const msg of grouped[cat][sender]) {
//           if (msg.moved) mutatedCount++;
//           else notMutatedCount++;
//         }
//       }

//       summary += `\n${labelMap[cat]} (${mutatedCount} mutate, ${notMutatedCount} nemutate):\n`;

//       const expeditorNames = Object.keys(grouped[cat]).sort((a, b) =>
//         a.localeCompare(b)
//       );

//       for (const sender of expeditorNames) {
//         const msgs = grouped[cat][sender];
//         summary += `\n*${sender}* (${msgs.length} mesaje):\n`;

//         for (const m of msgs) {
//           summary += `  ${m.index}. "${m.subject}" [${m.date}]${
//             m.moved ? "" : " (Nemutat)"
//           }\n    Link: ${m.link}\n`;
//         }
//       }
//     }

//     if (failedMoves.length > 0) {
//       summary += `\n⚠️ ${failedMoves.length} mesaje nu au fost mutate:\n`;

//       for (const fail of failedMoves) {
//         summary += `- "${fail.subject}" de la ${fail.from} -> ${fail.label}\n  Link: ${fail.link}\n  Eroare: ${fail.error}\n`;
//       }
//     }

//     summary += "\n";

//     return summary;
//   } catch (error) {
//     return sendSummary ? `❌ ${accountKey}: eroare la procesare.\n` : "";
//   }
// }

// async function run(sendSummary = false) {
//   // Mai întâi verificăm toți tokenii și regenerăm dacă este nevoie
//   await verifyAllTokens();

//   let fullSummary = "";
//   for (const accountKey of GMAIL_ACCOUNTS) {
//     const result = await processAccount(accountKey, sendSummary);
//     fullSummary += result;
//   }

//   if (sendSummary) {
//     console.log("📋 REZUMAT GENERAL:\n" + fullSummary);
//   }
//   return fullSummary;
// }

// async function sendWhatsAppSummary(summary) {
//   const number = process.env.WHATSAPP_TARGET;
//   if (!number) {
//     return;
//   }

//   const formattedNumber = `${number}@c.us`;

//   try {
//     await delay(3000);
//     await client.sendMessage(formattedNumber, summary);
//   } catch (error) {
//     console.error("❌ Eroare la trimiterea mesajului WhatsApp:", error.message);
//   }
// }

// client.on("ready", async () => {
//   const testNumber = process.env.WHATSAPP_TARGET;
//   if (!testNumber) return;

//   const formattedNumber = `${testNumber}@c.us`;

//   try {
//     // await delay(3000);
//     // await client.sendMessage(formattedNumber, "Test mesaj scurt cu delay 🚀");

//     const summary = await run(true);
//     await sendWhatsAppSummary(summary);
//   } catch (err) {
//     console.error(
//       "❌ Eroare la trimiterea mesajului pe WhatsApp:",
//       err.message
//     );
//   }
// });

// cron.schedule("30 2 * * *", async () => {
//   const summary = await run(true);
//   await sendWhatsAppSummary(summary);
// });

// cron.schedule("0 21,3,9,15 * * *", async () => {
//   await run(false);
// });

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { google } from "googleapis";
import loadToken from "./loadToken.js";
import classifyEmail from "./classifyEmail.js";
import {
  moveEmailToLabel,
  getOrCreateLabel,
  LABEL_CACHE,
} from "./moveEmail.js";
import client from "./whatsappClient.js";
import { getTokenInteractive } from "./getToken.js";

const app = express();
const PORT = process.env.PORT || 3000;

const labelMap = {
  Urgente: "🔔 Urgente",
  Joburi: "💼 Joburi",
  Clienti: "👥 Clienți",
  Cursuri: "🎓 Cursuri",
  ComenziServicii: "📦 Comenzi / servicii",
  Newslettere: "🧾 Newslettere utile",
  DeIgnorat: "🗑️ De ignorat",
};

const GMAIL_ACCOUNTS = process.env.GMAIL_ACCOUNTS
  ? process.env.GMAIL_ACCOUNTS.split(",").map((acc) => acc.trim())
  : [];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyAllTokens() {
  for (const accountKey of GMAIL_ACCOUNTS) {
    const authClient = await loadToken(accountKey);
    if (!authClient) {
      console.log(
        `⚠️ Token lipsă pentru ${accountKey}. Se încearcă reautentificarea...`
      );
      try {
        await getTokenInteractive(accountKey);
        console.log(`✅ Token nou pentru ${accountKey} generat.`);
      } catch (err) {
        console.error(`❌ Eroare la autentificare ${accountKey}:`, err.message);
      }
    } else {
      console.log(`✅ Token valid pentru ${accountKey}.`);
    }
  }
}

async function processAccount(accountKey, sendSummary = false) {
  Object.keys(LABEL_CACHE).forEach((key) => delete LABEL_CACHE[key]);

  try {
    const authClient = await loadToken(accountKey);
    if (!authClient) {
      console.log(`⚠️ Token lipsă pentru ${accountKey}.`);
      return sendSummary ? `⚠️ ${accountKey}: token lipsă.\n` : "";
    }

    const gmail = google.gmail({ version: "v1", auth: authClient });

    let messages = [];
    let nextPageToken = null;

    do {
      const res = await gmail.users.messages.list({
        userId: "me",
        q: "is:unread",
        maxResults: 100,
        pageToken: nextPageToken || undefined,
        includeSpamTrash: false,
      });
      messages = messages.concat(res.data.messages || []);
      nextPageToken = res.data.nextPageToken;
    } while (nextPageToken);

    if (messages.length === 0) {
      return sendSummary ? `📭 ${accountKey}: fără mesaje necitite.\n` : "";
    }

    const grouped = {};
    const failedMoves = [];
    const categoriesOrdered = Object.keys(labelMap);

    for (const cat of categoriesOrdered) grouped[cat] = {};

    let index = 1;

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = msg.data.payload.headers;
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(fără subiect)";
      const fromRaw =
        headers.find((h) => h.name === "From")?.value || "(fără expeditor)";
      const dateRaw = headers.find((h) => h.name === "Date")?.value || "";

      const fromMatch = fromRaw.match(/([^<]+)<([^>]+)>/);
      const sender = fromMatch ? fromMatch[1].trim() : fromRaw;

      const dateObj = new Date(dateRaw);
      const formattedDate = isNaN(dateObj.getTime())
        ? "data necunoscută"
        : `${dateObj.getDate().toString().padStart(2, "0")}/${(
            dateObj.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")} ${dateObj
            .getHours()
            .toString()
            .padStart(2, "0")}:${dateObj
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

      let emailBody = "";
      try {
        const fullMsg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const parts = fullMsg.data.payload.parts || [];
        const textPart =
          parts.find((p) => p.mimeType === "text/plain") || parts[0];

        if (textPart?.body?.data) {
          const decoded = Buffer.from(textPart.body.data, "base64").toString(
            "utf-8"
          );
          emailBody = decoded;
        }
      } catch {
        // skip
      }

      const category = await classifyEmail(subject, fromRaw, emailBody);
      const labelName = labelMap[category] || null;

      const emailUser = accountKey.includes("@") ? accountKey : "me";
      const link = `https://mail.google.com/mail/?authuser=${emailUser}#inbox/${message.id}`;

      let movedSuccessfully = false;

      if (labelName) {
        try {
          const labelId = await getOrCreateLabel(gmail, labelName);
          const msgDetails = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "metadata",
            includeSpamTrash: true,
          });

          const currentLabels = msgDetails.data.labelIds || [];

          if (!currentLabels.includes(labelId)) {
            const moved = await moveEmailToLabel(gmail, message.id, labelId);
            movedSuccessfully = moved;
          } else {
            movedSuccessfully = true;
          }
        } catch (err) {
          failedMoves.push({
            subject,
            from: sender,
            label: labelName,
            error: err.message,
            link,
          });
        }
      }

      if (sendSummary) {
        if (!grouped[category]) grouped[category] = {};
        if (!grouped[category][sender]) grouped[category][sender] = [];

        grouped[category][sender].push({
          index,
          subject,
          date: formattedDate,
          link,
          moved: movedSuccessfully,
        });
      }

      index++;
    }

    if (!sendSummary) return "";

    let summary = `📨 ${accountKey} — ${messages.length} mesaje necitite:\n`;

    for (const cat of categoriesOrdered) {
      if (!grouped[cat] || Object.keys(grouped[cat]).length === 0) continue;

      let mutated = 0,
        nemutate = 0;
      for (const sender of Object.keys(grouped[cat])) {
        for (const msg of grouped[cat][sender]) {
          msg.moved ? mutated++ : nemutate++;
        }
      }

      summary += `\n${labelMap[cat]} (${mutated} mutate, ${nemutate} nemutate):\n`;

      const senders = Object.keys(grouped[cat]).sort((a, b) =>
        a.localeCompare(b)
      );
      for (const sender of senders) {
        const msgs = grouped[cat][sender];
        summary += `\n*${sender}* (${msgs.length}):\n`;
        for (const m of msgs) {
          summary += `  ${m.index}. "${m.subject}" [${m.date}]${
            m.moved ? "" : " (Nemutat)"
          }\n    Link: ${m.link}\n`;
        }
      }
    }

    if (failedMoves.length > 0) {
      summary += `\n⚠️ ${failedMoves.length} erori la mutare:\n`;
      for (const fail of failedMoves) {
        summary += `- "${fail.subject}" de la ${fail.from} -> ${fail.label}\n  Link: ${fail.link}\n  Eroare: ${fail.error}\n`;
      }
    }

    return summary + "\n";
  } catch {
    return sendSummary ? `❌ ${accountKey}: eroare la procesare.\n` : "";
  }
}

async function run(sendSummary = false) {
  await verifyAllTokens();

  let fullSummary = "";
  for (const accountKey of GMAIL_ACCOUNTS) {
    fullSummary += await processAccount(accountKey, sendSummary);
  }

  if (sendSummary) console.log("📋 REZUMAT:\n" + fullSummary);
  return fullSummary;
}

async function sendWhatsAppSummary(summary) {
  const number = process.env.WHATSAPP_TARGET;
  if (!number) return;

  const formatted = `${number}@c.us`;

  try {
    await delay(3000);
    await client.sendMessage(formatted, summary);
  } catch (err) {
    console.error("❌ Trimitere WhatsApp eșuată:", err.message);
  }
}

client.on("ready", async () => {
  console.log("WhatsApp client is ready.");

  // Rulează o dată doar pentru test
  const testNumber = process.env.WHATSAPP_TARGET;
  if (!testNumber) return;

  const formattedNumber = `${testNumber}@c.us`;

  try {
    await delay(3000);
    await client.sendMessage(formattedNumber, "Test mesaj scurt cu delay 🚀");

    const summary = await run(true);
    await sendWhatsAppSummary(summary);
    console.log("📤 Rezumat trimis pe Whatsapp !");
  } catch (err) {
    console.error(
      "❌ Eroare la trimiterea mesajului pe WhatsApp:",
      err.message
    );
  }
});

// ✅ Endpoint pentru scheduler extern
app.get("/run", async (req, res) => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const shouldSendSummary = hour === 2 && minute === 30;

    const summary = await run(shouldSendSummary);
    if (shouldSendSummary) {
      await sendWhatsAppSummary(summary);
    }

    res
      .status(200)
      .send(`✅ Run completat (${shouldSendSummary ? "cu" : "fără"} rezumat).`);
  } catch (err) {
    console.error("❌ Eroare /run:", err.message);
    res.status(500).send("Eroare la execuția jobului.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});

// 🔁 Opțional — cron local (comentat ca fallback)
// import cron from "node-cron";
// cron.schedule("30 2 * * *", async () => {
//   const summary = await run(true);
//   await sendWhatsAppSummary(summary);
// });
// cron.schedule("0 21,3,9,15 * * *", async () => {
//   await run(false);
// });
