module.exports = function (app, supabase) {

    app.get("/api/recursos", async function (req, res) {
        const { data: recursos, error } = await supabase
            .from("recursos")
            .select("*");

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            res.status(200).json(recursos);
        }
    });

    app.delete("/api/recursos/:id", async function (req, res) {
        const id = parseInt(req.params.id);

        // borramos todas las reservas y reseñas del recurso primero y luego el recurso
        const { error: errorReservas } = await supabase
            .from("reservas")
            .delete()
            .eq("recurso", id);

        const { error: errorResenyas } = await supabase
            .from("resenyas")
            .delete()
            .eq("recurso", id);

        if (errorReservas || errorResenyas) {
            console.log(errorReservas || errorResenyas);
            return res.status(500).json("Error al realizar la consulta");
        }

        const { data: eliminado, error: errorRecurso } = await supabase
            .from("recursos")
            .delete()
            .eq("id", id)
            .select("id");

        if (errorRecurso) {
            console.log(errorRecurso);
            res.status(500).json("Error al realizar la consulta");
        } else if (eliminado.length == 0) {
            res.status(404).json({ error: "Recurso no encontrado" });
        } else {
            const { data: recursos, error } = await supabase
                .from("recursos")
                .select("*");

            if (error) {
                res.status(500).json("Error al realizar la consulta");
            } else {
                res.status(200).json(recursos);
            }
        }
    });

    app.put("/api/recursos/:id", async function (req, res) {

        let datosNuevos = req.body; // OBJETO ACTUALIZAR
        let id = req.params.id;

        const { data: actualizado, error } = await supabase
            .from("recursos")
            .update({
                categoria: datosNuevos.categoria,
                modelo: datosNuevos.modelo,
                numero_serie: datosNuevos.numero_serie,
                ubicacion: datosNuevos.ubicacion,
                estado: datosNuevos.estado
            })
            .eq("id", id)
            .select("id");

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else if (actualizado.length == 0) {
            res.status(404).json("Error recurso no encontrado");
        } else {
            const { data: recursos, error: errorRecursos } = await supabase
                .from("recursos")
                .select("*");

            if (errorRecursos) {
                res.status(500).json("Error al realizar la consulta");
            } else {
                res.status(200).json(recursos);
            }
        }
    });

    app.post("/api/recursos", async function (req, res) {
        let recurso = req.body;

        const { data: insertado, error: errorInsertar } = await supabase
            .from("recursos")
            .insert({
                numero_serie: recurso.numero_serie,
                categoria: recurso.categoria,
                modelo: recurso.modelo,
                ubicacion: recurso.ubicacion,
                estado: recurso.estado
            })
            .select("*")
            .single();

        if (errorInsertar) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            recurso.id = insertado.id;

            const { data: recursos, error } = await supabase
                .from("recursos")
                .select("*");

            if (error) {
                res.status(500).json("Error al realizar la consulta");
            } else {
                let respuestaAlCliente = [recurso, recursos];
                res.status(200).json(respuestaAlCliente);
            }
        }
    });

    app.get("/api/recursos/:id/reservas", async function (req, res) {
        let id = req.params.id;

        // encuentro todas las reservas que tengan en recurso el mismo número
        const { data: respuesta, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("recurso", id);

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            traducirReservas(respuesta, function (traducidas) {
                res.status(200).json(traducidas);
            });
        }

        // antes acá se traducía el nombre del sanitario antes de enviarlo al cliente
    });

    app.get("/api/recursos/:id/resenyas", async function (req, res) {
        let id = req.params.id;

        // encuentro todas las reseñas que tengan en recurso el mismo número
        const { data: respuesta, error } = await supabase
            .from("resenyas")
            .select("*")
            .eq("recurso", id);

        if (error) {
            res.status(500).json("Error al realizar la consulta");
        } else {
            traducirReservas(respuesta, function (traducidas) {
                res.status(200).json(traducidas);
            });
        }

        // acá también se hacía lo de traducir el sanitario antes de enviar
    });


    //#region funciones para traducir reservas

    async function traducirReservas(reservas, callback) {

        conseguirNombres(reservas, function (nombres) {
            // por cada reserva
            for (let i = 0; i < reservas.length; i++) {
                let reserva = reservas[i];

                for (let a = 0; a < nombres.length; a++) {
                    let nombre = nombres[a];

                    if (reserva.sanitario == nombre.id) {
                        reserva.sanitario = nombre.nombre;
                        break;
                    }
                }
            }
            return callback(reservas);
        });
    }

    async function conseguirNombres(reservas, callback) {
        // conseguimos los id's
        let ids = [];

        for (let i = 0; i < reservas.length; i++) {
            ids.push(reservas[i].sanitario);
        }

        // quitamos los ids repetidos
        ids = [...new Set(ids)];

        if (ids.length == 0) {
            return callback([]);
        }

        const { data: respuesta, error } = await supabase
            .from("sanitarios")
            .select("id, nombre, apellidos")
            .in("id", ids);

        if (error) {
            console.log("Ningún sanitario encontrado");
            return callback([]);
        } else {
            // creamos la lista de nombres
            var nombres = [];

            for (let i = 0; i < respuesta.length; i++) {
                let nombre = {
                    "id": respuesta[i].id,
                    "nombre": respuesta[i].nombre + "&" + respuesta[i].apellidos
                };

                nombres.push(nombre);
            }

            return callback(nombres);
        }
    }

    //#endregion
};
