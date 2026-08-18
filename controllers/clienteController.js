

const tipoComercioModel = require("../models/TipoComercioModel")

async function mostrar (req,res){
        const TiposComerciosDB = await tipoComercioModel.GetTiposComercio();
    
            // Convertir documentos de Mongoose a objetos planos para Handlebars
    const listaTiposComercio = TiposComerciosDB.map(TiposComercios => TiposComercios.toObject());
    
    
    res.render("client/home",{
        layout: "client", listaTiposComercio}
    )
}

async function perfil(req, res) {
    res.render("client/perfil",{
         layout: "client" }
    )
    }

async function Home(req, res) {
    res.render("client/home",{
         layout: "client" }
    )
    }


async function VerComerciosPorTipo(req, res) 
{
    

    res.render("client/ComerciosPorTipo",{
        layout: "client"
    })
    
}
    

module.exports = {mostrar, perfil, Home, VerComerciosPorTipo}