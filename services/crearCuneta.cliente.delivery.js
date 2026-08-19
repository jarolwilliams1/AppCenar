const { User, CrearUsuario } = require("../models/userModel");
const { sendActivationEmail } = require("./mailService");

async function ValidarDatos(datos, file, baseUrl) {
  const nombre = (datos.nombrelCDInput || datos.nombre || "").trim();
  const apellido = (datos.apellidolCDInput || datos.apellido || "").trim();
  const telefono = (datos.telefonoCDInput || datos.telefono || "").trim();
  const email = (datos.emailCDInput || datos.correo || "").trim().toLowerCase();
  const userName = (datos.usuarioCDInput || datos.usuario || "").trim();
  const rol = (datos.rolCDInput || datos.rol || "").trim();
  const password = (datos.passwordCDInput || datos.password || "").trim();
  const confirmarPassword = (datos.confirmarPasswordCDInput || datos.confirmarPassword || "").trim();

  if (!nombre || !apellido || !telefono || !email || !userName || !rol || !password || !confirmarPassword) {
    throw new Error("Todos los campos son requeridos");
  }

  if (password !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  // Validación de unicidad de usuario y correo
  const existeUsuario = await User.findOne({ usuario: userName });
  if (existeUsuario) {
    throw new Error("El nombre de usuario ya está en uso");
  }

  const existeCorreo = await User.findOne({ correo: email });
  if (existeCorreo) {
    throw new Error("El correo electrónico ya está registrado");
  }

  const fotoPath = file ? `/uploads/${file.filename}` : (datos.fotoPerfil || null);

  const datosCompletos = {
    ...datos,
    nombrelCDInput: nombre,
    apellidolCDInput: apellido,
    telefonoCDInput: telefono,
    emailCDInput: email,
    usuarioCDInput: userName,
    rolCDInput: rol,
    passwordCDInput: password,
    fotoCDInput: fotoPath
  };

  const nuevoUsuario = await CrearUsuario(datosCompletos);

  // Enviar correo de activación en segundo plano para respuesta inmediata al usuario
  if (nuevoUsuario && nuevoUsuario.activationToken) {
    sendActivationEmail({
      email: nuevoUsuario.correo,
      nombre: nuevoUsuario.nombre,
      token: nuevoUsuario.activationToken,
      baseUrl: baseUrl
    }).catch(err => {
      console.error("Aviso: No se pudo enviar el correo de activación vía SMTP:", err.message);
    });
  }

  return nuevoUsuario;
}

module.exports = { ValidarDatos };
