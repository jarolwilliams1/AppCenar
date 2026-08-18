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

// Redirecciones de registro
router.get("/registro", (req, res) => res.redirect("/registrar"));
router.get("/registrar-cliente", (req, res) => res.redirect("/registrar"));
router.get("/registrar-comercio", (req, res) => res.redirect("/registrarComercio"));

module.exports = router;
