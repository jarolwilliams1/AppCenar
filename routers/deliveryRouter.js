const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de delivery
router.use(requiereLogin);
router.use(requiereRol(["Delivery"]));

// Asignaciones
router.get("/home", deliveryController.mostrar);
router.get("/asignaciones", deliveryController.mostrar);
router.get("/pedidos/:id", deliveryController.DetallePedido);
router.post("/pedidos/:id/completar", deliveryController.CompletarPedido);

// Perfil
router.get("/perfil", deliveryController.Perfil);
router.post("/perfil", upload.single("fotoPerfil"), deliveryController.ActualizarPerfil);

module.exports = router;
