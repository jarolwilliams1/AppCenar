const authController = require("../controllers/authController")
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.redirect("/login");
});
router.post("/login", authController.validar )

router.get("/login", authController.mostrar);

module.exports = router;