const loginService = require("../services/loginService")


async function mostrar (req,res){
    res.render("auth/login",{
        layout: "auth"}
    )
}

async function validar(req,res)
{
        console.log(req.body)

    const usuario = await loginService.ValidarDatos(req.body)

    
}

module.exports = {mostrar, validar}