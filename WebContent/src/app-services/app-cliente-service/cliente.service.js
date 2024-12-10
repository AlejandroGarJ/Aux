(function () {
    'use strict';

    angular
        .module('App')
        .factory('ClienteService', ClienteService);

    //Es un servicio de busqueda como hacer las consultas.
    ClienteService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function ClienteService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getCliente = getCliente;
        service.getClienteProducto = getClienteProducto;
        service.getValorCliente = getValorCliente;
        service.addCliente = addCliente;
        service.editarCliente = editarCliente;
        service.borrarClientes = borrarClientes;
        service.getClientes = getClientes;
        service.validaDocumento = validaDocumento;
        service.validaTipoDocumento = validaTipoDocumento;
        service.contactoCliente = contactoCliente;
        service.getClienteMovistar = getClienteMovistar;
        return service;     
        
        
        //Recuperar los datos del cliente
        function getCliente(json) {
            var url=BASE_CON+"/clientes/getCliente";
            return get(url,token,json);
        }
        function getClienteProducto(producto, json) {
            var url=BASE_CON+"/clientes/getCliente?pr="+producto;
            return get(url,token,json);
        }
        function getValorCliente(json) {
            var url=BASE_CON+"/clientes/getValorCliente";
            return get(url,token,json);
        }
        
        //Añadir nuevo cliente
        function addCliente(json) {
        	var url=BASE_CON+"/clientes/nuevoCliente";
            return get(url,token,json);
        }
        
        //Editar cliente
        function editarCliente(json) {
        	var url=BASE_CON+"/clientes/editarCliente";
            return get(url,token,json);
        }
        
        //Borrar cliente
        function borrarClientes(json) {
        	var url=BASE_CON+"/clientes/borrarCliente";
            return get(url,token,json);
        }
        
        function getClientes(json) {
            var url=BASE_CON+"/clientes/getClientes";
            return get(url,token,json);
        }

        function validaDocumento(json) {
            var url=BASE_CON+"/recursos/validaDocumento";
            return get(url,token,json);
        }

        function validaTipoDocumento(json) {
            var url=BASE_CON+"/clientes/validaTipoDocumento";
            return get(url,token,json);
        }
      //Editar cliente
        function contactoCliente(json) {
        	var url=BASE_CON+"/clientes/contactoCliente";
            return get(url,token,json);
        }

        function getClienteMovistar(json) {
            var url=BASE_CON+"/clientes/getDocumentNumber";
            return get(url,token,json);
        }
        //Get
        function get(url, token, json){
        	token = _.get($rootScope, 'globals.currentUser.token');
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': coToken + " " + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
    };
    
})();