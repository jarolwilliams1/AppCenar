const crypto = require("crypto");
const loginService = require("../services/loginService");
const { User } = require("../models/userModel");
const { sendPasswordResetEmail } = require("../services/mailService");

async function mostrar(req, res) {
  if (req.session && req.session.usuario) {
    switch (req.session.usuario.rol) {
      case "Cliente":
        return res.redirect("/cliente/home");
      case "Delivery":
        return res.redirect("/delivery/home");
      case "Comercio":
        return res.redirect("/comercio/home");
      case "Administrador":
        return res.redirect("/admin");
      default:
        break;
    }
  }

  res.render("auth/login", {
    layout: "auth",
    error: req.query.error || null,
    success: req.query.success || null
  });
}

async function validar(req, res) {
  try {
    const usuario = await loginService.IniciarSesion(req.body);

    const userDoc = await User.findById(usuario.idUsuario);
    if (!userDoc) {
      throw new Error("Usuario no encontrado");
    }

    req.session.usuario = {
      id: userDoc._id.toString(),
      rol: userDoc.rol,
      usuario: userDoc.usuario,
      correo: userDoc.correo,
      nombre: userDoc.nombre || userDoc.nombreComercio || userDoc.usuario,
      foto: userDoc.fotoPerfil || userDoc.logoComercio || null
    };

    switch (userDoc.rol) {
      case "Cliente":
        return res.redirect("/cliente/home");
      case "Delivery":
        return res.redirect("/delivery/home");
      case "Administrador":
        return res.redirect("/admin");
      case "Comercio":
        return res.redirect("/comercio/home");
      default:
        return res.redirect("/login");
    }
  } catch (error) {
    const userMsg = (error && error.message && !error.message.includes("Mongo") && !error.message.includes("E11000")) 
      ? error.message 
      : "Usuario o contraseña incorrectos.";

    return res.status(400).render("auth/login", {
      layout: "auth",
      error: userMsg,
      datos: req.body
    });
  }
}

function logout(req, res) {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  } else {
    res.redirect("/login");
  }
}

// activación DE CUENTA
async function activarCuenta(req, res) {
  try {
    const token = req.params.token || req.query.token;

    if (!token) {
      return res.render("auth/activarCuenta", {
        layout: "auth",
        error: "Token de activación inválido o ausente."
      });
    }

    const usuario = await User.findOne({ activationToken: token });

    if (!usuario) {
      return res.render("auth/activarCuenta", {
        layout: "auth",
        error: "El token de activación no es válido o ya fue utilizado anteriormente."
      });
    }

    usuario.isActive = true;
    usuario.activationToken = null;
    await usuario.save();

    return res.render("auth/activarCuenta", {
      layout: "auth",
      success: true,
      usuario: usuario.usuario,
      rol: usuario.rol
    });
  } catch (error) {
    console.error("Error al activar cuenta:", error);
    return res.render("auth/activarCuenta", {
      layout: "auth",
      error: "Ocurri un error al intentar activar tu cuenta."
    });
  }
}

// recuperación DE contraseña
async function mostrarRecuperar(req, res) {
  res.render("auth/recuperarPassword", {
    layout: "auth",
    error: req.query.error || null,
    success: req.query.success || null
  });
}

async function solicitarRecuperacion(req, res) {
  try {
    const identificador = (req.body.identificador || req.body.usuario || req.body.correo || "").trim();

    if (!identificador) {
      return res.status(400).render("auth/recuperarPassword", {
        layout: "auth",
        error: "Debes ingresar tu nombre de usuario o correo electrónico"
      });
    }

    const usuario = await User.findOne({
      $or: [
        { usuario: identificador },
        { correo: identificador.toLowerCase() }
      ]
    });

    if (!usuario) {
      // Por seguridad indicamos mensaje genrico o confirmación
      return res.render("auth/recuperarPassword", {
        layout: "auth",
        success: "Si los datos coinciden con una cuenta registrada, se enviar un enlace de recuperación."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora de vigencia
    await usuario.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    await sendPasswordResetEmail({
      email: usuario.correo,
      nombre: usuario.nombre || usuario.nombreComercio || usuario.usuario,
      token: token,
      baseUrl: baseUrl
    });

    return res.render("auth/recuperarPassword", {
      layout: "auth",
      success: `Hemos enviado un enlace de recuperación al correo asociado (${usuario.correo}). Revisa tu bandeja de entrada.`
    });
  } catch (error) {
    console.error("Error en solicitarRecuperacion:", error);
    return res.status(500).render("auth/recuperarPassword", {
      layout: "auth",
      error: "Ocurri un error al procesar tu solicitud. Intenta nuevamente."
    });
  }
}

async function mostrarReset(req, res) {
  const token = req.params.token || req.query.token;

  if (!token) {
    return res.redirect("/recuperar-password?error=Token no proporcionado");
  }

  const usuario = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!usuario) {
    return res.render("auth/resetPassword", {
      layout: "auth",
      error: "El enlace de recuperación es inválido o ha expirado.",
      invalido: true
    });
  }

  res.render("auth/resetPassword", {
    layout: "auth",
    token: token
  });
}

async function guardarReset(req, res) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).render("auth/resetPassword", {
        layout: "auth",
        token,
        error: "Todos los campos son obligatorios"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("auth/resetPassword", {
        layout: "auth",
        token,
        error: "Las contraseñas no coinciden"
      });
    }

    const usuario = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!usuario) {
      return res.status(400).render("auth/resetPassword", {
        layout: "auth",
        error: "El token es inválido o ha expirado. Solicita un nuevo enlace.",
        invalido: true
      });
    }

    usuario.password = password; // pre-save hook lo cifrar
    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpires = null;
    await usuario.save();

    return res.redirect("/login?success=contraseña restablecida exitosamente. Ahora puedes iniciar sesión.");
  } catch (error) {
    console.error("Error al guardar nueva contraseña:", error);
    return res.status(500).render("auth/resetPassword", {
      layout: "auth",
      token: req.body.token,
      error: "Ocurri un error al restablecer la contraseña."
    });
  }
}

module.exports = {
  mostrar,
  validar,
  logout,
  activarCuenta,
  mostrarRecuperar,
  solicitarRecuperacion,
  mostrarReset,
  guardarReset
};
