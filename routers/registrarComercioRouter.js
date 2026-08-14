const RegistrarComercioController = require("../controllers/RegistrarComercioController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )

router.get("/", RegistrarComercioController.mostrar);
router.post("/", RegistrarComercioController.validarCrearCuentaComercio)
module.exports = router;