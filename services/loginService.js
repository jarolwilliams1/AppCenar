

async function ValidarDatos(datosLogin, ventana)
 {
    if(datosLogin.usuario == null || datosLogin.usuario == ' ' || datosLogin.password == null || datosLogin.password == ' ')
    {
        ventana.hidden = false;

    }
    
}

module.exports = {ValidarDatos}