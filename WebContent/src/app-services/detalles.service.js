(function () {
    'use strict';

    angular
        .module('App')
        .factory('DetalleService', DetalleService);

    //Es un servicio de busqueda como hacer las consultas.
    DetalleService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function DetalleService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
        var service = {};
        service.buscar = buscar;
        return service;     
        
        function buscar(jsonDetalle, tipo) {
            var response;
            var url;
            var contentype='application/json';
            
            //Petición al de cliente
            if(tipo=="cliente"){ 
            	url = BASE_CON+"/clientes/getCliente";
            }
            if(tipo=="comisionista"){
            	url = BASE_CON+"/comisionistas/getComisionistasProducto";
            }
            if(tipo=="comisionistaByRecibo"){
            	url = BASE_CON+"/comisionistas/getComisionistasByRecibo";
            }
            
            var token = _.get($rootScope, 'globals.currentUser.token');
         	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
            
            token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
            return $http({
                method: 'POST',
                url: url,
                data: jsonDetalle,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
                        
            
        }
    };
    
})();