(function () {
    'use strict';

    angular
        .module('App')
        .factory('EmpresaService', EmpresaService);


    EmpresaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_TI', 'BASE_CON'];
    function EmpresaService($http, $cookies, $rootScope, $timeout, $window, BASE_TI, BASE_CON) {
    	
        // var token = _.get($rootScope, 'globals.currentUser.token');
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        var token = coToken + ' fHoO8+VUjYjyKlBq47+Hsxyzf8g5bvBoJc+TDB9sS/w=';
        var tokenF = coToken + ' Q9BqD59gIV+v9kbDd9xHVOUMKq04fJb7';
    	token = token || '';
    	tokenF = tokenF || '';
    	
    	var tokenA = 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade');
//    	var tokenA = coToken + ' ' + hex_hmac_md5('Tarificador', btoa('TIPGTW:InterX0X0Pleyade'));
    	
        var service = {};

        service.groups = groups;
        service.groupsDetail = groupsDetail;

        service.cities = cities;
        service.getUserAgent = getUserAgent;

        service.rate = rate;
        service.callmeback = callmeback;
        service.contract = contract;
        service.contractAdhoc = contractAdhoc;
        service.sendFormulario = sendFormulario;
        service.validaDescuento = validaDescuento;
        service.rateOpt = rateOpt;
        service.redirectTiper = redirectTiper;
        
        return service;
        
        function groups(id) {
        	var url = BASE_CON + '/tipos/getActividadesBySector';
        	
        	if (id != null) {
        		url += "/?id=" + id;
        	}
        	
        	var json = {};
            return get(url, tokenA, json);
        }

        function groupsDetail(inBajaReg) {
        	var url = BASE_CON + '/tipos/getActividadesBySector';
        	
        	if (inBajaReg != null) {
        		url += "/?inBajaReg=" + inBajaReg;
        	}
        	
        	var json = {};
            return get(url, tokenA, json);
        }

        function cities(json) {
        	var url = BASE_CON + "/recursos/localidades/" + json;
            return get(url, token, json);
        }
        function getUserAgent() {
        	var url = BASE_TI + '/authentication/getUserAgent';
        	var json = {};
            return get(url, token, json);
        }

        function rate(json) {
        	var url = BASE_CON + '/tarificacion/tarificacionCias';
            return post(url, tokenA, json);
        }

        function rateOpt(json) {
        	var url = BASE_CON + '/tarificacion/tarificacionCias/opt/false';
            return post(url, tokenA, json);
        }
        
        function callmeback(json) {
        	var url = BASE_TI + '/customer/callmeback/CBEMP-INDEP';
            return post(url, token, json);
        }
        function contract(json, adhoc) {
        	var url = BASE_CON + '/tarificacion/emite';
            return post(url, tokenA, json);
        }
        function contractAdhoc(json, adhoc) {
        	var url = BASE_CON + '/tarificacion/emiteAdhoc';
            return post(url, tokenA, json);
        }
        function sendFormulario(json, product) {
        	var url = BASE_CON + '/tarificacion/sendFormulario/' + product;
            return post(url, tokenA, json);
        }
        
        function validaDescuento (json) {
        	var url = BASE_CON + '/tarificacion/validaDescuento';
            return post(url, tokenA, json);
        }
        
        function redirectTiper (json) {
        	var url = BASE_CON + '/tarificacion/presupuesto/redirectTiper';
            return post(url, tokenA, json);
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
                headers: {'Authorization': token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }
    };
    
})();