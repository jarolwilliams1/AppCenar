const clienteController = require("../controllers/clienteController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )
router.get("/home", clienteController.mostrar);
router.get("/perfil", clienteController.perfil );
//router.get("/home", clienteController.Home);


module.exports = router;