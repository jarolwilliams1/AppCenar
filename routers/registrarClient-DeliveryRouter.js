const clienteDeliveryController = require("../controllers/registrarClient-DeliveryController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )

router.get("/", clienteDeliveryController.mostrar);

module.exports = router;