(function () {
    'use strict';

    angular
        .module('App')
        .factory('ReciboService', ReciboService);

    //Es un servicio de busqueda como hacer las consultas.
    ReciboService.$inject = ['$http', '$rootScope', '$window','BASE_CON'];
    function ReciboService($http, $rootScope, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.guardarRecibo = guardarRecibo;
        service.borrarRecibo = borrarRecibo;
        service.getRecibosByPoliza = getRecibosByPoliza;
        service.getRecibos = getRecibos;
        
        service.bloqRecibo = bloqRecibo;
        service.updateFDContab = updateFDContab;
        service.enviarSAP = enviarSAP;

        service.gestionarRecibo = gestionarRecibo;
        service.gestionarReciboDevuelto = gestionarReciboDevuelto;
        service.getDevueltos = getDevueltos;
        service.saveRemesa = saveRemesa;
        service.actualizaRemesas = actualizaRemesas;
        service.updateLiquidacionesRecibos = updateLiquidacionesRecibos;
        service.getPdfReciboByNuRecibo = getPdfReciboByNuRecibo;
        service.getPdfReciboByIdBrokerAndNuRecibo = getPdfReciboByIdBrokerAndNuRecibo;
        
        return service;     
       
        
        //Detalles de una solicitud
        function guardarRecibo(json) {
        	var url=BASE_CON+"/recibos/guardarRecibo";
            return get(url,token,json);
        }
        
        //Liquidar recibos
        function updateLiquidacionesRecibos (json, obs, tipo, usu) {
        	var url=BASE_CON+"/recibos/updateLiquidacionesRecibos?observaciones=" + obs + "&no_usu_mod=" + usu + "&IN_LIQ=" + tipo;
            return get(url,token,json);
        }
       
         //Borrar recibo
        function borrarRecibo(json) {
        	var url=BASE_CON+"/recibos/eliminarRecibo";
            return get(url,token,json);
        }

        //Recuperar recibos por poliza
        function getRecibosByPoliza(json) {
        	var url=BASE_CON+"/recibos/getRecibosByPoliza";
            return get(url,token,json);
        }

        //Recuperar recibos
        function getRecibos(json) {
        	var url=BASE_CON+"/recibos/getRecibos";
            return get(url,token,json);
        }
        
        //Bloquear recibos
        function bloqRecibo(json) {
        	var url=BASE_CON+"/recibos/bloquearRecibo";
            return get(url,token,json);
        }
        
        //Cambiar fecha contabilización recibos
        function updateFDContab(json) {
        	var url=BASE_CON+"/recibos/updateFDContabilizacion";
            return get(url,token,json);
        }
        
        //Enviar a SAP recibos
        function enviarSAP(json) {
        	var url=BASE_CON+"/recibos/enviarSAP";
            return get(url,token,json);
        }

        // Gesionar Recibo
        function gestionarRecibo(json) {
        	var url=BASE_CON+"/recibos/gestionarRecibo";
            return get(url,token,json);
        }

        //Gestionar recibos devueltos
        function gestionarReciboDevuelto(json, inCopy) {
        	var url=BASE_CON+"/recibos/tipoResolucionDevuelto/" + inCopy;
            return get(url,token,json);
        }

        //Guardar Remesa
        function saveRemesa(json) {
            var url=BASE_CON+"/recibos/saveRemesa";
            return get(url,token,json);
        }

        //Actualizar /cambiar datos remesa
        function actualizaRemesas(json){
            var url=BASE_CON+"/recibos/actualizaRemesas";
            return get(url,token,json);
        }
        
      //Recuperar recibos devueltos según gestión
        function getDevueltos(json){
            var url=BASE_CON+"/recibos/getTotalDevueltos";
            return getMethod(url,token,json);
        }
        
        function getPdfReciboByNuRecibo (nuRecibo) {
        	var url=BASE_CON+"/recibos/getPdfReciboByNuRecibo/" + nuRecibo;
            return blob(url, token);
        }
        function getPdfReciboByIdBrokerAndNuRecibo(idBroker, numReceipt) {
        	var url = `${BASE_CON}/recibos/getPdfReciboByIdBrokerAndNuRecibo/${idBroker}/${numReceipt}`;
            return blob(url, token);
        }
        
        //Descarga
        function blob(url, token){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'POST',
                url: url,
                responseType: 'arraybuffer',
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }

        //post 
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
        
        //get
        function getMethod(url, token, method) {
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                data: {},
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	
            }); 
        }
    };
    
})();