const { User, CrearComercio } = require("../models/userModel");
const { sendActivationEmail } = require("./mailService");

async function ValidarDatos(datos, file, baseUrl) {
  const nombreComercio = (datos.comercioInputNombre || datos.nombreComercio || "").trim();
  const telefonoComercio = (datos.comercioInputTelefono || datos.telefono || "").trim();
  const emailComercio = (datos.comercioInputEmail || datos.correo || "").trim().toLowerCase();
  const horaApertura = (datos.comercioInputAperturaH || datos.horaApertura || "").trim();
  const horaCierre = (datos.comercioInputCierreH || datos.horaCierre || "").trim();
  const tipoComercio = (datos.comercioSelectTipo || datos.tipoComercioId || "").toString().trim();
  const password = (datos.comercioPasswordInput || datos.password || "").trim();
  const confirmarPassword = (datos.confirmarComercioPasswordInput || datos.confirmarPassword || "").trim();

  if (!nombreComercio || !telefonoComercio || !emailComercio || !horaApertura || !horaCierre || !tipoComercio || !password || !confirmarPassword) {
    throw new Error("Todos los campos son requeridos");
  }

  if (password !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  // Validación de unicidad de correo y usuario
  const existeCorreo = await User.findOne({ correo: emailComercio });
  if (existeCorreo) {
    throw new Error("El correo electrónico del comercio ya está registrado");
  }

  const logoPath = file ? `/uploads/${file.filename}` : (datos.logoComercio || null);

  const datosCompletos = {
    ...datos,
    comercioInputNombre: nombreComercio,
    comercioInputTelefono: telefonoComercio,
    comercioInputEmail: emailComercio,
    comercioInputUsuario: emailComercio,
    comercioInputAperturaH: horaApertura,
    comercioInputCierreH: horaCierre,
    comercioSelectTipo: tipoComercio,
    comercioPasswordInput: password,
    comercioInputLogo: logoPath
  };

  const nuevoComercio = await CrearComercio(datosCompletos);

  // Enviar correo de activación
  if (nuevoComercio && nuevoComercio.activationToken) {
    await sendActivationEmail({
      email: nuevoComercio.correo,
      nombre: nuevoComercio.nombreComercio,
      token: nuevoComercio.activationToken,
      baseUrl: baseUrl
    });
  }

  return nuevoComercio;
}

module.exports = { ValidarDatos };
