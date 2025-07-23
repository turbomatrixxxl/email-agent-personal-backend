// moveEmail.js
import { google } from "googleapis";

/**
 * Etichete Gmail implicite care trebuie eliminate înainte de a aplica alta
 */
const REMOVE_LABELS = [
  "CATEGORY_PERSONAL",
  "CATEGORY_SOCIAL",
  "CATEGORY_PROMOTIONS",
  "CATEGORY_UPDATES",
  "IMPORTANT",
  "SPAM",
  "TRASH",
];

// Exportăm cache-ul pentru a putea fi resetat per cont
export const LABEL_CACHE = {};

/**
 * Mută un email în label-ul specificat, doar dacă NU are deja acel label și nu e în Trash
 */
export async function moveEmailToLabel(gmail, messageId, labelId) {
  if (!labelId || !messageId) {
    console.warn(`⚠️ Lipsă labelId sau messageId pentru mesajul ${messageId}`);
    return false;
  }

  try {
    // Verificăm etichetele curente inclusiv Trash
    const currentMessage = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: [],
      includeSpamTrash: true,
    });

    const currentLabels = currentMessage.data.labelIds || [];

    if (currentLabels.includes("TRASH")) {
      console.log(`⛔ Mesajul ${messageId} este în Trash. Ignorăm.`);
      return false;
    }

    if (currentLabels.includes(labelId)) {
      console.log(`ℹ️ Mesajul ${messageId} are deja eticheta ${labelId}.`);
      return true;
    }

    console.log(`➡️ Aplic eticheta ${labelId} la mesajul ${messageId}`);

    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
        removeLabelIds: REMOVE_LABELS,
      },
    });

    await new Promise((res) => setTimeout(res, 1000));

    const updatedMessage = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: [],
      includeSpamTrash: true,
    });

    const updatedLabels = updatedMessage.data.labelIds || [];
    if (updatedLabels.includes(labelId)) {
      console.log(
        `✅ Eticheta ${labelId} a fost aplicată cu succes mesajului ${messageId}`
      );
      return true;
    } else {
      console.warn(
        `⚠️ Mesaj ${messageId} NU are aplicată eticheta ${labelId} după modificare`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `❌ Eroare la mutarea mesajului ${messageId}:`,
      error.message
    );
    return false;
  }
}

/**
 * Creează un label dacă nu există și returnează ID-ul său, folosind cache
 */
export async function getOrCreateLabel(gmail, labelName) {
  if (LABEL_CACHE[labelName]) {
    return LABEL_CACHE[labelName];
  }

  try {
    const res = await gmail.users.labels.list({ userId: "me" });
    const labels = res.data.labels || [];
    const existing = labels.find((l) => l.name === labelName);

    if (existing) {
      console.log(`ℹ️ Label existent găsit: ${labelName} (ID: ${existing.id})`);
      LABEL_CACHE[labelName] = existing.id;
      return existing.id;
    }

    const createRes = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });

    console.log(`✅ Label creat: ${labelName} (ID: ${createRes.data.id})`);
    LABEL_CACHE[labelName] = createRes.data.id;
    return createRes.data.id;
  } catch (error) {
    console.error("❌ Eroare la getOrCreateLabel:", error.message);
    throw error;
  }
}
