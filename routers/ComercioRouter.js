const express = require("express");
const router = express.Router();
const ComercioController = require("../controllers/ComercioController");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de comercio
router.use(requiereLogin);
router.use(requiereRol(["Comercio"]));

// Home / Pedidos
router.get("/home", ComercioController.mostrar);
router.get("/pedidos", ComercioController.mostrar);
router.post("/pedidos/:id/asignar-delivery", ComercioController.AsignarDelivery);

// categorías
router.get("/categoria", ComercioController.mostrarCategoria);
router.post("/categoria", ComercioController.NuevaCategoria);
router.post("/categoria/:id/editar", ComercioController.EditarCategoria);
router.post("/categoria/:id/eliminar", ComercioController.EliminarCategoria);

// Productos
router.get("/productos", ComercioController.ProductsView);
router.post("/productos", upload.single("FotoProductoNuevo"), ComercioController.NuevoProducto);
router.post("/productos/:id/editar", upload.single("FotoProductoNuevo"), ComercioController.EditarProducto);
router.post("/productos/:id/eliminar", ComercioController.EliminarProducto);

// Perfil
router.get("/perfil", ComercioController.Perfil);
router.post("/perfil", upload.single("logoComercio"), ComercioController.ActualizarPerfil);

module.exports = router;
