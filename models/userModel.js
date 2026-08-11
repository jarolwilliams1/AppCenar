const mongoose = require('mongoose');
const { Schema } = mongoose; // Extraer Schema para los discriminadores

const userOptions = {
    discriminatorKey: 'rol',
    timestamps: true
};

// Aislado, esto es solo una plantilla/regla de validación.
// 1. Esquema Base
const userSchema = new Schema({
    usuario: { type: String, required: true, unique: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },                         
    resetPasswordToken: { type: String, default: null },
    activationToken: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    resetPasswordExpires: { type: Date, default: null }
}, userOptions); // userOptions pasa como segundo argumento


// Aquí le dices a Mongoose: "Crea una colección llamada 'users' usando el plano userSchema".
const User = mongoose.model('User', userSchema);


// Dices: "Cliente hereda todo lo de User, pero agrégale sus propios campos"
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


async function CrearUsuario(datos)
 {
  const nombre = datos.nombrelCDInput?.trim();
  const apellido = datos.apellidolCDInput?.trim();
  const telefono = datos.telefonoCDInput?.trim();
  const email = datos.emailCDInput?.trim();
  const userName = datos.usuarioCDInput?.trim();
  const rol = datos.rolCDInput?.trim();
  const fotoPerfil = datos.fotoCDInput?.trim();
  const password = datos.passwordCDInput?.trim();
   // 4. Evaluar según el rol para registrar (usando toLowerCase() para evitar fallos por mayúsculas)
  if (rol.toLowerCase() === 'cliente') {
    try {
      const nuevoCliente = await new UserModel.Cliente({
        usuario: userName,
        correo: email,
        password: password, // NOTA: Se recomienda encriptar con bcrypt antes de guardar
        nombre: nombre,
        apellido: apellido,
        telefono: telefono,
        fotoPerfil: fotoPerfil
      });

      // 5. GUARDAR EN LA BASE DE DATOS Y RETORNAR EL RESULTADO
      const clienteGuardado = await nuevoCliente.save();
      return clienteGuardado;

    } catch (error) {
      console.error("Error al guardar en MongoDB:", error.message);
      throw error;
    }
  }

  // Si se añade el registro de Delivery en este mismo flujo:
  /*
  if (rol.toLowerCase() === 'delivery') {
    const nuevoDelivery = new UserModel.Delivery({ ... });
    return await nuevoDelivery.save();
  }
  */

  throw new Error("El rol especificado no es válido");
  
}
module.exports = { User, Cliente, Delivery, Comercio, Administrador, CrearUsuario };