const adminContoller = require("../controllers/adminContoller")
const express = require("express");
const router = express.Router();

//ter.post("/login", authController.validar )

router.get("/", adminContoller.mostrar);
//router.get("/clientes", adminContoller.clientesAdmin);
router.get("/clientes", adminContoller.ClientesToAdmin)

router.get("/deliveries", adminContoller.DeliveriesToAdmin)

router.get("/tipo-comercio", adminContoller.ListaComercios)

router.post("/tipo-comercio", adminContoller.NuevoTipoComercio)



module.exports = router;