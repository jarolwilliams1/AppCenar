const { User, Administrador } = require("../models/userModel");
const Configuracion = require("../models/configuracionModel");
const { TipoComercio } = require("../models/TipoComercioModel");

async function seedAdmin() {
  try {
    // 1. Seed Admin por defecto
    const existeAdmin = await User.findOne({ 
      $or: [
        { correo: "admin@appcenar.com" },
        { usuario: "admin" }
      ]
    });

    if (!existeAdmin) {
      const admin = new Administrador({
        usuario: "admin",
        correo: "admin@appcenar.com",
        password: "admin123",
        nombre: "Administrador",
        apellido: "Principal",
        cedula: "000-0000001-1",
        isActive: true
      });

      await admin.save();
      console.log("? Administrador por defecto creado exitosamente (admin / admin123)");
    }

    // 2. Seed configuración de ITBIS
    let existeConfig = await Configuracion.findOne({ key: "ITBIS" });
    if (!existeConfig) {
      await Configuracion.create({
        key: "ITBIS",
        itbis: 18,
        descripcion: "Impuesto sobre Transferencias de Bienes Industrializados y Servicios"
      });
      console.log("? configuración inicial de ITBIS (18%) creada");
    }

    // 3. Seed Tipos de Comercio iniciales si no existen
    const totalTipos = await TipoComercio.countDocuments();
    if (totalTipos === 0) {
      const tiposIniciales = [
        { nombre: "Restaurantes", descripcion: "Comida preparada y restaurantes", icono: null },
        { nombre: "Mercados", descripcion: "Supermercados y minimarkets", icono: null },
        { nombre: "Bebidas", descripcion: "Licoreras y tiendas de bebidas", icono: null },
        { nombre: "Farmacias", descripcion: "Farmacias y productos de salud", icono: null },
        { nombre: "Cafeterías", descripcion: "Cafés, repostería y desayunos", icono: null },
        { nombre: "Heladerías", descripcion: "Helados y postres fríos", icono: null }
      ];

      for (const t of tiposIniciales) {
        await TipoComercio.create(t);
      }
      console.log("Tipos de comercio iniciales creados exitosamente");
    }
  } catch (error) {
    console.error("Error creando datos iniciales (seed):", error.message);
  }
}

module.exports = seedAdmin;
