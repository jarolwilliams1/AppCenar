const usermodel = require("../models/userModel")
//const TipoComercioServices = require("../services/crearTipoComercioServices")
const tipoComercioModel = require("../models/TipoComercioModel")
const NuevaCategoriaComercioService = require("../services/nuevaCetegoriaComercioService")

async function mostrar (req,res){
    res.render("store/home",{
        layout: "comerce"}
    )
}

async function mostrarCategoria(req, res) {
    res.render("store/categorias",{
         layout: "comerce" }
    )
    }

async function NuevaCategoria(req, res) {
    // OBTENER EL ID DIRECTAMENTE DE LA SESIÓN ACTIVA
    const comercioId = req.session.usuario.id;

    const nuevaCatComercio = NuevaCategoriaComercioService.Validar(req.body, comercioId)
    return nuevaCatComercio;
   res.redirect('/comercio/categoria');
    
 }

 
 

module.exports={mostrar, mostrarCategoria, NuevaCategoria}