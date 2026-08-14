const mongoose = require('mongoose');
const tipoComercioModel = require("../models/TipoComercioModel")
const { Schema } = mongoose;

const userOptions = {
  discriminatorKey: 'rol',
  timestamps: true
};

// 1. Esquema Base
const userSchema = new Schema({
  usuario: { type: String, required: true, unique: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },                         
  resetPasswordToken: { type: String, default: null },
  activationToken: { type: String, default: null },
  isActive: { type: Boolean, default: false },
  resetPasswordExpires: { type: Date, default: null }
}, userOptions);

const User = mongoose.model('User', userSchema);

// 2. Rol: Cliente
const Cliente = User.discriminator('Cliente', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  fotoPerfil: { type: String, default: null },
  favoritos: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}));

// 3. Rol: Delivery
const Delivery = User.discriminator('Delivery', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  fotoPerfil: { type: String, default: null },
  estadoDelivery: { 
    type: String, 
    enum: ['Disponible', 'Ocupado'], 
    default: 'Disponible' 
  }
}));

// 4. Rol: Comercio
const Comercio = User.discriminator('Comercio', new Schema({
  nombreComercio: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  logoComercio: { type: String, default: null },
  horaApertura: { type: String, required: true },
  horaCierre: { type: String, required: true },
  tipoComercioId: { type: Schema.Types.ObjectId, ref: 'TipoComercio', required: true }
}));

// 5. Rol: Administrador
const Administrador = User.discriminator('Administrador', new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  cedula: { type: String, required: true, unique: true, trim: true }
}));

// FUNCIÓN DE CREACIÓN DE USUARIOS
async function CrearUsuario(datos) {
  try {
    const rol = datos.rolCDInput?.trim().toLowerCase();

    // Registro de Cliente
    if (rol === 'cliente') {
      const nuevoCliente = new Cliente({
        usuario: datos.usuarioCDInput?.trim(),
        correo: datos.emailCDInput?.trim(),
        password: datos.passwordCDInput?.trim(), // Encriptar con bcrypt en controlador
        nombre: datos.nombrelCDInput?.trim(),
        apellido: datos.apellidolCDInput?.trim(),
        telefono: datos.telefonoCDInput?.trim(),
        fotoPerfil: datos.fotoCDInput?.trim() || null
      });
      return await nuevoCliente.save();
    }

    // Registro de Delivery
    if (rol === 'delivery') {
      const nuevoDelivery = new Delivery({
        usuario: datos.usuarioCDInput?.trim(),
        correo: datos.emailCDInput?.trim(),
        password: datos.passwordCDInput?.trim(),
        nombre: datos.nombrelCDInput?.trim(),
        apellido: datos.apellidolCDInput?.trim(),
        telefono: datos.telefonoCDInput?.trim(),
        fotoPerfil: datos.fotoCDInput?.trim() || null
      });
      return await nuevoDelivery.save();
    }

 

    throw new Error("El rol especificado no es válido");
  } catch (error) {
    console.error("Error al guardar usuario en MongoDB:", error.message);
    throw error;
  }
}

async function CrearComercio(datos) {
  
     // Registro de Comercio
    try {
      const nuevoComercio = new Comercio({
        rol: "Comercio",
        usuario:datos.comercioInputEmail?.trim() ,
        correo: datos.comercioInputEmail?.trim(),
        password: datos.comercioPasswordInput?.trim(),
        nombreComercio: datos.comercioInputNombre?.trim(),
        telefono: datos.comercioInputTelefono?.trim(),
        logoComercio: datos.comercioInputLogo?.trim() || null,
        horaApertura: datos.comercioInputAperturaH?.trim(),
        horaCierre: datos.comercioInputCierreH?.trim(),
        
      });
      return await nuevoComercio.save();
      throw new Error("El rol especificado no es válido");
  } catch (error) {
    console.error("Error al guardar usuario en MongoDB:", error.message);
    throw error;
  }
}
// todos los clientes para los administradores

async function GetClientesToAdmin() 
{
  try{
  const clientes = await User.find(
    {
      rol: "Cliente"
    }
  );
  return clientes;
  }
  catch(error){
    throw error;
    console.log("error, extrayendo los clietes para los admin: ", error)
  }
  
}

// todos los deliveries para los administradores

async function GetDeliveriesToAdmin() 
{
  try{
  const deliveries = await User.find(
    {
      rol: "Delivery"
    }
  );
  return deliveries;
  }
  catch(error){
    throw error;
    console.log("error, extrayendo los deliveries para los admin: ", error)
  }
  
}

// VERIFICACIÓN DE CREDENCIALES (LOGIN)
async function verificarCredenciales(usuarIngresado, passwordIngresada) {
  try {
    const loginClean = usuarIngresado.trim();

    // 1. Buscar usuario por Nombre de Usuario O Correo
    const usuarioEncontrado = await User.findOne({
      $or: [
        { usuario: loginClean },
        { correo: loginClean.toLowerCase() }
      ]
    });

    if (!usuarioEncontrado) {
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    }

    // 2. Validar Contraseña (se recomienda usar bcrypt.compare en producción)
    if (usuarioEncontrado.password !== passwordIngresada.trim()) {
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    }

    // 3. Validar Estado Activo
   // if (!usuarioEncontrado.isActive) {
     // return { exito: false, mensaje: 'Tu cuenta está inactiva. Revisa tu correo.' };
    //}

    return { exito: true, usuario: usuarioEncontrado };
  } catch (error) {
    console.error('Error al consultar en MongoDB:', error);
    throw error;
  }
}
module.exports = { User, Cliente, Delivery, Comercio, Administrador, CrearUsuario, verificarCredenciales, GetClientesToAdmin, GetDeliveriesToAdmin, CrearComercio };