var getSolicitudes = function(response){
	var respuesta;

		//console.log(response.data);
	if(response.data.NUMERO_SOLICITUDES>0){
		$.each(response.data.SOLICITUDES.SOLICITUD, function(index, value) {
            var fechaValidacion = response.data.SOLICITUDES.SOLICITUD[index].FD_VALIDACION;
            var fechaConfirmacion = response.data.SOLICITUDES.SOLICITUD[index].FD_CONFIRMACION;
            var fechaCierre = response.data.SOLICITUDES.SOLICITUD[index].FD_CIERRE;
            var fechaAlta = response.data.SOLICITUDES.SOLICITUD[index].FT_USU_ALTA;
            var fechaMod = response.data.SOLICITUDES.SOLICITUD[index].FT_USU_MOD;

            if(fechaValidacion != null && fechaValidacion != ""){
            	var n2 = response.data.SOLICITUDES.SOLICITUD[index].FD_VALIDACION.indexOf(':');
            	fechaValidacion = fechaValidacion.substring(0, n2 != -1 ? n2-3 : fechaValidacion.length);
            	response.data.SOLICITUDES.SOLICITUD[index].FD_VALIDACION = fechaValidacion;                                    	
            }

            if(fechaConfirmacion != null && fechaConfirmacion != ""){
            	var n2 = response.data.SOLICITUDES.SOLICITUD[index].FD_CONFIRMACION.indexOf(':');
            	fechaConfirmacion = fechaConfirmacion.substring(0, n2 != -1 ? n2-3 : fechaConfirmacion.length);
            	response.data.SOLICITUDES.SOLICITUD[index].FD_CONFIRMACION = fechaConfirmacion;
            }
            
            if(fechaCierre != null && fechaCierre != ""){
            	var n2 = response.data.SOLICITUDES.SOLICITUD[index].FD_CIERRE.indexOf(':');
            	fechaCierre = fechaCierre.substring(0, n2 != -1 ? n2-3 : fechaCierre.length);
            	response.data.SOLICITUDES.SOLICITUD[index].FD_CIERRE = fechaCierre;
            }
            
            if(fechaAlta != null && fechaAlta != ""){
            	var n2 = response.data.SOLICITUDES.SOLICITUD[index].FT_USU_ALTA.indexOf(':');
            	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-3 : fechaAlta.length);
            	response.data.SOLICITUDES.SOLICITUD[index].FT_USU_ALTA = fechaAlta;
            }
            
            if(fechaMod != null && fechaMod != ""){
            	var n2 = response.data.SOLICITUDES.SOLICITUD[index].FT_USU_MOD.indexOf(':');
            	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-3 : fechaMod.length);
            	response.data.SOLICITUDES.SOLICITUD[index].FT_USU_MOD = fechaMod;
            }
        });
		
		respuesta = {
			"list_total": response.data.NUMERO_SOLICITUDES,
			"list_datos" : response.data.SOLICITUDES.SOLICITUD,
			"status" : response.status,
		}
	}
	else{
		respuesta = {
			"status" : response.status
		}	
	}
	
	return respuesta;
	
}
/*(function () {
    'use strict';

    angular
        .module('App')
        .factory('PolizaService', PolizaService);

    //Es un servicio de busqueda como hacer las consultas.
    PolizaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'sharePropertiesService', 'BusquedaService'];
    function PolizaService($http, $cookies, $rootScope, $timeout, sharePropertiesService, BusquedaService) {
        var service = {};
        service.getPolizas = getPolizas;
        return service;        
        function getPolizas(jsonBusqueda) {
        	var respuesta;
            
            //Petición
            //url = 'http://localhost:8080/IntermediacionWeb/rest/Solicitudes/getSolicitudes';
            var token = _.get($rootScope, 'globals.currentUser.token');
            
            token = token || '';
            
           BusquedaService.buscar(jsonBusqueda, 'polizas')
            .then(function successCallback(response){
            	if(response.status === 200){
					//console.log(response.data);
					if(response.data.NUMERO_POLIZAS>0){
						$.each(response.data.POLIZAS.POLIZA, function(index, value) {
                            var fechaEfecto = response.data.POLIZAS.POLIZA[index].FD_INICIO;
                            var fechaVencimiento = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO;
                            var fechaEmision = response.data.POLIZAS.POLIZA[index].FD_EMISION;
                            var fechaAlta = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA;
                            var fechaMod = response.data.POLIZAS.POLIZA[index].FT_USU_MOD;

                            if(fechaEfecto != null && fechaEfecto != ""){
                            	var n2 = response.data.POLIZAS.POLIZA[index].FD_INICIO.indexOf(':');
                            	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-2 : fechaEfecto.length);
                            	response.data.POLIZAS.POLIZA[index].FD_INICIO = fechaEfecto;                                    	
                            }

                            if(fechaVencimiento != null && fechaVencimiento != ""){
                            	var n2 = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO.indexOf(':');
                            	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-2 : fechaVencimiento.length);
                            	response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO = fechaVencimiento;
                            }
                            
                            if(fechaEmision != null && fechaEmision != ""){
                            	var n2 = response.data.POLIZAS.POLIZA[index].FD_EMISION.indexOf(':');
                            	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-2 : fechaEmision.length);
                            	response.data.POLIZAS.POLIZA[index].FD_EMISION = fechaEmision;
                            }
                            
                            if(fechaAlta != null && fechaAlta != ""){
                            	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA.indexOf(':');
                            	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-2 : fechaAlta.length);
                            	response.data.POLIZAS.POLIZA[index].FT_USU_ALTA = fechaAlta;
                            }
                            
                            if(fechaMod != null && fechaMod != ""){
                            	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_MOD.indexOf(':');
                            	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-2 : fechaMod.length);
                            	response.data.POLIZAS.POLIZA[index].FT_USU_MOD = fechaMod;
                            }
                        });
						if(response.data.NUMERO_POLIZAS == 1){
							var fechaEfecto = response.data.POLIZAS.POLIZA.FD_INICIO;
                            var fechaVencimiento = response.data.POLIZAS.POLIZA.FD_VENCIMIENTO;
                            var fechaEmision = response.data.POLIZAS.POLIZA.FD_EMISION;
                            var fechaAlta = response.data.POLIZAS.POLIZA.FT_USU_ALTA;
                            var fechaMod = response.data.POLIZAS.POLIZA.FT_USU_MOD;

                            if(fechaEfecto != null && fechaEfecto != ""){
                            	var n2 = response.data.POLIZAS.POLIZA.FD_INICIO.indexOf(':');
                            	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-2 : fechaEfecto.length);
                            	response.data.POLIZAS.POLIZA.FD_INICIO = fechaEfecto;                                    	
                            }

                            if(fechaVencimiento != null && fechaVencimiento != ""){
                            	var n2 = response.data.POLIZAS.POLIZA.FD_VENCIMIENTO.indexOf(':');
                            	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-2 : fechaVencimiento.length);
                            	response.data.POLIZAS.POLIZA.FD_VENCIMIENTO = fechaVencimiento;
                            }
                            
                            if(fechaEmision != null && fechaEmision != ""){
                            	var n2 = response.data.POLIZAS.POLIZA.FD_EMISION.indexOf(':');
                            	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-2 : fechaEmision.length);
                            	response.data.POLIZAS.POLIZA.FD_EMISION = fechaEmision;
                            }
                            
                            if(fechaAlta != null && fechaAlta != ""){
                            	var n2 = response.data.POLIZAS.POLIZA.FT_USU_ALTA.indexOf(':');
                            	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-2 : fechaAlta.length);
                            	response.data.POLIZAS.POLIZA.FT_USU_ALTA = fechaAlta;
                            }
                            
                            if(fechaMod != null && fechaMod != ""){
                            	var n2 = response.data.POLIZAS.POLIZA.FT_USU_MOD.indexOf(':');
                            	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-2 : fechaMod.length);
                            	response.data.POLIZAS.POLIZA.FT_USU_MOD = fechaMod;
                            }
						}
					}
					
					respuesta = {
							"respuesta" : response.data,
							"status" : response.status,
					}
					
					sharePropertiesService.set('respuesta', respuesta);
            	}
            },function errorCallback(response){
            	respuesta = {
						"status" : response.status
				}
            	
            	sharePropertiesService.set('respuesta', respuesta);
            });
           
                        
        }
    };
    
})();*/