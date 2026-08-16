 
 const categoriasModel = require("../models/categoriaModel");

 async function Validar(datos, id)
 {
    const nombre = datos.nombreNuevaCategoriaInput?.trim();
    const descripcion = datos.descripcionNuevaCategoriaInput?.trim();

    if(!nombre || !descripcion)
    {

    
        //console.log("");
        throw Error("Los campos son obligatorios");
        
    }



  const neuvacat =  categoriasModel.CrearCategoria(datos, id)
  return neuvacat;
 }

 module.exports = {Validar};