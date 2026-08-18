const CDcuenta = require("../services/crearCuneta.cliente.delivery");

async function mostrar(req, res) {
  res.render("auth/registrarClient-Delivery", {
    layout: "client-delivery",
    error: req.query.error || null
  });
}

async function validarCrearCuentaCD(req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    await CDcuenta.ValidarDatos(req.body, req.file, baseUrl);

    return res.redirect("/login?success=Cuenta creada exitosamente. Te hemos enviado un correo de activación.");
  } catch (error) {
    return res.status(400).render("auth/registrarClient-Delivery", {
      layout: "client-delivery",
      error: error.message,
      datos: req.body
    });
  }
}

module.exports = { mostrar, validarCrearCuentaCD };
