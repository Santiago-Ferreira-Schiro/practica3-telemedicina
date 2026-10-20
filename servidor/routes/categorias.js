
module.exports = function (app, supabase) {

    app.get("/api/categorias", async function (req, res) {
        const { data: categorias, error } = await supabase
            .from("categorias")
            .select("*");

        if (error) {
            console.log("Error al realizar la select de categorias", error);
            res.status(500).json("Error al realizar la consulta de categorias");
        } else {
            res.status(200).json(categorias); 
        }
    }); 

};
