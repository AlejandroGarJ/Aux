(function(ng) {	


	//Crear componente de app
    var solicitudComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$q', '$location', '$window', '$mdDialog', '$timeout', 'BASE_SRC', 'TiposService', 'BusquedaService', 'SolicitudService', 'MotorService', 'LocalidadesService', 'PolizaService', '$templateCache', 'HogarService', 'EmpresaService', 'CommonUtils', 'constantsTipos', 'AseguradoraService'],
    		require: {
            	parent:'^sdApp',
				busqueda: '^busquedaApp',
				busquedaPolizas: '^?busquedaPoliza',
				busquedaSolicitudes: '^?busquedaSolicitudes'
            },
            bindings: {
            	tipoHead:'<',
            	detalleCliente:'<',
            	bloqueRiesgo:'<',
            	datosCliente: '<', //Datos del cliente que vienen de CLIENTE -> POLIZA -> SOLICITUDES -> NUEVA SOLICITUD
            	datosPoliza:'<',
            }
    }
    
    
    solicitudComponent.controller = function solicitudComponentControler($scope, $q, $location, $window, $mdDialog, $timeout, BASE_SRC, TiposService, BusquedaService, SolicitudService, GarantiaService, MotorService, LocalidadesService, PolizaService, $templateCache, HogarService, EmpresaService, CommonUtils, constantsTipos, AseguradoraService) {
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
		vm.form = {};
		vm.polizas = [];
		vm.cargandoPolizas = false;
    	vm.tiposSolicitud = [];
    	vm.tipos = {};
		vm.existeCliente = false;
		vm.medida = 0;
		vm.x2js = new X2JS();
		// Dialog AngularJS
		vm.msg = $mdDialog.alert();
		vm.msg.ok('Aceptar');
		vm.msg.clickOutsideToClose(true);
		vm.listaArchivos = [];
		vm.client = false;
		vm.clientPoliza = false;
		vm.showSave = true;
        vm.polVigor = [];
        vm.polDisp= [];
        vm.polCancel = [];
        vm.sol = [];
        vm.solTotal = [];
        var exits = false;
        vm.eliminados = [];
        vm.modificados = [];
        vm.exits = false; 
        var IdTipo;
		var IdProducto;
		var IdMedio;
		var IdForma;
		var IdBanco;
        var DSVia;
        vm.DSVersion;
        vm.cuenta = false;
        vm.idCompania = 0;
		vm.isModificacionCoberturas = true;
		vm.generarCoste = 0;
		vm.primas = {};
		vm.primasCambioPrima = {};
		var primaNetaPrevia = null;
		var primaNetaRenovPrevia = null;
		vm.tipoFecha = 0;
		vm.bajaDisabled = false;
		vm.isSolicitudHogar = false;
		vm.todayDate = new Date();
		vm.showNuevaGarantia = false;
		vm.calculaMovEcon = false;
		vm.generaMovEcon = false;
		vm.precioTarificacion = 0;
		vm.showPrimasRiesgo = false;
		vm.minDate = new Date();
		vm.templateCambioRiesgo = "src/solicitud/tipos.solicitud/cambio.riesgo.html";
		vm.templateModificacionGarantias = "src/solicitud/tipos.solicitud/modificacion.garantias.html";
		vm.templateCambioAsegurados = "src/solicitud/tipos.solicitud/gestion.asegurados.html";
		vm.minDateBajaDiferente = new Date("1800-01-01");
		vm.presuBusq = false;
		vm.confirmaRiesgo = true;
		var mediador = "";
		vm.botonBloqueado = true;
		vm.NUEVA_ID_FORMAPAGO = 0;

		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	
    	this.$onInit = function(){

    		vm.form.IN_ENVIO_MAIL_CLIENTE = false;
    		vm.rol = window.sessionStorage.rol;
    		
    		var listServices = [];
    		
    		if(vm.parent.listServices.listProvincias != null && vm.parent.listServices.listProvincias.length > 0){
    			listServices.push({ data: { TIPOS: { TIPO: vm.parent.listServices.listProvincias } }, status: 200});
    		} else {
    			listServices.push(TiposService.getProvincias());
    		}
    		
    		if(vm.parent.listServices.listTipoDocumento != null && vm.parent.listServices.listTipoDocumento.length > 0){
    			listServices.push({ data: { TIPOS: { TIPO: vm.parent.listServices.listTipoDocumento } }, status: 200 });
    		} else {
    			listServices.push(TiposService.getTipoDocumento({}));
    		}
    		
    		listServices.push(TiposService.getSexo({}));
    		listServices.push(TiposService.getTipos({"ID_CODIGO": constantsTipos.ESTADO_CIVIL}));
    		
    		if(vm.parent.listServices.listSituaPolizas != null && vm.parent.listServices.listSituaPolizas.length > 0){
    			listServices.push({ data: { TIPOS: { TIPO: vm.parent.listServices.listSituaPolizas } }, status: 200 });
    		} else {
    			listServices.push(TiposService.getSituaPolizas({}));
    		}
    		
    		listServices.push(TiposService.getTipos({"ID_CODIGO": constantsTipos.MODALIDADES}));
			
			if(vm.parent.listServices.listMedioPago != null && vm.parent.listServices.listMedioPago.length > 0){
    			listServices.push({ data: { TIPOS: { TIPO: vm.parent.listServices.listMedioPago } }, status: 200 });
    		} else {
    			listServices.push(TiposService.getMedioPago({}));
    		}
			
			if(vm.parent.listServices.listFormaPago != null && vm.parent.listServices.listFormaPago.length > 0){
    			listServices.push({ data: { TIPOS: { TIPO: vm.parent.listServices.listFormaPago } }, status: 200 });
    		} else {
    			listServices.push(TiposService.getFormasPago({}));
    		}
			
			if(vm.parent.listServices.listBancos != null && vm.parent.listServices.listBancos.length > 0){
    			listServices.push({ data: { FIELD: vm.parent.listServices.listBancos }, status: 200 });
    		} else {
    			listServices.push(TiposService.getFields({}));
    		}
			
			if(vm.parent.listServices.listTipoVivienda != null && vm.parent.listServices.listTipoVivienda.length > 0){
    			listServices.push({ data: { FIELD: vm.parent.listServices.listTipoVivienda }, status: 200 });
    		} else {
    			listServices.push(TiposService.getNoField("tipoVivienda"));
    		}
			
			if(vm.parent.listServices.listUsoVivienda != null && vm.parent.listServices.listUsoVivienda.length > 0){
    			listServices.push({ data: { FIELD: vm.parent.listServices.listUsoVivienda }, status: 200 });
    		} else {
    			listServices.push(TiposService.getNoField("usoVivienda"));
    		}
			
			if(vm.parent.listServices.listRegimenVivienda != null && vm.parent.listServices.listRegimenVivienda.length > 0){
    			listServices.push({ data: { FIELD: vm.parent.listServices.listRegimenVivienda }, status: 200 });
    		} else {
    			listServices.push(TiposService.getNoField("regimenVivienda"));
    		}
			
    		if(vm.busqueda.detalleCliente != undefined && vm.busqueda.detalleCliente != null){
				vm.existeCliente = true;
				vm.cargandoPolizas = true;
				var obj = {};
				if($location.$$url == '/clientes_main' && vm.busqueda.detalleCliente.OPOLIZA == undefined && vm.busqueda.detalleCliente.OPOLIZA == null){
					if (vm.busqueda.detalleCliente.OCLIENTE != null && vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE != null) {
						obj = {
							"LST_ASEGURADOS":[
								{"ID_CLIENTE": vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE}
							]
						}
					} else if (vm.busqueda.detalleCliente.LST_ASEGURADOS != null && vm.busqueda.detalleCliente.LST_ASEGURADOS[0] != null) {
						obj = {
							"LST_ASEGURADOS":[
								{"ID_CLIENTE": vm.busqueda.detalleCliente.LST_ASEGURADOS[0].ID_CLIENTE}
							]
						}
					}
					
					vm.client = true;
				}else if (($location.$$url.includes('/polizas_list') || $location.$$url.includes('/solicitudes')) && vm.busqueda.detalleCliente.OPOLIZA != undefined && vm.busqueda.detalleCliente.OPOLIZA != null){
					obj = { "NU_POLIZA":vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA };
						if(vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA == undefined || vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA == null){
							obj = { 
								"ID_POLIZA":vm.busqueda.detalleCliente.OPOLIZA.ID_POLIZA
							};
							
							if (vm.busqueda.detalleCliente != null && vm.busqueda.detalleCliente.OCLIENTE != null && vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE != null) {
								obj.LST_ASEGURADOS = [
									{"ID_CLIENTE": vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE}
								]
							}
						}
						vm.client = false;
						
				}else if ($location.$$url == '/clientes_main' && vm.busqueda.detalleCliente.OPOLIZA != undefined && vm.busqueda.detalleCliente.OPOLIZA != null){
					obj = { "NU_POLIZA":vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA };
					if(vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA == undefined || vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA == null){
						obj = { 
							"ID_POLIZA":vm.busqueda.detalleCliente.OPOLIZA.ID_POLIZA
						};
						
						if (vm.busqueda.detalleCliente != null && vm.busqueda.detalleCliente.OCLIENTE != null && vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE != null) {
							obj.LST_ASEGURADOS = [
								{"ID_CLIENTE": vm.busqueda.detalleCliente.OCLIENTE.ID_CLIENTE}
							]
						}
					}
					vm.client = false;
				}

                listServices.push(BusquedaService.buscar(obj, "polizas"));
    			
			} else if($location.$$url == '/solicitudes_list'|| $location.$$url == '/solicitudes_pendientes_list'){
				vm.client = true;
			}
    		
    		if (vm.tipoHead == 5) {				
    			listServices.push(TiposService.getMotivosAnul({"ID_PROGRAMA": vm.datosPoliza.ID_PROGRAMA}));
				listServices.push(TiposService.getTipos({'ID_CODIGO': constantsTipos.CAUSAS_ANUL}));
    		} else {
    			listServices.push(null);
    			listServices.push(null);
    		}
			
			vm.parent.abrirModalcargar(true);

			var objTipoSolicitud = {};
			if (vm.datosPoliza != null && vm.tipoHead != null) {
				objTipoSolicitud = { "ID_RAMO": vm.datosPoliza.ID_RAMO, "ID_COMPANIA": vm.datosPoliza.ID_COMPANIA, "ID_COMP_RAMO_PROD": vm.datosPoliza.ID_COMP_RAMO_PROD };
			}
			
			SolicitudService.getTiposSolicitudFilter(objTipoSolicitud)
			.then(function successCallback(response){
				if (response.data != null && response.data.TIPOS_SOLICITUD != null && response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD != null) {
					vm.listSolicitudes = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD;
					vm.listSolicitudesPadre = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD.filter(x => x.ID_TIPO_SOLICITUDPADRE == null);
					vm.titleSolicitud = vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == vm.tipoHead).DS_TIPO_SOLICITUD;
				}
            });
			
            Promise.all(listServices)
            .then(([resultadoGetProvincias, resultadoGetTiposDocumento, resultadoGetSexo, resultadoGetEstadoCivil, resultadoGetSituaPoliza, resultadoGetModalidades, resultadoGetMedioPago, 
            	resultadoGetFormaPago, resultadoGetBancos, resultadoGetTipoVivienda, resultadoGetUsoVivienda, resultadoGetRegimenVivienda, resultadoGetPolizas, resultadoGetMotivosAnul, resultadoGetCausasAnulacion,]) => { 

        		//getProvincias
        		if (resultadoGetProvincias.status == 200) {
        			vm.tipos.provincias = resultadoGetProvincias.data.TIPOS.TIPO;
        			vm.parent.listServices.listProvincias = vm.tipos.provincias;
        		} else if (resultadoGetProvincias.status == 406 || resultadoGetProvincias.status == 401) {
                	vm.parent.logout();
                }

        		//getTipoDocumento
        		if (resultadoGetTiposDocumento.status == 200) {
        			vm.tipos.tiposDocumento = resultadoGetTiposDocumento.data.TIPOS.TIPO;
					vm.parent.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
        		} else if (resultadoGetProvincias.status == 406 || resultadoGetProvincias.status == 401) {
                	vm.parent.logout();
                }

        		//getSexo
        		if (resultadoGetSexo.status == 200) {
        			vm.tipos.sexo = resultadoGetSexo.data.TIPOS.TIPO;
        		} else if (resultadoGetSexo.status == 406 || resultadoGetSexo.status == 401) {
                	vm.parent.logout();
                }

        		//getEstadoCivil
        		if (resultadoGetEstadoCivil.status == 200) {
        			vm.tipos.estadoCivil = resultadoGetEstadoCivil.data.TIPOS.TIPO;
        		} else if (resultadoGetEstadoCivil.status == 406 || resultadoGetEstadoCivil.status == 401) {
                	vm.parent.logout();
                }

        		//getSituaPoliza
        		if (resultadoGetSituaPoliza.status == 200) {
					vm.tipos.estados = resultadoGetSituaPoliza.data.TIPOS.TIPO;
					vm.parent.listServices.listSituaPolizas = vm.tipos.estados;
        		} else if (resultadoGetSituaPoliza.status == 406 || resultadoGetSituaPoliza.status == 401) {
                	vm.parent.logout();
                }

        		//getModalidades
        		if (resultadoGetModalidades.status == 200) {
        			vm.tipos.modalidades = resultadoGetModalidades.data.TIPOS.TIPO;
        		} else if (resultadoGetModalidades.status == 406 || resultadoGetModalidades.status == 401) {
                	vm.parent.logout();
                }

        		//getMedioPago
        		if (resultadoGetMedioPago.status == 200) {
					vm.tipos.mediosPago = resultadoGetMedioPago.data.TIPOS.TIPO;
					vm.parent.listServices.listMedioPago = vm.tipos.mediosPago;
        		} else if (resultadoGetMedioPago.status == 406 || resultadoGetMedioPago.status == 401) {
                	vm.parent.logout();
                }

        		//getFormaPago
        		if (resultadoGetFormaPago.status == 200) {
					vm.tipos.formasPago = resultadoGetFormaPago.data.TIPOS.TIPO;
					vm.parent.listServices.listFormaPago = vm.tipos.formasPago;
        		} else if (resultadoGetFormaPago.status == 406 || resultadoGetFormaPago.status == 401) {
                	vm.parent.logout();
                }

        		//getBancos
        		if (resultadoGetBancos.status == 200) {
					vm.tipos.bancos = resultadoGetBancos.data.FIELD;
					vm.parent.listServices.listBancos = vm.tipos.bancos;
        		} else if (resultadoGetBancos.status == 406 || resultadoGetBancos.status == 401) {
                	vm.parent.logout();
                }

        		//getTipoVivienda
        		if (resultadoGetTipoVivienda.status == 200) {
					vm.tipos.tipoVivienda = resultadoGetTipoVivienda.data.FIELD;
					vm.parent.listServices.listTipoVivienda = vm.tipos.tipoVivienda;
        		} else if (resultadoGetTipoVivienda.status == 406 || resultadoGetTipoVivienda.status == 401) {
                	vm.parent.logout();
                }
        		
        		//getUsoVivienda
        		if (resultadoGetUsoVivienda.status == 200) {
					vm.tipos.usoVivienda = resultadoGetUsoVivienda.data.FIELD;
					vm.parent.listServices.listUsoVivienda = vm.tipos.usoVivienda;
        		} else if (resultadoGetUsoVivienda.status == 406 || resultadoGetUsoVivienda.status == 401) {
                	vm.parent.logout();
                }
        		
        		//getRegimenVivienda
        		if (resultadoGetRegimenVivienda.status == 200) {
					vm.tipos.regimenVivienda = resultadoGetRegimenVivienda.data.FIELD;
					vm.parent.listServices.listRegimenVivienda = vm.tipos.regimenVivienda;
        		} else if (resultadoGetRegimenVivienda.status == 406 || resultadoGetRegimenVivienda.status == 401) {
                	vm.parent.logout();
                }

        		//getMotivosAnul
        		if (resultadoGetMotivosAnul != null && resultadoGetMotivosAnul.status == 200 && resultadoGetMotivosAnul.data && resultadoGetMotivosAnul.data.TIPOS && resultadoGetMotivosAnul.data.TIPOS.TIPO) {
					vm.tipos.anulaciones = resultadoGetMotivosAnul.data.TIPOS.TIPO;
                }

				//getCausasAnulacion
        		if (resultadoGetCausasAnulacion && resultadoGetCausasAnulacion.status == 200 &&
					resultadoGetCausasAnulacion.data && resultadoGetCausasAnulacion.data.TIPOS && resultadoGetCausasAnulacion.data.TIPOS.TIPO) {
        			vm.tipos.causasAnulacion = resultadoGetCausasAnulacion.data.TIPOS.TIPO;
					vm.lstIdsDesistimiento = vm.tipos.causasAnulacion.find(x => x.CO_TIPO == '2').DS_TIPOS.split(',').map(Number);
					vm.lstIdsVencimiento = vm.tipos.causasAnulacion.find(x => x.CO_TIPO == '0').DS_TIPOS.split(',').map(Number);
        		}
        		
        		//getPolizas
    			if(resultadoGetPolizas.status == 200){
					vm.loading1 = false;
					vm.cargandoPolizas = false;	
    				vm.polizas = getPolizas(resultadoGetPolizas).list_datos;
    				
    				//Si la póliza es de SL y una baja de póliza, se marca por defecto, baja por desistimiento
                    if (vm.polizas.length > 0 && vm.polizas[0] != null && vm.polizas[0].ID_COMPANIA == 111 && vm.tipoSolicitud == "BAJA_POLIZA") {
                    	vm.form.ID_CAUSAANULACION = 203;
                    	vm.form.OPOLIZA = vm.polizas[0];
                    	vm.getData();
                    }
                    
    				if ($location.$$url == '/clientes_main' && vm.tipoHead == 5){
                        vm.buscarEstadoPolizas(vm.polizas);    
    				}
    				if (vm.tipoHead != 5){
    					vm.polDisp = vm.polizas;	
    				}

    				if (vm.polizas != null && vm.polizas[0] != null && vm.polizas[0].ID_RAMO == 20) {
    					vm.isSolicitudHogar = true;
    					vm.form.IN_ENVIO_MAIL_CLIENTE = true;
    				}
    			}
				
        		$mdDialog.cancel();
        		
            });
			

			if($location.$$url == '/clientes_main'  )
    			vm.medida = 315;
			else if ($location.$$url.includes('/polizas_list'))
    			vm.medida = 205;
    		}
    	
    	
    	this.$onChanges = function(){
    		vm.form = {};
    		//vm.form.FD_INICIO = new Date();     && vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA == undefined       && vm.busqueda.detalleCliente.OPOLIZA.NU_POLIZA != undefined

    		
    		vm.alta_bajaSolicitud = vm.tipoHead;
    		if(vm.tipoHead != null) {
    			if(vm.tipoHead == 5)
    				vm.altaBajaSolicitud = "BAJA";
    			else
    				vm.altaBajaSolicitud = "ALTA";
    		}
    		
    		if(vm.tipoHead != 5) {
   			// vm.titleSolicitud = vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == vm.tipoHead).DS_TIPO_SOLICITUD;
    		} else if(vm.tipoHead == 5) {
    			/*TiposService.getMotivosAnul({"ID_TIPOANULACION": 901})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.anulaciones = response.data.TIPOS.TIPO;
                        if(response.data.ID_RESULT != null && response.data.ID_RESULT != undefined){
                            delete response.data.ID_RESULT;
                            delete response.data.DS_RESULT;
                        }
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});*/
				// vm.titleSolicitud = vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == vm.tipoHead).DS_TIPO_SOLICITUD;
				vm.tipoSolicitud = 'BAJA_POLIZA';
			}
    	}
    	
    	this.loadTemplate=function(){
    		if(vm.tipoHead == "altaSolicitud" || vm.tipoHead == "bajaSolicitud"){
    			return "src/solicitud/tipos.solicitud/altabaja.solicitud.html";
    		}
    		return "src/solicitud/solicitud.view.html";
    	}
    	
    	//Buscar un cliente
    	vm.buscarCliente = function(value){
    		vm.searchCliente='';
			var clientes = [];
			//if(value.length == 3){
			vm.loading = true;
			var promise = BusquedaService.buscar({"NO_NOMBRE_COMPLETO":value}, "clientes")
			.then(function successCallback(response){
				if(response.status == 200){
					vm.loading = false;
					vm.mostrar = true;
					
					var addresses = []; 
				    angular.forEach(response.data.CLIENTES.CLIENTE, function(item){ 
				     addresses.push(item); 
				    }); 
				    vm.clientes = addresses;
				    return addresses;
				}
			});
			return promise;
			
			//}
			
    	}

    	//Autocompleto Async
    	vm.querySearchAsync = function(query) {
    		if(query.length >= 3){
	    		var deferred = $q.defer();
	    		BusquedaService.buscar({"NO_NOMBRE_COMPLETO":query}, "clientes")
		 		.then(function successCallback(response){
		 			if(response.data.NUMERO_CLIENTES > 0){
		 				vm.clientes = response.data.CLIENTES.CLIENTE;
		 				deferred.resolve(response.data.CLIENTES.CLIENTE);
		 			}
		 			else{
		 				vm.clientes = [];
		 			}
    		        
    		    });
    		   return deferred.promise;
    		}
    		else{
    			vm.clientes = [];
    		}
    	}
    	
    	vm.busClient = function(documento){
   		  BusquedaService.buscar({"NU_DOCUMENTO": documento }, "clientes")
	 		.then(function successCallback(response){
	 			if(response.status == 200){
	 				if(response.data.ID_RESULT == 0){
		  	 			if(response.data.NUMERO_CLIENTES > 0 ){
		  	 				vm.form.OCLIENTE = response.data.CLIENTES.CLIENTE[0];
		  	 				vm.buscarPolizas();	 			
		  	 			}else{
		  	 				vm.form.OCLIENTE = [];
		  	 			}
	 				}else{
						vm.msg.textContent(response.data.DS_RESULT)
					    $mdDialog.show(vm.msg);
	 				}
	 			}
	 		});
   	}	
    	
    	
    	//Buscar polizas
    	vm.buscarPolizas = function(){
			vm.cargandoPolizas = true;
    		vm.loading1 = true;

    		if(vm.form.NU_DOCUMENTO != null || vm.form.OCLIENTE != null){
    			if(vm.form.OCLIENTE != undefined && vm.form.OCLIENTE.NU_DOCUMENTO != null)
    				vm.form.NU_DOCUMENTO = vm.form.OCLIENTE.NU_DOCUMENTO;
    			if(vm.form.NU_DOCUMENTO != undefined && vm.form.NU_DOCUMENTO.length == 9){
		    		BusquedaService.buscar({
						"LST_ASEGURADOS":[
							{"NU_DOCUMENTO": vm.form.NU_DOCUMENTO}
						]
		    		}, "polizas")
		    		.then(function successCallback(response){
		    			if(response.status == 200){
		    				vm.loading1 = false;	
							vm.cargandoPolizas = false;
							vm.polizas = getPolizas(response).list_datos;
		    				
		    				//Buscar el tomador
		    				//vm.polizas.TOMADOR = _.filter(response.data.POLIZAS.POLIZA.LST_ASEGURADOS, {''})
		    			}
		    		});
	    		}
	    		else{
					vm.loading1 = false;
					vm.cargandoPolizas = false;
	    		}
    		}
    	}
    	
    	vm.buscarEstadoPolizas = function(polizas){   		
    	  	//Buscar pólizas en vigor
    		if(vm.tipoHead == 5){
	    		for(var i=0; i<vm.polizas.length; i++){
	                if(vm.polizas[i].ID_SITUAPOLIZA == 1){	 
	                	 vm.polVigor.push(vm.polizas[i]); 
	                }
	            }	
    		vm.polDisp = vm.polVigor;
    		}
    		if(vm.tipoHead != 5){
				vm.polDisp = vm.polizas;
			}		
    		//Buscar pólizas canceladas
    		for(var i=0; i<vm.polizas.length; i++){
                if(vm.polizas[i].ID_SITUAPOLIZA == 2){	 
                	 vm.polCancel.push(vm.polizas[i]); 
                }
    		}	  		
        }
    	
    	
    	//Recuperar los tipos de solicitud por polizas
    	vm.getTiposSolicitud = function(poliza){
    		if(poliza != undefined){
	    		vm.templateForm = "";
	    		vm.idCompania = poliza.ID_COMPANIA;
	            vm.form.OTIPO_SOLICITUD = "";
				vm.isModificacionCoberturas = false;
	    		if(vm.tipoHead != 5){
		    		if((vm.form.OPOLIZA == undefined || vm.form.OPOLIZA == null || vm.form.OPOLIZA == "") && poliza != undefined){
			    		vm.form.OPOLIZA = poliza;

                    	//Añadimos los datos de los asegurados, ya que esta petición contiene pocos datos
                        if (vm.datosPoliza != null && vm.datosPoliza.LST_ASEGURADOS != null) {
                        	vm.form.OPOLIZA.LST_ASEGURADOS = vm.datosPoliza.LST_ASEGURADOS;
                        }
			    	}
	    			
	    	
		    		if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null && vm.form.OPOLIZA != ""){ 
		    			vm.tiposSolicitud = callTiposSolicitud({"ID_RAMO":vm.form.OPOLIZA.ID_RAMO, "ID_TIPO_SOLICITUDPADRE": vm.tipoHead, "ID_COMPANIA": vm.idCompania}, vm.loading2);
		    		}
		    		vm.exits = false;
	    		}
		    	else if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null){
		    		vm.templateForm = "src/solicitud/tipos.solicitud/baja.poliza.html";
		    		// vm.isCollapsed = true;
					vm.isCollapsed1 = true;
					vm.getFechaEfecto();
		    	}
		    	else if(vm.tipoHead == 5 && poliza != null && poliza != undefined && poliza.ID_POLIZA != undefined){
		    		vm.templateForm = "src/solicitud/tipos.solicitud/baja.poliza.html";
		    		// vm.isCollapsed = true;
		    		vm.form.OPOLIZA = poliza;
					vm.isCollapsed1 = true;
					vm.getFechaEfecto();
		    	}
    		}
    	}
    	
    	//Identificar la localidad por pueblos
    	// vm.updateDir = function(valor){
    	// 	if(valor.length == 5){
    	// 		vm.localidades = [];
    	// 		vm.form.NO_PROVINCIA = [];
    	// 		TiposService.getLocalidades(valor)
    	// 		.then(function successCallBack(response){
    	// 			if(!Array.isArray(response.data.LOCALIDAD)){
    	// 				vm.localidades = [];
    	// 				vm.localidades.push(response.data.LOCALIDAD);
    	// 			}
    	// 			else{
    	// 				vm.localidades = response.data.LOCALIDAD;
    	// 				vm.form.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
    	// 			}
    				
    	// 			vm.form.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA ;
    	// 		}, function errorCallBack(response){
    	// 		});
    	// 	}
    	// }
		
    	vm.pintarFormulario = function(){
    		vm.subTipoSolicitud = null;
			vm.tipoFecha = 0;
            vm.form.OTIPOSOLICITUD = {};
			vm.isCollapsed1 = true;
			vm.isModificacionCoberturas = false;
    		vm.primas = {};
			if((vm.datosPoliza.ID_PROGRAMA == 2 || vm.datosPoliza.ID_PROGRAMA == 18) && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUDPADRE == 4){
				vm.tipoFecha = 1;
				vm.getFechaEfecto();
			}
			//switch (6) {
    		switch (parseInt(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD)) {
			case 6:
				
				
				if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null && vm.form.OPOLIZA.ID_RAMO == 20 && (vm.form.OPOLIZA.ID_COMPANIA == 78 || vm.form.OPOLIZA.ID_COMPANIA == 111)){
					//Cargamos el gift de carga
					//vm.carga = true;
					//Seleccionamos el paso actual de la modificación de garantía
					vm.pasoGarantia = 1;

					vm.isModificacionCoberturas = true;
					vm.tipoSolicitud = 'MODIFICACION_GARANTIAS';
					vm.templateForm = "src/solicitud/tipos.solicitud/modificacion.coberturas.html";
					vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				}else{
					
					vm.tipoSolicitud = 'MODIFICACION_GARANTIAS';
					vm.templateForm = "src/solicitud/tipos.solicitud/modificacion.garantias.html";
					vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
					
					// BusquedaService.buscar({"ID_POLIZA":vm.form.OPOLIZA.ID_POLIZA}, "garantiasByPoliza")
					// .then(function successCallback(response){
					// 	vm.garantias = response.data.GARANTIAS;
					// },function errorCallBack(response){
					// 	if(response.status == 406 || response.status == 401){
					// 		vm.parent.logout();
					// 		$location.path('/');
					// 	}
					// });
					TiposService.getGarantias({"ID_COMP_RAMO_PROD": vm.form.OPOLIZA.ID_COMP_RAMO_PROD})
					.then(function successCallback(response){
						if(response.status == 200){
							vm.garantias = response.data.GARANTIAS;

							//Si es de ciberempresas, dejar añadir solo la extensión de ciberdelincuencia
							if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
								vm.garantias = [];
								var garantia = response.data.GARANTIAS.find(x => x.ID_GARANTIA == 57);
								if (garantia != null) {
									vm.garantias.push(garantia);
								}
							}
						}
					});
					vm.iniciarUIGrid();
				}
				break;
			case 8:
				vm.tipoSolicitud = 'CAMBIO_DOMICILIO';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.domicilio.html"
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);

				HogarService.getTiposVia({})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.tipos.tiposVia = response.data.TIPO_VIA;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
	                }
				});

				if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null && vm.form.OPOLIZA.ID_RAMO == 20 && (vm.form.OPOLIZA.ID_COMPANIA == 78 || vm.form.OPOLIZA.ID_COMPANIA == 111)){
					TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "APIS_SL" })
					.then(function successCallback(response) {
						if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
							if (response.data.TIPOS.TIPO[0].DS_TIPOS == "true" || response.data.TIPOS.TIPO[0].DS_TIPOS == true) {
								vm.apisSL = true;
							} else {
								vm.apisSL = false;
							}
						} else {
							vm.apisSL = false;
						}
						localStorage.setItem('apisSL', vm.apisSL);
					}, function callBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.parent.logout();
						}
					});
				}
				
				break;
			case 9:
				vm.tipoSolicitud = 'CAMBIO_OTROS_DATOS_POLIZA';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambios.datos.poliza.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud); 
				vm.idCompania = vm.form.OPOLIZA.ID_COMPANIA;
				vm.jsEnviado = JSON.parse(vm.datosPoliza.JS_ENVIADO);
				vm.cdpTiposSolicitud = callTiposSolicitud({"ID_RAMO":vm.form.OPOLIZA.ID_RAMO, "ID_TIPO_SOLICITUDPADRE": 9,"ID_COMPANIA": vm.idCompania}, true) //
				vm.getProductos(vm.form.OPOLIZA.ID_COMPANIA, vm.form.OPOLIZA.ID_RAMO);
				break;
			case 10:
				vm.tipoSolicitud = 'CUENTA_BANCARIA';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.bancaria.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				
				// if(vm.form.OPOLIZA.CO_IBAN == undefined){
	            //     vm.msg.textContent("No existen cuentas bancarias asociadas a éste cliente");
	            //     $mdDialog.show(vm.msg);
	            //     vm.busquedaSolicitudes.cerrarTab();
				// }
				if(vm.datosPoliza.CO_IBAN != null){
					vm.form.OPOLIZA.CO_IBAN = vm.datosPoliza.CO_IBAN;
					vm.cuenta = true;
				}
				// Añadir datos de la cuenta bancaria a modificar a XM_ENVIADO
				if(vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA == undefined) {
					vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA = {};
				}
				if(vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA == undefined) {
					vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA = {}
				}
				if(vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA != undefined) {
					vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA = {
						// 'CO_BANCO':vm.form.OPOLIZA.CO_BANCO,
						// 'NO_SUCURSAL':vm.form.OPOLIZA.NO_SUCURSAL,
						// 'NU_DC':vm.form.OPOLIZA.NU_DC,
						// 'NU_CUENTA':vm.form.OPOLIZA.NU_CUENTA,
						'CO_IBAN':vm.form.OPOLIZA.CO_IBAN,
					};
					// Eliminar datos que sean undefined
					for(dato in vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA) {
						if(vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA[dato] === undefined) {
							delete vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_SELECCIONADA[dato];
						}
					}
				} 
				
				
				break;
			case 11:
				vm.tipoSolicitud = 'CAMBIO_RIESGO';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.riesgo.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
    			vm.okCambioRiesgo = false;
				
				if (vm.datosPoliza != null && vm.datosPoliza.ID_POLIZA != null && (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 7 || vm.form.OPOLIZA.ID_PRODUCTO == 8 || vm.form.OPOLIZA.ID_PRODUCTO == 5)) {

					// vm.parent.abrirModalcargar(true);
					PolizaService.getDetail(vm.datosPoliza.ID_POLIZA)
					.then(function successCallback(response) {
					    // $mdDialog.cancel();
		                if (response.data.ID_RESULT == 0) {
		                    if(response.data.JS_ENVIADO != null && response.data.JS_ENVIADO != undefined && response.data.JS_ENVIADO != ""){
								vm.bloqueRiesgo = JSON.parse(response.data.JS_ENVIADO);
								vm.form.OPRESUPUESTO = {
									ID_RAMO: 103,
									PECUNIARIAS: JSON.parse(JSON.stringify(vm.bloqueRiesgo))
								};
								if (vm.form.OPRESUPUESTO.PECUNIARIAS != null && vm.form.OPRESUPUESTO.PECUNIARIAS != null && vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO != null && vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER != null && isNaN(parseInt(vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER)) == false) {
									vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER = (vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER).toString();
								}
		                    }
		    				if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
		    					//Ciberempresa
		    		            
		    					//Comprobar si es adhoc o no
		    					vm.isAdhoc = false;
		    					if (response.data.IS_SELECTED == true) {
			    					vm.isAdhoc = true;
		    					} else {
		    						BusquedaService.buscar({ OPOLIZA: { ID_POLIZA: vm.form.OPOLIZA.ID_POLIZA } }, 'presupuestos')
		    						.then(function successCallback(response) {
		    							if (response.data != null && response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS.length > 0) {
											vm.isAdhoc = false;
										} else {
											vm.isAdhoc = true;
										}
		    						},function errorCallBack(response){
				    					vm.isAdhoc = false;
		    						});

		    					}
		    					
		    					if(vm.parent.listServices.listGrupoEmpresa_ti != null && vm.parent.listServices.listGrupoEmpresa_ti.length > 0) {
		    		                vm.tpGroups = vm.parent.listServices.listGrupoEmpresa_ti;
		    		                if (vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
		    		                    var noSector = vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
		    		                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
		    		                    
		    		                }
		    		            } else {
		    		                EmpresaService.groups()
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	response.data.TIPOS.TIPO.sort(function (a, b) {
		    		                            if (a.DS_TIPOS > b.DS_TIPOS) {
		    		                              return 1;
		    		                            }
		    		                            if (a.DS_TIPOS < b.DS_TIPOS) {
		    		                              return -1;
		    		                            }
		    		                            // a must be equal to b
		    		                            return 0;
		    		                        });
		    		                    	
		    		                        vm.tpGroups = response.data.TIPOS.TIPO;
		    		                        
		    		                        if (vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
		    				                    var noSector = vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
		    				                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
		    				                    
		    				                }
		    		                        
		    		                        vm.parent.listServices.listGrupoEmpresa_ti = vm.tpGroups;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }

		    		            if(vm.parent.listServices.listCiberAtaque_ti != null && vm.parent.listServices.listCiberAtaque_ti.length > 0) {
		    		                vm.tpCbatk = vm.parent.listServices.listCiberAtaque_ti;
		    		            } else {
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.TYPE_CBATK
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	
		    		                    	vm.tpCbatk = response.data.TIPOS.TIPO;
		    		                    	
		    		                    	//Ordenar lista
		    		                    	vm.tpCbatk.sort(function(a, b) {
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return 1;
		    		                		  }
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return -1;
		    		                		  }
		    		                		  return 0;
		    		                		});
		    		                    	
		    		                    	
		    		                    	vm.parent.listServices.listCiberAtaque_ti = vm.tpCbatk;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }

		    		            if(vm.parent.listServices.listCantidadAsegurada_ti != null && vm.parent.listServices.listCantidadAsegurada_ti.length > 0) {
		    		                vm.tpAmount = vm.parent.listServices.listCantidadAsegurada_ti;
		    		            } else {
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.RNG_AMMOUNT
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	
		    		                    	vm.tpAmount = response.data.TIPOS.TIPO;
		    		                    	
		    		                    	//Ordenar lista
		    		                    	vm.tpAmount.sort(function(a, b) {
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return 1;
		    		                		  }
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return -1;
		    		                		  }
		    		                		  return 0;
		    		                		});
		    		                    	
		    		                        vm.parent.listServices.listCantidadAsegurada_ti = vm.tpAmount;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }

		    		            if(vm.parent.listServices.listCantidadPerdida_ti != null && vm.parent.listServices.listCantidadPerdida_ti.length > 0) {
		    		                vm.tpLosses = vm.parent.listServices.listCantidadPerdida_ti;
		    		            } else {
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.RNG_LOSSES
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	
		    		                    	vm.tpLosses = response.data.TIPOS.TIPO;

		    		                    	//Ordenar lista
		    		                    	vm.tpLosses.sort(function(a, b) {
		    		                  		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                  		    return 1;
		    		                  		  }
		    		                  		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                  		    return -1;
		    		                  		  }
		    		                  		  return 0;
		    		                  		});
		    		                    	
		    		                        vm.parent.listServices.listCantidadPerdida_ti = vm.tpLosses;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }

		    		            if(vm.parent.listServices.listCantidadFacturacion_ti != null && vm.parent.listServices.listCantidadFacturacion_ti.length > 0) {
		    		                vm.tpFacturacion = vm.parent.listServices.listCantidadFacturacion_ti;
		    		            } else {
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.IM_FACTURACION
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	
		    		                    	vm.tpFacturacion = response.data.TIPOS.TIPO;
		    		                    	
		    		                    	//Ordenar lista
		    		                    	vm.tpFacturacion.sort(function(a, b) {
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return 1;
		    		                		  }
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return -1;
		    		                		  }
		    		                		  return 0;
		    		                		});
		    		                    	
		    		                    	vm.parent.listServices.listCantidadFacturacion_ti = vm.tpFacturacion;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }
		    				} else if (vm.form.OPOLIZA.ID_PRODUCTO == 8) {
		    					//Ciberidentidad
		    					if(vm.parent.listServices.listNumAdultos_ti != null && vm.parent.listServices.listNumAdultos_ti.length > 0) {
		    		                vm.typesIdent = vm.parent.listServices.listNumAdultos_ti;
		    		            } else {
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.TYPE_IDENTIDAD
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	vm.typesIdent = response.data.TIPOS.TIPO;

		    		                    	//Ordenar lista
		    		                    	vm.typesIdent.sort(function(a, b) {
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return 1;
		    		                		  }
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return -1;
		    		                		  }
		    		                		  return 0;
		    		                		});
		    		                    	
		    		                    	vm.parent.listServices.listNumHijos_ti = vm.typesIdent;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }
		    				} else if (vm.form.OPOLIZA.ID_PRODUCTO == 7) {
		    					//Ciberhijos
		    		            
		    		            if(vm.parent.listServices.listNumHijos_ti != null && vm.parent.listServices.listNumHijos_ti.length > 0) {
		    		                vm.typesHijos = vm.parent.listServices.listNumHijos_ti;
		    		            } else {
		    		            	
		    		            	TiposService.getTipos({
		    		                    "ID_CODIGO": constantsTipos.TYPE_HIJOS
		    		                })
		    		                .then(function successCallback(response) {
		    		                    if (response.status == 200) {
		    		                    	vm.typesHijos = response.data.TIPOS.TIPO;
		    		                    	
		    		                    	//Ordenar lista
		    		                    	vm.typesHijos.sort(function(a, b) {
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return 1;
		    		                		  }
		    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
		    		                		    return -1;
		    		                		  }
		    		                		  return 0;
		    		                		});
		    		                    	
		    		                    	vm.parent.listServices.listNumHijos_ti = vm.typesHijos;
		    		                    }
		    		                }, function callBack(response) {
		    		                    if (response.status == 406 || response.status == 401) {
		    		                        vm.parent.logout();
		    		                    }
		    		                });
		    		            }

		    				}
		                }
					})
					.catch(function errorCallback(error){
						// vm.msg.textContent('Ha ocurrido un error al mostrar el riesgo.');
				        // $mdDialog.show(vm.msg);
					});
				}
				
				break;
			case 14:
				vm.tipoSolicitud = 'MODIFICACION_SEGUNDO_CONDUCTOR';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.segundo.conductor.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 15:
				vm.tipoSolicitud = 'CAMBIO_PROPIETARIO';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.propietario.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 18:
				vm.tipoSolicitud = 'CAMBIO_TOMADOR';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.tomador.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);

				//Añadir datos del tomador a modificar a XM_ENVIADO
				// if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR == undefined) {
				// 	vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR = {};
				// }
				// if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO == undefined) {
				// 	vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = {}
				// }
				// vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = vm.form.OPOLIZA.tomador;
				break;
			case 20:
				vm.tipoSolicitud = 'ALTA_ASEGURADO';
				vm.templateForm = "src/solicitud/tipos.solicitud/alta.asegurado.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 21:
				vm.tipoSolicitud = 'BAJA_ASEGURADO';
				vm.templateForm = "src/solicitud/tipos.solicitud/baja.asegurado.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 22:
				vm.tipoSolicitud = 'CAMBIO_DATOS_ASEGURADO';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.datos.asegurado.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 23:
				vm.tipoSolicitud = 'ALTA_BENEFICIARIO';
				vm.templateForm = "src/solicitud/tipos.solicitud/alta.beneficiario.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 24:
				vm.tipoSolicitud = 'BAJA_BENEFICIARIO';
				vm.templateForm = "src/solicitud/tipos.solicitud/baja.beneficiario.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 25:
				vm.tipoSolicitud = 'CAMBIO_DATOS_BENEFICIARIO';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.datos.beneficiario.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				break;
			case 30:
				vm.tipoSolicitud = 'CAMBIO_DATOS_TOMADOR';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.datos.tomador.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				vm.tomadorSeleccionado = {};
				vm.tomadorSeleccionado = JSON.parse(JSON.stringify(vm.form.OPOLIZA.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3)));
				break;
			case 33:
				vm.tipoSolicitud = 'GESTION_ASEGURADOS';
			    vm.tipoSolicitudAsegurado = "XML_ALTA_ASEGURADO";
				vm.templateForm = "src/solicitud/tipos.solicitud/gestion.asegurados.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				vm.tomador = {};
				vm.tomador = JSON.parse(JSON.stringify(vm.form.OPOLIZA.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3)));
				break;
			case 35:
				vm.tipoSolicitud = 'RENOVAR_POLIZA';
				vm.templateForm = null;
				vm.tipoFecha = 0;
				vm.getFechaEfecto();
				break;
			case 37:
				vm.tipoSolicitud = 'CAMBIO_PRIMA';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.prima.html";
				vm.tipoFecha = 1;
				vm.getFechaEfecto();
				

            	TiposService.getTipos({ "ID_CODIGO": constantsTipos.CAUSAS_CAMBIO_PRIMA, "NO_CODIGO": "CAUSAS_CAMBIO_PRIMA" })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	if (response.data != null && response.data.TIPOS != null && response.data.TIPOS.TIPO != null) {
                        	vm.listCausasPrima = response.data.TIPOS.TIPO;
                    	} else {
                        	vm.listCausasPrima = [];
                    	}
                    }
                });
				
				PolizaService.getDetail(vm.datosPoliza.ID_POLIZA)
				.then(function successCallback(response) {
				    // $mdDialog.cancel();
	                if (response.data.ID_RESULT == 0) {
	                	vm.datosPoliza = response.data;
	                }
	                
    				if (vm.datosPoliza != null && vm.datosPoliza.JS_ENVIADO != null) {
    					var objEnviado = JSON.parse(vm.datosPoliza.JS_ENVIADO);
    					if (objEnviado.CIBERRIESGO != null && objEnviado.CIBERRIESGO.IM_PRIMA_NETA_RENOVACION != null) {
    						vm.primaNetaActual = objEnviado.CIBERRIESGO.IM_PRIMA_NETA_RENOVACION;
    					} else if (vm.datosPoliza.IM_PRIMA_NETA != null) {
    						vm.primaNetaActual = vm.datosPoliza.IM_PRIMA_NETA;
    					} else {
    						vm.primaNetaActual = 0;
    					}
    					vm.form[vm.tipoSolicitud].IM_PRIMA_NETA = vm.primaNetaActual;
    					vm.primaNetaActual = vm.beautifyImporte(vm.primaNetaActual);
    				}
				})
				.catch(function errorCallback(error){
					
				});
    		
				break;
			case 41:

				var renovacionVigor = false;
				vm.parent.abrirModalcargar(true);
				//Comprobar si la póliza tiene una solicitud de renovación en vigor
				if (vm.datosPoliza && vm.datosPoliza.ID_POLIZA != null) {
					BusquedaService.buscar({ OPOLIZA: { ID_POLIZA: vm.datosPoliza.ID_POLIZA } }, "solicitud")
	    			.then(function successCallback(response){
	                    if(response.status == 200 && response.data.SOLICITUDES != null && response.data.SOLICITUDES.SOLICITUD != null && response.data.SOLICITUDES.SOLICITUD.length > 0){                        
	                        var solicitudes = response.data.SOLICITUDES.SOLICITUD;
	                        for (var i = 0; i < solicitudes.length; i++) {
	                        	if (solicitudes[i].OTIPO_SOLICITUD && solicitudes[i].OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 && solicitudes[i].ID_SITUACION_SOLICITUD == 2) {
	                        		//Comprobar si la fecha de alta de la solicitud es mayor a la fecha de vencimiento de la póliza
	                        		if (new Date(solicitudes[i].FT_USU_ALTA).getTime() < new Date(vm.datosPoliza.FD_VENCIMIENTO).getTime()) {
	                        			renovacionVigor = true;
	                        			break;
	                        		}
	                        	}
	                        }
	                    }
	                    
	                    //Si no hay solicitud de renovación en vigor
	                    if (renovacionVigor == false) {
	                    	$mdDialog.hide();
	                    	vm.tipoSolicitud = 'RENOVACION_POLIZA';
	        				vm.templateForm = null;
	        				vm.templateForm = "src/solicitud/tipos.solicitud/renovar.poliza.html";
	        				vm.generaMovEcon = true;
	        				vm.objRenovarPolizas = {
	        					showModificacionGarantias: false,
	        					okModificacionGarantias: true,
	        					showCambioRiesgo: false,
	        					okCambioRiesgo: true,
	        					okCambioAsegurados: true,
								okCambioVencimiento: true,
								showCambioCorredor: false,
								okCambioCorredor: true
	        				}
	        				
	        				vm.form[vm.tipoSolicitud] = {
	        					XML_OBSERVACIONES: {},
	        					IM_PRIMA_NETA: vm.datosPoliza.IM_PRIMA_NETA,
	        					IM_PRIMA_NETA_RENOVACION: null
	        				}

	        				//Precargar primas
	        				if (vm.datosPoliza != null && vm.datosPoliza.IM_PRIMA_TOTAL != null) {
	        					vm.primas = {};
	        					vm.primas.IM_RECIBO_TOTAL = vm.datosPoliza.IM_PRIMA_TOTAL;
	        					vm.changePrimas();
	        				}
	        				
	        				TiposService.getGarantias({"ID_COMP_RAMO_PROD": vm.form.OPOLIZA.ID_COMP_RAMO_PROD})
	        				.then(function successCallback(response){
	        					if(response.status == 200){
	        						vm.garantias = response.data.GARANTIAS;

	        						//Si es de ciberempresas, dejar añadir solo la extensión de ciberdelincuencia
	        						if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
	        							vm.garantias = [];
	        							var garantia = response.data.GARANTIAS.find(x => x.ID_GARANTIA == 57);
	        							if (garantia != null) {
	        								vm.garantias.push(garantia);
	        							}
	        						}
	        					}
	        				});
	        				
	        				vm.gridCoberturasActuales = {
	        					enableSorting: true,
	        					enableHorizontalScrollbar: 1,
	        					paginationPageSizes: [15, 30, 50],
	        					paginationPageSize: 30,
	        					selectionRowHeaderWidth: 29,
	        					paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
	        					columnDefs: [
	        						{field: 'NO_GARANTIA', displayName: 'NOMBRE DE COBERTURA DE SEGURO', width: "70%" },
	        						{field: 'NU_CAPITAL', displayName: 'SUMA ASEGURADA', width: "30%", cellFilter: 'currency:"€" : 0'}
	        					]
	        				};
	        				
	        				BusquedaService.buscar({"ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA} , "garantiasByPoliza")
	        	            .then(function successCallBack(response){
	        	                if(response.status == 200){
	        	                    vm.coberturasActuales = response.data.GARANTIAS;
	        	                    vm.gridCoberturasActuales.data = vm.coberturasActuales;
	        	                }
	        	            });

							AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true})
							.then(function successCallback(response) {
								if(response.status == 200) {
									vm.lstBrokers = response.data.ASEGURADORAS;
								}
							}, function callBack(response) {
								if(response.status == 406 || response.status == 401){
									vm.parent.logout();
								}
							});

							vm.getColectivo = function (mediador) {
								AseguradoraService.getColectivosByMediador({ID_COMPANIA: vm.mediador, ID_COMP_RAMO_PROD: vm.form.OPOLIZA.ID_COMP_RAMO_PROD})
								.then(function successCallback(response) {
									if(response.status == 200) {
										vm.lstColectivos = response.data;
									}
								}, function callBack(response) {
									if(response.status == 406 || response.status == 401){
										vm.parent.logout();
									}
								});
							}

	                    } else {
    					    vm.msg.textContent("Ya existe una solicitud de renovación de póliza en vigor.")
 					        $mdDialog.show(vm.msg);
	                    }
	                });
				}

				break;
			case 44:
				vm.tipoSolicitud = 'CAMBIO_CORREDOR';
				vm.templateForm = "src/solicitud/tipos.solicitud/cambio.corredor.html";
				vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
				vm.form.OPOLIZA.DS_TIPO_MEDIO_PAGO = vm.datosPoliza.DS_TIPO_MEDIO_PAGO;

					AseguradoraService.getAseguradorasByFilter({ IN_COMISIONISTA: true })
						.then(function successCallback(response) {	
							if (response.status == 200) {
								vm.lstBrokers = response.data.ASEGURADORAS;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.parent.logout();
							}
						});

					vm.getColectivo = function () {
						AseguradoraService.getColectivosByMediador({ ID_COMPANIA: vm.mediador, ID_COMP_RAMO_PROD: vm.form.OPOLIZA.ID_COMP_RAMO_PROD })
							.then(function successCallback(response) {
								if (response.status == 200) {
									vm.lstColectivos = response.data;
								}
							}, function callBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parent.logout();
								}
							});
					}

					vm.getMediosPago = function(){
						TiposService.getMedioPago({ "ID_TIPO_POLIZA": vm.idColectivo })
						.then(function successCallback(response) {
							if(response.status == 200) {
								if(response.data.ID_RESULT == 0){
									vm.tiposMedioPago = response.data.TIPOS.TIPO;
								} else {
									vm.msg.textContent("No se han encontrado medios de pago para este mediador");
			        				$mdDialog.show(vm.msg);
								}
								
							}
						}, function callBack(response) {
							if(response.status == 406 || response.status == 401){
								vm.parent.logout();
							}
						});
					}

					vm.getObservaciones = function() {
						if(vm.idColectivo){
							mediador = vm.lstColectivos.find(x => x.ID_TIPO_POLIZA == vm.idColectivo).DS_TIPO_POLIZA;
						}
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.TX_OBSERVACIONES = 'SE ACTUALIZAN LOS DATOS DEL CORREDOR. \nNUEVO CORREDOR: ' + mediador;
					}
					break;
			case 51:
				vm.tipoSolicitud = 'MODIFICACION_POLIZA_PERIODO_VIGENCIA';
				vm.templateForm = null;
				vm.templateForm = "src/solicitud/tipos.solicitud/modificacion.poliza.html";
				vm.generaMovEcon = false;
				vm.precalculada = false;
				vm.precalculadaRecibo = false;
				vm.tipoSolicitudAsegurado = "XML_ALTA_ASEGURADO";
				vm.objModificacionPoliza = {
					showModificacionGarantias: false,
					okModificacionGarantias: true,
					showCambioRiesgo: false,
					okCambioRiesgo: true,
					showCambioAsegurados: false,
					okCambioAsegurados: true,
					okCambioVencimiento: true,
					okCambioCorredor: true
				}
				
				PolizaService.getDetail(vm.datosPoliza.ID_POLIZA)
				.then(function successCallback(response) {
				    // $mdDialog.cancel();
	                if (response.data.ID_RESULT == 0) {
	                	vm.datosPoliza = response.data;
	                }
	                
    				if (vm.datosPoliza != null && vm.datosPoliza.JS_ENVIADO != null) {
    					var objEnviado = JSON.parse(vm.datosPoliza.JS_ENVIADO);
						if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
							//Ciberempresa

							//Comprobar si es adhoc o no
							vm.isAdhoc = false;

							BusquedaService.buscar({ OPOLIZA: { ID_POLIZA: vm.form.OPOLIZA.ID_POLIZA } }, 'presupuestos')
							.then(function successCallback(response) {
								if (response.data != null && response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS.length > 0) {
									if (response.data.PRESUPUESTOS[0].CO_PRESUPUESTO === 'AD-HOC') {
										vm.isAdhoc = true;
									} else {
										vm.isAdhoc = false;
									}
								}
							}, function errorCallBack(response) {
								vm.isAdhoc = false;
							});
						}
    				}
				})
				.catch(function errorCallback(error){
					
				});

				vm.form[vm.tipoSolicitud] = {
					XML_OBSERVACIONES: {}
				}

				//Precargar primas
				// if (vm.datosPoliza != null && vm.datosPoliza.IM_PRIMA_TOTAL != null) {
				// 	vm.primas = {};
				// 	vm.primas.IM_RECIBO_TOTAL = vm.datosPoliza.IM_PRIMA_TOTAL;
				// 	vm.changePrimas();
				// }
				
				TiposService.getGarantias({"ID_COMP_RAMO_PROD": vm.form.OPOLIZA.ID_COMP_RAMO_PROD})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.garantias = response.data.GARANTIAS;

						//Si es de ciberempresas, dejar añadir solo la extensión de ciberdelincuencia
						if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
							vm.garantias = [];
							var garantia = response.data.GARANTIAS.find(x => x.ID_GARANTIA == 57);
							if (garantia != null) {
								vm.garantias.push(garantia);
							}
						}
					}
				});
				
				vm.gridCoberturasActuales = {
					enableSorting: false,
					enableHorizontalScrollbar: 0,
					selectionRowHeaderWidth: 29,
					enablePaginationControls: false,
					columnDefs: [
						{field: 'NO_GARANTIA', displayName: 'COBERTURA', width: "70%" },
						{field: 'NU_CAPITAL', displayName: 'SUMA ASEGURADA', width: "30%", cellFilter: 'currency:"€" : 0'}
					]
				};
				
				BusquedaService.buscar({"ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA} , "garantiasByPoliza")
	            .then(function successCallBack(response){
	                if(response.status == 200){
	                    vm.coberturasActuales = response.data.GARANTIAS;
	                    vm.gridCoberturasActuales.data = vm.coberturasActuales;
	                }
	            })
				break;
			case 56:
				if(vm.datosPoliza.ID_COMP_RAMO_PROD != 1){
					vm.msg.textContent("No es posible hacer la solicitud porque la póliza no es de BBVA.");
			        $mdDialog.show(vm.msg);
				}else {
					vm.tipoSolicitud = 'BBVA_MODCOBERTURAS';
					vm.templateForm = null;
					vm.templateForm = "src/solicitud/tipos.solicitud/modificacion.garantias.coberturas.html";
					vm.buscarPresupuesto(vm.datosPoliza.ID_POLIZA);
					vm.totalPrimaPoliza = vm.formatPrice(vm.datosPoliza.IM_PRIMA_TOTAL);
				}
				break;
			case 58:
				if(vm.datosPoliza.ID_COMP_RAMO_PROD == 2){
					vm.tipoSolicitud = 'MODIFICACION_CAPITALES';
					vm.templateForm = null;
					vm.templateForm = "src/solicitud/tipos.solicitud/modificacion.capitales.html";
					vm.garantias = JSON.parse(vm.datosPoliza.JS_ENVIADO);
					if(vm.garantias == undefined || vm.garantias.BLOCK_CAPITALES.lenght < 1){
						vm.botonBloqueado = false;
					}
					
					vm.cargarGarantiasPolizas(vm.datosPoliza.ID_POLIZA);					
					vm.cargarModalidadesDisponibles(vm.datosPoliza.ID_POLIZA);
					
					if(vm.datosPoliza.ID_FORMAPAGO != undefined){
						vm.NUEVA_ID_FORMAPAGO = vm.datosPoliza.ID_FORMAPAGO;
					}
					
				}
				
			break;			
			default:
				vm.template = "<h3>No existe pantalla</h3>";
				break;
			}
    		
    		if (parseInt(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD) != 41) {
        		vm.getFechaEfecto();
    		}

            if ((vm.form.OTIPO_SOLICITUD != null && vm.form.OTIPO_SOLICITUD.AFECTA_PRIMA == true ) && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 56) {
				var confirm = $mdDialog.confirm()
				.textContent("¿Esta solicitud va a generar movimiento económico?")
				.ok('Sí')
				.cancel('No');

				$mdDialog.show(confirm).then(function () {
					vm.generaMovEcon = true;
					$mdDialog.cancel();
				}, function () {
					vm.generaMovEcon = false;
					$mdDialog.cancel();
				});
            }
		}
    	
        vm.revig = function(){
            if(vm.form.OPOLIZA.ID_SITUAPOLIZA == 2 && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9){                    
                for(var i=0; i<vm.solCambios.length; i++){
                        if(vm.solCambios[i].ID_TIPO_SOLICITUD == 16){     
                        vm.solCambiosTot = [];
                             vm.solCambiosTot.push(vm.solCambios[i]); 
                             break;
                        }    
                }
                vm.solCambios =  vm.solCambiosTot;
            }
        }      
        
    	
    	vm.guardarSolicitudModificacion = function(){
    		var idCliente = "";
    		
    		//Encontrar id del cliente
    		if(vm.datosCliente != undefined){
    			idCliente = vm.datosCliente.ID_CLIENTE;
    		} else if(vm.form.OPOLIZA.LST_ASEGURADOS != undefined){
        		for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
        			if(vm.form.OPOLIZA.LST_ASEGURADOS[i].DS_TIPO_CLIENTE == 'Pagador'){
        				idCliente = vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_CLIENTE;
        			}
        		}
    		}
			
			//Se crea el objeto de entrada al servicio
			var obj = {
				OPOLIZA: {
					ID_POLIZA: vm.form.OPOLIZA.ID_POLIZA,
					ID_RAMO: vm.form.OPOLIZA.ID_RAMO,
					ID_COMPANIA: vm.form.OPOLIZA.ID_COMPANIA
				},
				OCLIENTE: {
					ID_CLIENTE: idCliente
				},
				OTIPO_SOLICITUD: {
					ID_TIPO_SOLICITUD: vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD
				}
			}
			
			vm.parent.abrirModalcargar(true);
			PolizaService.retarificaSuplemento(obj)
			.then(function successCallback(response){
				if(response.data != undefined && response.data.ID_RESULT == 0){
				    $mdDialog.cancel();
					if(response.data.PRESUPUESTO != undefined){
						response.data.SOLICITUD.PRESUPUESTO = response.data.PRESUPUESTO;
					}
					
					if(vm.busquedaSolicitudes != null && vm.busquedaSolicitudes.showNuevaSolicitud != undefined){
						vm.busquedaSolicitudes.showNuevaSolicitud(response.data.SOLICITUD);
					} else if (vm.busquedaPolizas != null && vm.busquedaPolizas.showNuevaSolicitud != undefined) {
						vm.busquedaPolizas.showNuevaSolicitud(response.data.SOLICITUD, true);
					}
				} else {
					vm.msg.textContent(response.data.DS_RESULT);
			        $mdDialog.show(vm.msg);
				}
			})
			.catch(function errorCallback(error){
				vm.msg.textContent('Ha ocurrido un error al retarificar la solicitud.');
		        $mdDialog.show(vm.msg);
			});
    	}
    	
    	//Paso 2 de modificación garantías
    	vm.tarificaPoliza = function() {
    		//Seleccionamos el paso en el que estamos de modificación de garantías
    		vm.pasoGarantia = 2;
    		//Cargamos gift de carga
			vm.carga = true;
			//Variable que indica si se han hecho cambios en los capitales
			var changesInCapitales = false;
			
			var obj = vm.modificacionGarantias;
			
			//Comprobamos si hay algún cambio en los capitales
			if(JSON.stringify(vm.modificacionGarantiasCapitales) != JSON.stringify(obj.HOGAR.BLOCK_CAPITALES)){
				changesInCapitales = true;
			}
			
			//Al objeto de entrada hay que enviarle el campo ID_RAMO y el campo CIA que actualmente no los tiene, se los añadimos
			if(obj.ID_RAMO == undefined){
				obj.ID_RAMO = vm.form.OPOLIZA.ID_RAMO
			}
			
			if(obj.CIA == undefined){
				obj.CIA = {
					ID_COMPANIA: vm.form.OPOLIZA.ID_COMPANIA
				}
			}
			
			//Llamada a servicio
			PolizaService.tarifica(obj, changesInCapitales)
			.then(function successCallback(response){
				if(response.data != undefined){
					//A modificacionGarantias le cambiamos el valor por lo devuelto de la llamada
					vm.modificacionGarantias = response.data;
					
					if(vm.modificacionGarantias.MODALIDADES){
						//Recogemos la lista de modalidades
						vm.listModalidades = vm.modificacionGarantias.MODALIDADES.MODALIDAD;
					} 
					
				}
				
				vm.carga = false;
			})
			.catch(function errorCallback(error){
				//Si falla le metemos mensaje de error
				vm.modificacionGarantias = {
						ID_RESULT: 500,
						DS_RESULT: "Ha ocurrido un error"
				}
				vm.carga = false;
			});
		}
    	
    	//Paso 3 de modificación garantías
    	vm.reemplazoPoliza = function(){
    		
    		//Sellecionamos el psao en el que estamosen modificación de garantías
    		vm.pasoGarantia = 3;
    		
    		//Mostramos gift de carga
			vm.carga = true;
			
			//Se crea objeto de entrada para el servicio
			var obj = {
					"PRESUPUESTO": vm.modificacionGarantias.PRESUPUESTO,
					"ID_PRESUPUESTO": vm.modificacionGarantias.ID_PRESUPUESTO,
					"MODALIDADES": vm.modificacionGarantias.MODALIDADES
			};

			PolizaService.reemplazo(obj)
			.then(function successCallback(response){
				
				if(response.data != undefined){
					vm.modificacionGarantias = response.data;
				}
				
				vm.carga = false;
			})
			.catch(function errorCallback(error){
				//Si falla le metemos mensaje de error
				vm.modificacionGarantias = {
						ID_RESULT: 500,
						DS_RESULT: "Ha ocurrido un error"
				}
				vm.carga = false;
			});
			
    	}
    	
    	vm.toFixed = function(value){
    		value = value.toFixed(2);
    		return parseFloat(value);
    	}
    	
    	vm.changeGarantia = function(garantia, modalidad, index){
    		
    		//Se le cambia el IN_SELECTED a la garantía
    		garantia.IN_SELECTED = !garantia.IN_SELECTED;
    		
    		if(vm.modificacionGarantias.MODALIDADES.MODALIDAD != undefined){
    			
    			//Recorremos las modalidades para saber en qué modalidad está
    			for(var i = 0; i < vm.modificacionGarantias.MODALIDADES.MODALIDAD.length; i++){
    				if(vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].ID_MODALIDAD === modalidad.ID_MODALIDAD){
    					
    					//Garantía de ampliación
    					var ampliValor = vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].GARANTIAS.GARANTIA.find(X => X.ID_GARANTIA === 1076);
    					
    					//Si la garantía de ampliaciones alto valor está selecionada, y la garantía seleccionada es 1074 o 1075 o 1077 o 1081 no dejamos editar
    					if (!(ampliValor != undefined && ampliValor.IN_SELECTED == true && (garantia.ID_GARANTIA == 1074 || garantia.ID_GARANTIA == 1075 || garantia.ID_GARANTIA == 1077 || garantia.ID_GARANTIA == 1081))){
    						//Se le suma o resta a la prima total según el valor de IN_SELECTED
    			    		if (garantia.IN_SELECTED == false){
    			    			modalidad.IM_PRIMA_ANUAL_TOT -= garantia.IM_PRIMA_NETA;
    			    		} else {
    			    			modalidad.IM_PRIMA_ANUAL_TOT += garantia.IM_PRIMA_NETA;
    			    		}

    						//Recorremos garantías
        					for(var j = 0; j < vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].GARANTIAS.GARANTIA.length; j++){
        						//Setear a modificacionGarantias la nueva garantía
        						if(vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].GARANTIAS.GARANTIA[j].ID_GARANTIA == garantia.ID_GARANTIA){
        							vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].GARANTIAS.GARANTIA[j] = JSON.parse(JSON.stringify(garantia));
        						}
        						
        						var garantiaFor = vm.modificacionGarantias.MODALIDADES.MODALIDAD[i].GARANTIAS.GARANTIA[j];
        						//Si se selecciona Ampliaciones alto valor, seleccionamos varias garantías más
        						if((garantia.ID_GARANTIA == 1076 && garantia.IN_SELECTED == true) && (garantiaFor.ID_GARANTIA == 1074 || garantiaFor.ID_GARANTIA == 1075 ||garantiaFor.ID_GARANTIA == 1077 ||garantiaFor.ID_GARANTIA == 1081)){
        							
        							//Según el IN_SELECTED de la garanía seleccionada automáticamente, se le suma o resta a la prima anual
        							if(garantiaFor.IN_SELECTED === false){
        								modalidad.IM_PRIMA_ANUAL_TOT += garantiaFor.IM_PRIMA_NETA;
        							}
        							
        							garantiaFor.IN_SELECTED = true;
        						} 
        						//Si se quita garantía de ampliación alto valor se deselecciona la 1077, restándole su importe
        						else if (garantia.ID_GARANTIA == 1076 && garantia.IN_SELECTED == false && garantiaFor.ID_GARANTIA == 1077) {
        							garantiaFor.IN_SELECTED = false;
        							modalidad.IM_PRIMA_ANUAL_TOT -= garantiaFor.IM_PRIMA_NETA;
        						}
        					}
        					break;
    					} 
    				}
    			}
    		}
    		
    	}
		
    	
		vm.comprobarObjSolicitud = function(obj, tipoSolicitud) {
			var listTipoSolicitud = ["MODIFICACION_GARANTIAS", "CAMBIO_DOMICILIO", "CAMBIO_OTROS_DATOS_POLIZA", "CUENTA_BANCARIA", "CAMBIO_RIESGO", "MODIFICACION_SEGUNDO_CONDUCTOR", "CAMBIO_PROPIETARIO",
				"CAMBIO_TOMADOR", "ALTA_ASEGURADO", "BAJA_ASEGURADO", "CAMBIO_DATOS_ASEGURADO","CAMBIO_DATOS_TOMADOR", "ALTA_BENEFICIARIO", "BAJA_BENEFICIARIO", "CAMBIO_DATOS_BENEFICIARIO", "GESTION_ASEGURADOS"];
			var xmlObservaciones = {};
			
			//Comprobamos que no hay objeto de otro tipo de solicitud, si lo hay se elimina
			for(var i = 0; i < listTipoSolicitud.length; i++){
				if (obj[listTipoSolicitud[i]] != undefined && listTipoSolicitud[i] != tipoSolicitud) {
					xmlObservaciones = obj[listTipoSolicitud[i]].XML_OBSERVACIONES;
					delete obj[listTipoSolicitud[i]];
					break;
				}
			}
			
			if(obj[tipoSolicitud] == undefined) {
				if(obj.undefined != undefined && Object.keys(obj.undefined).length != 0) {
					obj[tipoSolicitud] = obj.undefined;
					delete obj.undefined;
				} else {
					
					if(obj[tipoSolicitud] == undefined){
						obj[tipoSolicitud] = {};
						obj[tipoSolicitud].XML_OBSERVACIONES = xmlObservaciones;
					}else{
						obj[tipoSolicitud].XML_OBSERVACIONES = xmlObservaciones;
					}
					
				}
			}
		}
    	
		vm.buscarConductor = function(){
			var nombre;
			var apellido1;
			var apellido2;
			var SEGUNDO_CONDUCTOR;
			var noExiste = false;
			
			var obj = BusquedaService.buscar(
					{ "ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA }, 
						"segundoConductor")
    		.then(function successCallback(response){
    			if(response.status == 200){
    					if(response.data.ID_RESULT == undefined || response.data.ID_RESULT == null){
    						vm.msg.textContent("No existe segundo conductor")
  					        $mdDialog.show(vm.msg);
    					}
    					if(response.data.ID_RESULT == 0){
    				vm.nombre = response.data.NO_NOMBRE;
    				vm.apellido1 = response.data.NO_APELLIDO1;
    				vm.apellido2 = response.data.NO_APELLIDO2;
    				vm.SEGUNDO_CONDUCTOR = 	vm.nombre + " " + vm.apellido1 + " " + vm.apellido2;
    				vm.noExiste = true;
    					}else{
    					    vm.msg.textContent(response.data.DS_RESULT)
 					        $mdDialog.show(vm.msg);
    					}
    			}
    		});
		}
		
		vm.calcEdadConducir = function(fecha){

			var feCarne = new Date(fecha);
			var feNac = new Date(vm.form.MODIFICACION_SEGUNDO_CONDUCTOR.XML_CAMBIO_SEGUNDO_CONDUCTOR.XML_SEGUNDO_CONDUCTOR_ACTUALIZADO.FD_NACIMIENTO);
			var edad = feCarne.getFullYear() - feNac.getFullYear();
			var mes = feCarne.getMonth() - feNac.getMonth(); 
			var mayorEdad;
			
			
		    if (mes < 0 || (mes === 0 && feCarne.getDate() < feNac.getDate())) {
		        edad--;
		    }

		    if(edad < 18){
		    	vm.msg.textContent("La edad de obtención del carnet de conducir es inferior a la mayoría de edad")
			        $mdDialog.show(vm.msg);
		    		vm.form.MODIFICACION_SEGUNDO_CONDUCTOR.XML_CAMBIO_SEGUNDO_CONDUCTOR.XML_SEGUNDO_CONDUCTOR_ACTUALIZADO.FD_CARNET = "";
		    }
		}
		
		vm.calcEdad = function(fecha){
			if(fecha) {
				var fechNacimiento = fecha;
				var hoy =  new Date();
				if(typeof fechNacimiento == 'string')
					fechNacimiento = new Date(fechNacimiento);
				var edad = hoy.getFullYear() - fechNacimiento.getFullYear();
				var mes = hoy.getMonth() - fechNacimiento.getMonth();
				var mayorEdad;
				
				if (mes < 0 || (mes === 0 && fechNacimiento.getDate() < hoy.getDate())) {
					edad--;
				}

				if(edad < 18){
					fecha = "";
					vm.msg.textContent("La fecha de nacimiento es inferior a la mayoría de edad");
					$mdDialog.show(vm.msg);
				}
			}
			
			return fecha;
		}

		vm.buscarPropietario = function(){
			var nombre;
			var apellido1;
			var apellido2;
			var PROPIETARIO;
			var noExiste = false;
			
			var obj = BusquedaService.buscar({ "ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA }, "propietario")
    		.then(function successCallback(response){
    			if(response.status == 200){
					if(response.data.ID_RESULT == undefined || response.data.ID_RESULT == null){
						vm.msg.textContent("No existe propietario")
						$mdDialog.show(vm.msg);
					}
					if(response.data.ID_RESULT == 0){
						vm.nombre = response.data.NO_NOMBRE;
						vm.apellido1 = response.data.NO_APELLIDO1;
						vm.apellido2 = response.data.NO_APELLIDO2;
						vm.PROPIETARIO = 	vm.nombre + " " + vm.apellido1 + " " + vm.apellido2;
						vm.noExiste = true;
					}else{
						vm.msg.textContent(response.data.DS_RESULT)
						$mdDialog.show(vm.msg);
					}
    			}
    		});
		}
		
    	vm.getFechaEfecto = function() {
			if (vm.tipoSolicitud != null) {
				if(vm.form[vm.tipoSolicitud] == undefined) {
					vm.form[vm.tipoSolicitud] = {};
				}
				if(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES == undefined) {
					vm.form[vm.tipoSolicitud].XML_OBSERVACIONES = {};
				}
				
				if(vm.tipoFecha == null) {
					vm.tipoFecha = 0;
				}
				
				if(vm.tipoFecha == 0) {
					if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51){
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date();
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
						if(vm.parent.isRolAdmin()){
							vm.minDateBajaDiferente = new Date(new Date().setDate(new Date().getDate() -7));
						}else {
							vm.minDateBajaDiferente = new Date();
						}
					} else {
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_VENCIMIENTO);
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
					}
				} else if (vm.tipoFecha == 2) {
	            	vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_INICIO);
				} else if (vm.tipoFecha == 3) {
	            	vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date();
					vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
				} else {
					if (vm.subTipoSolicitud != null && vm.subTipoSolicitud.ID_TIPO_SOLICITUD == 16) {
						//Si la solicitud es de otros datos de póliza -> Revigorización, se muestra la fecha de efecto
		            	vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_INICIO);
					} else if (vm.form.OTIPO_SOLICITUD != null && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 35) {
						//Si la solicitud es de renovación de póliza, solo mostramos fecha diferente y rellenamos las dos fechas
						if (vm.form.OPOLIZA.FD_INICIO != null && vm.form.OPOLIZA.FD_INICIO != "") {
			            	vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_VENCIMIENTO);
						}
						if (vm.form.OPOLIZA.FD_VENCIMIENTO != null && vm.form.OPOLIZA.FD_VENCIMIENTO != "") {
						    vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO = null;
						}
					} else {
						if(vm.form.OTIPO_SOLICITUD && (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 8 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 10 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 30)) {
							vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date();
						} else {
							vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = "";
						} 
					}
					vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
					
					if (vm.tipoFecha == 1 && vm.solicitudSL() == true && vm.tipoHead == 5) {
						vm.minDateBajaDiferente = new Date();
					} else {
						vm.minDateBajaDiferente = new Date("1800-01-01");
					}
				}
				vm.changeFdEfecto();
			}
		}
    	
    	
		//Métodos de llamada de tipos de solicitud
    	function callTiposSolicitud(json, load){
    		var solicitudes;
    		if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null && vm.form.OPOLIZA != ""){
    			load = true;
                
                if (vm.form.OPOLIZA.ID_COMP_RAMO_PROD != null) {
                    json.ID_COMP_RAMO_PROD = vm.form.OPOLIZA.ID_COMP_RAMO_PROD;
                }
                
    			solicitudes = SolicitudService.getTiposSolicitudFilter(json)
    			.then(function successCallback(response){
                    if(response.status == 200 && response.data.TIPOS_SOLICITUD != null && response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD != null){                        
                        load = false; 
						var listTiposSolicitudes = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD;
						if(vm.form.OPOLIZA.ID_PRODUCTO == 3 || vm.form.OPOLIZA.ID_PRODUCTO == 4 || vm.form.OPOLIZA.ID_PRODUCTO == 5 || vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 29){                     
                        	vm.listTiposSolicitudes = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD;
						
							TiposService.getTipos({"NO_CODIGO": "TIPO_SOLICITUD_PRODUCTO_ROL"})
							.then(function successCallback(response) {
								if (response.status == 200) {
									// var listSolRolPadre = [];
									var listSolRolHija = [];
									if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
										for(var i=0; i < response.data.TIPOS.TIPO.length; i++){					
											var listRol = response.data.TIPOS.TIPO[i].DS_TIPOS;
											listRol = listRol.split(",");
											if(listRol.includes(vm.rol)){
												var listTiposSolicitudesRol = response.data.TIPOS.TIPO[i].CO_TIPO;
												if (listTiposSolicitudesRol != null) {
													
													listTiposSolicitudesRol = listTiposSolicitudesRol.split("|");
													var solHijas = listTiposSolicitudesRol[1].split(',');
													
													// if(vm.tipoHead == idSolicitudPadre){
														for (let i = 0; i < solHijas.length; i++) {
															var idSolicitudHija = solHijas[i];
															if(vm.listTiposSolicitudes.find(x => x.ID_TIPO_SOLICITUD == idSolicitudHija)){
																var indexSolHija = vm.listTiposSolicitudes.findIndex(x => x.ID_TIPO_SOLICITUD == idSolicitudHija);
																listSolRolHija.push(vm.listTiposSolicitudes[indexSolHija]);
															}
														}
													// }
												}
											}
										}
									}
				
									listTiposSolicitudes = listSolRolHija;
									//si la poliza está cancelada
									if(vm.form.OTIPO_SOLICITUD == "" && vm.form.OPOLIZA.ID_SITUAPOLIZA == 2){
										for(var i = 0; i < listTiposSolicitudes.length; i++){ 
											if(listTiposSolicitudes[i].ID_TIPO_SOLICITUD == 9){
												vm.sol=[]; 
												vm.sol.push(listTiposSolicitudes[i]); 
												break;
											}    
										}
										vm.solTotal = vm.sol;
									} else if (vm.form.OTIPO_SOLICITUD != "" && vm.form.OPOLIZA.ID_SITUAPOLIZA == 2) {
										if(vm.form.OPOLIZA.ID_SITUAPOLIZA == 2 && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9) {
											for(var i = 0; i < listTiposSolicitudes.length; i++){     
												var solCambiosTot = [];
												if(listTiposSolicitudes[i].ID_TIPO_SOLICITUD == 16){
													solCambiosTot.push(listTiposSolicitudes[i]); 
													break;
												}    
											}
											vm.solCambios = solCambiosTot;
										}
									}  else if (vm.form.OTIPO_SOLICITUD != "" && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9 && vm.form.OPOLIZA.ID_SITUAPOLIZA != 2) {
										vm.solCambios = listTiposSolicitudes;
									} else if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 9 && vm.form.OPOLIZA.ID_SITUAPOLIZA != 2) {
										vm.solTotal = listTiposSolicitudes;
									}
									//solicitudes ya filtradas por ramo
									return vm.solTotal;

								}
							}, function callBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parentApp.logout();
								}
							});
						} else {

						//si la poliza está cancelada
						if(vm.form.OTIPO_SOLICITUD == "" && vm.form.OPOLIZA.ID_SITUAPOLIZA == 2){
							for(var i = 0; i < listTiposSolicitudes.length; i++){ 
								if(listTiposSolicitudes[i].ID_TIPO_SOLICITUD == 9){
									vm.sol=[]; 
									vm.sol.push(listTiposSolicitudes[i]); 
									break;
								}    
							}
							vm.solTotal = vm.sol;
						} else if (vm.form.OTIPO_SOLICITUD != "" && vm.form.OPOLIZA.ID_SITUAPOLIZA == 2) {
							if(vm.form.OPOLIZA.ID_SITUAPOLIZA == 2 && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9) {
								for(var i = 0; i < listTiposSolicitudes.length; i++){     
									var solCambiosTot = [];
									if(listTiposSolicitudes[i].ID_TIPO_SOLICITUD == 16){
										solCambiosTot.push(listTiposSolicitudes[i]); 
										break;
									}    
								}
								vm.solCambios = solCambiosTot;
							}
						}  else if (vm.form.OTIPO_SOLICITUD != "" && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9 && vm.form.OPOLIZA.ID_SITUAPOLIZA != 2) {
							vm.solCambios = listTiposSolicitudes;
						} else if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 9 && vm.form.OPOLIZA.ID_SITUAPOLIZA != 2) {
							vm.solTotal = listTiposSolicitudes;
						}
						//solicitudes ya filtradas por ramo
						return vm.solTotal;
						}
                        
                    } else {
                    	load = false;
                    	vm.solTotal = [];
                    	return vm.solTotal;
                    }
                });

                vm.getFechaEfecto();
                //devuelve todas las solicitudes sin filtro de ramo
                return solicitudes;
            }
        }
    	
    	// Búsquedas AutoComplete
    	vm.querySearch = function(query, list, key){
    		var results = query ? list.filter( createFilterFor(query, key) ) : list;
    		var deferred;
    		if (self.simulateQuery) {
		        deferred = $q.defer();
		        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		        return deferred.promise;
    		} 
    		else {
		        return results;
		    }
    	}
    	
    	function createFilterFor(query, key) {
			if(key == 'DS_TIPO_VIA') {
				var uppercaseQuery = query.charAt(0).toUpperCase() + query.slice(1);
			} else {
				var uppercaseQuery = query.toUpperCase();
			}
	
    		return function filterFn(list) {
    			if(key != "DS_VERSION")
    				return (list[key].indexOf(uppercaseQuery) === 0);
    			else
    				return (list[key].indexOf(uppercaseQuery) >= 0);
    		};
    	}
    	
    	vm.getMarcas = function(value){
    		MotorService.getMarcas(value)
    		.then(function successCallback(response){
    			vm.marcas = response.data.MARCA;
    		});
    	}
    	
    	//Conseguir datos de modelos
    	vm.getModelos = function(){
            if(vm.modelos == undefined){
                vm.searchModelo = "";
                vm.searchVersion = "";
                // MotorService.getModelos(1, vm.form.MARCA.CO_MARCA)
                // .then(function successCallback(response){
                //     vm.modelos = response.data.MODELO;
                // });
                MotorService.getModelos(1, vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MARCA_AUTO.CO_MARCA)
                .then(function successCallback(response){
                    vm.modelos = response.data.MODELO;
                });
            }
    	}
    	
    	//Conseguir datos de versiones
    	vm.getVersiones = function(){
            if(vm.versiones == undefined){
                vm.searchVersion = "";
                MotorService.getVersiones(1, vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MARCA_AUTO.CO_MARCA, vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MODELO.CO_MODELO)
                .then(function successCallback(response){
                    vm.versiones = response.data.VERSION;
                    for (var i = 0; i < vm.versiones.length; i++) {
                        vm.versiones[i].text = vm.versiones[i].DS_VERSION +
                                               " - F.LANZ: " + vm.versiones[i].FD_LANZAMIENTO +
                                               " - PUERTAS: " + vm.versiones[i].NU_PUERTAS +
                                               " - POT: " + vm.versiones[i].NU_POTENCIA +
                                               " - TARA: " + vm.versiones[i].NU_CILINDRADA +
                                               " - PLAZAS: " + vm.versiones[i].NU_PLAZAS;
                    }    
                });
            }		
    	}
    	
    	//Identificar la localidad por pueblos
    	// vm.updateDir = function(valor){
    	// 	if(valor.length == 5){
    	// 		TiposService.getLocalidades(valor)
    	// 		.then(function successCallBack(response){
    	// 			vm.localidades = response.data.LOCALIDAD;
    	// 			vm.form.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
    	// 			if(vm.localidades.length == 1){
    	// 				vm.form.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD
    	// 			}
    	// 		}, function errorCallBack(response){
    	// 		});
    	// 	}
		// }
    	vm.updateDir = function (valor, index) {
            if (valor.length == 5) {
            	
            	//Si la póliza es de hogar
            	if(vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null && vm.form.OPOLIZA.ID_RAMO == 20 && (vm.form.OPOLIZA.ID_COMPANIA == 78 || vm.form.OPOLIZA.ID_COMPANIA == 111)){
                    vm.localidades = [];
        			vm.parent.abrirModalcargar(true);
                    HogarService.getPlantilla(valor.substring(0, 2))
                    .then(function successCallBack(response) {
                    	var codAseguradora = response.data.ID_RESULT;
                    	HogarService.getLocalidades(valor, codAseguradora)
    	                .then(function successCallBack(response) {
                        	$mdDialog.cancel();
    	                	vm.afterUpdateDir(response);
    	                }, function errorCallBack(response) { 
                        	$mdDialog.cancel();
    	                });
                    }, function errorCallBack(response) { 
                    	$mdDialog.cancel();
                    });
				} else {
	                vm.localidades = [];
	                TiposService.getLocalidades(valor)
	                .then(function successCallBack(response) {
	                	vm.afterUpdateDir(response);
	                }, function errorCallBack(response) { });
				}
            }
        }
    	
    	vm.afterUpdateDir = function (response) {
    		if (!Array.isArray(response.data.LOCALIDAD)) {
                vm.localidades = [];
                vm.localidades.push(response.data.LOCALIDAD);
            } else {
                vm.localidades = response.data.LOCALIDAD;
                
                if(vm.tipoSolicitud == 'CAMBIO_DOMICILIO'){
                    if (vm.localidades.length > 1) {
                        LocalidadesService.elegirLocalidad(vm.localidades, vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO);
                    } else{
                        vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                    }
                }
                if(vm.tipoSolicitud == 'CAMBIO_RIESGO'){
                    if (vm.localidades.length > 1) {
                        LocalidadesService.elegirLocalidad(vm.localidades, vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA);
                    }else{
                        vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                    }
                }
                if (vm.tipoSolicitud == 'CAMBIO_DOMICILIO') {      
                	vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                	vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                	vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                    vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
                }
                if (vm.tipoSolicitud == 'CAMBIO_RIESGO') {    
                    vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                    vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.DS_CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                    vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
                }
                 
                vm.form[vm.tipoSolicitud][vm.tipoSolicitudAsegurado].ID_LOCALIDAD = vm.localidades[0].ID_LOCALIDAD;
                vm.form[vm.tipoSolicitud][vm.tipoSolicitudAsegurado].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                vm.form[vm.tipoSolicitud][vm.tipoSolicitudAsegurado].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                vm.form[vm.tipoSolicitud][vm.tipoSolicitudAsegurado].NO_PROVINCIA = vm.localidades[0].NO_PROVINCIA;
                 
            } 
    	}
		
		//Recuperar los productos de una aseguradora
    	vm.getProductos = function(compania, ramo){
			TiposService.getCompRamoProd({"ID_COMPANIA":compania, "ID_RAMO":ramo})
    		.then(function successCallBack(response){
    			if(response.status == 200){
					vm.tipos.productos = response.data.CIARAMOS.CIA_RAMO;
				}
    		})
    		//vm.form.ID_PRODUCTO.value = "";
		}
		
		vm.iniciarUIGrid = function() {
            vm.garantiasCliente = [];
            
            BusquedaService.buscar({"ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA} , "garantiasByPoliza")
            .then(function successCallBack(response){
                if(response.status == 200){
                    vm.garantiasCliente = response.data.GARANTIAS;
                    vm.gridGarantias.data = vm.garantiasCliente;
                }
            })
        
			vm.listaGarantias = [];
			vm.gridGarantias = {
				enableSorting: true,
				enableHorizontalScrollbar: 1,
				paginationPageSizes: [15, 30, 50],
				paginationPageSize: 30,
				enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
				columnDefs: [
					{field: 'NO_GARANTIA', displayName: 'Nombre'},
					{field: 'NU_CAPITAL', displayName: 'Capital', cellFilter: 'currency:"€" : 2'}
				]
			};
			vm.gridGarantias.onRegisterApi = function (gridApi) {
				vm.gridApi = gridApi;
				vm.listaSeleccionados = [];
				gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
				gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
			}
			vm.seleccionable = function() {
				return true;
			}
			// vm.listaGarantias = [];
			// vm.gridGarantias.data = [];
			// Btn - Añadir garantías al ui-grid 
			
			
			vm.addGarantia = function() {
				vm.exist = false;
				
				for(var i=0; i< vm.gridGarantias.data.length; i++){					
				    if(vm.gridGarantias.data[i].NO_GARANTIA == vm.garantiaSeleccionada.NO_GARANTIA){    
				    vm.exist = true;         
                        vm.msg.textContent('Ya está incluida ésta garantía');
        				$mdDialog.show(vm.msg);       				
        				 break;
                     }               
				}		
				
				if(vm.garantiaSeleccionada.NU_CAPITAL == undefined || vm.garantiaSeleccionada.NU_CAPITAL == null || vm.garantiaSeleccionada.NU_CAPITAL == ""){
					vm.garantiaSeleccionada.NU_CAPITAL = 0;
				}
				
				if(!vm.exist){
				vm.gridGarantias.data.push({
					'ID_POLIZA': vm.form.OPOLIZA.ID_POLIZA,
					'NO_GARANTIA': vm.garantiaSeleccionada.NO_GARANTIA,
					'NU_CAPITAL': vm.garantiaSeleccionada.NU_CAPITAL,
					'ID_GARANTIA': vm.garantiaSeleccionada.ID_GARANTIA,
					'ID_GARANTIA_PRODUCTO':vm.garantiaSeleccionada.ID_GARANTIA_PRODUCTO,
					'IS_NEW': true,
				});
				vm.listaGarantias = vm.gridGarantias.data;
				}
				vm.garantiaSeleccionada = " ";
				vm.garantiaSeleccionada.NU_CAPITAL = " ";

			}
			
			vm.showNuevaGarantiaFunction = function () {
				vm.showNuevaGarantia = !vm.showNuevaGarantia;
			}
			

			// Btn - Modificar garantías seleccionadas del ui-grid
			vm.editarGarantia = function(){
				var modificado;
				
				 if(vm.listaSeleccionados[1] != null){
		                vm.msg.textContent('Sólo se puede modificar una garantía simultáneamente');
		        			$mdDialog.show(vm.msg);
		                	vm.gridApi.selection.clearSelectedRows();
		                }else{
		            		for(var i = 0; i < vm.gridGarantias.data.length; i++) {
		    					for(var ii = 0; ii < vm.listaSeleccionados.length; ii++) {
		    						if(vm.gridGarantias.data[i].$$hashKey == vm.listaSeleccionados[ii].$$hashKey) {
		    							vm.modificado = vm.gridGarantias.data[i];
		    						}
		    					}
		    			    }
		    			    		$mdDialog.show({
		    						parent: angular.element(document.body),
		    						contentElement: '#cambioCapitales',
		    			    		});			                	
		                }  				
			}
			
			vm.aceptarCapMod = function(capModif){
				
				if(capModif == undefined){
					$mdDialog.hide();
					vm.gridApi.selection.clearSelectedRows();
					
				}else{
				vm.capitalModificado = capModif;
				vm.NU_CAPITALMODIFICADO = "";
				$mdDialog.hide();
				
				if(vm.capitalModificado == undefined || vm.capitalModificado == null || vm.capitalModificado == ""){
					vm.capitalModificado = 0;
				}
				
			    vm.mod = {
			    	'ID_POLIZA': vm.form.OPOLIZA.ID_POLIZA,
					'NO_GARANTIA': vm.modificado.NO_GARANTIA,
					'ID_GARANTIA': vm.modificado.ID_GARANTIA,
					'ID_GARANTIA_PRODUCTO':vm.modificado.ID_GARANTIA_PRODUCTO,
			    	'NU_CAPITAL': vm.capitalModificado,
			    	'IS_UPDATED' :true,
			    };
				vm.modificados.push(vm.mod);
				vm.elementoSeleccionado.NU_CAPITAL = vm.capitalModificado;
				vm.gridApi.selection.clearSelectedRows();
				}
		}
			vm.cancelarCapMod= function(capModif){
				$mdDialog.hide();
				vm.gridApi.selection.clearSelectedRows();			
			}
				
			// Btn - Eliminar garantías seleccionadas del ui-grid
			vm.eliminarGarantia = function() {
				var indx;
				var eliminado;

				//Comprobar si se va a eliminar alguna garantía que no sea la 57 (extensión de ciberdelincuencia)
				if (vm.listaSeleccionados.length > 0 && vm.form.OPOLIZA != null && (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5)) {
					var garantia = vm.listaSeleccionados.find(x => x.ID_GARANTIA != 57);
					if (garantia != null) {
		                vm.msg.textContent('Sólo se puede eliminar la garantía de extensión de ciberdelincuencia');
						$mdDialog.show(vm.msg);
						return null;
					}
				}
				
				for(var i = 0; i < vm.gridGarantias.data.length; i++) {
					for(var ii = 0; ii < vm.listaSeleccionados.length; ii++) {
						if(vm.gridGarantias.data[i].$$hashKey == vm.listaSeleccionados[ii].$$hashKey) {
							vm.indx = vm.gridGarantias.data.indexOf(vm.gridGarantias.data[i]);
							vm.eliminado = vm.gridGarantias.data[i];
							vm.eliminados.push(vm.eliminado); 
							vm.gridGarantias.data.splice(vm.indx, 1);
						}
					}
				}
			};
		}

		
		vm.getCausa = function( idCausa ){
			vm.showSave = true;
			if( vm.tipos.anulaciones != undefined && vm.tipos.anulaciones != null){
				for (var i = 0; i < vm.tipos.anulaciones.length; i++){
					if( idCausa == vm.tipos.anulaciones[i].ID_CAUSAANULACION){
						vm.form.BAJA_POLIZA.DS_CAUSAANULACION = vm.tipos.anulaciones[i].DS_CAUSAANULACION;
						vm.form.DS_CAUSAANULACION = vm.tipos.anulaciones[i].DS_CAUSAANULACION;
						vm.form.BAJA_POLIZA.ID_CAUSAANULACION = vm.tipos.anulaciones[i].ID_CAUSAANULACION;
						vm.form.ID_CAUSAANULACION = vm.tipos.anulaciones[i].ID_CAUSAANULACION;
						break;
					}
				}				
			}		
			
			//Si es desestimiento comprobar que no han pasado 15 días desde la fecha fin de vigor de la póliza
			if((idCausa == 203 || idCausa == 1 || idCausa == 5 || idCausa == 10 || idCausa == 25) && vm.form != null && vm.form.BAJA_POLIZA != null && vm.form.BAJA_POLIZA.XML_OBSERVACIONES != null && vm.form.BAJA_POLIZA.XML_OBSERVACIONES.FD_EFECTO != null){
				var fechaEfecto = new Date(vm.form.BAJA_POLIZA.XML_OBSERVACIONES.FD_EFECTO);
				
				var fechaEfecto15 = new Date(fechaEfecto);
				fechaEfecto15.setDate(fechaEfecto15.getDate() + 16);
				
                var actualDate = new Date();
				
                //Si la fecha existe
				if(!isNaN(new Date(fechaEfecto).getMonth())){
                    if(actualDate.getTime() <= fechaEfecto15.getTime()){
                    	vm.showSave = true;
                    }else{
                    	vm.showSave = false;
                    	vm.msg.textContent("La solicitud de baja con causa 'Desestimiento', solo se puede realizar si no supera 15 días desde la fecha de efecto de la póliza");
                    	$mdDialog.show(vm.msg);
                    }
				}
			}	
		}
		
		vm.formatDate = function( date ){
			if(date != undefined && date != null && date != ""){
				if (typeof date == "string" && date.length >= 10) {
                    date = date.substr(0,10);
                    date = new Date(date);
				}
				var day = date.getDate();
					if(day < 10){
						day = "0" + day;	
					}
					
				var month = date.getMonth() + 1;
					if(month < 10){
						month = "0" + month;	
					}
					
				var year = date.getFullYear();
				
				
				
				date = year + "-" + month + "-" + day;
				return date;
			}
		}
		
		vm.getData = function(){
			var listAnulaciones = vm.tipos.anulaciones;
			var listTipos = vm.tipos.modalidades;
			var listProductos = vm.tipos.productos;
			var listMedios = vm.tipos.mediosPago;
			var listFormas = vm.tipos.formasPago;
			var listBancos = vm.tipos.bancos;
            var listVias = vm.tipos.tiposVia;
			vm.fechaDesistimientoOk = true;
			vm.msgDesistimientoKo = "";
			vm.msgWarn = '';
			
			if(vm.tipoHead == 5){
				vm.form.DS_CAUSAANULACION = listAnulaciones.find( data => data.ID_CAUSAANULACION == vm.form.ID_CAUSAANULACION).DS_CAUSAANULACION;
				vm.msgWarn = listAnulaciones.find(data => data.ID_CAUSAANULACION == vm.form.ID_CAUSAANULACION).SORT_FIELD;
				
				//Si se selecciona desestimiento, seleccionar por defecto la fecha efecto de la póliza
                // if (vm.form.ID_CAUSAANULACION == 203 || vm.form.ID_CAUSAANULACION == 213) {
                if (vm.getIdsDesistimiento() || vm.form.ID_CAUSAANULACION == 203) {
                	vm.tipoFecha = 2;
                	if (vm.form[vm.tipoSolicitud] == null) {
                		vm.form[vm.tipoSolicitud] = {
            				XML_OBSERVACIONES: {}
                		};
                	}
                	if (vm.form[vm.tipoSolicitud].XML_OBSERVACIONES == null) {
                		vm.form[vm.tipoSolicitud].XML_OBSERVACIONES = {};
                	}
                	
                	if (vm.form.OTIPO_SOLICITUD == null) {
                		vm.form.OTIPO_SOLICITUD = "";
                	}

					//Comprobar si es posible hacer el desistimiento
					if (vm.form.ID_CAUSAANULACION == 203 && vm.form.OPOLIZA.ID_PRODUCTO == 2) {
						vm.checkFechasDesistimiento();
	                	// vm.tipoFecha = 3;
	                	vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date();
					} else {
						vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_INICIO); 
					}
					
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
                } else if (vm.form.ID_CAUSAANULACION == 10) {
                	vm.tipoFecha = 2;
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_INICIO);
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
                } else if (vm.solicitudSL() == true) {
					vm.tipoFecha = 3;
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date();
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.IN_FD_EFECTO = vm.tipoFecha;
				} else {
                	vm.tipoFecha = 0;
    				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = new Date(vm.form.OPOLIZA.FD_VENCIMIENTO);
                }
                
				// 	for(var i=0; i<listAnulaciones.length; i++){
				// 	if(listAnulaciones[i].ID_CAUSAANULACION == vm.form.ID_CAUSAANULACION){
				// 		vm.form.DS_CAUSAANULACION =	listAnulaciones[i].DS_CAUSAANULACION;	
				// 		break;
				// 	}
				// }
			}
            if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 11) {
                if(vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA != undefined){
                    if(vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA != undefined){
                        var idVia = vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA;
                        var dsVia = vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.DS_TIPO_VIA;
                        
                        delete  vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA;
                        delete vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.DS_TIPO_VIA;

						vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA = idVia;
						vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_DIRECCION_VIVIENDA.DS__ID_TIPO_VIA = dsVia;
                    }
				}else{
					if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.NO_MODALIDAD_ACTUAL != undefined){
						vm.IdTipo = listTipos.find( data => data.DS_TIPOS == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_MODALIDAD_ACTUAL).ID_TIPOS;
					}
					if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.NO_PRODUCTO_ACTUAL != undefined){
						vm.IdProducto = listProductos.find( data => data.NO_PRODUCTO == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_PRODUCTO_ACTUAL).ID_PRODUCTO;
					}
					if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.DS_TIPO_MEDIO_PAGO_ACTUAL != undefined){
						vm.IdMedio = listMedios.find( data => data.DS_TIPO_MEDIO_PAGO == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.DS_TIPO_MEDIO_PAGO_ACTUAL).ID_TIPO_MEDIO_PAGO;
					}
					if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.DS_FORMAPAGO_ACTUAL != undefined){
						vm.IdForma = listFormas.find( data => data.DS_FORMAPAGO == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.DS_FORMAPAGO_ACTUAL).ID_FORMAPAGO;
					}
					if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.NO_ENTIDAD != undefined){
						vm.IdBanco = listBancos.find( data => data.DS_FIELD == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_ENTIDAD).CO_FIELD;
					}
				}
			}

			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9) {
				if(vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA.NO_ENTIDAD != undefined){
					vm.IdBanco = listBancos.find( data => data.DS_FIELD == vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_ENTIDAD).CO_FIELD;
				}
			}
		}

		vm.getCesion = function(){
			vm.msgCesion = false;
			vm.msgCesionKO = "";
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9 && vm.form.OPOLIZA.ID_RAMO == 20 && (vm.form.OPOLIZA.ID_COMPANIA == 78 || vm.form.OPOLIZA.ID_COMPANIA == 111)) {
				if(vm.subTipoSolicitud.ID_TIPO_SOLICITUD == 12 && vm.jsEnviado.DATOS_PRESTAMO.IN_PRESTAMO == true){
					vm.msgCesion = true;
					vm.msgCesionKO = "La póliza ya tiene incluida la cesión de derechos";
				}
				if(vm.subTipoSolicitud.ID_TIPO_SOLICITUD == 7 && vm.jsEnviado.DATOS_PRESTAMO.IN_PRESTAMO == false){
					vm.msgCesion = true;
					vm.msgCesionKO = "No se puede excluir la cesión de derechos ya que la póliza no la tiene incluida";
				}
			}
		}
		/*	FUNCIONALIDAD DE BOTONES	*/
		vm.nuevaSolicitud = function() {
			
			vm.perfilLogeado = JSON.parse($window.sessionStorage.perfil);
			vm.form.CO_USU_EMISOR = vm.perfilLogeado.usuario;
			vm.form.CO_USU_RECEPTOR = vm.perfilLogeado.usuario;
			vm.form.NO_USU_EMISOR = vm.perfilLogeado.nombreCompleto;
			vm.form.NO_USU_ALTA = vm.perfilLogeado.nombreCompleto;
			vm.form.NO_USUARIO = vm.perfilLogeado.nombreCompleto;
			vm.form.FT_USU_ALTA = vm.formatDate(new Date());
			vm.form.ID_SITUACION_SOLICITUD = 1;
			vm.form.DS_SITUACION_SOLICITUD = "En trámite";

			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 && vm.lstDomains) {
				vm.form[vm.tipoSolicitud].DOMINIOS = vm.lstDomains;
			}
			
			//Si es renovación de póliza y tiene alguna subTipoSolicitud
			if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 && vm.objRenovarPolizas != null && (vm.objRenovarPolizas.okModificacionGarantias == false || vm.objRenovarPolizas.okCambioRiesgo == false || vm.objRenovarPolizas.okCambioCorredor == false)) {
				vm.nuevasSubsolicitudesPoliza();
				return null;
			} else if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51 && vm.objModificacionPoliza != null && (vm.objModificacionPoliza.okModificacionGarantias == false || vm.objModificacionPoliza.okCambioRiesgo == false || vm.objModificacionPoliza.okCambioAsegurados == false || vm.objModificacionPoliza.okCambioVencimiento == false)) {
				vm.nuevasSubsolicitudesPoliza();
				return null;
			}

			//Comprobar si estando en cambio de riesgo, se ha tarificado
			if (vm.form != null && vm.form.OTIPO_SOLICITUD != null && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 11 && vm.okCambioRiesgo != true) {
				if (vm.isAdhoc != true) {
					vm.msg.textContent('Para cambiar el riesgo, debe volver a calcular el precio con el botón "Mostrar precio".');
				} else {
					vm.msg.textContent('Para cambiar el riesgo, debe volver a calcular las primas.');
				}
		        $mdDialog.show(vm.msg);
		        return null;
			}
			
            //Si es de cuenta bancaria y ha puesto la misma
            if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 10 && vm.form[vm.tipoSolicitud] != null && vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA != null && vm.form.OPOLIZA.CO_IBAN == vm.form[vm.tipoSolicitud].XML_CAMBIO_CUENTA_BANCARIA.XML_CUENTA_BANCARIA_ACTUALIZADA.CO_IBAN) {
            	vm.msg.textContent("Las cuentas deben de ser diferentes");
            	$mdDialog.show(vm.msg);
                return null;
            }

            //Si se está dando de baja antes de que inicie la póliza. Solo se puede si es desestimiento
			var fechaActual = new Date().getTime();
			var fechaInicioPoliza = new Date(vm.form.OPOLIZA.FD_INICIO).getTime();
			if (vm.tipoSolicitud == "BAJA_POLIZA" && fechaActual < fechaInicioPoliza && vm.tipoFecha !=2) {
				vm.msg.textContent("Para dar de baja una póliza que aún no ha entrado en vigor, debe seleccionarse la causa por desestimiento");
            	$mdDialog.show(vm.msg);
                return null;
			}

			//Comprobar si la fecha de efecto añadida está entre la fecha inicio y fin de la póliza, cuando se está dando de baja. Solo se puede si es desestimiento
			if (vm.tipoSolicitud == "BAJA_POLIZA" && vm.tipoFecha !=2 && vm.form.BAJA_POLIZA != null && vm.form.BAJA_POLIZA.XML_OBSERVACIONES != null && vm.form.BAJA_POLIZA.XML_OBSERVACIONES.FD_EFECTO != null) {
				var fechaEfectoSeleccionada = new Date(vm.parent.dateFormat(vm.form.BAJA_POLIZA.XML_OBSERVACIONES.FD_EFECTO)).getTime();
				var fechaInicioPoliza = new Date(vm.parent.dateFormat(vm.form.OPOLIZA.FD_INICIO)).getTime();
				var fechaFinPoliza = new Date(vm.parent.dateFormat(vm.form.OPOLIZA.FD_VENCIMIENTO)).getTime();
				if (fechaEfectoSeleccionada < fechaInicioPoliza || fechaEfectoSeleccionada > fechaFinPoliza) {
					vm.msg.textContent("Para dar de baja una póliza que aún no ha entrado en vigor o ha vencido, debe seleccionarse la causa por desestimiento");
	            	$mdDialog.show(vm.msg);
	                return null;
				}
			}

			if(vm.listaArchivos != undefined && vm.listaArchivos.length > 0) {
				vm.form.LIST_ARCHIVOS = vm.listaArchivos;
			}
			
			//datosCliente tiene los datos del cliente que se necesitan ahora, vienen de CLIENTE -> POLIZA -> SOLICITUDES -> NUEVA o CLIENTE -> SOLICITUDES -> NUEVA
			if((vm.form.OCLIENTE == undefined || vm.form.OCLIENTE == null) && vm.datosCliente != null && vm.datosCliente != undefined) {
				vm.form.OCLIENTE = {};
				vm.form.OCLIENTE = vm.datosCliente;
				if(vm.form.OCLIENTE != null){
					vm.form.OCLIENTE.NO_NOMBRE_COMPLETO = vm.form.OCLIENTE.NO_NOMBRE + " " + vm.form.OCLIENTE.NO_APELLIDO1 + " " + vm.form.OCLIENTE.NO_APELLIDO2
				}
			}else if((vm.form.OCLIENTE == undefined || vm.form.OCLIENTE == null) && (vm.form.OPOLIZA != undefined && vm.form.OPOLIZA != null) && (vm.form.OPOLIZA.LST_ASEGURADOS != undefined && vm.form.OPOLIZA.LST_ASEGURADOS != null)){
				
				//Si viene de POLIZA -> SOLICITUD -> NUEVA se recoge del campo LST_ASEGURADOS, recogiendo el ID_CLIENTE del tomador
				vm.form.OCLIENTE = {};
				for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
					if(vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3){
						vm.form.OCLIENTE = vm.form.OPOLIZA.LST_ASEGURADOS[i];
						break;
					}
				}
			}
			if(vm.tipoHead == 5) { 
				if(vm.form.OTIPO_SOLICITUD == undefined || vm.form.OTIPO_SOLICITUD == "") {
					vm.form.OTIPO_SOLICITUD = {};
					vm.form.OTIPO_SOLICITUD = {
						'DS_TIPO_SOLICITUD': 'Baja de póliza',
						'ID_TIPO_SOLICITUD': 5
					};
				}
			}
			
			//Cambio de datos de asegurado
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 22) {
				if(vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO != undefined) {
					if(vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_SELECCIONADO != undefined){
						delete vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_SELECCIONADO
					}						
					vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.NO_NOMBRE_COMPLETO = 
					vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.NO_NOMBRE + " " +
					vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.NO_APELLIDO1 + " " +
					vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.NO_APELLIDO2

					if(vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.FD_NACIMIENTO)
						vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.FD_NACIMIENTO = vm.parent.dateFormat(vm.form[vm.tipoSolicitud].XML_MOD_ASEGURADO.XML_ASEGURADO_ACTUALIZADO.FD_NACIMIENTO);
				}
			}

			//Cambio de tomador	
			if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 18) {

				//Añadir datos del tomador a modificar a XM_ENVIADO
				if (vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR == undefined) {
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR = {};
				}
				if (vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO == undefined) {
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = {}
				}
				vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = vm.form.OPOLIZA.tomador;

				//SOLO BBVA
				if (vm.form.OPOLIZA.ID_PRODUCTO == 1) {
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NU_DOCUMENTO = vm.form.OPOLIZA.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3).NU_DOCUMENTO;
				}
			}	
			
			//Cambio de datos de tomador	
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 30) {
				if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR != undefined){
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.NO_NOMBRE_COMPLETO = 
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.NO_NOMBRE + " " +
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.NO_APELLIDO1 + " " +
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.NO_APELLIDO2

					//Añadir datos del tomador antiguo
					if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR == undefined) {
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR = {};
					}
					// SOLO BBVA y SL
					if(vm.form.OPOLIZA.ID_PRODUCTO == 1 || vm.form.OPOLIZA.ID_PRODUCTO == 2){ 
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = {}
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.ID_CLIENTE = vm.form.OPOLIZA.tomador.ID_CLIENTE;
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NO_NOMBRE = vm.tomadorSeleccionado.NO_NOMBRE;
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NO_APELLIDO1 = vm.tomadorSeleccionado.NO_APELLIDO1;
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NO_APELLIDO2 = vm.tomadorSeleccionado.NO_APELLIDO2 != undefined ? vm.tomadorSeleccionado.NO_APELLIDO2 : "";
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NO_EMAIL = vm.tomadorSeleccionado.NO_EMAIL != undefined ? vm.tomadorSeleccionado.NO_EMAIL : "";
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.NU_TELEFONO1 = vm.tomadorSeleccionado.NU_TELEFONO1 != undefined ? vm.tomadorSeleccionado.NU_TELEFONO1 : "";
						
					} else {
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO = {}
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_SELECCIONADO.ID_CLIENTE = vm.form.OPOLIZA.tomador.ID_CLIENTE;
					}
					if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.FD_NACIMIENTO) 
						vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.FD_NACIMIENTO = vm.parent.dateFormat(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.FD_NACIMIENTO);
				}

				if(vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.ID_SEXO == 1){
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.DS_SEXO = "Hombre";
				}else{
					vm.form[vm.tipoSolicitud].XML_MOD_TOMADOR.XML_TOMADOR_ACTUALIZADO.DS_SEXO = "Mujer";
				}
			}
			
            // Modificación de garantías, incluidas, modificadas y eliminadas
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 6 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 5) {
				if(vm.listaGarantias != undefined) {
					vm.listaIncluidas = [];
					if(vm.form[vm.tipoSolicitud].XML_MODIFICACION_GARANTIAS == undefined) {
						vm.form[vm.tipoSolicitud].XML_MODIFICACION_GARANTIAS = {}
					}
					vm.form[vm.tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_EXCLUIDAS = vm.eliminados;
					
					for(var i=0; i< vm.listaGarantias.length; i++){
						if(vm.listaGarantias[i].IS_NEW == true){
							vm.listaIncluidas.push(vm.listaGarantias[i]);
						}
					}					
					vm.form[vm.tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_INCLUIDAS = vm.listaIncluidas;
					vm.form[vm.tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_MODIFICADAS = vm.modificados;				
				}
			}
            // Modificar riesgos
            if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 11) {
                if(vm.form.OPOLIZA.ID_RAMO == 10) {

                    vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO = { 
                        //    ...vm.form[vm.tipoSolicitud].XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO,
                            'NO_MODELO': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MODELO.DS_MODELO,
                            'CO_VERSION': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.CO_VERSION.CO_VERSION,
                            'ID_MARCA_AUTO': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.CO_VERSION.CO_BASE7,
                            'NO_MARCA_AUTO': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MARCA_AUTO.CO_MARCA,
                            'NO_VERSION': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.CO_VERSION.DS_VERSION,
                            'CO_CATEGORIA': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MODELO.CO_CATEGORIA,
                            'NO_VEHICULO_SELECCIONADO':vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MARCA_AUTO.DS_MARCA +" "+
                            vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MODELO.DS_MODELO +" "+
                            vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.CO_VERSION.DS_VERSION,
                            'CO_MODELO': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MODELO.CO_MODELO,
                            'DS_MARCA': vm.form.CAMBIO_RIESGO.XML_CAMBIO_RIESGO.BLOCK_SELECCION_VEHICULO.NO_MARCA_AUTO.DS_MARCA,
                        }                                    
                }
            }
			// Cambio de domicilio, incluir el tipo de vía
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 8) {
				if(vm.tipoVia != undefined) {
					vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.ID_TIPO_VIA = vm.tipoVia.ID_TIPO_VIA
					vm.form[vm.tipoSolicitud].XML_CAMBIO_DOMICILIO.XML_DOMICILIO_ACTUALIZADO.DS_TIPO_VIA = vm.tipoVia.DS_TIPO_VIA
				}
			}

			// Subtipos de solicitud (cambio de otros datos de póliza)
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9) {
				if(vm.subTipoSolicitud != undefined) {
					vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
						...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
						'ID_SUBTIPO': vm.subTipoSolicitud.ID_SUBTIPO,
						'DS_SUBTIPO': vm.subTipoSolicitud.DS_TIPO_SOLICITUD,
					}
					switch (vm.subTipoSolicitud.ID_TIPO_SOLICITUD) {
						case 13:
							vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
								...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
								'NO_MODALIDAD_ACTUAL': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_MODALIDAD_ACTUAL,
								'ID_MODALIDAD_ACTUAL': vm.IdTipo,
								'ID_MODALIDAD_ANTERIOR': vm.form.OPOLIZA.ID_MODALIDAD,
								'NO_MODALIDAD_ANTERIOR': vm.form.OPOLIZA.NO_MODALIDAD,
							}
							break;
						case 17:
							vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
								...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
								'ID_PRODUCTO_ACTUAL': vm.IdProducto,
								'NO_PRODUCTO_ACTUAL': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_PRODUCTO_ACTUAL,
								'ID_PRODUCTO_ANTERIOR': vm.form.OPOLIZA.ID_PRODUCTO,
								'NO_PRODUCTO_ANTERIOR': vm.form.OPOLIZA.NO_PRODUCTO,
							}
							break;
						case 19:
							vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
								...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
								'ID_TIPO_MEDIO_PAGO_ACTUAL': vm.IdMedio,
								'DS_TIPO_MEDIO_PAGO_ACTUAL': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.DS_TIPO_MEDIO_PAGO_ACTUAL,
								'ID_TIPO_MEDIO_PAGO': vm.form.OPOLIZA.ID_TIPO_MEDIO_PAGO,
								'DS_TIPO_MEDIO_PAGO': vm.form.OPOLIZA.DS_TIPO_MEDIO_PAGO,
							}
							break;
						case 7:
								vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
									...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
									'IN_PRESTAMO': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.IN_PRESTAMO,
								}
								break;
						case 12:
							vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
								...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
								'NO_PRESTAMO': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_PRESTAMO,
								'FD_VENCIMIENTO': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.FD_VENCIMIENTO,
                                'NO_ENTIDAD': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.NO_ENTIDAD,
                                'CO_ENTIDAD': vm.IdBanco,
							}
							break;
						case 27:
							vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA = {
								...vm.form[vm.tipoSolicitud].XML_CAMBIO_POLIZA,
								'ID_FORMAPAGO_ACTUAL': vm.IdForma,
								'DS_FORMAPAGO_ACTUAL': vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_CAMBIO_POLIZA.DS_FORMAPAGO_ACTUAL,
								'ID_FORMAPAGO': vm.form.OPOLIZA.ID_FORMAPAGO,
								'DS_FORMAPAGO': vm.form.OPOLIZA.DS_FORMAPAGO,
							}
							break;
						default:
							break;
					}
				}
			}
			
			// Gestión de asegurados
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 33) {
				
				//Si es baja de asegurado
				if (vm.form.GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "3") {
					var objBaja = {
						XML_GESTION_ASEGURADOS_SELECCIONADO: JSON.parse(JSON.stringify(vm.form.GESTION_ASEGURADOS.XML_BAJA_ASEGURADO))
					}
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS = objBaja;
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC = 3;
					//vm.tipoSolicitudAsegurado = "BAJA_ASEGURADO";
					delete vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADO;
					delete vm.form.GESTION_ASEGURADOS.XML_BAJA_ASEGURADO;
				}
				//Si es alta de asegurado
				else if (vm.form.GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "1") {
					var objAlta = {
						XML_GESTION_ASEGURADOS_ACTUALIZADO: JSON.parse(JSON.stringify(vm.form.GESTION_ASEGURADOS.XML_ALTA_ASEGURADO))
					}
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS = objAlta;
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC = 1;
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO = CommonUtils.dateFormat(vm.form.GESTION_ASEGURADOS.XML_ALTA_ASEGURADO.FD_NACIMIENTO);
					//vm.tipoSolicitudAsegurado = "ALTA_ASEGURADO";
					delete vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADO;
					//delete vm.form.GESTION_ASEGURADOS.XML_ALTA_ASEGURADO;
					
					if(vm.form.OPOLIZA.ID_COMP_RAMO_PROD == 2){
						delete vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_SELECCIONADO;
						
					}
					
					if((vm.form.OPOLIZA.ID_COMP_RAMO_PROD == 2 || vm.form.OPOLIZA.ID_COMP_RAMO_PROD == 28)
							&& vm.form.GESTION_ASEGURADOS.XML_ALTA_ASEGURADO != undefined &&
								vm.form.GESTION_ASEGURADOS.XML_ALTA_ASEGURADO.ID_TIPO_DOCUMENTO == 2){
							vm.msg.textContent("El documento no puede ser un CIF");
							$mdDialog.show(vm.msg);
							return;
					}
					
					if(vm.form.OPOLIZA.ID_COMP_RAMO_PROD != 5 && vm.form.OPOLIZA.ID_COMP_RAMO_PROD != 6 && vm.form.OCLIENTE.ID_TIPO_DOCUMENTO != 2){
						let fecha = vm.calcEdad(vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO);
						
						if(fecha == ""){
							return;
						}
					}else{
						vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO = undefined;
					}
				}
				//Si es modificación de asegurado
				else if (vm.form.GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS != null && vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "2") {
					var objModi = {
						// XML_GESTION_ASEGURADOS_SELECCIONADO: JSON.parse(JSON.stringify(vm.form.GESTION_ASEGURADOS.XML_MODIFICACION_ASEGURADO))
						XML_GESTION_ASEGURADOS_ACTUALIZADO: JSON.parse(JSON.stringify(vm.form.GESTION_ASEGURADOS.XML_MODIFICACION_ASEGURADO))
					}
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS = objModi;
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC = 2;
					vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO = CommonUtils.dateFormat(vm.form.GESTION_ASEGURADOS.XML_MODIFICACION_ASEGURADO.FD_NACIMIENTO)
					
					//vm.tipoSolicitudAsegurado = "XML_GESTION_ASEGURADOS";
					delete vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADO;
					//delete vm.form.GESTION_ASEGURADOS.XML_MODIFICACION_ASEGURADO;
					if(vm.aseguradoSeleccionado)
						vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_SELECCIONADO = JSON.parse(JSON.stringify(vm.aseguradoSeleccionado));
				
					if(vm.form.OPOLIZA.ID_COMP_RAMO_PROD != 5 && vm.form.OPOLIZA.ID_COMP_RAMO_PROD != 6 && vm.form.OCLIENTE.ID_TIPO_DOCUMENTO != 2){
						let fecha = vm.calcEdad(vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO);
						
						if(fecha == ""){
							return;
						}
					}else{
						vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS_ACTUALIZADO.FD_NACIMIENTO = undefined;
					}
				}
			}
			
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 44) {
				vm.form[vm.tipoSolicitud].ID_MEDIADOR = vm.mediador;
				if(vm.idColectivo){
					vm.form[vm.tipoSolicitud].ID_TIPO_POLIZA = vm.idColectivo;
					mediador = vm.lstColectivos.find(x => x.ID_TIPO_POLIZA == vm.idColectivo).DS_TIPO_POLIZA;
					vm.form[vm.tipoSolicitud].DS_TIPO_POLIZA = mediador;
				}
			}

			if(vm.form[vm.tipoSolicitud] != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO != null){
				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = vm.formatDate(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO);
			}
			
			if(vm.form[vm.tipoSolicitud] != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO != undefined && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO != null){
				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO = vm.formatDate(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO);
			}

			if (vm.primas != null && vm.primas.IM_RECIBO_TOTAL != null) {
				var tipoPrima = "_PERIODO";
				if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51) {
					tipoPrima = "";
					if(vm.primas.IM_RECIBO_TOTAL == ""){
						vm.form[vm.tipoSolicitud].IM_PRIMA_NETA = vm.formatImporte(vm.datosPoliza.IM_PRIMA_NETA);
						vm.form[vm.tipoSolicitud].IM_PRIMA_NETA_RENOVACION = vm.formatImporte(vm.datosPoliza.IM_PRIMA_NETA);
						vm.form[vm.tipoSolicitud].IM_FRANQUICIA = vm.formatImporte(vm.datosPoliza.IM_FRANQUICIA);
					} else {
					vm.form[vm.tipoSolicitud].IM_PRIMA_NETA_RENOVACION = vm.formatImporte(vm.primas.IM_PRIMANETA);
					vm.form[vm.tipoSolicitud].IM_PRIMA_NETA = vm.formatImporte(vm.datosPoliza.IM_PRIMA_NETA);
					vm.form[vm.tipoSolicitud].IM_FRANQUICIA = vm.formatImporte(vm.primas.IM_FRANQUICIA);
					}
					if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41) {
						vm.form[vm.tipoSolicitud].IM_PRIMA_REASEGURO = vm.formatImporte(vm.primas.IM_OFESAUTO);
					}
				}
            	vm.form.ORECIBO = {
            		IM_CLEA: vm.formatImporte(vm.primas["IM_CLEA" + tipoPrima]),
					IM_FRANQUICIA: vm.formatImporte(vm.primas["IM_FRANQUICIA" + tipoPrima]),
					IM_IMPUESTOS: vm.formatImporte(vm.primas["IM_IMPUESTOS" + tipoPrima]),
					IM_PRIMANETA: vm.formatImporte(vm.primas["IM_PRIMANETA" + tipoPrima]),
					IM_RECIBO_TOTAL: vm.formatImporte(vm.primas["IM_RECIBO_TOTAL" + tipoPrima]),
					IM_OFESAUTO: vm.formatImporte(vm.primas["IM_OFESAUTO" + tipoPrima])
            	};

            	if (vm.form.ORECIBO.IM_FRANQUICIA != null) {
            		delete vm.form.ORECIBO.IM_FRANQUICIA;
            	}
                vm.form.OPOLIZA.IM_FRANQUICIA = vm.formatImporte(vm.primas["IM_FRANQUICIA" + tipoPrima]);
            }
			
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51 && vm.primasRenovacion && vm.primasRenovacion.IM_PRIMANETA) {
				vm.form[vm.tipoSolicitud].IM_PRIMA_NETA_RENOVACION = vm.formatImporte(vm.primasRenovacion.IM_PRIMANETA);
				vm.form[vm.tipoSolicitud].IM_PRIMA_REASEGURO = vm.formatImporte(vm.primasRenovacion.IM_PRIMA_REASEGURO);
			}

			if(vm.form.OPOLIZA.ID_COMP_RAMO_PROD == 1 || vm.form.OPOLIZA.ID_COMP_RAMO_PROD == 2 ){
				vm.form.OPOLIZA.ID_TIPO_ENVIO_SOLICITUD  = 3;
			}

			if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 37) {
				if (vm.form[vm.tipoSolicitud] != null) {
					if (vm.form[vm.tipoSolicitud].IM_PRIMA_NETA != null) {
						vm.form[vm.tipoSolicitud].IM_PRIMA_NETA = vm.formatImporte(vm.form[vm.tipoSolicitud].IM_PRIMA_NETA);
					}
					if (vm.primasCambioPrima.IM_PRIMANETA != null) {
						vm.form[vm.tipoSolicitud].IM_PRIMA_NETA_RENOVACION = vm.formatImporte(vm.primasCambioPrima.IM_PRIMANETA);
					}
				}
			}

			//Comprobar fechas correctas en caso de cambio de fecha efecto
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9 && vm.subTipoSolicitud.ID_TIPO_SOLICITUD == 55){
				//Validar las fechas
				var hoy =  new Date().getTime();
				var fechaEfectoSeleccionada = new Date(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO).getTime();
				var fechaInicioPoliza = new Date(vm.form.OPOLIZA.FD_INICIO).getTime();
				if(vm.form.OPOLIZA.ID_SITUAPOLIZA == 2){
					vm.msg.textContent("El estado de la póliza no permite cambiar la fecha de efecto");
	            	$mdDialog.show(vm.msg);
	                return null;
				} else if (fechaInicioPoliza < hoy) {
					vm.msg.textContent("La póliza ya ha entrado en vigor y no es posible cambiar la fecha de efecto");
	            	$mdDialog.show(vm.msg);
	                return null;
				} else if (fechaInicioPoliza == fechaEfectoSeleccionada) {
					vm.msg.textContent("La fecha seleccionada es la fecha de efecto actual, tiene que elegir otra fecha");
	            	$mdDialog.show(vm.msg);
	                return null;
				} else if(fechaEfectoSeleccionada <= hoy){
					vm.msg.textContent("La nueva fecha de efecto debe de ser posterior al día de hoy");
	            	$mdDialog.show(vm.msg);
	                return null;
				}
			}			

			if (vm.datosPoliza != null && vm.datosPoliza.ID_COMPANIA == 111 && vm.tipoHead == 5) {
				vm.form.OPOLIZA.ID_MODALIDAD = vm.datosPoliza.ID_MODALIDAD;
			}
			
			if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 56){						
				obj = {};
				obj.OPOLIZA = {};
				obj.XML_OBSERVACIONES = {};
				obj.BBVA_MODCOBERTURAS = {};
				obj.BBVA_MODCOBERTURAS.DATOS_PAGO = {};
				obj.BBVA_MODCOBERTURAS.GARANTIAS = [];
				obj.BBVA_MODCOBERTURAS.LIST_ARCHIVOS = [];
				
				obj.BBVA_MODCOBERTURAS.DATOS_PAGO.ID_FORMAPAGO = vm.presupuesto.HOGAR.DATOS_PAGO.ID_FORMAPAGO;				
				obj.XML_OBSERVACIONES.FD_EFECTO = vm.form.BBVA_MODCOBERTURAS.XML_OBSERVACIONES.FD_EFECTO;
				
				obj.BBVA_MODCOBERTURAS.CAPITALES = {
					"IM_VALOR_CONTINENTE":Number.parseFloat(vm.presupuesto.HOGAR.BLOCK_CAPITALES.IM_VALOR_CONTINENTE),	
					"IM_VALOR_CONTENIDO":Number.parseFloat(vm.presupuesto.HOGAR.BLOCK_CAPITALES.IM_VALOR_CONTENIDO),	
					"IM_VALOR_ANEXOS":Number.parseFloat(vm.presupuesto.HOGAR.BLOCK_CAPITALES.IM_VALOR_ANEXOS),	
					"IM_VALOR_COMUNES":Number.parseFloat(vm.presupuesto.HOGAR.BLOCK_CAPITALES.IM_VALOR_COMUNES),	
					"IM_OBJETOS_VALOR_EN_VIVIENDA":Number.parseFloat(vm.presupuesto.HOGAR.BLOCK_CAPITALES.IM_OBJETOS_VALOR_EN_VIVIENDA)
				};
				
				obj.BBVA_MODCOBERTURAS.LIST_ARCHIVOS = vm.form.LIST_ARCHIVOS;
				obj.OPOLIZA.NU_POLIZA = vm.datosPoliza.NU_POLIZA;

				if(vm.tipoFecha == 0){
					obj.BBVA_MODCOBERTURAS.MODALIDAD = {};
					obj.BBVA_MODCOBERTURAS.MODALIDAD.ID_MODALIDAD = vm.modalidad.ID_MODALIDAD;
					obj.BBVA_MODCOBERTURAS.MODALIDAD.NO_MODALIDAD = vm.modalidad.NO_MODALIDAD;
					obj.BBVA_MODCOBERTURAS.GARANTIAS = vm.lstGarantias;
				}
				
				obj.tipoFecha = vm.form.BBVA_MODCOBERTURAS.XML_OBSERVACIONES.IN_FD_EFECTO;
				let tipoSolicitud = vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD;
				vm.form = obj;
				vm.form.OTIPO_SOLICITUD = {
					"ID_TIPO_SOLICITUD": tipoSolicitud
				};
				
			}
                        
                        
            if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 58){
				obj = {};
				obj.OPOLIZA = {};
				obj.XML_OBSERVACIONES = {};
				obj.MODIFICACION_CAPITALES = {};
				
				
				if(vm.listaGarantias != undefined && vm.listaGarantias.length >0){
					let continente = vm.listaGarantias.find(t => (t.ID_GARANTIA == 27) || t.ID_GARANTIA == 64);
					let continenteActual ={};
					
					if(continente){
						continenteActual =continente.NU_CAPITAL;
					}
					
					let contenidoActual = vm.listaGarantias.find(t => t.ID_GARANTIA == 26).NU_CAPITAL;
					
					let continenteActualizado = 0;
					let contenidoActualizado = 0;
					
					
					if(continenteActual != undefined && contenidoActual != undefined && vm.garantias != undefined && vm.garantias.BLOCK_CAPITALES != undefined 
						&& vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTINENTE != undefined && vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTINENTE != undefined 
						&& (vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTINENTE != continenteActual || vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTENIDO != contenidoActual)){
							
						continenteActualizado = Number.parseFloat(vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTINENTE);
						contenidoActualizado = Number.parseFloat(vm.garantias.BLOCK_CAPITALES.IM_VALOR_CONTENIDO);
					
					
						if(continenteActualizado != 0 && contenidoActualizado != 0){
							
							obj.MODIFICACION_CAPITALES.CAPITALES = {}
							obj.MODIFICACION_CAPITALES.CAPITALES.IM_VALOR_CONTINENTE = continenteActualizado;
							obj.MODIFICACION_CAPITALES.CAPITALES.IM_VALOR_CONTENIDO = contenidoActualizado;
						}else{
							vm.msg.textContent("Los capitales no pueden ser 0")
							$mdDialog.show(vm.msg);
							return;
						}
					}
				}
				
				
				if(vm.NUEVA_ID_FORMAPAGO != undefined && vm.NUEVA_ID_FORMAPAGO != 0 && vm.NUEVA_ID_FORMAPAGO != vm.datosPoliza.ID_FORMAPAGO){
					obj.MODIFICACION_CAPITALES.DATOS_PAGO = {};
					obj.MODIFICACION_CAPITALES.DATOS_PAGO.ID_FORMAPAGO = vm.NUEVA_ID_FORMAPAGO;
				}
				
				if(vm.modalidad != undefined && vm.modalidad != null && vm.modalidad.ID_MODALIDAD != vm.datosPoliza.ID_MODALIDAD){
					obj.MODIFICACION_CAPITALES.MODALIDAD = {};
					obj.MODIFICACION_CAPITALES.MODALIDAD.ID_MODALIDAD = vm.modalidad.ID_MODALIDAD;
					obj.MODIFICACION_CAPITALES.MODALIDAD.NO_MODALIDAD = vm.modalidad.NO_MODALIDAD;
				}
				
				// las garantias opcionales solo estan disponibles en la opcion basica, por eso se controla solo el id_modalidad 245 para enviarlo
				if(vm.garantiasSeleccionadas != undefined && vm.garantiasSeleccionadas.length > 0 && vm.modalidad.ID_MODALIDAD == 245){
					obj.MODIFICACION_CAPITALES.GARANTIAS = [];
					obj.MODIFICACION_CAPITALES.GARANTIAS = vm.garantiasSeleccionadas;
				}
				
				obj.XML_OBSERVACIONES.FD_EFECTO = vm.form.MODIFICACION_CAPITALES.XML_OBSERVACIONES.FD_EFECTO;
				obj.XML_OBSERVACIONES.IN_FD_EFECTO = vm.form.MODIFICACION_CAPITALES.XML_OBSERVACIONES.IN_FD_EFECTO;
				obj.OPOLIZA.NU_POLIZA = vm.datosPoliza.NU_POLIZA;
				
				if(Object.keys(obj.MODIFICACION_CAPITALES).length == 0){
					vm.msg.textContent("No se han realizado cambios para hacer una solicitud")
			   		$mdDialog.show(vm.msg);
			   		return;
				}
				
				vm.form.MODIFICACION_CAPITALES = obj.MODIFICACION_CAPITALES;
				vm.form.XML_OBSERVACIONES = obj.XML_OBSERVACIONES;
				vm.form.OPOLIZA = obj.OPOLIZA;
			}
			
			// SOLICITUD a enviar al servicio
			vm.solicitud = JSON.parse(JSON.stringify(vm.form));
			// vm.solicitud.XM_ENVIADO = vm.x2js.js2xml(vm.solicitud.XM_ENVIADO);

			
			vm.parent.abrirModalcargar(true);
			SolicitudService.nuevaSolicitud(vm.solicitud)
			.then(function successCallBack(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0){
	                    if(response.data.ID_RESULT != null && response.data.ID_RESULT != undefined){
	                        delete response.data.ID_RESULT;
	                        delete response.data.DS_RESULT;
	                    }
						vm.parent.cambiarDatosModal('Solicitud creada correctamente');
	
						vm.solicitudCreada = response.data;
						// vm.solicitudCreada.XM_ENVIADO = vm.x2js.xml2js(response.data.XM_ENVIADO);
						
						if(vm.busquedaSolicitudes != null && vm.busquedaSolicitudes.showNuevaSolicitud != undefined){
							vm.busquedaSolicitudes.showNuevaSolicitud(vm.solicitudCreada);
						} else if (vm.busquedaPolizas != null && vm.busquedaPolizas.showNuevaSolicitud != undefined) {
							vm.busquedaPolizas.showNuevaSolicitud(vm.solicitudCreada);
						}
					
					}else{
						// Gestión de asegurados
						if(vm.form.OTIPO_SOLICITUD != undefined && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 33) {
							var tipoXml = "";
							vm.aseguradoSeleccionado = null;
	                        if (vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "3") {
	                            vm.tipoSolicitudAsegurado = "XML_BAJA_ASEGURADO";
							    tipoXml = "XML_GESTION_ASEGURADOS_SELECCIONADO";
	                        } else if (vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "1") {
	                            vm.tipoSolicitudAsegurado = "XML_ALTA_ASEGURADO";
							    tipoXml = "XML_GESTION_ASEGURADOS_ACTUALIZADO";
	                        } else if (vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "2") {
	                            vm.tipoSolicitudAsegurado = "XML_MODIFICACION_ASEGURADO";
	                        }
							
							vm.tipoSolicitud = 'GESTION_ASEGURADOS';
							vm.form[vm.tipoSolicitud] = {
	                            XML_GESTION_ASEGURADOS: {
	                                CO_TIPO_SOLICITUD_SC: vm.form.GESTION_ASEGURADOS.XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC
	                            },
	                            XML_OBSERVACIONES: vm.form.GESTION_ASEGURADOS.XML_OBSERVACIONES
	                        }
							
							vm.templateForm = "src/solicitud/tipos.solicitud/gestion.asegurados.html";
							vm.comprobarObjSolicitud(vm.form, vm.tipoSolicitud);
						}
						vm.msg.textContent(response.data.DS_RESULT)
					    $mdDialog.show(vm.msg);
					}
				}
			}, function errorCallBack(response) {
				if(response.status == 500){
					vm.parent.cambiarDatosModal('Se ha producido un error al crear la solicitud, póngase en contacto con un administrador');
	            }
			});			
		}

		vm.deleteFile = function(file){
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].name === file.name){
					vm.listaArchivos.splice(i,1);
					break;
				}
			}
		}

		$(document).on('change', '#file_ns', function() {
			vm.subir();
		});
		
		vm.subir = function() {
			var f = document.getElementById('file_ns').files[0];
			var existe = false;
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].NO_ARCHIVO === f.name){
					existe = true;
					break;
				}
			}
			if(existe){
				// vm.msg.textContent('Ya existe un archivo con ese nombre');
				$mdDialog.show(vm.msg);
			} else {
				var reader = new FileReader();
				reader.onload = function(){
					var base64 = reader.result.split("base64,")[1];
					var binary_string = window.atob(base64);
				    var len = binary_string.length;
				    var bytes = [];
				    for (var i = 0; i < len; i++) {
				        bytes.push(binary_string.charCodeAt(i));
				    }
				    
					var fileName = f.name;
					fileName = fileName.split(".");
					if (fileName.length > 1) {
						for (var i = 0; i < fileName.length; i++) {
						    fileName[i] = vm.parent.changeSpecialCharacters(fileName[i]);
						}
					}
					fileName = fileName.join('.');
					var nombreArchivo = fileName;
				    
				    var archivo = {
			    		"DESCARGAR": false,
			        	"ARCHIVO": bytes,
			        	"NO_ARCHIVO": nombreArchivo,
						"ID_TIPO": 222,
						'ESTADO': 'Pendiente'
			        };
				    
				    vm.listaArchivos.push(archivo);
					
					$scope.$apply();
				}
				reader.readAsDataURL(f);
				
			}
		}

		// vm.upload = function($file) {
		// 	var existe = false;
		// 	for(var i = 0; i < vm.listaArchivos.length; i++){
		// 		if(vm.listaArchivos[i].name === $file.name){
		// 			existe = true;
		// 			break;
		// 		}
		// 	}
		// 	if(existe){
		// 		vm.msg.textContent('Ya existe un archivo con ese nombre');
		// 		$mdDialog.show(vm.msg);
		// 	}else{
		// 		var reader = new FileReader();
		// 	    reader.onload = function() {
		// 	        var dataUrl = reader.result;
		// 	        var base64 = dataUrl.split(',')[1];
		// 	        var archivo = {
		// 	        	"ARCHIVO": base64,
		// 	        	"NO_ARCHIVO": $file.name,
		// 	        	"ID_TIPO": 222
		// 	        };
		// 	        vm.listaArchivos.push(archivo);
		// 	    };
		// 	    reader.readAsDataURL($file);
		// 	}
		// }

		$scope.$watch('$ctrl.files', function () {
			vm.upload(vm.files);
		});

		vm.upload = function(files) {
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {								
					(function(oFile) {
						var reader = new FileReader();  
						reader.onload = function(e) {  
							var dataUrl = reader.result;
							var byteString;
							if(dataUrl.split(',')[0].indexOf('base64') >= 0)
								byteString = atob(dataUrl.split(',')[1]);
							else
								byteString = unescape(dataUrl.split(',')[1]);
								
							var len = byteString.length;
							var bytes = [];
							for(let i = 0; i < len; i++){
								bytes.push(byteString.charCodeAt(i));
							}
							var file = {
								'ARCHIVO': bytes,
								'ID_TIPO': 222,
								'NO_ARCHIVO': CommonUtils.checkFileName(oFile.name)
							};
							
							$scope.$apply(function() {
								vm.listaArchivos.push(file);
							});
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
		}

		vm.validar = function(form2Validate) {
            if (form2Validate) {
            	objFocus = angular.element('.ng-empty.ng-invalid-required:visible');           	
				vm.msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
				$mdDialog.show(vm.msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
            } else {
                var fechaEfectoValida = true;
                if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 41) {
                    fechaEfectoValida = vm.comprobarFechaEfecto(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO);
                }
                
				if(!vm.parent.isRolAdmin() && fechaEfectoValida == false && (vm.form.ID_CAUSAANULACION != 203 && vm.form.ID_CAUSAANULACION != 10)) {
					vm.msg.textContent('La fecha de efecto no puede ser anterior al día de hoy');
					$mdDialog.show(vm.msg);
            	
            	}
				
				if(vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 9 && vm.subTipoSolicitud.ID_SUBTIPO == 55){
					const yearLater = new Date(vm.form.OPOLIZA.FD_EMISION);
    				yearLater.setFullYear(yearLater.getFullYear() + 1);
    				
    				if(vm.form.CAMBIO_OTROS_DATOS_POLIZA.XML_OBSERVACIONES.FD_EFECTO > yearLater){
						vm.msg.textContent('La fecha de efecto no puede ser superior a un año de la emisión');
						$mdDialog.show(vm.msg);
					} else {
						vm.nuevaSolicitud();
					}
				} else {
					vm.nuevaSolicitud();
				}
            }
		}
		
		vm.comprobarFechaEfecto = function(fecha) {
			var ahora = new Date();
			var fechaEfecto = fecha;

			if (typeof fechaEfecto == "string" && fechaEfecto.length >= 10) {
				fechaEfecto = fechaEfecto.substr(0,10);
				fechaEfecto = new Date(fechaEfecto);
			}
			
			if(fechaEfecto.setHours(0, 0, 0, 0) < ahora.setHours(0, 0, 0, 0)) {
				return false;
			} else {
				return true;
			}
		}
		
		vm.changeAsegurado = function (aseguradoSeleccionado) {
			if (vm.form != null && vm.form[vm.tipoSolicitud] != null) {

                var listXml = ["XML_BAJA_ASEGURADO", "XML_ALTA_ASEGURADO", "XML_MODIFICACION_ASEGURADO"];
				for (var i = 0; i < listXml.length; i++) {
                    if (vm.form[vm.tipoSolicitud][listXml[i]] != null) {
                    	delete vm.form[vm.tipoSolicitud][listXml[i]];
                    }
				}

                if (vm.form[vm.tipoSolicitud].XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "3") {
				    vm.tipoSolicitudAsegurado = "XML_BAJA_ASEGURADO";
				    vm.form[vm.tipoSolicitud].XML_BAJA_ASEGURADO = JSON.parse(JSON.stringify(aseguradoSeleccionado));
                } else if (vm.form[vm.tipoSolicitud].XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "1") {
				    vm.tipoSolicitudAsegurado = "XML_ALTA_ASEGURADO";
					vm.form[vm.tipoSolicitud].XML_ALTA_ASEGURADO = {};
					/*vm.form[vm.tipoSolicitud].XML_ALTA_ASEGURADO.NO_EMAIL = {};
					vm.form[vm.tipoSolicitud].XML_ALTA_ASEGURADO.NO_EMAIL = vm.tomador.NO_EMAIL;*/
					if(vm.form.OPOLIZA.ID_COMP_RAMO_PROD != 2){
						vm.tomador ? vm.form[vm.tipoSolicitud].XML_ALTA_ASEGURADO.NO_EMAIL = vm.tomador.NO_EMAIL : '';
					}
					
                } else if (vm.form[vm.tipoSolicitud].XML_GESTION_ASEGURADOS.CO_TIPO_SOLICITUD_SC == "2") {
				    vm.tipoSolicitudAsegurado = "XML_MODIFICACION_ASEGURADO";
				    vm.form[vm.tipoSolicitud].XML_MODIFICACION_ASEGURADO = JSON.parse(JSON.stringify(aseguradoSeleccionado));
					if(vm.form[vm.tipoSolicitud].XML_MODIFICACION_ASEGURADO.NU_TELEFONO == undefined){
						vm.form[vm.tipoSolicitud].XML_MODIFICACION_ASEGURADO.NU_TELEFONO = vm.form[vm.tipoSolicitud].XML_MODIFICACION_ASEGURADO.NU_TELEFONO1;
					}
                }
			}
		}
		
		vm.changeTipoSolicitudAsegurado = function (tipo) {
			vm.aseguradoSeleccionado = null;
			if (vm.form != null && vm.form[vm.tipoSolicitud] != null) {

                var listXml = ["XML_BAJA_ASEGURADO", "XML_ALTA_ASEGURADO", "XML_MODIFICACION_ASEGURADO"];
				for (var i = 0; i < listXml.length; i++) {
                    if (vm.form[vm.tipoSolicitud][listXml[i]] != null) {
                    	delete vm.form[vm.tipoSolicitud][listXml[i]];
                    }
				}
	            if (tipo == "3") {
				    vm.tipoSolicitudAsegurado = "XML_BAJA_ASEGURADO";
	            } else if (tipo == "1") {
				    vm.tipoSolicitudAsegurado = "XML_ALTA_ASEGURADO";
					vm.changeAsegurado();
	            } else if (tipo == "2") {
				    vm.tipoSolicitudAsegurado = "XML_MODIFICACION_ASEGURADO";
	            }
			}
		}
		

        vm.changePrimas = function (soloPeriodo) {
        	
        	if (soloPeriodo != true) {
            	if (vm.primas == null) {
            		vm.primas = {};
            	}
            	
				vm.calcularImportes = true;
				
            	if(primaNetaPrevia != null && primaNetaPrevia !== vm.primas.IM_PRIMANETA){
					vm.calcularImportes = false;
					primaNetaPrevia = vm.primas.IM_PRIMANETA;
				}

            	if (vm.primas.IM_PRIMANETA != null && vm.primas.IM_PRIMANETA != "" && vm.calcularImportes) {

					// var confirm = $mdDialog.confirm()
            		// .textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            		// .ok('Aceptar')
            		// .cancel('Cancelar');

					// $mdDialog.show(confirm).then(function () {
					// 	$mdDialog.cancel();
					
					primaNetaPrevia = vm.primas.IM_PRIMANETA
            		vm.isCalcula = true;
            		vm.primas.IM_PRIMANETA = vm.beautifyImporte(vm.formatImporte(vm.primas.IM_PRIMANETA));
            		
            		var primaNeta = vm.formatImporte(vm.primas.IM_PRIMANETA);
					vm.primas.IM_PRIMANETA = primaNeta;
            		// var primaNeta = (primaTotal100 * 2000)/2163;
            		var ipsValue = parseFloat(primaNeta * 0.08);
            		var leaValue = parseFloat(primaNeta*0.0015);
            		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
            		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
            		var primaTotal = primaNeta + ips8 + lea;
					var reaseguro = primaNeta*0.6;

            		vm.primas.IM_IMPUESTOS = vm.beautifyImporte(ips8);
            		vm.primas.IM_CLEA = vm.beautifyImporte(lea);
            		vm.primas.IM_FRANQUICIA = vm.beautifyImporte(0);
            		vm.primas.IM_RECIBO_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));
					vm.primas.IM_OFESAUTO = vm.beautifyImporte(reaseguro);
					vm.precalculadaRecibo = true;

					// }, function () {
					// 	$mdDialog.cancel();
					// });

            	} else {
            		vm.isCalcula = true;
            		vm.primas.IM_IMPUESTOS = "";
            		vm.primas.IM_CLEA = "";
            		vm.primas.IM_FRANQUICIA = "";
            		vm.primas.IM_RECIBO_TOTAL = "";
					vm.primas.IM_OFESAUTO = "";
					vm.precalculadaRecibo = false;
            	}
        	}
    		
			var listPrimas = ["IM_RECIBO_TOTAL", "IM_IMPUESTOS", "IM_CLEA", "IM_FRANQUICIA", "IM_PRIMANETA", "IM_OFESAUTO"];
			//Comprobamos que la fecha efecto de la solicitud y la fecha de vencimiento de la póliza existan
			if (vm.form[vm.tipoSolicitud] != null && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES != null && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO != null && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO != null && vm.form.OPOLIZA != null && vm.form.OPOLIZA.FD_VENCIMIENTO != null && vm.primas != null && vm.primas.IM_RECIBO_TOTAL != null) {
				//Calculamos los días de diferencia entre la fecha de vigor y la de vencimiento
				var fechaVigor = new Date(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO).getTime();
				// var fechaVencimiento = new Date(vm.form.OPOLIZA.FD_VENCIMIENTO).getTime();
				var fechaVencimiento = new Date(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_VENCIMIENTO).getTime();
				
				var diasDiferencia = fechaVencimiento - fechaVigor;
				diasDiferencia = diasDiferencia/(1000*60*60*24);
				diasDiferencia = Math.ceil(diasDiferencia);
				
				// if (diasDiferencia != null) {
				// 	// max 365 días de prima
				// 	if (diasDiferencia >365) {
				// 		diasDiferencia = 365
				// 	}
				// 	for (var i = 0; i < listPrimas.length; i++) {
				// 		//Calculamos el valor de la prima periodo según los días
				// 		vm.setPrimaPeriodo(vm.primas[listPrimas[i]], listPrimas[i], diasDiferencia);
				// 	}
				// }
			}
        	
        }

		vm.changePrimasPeriodo = function (soloPeriodo) {
        	
        	if (soloPeriodo != true) {
            	if (vm.primas == null) {
            		vm.primas = {};
            	}
            	
            	if (vm.primas.IM_PRIMANETA_PERIODO != null && vm.primas.IM_PRIMANETA_PERIODO != "") {

					var confirm = $mdDialog.confirm()
            		.textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            		.ok('Aceptar')
            		.cancel('Cancelar');

					$mdDialog.show(confirm).then(function () {
						$mdDialog.cancel();

            		vm.isCalcula = true;
            		vm.primas.IM_PRIMANETA_PERIODO = vm.beautifyImporte(vm.formatImporte(vm.primas.IM_PRIMANETA_PERIODO));
            		
            		var primaNeta = vm.formatImporte(vm.primas.IM_PRIMANETA_PERIODO);
            		// var primaNeta = (primaTotal100 * 2000)/2163;
            		var ipsValue = parseFloat(primaNeta * 0.08);
            		var leaValue = parseFloat(primaNeta*0.0015);
            		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
            		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
					var primaTotal = primaNeta + ips8 + lea;
            		
            		vm.primas.IM_IMPUESTOS_PERIODO = vm.beautifyImporte(ips8);
            		vm.primas.IM_CLEA_PERIODO = vm.beautifyImporte(lea);
            		vm.primas.IM_FRANQUICIA_PERIODO = vm.beautifyImporte(0);
            		vm.primas.IM_RECIBO_TOTAL_PERIODO = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));

					}, function () {
						$mdDialog.cancel();
					});
            	} else {
            		vm.isCalcula = true;
            		vm.primas.IM_IMPUESTOS_PERIODO = "";
            		vm.primas.IM_CLEA_PERIODO = "";
            		vm.primas.IM_FRANQUICIA_PERIODO = "";
            		vm.primas.IM_RECIBO_TOTAL_PERIODO = "";
            	}
        	}
        	
        }
		
		vm.changePrimasRenovacion = function () {
			if (vm.primasRenovacion == null) {
				vm.primasprimasRenovacion = {};
			}
			
			vm.calcularImportes = true;

			if (primaNetaRenovPrevia != null && primaNetaRenovPrevia !== vm.primasRenovacion.IM_PRIMANETA) {
				vm.calcularImportes = false;
				primaNetaRenovPrevia = vm.primasRenovacion.IM_PRIMANETA;
			}

			if (vm.primasRenovacion.IM_PRIMANETA != null && vm.primasRenovacion.IM_PRIMANETA != "" && vm.calcularImportes) {

				// var confirm = $mdDialog.confirm()
            	// 	.textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            	// 	.ok('Aceptar')
            	// 	.cancel('Cancelar');

				// 	$mdDialog.show(confirm).then(function () {
				// 		$mdDialog.cancel();

				primaNetaRenovPrevia = vm.primasRenovacion.IM_PRIMANETA;
				vm.isCalcula = true;
				vm.primasRenovacion.IM_PRIMANETA = vm.beautifyImporte(vm.formatImporte(vm.primasRenovacion.IM_PRIMANETA));
				
				var primaNeta = vm.formatImporte(vm.primasRenovacion.IM_PRIMANETA);
				vm.primasRenovacion.IM_PRIMANETA = primaNeta;
				// var primaNeta = (primaTotal100 * 2000)/2163;
				var ipsValue = parseFloat(primaNeta * 0.08);
				var leaValue = parseFloat(primaNeta*0.0015);
				var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
				var lea = +(Math.round(leaValue + "e+2")  + "e-2");
				var primaTotal = primaNeta + ips8 + lea;
				var reaseguro = primaNeta*0.6;
				
				vm.primasRenovacion.IM_IMPUESTOS = vm.beautifyImporte(ips8);
				vm.primasRenovacion.IM_CLEA = vm.beautifyImporte(lea);
				vm.primasRenovacion.IM_RECIBO_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));
				vm.primasRenovacion.IM_PRIMA_REASEGURO = vm.beautifyImporte(reaseguro);
				vm.precalculada = true;

				// }, function () {
				// 	$mdDialog.cancel();
				// });
			} else {
				vm.isCalcula = true;
				vm.primasRenovacion.IM_IMPUESTOS = "";
				vm.primasRenovacion.IM_CLEA = "";
				vm.primasRenovacion.IM_RECIBO_TOTAL = "";
				vm.primasRenovacion.IM_PRIMA_REASEGURO = "";
				vm.precalculada = false;
			}
        }

		vm.setPrimaPeriodo = function (valorPrima, nombrePrima, dias) {
			//Según los días y el valor de la prima, calculamos la prima periodo
			if (valorPrima != null && nombrePrima != null && dias != null) {
				valorPrima = vm.formatImporte(valorPrima);
				var valorPrimaPeriodo = (valorPrima * dias)/365;
				if (valorPrimaPeriodo != null) {
					vm.primas[nombrePrima + "_PERIODO"] = vm.beautifyImporte(+(Math.round(valorPrimaPeriodo + "e+2")  + "e-2"));
				}
			}
		}
		
		vm.changeFdEfecto = function () {
			if (vm.generaMovEcon == true && vm.form[vm.tipoSolicitud] != null && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES != null && vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO != null && vm.form.OPOLIZA != null && vm.form.OPOLIZA.FD_VENCIMIENTO != null && vm.primas != null && vm.primas.IM_RECIBO_TOTAL != null) {
				vm.changePrimas(true)
			}
			// if(vm.tipoFecha != 1 && !vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51)
//				vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = vm.todayDate;
//			else
				// vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO = vm.form.OPOLIZA.FD_VENCIMIENTO;
			
		}
		
		vm.tarificarRiesgo = function () {
			var obj = {
				ID_RAMO: "",
				ID_MEDIADOR: ""
			}
			
			if (vm.polizas != null && vm.polizas.length > 0) {
				obj.ID_RAMO = vm.polizas[0].ID_RAMO;
				obj.ID_MEDIADOR = vm.polizas[0].ID_MEDIADOR;
				obj.OPOLIZA = vm.polizas[0];
			}
			
			if (vm.form.OPOLIZA.ID_PRODUCTO == 6) {
				obj.CO_PRODUCTO = "CBEMP-INDEP";
			} else if (vm.form.OPOLIZA.ID_PRODUCTO == 5) {
				obj.CO_PRODUCTO = "CBEMP-AGREG";
			} else if (vm.form.OPOLIZA.ID_PRODUCTO == 8) {
				//Ciberidentidad
				obj.CO_PRODUCTO = "CBI";
			} else if (vm.form.OPOLIZA.ID_PRODUCTO == 7) {
				//Ciberhijos
				obj.CO_PRODUCTO = "CBH";
			}
			
			obj.PECUNIARIAS = vm.form.OPRESUPUESTO.PECUNIARIAS;

			vm.parent.abrirModalcargar(true);
			EmpresaService.rateOpt(obj)
            .then(function successCallback(response) {
                if(response.status == 200) {
                    if(response.data != undefined && (response.data.ID_RESULT == 0 || response.data.ID_RESULT == 6)) {
                        
                        if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                        	if (vm.bloqueRiesgo.DATOS_PAGO.ID_FORMAPAGO == 7) {
                                vm.precioTarificacion = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_TOT;
                        	} else {
                                vm.precioTarificacion = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                                vm.anualPrice = null;
                        	}
                        	
                        	//Si la solicitud es de renovación, añadimos las primas en otro objeto
                        	if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41) {
            	    			vm.objPolizaRiesgoRenovacion = JSON.parse(JSON.stringify(vm.form.OPOLIZA));
                            	vm.objPolizaRiesgoRenovacion.IM_PRIMA_NETA = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL;
                            	vm.objPolizaRiesgoRenovacion.IM_PRIMA_TOTAL = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        	} else {
                            	vm.form.OPOLIZA.IM_PRIMA_NETA = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL;
                            	vm.form.OPOLIZA.IM_PRIMA_TOTAL = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        	}
                        	
                			vm.cargarTarificacion = false;
                			vm.okCambioRiesgo = true;
                        }
        				$mdDialog.cancel();
                    } else {    	
        				vm.msg.textContent(response.data.DS_RESULT);
        				$mdDialog.show(vm.msg);
            			vm.cargarTarificacion = false;
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
    				vm.msg.textContent('Ha ocurrido un error al mostrar el precio');
    				$mdDialog.show(vm.msg);S
        			vm.cargarTarificacion = false;
                }
            });
		}
        
		vm.changeRiesgoEmpresa = function () {
			vm.precioTarificacion = 0;
			if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51) {
				vm.getObservacionesRenovacion();
			}
		}
		
		vm.changeFdVencimiento = function() {
			// vm.changeVencimiento = vm.datosPoliza.FD_VENCIMIENTO;
			if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51) {
				vm.getObservacionesRenovacion();
			}
		}
		vm.mostrarImportesManuales = function () {
			vm.showPrimasRiesgo = true;
		}
		
        vm.formatPrice = function (x) {
        	if (x != null && typeof x == "string" && x.includes(',')) {
                x = x.replace(',','.');
            }

            if (isNaN(x) === true) {
                x = 0;
            }
            if (x == undefined) {
                x = 0;
            }
            if (typeof x === "string") {
                x = parseFloat(x);
            }
            x = x.toFixed(2);
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
        }
        
        vm.changePrimasRiesgo = function (soloPeriodo) {
        	
        	if (soloPeriodo != true) {
            	if (vm.primasRiesgo == null) {
            		vm.primasRiesgo = {};
            	}
            	
            	if (vm.primasRiesgo.IM_PRIMANETA != null && vm.primasRiesgo.IM_PRIMANETA != "") {

					var confirm = $mdDialog.confirm()
            		.textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            		.ok('Aceptar')
            		.cancel('Cancelar');

					$mdDialog.show(confirm).then(function () {
						$mdDialog.cancel();

            		vm.isCalculaRiesgo = true;
            		vm.primasRiesgo.IM_PRIMANETA = vm.beautifyImporte(vm.formatImporte(vm.primasRiesgo.IM_PRIMANETA));
            		var primaNeta = vm.formatImporte(vm.primasRiesgo.IM_PRIMANETA);
            		// var primaNeta = (primaTotal100 * 2000)/2163;
            		var ipsValue = parseFloat(primaNeta * 0.08);
            		var leaValue = parseFloat(primaNeta*0.0015);
            		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
            		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
					var primaTotal = primaNeta + ips8 + lea;
            		
            		vm.primasRiesgo.IM_IMPUESTOS = vm.beautifyImporte(ips8);
            		vm.primasRiesgo.IM_CLEA = vm.beautifyImporte(lea);
            		vm.primasRiesgo.IM_FRANQUICIA = vm.beautifyImporte(0);
            		vm.primasRiesgo.IM_RECIBO_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));

					}, function () {
						$mdDialog.cancel();
					});
            	} else {
            		vm.isCalculaRiesgo = true;
            		vm.primasRiesgo.IM_IMPUESTOS = "";
            		vm.primasRiesgo.IM_CLEA = "";
            		vm.primasRiesgo.IM_FRANQUICIA = "";
            		vm.primasRiesgo.IM_RECIBO_TOTAL = "";
            	}
            	
            	//Si la solicitud es de renovación, añadimos las primas en otro objeto
            	if (vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41) {
	    			vm.objPolizaRiesgoRenovacion = JSON.parse(JSON.stringify(vm.form.OPOLIZA));
                	vm.objPolizaRiesgoRenovacion.IM_PRIMA_NETA = vm.formatImporte(vm.primasRiesgo.IM_PRIMANETA);
                	vm.objPolizaRiesgoRenovacion.IM_PRIMA_TOTAL = vm.formatImporte(vm.primasRiesgo.IM_RECIBO_TOTAL);
            	} else {
                	vm.form.OPOLIZA.IM_PRIMA_NETA = vm.formatImporte(vm.primasRiesgo.IM_PRIMANETA);
                	vm.form.OPOLIZA.IM_PRIMA_TOTAL = vm.formatImporte(vm.primasRiesgo.IM_RECIBO_TOTAL);
            	}
            	
    			vm.okCambioRiesgo = true;
        	}
        }
		
		vm.setPrimaPeriodoRiesgo = function (valorPrima, nombrePrima, dias) {
			//Según los días y el valor de la prima, calculamos la prima periodo
			if (valorPrima != null && nombrePrima != null && dias != null) {
				valorPrima = valorPrima;
				var valorPrimaPeriodo = (vm.formatImporte(valorPrima) * dias)/365;
				if (valorPrimaPeriodo != null) {
					vm.primasRiesgo[nombrePrima + "_PERIODO"] = vm.formatImporte(+(Math.round(valorPrimaPeriodo + "e+2")  + "e-2"));
				}
			}
		}
		
		vm.changeSubtipoSolicitud = function () {
			//Para solicitudes de cambio de datos de pólzia -> Revigorización, solo mostramos fecha diferente, y la preseleccionamos
			if (vm.subTipoSolicitud != null && vm.subTipoSolicitud.ID_TIPO_SOLICITUD == 16) {
				vm.tipoFecha = 1;
				vm.getFechaEfecto();
			} else {
				vm.tipoFecha = 0;
				vm.getFechaEfecto();
				vm.getCesion();
			}
		}
		
		vm.changePrimasCambioPrima = function () {
        	
        	if (vm.primasCambioPrima == null) {
        		vm.primasCambioPrima = {};
        	}
        	
        	if (vm.primasCambioPrima.IM_PRIMANETA != null && vm.primasCambioPrima.IM_PRIMANETA != "") {

				var confirm = $mdDialog.confirm()
            		.textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            		.ok('Aceptar')
            		.cancel('Cancelar');

					$mdDialog.show(confirm).then(function () {
						$mdDialog.cancel();
					
        		vm.isCalculaCambioPrima = true;
        		vm.primasCambioPrima.IM_PRIMANETA = vm.beautifyImporte(vm.formatImporte(vm.primasCambioPrima.IM_PRIMANETA));
        		var primaNeta = vm.formatImporte(vm.primasCambioPrima.IM_PRIMANETA);
        		// var primaNeta = (primaTotal100 * 2000)/2163;
        		var ipsValue = parseFloat(primaNeta * 0.08);
        		var leaValue = parseFloat(primaNeta*0.0015);
        		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
        		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
				var primaTotal = primaNeta + ips8 + lea;
        		
        		vm.primasCambioPrima.IM_IMPUESTOS = vm.beautifyImporte(ips8);
        		vm.primasCambioPrima.IM_CLEA = vm.beautifyImporte(lea);
        		vm.primasCambioPrima.IM_FRANQUICIA = vm.beautifyImporte(0);
        		vm.primasCambioPrima.IM_RECIBO_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));
				
				}, function () {
					$mdDialog.cancel();
				});
        	} else {
        		vm.isCalculaCambioPrima = true;
        		vm.primasCambioPrima.IM_IMPUESTOS = "";
        		vm.primasCambioPrima.IM_CLEA = "";
        		vm.primasCambioPrima.IM_FRANQUICIA = "";
        		vm.primasCambioPrima.IM_RECIBO_TOTAL = "";
        	}
        	
        }
		
		vm.formatImporte = function (valor) {
			var importe = 0;
			
			if (valor !== null && valor !== "" && valor !== undefined) {
				if (typeof valor == "string") {
					if (valor.includes(",") && valor.includes(".")) {
						valor = valor.replaceAll(".", "");
						valor = valor.replaceAll(",", ".");
						//20.000,50 -> 20000.5
					} else if (valor.includes(",") && !valor.includes(".")) {
						valor = valor.replaceAll(",", ".");
						//20000,50 -> 20000.5
					} else if (valor.includes(".") && !valor.includes(",")) {
						//Comprobar si tiene entero y decimal solo
						var valorSplit = valor.split(".");
						if (valorSplit.length == 2 && valorSplit[1].length < 3) {
						    //20000.5 -> 20000.5
						} else {
						    valor = valor.replaceAll(".", "");
						    //20.000 -> 20000
						}
					}
					
					importe = parseFloat(valor);
					
					if (isNaN(importe)) {
						importe = 0;
					}
				} else {
					importe = valor;
				}
			}
			
			return importe;
		}
		
		vm.beautifyImporte = function (x, decimals) {
			if (typeof x === "string") {
	            if (isNaN(parseFloat(x)) === false) {
	                x = x.replace(",", ".");
	            }
	        }

	        if (x == undefined || x == '' || isNaN(x) === true) {
	            x = 0;
	        }

	        if (typeof x === 'string') {
	            x = parseFloat(x);
	        }
	        
	        if (decimals == true || decimals == null) {
		        x = x.toFixed(2);
	        }

	        var parts = x.toString().split(".");
	        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	        return parts.join(",");
		}
		
		vm.tieneExtension = function () {
			var tieneExtension = false;
			if (vm.gridCoberturasActuales != null && vm.gridCoberturasActuales.data != null) {
				var extension = vm.gridCoberturasActuales.data.find(x => x.ID_GARANTIA == 57);
				if (extension != null) {
					tieneExtension = true;
				}
			}
			return tieneExtension;
		}
		
		vm.incluirExtensionModificacion = function () {
			if (vm.checkIncluirExtension == true) {
				var garantiaExtension = vm.garantias.find(x => x.ID_GARANTIA == 57);
				vm.gridCoberturasActuales.data.push({
					'ID_POLIZA': vm.form.OPOLIZA.ID_POLIZA,
					'NO_GARANTIA': garantiaExtension.NO_GARANTIA,
					'NU_CAPITAL': 100000,
					'ID_GARANTIA': garantiaExtension.ID_GARANTIA,
					'ID_GARANTIA_PRODUCTO':garantiaExtension.ID_GARANTIA_PRODUCTO,
					'IS_NEW': true,
				});

				//Añadir a la garantía de ciberdelincuencia una suma asegurada de 100.000€ y guardar ciberdelincuencia anterior
				var indexCiberdelincuencia = vm.gridCoberturasActuales.data.findIndex(x => x.ID_GARANTIA == 55);
				if (indexCiberdelincuencia > -1) {
					vm.garantiaCiberdelincuenciaBU = JSON.parse(JSON.stringify(vm.gridCoberturasActuales.data[indexCiberdelincuencia]));
					vm.gridCoberturasActuales.data[indexCiberdelincuencia].NU_CAPITAL = 100000;
					vm.gridCoberturasActuales.data[indexCiberdelincuencia].IS_UPDATED = true;
				}
				
				vm.listaGarantias = vm.gridCoberturasActuales.data;
			} else {
				var indexGarantiaExtension = vm.gridCoberturasActuales.data.findIndex(x => x.ID_GARANTIA == 57);
				if (indexGarantiaExtension > -1) {
					vm.gridCoberturasActuales.data.splice(indexGarantiaExtension, 1);
				}
				
				//Resetear garantía ciberdelincuencia
				var indexCiberdelincuencia = vm.gridCoberturasActuales.data.findIndex(x => x.ID_GARANTIA == 55);
				if (indexCiberdelincuencia > -1) {
					vm.gridCoberturasActuales.data[indexCiberdelincuencia] = JSON.parse(JSON.stringify(vm.garantiaCiberdelincuenciaBU));
				}
				
				vm.listaGarantias = vm.gridGarantias.data;
			}
			vm.gridGarantias.data = JSON.parse(JSON.stringify(vm.listaGarantias));
			vm.getObservacionesRenovacion();
		}
		
		vm.changeAmmountRiesgo = function (valor) {
			var sumaAsegurada = 0;
			if (vm.isAdhoc == false && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 41 && vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD != 51) {
				var objSuma = vm.tpAmount.find(x => x.CO_TIPO == valor);
				if (objSuma != null) {
					sumaAsegurada = objSuma.DS_TIPOS;
					sumaAsegurada = sumaAsegurada.replaceAll(".", "");
					sumaAsegurada = sumaAsegurada.replaceAll("€", "");
					sumaAsegurada = sumaAsegurada.replaceAll(" ", "");
					sumaAsegurada = parseInt(sumaAsegurada);
				}
			} else {
				sumaAsegurada = valor;
			}
			
			if (vm.gridCoberturasActuales != null && vm.gridCoberturasActuales.data != null) {
				for (var i = 0; i < vm.gridCoberturasActuales.data.length; i++) {
					if (vm.gridCoberturasActuales.data[i].ID_GARANTIA != 55 && vm.gridCoberturasActuales.data[i].ID_GARANTIA != 57) {
						vm.gridCoberturasActuales.data[i].NU_CAPITAL = sumaAsegurada;
					}
				}
			}
		}
		
		vm.changePrimaRenovacionDiferente = function () {
			if (vm.primaRenovacionDiferente === true) {
				vm.primas = {};
			} else {
				vm.primas = {};
				vm.primas.IM_RECIBO_TOTAL = vm.datosPoliza.IM_PRIMA_TOTAL;
				vm.changePrimas();
			}
		}
		
		vm.getObservacionesRenovacion = function () {
			var observaciones = "";
			// if (vm.objRenovarPolizas.showModificacionGarantias === true && vm.checkIncluirExtension === true) {
			if (((vm.objRenovarPolizas && vm.objRenovarPolizas.showModificacionGarantias) || (vm.objModificacionPoliza && vm.objModificacionPoliza.showModificacionGarantias))&& vm.checkIncluirExtension === true) {
				observaciones += 'SE INCLUYE LA EXTENSIÓN DE COBERTURA 4 - CIBERDELINCUENCIA\n';
			}
			// if (vm.objRenovarPolizas.showCambioRiesgo === true) {
			if ((vm.objRenovarPolizas && vm.objRenovarPolizas.showCambioRiesgo === true) || (vm.objModificacionPoliza && vm.objModificacionPoliza.showCambioRiesgo === true)) {
				var facturacion = 0;
				var sumaAsegurada = 0;
				if (vm.form.OPRESUPUESTO && vm.form.OPRESUPUESTO.PECUNIARIAS && vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO) {
					facturacion = vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER;
					sumaAsegurada = vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.AMMOUNT;
				}
				
				if (observaciones !== "") {
					observaciones += ' ';
				}
				observaciones += 'SE ACTUALIZAN LOS DATOS DE RIESGO. \nFACTURACIÓN: ' + vm.beautifyImporte(facturacion) + ' € \nLÍMITE GENERAL EN COBERTURAS: ' + vm.beautifyImporte(sumaAsegurada) + ' €';
			}
			
			if(vm.objModificacionPoliza && vm.objModificacionPoliza.showCambioVencimiento === true) {
				if (observaciones !== "") {
					observaciones += ' ';
				}
				observaciones += '\nSE AMPLIA LA FECHA DE VENCIMIENTO AL: '+vm.parent.dateFormatView(vm.changeVencimiento);
			}

			if(vm.objRenovarPolizas && vm.siniestralidad){

				if (observaciones !== "") {
					observaciones += ' ';
				}
				observaciones += '\nSE AÑADE SINIESTRALIDAD';
			}

			if ((vm.objRenovarPolizas && vm.objRenovarPolizas.showCambioCorredor === true) || (vm.objModificacionPoliza && vm.objModificacionPoliza.showCambioCorredor === true)) {
				
				if(vm.form.RENOVACION_POLIZA && vm.form.RENOVACION_POLIZA.ID_TIPO_POLIZA){
					mediador = vm.lstColectivos.find(x => x.ID_TIPO_POLIZA == vm.form.RENOVACION_POLIZA.ID_TIPO_POLIZA).DS_TIPO_POLIZA;
				}

				if (observaciones !== "") {
					observaciones += ' ';
				}
				observaciones += '\nSE ACTUALIZAN LOS DATOS DEL CORREDOR. \nNUEVO CORREDOR: ' + mediador;
			}

			if (vm.primas != null && vm.primas.IM_FRANQUICIA != null && vm.primas.IM_FRANQUICIA !== 0) {
				observaciones += "\nFranquicia: " + vm.beautifyImporte(vm.primas.IM_FRANQUICIA, false) + " €";
			}
			
			vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.TX_OBSERVACIONES = observaciones;
		}
		
		vm.changeSwitchPolizas = function (tipo, obj) {
			if (tipo == "modificacionGarantias") {
				if (vm.tieneExtension() == true && vm[obj].showModificacionGarantias != false) {
					vm.msg.textContent('No es posible aplicar esta modificación. Extensión de Cobertura 4 - Ciberdelincuencia ya contratada.');
			        $mdDialog.show(vm.msg);
					vm[obj].showModificacionGarantias = false;
					return null;
				}
				if (vm[obj].showModificacionGarantias == true) {
					vm.iniciarUIGrid();
					vm[obj].okModificacionGarantias = false;
				} else {
					vm.checkIncluirExtension = false;
					vm[obj].okModificacionGarantias = true;
					vm.recalcularCoberturasActuales();
				}
			} else if (tipo == "cambioRiesgo") {
				if (vm[obj].showCambioRiesgo == true) {
					vm[obj].okCambioRiesgo = false;
	    			vm.okCambioRiesgo = false;
	    			vm.objPolizaRiesgoRenovacion = {};
					if (vm.datosPoliza != null && vm.datosPoliza.ID_POLIZA != null && (vm.form.OPOLIZA.ID_PRODUCTO == 5 || vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 7 || vm.form.OPOLIZA.ID_PRODUCTO == 8)) {
						
						vm.loadCambioRiesgo = true;
						PolizaService.getDetail(vm.datosPoliza.ID_POLIZA)
						.then(function successCallback(response) {
							vm.loadCambioRiesgo = false;
			                if (response.data.ID_RESULT == 0) {
			                    if(response.data.JS_ENVIADO != null && response.data.JS_ENVIADO != undefined && response.data.JS_ENVIADO != ""){
									vm.bloqueRiesgo = JSON.parse(response.data.JS_ENVIADO);
									vm.form.OPRESUPUESTO = {
										ID_RAMO: 103,
										PECUNIARIAS: JSON.parse(JSON.stringify(vm.bloqueRiesgo))
									};
									if (vm.form.OPRESUPUESTO.PECUNIARIAS != null && vm.form.OPRESUPUESTO.PECUNIARIAS != null && vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO != null && vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER != null && isNaN(parseInt(vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER)) == false) {
										vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER = (vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.TURNOVER).toString();
									}
			                    }
			                    if (vm.form.OPOLIZA.ID_PRODUCTO == 6 || vm.form.OPOLIZA.ID_PRODUCTO == 5) {
			    					//Ciberempresa
			    		            
			    					//Comprobar si es adhoc o no
			    					vm.isAdhoc = false;
			    					if (response.data.IS_SELECTED == true) {
				    					vm.isAdhoc = true;
			    					} else {
			    						BusquedaService.buscar({ OPOLIZA: { ID_POLIZA: vm.form.OPOLIZA.ID_POLIZA } }, 'presupuestos')
			    						.then(function successCallback(response) {
			    							if (response.data != null && response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS.length > 0) {
												vm.isAdhoc = false;
											} else {
												vm.isAdhoc = true;
											}
			    						},function errorCallBack(response){
					    					vm.isAdhoc = false;
			    						});

			    					}
			    					//Ciberempresa
			    		            
			    					if(vm.parent.listServices.listGrupoEmpresa_ti != null && vm.parent.listServices.listGrupoEmpresa_ti.length > 0) {
			    		                vm.tpGroups = vm.parent.listServices.listGrupoEmpresa_ti;
			    		                if (vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
			    		                    var noSector = vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
			    		                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
			    		                    
			    		                }
			    		            } else {
			    		                EmpresaService.groups()
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	response.data.TIPOS.TIPO.sort(function (a, b) {
			    		                            if (a.DS_TIPOS > b.DS_TIPOS) {
			    		                              return 1;
			    		                            }
			    		                            if (a.DS_TIPOS < b.DS_TIPOS) {
			    		                              return -1;
			    		                            }
			    		                            // a must be equal to b
			    		                            return 0;
			    		                        });
			    		                    	
			    		                        vm.tpGroups = response.data.TIPOS.TIPO;
			    		                        
			    		                        if (vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
			    				                    var noSector = vm.bloqueRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
			    				                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
			    				                    
			    				                }
			    		                        
			    		                        vm.parent.listServices.listGrupoEmpresa_ti = vm.tpGroups;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
	
			    		            if(vm.parent.listServices.listCiberAtaque_ti != null && vm.parent.listServices.listCiberAtaque_ti.length > 0) {
			    		                vm.tpCbatk = vm.parent.listServices.listCiberAtaque_ti;
			    		            } else {
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "219"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	
			    		                    	vm.tpCbatk = response.data.TIPOS.TIPO;
			    		                    	
			    		                    	//Ordenar lista
			    		                    	vm.tpCbatk.sort(function(a, b) {
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return 1;
			    		                		  }
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return -1;
			    		                		  }
			    		                		  return 0;
			    		                		});
			    		                    	
			    		                    	
			    		                    	vm.parent.listServices.listCiberAtaque_ti = vm.tpCbatk;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
	
			    		            if(vm.parent.listServices.listCantidadAsegurada_ti != null && vm.parent.listServices.listCantidadAsegurada_ti.length > 0) {
			    		                vm.tpAmount = vm.parent.listServices.listCantidadAsegurada_ti;
										if ((vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51) && vm.bloqueRiesgo && vm.bloqueRiesgo.CIBERRIESGO && vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT == null && vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT_OPTION != null) {
											var ammount = vm.tpAmount.find(x => x.CO_TIPO == vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT_OPTION).DS_TIPOS;
											ammount = parseInt(ammount.trim().replace("€", "").split(".").join(""));
											vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.AMMOUNT = ammount;
										}
			    		            } else {
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "220"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	
			    		                    	vm.tpAmount = response.data.TIPOS.TIPO;
			    		                    	
			    		                    	//Ordenar lista
			    		                    	vm.tpAmount.sort(function(a, b) {
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return 1;
			    		                		  }
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return -1;
			    		                		  }
			    		                		  return 0;
			    		                		});
			    		                    	
												if ((vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51) && vm.bloqueRiesgo && vm.bloqueRiesgo.CIBERRIESGO && vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT == null && vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT_OPTION != null) {
													var ammount = vm.tpAmount.find(x => x.CO_TIPO == vm.bloqueRiesgo.CIBERRIESGO.AMMOUNT_OPTION).DS_TIPOS;
													ammount = parseInt(ammount.trim().replace("€", "").split(".").join(""));
													vm.form.OPRESUPUESTO.PECUNIARIAS.CIBERRIESGO.AMMOUNT = ammount;
												}
			    		                    	
			    		                        vm.parent.listServices.listCantidadAsegurada_ti = vm.tpAmount;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
	
			    		            if(vm.parent.listServices.listCantidadPerdida_ti != null && vm.parent.listServices.listCantidadPerdida_ti.length > 0) {
			    		                vm.tpLosses = vm.parent.listServices.listCantidadPerdida_ti;
			    		            } else {
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "221"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	
			    		                    	vm.tpLosses = response.data.TIPOS.TIPO;
	
			    		                    	//Ordenar lista
			    		                    	vm.tpLosses.sort(function(a, b) {
			    		                  		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                  		    return 1;
			    		                  		  }
			    		                  		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                  		    return -1;
			    		                  		  }
			    		                  		  return 0;
			    		                  		});
			    		                    	
			    		                        vm.parent.listServices.listCantidadPerdida_ti = vm.tpLosses;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
	
			    		            if(vm.parent.listServices.listCantidadFacturacion_ti != null && vm.parent.listServices.listCantidadFacturacion_ti.length > 0) {
			    		                vm.tpFacturacion = vm.parent.listServices.listCantidadFacturacion_ti;
			    		            } else {
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "222"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	
			    		                    	vm.tpFacturacion = response.data.TIPOS.TIPO;
			    		                    	
			    		                    	//Ordenar lista
			    		                    	vm.tpFacturacion.sort(function(a, b) {
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return 1;
			    		                		  }
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return -1;
			    		                		  }
			    		                		  return 0;
			    		                		});
			    		                    	
			    		                    	vm.parent.listServices.listCantidadFacturacion_ti = vm.tpFacturacion;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
			    				} else if (vm.form.OPOLIZA.ID_PRODUCTO == 8) {
			    					//Ciberidentidad
			    					if(vm.parent.listServices.listNumAdultos_ti != null && vm.parent.listServices.listNumAdultos_ti.length > 0) {
			    		                vm.typesIdent = vm.parent.listServices.listNumAdultos_ti;
			    		            } else {
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "225"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	vm.typesIdent = response.data.TIPOS.TIPO;
	
			    		                    	//Ordenar lista
			    		                    	vm.typesIdent.sort(function(a, b) {
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return 1;
			    		                		  }
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return -1;
			    		                		  }
			    		                		  return 0;
			    		                		});
			    		                    	
			    		                    	vm.parent.listServices.listNumHijos_ti = vm.typesIdent;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
			    				} else if (vm.form.OPOLIZA.ID_PRODUCTO == 7) {
			    					//Ciberhijos
			    		            
			    		            if(vm.parent.listServices.listNumHijos_ti != null && vm.parent.listServices.listNumHijos_ti.length > 0) {
			    		                vm.typesHijos = vm.parent.listServices.listNumHijos_ti;
			    		            } else {
			    		            	
			    		            	TiposService.getTipos({
			    		                    "ID_CODIGO": "224"
			    		                })
			    		                .then(function successCallback(response) {
			    		                    if (response.status == 200) {
			    		                    	vm.typesHijos = response.data.TIPOS.TIPO;
			    		                    	
			    		                    	//Ordenar lista
			    		                    	vm.typesHijos.sort(function(a, b) {
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return 1;
			    		                		  }
			    		                		  if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
			    		                		    return -1;
			    		                		  }
			    		                		  return 0;
			    		                		});
			    		                    	
			    		                    	vm.parent.listServices.listNumHijos_ti = vm.typesHijos;
			    		                    }
			    		                }, function callBack(response) {
			    		                    if (response.status == 406 || response.status == 401) {
			    		                        vm.parent.logout();
			    		                    }
			    		                });
			    		            }
	
			    				}
			                }
						})
						.catch(function errorCallback(error){
							vm.loadCambioRiesgo = false;
							// vm.msg.textContent('Ha ocurrido un error al mostrar el riesgo.');
					        // $mdDialog.show(vm.msg);
						});
					}
				} else {
					vm[obj].okCambioRiesgo = true;
					vm.recalcularCoberturasActuales();
				}
			} else if (tipo == "cambioAsegurados") {
				vm[obj].okCambioAsegurados = false;
			} else if (tipo == "cambioVencimiento") {
				vm[obj].okCambioVencimiento = false;
			// } else if (tipo == "cambioCorredor") {
			// 	vm[obj].okCambioCorredor = false;
			}
			vm.getObservacionesRenovacion();
		}

		vm.incluirSiniestralidad = function() { 
			vm.form[vm.tipoSolicitud].IS_SINIESTRALIDAD = vm.siniestralidad;
			vm.getObservacionesRenovacion();
		}
		
		vm.recalcularCoberturasActuales = function () {
			BusquedaService.buscar({"ID_POLIZA": vm.form.OPOLIZA.ID_POLIZA} , "garantiasByPoliza")
            .then(function successCallBack(response){
                if(response.status == 200){
                    vm.coberturasActuales = response.data.GARANTIAS;
                    vm.gridCoberturasActuales.data = vm.coberturasActuales;
                }
            })
		}
		
		vm.nuevasSubsolicitudesPoliza = function () {
			var listServices = [];
			var objSubsolicitudes = vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD === 41 ? "objRenovarPolizas" : "objModificacionPoliza";
			
			if (vm[objSubsolicitudes].okModificacionGarantias === false) {
				var form = JSON.parse(JSON.stringify(vm.form));
				var tipoSolicitud = objSubsolicitudes == 'objRenovarPolizas' ? 'MODIF_GARANTIAS' : 'MODIFICACION_GARANTIAS_PERIODO_VIGENCIA';
				
				form[tipoSolicitud] = {};
				
				if (form.RENOVACION_POLIZA != null) {
					form[tipoSolicitud].XML_OBSERVACIONES = form.RENOVACION_POLIZA.XML_OBSERVACIONES;
					delete form.RENOVACION_POLIZA;
				} else if (form.MODIFICACION_POLIZA_PERIODO_VIGENCIA != null) {
					form[tipoSolicitud].XML_OBSERVACIONES = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA.XML_OBSERVACIONES;
					delete form.MODIFICACION_POLIZA_PERIODO_VIGENCIA;
				}
				
				if (vm.listSolicitudes != null && vm.listSolicitudes.length > 0) {
					var idSolMod = vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD === 41 ? 42 : 52;
					form.OTIPO_SOLICITUD = vm.listSolicitudes.find(x => x.ID_TIPO_SOLICITUD === idSolMod);
				}
				
				if(vm.listaGarantias !== undefined) {
					vm.listaIncluidas = [];
					vm.modificados = [];
					if(form[tipoSolicitud].XML_MODIFICACION_GARANTIAS === undefined) {
						form[tipoSolicitud].XML_MODIFICACION_GARANTIAS = {}
					}
					form[tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_EXCLUIDAS = vm.eliminados;

					/*for(var i=0; i< vm.listaGarantias.length; i++){
						if(vm.listaGarantias[i].IS_NEW === true){
							vm.listaIncluidas.push(vm.listaGarantias[i]);
						}
					}
					
					for(var i=0; i< vm.listaGarantias.length; i++){
						if(vm.listaGarantias[i].IS_UPDATED === true){
							vm.modificados.push(vm.listaGarantias[i]);
						}
					}*/		
					
					for(var i=0; i< vm.listaGarantias.length; i++){
						if(vm.listaGarantias[i].IS_NEW === true)
							vm.listaIncluidas.push(vm.listaGarantias[i]);
						if(objSubsolicitudes == 'objRenovarPolizas') {
							if(vm.listaGarantias[i].IS_UPDATED === true)
								vm.modificados.push(vm.listaGarantias[i]);
						}
					}
					
					form[tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_INCLUIDAS = vm.listaIncluidas;
					form[tipoSolicitud].XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_MODIFICADAS = vm.modificados;				
				}

				if (vm.datosPoliza && vm.datosPoliza.tomador != null) {
					form.OCLIENTE = vm.datosPoliza.tomador;
				}

				if (form.OCLIENTE == null) {
					for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
						if(vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3){
							form.OCLIENTE = vm.form.OPOLIZA.LST_ASEGURADOS[i];
							break;
						}
					}
				}
				
				listServices.push(SolicitudService.nuevaSolicitud(form));
				
			} else {
				listServices.push(null);
			}
			
			if (vm[objSubsolicitudes].okCambioRiesgo === false) {
				//Comprobar si estando en cambio de riesgo, se ha tarificado
				
				var form = JSON.parse(JSON.stringify(vm.form));
				// var tipoSolicitud = "MODIF_DATOS_RIESGO";
				var tipoSolicitud = objSubsolicitudes == 'objRenovarPolizas' ? 'MODIF_DATOS_RIESGO' : 'MODIFICACION_DATOS_RIESGO_PERIODO_VIGENCIA';
				
				form[tipoSolicitud] = {};
				
				if (form.RENOVACION_POLIZA != null) {
					form[tipoSolicitud].XML_OBSERVACIONES = form.RENOVACION_POLIZA.XML_OBSERVACIONES;
					delete form.RENOVACION_POLIZA;
				} else if (form.MODIFICACION_POLIZA_PERIODO_VIGENCIA != null) {
					form[tipoSolicitud].XML_OBSERVACIONES = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA.XML_OBSERVACIONES;
					delete form.MODIFICACION_POLIZA_PERIODO_VIGENCIA;
				}
				
				if (vm.listSolicitudes != null && vm.listSolicitudes.length > 0) {
					var idSolRiesgo = vm.form.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD === 41 ? 43 : 53;
					form.OTIPO_SOLICITUD = vm.listSolicitudes.find(x => x.ID_TIPO_SOLICITUD === idSolRiesgo);
				}


				if (vm.primas != null && vm.primas.IM_RECIBO_TOTAL != null) {
					
					form.OPOLIZA.IM_PRIMA_NETA = vm.formatImporte(vm.primas["IM_PRIMANETA"]);
					form.OPOLIZA.IM_PRIMA_TOTAL = vm.formatImporte(vm.primas["IM_RECIBO_TOTAL"]);
					form.OPOLIZA.IM_CLEA = vm.formatImporte(vm.primas["IM_CLEA"]);
					form.OPOLIZA.IM_IMPUESTOS = vm.primas["IM_IMPUESTOS"] != null ? parseInt(vm.formatImporte(vm.primas["IM_IMPUESTOS"])) : 0;
					form.OPOLIZA.IM_FRANQUICIA = vm.formatImporte(vm.primas["IM_FRANQUICIA"]);
	            }

				if (vm.datosPoliza && vm.datosPoliza.tomador != null) {
					form.OCLIENTE = vm.datosPoliza.tomador;
				}

				if (form.OCLIENTE == null) {
					for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
						if(vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3){
							form.OCLIENTE = vm.form.OPOLIZA.LST_ASEGURADOS[i];
							break;
						}
					}
				}
				
				listServices.push(SolicitudService.nuevaSolicitud(form));
			} else {
				listServices.push(null);
			}

			if (vm[objSubsolicitudes].okCambioAsegurados === false) {
				var form = JSON.parse(JSON.stringify(vm.form));
				/*var tipoSolicitud = "GESTION_ASEGURADOS";
				var listObjGestionAsegurados = ["XML_BAJA_ASEGURADO", "XML_ALTA_ASEGURADO", "XML_MODIFICACION_ASEGURADO", "XML_GESTION_ASEGURADO"];
				
				form[tipoSolicitud] = {};

				for (var obj in form.MODIFICACION_POLIZA_PERIODO_VIGENCIA) {
					if (listObjGestionAsegurados.includes(obj)) {
						form[tipoSolicitud][obj] = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA[obj];
						delete vm.form.MODIFICACION_POLIZA_PERIODO_VIGENCIA[obj];
					}
				}*/

				var tipoSolicitud = 'GESTION_ASEGURADOS_PERIODO_VIGENCIA';
				form[tipoSolicitud] = {
					XML_OBSERVACIONES: form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_OBSERVACIONES'],
					XML_GESTION_ASEGURADOS: {}
				};

				if (form.OCLIENTE == null) {
					for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
						if(vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3){
							form.OCLIENTE = vm.form.OPOLIZA.LST_ASEGURADOS[i];
							break;
						}
					}
				}

				form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['CO_TIPO_SOLICITUD_SC'] = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_GESTION_ASEGURADOS']['CO_TIPO_SOLICITUD_SC'];
				
				switch (form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['CO_TIPO_SOLICITUD_SC']) {
					case 1:
					case '1':
						form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['XML_GESTION_ASEGURADOS_ACTUALIZADO'] = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_ALTA_ASEGURADO'];
						break;
					case 2:
					case '2':
						form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['XML_GESTION_ASEGURADOS_ACTUALIZADO'] = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_MODIFICACION_ASEGURADO'];
						form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['XML_GESTION_ASEGURADOS_SELECCIONADO'] = JSON.parse(JSON.stringify(vm.aseguradoSeleccionado));
						break;
					case 3:
					case '3':
						form[tipoSolicitud]['XML_GESTION_ASEGURADOS']['XML_GESTION_ASEGURADOS_SELECCIONADO'] = form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_BAJA_ASEGURADO'];
						break;
				
					default:
						break;
				}
				
				if (form.MODIFICACION_POLIZA_PERIODO_VIGENCIA != null) {
					delete form.MODIFICACION_POLIZA_PERIODO_VIGENCIA;
				}
				
				if (vm.listSolicitudes != null && vm.listSolicitudes.length > 0) {
					form.OTIPO_SOLICITUD = vm.listSolicitudes.find(x => x.ID_TIPO_SOLICITUD == 54);
				}

				if (vm.datosPoliza && vm.datosPoliza.tomador != null) {
					form.OCLIENTE = vm.datosPoliza.tomador;
				}
				
				listServices.push(SolicitudService.nuevaSolicitud(form));
			} else {
				listServices.push(null);
			}

			if (vm[objSubsolicitudes].okCambioVencimiento === false){
				var form = JSON.parse(JSON.stringify(vm.form));

				form['AMPLIACION_FECHA_VENCIMIENTO'] = {
					XML_OBSERVACIONES: form.MODIFICACION_POLIZA_PERIODO_VIGENCIA['XML_OBSERVACIONES'],
					FD_VENCIMIENTO_AMPLIADA: vm.parent.dateFormat(vm.changeVencimiento)
				};

				if (form.MODIFICACION_POLIZA_PERIODO_VIGENCIA != null) {
					delete form.MODIFICACION_POLIZA_PERIODO_VIGENCIA;
				}
				
				if (vm.listSolicitudes != null && vm.listSolicitudes.length > 0) {
					form.OTIPO_SOLICITUD = vm.listSolicitudes.find(x => x.ID_TIPO_SOLICITUD == 46);
				}

				if (vm.datosPoliza && vm.datosPoliza.tomador != null) {
					form.OCLIENTE = vm.datosPoliza.tomador;
				}

				if (form.OCLIENTE == null) {
					for(var i = 0; i < vm.form.OPOLIZA.LST_ASEGURADOS.length; i++){
						if(vm.form.OPOLIZA.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3){
							form.OCLIENTE = vm.form.OPOLIZA.LST_ASEGURADOS[i];
							break;
						}
					}
				}

				listServices.push(SolicitudService.nuevaSolicitud(form));
			} else {
				listServices.push(null);
			}

			if (vm[objSubsolicitudes].okCambioCorredor === false) {
				var form = JSON.parse(JSON.stringify(vm.form));

				form['CAMBIO_CORREDOR'] = {
					XML_OBSERVACIONES: form.RENOVACION_POLIZA['XML_OBSERVACIONES'],
					ID_MEDIADOR: vm.mediador,
					DS_TIPO_POLIZA: mediador,
					ID_TIPO_POLIZA: form.RENOVACION_POLIZA.ID_TIPO_POLIZA
				};
				
				if (form.RENOVACION_POLIZA != null) {
					delete form.RENOVACION_POLIZA;
				}
				
				if (vm.listSolicitudes != null && vm.listSolicitudes.length > 0) {
					form.OTIPO_SOLICITUD = vm.listSolicitudes.find(x => x.ID_TIPO_SOLICITUD == 44);
				}

				if (vm.datosPoliza && vm.datosPoliza.tomador != null) {
					form.OCLIENTE = vm.datosPoliza.tomador;
				}
				
				listServices.push(SolicitudService.nuevaSolicitud(form));
			} else {
				listServices.push(null);
			}

			vm.parent.abrirModalcargar(true);
			Promise.all(listServices)
            .then(([resultModificacionGarantias, resultCambioRiesgo, resultCambioAsegurados, resultCambioVencimiento, resultCambioCorredor]) => { 

            	if (resultModificacionGarantias != null) {
    				if (resultModificacionGarantias.data.ID_RESULT == 0) {
    				} else {
    				}
    				vm[objSubsolicitudes].okModificacionGarantias = true;
            	}

            	if (resultCambioRiesgo != null) {
    				if (resultCambioRiesgo.data.ID_RESULT == 0) {
    					console.log("La solicitud de cambio de riesgo se ha creado correctamente.");
    				} else {
    					console.log("Ha ocurrido un error al crear la solicitud de cambio de riesgo.");
    				}
    				vm[objSubsolicitudes].okCambioRiesgo = true;
            	}

            	if (resultCambioAsegurados != null) {
    				if (resultCambioAsegurados.data.ID_RESULT == 0) {
    					console.log("La solicitud de gestión de asegurados se ha creado correctamente.");
    				} else {
    					console.log("Ha ocurrido un error al crear la solicitud de gestión de asegurados.");
    				}
    				vm[objSubsolicitudes].okCambioAsegurados = true;
            	}

				if (resultCambioVencimiento != null) {
    				if (resultCambioVencimiento.data.ID_RESULT == 0) {
    					console.log("La solicitud de ampliación de periodo de vigencia se ha creado correctamente.");
    				} else {
    					console.log("Ha ocurrido un error al crear la solicitud de ampliación de periodo de vigencia.");
    				}
    				vm[objSubsolicitudes].okCambioVencimiento = true;
            	}

				if (resultCambioCorredor != null) {
    				if (resultCambioCorredor.data.ID_RESULT == 0) {
    					console.log("La solicitud de cambio de corredor se ha creado correctamente.");
    				} else {
    					console.log("Ha ocurrido un error al crear la solicitud de cambio de corredor.");
    				}
    				vm[objSubsolicitudes].okCambioCorredor = true;
            	}
    			
				if (vm[objSubsolicitudes].okModificacionGarantias == true && vm[objSubsolicitudes].okCambioRiesgo == true && vm[objSubsolicitudes].okCambioAsegurados == true && vm[objSubsolicitudes].okCambioVencimiento == true && vm[objSubsolicitudes].okCambioCorredor == true) {
					vm.nuevaSolicitud();
				}
        		
            });
		}
		
		vm.solicitudSL = function () {
			var solicitudSL = false;
			var listSolicitudesSL = [208, 49, 6, 30, 211];
			if (listSolicitudesSL.includes(vm.form.ID_CAUSAANULACION)) {
				solicitudSL = true;
			}
			return solicitudSL;
		}
		
		vm.isIdsVencimientoBBVA = function () {
			var solicitudVencimientoBBVA = false;
			var listSolicitudesVencimientoBBVA = [49, 48, 30];
			if (listSolicitudesVencimientoBBVA.includes(vm.form.ID_CAUSAANULACION)) {
				solicitudVencimientoBBVA = true;
			}
			return solicitudVencimientoBBVA;
		}

		vm.getIdsDesistimiento = function() {
			let desistimiento = false;
			if(vm.form.ID_CAUSAANULACION && vm.lstIdsDesistimiento && vm.lstIdsDesistimiento.length > 0) {
				if (vm.lstIdsDesistimiento.includes(vm.form.ID_CAUSAANULACION)) {
					desistimiento = true;
				}
			}
			return desistimiento;
		}

		vm.getIdsVencimiento = function() {
			let vencimiento = false;
			if(vm.form.ID_CAUSAANULACION && vm.lstIdsVencimiento && vm.lstIdsVencimiento.length > 0) {
				if (vm.lstIdsVencimiento.includes(vm.form.ID_CAUSAANULACION)) {
					vencimiento = true;
				}
			}
			return vencimiento;
		}
		
		vm.checkFechasDesistimiento = function () {
			vm.loadCheckDesistimiento = true;
			vm.fechaDesistimientoOk = true;
			vm.msgDesistimientoKo = "";
			
			var obj = { NU_POLIZA: vm.datosPoliza.NU_POLIZA };
			SolicitudService.validarFechaBaja(obj)
	 		.then(function successCallBack(response){
	 			if (response.data.ID_RESULT == 0) {
					vm.fechaDesistimientoOk = true;
				} else {
					vm.fechaDesistimientoOk = false;
					vm.msgDesistimientoKo = response.data.DS_RESULT;
				}
				
				vm.loadCheckDesistimiento = false;
	 		}, function errorCallBack(response){
				vm.loadCheckDesistimiento = false;
				vm.fechaDesistimientoOk = false;
				vm.msgDesistimientoKo = "No es posible realizar el desistimiento";
	 		});
		}

		vm.chkDomains = function(num) {
			vm.lstDomains = [];
			for(let i = 0; i < num; i++) {
				vm.lstDomains.push('');
			}
		}
		
	vm.buscarPresupuesto = function(idPoliza){ 
	
	json = {"OPOLIZA" : {"ID_POLIZA": idPoliza}};
	
        BusquedaService.buscar(json, "presupuestos")
        .then(function successCallback(response) {
            if (response.status === 200) {
            	if(response.data.ID_RESULT == 0){
            		if(response.data.PRESUPUESTOS != undefined && response.data.PRESUPUESTOS.length > 0){
            			if(response.data.PRESUPUESTOS[0].ID_PRODUCTO == 1){
	            			vm.presupuesto = response.data.PRESUPUESTOS[0];
	            				            	       	            			
	            			if( vm.presupuesto != undefined){ 
	            				if(vm.presupuesto.LIST_TARIFA_EMISION != undefined && vm.presupuesto.LIST_TARIFA_EMISION.length > 0){ 
	            					vm.lstGarantias = vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.filter(data => data.ID_GARANTIA == 1079 ||  data.ID_GARANTIA == 1081);
	            					
	            					if(vm.presupuesto.LIST_TARIFA_EMISION[0] != undefined && vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.length > 0){
	            						if(vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.find(data => data.ID_GARANTIA == 1079))
	            							vm.garantiaElectrodomesticos = vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.find(data => data.ID_GARANTIA == 1079).IN_SELECTED;	 
	            						if(vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.find(data => data.ID_GARANTIA == 1081))	
	            							vm.garantiaExpress = vm.presupuesto.LIST_TARIFA_EMISION[0].LIST_GARANTIA.find(data => data.ID_GARANTIA == 1081).IN_SELECTED;	 
	            					}
	            					
	            					if(vm.lstGarantias.length < 2){
	            						vm.gant = vm.presupuesto.LIST_TARIFAS[3].LIST_GARANTIA.filter(data => data.ID_GARANTIA == 1079 ||  data.ID_GARANTIA == 1081);	 
	            						
	            						
	            						if(vm.gant.length > 0 && vm.lstGarantias.length > 0){
		            						for(var i = 0; i < vm.gant.length; i ++){
		            							for(var j = 0; j < vm.lstGarantias.length; j ++){
		            								if(vm.gant[i].ID_GARANTIA != vm.lstGarantias[j].ID_GARANTIA){
		            									vm.lstGarantias.push(vm.gant[i]);
		            								}
		            							}
		            						}
	            						}else if(vm.gant.length > 0 && vm.lstGarantias.length == 0){
	            							vm.lstGarantias = vm.gant;
	            						}
	            					}	            					
	            				}
	            				
	            				if(vm.presupuesto.LIST_TARIFAS != undefined){
	            					vm.modalidades = vm.presupuesto.LIST_TARIFAS;
	            					vm.modalidad = vm.modalidades.find( data => data.ID_MODALIDAD == vm.datosPoliza.ID_MODALIDAD);
	            				}
	            			}
	            			
	            			vm.totalPrima = vm.formatPrice(vm.datosPoliza.IM_PRIMA_TOTAL); 
           			          			 	            			 
            			}else{
							if(response.data.PRESUPUESTOS[0].ID_PRODUCTO == 2 && vm.tipoSolicitud == 'MODIFICACION_CAPITALES'){
								vm.presupuesto = response.data.PRESUPUESTOS[0];
							}else{
								vm.msg.textContent("El presupuesto no es de BBVA.");
	                            $mdDialog.show(vm.msg);
	                  			vm.buscandoPresupuesto = false;
							}
            			}
            		}else{
        				vm.presuBusq = true;
            			vm.buscandoPresupuesto = false;
        				vm.presuEncontrado = false;
            		}
            	}
            }
        }, function errorCallback(response) {
        	vm.buscandoPresupuesto = false;
        	vm.presuEncontrado = false;
        });    
    }

	vm.buscarPoliza = function(idPoliza){
		
		PolizaService.getDetail(idPoliza)
                .then(function successCallback(response) {
                    if (response.status == 200 && response.data != undefined && response.data.JS_ENVIADO != undefined) {
                    	vm.garantias = JSON.parse(response.data.JS_ENVIADO);
                    }else{
						vm.msg.textContent("No se han encontrado las garantias");
	                    $mdDialog.show(vm.msg);
					}
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
	
	}
	vm.mostrarCalculo = function() {
		if(!vm.calculaMovEcon){
			vm.generaMovEcon = false;
			vm.primasRenovacion.IM_PRIMANETA = null;
		}
	}

	vm.calcularRecibo = function(){

		if(vm.calculaMovEcon){
			
			if(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO != null && vm.primasRenovacion && vm.primasRenovacion.IM_PRIMANETA){
				var fdEfecto = new Date(vm.form[vm.tipoSolicitud].XML_OBSERVACIONES.FD_EFECTO);
				var fdVencimiento = new Date(vm.datosPoliza.FD_VENCIMIENTO);
				var totalDias = fdVencimiento - fdEfecto;
				totalDias = totalDias/(1000*60*60*24);
				totalDias = Math.ceil(totalDias);
				if (totalDias != null) {
					// max 365 días de prima
					if (totalDias >365) {
						totalDias = 365
					}
				}	
				var confirm = $mdDialog.confirm()
					.textContent("Se va a proceder a realizar el cálculo desde la fecha "+moment(fdEfecto).format('DD-MM-YYYY') + " hasta la fecha "+ moment(fdVencimiento).format('DD-MM-YYYY')+".\nEste periodo equivale a "+totalDias+" días de cobertura, \n¿Está seguro que los datos son correctos?")
					.multiple(true)
					.ariaLabel('Lucky day')
					.ok('Aceptar')
					.cancel('Cancelar');
					$mdDialog.show(confirm).then(function() {
						primaNetaPrevia = null;
						primaNetaRenovPrevia = null;
						var primaNeta = vm.formatImporte(vm.primasRenovacion.IM_PRIMANETA) - vm.formatImporte(vm.datosPoliza.IM_PRIMA_NETA);
						vm.primas.IM_PRIMANETA = Math.round((primaNeta * totalDias/365 + Number.EPSILON) * 100) / 100;
						vm.changePrimas();
						vm.changePrimasRenovacion();
						vm.generaMovEcon = true;
					}, function() {
	//					$mdDialog.hide(confirm);
					});
			} else {
				vm.msg.textContent("Es necesario rellenar los datos para poder realizar el cáculo del recibo");
				$mdDialog.show(vm.msg);
				vm.generaMovEcon = false;
			}
		} else {
			vm.generaMovEcon = false;
		}
	}
	
	vm.changeGarantias = function(idGarantia){
				
		if(idGarantia != undefined && vm.lstGarantias != undefined && vm.lstGarantias.length > 0){
			
			garantia = vm.lstGarantias.find( data => data.ID_GARANTIA == idGarantia);
			
			if(garantia.IN_SELECTED){
				vm.lstGarantias.find( data => data.ID_GARANTIA == garantia.ID_GARANTIA).IN_SELECTED = false;
				idGarantia = false;
			}else {
				vm.lstGarantias.find( data => data.ID_GARANTIA == garantia.ID_GARANTIA).IN_SELECTED = true;
				idGarantia = true;
			}
		}               
	}
	
	vm.modificarGarantiasSL = function(idGarantia){
		
		let encontrado = false;
		
		if(vm.garantiasSeleccionadas != undefined && vm.garantiasSeleccionadas.length >0){
			
			for(let i = 0; i < vm.garantiasSeleccionadas.length; i++){
				
				if(vm.garantiasSeleccionadas[i].ID_GARANTIA == idGarantia){
					
					encontrado = true;
					
					if(vm.garantiasSeleccionadas[i].IN_SELECTED == true){
						vm.garantiasSeleccionadas[i].IN_SELECTED = false;
					}else{
						vm.garantiasSeleccionadas[i].IN_SELECTED = true;
					}
				}
			}
		}
		
		if(!encontrado){
			if(vm.garantiasSeleccionadas == 'undefined' || vm.garantiasSeleccionadas.length < 1){
				vm.garantiasSeleccionadas = [];	
			}
			
			let nuevaGarantia = {};
			nuevaGarantia.ID_GARANTIA = idGarantia;
			nuevaGarantia.IN_SELECTED = true;
			vm.garantiasSeleccionadas.push(nuevaGarantia);
		}
		
	}
	
	vm.cargarModalidadesDisponibles = function (idPoliza){
		
		json = {"OPOLIZA" : {"ID_POLIZA": idPoliza}};
		
        BusquedaService.buscar(json, "presupuestos")
	        .then(function successCallback(response) {
	            if (response.status === 200) {
	            	if(response.data.ID_RESULT == 0){
	            		if(response.data.PRESUPUESTOS != undefined && response.data.PRESUPUESTOS.length > 0){
							let presupuesto = response.data.PRESUPUESTOS[0];
								            	       	            			          				
							if(presupuesto.LIST_TARIFAS != undefined){				
								vm.modalidades = {};
													
								let modalidadesUnicas = {};
								
								presupuesto.LIST_TARIFAS.forEach(item => {
								  if (!modalidadesUnicas[item.ID_MODALIDAD]) {
								    modalidadesUnicas[item.ID_MODALIDAD] = item;
								  }
								});
								
								vm.modalidades = Object.values(modalidadesUnicas).map(item => ({ ID_MODALIDAD: item.ID_MODALIDAD, NO_MODALIDAD: item.NO_MODALIDAD }));

								vm.modalidad = vm.modalidades.find( data => data.ID_MODALIDAD == vm.datosPoliza.ID_MODALIDAD);
							}
	
	            		}else{
	        				vm.presuBusq = true;
	            			vm.buscandoPresupuesto = false;
	        				vm.presuEncontrado = false;
	            		}
	            	}
	            }
	        }, function errorCallback(response) {
	        	vm.buscandoPresupuesto = false;
	        	vm.presuEncontrado = false;
	        }); 
	}
	
	vm.cargarGarantiasPolizas = function (idPoliza) {
		
		json = {"ID_POLIZA": idPoliza};
		
		GarantiaService.getGarantiasByPoliza(json)
			.then(function successCallback(response) {
		
			if (response.status === 200) {
				if(response.data.ID_RESULT == 0){
					vm.listaGarantias = response.data.GARANTIAS;
					if(vm.listaGarantias != undefined){
						let auh = vm.listaGarantias.find(data => data.ID_GARANTIA == 74);
						let pjv = vm.listaGarantias.find(data => data.ID_GARANTIA == 62);
						vm.garantiasSeleccionadas = [];
						
						if(auh != undefined){
							auh.IN_SELECTED = true;
							vm.garantiasSeleccionadas.push(auh);
						}
						
						if(pjv != undefined){
							pjv.IN_SELECTED = true;
							vm.garantiasSeleccionadas.push(pjv);
						}
						
					}
				}
			}
		
		}, function errorCallback(response) {
	       	vm.buscandoPresupuesto = false;
	       	vm.presuEncontrado = false;
	    }); 
	}
	
    
    vm.comprobarGarantiaOpcional = function (idGarantia){
	
		if(vm.modalidad.ID_MODALIDAD == 245){
			if(vm.garantiasSeleccionadas != undefined){
				
				let garantiaSeleccionada = vm.garantiasSeleccionadas.find(data => data.ID_GARANTIA == idGarantia);
				
				if(garantiaSeleccionada != undefined){
				
					return garantiaSeleccionada.IN_SELECTED;
				}
			}
		}else{
			return false;
		}
	}
	
	
	
    vm.formatPrice = function (x) {
        if (x != null && typeof x == "string" && x.includes(',')) {
            x = x.replace(',', '.');
        }

        if (isNaN(x) === true) {
            x = 0;
        }
        if (x == undefined) {
            x = 0;
        }
        if (typeof x === "string") {
            x = parseFloat(x);
        }
        x = x.toFixed(2);
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(",");
    }
  
 	}
    ng.module('App').component('sdSolicitud', Object.create(solicitudComponent));
    
})(window.angular);
