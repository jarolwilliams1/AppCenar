const { User, Cliente, Comercio } = require("../models/userModel");
const { TipoComercio } = require("../models/TipoComercioModel");
const { Categoria } = require("../models/categoriaModel");
const { Producto } = require("../models/ProductoModel");
const { Direccion } = require("../models/DireccionModel");
const Pedido = require("../models/pedidoModel");
const { getItbisPercent } = require("../models/configuracionModel");

// HOME DEL CLIENTE
async function mostrar(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const tipos = await TipoComercio.find().lean();

    // Contar comercios activos por cada tipo
    for (const tipo of tipos) {
      tipo.disponibles = await Comercio.countDocuments({
        tipoComercioId: tipo._id,
        isActive: true
      });
    }

    // Obtener pedidos recientes del cliente (últimos 5)
    const pedidosRecientes = await Pedido.find({ clienteId })
      .populate("comercioId", "nombreComercio logoComercio")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.render("client/home", {
      layout: "client",
      listaTiposComercio: tipos,
      pedidosRecientes
    });
  } catch (error) {
    console.error("Error en home cliente:", error);
    res.status(500).render("client/home", {
      layout: "client",
      error: "Error cargando la pantalla principal",
      listaTiposComercio: []
    });
  }
}

// LISTADO DE COMERCIOS POR TIPO
async function VerComerciosPorTipo(req, res) {
  try {
    const tipoId = req.params.id;
    const search = (req.query.q || req.query.buscar || "").trim();
    const clienteId = req.session.usuario.id;

    const tipo = await TipoComercio.findById(tipoId).lean();
    if (!tipo) {
      return res.redirect("/cliente/home?error=Tipo de comercio no encontrado");
    }

    const query = {
      tipoComercioId: tipoId,
      isActive: true
    };

    if (search) {
      query.nombreComercio = { $regex: search, $options: "i" };
    }

    const comercios = await Comercio.find(query).lean();
    const cliente = await Cliente.findById(clienteId).lean();
    const favoritosIds = (cliente && cliente.favoritos) ? cliente.favoritos.map(id => id.toString()) : [];

    for (const com of comercios) {
      com.esFavorito = favoritosIds.includes(com._id.toString());
    }

    res.render("client/ComerciosPorTipo", {
      layout: "client",
      tipo,
      comercios,
      totalComercios: comercios.length,
      searchQuery: search
    });
  } catch (error) {
    console.error("Error en VerComerciosPorTipo:", error);
    res.redirect("/cliente/home?error=Error al cargar comercios");
  }
}

// catálogo DE PRODUCTOS DE UN COMERCIO
async function CatalogoComercio(req, res) {
  try {
    const comercioId = req.params.id;
    const comercio = await Comercio.findOne({ _id: comercioId, isActive: true }).lean();

    if (!comercio) {
      return res.redirect("/cliente/home?error=Comercio no disponible o inactivo");
    }

    const categorias = await Categoria.find({ comercioId }).lean();
    const productos = await Producto.find({ comercioId, isActive: true }).lean();

    // Agrupar productos por categoría
    const categoriasConProductos = categorias.map(cat => {
      return {
        ...cat,
        productos: productos.filter(p => p.categoriaId.toString() === cat._id.toString())
      };
    }).filter(cat => cat.productos.length > 0);

    // Productos sin categoría especfica si existieran
    const sinCategoria = productos.filter(p => !categorias.some(c => c._id.toString() === p.categoriaId.toString()));
    if (sinCategoria.length > 0) {
      categoriasConProductos.push({
        _id: "general",
        nombre: "Otros Productos",
        descripcion: "Productos generales",
        productos: sinCategoria
      });
    }

    res.render("client/catalogoComercio", {
      layout: "client",
      comercio,
      categorias: categoriasConProductos,
      totalProductos: productos.length
    });
  } catch (error) {
    console.error("Error en CatalogoComercio:", error);
    res.redirect("/cliente/home?error=Error al cargar el menú");
  }
}

// CHECKOUT / SELECCIN DE dirección
async function Checkout(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const comercioId = req.params.comercioId;
    const { items } = req.query; // IDs de productos separados por coma

    const comercio = await Comercio.findById(comercioId).lean();
    if (!comercio) {
      return res.redirect("/cliente/home?error=Comercio no encontrado");
    }

    const direcciones = await Direccion.find({ clienteId }).lean();

    let productIds = [];
    if (items) {
      productIds = items.split(",").filter(Boolean);
    }

    const productos = await Producto.find({ _id: { $in: productIds }, comercioId }).lean();

    if (productos.length === 0) {
      return res.redirect(`/cliente/comercio/${comercioId}?error=Debes seleccionar al menos un producto`);
    }

    const subtotal = productos.reduce((sum, p) => sum + p.precio, 0);
    const itbisPorcentaje = await getItbisPercent();
    const itbisMonto = subtotal * (itbisPorcentaje / 100);
    const total = subtotal + itbisMonto;

    res.render("client/checkout", {
      layout: "client",
      comercio,
      productos,
      productIds: productIds.join(","),
      direcciones,
      subtotal,
      itbisPorcentaje,
      itbisMonto,
      total,
      tienedirecciones: direcciones.length > 0
    });
  } catch (error) {
    console.error("Error en Checkout:", error);
    res.redirect("/cliente/home?error=Error al preparar el pedido");
  }
}

