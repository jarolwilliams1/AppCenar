const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria", required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  foto: { type: String, default: "/icons/default-food.png" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Producto = mongoose.models.Producto || mongoose.model("Producto", ProductoSchema);

async function CrearProducto(datos, id) {
  try {
    const nombrep = (datos.NombreNuevoPorducto || datos.nombre || "").trim();
    const categoriap = (datos.CategoriaNuevoProducto || datos.categoriaId || "").trim();
    const preciop = Number(datos.PrecioNuevoProducto || datos.precio || 0);
    const descripcionp = (datos.DescripcionNuevoProducto || datos.descripcion || "").trim();
    const fotop = datos.FotoProductoNuevo || datos.foto || "/icons/default-food.png";

    const NewProduct = await Producto.create({
      comercioId: id,
      categoriaId: categoriap,
      nombre: nombrep,
      descripcion: descripcionp,
      precio: preciop,
      foto: fotop
    });

    return NewProduct;
  } catch (error) {
    console.error("Ocurri un error guardando el producto en la base de datos:", error);
    throw error;
  }
}

async function GetProductosToComerceById(idComercio, IdCategoria) {
  const query = { comercioId: idComercio };
  if (IdCategoria) {
    if (Array.isArray(IdCategoria)) {
      query.categoriaId = { $in: IdCategoria };
    } else {
      query.categoriaId = IdCategoria;
    }
  }
  return await Producto.find(query).populate("categoriaId").sort({ createdAt: -1 });
}

module.exports = {
  Producto,
  producto: Producto,
  CrearProducto,
  GetProductosToComerceById
};
