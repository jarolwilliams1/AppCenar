const ComercioController = require("../controllers/ComercioController")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )
router.get("/home", ComercioController.mostrar);
router.get("/categoria", ComercioController.mostrarCategoria);
router.get("/productos", ComercioController.ProductsView);
router.post("/productos", ComercioController.NuevoProducto);
router.post("/categoria", ComercioController.NuevaCategoria);


module.exports = router;