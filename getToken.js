import readline from "readline";
import oAuth2Client from "./gmailClient.js";
import fs from "fs";
import path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
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

async function main(accountKey) {
  console.log("\n🔗 Deschide acest URL în browser și autorizează aplicația:\n");
  console.log(getAuthUrl() + "\n");

  rl.question("👉 Introdu codul de autorizare aici: ", async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      const TOKEN_DIR = path.resolve("./tokens");
      const TOKEN_PATHS = {
        turbomatrixxxl: "token.turbomatrixxxl.json",
        radubogdannaramzoiu: "token.radubogdannaramzoiu.json",
        creativeinfinitysrl: "token.creativeinfinitysrl.json",
      };

      const fileName = TOKEN_PATHS[accountKey];
      if (!fileName) {
        console.error(`❌ Cont necunoscut: ${accountKey}`);
        process.exit(1);
      }

      // Crează folderul tokens dacă nu există
      if (!fs.existsSync(TOKEN_DIR)) {
        fs.mkdirSync(TOKEN_DIR, { recursive: true });
      }

      const fullPath = path.join(TOKEN_DIR, fileName);

      fs.writeFileSync(fullPath, JSON.stringify(tokens, null, 2));
      console.log(`✅ Token salvat în ${fullPath}`);
    } catch (error) {
      console.error("❌ Eroare la obținerea tokenului:", error.message);
    } finally {
      rl.close();
    }
  });
}

const accountKey = process.argv[2];
if (!accountKey) {
  console.error(
    "❌ Te rog specifică un cont: turbomatrixxxl, radubogdannaramzoiu sau creativeinfinitysrl"
  );
  process.exit(1);
}

main(accountKey);
