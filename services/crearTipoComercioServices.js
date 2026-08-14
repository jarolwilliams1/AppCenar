const TipoComercioModel = require("../models/TipoComercioModel")


async function ValidarDatos(datos) {
  // 1. Extraer y limpiar los campos enviando los nombres correctos del body/formulario
  const nombre = datos.nombeNuevoTipoComercioInput?.trim();
    const descripcion = datos.descripcionNuevoTipoComercioInput?.trim();



  // 2. Validar campos requeridos
  if (!nombre || !descripcion) {
    throw new Error("Todos los campos son requeridos");
  }



 TipoComercioModel.NuevoTipoComercio(datos);
}

module.exports = { ValidarDatos };