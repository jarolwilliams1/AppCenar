const mongoose = require("mongoose");
const { Producto, CrearProducto } = require("../models/ProductoModel");
const { Categoria } = require("../models/categoriaModel");

async function ValidarDatos(datos, id, file) {
  const nombre = (datos.NombreNuevoPorducto || datos.nombre || datos.nombreProducto || "").trim();
  const categoriaRaw = (datos.CategoriaNuevoProducto || datos.categoriaId || datos.categoria || "").toString().trim();
  const precio = Number(datos.PrecioNuevoProducto || datos.precio || 0);
  const descripcion = (datos.DescripcionNuevoProducto || datos.descripcion || "").trim();
  const foto = file ? `/uploads/${file.filename}` : (datos.FotoProductoNuevo || datos.foto || "/icons/default-food.png");

  if (!nombre) {
    throw new Error("El nombre del producto es obligatorio");
  }

  if (!categoriaRaw) {
    throw new Error("Debes seleccionar una categoría para el producto");
  }

  if (isNaN(precio) || precio < 0) {
    throw new Error("El precio debe ser un número válido mayor o igual a 0");
  }

  if (!descripcion) {
    throw new Error("La descripción del producto es obligatoria");
  }

  // Buscar categoría por ID
  const cat = await Categoria.findById(categoriaRaw);
  if (!cat) {
    throw new Error("La categoría seleccionada no existe en la base de datos");
  }

  const datosCompletos = {
    NombreNuevoPorducto: nombre,
    CategoriaNuevoProducto: cat._id,
    PrecioNuevoProducto: precio,
    DescripcionNuevoProducto: descripcion,
    FotoProductoNuevo: foto
  };

  return await CrearProducto(datosCompletos, id);
}

module.exports = { ValidarDatos };

