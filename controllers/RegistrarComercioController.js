const ComercioCuenta = require("../services/crearComercioService")

const tipoComercioModel = require("../models/TipoComercioModel")

async function mostrar (req,res){
      const TiposComerciosDB = await tipoComercioModel.GetTiposComercio();

        // Convertir documentos de Mongoose a objetos planos para Handlebars
const listaTiposComercio = TiposComerciosDB.map(TiposComercios => TiposComercios.toObject());

    console.log(TiposComerciosDB)
    res.render("auth/RegistrarComenrce",{
        layout: "comerce",
                 listaTiposComercio   
         }
        
    )

     


}


async function validarCrearCuentaComercio(req, res) {
    try {
       
        console.log(req.body);
      ComercioCuenta.ValidarDatos(req.body)

        // Redirigir si el login es exitoso
        return res.redirect("/login"); 
    } catch (error) {
        return res.status(400).render("auth/RegistrarComenrce", {
            layout: "comerce",
            error: error.message,
            datos: req.body,
             listaTiposComercio
        });
    }

    
    return usuario;
}



module.exports = {mostrar, validarCrearCuentaComercio }