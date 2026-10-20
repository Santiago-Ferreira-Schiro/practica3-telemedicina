//importo express y lo llamo app 
var express = require("express");
var app = express();

// 1. Importar el cliente de Supabase
const { createClient } = require("@supabase/supabase-js");

// 2. Configurar con tu URL y tu clave pública
const supabaseUrl = "TU_URL_DE_SUPABASE";
const supabaseKey = "TU_PUBLISHABLE_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

// que toda la comunicación va a ser en json
app.use(express.json()); 

// siempre que el usuario meta en el buscador el primer argumento, va a devolver el html de la carpeta cliente
app.use("/appCliente", express.static("../cliente")); 
app.use("/ws", express.static("../cliente_ws")); 

// 1. Login público
require("./routes/login-registro.js")(app);

// 2. Middleware de autenticación
var autenticar = require("./auth.js");
app.use("/api", autenticar);

// 3. Cargo rutas
//esto va siempre DESPÚES de declarar que vamos a usar json, osea ln 7
require("./routes/gestores.js")(app);
require("./routes/categorias.js")(app);
require("./routes/ubicaciones.js")(app);
require("./routes/modelos.js")(app);
require("./routes/recursos.js")(app);

//establezco el puerto
app.listen(3000);
//por si hay que matar al puerto >netstat -ano | findstr :3000
//taskkill /PID NUMERO_DEL_PID
