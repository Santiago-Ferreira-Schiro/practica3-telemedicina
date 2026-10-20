
//http://localhost:3000/appCliente/
// para saber quien esta logeado, si es null es que no es nadie todavia
let usuarioLogeado;
var idModificado;
var token;

//variable para saber en que página estamos
var seccionActual = "login";

//conseguimos categorias, ubicaciones, modelos y recursos de entrada para poder usarlos más adelante
var categorias =[];
var ubicaciones =[];
var modelos =[];
var recursos =[];
var reservas =[];

//para poder traducir las areas en el ranking
var nombresAreas = [
    {"id": 1, "nombre": "Alergología"},
    {"id": 2, "nombre": "Anestesiología"},
    {"id": 3, "nombre": "Cardiología"},
    {"id": 4, "nombre": "Cirugía General"},
    {"id": 5, "nombre": "Dermatología"},
    {"id": 6, "nombre": "Aparato Digestivo"},
    {"id": 7, "nombre": "Endocrinología"},
    {"id": 8, "nombre": "Ginecología"},
    {"id": 9, "nombre": "Hematología"},
    {"id": 10, "nombre": "Medicina Interna"},
    {"id": 11, "nombre": "Neumología"},
    {"id": 12, "nombre": "Neurología"},
    {"id": 13, "nombre": "Oftalmología"},
    {"id": 14, "nombre": "Oncología"},
    {"id": 15, "nombre": "Pediatría"},
    {"id": 16, "nombre": "Psiquiatría"},
    {"id": 17, "nombre": "Traumatología"},
    {"id": 18, "nombre": "Urología"}
];

function conseguirGets(callback){

    var terminados = 5;
    rest.get(conToken("/api/categorias"), function (estado, respuesta) {//tarde 1 min
        if (sesionCaducada(estado)) return;
        terminados--;
        if (estado != 200) {
            alert("Error cargando los datos del buscador");
        }else{
            categorias = respuesta;
        }

        if(terminados == 0){
            fin();
        }
    });

    rest.get(conToken("/api/ubicaciones"), function (estado, respuesta) {
        if (sesionCaducada(estado)) return;
        terminados--;
        if (estado != 200) {
            alert("Error cargando los datos del buscador");
        }else{
            ubicaciones = respuesta;
        }

        if(terminados == 0){
            fin();
        }
    });

    rest.get(conToken("/api/modelos"), function (estado, respuesta) {
        if (sesionCaducada(estado)) return;
        terminados--;
        if (estado != 200) {
            alert(respuesta);
        }else{
            modelos = respuesta;
        }

        if(terminados == 0){
            fin();
        }
    });

    rest.get(conToken("/api/recursos"), function (estado, respuesta) {
        if (sesionCaducada(estado)) return;
        terminados--;
        if (estado != 200) {
            alert("Error cargando los datos del buscador");
        }else{
            recursos = respuesta;
        }

        if(terminados == 0){
            fin();
        }
    });

    rest.get("https://undefined.ua.es/telemedicina/api/datos", function (estado, respuesta) {
        terminados--;
        if (estado != 200) {
            alert("Error cargando los datos del ministerio");
        }else{
            reservas = respuesta;
        }
        
        if(terminados == 0){
            fin();
        }
    });

    function fin(){
        callback();
    }

}

function login(){
    //conseguimos los inputs
    let usuarioIngresado = document.getElementById("usuario").value;
    let contrasenyaIngresada = document.getElementById("contrasenya").value;
    let usuario = {"usuario" : usuarioIngresado, "contrasenya" : contrasenyaIngresada};
    
    rest.post("/api/gestores/login", usuario, function (estado, respuesta) {

       if (estado == 200){
            usuarioLogeado = respuesta[1];
            token = respuesta[0];
            //terminamos y nos vamos a la pagina de inicio
            cambiarSeccion('inicio');
            conectarseServidor(usuarioLogeado.id, "gestor");
        }
        else if(estado == 500){
            alert(respuesta);
        }
        else{
            alert(respuesta);
       }
    }); 
    
}

