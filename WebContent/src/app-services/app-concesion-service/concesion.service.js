(function () {
    'use strict';

    angular
        .module('App')
        .factory('ConcesionService', ConcesionService);

    //Es un servicio de busqueda como hacer las consultas.
    ConcesionService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function ConcesionService($http, $rootScope, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.addConcesiones = addConcesiones;
        service.getConcesionesCias = getConcesionesCias;
        return service;     
       
        
        //Detalles de una solicitud
        function addConcesiones(json) {
        	var url=BASE_CON+"/concesionCias/saveConcesionCia";
            return get(url,token,json);
        }
        
        function getConcesionesCias(json) {
        	var url=BASE_CON+"/concesionCias/getConcesionesCias";
            return get(url,token,json);
        }
       
        
        //Get
        function get(url, token, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
    };
    
})();