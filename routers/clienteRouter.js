const clienteController = require("../controllers/clienteController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )

router.get("/", clienteController.mostrar);
router.get("/perfil", clienteController.perfil )

module.exports = router;