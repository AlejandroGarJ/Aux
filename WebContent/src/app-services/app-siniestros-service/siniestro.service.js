(function () {
    'use strict';

    angular
        .module('App')
        .factory('SiniestroService', SiniestroService);

    //Es un servicio de busqueda como hacer las consultas.
    SiniestroService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function SiniestroService($http, $rootScope, $window, BASE_CON) {

    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.guardarSiniestro = guardarSiniestro;
        service.getSiniestros = getSiniestros;
        service.getDetalleSiniestro = getDetalleSiniestro;
        service.getDetalleSiniestroFalse = getDetalleSiniestroFalse;
        service.getDetalleGarantiaSiniestro = getDetalleGarantiaSiniestro;
        service.validaSiniestroMascota = validaSiniestroMascota;
        service.subirDocumentacion = subirDocumentacion;
        service.downloadClaimDocs = downloadClaimDocs;
        service.getSiniestrosByFilter = getSiniestrosByFilter;
        service.notifications = notifications;
        service.updateMov = updateMov;
        service.enviarSAP = enviarSAP;
        service.deleteMovEco = deleteMovEco;
        service.guardarDatosSiniestro = guardarDatosSiniestro;
        service.getPoliza = getPoliza;
        
        return service;     
       
        
        //Guardar siniestro
        function guardarSiniestro(json) {
        	var url = BASE_CON + '/siniestros/newClaim';
            return post(url,token,json);
        }
        // function guardarSiniestro(json) {
        // 	var url=BASE_CON+"/siniestros/saveSiniestros";
        //     return get(url,token,json);
        // }

        //Guardar datos del siniestro
        function guardarDatosSiniestro(json) {
        	var url = BASE_CON + '/siniestros/guardaSiniestro';
            return post(url,token,json);
        }

        //Recuperar siniestros
        function getSiniestros(json) {
        	var url=BASE_CON+"/siniestros/getSiniestrosByFilter";
            return post(url,token,json);
        }

        //Detalle Siniestros
        function getDetalleSiniestroFalse(json){
            var url=BASE_CON+"/siniestros/getDetalleSiniestro/false";
            return post(url,token,json);
        }

        //Detalle Siniestros
        function getDetalleSiniestro(json){
            var url=BASE_CON+"/siniestros/getDetalleSiniestro";
            return post(url,token,json);
        }

        //Detalle Garantia Siniestro
        function getDetalleGarantiaSiniestro(json){
            var url=BASE_CON+"/siniestros/getDetalleGarantiaSiniestro";
            return post(url,token,json);
        }

        //Validar siniestro de mascotas
        function validaSiniestroMascota(json){
            var url=BASE_CON+"/siniestros/validaSiniestroMascota";
            return post(url,token,json);
        }

        //Validar siniestro de mascotas
        function validaSiniestroMascota(json){
            var url=BASE_CON+"/siniestros/validaSiniestroMascota";
            return post(url,token,json);
        }

        //Subir documentación
        function subirDocumentacion(json){
            var url=BASE_CON+"/siniestros/subirDocumentacion";
            return post(url,token,json);
        }
        
        //Recoger documentación
        function downloadClaimDocs(idPoliza, idSiniestro){
            var url=BASE_CON+"/siniestros/downloadClaimDocs/" + idPoliza + "/" + idSiniestro;
            return get(url,token);
        }

        //Subir documentación
        function getSiniestrosByFilter(json){
            var url=BASE_CON+"/siniestros/getSiniestrosByFilter";
            return post(url,token,json);
        }

        //Subir documentación
        function notifications(code, json){
            var url=BASE_CON+"/siniestros/notifications/" + code;
            return post(url,token,json);
        }
        
        //Aprobar movimiento
        function updateMov (json){
            var url=BASE_CON+"/siniestros/updateMov";
            return post(url,token,json);
        }
        
        //Enviar a SAP movimiento
        function enviarSAP (json){
            var url=BASE_CON+"/siniestros/enviarSAP";
            return post(url,token,json);
        }
        
        //Eliminar movimientos económicos
        function deleteMovEco (json){
            var url=BASE_CON+"/siniestros/deleteMovEco";
            return post(url,token,json);
        }

        //Buscar póliza
        function getPoliza(nuPoliza) {
            var url=BASE_CON+"/siniestros/getPoliza/"+nuPoliza;
            return get(url,token);
        }
        
        //post
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
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
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
    };
    
})();