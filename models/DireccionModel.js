const mongoose = require("mongoose");

const DireccionSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  nombre: { type: String, required: true, trim: true }, // Ej: "Casa", "Oficina"
  descripcion: { type: String, required: true, trim: true } // Ej: "Calle Duarte #45, Santiago"
}, { timestamps: true });

const Direccion = mongoose.models.Direccion || mongoose.model("Direccion", DireccionSchema);

module.exports = {
  Direccion,
  direccion: Direccion
};
