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

    res.redirect("/comercio/home?success=Repartidor asignado con ééxito. El pedido está ahora en proceso.");
  } catch (error) {
    console.error("Error al asignar delivery:", error);
    res.redirect("/comercio/home?error=Error al asignar delivery al pedido");
  }
}

// categorías (CRUD)
async function mostrarCategoria(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const categorias = await Categoria.find({ comercioId }).sort({ createdAt: -1 }).lean();

    // Contar productos asociados a cada categoría
    for (const cat of categorias) {
      cat.productosCount = await Producto.countDocuments({
        comercioId,
        categoriaId: cat._id,
        isActive: true
      });
    }

    const editId = req.query.edit || null;
    let categoriaEdit = null;
    if (editId) {
      categoriaEdit = await Categoria.findOne({ _id: editId, comercioId }).lean();
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
  const comercioId = req.session.usuario.id;
  try {
    await NuevaCategoriaComercioService.Validar(req.body, comercioId);
    return res.redirect("/comercio/categoria?success=categoría creada exitosamente");
  } catch (error) {
    return res.redirect(`/comercio/categoria?error=${encodeURIComponent(error.message || "No se pudo crear la categoría")}&nueva=1`);
  }
}

async function EditarCategoria(req, res) {
  const comercioId = req.session.usuario.id;
  const categoriaId = req.params.id;
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.redirect(`/comercio/categoria?error=Todos los campos son requeridos&edit=${categoriaId}`);
    }

    const cat = await Categoria.findOne({ _id: categoriaId, comercioId });
    if (!cat) {
      return res.redirect("/comercio/categoria?error=categoría no encontrada");
    }

    cat.nombre = nombre.trim();
    cat.descripcion = descripcion.trim();
    await cat.save();

    return res.redirect("/comercio/categoria?success=categoría actualizada correctamente");
  } catch (error) {
    console.error("Error al editar categoría:", error);
    return res.redirect(`/comercio/categoria?error=${encodeURIComponent(error.message)}`);
  }
}

async function EliminarCategoria(req, res) {
  const comercioId = req.session.usuario.id;
  const categoriaId = req.params.id;
  try {
    await Categoria.findOneAndDelete({ _id: categoriaId, comercioId });
    // Opcional: inactivar o eliminar productos de esa categoría
    await Producto.updateMany({ categoriaId, comercioId }, { isActive: false });

    return res.redirect("/comercio/categoria?success=categoría eliminada exitosamente");
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.redirect("/comercio/categoria?error=Error al eliminar categoría");
  }
}

// PRODUCTOS (CRUD)
async function ProductsView(req, res) {
  try {
    const comercioId = req.session.usuario.id;
    const categorias = await Categoria.find({ comercioId }).lean();
    const productos = await Producto.find({ comercioId, isActive: true })
      .populate("categoriaId")
      .sort({ createdAt: -1 })
      .lean();

    const editId = req.query.edit || null;
    let productoEdit = null;
    if (editId) {
      productoEdit = await Producto.findOne({ _id: editId, comercioId }).lean();
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
  const comercioId = req.session.usuario.id;
  try {
    await NuevoProductoService.ValidarDatos(req.body, comercioId, req.file);
    return res.redirect("/comercio/productosísuccess=Producto creado exitosamente");
  } catch (error) {
    return res.redirect(`/comercio/productosíerror=${encodeURIComponent(error.message || "No se pudo crear el producto")}&nuevo=1`);
  }
}

async function EditarProducto(req, res) {
  const comercioId = req.session.usuario.id;
  const productoId = req.params.id;
  try {
    const { nombre, descripcion, precio, categoriaId } = req.body;
    if (!nombre || !descripcion || !precio || !categoriaId) {
      return res.redirect(`/comercio/productosíerror=Todos los campos son requeridos&edit=${productoId}`);
    }

    const prod = await Producto.findOne({ _id: productoId, comercioId });
    if (!prod) {
      return res.redirect("/comercio/productosíerror=Producto no encontrado");
    }

    prod.nombre = nombre.trim();
    prod.descripcion = descripcion.trim();
    prod.precio = Number(precio);
    prod.categoriaId = categoriaId;

    if (req.file) {
      prod.foto = `/uploads/${req.file.filename}`;
    }

    await prod.save();
    return res.redirect("/comercio/productosísuccess=Producto actualizado exitosamente");
  } catch (error) {
    console.error("Error al editar producto:", error);
    return res.redirect(`/comercio/productosíerror=${encodeURIComponent(error.message)}`);
  }
}

async function EliminarProducto(req, res) {
  const comercioId = req.session.usuario.id;
  const productoId = req.params.id;
  try {
    await Producto.findOneAndDelete({ _id: productoId, comercioId });
    return res.redirect("/comercio/productosísuccess=Producto eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.redirect("/comercio/productosíerror=Error al eliminar el producto");
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
