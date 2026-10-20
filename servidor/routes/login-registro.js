
module.exports = function (app, supabase) {

    var jwt = require('jwt-simple');
    var clave = 'miSecretoMasOscuro'; // clave para codificar / decodificar el token

    app.post("/api/gestores/login", async function (req, res) {
        var usuarioIngresado = req.body;

        const { data: gestores, error } = await supabase
            .from("gestores")
            .select("id, nombre, apellidos, login")
            .eq("login", usuarioIngresado.usuario)
            .eq("contrasenya", usuarioIngresado.contrasenya);

        if (error) {
            res.status(500).json({ error: "Error en la base de datos" });
        }
        else if (gestores.length == 0) {
            res.status(401).json({ error: "Credenciales incorrectas" });
        }
        else {
            var gestor = gestores[0];

            // Crear un token
            var contenido = { // contenido del token (se puede incluir la información que necesitemos)
                usuario: gestor.id,
                expira: Date.now() + 60 * 60 * 1000 // expira dentro de 1 hora (en ms)
            };
            var token = jwt.encode(contenido, clave);

            res.status(200).json([token, {
                "id": gestor.id,
                "nombre": gestor.nombre,
                "apellidos": gestor.apellidos,
                "login": gestor.login
            }]);
        }
    });

    app.post("/api/gestores", async function (req, res) {
        let gestor = req.body;

        if (!gestor.nombre || !gestor.apellidos || !gestor.login || !gestor.contrasenya) {
            res.status(400).json("campos vacíos");
        } else {
            //corroboramos que no exista ya un usuario con esos datos
            const { data: id, error } = await supabase
                .from("gestores")
                .select("id")
                .eq("login", gestor.login);

            if (error) {
                res.status(500).json({ error: "Error en la base de datos" });
            }
            else if (id.length != 0) {
                res.status(409).json({ error: "Error un usuario con este login ya existe" });
            }
            else {
                //en caso de que no exista lo insertamos
                const { error: errorInsertar } = await supabase
                    .from("gestores")
                    .insert({
                        login: gestor.login,
                        contrasenya: gestor.contrasenya,
                        nombre: gestor.nombre,
                        apellidos: gestor.apellidos
                    });

                if (errorInsertar) {
                    res.status(500).json({ error: "Error en la base de datos" });
                }
                else {
                    res.status(201).json("Gestor añadido");
                }
            }
        }
    });
};

