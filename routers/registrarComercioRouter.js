const express = require("express");
const router = express.Router();
const RegistrarComercioController = require("../controllers/RegistrarComercioController");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", RegistrarComercioController.mostrar);
router.post("/", upload.single("comercioInputLogo"), RegistrarComercioController.validarCrearCuentaComercio);

module.exports = router;
