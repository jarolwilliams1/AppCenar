
const usermodel = require("../models/userModel")
const TipoComercioServices = require("../services/crearTipoComercioServices")
const tipoComercioModel = require("../models/TipoComercioModel")

async function mostrar (req,res){
    res.render("admin/dashboard",{
        layout: "admin"}
    )
}

//async function clientesAdmin(req, res) {
    //res.render("admin/clientes",{
         //layout: "admin" }
   // )
  
//}

// /admin/tipo-comercio

async function ClientesToAdmin(req, res)
 {
    try {
        const clientesBD = await usermodel.GetClientesToAdmin();

        // Convertir documentos de Mongoose a objetos planos para Handlebars
const listaClientes = clientesBD.map(cliente => cliente.toObject());



res.render("admin/clientes",{
         layout: "admin", listaClientes })
    console.log(clientesBD)
} catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send("Error del servidor");
  }
}

async function DeliveriesToAdmin(req, res)
 {
    try {
        const deliveriesBD = await usermodel.GetDeliveriesToAdmin();

        // Convertir documentos de Mongoose a objetos planos para Handlebars
const listaDeliveries = deliveriesBD.map(cliente => cliente.toObject());



res.render("admin/deliveries",{
         layout: "admin", listaDeliveries })
    console.log(deliveriesBD)
} catch (error) {
    console.error("Error al obtener Deliveries:", error);
    res.status(500).send("Error del servidor");
  }
}

async function ListaComercios(req, res)
 {
    try {
        const TiposComerciosDB = await tipoComercioModel.GetTiposComercio();

        // Convertir documentos de Mongoose a objetos planos para Handlebars
const listaTiposComercio = TiposComerciosDB.map(TiposComercios => TiposComercios.toObject());



res.render("admin/tipoComercio",{
         layout: "admin", listaTiposComercio })
    console.log(TiposComerciosDB)

} catch (error) {
    console.error("Error al obtener los comercios:", error);
    res.status(500).send("Error del servidor");
  }
}

async function NuevoTipoComercio(req, res) {
    const nuevoTipo = TipoComercioServices.ValidarDatos(req.body)
    console.log(nuevoTipo)
}


module.exports ={mostrar,  ClientesToAdmin, DeliveriesToAdmin, ListaComercios, NuevoTipoComercio}