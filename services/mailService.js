const nodemailer = require("nodemailer");

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // configuración fallback segura / de desarrollo
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "appcenar.system@ethereal.email",
        pass: "appcenar12345"
      }
    });
  }

  return transporter;
}

async function sendActivationEmail({ email, nombre, token, baseUrl }) {
  const host = baseUrl || process.env.BASE_URL || "http://localhost:3000";
  const activationUrl = `${host}/activar-cuenta/${token}`;

  console.log("==================================================");
  console.log(`[EMAIL activación] Destinatario: ${email}`);
  console.log(`[ENLACE DE activación]: ${activationUrl}`);
  console.log("==================================================");

  try {
    const client = await getTransporter();
    await client.sendMail({
      from: '"AppCenar" <no-reply@appcenar.com>',
      to: email,
      subject: "Activa tu cuenta en AppCenar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #E91E63; text-align: center;">Bienvenido a AppCenar, ${nombre || ""}!</h2>
          <p style="color: #555; font-size: 15px;">Gracias por registrarte. Para comenzar a disfrutar de los mejores platos y servicios de delivery, activa tu cuenta haciendo clic en el siguiente botún:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" style="background-color: #E91E63; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Activar Mi Cuenta</a>
          </div>
          <p style="color: #888; font-size: 13px;">O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #E91E63; font-size: 12px;">${activationUrl}</p>
        </div>
      `
    });
  } catch (error) {
    console.warn("Aviso: No se pudo enviar el correo SMTP real (normal en entornos de prueba), se registr en consola:", error.message);
  }

  return activationUrl;
}

async function sendPasswordResetEmail({ email, nombre, token, baseUrl }) {
  const host = baseUrl || process.env.BASE_URL || "http://localhost:3000";
  const resetUrl = `${host}/reset-password/${token}`;

  console.log("==================================================");
  console.log(`[EMAIL RESTABLECER contraseña] Destinatario: ${email}`);
  console.log(`[ENLACE DE recuperación]: ${resetUrl}`);
  console.log("==================================================");

  try {
    const client = await getTransporter();
    await client.sendMail({
      from: '"AppCenar" <no-reply@appcenar.com>',
      to: email,
      subject: "Restablecer contraseña - AppCenar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #E91E63; text-align: center;">recuperación de contraseña</h2>
          <p style="color: #555; font-size: 15px;">Hola ${nombre || ""}, recibimos una solicitud para restablecer la contraseña de tu cuenta en AppCenar. Haz clic en el botún a continuacin:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #E91E63; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer contraseña</a>
          </div>
          <p style="color: #888; font-size: 13px;">Este enlace expirar pronto por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <p style="word-break: break-all; color: #E91E63; font-size: 12px;">${resetUrl}</p>
        </div>
      `
    });
  } catch (error) {
    console.warn("Aviso: No se pudo enviar el correo SMTP real, se registr en consola:", error.message);
  }

  return resetUrl;
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail
};
