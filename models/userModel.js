const mongoose = require('mongoose');

const userOptions = {
  discriminatorKey: 'rol',
  timestamps: true
};

const userSchema = new mongoose.Schema({
  usuario: { typeof: String, required:true, unique: true, trim: true},
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
password:{ typeof: String, required: true,},
resetPasswordToken: { type: String, default: null },
activationToken: { type: String, default: null },
isActive: { type: Boolean, default: false },
resetPasswordExpires: { type: Date, default: null },
 userOptions
});

//La herramienta para consultar/modificar la tabla
//La clase que usas en el código para hacer Kitten.find(), Kitten.create(), etc.
const User = mongoose.model('User', userSchema);

// Rol: Cliente
const Cliente = User.discriminator('cliente', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  fotoPerfil: { type: String, default: null },
  favoritos: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Referencia a comercios
}));

// Rol: Delivery
const Delivery = User.discriminator('delivery', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  fotoPerfil: { type: String, default: null },
  estadoDelivery: { 
    type: String, 
    enum: ['disponible', 'ocupado'], 
    default: 'disponible' 
  }
}));

// Rol: Comercio
const Comercio = User.discriminator('comercio', new Schema({
  nombreComercio: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  logoComercio: { type: String, default: null },
  horaApertura: { type: String, required: true }, // Formato 'HH:mm'
  horaCierre: { type: String, required: true },  // Formato 'HH:mm'
  tipoComercioId: { type: Schema.Types.ObjectId, ref: 'TipoComercio', required: true }
}));

// Rol: Administrador
const Administrador = User.discriminator('administrador', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  cedula: { type: String, required: true, unique: true, trim: true }
}));

module.exports = { User, Cliente, Delivery, Comercio, Administrador };