function registrar(){
    //creamos la ficha del gestor

    let gestor = {
        "id":0,
        "nombre" : document.getElementById("nombreRegistro").value,
        "apellidos" : document.getElementById("apellidosRegistro").value,
        "login" : document.getElementById("loginRegistro").value,
        "contrasenya" : document.getElementById("contrasenyaRegistro").value 
        };
    
    //posteamos
    rest.post("/api/gestores", gestor, function (estado, respuesta) { 

            if (estado == 201) {
                alert("registro exitoso");

                //nos volvemos al login
                cambiarSeccion('login');
            } else{
                alert(respuesta);
            }
    });
    cambiarSeccion('login');
}

function irRegistro(){
    //en caso de que se registre, lo dejamos poner contraseña, si quiere cambiar datos no la mostramos ni dejamos modificarla
    cambiarSeccion('registroGestor');

    if (usuarioLogeado){
        document.getElementById("grupoContrasenya").style.display = "none";
        document.getElementById("tituloRegistro").textContent="Modificar datos";
    }else{
        document.getElementById("nombreRegistro").value = "";
        document.getElementById("apellidosRegistro").value = "";
        document.getElementById("loginRegistro").value = "";
        document.getElementById("contrasenyaRegistro").value = "";
        document.getElementById("tituloRegistro").textContent="Datos Gestor";
        document.getElementById("grupoContrasenya").style.display = "block";
    }
    
}

function cambiarDatos(){
    //si no hay nadie logeado, lo mandamos a registrar, caso contrario estamos modificando datos
    if(usuarioLogeado == null){
        registrar();
    }else{
        let objetoActualizar = {
            "nombre" : document.getElementById("nombreRegistro").value,
            "apellidos" : document.getElementById("apellidosRegistro").value,
            "login" : document.getElementById("loginRegistro").value,
        };
        //controlo que nada esté en blanco
        if(objetoActualizar.nombre == "" || objetoActualizar.apellidos == ""|| objetoActualizar.login == ""){
            alert("No puede haber campos en blanco");
            return;
        }

        rest.put(conToken("/api/gestores/" + usuarioLogeado.id), objetoActualizar, function (estado, respuesta) { 
            if (sesionCaducada(estado)) return;
            if (estado == 200) {
                //actualizo el usuario logeado
                usuarioLogeado.nombre = objetoActualizar.nombre;
                usuarioLogeado.apellidos = objetoActualizar.apellidos;
                usuarioLogeado.login = objetoActualizar.login;

                alert(respuesta);
                cambiarSeccion('inicio');
            } else {
                alert(respuesta);
            }
        });
    
    }
}

function cancelarRegistro(){
    // si accedimos al registro ya logeados desde el inicio y cancelamos, volvemos al inicio, sino volvemos al login (index.html)
    if(usuarioLogeado != null){
        cambiarSeccion('inicio');
    }else{
        cambiarSeccion('login');
    }
}

function cargarInicio(){
    conseguirGets(function(){
        //por si vamos al inicio muestro el nombre del usuario por pantalla
        document.getElementById("nombreUsuario").textContent= usuarioLogeado.nombre + " " + usuarioLogeado.apellidos;

        //cargamos los selects en las paginas de modificacion de recursos y en el inicio, solo si están vacios
        if(document.getElementById("categoriaInicio").options.length == 1){
            cargarSelects("categoriaInicio","ubicacionInicio","modeloInicio");
        }
        if(document.getElementById("categoriaRecursos").options.length == 0){
            cargarSelects("categoriaRecursos","ubicacionRecursos", "modeloRecursos");
        }

        imprimir(traducirRecursos(recursos));

        cargarRanking(reservas);
    })  
}

function cambiarSeccion(seccion){
    if(seccion == "inicio"){
        cargarInicio();
    }

    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;

}

