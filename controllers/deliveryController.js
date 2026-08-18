const { Delivery } = require("../models/userModel");
const Pedido = require("../models/pedidoModel");

// HOME DEL DELIVERY / ASIGNACIONES
async function mostrar(req, res) {
  try {
    const deliveryId = req.session.usuario.id;
    const delivery = await Delivery.findById(deliveryId).lean();

    if (!delivery) {
      return res.redirect("/login");
    }

    // Pedidos asignados
    const pedidos = await Pedido.find({ deliveryId })
      .populate("comercioId", "nombreComercio logoComercio telefono")
      .populate("clienteId", "nombre apellido telefono")
      .sort({ createdAt: -1 })
      .lean();

    const entregasEnCurso = pedidos.filter(p => p.estado === "en_proceso");
    const entregasCompletadas = pedidos.filter(p => p.estado === "completado");

    res.render("delivery/home", {
      layout: "delivery",
      delivery,
      entregasEnCurso,
      entregasCompletadas,
      totalEntregasCompletadas: entregasCompletadas.length,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en home delivery:", error);
    res.render("delivery/home", {
      layout: "delivery",
      entregasEnCurso: [],
      entregasCompletadas: [],
      error: "Error al cargar las asignaciones"
    });
  }
}

// DETALLE DE PEDIDO ASIGNADO
async function DetallePedido(req, res) {
  try {
    const deliveryId = req.session.usuario.id;
    const pedidoId = req.params.id;

    const pedido = await Pedido.findOne({ _id: pedidoId, deliveryId })
      .populate("comercioId", "nombreComercio logoComercio telefono")
      .populate("clienteId", "nombre apellido telefono")
      .lean();

    if (!pedido) {
      return res.redirect("/delivery/home?error=Pedido no encontrado o no asignado a este repartidor");
    }

    res.render("delivery/pedidoDetalle", {
      layout: "delivery",
      pedido,
      esEnProceso: pedido.estado === "en_proceso",
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en DetallePedido delivery:", error);
    res.redirect("/delivery/home?error=Error al consultar detalle del pedido");
  }
}

// COMPLETAR PEDIDO
async function CompletarPedido(req, res) {
  try {
    const deliveryId = req.session.usuario.id;
    const pedidoId = req.params.id;

    const pedido = await Pedido.findOne({ _id: pedidoId, deliveryId });
    if (!pedido) {
      return res.redirect("/delivery/home?error=Pedido no encontrado");
    }

    if (pedido.estado !== "en_proceso") {
      return res.redirect("/delivery/home?error=Solo se pueden completar pedidos en proceso");
    }

    // Actualizar estado del pedido
    pedido.estado = "completado";
    await pedido.save();

    // Liberar al delivery
    const delivery = await Delivery.findById(deliveryId);
    if (delivery) {
      delivery.estadoDelivery = "Disponible";
      await delivery.save();
    }

    res.redirect("/delivery/home?success=Excelente trabajo! Pedido completado con ééxito y quedas disponible para nuevas entregas.");
  } catch (error) {
    console.error("Error al completar pedido:", error);
    res.redirect("/delivery/home?error=Error al marcar el pedido como completado");
  }
}

// MI PERFIL (DELIVERY)
async function Perfil(req, res) {
  try {
    const deliveryId = req.session.usuario.id;
    const delivery = await Delivery.findById(deliveryId).lean();

    res.render("delivery/perfil", {
      layout: "delivery",
      delivery,
      sessionUser: req.session.usuario
    });
  } catch (error) {
    console.error("Error en perfil delivery:", error);
    res.redirect("/delivery/home?error=Error al cargar perfil");
  }
}

async function ActualizarPerfil(req, res) {
  try {
    const deliveryId = req.session.usuario.id;
    const { nombre, apellido, telefono } = req.body;

    if (!nombre || !apellido || !telefono) {
      return res.redirect("/delivery/perfil?error=Todos los campos son requeridos");
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.redirect("/login");
    }

    delivery.nombre = nombre.trim();
    delivery.apellido = apellido.trim();
    delivery.telefono = telefono.trim();

    if (req.file) {
      delivery.fotoPerfil = `/uploads/${req.file.filename}`;
      req.session.usuario.foto = delivery.fotoPerfil;
    }

    await delivery.save();
    req.session.usuario.nombre = `${delivery.nombre} ${delivery.apellido}`;

    res.redirect("/delivery/perfil?success=Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar perfil delivery:", error);
    res.redirect("/delivery/perfil?error=Error al guardar cambios");
  }
}

module.exports = {
  mostrar,
  DetallePedido,
  CompletarPedido,
  Perfil,
  ActualizarPerfil
};
