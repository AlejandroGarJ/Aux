(function () {
    'use strict';

    angular
        .module('App')
        .factory('GarantiaService', GarantiaService);

    //Es un servicio de busqueda como hacer las consultas.
    GarantiaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function GarantiaService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getGarantias = getGarantias;
        service.actualizarGarantia = actualizarGarantia;
        service.getGarantiasByProducto = getGarantiasByProducto;
        service.getGarantiasByPoliza = getGarantiasByPoliza;
        return service;     
       
        
        //garantias
        function getGarantias(){
        	var url=BASE_CON+"/garantias/getNegocios/"+idTarifa;
        	var json = {};
            return get(url,json);
        }
        
        function getGarantiasByPoliza(json){
        	var url=BASE_CON+"/garantias/getGarantiasByPoliza";
            return post(url,token, json);
        }
        
        
        function getGarantiasByProducto(json){
        	var url=BASE_CON+"/garantias/getGarantiasByProducto";
            return post(url,token, json);
        }
        
      //Detalles de una solicitud
        function actualizarGarantia(json) {
        	var url=BASE_CON+"/garantias/actualizarGarantia";
            return post(url,token,json);
        }
        
        //Put
	    function put(url, token, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
	    	token = _.get($rootScope, 'globals.currentUser.token');
	    	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
	    	return $http({
	            method: 'PUT',
	            url: url,
	            data: json,
	            headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
	        });
        }
	    
	  //Post
	    function post(url, token, json){
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
        
        //Get
        function get(url, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                //headers: {'Authorization':'Token ' + token , 'Content-Type': 'application/json'}	//Permiso para la petición.
            });
        }
    };
    
})();