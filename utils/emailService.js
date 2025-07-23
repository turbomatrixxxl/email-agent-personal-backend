import nodemailer from "nodemailer";
import fs from "fs";
import "dotenv/config";

const senderEmail = process.env.SECRET_EMAIL;
const recipientEmail = process.env.EMAIL_QR_RECEIVER;
const appPassword = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: appPassword,
  },
});

/**
 * Trimite QR code-ul prin email.
 * @param {string} qrImagePath - calea către fișierul PNG cu codul QR
 */
export const sendQrCodeEmail = async (qrImagePath) => {
  if (!fs.existsSync(qrImagePath)) {
    throw new Error("QR code image not found. Make sure qr-code.png exists.");
  }

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject: "WhatsApp QR Code",
    text: "Scan the attached QR code with your WhatsApp mobile app to log in.",
    html: `
      <p>Scan the QR code below with your WhatsApp mobile app to log in:</p>
      <img src="cid:qr-code" alt="QR Code" />
    `,
    attachments: [
      {
        filename: "qr-code.png",
        path: qrImagePath,
        cid: "qr-code", // ID pentru afișare în HTML
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ QR code email sent successfully to ${recipientEmail}: ${info.response}`
    );
  } catch (error) {
    console.error("❌ Failed to send QR code email:", error.message);
    throw error;
  }
};
