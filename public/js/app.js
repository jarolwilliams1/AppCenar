// frontend only for UI interactions

const btnCancelarMarca = document.getElementById("btnCancelarMarca");
const btnCrearMarca = document.getElementById("btnCrearMarca");
const nuevaMarcaPantalla = document.getElementById("nueva-marca");
const btnRegistrarVehicul = document.getElementById("btnRegistrarVehiculo");
const nuevoVehiculo = document.getElementById("nuevoVehiculo");
const nuevoServicio = document.getElementById("nuevoServicio");
const btnRegistrarServicio = document.getElementById("btnRegistrarServicio")
const btnCancelarVehicul = document.getElementById("btnCancelarVehiculo");
const btnCancelarServicio = document.getElementById("btnCancelarServicio")
const btnRegistrarPieza = document.getElementById("btnRegistrarPieza")
const nuevaPieza = document.getElementById("nuevaPieza")
const btnCancelarPieza = document.getElementById("btnCancelarPieza");
const btnCrearOrden = document.getElementById("btnCrearOrden");
const nuevaOrden = document.getElementById("nuevaOrden");
const btnCancelarOrden = document.getElementById("btnCancelarOrden");

if(btnCrearOrden){
    btnCrearOrden.addEventListener("click", ()=>{
        nuevaOrden.hidden = false;
    })
    
}

if(btnCancelarOrden){
    btnCancelarOrden.addEventListener("click", ()=>{
                nuevaOrden.hidden = true;

    })
}

if(btnRegistrarPieza){
      btnRegistrarPieza.addEventListener("click", () => {

        nuevaPieza.hidden = false;

    });
}
if(btnCancelarPieza){
     btnCancelarPieza.addEventListener("click", () => {

        nuevaPieza.hidden = true;

    });


}
if (btnCrearMarca) {

    btnCrearMarca.addEventListener("click", () => {

        nuevaMarcaPantalla.hidden = false;

    });

}

if (btnCancelarMarca) {

    btnCancelarMarca.addEventListener("click", () => {

        nuevaMarcaPantalla.hidden = true;

    });

}

if (btnRegistrarVehicul) {

    btnRegistrarVehicul.addEventListener("click", () => {

        

        nuevoVehiculo.hidden = false;

    });

}

if (btnRegistrarServicio){
    btnRegistrarServicio.addEventListener("click", ()=>{
        nuevoServicio.hidden= false;
    }
    )
}

if(btnCancelarVehicul)
    {
     btnCancelarVehicul.addEventListener("click", ()=>{
        nuevoVehiculo.hidden= true;
    })

}

if (btnCancelarServicio){

  {
     btnCancelarServicio.addEventListener("click", ()=>{
        nuevoServicio.hidden= true;
    })
}
}