module.exports = function (app, supabase) {

    app.get("/api/modelos", async function (req, res) {
        const { data: modelos, error } = await supabase
            .from("modelos")
            .select("*");

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            res.status(200).json(modelos);
        }
    });

};
