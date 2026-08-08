async function mostrar (req,res){
    res.render("client/home",{
        layout: "client"}
    )
}

async function perfil(req, res) {
    res.render("client/perfil",{
         layout: "client" }
    )
    }



module.exports = {mostrar, perfil}