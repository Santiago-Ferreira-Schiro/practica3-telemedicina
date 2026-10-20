// importo express y lo llamo app
var express = require("express");
var app = express();

// 1. Importar el cliente de Supabase
const { createClient } = require("@supabase/supabase-js");

// 2. Configurar con tu URL y tu clave pública
const supabaseUrl = "https://zbspubmoluralygrkgjd.supabase.co";
const supabaseKey = "sb_publishable_CodnqKuB-SBA2d-4hvo4UQ_BBDaGZPp";
const supabase = createClient(supabaseUrl, supabaseKey);

// que toda la comunicación va a ser en json
app.use(express.json());

// siempre que el usuario meta en el buscador el primer argumento, va a devolver el html de la carpeta cliente
app.use("/appCliente", express.static("../cliente"));
app.use("/ws", express.static("../cliente_ws"));

// 1. Login público
require("./routes/login-registro.js")(app, supabase);

// 2. Middleware de autenticación
var autenticar = require("./auth.js");
app.use("/api", autenticar);

// 3. Cargo rutas
require("./routes/gestores.js")(app, supabase);
require("./routes/categorias.js")(app, supabase);
require("./routes/ubicaciones.js")(app, supabase);
require("./routes/modelos.js")(app, supabase);
require("./routes/recursos.js")(app, supabase);

// establezco el puerto
app.listen(3000);

// por si hay que matar al puerto >netstat -ano | findstr :3000
// taskkill /PID NUMERO_DEL_PID