function salir(){
    token = null;
    usuarioLogeado = null;

    //#region limpio los datos del gestor anterior
    categorias = [];
    ubicaciones = [];
    modelos = [];
    recursos = [];
    reservas = [];
    document.getElementById("cuerpo_inicio").innerHTML = "";
    document.getElementById("tablaReservas").innerHTML = "";
    document.getElementById("tablaResenyas").innerHTML = "";
    document.getElementById("cuerpo_ranking").innerHTML = "";
    document.getElementById("nombreUsuario").textContent = "";
    //#endregion
    
    cambiarSeccion('login');
    desconectarseServidor()
}

function buscar(){
    //conseguimos los filtros
    let cat = document.getElementById("categoriaInicio").value;
    let mod = document.getElementById("modeloInicio").value;
    let ubi = document.getElementById("ubicacionInicio").value;
    let est = document.getElementById("estadoInicio").value;

    //filtramos los recursos
    let recursosFiltrados = [];
    for( let i = 0; i < recursos.length; i++){

        if (recursos[i].categoria == cat || cat == "todos"){

            if(recursos[i].modelo == mod || mod == "todos"){

                if(recursos[i].ubicacion == ubi || ubi == "todos"){ 

                    if(recursos[i].estado == est || est =="todos"){
                        recursosFiltrados.push(recursos[i]);
                    }
                }  
            }
        }
    }

    //traducimos los recursos
    imprimir(traducirRecursos(recursosFiltrados));
}

//actualizo los modelos por si cambia el select de categoria
document.getElementById("categoriaInicio").addEventListener("change", function() {
    let catId = parseInt(this.value);
    let selectModelo = document.getElementById("modeloInicio");

    // limpiar modelos anteriores
    selectModelo.innerHTML = "";

    // agregar modelos que correspondan
        for(let i = 0; i < modelos.length ; i++){
            if(catId == modelos[i].categoria){
                let option = document.createElement("option");
                option.value = modelos[i].id;
                option.textContent = modelos[i].nombre;
                document.getElementById("modeloInicio").appendChild(option);

            }
        }
    //vuelvo a meter la opción de todos
    var todos = document.createElement("option");
    todos.value = "todos";
    todos.textContent = "Todos";
    document.getElementById("modeloInicio").appendChild(todos);
    
});

//hago lo mismo que el anterior pero para la pagina de recursos
document.getElementById("categoriaRecursos").addEventListener("change", function() {
    let catId = parseInt(this.value);
    let selectModelo = document.getElementById("modeloRecursos");

    // limpiar modelos anteriores
    selectModelo.innerHTML = "";

    // agregar modelos que correspondan
        for(let i = 0; i < modelos.length ; i++){
            if(catId == modelos[i].categoria){
                let option = document.createElement("option");
                option.value = modelos[i].id;
                option.textContent = modelos[i].nombre;
                document.getElementById("modeloRecursos").appendChild(option);

            }
        }
    //vuelvo a meter la opción de todos
    var todos = document.createElement("option");
    todos.value = "todos";
    todos.textContent = "Todos";
    document.getElementById("modeloRecursos").appendChild(todos);
    
});

