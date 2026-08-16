const loginService = require("../services/loginService");


async function mostrar(req, res) {
    res.render("auth/login", {
        layout: "auth"
    });
}

async function validar(req, res) {
    try {
        console.log(req.body);
        const usuario = await loginService.IniciarSesion(req.body);
       // console.log(usuario.idUsuario) // id comercio
// GUARDAR EN LA SESIÓN: Queda disponible para todas las solicitudes futuras
    // 1. GUARDAR EN LA SESIÓN
    req.session.usuario = {
      id: usuario.idUsuario,
      rol: usuario.rol
    };
        // Redirigir si el login es exitoso
        switch(usuario.rol){
            case "Cliente":
        return res.redirect("/cliente/home"); 

            
            break;

             case "Delivery":
        return res.redirect("/cliente"); 

            
            break;


             case "Administrador":
        return res.redirect("/admin"); 

            
            break;


             case "Comercio":
        return res.redirect("/comercio/home"); 

            
            break;
        }
    } catch (error) {
        return res.status(400).render("auth/login", {
            layout: "auth",
            error: error.message,
            datos: req.body
        });
    }
}

async function Entrar(req, res) 
{
 const datos = await loginService.IniciarSesionModel(req.body);
 console.log(datos)

}



module.exports = { mostrar, validar };