const clienteController = require("../controllers/clienteController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )

router.get("/", clienteController.mostrar);

module.exports = router;