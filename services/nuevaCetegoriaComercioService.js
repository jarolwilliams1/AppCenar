const { Categoria, CrearCategoria } = require("../models/categoriaModel");

async function Validar(datos, id) {
  const nombre = (datos.nombreNuevaCategoriaInput || datos.nombre || "").trim();
  const descripcion = (datos.descripcionNuevaCategoriaInput || datos.descripcion || "").trim();

  if (!nombre || !descripcion) {
    throw new Error("Todos los campos son obligatorios");
  }

  const existe = await Categoria.findOne({ comercioId: id, nombre: new RegExp(`^${nombre}$`, "i") });
  if (existe) {
    throw new Error("Ya tienes una categoría con este nombre");
  }

  return await CrearCategoria(datos, id);
}

module.exports = { Validar };
