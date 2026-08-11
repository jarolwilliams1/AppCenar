const clienteDeliveryController = require("../controllers/registrarClient-DeliveryController")
const express = require("express");
const router = express.Router();


router.get("/", clienteDeliveryController.mostrar);
router.post("/", clienteDeliveryController.validarCrearCuentaCD)
module.exports = router;