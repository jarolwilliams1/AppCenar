async function mostrar (req,res){
    res.render("client/home",{
        layout: "client"}
    )
}


module.exports = {mostrar}