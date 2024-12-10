// Servicio de Validaciones
(function(ng) {

    "use strict";

    function mapeoMenuService($resource,BASE_APP) {    

        var services = {
            getData: obtener_datos,
            getDict: obtener_diccionario,
            getDataPoliza: obtener_datos_poliza,
            getDictPoliza: obtener_dict_poliza
        }

        return services;

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
    
    ng.module('App').factory('mapeoMenuService', mapeoMenuService);

})(window.angular);