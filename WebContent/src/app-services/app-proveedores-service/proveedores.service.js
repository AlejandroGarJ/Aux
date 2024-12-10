(function () {
    'use strict';

    angular
        .module('App')
        .factory('ProveedoresService', ProveedoresService);

    //Es un servicio de busqueda como hacer las consultas.
    ProveedoresService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function ProveedoresService($http, $rootScope, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getProvProgramaDetail = getProvProgramaDetail;
        service.getListProvPrograma = getListProvPrograma;
        service.updateProvPrograma = updateProvPrograma;
        service.createProvPrograma = createProvPrograma;
        service.getEmpresasProveedor  = getEmpresasProveedor ;
        return service;     
       
        //Listado de proveedores
        function getListProvPrograma(json) {
        	var url=BASE_CON+"/proveedoresProgramas/getListProvPrograma";
            return post(url,token,json);
        }
        
        //Detalle proveedor
        function getProvProgramaDetail (id) {
        	var url=BASE_CON+"/proveedoresProgramas/getProvProgramaDetail/" + id;
            return get(url,token);
        }
        
        //Detalle proveedor
        function getEmpresasProveedor (id) {
        	var url=BASE_CON+"/proveedoresProgramas/getEmpresasProveedor";
            return get(url,token);
        }
        
        //Guardar proveedor
		function updateProvPrograma (json) {
        	var url=BASE_CON+"/proveedoresProgramas/updateProvPrograma";
            return post(url,token,json);
		}
        
		function createProvPrograma (json) {
        	var url=BASE_CON+"/proveedoresProgramas/createProvPrograma";
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
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
        
        //Get
        function get(url, token){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
    };
    
})();