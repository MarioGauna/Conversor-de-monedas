// Declaro variables y arrays
var monedaText1;
var monedaVal1;
var monedaText2;
var monedaVal2;
var cantidad;
var resultado;
const monedaName=[];
const monedaCoti=[];

// Obtengo datos desde las APIs y creo arrays custom para el proyecto

$.ajax({
    url: 'https://gist.githubusercontent.com/madnik/49937c83061d1bc0d064/raw/f14d9aa9392b332c9756e06b8d289b9379525e29/currencies.json',
    type: "GET",
    async:false,
    dataType: "json",
    success: function (info) {
        class monedas {
            constructor(codigo, nombre) {
                this.codigo = codigo;
                this.nombre = nombre;
            }
        }

        info.sort(function(a,b){
            if(a.code < b.code)
                return -1;
            if(a.code > b.code)
                return 1;
            return 0;
        })

        for(i=0;i<info.length;i++){
            monedaName.push(new monedas(info[i].code,info[i].name));
        }
    },
    error: function () {
        $('#res').html(`Error de obtencion de datos`);
    }
});

$.ajax({
    url:'https://openexchangerates.org/api/latest.json?app_id=9cf58f0d6b1443e7b4dad7c2be6e1104',
    type: "GET",
    async:false,
    dataType: "json",
    success: function (data) {
        class cotiz {
            constructor(codigo, coti) {
                this.codigo = codigo;
                this.coti= coti;
            }
        }
        $.each(data.rates, function (keys,values) {
            monedaCoti.push(new cotiz(keys,values));
        });
    },
    error: function () {
        $('#res').html(`Error de obtencion de datos`);
    }
});

// Cargo cotizaciones del dia y contenido del local storage

$(window).on("load", function() {
    carga();
    listarCambio2();
    listarcotizaciones();
})

// Genero las opciones de los select

function carga(){
    $.each(monedaCoti, function (i) { 
        let selected1 = monedaCoti[i].codigo == "USD" ? "selected" : "";
        let selected2 = monedaCoti[i].codigo == "ARS" ? "selected" : "";
        $("#opa").append(`<option value="${monedaCoti[i].coti}" ${selected1}>${monedaCoti[i].codigo}</option>`);
        $("#opb").append(`<option value="${monedaCoti[i].coti}" ${selected2}>${monedaCoti[i].codigo}</option>`);
        monedaText1 = $('#opa option:selected').text();
        monedaVal1 = $('#opa option:selected').val();
        monedaText2 = $('#opb option:selected').text();
        monedaVal2 = $('#opb option:selected').val();
        $('#op1').text(monedaName[108].nombre);
        $('#op2').text(monedaName[4].nombre);
    })
}

// Cambio los valores Desde a Hacia

$('#swap').click(function() {
    let tempTex1 = $('#opa option:selected').text();
    let tempTex2 = $('#opb option:selected').text();
    let tempVal1 = $('#opa option:selected').val();
    let tempVal2 = $('#opb option:selected').val();
    $("#opa option:selected").text(tempTex2);
    $("#opa option:selected").val(tempVal2);
    $("#opb option:selected").text(tempTex1);
    $("#opb option:selected").val(tempVal1);
    monedaText1 = tempTex2;
    monedaVal1 = tempVal2;
    monedaText2 = tempTex1;
    monedaVal2 = tempVal1;
    for(let i=0;i<monedaName.length;i++){
        if(monedaName[i].codigo == monedaText1){
            var it1=i;
            $('#op1').text(monedaName[it1].nombre);
        }
    }
    for(let i=0;i<monedaName.length;i++){
        if(monedaName[i].codigo == monedaText2){
            var it2=i;
            $('#op2').text(monedaName[it2].nombre);
        }
    }
});

// Obtengo los valores del select 1

