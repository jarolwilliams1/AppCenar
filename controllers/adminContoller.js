const bcrypt = require("bcryptjs");
const { User, Cliente, Delivery, Comercio, Administrador, GetClientesToAdmin, GetDeliveriesToAdmin, GetComerciosToAdmin, GetAdminsToAdmin } = require("../models/userModel");
const { TipoComercio, GetTiposComercio, NuevoTipoComercio } = require("../models/TipoComercioModel");
const { Categoria } = require("../models/categoriaModel");
const { Producto } = require("../models/ProductoModel");
const Configuracion = require("../models/configuracionModel");
const Pedido = require("../models/pedidoModel");
const TipoComercioServices = require("../services/crearTipoComercioServices");

// DASHBOARD
async function mostrar(req, res) {
  try {
    const totalPedidos = await Pedido.countDocuments();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const pedidosHoy = await Pedido.countDocuments({ createdAt: { $gte: hoy } });

    const totalProductos = await Producto.countDocuments({ isActive: true });

    const comerciosActivos = await Comercio.countDocuments({ rol: "Comercio", isActive: true });
    const comerciosInactivos = await Comercio.countDocuments({ rol: "Comercio", isActive: false });

    const clientesActivos = await Cliente.countDocuments({ rol: "Cliente", isActive: true });
    const clientesInactivos = await Cliente.countDocuments({ rol: "Cliente", isActive: false });

    const deliveriesActivos = await Delivery.countDocuments({ rol: "Delivery", isActive: true });
    const deliveriesInactivos = await Delivery.countDocuments({ rol: "Delivery", isActive: false });

    const pedidosRecientes = await Pedido.find()
      .populate("clienteId", "nombre apellido")
      .populate("comercioId", "nombreComercio logoComercio")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Top Comercios
    const comercios = await Comercio.find().lean();
    for (const c of comercios) {
      c.totalPedidos = await Pedido.countDocuments({ comercioId: c._id });
    }
    const topComercios = comercios.sort((a, b) => b.totalPedidos - a.totalPedidos).slice(0, 4);

    res.render("admin/dashboard", {
      layout: "admin",
      metrics: {
        totalPedidos,
        pedidosHoy,
        totalProductos,
        comerciosActivos,
        comerciosInactivos,
        clientesActivos,
        clientesInactivos,
        deliveriesActivos,
        deliveriesInactivos
      },
      pedidosRecientes,
      topComercios,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en dashboard admin:", error);
    res.render("admin/dashboard", {
      layout: "admin",
      metrics: {},
      error: "Error cargando métricas del dashboard"
    });
  }
}

// CLIENTES
async function ClientesToAdmin(req, res) {
  try {
    const clientesBD = await GetClientesToAdmin();
    const listaClientes = [];

    for (const c of clientesBD) {
      const obj = c.toObject();
      obj.totalPedidos = await Pedido.countDocuments({ clienteId: c._id });
      listaClientes.push(obj);
    }

    res.render("admin/clientes", {
      layout: "admin",
      listaClientes,
      totalClientes: listaClientes.length,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).render("admin/clientes", {
      layout: "admin",
      listaClientes: [],
      error: "Error del servidor"
    });
  }
}

async function ToggleStatusCliente(req, res) {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (cliente) {
      cliente.isActive = !cliente.isActive;
      await cliente.save();
    }
    res.redirect("/admin/clientesísuccess=Estado del cliente actualizado");
  } catch (error) {
    console.error("Error al cambiar estado de cliente:", error);
    res.redirect("/admin/clientesíerror=Error al cambiar estado");
  }
}

// DELIVERIES
async function DeliveriesToAdmin(req, res) {
  try {
    const deliveriesBD = await GetDeliveriesToAdmin();
    const listaDeliveries = [];

    for (const d of deliveriesBD) {
      const obj = d.toObject();
      obj.totalEntregas = await Pedido.countDocuments({ deliveryId: d._id, estado: "completado" });
      listaDeliveries.push(obj);
    }

    res.render("admin/deliveries", {
      layout: "admin",
      listaDeliveries,
      totalDeliveries: listaDeliveries.length,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error al obtener Deliveries:", error);
    res.status(500).render("admin/deliveries", {
      layout: "admin",
      listaDeliveries: [],
      error: "Error del servidor"
    });
  }
}

async function ToggleStatusDelivery(req, res) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (delivery) {
      delivery.isActive = !delivery.isActive;
      await delivery.save();
    }
    res.redirect("/admin/deliveriesísuccess=Estado del repartidor actualizado");
  } catch (error) {
    console.error("Error al cambiar estado de delivery:", error);
    res.redirect("/admin/deliveriesíerror=Error al cambiar estado");
  }
}

// COMERCIOS
async function ListaComerciosAdmin(req, res) {
  try {
    const comerciosBD = await GetComerciosToAdmin();
    const listaComercios = [];

    for (const c of comerciosBD) {
      const obj = c.toObject();
      obj.totalPedidos = await Pedido.countDocuments({ comercioId: c._id });
      listaComercios.push(obj);
    }

    res.render("admin/comercios", {
      layout: "admin",
      listaComercios,
      totalComercios: listaComercios.length,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error al obtener Comercios:", error);
    res.status(500).render("admin/comercios", {
      layout: "admin",
      listaComercios: [],
      error: "Error del servidor"
    });
  }
}

async function ToggleStatusComercio(req, res) {
  try {
    const comercio = await Comercio.findById(req.params.id);
    if (comercio) {
      comercio.isActive = !comercio.isActive;
      await comercio.save();
    }
    res.redirect("/admin/comerciosísuccess=Estado del comercio actualizado");
  } catch (error) {
    console.error("Error al cambiar estado de comercio:", error);
    res.redirect("/admin/comerciosíerror=Error al cambiar estado");
  }
}

// configuración (ITBIS)
async function ConfiguracionView(req, res) {
  try {
    let config = await Configuracion.findOne({ key: "ITBIS" });
    if (!config) {
      config = await Configuracion.create({ key: "ITBIS", itbis: 18 });
    }

    const subtotalEjemplo = 1000;
    const itbisEjemplo = subtotalEjemplo * (config.itbis / 100);
    const totalEjemplo = subtotalEjemplo + itbisEjemplo;

    res.render("admin/configuracion", {
      layout: "admin",
      config: config.toObject(),
      subtotalEjemplo,
      itbisEjemplo,
      totalEjemplo,
      sessionUser: req.session.usuario,
      modoEdicion: req.query.edit === "1"
    });
  } catch (error) {
    console.error("Error en ConfiguracionView:", error);
    res.redirect("/admin?error=Error al cargar configuración");
  }
}

async function ActualizarConfiguracion(req, res) {
  try {
    const itbis = Number(req.body.itbis);
    if (isNaN(itbis) || itbis < 0 || itbis > 100) {
      return res.redirect("/admin/configuracion?error=El porcentaje de ITBIS debe ser un número entre 0 y 100&edit=1");
    }

    let config = await Configuracion.findOne({ key: "ITBIS" });
    if (!config) {
      config = new Configuracion({ key: "ITBIS", itbis });
    } else {
      config.itbis = itbis;
    }
    await config.save();

    res.redirect("/admin/configuracion?success=configuración de ITBIS actualizada correctamente");
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.redirect("/admin/configuracion?error=Error al guardar configuración");
  }
}

// ADMINISTRADORES (CRUD)
async function AdministradoresView(req, res) {
  try {
    const adminActualId = req.session.usuario.id;
    const adminsBD = await GetAdminsToAdmin();

    const listaAdmins = adminsBD.map(a => {
      const obj = a.toObject();
      obj.esAdminDefecto = obj.correo === "admin@appcenar.com" || obj.usuario === "admin";
      obj.esAdminActual = obj._id.toString() === adminActualId;
      obj.puedeModificar = !obj.esAdminDefecto && !obj.esAdminActual;
      return obj;
    });

    const editId = req.query.edit || null;
    let adminEdit = null;
    if (editId) {
      adminEdit = await Administrador.findById(editId).lean();
    }

    res.render("admin/administradores", {
      layout: "admin",
      listaAdmins,
      adminEdit,
      modoEdicion: !!adminEdit,
      mostrarForm: req.query.nuevo === "1" || !!adminEdit,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en AdministradoresView:", error);
    res.render("admin/administradores", {
      layout: "admin",
      listaAdmins: [],
      error: "Error al cargar administradores"
    });
  }
}

async function CrearAdmin(req, res) {
  try {
    const { nombre, apellido, cedula, correo, usuario, password, confirmPassword } = req.body;

    if (!nombre || !apellido || !cedula || !correo || !usuario || !password || !confirmPassword) {
      return res.redirect("/admin/administradoresíerror=Todos los campos son requeridos&nuevo=1");
    }

    if (password !== confirmPassword) {
      return res.redirect("/admin/administradoresíerror=Las contraseñas no coinciden&nuevo=1");
    }

    const existeUser = await User.findOne({ usuario: usuario.trim() });
    if (existeUser) {
      return res.redirect("/admin/administradoresíerror=El nombre de usuario ya existe&nuevo=1");
    }

    const existeCorreo = await User.findOne({ correo: correo.trim().toLowerCase() });
    if (existeCorreo) {
      return res.redirect("/admin/administradoresíerror=El correo ya está registrado&nuevo=1");
    }

    const existeCedula = await Administrador.findOne({ cedula: cedula.trim() });
    if (existeCedula) {
      return res.redirect("/admin/administradoresíerror=La cédula ya está registrada&nuevo=1");
    }

    const nuevoAdmin = new Administrador({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cedula: cedula.trim(),
      correo: correo.trim().toLowerCase(),
      usuario: usuario.trim(),
      password: password.trim(),
      isActive: true
    });

    await nuevoAdmin.save();
    res.redirect("/admin/administradoresísuccess=Administrador creado exitosamente");
  } catch (error) {
    console.error("Error al crear admin:", error);
    res.redirect("/admin/administradoresíerror=Error al crear administrador");
  }
}

async function EditarAdmin(req, res) {
  try {
    const adminActualId = req.session.usuario.id;
    const adminId = req.params.id;
    const { nombre, apellido, cedula, correo, usuario, password, confirmPassword } = req.body;

    const admin = await Administrador.findById(adminId);
    if (!admin) {
      return res.redirect("/admin/administradoresíerror=Administrador no encontrado");
    }

    // Regla: No se puede editar el admin por defecto
    if (admin.correo === "admin@appcenar.com" || admin.usuario === "admin") {
      return res.redirect("/admin/administradoresíerror=El administrador principal por defecto no puede ser editado");
    }

    // Regla: No puede auto-editarse desde este listado de gestin
    if (admin._id.toString() === adminActualId) {
      return res.redirect("/admin/administradoresíerror=No puedes editar tu propio usuario desde la gestin");
    }

    admin.nombre = nombre.trim();
    admin.apellido = apellido.trim();
    admin.cedula = cedula.trim();
    admin.correo = correo.trim().toLowerCase();
    admin.usuario = usuario.trim();

    if (password && password.trim().length > 0) {
      if (password !== confirmPassword) {
        return res.redirect(`/admin/administradoresíerror=Las contraseñas no coinciden&edit=${adminId}`);
      }
      admin.password = password.trim();
    }

    await admin.save();
    res.redirect("/admin/administradoresísuccess=Administrador actualizado exitosamente");
  } catch (error) {
    console.error("Error al editar admin:", error);
    res.redirect("/admin/administradoresíerror=Error al actualizar administrador");
  }
}

async function ToggleStatusAdmin(req, res) {
  try {
    const adminActualId = req.session.usuario.id;
    const adminId = req.params.id;

    const admin = await Administrador.findById(adminId);
    if (!admin) {
      return res.redirect("/admin/administradoresíerror=Administrador no encontrado");
    }

    // Regla: No se puede inactivar el admin por defecto
    if (admin.correo === "admin@appcenar.com" || admin.usuario === "admin") {
      return res.redirect("/admin/administradoresíerror=El administrador principal por defecto no puede ser inactivado");
    }

    // Regla: No puede inactivarse a sí mismo
    if (admin._id.toString() === adminActualId) {
      return res.redirect("/admin/administradoresíerror=No puedes cambiar el estado de tu propio usuario");
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.redirect("/admin/administradoresísuccess=Estado del administrador actualizado");
  } catch (error) {
    console.error("Error al cambiar estado de admin:", error);
    res.redirect("/admin/administradoresíerror=Error al cambiar estado del administrador");
  }
}

// TIPOS DE COMERCIO (CRUD & HARD DELETE CASCADE)
async function ListaComercios(req, res) {
  try {
    const TiposComerciosDB = await TipoComercio.find().sort({ createdAt: -1 }).lean();

    for (const tipo of TiposComerciosDB) {
      tipo.totalComercios = await Comercio.countDocuments({ tipoComercioId: tipo._id });
    }

    const editId = req.query.edit || null;
    let tipoEdit = null;
    if (editId) {
      tipoEdit = await TipoComercio.findById(editId).lean();
    }

    res.render("admin/tipoComercio", {
      layout: "admin",
      listaTiposComercio: TiposComerciosDB,
      tipoEdit,
      modoEdicion: !!tipoEdit,
      mostrarForm: req.query.nuevo === "1" || !!tipoEdit,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error al obtener los tipos de comercio:", error);
    res.status(500).render("admin/tipoComercio", {
      layout: "admin",
      listaTiposComercio: [],
      error: "Error del servidor"
    });
  }
}

async function NuevoTipoComercioController(req, res) {
  try {
    await TipoComercioServices.ValidarDatos(req.body, req.file);
    res.redirect("/admin/tipo-comercio?success=Tipo de comercio creado exitosamente");
  } catch (error) {
    console.error("Error creando tipo comercio:", error);
    res.redirect(`/admin/tipo-comercio?error=${encodeURIComponent(error.message || "Error al crear tipo de comercio")}&nuevo=1`);
  }
}

async function EditarTipoComercio(req, res) {
  try {
    const tipoId = req.params.id;
    const { nombeNuevoTipoComercioInput, descripcionNuevoTipoComercioInput } = req.body;

    const tipo = await TipoComercio.findById(tipoId);
    if (!tipo) {
      return res.redirect("/admin/tipo-comercio?error=Tipo de comercio no encontrado");
    }

    tipo.nombre = (nombeNuevoTipoComercioInput || req.body.nombre || "").trim();
    tipo.descripcion = (descripcionNuevoTipoComercioInput || req.body.descripcion || "").trim();

    if (req.file) {
      tipo.icono = `/uploads/${req.file.filename}`;
    }

    await tipo.save();
    res.redirect("/admin/tipo-comercio?success=Tipo de comercio actualizado correctamente");
  } catch (error) {
    console.error("Error editando tipo comercio:", error);
    res.redirect("/admin/tipo-comercio?error=Error al editar tipo de comercio");
  }
}

// BORRADO EN CASCADA ESTRICTO
async function EliminarTipoComercio(req, res) {
  try {
    const tipoId = req.params.id;

    // 1. Buscar comercios asociados a este tipo
    const comercios = await Comercio.find({ tipoComercioId: tipoId });
    const comerciosIds = comercios.map(c => c._id);

    // 2. Eliminar en cascada productos de esos comercios
    await Producto.deleteMany({ comercioId: { $in: comerciosIds } });

    // 3. Eliminar en cascada categorías de esos comercios
    await Categoria.deleteMany({ comercioId: { $in: comerciosIds } });

    // 4. Eliminar pedidos asociados a esos comercios
    await Pedido.deleteMany({ comercioId: { $in: comerciosIds } });

    // 5. Eliminar comercios
    await Comercio.deleteMany({ _id: { $in: comerciosIds } });

    // 6. Eliminar el tipo de comercio
    await TipoComercio.findByIdAndDelete(tipoId);

    res.redirect("/admin/tipo-comercio?success=Tipo de comercio y todos los comercios y datos asociados eliminados en cascada");
  } catch (error) {
    console.error("Error en eliminación en cascada:", error);
    res.redirect("/admin/tipo-comercio?error=Error al eliminar el tipo de comercio");
  }
}

module.exports = {
  mostrar,
  ClientesToAdmin,
  ToggleStatusCliente,
  DeliveriesToAdmin,
  ToggleStatusDelivery,
  ListaComerciosAdmin,
  ToggleStatusComercio,
  ConfiguracionView,
  ActualizarConfiguracion,
  AdministradoresView,
  CrearAdmin,
  EditarAdmin,
  ToggleStatusAdmin,
  ListaComercios,
  NuevoTipoComercio: NuevoTipoComercioController,
  EditarTipoComercio,
  EliminarTipoComercio
};
