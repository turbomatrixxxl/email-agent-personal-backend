import classifyEmailAI from "./classifyEmailAI.js";

export default async function classifyEmail(subject, from, content) {
  try {
    let category = await classifyEmailAI(subject, from, content);

    const validCategories = [
      "Urgente",
      "Joburi",
      "Cursuri",
      "Clienti",
      "ComenziServicii",
      "Newslettere",
      "DeIgnorat",
    ];

    if (!validCategories.includes(category)) {
      console.warn(
        `⚠️ Categoria necunoscută primită de la AI: "${category}", folosim DeIgnorat`
      );
      category = "DeIgnorat";
    }

    return category;
  } catch (error) {
    console.error("Eroare clasificare email AI:", error);
    return "DeIgnorat"; // fallback sigur și controlat
  }
}
