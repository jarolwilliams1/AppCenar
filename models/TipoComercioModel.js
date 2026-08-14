const mongoose = require('mongoose');

const TipoComercioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  icono: { type: String, required: true }
}, { timestamps: true });

const TipoComercio = mongoose.model('TipoComercio', TipoComercioSchema);

async function NuevoTipoComercio(datos)
 {

   try {
     // const rol = datos.rolCDInput?.trim().toLowerCase();
  
      // Registro de nuevo tipo de comercio
     
        const nuevoComercio = new TipoComercio({
        descripcion: datos.descripcionNuevoTipoComercioInput?.trim(),
        nombre:  datos.nombeNuevoTipoComercioInput?.trim(),
        icono: datos.iconoNuevoTipoComercioAdminInput?.trim(),
        });
        return await nuevoComercio.save();
     
  
   
   
    } catch (error) {
      console.error("Error al guardar el nuevo tipo de comercio:", error.message);
      throw error;
    }
  
}

async function GetTiposComercio(datos) {
  

  try{
    const TipoComercioList = await TipoComercio.find();
    return TipoComercioList;
    }
    catch(error){
      throw error;
      console.log("error, extrayendo los tipos de comercio para los admin: ", error)
    }


}

module.exports = {NuevoTipoComercio, GetTiposComercio}