// CREAR PEDIDO
async function CrearPedido(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const { comercioId, direccionId, productIds } = req.body;

    if (!comercioId || !direccionId || !productIds) {
      return res.redirect(`/cliente/home?error=Datos incompletos para crear el pedido`);
    }

    const direccion = await Direccion.findOne({ _id: direccionId, clienteId });
    if (!direccion) {
      return res.redirect(`/cliente/home?error=La dirección de entrega no es válida`);
    }

    const ids = productIds.split(",").filter(Boolean);
    const productosDB = await Producto.find({ _id: { $in: ids } });

    if (productosDB.length === 0) {
      return res.redirect(`/cliente/home?error=No se encontraron productos para el pedido`);
    }

    // Validar que todos los productos pertenezcan al mismo comercio
    const todosMismoComercio = productosDB.every(p => p.comercioId.toString() === comercioId.toString());
    if (!todosMismoComercio) {
      return res.redirect(`/cliente/home?error=Todos los productos deben pertenecer al mismo comercio`);
    }

    const subtotal = productosDB.reduce((sum, p) => sum + p.precio, 0);
    const itbisPorcentaje = await getItbisPercent();
    const itbisMonto = subtotal * (itbisPorcentaje / 100);
    const total = subtotal + itbisMonto;

    const itemsPedido = productosDB.map(p => ({
      productoId: p._id,
      nombre: p.nombre,
      precio: p.precio,
      foto: p.foto,
      quantity: 1
    }));

    const nuevoPedido = new Pedido({
      clienteId,
      comercioId,
      direccion: {
        nombre: direccion.nombre,
        descripcion: direccion.descripcion
      },
      productos: itemsPedido,
      subtotal,
      itbisPorcentaje,
      itbisMonto,
      total,
      estado: "pendiente"
    });

    await nuevoPedido.save();

    return res.redirect(`/cliente/pedidos?success=Pedido realizado con éxito!`);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return res.redirect(`/cliente/home?error=Error al procesar el pedido`);
  }
}

// MIS PEDIDOS
async function MisPedidos(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const pedidos = await Pedido.find({ clienteId })
      .populate("comercioId", "nombreComercio logoComercio")
      .sort({ createdAt: -1 })
      .lean();

    for (const p of pedidos) {
      p.cantidadProductos = p.productos ? p.productos.length : 0;
    }

    res.render("client/pedidos", {
      layout: "client",
      pedidos
    });
  } catch (error) {
    console.error("Error en MisPedidos:", error);
    res.render("client/pedidos", {
      layout: "client",
      pedidos: [],
      error: "Error al cargar tus pedidos"
    });
  }
}

// DETALLE DE PEDIDO
async function DetallePedido(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const pedidoId = req.params.id;

    const pedido = await Pedido.findOne({ _id: pedidoId, clienteId })
      .populate("comercioId", "nombreComercio logoComercio telefono correo")
      .lean();

    if (!pedido) {
      return res.redirect("/cliente/pedidos?error=Pedido no encontrado");
    }

    res.render("client/pedidoDetalle", {
      layout: "client",
      pedido
    });
  } catch (error) {
    console.error("Error en DetallePedido:", error);
    res.redirect("/cliente/pedidos?error=Error al consultar detalle del pedido");
  }
}

// MIS direcciones (CRUD)
async function Misdirecciones(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const direcciones = await Direccion.find({ clienteId }).sort({ createdAt: -1 }).lean();
    const editId = req.query.edit || null;
    let direccionEdit = null;

    if (editId) {
      direccionEdit = await Direccion.findOne({ _id: editId, clienteId }).lean();
    }

    res.render("client/direcciones", {
      layout: "client",
      direcciones,
      direccionEdit,
      modoEdicion: !!direccionEdit,
      mostrarForm: req.query.nueva === "1" || !!direccionEdit
    });
  } catch (error) {
    console.error("Error en Misdirecciones:", error);
    res.render("client/direcciones", {
      layout: "client",
      direcciones: [],
      error: "Error al cargar direcciones"
    });
  }
}

async function CrearDireccion(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const { nombre, descripcion } = req.body;

    if (!nombre || !descripcion) {
      return res.redirect("/cliente/direcciones?error=Todos los campos son requeridos&nueva=1");
    }

    await Direccion.create({
      clienteId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim()
    });

    res.redirect("/cliente/direcciones?success=dirección agregada correctamente");
  } catch (error) {
    console.error("Error en CrearDireccion:", error);
    res.redirect("/cliente/direcciones?error=Error al guardar la dirección");
  }
}

