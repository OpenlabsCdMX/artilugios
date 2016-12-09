
app.controller('adminController',['$scope','$http',function($scope,$http){
    //alert("Pantalla administrador");

	

	var cloudmade = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

	var mymap = L.map('mapid').setView([19.432626, -99.123297,1124], 16).addLayer(cloudmade);

    var markers = new L.FeatureGroup();

    
    

	$scope.getAllData = function() {
		
		console.log("SUCCESS FUNCTION --> getAllData");
		
		
		$http({
			url: "https://jvakero.carto.com/api/v2/sql?q=SELECT * FROM artilugio_categoria" ,
			method: 'GET'
		}).then(function(success){
			//console.log("SUCCESS RESPONSE getAllData--> ",success.data);

			for(var i=0;i<success.data.rows.length;i++) {
				console.log("nombre:" +((success.data.rows[i].sub_variable).toLowerCase()).split(' ').join('')+'.png');
				var greenIcon = L.icon({
			    	iconUrl: "img/"+((success.data.rows[i].sub_variable).toLowerCase()).split(' ').join('')+'.png',
			    	shadowUrl: '',

				    iconSize:     [29, 42], // size of the icon
				    shadowSize:   [25, 32], // size of the shadow
				    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
				    shadowAnchor: [4, 62],  // the same for the shadow
				    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				});
	
				 var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud],{icon: greenIcon});//.addTo(mymap);
				 marker.bindPopup("<b>"+success.data.rows[i].sub_variable+"</b><br>" + success.data.rows[i].observaciones, {
            			showOnMouseOver: true
        			});
				  
				 // add marker
                 markers.addLayer(marker);
			}

			mymap.addLayer(markers);
           
			
		},function(error){
			console.log("ERROR RESPONSE getAllData--> ",error.statusText);
		});
			
	};




	//funcion para recuperar los puntos del combo uno
	$scope.getFilterData = function() {
		
		mymap.removeLayer(markers);
		$scope.getFilterInfo($scope.data.selectCapa1);
		$scope.getCapa2Catalogo($scope.data.selectCapa1);

	};


	 //funcion para recuperar los puntos del combo dos
	$scope.getFilterDataCapaDos = function() {
		
		mymap.removeLayer(markers);
		$scope.getFilterInfoVariable($scope.data.selecCapa2);
		$scope.getCapa3Catalogo($scope.data.selecCapa2);

	};

	//funcion para recuperar los puntos del combo tres
	$scope.getFilterDataCapaTres = function() {
		
		mymap.removeLayer(markers);
		$scope.getFilterInfoSubVariable($scope.data.selecCapa3);
		

	};


	$scope.getFilterInfo = function(filtro) {
		
			markers.clearLayers();
		
		$http({
			url: "https://jvakero.carto.com/api/v2/sql?q=SELECT * FROM artilugio_categoria where indicador='"+filtro+"'" ,
			method: 'GET'
		}).then(function(success){
			

			for(var i=0;i<success.data.rows.length;i++) {
				

				var greenIcon = L.icon({
			    	iconUrl: "img/"+((success.data.rows[i].sub_variable).toLowerCase()).split(' ').join('')+'.png',
			    	shadowUrl: '',

				    iconSize:     [29, 42], // size of the icon
				    shadowSize:   [50, 64], // size of the shadow
				    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
				    shadowAnchor: [4, 62],  // the same for the shadow
				    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				});
	
				 var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud],{icon: greenIcon});
				 //var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud]);
				  marker.bindPopup("<b>"+success.data.rows[i].sub_variable+"</b><br>" + success.data.rows[i].observaciones, {
            			showOnMouseOver: true
        			});

				  markers.addLayer(marker);
			}

			mymap.addLayer(markers);
			
		},function(error){
			console.log("ERROR RESPONSE getAllData--> ",error.statusText);
		});
			
	};

	$scope.getFilterInfoVariable = function(filtro) {
		
			markers.clearLayers();
		
		$http({
			url: "https://jvakero.carto.com/api/v2/sql?q=SELECT * FROM artilugio_categoria where variable='"+filtro+"'" ,
			method: 'GET'
		}).then(function(success){
			

			for(var i=0;i<success.data.rows.length;i++) {
				var greenIcon = L.icon({
			    	iconUrl: "img/"+((success.data.rows[i].sub_variable).toLowerCase()).split(' ').join('')+'.png',
			    	shadowUrl: '',
 					
 					iconSize:     [29, 42], // size of the icon
				    shadowSize:   [50, 64], // size of the shadow
				    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
				    shadowAnchor: [4, 62],  // the same for the shadow
				    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				});
	
				 var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud],{icon: greenIcon});
				 

				  marker.bindPopup("<b>"+success.data.rows[i].sub_variable+"</b><br>" + success.data.rows[i].observaciones, {
            			showOnMouseOver: true
        			});

				  markers.addLayer(marker);
			}

			mymap.addLayer(markers);
			
		},function(error){
			console.log("ERROR RESPONSE getAllData--> ",error.statusText);
		});
			
	};

	$scope.getFilterInfoSubVariable = function(filtro) {
		
			markers.clearLayers();
		
		$http({
			url: "https://jvakero.carto.com/api/v2/sql?q=SELECT * FROM artilugio_categoria where sub_variable='"+filtro+"'" ,
			method: 'GET'
		}).then(function(success){
			

			for(var i=0;i<success.data.rows.length;i++) {
				var greenIcon = L.icon({
			    	iconUrl: "img/"+((success.data.rows[i].sub_variable).toLowerCase()).split(' ').join('')+'.png',
			    	shadowUrl: '',
 
 					iconSize:     [29, 42], // size of the icon
				    shadowSize:   [50, 64], // size of the shadow
				    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
				    shadowAnchor: [4, 62],  // the same for the shadow
				    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				});
	
				 var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud],{icon: greenIcon});
				 


				 //var marker = L.marker([success.data.rows[i].latitud, success.data.rows[i].longitud])
				  marker.bindPopup("<b>"+success.data.rows[i].sub_variable+"</b><br>" + success.data.rows[i].observaciones, {
            			showOnMouseOver: true
        			});

				  markers.addLayer(marker);
			}

			mymap.addLayer(markers);
			
		},function(error){
			console.log("ERROR RESPONSE getAllData--> ",error.statusText);
		});
			
	};

	//Funcion para obtener la primer capa de filtros
	$scope.getCapasCatalogo = function() {
		
			
		
		$http({
			url: "https://jvakero.carto.com/api/v2/sql?q=SELECT distinct(indicador) FROM artilugio_categoria " ,
			method: 'GET'
		}).then(function(success){
			
			

			$scope.catcapaone=success.data.rows;
			
		},function(error){
			console.log("ERROR RESPONSE getCapasCatalogo--> ",error.statusText);
		});
			
	};

	//Funcion para obtener la segunda capa de filtros
	$scope.getCapa2Catalogo = function(indicador) {
		
				
			
			$http({
				url: "https://jvakero.carto.com/api/v2/sql?q=SELECT distinct(variable) FROM artilugio_categoria where indicador='"+indicador+"'" ,
				method: 'GET'
			}).then(function(success){
			

				$scope.catcapados=success.data.rows;
				
			},function(error){
				console.log("ERROR RESPONSE getCapasCatalogo--> ",error.statusText);
			});
				
		};


	//Funcion para obtener la tercer capa de filtros
	$scope.getCapa3Catalogo = function(variable) {
			
				
			
			$http({
				url: "https://jvakero.carto.com/api/v2/sql?q=SELECT distinct(sub_variable) FROM artilugio_categoria where variable='"+variable+"'" ,
				method: 'GET'
			}).then(function(success){
				
				

				$scope.catcapatres=success.data.rows;
				
			},function(error){
				console.log("ERROR RESPONSE getCapasCatalogo--> ",error.statusText);
			});
				
		};

	


	
	//invocacion a funcion principal
	$scope.getAllData();
	$scope.getCapasCatalogo();


}]);