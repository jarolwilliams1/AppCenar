const mongoose = require('mongoose');
const userModel = require("../models/userModel")


const CategoriaSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true }
}, { timestamps: true });

const Categoria = mongoose.model('Categoria', CategoriaSchema);


  async function CrearCategoria(datos, id)
  {
try{

const nombreCat = datos.nombreNuevaCategoriaInput?.trim();
    const descripcionCat = datos.descripcionNuevaCategoriaInput?.trim();
    const nuevaCategoria = await Categoria.create({
    nombre: nombreCat,
    descripcion: descripcionCat,
    comercioId: id
  });

  return nuevaCategoria;
console.log("categoria agregda manito")
  }catch(error){
    throw Error ("error al guardar la categoria nueva en la bd: " + error);
    console.log("error al guardar la categoria nueva en la bd: " + error)
  }
}

module.exports = {Categoria, CrearCategoria }

