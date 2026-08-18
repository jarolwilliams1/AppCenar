const express = require("express");
const router = express.Router();
const clienteDeliveryController = require("../controllers/registrarClient-DeliveryController");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", clienteDeliveryController.mostrar);
router.post("/", upload.single("fotoCDInput"), clienteDeliveryController.validarCrearCuentaCD);

module.exports = router;
