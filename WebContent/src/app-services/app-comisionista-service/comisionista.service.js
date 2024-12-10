(function () {
    'use strict';

    angular
        .module('App')
        .factory('ComisionService', ComisionService);

    //Es un servicio de busqueda como hacer las consultas.
    ComisionService.$inject = ['$http', '$cookies', '$rootScope', '$window', '$timeout', 'BASE_CON'];
    function ComisionService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.saveComisionistasRecibo = saveComisionistasRecibo;
        service.getComisionistasProducto = getComisionistasProducto;
        return service;     
        
        
        //Recuperar los datos del cliente
        function saveComisionistasRecibo(json) {
            var url=BASE_CON+"/comisionistas/saveComisionistasRecibo";
            return get(url,token,json);
        }
        
        function getComisionistasProducto(json) {
            var url=BASE_CON+"/comisionistas/getComisionistasProducto";
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
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json'}
                //, 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
    };
    
})();