const CDcuenta = require("../services/crearCuneta.cliente.delivery")


async function mostrar (req,res){
    res.render("auth/registrarClient-Delivery",{
        layout: "client-delivery"}
    )
}

async function validarCrearCuentaCD(req, res) {
    try {
        console.log(req.body);
        const usuario = await CDcuenta.ValidarDatos(req.body);
        
        // Redirigir si el login es exitoso
        return res.redirect("/login"); 
    } catch (error) {
        return res.status(400).render("auth/registrarClient-Delivery", {
            layout: "client-delivery",
            error: error.message,
            datos: req.body
        });
    }
    return usuario;
}



module.exports = {mostrar, validarCrearCuentaCD}