const nodemailer = require("nodemailer");

let transporter = null;

function getEmailCredentials() {
  const user = (process.env.EMAIL_USER || process.env.EMAIL_CORREO || process.env.EMAIL_EMISOR || "").trim();
  const rawPass = process.env.EMAIL_CLAVE || process.env.EMAIL_PASS || "";
  const pass = rawPass.replace(/\s+/g, "").trim(); // Eliminar espacios de la contraseña de aplicación de Google
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;
  const service = process.env.EMAIL_SERVICE || (host && host.includes("gmail") ? "gmail" : (!host && pass ? "gmail" : null));

  return { user, pass, host, port, secure, service };
}

async function getTransporter() {
  const { user, pass, host, port, secure, service } = getEmailCredentials();

  if (user && pass) {
    if (service === "gmail" || !host) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user,
          pass: pass
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 9000
      });
    } else {
      return nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
          user: user,
          pass: pass
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 9000
      });
    }
  } else {
    // Configuración fallback para entorno de desarrollo sin credenciales
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "appcenar.system@ethereal.email",
        pass: "appcenar12345"
      },
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 9000
    });
  }
}

async function sendActivationEmail({ email, nombre, token, baseUrl }) {
  const host = baseUrl || process.env.BASE_URL || "http://localhost:3000";
  const activationUrl = `${host}/activar-cuenta/${token}`;
  const { user } = getEmailCredentials();
  const fromAddress = user ? `"AppCenar" <${user}>` : '"AppCenar" <no-reply@appcenar.com>';

  try {
    const client = await getTransporter();
    await client.sendMail({
      from: fromAddress,
      to: email,
      subject: "Activa tu cuenta en AppCenar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #E91E63; margin: 0;">¡Bienvenido a AppCenar, ${nombre || ""}!</h2>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">Tu comida favorita a un solo clic</p>
          </div>
          <p style="color: #444; font-size: 15px; line-height: 1.5;">Gracias por registrarte en nuestra plataforma. Para comenzar a disfrutar de los mejores platos y servicios de entrega, por favor activa tu cuenta haciendo clic en el botón siguiente:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" style="background: linear-gradient(135deg, #E91E63, #C2185B); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 10px rgba(233,30,99,0.3);">Activar Mi Cuenta</a>
          </div>
          <p style="color: #888; font-size: 13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #E91E63; font-size: 12px; background: #fdf2f8; padding: 10px; border-radius: 6px;">${activationUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="color: #999; font-size: 11px; text-align: center;">© 2026 AppCenar · Proyecto Universitario de Programación Web</p>
        </div>
      `
    });
  } catch (error) {
    // Error silencioso en producción
  }

  return activationUrl;
}

async function sendPasswordResetEmail({ email, nombre, token, baseUrl }) {
  const host = baseUrl || process.env.BASE_URL || "http://localhost:3000";
  const resetUrl = `${host}/reset-password/${token}`;
  const { user } = getEmailCredentials();
  const fromAddress = user ? `"AppCenar" <${user}>` : '"AppCenar" <no-reply@appcenar.com>';

  try {
    const client = await getTransporter();
    await client.sendMail({
      from: fromAddress,
      to: email,
      subject: "Restablecer contraseña - AppCenar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #E91E63; margin: 0;">Recuperación de Contraseña</h2>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">AppCenar</p>
          </div>
          <p style="color: #444; font-size: 15px; line-height: 1.5;">Hola <strong>${nombre || ""}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en AppCenar. Haz clic en el botón siguiente para definir una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #E91E63, #C2185B); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 10px rgba(233,30,99,0.3);">Restablecer Mi Contraseña</a>
          </div>
          <p style="color: #888; font-size: 13px;">Este enlace expirará pronto por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
          <p style="word-break: break-all; color: #E91E63; font-size: 12px; background: #fdf2f8; padding: 10px; border-radius: 6px;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="color: #999; font-size: 11px; text-align: center;">© 2026 AppCenar · Proyecto Universitario de Programación Web</p>
        </div>
      `
    });
  } catch (error) {
    // Error silencioso en producción
  }

  return resetUrl;
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail
};
