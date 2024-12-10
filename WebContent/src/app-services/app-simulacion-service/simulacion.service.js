//MODO SERGIO
(function () {
    'use strict';

    angular
        .module('App')
        .factory('SimulacionService', SimulacionService);

    SimulacionService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function SimulacionService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.calculaSimulacion = calculaSimulacion;
        service.saveSimulacion = saveSimulacion;
        return service;     
       
        function calculaSimulacion(json) {
        	var url = BASE_CON+'/simulaciones/calculaSimulacion';
            return post(url,token,json);
        }
        
        function saveSimulacion(json){
        	var url=BASE_CON+"/simulaciones/saveSimulacion";
        	return post(url,token,json);
        }
        
        //Post
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
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }
    };
    
})();
//FIN MODO SERGIO


//MODO CURSO = ubicacion.service.js
//const SimulacionService = (function () {
//
//	function _calculaSimulacion(refClass, json) {
//		var vm = refClass;
//		var url = vm._BASE_CON+'/simulaciones/calculaSimulacion';
//		return vm._$http({
//			method: 'POST',
//			url: url,
//			data: json,
//			headers: {'Authorization':'Token ' + token , 'Content-Type': 'application/json'}
//		});
//	}
//	
//	function _saveSimulacion(refClass, json){
//		var vm = refClass;
//      	var url=vm._BASE_CON+"/simulaciones/saveSimulacion";
//      	return vm._$http({
//			method: 'POST',
//			url: url,
//			data: json,
//			headers: {'Authorization':'Token ' + token , 'Content-Type': 'application/json'}
//		});
//   }
//	
//	class SimulacionService {
//		constructor($http, $cookies, $rootScope, $timeout, BASE_CON){
//           this._$http=$http;
//           this._$cookies=$cookies;
//			this._$rootScope=$rootScope;
//			this._$timeout=$timeout;
//           this._BASE_CON=BASE_CON;
//       }
//		
//		calculaSimulacion(json){
//			return _calculaSimulacion.call(this, json);
//		}
//		
//		saveSimulacion(json){
//			return _saveSimulacion.call(this, json);
//		}
//	}
//	return SimulacionService;
//)();
//	
//export default SimulacionService;

//FIN MODO CURSO