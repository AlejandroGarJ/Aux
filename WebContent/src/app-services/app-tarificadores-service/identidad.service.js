(function () {
    'use strict';

    angular
        .module('App')
        .factory('IdentidadService', IdentidadService);


    IdentidadService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'BASE_TI', 'BASE_CON'];
    function IdentidadService($http, $cookies, $rootScope, $timeout, BASE_TI, BASE_CON) {
    	
        // var token = _.get($rootScope, 'globals.currentUser.token');
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        var tokenF = 'Q9BqD59gIV+v9kbDd9xHVOUMKq04fJb7';
    	tokenF = tokenF || '';

    	var token = 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade');
//    	var token = coToken + ' ' + hex_md5(btoa('TIPGTW:InterX0X0Pleyade'));
    	
        var service = {};

        service.cfam_ident = cfam_ident;
        service.cfam_hijos = cfam_hijos;

        service.cities = cities;
        
        service.rate = rate;
        service.contract = contract;

        return service;
        
        function cfam_ident() {
        	var url = BASE_TI + '/options/CFAM_IDENT';
        	var json = {};
            return get(url, token, json);
        }
        function cfam_hijos() {
        	var url = BASE_TI + '/options/CFAM_HIJOS';
        	var json = {};
            return get(url, token, json);
        }

        function cities(json) {
        	var url = BASE_CON + "/recursos/localidades/" + json;
            return get(url, token, json);
        }

        function rate(json) {
        	var url = BASE_CON + '/tarificacion/tarificacionCias';
            return post(url, token, json);
        }
        
        function contract(json) {
        	var url = BASE_CON + '/tarificacion/emite';
            return post(url, token, json);
        }
        
        // Get
        function get(url, token, json){
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {'Authorization':'Token ' + token , 'Content-Type': 'application/json'}
            });
        }

        // Post
        function post(url, token, json){

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': token , 'Content-Type': 'application/json'}
            });
        }
    };
    
})();