const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  foto: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);