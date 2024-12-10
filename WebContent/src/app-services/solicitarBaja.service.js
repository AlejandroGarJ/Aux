(function () {
    'use strict';

    angular
        .module('App')
        .factory('SolicitarBajaService', SolicitarBajaService);

    SolicitarBajaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window'];
    function SolicitarBajaService($http, $cookies, $rootScope, $timeout, $window) {
        var service = {};
        service.darDeBaja = darDeBaja;

        return service;
        
        function darDeBaja(idPoliza) {

            var response;
            //var url = 'http://10.102.7.147/intermediacion-war/rest/Solicitudes/solicitudBajaRenting';
            var url = 'http://10.102.10.219:8080/IntermediacionWeb/rest/solicitudes/solicitudBajaRenting'
            var contentType = 'application/json';
            var jsonBusqueda = {
                      "ID_CAUSAANULACION": 19,
                      "OPOLIZA":
                        {"ID_POLIZA":idPoliza}
                    };

            return $http({
                method: 'POST',
                url: url,
                data: jsonBusqueda,
                headers: {'Authorization':'Token ' +$rootScope.globals.currentUser.token, 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
                });
        }
    };

})();