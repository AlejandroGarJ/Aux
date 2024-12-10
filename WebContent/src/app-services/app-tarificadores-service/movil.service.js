(function () {
    'use strict';

    angular
        .module('App')
        .factory('MovilService', MovilService);


    MovilService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_TI', 'BASE_SF','BASE_CON'];
    function MovilService($http, $cookies, $rootScope, $timeout, $window, BASE_TI, BASE_SF, BASE_CON) {
    	
         var token = _.get($rootScope, 'globals.currentUser.token');
     	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
//        var token = 'WbX0ku+XHn5jyf9emTN6DAdG/2Y1gwnJkBJkAteT4S71ahFXOH';
        var tokenP = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	tokenP = tokenP || '';
    	
        var service = {};

        service.uninsured_devices = uninsured_devices;
        service.model_aprox = model_aprox;
        service.rateMovilAP = rateMovilAP;
        service.validate = validate;
        service.contract = contract;
        service.confirmKO = confirmKO;
        service.send_mail_conditions = send_mail_conditions;
        
        service.sendLinkApp = sendLinkApp;

        service.getDevices = getDevices;
        service.getDevicesMobile = getDevicesMobile;
        service.generateToken = generateToken;
        service.insertDevice = insertDevice;
        service.updateDevice = updateDevice;
        service.uploadPreciario = uploadPreciario;
        service.downloadPreciario = downloadPreciario;
        service.recuperarPin = recuperarPin;
        service.cambiarFecha = cambiarFecha;
        service.enviarConsentimiento = enviarConsentimiento;
        service.subirConsentimiento = subirConsentimiento;
        service.getDevicesMovistar= getDevicesMovistar;
        service.getDeviceMovistar= getDeviceMovistar;
		service.cambiarCodprecom = cambiarCodprecom;
		service.nuevaPortabilidad = nuevaPortabilidad;
		service.portabilidadStatus = portabilidadStatus;
		service.condiciones = condiciones;
		service.getAllUDevicesByMSISDN = getAllUDevicesByMSISDN;
		service.confirmImei = confirmImei;
		service.confirmarAltaBloqueo = confirmarAltaBloqueo;
		service.confirmarBajaBloqueo = confirmarBajaBloqueo;
		service.comprobarPo = comprobarPo;
		service.device = device;
		service.getDevicesTypes = getDevicesTypes;
		service.getChangelog = getChangelog;
		service.traceabilityFilter = traceabilityFilter;
		
        return service;
        
        function uninsured_devices(json) {
        	var url = BASE_SF + '/movistar/uninsured-devices';
            return post(url, tokenP, json);
        }
        
        function traceabilityFilter(json) {
        	var url = BASE_SF + '/hermes/traceability/filter';
            return post(url, tokenP, json);
        }
        function model_aprox(json) {
        	var url = BASE_SF + '/movistar/uninsured-devices/model-aprox';
            return post(url, tokenP, json);
        }
        function rateMovilAP(json) {
        	var url = BASE_SF + '/movistar/rateMovilAP';
            return post(url, tokenP, json);
        }
        function validate(json) {
        	var url = BASE_SF + '/movistar/uninsured-devices/validate';
            return post(url, tokenP, json);
        }
        function contract(json) {
        	var url = BASE_SF + '/movistar/contract';
            return post(url, tokenP, json);
        }
        function confirmKO(json) {
        	var url = BASE_SF + '/insurance-mobile/movistar/confirm/KO';
            return post(url, tokenP, json);
        }
        function send_mail_conditions(json) {
        	var url = BASE_SF + '/insurance-mobile/movistar/send-mail-conditions';
            return post(url, tokenP, json);
        }

        function sendLinkApp(json) {
        	var url = BASE_SF + '/sms/sendLinkApp';
            return post(url, tokenP, json);
        }
        
//        function generateToken(json) {
//        	var url = BASE_CON + '/terminales/generate/uDevice';
//            return post(url, tokenP, json);
//        }
        
        function generateToken(json) {
        	var url = BASE_SF + '/adminpanel/uDevice';
			return post(url, tokenP, json);
        }

//        function getDevices(json) {
//        	var url = BASE_CON + '/terminales/getTerminales';
//            return post(url, tokenP, json);
//        }
        
        function getDevices() {
        	var url =   BASE_SF + '/devices/all';
            return get(url, tokenP);
        }
        
        function getDevicesMobile() {
        	var url =   BASE_SF + '/devices/mobile';
            return get(url, tokenP);
        }
        
        function insertDevice(json) {
        	var url = BASE_SF + '/adminpanel/insertDeviceService';
            return post(url, tokenP, json);
        }
        
        function updateDevice(json) {
        	var url = BASE_SF + '/adminpanel/updateDeviceService';
            return patch(url, tokenP, json);
        }
        
        function uploadPreciario(json) {
        	var url = BASE_CON + '/terminales/uploadPreciario';
            return post(url, tokenP, json);
        }
        
        function downloadPreciario(json) {
        	var url = BASE_CON + '/reports/informe/preciarioSemanal';
            return post(url, tokenP, json);
        }
        
        function recuperarPin(json) {
        	var url =  BASE_SF + '/adminpanel/SMSPINCode/'+json;
            return get(url, tokenP, json);
        }
        
        function cambiarFecha(msisdn,imei) {
        	var url =   BASE_SF + '/adminpanel/extendContract/'+msisdn+'/'+imei;
            return put(url, tokenP, msisdn,imei);
        }
        
        function enviarConsentimiento(json) {
        	var url = BASE_SF + '/seguromovil/listCCRequest';
            return post(url, tokenP, json);
        }
        
        function subirConsentimiento(json) {
        	var url = BASE_SF + '/seguromovil/processCCRequest';
            return post(url, tokenP, json);
        }
        
        function nuevaPortabilidad(opcion, tipoLinea, json) {
        	var url = BASE_SF + '/seguromovil/portabilidad/' + opcion + "/" + tipoLinea + "/contract";
            return post(url, tokenP, json);
        }
        
//        function getDevicesMovistar(json) {
//        	var url = BASE_CON + '/terminales/getTerminalesMovistar';
//        	return post(url, tokenP, json);
//		}
        
        function getDevicesMovistar(json) {
        	var url =  BASE_SF + '/adminpanel/getUdevices';
        	return post(url, tokenP, json);
		}
		
		function getDeviceMovistar(id) {
			var url = BASE_CON + '/terminales/getTerminalMovistar/'+id;
			return post(url, tokenP, id);
		}
		
		function cambiarCodprecom(json) {
			var url =  BASE_SF + '/adminpanel/uDevice';
			return patch(url, tokenP, json);
		}
		
		function device(json) {
			var url =  BASE_SF + '/adminpanel/device';
			return post(url, tokenP, json);
		}
        
        function portabilidadStatus() {
        	var url = BASE_SF + '/reports/execute/POR_STATUS';
            return get(url, tokenP)
        }
        
        function condiciones(nuPolicy) {
        	var url = BASE_SF + '/policy/docs/condiciones/' + nuPolicy;
            return getBuffer(url, tokenP)
        }
        
        function getAllUDevicesByMSISDN(json) {
        	var url = BASE_SF + '/movistar/getAllUDevicesByMSISDN';
            return post(url, tokenP, json);
        }
        
        function confirmImei(json, status) {
        	var url = BASE_SF + '/movistar/confirmImei/' + status;
            return post(url, tokenP, json);
        }
        
        function confirmarAltaBloqueo(json, tipo, codPrecom) {
        	var url = BASE_SF + '/adminpanel/col/UP/' + codPrecom + "/" + tipo;
            return post(url, tokenP, json);
        }
        
        function confirmarBajaBloqueo(obj, tipo, codPrecom) {
        	var url = BASE_SF + '/adminpanel/col/OFF/' + codPrecom + "/" + tipo;
            return post(url, tokenP, obj);
        }
        
        function comprobarPo(productOffering, idCapacidad) {
        	var url = BASE_SF + '/movistar/web/rates/' + productOffering + "/" + idCapacidad;
            return get(url, tokenP);
        }
        
        function getDevicesTypes() {
        	var url = BASE_SF + '/options/DEVICE_TYPES';
            return get(url, tokenP)
        }

        function getChangelog() {
        	var url = BASE_SF + '/options/view/changelog';
            return get(url, tokenP);
        }
        
		// Patch
		function patch(url, token, json){
	     	coToken = _.get($rootScope, 'globals.currentUser.coToken');
	        token = _.get($rootScope, 'globals.currentUser.token');
			return $http({
				method: 'PATCH',
				url: url,
				data: json,
				headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
			});
		}
		
		function getBuffer(url, token){
	     	coToken = _.get($rootScope, 'globals.currentUser.coToken');
	        token = _.get($rootScope, 'globals.currentUser.token');
        	return $http({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petici�n.
            });
        } 
		
		// Put
		function put(url, token, json){
	     	coToken = _.get($rootScope, 'globals.currentUser.coToken');
	        token = _.get($rootScope, 'globals.currentUser.token');

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
			return $http({
				method: 'PUT',
				url: url,
				data: json,
				headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
			});
		}
        
        // Get
        function get(url, token){
	     	coToken = _.get($rootScope, 'globals.currentUser.coToken');
	        token = _.get($rootScope, 'globals.currentUser.token');
        	return $http({
                method: 'GET',
                url: url,
                headers: {'Authorization': coToken + ' ' + token}
            });
        }

        // Post
        function post(url, token, json){
	     	coToken = _.get($rootScope, 'globals.currentUser.coToken');
	        token = _.get($rootScope, 'globals.currentUser.token');

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }
    };
    
})();