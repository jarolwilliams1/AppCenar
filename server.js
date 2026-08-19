const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const { engine } = require("express-handlebars");
const dotenv = require("dotenv");

const ambiente = (process.env.NODE_ENV || "development").toLowerCase();
const archivosEntorno = [
  path.resolve(__dirname, `.env.${ambiente}`),
  path.resolve(__dirname, ".env.production"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, ".env.development"),
  path.resolve(__dirname, ".env.qa")
];

for (const archivo of archivosEntorno) {
  if (fs.existsSync(archivo)) {
    dotenv.config({ path: archivo });
    break;
  }
}

const conexion = require("./config/mongooseConection");
const seedAdmin = require("./config/seedAdmin");

const app = express();

app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(express.json({ limit: "15mb" }));

app.use(session({
  secret: process.env.SESSION_ENV || "appcenar-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    httpOnly: true,
    sameSite: "lax"
  }
}));

app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "auth",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    eq: (a, b) => String(a) === String(b),
    ne: (a, b) => String(a) !== String(b),
    or: (a, b) => a || b,
    and: (a, b) => a && b,
    not: (a) => !a,
    calcularPosicion: (index) => Number(index) + 1,
    seleccionado: (a, b) => String(a) === String(b) ? "selected" : "",
    money: (valor) => Number(valor || 0).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    incluido: (lista, valor) => Array.isArray(lista) && (lista.includes(valor) || lista.map(String).includes(String(valor))),
    formatDate: (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    },
    json: (obj) => JSON.stringify(obj),
    statusBadge: (estado) => {
      switch (estado) {
        case "pendiente":
          return "bg-warning text-dark";
        case "en_proceso":
          return "bg-info text-dark";
        case "completado":
          return "bg-success text-white";
        default:
          return "bg-secondary text-white";
      }
    },
    statusLabel: (estado) => {
      switch (estado) {
        case "pendiente":
          return "Pendiente";
        case "en_proceso":
          return "En Proceso";
        case "completado":
          return "Completado";
        default:
          return estado;
      }
    }
  },
  partialsDir: path.join(__dirname, "views/partials")
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Pasar usuario de sesión, alertas y pestaña activa a todas las vistas
app.use((req, res, next) => {
  res.locals.sessionUser = req.session && req.session.usuario ? req.session.usuario : null;
  res.locals.successMsg = req.query.success || null;
  res.locals.errorMsg = req.query.error || null;

  const p = req.path.toLowerCase();
  if (p.includes("dashboard")) res.locals.activeTab = "dashboard";
  else if (p.includes("cliente/pedidos")) res.locals.activeTab = "pedidos";
  else if (p.includes("cliente/direcciones") || p.includes("direccion")) res.locals.activeTab = "direcciones";
  else if (p.includes("cliente/favoritos") || p.includes("favorito")) res.locals.activeTab = "favoritos";
  else if (p.includes("perfil")) res.locals.activeTab = "perfil";
  else if (p.includes("categoria")) res.locals.activeTab = "categorias";
  else if (p.includes("producto")) res.locals.activeTab = "productos";
  else if (p.includes("admin/clientes")) res.locals.activeTab = "clientes";
  else if (p.includes("admin/deliveries")) res.locals.activeTab = "deliveries";
  else if (p.includes("admin/comercios")) res.locals.activeTab = "comercios";
  else if (p.includes("configuracion")) res.locals.activeTab = "configuracion";
  else if (p.includes("administrador")) res.locals.activeTab = "administradores";
  else if (p.includes("tipo-comercio") || p.includes("tipos-comercio")) res.locals.activeTab = "tipos";
  else if (p.includes("delivery/home") || p.includes("asignacion")) res.locals.activeTab = "asignaciones";
  else if (p.includes("comercio/home") || p.includes("comercio/pedidos")) res.locals.activeTab = "pedidos";
  else if (p.includes("cliente/home") || p.includes("comercios")) res.locals.activeTab = "inicio";
  else res.locals.activeTab = "inicio";

  next();
});

// Enrutadores Web MVC
const authRoute = require("./routers/authRoute");
app.use("/", authRoute);

const registrarClient_DeliveryRouter = require("./routers/registrarClient-DeliveryRouter");
app.use("/registrar", registrarClient_DeliveryRouter);

const registrarComercio = require("./routers/registrarComercioRouter");
app.use("/registrarComercio", registrarComercio);

const cliente = require("./routers/clienteRouter");
app.use("/cliente", cliente);

const Comercio = require("./routers/ComercioRouter");
app.use("/comercio", Comercio);
app.use("/comercios", Comercio);

const delivery = require("./routers/deliveryRouter");
app.use("/delivery", delivery);

const admin = require("./routers/adminRouter");
app.use("/admin", admin);

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  const referer = req.get("Referer") || "/";
  const separador = referer.includes("?") ? "&" : "?";
  res.redirect(referer + separador + "error=" + encodeURIComponent(err.message || "Ocurri un error inesperado"));
});

// Conectar a MongoDB y arrancar servidor
conexion.connectDB().then(async () => {
  await seedAdmin();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`?? Servidor AppCenar Web MVC corriendo en http://localhost:${PORT} [${ambiente}]`));
}).catch((error) => {
  console.error("No fue posible arrancar el servidor:", error);
  process.exit(1);
});
