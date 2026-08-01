const homecontroller = require("../controllers/homeController")
const express = require("express");
const router = express.Router();

router.get("/", homecontroller.mostrar);

module.exports = router;