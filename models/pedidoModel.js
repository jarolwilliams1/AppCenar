const mongoose = require('mongoose');

const ItemPedidoSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  foto: { type: String }
}, { _id: false });

const PedidoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  direccion: {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true }
  },
  productos: [ItemPedidoSchema],
  subtotal: { type: Number, required: true },
  itbisPorcentaje: { type: Number, required: true },
  itbisMonto: { type: Number, required: true },
  total: { type: Number, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'completado'], 
    default: 'pendiente',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', PedidoSchema);