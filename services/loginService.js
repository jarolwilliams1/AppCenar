 const LoginModel = require("../models/userModel"); // Reemplaza por tu modelo real

//const ComercioController = require("../controllers/ComercioController")

// INICIO DE SESIÓN
async function IniciarSesion(datosLogin) {
  const nombreUsuario = datosLogin.usuario?.trim();
  const passwordUsuario = datosLogin.password?.trim();

  const resultado = await LoginModel.verificarCredenciales(nombreUsuario, passwordUsuario);
  
  if (!resultado.exito) {
    throw new Error(resultado.mensaje);
  }

  const rol = resultado.usuario.rol;
  const idUsuario = resultado.usuario._id;

  const devueltaDatosUsurio ={
    rol,
    idUsuario
  }
  
   
  return await devueltaDatosUsurio;
}


module.exports = { IniciarSesion };