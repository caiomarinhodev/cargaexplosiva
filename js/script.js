/**
 * Created by Caio on 12/11/2015.
 */
var player = {
    nome_empresa: "",
    imagem: "",
    login: "",
    senha: "",
    primeiro_login: true,
    conta_corrente: 0,
    veiculos: [],
    empregados: [],
    tipo_plano: null,
    contratos: [],
    emprestimo: 0,
    parcela: 0,
    num_parcela: 0,
    pontos: 0,
    nivel: 1
};

var map;
var time_stations = [];
var control;

var veiculo_selected = {};
var PARADO = false; var SERVICO = true; var A_VENDA = 0; var COMPRADO = 1;
var veiculo = {
    nome: "",
    imagem: "",
    valor: 0,
    velocidade: 0,
    situacao: A_VENDA,
    status: PARADO,
    km_rodados: 0
};

var empregado_selected = {};
var empregado = {
    nome: "",
    imagem: "",
    nivel: 0,
    xp_pontos: 0,
    situacao: A_VENDA,
    status: PARADO,
    requisitos: {
        pontos: 0,
        nivel: 0
    },
    salario: 0
};

var contrato_selected = {};
var CONCLUIDO= true; var ENCAMINHADO=false; var NAO_PAGO=false; var PAGO=true;
var contrato = {
    empresa_contratante: "",
    imagem: "",
    p1:"",
    p2:"",
    pp:"",
    requisito:{
        pontos:0,
        nivel:0,
        km_rodados_veiculo: 0,
        nivel_empregado: 0
    },
    status_entrega: ENCAMINHADO,
    valor_pagamento: 0,
    status_pagamento: NAO_PAGO,
    veiculo: {},
    empregado: {},
    valor_custo_viagem: 0
};


var lista_de_contratos = [
    {
        empresa_contratante: "Apple Inc.",
        imagem: "images/apple.jpg",
        p1: L.latLng(-7.240615,-35.931438),
        p2: L.latLng(-7.230975,-35.88249),
        pp:"",
        requisito:{
            pontos:100,
            nivel:3,
            km_rodados_veiculo: 100,
            nivel_empregado: 2
        },
        status_entrega: ENCAMINHADO,
        valor_pagamento: 10000,
        status_pagamento: NAO_PAGO,
        veiculo: {},
        empregado: {},
        valor_custo_viagem: 0
    },
    {
        empresa_contratante: "Exxon Mobil",
        imagem: "images/exxon.jpg",
        p1: L.latLng(-7.240615,-35.931438),
        p2: L.latLng(-7.230975,-35.88249),
        pp:"",
        requisito:{
            pontos:1,
            nivel:0,
            km_rodados_veiculo: 10000,
            nivel_empregado: 0
        },
        status_entrega: ENCAMINHADO,
        valor_pagamento: 0,
        status_pagamento: NAO_PAGO,
        veiculo: {},
        empregado: {},
        valor_custo_viagem: 0
    }
];

var lista_de_empregados=[
    {
        nome: "John Doe",
        imagem: "images/John_Doe.jpg",
        nivel: 1,
        xp_pontos: 100,
        requisitos: {
            pontos: 0,
            nivel: 0
        },
        situacao: A_VENDA,
        status: PARADO,
        salario: 100
    },
    {
        nome: "Tom Gartol",
        imagem: "images/tom-gartol.jpg",
        nivel: 3,
        xp_pontos: 200,
        requisitos: {
            pontos: 200,
            nivel: 2
        },
        situacao: A_VENDA,
        status: PARADO,
        salario: 500
    }
];

var lista_de_veiculos=[
    {
        nome: "Bicicleta Caloi",
        imagem: "images/caloi-simples.jpg",
        valor: 499.90,
        situacao: A_VENDA,
        status: PARADO,
        velocidade: 20,
        km_rodados: 0
    },
    {
        nome: "Bicicleta Caloi Supra 30",
        imagem: "images/caloi-supra.jpg",
        valor: 2399.90,
        situacao: A_VENDA,
        status: PARADO,
        velocidade: 30,
        km_rodados: 0
    },
];


$(document).delegate("#index", "pageinit", function () {
    var email_bd = get_login();
    if(email_bd!=undefined && email_bd!='' && email_bd!=' '){
        $('#input_email').val(email_bd);
    }else{
        $.mobile.navigate('registro.html');
    }

    $('#btn_entrar').on('click', function () {
        $.mobile.navigate('inicio.html');
    });

});

