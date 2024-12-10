(function () {
    'use strict';

    angular
        .module('App')
        .factory('AseguradoraService', AseguradoraService);

    //Es un servicio de busqueda como hacer las consultas.
    AseguradoraService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function AseguradoraService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.addAseguradora = addAseguradora;
        service.eliminarAseguradora = eliminarAseguradora;
        service.saveAseguradora = saveAseguradora;
        service.getAseguradorasByFilter = getAseguradorasByFilter;
        service.borrarAseguradora = borrarAseguradora;
        service.getNegociosByAseguradora = getNegociosByAseguradora;
        service.getContactosByAseguradoraRamo = getContactosByAseguradoraRamo;
        service.getContactosByAseguradora = getContactosByAseguradora;

        service.getProductos = getProductos;
        service.getProductosByFilter = getProductosByFilter;
        service.getProductoByIdCompRamoProd = getProductoByIdCompRamoProd;
        service.getTiposImpuestos = getTiposImpuestos;
        service.saveProducto = saveProducto;
        service.getColectivosByMediador = getColectivosByMediador;

        return service;     
       
        //Añadir nueva aseguradora
        function addAseguradora(json) {
        	var url=BASE_CON+"/aseguradoras/saveAseguradora";
            return get(url,token,json);
        }
        
        //Borrar aseguradora
        function eliminarAseguradora(json) {
        	var url=BASE_CON+"/aseguradoras/borrarAseguradora";
            return get(url,token,json);
        }
        
        function saveAseguradora(json) {
        	var url=BASE_CON+"/aseguradoras/saveAseguradora";
            return get(url,token,json);
        }
        
        function getAseguradorasByFilter(json) {
        	var url=BASE_CON+"/aseguradoras/getAseguradorasByFilter";
            return get(url,token,json);
        }
        
        function borrarAseguradora(json) {
        	var url=BASE_CON+"/aseguradoras/borrarAseguradora";
            return get(url,token,json);
        }
        
        function getContactosByAseguradoraRamo(compania, ramo){
        	var url=BASE_CON+"/aseguradoras/getContactosByAseguradora/" + compania + "?ramo=" + ramo;
            return get2(url,token);
        }
        
        function getContactosByAseguradora(compania){
        	var url=BASE_CON+"/aseguradoras/getContactosByAseguradora/" + compania;
            return get2(url,token);
        }
        
        function getNegociosByAseguradora(json){
        	var url=BASE_CON+"/aseguradoras/getNegociosByAseguradora";
            return get(url,token,json);
        }

        function getProductos(){
        	var url=BASE_CON + '/producto/getProductos';
            return get2(url, token);
        }

        function getProductosByFilter(json) {
            var url = BASE_CON + '/producto/getProductosByFilter';
            return get(url, token, json);      
        }

        function getProductoByIdCompRamoProd(json) {
            var url = BASE_CON + '/producto/getProductoByIdCompRamoProd/' + json;
            return get(url, token, {});      
        }

        function getTiposImpuestos() {
            var url = BASE_CON + '/producto/getTiposImpuestos';
            return get2(url, token);      
        }

        function saveProducto(json) {
            var url = BASE_CON + '/producto/saveProducto';
            return get(url, token, json);      
        }
        
        function getColectivosByMediador(json) {
            var url = BASE_CON + '/producto/getColectivosByMediador';
            return get(url, token, json); 
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
        
        //Get
        function get2(url, token){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
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