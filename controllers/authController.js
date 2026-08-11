const loginService = require("../services/loginService");

async function mostrar(req, res) {
    res.render("auth/login", {
        layout: "auth"
    });
}

async function validar(req, res) {
    try {
        console.log(req.body);
        const usuario = await loginService.ValidarDatos(req.body);
        
        // Redirigir si el login es exitoso
        return res.redirect("/client"); 
    } catch (error) {
        return res.status(400).render("auth/login", {
            layout: "auth",
            error: error.message,
            datos: req.body
        });
    }
}

module.exports = { mostrar, validar };