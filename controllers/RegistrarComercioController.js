const ComercioCuenta = require("../services/crearComercioService");
const tipoComercioModel = require("../models/TipoComercioModel");

async function mostrar(req, res) {
  const TiposComerciosDB = await tipoComercioModel.GetTiposComercio();
  const listaTiposComercio = TiposComerciosDB.map(t => t.toObject());

  return res.render("auth/RegistrarComenrce", {
    layout: "client-delivery",
    listaTiposComercio,
    error: req.query.error || null
  });
}

async function validarCrearCuentaComercio(req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    await ComercioCuenta.ValidarDatos(req.body, req.file, baseUrl);

    return res.redirect("/login?success=Comercio registrado exitosamente. Te hemos enviado un correo de activación.");
  } catch (error) {
    const TiposComerciosDB = await tipoComercioModel.GetTiposComercio();
    const listaTiposComercio = TiposComerciosDB.map(t => t.toObject());

    const userMsg = (error && error.message && !error.message.includes("Mongo") && !error.message.includes("E11000")) 
      ? error.message 
      : "No se pudo registrar el comercio. Por favor verifica tus datos e intenta nuevamente.";

    return res.status(400).render("auth/RegistrarComenrce", {
      layout: "client-delivery",
      error: userMsg,
      datos: req.body,
      listaTiposComercio
    });
  }
}

module.exports = { mostrar, validarCrearCuentaComercio };
