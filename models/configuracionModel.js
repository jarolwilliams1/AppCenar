const mongoose = require("mongoose");

const ConfiguracionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "ITBIS" },
  itbis: { type: Number, required: true, default: 18 },
  descripcion: { type: String, default: "Impuesto sobre Transferencias de Bienes Industrializados y Servicios" }
}, { timestamps: true });

const Configuracion = mongoose.models.Configuracion || mongoose.model("Configuracion", ConfiguracionSchema);

async function getItbisPercent() {
  try {
    let config = await Configuracion.findOne({ key: "ITBIS" });
    if (!config) {
      config = await Configuracion.create({ key: "ITBIS", itbis: 18 });
    }
    return config.itbis || 18;
  } catch (error) {
    console.error("Error al obtener ITBIS:", error);
    return 18;
  }
}

module.exports = Configuracion;
module.exports.Configuracion = Configuracion;
module.exports.getItbisPercent = getItbisPercent;
