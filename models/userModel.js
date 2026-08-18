const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Schema } = mongoose;

const userOptions = {
  discriminatorKey: "rol",
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

// Encriptar password antes de guardar si fue modificada (Mongoose 8/9 async pre-hook)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (err) {
    throw err;
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// 2. Rol: Cliente
const Cliente = User.discriminators && User.discriminators.Cliente 
  ? User.discriminators.Cliente 
  : User.discriminator("Cliente", new Schema({
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
      fotoPerfil: { type: String, default: null },
      favoritos: [{ type: Schema.Types.ObjectId, ref: "User" }]
    }));

// 3. Rol: Delivery
const Delivery = User.discriminators && User.discriminators.Delivery
  ? User.discriminators.Delivery
  : User.discriminator("Delivery", new Schema({
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
      fotoPerfil: { type: String, default: null },
      estadoDelivery: { 
        type: String, 
        enum: ["Disponible", "Ocupado"], 
        default: "Disponible" 
      }
    }));

// 4. Rol: Comercio
const Comercio = User.discriminators && User.discriminators.Comercio
  ? User.discriminators.Comercio
  : User.discriminator("Comercio", new Schema({
      nombreComercio: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
      logoComercio: { type: String, default: null },
      horaApertura: { type: String, required: true },
      horaCierre: { type: String, required: true },
      tipoComercioId: { type: Schema.Types.ObjectId, ref: "TipoComercio", required: true }
    }));

// 5. Rol: Administrador
const Administrador = User.discriminators && User.discriminators.Administrador
  ? User.discriminators.Administrador
  : User.discriminator("Administrador", new Schema({
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      cedula: { type: String, required: true, unique: true, trim: true }
    }));

// Función DE creación DE CLIENTE O DELIVERY
async function CrearUsuario(datos) {
  try {
    const rol = (datos.rolCDInput || datos.rol || "").trim().toLowerCase();
    const token = crypto.randomBytes(24).toString("hex");

    if (rol === "cliente") {
      const nuevoCliente = new Cliente({
        usuario: (datos.usuarioCDInput || datos.usuario || "").trim(),
        correo: (datos.emailCDInput || datos.correo || "").trim().toLowerCase(),
        password: (datos.passwordCDInput || datos.password || "").trim(),
        nombre: (datos.nombrelCDInput || datos.nombre || "").trim(),
        apellido: (datos.apellidolCDInput || datos.apellido || "").trim(),
        telefono: (datos.telefonoCDInput || datos.telefono || "").trim(),
        fotoPerfil: datos.fotoCDInput || datos.fotoPerfil || null,
        activationToken: token,
        isActive: false
      });
      return await nuevoCliente.save();
    }

    if (rol === "delivery") {
      const nuevoDelivery = new Delivery({
        usuario: (datos.usuarioCDInput || datos.usuario || "").trim(),
        correo: (datos.emailCDInput || datos.correo || "").trim().toLowerCase(),
        password: (datos.passwordCDInput || datos.password || "").trim(),
        nombre: (datos.nombrelCDInput || datos.nombre || "").trim(),
        apellido: (datos.apellidolCDInput || datos.apellido || "").trim(),
        telefono: (datos.telefonoCDInput || datos.telefono || "").trim(),
        fotoPerfil: datos.fotoCDInput || datos.fotoPerfil || null,
        estadoDelivery: "Disponible",
        activationToken: token,
        isActive: false
      });
      return await nuevoDelivery.save();
    }

    throw new Error("El rol especificado no es válido");
  } catch (error) {
    console.error("Error al guardar usuario en MongoDB:", error.message);
    throw error;
  }
}

// creación DE COMERCIO
async function CrearComercio(datos) {
  try {
    const token = crypto.randomBytes(24).toString("hex");
    const correo = (datos.comercioInputEmail || datos.correo || "").trim().toLowerCase();
    const usuario = (datos.comercioInputUsuario || datos.usuario || correo).trim();

    const nuevoComercio = new Comercio({
      rol: "Comercio",
      usuario: usuario,
      correo: correo,
      password: (datos.comercioPasswordInput || datos.password || "").trim(),
      nombreComercio: (datos.comercioInputNombre || datos.nombreComercio || "").trim(),
      telefono: (datos.comercioInputTelefono || datos.telefono || "").trim(),
      logoComercio: datos.comercioInputLogo || datos.logoComercio || null,
      horaApertura: (datos.comercioInputAperturaH || datos.horaApertura || "08:00").trim(),
      horaCierre: (datos.comercioInputCierreH || datos.horaCierre || "22:00").trim(),
      tipoComercioId: datos.comercioSelectTipo || datos.tipoComercioId,
      activationToken: token,
      isActive: false
    });
    return await nuevoComercio.save();
  } catch (error) {
    console.error("Error al guardar comercio en MongoDB:", error.message);
    throw error;
  }
}

// CONSULTAS ADMINISTRATIVAS
async function GetClientesToAdmin() {
  return await Cliente.find({ rol: "Cliente" }).sort({ createdAt: -1 });
}

async function GetDeliveriesToAdmin() {
  return await Delivery.find({ rol: "Delivery" }).sort({ createdAt: -1 });
}

async function GetComerciosToAdmin() {
  return await Comercio.find({ rol: "Comercio" }).populate("tipoComercioId").sort({ createdAt: -1 });
}

async function GetAdminsToAdmin() {
  return await Administrador.find({ rol: "Administrador" }).sort({ createdAt: -1 });
}

// VERIFICACIN DE CREDENCIALES (LOGIN)
async function verificarCredenciales(usuarIngresado, passwordIngresada) {
  try {
    if (!usuarIngresado || !passwordIngresada) {
      return { exito: false, mensaje: "Todos los campos son requeridos" };
    }

    const loginClean = usuarIngresado.trim();

    const usuarioEncontrado = await User.findOne({
      $or: [
        { usuario: loginClean },
        { correo: loginClean.toLowerCase() }
      ]
    });

    if (!usuarioEncontrado) {
      return { exito: false, mensaje: "Credenciales incorrectas" };
    }

    let passValida = false;
    if (usuarioEncontrado.password.startsWith("$2a$") || usuarioEncontrado.password.startsWith("$2b$")) {
      passValida = await bcrypt.compare(passwordIngresada.trim(), usuarioEncontrado.password);
    } else {
      passValida = usuarioEncontrado.password === passwordIngresada.trim();
    }

    if (!passValida) {
      return { exito: false, mensaje: "Credenciales incorrectas" };
    }

    if (!usuarioEncontrado.isActive) {
      return { 
        exito: false, 
        inactivo: true,
        mensaje: "Tu cuenta está inactiva. Revisa tu correo de activación o contacta al administrador." 
      };
    }

    return { exito: true, usuario: usuarioEncontrado };
  } catch (error) {
    console.error("Error al verificar credenciales:", error);
    throw error;
  }
}

module.exports = {
  User,
  Cliente,
  Delivery,
  Comercio,
  Administrador,
  CrearUsuario,
  CrearComercio,
  verificarCredenciales,
  GetClientesToAdmin,
  GetDeliveriesToAdmin,
  GetComerciosToAdmin,
  GetAdminsToAdmin
};
