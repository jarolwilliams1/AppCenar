const UserModel = require('../models/userModel');

async function ValidarDatos(datos) {
  // 1. Extraer y limpiar los campos enviando los nombres correctos del body/formulario
  const nombre = datos.nombrelCDInput?.trim();
  const apellido = datos.apellidolCDInput?.trim();
  const telefono = datos.telefonoCDInput?.trim();
  const email = datos.emailCDInput?.trim();
  const userName = datos.usuarioCDInput?.trim();
  const rol = datos.rolCDInput?.trim();
  const fotoPerfil = datos.fotoCDInput?.trim();
  const password = datos.passwordCDInput?.trim();
  const confirmarPassword = datos.confirmarPasswordCDInput?.trim();

  // 2. Validar campos requeridos
  if (!nombre || !apellido || !telefono || !email || !userName || !rol || !fotoPerfil || !password || !confirmarPassword) {
    throw new Error("Todos los campos son requeridos");
  }

  // 3. Validar contraseñas
  if (password !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

 UserModel.CrearUsuario(datos);
}

module.exports = { ValidarDatos };