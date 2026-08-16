// frontend only for UI interactions

const nuevoTipoComercio = document.getElementById("nuevoTipoComercio");
const NuevoTipoSection = document.getElementById("NuevoTipoSection");
const btnCancelarTipoComercio = document.getElementById("btnCancelarTipoComercio");


const btnNuevaCaregoria = document.getElementById("btnNuevaCaregoria");
const NuevaCategoriaSection = document.getElementById("NuevaCategoriaSection");
const btnCancelarNuevaCategoria = document.getElementById("btnCancelarNuevaCategoria");


if(nuevoTipoComercio){
    nuevoTipoComercio.addEventListener("click", ()=> {
        NuevoTipoSection.hidden = false;
    })
}

if(btnCancelarTipoComercio){
    btnCancelarTipoComercio.addEventListener("click", ()=> {
        NuevoTipoSection.hidden = true;

    })
}



if(btnNuevaCaregoria){
    btnNuevaCaregoria.addEventListener("click", ()=> {
        NuevaCategoriaSection.hidden = false;
    })
}

if(btnCancelarNuevaCategoria){
    btnCancelarNuevaCategoria.addEventListener("click", ()=> {
        NuevaCategoriaSection.hidden = true;

    })
}