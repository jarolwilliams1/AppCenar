const usermodel = require("../models/userModel")
//const TipoComercioServices = require("../services/crearTipoComercioServices")
const tipoComercioModel = require("../models/TipoComercioModel")
const NuevaCategoriaComercioService = require("../services/nuevaCetegoriaComercioService")
const TipoCategoriaModel = require("../models/categoriaModel")
const NuevoProductoService = require("../services/NuevoProductoService");
const productossModel = require("../models/ProductoModel");
async function mostrar (req,res){

    
    res.render("store/home",{
        layout: "comerce"}
    )
}

async function mostrarCategoria(req, res) {

     try {
            const comercioId = req.session.usuario.id;

            const TiposCategoria = await TipoCategoriaModel.GetCategoriasToComerce(comercioId);
    
            // Convertir documentos de Mongoose a objetos planos para Handlebars
    const CategoriaLista = TiposCategoria.map(categoria => categoria.toObject());
    
    res.render("store/categorias",{
        layout: "comerce", CategoriaLista}
    )
    
   // res.render("admin/clientes",{
             //layout: "admin", listaClientes })
       // console.log(clientesBD)
    } catch (error) {
        console.error("Error al obtener categorias:", error);
        res.status(500).send("Error del servidor");
      }
    //res.render("store/categorias",{
       //  layout: "comerce" }
   // )
    }

async function NuevaCategoria(req, res) {
    // OBTENER EL ID DIRECTAMENTE DE LA SESIÓN ACTIVA
    const comercioId = req.session.usuario.id;

    const nuevaCatComercio = NuevaCategoriaComercioService.Validar(req.body, comercioId)
    return nuevaCatComercio;
   res.redirect('/comercio/categoria');
    
 }

 

 async function ProductsView(req, res)
 {
      const comercioId = req.session.usuario.id;

            const TiposCategoria = await TipoCategoriaModel.GetCategoriasToComerce(comercioId);
         
            // Convertir documentos de Mongoose a objetos planos para Handlebars
    const CategoriaLista = TiposCategoria.map(categoria => categoria.toObject());

    // 2. Extraer todos los _id de las categorías
    const categoriasIds = CategoriaLista.map(c => c._id);
   // console.log(categoriasIds);

    const products = await productossModel.GetProductosToComerceById( comercioId, categoriasIds)

        const productsList = products.map(producto => producto.toObject());

    console.log(productsList);
    res.render("store/productos", {
        layout: "comerce", CategoriaLista , productsList
    })

 }


 
 async function NuevoProducto(req, res){
        const comercioId = req.session.usuario.id;
    const Producto = NuevoProductoService.ValidarDatos(req.body, comercioId);
   return await Producto;
 }

module.exports={mostrar, mostrarCategoria, NuevaCategoria, ProductsView, NuevoProducto}