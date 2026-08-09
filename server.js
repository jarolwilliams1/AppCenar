require("dotenv").config();
const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
require('dotenv').config({ path: '.dev.env' });
const conexion = require( "./config/mongooseConection");


const app = express();

// Configurar Handlebars como motor de vistas
app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "auth",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        eq: (a, b) => a === b,
        calcularPosicion: (index) => index + 1,
        seleccionado: (a, b) => a == b ? "selected" : "",
        money: (valor) => Number(valor || 0).toFixed(2),
        incluido: (lista, valor) => Array.isArray(lista) && lista.includes(valor)
    },
    partialsDir: path.join(__dirname, "views/partials") // 👈 Aquí se configuran los parciales
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// Rutas
const authRoute = require("./routers/authRoute");
app.use("/", authRoute);

const registrarClient_DeliveryRouter = require("./routers/registrarClient-DeliveryRouter");
app.use("/registrar", registrarClient_DeliveryRouter);

const registrarComercio = require("./routers/registrarComercioRouter");
app.use("/registrarComercio", registrarComercio);

const cliente = require("./routers/clienteRouter");
app.use("/cliente", cliente);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    const referer = req.get("Referer") || "/";
    const separador = referer.includes("?") ? "&" : "?";
    res.redirect(referer + separador + "error=" + encodeURIComponent(err.message || "Ocurrió un error inesperado"));
});


     conexion.connectDB();


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
