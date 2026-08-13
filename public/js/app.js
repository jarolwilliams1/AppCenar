// frontend only for UI interactions

const nuevoTipoComercio = document.getElementById("nuevoTipoComercio");
const NuevoTipoSection = document.getElementById("NuevoTipoSection");
const btnCancelarTipoComercio = document.getElementById("btnCancelarTipoComercio");


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