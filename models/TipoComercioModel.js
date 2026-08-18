const mongoose = require("mongoose");

const TipoComercioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  icono: { type: String, default: "/icons/default-store.png" }
}, { timestamps: true });

const TipoComercio = mongoose.models.TipoComercio || mongoose.model("TipoComercio", TipoComercioSchema);

async function NuevoTipoComercio(datos) {
  try {
    const nuevoComercio = new TipoComercio({
      descripcion: (datos.descripcionNuevoTipoComercioInput || datos.descripcion || "").trim(),
      nombre: (datos.nombeNuevoTipoComercioInput || datos.nombeNuevoTipoComercioInput || datos.nombre || "").trim(),
      icono: datos.iconoNuevoTipoComercioAdminInput || datos.icono || "/icons/default-store.png"
    });
    return await nuevoComercio.save();
  } catch (error) {
    console.error("Error al guardar el nuevo tipo de comercio:", error.message);
    throw error;
  }
}

async function GetTiposComercio() {
  try {
    const TipoComercioList = await TipoComercio.find().sort({ createdAt: -1 });
    return TipoComercioList;
  } catch (error) {
    console.error("Error extrayendo los tipos de comercio:", error);
    throw error;
  }
}

module.exports = {
  TipoComercio,
  tipoComercio: TipoComercio,
  NuevoTipoComercio,
  GetTiposComercio
};
