const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Categoria', CategoriaSchema);