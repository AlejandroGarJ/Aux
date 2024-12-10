(function () {
    'use strict';

    angular
        .module('App')
        .factory('ProcesoService', ProcesoService);

    //Es un servicio de busqueda como hacer las consultas.
    ProcesoService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function ProcesoService($http, $rootScope, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.guardarProceso = guardarProceso;
        return service;     
       
        
        //Detalles de una solicitud
        function guardarProceso(json) {
        	var url=BASE_CON+"/procesos/guardarProceso";
            return post(url,token,json);
        }
        
        //Get
        function post(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
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