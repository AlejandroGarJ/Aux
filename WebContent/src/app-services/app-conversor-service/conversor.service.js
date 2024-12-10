(function () {
    'use strict';

    angular
        .module('App')
        .factory('ConversorService', ConversorService);

    //Es un servicio de busqueda como hacer las consultas.
    ConversorService.$inject = ['$http', '$rootScope', '$window','BASE_CON'];
    function ConversorService($http, $rootScope, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getListCampos = getListCampos;
        service.getConversorByFilter  = getConversorByFilter;
        service.saveDatosAseguradora = saveDatosAseguradora;
        service.saveConversor = saveConversor;
        service.getDatosAseguradoraByFilter = getDatosAseguradoraByFilter;
        service.getEstadosInternos = getEstadosInternos;
        return service;     
       
        function getListCampos(json) {
        	var url=BASE_CON+"/conversor/getListCampos";
            return get(url,token,json);
        }
       
        function getConversorByFilter(json) {
        	var url=BASE_CON+"/conversor/getConversorByFilter";
            return get(url,token,json);
        }
        
        function saveDatosAseguradora(json) {
        	var url=BASE_CON+"/conversor/saveDatosAseguradora";
            return get(url,token,json);
        }
        
        function saveConversor(json){
        	var url=BASE_CON+"/conversor/saveConversor";
            return get(url,token,json);
        }
        
        function getDatosAseguradoraByFilter(json) {
        	var url=BASE_CON+"/conversor/getDatosAseguradoraByFilter";
            return get(url,token,json);
        }
        
        function getEstadosInternos() {
        	var url=BASE_CON+"/conversor/getEstadosInternos";
            return get(url,token, {});
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