$(document).delegate("#registro", "pageinit", function () {
    var login = $('[name=login]').val();
    var senha = $('[name=senha]').val();
    var re_senha = $('[name=re_senha]').val();
    $('#btn_registrar').on('click', function () {
        if(senha == re_senha){
            player.login = login;
            player.senha = senha;
            player.primeiro_login = true;
            save_login(login);
            persist_database('player', player);
            $.mobile.navigate('index.html');
        }
    });
});

$(document).delegate("#tutorial_one", "pageinit", function () {
    var nome_empresa = $('[name=nome_empresa]').val();
    player.nome_empresa = nome_empresa;
    persist_database('player', player);
    $.mobile.navigate("tutorial_two.html");
});

$(document).delegate("#tutorial_two", "pageinit", function () {
    $('[name=free]').on('click', function(){
        player.pontos += 5;
        player.nivel = 1;
        player.imagem = 'images/user.jpg';
        persist_database('player', player);
        $.mobile.navigate("tutorial_three.html");
    });
});


$(document).delegate("#tutorial_three", "pageinit", function () {
    $('#btn_go_loja').on('click', function(){
        $.mobile.navigate("loja_veiculos.html");
    });
});

$(document).delegate("#tutorial_four", "pageinit", function () {
    $('#btn_go_central').on('click', function(){
        $.mobile.navigate("central_empregos.html");
    });
});


$(document).delegate("#loja_veiculos", "pageinit", function () {
    var lista = $('#lista');
    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var indice = parseInt(temp.indice);
            veiculo_selected = lista_de_veiculos[indice];
            $.mobile.navigate("ver_veiculo.html");
        });
    });
});

$(document).delegate("#ver_veiculo", "pageinit", function () {
    $('[name=nome]').text(veiculo_selected.nome);
    $('[name=imagem]').attr('src', veiculo_selected.imagem);
    $('[name=velocidade]').text(veiculo_selected.velocidade);
    $('[name=status]').text(veiculo_selected.status);
    $('[name=km]').text(veiculo_selected.km_rodados);
    $('[name=valor]').text(veiculo_selected.velocidade);
    if(veiculo_selected.situacao == A_VENDA){
        $('[name=comprar]').removeClass('oculto');
    }else{
        $('[name=comprar]').addClass('oculto');
    }
    $('[name=comprar]').on('click', function(){
        if(verifica_se_pode_comprar(veiculo_selected.valor)){
            player.conta_corrente = player.conta_corrente - veiculo_selected.valor;
            player.pontos += 10;
            veiculo_selected.status = PARADO;
            veiculo_selected.situacao = COMPRADO;
            player.veiculos.push(veiculo_selected);
            veiculo_selected = {};
            persist_database('player', player);
            if(player.primeiro_login){
                $.mobile.navigate("tutorial_four.html");
            }else{
                $.mobile.navigate("inicio.html");
            }
        }else{
           //TODO: POPUP NAO POSSUI GRANA!
        }
    });
});


$(document).delegate("#central_empregos", "pageinit", function () {
    var lista = $('#lista');
    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var indice = parseInt(temp.indice);
            empregado_selected = lista_de_empregados[indice];
            $.mobile.navigate("ver_empregado.html");
        });
    });
});

$(document).delegate("#ver_empregado", "pageinit", function () {
    $('[name=nome]').text(empregado_selected.nome);
    $('[name=imagem]').attr('src', empregado_selected.imagem);
    $('[name=nivel]').text(empregado_selected.velocidade);
    $('[name=status]').text(empregado_selected.status);
    $('[name=km]').text(empregado_selected.km_rodados);
    $('[name=valor]').text(empregado_selected.velocidade);
    if(empregado_selected.situacao == A_VENDA){
        $('[name=comprar]').removeClass('oculto');
    }else{
        $('[name=comprar]').addClass('oculto');
    }
    $('[name=comprar]').on('click', function(){
        if(verifica_se_pode_comprar(empregado_selected.salario)){
            player.conta_corrente = player.conta_corrente - empregado_selected.salario;
            player.pontos += 10;
            empregado_selected.status = PARADO;
            empregado_selected.situacao = COMPRADO;
            player.empregados.push(empregado_selected);
            empregado_selected = {};
            if(player.primeiro_login){
                player.primeiro_login = false;
                persist_database('player', player);
                $.mobile.navigate("inicio.html");
            }else{
                persist_database('player', player);
                $.mobile.navigate("inicio.html");
            }
        }else{
            //TODO: POPUP NAO POSSUI GRANA!
        }
    });
});


