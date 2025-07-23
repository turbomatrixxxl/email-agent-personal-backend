import oAuth2Client from "./gmailClient.js"; // importă clientul OAuth2 din fișierul tău de configurare

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.labels",
];

function getAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline", // cere refresh token
    scope: SCOPES,
  });
}

console.log("🔗 URL pentru autorizare:");
console.log(getAuthUrl());
