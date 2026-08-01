require("dotenv").config();
const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const app = express();

app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "main",
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
    }
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.registerPartials(
    path.join(__dirname, "views/partials")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const homeRouter = require("./router/homeRouters");
app.use("/", homeRouter);


const ordenesRouter = require("./router/ordenesRouter");
app.use("/ordenes", ordenesRouter);


const marcasRouters = require("./router/marcasRouter");
app.use("/marcas", marcasRouters);


const pieza_repuestoRouter = require("./router/pieza-repuestoRouter");
app.use("/piezas-repuestos", pieza_repuestoRouter);


const vehiculosRouter = require("./router/vehiculosRouter");
app.use("/vehiculos", vehiculosRouter);


const servicioRouter = require("./router/ServicioRouter");
app.use("/servicios", servicioRouter);






app.use((err, req, res, next) => {
    console.error(err);
    const referer = req.get("Referer") || "/";
    const separador = referer.includes("?") ? "&" : "?";
    res.redirect(referer + separador + "error=" + encodeURIComponent(err.message || "Ocurrió un error inesperado"));
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));