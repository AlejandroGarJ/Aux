(function () {
    'use strict';

    angular
        .module('App')
        .factory('DispositivosService', DispositivosService);


    DispositivosService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_TI', 'BASE_CON'];
    function DispositivosService($http, $cookies, $rootScope, $timeout, $window, BASE_TI, BASE_CON) {

    	var token = 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade');
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');    	
    	var token2 = coToken + " " + _.get($rootScope, 'globals.currentUser.token');

        var service = {};

        service.getDispositivos = getDispositivos;
        service.tarificacionCias = tarificacionCias;
        service.emitirPresupuesto = emitirPresupuesto;
        service.validatePinCode = validatePinCode;
        service.resendPinCode = resendPinCode;
        service.resendSign = resendSign;

        return service;
        
        function getDispositivos() {
        	var url = BASE_CON + '/recursos/getDispositivos';
        	var json = {};
            return get(url, token, json);
        }
        
        function tarificacionCias (bool, json) {
        	var url = BASE_CON + '/tarificacion/tarificacionCias';
        	
        	if (bool == false) {
        		url += "/opt/false"
        	}
        	
            return post(url, token, json);
        }
        
        function emitirPresupuesto (json) {
        	var url = BASE_CON + '/tarificacion/emite';
        	
            return post(url, token, json);
        }
        
        function validatePinCode (json, nuPoliza) {
        	var url = BASE_CON + '/polizas/validatePinCode/' + nuPoliza + "/" + json.pincode;
        
            return get(url, token2, json);
        }
        
        function resendPinCode (json) {
        	var url = BASE_CON + '/polizas/resendPinCode';
        	
            return post(url, token2, json);
        }
        
        function resendSign(json, idRol, failedTarificador) {
        	var url = BASE_CON + '/polizas/resendToSign/' + failedTarificador;
            return post(url, token2, json);
        }
        
        // Get
        function get(url, token, json){
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {'Authorization': token , 'Content-Type': 'application/json'}
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
