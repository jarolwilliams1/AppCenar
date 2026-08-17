const productModel = require("../models/ProductoModel")

async function ValidarDatos(datos, id)
{
    try{
        
    const nombre = datos.NombreNuevoPorducto?.trim();
    const categoria = datos.CategoriaNuevoProducto?.trim();
    const precio = datos.PrecioNuevoProducto?.trim();
    const descripcion = datos.DescripcionNuevoProducto?.trim();
    const foto = datos.FotoProductoNuevo?.trim();

    if (!nombre || !categoria || !precio || !descripcion || !foto)
        {
            throw Error("Todos los campos son requeridos.")

        
    }

  const nuevoProduct =  productModel.CrearProducto(datos, id)
  return await nuevoProduct;
    }
    catch(error){
                console.log("Ocurrio un error creando el producto: ", error)
      //  throw Error("Ocurrio un error creando el producto.")
    }



}

module.exports = {ValidarDatos}