(function(ng) {	


	//Crear componente de busqeuda
    var filtrosComponent = {
    		controllerAs: '$ctrl',
    		template:'<filtros-polizas-tiper-app ng-if="$ctrl.loadTemplate() == \'polizas_tiper\'"></filtros-polizas-tiper-app>'+
			'<filtros-polizas-app ng-if="$ctrl.loadTemplate() == \'polizas\'"></filtros-polizas-app>'+
    		'<filtros-polizas-rgpd-app ng-if="$ctrl.loadTemplate() == \'rgpd_polizas\'"></filtros-polizas-rgpd-app>'+
    		'<filtros-clientes-rgpd-app ng-if="$ctrl.loadTemplate() == \'rgpd_clientes\'"></filtros-clientes-rgpd-app>'+
    		'<filtros-clientes-app ng-if="$ctrl.loadTemplate() == \'clientes\'"></filtros-clientes-app>'+
            '<filtros-consultagdpr-app ng-if="$ctrl.loadTemplate() == \'consultagdpr\'"></filtros-consultagdpr-app>'+
    		'<filtros-recibos-app ng-if="$ctrl.loadTemplate() == \'recibos\'"></filtros-recibos-app>'+
    		'<filtros-recibos-devueltos-app ng-if="$ctrl.loadTemplate() == \'recibosDevueltos\'"></filtros-recibos-devueltos-app>'+
    		'<filtros-solicitud-app ng-if="$ctrl.loadTemplate() == \'solicitudes\'"></filtros-solicitud-app>'+
    		'<filtros-reclamaciones-app ng-if="$ctrl.loadTemplate() == \'reclamaciones\'"></filtros-reclamaciones-app>'+
    		'<filtros-renting-app ng-if="$ctrl.loadTemplate() == \'renting\'"></filtros-renting-app>'+
    		'<filtros-remesas-app ng-if="$ctrl.loadTemplate() == \'remesas\'"></filtros-remesas-app>'+
    		'<filtros-ultrecibos-app ng-if="$ctrl.loadTemplate() == \'ultRecibos\'"></filtros-ultrecibos-app>'+
    		'<filtros-siniestro-app ng-if="$ctrl.loadTemplate() == \'siniestros\'"></filtros-siniestro-app>'+
    		'<filtros-movimientos-economicos-app ng-if="$ctrl.loadTemplate() == \'movimientos_economicos\'"></filtros-movimientos-economicos-app>'+
    		'<filtros-presupuesto-app ng-if="$ctrl.loadTemplate() == \'presupuestos\'"></filtros-presupuesto-app>'+
    		'<filtros-alarmas-app ng-if="$ctrl.loadTemplate() == \'alarmas\'"></filtros-alarmas-app>'+
    		'<filtros-errors-files-app ng-if="$ctrl.loadTemplate() == \'errorsFiles\'"></filtros-errors-files-app>'+
    		'<filtros-procesados-app ng-if="$ctrl.loadTemplate() == \'procesados\'"></filtros-procesados-app>'+
    		'<filtros-generados-app ng-if="$ctrl.loadTemplate() == \'generados\'"></filtros-generados-app>'+
			'<filtros-reaseguradoras-app ng-if="$ctrl.loadTemplate() == \'reaseguradoras\'"></filtros-reaseguradoras-app>'+
    		'<filtros-aseguradoras-app ng-if="$ctrl.loadTemplate() == \'aseguradoras\'"></filtros-aseguradoras-app>'+
    		'<filtros-campana-app ng-if="$ctrl.loadTemplate() == \'campana\'"></filtros-campana-app>'+
    		'<filtros-colaboradores-app ng-if="$ctrl.loadTemplate() == \'colaboradores\'"></filtros-colaboradores-app>'+
    		'<filtros-concesiones-app ng-if="$ctrl.loadTemplate() == \'concesiones\'"></filtros-concesiones-app>'+
    		'<filtros-conversor-app ng-if="$ctrl.loadTemplate() == \'conversor\'"></filtros-conversor-app>'+
    		'<filtros-cp-app ng-if="$ctrl.loadTemplate() == \'cp\'"></filtros-cp-app>'+
    		'<filtros-datos-aseguradora-app ng-if="$ctrl.loadTemplate() == \'datosAseguradora\'"></filtros-datos-aseguradora-app>'+
    		'<filtros-garantias-app ng-if="$ctrl.loadTemplate() == \'garantias\'"></filtros-garantias-app>'+
    		'<filtros-maestros-app ng-if="$ctrl.loadTemplate() == \'maestros\'"></filtros-maestros-app>'+
    		'<filtros-tipos-app ng-if="$ctrl.loadTemplate() == \'tipos\'"></filtros-tipos-app>'+
    		'<filtros-usuarios-app ng-if="$ctrl.loadTemplate() == \'usuarios\'"></filtros-usuarios-app>'+
    		'<filtros-tarifas-app ng-if="$ctrl.loadTemplate() == \'tarifas\'"></filtros-tarifas-app>'+
    		'<filtros-distribucion-app ng-if="$ctrl.loadTemplate() == \'geografica\'"></filtros-distribucion-app>'+
    		'<filtros-backup-app ng-if="$ctrl.loadTemplate() == \'backup\'"></filtros-backup-app>'+
    		'<filtros-baja-app ng-if="$ctrl.loadTemplate() == \'bajas_vehiculos\'"></filtros-baja-app>'+
			'<filtros-portabilidad-app ng-if="$ctrl.loadTemplate() == \'portabilidad\'"></filtros-portabilidad-app>'+
			'<filtros-fusion-app ng-if="$ctrl.loadTemplate() == \'confirmacion_rtr\'"></filtros-fusion-app>'+
			'<filtros-programas-app ng-if="$ctrl.loadTemplate() == \'programas\'"></filtros-programas-app>'+
			'<filtros-avisos-app ng-if="$ctrl.loadTemplate() == \'avisos\'"></filtros-avisos-app>'+
//			'<filtros-dispositivos-moviles-app ng-if="$ctrl.loadTemplate() == \'moviles\'"></filtros-dispositivos-moviles-app>'+
			'<filtros-proveedores-app ng-if="$ctrl.loadTemplate() == \'proveedores_list\'"></filtros-proveedores-app>' +
			'<filtros-enviomovistar-app ng-if="$ctrl.loadTemplate() == \'enviosMovistar\'"></filtros-enviomovistar-app>'+
			'<filtros-firma-digital-app ng-if="$ctrl.loadTemplate() == \'firma_digital\'"></filtros-firma-digital-app>',
    		$inject:['$location', '$window', '$mdToast', 'BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^sdApp',
            	busqueda:'^busquedaApp'
            },
            bindings:{
            	tipo:'<'
            }
    }
 
    filtrosComponent.controller = function filtrosComponentController($location, $window, $mdToast,BASE_SRC,$mdDialog){
    	var vm=this;
    	var url=window.location;
    	vm.calendar = {};

    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		
    	}
    	
    	//Preparar los datos necesarios
    	var perfil=JSON.parse($window.sessionStorage.perfil);
    	vm.perfil = perfil.usuario;
		var colectivos=perfil.colectivos;
		if(colectivos!=undefined){
			vm.colectivos=[];
			for(var i=0;i<colectivos.length;i++){
				vm.colectivos[i]={
					"id":colectivos[i].ID_TIPO_POLIZA,
					"text":colectivos[i].DS_TIPO_POLIZA
				};
			}
		}
		
    	
    	//var stop=0;
    	//while(stop<3){
		this.$onChanges = function(){
			var perfil = this.parent.getPerfil();

			if(perfil == undefined || perfil == 'undefined') {
				perfil = JSON.parse($window.sessionStorage.perfil);
			} else {
				perfil = JSON.parse(perfil);
	    		var colectivos = perfil.colectivos;
	    		if(colectivos != undefined) {
					vm.colectivos = [];
					for(var i = 0; i < colectivos.length; i++) {
						vm.colectivos[i] = {
							"id":colectivos[i].ID_TIPO_POLIZA,
							"text":colectivos[i].DS_TIPO_POLIZA
						};
					}
				}	
			}
    	}
    	
    	//Cargar la plantilla de busqueda
		this.loadTemplate = function(){
			if(/campaign/.test(url))
				return "campana";
            if(/consulta_gdpr/.test(url))
                return "consultagdpr";
            if(/gestion_programas/.test(url))
                return "programas";
            if(/conf_avisos/.test(url))
                return "avisos";
    		else if(/recibos_movimientos/.test(url))
    			return "recibos";
    		else if(/remesas/.test(url))
    			return "remesas";
    		else if(/renting/.test(url))
    			return "renting";
    		else if(/codpostales/.test(url))
    			return "cp";
    		else if(/solicitudes/.test(url))
    			return "solicitudes";
            else if(/reclamaciones/.test(url))
                return "reclamaciones";
    		else if(/presupuestos/.test(url))
    			return "presupuestos";
    		else if(/alarmas/.test(url))
    			return "alarmas";
    		else if(/errores_list/.test(url))
    			return "errorsFiles";
    		else if(/procesados/.test(url))
    			return "procesados";
    		else if(/generados/.test(url))
    			return "generados";
			else if(/reaseguradoras/.test(url))
    			return "reaseguradoras";
    		else if(/aseguradoras/.test(url))
    			return "aseguradoras";
    		else if(/comisionistas/.test(url))
    			return "colaboradores";
    		else if(/concesion/.test(url))
    			return "concesiones";
    		else if(/conversor/.test(url))
    			return "conversor";
    		else if(/garantias/.test(url))
    			return "garantias";
    		else if(/back_up/.test(url))
                return "backup";
    		else if(/usuarios/.test(url))
    			return "usuarios";
    		else if(/catalogo/.test(url) || /colectivos/.test(url) || /formas_pago/.test(url) || /medio_pago/.test(url) || /tipos/.test(url) || /tipos_documento/.test(url) || /tipos_sexo/.test(url) || /situacion/.test(url) || /estados/.test(url) || /anulacion/.test(url) || /sujetos/.test(url))
    			return "maestros";
    		else if(/polizas_tiper/.test(url))
    			return "polizas_tiper";
    		else if(/rgpd_polizas/.test(url))
    			return "rgpd_polizas";
    		else if(/polizas/.test(url))
    			return "polizas";
    		else if(/rgpd_clientes/.test(url))
    			return "rgpd_clientes";
    		else if(/clientes/.test(url))
    			return "clientes";
    		else if(/recibos_list/.test(url))
    			return "ultRecibos";
    		else if(/recibos_devueltos_list/.test(url))
    			return "recibosDevueltos";
    		else if(/siniestros/.test(url))
    			return "siniestros";
    		else if(/movimientos_economicos/.test(url))
    			return "movimientos_economicos";
    		else if(/datosaseguradora/.test(url))
    			return "datosAseguradora";
    		else if(/tarifas/.test(url))
    			return "tarifas";
    		else if(/informes_geo/.test(url))
    			return "geografica";
    		else if(/bajas_vehiculos/.test(url))
				return "bajas_vehiculos";
			else if(/gestion_terminales/.test(url))
    			return "moviles";
			else if(/envios_movistar_main/.test(url))
    			return "enviosMovistar";
			else if(/portabilidad/.test(url))
    			return "portabilidad";
			else if(/confirmacion_rtr/.test(url))
    			return "confirmacion_rtr";
			else if(/proveedores_list/.test(url))
    			return "proveedores_list";
			else if(/firma_digital/.test(url))
    			return "firma_digital";
		}
		
		//Compartir esa función en todas las busquedas
		vm.verDetalle = function(fila, numDetalles){
			return cargarDetalle(fila);
		}
		
		
		//Cambiar formato de la fecha
		vm.dateFormat = function dateFormat(fecha){
	    	//var fecha2 = Date(fecha);
	    	var anio = fecha.getFullYear();
	    	
	    	var mes = fecha.getMonth()+1;
	    	var mes = mes.toString().length == 1 ? "0"+mes.toString() : mes;
	    	
	    	var diaString = fecha.getDate().toString();
	    	var dia = diaString.length == 1 ? "0"+diaString : diaString;
	    	
	    	var fechaFormat = anio+"-"+mes+"-"+dia;
	    	return fechaFormat;
	    }
		
		//Limpiar formularios
		vm.removeForm = function(form){
			angular.forEach(form, function(value,key){
//				form[key].value = undefined;
				if (key == 'OCLIENTE') {
					form[key].NU_DOCUMENTO.value = undefined;
				} else if (key == 'OPOLIZA') {
					if (form[key].NU_POLIZA != null) {
					    form[key].NU_POLIZA.value = undefined;
					}
					if (form[key].LST_PRODUCTOS != null) {
					    form[key].LST_PRODUCTOS.value = undefined;
					}
					if (form[key].LST_ID_COMP_RAMO_PROD != null) {
					    form[key].LST_ID_COMP_RAMO_PROD.value = undefined;
					}
					if (form[key].LST_ID_TIPO_POLIZA != null) {
					    form[key].LST_ID_TIPO_POLIZA.value = undefined;
					}
					if (form[key].LST_SITUAPOLIZA != null) {
					    form[key].LST_SITUAPOLIZA.value = undefined;
					}
				} else {
					form[key].value = undefined;
				}
			});
			return form;
		}
		
		
		//Creamos JSON
    	function rellenarJSON(form, sinFiltro){
    		vm.isError = false;
    		var breakForEach = false;
    		var json = {};
    		
    		if(sinFiltro != true){
    			//Comprobar que no sólo hay campos vacíos
        		angular.forEach(form, function(value, key) {
        			if(key == 'OCLIENTE' || key == 'OPOLIZA') {
						for (var campo in value) {
							if(value[campo].value == "") {
								delete form[key][campo];
							}
						}
					} else if (key == 'LST_MOVS_ECONOMICOS') {
						if(value != null && value.length > 0) {
							if(value[0] != null) {
								for (var campo in value[0]) {
									if(value[0][campo].value == "") {
										delete form[key][campo];
									}
								}
							}
						}
					}
        			
        			if(breakForEach == false) {
						if(form[key] != undefined) {
							if(form[key].value == "") {
								vm.isError = true;
							} else {
								vm.isError = false;
								breakForEach = true;
							}
						}
        			}
    			});	
    		}
    		
    		if(form != undefined && vm.isError != true && Object.keys(form).length > 0){
    			angular.forEach(form, function(value, key) {
    				
                    if(/reclamaciones/.test(url)){
                        json.OTIPO_SOLICITUD = {"ID_TIPO_SOLICITUD": 34};
                    }
                    if(/recibos_devueltos/.test(url)){
                    	json.IN_DEVUELTO = true;
                    }
                    if(/firma_digital/.test(url)){
                    	if(key == 'documento'){
                    		json.LST_ASEGURADOS = [];
                    		json.LST_ASEGURADOS[0] = {'NU_DOCUMENTO' : value.value};
                    		
                    	}else if(key == 'telefono'){
                    		json.LST_ASEGURADOS = [];
                    		json.LST_ASEGURADOS[0] = {'NU_TELEFONO1' : value.value};
                    	}
                    }
    				if (key == 'OCLIENTE') {
						if(value.NU_DOCUMENTO)
    						json.OCLIENTE = {'NU_DOCUMENTO' : value.NU_DOCUMENTO.value};
					} else if (key == 'OPOLIZA') {
						if (json.OPOLIZA == null) {
							json.OPOLIZA = {};
						}
						
						if (value.NU_POLIZA != null) {
						    json.OPOLIZA.NU_POLIZA = value.NU_POLIZA.value;
						}

						if (value.LST_PRODUCTOS != null) {
						    json.OPOLIZA.LST_PRODUCTOS = value.LST_PRODUCTOS.value;
						}

						if (value.LST_ID_COMP_RAMO_PROD != null) {
						    json.OPOLIZA.LST_ID_COMP_RAMO_PROD = value.LST_ID_COMP_RAMO_PROD.value;
						}

						if (value.LST_ID_TIPO_POLIZA != null) {
						    json.OPOLIZA.LST_ID_TIPO_POLIZA = value.LST_ID_TIPO_POLIZA.value;
						}

						if (value.LST_SITUAPOLIZA != null) {
						    json.OPOLIZA.LST_SITUAPOLIZA = value.LST_SITUAPOLIZA.value;
						}

						if (value.ID_SITUAPOLIZA != null) {
						    json.OPOLIZA.ID_SITUAPOLIZA = value.ID_SITUAPOLIZA.value;
						}
						
					} else if (key == 'ID_TIPO_SOLICITUD') {
    					json.OTIPO_SOLICITUD = {'ID_TIPO_SOLICITUD' : value.value};
                    } else if (key == 'ID_SITUACION_SOLICITUD') {
                        json.ID_SITUACION_SOLICITUD = value.value;
                    } else if (key == 'ID_SITUACION_CLIENTE') {
                        json.ID_SITUACION_CLIENTE = value.value;
                    } else if (key == 'OTIPO_SOLICITUD') { 
    					json.OTIPO_SOLICITUD = {'ID_TIPO_SOLICITUD' : value.ID_TIPO_SOLICITUD.value};
                    } else if (key == 'NO_USU_RECEPTOR') {
                        json.NO_USU_RECEPTOR = value.value;
                    } else if (key == 'ID_TIPO') {
                        json.ID_TIPO =  value.value;
                    } else if (key == 'IN_BAJA_REG') {
                        json.IN_BAJA_REG =  value;
                        
    				} else if (key == "LST_MOVS_ECONOMICOS") {
						if (value[0] != null) {
							json.LST_MOVS_ECONOMICOS = [];
							json.LST_MOVS_ECONOMICOS[0] = JSON.parse(JSON.stringify(value[0]));
							for (var campo in json.LST_MOVS_ECONOMICOS[0]) {
								if (json.LST_MOVS_ECONOMICOS[0][campo].value != null && (campo == "FT_MOV_FROM" || campo == "FT_MOV_TO" || campo == "FT_SITUACION_FROM" || campo == "FT_SITUACION_TO")) {
									json.LST_MOVS_ECONOMICOS[0][campo] = dateFormat(new Date(json.LST_MOVS_ECONOMICOS[0][campo].value));
								} else if (json.LST_MOVS_ECONOMICOS[0][campo].value != null) {
									json.LST_MOVS_ECONOMICOS[0][campo] = json.LST_MOVS_ECONOMICOS[0][campo].value;
								} else {
									delete json.LST_MOVS_ECONOMICOS[0][campo];
								}
							}
						}
    				} else if (/solicitudes_list/.test(url) && key == 'ID_PRESUPUESTO') {
                         json.OPRESUPUESTO = {
							"ID_PRESUPUESTO": value.value
						 }
    				} else if (key == 'REFERENCIA_ASEGURADORA') {
                        json.ALTA_POLIZA = {
							"REFERENCIA_ASEGURADORA": value.value
						 }
					} else {
    					if(value.value === "" || value.value===null){
            				delete form[key];
    					}

    						else{
	    					if(value.value instanceof Date){
	    						json[key]=dateFormat(value.value);
	    						
	    						//Comprueba las fechas que no sean al revés
	    						angular.forEach(form, function(value2, key2){
	    							if(!vm.isError){
	    								vm.isError = validFechas(key2, value2.value, key, value.value);
	    							}
	    						});
	    					}
	    					else if(typeof(value.value) == 'object'){
	    						/*json[key]=[]
	    						for(var i=0;i<value.value.length;i++){
	    							json[key][i]=value.value[i].id;
	    						}
	    						json[key]=json[key].toString();*/
	    						
	    						if(/remesas/.test(url) && key == "ID_TIPO_POLIZA"){
	    							json.OPOLIZA = {
	    									"ID_TIPO_POLIZA":json[key].toString()
	    							}
	    						}
	    						else{
	    							json[key]=value.value;
	    						}
	    					}
	    					else if(key == "NU_DOCUMENTO"){
	    						if(/polizas/.test(url)){
		    						json.LST_ASEGURADOS = [
		    							{
		    								"NU_DOCUMENTO":value.value
		    							}
		    						];
								}
								else if(/recibos/.test(url)){
									json.OPAGADOR = 
										{
											"NU_DOCUMENTO":value.value
										}
									
								}
	    						else if(/solicitudes/.test(url) || /reclamaciones/.test(url)){
	    							json.OCLIENTE = 
	    							{
	    								"NU_DOCUMENTO":value.value
	    							};
								}
	    						else if(/siniestros/.test(url)){
	    							if (json.OPOLIZA == null) {
	    								json.OPOLIZA = {};
	    							}
	    							json.OPOLIZA.LST_ASEGURADOS = [
	    								{ "NU_DOCUMENTO":value.value }
	    							]
								}
	    						else{
	    							json.NU_DOCUMENTO = value.value
	    						}
							}
							else if(key == "NO_NOMBRE_COMPLETO"){
	    						if(/siniestros/.test(url) ){
	    							if (json.OPOLIZA == null) {
	    								json.OPOLIZA = {};
	    							}
	    							json.OPOLIZA.LST_ASEGURADOS = [
	    								{ "NO_NOMBRE_COMPLETO":value.value }
	    							]
								}
	    						else{
	    							json.NO_NOMBRE_COMPLETO = value.value
	    						}
							}				
	    					else if(/recibos/.test(url) && key=="NU_POLIZA" || /siniestros/.test(url) && key=="NU_POLIZA" || /solicitudes/.test(url) && key=="NU_POLIZA" || /reclamaciones/.test(url) && key=="NU_POLIZA"){
	    						if (json.OPOLIZA == null) {
	    							json.OPOLIZA = {};
	    						}
	    						json.OPOLIZA.NU_POLIZA = value.value;
	    					} else if(/recibos/.test(url) && key == 'ID_TIPO_POLIZA' || /recibos_movimientos/.test(url) && key == 'ID_TIPO_POLIZA' || /siniestros/.test(url) && key=="ID_TIPO_POLIZA"){
	    						if (json.OPOLIZA == null) {
	    							json.OPOLIZA = {};
	    						}
	    						json.OPOLIZA.ID_TIPO_POLIZA = value.value;
	    					} else if(/siniestros/.test(url) && key=="ID_RAMO"){
	    						if (json.OPOLIZA == null) {
	    							json.OPOLIZA = {};
	    						}
	    						json.OPOLIZA.ID_RAMO = value.value;
							} else if(/siniestros/.test(url) && key=="ID_COMPANIA"){
								if (json.OPOLIZA == null) {
	    							json.OPOLIZA = {};
	    						}
								json.OPOLIZA.ID_COMPANIA = value.value;
                            } else if(/reclamaciones/.test(url) && key=="ID_MOTIVO"){
                                json.ID_MOTIVO = value.value;
							// SE ANULA LA BUSQUEDA DE CLIENTES POR Partner	
							} else if(/clientes/.test(url) && key=="ID_TIPOEMPLEADO"){
								
							} else if(/firma_digital/.test(url) && (key == 'documento' || key == 'telefono')){
		                  		delete json[key];
		                  		
							}else{
	    						json[key]=value.value;
	    					}					
	    				}
    				}
    			});
    		}
    		else{
    			vm.isError = true;
    		}
    		
    		return json;
    		
    	}
    	
    	vm.filtrar = function(form, tipo, sinFiltro){
    		var json = rellenarJSON(form, sinFiltro);
            if(!vm.isError || tipo == 'usuarios'){
    			vm.busqueda.buscar(json, tipo);
    		}
    		return vm.isError;
    	}
    	
    	
    	//Validaciones de fechas
		function validFechas(fdFrom, valueFrom, fdTo, valueTo){
			var patt = new RegExp("_TO");
			if(patt.test(fdTo)){
				fdFrom = fdFrom.replace("_FROM", "");
				fdTo = fdTo.replace("_TO", "");
				//dateFrom = new Date(valueFrom);
				//dateTo = new Date(valueTo);
				/*dateFrom = dateFrom.getTime();
				dateTo = dateTo.getTime();*/
				if(fdFrom == fdTo){
					if(valueTo < valueFrom){
						return true;
					}
				}
				return false;
			}
		}
		
		//Cambiar formato de la fecha
		function dateFormat(fecha){
	    	//var fecha2 = Date(fecha);
	    	var anio = fecha.getFullYear();
	    	
	    	var mes = fecha.getMonth()+1;
	    	var mes = mes.toString().length == 1 ? "0"+mes.toString() : mes;
	    	
	    	var diaString = fecha.getDate().toString();
	    	var dia = diaString.length == 1 ? "0"+diaString : diaString;
	    	
	    	var fechaFormat = anio+"-"+mes+"-"+dia;
	    	return fechaFormat;
	    }
	    
	    //Salir del logout
        vm.logout = function () {
            vm.parent.logout();
        }
	    
        vm.querySearch = function (query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
        }
        
        vm.getDsColectivo = function (idColectivo) {
        	var listColectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
        	var dsColectivo = "";
        	
        	if (listColectivos != null && listColectivos.length > 0) {
        		var colectivo = listColectivos.find(x => x.ID_TIPO_POLIZA == idColectivo);
        		
        		if (colectivo != null) {
        			dsColectivo = colectivo.DS_TIPO_POLIZA;
        		}
        	}
        	
        	return dsColectivo;
        }
        
        vm.getColectivoPadre = function (idColectivo) {
        	var listColectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
        	var padreColectivo = {};
        	
        	if (listColectivos != null && listColectivos.length > 0) {
        		var padreColectivo = listColectivos.find(x => x.ID_TIPO_POLIZA == idColectivo);
        	}
        	
        	return padreColectivo;
        }
        
        vm.getEstructuraColectivo = function () {
            var listaColectivo = JSON.parse(window.sessionStorage.perfil).colectivos;
            
            //Recorremos lista de colectivos para añadir los colectivos padre
            for (var i = 0; i < listaColectivo.length; i++) {
                var colectivo = listaColectivo[i];
                
                //Si en la lista aún no está añadido el padre
                if (colectivo.ID_TIPOCOLECTIVO_PADRE != null && listaColectivo.findIndex(x => x.ID_TIPO_POLIZA == colectivo.ID_TIPOCOLECTIVO_PADRE) == -1) {
                    listaColectivo.push({
                        ID_TIPO_POLIZA: colectivo.ID_TIPOCOLECTIVO_PADRE,
                        DS_TIPO_POLIZA: colectivo.DS_TIPO_POLIZA_PADRE,
                        IS_PADRE: true
                    });
                } 
                //Si no tiene padre, le ponemos como si fuese padre
                else if (colectivo.ID_TIPOCOLECTIVO_PADRE == null) {
                    listaColectivo[i].IS_PADRE = true;
                }
            }
            
            listaColectivo.sort(function (a, b) {
              if (a.ID_TIPO_POLIZA > b.ID_TIPO_POLIZA) {
                return 1;
              }
              if (a.ID_TIPO_POLIZA < b.ID_TIPO_POLIZA) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });
            
            return listaColectivo;
        }
        
        vm.groupColectivos = function (xs, key) {
            return xs.reduce(function(rv, x) {
                if (x.IS_PADRE == true && x.ID_TIPOCOLECTIVO_PADRE == null) {
                    x.ID_TIPOCOLECTIVO_PADRE = x.ID_TIPO_POLIZA;
                }
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }
        
        vm.sortColectivos = function (listColectivos) {
            var listColectivosSorted = [];
            if (listColectivos != null) {
                for (colectivo in listColectivos) {
                    //Ordenamos los colectivos según el IS_PADRE
                    listColectivos[colectivo].sort(function(x, y) {
                        // true values first
						return (x.IS_PADRE && !y.IS_PADRE) ? -1 : (!x.IS_PADRE && y.IS_PADRE) ? 1 : x.DS_TIPO_POLIZA.localeCompare(y.DS_TIPO_POLIZA);
                        // false values first
                        // return (x === y)? 0 : x? 1 : -1;
                    });
                    
                    //Recorrer lista de un grupo de colectivos
                    for (var i = 0; i < listColectivos[colectivo].length; i++) {
                        listColectivosSorted.push(listColectivos[colectivo][i]);
                    }
                }
            }
            return listColectivosSorted;
        }
    	
    	function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                return (list[key].toUpperCase().includes(uppercaseQuery));
            };
        }

        vm.getUrlParam = function ( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }

		vm.selectedFilter = function(model, valores){
			if(model != undefined) {
				return valores.some(function(valor) {
					return model.indexOf(valor) !== -1;
				});
			}
		}
    }
    
    
    
    ng.module('App').component('filtrosApp', Object.create(filtrosComponent));
    
})(window.angular);