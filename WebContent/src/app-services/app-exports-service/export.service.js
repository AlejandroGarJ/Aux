(function () {
    'use strict';

    angular
        .module('App')
        .factory('ExportService', ExportService);

    //Es un servicio de busqueda como hacer las consultas.
    ExportService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function ExportService($http, $rootScope, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.exportarAlarmas = exportarAlarmas;
        service.exportarAlarmasPendientes = exportarAlarmasPendientes;
        service.exportarClientes = exportarClientes;
        service.exportarPolizas = exportarPolizas;
        service.exportarPresupuestos = exportarPresupuestos;
        service.exportarRecibos = exportarRecibos;
        service.exportarRemesas = exportarRemesas;
        service.exportarRenting = exportarRenting;
        service.exportarRiesgos = exportarRiesgos;
        service.exportarSiniestros = exportarSiniestros;
        service.exportarSolicitudes = exportarSolicitudes;
        service.exportarSolicitudesPendientes = exportarSolicitudesPendientes;
        service.exportarInformes = exportarInformes;
        service.exportBudgetReport = exportBudgetReport;
        service.exportarDispositivos = exportarDispositivos;
        service.exportarInformesPDF = exportarInformesPDF;
        service.exportarErrores = exportarErrores;
        service.exportarProcesados = exportarProcesados;
        service.downloadFile = downloadFile;
        service.reports = reports;
        service.getFicherosReport = getFicherosReport;
        service.guardaFechaLiq = guardaFechaLiq;
        service.notificacionInformeLiquidacion = notificacionInformeLiquidacion;
        service.reportHomeBroker = reportHomeBroker;
        
        return service;
       
        
        //
        function getFicherosReport(tipo) {
        	var url=BASE_CON+"/reports/getFicherosReport/" + tipo;
            return get2(url,token);
        }
        function exportarAlarmas(json) {
        	var url=BASE_CON+"/exports/exportarAlarmas";
            return post(url,token,json);
        }
        function exportarAlarmasPendientes(json) {
        	var url=BASE_CON+"/exports/exportarAlarmasPendientes";
            return post(url,token,json);
        }
        function exportarClientes(json) {
        	var url=BASE_CON+"/exports/exportarClientes";
            return post(url,token,json);
        }
        function exportarPolizas(json) {
        	var url=BASE_CON+"/exports/exportarPolizas";
            return post(url,token,json);
        }
        function exportarPresupuestos(json) {
        	var url=BASE_CON+"/exports/exportarPresupuestos";
            return post(url,token,json);
        }
        function exportarRecibos(json) {
        	var url=BASE_CON+"/exports/exportarRecibos";
            return post(url,token,json);
        }
        function exportarRemesas(json) {
        	var url=BASE_CON+"/exports/exportarRemesas";
            return post(url,token,json);
        }
        function exportarRenting(json) {
        	var url=BASE_CON+"/exports/exportarRenting";
            return post(url,token,json);
        }
        function exportarRiesgos(json) {
        	var url=BASE_CON+"/exports/exportarRiesgos";
            return post(url,token,json);
        }
        function exportarSiniestros(json) {
        	var url=BASE_CON+"/exports/exportarSiniestros";
            return post(url,token,json);
        }
        function exportarSolicitudes(json) {
        	var url=BASE_CON+"/exports/exportarSolicitudes";
            return post(url,token,json);
        }
        function exportarSolicitudesPendientes(json) {
        	var url=BASE_CON+"/exports/exportarSolicitudesPendientes";
            return post(url,token,json);
        }

        function exportarInformes(json) {
            var url = BASE_CON + '/exports/exportarInformes';
            return post(url, token, json);
        }

        function exportBudgetReport(json, type) {
            var url = `${BASE_CON}/exports/exportarInformePresupuestosRealizados`;
            return post2(url, token, json);
        }

        function exportarInformesPDF(json) {
        	var url = BASE_CON + '/exports/exportarInformesPDF';
        	return post(url, token, json);
        }
        function exportarErrores(json) {
        	var url = BASE_CON + '/exports/exportarErrores';
        	return post(url, token, json);
        }
        function exportarProcesados(json) {
        	var url = BASE_CON + '/exports/exportarProcesados';
        	return post(url, token, json);
        }
        
        function exportarDispositivos(json) {
        	var url = BASE_CON + '/exports/exportarDispositivos';
        	return post(url, token, json);
        }

        function downloadFile (id) {
        	var url=BASE_CON+"/ficheros/download/" + id;
            return get(url,token);
        }

        function reports(json, tipo) {
        	var url = BASE_CON + '/reports/informe/' + tipo;
        	return post2(url, token, json);
        }

        function guardaFechaLiq(json) {
        	var url = BASE_CON + '/reports/guardaFechaLiq';
        	return post2(url, token, json);
        }

        function notificacionInformeLiquidacion(json) {
            var url = BASE_CON + '/reports/informe/notificacionInformeLiquidacion';
            return post(url, token, json);
        }

        function reportHomeBroker(json) {
            var url = BASE_CON + '/reports/informes/liquidacionMediadorHogar';
            return post2(url, token, json);
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
                responseType: 'arraybuffer',
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
        
        //Post
          function post2(url, token, json){
          	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
          	token = _.get($rootScope, 'globals.currentUser.token');
          	token = token || '';
            
          	return $http({
                  method: 'POST',
                  url: url,
                  data: json,
                  headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
              });
          }
        
    };
    
})();