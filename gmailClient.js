import { google } from "googleapis";
import "dotenv/config";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// const REDIRECT_URI = "http://localhost:3000"; // redirect pentru local web app
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

// console.log(GOOGLE_CLIENT_ID);
// console.log(GOOGLE_CLIENT_SECRET);

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "❌ GOOGLE_CLIENT_ID sau GOOGLE_CLIENT_SECRET lipsesc din .env"
  );
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export default oAuth2Client;
