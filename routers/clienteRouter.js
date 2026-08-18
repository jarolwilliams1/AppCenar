const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de cliente
router.use(requiereLogin);
router.use(requiereRol(["Cliente"]));

// Home y catálogo
router.get("/home", clienteController.mostrar);
router.get("/home/comercios/:id", clienteController.VerComerciosPorTipo);
router.get("/comercio/:id", clienteController.CatalogoComercio);

// Checkout y Pedidos
router.get("/checkout/:comercioId", clienteController.Checkout);
router.post("/crear-pedido", clienteController.CrearPedido);
router.get("/pedidos", clienteController.MisPedidos);
router.get("/pedidos/:id", clienteController.DetallePedido);

// direcciones
router.get("/direcciones", clienteController.Misdirecciones);
router.post("/direcciones", clienteController.CrearDireccion);
router.post("/direcciones/:id/editar", clienteController.EditarDireccion);
router.post("/direcciones/:id/eliminar", clienteController.EliminarDireccion);

// Favoritos
router.get("/favoritos", clienteController.MisFavoritos);
router.post("/favoritos/toggle/:comercioId", clienteController.ToggleFavorito);
router.post("/favoritos/remove/:comercioId", clienteController.RemoverFavorito);

// Perfil
router.get("/perfil", clienteController.Perfil);
router.post("/perfil", upload.single("fotoPerfil"), clienteController.ActualizarPerfil);

module.exports = router;
