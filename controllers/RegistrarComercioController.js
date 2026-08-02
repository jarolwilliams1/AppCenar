async function mostrar (req,res){
    res.render("auth/RegistrarComenrce",{
        layout: "comerce"}
    )
}


module.exports = {mostrar}