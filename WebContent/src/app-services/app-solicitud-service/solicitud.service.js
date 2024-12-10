(function () {
    'use strict';

    angular
        .module('App')
        .factory('SolicitudService', SolicitudService);

    //Es un servicio de busqueda como hacer las consultas.
    SolicitudService.$inject = ['$http', '$cookies', '$rootScope', '$window', '$timeout', 'BASE_CON'];
    function SolicitudService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getSolicitud = getSolicitud;
        service.getTiposSolicitudFilter = getTiposSolicitudFilter;
        service.getReasignarSolicitud = getReasignarSolicitud;
        service.getRechazarSolicitud = getRechazarSolicitud;
        service.getUsuariosGestores = getUsuariosGestores;
        service.uploadFileToUrl = uploadFileToUrl;
        service.nuevaSolicitud = nuevaSolicitud;
        service.enviarMailAseguradora = enviarMailAseguradora;
        service.enviarMailCliente = enviarMailCliente;
        service.gestionarSolicitud = gestionarSolicitud;
        service.confirmarSolicitudRenting = confirmarSolicitudRenting;
        service.asociarDatosRenting = asociarDatosRenting;
        service.countSolicitudesByPoliza = countSolicitudesByPoliza;
        service.validarFechaBaja = validarFechaBaja;
        return service;
        
        //Detalles de una solicitud
        // function getSolicitud(json) {
        // 	var url=BASE_CON+"/solicitudes/getDetalleSolicitud";
        //     return post(url,token,json);
        // }
        function getSolicitud(json) {
        	var url=BASE_CON+"/solicitudes/getDetail/" + json;
            return get(url,token,json);
        }
        
        //Filtrar los tipos de solicitud
        function getTiposSolicitudFilter(json){
        	var url=BASE_CON+"/solicitudes/getTiposSolicitudesByFilter";
        	return post(url,token,json);
        }
        
        //Filtrar los tipos de solicitud
        function validarFechaBaja(json){
        	var url=BASE_CON+"/solicitudes/validarFechaBaja ";
        	return post(url,token,json);
        }

        //Reasignar solicitud
        function getReasignarSolicitud(json){
        	var url=BASE_CON+"/solicitudes/reasignarSolicitud";
        	return post(url,token,json);
        }

        //Rechazar solicitud
        function getRechazarSolicitud(json){
        	var url=BASE_CON+"/solicitudes/rechazarSolicitud";
        	return post(url,token,json);
        }

        //Combo gestores solicitudes
        function getUsuariosGestores(json){
        	var url=BASE_CON+"/users/getUsuariosGestores/"+false;
        	return post(url,token,json);
        }

         //Subir archivos
        function uploadFileToUrl(json){
        	var url=BASE_CON+"/App/uploadPolicyDocumentation";
        	return post(url,token,json);
        }


        //Nueva solicitud
        function nuevaSolicitud(json){
            var url = BASE_CON + "/solicitudes/put";
            return put(url,token,json);
        }

        //Enviar mail aseguradora
        function enviarMailAseguradora(json){
            var url = BASE_CON + "/solicitudes/enviarMailAseguradora";
            return post(url,token,json);
        }

        //Enviar mail cliente
        function enviarMailCliente(json){
            var url = BASE_CON + "/solicitudes/enviarMailCliente";
            return post(url,token,json);
        }

        //Validar / Confirmar solicitud
        function gestionarSolicitud(json, tipoGestion){
            var url = BASE_CON + '/solicitudes/gestionarSolicitud/' + tipoGestion;
            return post(url,token,json);
        }

        function confirmarSolicitudRenting(json) {
        	var url=BASE_CON+"/solicitudes/confirmarSolicitudRenting";
            return post(url,token,json);
        }
        
        function asociarDatosRenting(json) {
        	var url=BASE_CON+"/solicitudes/asociarDatosRenting";
            return post(url,token,json);
        }
        
        function countSolicitudesByPoliza(idPoliza) {
        	var url=BASE_CON+"/solicitudes/countSolicitudesByPoliza/" + idPoliza;
            return get(url,token);
        }

        //GET
        function get(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {
                	'Authorization': coToken + ' ' + token , 
                	'Content-Type': 'application/json' //Permiso para la petición.
                }	
            });
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
                headers: {
                	'Authorization': coToken + ' ' + token , 
                	'Content-Type': 'application/json' //Permiso para la petición.
                }	
            });
        }
        
        //Put
        function put(url,token,json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
        		method:"PUT",
        		url: url,
        		data: json,
        		headers:{
        			'Authorization': coToken + ' ' +token,
        			'Content-Type':'application/json'
        		}
        	});
        }
        
    };
    
})();