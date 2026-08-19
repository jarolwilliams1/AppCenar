const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/login", authController.mostrar);
router.post("/login", authController.validar);
router.get("/logout", authController.logout);
router.post("/logout", authController.logout);

// Activación de cuenta y aliases
router.get("/activar-cuenta/:token", authController.activarCuenta);
router.get("/activar-cuenta", authController.activarCuenta);
router.get("/activarCuenta/:token", authController.activarCuenta);
router.get("/activarCuenta", authController.activarCuenta);

// Recuperación y restablecimiento de contraseña y aliases
router.get("/recuperar-password", authController.mostrarRecuperar);
router.get("/recuperarPassword", authController.mostrarRecuperar);
router.get("/recuperar", authController.mostrarRecuperar);
router.post("/recuperar-password", authController.solicitarRecuperacion);
router.post("/recuperarPassword", authController.solicitarRecuperacion);
router.post("/recuperar", authController.solicitarRecuperacion);

router.get("/reset-password/:token", authController.mostrarReset);
router.get("/resetPassword/:token", authController.mostrarReset);
router.get("/reset-password", authController.mostrarReset);
router.get("/resetPassword", authController.mostrarReset);
router.post("/reset-password", authController.guardarReset);
router.post("/resetPassword", authController.guardarReset);

// Atajos de rutas globales inteligentes según el rol
router.get("/pedidos", (req, res) => {
  const rol = req.session && req.session.usuario ? req.session.usuario.rol : null;
  if (rol === "Cliente") return res.redirect("/cliente/pedidos");
  if (rol === "Comercio") return res.redirect("/comercio/home");
  if (rol === "Delivery") return res.redirect("/delivery/home");
  return res.redirect("/login");
});

router.get("/direcciones", (req, res) => {
  const rol = req.session && req.session.usuario ? req.session.usuario.rol : null;
  if (rol === "Cliente") return res.redirect("/cliente/direcciones");
  return res.redirect("/login");
});

router.get("/favoritos", (req, res) => {
  const rol = req.session && req.session.usuario ? req.session.usuario.rol : null;
  if (rol === "Cliente") return res.redirect("/cliente/favoritos");
  return res.redirect("/login");
});

router.get("/perfil", (req, res) => {
  const rol = req.session && req.session.usuario ? req.session.usuario.rol : null;
  if (rol === "Cliente") return res.redirect("/cliente/perfil");
  if (rol === "Comercio") return res.redirect("/comercio/perfil");
  if (rol === "Delivery") return res.redirect("/delivery/perfil");
  if (rol === "Administrador") return res.redirect("/admin/dashboard");
  return res.redirect("/login");
});

router.get(["/productos", "/producto"], (req, res) => {
  return res.redirect("/comercio/productos");
});

router.get(["/categoria", "/categorias"], (req, res) => {
  return res.redirect("/comercio/categoria");
});

router.get("/dashboard", (req, res) => {
  return res.redirect("/admin/dashboard");
});

module.exports = router;
