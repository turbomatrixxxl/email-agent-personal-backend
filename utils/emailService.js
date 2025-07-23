import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
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

export const sendQrCodeEmail = async () => {
  const qrImagePath = path.resolve("qr-code.png");

  if (!fs.existsSync(qrImagePath)) {
    throw new Error("QR code image not found. Make sure qr-code.png exists.");
  }

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject: "WhatsApp QR Code",
    text: "Scan the attached QR code with your WhatsApp mobile app to log in.",
    html: "<p>Scan the attached QR code with your WhatsApp mobile app to log in.</p>",
    attachments: [
      {
        filename: "qr-code.png",
        path: qrImagePath,
        cid: "qr-code",
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
