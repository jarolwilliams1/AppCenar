const ComercioCuenta = require("../services/crearComercioService")


async function mostrar (req,res){
    res.render("auth/RegistrarComenrce",{
        layout: "comerce"}
    )
}


async function validarCrearCuentaComercio(req, res) {
    try {
        console.log(req.body);
        const usuario = await ComercioCuenta.ValidarDatos(req.body);
        
        // Redirigir si el login es exitoso
        return res.redirect("/login"); 
    } catch (error) {
        return res.status(400).render("auth/RegistrarComenrce", {
            layout: "comerce",
            error: error.message,
            datos: req.body
        });
    }
    return usuario;
}


module.exports = {mostrar, validarCrearCuentaComercio }