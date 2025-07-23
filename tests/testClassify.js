import dotenv from "dotenv";
dotenv.config();

import classifyEmail from "../classifyEmail.js";

async function test() {
  try {
    const subject = "Factura lunii iulie";
    const from = "contabilitate@firma.ro";
    const content =
      "Vă rugăm să achitați factura în valoare de 580 lei până pe 15 iulie.";

    const category = await classifyEmail(subject, from, content);
    console.log("Categoria detectată:", category);
  } catch (error) {
    console.error("Eroare test clasificare:", error);
  }
}

test();
