function requiereLogin(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/login');
}

function requiereRol(rolesPermitidos = []) {
  return (req, res, next) => {
    const usuario = req.session && req.session.usuario ? req.session.usuario : null;

    if (!usuario) {
      return res.redirect('/login');
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      switch (usuario.rol) {
        case 'Cliente':
          return res.redirect('/cliente/home');
        case 'Delivery':
          return res.redirect('/delivery/home');
        case 'Comercio':
          return res.redirect('/comercio/home');
        case 'Administrador':
          return res.redirect('/admin');
        default:
          return res.redirect('/login');
      }
    }

    return next();
  };
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    const rol = req.session.usuario.rol;
    switch (rol) {
      case 'Cliente':
        return res.redirect('/cliente/home');
      case 'Delivery':
        return res.redirect('/delivery/home');
      case 'Comercio':
        return res.redirect('/comercio/home');
      case 'Administrador':
        return res.redirect('/admin');
      default:
        return next();
    }
  }
  return next();
}

module.exports = {
  requiereLogin,
  requiereRol,
  redirectIfAuth
};