$(document).delegate("#inicio", "pageinit", function () {

    if (player.primeiro_login) {
        //$.mobile.navigate("tutorial_one.html");
        var contratos = player.contratos;
        if(contratos.length>0){
            map = initialize_map(L.latLng(-7.240615,-35.931438));
            var msg;
            // SET TILE CALL FUNCTION
            add_tile_default(map);
        }else{
            // INSTANCIA MAP
            map = initialize_map(L.latLng(-7.240615,-35.931438));
            var msg;
            // SET TILE CALL FUNCTION
            add_tile_default(map);
            //control = generate_control_route(L.latLng(-7.240615,-35.931438), L.latLng(-7.230975,-35.88249));

        }
    }else{
        var contratos = player.contratos;
        if(contratos.length>0){
            map = initialize_map(L.latLng(-7.240615,-35.931438));
            var msg;
            // SET TILE CALL FUNCTION
            add_tile_default(map);
        }else{
            // INSTANCIA MAP
            map = initialize_map(L.latLng(-7.240615,-35.931438));
            var msg;
            // SET TILE CALL FUNCTION
            add_tile_default(map);
            //control = generate_control_route(L.latLng(-7.240615,-35.931438), L.latLng(-7.230975,-35.88249));

        }
    }

});






//function maquina_is_active(maquina) {
//    if (moment() >= moment(maquina.tempo_de_vida)) {
//        maquina.status = false;
//        player.espaco.maquinas = removeFunction(player.espaco.maquinas, 'nome', maquina.nome);
//        player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', maquina.nome);
//        $.mobile.changePage("aviso_maquina_aluguel.html", {role: "dialog"});
//    } else {
//        maquina.status = true;
//    }
//    return maquina.status;
//}






// generate control route
function generate_control_route(p1, p2){
    return L.Routing.control({
        waypoints: [
            p1,
            p2
        ],
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
        pointMarkerStyle: {radius: 15, color: '#dddddd', fillColor: 'blue', opacity: 1, fillOpacity: 0.7},
        collapsible: true,
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim(),
        waypointNameFallback: function (latLng) {
            function zeroPad(n) {
                n = Math.round(n);
                return n < 10 ? '0' + n : n;
            }

            function sexagesimal(p, pos, neg) {
                var n = Math.abs(p),
                    degs = Math.floor(n),
                    mins = (n - degs) * 60,
                    secs = (mins - Math.floor(mins)) * 60,
                    frac = Math.round((secs - Math.floor(secs)) * 100);
                return (n >= 0 ? pos : neg) + degs + '°' +
                    zeroPad(mins) + '\'' +
                    zeroPad(secs) + '.' + zeroPad(frac) + '"';
            }

            return sexagesimal(latLng.lat, 'N', 'S') + ' ' + sexagesimal(latLng.lng, 'E', 'W');
        }
    }).addTo(map);
}

//METHOD TO GET ITINERARIO ARRAY GENERATED
//        function get_text_generate_route(control){
//            var arr = [];
//            control.on('routesfound', function (e) {
//                var routes = e.routes;
//                routes[0].coordinates.forEach(function(obj){
//                    arr.push([obj.lat, obj.lng]);
//                });
//                console.log(JSON.stringify(arr));
//            });
//        }

// DESENHA PERCURSO PEDINDO ITINERARIO ARRAY E MAPA OBJECT
function desenha_percurso(itinerario, map){
    L.polyline(itinerario, {color: 'red'}).addTo(map);
    map.fitBounds(itinerario);
}

//FUNCTION TO FILL TIMES ARRAY
function fill_times_array(time_in_milli, itinerario_test){
    itinerario_test.forEach(function(po){
        time_stations.push(time_in_milli);
    });
}

/**
 * ADD TILE DEFAULT
 */
