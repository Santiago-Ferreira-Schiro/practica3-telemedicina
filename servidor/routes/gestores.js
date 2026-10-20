
module.exports = function (app, supabase) {

    app.put("/api/gestores/:id", async function (req, res) {

        let datosNuevos = req.body; //OBJETOACTUALIZAR
        let id = req.params.id;

        //preguntamos a la BD si alguien ya tiene ese login
        const { data: gestores, error: errorLogin } = await supabase
            .from("gestores")
            .select("id")
            .eq("login", datosNuevos.login)
            .neq("id", id);

        if (errorLogin) {
            return res.status(500).json({ mensaje: "Error al comprobar el login" });
        }
        else if (gestores.length != 0) {
            return res.status(404).json({ mensaje: "Otro gestor ya tiene ese Login" });
        } else {
            //si nadie tiene el mismo login actualizamos
            const { data, error, count } = await supabase
                .from("gestores")
                .update({
                    nombre: datosNuevos.nombre,
                    apellidos: datosNuevos.apellidos,
                    login: datosNuevos.login
                })
                .eq("id", id)
                .select("id");

            if (error) {
                res.status(500).json("Error al realizar la actualización del gestor");
            } else if (data.length == 0) {
                res.status(404).json("Gestor no encontrado");
            } else {
                res.status(200).json("Gestor actualizado");
            }
        }
    });

};

