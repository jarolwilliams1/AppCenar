const UserModel = require('../models/userModel');

async function ValidarDatos(datos) {
  // 1. Extraer y limpiar los campos enviando los nombres correctos del body/formulario
  const nombreComercio = datos.comercioInputNombre?.trim();
  const telefonoComercio  = datos.comercioInputTelefono?.trim();
  const emailComercio = datos.comercioInputEmail?.trim();
  const logo = datos.comercioInputLogo?.trim();
  const horaApertura = datos.comercioInputAperturaH?.trim();
  const horaCierre = datos.comercioInputCierreH?.trim();
  const tipoComercio = datos.comercioSelectTipo?.trim();
  const password = datos.comercioPasswordInput?.trim();
  const confirmarPassword = datos.confirmarComercioPasswordInput?.trim();

  // 2. Validar campos requeridos
  if (!nombreComercio || !telefonoComercio || !emailComercio || !logo || !horaApertura || !horaCierre || !tipoComercio || !password || !confirmarPassword) {
    throw new Error("Todos los campos son requeridos");
  }

  // 3. Validar contraseñas
  if (password !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden");
  }


 UserModel.CrearUsuario(datos);
}

module.exports = { ValidarDatos };