function add_tile_default(map){
    L.tileLayer('http://{s}.tiles.mapbox.com/v4/thinhnvv.cieef6v3v025rs9lx3852m36x/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhpbmhudnYiLCJhIjoiZjQzYWM1ZDQ4YjNkNjc5YzQwZjA5OWIwNTNhZDNhODMifQ.53wH0q9UO48XrvK_TUESmg',
        { maxZoom: 18}).addTo(map);
}

/**
 * INICIALIZA MAPA PEDINDO PONTO INICIAL EX.: L.latLng(-7.240615,-35.931438)
 * @param point PONTO INICIAL EX.:L.latLng(-7.240615,-35.931438)
 * @returns {*} MAPA OBJECT
 */
function initialize_map(point){
    map = L.map('map').setView([point.lat,point.lng], 14);
    return map;
}

/**
 * CALCULA MEDIA DE VELOCIDADE
 * @param total_milli TEMPO EM MILLISECONDS
 * @param array_points ARRAY DO PERCURSO
 * @returns {string} O TEMPO FIXED EM .2;
 */
function calcula_media_velocidade(total_milli, array_points){
    return (total_milli/array_points.length).toFixed(2);
}

/**
 * TRANSFORMA KM/H EM M/S
 * @param kmh VELOCIDADE EM KM/H
 * @returns {*} VELOCIDADE EM M/S
 */
function calcula_kmh_to_ms(kmh){
    var ms = convert.speed(kmh).kmh().to.ms();
    //console.log(ms+" m/s");
    return ms;
}

/**
 * CALCULA TEMPO EM MODO LEITURA
 * @param distancia DISTANCIA EM M
 * @param ms VELOCIDADE EM M/S
 * @returns {*} STRING EM MODO DE LEITURA
 */
function calcula_tempo_humanize(distancia, ms){
    var t = distancia/ms;
    //console.log(t+" segundos");
    var tempo = moment.duration(t, 'seconds').humanize();
    return tempo;
}

/**
 * CALCULA TEMPO EM MILLISEGUNDOS
 * @param distancia DISTANCIA EM M
 * @param ms VELOCIDADE EM M/S
 * @returns {*} TEMPO EM MILLISEGUNDOS
 */
function calcula_tempo_milli(distancia, ms){
    var t = distancia/ms;
    //console.log(t+" segundos");
    var tempo = moment.duration(t, 'seconds');
    return tempo.asMilliseconds();
}

/**
 * CALCULA CUSTOS DE VIAGEM BASEADOS EM CARGA E DISTANCIA
 * @param carga TIPO DE CARGA 0, 1 OU 2.
 * @param distancia DISTANCIA EM M
 * @returns {string} CUSTOS DE VIAGEM EM R$
 */
function calcula_custos_viagem(carga, distancia){
    var taxa = [0.10, 0.20, 0.30];
    return (distancia * taxa[carga-1]).toFixed(2);
}

/**
 * CALCULA PAGAMENTO DADO PELA EMPRESA AO ENTREGAR A CARGA.
 * @param carga TIPO DE CARGA 0, 1 OU 2.
 * @param distancia DISTANCIA EM M
 * @returns {number} O VALOR EM R$ A SER DEPOSITADO.
 */
function calcula_auto_pagamento_empresa(carga, distancia){
    return calcula_custos_viagem(carga, distancia) * 1.25;
}

/**
 * SET MENSAGEM DE LEITURA NO MAPA.
 * @param p1 PONTO INICIAL EX.: L.latLng(p1.lat,p1.lng)
 * @param p2 PONTO FINAL EX.: L.latLng(p1.lat,p1.lng)
 * @param velocidade VELOCIDADE EM KM/H
 */
function set_message_time(p1, p2, velocidade){
    msg =  calcula_tempo_humanize(calcula_distancia(L.latLng(p1.lat,p1.lng), L.latLng(p2.lat, p2.lng)), calcula_kmh_to_ms(velocidade)).toString();
}

/**
 * CALCULA DISTANCIA DO PONTO INICIAL AO PONTO FINAL.
 * @param p1 PONTO INICIAL EX.: L.latLng(p1.lat,p1.lng)
 * @param p2 PONTO FINAL EX.: L.latLng(p1.lat,p1.lng)
 * @returns {string}
 */
function calcula_distancia(p1, p2){
    var fc = L.latLng(p1.lat,p1.lng);
    var c = L.latLng(p2.lat,p2.lng);
    var result = (fc.distanceTo(c)).toFixed(0);
    //console.log(result+ " metros");
    return result;
}

