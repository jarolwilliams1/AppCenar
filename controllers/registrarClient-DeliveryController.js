//const loginService = require("../services/loginService")


async function mostrar (req,res){
    res.render("auth/registrarClient-Delivery",{
        layout: "client-delivery"}
    )
}


module.exports = {mostrar}