(function () {
    'use strict';

    angular
        .module('App')
        .factory('MotorService', MotorService);

    //Es un servicio de busqueda como hacer las consultas.
    MotorService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'BASE_CON'];
    function MotorService($http, $cookies, $rootScope, $timeout, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getMarcas = getMarcas;
        service.getModelos = getModelos;
        service.getVersiones = getVersiones;
        return service;     
       
        
        //Marcas
        function getMarcas(categoria) {
        	var url=BASE_CON+"/recursos/motor/"+categoria+"/marcas";
        	var json = {};
            return get(url,json);
        }
        //Modelos
        function getModelos(categoria, marca){
        	var url=BASE_CON+"/recursos/motor/"+categoria+"/"+marca+"/modelos";
        	var json = {};
            return get(url,json);
        }
        //Versiones
        function getVersiones(categoria, marca, modelo){
        	var url=BASE_CON+"/recursos/motor/"+categoria+"/"+marca+"/"+modelo+"/versionesInter";
        	var json = {};
            return get(url,json);
        }
        
        
        //Get
        function get(url, json){
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