function verifica_se_pode_comprar(valor){
    if(player.conta_corrente >= valor){
        return true;
    }
    return false;
}

//function para persistir dados
function persist_database(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
    return true;
}

function save_login(login) {
    localStorage.setItem('login', login);
    return true;
}

function get_login() {
    return localStorage.getItem('login');
}

//function for get item database
function get_item_database(key) {
    return localStorage.getItem(key);
}

//function to diserialize object
function diserialize_object_database(key) {
    var obj = get_item_database(key);
    return JSON.parse(obj);
}

//function to clean database
function clean_database() {
    localStorage.clear();
}

function verifica_nivel_player() {
    if (player.pontos < 1000) {
        player.nivel = 1;
    } else if (player.pontos > 1000 && player.pontos < 2000) {
        player.nivel = 2;
    } else if (player.pontos > 2000 && player.pontos < 3000) {
        player.nivel = 3;
    } else if (player.pontos > 3000 && player.pontos < 4000) {
        player.nivel = 4;
    }else if (player.pontos > 4000 && player.pontos < 5000) {
        player.nivel = 5;
    }else if (player.pontos > 5000 && player.pontos < 6000) {
        player.nivel = 6;
    }else if (player.pontos > 6000 && player.pontos < 7000) {
        player.nivel = 7;
    }else if (player.pontos > 7000 && player.pontos < 8000) {
        player.nivel = 8;
    }else if (player.pontos > 8000 && player.pontos < 9000) {
        player.nivel = 9;
    }else if (player.pontos > 9000 && player.pontos < 10000) {
        player.nivel = 10;
    }else if (player.pontos > 10000 && player.pontos < 11000) {
        player.nivel = 11;
    }else if (player.pontos > 11000 && player.pontos < 12000) {
        player.nivel = 12;
    }else if (player.pontos > 12000 && player.pontos < 13000) {
        player.nivel = 13;
    }else if (player.pontos > 13000 && player.pontos < 14000) {
        player.nivel = 14;
    }else if (player.pontos > 14000 && player.pontos < 15000) {
        player.nivel = 15;
    }else if (player.pontos > 15000 && player.pontos < 20000) {
        player.nivel = 16;
    }else if (player.pontos > 20000 && player.pontos < 25000) {
        player.nivel = 17;
    }else if (player.pontos > 25000 && player.pontos < 30000) {
        player.nivel = 18;
    }
}

function removeFunction(myObjects, prop, valu) {
    return myObjects.filter(function (val) {
        return val[prop] !== valu;
    });

}

// API CONVERSOR
var convert = (function () {
    var conversions = {
        speed: {
            ms:    1, // use m/s as our base unit
            kmh:   3.6,
            mph:   2.23693629,
            knots: 1.94384449
        },

        distance: {
            m:      1, // use meters as our base
            inches: 39.3700787402, // can't use "in" as that's a keyword. Darn.
            ft:     3.280839895,
            mi:     0.000621371192,
            nm:     0.000539956803 // nautical miles, not nanometers
        },

        mass: {
            g:  1, // use grams as our base
            lb: 0.002204622622,
            oz: 0.0352739619
        }
    };

    function Unit(type, unit, base) {
        this.value = base * conversions[type][unit];
        this.to = {};
        for(var otherUnit in conversions[type]) {
            (function (target) {
                this.to[target] = function () {
                    return new Unit(type, target, base);
                }
            }).call(this, otherUnit);
        }
    }

    Unit.prototype = {
        yield: function () {
            return this.valueOf();
        },

        toString: function () {
            return String(this.value);
        },

        valueOf: function () {
            return this.value;
        }
    };

    // my god, it's full of scopes!
    var types = {};
    for(var type in conversions) {
        (function (type) {
            types[type] = function (value) {
                var units = {};
                for(var unit in conversions[type]) {
                    (function (unit) {
                        units[unit] = function () {
                            return new Unit(type, unit, value / conversions[type][unit]);
                        }
                    }(unit));
                }
                return units;
            };
        }(type));
    }

    return types;
}());

//DEF ICON FORMAT
var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [38, 45],
        iconAnchor:   [20, 45],
        popupAnchor:  [-3, -76]
    }
});