//traduce los valores númericos de un array de recursos a su valor en palabra
//por el amor de dios no toques esto
function traducirRecursos(entradas){
    //let ubicaciones = [{"id": 1, "nombre": "salas"}
    //let categorias = [{"id":1, "nombre": "termómetros"}
    //let modelos = [{"id": 1, "nombre": "termometro1", "categoria": 1, "horas_maximas": 4}
   // let recursos = [{"numero_serie": "454554", "categoria": 1, "modelo": 1, "ubicacion": 2, "estado": 0, "id":1}
   
   let salidas = [];
   //recorro cada recurso
   for(let i = 0; i < entradas.length; i++){
        //creo una copia para no modificar el original
        let recurso = { ...entradas[i] };

        //traduzco el modelo, en este caso el modelo depende de categoria
        for( let a = 0; a < modelos.length; a++){
            if(recurso.modelo == modelos[a].id){
                recurso.modelo = modelos[a].nombre;
                break;
            }
        }

        //traduzco las ubicaciones recorriendo cada una hasta que una coincida
        for( let a = 0; a < ubicaciones.length; a++){
            if(recurso.ubicacion == ubicaciones[a].id){
                recurso.ubicacion = ubicaciones[a].nombre;
                break;
            }
        }

        //traduzco las categorias
        for( let a = 0; a < categorias.length; a++){
            if(recurso.categoria == categorias[a].id){
                recurso.categoria = categorias[a].nombre;
                break;
            }
        }

        

        switch(recurso.estado){
            case 0:
                recurso.estado = "operativo";
                break;
            case 1:
                recurso.estado = "de baja o defectuoso";
                break;
            case 2:
                recurso.estado = "en mantenimiento";
                break;
        }
        
        salidas.push(recurso);
   }
   return salidas;
}

//le metes un array de recursos y los muestra en la tabla
function imprimir(rec){
    //limpiamos la tabla
    let tabla = document.getElementById("cuerpo_inicio");
    tabla.innerHTML ="";

    //ahora cargamos la tabla con todos los recursos
    for ( let i = 0; i < rec.length; i++){
        let recurso =rec[i];
        // Crear fila
        let fila = document.createElement("tr");


        // Crear celdas y llenarlas
        for (let key in recurso) {
            //imprimo todo menos el id
            if (key === "id") continue;

            const celda = document.createElement("td");
            celda.textContent = recurso[key];
            fila.appendChild(celda);
        }

        //creo el boton de borrar
        let borrar = document.createElement("button");
        borrar.textContent = "X";
        borrar.onclick = function() {
            borrarRecurso(rec[i].id);
        };

        //creo el boton de abrir
        let abrir = document.createElement("button");
        abrir.textContent = "Abrir";
        abrir.onclick = function() {
            modificarRecurso(rec[i].id);
        };

        //creo la celda y la meto a la fila
        let celdaAcciones = document.createElement("td");
        celdaAcciones.appendChild(abrir);
        celdaAcciones.appendChild(borrar);
        fila.appendChild(celdaAcciones);

        // Agregar fila a la tabla
        tabla.appendChild(fila);
    }
}

function borrarRecurso(id){
    //Borro en la BD
    rest.delete(conToken("/api/recursos/" + id), function (estado, respuesta) {
        if (sesionCaducada(estado)) return;

        if (estado == 200) {
            // asumimos que el servidor devuelve el array actualizado,lo hago asi no hay incongruencias con la BD
            recursos = respuesta;
            //vuelvo a imprimir la tabla
            imprimir(traducirRecursos(recursos));

        } else {
            alert(respuesta);
        }
    });
}

function modificarRecurso(id){
    cambiarSeccion("recursos");
    //consigo el recurso que se va a modificar
    var recurso;
    for(let i = 0; i < recursos.length ; i++){
        if(recursos[i].id == id){
            recurso = recursos[i];
            break;
        }
    }

    //pongo los datos del recurso por pantalla
    document.getElementById("categoriaRecursos").value = recurso.categoria;
    document.getElementById("modeloRecursos").value = recurso.modelo;
    document.getElementById("ubicacionRecursos").value = recurso.ubicacion;
    document.getElementById("estadoRecursos").value = recurso.estado;
    document.getElementById("numero_serieRecursos").value = recurso.numero_serie;

    idModificado = id;

    //pedimos a la BD las reservas de este recurso en especifico
    rest.get(conToken("/api/recursos/" + id + "/reservas"), function(estado, respuesta) {
        if (sesionCaducada(estado)) return;

        if (estado == 200) {
            imprimirReservas(respuesta);
        } else {
            alert(respuesta);
        }
    });

    //pedimos a la BD las reseñas de este recurso
    rest.get(conToken("/api/recursos/" + id + "/resenyas"), function(estado, respuesta) {
        if (sesionCaducada(estado)) return;

        if (estado == 200) {
            imprimirResenyas(respuesta);
        } else {
            alert(respuesta);
        }
    });
    
}

