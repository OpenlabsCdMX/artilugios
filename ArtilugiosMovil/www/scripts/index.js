var map;
var markers = [];
var map_origen_destino;
var bounds_origen_destino = [];
var markers_origen_destino = [0,0];

(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        init();
    };

    function init() {
        /*
        http://jvakero.carto.com/api/v2/sql?q=SELECT count(*) FROM artilugio_categoria
        http://jvakero.carto.com/api/v2/sql?q=SELECT * FROM artilugio_categoria

        http://jvakero.carto.com/api/v2/sql?q=SELECT distinct(indicador) FROM artilugio_categoria
        */
        // Obtiene ciudades
        $.ajax({
            url: 'http://jvakero.carto.com/api/v2/sql?q=SELECT distinct(ciudad) FROM artilugio_categoria',
            success: function (response) {
                for (var i = 0; i < response.rows.length; i++) {
                    $('#ciudad').append('<option value="' + response.rows[i].ciudad + '">' + response.rows[i].ciudad + '</option>');
                }
                //if (response.rows.length == 1) $('#ciudad option:eq(1)').prop('selected', true);
                procesoInitTerminado();
            },
            error: function (xhr, status, error) {
                alert('Hubo un error al obtener la información de las ciudades. ' + error);
            }
        });
        // Obtiene categorías
        $.ajax({
            url: 'http://jvakero.carto.com/api/v2/sql?q=SELECT indicador,variable,sub_variable FROM artilugio_categoria GROUP BY sub_variable,variable,indicador ORDER BY indicador ASC,variable ASC,sub_variable ASC',
            success: function (response) {
                var indicadores = {};
                for (var i = 0; i < response.rows.length; i++) {
                    if (!indicadores.hasOwnProperty(response.rows[i].indicador)) {
                        indicadores[response.rows[i].indicador] = {};
                    }
                    if (!indicadores[response.rows[i].indicador].hasOwnProperty(response.rows[i].variable)) {
                        indicadores[response.rows[i].indicador][response.rows[i].variable] = [];
                    }
                    if ($.inArray(response.rows[i].sub_variable, indicadores[response.rows[i].indicador][response.rows[i].variable]) < 0) {
                        indicadores[response.rows[i].indicador][response.rows[i].variable].push(response.rows[i].sub_variable);
                    }
                }

                var data = [];
                $.each(indicadores, function (k, v) {
                    var variables = [];
                    $.each(v, function (k2, v2) {
                        var subvariables = [];
                        $.each(v2, function (k3, v3) {
                            // SubVariables
                            subvariables.push({
                                "id": v3,
                                "text": v3
                            });
                        });
                        // Variables
                        variables.push({
                            "id": "variable-" + k2,
                            "text": k2,
                            "children": subvariables
                        });
                    });
                    // Indicadores
                    data.push({
                        "id": "indicador-" + k,
                        "text": k,
                        "children": variables
                    });
                });

                // Filtros
                $('#categorias').jstree({
                    'plugins': ["checkbox"],
                    'core': {
                        'data': data,
                        'themes': {
                            'name': 'proton',
                            'responsive': true
                        }
                    }
                });

                procesoInitTerminado();
            },
            error: function (xhr, status, error) {
                alert('Hubo un error al obtener la información. '+error);
            }
        });

        var punto_inicial = [19.433570, -99.126674];
        // Mapa principal
        map = L.map('map').setView(punto_inicial, 14);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Mapa de origen y destino
        map_origen_destino = L.map('map-origen-destino').setView(punto_inicial, 14);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map_origen_destino);
        map_origen_destino.on('click', function (e) {
            if($('#origen').hasClass('active')) {
                var titulo = 'Origen';
                var index = 0;
            } else {
                var titulo = 'Destino';
                var index = 1;
            }
            map_origen_destino.removeLayer(markers_origen_destino[index])
            markers_origen_destino[index] = L.marker([e.latlng.lat, e.latlng.lng])
                    .addTo(map_origen_destino)
                    .bindPopup('<strong>'+titulo+'</strong>')
                    .openPopup();
            toggleOrigenDestino();
        });
        $('#cerrar-map-origen-destino').on('click',function(){
            $(this).hide();
            $('#container-map-origen-destino').fadeOut('slow');
        });
        $('#origen').on('click',activaOrigen);
        $('#destino').on('click',activaDestino);

        // Muestra filtros
        $('#mostrar-filtros').on('click', function () {
            $('#filtros').slideToggle();
        });

        // Selecciona origen
        $('#ciudad').on('change', function () {
            showLoading();
            $.ajax({
                url: 'http://jvakero.carto.com/api/v2/sql',
                type: 'POST',
                data: { q: "SELECT MAX(latitud) AS max_latitud,MIN(latitud) AS min_latitud,MAX(longitud) AS max_longitud,MIN(longitud) AS min_longitud FROM artilugio_categoria WHERE ciudad LIKE '"+$(this).val()+"'"},
                success: function (response) {
                    hideLoading();
                    if (response.rows.length == 0) {
                        alert("No existen datos para la ciudad seleccionada");
                    } else {
                        bounds_origen_destino = [
                            [response.rows[0].min_latitud, response.rows[0].min_longitud],
                            [response.rows[0].max_latitud, response.rows[0].min_longitud],
                            [response.rows[0].min_latitud, response.rows[0].max_longitud],
                            [response.rows[0].max_latitud, response.rows[0].max_longitud]
                        ];
                        seleccionaOrigenDestino();
                    }
                },
                error: function () {
                    hideLoading();
                    alert("No pudimos recuperar la información de la ciudad seleccionada");
                }
            });
        });
        $('#selecciona-origen-destino').on('click', seleccionaOrigenDestino);

        // Busca puntos
        $('#buscar').on('click', function () {
            // Validaciones
            var punto_a = markers_origen_destino[0];
            if (punto_a) {
                punto_a = [punto_a.getLatLng().lat,punto_a.getLatLng().lng];
            } else {
                alert("Debes indicar el origen");
                return;
            }
            var punto_b = markers_origen_destino[1];
            if (punto_b) {
                punto_b = [punto_b.getLatLng().lat,punto_b.getLatLng().lng];
            } else {
                alert("Debes indicar el destino");
                return;
            }
            var seleccion = $("#categorias").jstree("get_checked", null, true);
            if (seleccion.length == 0) {
                alert("Debes elegir por lo menos una opción");
                return;
            }
            // Loading
            showLoading();
            // Limpia marcadores
            var arrayOfLatLngs = [];
            for (var i = 0; i < markers.length; i++) map.removeLayer(markers[i]);
            markers = [];
            // Para busqueda de direcciones: 'http://nominatim.openstreetmap.org/search?format=json&q=' + punto_a
            // Pone origen
            markers.push(L.marker(punto_a)
                .addTo(map)
                .bindPopup('<strong>Origen</strong>')
                .openPopup());
            arrayOfLatLngs.push(punto_a);
            // Pone destino
            markers.push(L.marker(punto_b)
                .addTo(map)
                .bindPopup('<strong>Destino</strong>'));
            arrayOfLatLngs.push(punto_b);

            // Obtiene puntos con filtro
            var subvariables = [];
            $.each(seleccion, function (i, v) {
                if (!v.includes("variable-") && !v.includes("indicador-")) subvariables.push("sub_variable LIKE '" + v + "'");
            });
            $.ajax({
                url: 'http://jvakero.carto.com/api/v2/sql',
                type: 'POST',
                data: { q: 'SELECT * FROM artilugio_categoria WHERE ' + subvariables.join(' OR ') },
                success: function (response) {
                    // Agrega marcadores
                    for (var i = 0; i < response.rows.length; i++) {
                        var url_imagen = 'images/iconos/'+response.rows[i].sub_variable.toLowerCase().replace(' ','')+'.png';
                        // Icono personalizado
                        var icono_personalizado = L.icon({
                            iconUrl:    url_imagen,
                            iconSize:   [30, 45]
                        });
                        var marker = L.marker([response.rows[i].latitud, response.rows[i].longitud], { icon: icono_personalizado }).addTo(map);

                        markers.push(marker
                            .bindPopup('<strong>' + response.rows[i].sub_variable + '</strong><br>' + response.rows[i].observaciones));
                        arrayOfLatLngs.push([response.rows[i].latitud, response.rows[i].longitud]);
                    }
                    // Centra mapa en marcadores
                    var bounds = new L.LatLngBounds(arrayOfLatLngs);
                    map.fitBounds(bounds);
                    var polygon_bounds = arrayOfLatLngs.splice(2);
                    var polygon = L.polygon(polygon_bounds, { color: 'purple', opacity: .6 })/*.addTo(map)*/;
                    // Esconde loading
                    hideLoading();
                    // Muestra mapa
                    $('#mostrar-filtros').show();
                    $('#filtros').slideToggle();
                    
                },
                error: function (xhr, status, error) {
                    hideLoading();
                    alert('Hubo un error al obtener la información.' + error);
                }
            });
        });
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();

