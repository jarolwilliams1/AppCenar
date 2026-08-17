// frontend only for UI interactions

const nuevoTipoComercio = document.getElementById("nuevoTipoComercio");
const NuevoTipoSection = document.getElementById("NuevoTipoSection");
const btnCancelarTipoComercio = document.getElementById("btnCancelarTipoComercio");


const btnNuevaCaregoria = document.getElementById("btnNuevaCaregoria");
const NuevaCategoriaSection = document.getElementById("NuevaCategoriaSection");
const btnCancelarNuevaCategoria = document.getElementById("btnCancelarNuevaCategoria");

const btnNuevoProducto = document.getElementById("btnNuevoProducto");
const NuevoProductoSection = document.getElementById("NuevoProductoSection");
const btnCancelarNuevoProducto = document.getElementById("btnCancelarNuevoProducto");
if (btnNuevoProducto)
    {
        btnNuevoProducto.addEventListener("click", () =>{
            NuevoProductoSection.hidden = false;
        });

}

if(btnCancelarNuevoProducto)
{
    btnCancelarNuevoProducto.addEventListener("click", ()=>{
        NuevoProductoSection.hidden=true;
    })
}



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