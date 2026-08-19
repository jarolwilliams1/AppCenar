const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de cliente
router.use(requiereLogin);
router.use(requiereRol(["Cliente"]));

// Home y catálogo
router.get(["/", "/home"], clienteController.mostrar);
router.get(["/home/comercios/:id", "/comercios/:id", "/comercios-por-tipo/:id"], clienteController.VerComerciosPorTipo);
router.get(["/comercio/:id", "/catalogo/:id", "/menu/:id"], clienteController.CatalogoComercio);

// Checkout y Pedidos
router.get(["/checkout/:comercioId", "/checkout/:comercioId/nuevo"], clienteController.Checkout);
router.post("/crear-pedido", clienteController.CrearPedido);
router.get(["/pedidos", "/mis-pedidos", "/pedido"], clienteController.MisPedidos);
router.get(["/pedidos/:id", "/pedido/:id", "/pedidos/detalle/:id"], clienteController.DetallePedido);

// Direcciones (CRUD completo con todos los aliases)
router.get(["/direcciones", "/mis-direcciones", "/direccion"], clienteController.Misdirecciones);
router.post(["/direcciones", "/mis-direcciones", "/direccion"], clienteController.CrearDireccion);
router.post(["/direcciones/:id/editar", "/direccion/:id/editar", "/direcciones/editar/:id", "/direccion/editar/:id"], clienteController.EditarDireccion);
router.get(["/direcciones/:id/editar", "/direccion/:id/editar", "/direcciones/editar/:id", "/direccion/editar/:id"], clienteController.EditarDireccion);
router.post(["/direcciones/:id/eliminar", "/direccion/:id/eliminar", "/direcciones/eliminar/:id", "/direccion/eliminar/:id", "/direcciones/delete/:id"], clienteController.EliminarDireccion);
router.get(["/direcciones/:id/eliminar", "/direccion/:id/eliminar", "/direcciones/eliminar/:id", "/direccion/eliminar/:id", "/direcciones/delete/:id"], clienteController.EliminarDireccion);

// Favoritos
router.get(["/favoritos", "/mis-favoritos", "/favorito"], clienteController.MisFavoritos);
router.post(["/favoritos/toggle/:comercioId", "/favorito/toggle/:comercioId", "/favoritos/:comercioId/toggle"], clienteController.ToggleFavorito);
router.get(["/favoritos/toggle/:comercioId", "/favorito/toggle/:comercioId", "/favoritos/:comercioId/toggle"], clienteController.ToggleFavorito);
router.post(["/favoritos/remove/:comercioId", "/favorito/remove/:comercioId", "/favoritos/eliminar/:comercioId"], clienteController.RemoverFavorito);
router.get(["/favoritos/remove/:comercioId", "/favorito/remove/:comercioId", "/favoritos/eliminar/:comercioId"], clienteController.RemoverFavorito);

// Perfil
router.get(["/perfil", "/mi-perfil"], clienteController.Perfil);
router.post(["/perfil", "/mi-perfil"], upload.any(), clienteController.ActualizarPerfil);

module.exports = router;
