// getTokens.js

import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import oAuth2Client from "./gmailClient.js";
import fs from "fs";
import path from "path";

const GMAIL_ACCOUNTS = process.env.GMAIL_ACCOUNTS
  ? process.env.GMAIL_ACCOUNTS.split(",").map((acc) => acc.trim())
  : [];

const TOKEN_PATHS = {};

GMAIL_ACCOUNTS.forEach((account) => {
  TOKEN_PATHS[account] = `token.${account}.json`;
});

function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly",
  ];

  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

/**
 * Funcție async care deschide prompt-ul, primește codul, obține tokenul și îl salvează.
 * @param {string} accountKey - Cheia contului (ex: turbomatrixxxl)
 * @returns {Promise<Object>} tokens
 */
export async function getTokenInteractive(accountKey) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      "\n🔗 Deschide acest URL în browser și autorizează aplicația:\n"
    );
    console.log(getAuthUrl() + "\n");

    rl.question("👉 Introdu codul de autorizare aici: ", async (code) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const TOKEN_DIR = path.resolve("./tokens");

        const fileName = TOKEN_PATHS[accountKey];
        if (!fileName) {
          reject(new Error(`❌ Cont necunoscut: ${accountKey}`));
          rl.close();
          return;
        }

        if (!fs.existsSync(TOKEN_DIR)) {
          fs.mkdirSync(TOKEN_DIR, { recursive: true });
        }

        const fullPath = path.join(TOKEN_DIR, fileName);
        fs.writeFileSync(fullPath, JSON.stringify(tokens, null, 2));
        console.log(`✅ Token salvat în ${fullPath}`);

        rl.close();
        resolve(tokens);
      } catch (error) {
        rl.close();
        reject(error);
      }
    });
  });
}

// Dacă este rulat direct din CLI, păstrează comportamentul
if (
  import.meta.url === process.argv[1] ||
  process.argv[1].endsWith("getTokens.js")
) {
  const accountKey = process.argv[2];
  if (!accountKey) {
    console.error(
      "❌ Te rog specifică un cont: turbomatrixxxl, radubogdannaramzoiu sau creativeinfinitysrl"
    );
    process.exit(1);
  }

  getTokenInteractive(accountKey)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Eroare la obținerea tokenului:", err.message);
      process.exit(1);
    });
}
