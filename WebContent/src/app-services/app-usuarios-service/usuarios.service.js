(function () {
    'use strict';

    angular
        .module('App')
        .factory('UsuarioService', UsuarioService);

    //Es un servicio de busqueda como hacer las consultas.
    UsuarioService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function UsuarioService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

     	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.saveUsuarios = saveUsuarios;
        service.getUsuariosByFilter = getUsuariosByFilter;
        service.getRoles = getRoles;
        return service;     
        
        
        //Recuperar los datos del cliente
        function saveUsuarios(json) {
            var url=BASE_CON+"/users/saveUsuarios";
            return get(url,token,json);
        }
        
        function getUsuariosByFilter(json){
        	var url=BASE_CON+"/users/getUsuariosByFilter";
            return get(url,token,json);
        }

        function getRoles(json){
            var url=BASE_CON+"/users/getRoles";
            return get2(url,token,json);
        }
        
        //Get
        function get(url, token, json){
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

        function get2(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
            return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token, 'Content-Type': 'application/json'}
            });    
        }
    };
    
})();