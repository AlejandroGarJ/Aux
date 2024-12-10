(function () {
    'use strict';

    angular
        .module('App')
        .factory('BrokerService', BrokerService);


    BrokerService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function BrokerService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

        
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';

        var service = {};
        service.getFilesBroker = getFilesBroker;
        service.getCampaignsByFilter = getCampaignsByFilter;
        
        return service;     

        function getFilesBroker(idMediador, idPrograma) {
            var url = BASE_CON + '/brokers/getFilesByMediatorProgramAndTipoArchivo/' + idMediador + '/' + idPrograma;
            return get(url, token);
        }

        function getCampaignsByFilter(json) {
            var url = BASE_CON + '/campaigns/getByFilter';
            return post(url, token, json);
        }
        
        //get
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

        //Post
        function post(url, token, json){
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