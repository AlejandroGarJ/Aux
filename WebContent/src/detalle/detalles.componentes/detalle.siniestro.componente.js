(function(ng) {	

	//Crear componente de app
    var siniestroComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$window', '$q', '$location', '$mdDialog', 'BusquedaService', 'TiposService', 'SiniestroService', 'PolizaService', 'BASE_SRC', 'GarantiaService', '$scope', '$translate', 'CommonUtils', 'FicherosService', 'ExportService', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busquedaSiniestro: '?^busquedaSiniestro'
    		}
    }
    
    siniestroComponent.controller = function siniestroComponentControler($window, $q, $location, $mdDialog, BusquedaService, TiposService, SiniestroService, PolizaService, BASE_SRC, GarantiaService, $scope, $translate, CommonUtils, FicherosService, ExportService, constantsTipos){
    	var vm=this;
    	vm.tipos = {};
    	vm.isNew = false;
    	vm.isUpdated = true;
    	var json = {};
		var isError = false;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok($translate.instant('ACCEPT'));
		vm.navegador = bowser.name.toLowerCase();
		vm.garantia = {};
		vm.nombreArchivo = null;
		vm.archivo = null;
		vm.tipos.garantias = [];
		vm.tipos.garantiasHijo = [];
		vm.tipos.garantiasHijoFilter = [];
		vm.tabSiniestro = 1;
		vm.tipos.descripciones = [];
		vm.tipos.servicios = [];
		vm.tipos.indemnizaciones = [];
		vm.listArchivosPendientes = [];
        vm.formatters = {};
        vm.coberturas = [];
        vm.detallesPoliza = null;
        vm.coberturasSeleccionadas = [];
        vm.tipos.rechazo = [];
		vm.sumaTotal = 0;
		vm.existeMovEcon = null;
		vm.coberturasModal = [];
		vm.inPoliza = false;
		vm.url = window.location.hash;
		vm.importeDefectoReserva = null;
		vm.mantenerReserva = false;
		vm.mostrarSeccionesExtension = false;
        vm.garantiasActivas = [];
        vm.listaMovSeleccionados = [];
        vm.notificacionesActivas = false;
		vm.servicios = [];
        vm.questionsSelected = [];
		vm.moment = moment(new Date()).format('YYYY-MM-DD');
		vm.siniestroPecuniarias = {};
		vm.siniestroAmbitoLaboral = false;
		vm.impacto = false;
		vm.requiereTecnicos = false;
		vm.medidasAdic = [];
		vm.recomendaciones = [];
		vm.aplicaciones = [];
		vm.medidasAseg = [];
		vm.productosSiniestros = [];
		vm.cierre = false;
		vm.ruta = "documentos/";
		var msgConfirm = $mdDialog.confirm()
	        .title($translate.instant('MSG_WANT_DELETE'))
	        .ariaLabel('Lucky day')
	        .ok($translate.instant('ACCEPT'))
	        .cancel($translate.instant('CANCEL'));
		
    	this.$onInit = function() {
    		
    		vm.datos = null;
    		if (vm.parent.datos != null) {
    			vm.datos = JSON.parse(JSON.stringify(vm.parent.datos));
				if (vm.datos.JS_ENVIADO != null) {
					vm.siniestroPecuniarias = JSON.parse(vm.datos.JS_ENVIADO);
					if(vm.siniestroPecuniarias.MEDIDAS_ADICIONALES != undefined){
						vm.medidasAdic = vm.siniestroPecuniarias.MEDIDAS_ADICIONALES;
					}
					if(vm.siniestroPecuniarias.MEDIDAS_ASEGURADO != undefined){
						vm.medidasAseg = vm.siniestroPecuniarias.MEDIDAS_ASEGURADO;
					}
					if(vm.datos.OPOLIZA.ID_PRODUCTO !=28){
						if(vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS != undefined && vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.APLICACIONES_EXTERNAS_ESTANDARES != undefined){
							vm.aplicaciones = vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.APLICACIONES_EXTERNAS_ESTANDARES;
						}
						if(vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS != undefined && vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.RECOMENDACIONES_LAZARUS != undefined){
							vm.recomendaciones = vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.RECOMENDACIONES_LAZARUS;
						}
					}
				} else {
					if(vm.datos.OPOLIZA.ID_PRODUCTO !=28){
						vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS = {};
					} else {
						vm.siniestroPecuniarias.CIBERPARTICULARES = {};
					}
				}
    		}
			vm.permisos = null;
    		vm.rol = window.sessionStorage.rol;
			vm.fechaReaperturaAnterior = null;
			
			if (vm.busquedaSiniestro != null) {
				vm.permisos = vm.busquedaSiniestro.permisos;
			} else {
				if(vm.appParent.getPermissions != undefined){
	        		vm.permisos = vm.appParent.getPermissions('siniestros_list');
	    		}
			}
			
			if (vm.url.includes('polizas_list')) {
				vm.inPoliza = true;
			}
			
			if ($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				var perfil = JSON.parse($window.sessionStorage.perfil);

				if (perfil.adicional != null) {
					vm.idCompaniaUsuario = perfil.adicional.ID_COMPANIA;
					vm.cifCompaniaUsuario = perfil.adicional.NU_CIF;
				}
            }
			
    		//Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
    		//Parámetro utilizado en: ng-style="resizeHeight({{$ctrl.medida}})"
    		if(vm.parent.parent.url == 'siniestros')
    			vm.medida = 290;
    		else if(vm.parent.parent.url == 'clientes' || vm.parent.parent.url == 'polizas')
				vm.medida = 330;
			
			
    		if(vm.datos == undefined || vm.datos == null) {
				vm.isNew = true;

				if(vm.parent != null && vm.parent.parent != null && vm.parent.parent.detalleCliente != null && vm.parent.parent.detalleCliente.OPOLIZA != null && vm.parent.parent.detalleCliente.OPOLIZA.ID_POLIZA != null) {
					
					PolizaService.getDetail(vm.parent.parent.detalleCliente.OPOLIZA.ID_POLIZA)
                    .then(function successCallback(response) {
						if(response.data != null && response.data.ID_POLIZA != null) {
							if(vm.datos == undefined) {
								vm.datos = {
									'OPOLIZA': response.data
								}
								
								vm.getGarantias();
							}
							
							vm.comprobarGarantiaCiber(response.data);
							
							//Si es de particulares, rellenar el formulario de call center
							if (vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PRODUCTO == 28) {
								vm.siniestroPecuniarias.DATOS_CONTACTO = {};
								vm.datos.ID_ESTADO_SINIESTRO = 1;
								// vm.datos.ID_SUBESTADO_SINIESTRO = 0;
								// vm.datos.ID_ESTADO_SINIESTRO = 3;
								vm.formCallCenter = {};
								vm.formCallCenter.pais = "España";
								vm.datos.FD_ACEPTACION = moment(new Date()).format('YYYY-MM-DD');

								if (vm.datos.OPOLIZA.LST_ASEGURADOS && vm.datos.OPOLIZA.LST_ASEGURADOS.length > 0) {
									var tomador = vm.datos.OPOLIZA.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3);
									if (tomador != null) {
										vm.siniestroPecuniarias.DATOS_CONTACTO.NOMBRE_CONTACTO = tomador.NO_NOMBRE_COMPLETO;
										vm.siniestroPecuniarias.DATOS_CONTACTO.MAIL_CONTACTO = tomador.NO_EMAIL;
										vm.siniestroPecuniarias.DATOS_CONTACTO.TELEFONO = tomador.NU_TELEFONO1;
										if (tomador.LIST_DOMICILIOS && tomador.LIST_DOMICILIOS.length > 0) {
											vm.formCallCenter.domicilio = tomador.LIST_DOMICILIOS[0].NO_DIRECCION;
											vm.formCallCenter.localidad = tomador.LIST_DOMICILIOS[0].NO_LOCALIDAD;
										}
									}
								}

								if (vm.datos.OPOLIZA.JS_ENVIADO) {
									var jsEnviado = JSON.parse(vm.datos.OPOLIZA.JS_ENVIADO);
									if(jsEnviado.CIBERPARTICULARES != undefined){
										vm.limiteIndemnizacion =jsEnviado.CIBERPARTICULARES.AMMOUNT_OPTION;
										if(vm.limiteIndemnizacion != null) {
											vm.limiteIndemnizacion = vm.amountCP.find(x => x.CO_TIPO == vm.limiteIndemnizacion).DS_TIPOS;    
										}
									}	
								}

								vm.getImporteReclamadoCliente();
							}
							
							if(vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PROGRAMA != null && (vm.datos.OPOLIZA.ID_PROGRAMA == 10 || vm.datos.OPOLIZA.ID_PROGRAMA == 17 || vm.datos.OPOLIZA.ID_PROGRAMA == 19)){
								vm.ruta += vm.datos.OPOLIZA.ID_PROGRAMA + "/";
							}
							//Saber si hay que enviar notificaciones con este programa
							vm.enviarNotificaciones();
						}
                    }, function errorCallBack(response) {

                    });
					
					SiniestroService.getSiniestrosByFilter({OPOLIZA: { ID_POLIZA: vm.parent.parent.detalleCliente.OPOLIZA.ID_POLIZA }})
					.then(function successCallback(response){
						
						if(response.data.ID_RESULT == 0 && response.data.SINIESTROS != null && response.data.SINIESTROS.SINIESTRO != null){
							vm.gridSiniestrosPoliza.data = response.data.SINIESTROS.SINIESTRO;
						}
						
					});
				}
	    		
	    		TiposService.getTipos({ CO_TIPO: "IMPORTE_RESERVA_CIBER" })
	    		.then(function successCallback(response){
	    			if(response.data != null && response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO[0] !=null && response.data.TIPOS.TIPO[0].DS_TIPOS != null && response.data.TIPOS.TIPO[0].DS_TIPOS != ""){
	    				vm.importeDefectoReserva = response.data.TIPOS.TIPO[0].DS_TIPOS;
	    				vm.mantenerReserva = true;
	    			}
	    		});
				
    		} else {
    			vm.sumaTotal = 0;
    			if (vm.datos.IM_PAGO != null) {
    				vm.sumaTotal += vm.datos.IM_PAGO;
    			}
    			if (vm.datos.IM_INDEMNIZACION != null) {
    				vm.sumaTotal += vm.datos.IM_INDEMNIZACION;
    			}
    			if (vm.datos.IM_FRANQUICIA != null) {
    				vm.sumaTotal -= vm.datos.IM_FRANQUICIA;
    			}
    			vm.getDocumentos();

    			if (vm.datos.FD_REAPERTURA != null) {
        			vm.fechaReaperturaAnterior = moment(vm.datos.FD_REAPERTURA).format('YYYY-MM-DD');
    			}

				if (vm.datos.ID_COMP_RAMO_PROD == 28) {
					vm.coberturaNoMultiple = vm.datos.CO_TIPO_SINIESTRO;
                
                //     if (vm.datos.DS_ATIS != null) {
                //         var dsAtisSplit = vm.datos.DS_ATIS.split(" | ");
                //         if (dsAtisSplit != null && dsAtisSplit.length > 0) {
                //             for (var i = 0; i < dsAtisSplit.length; i++) {
                //                 vm.questionsSelected.push(dsAtisSplit[i]);
                //             }
                //         }
                //     }
				}
			}
    		
    		if(/siniestros/.test(url)){
    			vm.isUpdated = false;
    		}
    		
    		//Guardar primer estado del siniestro
    		if (vm.datos != null && vm.datos.ID_ESTADO_SINIESTRO != null) {
        		vm.estadoSiniestroCopy = JSON.parse(vm.datos.ID_ESTADO_SINIESTRO);
    		}
    		
			TiposService.getTipos({ "CO_TIPO": "PRODUCTO_APERTURA_SINIESTRO" })
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
							vm.productosSiniestros = response.data.TIPOS.TIPO[0].DS_TIPOS.split(';').map(element => Number(element));
						}
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

    		if(vm.appParent.listServices.listEstadosSiniestro != null && vm.appParent.listServices.listEstadosSiniestro.length > 0) {
    			vm.tipos.estados = JSON.parse(JSON.stringify(vm.appParent.listServices.listEstadosSiniestro));
    			
				//Mostrar opción SOLO de reapertura cuando el siniestro esté cerrado
				if (vm.datos != null && vm.datos.ID_ESTADO_SINIESTRO == 2 && vm.tipos.estados && vm.tipos.estados.length > 0) {
					var reapertura = vm.tipos.estados.find(x => x.ID_ESTADO_SINIESTRO == 6);
					var cerrado = vm.tipos.estados.find(x => x.ID_ESTADO_SINIESTRO == 2);
					var array = [reapertura, cerrado];
					for (var i = vm.tipos.estados.length -1; i >= 0; i--) {
						if(!array.includes(vm.tipos.estados[i])){
							vm.tipos.estados.splice(i, 1);
						}						
					}
					// vm.tipos.estados.filter(x => array.includes(x));
				}
				
				//Mostrar opción de reapertura solo cuando el siniestro esté cerrado
				if (vm.datos != null && vm.datos.ID_ESTADO_SINIESTRO != 2 && vm.datos.ID_ESTADO_SINIESTRO != 6 && vm.tipos.estados && vm.tipos.estados.length > 0) {
					var indexReapertura = vm.tipos.estados.findIndex(x => x.ID_ESTADO_SINIESTRO == 6);
					if (indexReapertura > -1) {
						vm.tipos.estados.splice(indexReapertura, 1);
					}
				}
    		} else {
    			TiposService.getEstadosSiniestro({})
        		.then(function successCallback(response){
        			if(response.status == 200){
        				vm.tipos.estados = response.data.TIPOS.TIPO;
        				vm.appParent.listServices.listEstadosSiniestro = JSON.parse(JSON.stringify(vm.tipos.estados));

        				//Mostrar opción de reapertura solo cuando el siniestro esté cerrado
        				if (vm.datos != null && vm.datos.ID_ESTADO_SINIESTRO != 2 && vm.datos.ID_ESTADO_SINIESTRO != 6 && vm.tipos.estados && vm.tipos.estados.length > 0) {
        					var indexReapertura = vm.tipos.estados.findIndex(x => x.ID_ESTADO_SINIESTRO == 6);
        					if (indexReapertura > -1) {
        						vm.tipos.estados.splice(indexReapertura, 1);
        					}
        				}
        			}
        		});
    		}
    		
    		if(vm.appParent.listServices.listNacionalidades != null && vm.appParent.listServices.listNacionalidades.length > 0){
    			vm.tipos.paises = vm.appParent.listServices.listNacionalidades;
    		} else {
    			TiposService.getNacialidades()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.paises = response.data.PAISES.PAIS;
    					vm.appParent.listServices.listNacionalidades = vm.tipos.paises;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
                    }
    			});
    		}
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_RESPONSABILDAD_SINIESTRO})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.responsabilidades = response.data.TIPOS.TIPO;
    			}
    		});
    		
    		TiposService.getTipos({'ID_CODIGO': constantsTipos.TIPO_MOV})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.movEcon = response.data.TIPOS.TIPO;
					vm.tipos.tipoMovimiento = response.data.TIPOS.TIPO;
    			}
    		});
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.SUBESTADO_SINIESTRO})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.subestados = response.data.TIPOS.TIPO;
    				for (var i = 0; i < vm.tipos.subestados.length; i++) {
    					if (vm.tipos.subestados[i].CO_TIPO != null && typeof vm.tipos.subestados[i].CO_TIPO == "string") {
    						vm.tipos.subestados[i].CO_TIPO = parseInt(vm.tipos.subestados[i].CO_TIPO);
    					}
    				}
    			}
    		});
    		
			TiposService.getTipos({'ID_CODIGO': constantsTipos.MOTIVO_REAPERTURA})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.motReapertura = response.data.TIPOS.TIPO;
    			}
    		});

    		TiposService.getTipos({"ID_CODIGO": constantsTipos.INCIDENTES_SINIESTRO})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.incidentes = response.data.TIPOS.TIPO;
					vm.cierresRapidos = [];
					for (var i = 0; i < vm.tipos.incidentes.length; i++) {
						var incidente = response.data.TIPOS.TIPO[i];
						if (incidente.CO_TIPO.includes('CIERRE')) {
							vm.cierresRapidos.push(incidente);
						}
					}
					if(vm.siniestroPecuniarias.TIPO_INCIDENTE != null){
						vm.cierresRapidos.find(x => x.DS_TIPOS === vm.siniestroPecuniarias.TIPO_INCIDENTE) ? vm.cierre = true : false ;
						if(vm.cierre == false)
							vm.siniestroPecuniarias.GESTION_RAPIDA = '2';
					}	
    			}
    		});

			TiposService.getTipos({"ID_CODIGO": constantsTipos.SIN_VECTOR_ENTRADA})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.vectores = response.data.TIPOS.TIPO;
    			}
    		});

			if(vm.appParent.listServices.listCantidadAsegurada_cp != null && vm.appParent.listServices.listCantidadAsegurada_cp.length > 0) {
				vm.amountCP = vm.appParent.listServices.listCantidadAsegurada_cp;
			} else {
				TiposService.getTipos({
					"ID_CODIGO": constantsTipos.RNG_AMMOUNT_CP
				})
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.amountCP = response.data.TIPOS.TIPO;
						vm.appParent.listServices.listCantidadAsegurada_cp = vm.amountCP;
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.appParent.logout();
					}
				});
			}
			
			if(vm.isNew != true) {
	    		vm.getGarantias(true);
				SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": vm.datos.ID_SINIESTRO})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.siniestros = response.data.SINIESTROS.SINIESTRO;	
						if (vm.siniestros != null && vm.siniestros[0] != null && vm.siniestros[0].LST_MOVS_ECONOMICOS != null && vm.siniestros[0].LST_MOVS_ECONOMICOS.length > 0) {
							vm.existeMovEcon = true;
							var garantiasSeleccionadas = vm.getGarantiasSeleccionadas(vm.siniestros[0].LST_MOVS_ECONOMICOS);
							vm.crearCoberturasModal(garantiasSeleccionadas);
						} else {
							vm.existeMovEcon = false;
						}
					} else {
						vm.existeMovEcon = false;
					}

					// vm.gridDetalleSiniestro.data = vm.siniestros;
					vm.gridDetalleSiniestro.data = vm.siniestros[0].LST_MOVS_ECONOMICOS;
					vm.load = false;
				});

				PolizaService.getDetail(vm.datos.OPOLIZA.ID_POLIZA)
				.then(function successCallback(response) {
					if(response.data != null && response.data.ID_POLIZA != null) {
						if(vm.datos != undefined) {
							response.data.IN_POLIZAS = vm.datos.OPOLIZA.IN_POLIZAS;
							vm.datos.OPOLIZA = response.data;
						}
						
						if (response.data.ID_PROGRAMA != null) {
							vm.datos.OPOLIZA.ID_PROGRAMA = response.data.ID_PROGRAMA;
							vm.polizaCopy = JSON.parse(JSON.stringify(vm.datos.OPOLIZA));

							if (vm.datos.OPOLIZA.ID_PROGRAMA == 10 || vm.datos.OPOLIZA.ID_PROGRAMA == 17 || vm.datos.OPOLIZA.ID_PROGRAMA == 19) {
								vm.ruta = vm.ruta += vm.datos.OPOLIZA.ID_PROGRAMA + "/";
							}
						}
						
						if (vm.datos.OPOLIZA.JS_ENVIADO) {
							var jsEnviado = JSON.parse(vm.datos.OPOLIZA.JS_ENVIADO);
							if(jsEnviado.CIBERPARTICULARES != undefined){
								vm.limiteIndemnizacion =jsEnviado.CIBERPARTICULARES.AMMOUNT_OPTION;
								if(vm.limiteIndemnizacion != null) {
									vm.limiteIndemnizacion = vm.amountCP.find(x => x.CO_TIPO == vm.limiteIndemnizacion).DS_TIPOS;    
								}
							}	
						}

						vm.comprobarGarantiaCiber(response.data);

						// TiposService.getTipos({"ID_CODIGO": constantsTipos.MOT_RECHAZO})
						TiposService.getTipos({ "NO_CODIGO": "MOT_RECHAZO_" + vm.datos.OPOLIZA.ID_PROGRAMA })
						.then(function successCallback(response) {
							if (response.status == 200) {
								if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
									vm.tipos.rechazo = response.data.TIPOS.TIPO;
								}
							}else{
								TiposService.getTipos({ "NO_CODIGO": constantsTipos.MOT_RECHAZO })
								.then(function successCallback(response) {
									if (response.status == 200) {
										if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
											vm.tipos.rechazo = response.data.TIPOS.TIPO;
										}
									} 
								});
							}
						});

                        TiposService.getTipos({"ID_CODIGO": constantsTipos.DS_DOC_SINIESTRO, "CO_TIPO": vm.datos.OPOLIZA.ID_PROGRAMA.toString() })
                        .then(function successCallback(response){
                            if(response.status == 200){
                                if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
                                    vm.tipos.descripciones = response.data.TIPOS.TIPO;
                                } else {
                                    TiposService.getTipos({"ID_CODIGO": constantsTipos.DS_DOC_SINIESTRO, "CO_TIPO": "0" })
                                    .then(function successCallback(response){
                                        if(response.status == 200) {
											if(response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0)
                                            	vm.tipos.descripciones = response.data.TIPOS.TIPO;
                                        }
                                    });
                                }
                            }
                        });
						
						//Saber si hay que enviar notificaciones con este programa
						vm.enviarNotificaciones();
					}
				}, function errorCallBack(response) {

				});
			}
		}
    	
    	vm.changeEstadoSiniestro = function () {
    		vm.datos.FD_REAPERTURA = vm.fechaReaperturaAnterior;
			if(vm.datos.ID_ESTADO_SINIESTRO == 6){ // REAPERTURA
				vm.datos.FD_TERMINACION = null;
				vm.datos.FD_REAPERTURA = vm.moment;
			// } else if(vm.datos.ID_ESTADO_SINIESTRO == 2){
			// 	
			}
    	}
    	
		vm.chkReservaCP = function(){
			if(vm.datos.OPOLIZA.ID_PRODUCTO == 28){
				if(vm.datos.IM_RESERVA > parseInt(vm.limiteIndemnizacion.replace(/[^\d]/g, '', 10))){
					msg.textContent($translate.instant('MSG_RESERVE_EXCEED')+vm.limiteIndemnizacion+' '+$translate.instant('HIRED'));
					$mdDialog.show(msg);
					vm.datos.IM_RESERVA = null;
				}
			}
		}

		vm.changeCierre = function(){
			if(vm.siniestroPecuniarias.TIPO_INCIDENTE != null)
				vm.cierresRapidos.find(x => x.DS_TIPOS === vm.siniestroPecuniarias.TIPO_INCIDENTE) ? vm.cierre = true : false ;

			if(vm.cierre == false)
				vm.siniestroPecuniarias.GESTION_RAPIDA = '2';
		}

    	vm.enviarNotificaciones = function () {
    		if (vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PROGRAMA) {
        		TiposService.getTipos({"CO_TIPO": "COMUNICACION_PROGRAMA_SINIESTRO"})
        		.then(function successCallback(response) {
        			if (response.status == 200) {
        				if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
        					var listaProgramas = response.data.TIPOS.TIPO[0].DS_TIPOS;
        					if (listaProgramas != null) {
        						listaProgramas = listaProgramas.split(";");
        						if (listaProgramas.includes(vm.datos.OPOLIZA.ID_PROGRAMA.toString())) {
        	        				vm.notificacionesActivas = true;
        						}
        					}
        				}
        			}
        		});
    		}
    	}

		vm.comprobarGarantiaCiber = function (data) {
			if (data.JS_ENVIADO != null) {
				var jsEnviado = JSON.parse(data.JS_ENVIADO);
				if (jsEnviado.LST_GARANTIAS != null && jsEnviado.LST_GARANTIAS.length > 0) {
					var garantia = jsEnviado.LST_GARANTIAS.find(x => x.ID_GARANTIA == 57);
					if (garantia != null && garantia.NU_CAPITAL == 100000) {
						vm.mostrarSeccionesExtension = true;
					}
				}
			}
		}

    	vm.getGarantias = function (setCoberturas) {
    		if (vm.datos != null && vm.datos.OPOLIZA != null) {
				GarantiaService.getGarantiasByProducto({"ID_COMP_RAMO_PROD": vm.datos.OPOLIZA.ID_PRODUCTO})
				.then(function successCallback(response){
					if(response.status == 200){
						if (response.data.GARANTIAS != null) {
							vm.tipos.garantias = [];
							vm.tipos.garantiasHijo = [];
							for (var i = 0; i < response.data.GARANTIAS.length; i++) {
								var garantia = response.data.GARANTIAS[i];
								if (garantia.ID_GARANTIA_PADRE == null) {
									vm.tipos.garantias.push(garantia);
								} else {
									vm.tipos.garantiasHijo.push(garantia);
								}
							}
						}
						
						vm.tipos.garantias.sort(function (a, b) {
                            if (a.NO_GARANTIA > b.NO_GARANTIA) {
                              return 1;
                            }
                            if (a.NO_GARANTIA < b.NO_GARANTIA) {
                              return -1;
                            }
                            // a must be equal to b
                            return 0;
                        });
						
						if (setCoberturas == true) {
							if(vm.datos.ID_COMP_RAMO_PROD == 28){
                                vm.changeCobertura(true);
                            } else {
                                vm.changeCobertura();
                            }
						}
					}
				});
    		}
    	}
    	
		vm.gridDetalleSiniestro = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [5, 10, 15, 20, 25],
			paginationPageSize: 5,
			selectionRowHeaderWidth: 29,
			enableRowHeaderSelection: true,
			enableRowSelection: true,
			enableSelectAll: false,
			data: [],
			columnDefs: [
				{
					field: 'NU_SINIESTRO',
					displayName: $translate.instant('CLAIM_NUMBER'),
					cellTooltip: function (row) {return row.entity.NU_SINIESTRO}
				},
				{
					field: 'ID_MOV_ECOM',
					displayName: $translate.instant('MOVEMENT_ID'),
					cellTooltip: function (row) {return row.entity.ID_MOV_ECOM}
				},
				{
					field: 'CO_TIPOMOV',
					displayName: $translate.instant('MOVEMENT_TYPE'), 
					cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDsTipoMov(row.entity.CO_TIPOMOV)}}</div>',
					cellTooltip: function (row) {
						return vm.getDsTipoMov(row.entity.CO_TIPOMOV);
					}
				},
				{
					field: 'oMovEconGaran.DS_CONCEPTO',
					displayName: $translate.instant('DESCRIPTION'),
					cellTooltip: function (row) {return row.entity.oMovEconGaran.DS_CONCEPTO}
				},
				{
					field: 'DS_PERCEPTOR',
					displayName: $translate.instant('SUPPLIER'),
					cellTooltip: function (row) {return row.entity.DS_PERCEPTOR}
				},
				/*{
					field: 'IM_BASE',
					displayName: $translate.instant('BASE_AMOUNT'),
					cellFilter: 'currency: "€" : 2',
					cellTooltip: function (row) {return row.entity.IM_BASE}
				},*/
				{
					field: 'IM_TOTAL',
					displayName: $translate.instant('TOTAL'), 
					cellTemplate: '<div ng-if="row.entity.IM_TOTAL != null && row.entity.IM_TOTAL != 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_TOTAL)}} €</div><div ng-if="row.entity.IM_TOTAL == null || row.entity.IM_TOTAL == 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_BASE)}} €</div>',
					cellFilter: 'currency: "€" : 2',
					cellTooltip: function (row) {return row.entity.IM_TOTAL}
				},
				{
					field: 'FT_MOV',
					displayName: $translate.instant('DATE_MOVEMENT'),
					cellFilter: 'date:\'dd/MM/yyyy\'',
					cellTooltip: function (row) {return row.entity.FT_MOV}
				},
				{
					field: 'NU_SAP',
					displayName: $translate.instant('SENT_SAP'), 
					cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
					cellFilter: 'date:\'dd/MM/yyyy\'',
					cellTooltip: function (row) {return row.entity.FT_MOV}
				},
				{
					name: ' ',
					cellTemplate: '<div ng-if="(grid.appScope.$ctrl.cifCompaniaUsuario != row.entity.NU_DOC_PERCEPTOR) && (grid.appScope.$ctrl.idCompaniaUsuario == 4 || grid.appScope.$ctrl.idCompaniaUsuario == 30) && (grid.appScope.$ctrl.appParent.isRolAdmin() == true || grid.appScope.$ctrl.rol == 11) && (grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 3 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 4 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 5 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 6 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 28 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 29 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 19 || grid.appScope.$ctrl.datos.OPOLIZA.ID_PRODUCTO == 32) && row.entity.oMovEconGaran != null && row.entity.oMovEconGaran.ID_MOV_ECOM_D != null && row.entity.oMovEconGaran.FD_APROBACION == null && (row.entity.CO_TIPOMOV == 1 || row.entity.CO_TIPOMOV == 3 || row.entity.CO_TIPOMOV == 4)" class="ui-grid-cell-contents td-eye"><a ng-click="grid.appScope.$ctrl.aprobarMovimiento(row.entity)">{{ "APPROVE" | translate }}</a></div>',
					width: 80,
					enableSorting: false, enableColumnMenu: false,
				},
				{
                    field: 'menu',
                    displayName: '',
                    width: "3%",
                    cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_SINIESTRO != null">
			                    	<md-menu>
			                			<md-button ng-click="$mdMenu.open()">
			                				<i class="fa-regular fa-ellipsis-vertical"></i>
		                				</md-button>
		                				<md-menu-content class="optionMenuContent">
			                				<md-menu-item ng-if="grid.appScope.$ctrl.rol != 2 && grid.appScope.$ctrl.rol != 3 && grid.appScope.$ctrl.rol != 5" ng-click="grid.appScope.$ctrl.verDetalleGarantia(row.entity,\'siniestro\', row)">
			                					<md-button>
			                						<span class="menuItemBlue">
			                							<i class="fa-sharp fa-solid fa-eye"></i>
			                							{{ 'SHOW_MOVEMENT' | translate }}
		                							</span>
		            							</md-button>
		        							</md-menu-item>
	        							</md-menu-content>
        							</md-menu>
    							</div>`,
                }
			],
            enableGridMenu: true,
            exporterMenuCsv: false,
            exporterMenuPdf: false,
            exporterExcelFilename: 'movimientos-economicos.xlsx',
            exporterExcelSheetName: 'Sheet1',
            exporterExcelCustomFormatters: function ( grid, workbook, docDefinition ) {
         
              var stylesheet = workbook.getStyleSheet();
              var stdStyle = stylesheet.createFontStyle({
                size: 9, fontName: 'Calibri'
              });
              var boldStyle = stylesheet.createFontStyle({
                size: 9, fontName: 'Calibri', bold: true
              });
              var aFormatDefn = {
                "font": boldStyle.id,
                "alignment": { "wrapText": true }
              };
              var formatter = stylesheet.createFormat(aFormatDefn);
              // save the formatter
              vm.formatters['bold'] = formatter;
              var dateFormatter = stylesheet.createSimpleFormatter('date');
              vm.formatters['date'] = dateFormatter;
         
              aFormatDefn = {
                "font": stdStyle.id,
                "fill": { "type": "pattern", "patternType": "solid", "fgColor": "FFFFC7CE" },
                "alignment": { "wrapText": true }
              };
              var singleDefn = {
                font: stdStyle.id,
                format: '#,##0.0'
              };
              formatter = stylesheet.createFormat(aFormatDefn);
              // save the formatter
              vm.formatters['red'] = formatter;
         
              Object.assign(docDefinition.styles , $scope.formatters);
         
              return docDefinition;
            },
            exporterExcelHeader: function (grid, workbook, sheet, docDefinition) {
                // this can be defined outside this method
                var stylesheet = workbook.getStyleSheet();
                var aFormatDefn = {
                  "font": { "size": 11, "fontName": "Calibri", "bold": true },
                  "alignment": { "wrapText": true }
                };
                var formatterId = stylesheet.createFormat(aFormatDefn);
            },
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
				
				vm.busqueda.translateHeaders(vm.gridDetalleSiniestro);

				vm.listaMovSeleccionados = [];
				
				if (vm.rol != 1 && vm.rol != 4 && vm.gridDetalleSiniestro != null && vm.gridDetalleSiniestro.columnDefs != null) {
					var indexEliminarSiniestro = vm.gridDetalleSiniestro.columnDefs.findIndex(x => x.name == 'eliminarMovimiento');
					if (indexEliminarSiniestro > -1) {
						vm.gridDetalleSiniestro.columnDefs[indexEliminarSiniestro].visible = false;
					}
				}
				
				if (vm.datos.ID_COMP_RAMO_PROD == 28) {
					var indexProveedor = vm.gridDetalleSiniestro.columnDefs.findIndex(x => x.field == "DS_PERCEPTOR");
					if (indexProveedor > -1) {
						vm.gridDetalleSiniestro.columnDefs[indexProveedor].visible = false;
					}
				}
				
				vm.gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					vm.listaMovSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
				vm.gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
					vm.listaMovSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
		    }
		}
		
		vm.eliminarMovimiento = function (row) {
			if (row.ID_MOV_ECOM != null) {
				//Modal de confirmación al eliminar comisionista
  				var confirm = $mdDialog.confirm().textContent($translate.instant('MSG_SURE_DELETING_MOVEMENT') + row.ID_MOV_ECOM + '?').ariaLabel('Lucky day').ok($translate.instant('ACCEPT')).multiple(true).cancel($translate.instant('CANCEL'));

      		    $mdDialog.show(confirm).then(function () {
    				vm.appParent.abrirModalcargar(true);
					SiniestroService.deleteMovEco(row)
					.then(function successCallback(response){
						if(response.data.ID_RESULT == 0){
							//Volver a recoger movimientos de siniestro
							SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": vm.datos.ID_SINIESTRO})
							.then(function successCallback(response){
								if(response.status == 200){
									vm.siniestros = response.data.SINIESTROS.SINIESTRO;	
								}
								// vm.gridDetalleSiniestro.data = vm.siniestros;
								vm.gridDetalleSiniestro.data = vm.siniestros[0].LST_MOVS_ECONOMICOS;
								msg.textContent($translate.instant('MSG_MOVEMENTRE_MOVED_SUCCESSFULLY'));
								$mdDialog.show(msg);
							}, function () {
								$mdDialog.cancel();
			      		    });
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}, function () {
						msg.textContent($translate.instant('MSG_ERROR_DELETING_MOVEMENT'));
						$mdDialog.show(msg);
	      		    });
      		    }, function () {
      		    	$mdDialog.cancel();
      		    });
			}
		}
		
		vm.enviarSap = function () {
			if (vm.listaMovSeleccionados != null && vm.listaMovSeleccionados.length > 0) {
				var indexSap = vm.listaMovSeleccionados.findIndex(x => x.NU_SAP != null);
				if (indexSap > -1) {
	                msg.textContent($translate.instant('MSG_SELECT_ MOVEMENTS_SENT_SAP'));
	                $mdDialog.show(msg);
				} else {
					var lstMov = [];
					for (var i = 0; i < vm.listaMovSeleccionados.length; i++) {
						lstMov.push({ ID_MOV_ECOM: vm.listaMovSeleccionados[i].ID_MOV_ECOM });
					}
					
					var obj = { 
						SINIESTROS: { 
							SINIESTRO: [
								{
									ID_SINIESTRO: vm.datos.ID_SINIESTRO,
									LST_MOVS_ECONOMICOS: lstMov
								}
							] 
						} 
					};
					
					vm.appParent.abrirModalcargar(true);
					SiniestroService.enviarSAP(obj)
					.then(function successCallback(response) {
						if(response.status == 200) {
							var error = false;
							var textHtml = "";
								
							if (response.data.SINIESTROS && response.data.SINIESTROS.SINIESTRO && response.data.SINIESTROS.SINIESTRO[0] && response.data.SINIESTROS.SINIESTRO[0].LST_MOVS_ECONOMICOS) {
								var movimientos = response.data.SINIESTROS.SINIESTRO[0].LST_MOVS_ECONOMICOS;
								for (var i = 0; i < movimientos.length; i++) {
									if (movimientos[i].ID_RESULT != 0) {
										error = true;
										textHtml += "<p>" + movimientos[i].ID_MOV_ECOM + " - " + movimientos[i].DS_RESULT + "</p>";
									}
								}
							}
							//Recargar listado
							SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": vm.datos.ID_SINIESTRO})
							.then(function successCallback(response){
								if(response.status == 200){
									vm.siniestros = response.data.SINIESTROS.SINIESTRO;
									vm.gridDetalleSiniestro.data = vm.siniestros[0].LST_MOVS_ECONOMICOS;
									if (error == false) {
						                msg.textContent($translate.instant('MSG_SENT_SAP_SUCCESSFULLY'));
						                $mdDialog.show(msg);
    									msg.htmlContent(null);
									} else {
								        var msgHtml = $mdDialog.alert() .clickOutsideToClose(true) .ok($translate.instant('ACCEPT'));
    									msgHtml.htmlContent(textHtml);
    									$mdDialog.show(msgHtml);
									}
								}
							});
						}
					}, function errorCallback(response){
		                msg.textContent($translate.instant('MGS_ERROR_SENDING_SAP'));
		                $mdDialog.show(msg);
					});
				}
			} else {
                msg.textContent($translate.instant('MSG_SELECT_MOVEMENT_SEND_SAP'));
                $mdDialog.show(msg);
			}
		}
		
		vm.gridSiniestrosPoliza = {
				enableSorting: true,
				enableHorizontalScrollbar: 0,
				paginationPageSizes: [5, 10, 15],
				paginationPageSize: 5,
				selectionRowHeaderWidth: 29,
				enableRowHeaderSelection: false,
				data: [],
				columnDefs: [
					{field: 'ID_SINIESTRO', displayName: 'ID '+$translate.instant('CLAIM'), cellTooltip: function (row) {return row.entity.ID_SINIESTRO},  },
					{field: 'OPOLIZA.NU_POLIZA', displayName: $translate.instant('POLICY_NUMBER'), cellTooltip: function (row) {return row.entity.OPOLIZA.NU_POLIZA},  },
					{field: 'FT_USU_ALTA', displayName: $translate.instant('DATE_DISCHARGE'), cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_USU_ALTA},  },
					{field: 'CO_TIPO_SINIESTRO', displayName: $translate.instant('AFFECTED_COVERAGE'), cellTooltip: function (row) {return row.entity.CO_TIPO_SINIESTRO},  }
				],
				onRegisterApi: function( gridApi ) {
					vm.gridApi = gridApi;
					vm.busqueda.translateHeaders(vm.gridSiniestrosPoliza);
				}
			}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.siniestro.html";
    	}
    	
    	//Guardar siniestro
    	vm.guardarSiniestro = function(form, rechazarAmbitoLaboral) {

    		if (vm.formSiniestro == true) {
                objFocus=angular.element('.ng-empty.ng-invalid-required:visible');    
                msg.textContent($translate.instant('MSG_DATA_CORRECTLY'));
                $mdDialog.show(msg);
                if(objFocus != undefined){
                    objFocus.focus();
                }

                return null;
            } 

			// La fecha de cierre no puede se anterior a la fecha actual
			if (vm.datos.FD_TERMINACION != null && vm.datos.FD_TERMINACION != "" && (vm.datos.FD_TERMINACION < moment(new Date()).startOf('day')) && (vm.datos.OPOLIZA.ID_PROGRAMA == 2 || vm.datos.OPOLIZA.ID_PROGRAMA == 10 || vm.datos.OPOLIZA.ID_PROGRAMA == 17 || vm.datos.OPOLIZA.ID_PROGRAMA == 18 || vm.datos.OPOLIZA.ID_PROGRAMA == 19)) {
				var confirm = $mdDialog.confirm()
				  .textContent($translate.instant('MSG_CLOSING_DATE_EARLIER_TODAY'))
				  .multiple(true)
				  .ariaLabel('Lucky day')
				  .ok($translate.instant('ACCEPT'))
				  .cancel($translate.instant('CANCEL'));
					$mdDialog.show(confirm).then(function() {
						$mdDialog.hide();
					}, function() {
						$mdDialog.hide();
					});
				return null;
			}

			// La fecha de cierre no puede se anterior a la fecha de reapertura
			
			if (vm.datos.FD_REAPERTURA != null && vm.datos.FD_REAPERTURA != '' && vm.datos.FD_TERMINACION != null && vm.datos.FD_TERMINACION != "" && (vm.datos.FD_TERMINACION < moment(new Date(vm.datos.FD_REAPERTURA)))) {
				var confirm = $mdDialog.confirm()
				  .textContent($translate.instant('MSG_CLOSING_DATE_REOPENING'))
				  .multiple(true)
				  .ariaLabel('Lucky day')
				  .ok($translate.instant('ACCEPT'))
				  .cancel($translate.instant('CANCEL'));
					$mdDialog.show(confirm).then(function() {
						$mdDialog.hide();
					}, function() {
						$mdDialog.hide();
					});
				return null;
			}

    		//Si se ha añadido fecha de terminación y no está cerrado el siniestro, mostrar advertencia
			if (vm.datos.FD_TERMINACION != null && vm.datos.FD_TERMINACION != "" && vm.datos.ID_ESTADO_SINIESTRO != 2) {
				var confirm = $mdDialog.confirm()
				  .textContent($translate.instant('MSG_CLOSING_DATE'))
				  .multiple(true)
				  .ariaLabel('Lucky day')
				  .ok($translate.instant('ACCEPT'))
				  .cancel($translate.instant('CANCEL'));
					$mdDialog.show(confirm).then(function() {
						vm.datos.ID_ESTADO_SINIESTRO = 2;
						vm.guardarSiniestro();
					}, function() {
						$mdDialog.hide();
					});
				return null;
			}

			//Si se está creando un siniestro de particulares y se ha marcado el ámbito laboral
			//Mostrar una advertencia de que se rechazará el siniestro
			if (vm.siniestroAmbitoLaboral == true && vm.isNew == true && vm.datos && vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PRODUCTO == 28 && rechazarAmbitoLaboral != true) {
				var confirm = $mdDialog.confirm()
				  .textContent($translate.instant('MSG_WORK_ENVIRONMENT'))
				  .multiple(true)
				  .ariaLabel('Lucky day')
				  .ok($translate.instant('ACCEPT'))
				  .cancel($translate.instant('CANCEL'));
				  $mdDialog.show(confirm).then(function() {
					vm.guardarSiniestro(vm.formSiniestro, true);
				}, function() {
					$mdDialog.hide(confirm);
				});
			    return null;
			}
    		
			var obj = JSON.parse(JSON.stringify(vm.datos));
			obj.ID_POLIZA = obj.OPOLIZA.ID_POLIZA;
			obj.FD_APERTURA = vm.formatDate(obj.FD_APERTURA);
			obj.FD_OCURRENCOMPANIA = vm.formatDate(obj.FD_OCURRENCOMPANIA);
			obj.FD_ACEPTACION = vm.formatDate(obj.FD_ACEPTACION);
			obj.FD_TERMINACION = vm.formatDate(obj.FD_TERMINACION);
			obj.FD_REAPERTURA = vm.formatDate(obj.FD_REAPERTURA);
			obj.FD_NOTIFICACION = vm.formatDate(obj.FD_NOTIFICACION);
			obj.CO_TIPO_SINIESTRO = vm.getCoTipoSiniestro();

			if(vm.siniestroPecuniarias != null){
				if (vm.medidasAseg != undefined && vm.medidasAseg.length > 0) {
					vm.siniestroPecuniarias.MEDIDAS_ASEGURADO = vm.medidasAseg;
				}
				if (vm.medidasAdic != undefined && vm.medidasAdic.length > 0) {
					vm.siniestroPecuniarias.MEDIDAS_ADICIONALES = vm.medidasAdic;
				}
				if (vm.datos.OPOLIZA.ID_PRODUCTO != 28){
					if(vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS == undefined){
						vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS = {};
					}
				 	if(vm.aplicaciones != undefined && vm.aplicaciones.length > 0) {
						vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.APLICACIONES_EXTERNAS_ESTANDARES = vm.aplicaciones;
					}
					if (vm.recomendaciones != undefined && vm.recomendaciones.length > 0) {
						vm.siniestroPecuniarias.CIBERRIESGOSEMPRESAS.RECOMENDACIONES_LAZARUS = vm.recomendaciones;
					}
				} else {
					if(vm.siniestroPecuniarias.CIBERPARTICULARES == undefined){
						vm.siniestroPecuniarias.CIBERPARTICULARES = {};
					}
					vm.siniestroPecuniarias.CIBERPARTICULARES.AFECTACION_SISTEMAS_EMPRESA = vm.siniestroAmbitoLaboral;
					vm.siniestroPecuniarias.CIBERPARTICULARES.IMPACTO_PERSONAL_DATOS_SENSIBLES = vm.impacto;
					vm.siniestroPecuniarias.CIBERPARTICULARES.REQUIERE_TECNICOS = vm.requiereTecnicos;

				}
				obj.SINIESTRO_PECUNIARIAS = vm.siniestroPecuniarias;
			}

			if (vm.isNew == true && vm.datos.OPOLIZA.ID_PRODUCTO == 28){
                if (obj.CO_TIPO_ACCIDENTE != null && obj.CO_TIPO_ACCIDENTE.length > 0) {
                    var coAccidente = "";
                    for (var i = 0; i < obj.CO_TIPO_ACCIDENTE.length; i++) {
                        coAccidente += obj.CO_TIPO_ACCIDENTE[i];
                        if ((i+1) < obj.CO_TIPO_ACCIDENTE.length) {
                            coAccidente += " | ";
                        }
                    }
                    obj.CO_TIPO_ACCIDENTE = coAccidente;
                }

                //añadir las respuestas de las preguntas
                // obj.DS_ATIS = [obj.DS_ATIS[0], obj.DS_ATIS[1]];

				// if (obj.DS_ATIS != null && obj.DS_ATIS.length > 0) {
                //     var dsAtis = "";
                //     for (var i = 0; i < obj.DS_ATIS.length; i++) {
                //         dsAtis += obj.DS_ATIS[i];
                //         if ((i + 1) < obj.DS_ATIS.length) {
                //             dsAtis += " | ";
                //         }
                //     }
                //     obj.DS_ATIS = dsAtis;
                // }
			}

			if (vm.anadirNuevasCoberturas == true && vm.seccion && vm.seccion.length > 0) {
				obj.LST_ID_GARANTIA = vm.getListIdGarantias();
			}
			
			if (obj.CO_TIPO_SINIESTRO != null && obj.CO_TIPO_SINIESTRO.length > 1000) {
                msg.textContent($translate.instant('MSG_SECTIONS_EXCEEDED'));
                $mdDialog.show(msg);
                return null;
			}

			if (obj.FD_TERMINACION != null && obj.LST_MOVS_ECONOMICOS != null) {
				delete obj.LST_MOVS_ECONOMICOS;
			}
			
			//Si se ha aceptado la advertencia de ámbito laboral, cerrarlo y pnerlo rehusado
			if (rechazarAmbitoLaboral == true) {
				obj.FD_TERMINACION = vm.formatDate(new Date());
				obj.ID_ESTADO_SINIESTRO = 5; //Rechazado
				obj.ID_SUBESTADO_SINIESTRO = 1; //Rehusado
			}
			
			if (vm.isNew == true) {
				obj.ID_RESPONSABILIDAD = "701";

				// Si no ha incluido reserva inicial, poner por defecto la de BBDD
				if ((obj.IM_RESERVA == null || obj.IM_RESERVA == "" || obj.IM_RESERVA == undefined) && vm.datos && vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PRODUCTO == 28) {
					obj.IM_RESERVA = vm.importeReservaParticulares;
				}
				
				if (obj.IM_RESERVA != null) {
					obj.LST_MOVS_ECONOMICOS = [
						{
							"CO_TIPOMOV": 0,
				            "FT_MOV": vm.formatDate(new Date()),
				            "FT_SITUACION": vm.formatDate(new Date()),
				            "FT_USU_ALTA": vm.formatDate(new Date()),
				            "ID_FPAGO": "2",
				            "ID_SITPAGO": "2",
				            "IM_BASE": obj.IM_RESERVA,
				            "IM_IRPF": "0",
				            "IM_IVA": "0",
				            "IM_TOTAL": obj.IM_RESERVA
						}
					]
				}
				
				if (vm.datos && vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PRODUCTO == 28) {
					var listIdGarantias = vm.getListIdGarantias();
					if (listIdGarantias && listIdGarantias.length > 0) {
						obj.LST_MOVS_ECONOMICOS[0].oMovEconGaran = {
							"ID_GARANTIA": listIdGarantias[0],
							"DS_GARANTIA": obj.CO_TIPO_SINIESTRO,
							"DS_CONCEPTO": "RESERVA INICIAL " + obj.IM_RESERVA + "€"
						}
					}
				}

				if (vm.datos.OPOLIZA != null && (vm.datos.OPOLIZA.ID_PROGRAMA == 2 || vm.datos.OPOLIZA.ID_PROGRAMA == 10 || vm.datos.OPOLIZA.ID_PROGRAMA == 17 || vm.datos.OPOLIZA.ID_PROGRAMA == 18 || vm.datos.OPOLIZA.ID_PROGRAMA == 19)) {
					obj.LST_ID_GARANTIA = vm.getListIdGarantias();
				}

				if (vm.formCallCenter != null) {
					obj.SINIESTRO_PECUNIARIAS.DATOS_CONTACTO.DOMICILIO = "";
					if (vm.formCallCenter.domicilio) {
						obj.SINIESTRO_PECUNIARIAS.DATOS_CONTACTO.DOMICILIO += vm.formCallCenter.domicilio + " ";
					}
					if (vm.formCallCenter.localidad) {
						obj.SINIESTRO_PECUNIARIAS.DATOS_CONTACTO.DOMICILIO += vm.formCallCenter.localidad + " ";
					}
					if (vm.formCallCenter.pais) {
						obj.SINIESTRO_PECUNIARIAS.DATOS_CONTACTO.DOMICILIO += vm.formCallCenter.pais;
					}
				}

				//Mantener reserva inicial
				obj.IS_NEW = true;
			} else {
				obj.IS_NEW = false;
			}
			
			if (obj.FD_REAPERTURA != null && obj.FD_REAPERTURA != vm.fechaReaperturaAnterior) {
				obj.ID_ESTADO_SINIESTRO = 6;
			}
			
			vm.appParent.abrirModalcargar(true);
			
			var isChangeStatus = (vm.estadoSiniestroCopy == obj.ID_ESTADO_SINIESTRO);
			// 	isChangeStatus ? SiniestroService.guardarDatosSiniestro(obj) : SiniestroService.guardarSiniestro(obj);
			
			if(isChangeStatus && !vm.anadirNuevasCoberturas){
			SiniestroService.guardarDatosSiniestro(obj)
			.then(function successCallback(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0) {
						vm.appParent.cambiarDatosModal($translate.instant('MSG_CLAIM_SAVED'));
						BusquedaService.buscar({'OPOLIZA': {'ID_POLIZA': vm.datos.OPOLIZA.ID_POLIZA}}, 'siniestros')
						.then(function successCallback(response) {
							if(response.status === 200) {
								if(response.data.ID_RESULT == 0 && vm.busquedaSiniestro != null) {
									vm.busquedaSiniestro.gridOptions.data = response.data.SINIESTROS.SINIESTRO;
									vm.busquedaSiniestro.numDetalles.splice(0, 1);
								}
							}
						},
						function errorCallback(response) {
							if(response.status == 406 || response.status == 401) {
								vm.parent.logout();
							}
						});

						if (vm.isNew == true) {
							//Enviar notificación
							if (vm.notificacionesActivas == true) {
								SiniestroService.notifications(vm.getCodeNotification("5"), response.data)
								.then(function successCallback(response){
									console.log("sendMail OK " + response);
								}, function errorCallback(response){
									msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
									$mdDialog.show(msg);
								});
							}
							
							if (response.data.NU_SINIESTRO != null) {
					            $window.location.href = window.location.origin + window.location.pathname + '#!/siniestros_list?nuSiniestro=' + response.data.NU_SINIESTRO;
							}
						}
					} else {
						vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
					}
				}
			}, function errorCallback(response){
				vm.appParent.cambiarDatosModal($translate.instant('ERROR_SAVE_CLAIM'));
			});

			} else {

			SiniestroService.guardarSiniestro(obj)
			.then(function successCallback(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0) {
						vm.appParent.cambiarDatosModal($translate.instant('MSG_CLAIM_SAVED'));
						BusquedaService.buscar({'OPOLIZA': {'ID_POLIZA': vm.datos.OPOLIZA.ID_POLIZA}}, 'siniestros')
						.then(function successCallback(response) {
							if(response.status === 200) {
								if(response.data.ID_RESULT == 0 && vm.busquedaSiniestro != null) {
									vm.busquedaSiniestro.gridOptions.data = response.data.SINIESTROS.SINIESTRO;
									vm.busquedaSiniestro.numDetalles.splice(0, 1);
								}
							}
						},
						function errorCallback(response) {
							if(response.status == 406 || response.status == 401) {
								vm.parent.logout();
							}
						});

						if (vm.isNew == true) {
							//Enviar notificación
							if (vm.notificacionesActivas == true) {
								SiniestroService.notifications(vm.getCodeNotification("5"), response.data)
								.then(function successCallback(response){
									console.log("sendMail OK " + response);
								}, function errorCallback(response){
									msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
									$mdDialog.show(msg);
								});
							}
							
							if (response.data.NU_SINIESTRO != null) {
					            $window.location.href = window.location.origin + window.location.pathname + '#!/siniestros_list?nuSiniestro=' + response.data.NU_SINIESTRO;
							}
						}
					} else if (response.data.ID_RESULT == 9640){
						var confirm = $mdDialog.confirm()
				  		.textContent($translate.instant('MSG_SURE_DATE_OCCURRENCE') + moment(vm.datos.FD_OCURRENCOMPANIA).format('DD-MM-YYYY')+ '?')
				  		.multiple(true)
				  		.ariaLabel('Lucky day')
				  		.ok($translate.instant('ACCEPT'))
				  		.cancel($translate.instant('CANCEL'));
						$mdDialog.show(confirm).then(function() {
							vm.datos.ID_ESTADO_SINIESTRO = 7;
							vm.datos.DS_SINIESTRO += '\n'+$translate.instant('MSG_CLAIM_REJECTED_OPENING');
							vm.guardarSiniestro();
						}, function() {
							$mdDialog.hide();
						});
					
					} else {
						vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
					}
				}
			}, function errorCallback(response){
				vm.appParent.cambiarDatosModal($translate.instant('ERROR_SAVE_CLAIM'));
			});
		}
    	}
    	
    	//Abrir mensaje
    	function abrir(status){
    		$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/accept.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;
    				
    				this.$onInit = function(){
    					if(status == 200){
    						md.msg = $translate.instant('MSG_EDITED_SUCCESS');
    					}
    					else{
    						md.msg = $translate.instant('ERROR_EDITED_CLAIM');
    					}
    				}
    				
    				md.hide = function() {
		    	      $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
		    	      $mdDialog.cancel();
		    	    };

		    	    md.answer = function(answer) {
		    	      $mdDialog.hide(answer);
		    	    };
              
                }]
    		})
    	}
    	
    	//Ver garantías
    	vm.mostrarGarantias=function(ev) {
        	console.log("Mostrando garantías...");
        	$mdDialog.show({
        		templateUrl: BASE_SRC+"detalle/detalle.modals/siniestro.modal.html",
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				
    				md.hide = function() {
		    	      $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
		    	      $mdDialog.cancel();
		    	    };

		    	    md.answer = function(answer) {
		    	      $mdDialog.hide(answer);
		    	    };
              
                }]
    		})
        }
    	//Ver detalle garantía siniestro
		vm.verDetalleGarantia = function (fila, key, index){
			vm.fila = fila;
			vm.key = key;
			vm.index = index;

			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/detalle_garantia_siniestro.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				//targetEvent: ev,
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog){
					var md= this;
					md.cargar = true,
					md.datos = vm.datos;
					md.movimiento = fila;
					md.tipos = [];
					md.tipos.movEcon = vm.tipos.movEcon;
					md.formaPagoList = [];
					
					md.$onInit = function () {
				        TiposService.getTipos({ "ID_CODIGO": constantsTipos.FORMA_PAGO_SINIESTRO })
			            .then(function successCallback(response) {
			                if (response.status == 200) {
			                	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
			                		md.formaPagoList = response.data.TIPOS.TIPO;
			                	}
			                }
			            }, function callBack(response) {
			                if (response.status == 406 || response.status == 401) {
			                    vm.parent.logout();
			                }
			            });
				        
				        TiposService.getTipos({ "ID_CODIGO": constantsTipos.ESTADO_PAGO_SINIESTRO })
			            .then(function successCallback(response) {
			                if (response.status == 200) {
			                	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
			                		md.estadoPagoList = response.data.TIPOS.TIPO;
			                	}
			                }
			            }, function callBack(response) {
			                if (response.status == 406 || response.status == 401) {
			                    vm.parent.logout();
			                }
			            });
					}

					md.descargarArchivo = function (archivo) {

			    		vm.appParent.abrirModalcargar(true);
			    		FicherosService.download(archivo.ID_ARCHIVO)
						.then(function successCallback(response){
							if(response.status == 200){
								if(response.data != null){
									saveAs(new Blob([response.data]), archivo.NO_ARCHIVO);
									msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
									$mdDialog.show(msg);
								}else{
									msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
									$mdDialog.show(msg);
								}
							}
						}, function callBack(response) {
								if(response.status == 500){
									msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
									$mdDialog.show(msg);
								}
						});
					}
					
					md.hide = function() {
						$mdDialog.hide();
					  };
					
					md.cancel = function(){
						$mdDialog.cancel();
					};

					md.answer = function(answer) {
						$mdDialog.hide(answer);
					  };

				}]

			});

		}

    	function rellenarJSON(form){
    		var i = 0;
    		
    		angular.forEach(form, function(value, key){
    			if(key == 'NU_SINIESTRO' || key == 'OPOLIZA' || key == 'ID_ESTADO_SINIESTRO' || key == 'ID_RESPONSABILIDAD' || key == 'FD_APERTURA' || key == 'FD_OCURRENCOMPANIA'){
    				if(value !== undefined && value !== null && value !== ''){
    					if(key == 'OPOLIZA'){
    						form.ID_POLIZA = value.ID_POLIZA;
    					}
    					i++;
    				}	
    			}
    		});
    		if(i < 6){
    			isError = true;
    		}
    		else
    			isError = false;
		}
		
		vm.formatDate = function(date, format){
        	if(date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())){
        		date = new Date(date);
        		var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();
				
        		if(month.toString().length == 1){
        			month = "0" + month;
        		}
        		if(day.toString().length == 1){
        			day = "0" + day;
				}
				
        		if(format == 'DMY') {
					return day + "/" + month + "/" + year;
				} else {
					return year + "-" + month + "-" + day;
				}
        	}
        }
		
		vm.subirDocumentacion = function () {
			var obj = JSON.parse(JSON.stringify(vm.datos));
			obj.FICHEROS = [
                {
                	ARCHIVO: vm.archivo,
					DS_ARCHIVO: (vm.obsArchivo != null && vm.obsArchivo != "") ? vm.descArchivo + " | " + vm.obsArchivo : vm.descArchivo,
                	NO_ARCHIVO: vm.nombreArchivo
                }
			];
			
			SiniestroService.subirDocumentacion(obj)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						vm.listaArchivos = response.data.FICHEROS;
						vm.getDocumentos();
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}
			});
		}
		
		vm.guardarDocumentacionSiniestro = function () {
			
			vm.loadDocumentos = true;
			var obj = JSON.parse(JSON.stringify(vm.datos));
			obj.FICHEROS = vm.datos.FICHEROS;
			
			SiniestroService.subirDocumentacion(obj)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						msg.textContent($translate.instant('MSG_DOCUMENTS_SAVED'));
						$mdDialog.show(msg);
						vm.listaArchivos = response.data.FICHEROS;
						vm.listArchivosPendientes = [];
						vm.datos.FICHEROS = [];
						vm.getDocumentos();

						//Enviar notificación
						if (vm.notificacionesActivas == true) {
							SiniestroService.notifications("SNSTR_DOC_N_" + vm.datos.OPOLIZA.ID_PROGRAMA, response.data)
							.then(function successCallback(response){
								console.log("sendMail OK " + response);
							}, function errorCallback(response){
								msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
								$mdDialog.show(msg);
							});
						}
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}
				vm.loadDocumentos = false;
			});
		}
		
		vm.getDocumentos = function () {
			var idPoliza = "";
			var idSiniestro = vm.datos.ID_SINIESTRO
			if (vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_POLIZA != null) {
				idPoliza = vm.datos.OPOLIZA.ID_POLIZA;
			}
			vm.loadDocumentos = true;
			SiniestroService.downloadClaimDocs(idPoliza, idSiniestro)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.code == 0){
						vm.listaArchivos = response.data.result;
					} else {
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					}
				}
				vm.loadDocumentos = false;
			}, 
			function errorCallback(response){
				vm.loadDocumentos = false;
			});
		}
		
		vm.renderizarIframe = function (blob){	
			if (blob != null) {
                // var options = Object.assign(docx.defaultOptions, {
                //     useMathMLPolyfill: true
                // });
				var options = { inWrapper: true, ignoreWidth: false, ignoreHeight: false }
                var iframe = document.querySelector("#previewIframe");
     
                docx.renderAsync(blob, iframe, null, options);
            }
		} 

		vm.injectCSS = function(){
			var iframe = document.querySelector('iframe');
			const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
			const imgElement = iframeDoc.querySelector('img');

			if(imgElement) {
				imgElement.style.objectFit = 'contain';
				imgElement.style.width = '100%';
				imgElement.style.height = 'auto';
			}
		}

		vm.abrirPreview = function (url, isWord, blob) {

			if(url != null){
				$mdDialog.show({
					templateUrl: BASE_SRC + 'detalle/detalle.modals/preview.modal.html',
					controllerAs: '$ctrl',
					clickOutsideToClose: false,
					onComplete: function(){
						if(isWord){
							vm.renderizarIframe(blob);
						} else {
							vm.injectCSS();
						}
					},

					controller:['$mdDialog', function($mdDialog, $timeout){
						var md = this;
						md.preview = url;
						md.isWord = isWord;

						md.cancel = function() {
							$mdDialog.cancel();
							URL.revokeObjectURL(md.preview);
						};

					}]
				});
			}
		}

		vm.verArchivo = function (archivo, download) {
			var url ="";
			vm.isWord = false;
			if(!download){
				url = archivo;
				vm.abrirPreview(url);
			} else {
				if (archivo != null && archivo.ID_ARCHIVO != null) {
					vm.appParent.abrirModalcargar(true);
					var fileName = archivo.NO_ARCHIVO;
					var extension = fileName.split('.').pop().toLowerCase();
					var mimeType ="";
					if(extension == 'pdf'){
						mimeType = 'application/pdf';
					} else if(extension == 'doc' || extension == 'docx' ){
						// mimeType = 'application/msword';
						mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
					// } else if (extension == 'xls' || extension == 'xlsx'){
					// 	// mimeType = 'application/vnd.ms-excel';
					// 	mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
					// } else if(extension == 'ppt' || extension == 'pptx'){
					// 	// mimeType = 'application/vnd.ms-powerpoint';
					// 	mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
					} else if(extension == 'png' || extension == 'jpg' || extension == 'gif'){
						mimeType = 'image/jpeg';
					} else if(extension == 'txt'){
						mimeType = 'text/plain';
					} else if(extension == 'html'){
						mimeType = 'text/html';
					} else {
						mimeType = null;
					}
					FicherosService.download(archivo.ID_ARCHIVO)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data != null){
								if(mimeType == null){
									msg.textContent($translate.instant('MSG_NOT_VIEWING_DOWNLOAD'));
									$mdDialog.show(msg);
								} else {
									var blob = new Blob([response.data], {type: mimeType});
									
									if(extension.startsWith('doc')){
										vm.isWord = true;
										// url = "https://docs.google.com/gview?url=" +  encodeURIComponent(url) + "&embedded=true";
										// url = "https://view.officeapps.live.com/op/view.aspx?src=" + url;
										// url = 'https://onlinedocumentviewer.com/Viewer/?'+url
										// url = $sce.trustAsResourceUrl(url);
									}
									url = URL.createObjectURL(blob);
									vm.abrirPreview(url, vm.isWord, blob);
								}
							} else {
								msg.textContent($translate.instant('MSG_ERROR_VIEWING_FILE'));
								$mdDialog.show(msg);
							}
						}
					}, function callBack(response) {
							if(response.status == 500){
								msg.textContent($translate.instant('MSG_ERROR_VIEWING_FILE'));
								$mdDialog.show(msg);
							}
					});
				}
			}
		}

		vm.descargarArchivo = function (archivo) {
			if (archivo != null && archivo.ID_ARCHIVO != null) {
				vm.appParent.abrirModalcargar(true);
	    		FicherosService.download(archivo.ID_ARCHIVO)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data != null){
							saveAs(new Blob([response.data]), archivo.NO_ARCHIVO);
							msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
							$mdDialog.show(msg);
						}else{
							msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
							$mdDialog.show(msg);
						}
					}
				}, function callBack(response) {
						if(response.status == 500){
							msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
							$mdDialog.show(msg);
						}
				});
	    		/*
				var bytes = new Uint8Array(archivo.ARCHIVO); // pass your byte response to this constructor
				var type = "pdf";
				var archivoSplit = archivo.NO_ARCHIVO.split('.');
				if (archivoSplit != null && archivoSplit[archivoSplit.length - 1] != null) {
					type = archivoSplit[archivoSplit.length - 1];
				}
				var blob=new Blob([bytes], {type: "application/" + type});// change resultByte to bytes
				var link=document.createElement('a');
				link.href=window.URL.createObjectURL(blob);
				link.download=archivo.NO_ARCHIVO;
				link.click();
				saveAs(new Blob([archivo.ARCHIVO]), archivo.NO_ARCHIVO);
				*/
			}
		}
		
		vm.eliminarArchivo = function (archivo) {
			var confirm = $mdDialog.confirm()
			  .textContent($translate.instant('MSG_SURE_DELETING_DOCUMENT') + archivo.NO_ARCHIVO + "?")
			  .multiple(true)
			  .ariaLabel('Lucky day')
			  .ok($translate.instant('ACCEPT'))
			  .cancel($translate.instant('CANCEL'));
			$mdDialog.show(confirm).then(function() {
				vm.appParent.abrirModalcargar(true);
				FicherosService.removeDocumentation(archivo.ID_ARCHIVO)
				.then(function successCallback(response){
					if (response.data.ID_RESULT == 0) {
						msg.textContent($translate.instant('MSG_DOCUMENT_DELETED'));
						$mdDialog.show(msg);
						vm.getDocumentos();
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}, function errorCallback(response){
					msg.textContent($translate.instant('ERROR_DELETING_DOCUMENT'));
					$mdDialog.show(msg);
				});
			}, function() {
				$mdDialog.hide(confirm);
			});
		}
		
		vm.getDocumentoCallCenter = function (preview) {
			var documento = "Datos_llamada_entrante_Call_Center";
			if (vm.datos != null && vm.datos.OPOLIZA != null){
				if(vm.datos.OPOLIZA.ID_PROGRAMA == 17) {
					documento = "Documento_de_apertura";
				} else if(vm.datos.OPOLIZA.ID_PROGRAMA == 19){
					documento = "Chamada_Inicial_Call_Center_KOVR";
				} else if(vm.datos.OPOLIZA.ID_PROGRAMA == 10){
					documento = "Datos_llamada_entrante_Call_Center"; // cambiar para Alemania cuando lo tengamos
				}
			}
			preview == true ? vm.verArchivo('src/'+vm.ruta+documento+'.pdf', false) : vm.getPlantillas(documento+'.docx');
		}
		
		vm.getPlantillas = function (plantilla) {
			var link = document.createElement('a');
		    link.setAttribute('download', plantilla);
			link.href = BASE_SRC + vm.ruta + plantilla;
		    document.body.appendChild(link);
		    link.click();
		    link.remove();
		}
		
		vm.getPoliza = function () {
			if (vm.nuPoliza != null && vm.nuPoliza != "") {
				vm.cargandoPoliza = true;
				SiniestroService.getPoliza(vm.nuPoliza)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							var poliza = null;
							
							// if (response.data.POLIZAS != null && response.data.POLIZAS.POLIZA != null && response.data.POLIZAS.POLIZA[0] != null) {
							if (response.data){
								// poliza = response.data.POLIZAS.POLIZA[0];
								poliza = response.data;
								vm.polizaCopy = JSON.parse(JSON.stringify(poliza));
	                            var productoPoliza = poliza.ID_PRODUCTO;
	                            
	                            //Si el producto no está incluido en la lista de apertura de siniestros no se puede crear un siniestro
								if(!vm.productosSiniestros.includes(productoPoliza)){
	                            // if (productoPoliza != 3 && productoPoliza != 4 && productoPoliza != 5 && productoPoliza != 6 && productoPoliza != 28 && productoPoliza != 29 && productoPoliza != 19) {
									msg.textContent($translate.instant('MSG_CLAIMS_NOT_CREATED_PRODUCT'));
									$mdDialog.show(msg);
									vm.cargandoPoliza = false;
									return null;
	                            } 
	                            //Si la póliza no tiene estado 1, no se pueden crear sineistros
	                            else if (poliza.ID_SITUAPOLIZA != 1) {
	                            	msg.textContent($translate.instant('MSG_CLAIMS_POLICY STATUS'));
									$mdDialog.show(msg);
									vm.cargandoPoliza = false;
									return null;
	                            } else {
									if (vm.datos == null) {
										vm.datos = {};
									}
									vm.datos.OPOLIZA = poliza;

									if(vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PROGRAMA != null && (vm.datos.OPOLIZA.ID_PROGRAMA == 10 || vm.datos.OPOLIZA.ID_PROGRAMA == 17 || vm.datos.OPOLIZA.ID_PROGRAMA == 19)){
										vm.ruta += vm.datos.OPOLIZA.ID_PROGRAMA + "/";
									}

									vm.getGarantias();

									SiniestroService.getSiniestrosByFilter({OPOLIZA: { ID_POLIZA: vm.datos.OPOLIZA.ID_POLIZA }})
									.then(function successCallback(response){

										if(response.data.ID_RESULT == 0 && response.data.SINIESTROS != null && response.data.SINIESTROS.SINIESTRO != null){
											vm.gridSiniestrosPoliza.data = response.data.SINIESTROS.SINIESTRO;
										}

								    });
									
									//Si es de particulares, rellenar el formulario de call center
									if (vm.datos.OPOLIZA && vm.datos.OPOLIZA.ID_PRODUCTO == 28) {
										vm.siniestroPecuniarias.DATOS_CONTACTO = {};
										vm.datos.ID_ESTADO_SINIESTRO = 1;
										vm.datos.ID_SUBESTADO_SINIESTRO = 0;
										// vm.datos.ID_ESTADO_SINIESTRO = 3;
										vm.formCallCenter = {};
										vm.formCallCenter.pais = "España";
										vm.datos.FD_ACEPTACION = moment(new Date()).format('YYYY-MM-DD');

										if (vm.datos.OPOLIZA.LST_ASEGURADOS && vm.datos.OPOLIZA.LST_ASEGURADOS.length > 0) {
											var tomador = vm.datos.OPOLIZA.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3);
											if (tomador != null) {
												vm.siniestroPecuniarias.DATOS_CONTACTO.NOMBRE_CONTACTO = tomador.NO_NOMBRE_COMPLETO;
												vm.siniestroPecuniarias.DATOS_CONTACTO.MAIL_CONTACTO = tomador.NO_EMAIL;
												vm.siniestroPecuniarias.DATOS_CONTACTO.TELEFONO = tomador.NU_TELEFONO1;
												if (tomador.LIST_DOMICILIOS && tomador.LIST_DOMICILIOS.length > 0) {
													vm.formCallCenter.domicilio = tomador.LIST_DOMICILIOS[0].NO_DIRECCION;
													vm.formCallCenter.localidad = tomador.LIST_DOMICILIOS[0].NO_LOCALIDAD;
												}
											}
										}
										if (vm.datos.OPOLIZA.JS_ENVIADO) {
											var jsEnviado = JSON.parse(vm.datos.OPOLIZA.JS_ENVIADO);
											if(jsEnviado.CIBERPARTICULARES != undefined){
												vm.limiteIndemnizacion =jsEnviado.CIBERPARTICULARES.AMMOUNT_OPTION;
												if(vm.limiteIndemnizacion != null) {
													vm.limiteIndemnizacion = vm.amountCP.find(x => x.CO_TIPO == vm.limiteIndemnizacion).DS_TIPOS;    
												}
											}	
										}
										vm.getImporteReclamadoCliente();
									}
	                            }
	                            
	        					//Saber si hay que enviar notificaciones con este programa
	        					vm.enviarNotificaciones();
							} else {
								msg.textContent($translate.instant('POLICY_NOT_EXIST'));
								$mdDialog.show(msg);
							}
							
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
					vm.cargandoPoliza = false;
				});
			} else {
				msg.textContent($translate.instant('ADD_POLICY_NUMBER'));
				$mdDialog.show(msg);
			}
		}
		
		$(document).on('change', '#file_sin', function(e) {
			if(e) {
				$scope.$apply();
				if(document.getElementById('file_sin').files[0] != null){
					var f = document.getElementById('file_sin').files[0];

//					vm.nombreArchivo = f.name;
					var fileName = f.name;
					fileName = fileName.split(".");
					if (fileName.length > 1) {
//						fileName[0] = vm.appParent.changeSpecialCharacters(fileName[0]);
						for (var i = 0; i < fileName.length; i++) {
						    fileName[i] = vm.appParent.changeSpecialCharacters(fileName[i]);
						}
					}
					fileName = fileName.join('.');
					vm.nombreArchivo = fileName;
					vm.archivo = null;
					
					var reader = new FileReader();
				    reader.onload = function() {

				    	if (vm.obsArchivo != null && vm.obsArchivo != "") {
					    	var base64 = this.result.split("base64,")[1];
							var binary_string = window.atob(base64);
						    var len = binary_string.length;
						    var bytes = [];
						    for (var i = 0; i < len; i++) {
						        bytes.push(binary_string.charCodeAt(i));
						    }
							var archivo = bytes;
							
							if (vm.datos == null) {
								vm.datos = {};
							}
							if (vm.datos.FICHEROS == null) {
								vm.datos.FICHEROS = [];
							}
					    	
							vm.datos.FICHEROS.push({
								ARCHIVO: bytes,
								DS_ARCHIVO: (vm.obsArchivo != null && vm.obsArchivo != "") ? vm.descArchivo + " | " + vm.obsArchivo : vm.descArchivo,
								NO_ARCHIVO: vm.nombreArchivo
							});

							if (vm.listArchivosPendientes == null) {
								vm.listArchivosPendientes = [];
							}
					    	
							vm.listArchivosPendientes.push({
								DS_ARCHIVO: (vm.obsArchivo != null && vm.obsArchivo != "") ? vm.descArchivo + " | " + vm.obsArchivo : vm.descArchivo,
								NO_ARCHIVO: vm.nombreArchivo
							});

							vm.descArchivo = null;
							vm.obsArchivo = null;
							vm.nombreArchivo = null;
							
					        $scope.$apply();
				    	}

				    }

					reader.readAsDataURL(f);
				}
			}
					
		});
		
		vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 0;
            
            var totalItems = vm.gridDetalleSiniestro.totalItems;
            if (totalItems > vm.gridDetalleSiniestro.paginationPageSize) {
            	totalItems = vm.gridDetalleSiniestro.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight) + "px"
            };
        }
		
		vm.changeCobertura = function (getServiciosCiberparticulares, callCenter) {
			var garantia = null;
			vm.seccion = null;
			vm.tipos.garantiasHijoFilter = [];
			
			if (vm.coberturaNoMultiple != null) {
				vm.coberturas = [];
				vm.coberturas.push(vm.coberturaNoMultiple);
			}

			//Comprobar si se ha seleccionado CIBERDELINCUENCIA, y si es así, añadir extensión
			if (vm.mostrarSeccionesExtension == true && vm.coberturas != null) {
				var ciberdelincuencia = vm.tipos.garantias.find(x => x.ID_GARANTIA == 55);
				var extension = vm.tipos.garantias.find(x => x.ID_GARANTIA == 57);
				if (ciberdelincuencia != null && vm.coberturas.includes(ciberdelincuencia.NO_GARANTIA) && !vm.coberturas.includes(extension.NO_GARANTIA)) {
					vm.coberturas.push(extension.NO_GARANTIA);
				} else if (!vm.coberturas.includes(ciberdelincuencia.NO_GARANTIA) && vm.coberturas.includes(extension.NO_GARANTIA)) {
					var index = vm.coberturas.findIndex(x => x == extension.NO_GARANTIA);
					if (index > -1) {
						vm.coberturas.splice(index, 1);
					}
				}
			}
			
			if (vm.coberturas != null && vm.tipos.garantias != null) {
				for (var i = 0; i < vm.coberturas.length; i++) {
					garantia = vm.tipos.garantias.find(x => x.NO_GARANTIA == vm.coberturas[i]);
					
					if (garantia != null && garantia.ID_GARANTIA != null) {
						for (var j = 0; j < vm.tipos.garantiasHijo.length; j++) {
							var garantiaHijo = vm.tipos.garantiasHijo[j];
							if (garantiaHijo.ID_GARANTIA_PADRE == garantia.ID_GARANTIA) {
								vm.tipos.garantiasHijoFilter.push(garantiaHijo);
							}
						}
					}
				}
			}
			
			if (getServiciosCiberparticulares == true) {
				vm.getServiciosCiberparticulares(garantia.ID_GARANTIA_PRODUCTO, callCenter);
			}
		}
		
		vm.getServiciosCiberparticulares = function (idGarantiaProducto, callCenter) {
			if (idGarantiaProducto != null) {
				if (callCenter == true) {
					vm.tipos.serviciosCallCenter = [];
					vm.tipos.indemnizacionesCallCenter = [];
					vm.formCallCenter.indemnizacion = null;
					vm.formCallCenter.servicio = null;
				} else {
					vm.tipos.servicios = [];
					vm.tipos.indemnizaciones = [];
					// vm.datos.CO_TIPO_ACCIDENTE = null;
					// vm.datos.CO_TIPO_INDEMNIZACION = null;
				}
				TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_SERVICIOS, "CO_TIPO": idGarantiaProducto.toString() })
	    		.then(function successCallback(response){
	    			if(response.status == 200 && response.data.TIPOS && response.data.TIPOS.TIPO){
	    				if (callCenter == true) {
		    				vm.tipos.serviciosCallCenter = response.data.TIPOS.TIPO;
	    				} else {
		    				vm.tipos.servicios = response.data.TIPOS.TIPO;
							if (vm.tipos.servicios != null && vm.tipos.servicios.length > 0) {
                                for (var i = 0; i < serviciosSeleccionados.length; i++) {
                                    var noServicio = serviciosSeleccionados[i];
                                    var servicio = vm.tipos.servicios.find(x => x.DS_TIPOS == noServicio);
                                    vm.servicios.push(servicio);
                                }
                            }
                        }
	    			}
	    		});

				var serviciosSeleccionados = [];
                if (vm.datos.CO_TIPO_ACCIDENTE != null) {
                    var coTipoAccidenteSplit = vm.datos.CO_TIPO_ACCIDENTE.split(" | ");
                    if (coTipoAccidenteSplit != null && coTipoAccidenteSplit.length > 0) {
                        for (var i = 0; i < coTipoAccidenteSplit.length; i++) {
                            serviciosSeleccionados.push(coTipoAccidenteSplit[i]);
                        }
                    }
                }

				TiposService.getTipos({"ID_CODIGO": constantsTipos.INDEMNIZACIONES, "CO_TIPO": idGarantiaProducto.toString() })
	    		.then(function successCallback(response){
	    			if(response.status == 200 && response.data.TIPOS && response.data.TIPOS.TIPO){
	    				if (callCenter == true) {
		    				vm.tipos.indemnizacionesCallCenter = response.data.TIPOS.TIPO;
	    				} else {
		    				vm.tipos.indemnizaciones = response.data.TIPOS.TIPO;
	    				}
	    			}
	    		});
			}
		}
		
		vm.getCodeNotification = function (val) {
			var code = "";

		    switch(val){
		        case "0":
		            code = "SNSTR_RESERVA_N";
		            break;
		        case "1":
		            code = "SNSTR_FACTURA_N";
		            break;
		        case "2":
		            code = "SNSTR_FRANQUICIA_N";
		            break;
		        case "3":
		            code = "SNSTR_INDEMN_N";
		            break;
		        case "4":
		            code = "SNSTR_PRESUP_N";
		            break;
		        case "5":
		            code = "SNSTR_ALTA_N";
		            break;
		        default:
		            code = "";
		            break;
		    }
		    
		    var programa = "";
		    if (vm.datos.OPOLIZA.ID_PROGRAMA != null) {
		    	programa = "_" + vm.datos.OPOLIZA.ID_PROGRAMA;
		    }

		    return code + programa;
		}
		
		vm.aprobarMovimiento = function (row) {
			
			var obj = JSON.parse(JSON.stringify(row));
			if (obj != null) {
				obj.oMovEconGaran.FD_APROBACION = vm.formatDate(new Date());
			}

			vm.appParent.abrirModalcargar(true);
			SiniestroService.updateMov(obj)
			.then(function successCallback(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0) {
						msg.textContent($translate.instant('MSG_APPROVED_MOVEMENT'));
						$mdDialog.show(msg);
						row = JSON.parse(JSON.stringify(obj));
						
						//Volver a recoger movimientos de siniestro
						SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": vm.datos.ID_SINIESTRO})
						.then(function successCallback(response){
							if(response.status == 200){
								vm.siniestros = response.data.SINIESTROS.SINIESTRO;	
							}
							// vm.gridDetalleSiniestro.data = vm.siniestros;
							vm.gridDetalleSiniestro.data = vm.siniestros[0].LST_MOVS_ECONOMICOS;
							vm.load = false;
						});
						
						//Enviar notificación
						var codigoNotif = "SNSTR_APROBAR_N_" + vm.datos.OPOLIZA.ID_PROGRAMA;

						//Si es presupuesto, notificar con otro código
						if (response.data.CO_TIPOMOV == "4") {
                            codigoNotif = "SNSTR_APROBAR_PRESU_" + vm.datos.OPOLIZA.ID_PROGRAMA;
						}


						var objSiniestroNotif = JSON.parse(JSON.stringify(vm.datos));
						objSiniestroNotif.LST_MOVS_ECONOMICOS = [response.data];
						
						if (vm.notificacionesActivas == true) {
							SiniestroService.notifications(codigoNotif, objSiniestroNotif)
							.then(function successCallback(response){
								console.log("sendMail OK " + response);
							}, function errorCallback(response){
								msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
								$mdDialog.show(msg);
							});
						}

						//Si tiene proveedor, notificar ese proveedor
						if (response.data.DS_PERCEPTOR != null) {
							response.data.DS_PERCEPTOR = response.data.DS_PERCEPTOR.replaceAll(" ", "_");
							response.data.DS_PERCEPTOR = response.data.DS_PERCEPTOR.replaceAll("Ñ", "N");
							var codigoProveedorNotif = "SNSTR_" + response.data.DS_PERCEPTOR+ "_" + vm.datos.OPOLIZA.ID_PROGRAMA
							objSiniestroNotif.FICHEROS = [];
							
							if (vm.notificacionesActivas == true) {
								SiniestroService.notifications(codigoProveedorNotif, objSiniestroNotif)
								.then(function successCallback(response){
									console.log("sendMail OK " + response);
								}, function errorCallback(response){
									msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
									$mdDialog.show(msg);
								});
							}
						}
						
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}
			}, function errorCallback(response){
				vm.appParent.cambiarDatosModal($translate.instant('MSG_FAILED_APPROVE_MOVEMENT'));
			});
		}
		
		vm.scopeApply = function () {
			if (vm.gridApi != null && vm.gridApi.core != null) {
				vm.gridApi.core.refresh();
			}
		}
		
		vm.getDsTipoMov = function (coTipoMov) {
			var dsTipoMov = "";

			if (vm.tipos.movEcon != null && vm.tipos.movEcon.length > 0) {
				var objMov = vm.tipos.movEcon.find(x => x.CO_TIPO == coTipoMov);

				if (objMov != null) {
					dsTipoMov = objMov.DS_TIPOS;
				}
			}

			return dsTipoMov;
		}
		
		vm.getCoTipoSiniestro = function () {
			var coTipo = "";
			
			if (vm.datos.CO_TIPO_SINIESTRO != null) {
                coTipo += vm.datos.CO_TIPO_SINIESTRO;
			}
			
			// if (vm.isNew == true) {
				if (vm.coberturas != null && vm.coberturas.length > 0) {
					for (var i = 0; i < vm.coberturas.length; i++) {
						if(!vm.isNew){
							coTipo += " | ";
						}
						coTipo += vm.coberturas[i];
						if ((i+1) < vm.coberturas.length) {
							coTipo += " | ";
						}
					}
				}
				
				if (vm.seccion != null && vm.seccion.length > 0) {
					coTipo += " | ";
					for (var i = 0; i < vm.seccion.length; i++) {
						coTipo += vm.seccion[i];
						if ((i+1) < vm.seccion.length) {
							coTipo += " | ";
						}
					}
				}		
			// }
			
			return coTipo;
		}
		
		vm.openPoliza = function () {
			if (vm.detallesPoliza == null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_POLIZA != null) {
				vm.cargarPoliza = true;
				PolizaService.getDetail(vm.datos.OPOLIZA.ID_POLIZA)
                .then(function successCallback(response) {
                	if (response.data != null && response.data.ID_POLIZA != null) {
                        vm.detallesPoliza = response.data;
                	} else {
                		vm.tabSiniestro = 1;
                		msg.textContent($translate.instant('ERROR_RETRIEVING_POLICY'));
						$mdDialog.show(msg);
                	}
    				vm.cargarPoliza = false;
                }, function errorCallBack(response) {
    				vm.cargarPoliza = false;
            		vm.tabSiniestro = 1;
            		msg.textContent($translate.instant('ERROR_RETRIEVING_POLICY'));
					$mdDialog.show(msg);
                });
			}
		}
		
		vm.abrirModalCoberturas = function () {
			$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/coberturas_siniestro.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;
    				
    				this.$onInit = function(){
    					md.coberturasModal = JSON.parse(JSON.stringify(vm.coberturasModal));
    				}
    				
    				md.hide = function() {
		    	      $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
		    	      $mdDialog.cancel();
		    	    };

		    	    md.answer = function(answer) {
		    	      $mdDialog.hide(answer);
		    	    };
              
                }]
    		})
		}
		
		vm.formatDecimal = function (number) {
			if (number != null && number != 0 && number != "") {
				//Si tiene decimales, redondear a 2
				if (number % 1 != 0) {
			         number = number.toFixed(2)
			    }
			}
			
			return number;
		}
		
		vm.crearCoberturasModal = function (garantiasSeleccionadas) {
			if (vm.tipos.garantias != null && vm.tipos.garantias.length > 0) {
				for (var i = 0; i < vm.tipos.garantias.length; i++) {
					var garantiapadre = vm.tipos.garantias[i];
					var garantiasHijo = vm.tipos.garantiasHijo.filter(x => x.ID_GARANTIA_PADRE == garantiapadre.ID_GARANTIA);
					
					if (garantiasHijo != null && garantiasHijo.length > 0) {
						garantiapadre.GARANTIAS_HIJO = garantiasHijo;
						for (var j = 0; j < garantiapadre.GARANTIAS_HIJO.length; j++) {
							if (garantiasSeleccionadas.includes(garantiapadre.GARANTIAS_HIJO[j].ID_GARANTIA) || garantiasSeleccionadas.includes(garantiapadre.GARANTIAS_HIJO[j].NO_GARANTIA)) {
								garantiapadre.GARANTIAS_HIJO[j].ACTIVO = true;
								vm.garantiasActivas.push(garantiapadre.GARANTIAS_HIJO[j].ID_GARANTIA);
							}
						}
					} else {
						if (garantiasSeleccionadas.includes(garantiapadre.ID_GARANTIA) || garantiasSeleccionadas.includes(garantiapadre.NO_GARANTIA)) {
							garantiapadre.ACTIVO = true;
							vm.garantiasActivas.push(garantiapadre.ID_GARANTIA);
						} else {
							garantiapadre.ACTIVO = false;
						}
					}
					
					vm.coberturasModal.push(garantiapadre);
				}
			}
		}
		
		vm.getGarantiasSeleccionadas = function (movEconomicosList) {
			var garantiasSeleccionadas = [];
			if (movEconomicosList != null && movEconomicosList.length > 0) {
				for (var i = 0; i < movEconomicosList.length; i++) {
					var movimiento = movEconomicosList[i];
					if (movimiento.oMovEconGaran != null && movimiento.oMovEconGaran.ID_GARANTIA != null && !garantiasSeleccionadas.includes(movimiento.oMovEconGaran.ID_GARANTIA)) {
						garantiasSeleccionadas.push(movimiento.oMovEconGaran.ID_GARANTIA);
					}
				}
			}
			if (vm.datos.CO_TIPO_SINIESTRO != null) {
				var coTipoSiniestroSplit = vm.datos.CO_TIPO_SINIESTRO.split(" | ");
				if (coTipoSiniestroSplit != null && coTipoSiniestroSplit.length > 0) {
					for (var i = 0; i < coTipoSiniestroSplit.length; i++) {
						garantiasSeleccionadas.push(coTipoSiniestroSplit[i]);
					}
				}
			}
			return garantiasSeleccionadas;
		}
    	
    	vm.cargarHistoricoSiniestro = function () {
	    	var json = {
	    		"ID_SINIESTRO": vm.datos.ID_SINIESTRO,
	    		"IS_HISTORICO": true
	    	};

			vm.appParent.abrirModalcargar(true);
    		SiniestroService.getSiniestros(json)
			.then(function successCallback(response){
				if(response.data.ID_RESULT == 0 && response.data.SINIESTROS != null && response.data.SINIESTROS.SINIESTRO.length > 0){
                 	vm.gridOptionsHistorico.data = response.data.SINIESTROS.SINIESTRO;
				} else {
					msg.textContent($translate.instant('NOT_FOUND_RESULTS'));
					$mdDialog.show(msg);
				}
				$mdDialog.cancel();
			},function errorCallback(response){
				msg.textContent($translate.instant('MSG_CONTACT_US'));
				$mdDialog.show(msg);
			});
    	}
    	
    	vm.gridOptionsHistorico = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 15,
			columnDefs: [
				{field: 'NU_SINIESTRO', displayName: $translate.instant('CLAIM')},
				{field: 'OPOLIZA.NU_POLIZA', displayName: $translate.instant('POLICY')},
				{field: 'OPOLIZA.LST_ASEGURADOS[0].NO_NOMBRE_COMPLETO', displayName: $translate.instant('CLIENT')},
				{field: 'DS_ESTADO_SINIESTRO', displayName: $translate.instant('STATE')},
				{field: 'IM_INDEMNIZACION', displayName: $translate.instant('COMPENSATION'), cellFilter: 'currency:"€" : 2'},
				{field: 'IM_PAGO', displayName: $translate.instant('PAYMENT'), cellFilter: 'currency:"€" : 2'},
				{field: 'IM_RESERVA', displayName: $translate.instant('RESERVATION'), cellFilter: 'currency:"€" : 2'},
				{field: 'FT_USU_ALTA', displayName: $translate.instant('DATE_DISCHARGE'), cellFilter: 'date:\'dd/MM/yyyy\''},
				{field: 'FD_OCURRENCOMPANIA', displayName: $translate.instant('DATE_INCIDENCE'),  cellFilter: 'date:\'dd/MM/yyyy\'',},
				{field: 'FD_APERTURA', displayName: $translate.instant('DATE_OPENING'),  cellFilter: 'date:\'dd/MM/yyyy\'',},
				{field: 'FD_TERMINACION', displayName: $translate.instant('DATE_CLOSING'),  cellFilter: 'date:\'dd/MM/yyyy\'',}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiHist = gridApi;
				vm.busqueda.translateHeaders(vm.gridOptionsHistorico);
			}
    	}

		vm.getListIdGarantias = function () {
			var lstIdGarantia = [];
			var listSelectsGarantia = [{ list: "garantias", model: "coberturas" },{ list: "garantiasHijoFilter", model: "seccion" }]

			for (var i = 0; i < listSelectsGarantia.length; i++) {
				var obj = listSelectsGarantia[i];
				if (vm[obj.model] != null && vm[obj.model].length > 0 && vm.tipos[obj.list].length > 0) {
					for (var j = 0; j < vm[obj.model].length; j++) {
						var garantia = vm.tipos[obj.list].find(x => x.NO_GARANTIA == vm[obj.model][j]);
						if (garantia != null) {
							lstIdGarantia.push(garantia.ID_GARANTIA);
						}
					}
				}
			}
			
			return lstIdGarantia;
		}
		
		vm.nuevoMovimiento = function () {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/nuevo_movimiento_siniestro.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				//targetEvent: ev,
				fullscreen: false,
				controller: ['$mdDialog', '$scope', 'CommonUtils', function ($mdDialog, $scope, CommonUtils){
					var md= this;
					md.appParent = vm.appParent;
					md.cargar = true;
					md.datos = vm.datos;
					md.tipos = {};
					md.tipos.garantias = vm.tipos.garantias;
					md.tipos.garantiasHijoFilter = [];
					md.tipos.garantiasHijo = vm.tipos.garantiasHijo;
					md.tipos.incidentes = vm.tipos.incidentes;
					md.tipos.tipoMovimiento = vm.tipos.tipoMovimiento;
					md.tipos.movEcon = vm.tipos.movEcon;
    				md.tipos.servicios = [];
    				md.tipos.indemnizaciones = [];
					md.tab = 1;
					md.movimiento = {};
					md.imPago = md.datos.IM_PAGO;
                    md.imReserva = md.datos.IM_RESERVA;
                    md.imFranquicia = md.datos.IM_FRANQUICIA;
					md.imIndemnizacion = md.datos.IM_INDEMNIZACION;
                    md.importe = 0;
                    md.nombreArchivoMov = null;
					md.archivo = null;
					md.datos.FICHEROS = [];
					md.tipoMovimiento = 1;
					md.cargarMovimento = false;
					md.imIrpf = 0;
					md.imIva = 0;
					// md.imTotal = 0;
					md.imBase = 0;
					md.imPagoCobertura = 0;
                    md.imReservaCobertura = 0;
                    md.imIndemnizacionCobertura = 0;
                    md.toggleIndemnizacion = 'I';
					if(vm.limiteIndemnizacion != undefined){
						md.limiteIndemnizacion = parseInt(vm.limiteIndemnizacion.replace(/[^\d]/g, '', 10));
					}
					
					md.$onInit = function () {
						md.listaFicherosMovimiento = [];
						TiposService.getTipos({"CO_TIPO": "PROVEEDORES_SIN_" + vm.datos.OPOLIZA.ID_PROGRAMA})
			    		.then(function successCallback(response){
			    			if(response.status == 200){
			    				var proveedores = response.data.TIPOS.TIPO;
								md.tipos.proveedores = [];
								
			    				if (proveedores.length > 0) {
				    				proveedores = proveedores[0].DS_TIPOS.split(",");
									if (proveedores.length > 0) {
										for (var i = 0; i < proveedores.length; i++) {
											var proveedor = proveedores[i].split(":");
											var documento = proveedor[0];
											var noProveedor = proveedor[1];
											var objProveedor = { NU_CIF: documento, NO_PROVEEDOR: noProveedor }
											md.tipos.proveedores.push(objProveedor);
										}
									}
								}
			    			}
			    		});

						if (md.datos.OPOLIZA.CO_IBAN != null) {
							var cuentaBancaria = md.datos.OPOLIZA.CO_IBAN;
							md.cuentaBancariaDisabled = true;
							md.nuCuenta = Array(cuentaBancaria.length-4).join("*") + cuentaBancaria.substr(cuentaBancaria.length - 4, cuentaBancaria.length);
						}
						
						if (md.datos.ID_COMP_RAMO_PROD == 28) {
			                md.coTipoMov = "4";
							//Recuperar cobertura seleccionada
							if (vm.garantiasActivas && vm.garantiasActivas.length > 0 && md.tipos.garantias && md.tipos.garantias.length > 0) {
								var cobertura = md.tipos.garantias.find(x => x.ID_GARANTIA == vm.garantiasActivas[0]);
								if (cobertura != null) {
									md.coberturaAfectada = cobertura.NO_GARANTIA;
									md.getImportesCobertura();
									if (cobertura.ID_GARANTIA_PRODUCTO != null) {
										TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_SERVICIOS, "CO_TIPO": cobertura.ID_GARANTIA_PRODUCTO.toString() })
										.then(function successCallback(response){
											if(response.status == 200 && response.data.TIPOS && response.data.TIPOS.TIPO){
												md.tipos.servicios = response.data.TIPOS.TIPO;
											}
										});
										TiposService.getTipos({"ID_CODIGO": constantsTipos.INDEMNIZACIONES, "CO_TIPO": cobertura.ID_GARANTIA_PRODUCTO.toString() })
										.then(function successCallback(response){
											if(response.status == 200 && response.data.TIPOS && response.data.TIPOS.TIPO){
												md.tipos.indemnizaciones = response.data.TIPOS.TIPO;
											}
										});
									}
								}
							}
						}

			    		md.maxImportePago = md.datos.IM_RESERVA;
					}
					
					md.mostrarIncidente = function () {
			    	     var listProductosAceptados = [3, 4, 5, 6, 25, 29, 19, 32];
			    	     if (md.datos != null && md.datos.OPOLIZA != null && md.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(md.datos.OPOLIZA.ID_PRODUCTO)) {
			    		     return true;
			    	     } else return false
					}
					
					md.mostrarSeccion = function () {
			    	     var listProductosAceptados = [3, 4, 5, 6, 25, 29, 19, 32];
			    	     if (md.datos != null && md.datos.OPOLIZA != null && md.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(md.datos.OPOLIZA.ID_PRODUCTO)) {
			    		     return true;
			    	     } else return false
					}
					
					md.changeCobertura = function () {
						var garantia = null;
						var idGarantia = [];
						md.seccion = null;
						if (md.coberturaAfectada != null && md.tipos.garantias != null) {
							garantia = md.tipos.garantias.find(x => x.NO_GARANTIA == md.coberturaAfectada);
						}
						if (garantia != null && garantia.ID_GARANTIA != null) {
							idGarantia.push(garantia.ID_GARANTIA);
							
							//Comprobar que la garantía es de ciberdelincuencia, si es así, añadimos garantía de extensión
							if (vm.mostrarSeccionesExtension == true && garantia.ID_GARANTIA == 55) {
								idGarantia.push(57);
							}
							
							md.tipos.garantiasHijoFilter = [];
							for (var i = 0; i < md.tipos.garantiasHijo.length; i++) {
								var garantiaHijo = md.tipos.garantiasHijo[i];
								if (idGarantia.includes(garantiaHijo.ID_GARANTIA_PADRE)) {
									md.tipos.garantiasHijoFilter.push(garantiaHijo);
								}
							}
						}
						
						md.getImportesCobertura();
					}
					
					md.getImportesCobertura = function () {
						md.maxImportePago = 0;
						md.imPagoCobertura = 0;
	                    md.imReservaCobertura = 0;
	                    md.imIndemnizacionCobertura = 0;
						md.isCuentaConfirmada = false;
	                    var listMovimientos = vm.gridDetalleSiniestro.data;
	                    
	                    if (listMovimientos != null && listMovimientos.length > 0) {
	                    	for (var i = 0; i < listMovimientos.length; i++) {
								if (listMovimientos[i].oMovEconGaran != null && (listMovimientos[i].oMovEconGaran.ID_GARANTIA_PADRE == md.getIdCobertura(md.coberturaAfectada) || listMovimientos[i].oMovEconGaran.ID_GARANTIA == md.getIdCobertura(md.coberturaAfectada) || (md.getIdCobertura(md.coberturaAfectada) == 55 && listMovimientos[i].oMovEconGaran.ID_GARANTIA_PADRE == 57))) {
									if (listMovimientos[i].CO_TIPOMOV == 1) {
										md.imPagoCobertura += listMovimientos[i].IM_BASE;
									} else if (listMovimientos[i].CO_TIPOMOV == 3) {
										md.imIndemnizacionCobertura += listMovimientos[i].IM_BASE;
									} else if (listMovimientos[i].CO_TIPOMOV == 0) {
										md.imReservaCobertura += listMovimientos[i].IM_BASE;
									}
								}
							}
	                    }
	                    
	                    md.imPagoCobertura = parseFloat(md.imPagoCobertura.toFixed(2));
	                    md.imReservaCobertura = parseFloat(md.imReservaCobertura.toFixed(2));
	                    md.imIndemnizacionCobertura = parseFloat(md.imIndemnizacionCobertura.toFixed(2));
	                    md.maxImportePago = md.imReservaCobertura;
	                    md.maxImportePago = parseFloat(md.maxImportePago.toFixed(2));
					}
					
					md.cambiarImporteMovimiento = function (tipo) {

						if (tipo == "suma") {
							md.importe++;
						} else {
							md.importe--;
						}

						if (md.coTipoMov == 1) {
							md.imPago = md.datos.IM_PAGO + md.importe;
						} else if (md.coTipoMov == 0) {
							md.imReserva = md.datos.IM_RESERVA + md.importe;
						} else if (md.coTipoMov == 2) {
							md.imFranquicia = md.datos.IM_FRANQUICIA + md.importe;
						}
					}
					
					md.changeTab = function (tab) {
						md.tab = tab;
						md.importe = 0;
						md.imPago = md.datos.IM_PAGO;
	                    md.imReserva = md.datos.IM_RESERVA;
	                    md.imFranquicia = md.datos.IM_FRANQUICIA;
	                    md.nombreArchivoMov = null;
						md.archivo = null;
						md.datos.FICHEROS = [];
					}
					
					md.getIdSeccion = function (noSeccion) {
						var idGarantia = "";
						if (md.tipos.garantiasHijo != null && md.tipos.garantiasHijo.length > 0) {
							var garantia = md.tipos.garantiasHijo.find(x => x.NO_GARANTIA == noSeccion);
							if (garantia != null) {
								idGarantia = garantia.ID_GARANTIA;
							}
						}
						return idGarantia;
					}
					
					md.getIdCobertura = function (noCobertura) {
						var idGarantia = "";
						if (md.tipos.garantias != null && md.tipos.garantias.length > 0) {
							var garantia = md.tipos.garantias.find(x => x.NO_GARANTIA == noCobertura);
							if (garantia != null) {
								idGarantia = garantia.ID_GARANTIA;
							}
						}
						return idGarantia;
					}
					
					md.formatImporte = function (valor) {
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
									var valorSplit = valor.split(".");
									if (valorSplit[valorSplit.length - 1] != null && valorSplit[valorSplit.length - 1].length > 2) {
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
					
					md.changeImporte = function () {
						if(md.datos.OPOLIZA.ID_PRODUCTO == 28 && md.coTipoMov == 3){
							if(md.limiteIndemnizacion < (md.imIndemnizacion + md.formatImporte(md.imTotal))){
								var msgLimite = $mdDialog.alert().multiple(true)
									.clickOutsideToClose(true)
									.textContent($translate.instant('MSG_COMPENSATION_CANNOT_EXCEED'))
									.ok($translate.instant('ACCEPT'));
								$mdDialog.show(msgLimite);
								md.imTotal = null;
							}
						}
						
						md.imBase = md.imTotal;
						
					}
					
					//Si el parámetro añadirMovReserva está true, significa que tenemos que añadir un nuevo movimiento de reserva, con la diferencia de pago y reserva
					md.guardarMovimiento = function (añadirMovReserva) {
						if(md.coTipoMov == 3 && !md.isCuentaConfirmada){
							var msgFile = $mdDialog.alert().multiple(true)
									.clickOutsideToClose(true)
									.textContent($translate.instant('MSG_BANK_ACCOUNT_REQUIRED'))
									.ok($translate.instant('ACCEPT'));
							$mdDialog.show(msgFile);
						} else
						if((md.coTipoMov != 2 && md.coTipoMov != 0)
								&& (md.listaFicherosMovimiento == null || md.listaFicherosMovimiento == undefined || md.listaFicherosMovimiento == 0)){
							var msgFile = $mdDialog.alert().multiple(true)
									.clickOutsideToClose(true)
									.textContent($translate.instant('MSG_ATTACHMENT_REQUIRED'))
									.ok($translate.instant('ACCEPT'));
							$mdDialog.show(msgFile);
						} else if (md.formatImporte(md.imTotal) > md.maxImportePago && añadirMovReserva != true && (md.coTipoMov == 3 || md.coTipoMov == 1 || md.coTipoMov == 4)) {
							var importeNuevoMovimientoReserva = md.formatImporte(md.imTotal) - md.maxImportePago;
							var confirm = $mdDialog.confirm()
                              .textContent($translate.instant('MSG_RESERVE_MOVEMENT_REQUIRED') + importeNuevoMovimientoReserva.toFixed(2) + "€, "+$translate.instant('MSG_AGREE'))
							  .multiple(true)
							  .ariaLabel('Lucky day')
							  .ok($translate.instant('ACCEPT'))
							  .cancel($translate.instant('CANCEL'));
							$mdDialog.show(confirm).then(function() {
								md.guardarMovimiento(true);
							}, function() {
//								$mdDialog.hide(confirm);
							});
						} else {
							if (md.formNuevoMovimiento == true) {
								var objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();
								objFocus.focus();
								return null;
							}
							
							var adsgsadg = "";
							var obj = JSON.parse(JSON.stringify(md.datos));
	
							var objMovimiento = {
								CO_TIPOMOV: md.coTipoMov, //Tipo de movimiento
								FT_USU_ALTA: vm.formatDate(new Date()),
								ID_FPAGO: "2",
								ID_SITPAGO: (md.coTipoMov == 0 ||md.coTipoMov == 4) ? "0" : "2",
								IM_IRPF: md.formatImporte(md.imIrpf),
								IM_IVA: md.formatImporte(md.imIva),
								IM_TOTAL: md.formatImporte(md.imTotal),
								IM_BASE: md.formatImporte(md.imBase),
								NO_USU_ALTA: vm.parent.parent.perfil,
								DS_PERCEPTOR: (md.coProveedor != null && md.coProveedor.NO_PROVEEDOR != null) ? md.coProveedor.NO_PROVEEDOR : null,
								NU_DOC_PERCEPTOR: (md.coProveedor != null && md.coProveedor.NU_CIF != null) ? md.coProveedor.NU_CIF : null,
								NU_FACTURA: (md.coTipoMov == 1 && md.nuFactura != null && md.nuFactura != "") ? md.nuFactura.replace(/[^a-z0-9]/gi,'') : undefined,
								FT_MOV: (md.coTipoMov == 1 && md.fechaFactura != null) ? vm.formatDate(md.fechaFactura) : vm.formatDate(new Date())
							}
	
							objMovimiento.oMovEconGaran = {
								DS_CONCEPTO: md.dsArchivo,
								DS_GARANTIA: (md.datos.ID_COMP_RAMO_PROD == 28) ? md.incidente : md.seccion != null ? md.seccion : md.coberturaAfectada,
								ID_GARANTIA: md.seccion != null ? md.getIdSeccion(md.seccion) : md.getIdCobertura(md.coberturaAfectada),
								IM_BASE: md.formatImporte(md.imBase),
								IM_IRPF: md.formatImporte(md.imIrpf),
								IM_IVA: md.formatImporte(md.imIva),
								IM_TOTAL: md.formatImporte(md.imTotal),
								NO_USU_ALTA: vm.parent.parent.perfil
							}

							//Si se va a añadir un movimiento de reserva con alguna sección de extensión de ciberdelincuencia
							//Añadir la garantía de ciberdelincuencia
							if (objMovimiento.CO_TIPOMOV == 0 && vm.mostrarSeccionesExtension == true && md.getIdCobertura(md.coberturaAfectada) == 55) {
								objMovimiento.oMovEconGaran.ID_GARANTIA = 55;
							}
	
	                        if ((md.listaFicherosMovimiento != null && md.listaFicherosMovimiento != undefined) 
	                        		&& (md.listaFicherosMovimiento[0] != null && md.listaFicherosMovimiento[0] != undefined)
	                        			&& md.dsArchivo != null && md.dsArchivo != "") {
	                        	// md.listaFicherosMovimiento[0].DS_ARCHIVO = md.listaFicherosMovimiento[0].DS_ARCHIVO + " | " + md.dsArchivo;
								for(let i = 0; i < md.listaFicherosMovimiento.length; i++) {
									md.listaFicherosMovimiento[i].DS_ARCHIVO = md.listaFicherosMovimiento[i].DS_ARCHIVO + " | " + md.dsArchivo;
								}
	                        }

	                        objMovimiento.FICHEROS = md.listaFicherosMovimiento;
	
							obj.LST_MOVS_ECONOMICOS = [];
							obj.LST_MOVS_ECONOMICOS.push(objMovimiento);
							
							//Si hay que añadir movimiento de reserva, porque el pago es mayor a la reserva
	                        if (añadirMovReserva == true) {
                                var importeNuevoMovimientoReserva = md.formatImporte(md.imTotal) - md.maxImportePago;
                                var objMovimientoReserva = JSON.parse(JSON.stringify(objMovimiento));
                                objMovimientoReserva.CO_TIPOMOV = 0;
                                objMovimientoReserva.FICHEROS = [];
                                objMovimientoReserva.IM_BASE = importeNuevoMovimientoReserva;
                                objMovimientoReserva.IM_TOTAL = importeNuevoMovimientoReserva;
                                objMovimientoReserva.oMovEconGaran.IM_BASE = importeNuevoMovimientoReserva;
                                objMovimientoReserva.oMovEconGaran.IM_TOTAL = importeNuevoMovimientoReserva;
                                objMovimientoReserva.ID_SITPAGO = "0";
                                
                                //Si se va a añadir un movimiento de reserva con alguna sección de extensión de ciberdelincuencia
    							//Añadir la garantía de ciberdelincuencia
    							if (vm.mostrarSeccionesExtension == true && md.getIdCobertura(md.coberturaAfectada) == 55) {
    								objMovimientoReserva.oMovEconGaran.ID_GARANTIA = 55;
    							}
                                
                                obj.LST_MOVS_ECONOMICOS.push(objMovimientoReserva);
	                        }
	
	                        if ((obj.FICHEROS != null && obj.FICHEROS != undefined) 
	                        		&& (obj.FICHEROS[0] != null && obj.FICHEROS[0] != undefined)
	                        			&& md.dsArchivo != null && md.dsArchivo != "") {
	                        	obj.FICHEROS[0].DS_ARCHIVO = obj.FICHEROS[0].DS_ARCHIVO + " | " + md.dsArchivo;
	                        }

							//Si se añade cuenta bancaria, añadírsela al movimiento económico
							if (md.nuCuenta != null && md.cuentaBancariaDisabled != true) {
								// obj.NU_CUENTA_BANCARIA = md.nuCuenta;
								obj.LST_MOVS_ECONOMICOS[0].NU_CUENTA_BANCARIA = md.nuCuenta;
							}
	
	    					md.cargarMovimento = true;
							SiniestroService.guardarSiniestro(obj)
							.then(function successCallback(response) {
								md.cargarMovimento = false;
								if(response.status == 200) {
									if(response.data.ID_RESULT == 0) {
										md.cancel();
										msg.textContent($translate.instant('SUCCESSFULLY_SAVED_MOVE'));
										$mdDialog.show(msg);
										
										//Volver a recoger movimientos de siniestro
										SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": vm.datos.ID_SINIESTRO})
										.then(function successCallback(response){
											if(response.status == 200){
												vm.siniestros = response.data.SINIESTROS.SINIESTRO;
												vm.datos = vm.siniestros[0];
												vm.datos.OPOLIZA = JSON.parse(JSON.stringify(vm.polizaCopy));
												if (vm.siniestros != null && vm.siniestros[0] != null && vm.siniestros[0].LST_MOVS_ECONOMICOS != null && vm.siniestros[0].LST_MOVS_ECONOMICOS.length > 0) {
													vm.existeMovEcon = true;
													vm.coberturasModal = [];
													var garantiasSeleccionadas = vm.getGarantiasSeleccionadas(vm.siniestros[0].LST_MOVS_ECONOMICOS);
													vm.crearCoberturasModal(garantiasSeleccionadas);
													vm.sumaTotal = 0;
													if (vm.datos.IM_PAGO != null) {
														vm.sumaTotal += vm.datos.IM_PAGO;
													}
													if (vm.datos.IM_INDEMNIZACION != null) {
														vm.sumaTotal += vm.datos.IM_INDEMNIZACION;
													}
													if (vm.datos.IM_FRANQUICIA != null) {
														vm.sumaTotal -= vm.datos.IM_FRANQUICIA;
													}
												} else {
													vm.existeMovEcon = false;
												}

												//Recargar siniestro en el listado
												if (vm.busquedaSiniestro != null && vm.busquedaSiniestro.gridOptions != null && vm.busquedaSiniestro.gridOptions.data != null) {
													var index = vm.busquedaSiniestro.gridOptions.data.findIndex(x => x.ID_SINIESTRO == vm.datos.ID_SINIESTRO);
													if (index >= 0) {
														vm.busquedaSiniestro.gridOptions.data[index] = JSON.parse(JSON.stringify(vm.datos));
													}
												}
											} else {
												vm.existeMovEcon = false;
											}
											// vm.gridDetalleSiniestro.data = vm.siniestros;
											vm.gridDetalleSiniestro.data = vm.siniestros[0].LST_MOVS_ECONOMICOS;
											vm.load = false;
										});
										
										if (md.coTipoMov != 0) {
											//Si se están enviando más de 1 movimiento (cuando se genera a parte uno de reserva), enviar solo el tipo seleccionado
											if (response.data.LST_MOVS_ECONOMICOS != null && response.data.LST_MOVS_ECONOMICOS.length > 1) {
												var objMovEcon = response.data.LST_MOVS_ECONOMICOS.find(x => x.CO_TIPOMOV == md.coTipoMov);
												if (objMovEcon != null) {
													response.data.LST_MOVS_ECONOMICOS = [];
													response.data.LST_MOVS_ECONOMICOS.push(objMovEcon);
												}
											}
											
											//Enviar notificación
											if (vm.notificacionesActivas == true) {
												SiniestroService.notifications(vm.getCodeNotification(md.coTipoMov), response.data)
												.then(function successCallback(response){
													console.log("sendMail OK " + response);
												}, function errorCallback(response){
													msg.textContent($translate.instant('ERROR_SENDING_NOTIFICATION_EMAIL'));
													$mdDialog.show(msg);
												});
											}
										}
									} else {
								        md.cancel();
										msg.textContent(response.data.DS_RESULT);
										$mdDialog.show(msg);
									}
								}
								md.cargarMovimento = false;
							}, function errorCallback(response){
								md.cargarMovimento = false;
								md.cancel();
								msg.textContent($translate.instant('ERROR_SAVE_MOVEMENT'));
								$mdDialog.show(msg);
							});
						}
					}

					md.updateFile = function (e) {
						if(e) {
							$scope.$apply();
							if(document.getElementById('file_mov').files != null && document.getElementById('file_mov').files.length > 0 != null){
								
                                for (var i = 0; i < document.getElementById('file_mov').files.length; i++) {
                                	var f = document.getElementById('file_mov').files[i];

									md.nombreArchivoMov = f.name;
									md.archivo = null;
									md.listaFicherosMovimiento = [];

									var reader = new FileReader();
									reader.filename = f.name;
									
									reader.onload = function(readerEvt) {

										var base64 = reader.result.split("base64,")[1];
										var binary_string = window.atob(base64);
										var len = binary_string.length;
										var bytes = [];
										for (var i = 0; i < len; i++) {
											bytes.push(binary_string.charCodeAt(i));
										}
										var archivo = bytes;
										var dsArchivo = "";

										if (md.coTipoMov != null) {
											dsArchivo = md.tipos.tipoMovimiento.find(x => x.CO_TIPO == md.coTipoMov).DS_TIPOS;
										}

										var fileName = readerEvt.target.filename;
										fileName = fileName.split(".");
										if (fileName.length > 1) {
											for (var i = 0; i < fileName.length; i++) {
												fileName[i] = vm.appParent.changeSpecialCharacters(fileName[i]);
											}
										}
										fileName = fileName.join('.');
										md.nombreArchivoMov = fileName;

										md.listaFicherosMovimiento.push({
											ARCHIVO: bytes,
											NO_ARCHIVO: fileName,
											DS_ARCHIVO: dsArchivo,
											ID_TIPO: 9
										});

										$scope.$apply();
										
										var scope = angular.element($("#file_mov")).scope();
										scope.$apply(function(){
											scope = md;
										});

									}

									reader.readAsDataURL(f);
                                }

                                e.stopImmediatePropagation();
							}
						}
						
						if(md.coTipoMov != 2 && md.coTipoMov != 0){
        					md.noArchivo = true;
						}
					}
					
					$(document).on('change', '#file_mov', function(e) {
						if (angular.element("#file_mov") != null && angular.element("#file_mov").scope != null) {
							$scope = angular.element("#file_mov").scope();
							md = angular.element("#file_mov").scope().$ctrl;
						}
						md.updateFile(e);
					});

					$scope.$watch('$ctrl.files', function () {
						md.upload(md.files);
					});

					md.upload = function(files) {
						if(files && files.length > 0) {
							for(var i = 0; i < files.length; i++) {								
								(function(oFile) {
									var name = CommonUtils.checkFileName(oFile.name);
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
										var dsArchivo = '';
										if (md.coTipoMov != null) {
											dsArchivo = md.tipos.tipoMovimiento.find(x => x.CO_TIPO == md.coTipoMov).DS_TIPOS;
										}
										var file = {
											'NO_ARCHIVO': name,
											'ARCHIVO': bytes,
											'ID_TIPO': 9
										};

										if(dsArchivo != '') {
											file['DS_ARCHIVO'] = dsArchivo;
										}
										
										$scope.$apply(function() {
											md.listaFicherosMovimiento.push(file);
										});
									}
									reader.readAsDataURL(oFile);
								})(files[i]);
							}
							
						}
					}

					md.removeFile = function(lstFiles, index) {
						if(lstFiles != undefined && Array.isArray(lstFiles)) {
							lstFiles.splice(index, 1);
						}
					}
					
					md.hide = function() {
						$mdDialog.hide();
				    };
					
					md.cancel = function(){
						$mdDialog.cancel();
					};

					md.answer = function(answer) {
						$mdDialog.hide(answer);
				    };

				}]

			});
		}
		
		vm.mostrarSeccion = function () {
    	     var listProductosAceptados = [3, 4, 5, 6, 25, 29, 19, 32];
    	     if (vm.datos != null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(vm.datos.OPOLIZA.ID_PRODUCTO) && vm.coberturas != null && vm.tipos.garantiasHijoFilter.length > 0) {
    		     return true;
    	     } else return false
		}
		
		vm.mostrarIncidente = function () {
    	     var listProductosAceptados = [3, 4, 5, 6, 25, 29, 19, 32];
    	     if (vm.datos != null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(vm.datos.OPOLIZA.ID_PRODUCTO)) {
    		     return true;
    	     } else return false
		}
		
		vm.mostrarServicio = function () {
    	     var listProductosAceptados = [28];
    	     if (vm.datos != null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(vm.datos.OPOLIZA.ID_PRODUCTO)) {
    		     return true;
    	     } else return false
		}
		
		vm.mostrarIndemnizacion = function () {
    	     var listProductosAceptados = [28];
    	     if (vm.datos != null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_PRODUCTO != null && listProductosAceptados.includes(vm.datos.OPOLIZA.ID_PRODUCTO)) {
    		     return true;
    	     } else return false
		}
		
		vm.changeMotivoRechazo = function () {
			if (vm.tipos.rechazo != null && vm.datos.ID_MOTIVO_RECHAZO != null) {
				var rechazo = vm.tipos.rechazo.find( x => x.ID_TIPOS == vm.datos.ID_MOTIVO_RECHAZO);
				if (rechazo != null) {
					vm.datos.DS_MOTIVO_RECHAZO = rechazo.DS_TIPOS;
				}
			}
		}
		
		vm.beautifyImporte = function (x) {
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
	        x = x.toFixed(2);

	        var parts = x.toString().split(".");
	        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	        return parts.join(",");
		}
		
		vm.ocultarSeccion = function (seccion) {
			var ocultarGarantia = false;
			if (seccion && vm.garantiasActivas && vm.garantiasActivas.length > 0 && vm.garantiasActivas.findIndex(x => x == seccion.ID_GARANTIA) > -1) {
				ocultarGarantia = true;
			}
			return ocultarGarantia;
		}
		
		$(document).on('change', '#file_ent', function(e) {
			if(e) {
				$scope.$apply();
				if(document.getElementById('file_ent').files[0] != null){
					var f = document.getElementById('file_ent').files[0];

					vm.nombreArchivo = f.name;
					vm.archivo = null;
					
					var reader = new FileReader();
				    reader.onload = function() {

				    	
				    	var base64 = this.result.split("base64,")[1];
						var binary_string = window.atob(base64);
					    var len = binary_string.length;
					    var bytes = [];
					    for (var i = 0; i < len; i++) {
					        bytes.push(binary_string.charCodeAt(i));
					    }
						var archivo = bytes;
				    	
						if (vm.datos.FICHEROS == null) {
							vm.datos.FICHEROS = [];
						}
						
						vm.nombreArchivo = vm.nombreArchivo.split(".");
						if (vm.nombreArchivo.length > 1) {
							// fileName[0] = vm.appParent.changeSpecialCharacters(fileName[0]);
							for (var i = 0; i < vm.nombreArchivo.length; i++) {
								vm.nombreArchivo[i] = vm.appParent.changeSpecialCharacters(vm.nombreArchivo[i]);
							}
						}
						vm.nombreArchivo = vm.nombreArchivo.join('.');
				    	
						vm.datos.FICHEROS.push({
							ARCHIVO: bytes,
							DS_ARCHIVO: "Llamada entrante al Call Center",
							NO_ARCHIVO: vm.nombreArchivo
						});
						
				        $scope.$apply();

				    }

					reader.readAsDataURL(f);
				}
			}
		});

		$scope.$watch('$ctrl.files', function () {
			vm.upload(vm.files);
		});

		vm.upload = function(files) {
			if(files) {
				vm.listArchivosPendientes = [];			
				for(var i = 0; i < files.length; i++) {							
					(function(oFile) {
						var name = CommonUtils.checkFileName(oFile.name);
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
								'NO_ARCHIVO': name,
								'ARCHIVO': bytes,
								'DS_ARCHIVO': (vm.obsArchivo != null && vm.obsArchivo != "") ? vm.descArchivo + " | " + vm.obsArchivo : vm.descArchivo
							};
							
							$scope.$apply(function() {
								if (vm.datos == null) {
									vm.datos = {};
								}
								if (vm.datos.FICHEROS == null) {
									vm.datos.FICHEROS = [];
								}
								if (vm.listArchivosPendientes == null) {
									vm.listArchivosPendientes = [];
								}
								vm.datos.FICHEROS.push(file);
								vm.listArchivosPendientes.push({
									DS_ARCHIVO: file.DS_ARCHIVO,
									NO_ARCHIVO: file.NO_ARCHIVO
								});
							
								if (vm.listArchivosPendientes.length == files.length) {
									vm.descArchivo = null;
									vm.obsArchivo = null;
									vm.nombreArchivo = null;
								}
							});
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
		}
		
		vm.getImporteReclamadoCliente = function () {
			TiposService.getTipos({"CO_TIPO": "IMPORTE_RESERVA_CIBER_PARTICULARES"})
    		.then(function successCallback(response){
    			if(response.status == 200 && response.data.TIPOS && response.data.TIPOS.TIPO){
    				vm.importeReservaParticulares = response.data.TIPOS.TIPO[0].DS_TIPOS;
    			}
    		});
		}

		vm.addList = function(list, element) {
			vm.text = vm[element];
			vm[list].push(vm.text);
			vm[element] = null;
		}

		vm.anadirMedida=function(){
    		var i = 0;
            var keepGoing = true;

            if (vm.medidasAdic != undefined) { //Comprueba los inputs si están vacíos.
                angular.forEach(vm.medidasAdic, function (value, key) {
                    angular.forEach(value, function (valor, key) {
                        if (keepGoing) {
                            if (valor === "") {
                                i++;
                                if (i > 2) {
                                    keepGoing = false;
                                }
                            }
                            else {
                                i = 0;
                                return;
                            }
                        }
                    });
                });
                //Si supera mas de 2 inputs vacíos, no se añadira nueva fila
                if (i == 0)
					vm.medidasAdic.push({"NOMBRE_MEDIDA":"","STATUS":""});

            } else {//Si no tienen filas, se añade una nueva.
    			vm.medidasAdic=[];
    			vm.medidasAdic.push({"NOMBRE_MEDIDA":"","STATUS":""});
    		}
    	}

		vm.eliminarMedida = function(){
			$mdDialog.show(msgConfirm).then(function() {
				if (vm.medidasAdic != undefined){
					vm.medidasAdic.pop();
				}
			  }, function() {
				  
			  });
	   }

	   vm.exportarExcel = function(selected){
		var json = {
			"ID_SINIESTRO": vm.datos.ID_SINIESTRO,
			"IS_NEW": true
		};
		if (vm.datos != null) {
			json.IS_SELECTED = selected;
		}
			
		ExportService.exportarSiniestros(json)
		.then(function successCallback(response) {
			
			vm.appParent.cambiarDatosModal($translate.instant('SUCCESSFUL_DOWNLOAD'));
			if (response.status === 200) {
					let utf8decoder = new TextDecoder();
					var mensajeUArchivo = utf8decoder.decode(response.data);
					if(mensajeUArchivo.search('ID_RESULT') != -1) {
						var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
						if(objtMensajeUArchivo.ID_RESULT != 0) {
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						} 
					} else {
						var nombreArchivo = "listado_siniestros_exportado.xlsx";
						
						if (vm.url == "movimientos_economicos") {
							nombreArchivo = "listado_movimientos_exportado.xlsx";
						}
						
						saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), nombreArchivo);
					}
			}
		}, function errorCallback(response){
			
			vm.parent.abrirModalcargar(false);
			$mdDialog.show(msg);
		});   		
		}
    }   
    
    ng.module('App').component('siniestroSd', Object.create(siniestroComponent));
    
})(window.angular);
