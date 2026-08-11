// const LoginModel = require("../models/Login"); // Reemplaza por tu modelo real
async function ValidarDatos(datosLogin) {
    const usuario = datosLogin.usuario?.trim();
    const password = datosLogin.password?.trim();

    if (!usuario || !password) {
        throw new Error("Credenciales incorrectas");
    }

    // Usar el modelo de la BD, no la misma variable 'login'
    //const nuevoLogin = await LoginModel.create({
       // usuario: usuario,
       // password: password
   // });

  //  return nuevoLogin;
}

module.exports = { ValidarDatos };