function crearRecurso(){
    document.getElementById("tablaReservas").innerHTML="";
    document.getElementById("tablaResenyas").innerHTML="";
    document.getElementById("numero_serieRecursos").value="";
    cambiarSeccion('recursos');
    
}

//te carga los selects con categorias, ubicaciones y modelos, le tenes que pasar el id del select que queres que rellene
function cargarSelects(catId, ubiId, modId){

     //con bucles llenamos los selects
        for(let i = 0; i < categorias.length; i++){ 
            let option = document.createElement("option");
            option.value = categorias[i].id;
            option.textContent = categorias[i].nombre;
            document.getElementById(catId).appendChild(option);
        }

        for(let i = 0; i < ubicaciones.length; i++){ 
            let option = document.createElement("option");
            option.value = ubicaciones[i].id;
            option.textContent = ubicaciones[i].nombre;
            document.getElementById(ubiId).appendChild(option);
        }

        for(let i = 0; i < modelos.length; i++){
            let option = document.createElement("option");
            option.value = modelos[i].id;
            option.textContent = modelos[i].nombre;
            document.getElementById(modId).appendChild(option);
        }
}

function guardar(){
    //conseguimos los valores del formulario
    var cat = document.getElementById("categoriaRecursos").value;
    var mod = document.getElementById("modeloRecursos").value;
    var num = document.getElementById("numero_serieRecursos").value;
    var ubi = document.getElementById("ubicacionRecursos").value;
    var est = parseInt(document.getElementById("estadoRecursos").value);

    var objeto = {"numero_serie": num, "categoria": cat, "modelo":mod, "ubicacion": ubi, "estado": est, "id":"nn"};

    //si hay un idModificado significa que estamos modificando un recurso, caso contrario lo estamos creando
    if(idModificado){
        //ahora lo envio al servidor
        rest.put(conToken("/api/recursos/" + idModificado), objeto, function (estado, respuesta) { 
            if (sesionCaducada(estado)) return;

            if (estado == 200) {
                alert("modificacion de recurso exitosa");
                //actualizo los recursos
                recursos = respuesta;
            } else {
                alert("Error introduciendo nuevo gestor");
            }

            //actualizamos la tabla del inicio
            imprimir(traducirRecursos(recursos));

            //quito el idModificado para saber que no estamos modificando un dato
            idModificado = null;
        });

    }else{
        //envio al servidor el recurso nuevo
        rest.post(conToken("/api/recursos"), objeto, function (estado, respuesta) { 
            if (sesionCaducada(estado)) return;

            if (estado == 200) {
                alert("Recurso creado con éxito");
                //actualizo los recursos
                recursos = respuesta[1];
                recursoCreadoWS(respuesta[0].id);
            } else {
                alert("Error introduciendo nuevo recurso");
            }

            //actualizamos la tabla del inicio
            imprimir(traducirRecursos(recursos));

        });
    }
}

