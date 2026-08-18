const clienteController = require("../controllers/clienteController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )
router.get("/home", clienteController.mostrar);
router.get("/perfil", clienteController.perfil );
router.get('/home/comercios/:id', clienteController.VerComerciosPorTipo);
//router.get("/home", clienteController.Home);

const docker = "dckr_pat_ECiSP7XJVvXZmiNeaZX7Ul_OGpw";
module.exports = router;