$("#opa").change(function() {
    monedaText1 = $('#opa option:selected').text();
    monedaVal1 = $('#opa option:selected').val();
    for(let i=0;i<monedaName.length;i++){
        if(monedaName[i].codigo == monedaText1){
            var it1=i;
            $('#op1').text(monedaName[it1].nombre);
        }
    }
});

// Obtengo los valores del select 2

$("#opb").change(function() {
    monedaText2 = $('#opb option:selected').text();
    monedaVal2 = $('#opb option:selected').val();
    for(let i=0;i<monedaName.length;i++){
        if(monedaName[i].codigo == monedaText2){
            var it2=i;
            $('#op2').text(monedaName[it2].nombre);
        }
    }
});

// Obtengo el monto a convertir y verifico las variables ingresadas

function inicio(e){
    e.preventDefault();
    cantidad=$('#monto').val();
    if(cantidad == " " || cantidad == "0"){
        $('#monto').val(1);
        cantidad = 1;
        calculo();
    }else{
        calculo();
    }
    $('#monto').focus();
}

$('#formulario').submit(inicio);

// Calculo resultado final y muestro

function calculo(){
    resultado=(cantidad/monedaVal1)*monedaVal2;
    $('#res').html('Obteniendo conversion...');
    $('#res').fadeOut(500)
            .fadeIn(500)
            .fadeOut(500)
            .fadeIn(500,function(){
                $('#res').html(cantidad+' '+monedaText1+' = '+resultado.toFixed(2)+' '+monedaText2);
            });
    almacen();
}

// Constructor para local storage

class conversion {
    constructor(monto, origen, destino, final) {
        this.monto = monto;
        this.origen = origen;
        this.destino = destino;
        this.final = final;
    }
}

// Obtengo conversion y lo envio a guardar

function almacen(){
    let newCambio = new conversion(cantidad,monedaText1,monedaText2,resultado);
    guardarCambio(newCambio);
}

// Guardo conversion y agrego al local storage

function guardarCambio(newCambio) {
    let oldCambio = cargarCambio();
    oldCambio.push(newCambio);
    localStorage.setItem('test', JSON.stringify(oldCambio));
    listarCambio(newCambio);
}

// Verifico si el array contiene datos o regreso array vacio

function cargarCambio() {
    if (localStorage.getItem('test')) {
        return JSON.parse(localStorage.getItem('test'));
    }
    return [];
}

// Muestro la conversion realizada
function listarCambio(newCambio){
    $('#conversiones').append('<tr><td>'+newCambio.monto+'</td><td>'+newCambio.origen+'</td><td>'+newCambio.destino+'</td><td>'+parseFloat(newCambio.final).toFixed(2)+'</td></tr>');
}

// Muestro el listado completo de conversiones almacenadas en local storage

function listarCambio2(){
    let oldCambio = cargarCambio();
    $.each(oldCambio, function (i) {
        $('#conversiones').append('<tr><td>'+oldCambio[i].monto+'</td><td>'+oldCambio[i].origen+'</td><td>'+oldCambio[i].destino+'</td><td>'+parseFloat(oldCambio[i].final).toFixed(2)+'</td></tr>');
    }
)}

// Comparo los dos array de datos y al encontrar coincidencias muestro los datos

function listarcotizaciones(){ 
    $.each(monedaCoti, function(i) {
        if(monedaCoti.codigo == monedaName.codigo){
            $('#cotizaciones').append('<tr><td>'+monedaName[i].nombre+'</td><td>'+parseFloat(monedaCoti[i].coti).toFixed(3)+'</td></tr>');
        }
    });
};

// Borro el contenido del local storage

function limpiar() {
    localStorage.clear('test');
    while (conversiones.firstChild) {
        conversiones.removeChild(conversiones.firstChild);
    }
};

$("#limpiar").click(function() {
    limpiar();
});


// ACLARACIONES

// Aparece un error en la linea 230 que no pude arreglar, aparentemente es porque los array son de distinto tamaño. 
