const express = require("express");
const router = express.Router();
const ComercioController = require("../controllers/ComercioController");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de comercio
router.use(requiereLogin);
router.use(requiereRol(["Comercio"]));

// Home / Pedidos
router.get(["/", "/home"], ComercioController.mostrar);
router.get("/pedidos", ComercioController.mostrar);
router.post(["/pedidos/:id/asignar-delivery", "/pedido/:id/asignar-delivery"], ComercioController.AsignarDelivery);

// Categorías (CRUD completo con todos los aliases y métodos)
router.get(["/categoria", "/categorias"], ComercioController.mostrarCategoria);
router.post(["/categoria", "/categorias"], ComercioController.NuevaCategoria);

router.post(["/categoria/:id/editar", "/categorias/:id/editar", "/categoria/editar/:id", "/categorias/editar/:id"], ComercioController.EditarCategoria);
router.get(["/categoria/:id/editar", "/categorias/:id/editar", "/categoria/editar/:id", "/categorias/editar/:id"], ComercioController.EditarCategoria);

router.post(["/categoria/:id/eliminar", "/categorias/:id/eliminar", "/categoria/eliminar/:id", "/categorias/eliminar/:id", "/categoria/delete/:id", "/categorias/delete/:id"], ComercioController.EliminarCategoria);
router.get(["/categoria/:id/eliminar", "/categorias/:id/eliminar", "/categoria/eliminar/:id", "/categorias/eliminar/:id", "/categoria/delete/:id", "/categorias/delete/:id"], ComercioController.EliminarCategoria);

// Productos (CRUD completo con todos los aliases y métodos)
router.get(["/productos", "/producto"], ComercioController.ProductsView);
router.post(["/productos", "/producto"], upload.any(), ComercioController.NuevoProducto);

router.post(["/productos/:id/editar", "/producto/:id/editar", "/productos/editar/:id", "/producto/editar/:id"], upload.any(), ComercioController.EditarProducto);
router.get(["/productos/:id/editar", "/producto/:id/editar", "/productos/editar/:id", "/producto/editar/:id"], ComercioController.EditarProducto);

router.post(["/productos/:id/eliminar", "/producto/:id/eliminar", "/productos/eliminar/:id", "/producto/eliminar/:id", "/productos/delete/:id", "/producto/delete/:id"], ComercioController.EliminarProducto);
router.get(["/productos/:id/eliminar", "/producto/:id/eliminar", "/productos/eliminar/:id", "/producto/eliminar/:id", "/productos/delete/:id", "/producto/delete/:id"], ComercioController.EliminarProducto);

// Perfil
router.get("/perfil", ComercioController.Perfil);
router.post("/perfil", upload.any(), ComercioController.ActualizarPerfil);

module.exports = router;
