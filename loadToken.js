// import dotenv from "dotenv";
// dotenv.config();

// import fs from "fs/promises";
// import { google } from "googleapis";
// import path from "path";

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

// if (!CLIENT_ID || !CLIENT_SECRET) {
//   console.error("❌ Variabilele de mediu pentru Google lipsesc.");
//   process.exit(1);
// }

// async function loadToken(accountKey) {
//   if (!accountKey) {
//     console.error("❌ Nu ai furnizat un cont valid.");
//     return null;
//   }

//   const TOKEN_PATH = path.join("tokens", `token.${accountKey}.json`);

//   try {
//     const tokenData = await fs.readFile(TOKEN_PATH, "utf-8");
//     const tokens = JSON.parse(tokenData);

//     const oAuth2Client = new google.auth.OAuth2(
//       CLIENT_ID,
//       CLIENT_SECRET,
//       REDIRECT_URI
//     );

//     oAuth2Client.setCredentials(tokens);
//     console.log(`✅ Token încărcat pentru ${accountKey} din ${TOKEN_PATH}`);

//     oAuth2Client.on("tokens", (newTokens) => {
//       if (newTokens.refresh_token) {
//         tokens.refresh_token = newTokens.refresh_token;
//       }
//       if (newTokens.access_token) {
//         tokens.access_token = newTokens.access_token;
//       }

//       fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2))
//         .then(() =>
//           console.log(`🔁 Token reîmprospătat salvat pentru ${accountKey}`)
//         )
//         .catch((err) => console.error("❌ Eroare la salvarea tokenului:", err));
//     });

//     return oAuth2Client;
//   } catch (error) {
//     console.error(`❌ Token lipsă pentru ${accountKey}:`, error.message);
//     console.log(
//       `ℹ️ Rulează 'node getToken.js ${accountKey}' pentru a obține tokenul.`
//     );
//     return null;
//   }
// }

// export default loadToken;

import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Variabilele de mediu pentru Google lipsesc.");
  process.exit(1);
}

async function loadToken(accountKey) {
  if (!accountKey) {
    console.error("❌ Nu ai furnizat un cont valid.");
    return null;
  }

  const envKey = `TOKEN_${accountKey}`;
  const rawToken = process.env[envKey];

  if (!rawToken) {
    console.error(`❌ Variabila de mediu ${envKey} lipsește.`);
    console.log(`ℹ️ Adaugă TOKEN_${accountKey} în Railway sau în .env`);
    return null;
  }

  let tokens;
  try {
    tokens = JSON.parse(rawToken);
  } catch (err) {
    console.error(`❌ TOKEN_${accountKey} nu este un JSON valid:`, err.message);
    return null;
  }

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oAuth2Client.setCredentials(tokens);

  // Notă: Tokenurile nu pot fi salvate la runtime într-un fișier pe Railway
  oAuth2Client.on("tokens", (newTokens) => {
    console.log(`♻️ Token reîmprospătat pentru ${accountKey}.`);
    console.log(
      `👉 Copiază manual tokenul nou și actualizează variabila TOKEN_${accountKey}.`
    );
    console.log(JSON.stringify({ ...tokens, ...newTokens }));
  });

  console.log(`✅ Token încărcat pentru ${accountKey} din variabila ${envKey}`);
  return oAuth2Client;
}

export default loadToken;
