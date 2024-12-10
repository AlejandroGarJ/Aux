(function () {
    'use strict';

    angular
        .module('App')
        .factory('ColectivoService', ColectivoService);

    //Es un servicio de busqueda como hacer las consultas.
    ColectivoService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function ColectivoService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getListColectivos = getListColectivos;
        service.getColectivosFiltroUsuario = getColectivosFiltroUsuario;
        service.getDetalleColectivo = getDetalleColectivo;
        service.guardarColectivo = guardarColectivo;
        service.borrarColectivo = borrarColectivo;
        return service;     
        
        
          //Recuperar los datos del cliente
          function getListColectivos(json) {
	          var url=BASE_CON+"/colectivos/getColectivosFiltroUsuario";
	          return get(url,token,json);
	      }
//        function getListColectivos(json) {
//            var url=BASE_CON+"/colectivos/getListColectivos";
//            return get(url,token,json);
//        }

        function getColectivosFiltroUsuario(json) {
            var url=BASE_CON+"/colectivos/getColectivosFiltroUsuario";
            return get(url,token,json);
        }
        
        function getDetalleColectivo(json) {
            var url=BASE_CON+"/colectivos/getDetalleColectivo";
            return get(url,token,json);
        }
        
        function guardarColectivo(json) {
            var url=BASE_CON+"/colectivos/guardarColectivo";
            return get(url,token,json);
        }
        
        function borrarColectivo(json){
        	var url=BASE_CON+"/colectivos/borrarColectivo";
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