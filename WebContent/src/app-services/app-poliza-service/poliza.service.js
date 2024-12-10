(function () {
    'use strict';

    angular
        .module('App')
        .factory('PolizaService', PolizaService);

    //Es un servicio de busqueda como hacer las consultas.
    PolizaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON', 'BASE_SF', 'BASE_TI'];
    function PolizaService($http, $cookies, $rootScope, $timeout, $window, BASE_CON, BASE_SF, BASE_TI) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.addPoliza = addPoliza;
        service.editarPoliza = editarPoliza;
        service.eliminarPoliza = eliminarPoliza;
        service.getPolizasByFilter = getPolizasByFilter;
        service.getRetarificarPoliza = getRetarificarPoliza;
        service.retarificaSuplemento = retarificaSuplemento;
        service.tarifica = tarifica;
        service.getAntecedentesPlzs = getAntecedentesPlzs;
        service.reemplazo = reemplazo;
        service.getCondiciones = getCondiciones; // descargarPoliza
        service.getCondicionesPol = getCondicionesPol; // descargarPoliza
        service.sendCondiciones = sendCondiciones; 
        service.getRiesgosPoliza = getRiesgosPoliza;
        service.getDetail = getDetail;
        service.envioDocumentacion = envioDocumentacion;
        service.altaPoliza = altaPoliza;
        service.confirmPoliza = confirmPoliza;
        service.confirm = confirm;
        service.fillCampaign = fillCampaign;
        service.sendMailConditions = sendMailConditions;
        service.nuevoRiesgo = nuevoRiesgo;
        service.editarRiesgo = editarRiesgo;
        service.deleteRiesgo = deleteRiesgo;
        service.getCondicionesExt = getCondicionesExt;
        service.getHistoricoPoliza = getHistoricoPoliza;
        service.documentacionEbroker = documentacionEbroker;
        service.documentacionEbrokerBlob = documentacionEbrokerBlob;
        service.confirmarPoliza = confirmarPoliza;
        service.getCondicionesCiber = getCondicionesCiber;
        service.getHistoricoComunicacionesPoliza = getHistoricoComunicacionesPoliza;
        service.descargarComunicacionesPolizaCliente = descargarComunicacionesPolizaCliente;
        service.guardarDominio = guardarDominio;
        service.obtenerHistoricoCambiosPoliza = obtenerHistoricoCambiosPoliza;

        return service;     

        //Get detalle de póliza
        function getDetail(id){
            var url=BASE_CON+"/polizas/getDetail/" + id;
            return get2(url,token);
        }
        
        function getRiesgosPoliza (json) {
        	var url=BASE_CON+"/polizas/getRiesgosPoliza";
            return post(url,token,json);
        }
        
        //Añadir nuevo cliente
        function addPoliza(json) {
        	var url=BASE_CON+"/polizas/savePoliza";
            return post(url,token,json);
        }
        
        //Editar cliente
        function editarPoliza(json) {
        	var url=BASE_CON+"/polizas/editarPoliza";
            return post(url,token,json);
        }
        
        //Borrar cliente
        function eliminarPoliza(json) {
        	var url=BASE_CON+"/polizas/eliminarPoliza";
            return post(url,token,json);
        }

        //Buscar póliza
       function getPolizasByFilter(json) {
           var url=BASE_CON+"/polizas/getPolizas/false";
           return post(url,token,json);
       }
       
        //Buscar póliza
       function getHistoricoPoliza(json) {
           var url=BASE_CON+"/polizas/getPolizas/true";
           return post(url,token,json);
       }

        //Retarificar póliza
       function getRetarificarPoliza(json) {
           var url=BASE_CON+"/polizas/retarificarPoliza";
           return post(url,token,json);
       }
       
       //Retarificar suplemento
       function retarificaSuplemento(json) {
           var url=BASE_CON+"/polizas/retarificaSuplemento";
    	   //var url = "http://192.168.1.56:8080/segurodigital-rest/rest/polizas/retarificaSuplemento";
           return post(url,token,json);
       }
       
       //Tarifica
       function tarifica(json, bool) {
           var url=BASE_CON+"/polizas/tarifica/" + bool;
    	   //var url = "http://192.168.1.56:8080/segurodigital-rest/rest/polizas/tarifica/" + bool;
           return post(url,token,json);
       }
       
       //Reemplazo
       function reemplazo(json) {
           var url=BASE_CON+"/polizas/reemplazo";
    	   //var url = "http://192.168.1.56:8080/segurodigital-rest/rest/polizas/reemplazo";
           return post(url,token,json);
        }
        //Descargar Condiciones póliza PDF(detalle)
        function getCondicionesPol(json, extension) {
            var url = BASE_CON + "/polizas/getCondiciones/" + json + "/" + _.get($rootScope, 'globals.currentUser.idRol');
            if (extension == true) {
                url += "?type=extension&lang=null";
            }
            return get(url, token, json);
        }
       //Descargar Condiciones póliza PDF(tarificadores)
       function getCondiciones(json, extension){
           var url=BASE_CON+"/tarificacion/getCondiciones/" + json;
           if (extension == true) {
        	   url += "?type=extension";
           }
           return get(url,token,json);
       }
       //Descargar Condiciones póliza PDF(detalle)
       function getCondicionesExt(json, extension) {
           var url = BASE_CON + "/external/getCondiciones/" + json;
           if (extension == true) {
                url += "?type=extension&lang=null";
            }
           return get(url, token, json);
       }

       //Enviar condiciones Póliza email
       function sendCondiciones(json, email){
           var url=BASE_CON+"/polizas/sendCondiciones/" + json;

           if (_.get($rootScope, 'globals.currentUser.idRol') != null) {
        	   url += "/" + _.get($rootScope, 'globals.currentUser.idRol');
           }
           
           if (email != null) {
        	   url += "/?email=" + email;
           }
           
           return send(url,token,json);
       }
        
       //Antecedentes de pólizas
       function getAntecedentesPlzs(json){
           var url=BASE_CON+"/polizas/getAntecedentesPolizas";
           return post(url,token,json);
       }
       //enviar documentación
       function envioDocumentacion(json){
           var url=BASE_CON+"/polizas/subirDocumentacion";
           return post(url,token,json);
       }

        function nuevoRiesgo(json) {
            var url = BASE_CON + '/polizas/nuevoRiesgo';
            return post(url, token, json);
        }
        function editarRiesgo(json) {
            var url = BASE_CON + '/polizas/editarRiesgo';
            return post(url, token, json);
        }
        function deleteRiesgo(id, it) {
            var url = BASE_CON + '/polizas/deleteRiesgo/' + id + '/' + it;
            return post(url, token, {});
        }

        function altaPoliza(json) {
        	var url=BASE_CON+"/polizas/altaPoliza";
            return post(url,token,json);
        }

        function confirmPoliza(id, iban) {
        	var url = `${BASE_CON}/polizas/confirm/${id}/${iban}`;
            return get2(url, token);
        }
        
        //Confirmar/Suspender póliza SM
        function confirm(tipo, json, param) {
        	var url=BASE_SF+"/movistar/confirm/" + tipo;
        	
        	if (param != null) {
        		url += "?" + param;
        	}
        	
            return post(url,token,json);
        }
        
        //Recuperar JS_CAMPAIGN
        function fillCampaign(json) {
        	var url=BASE_SF+"/policy/fillCampaign";
            return post(url,token,json);
        }
        
        //Enviar documentación SM
        function sendMailConditions (json) {
        	var url=BASE_SF+"/movistar/send-mail-conditions";
            return post(url,token,json);
        }
        
        function documentacionEbroker (json) {
        	var url= BASE_TI + "/documentacion/policy/e2k";
            return post(url,token,json);
        }
        
        function documentacionEbrokerBlob (json) {
        	var url= BASE_TI + "/documentacion/policy/e2k";
            return postBlob(url,token,json);
        }
        
        function confirmarPoliza (json) {
        	var url = BASE_CON + "/polizas/confirmarPoliza";
            return post(url,token,json);
        }

        function getCondicionesCiber(id, opt) {
            var url = `${BASE_CON}/external/getCondiciones/${id}/${opt}`;
            return get(url, token, id);
        }
        
        //Recuperar las comunicaciones hechas a cliente a nivel de poliza
        function getHistoricoComunicacionesPoliza(id) {
            var url=BASE_CON+"/polizas/getComunicacionesPolizaCliente/" + id;

            return get2(url, token);
        }
        
        //Recuperar las comunicaciones hechas a cliente a nivel de poliza
        function descargarComunicacionesPolizaCliente(id) {
            var url=BASE_CON+"/polizas/descargarComunicacionPolizaCliente/" + id;

            return get2(url, token);
        }

        //Guardar dominio
        function guardarDominio(json) {
            var url = BASE_CON + "/polizas/newDomain";
            return post(url,token,json);
        }
        
        //Recuperar el histórico de una poliza
        function obtenerHistoricoCambiosPoliza(id) {
            var url = BASE_CON + "/polizas/obtenerHistoricoCambiosPoliza/" + id;

            return get2(url, token);
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
        
        //Post
        function postBlob(url, token, json){
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
                responseType: 'arraybuffer',
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }

        //Get
        function get(url, token){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        } 
        
        //Get 2
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

        //Send email
        function send(url, token, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }

    };
    
})();