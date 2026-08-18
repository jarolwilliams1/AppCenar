const { Producto, CrearProducto } = require("../models/ProductoModel");
const { Categoria } = require("../models/categoriaModel");

async function ValidarDatos(datos, id, file) {
  const nombre = (datos.NombreNuevoPorducto || datos.nombre || "").trim();
  const categoria = (datos.CategoriaNuevoProducto || datos.categoriaId || "").toString().trim();
  const precio = Number(datos.PrecioNuevoProducto || datos.precio || 0);
  const descripcion = (datos.DescripcionNuevoProducto || datos.descripcion || "").trim();
  const foto = file ? `/uploads/${file.filename}` : (datos.FotoProductoNuevo || datos.foto || "/icons/default-food.png");

  if (!nombre || !categoria || !precio || !descripcion) {
    throw new Error("Todos los campos son requeridos");
  }

  if (precio < 0) {
    throw new Error("El precio no puede ser menor que 0");
  }

  // Validar que la categoría pertenezca a este comercio
  const cat = await Categoria.findOne({ _id: categoria, comercioId: id });
  if (!cat) {
    throw new Error("La categoría seleccionada no es válida para este comercio");
  }

  const datosCompletos = {
    NombreNuevoPorducto: nombre,
    CategoriaNuevoProducto: categoria,
    PrecioNuevoProducto: precio,
    DescripcionNuevoProducto: descripcion,
    FotoProductoNuevo: foto
  };

  return await CrearProducto(datosCompletos, id);
}

module.exports = { ValidarDatos };
