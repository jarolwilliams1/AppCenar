const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/adminContoller");
const { requiereLogin, requiereRol } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Proteger todas las rutas de administrador
router.use(requiereLogin);
router.use(requiereRol(["Administrador"]));

// Dashboard
router.get("/", adminContoller.mostrar);
router.get("/dashboard", adminContoller.mostrar);

// Clientes
router.get("/clientes", adminContoller.ClientesToAdmin);
router.post("/clientes/:id/toggle-status", adminContoller.ToggleStatusCliente);

// Deliveries
router.get("/deliveries", adminContoller.DeliveriesToAdmin);
router.post("/deliveries/:id/toggle-status", adminContoller.ToggleStatusDelivery);

// Comercios
router.get("/comercios", adminContoller.ListaComerciosAdmin);
router.post("/comercios/:id/toggle-status", adminContoller.ToggleStatusComercio);

// configuración (ITBIS)
router.get("/configuracion", adminContoller.ConfiguracionView);
router.post("/configuracion", adminContoller.ActualizarConfiguracion);

// Administradores
router.get("/administradores", adminContoller.AdministradoresView);
router.post("/administradores", adminContoller.CrearAdmin);
router.post("/administradores/:id/editar", adminContoller.EditarAdmin);
router.post("/administradores/:id/toggle-status", adminContoller.ToggleStatusAdmin);

// Tipos de Comercio
router.get("/tipo-comercio", adminContoller.ListaComercios);
router.post("/tipo-comercio", upload.single("iconoNuevoTipoComercioAdminInput"), adminContoller.NuevoTipoComercio);
router.post("/tipo-comercio/:id/editar", upload.single("iconoNuevoTipoComercioAdminInput"), adminContoller.EditarTipoComercio);
router.post("/tipo-comercio/:id/eliminar", adminContoller.EliminarTipoComercio);

module.exports = router;
