const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  foto: { type: String, required: true }
}, { timestamps: true });

const Producto = mongoose.model('Producto', ProductoSchema);

async function CrearProducto(datos, id)
{

  try{
     const nombrep = datos.NombreNuevoPorducto?.trim();
    const categoriap = datos.CategoriaNuevoProducto?.trim();
    const preciop = datos.PrecioNuevoProducto?.trim();
    const descripcionp = datos.DescripcionNuevoProducto?.trim();
    const fotop = datos.FotoProductoNuevo?.trim();

    const NewProduct = await Producto.create({
      comercioId: id,
      categoriaId: categoriap,
      nombre: nombrep ,
      descripcion: descripcionp ,
      precio: preciop ,
      foto: fotop 




    })

    return NewProduct

  }
  catch(error){
  console.log("Ocurrio un error guardando el producto en la base de datos: ", error)

 //throw Error("Ocurrio un error guardando el producto.")
  }

}

async function GetProductosToComerceById(idComercio, IdCategoria)
{

  const productos = await Producto.find(
   {
     comercioId: idComercio,
     categoriaId: IdCategoria
   }
  )
  
  return await productos;
}

module.exports ={CrearProducto, GetProductosToComerceById}