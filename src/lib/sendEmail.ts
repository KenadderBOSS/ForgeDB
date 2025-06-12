import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "1af94fa2ad332e60e42829e983da0ca4-5bb33252-c667c08a",
  // Si usas dominio en EU:
  // url: "https://api.eu.mailgun.net"
});

export async function sendVerificationCode(toEmail: string, code: string) {
  try {
    const domain = "sandboxf2de568653cb409c8eda99dc5438432b.mailgun.org"; // Cambia a tu dominio real si tienes
    const fromEmail = `Mailgun Sandbox <postmaster@${domain}>`;

    const result = await mg.messages.create(domain, {
      from: fromEmail,
      to: [toEmail],
      subject: "Verificación de cuenta - ForgeDB",
      html: `<p>Hola, tu código de verificación es: <b>${code}</b></p><p>Este código expira en 10 minutos.</p>`,
    });

    return result;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}