function showLoading() {
    $('#filtros>*:not(#loading)').hide();
    $('#loading').fadeIn();
}

function hideLoading() {
    $('#loading').fadeOut('slow', function () {
        $('#filtros>*:not(#loading):not(#container-map-origen-destino)').show();
    });
}

var procesos = 0;
function procesoInitTerminado() {
    procesos++;
    if(procesos==2) hideLoading();
}

function seleccionaOrigenDestino() {
    if (bounds_origen_destino.length == 0) {
        alert("Debes elegir una ciudad");
        return;
    }
    $('#cerrar-map-origen-destino').show();
    $('#container-map-origen-destino').fadeIn('slow',function(){
        activaOrigen();
        map_origen_destino.invalidateSize();
        var bounds = new L.LatLngBounds(bounds_origen_destino);
        map_origen_destino.fitBounds(bounds);
    });
}

function toggleOrigenDestino(){
    if($('#origen').hasClass('active')) activaDestino();
    else activaOrigen();
}

function activaOrigen() {
    $('#origen,#destino').find('span').remove();
    $('#destino').removeClass('active');
    $('#origen').addClass('active');
    $('#origen').append('<span> <i class="glyphicon glyphicon-ok"></i></span>');
}

function activaDestino() {
    $('#origen,#destino').find('span').remove();
    $('#origen').removeClass('active');
    $('#destino').addClass('active');
    $('#destino').append('<span> <i class="glyphicon glyphicon-ok"></i></span>');
}