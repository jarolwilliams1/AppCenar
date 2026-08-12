 const LoginModel = require("../models/userModel"); // Reemplaza por tu modelo real



// INICIO DE SESIÓN
async function IniciarSesion(datosLogin) {
  const nombreUsuario = datosLogin.usuario?.trim();
  const passwordUsuario = datosLogin.password?.trim();

  const resultado = await LoginModel.verificarCredenciales(nombreUsuario, passwordUsuario);
  
  if (!resultado.exito) {
    throw new Error(resultado.mensaje);
  }

  return resultado.usuario.rol;
}


module.exports = { IniciarSesion };