// middlewares/authMiddleware.js
function protegerComercio(req, res, next) {
  // Comprobar si existe la sesión y si tiene rol Comercio
  if (req.session && req.session.usuario && req.session.usuario.rol === 'Comercio') {
    return next(); // Pasa al controlador
  }
  
  // Si no está autenticado, mandar al login
  return res.redirect('/auth/login');
}

module.exports = { protegerComercio };