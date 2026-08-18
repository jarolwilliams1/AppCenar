const { TipoComercio, NuevoTipoComercio } = require("../models/TipoComercioModel");

async function ValidarDatos(datos, file) {
  const nombre = (datos.nombeNuevoTipoComercioInput || datos.nombre || "").trim();
  const descripcion = (datos.descripcionNuevoTipoComercioInput || datos.descripcion || "").trim();

  if (!nombre || !descripcion) {
    throw new Error("Todos los campos son requeridos");
  }

  const existe = await TipoComercio.findOne({ nombre: new RegExp(`^${nombre}$`, "i") });
  if (existe) {
    throw new Error("Ya existe un tipo de comercio con ese nombre");
  }

  const iconoPath = file ? `/uploads/${file.filename}` : (datos.icono || "???");

  const datosCompletos = {
    ...datos,
    nombeNuevoTipoComercioInput: nombre,
    descripcionNuevoTipoComercioInput: descripcion,
    iconoNuevoTipoComercioAdminInput: iconoPath
  };

  return await NuevoTipoComercio(datosCompletos);
}

module.exports = { ValidarDatos };