async function EditarDireccion(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const direccionId = req.params.id;
    const { nombre, descripcion } = req.body;

    if (!nombre || !descripcion) {
      return res.redirect(`/cliente/direcciones?error=Todos los campos son requeridos&edit=${direccionId}`);
    }

    const dir = await Direccion.findOne({ _id: direccionId, clienteId });
    if (!dir) {
      return res.redirect("/cliente/direcciones?error=dirección no encontrada");
    }

    dir.nombre = nombre.trim();
    dir.descripcion = descripcion.trim();
    await dir.save();

    res.redirect("/cliente/direcciones?success=dirección actualizada correctamente");
  } catch (error) {
    console.error("Error en EditarDireccion:", error);
    res.redirect("/cliente/direcciones?error=Error al actualizar la dirección");
  }
}

async function EliminarDireccion(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const direccionId = req.params.id;

    await Direccion.findOneAndDelete({ _id: direccionId, clienteId });
    res.redirect("/cliente/direcciones?success=dirección eliminada correctamente");
  } catch (error) {
    console.error("Error en EliminarDireccion:", error);
    res.redirect("/cliente/direcciones?error=Error al eliminar la dirección");
  }
}

// MIS FAVORITOS
async function MisFavoritos(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const cliente = await Cliente.findById(clienteId).populate({
      path: "favoritos",
      match: { isActive: true },
      populate: { path: "tipoComercioId" }
    }).lean();

    const favoritos = (cliente && cliente.favoritos) ? cliente.favoritos : [];

    res.render("client/favoritos", {
      layout: "client",
      favoritos
    });
  } catch (error) {
    console.error("Error en MisFavoritos:", error);
    res.render("client/favoritos", {
      layout: "client",
      favoritos: [],
      error: "Error al cargar favoritos"
    });
  }
}

async function ToggleFavorito(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const comercioId = req.params.comercioId;

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.redirect("/cliente/home");
    }

    const idx = cliente.favoritos.indexOf(comercioId);
    if (idx > -1) {
      cliente.favoritos.splice(idx, 1);
    } else {
      const com = await Comercio.findOne({ _id: comercioId, isActive: true });
      if (com) {
        cliente.favoritos.push(comercioId);
      }
    }

    await cliente.save();

    const referer = req.get("Referer") || "/cliente/home";
    res.redirect(referer);
  } catch (error) {
    console.error("Error en ToggleFavorito:", error);
    res.redirect("/cliente/home");
  }
}

async function RemoverFavorito(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const comercioId = req.params.comercioId;

    const cliente = await Cliente.findById(clienteId);
    if (cliente) {
      const idx = cliente.favoritos.indexOf(comercioId);
      if (idx > -1) {
        cliente.favoritos.splice(idx, 1);
        await cliente.save();
      }
    }

    res.redirect("/cliente/favoritos?success=Comercio removido de favoritos");
  } catch (error) {
    console.error("Error en RemoverFavorito:", error);
    res.redirect("/cliente/favoritos?error=Error al remover de favoritos");
  }
}

// MI PERFIL (CLIENTE)
async function Perfil(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const cliente = await Cliente.findById(clienteId).lean();

    if (!cliente) {
      return res.redirect("/login");
    }

    res.render("client/perfil", {
      layout: "client",
      cliente,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en Perfil:", error);
    res.redirect("/cliente/home?error=Error al cargar perfil");
  }
}

async function ActualizarPerfil(req, res) {
  try {
    const clienteId = req.session.usuario.id;
    const { nombre, apellido, telefono } = req.body;

    if (!nombre || !apellido || !telefono) {
      return res.redirect("/cliente/perfil?error=Todos los campos son requeridos");
    }

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.redirect("/login");
    }

    cliente.nombre = nombre.trim();
    cliente.apellido = apellido.trim();
    cliente.telefono = telefono.trim();

    if (req.file) {
      cliente.fotoPerfil = `/uploads/${req.file.filename}`;
      req.session.usuario.foto = cliente.fotoPerfil;
    }

    await cliente.save();
    req.session.usuario.nombre = `${cliente.nombre} ${cliente.apellido}`;

    res.redirect("/cliente/perfil?success=Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.redirect("/cliente/perfil?error=Error al actualizar datos del perfil");
  }
}

module.exports = {
  mostrar,
  VerComerciosPorTipo,
  CatalogoComercio,
  Checkout,
  CrearPedido,
  MisPedidos,
  DetallePedido,
  Misdirecciones,
  CrearDireccion,
  EditarDireccion,
  EliminarDireccion,
  MisFavoritos,
  ToggleFavorito,
  RemoverFavorito,
  Perfil,
  ActualizarPerfil
};
