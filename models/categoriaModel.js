const mongoose = require("mongoose");

const CategoriaSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true }
}, { timestamps: true });

const Categoria = mongoose.models.Categoria || mongoose.model("Categoria", CategoriaSchema);

async function CrearCategoria(datos, id) {
  try {
    const nombreCat = (datos.nombreNuevaCategoriaInput || datos.nombre || "").trim();
    const descripcionCat = (datos.descripcionNuevaCategoriaInput || datos.descripcion || "").trim();
    const nuevaCategoria = await Categoria.create({
      nombre: nombreCat,
      descripcion: descripcionCat,
      comercioId: id
    });
    return nuevaCategoria;
  } catch (error) {
    console.error("Error al guardar la categoria en la bd:", error);
    throw error;
  }
}

async function GetCategoriasToComerce(id) {
  try {
    const categorias = await Categoria.find({ comercioId: id }).sort({ createdAt: -1 });
    return categorias;
  } catch (error) {
    console.error("Error extrayendo las categorias para el comercio:", error);
    throw error;
  }
}

module.exports = {
  Categoria,
  categoria: Categoria,
  CrearCategoria,
  GetCategoriasToComerce
};
