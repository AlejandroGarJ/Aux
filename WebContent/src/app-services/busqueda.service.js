(function () {
    'use strict';

    angular
        .module('App')
        .factory('BusquedaService', BusquedaService);

    //Es un servicio de busqueda como hacer las consultas.
    BusquedaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON', 'BASE_SF'];
    function BusquedaService($http, $cookies, $rootScope, $timeout, $window, BASE_CON, BASE_SF) {
        var service = {};
        service.buscar = buscar;
        return service;        
        function buscar(jsonBusqueda, tipo) {
            var respuesta;
            var url;
            var contentype='application/json';
            //Petición de riesgos
            if(tipo=="riesgos"){ 
            	url = BASE_CON+'/polizas/getRiesgosByFilter';
            }
            //Petición al de cliente
            if(tipo=="clientes" || tipo == "rgpd_clientes"){ 
            	url = BASE_CON+'/clientes/getClientes';
            }
            //Petición al de cliente
            if(tipo=="terminales"){ 
            	url = BASE_CON+'/terminales/getTerminales';
            }
            //Petición al de polizas
            else if(tipo=="polizas" || tipo == "rgpd_polizas"){
            	url = BASE_CON+'/polizas/getPolizas/true';
            }
            //Petición al de polizas
            else if(tipo == "firma_digital"){
            	url = BASE_CON+'/polizas/getPolizas/false';
            }
            //Petición de consultagdpr
            if(tipo=="consultagdpr"){ 
                url = BASE_CON+'/clientes/getClientes';
            }
          //Petición al de solicitudes
            else if(tipo=="solicitud"){
              url = BASE_CON+'/solicitudes/getSolicitudesByFilter';
            }
            //Petición al de reclamaciones
            else if(tipo=="reclamaciones"){
            	url = BASE_CON+'/solicitudes/getSolicitudesByFilter';
            }
			else if(tipo=="missolicitud"){
            	url = BASE_CON+'/solicitudes/getMisSolicitudes';
            }
            //Petición al de recibos
            else if(tipo=="recibos" || tipo=="ultRecibos" || tipo == 'recibosDevueltos'){
            	url = BASE_CON+'/recibos/getRecibos';
            }
			//Petición al de remesas           
			else if(tipo=="remesas"){
            	url = BASE_CON+'/recibos/selectRemesas';
            }
			//Petición al de recibos por poliza           
			 else if(tipo=="recibosByPoliza"){
            	url = BASE_CON+'/recibos/getRecibosByPoliza';
            }
            //Petición al de siniestros            
			else if(tipo=="siniestros"){
            	url = BASE_CON+'/siniestros/getSiniestrosByFilter';
            }
            //Petición al de siniestros            
			else if(tipo=="movimientoSiniestros"){
            	url = BASE_CON+'/siniestros/getListMovEco';
				if (jsonBusqueda == null) {
					jsonBusqueda = {};
				}
				jsonBusqueda.IS_SELECTED = true;
            }
            //Petición al de alarmas           
			 else if(tipo=="alarmas"){
            	url = BASE_CON+'/alarmas/getMisAlarmas';
            }
      else if(tipo=="todasalarmas"){
        url = BASE_CON+'/alarmas/getTodasAlarmas';
      }
          //Petición al de garantias por poliza           
			 else if(tipo=="garantiasByPoliza"){
            	url = BASE_CON+'/garantias/getGarantiasByPoliza';
            }
          //Petición al de comisionistas           
			 else if(tipo=="comisionistaByRecibo"){
            	url = BASE_CON+'/comisionistas/getComisionistasByRecibo';
            }
          //Petición al de comisionistas           
			 else if(tipo=="comisionistaByPoliza"){
            	url = BASE_CON+'/comisionistas/getComisionistasByPoliza';
            }
            else if(tipo == "garantiasByProducto"){
            	url = BASE_CON+"/garantias/getGarantiasByProducto";
            }
            else if(tipo == "tarifas"){
            	url = BASE_CON+"/tarifa/getTarifasByFiltro";
            }
            else if(tipo=="comisionistasByPoliza"){
            	url = BASE_CON+'/comisionistas/getComisionistasByPoliza';
            }
          //Petición al de garantias
            else if(tipo == "garantiasByProducto"){
            	url = BASE_CON+'/garantias/getGarantiasByProducto';
            }
          //Petición al de ficheros
            else if(tipo=="ficherosProcesados"){
            	url = BASE_CON+'/ficheros/getFicherosProcesados';
            }
          //Petición al de ficheros generados
            else if(tipo=="ficherosGenerados"){
            	url = BASE_CON+'/ficheros/getFicherosGenerados';   
            }
          //Petición al de error de ficheros
            else if(tipo=="errorFicheros"){
            	url = BASE_CON+'/ficheros/getErroresFicheros';
            }
          //Petición al de procesos
            else if(tipo=="procesos"){
            	url = BASE_CON+'/procesos/getProcesos';
            }
          //Petición al de presupuestos
            else if(tipo=="presupuestos"){
            	url = BASE_CON+'/presupuestos/getPresupuestosByFilter';
            }
            //Petición al de presupuestos información reducida
            else if(tipo=="presupuestosRed"){
            	url = BASE_CON+'/presupuestos/getListPresupuestosByFilter';
            }
          //Petición al de usuarios
            else if(tipo=="usuarios"){
            	url = BASE_CON+'/users/getUsuariosByFilter';
            }
            else if(tipo=="codpostal"){
            	url = BASE_CON+'/codPostal/getCP';
            }
            else if(tipo=="colectivos"){
            	url = BASE_CON+'/colectivos/getListColectivos';
            }
            else if(tipo=="colaboradores"){
            	url = BASE_CON+'';
            }
            else if(tipo=="concesion"){
            	url = BASE_CON+'/concesionCias/getConcesionesCias';
            }
            else if(tipo=="garantias"){
            	url = BASE_CON+'/garantias/getGarantiasByFilter';
            }
            else if(tipo=="garantiasBySiniestro"){
            	url = BASE_CON+'/garantias/getGarantiasBySiniestro';
            }
            //Peticion de ProductosByAseguradora
            else if(tipo=="ProductosByAseguradora"){
            	url = BASE_CON+'/aseguradoras/getProductosByAseguradora';
            }
            //Peticion al de UsuariosWS
            else if(tipo=="userWs"){
            	url = BASE_CON+'/usuariosWS/getUserPermisos';
            }
            else if(tipo=="usuario"){
            	url = BASE_CON+'/usuariosWS/getUser';
            }
            else if(tipo=="simulaciones"){
            	url = BASE_CON+'/simulaciones/getSimulacionesByFilter';
            }
			      else if(tipo=="impuestos"){
            	url = BASE_CON+'/impuestos/getImpuestosByFilter';
            }
			      else if(tipo=="negocios"){
            	url = BASE_CON+'/negocios/getNegocios';
            }
			      else if(tipo=="empresasTipoSimulacion"){
            	url = BASE_CON+'/negocios/getEmpresasTipoSimulacion';
            }
            else if(tipo== "segundoConductor"){
                url = BASE_CON+'/clientes/getConductorAdicional';
            }
            else if(tipo== "propietario"){
                url = BASE_CON+'/clientes/getPropietarioAdicional';
            }
//            var token = JSON.parse($window.sessionStorage.perfil).token;
            var token = _.get($rootScope, 'globals.currentUser.token');
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
            
            token = token || '';

            if (jsonBusqueda != null) {
            	jsonBusqueda.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }

            return $http({
                method: 'POST',
                url: url,
                data: jsonBusqueda,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });

                
            
        }
    };
    
})();