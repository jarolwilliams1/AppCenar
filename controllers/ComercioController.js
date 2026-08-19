const mongoose = require("mongoose");
const { User, Comercio, Delivery } = require("../models/userModel");
const { TipoComercio } = require("../models/TipoComercioModel");
const { Categoria, CrearCategoria, GetCategoriasToComerce } = require("../models/categoriaModel");
const { Producto, CrearProducto } = require("../models/ProductoModel");
const Pedido = require("../models/pedidoModel");
const NuevaCategoriaComercioService = require("../services/nuevaCetegoriaComercioService");
const NuevoProductoService = require("../services/NuevoProductoService");

// HOME / PEDIDOS RECIBIDOS
async function mostrar(req, res) {
  try {
    const comercioId = req.session.usuario.id;

    // Listar pedidos ordenados del más reciente al más antiguo
    const pedidos = await Pedido.find({ comercioId })
      .populate("clienteId", "nombre apellido telefono correo")
      .populate("deliveryId", "nombre apellido telefono")
      .sort({ createdAt: -1 })
      .lean();

    // métricas rpidas del comercio
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const pedidosHoy = pedidos.filter(p => new Date(p.createdAt) >= hoy).length;
    const ingresosTotal = pedidos
      .filter(p => p.estado === "completado")
      .reduce((sum, p) => sum + p.total, 0);
    const totalProductos = await Producto.countDocuments({ comercioId, isActive: true });

    res.render("store/home", {
      layout: "comerce",
      pedidos,
      pedidosHoy,
      ingresosTotal,
      totalProductos,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en home comercio:", error);
    res.render("store/home", {
      layout: "comerce",
      pedidos: [],
      error: "Error al cargar los pedidos del comercio"
    });
  }
}

// ASIGNAR DELIVERY automáticamente
async function AsignarDelivery(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const pedidoId = req.params.id;

    const pedido = await Pedido.findOne({ _id: pedidoId, comercioId });
    if (!pedido) {
      return res.redirect("/comercio/home?error=Pedido no encontrado");
    }

    if (pedido.estado !== "pendiente") {
      return res.redirect("/comercio/home?error=Solo se puede asignar delivery a pedidos en estado pendiente");
    }

    // Buscar un delivery activo y disponible
    const deliveryDisponible = await Delivery.findOne({
      rol: "Delivery",
      isActive: true,
      estadoDelivery: "Disponible"
    });

    if (!deliveryDisponible) {
      return res.redirect("/comercio/home?error=No hay ningún repartidor disponible en este momento. Por favor intente más tarde.");
    }

    // Asignar pedido y actualizar estados
    pedido.deliveryId = deliveryDisponible._id;
    pedido.estado = "en_proceso";
    await pedido.save();

    deliveryDisponible.estadoDelivery = "Ocupado";
    await deliveryDisponible.save();

    res.redirect("/comercio/home?success=Repartidor asignado con éxito. El pedido está ahora en proceso.");
  } catch (error) {
    console.error("Error al asignar delivery:", error);
    res.redirect("/comercio/home?error=Error al asignar delivery al pedido");
  }
}

// categorías (CRUD)
async function mostrarCategoria(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const categorias = await Categoria.find({
      $or: [
        { comercioId: comercioId },
        { comercioId: new mongoose.Types.ObjectId(comercioId) }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Contar productos asociados a cada categoría garantizando que sea número entero
    for (let i = 0; i < categorias.length; i++) {
      const cat = categorias[i];
      const count = await Producto.countDocuments({
        $or: [
          { categoriaId: cat._id },
          { categoriaId: new mongoose.Types.ObjectId(cat._id) },
          { categoriaId: cat._id.toString() }
        ],
        isActive: { $ne: false }
      });
      categorias[i].productosCount = Number(count || 0);
    }

    const editId = req.query.edit || null;
    let categoriaEdit = null;
    if (editId) {
      categoriaEdit = await Categoria.findById(editId).lean();
    }

    return res.render("store/categorias", {
      layout: "comerce",
      CategoriaLista: categorias,
      categoriaEdit,
      modoEdicion: !!categoriaEdit,
      mostrarForm: req.query.nueva === "1" || !!categoriaEdit
    });
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    return res.status(500).render("store/categorias", {
      layout: "comerce",
      CategoriaLista: [],
      error: "Error del servidor al obtener categorías"
    });
  }
}

async function NuevaCategoria(req, res) {
  const comercioId = req.session && req.session.usuario ? (req.session.usuario.id || req.session.usuario._id) : null;
  try {
    await NuevaCategoriaComercioService.Validar(req.body, comercioId);
    return res.redirect("/comercio/categoria?success=Categoría creada exitosamente");
  } catch (error) {
    console.error("Error en NuevaCategoria:", error);
    return res.redirect(`/comercio/categoria?error=${encodeURIComponent(error.message || "No se pudo crear la categoría")}`);
  }
}

async function EditarCategoria(req, res) {
  const categoriaId = req.params.id || req.body.id || req.query.id;
  try {
    const nombre = (req.body.nombre || req.body.nombreNuevaCategoriaInput || "").trim();
    const descripcion = (req.body.descripcion || req.body.descripcionNuevaCategoriaInput || "").trim();

    if (!nombre || !descripcion) {
      return res.redirect("/comercio/categoria?error=Todos los campos son requeridos");
    }

    const cat = await Categoria.findById(categoriaId);
    if (!cat) {
      return res.redirect("/comercio/categoria?error=Categoría no encontrada");
    }

    cat.nombre = nombre;
    cat.descripcion = descripcion;
    await cat.save();

    return res.redirect("/comercio/categoria?success=Categoría actualizada correctamente");
  } catch (error) {
    console.error("Error al editar categoría:", error);
    return res.redirect(`/comercio/categoria?error=${encodeURIComponent(error.message)}`);
  }
}

async function EliminarCategoria(req, res) {
  try {
    const categoriaId = req.params.id || req.body.id || req.query.id;
    if (categoriaId) {
      await Categoria.findByIdAndDelete(categoriaId);
      await Producto.deleteMany({
        $or: [
          { categoriaId: categoriaId },
          ...(mongoose.Types.ObjectId.isValid(categoriaId) ? [{ categoriaId: new mongoose.Types.ObjectId(categoriaId) }] : [])
        ]
      });
    }
    return res.redirect("/comercio/categoria?success=Categoría eliminada exitosamente");
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.redirect("/comercio/categoria?error=Error al eliminar la categoría");
  }
}

// PRODUCTOS (CRUD)
async function ProductsView(req, res) {
  try {
    const comercioId = req.session && req.session.usuario ? (req.session.usuario.id || req.session.usuario._id) : null;
    
    // Obtener todas las categorías del comercio
    const categorias = await Categoria.find({
      $or: [
        { comercioId: comercioId },
        ...(mongoose.Types.ObjectId.isValid(comercioId) ? [{ comercioId: new mongoose.Types.ObjectId(comercioId) }] : [])
      ]
    }).sort({ createdAt: -1 }).lean();

    // Obtener productos activos de este comercio
    const productos = await Producto.find({
      $or: [
        { comercioId: comercioId },
        ...(mongoose.Types.ObjectId.isValid(comercioId) ? [{ comercioId: new mongoose.Types.ObjectId(comercioId) }] : [])
      ],
      isActive: { $ne: false }
    })
      .populate("categoriaId")
      .sort({ createdAt: -1 })
      .lean();

    const editId = req.query.edit || null;
    let productoEdit = null;
    if (editId) {
      productoEdit = await Producto.findById(editId).lean();
    }

    return res.render("store/productos", {
      layout: "comerce",
      CategoriaLista: categorias,
      productsList: productos,
      productoEdit,
      modoEdicion: !!productoEdit,
      mostrarForm: req.query.nuevo === "1" || !!productoEdit
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).render("store/productos", {
      layout: "comerce",
      CategoriaLista: [],
      productsList: [],
      error: "Error del servidor al obtener productos"
    });
  }
}

async function NuevoProducto(req, res) {
  try {
    const comercioId = req.session && req.session.usuario ? (req.session.usuario.id || req.session.usuario._id) : null;
    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

    await NuevoProductoService.ValidarDatos(req.body, comercioId, file);
    return res.redirect("/comercio/productos?success=Producto creado exitosamente");
  } catch (error) {
    console.error("Error en NuevoProducto:", error);
    return res.redirect(`/comercio/productos?error=${encodeURIComponent(error.message || "No se pudo crear el producto")}`);
  }
}

async function EditarProducto(req, res) {
  try {
    const productoId = req.params.id || req.body.id || req.query.id;
    const nombre = (req.body.nombre || req.body.NombreNuevoPorducto || "").trim();
    const descripcion = (req.body.descripcion || req.body.DescripcionNuevoProducto || "").trim();
    const precio = Number(req.body.precio || req.body.PrecioNuevoProducto || 0);
    const categoriaId = req.body.categoriaId || req.body.CategoriaNuevoProducto;

    if (!nombre || !descripcion || !precio || !categoriaId) {
      return res.redirect("/comercio/productos?error=Todos los campos son requeridos");
    }

    const prod = await Producto.findById(productoId);
    if (!prod) {
      return res.redirect("/comercio/productos?error=Producto no encontrado");
    }

    prod.nombre = nombre;
    prod.descripcion = descripcion;
    prod.precio = precio;
    prod.categoriaId = mongoose.Types.ObjectId.isValid(categoriaId) ? new mongoose.Types.ObjectId(categoriaId) : categoriaId;

    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (file) {
      prod.foto = `/uploads/${file.filename}`;
    }

    await prod.save();
    return res.redirect("/comercio/productos?success=Producto actualizado exitosamente");
  } catch (error) {
    console.error("Error al editar producto:", error);
    return res.redirect(`/comercio/productos?error=${encodeURIComponent(error.message)}`);
  }
}

async function EliminarProducto(req, res) {
  try {
    const productoId = req.params.id || req.body.id || req.query.id;
    if (productoId) {
      await Producto.findByIdAndDelete(productoId);
    }
    return res.redirect("/comercio/productos?success=Producto eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.redirect("/comercio/productos?error=Error al eliminar el producto");
  }
}

// PERFIL DE COMERCIO
async function Perfil(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const comercio = await Comercio.findById(comercioId).lean();

    res.render("store/perfil", {
      layout: "comerce",
      comercio,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en Perfil Comercio:", error);
    res.redirect("/comercio/home?error=Error al cargar perfil del comercio");
  }
}

async function ActualizarPerfil(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const { nombreComercio, telefono, horaApertura, horaCierre } = req.body;

    if (!nombreComercio || !telefono || !horaApertura || !horaCierre) {
      return res.redirect("/comercio/perfil?error=Todos los campos son obligatorios");
    }

    const comercio = await Comercio.findById(comercioId);
    if (!comercio) {
      return res.redirect("/login");
    }

    comercio.nombreComercio = nombreComercio.trim();
    comercio.telefono = telefono.trim();
    comercio.horaApertura = horaApertura.trim();
    comercio.horaCierre = horaCierre.trim();

    if (req.file) {
      comercio.logoComercio = `/uploads/${req.file.filename}`;
      req.session.usuario.foto = comercio.logoComercio;
    }

    await comercio.save();
    req.session.usuario.nombre = comercio.nombreComercio;

    res.redirect("/comercio/perfil?success=Perfil de comercio actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar perfil comercio:", error);
    res.redirect("/comercio/perfil?error=Error al guardar cambios");
  }
}

module.exports = {
  mostrar,
  AsignarDelivery,
  mostrarCategoria,
  NuevaCategoria,
  EditarCategoria,
  EliminarCategoria,
  ProductsView,
  NuevoProducto,
  EditarProducto,
  EliminarProducto,
  Perfil,
  ActualizarPerfil
};
