(function () {
    'use strict';

    angular
        .module('App')
        .factory('PresupuestoService', PresupuestoService);

    //Es un servicio de busqueda como hacer las consultas.
    PresupuestoService.$inject = ['$http', '$rootScope', 'BASE_CON', '$window'];
    function PresupuestoService($http, $rootScope, BASE_CON, $window) {
    	
//    	var token = JSON.parse($window.sessionStorage.perfil).token;
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
    	var tokenA = 'Basic VElXZWJUVzpJbnRlclgwWDBQbGV5YWRl';

        var service = {};
        service.getAseguradorasTarificables = getAseguradorasTarificables;
        service.getTarificacionByAseguradora = getTarificacionByAseguradora;
        service.savePresupuesto = savePresupuesto;
        service.emisionManual = emisionManual;
        service.enviarPresupuestoPDF = enviarPresupuestoPDF;
        service.descargarPresupuesto = descargarPresupuesto;
        service.getTarificacionIndividual = getTarificacionIndividual;
        service.emitirPresupuesto = emitirPresupuesto;
        service.getCapitales = getCapitales;
        service.getContinenteContenido = getContinenteContenido;
        service.saveContinenteContenido = saveContinenteContenido;
        service.descargaPresupuesto = descargaPresupuesto;
        service.descargaPresupuestoExt = descargaPresupuestoExt;
        service.actualizarSubestado = actualizarSubestado;
        service.getSubestadosPresupuestos = getSubestadosPresupuestos;
        return service;     

        function descargaPresupuesto(json, enviarMail, pToken) {
        	var url=BASE_CON+"/tarificacion/descargaPresupuesto/" + enviarMail;
        	if (_.get($rootScope, 'globals.currentUser.idRol') != null) {
        		url += "/" + _.get($rootScope, 'globals.currentUser.idRol');
        	}
            return getBlob(url, pToken ? pToken : tokenA ,json);
        } 

        function descargaPresupuestoExt(json, enviarMail) {
        	var url=BASE_CON+"/external/descargaPresupuesto/" + enviarMail;
        	// if (_.get($rootScope, 'globals.currentUser.idRol') != null) {
        	// 	url += "/" + _.get($rootScope, 'globals.currentUser.idRol');
        	// }
            return getBlob(url,tokenA,json);
        }
        
        function getAseguradorasTarificables(json) {
        	var url=BASE_CON+"/presupuestos/getAseguradorasTarificablesByRamo";
            return get(url,token,json);
        }
        
        function getTarificacionByAseguradora(json){
        	var url=BASE_CON+"/presupuestos/getTarificacion";
        	return get(url,token,json);
        }
        
        function savePresupuesto(json){
        	var url=BASE_CON+"/presupuestos/guardarPresupuesto";
        	return get(url,token,json);
        }
        
        function emisionManual(json){
        	var url=BASE_CON+"/presupuestos/emisionManual";
        	return get(url,token,json);
        }
        
        function enviarPresupuestoPDF(json){
        	var url=BASE_CON+"/presupuestos/enviarPresupuestoPDF";
        	return get(url,token,json);
        }
        
        function descargarPresupuesto(json){
        	var url=BASE_CON+"/presupuestos/descargarPresupuesto";
        	return get(url,token,json);
        }
        
        function getTarificacionIndividual(json){
        	var url=BASE_CON+"/presupuestos/tarificacionIndividual";
        	return get(url,token,json);
        }
        
        function emitirPresupuesto(json){
        	var url=BASE_CON+"/presupuestos/emitirPresupuesto";
        	return get(url,token,json);
        }
       
        function getCapitales(json){
        	var url=BASE_CON+"/app/getCapitales";
        	return get(url,token,json);
        }
        
        function getContinenteContenido(json){
        	var url=BASE_CON+"/presupuestos/getContinenteContenido";
        	return get(url,token,json);
        }
        
        function saveContinenteContenido(json){
        	var url=BASE_CON+"/presupuestos/saveContinenteContenido";
        	return get(url,token,json);
        }
        
        function actualizarSubestado(json){
        	var url=BASE_CON+"/presupuestos/actualizarSubestado";
        	return get(url,token,json);
        }
        
        function getSubestadosPresupuestos(idPresupuesto){
        	var url = BASE_CON + "/presupuestos/obtenerSubestadosValidos/" + idPresupuesto;
        	return get_(url,token);
        }

        //Get
        function get(url, token, json){
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
        
        // Get
        function get_(url, token){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
//                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }
        
        function getBlob(url, token, json){

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                responseType: 'arraybuffer',
                headers: {'Authorization': token , 'Content-Type': 'application/json'}	//Permiso para la petición.
            });
        }
    };
    
})();