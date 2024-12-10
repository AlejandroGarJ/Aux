// Servicio de Validaciones
(function(ng) {

    "use strict";

    function validacionesService($resource,BASE_APP) {    

        var services = {
            getDataNuevo:obtener_datos_nuevo,
            getData: obtener_datos,
            getDict: obtener_diccionario,
            getDataPoliza: obtener_datos_poliza,
            getDictPoliza: obtener_dict_poliza,
        }

        return services;

        //Nuevo Cliente
        function obtener_datos_nuevo() {
            return $resource(BASE_APP+'dictionaries/data.nuevo.cliente.json').get().$promise;
        }

        //Cliente
        function obtener_datos() {
            return $resource(BASE_APP+'dictionaries/data.busqueda.cliente.json').get().$promise;
        }

        function obtener_diccionario() {
            return $resource(BASE_APP+'dictionaries/dict.busqueda.cliente.json').get().$promise;
        }
        
        //Polizas
        function obtener_datos_poliza() {
            return $resource(BASE_APP+'dictionaries/data.busqueda.poliza.json').get().$promise;
        }
        
        function obtener_dict_poliza() {
        	return $resource(BASE_APP+'dictionaries/dict.busqueda.poliza.json').get().$promise;
        }
    }

    validacionesService.$inject = ['$resource', 'BASE_APP'];
    
    ng.module('App').factory('validacionesService', validacionesService);

})(window.angular);