// 1. Definición del Middleware
const verificarSesion = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next(); // El usuario está autenticado, continúa al controlador
  }
  
  // El usuario no está autenticado, interrumpe la petición
  res.redirect('/login');
};

// 2. Aplicación del Middleware a una ruta protegida
app.get('/mis-pedidos', verificarSesion, (req, res) => {
  res.render('pedidos'); // Solo se ejecuta si pasó verificarSesion
});