const mongoose = require('mongoose');

const DireccionSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nombre: { type: String, required: true, trim: true }, // Ej: "Casa", "Oficina"
  descripcion: { type: String, required: true, trim: true } // Ej: "C/ Cerro Mar, Apt. 304"
}, { timestamps: true });

module.exports = mongoose.model('Direccion', DireccionSchema);