function imprimirReservas(reservas){
    //limpiamos la tabla
    let tabla = document.getElementById("tablaReservas");
    tabla.innerHTML ="";

    for(let i = 0; i < reservas.length; i++){
        let reserva = reservas[i];
        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in reserva) {
            //imprimo todo menos el id
            if (key === "id" || key === "recurso") continue;

            const celda = document.createElement("td");
            if(key == "sanitario"){ reserva["sanitario"] = reserva["sanitario"].replace("&", " ")}
            if(key === "fecha_peticion" || key == "fecha_inicio" || key == "fecha_fin"){
                celda.textContent = formatearFecha(reserva[key]);
            }else{
                celda.textContent = reserva[key];
            }   

            fila.appendChild(celda);
        }

        pintarFila(fila,reserva);
        // Agregar fila a la tabla
        tabla.appendChild(fila);

    }
        
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return null;

    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear()).slice(-2);
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio}\n${hora}:${minutos}:${segundos}`;
}

function pintarFila(fila, reserva){
    var ahora = new Date().toISOString().split('.')[0];

    //EL RECURSO ESTÁ en uso?
    if(reserva.fecha_inicio < ahora && reserva.fecha_fin == null){

        //tenemos que pasarlos a tipo date() para poder restarlos
        var inicio = new Date(reserva.fecha_inicio);

        var diferencia = new Date() - inicio;  

        // Pasar a horas
        const diferenciaHoras = diferencia / (1000 * 60 * 60);

        if(diferenciaHoras > reserva.horas_estimadas){
            fila.style.backgroundColor = "red";
        }else{
            fila.style.backgroundColor = "blue";
        }

    }else if(reserva.fecha_fin < ahora){
        fila.style.backgroundColor = "white";
        
    }else if(reserva.fecha_inicio > ahora && reserva.fecha_fin == null){
        fila.style.backgroundColor = "green";
    }
}

function imprimirResenyas(resenyas){
    //limpiamos la tabla
    let tabla = document.getElementById("tablaResenyas");
    tabla.innerHTML ="";

    for(let i = 0; i < resenyas.length; i++){
        let resenya = resenyas[i];
        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in resenya) {
            const celda = document.createElement("td");

            //imprimo todo menos el id
            if (key === "id" || key === "recurso") continue;
            if(key == "fecha"){
                celda.textContent = formatearFecha(resenya[key]);  
            }else{
                celda.textContent = resenya[key];  
            }
            fila.appendChild(celda);
        }

        // Agregar fila a la tabla
        tabla.appendChild(fila);

    }
}

function cargarRanking(reservas){
    //conseguimos solo que area es y cuantas reservas tiene
    var areas = [];
    for(let i = 0; i < reservas.length;i++){
        let idArea = reservas[i].id_area;
        let cantidad = reservas[i].datos.length;

        // Buscamos si el área ya existe
        let areaExistente = areas.find(area => area.idArea == idArea);

        if (areaExistente) {
            // Si existe, sumamos la cantidad
            areaExistente.cantidad += cantidad;
        } else {
            // Si no existe, la agregamos
            areas.push({
                idArea: idArea,
                cantidad: cantidad
            });
        }
    }
    //ya tenemos todas un array con todas las areas tipo [{"idArea":5, "cantidad"=100}, ...]
    // Ordenamos de mayor a menor
    areas.sort((a, b) => b.cantidad - a.cantidad);

    areas = traducirAreas(areas);
    
    imprimirRanking(areas);

}

//le pasas un array con áreas y te traduce el idArea al nombre de esa área.
function traducirAreas(areas){
    for(let i = 0; i < areas.length;i++){
        let area = areas[i];
        
        for(let a = 0; a < nombresAreas.length; a++){
            if(nombresAreas[a].id == area.idArea){
                area.idArea = nombresAreas[a].nombre;
                break;
            }
        }
    }
    return areas;
}

//le pasas un array con areas traducidas y te lo imprime por pantalla
function imprimirRanking(areas){
    var tabla = document.getElementById("cuerpo_ranking");
    tabla.innerHTML = "";
    for(let i = 0; i < areas.length; i++){
        let area = areas[i];
        let fila = document.createElement("tr");

        //primero la posición
        let pos = document.createElement("td");
        pos.classList.add("posicion-" + (i + 1)); //esto es para poder meterle las medallitas en el css
        pos.textContent = i+1;
        fila.appendChild(pos);

        //el nombre
        let nombre = document.createElement("td");
        nombre.textContent = area.idArea;
        fila.appendChild(nombre);

        //la cantidad
        let cantidad = document.createElement("td");
        cantidad.textContent = area.cantidad;
        fila.appendChild(cantidad);

        tabla.appendChild(fila);
    }   
}

function enviarReservas(){
    var datos = [];

    conseguirReservas(function(reservas){
        var formateadas = formatearReservas(reservas);
        let mensaje = {"id_area":4, "fecha": new Date().toISOString().split("T")[0], "datos":formateadas};
        //enviamos
        rest.post("https://undefined.ua.es/telemedicina/api/datos", mensaje, function (estado, respuesta) { 

            if (estado == 201) {
                alert("Reservas enviadas al servidor del ministerio");

            } else{
                alert("Error en el envío de reservas");
            }
        });
    });
    
}

//le pasas un array de reservas normales y te las deja en el formato que quiere el profesor
function formatearReservas(reservas){
    //{id: 93, sanitario: santi ferreira , horas_estimadas: 5, fecha_peticion: '2026-10-15T16:55:54.000Z', fecha_inicio: '2026-10-15T16:55:55.000Z', "fecha_fin": fecha, "recurso":rec} 

    //{“nombre” :“Nombre del sanitario”,“apellidos”: ”Apellidos del sanitario”, 
    //“categoría”:“Categoría del recurso”, “horas_estimadas”: “Horas estimadas”, 
    // “fec_pet”: ”Fecha de petición”, “fec_ini”: “fecha de inicio”, “fecha_fin”: “fecha de fin”}

    var formateadas = [];
    //por cada reserva
    for(let i = 0; i < reservas.length; i++){
        let reserva = reservas[i];

        //separo el nombre
        let nombre = reserva.sanitario.split("&");

        //consigo el recurso que esta usando
        for(let a = 0; a < recursos.length; a++){
            if(recursos[a].id == reserva.recurso){
                var recurso = recursos[a];
                break;
            }
        }

        //consigo la categoria del recurso
        for(let a = 0; a < categorias.length; a++){
            if(categorias[a].id == recurso.categoria){
                var categoria = categorias[a].nombre;
                break;
            }
        }

        //formateo las fechas así porque sino si alguna es null da problema
        if(reserva.fecha_peticion){
            reserva.fecha_peticion = reserva.fecha_peticion.split("T")[0];
        }
        if(reserva.fecha_inicio){
            reserva.fecha_inicio = reserva.fecha_inicio.split("T")[0];
        }
        if(reserva.fecha_fin){
            reserva.fecha_fin = reserva.fecha_fin.split("T")[0];
        }

        var formateada ={"nombre": nombre[0], "apellidos": nombre[1], "categoria": categoria, "horas_estimadas":reserva.horas_estimadas, "fec_pet": reserva.fecha_peticion, "fec_ini": reserva.fecha_inicio, "fecha_fin": reserva.fecha_fin};
        formateadas.push(formateada);

    }
    return formateadas;
   
}

function conseguirReservas(callback){

    //como solo podemos pedir las reservas de un recurso específico, pedimos todas recurso por recurso
    var contador = recursos.length;
    var reservas = [];

    // Si no hay recursos, devolvemos un array vacío
    if (contador == 0) {
        return callback(reservas);
    }

    for(let i = 0; i < recursos.length;i++){
        //pedimos a la BD las reservas de este recurso en especifico
        rest.get(conToken("/api/recursos/" + recursos[i].id + "/reservas"), function(estado, respuesta) {
            if (sesionCaducada(estado)) return;

            if (estado == 200) {
                //respuesta es un array, así que para no meter un array dentro de otro metemos reserva por reserva
                for(let a = 0; a < respuesta.length; a++){
                    reservas.push(respuesta[a]);
                }
               
            }else {
                alert(respuesta);
            }

            contador--;
            if(contador == 0){
                return callback(reservas);
            }
        });
    }
}

//añade el token (codificado) a una url
function conToken(url){
    return url + (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
}

//si el servidor dice que el token no vale, cerramos sesión. Devuelve true si es el caso
function sesionCaducada(estado){
    if(estado == 401 || estado == 403){
        if(token){ //evita que salga el alert 4 veces en conseguirGets
            salir();
            alert("Sesión caducada, vuelve a iniciar sesión");
        }
        return true;
    }
    return false;
}
