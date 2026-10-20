module.exports = function (app, supabase) {

    app.get("/api/ubicaciones", async function (req, res) {
        const { data: ubicaciones, error } = await supabase
            .from("ubicaciones")
            .select("*");

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            res.status(200).json(ubicaciones);
        }
    });

};
