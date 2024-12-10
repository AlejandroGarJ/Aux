(function (ng) {

    //Crear componente de app
    var solicitudComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$scope', '$q', '$window', 'sharePropertiesService', '$location', '$mdDialog', '$timeout', 'validacionesService', 'ClienteService', 'BusquedaService', 'SolicitudService', 'PolizaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', 'DescargaService', '$templateCache', 'FicherosService', 'ExportService', 'HogarService', 'EmpresaService', 'CommonUtils', 'constantsTipos'],
        require: {
			appParent: '^sdApp',
            parent: '^detalleSd',
            busqueda: '^busquedaApp',
            busquedaSolicitudes: '^?busquedaSolicitudes',
//            busquedaSolicitudes: '^busquedaSolicitudes'
        },
        bindings: {
        	callGetDetail: '<'
        }
    }

    solicitudComponent.controller = function solicitudComponentControler($scope, $q, $window, sharePropertiesService, $location, $mdDialog, $timeout, validacionesService, ClienteService, BusquedaService, SolicitudService, PolizaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, DescargaService, $templateCache, FicherosService, ExportService, HogarService, EmpresaService, CommonUtils, constantsTipos) {
        var vm = this;
        vm.db = sharePropertiesService.get('db');
        var url = window.location;
        vm.listFiles = [];
        vm.indicesEliminar = [];
        vm.gridModificacion = [];
        vm.tipoBanco = "IBAN";
        vm.form = {};
        vm.tipos = {};
        vm.calendar = {};
        aux = {};
        var x2js = new X2JS();
        vm.existePoliza = false;
        vm.listaArchivos = [];
        vm.garantiasTotales = [];
        vm.observaciones = 'sdf';
		vm.showManuallyPricing = false;
		// Dialog AngularJS
        vm.msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        $templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );

        this.$onInit = function (bindings) {

        	vm.isModGarantias = false;
        	
            //Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
            //Parámetro utilizado en: ng-style="resizeHeight({{$ctrl.medida}})"
            if (vm.parent.parent.url == 'solicitudes' || vm.parent.parent.url == 'renting')
                vm.medida = 276;
            else if (vm.parent.parent.url == 'clientes' || vm.parent.parent.url == 'polizas')
                vm.medida = 315;

            //vm.datos = vm.parent.datos
            vm.colectivos = vm.parent.colectivos;
            
            if(vm.busquedaSolicitudes != null && vm.busquedaSolicitudes != undefined){
                vm.permisos = vm.busquedaSolicitudes.permisos;
            } else {
                vm.permisos = vm.appParent.getPermissions("solicitudes_list");
            }

            //Si es una solicitud nueva no hace la llamada
            if(vm.callGetDetail != false){

                SolicitudService.getSolicitud(vm.parent.datos.ID_SOLICITUD)
                .then(function successCallBack(response) {
                    if (response.status == 200) {
                    	if(response.data.ID_RESULT == 0 ){
	                        aux = JSON.parse(JSON.stringify(response.data));
	                        vm.datos = response.data;
	//                        vm.datos.XM_ENVIADO = x2js.xml2js(aux.XM_ENVIADO);
	                      
	                        if(vm.parent.parent.url === 'renting'){
	                        	if(vm.datos.ODATOS_RENTING != undefined){
	                        		if(vm.datos.ODATOS_RENTING.nombreConductor != undefined){
	                        			vm.datos.ODATOS_RENTING.nombreConductor = vm.datos.ODATOS_RENTING.nombreConductor.split(';');
	                        		}
	                        		if(vm.datos.ODATOS_RENTING.poblacionCliente != undefined){
	                        			vm.datos.ODATOS_RENTING.poblacionCliente = vm.datos.ODATOS_RENTING.poblacionCliente.split(';');
	                        		}
	                        	}
	                        }
	
	
	            			if (vm.datos.OTIPO_SOLICITUD != null && (vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 11 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUDPADRE == 41 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUDPADRE == 51)) {
	            				vm.montarRiesgos();
	            			} 
	                        
							if(vm.datos.OTIPO_SOLICITUD != null && (vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51)){
                                BusquedaService.buscar({"ID_SOLICITUD_PADRE": vm.datos.ID_SOLICITUD}, 'solicitud')
                                .then(function successCallback(response){
                                    if(response.data.ID_RESULT == 0){
										vm.listSolicitudesHijas = [];
                                        vm.solicitudesHijas = response.data.SOLICITUDES != undefined ? response.data.SOLICITUDES.SOLICITUD : [];
										if(vm.datos.OTIPO_SOLICITUD != null && vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 && vm.tipoSolicitud.IS_SINIESTRALIDAD == true){
											vm.listSolicitudesHijas.push({
												'OTIPO_SOLICITUD': {
													'DS_TIPO_SOLICITUD': 'Siniestralidad',
													'ID_TIPO_SOLICITUD': '41'},
												'JS_ENVIADO': vm.datos.JS_ENVIADO
											});
											if(vm.solicitudesHijas.length == 0){
												vm.listSolicitudesHijas[0].isSelected = true;
											}
										}
										for(i=0; i<vm.solicitudesHijas.length; i++){
											var idSolicitud = vm.solicitudesHijas[i].ID_SOLICITUD;
											// vm.listSolicitudesHijas.push(vm.solicitudesHijas[i]);
											
											SolicitudService.getSolicitud(idSolicitud)
											.then(function successCallBack(response) {
												if (response.status == 200) {
													if(response.data.ID_RESULT == 0 ){
														// vm.solicitudHija = response.data;
														vm.listSolicitudesHijas.push(response.data);
														for (let i = 0; i < vm.listSolicitudesHijas.length; i++) {
															vm.listSolicitudesHijas[i].isSelected = true;
															vm.listSolicitudesHijas[i].datosHija = 
																(vm.listSolicitudesHijas[i].OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 43 || vm.listSolicitudesHijas[i].OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 53) 
																? JSON.parse(vm.listSolicitudesHijas[i].JS_RESPUESTA) 
																: JSON.parse(vm.listSolicitudesHijas[i].JS_ENVIADO);
															
															if(vm.listSolicitudesHijas[i].OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 42 || vm.listSolicitudesHijas[i].OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 52){
																if(vm.listSolicitudesHijas[i].datosHija.XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_INCLUIDAS != undefined){
																	vm.listSolicitudesHijas[i].datosHija.isIncluirExt = true;
																} else if(vm.listSolicitudesHijas[i].datosHija.XML_MODIFICACION_GARANTIAS.XML_GARANTIAS_INCLUIDAS != undefined){
																	vm.listSolicitudesHijas[i].datosHija.isExcluirExt = true;
																}
															}
														}
													}
												}
											});
										}
                                    }
                                }, function errorCallBack(response)  {
									if (response.status == 406 || response.status == 401) {
										vm.appParent.logout();
									}
                                }); 
                            }

							if (vm.datos.OTIPO_SOLICITUD != null && vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 6 && vm.datos.OTIPO_SOLICITUD.ID_RAMO == 20 && vm.datos.OPRESUPUESTO != null && vm.datos.OPRESUPUESTO.ID_PRESUPUESTO != null) {
								BusquedaService.buscar({"ID_PRESUPUESTO": vm.datos.OPRESUPUESTO.ID_PRESUPUESTO}, 'presupuestos')
								.then(function successCallback(response2){
									if(response2.data.ID_RESULT == 0){
								        vm.blockCapitales = null;
										if (response2.data.PRESUPUESTOS != null && response2.data.PRESUPUESTOS[0] != null) {
										    vm.datos.PRESUPUESTO = {
										    	PRESUPUESTO: response2.data.PRESUPUESTOS[0],
										    	ID_PRESUPUESTO: response2.data.PRESUPUESTOS[0].ID_PRESUPUESTO
										    }
										    
										    if (response2.data.PRESUPUESTOS[0].LIST_TARIFAS) {
										    	vm.datos.PRESUPUESTO.MODALIDADES = {
										    		MODALIDAD: response2.data.PRESUPUESTOS[0].LIST_TARIFAS
										    	}
										    }
										    
										    vm.blockCapitales = JSON.parse(JSON.stringify(vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.BLOCK_CAPITALES));
									    }
									}
								}, function errorCallBack(response)  {
								}); 
					        	vm.isModGarantias = true;
					        	vm.datos.IN_ENVIO_MAIL_CLIENTE = true;
							}
                    	}else{
                    		msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
                    	}	
                    }
                    
                    vm.montarSolicitud(); 
                    
                }, function errorCallBack(response) {
                    $q.all({
                        'datosRequest': validacionesService.getData(),
                        'dictRequest': validacionesService.getDict()
                    }).then(function (data) {
                        vm.form = data.datosRequest.data;
                        vm.dictionary = data.dictRequest.dict;
                    });
                });
            } else {
            	aux = JSON.parse(JSON.stringify(vm.parent.datos));
                vm.datos = vm.parent.datos;
                
                vm.blockCapitales = null;

                if (vm.datos.LIST_ARCHIVOS != undefined) {
                    vm.listaArchivos = _.toArray(vm.datos.LIST_ARCHIVOS);
                }

                if(vm.datos.PRESUPUESTO != undefined && vm.datos.PRESUPUESTO.PRESUPUESTO != undefined && vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR != undefined && vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.BLOCK_CAPITALES != undefined){
                    vm.blockCapitales = JSON.parse(JSON.stringify(vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.BLOCK_CAPITALES));
                
                    if (vm.datos.OTIPO_SOLICITUD && vm.datos.PRESUPUESTO.PRESUPUESTO != null && vm.datos.PRESUPUESTO.PRESUPUESTO.ID_PRESUPUESTO != null && vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 6) {
                    	BusquedaService.buscar({"ID_PRESUPUESTO": vm.datos.PRESUPUESTO.PRESUPUESTO.ID_PRESUPUESTO}, 'presupuestos')
						.then(function successCallback(response){
							if(response.data.ID_RESULT == 0){
								  if (response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS[0] != null && response.data.PRESUPUESTOS[0].LIST_TARIFAS != null) {
									  vm.datos.PRESUPUESTO.MODALIDADES = {
									      MODALIDAD: response.data.PRESUPUESTOS[0].LIST_TARIFAS
									  };
								  }
							}
						}, function errorCallBack(response)  {
						}); 
			        	vm.isModGarantias = true;
			        	vm.datos.IN_ENVIO_MAIL_CLIENTE = true;
                    }
                }

    			if (vm.datos.OTIPO_SOLICITUD != null && (vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 11 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 41 || vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 51)) {
    				vm.montarRiesgos();
    			} 
                
                ClienteService.getCliente({ ID_CLIENTE: vm.datos.OCLIENTE.ID_CLIENTE })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	vm.datos.OCLIENTE = response.data;
                    	
                    	if(vm.datos.OCLIENTE.NO_NOMBRE_COMPLETO == undefined){
                    		vm.datos.OCLIENTE.NO_NOMBRE_COMPLETO = vm.datos.OCLIENTE.NO_NOMBRE + " " + vm.datos.OCLIENTE.NO_APELLIDO1;
                    	}
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.appParent.logout();
                    }
                });
                
                PolizaService.getPolizasByFilter({ ID_POLIZA: vm.datos.OPOLIZA.ID_POLIZA })
                .then(function successCallback(response) {
                    if (response.status == 200 && response.data.POLIZAS != undefined && response.data.POLIZAS.POLIZA != undefined) {
                    	vm.datos.OPOLIZA = response.data.POLIZAS.POLIZA[0];
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.appParent.logout();
                    }
                });
    
                vm.montarSolicitud();
               
            }           

            if(vm.appParent.listServices.listSituaSolicitud != null && vm.appParent.listServices.listSituaSolicitud.length > 0){
    			vm.tipos.estadoSolicitud = vm.appParent.listServices.listSituaSolicitud;
    		} else {
    			TiposService.getSituaSolicitud({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.estadoSolicitud = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listSituaSolicitud = vm.tipos.estadoSolicitud;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parentApp.logout();
                    }
    			});
    		}
            
            if(vm.appParent.listServices.listCanales != null && vm.appParent.listServices.listCanales.length > 0){
    			vm.tipos.canales = vm.appParent.listServices.listCanales;
    			
    			//Si es una solicitud nueva, se busca el DS_TIPO
                if(vm.callGetDetail == false && vm.datos != undefined && vm.datos.ID_TIPO){
                	for(var i = 0; i < vm.tipos.canales.length; i++){
                		if(vm.tipos.canales[i].ID_TIPOS == vm.datos.ID_TIPO){
                			vm.datos.DS_TIPO = vm.tipos.canales[i].DS_TIPOS;
                			break;
                		}
                	}
                }
    		} else {
    			//Cargar tipos de canal
        		TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.canales = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listCanales = vm.tipos.canales;
    					
    					//Si es una solicitud nueva, se busca el DS_TIPO
                        if(vm.callGetDetail == false && vm.datos != undefined && vm.datos.ID_TIPO){
                        	for(var i = 0; i < vm.tipos.canales.length; i++){
                        		if(vm.tipos.canales[i].ID_TIPOS == vm.datos.ID_TIPO){
                        			vm.datos.DS_TIPO = vm.tipos.canales[i].DS_TIPOS;
                        			break;
                        		}
                        	}
                        }
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.appParent.logout();
                    }
    			});
    		}
            
            if(vm.appParent.listServices.listColectivos != null && vm.appParent.listServices.listColectivos.length > 0){
    			vm.tipos.colectivos = vm.appParent.listServices.listColectivos;
    			
    			//Si es una solicitud nueva, se busca el Partner
                if(vm.callGetDetail == false && vm.datos != undefined && vm.datos.ID_TIPO_COLECTIVO){
                	for(var i = 0; i < vm.colectivos.length; i++){
                		if(vm.colectivos[i].ID_TIPO_POLIZA == vm.datos.ID_TIPO_COLECTIVO){
                			vm.datos.DS_TIPO_COLECTIVO = vm.colectivos[i].DS_TIPO_POLIZA;
                			break;
                		}
                	}
                }
    		} else {
	            ColectivoService.getListColectivos({})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
						vm.appParent.listServices.listColectivos = vm.colectivos;
						
						//Si es una solicitud nueva, se busca el Partner
	                    if(vm.callGetDetail == false && vm.datos != undefined && vm.datos.ID_TIPO_COLECTIVO){
	                    	for(var i = 0; i < vm.colectivos.length; i++){
	                    		if(vm.colectivos[i].ID_TIPO_POLIZA == vm.datos.ID_TIPO_COLECTIVO){
	                    			vm.datos.DS_TIPO_COLECTIVO = vm.colectivos[i].DS_TIPO_POLIZA;
	                    			break;
	                    		}
	                    	}
	                    }
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.appParent.logout();
					}
				});
    		}

            if(vm.appParent.listServices.listCompanias != null && vm.appParent.listServices.listCompanias.length > 0){
    			vm.tipos.compania = vm.appParent.listServices.listCompanias;
    		} else {
    			TiposService.getCompania({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.compania = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listCompanias = vm.tipos.compania;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.appParent.logout();
                    }
    			});
    		}

            if(vm.appParent.listServices.listRamos != null && vm.appParent.listServices.listRamos.length > 0){
    			vm.tipos.ramos = vm.appParent.listServices.listRamos;
    		} else {
    			TiposService.getRamos({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.ramos = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listRamos = vm.tipos.ramos;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.appParent.logout();
                    }
    			});
    		}
            
            if(vm.appParent.listServices.listTipoDocumento != null && vm.appParent.listServices.listTipoDocumento.length > 0){
    			vm.tipos.tiposDocumento = vm.appParent.listServices.listTipoDocumento;
    		} else {
    			TiposService.getTipoDocumento({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.appParent.logout();
                    }
    			});
    		}
           
			if(vm.appParent.listServices.listMotivosRechazo != null && vm.appParent.listServices.listMotivosRechazo.length > 0){
    			vm.motivosRechazo = vm.appParent.listServices.listMotivosRechazo;
    		} else {
				TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_MOTIVO_RECHAZO_SOLICITUD})
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.motivosRechazo = response.data.TIPOS.TIPO;   
						vm.appParent.listServices.listMotivosRechazo = vm.motivosRechazo;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.appParent.logout();
					}
				});
    		}
					
            vm.getDocuments();

        }
        
        vm.montarRiesgos = function () {
			vm.bloquesRiesgo = {};

			if (vm.datos.JS_RESPUESTA != null) {
                vm.bloquesRiesgo = JSON.parse(vm.datos.JS_RESPUESTA);
			}
			
            if (vm.datos.OPOLIZA.ID_PRODUCTO == 7) {
				//CIBERHIJOS
				if(vm.appParent.listServices.listNumHijos_ti != null && vm.appParent.listServices.listNumHijos_ti.length > 0) {
						vm.typesHijos = vm.appParent.listServices.listNumHijos_ti;
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

							vm.appParent.listServices.listNumHijos_ti = vm.typesHijos;
						}
					}, function callBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.appParent.logout();
						}
					});
				}
            } else if (vm.datos.OPOLIZA.ID_PRODUCTO == 8) {
            	//CIBERIDENTIDAD
            	if(vm.appParent.listServices.listNumAdultos_ti != null && vm.appParent.listServices.listNumAdultos_ti.length > 0) {
	                vm.typesIdent = vm.appParent.listServices.listNumAdultos_ti;
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
	                    	
	                    	vm.appParent.listServices.listNumHijos_ti = vm.typesIdent;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }
            } else if (vm.datos.OPOLIZA.ID_PRODUCTO == 6 || vm.datos.OPOLIZA.ID_PRODUCTO == 5) {
				//CIBEREMPRESA
				if(vm.appParent.listServices.listGrupoEmpresa_ti != null && vm.appParent.listServices.listGrupoEmpresa_ti.length > 0) {
	                vm.tpGroups = vm.appParent.listServices.listGrupoEmpresa_ti;
	                if (vm.bloquesRiesgo != null && vm.bloquesRiesgo.CIBERRIESGO != null && vm.bloquesRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
	                    var noSector = vm.bloquesRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
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
	                        
	                        if (vm.bloquesRiesgo != null && vm.bloquesRiesgo.CIBERRIESGO != null && vm.bloquesRiesgo.CIBERRIESGO.ACTIVITY_CODE != null) {
			                    var noSector = vm.bloquesRiesgo.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
			                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
			                }
	                        
	                        vm.appParent.listServices.listGrupoEmpresa_ti = vm.tpGroups;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }

	            if(vm.appParent.listServices.listCiberAtaque_ti != null && vm.appParent.listServices.listCiberAtaque_ti.length > 0) {
	                vm.tpCbatk = vm.appParent.listServices.listCiberAtaque_ti;
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
	                    	
	                    	
	                    	vm.appParent.listServices.listCiberAtaque_ti = vm.tpCbatk;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }

	            if(vm.appParent.listServices.listCantidadAsegurada_ti != null && vm.appParent.listServices.listCantidadAsegurada_ti.length > 0) {
	                vm.tpAmount = vm.appParent.listServices.listCantidadAsegurada_ti;
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
	                    	
	                        vm.appParent.listServices.listCantidadAsegurada_ti = vm.tpAmount;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }

	            if(vm.appParent.listServices.listCantidadPerdida_ti != null && vm.appParent.listServices.listCantidadPerdida_ti.length > 0) {
	                vm.tpLosses = vm.appParent.listServices.listCantidadPerdida_ti;
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
	                    	
	                        vm.appParent.listServices.listCantidadPerdida_ti = vm.tpLosses;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }

	            if(vm.appParent.listServices.listCantidadFacturacion_ti != null && vm.appParent.listServices.listCantidadFacturacion_ti.length > 0) {
	                vm.tpFacturacion = vm.appParent.listServices.listCantidadFacturacion_ti;
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
	                    	
	                    	vm.appParent.listServices.listCantidadFacturacion_ti = vm.tpFacturacion;
	                    }
	                }, function callBack(response) {
	                    if (response.status == 406 || response.status == 401) {
	                        vm.appParent.logout();
	                    }
	                });
	            }

				if (vm.bloquesRiesgo != null && vm.bloquesRiesgo.LST_GARANTIAS != null && vm.bloquesRiesgo.LST_GARANTIAS.length > 0) {
					var indexExtension = vm.bloquesRiesgo.LST_GARANTIAS.findIndex(x => x.ID_GARANTIA == 57);
					if (indexExtension > -1) {
						vm.checkIncluirExtension = true;
					}
				}
			}
        }
        
        vm.montarSolicitud = function(){
        	angular.forEach(vm.datos, function (value, key) {
                switch (key) {
	                case 'GESTION_ASEGURADOS':
	                	vm.xmGestionAseg = "";
	                    vm.tipoSolicitud = value.XML_GESTION_ASEGURADOS;
	                    vm.observaciones = value.XML_OBSERVACIONES;
	                    if (vm.tipoSolicitud.CO_TIPO_SOLICITUD_SC != 3) {
	                    	vm.xmGestionAseg = "XML_GESTION_ASEGURADOS_ACTUALIZADO";
	                    } else {
	                    	vm.xmGestionAseg = "XML_GESTION_ASEGURADOS_SELECCIONADO";
	                    }
	                    break;
	                case 'ALTA_ASEGURADO':
	                    vm.tipoSolicitud = value;
	                    vm.observaciones = value.XML_OBSERVACIONES;
	                    break;
                    case 'ALTA_BENEFICIARIO':
                        vm.tipoSolicitud = value.XML_ALTA_BENEFICIARIO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'ALTA_POLIZA':
                        vm.tipoSolicitud = key;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'BAJA_ASEGURADO':
                        vm.tipoSolicitud = value.XML_BAJA_ASEGURADO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        vm.concatenado = vm.tipoSolicitud.XML_ASEGURADO_SELECCIONADO.NO_NOMBRE_COMPLETO + ' (' + vm.tipoSolicitud.XML_ASEGURADO_SELECCIONADO.NU_DOCUMENTO + ')';
                        break;
                    case 'BAJA_BENEFICIARIO':
                        vm.tipoSolicitud = value.XML_BAJA_BENEFICIARIO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'BAJA_POLIZA':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_DATOS_ASEGURADO':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_DATOS_BENEFICIARIO':
                        vm.tipoSolicitud = value.CAMBIO_DATOS_BENEFICIARIO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_DOMICILIO':
                        vm.observaciones = value.XML_OBSERVACIONES;
                        vm.tipoSolicitud = value.XML_CAMBIO_DOMICILIO;
                        if(vm.tipoSolicitud.XML_DOMICILIO_ACTUALIZADO.DS_TIPO_VIA == undefined) {
                            var idVia = vm.tipoSolicitud.XML_DOMICILIO_ACTUALIZADO.ID_TIPO_VIA;
                            HogarService.getTiposVia({})
                            .then(function successCallback(response) {
                                if(response.status == 200){
                                    vm.tiposVia = response.data.TIPO_VIA;
                                    for(var i = 0; i < vm.tiposVia.length; i++) {
                                        if(idVia == vm.tiposVia[i].ID_TIPO_VIA) {
                                            vm.tipoSolicitud.XML_DOMICILIO_ACTUALIZADO.DS_TIPO_VIA = vm.tiposVia[i].DS_TIPO_VIA;
                                            break;
                                        }
                                    }
                                }
                            }, function callBack(response){
                            });
                        }
                        break;
                    case 'CAMBIO_CUENTA_BANCARIA':
                    case 'CUENTA_BANCARIA':
                        vm.observaciones = value.XML_OBSERVACIONES;
                        vm.tipoSolicitud = value.XML_CAMBIO_CUENTA_BANCARIA;
                        angular.forEach(vm.tipoSolicitud, function (value, key) {
                            if (key == 'XML_CUENTA_BANCARIA_SELECCIONADA' || key == 'XML_CUENTA_BANCARIA_ACTUALIZADA') {
                                if (typeof (vm.tipoSolicitud[key].CO_IBAN) == 'undefined') {
                                    cuenta = vm.tipoSolicitud[key].CO_BANCO +
                                        vm.tipoSolicitud[key].NO_SUCURSAL +
                                        vm.tipoSolicitud[key].NU_DC +
                                        vm.tipoSolicitud[key].NU_CUENTA;
                                    vm.tipoSolicitud[key].CO_IBAN = vm.calculoIban(cuenta);
                                }
                            }

                        });

                        break;
                    case 'CAMBIO_OTROS_DATOS_POLIZA':
                        vm.tipoSolicitud = value.XML_CAMBIO_POLIZA;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_PROPIETARIO':
                        vm.tipoSolicitud = value.XML_CAMBIO_PROPIETARIO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_RIESGO':
                        vm.tipoSolicitud = value.XML_CAMBIO_RIESGO;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'MODIFICACION_SEGUNDO_CONDUCTOR':
                        vm.tipoSolicitud = value.XML_CAMBIO_SEGUNDO_CONDUCTOR;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'MODIFICACION_CAPITALES':
                    	vm.observaciones = value.XML_OBSERVACIONES;
                    	vm.tipoSolicitud = value;
                    	if(vm.tipoSolicitud.GARANTIAS != undefined && vm.tipoSolicitud.GARANTIAS.length > 0){
							vm.garantiasIntroducidas = vm.tipoSolicitud.GARANTIAS;
						}
                    	
                    	break;
                    case 'MODIFICACION_GARANTIAS':
                        vm.observaciones = value.XML_OBSERVACIONES;
                        vm.tipoSolicitud = value.XML_MODIFICACION_GARANTIAS;

                    	if(vm.garantiasTotales == 0 && vm.tipoSolicitud != null && vm.tipoSolicitud.XML_GARANTIAS_INCLUIDAS != null){
                        	for(var i=0; i<vm.tipoSolicitud.XML_GARANTIAS_INCLUIDAS.length; i++){
                            	vm.garantiasTotales.push(vm.tipoSolicitud.XML_GARANTIAS_INCLUIDAS[i]);     	
                            }
                             for(var i=0; i<vm.tipoSolicitud.XML_GARANTIAS_MODIFICADAS.length; i++){
                            	vm.garantiasTotales.push(vm.tipoSolicitud.XML_GARANTIAS_MODIFICADAS[i]);                     	
                            }
                    	}
                    	vm.gridModificacion.data = vm.garantiasTotales;
                    
                  
                        break;
                    case 'CAMBIO_TOMADOR':
                        vm.tipoSolicitud = value.XML_CAMBIO_TOMADOR;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'RENOVAR_POLIZA':
                        vm.tipoSolicitud = value.RENOVAR_POLIZA;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_PRIMA':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'CAMBIO_DATOS_TOMADOR':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'MODIF_DATOS_RIESGO':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
                    case 'MODIF_GARANTIAS':
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
                        break;
					case 'MODIFICACION_POLIZA_PERIODO_VIGENCIA':
						vm.tipoSolicitud = value;
						vm.observaciones = value.XML_OBSERVACIONES;
						break;
					case 'MODIFICACION_GARANTIAS_PERIODO_VIGENCIA':
						vm.tipoSolicitud = value;
						vm.observaciones = value.XML_OBSERVACIONES;
						break;	
					case 'MODIFICACION_DATOS_RIESGO_PERIODO_VIGENCIA':
						vm.tipoSolicitud = value;
						vm.observaciones = value.XML_OBSERVACIONES;
						break;	
					case 'GESTION_ASEGURADOS_PERIODO_VIGENCIA':
						vm.tipoSolicitud = value;
						vm.observaciones = value.XML_OBSERVACIONES;
						break;
                    case 'RENOVACION_POLIZA': 
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
						break;
					case 'CAMBIO_CORREDOR': 
                        vm.tipoSolicitud = value;
                        vm.observaciones = value.XML_OBSERVACIONES;
						break;
                    case 'BBVA_MODCOBERTURAS':
	            	  vm.tarifa = JSON.parse(vm.datos.JS_RESPUESTA);
	            	  vm.datosSol = JSON.parse(vm.datos.JS_ENVIADO);
	            	  vm.observaciones = value.XML_OBSERVACIONES;
	            	  
	            	  if(vm.datosSol.BBVA_MODCOBERTURAS != undefined && vm.datosSol.BBVA_MODCOBERTURAS.garantias != undefined 
	              			  && vm.datosSol.BBVA_MODCOBERTURAS.garantias.length > 0){
	                		  vm.lstGarantias = vm.datosSol.BBVA_MODCOBERTURAS.garantias;
	            	  }  
	            	              	  
	             	 if(vm.observaciones == undefined)
	            		 vm.observaciones = vm.parent.datos.XML_OBSERVACIONES;
	             	 
	            	 if(vm.datosSol.BBVA_MODCOBERTURAS.list_ARCHIVOS != undefined && vm.datosSol.BBVA_MODCOBERTURAS.list_ARCHIVOS.length > 0)
	            	 	vm.listaArchivos = vm.datosSol.BBVA_MODCOBERTURAS.list_ARCHIVOS;
	            	 
                    default:
                        break;
                }

            });

            angular.forEach(vm.tipoSolicitud, function (value, key) {
                if (key == 'FD_CARNET' || key == 'FD_NACIMIENTO') {
                    if (vm.tipoSolicitud[key] != null) {
                        vm.tipoSolicitud[key] = new Date(vm.tipoSolicitud[key].substr(0, 10));
                    }
                }

            });


            angular.forEach(vm.datos, function (value, key) {
                vm.form[key] = {};
                if (key == "FT_USU_ALTA" || key == "FD_VALIDACION" || key == "FD_CONFIRMACION" || key == "FD_CIERRE" || key == "FD_ENTRADA") {
                    fecha = vm.datos[key];
                    var n2 = vm.datos[key].indexOf(':');
                    values = fecha.substring(0, n2 != -1 ? n2 - 3 : fecha.length);
                    vm.form[key].value = new Date(values);
                } else
                    vm.form[key].value = vm.datos[key];
            });
            
        }

        this.loadTemplate = function () {
        	var idTipoSolicitud = '';
        	if(vm.parent.datos != undefined){
        		if(vm.parent.datos.OTIPO_SOLICITUD != undefined){
        			idTipoSolicitud = vm.parent.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD;
        		}
        	}
        	if(vm.parent.parent.url === 'renting' || idTipoSolicitud == 28){
                return BASE_SRC + "detalle/detalles.views/detalle.solicitud-renting.html";
        	}else{
                return BASE_SRC + "detalle/detalles.views/detalle.solicitud.html";
        	}
        }

        //Grid Modificacion garantias
        vm.gridModificacion = {
            paginationPageSizes: [5, 10, 15],
            paginationPageSize: 5,
            reeRowHeaderAlwaysVisible: true,
            columnDefs: [{
                field: 'NO_GARANTIA',
                displayName: 'Nombre',
                width: '50%',
            },
            {
                field: 'NU_CAPITAL',
                displayName: 'Capital'
            }]
        }

        //Modal Reasignar
        vm.reasignar = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/reasignar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this
                    md.gestores = vm.tipos.gestores;
                    md.datos = vm.datos;
                    md.perfil = JSON.parse($window.sessionStorage.perfil);
                    md.usuarioReceptor = '';

                    md.reasignarSolicitud = function () {
                        md.datos.CO_USU_RECEPTOR = md.usuarioReceptor;
                        var reasignacion = SolicitudService.getReasignarSolicitud(md.datos);

                        reasignacion.then(function successCallback(response) {
                            if (response.status == 200) {
                                alerta = $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Reasignación correcta')
                                    .textContent('Reasignado a: ' + md.datos.NO_USU_RECEPTOR)
                                    .ok('Cerrar');
                                $mdDialog.show(alerta);
                            }
                        });
                        $mdDialog.cancel();
                    }
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                }]
            });
        }


        //Modal Rechazar
        vm.rechazoSolicitud = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/rechazarSolicitud.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    md = this
                    md.datos = vm.datos;
					md.observaciones = vm.observaciones;
					md.motivosRechazo = vm.motivosRechazo;
                    md.perfil = JSON.parse($window.sessionStorage.perfil);
					
                    md.rechazarSolicitud = function () {
                        var rechazo = SolicitudService.getRechazarSolicitud(md.datos);
                        md.datos.CO_USU_RECEPTOR = md.perfil.usuario;
                        rechazo.then(function successCallback(response) {
                            if (response.status == 200) {
                            	if (response.data.ID_RESULT == 0) {
									alerta = $mdDialog.alert()
										.clickOutsideToClose(true)
										.title('Solicitud rechazada')
										.textContent('La solicitud ha sido modificada correctamente')
										.ok('Cerrar');
									$mdDialog.show(alerta);
	                            	vm.datos = response.data;
                            	} else {
                            		alerta = $mdDialog.alert()
										.clickOutsideToClose(true)
										.title('Error al rechazar solicitud')
										.textContent(response.data.DS_RESULT)
										.ok('Cerrar');
									$mdDialog.show(alerta);
                            	}
                            }
                        });
                        $mdDialog.cancel();
                    }
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                }]
            });
        }
        
      	// recuperar documentación ya subida (desde padre)
        vm.getDocuments = function(){
			if(vm.parent.datos.ID_SOLICITUD) {
				FicherosService.getFicherosType({'ID_TIPO': 222, 'NO_RUTA': `solicitudes/${vm.parent.datos.ID_SOLICITUD}`})
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0 && response.data.RESULT) {
							vm.listaArchivos = response.data.RESULT;
						}
					}
				},function errorCallback(response){
					if(response.status == 406 || response.status == 401){
						vm.busqueda.logout();
					}
				});
			}
        }
       
        //meter desde lista padre los documentos recuperados
  		vm.refreshList =  function() {	
  			if(vm.appParent.archives_solicitudes != null){
  				for(var i = 0; i < vm.appParent.archives_solicitudes.length; i++)  {
  					if(!vm.listaArchivos.find( archivo => archivo.ID_ARCHIVO === vm.appParent.archives_solicitudes[i].ID_ARCHIVO))
  						vm.listaArchivos.push(vm.appParent.archives_solicitudes[i]);
  					else
  						break;
  				}
  			}
  		}   

     	//ficheros adjuntos
    	$(document).on('change', '#file_pol', function(e) {
			if(e) {
				vm.idSolicitud = vm.datos.ID_SOLICITUD;
				$scope.$apply();
				if(document.getElementById('file_pol').files[0] != null){
					var f = document.getElementById('file_pol').files[0];
					vm.getBase64(f, 222, vm.refData);
				}
			}
		});

    	vm.refData = function(){
     	   for(var i = 0; i < vm.appParent.listArchivos.length; i++)  {
 				if(!vm.listaArchivos.find( archivo => archivo.NO_ARCHIVO === vm.appParent.listArchivos[i].NO_ARCHIVO))
 					vm.listaArchivos.push(vm.appParent.listArchivos[i]);
 				else
 					break;
 			}
			$scope.$apply();
 	   }
    	
    	vm.getBase64 = function(file, idArchivo, funcRefresh){
			var reader = new FileReader();
			var existe = false;
			vm.idArchivo = idArchivo;
			vm.archivo = {};
			
			if(file != undefined && file != undefined){
				nam = file.name;
				phrase = nam.split('.');
	        	nameA = phrase[0];
	        	extension = phrase[1];
	        	name = vm.changeSpecialCharacters(nameA);
	        	archivoName =  name +"."+ extension;
	        	reader.readAsDataURL(file);
						
	       
	        reader.onload = function(){
	        	if(Object.keys(vm.archivo).length === 0){	
				
					var base64 = reader.result.split("base64,")[1];
					var binary_string = window.atob(base64);
				    var len = binary_string.length;
				    var bytes = [];
				    for (var i = 0; i < len; i++) {
				        bytes.push(binary_string.charCodeAt(i));
				    }
					    
				   vm.archivo = {	
				    	"DESCARGAR": false,
			        	"ARCHIVO": bytes,
						"ID_TIPO": vm.idArchivo,
						"NO_ARCHIVO": archivoName,
						'ESTADO': 'Pendiente'
			       };
                    vm.listaArchivos.push(vm.archivo);
				   
			    	if (funcRefresh != null) {
				    	funcRefresh();
			    	}
				}
	 		    $scope.$apply();
			}
		}
      }
    	
    	vm.changeSpecialCharacters = (function(name){
        	             	
        	 var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
             to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
             mapping = {};
        
         for(var i = 0, j = from.length; i < j; i++ )
             mapping[ from.charAt( i ) ] = to.charAt( i );
        
	         return function( str ) {
	             var ret = [];
	             for( var i = 0, j = str.length; i < j; i++ ) {
	                 var c = str.charAt( i );
	                 if( mapping.hasOwnProperty( str.charAt( i ) ) )
	                     ret.push( mapping[ c ] );
	                 else
	                     ret.push( c );
	             }      
	            nameF =  ret.join( '' ).replace( /[^-A-Za-z0-9]+/g, '_' ).toLowerCase();
	            return  nameF;
	         }
        })();

    	//enviar documentación
		vm.uploadFiles = function(listaArchivos, tipo, id, funcRef){
			obj = {};
			obj.LIST_ARCHIVOS = [];
			for(let i = 0; i < listaArchivos.length; i++) {
				if(!listaArchivos[i].ESTADO) {
					obj.LIST_ARCHIVOS.push(listaArchivos[i]);
				}
			}
			obj.ID_SOLICITUD =  id;
				
			if(obj.LIST_ARCHIVOS != null &&  obj.LIST_ARCHIVOS != undefined) {
				
				vm.appParent.abrirModalcargar(true);
				
				FicherosService.sendDocumentation(obj, tipo)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							msg.textContent("Se ha enviado la documentación correctamente");
							$mdDialog.show(msg);
							// vm.listaArchivos = response.data.LIST_ARCHIVOS;
							vm.filesToUpload = false;
							vm.getDocuments();
						}else{
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
				},function errorCallback(response){
	                if(response.status == 406 || response.status == 401){
	                	vm.busqueda.logout();
	                }
					msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
					$mdDialog.show(msg);
	        	});
			}else{
				msg.textContent('Debes seleccionar al menos un archivo para subir.');
				$mdDialog.show(msg);
			}
		}

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
								'NO_ARCHIVO': CommonUtils.checkFileName(oFile.name),
								'DESCARGAR': false
							};
							vm.filesToUpload = true;
							$scope.$apply(function() {
								vm.listaArchivos.push(file);
							});
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
		}

		vm.descargarArchivo = function (file) {
            ExportService.downloadFile(file.ID_ARCHIVO)
            .then(function successCallback(response) {
                if (response.status === 200) {
                    let utf8decoder = new TextDecoder();
					var responseData = utf8decoder.decode(response.data);
					if(typeof responseData === 'string' && responseData.indexOf('ID_RESULT') !== -1) {
						var objResponse = JSON.parse(responseData);
						if(objResponse.ID_RESULT != null && objResponse.ID_RESULT != 0) {
							msg.textContent(objResponse.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						saveAs(new Blob([response.data]), file.NO_ARCHIVO);
					}		
                }
            }, function callBack(response){
                vm.msg.textContent("Se ha producido un error al descargar el archivo");
                $mdDialog.show(vm.msg);
                if(response.status == 406 || response.status == 401) {
                    vm.appParent.logout();
                }
            });
        };

        vm.deleteFile = function(file, index) {
			if(!file.ESTADO) {
				vm.listaArchivos.splice(index, 1);
			} else {
				if(file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined) {
					vm.appParent.deleteArchive(file.ID_ARCHIVO);
					vm.getDocuments();
				}
			}
		}

        //Rechazar Solicitud
        vm.rechazarSolicitud = function (form) {
            angular.forEach(form, function (value, key) {
                form[key].value = undefined;
            });
            return form;
        }

        //Calculo IBAN
        vm.calculoIban = function (form) {

            cifras = form + "142800"; //Iban España
            var CUENTA = 10;
            var largo = cifras.length;
            var resto = 0;
            for (var i = 0; i < largo; i += CUENTA) {
                var dividendo = resto + "" + cifras.substr(i, CUENTA);
                resto = dividendo % 97;
            }
            cc = 98 - resto;
            if (cc < 2) {
                iban = 'ES' + '0' + cc + form;
            } else {
                iban = 'ES' + cc + form;
            }
            return iban;
        }

        vm.validarSolicitud = function() {
        	if(vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 6 && (vm.datos.OPOLIZA.ID_COMPANIA == 111 || vm.datos.OPOLIZA.ID_COMPANIA == 78)){
        		
        		var obj = {
        			SOLICITUD: 	vm.datos,
        			PRESUPUESTO: vm.datos.PRESUPUESTO
        		}
        		obj.SOLICITUD.MODIFICACION_GARANTIAS = obj.SOLICITUD.TIPO_SOLICITUD;
        		obj.SOLICITUD.TIPO_SOLICITUD=null;

        		if(obj.SOLICITUD.XM_ENVIADO != undefined){
        			delete obj.SOLICITUD.XM_ENVIADO;
        		}
        		
        		var cambioCapitales = false;
        		if (obj.SOLICITUD.OPOLIZA != null && obj.SOLICITUD.OPOLIZA.ID_COMPANIA == 78) {
        			cambioCapitales = JSON.stringify(vm.blockCapitales) != JSON.stringify(obj.PRESUPUESTO.PRESUPUESTO.HOGAR.BLOCK_CAPITALES);
        		}
        		
        		//Llamada a servicio
        		vm.appParent.abrirModalcargar(true);
    			PolizaService.tarifica(obj, cambioCapitales)
    			.then(function successCallback(response){
    				if(response.data != undefined){
    					vm.datos = JSON.parse(JSON.stringify(response.data.SOLICITUD));
    					vm.datos.PRESUPUESTO = JSON.parse(JSON.stringify(response.data.PRESUPUESTO));
    					
    					if(response.data.ID_RESULT == 0 && response.data.PRESUPUESTO != undefined && response.data.PRESUPUESTO.MODALIDADES != undefined && response.data.PRESUPUESTO.MODALIDADES.MODALIDAD){
    						//Recogemos la lista de modalidades
    						vm.listModalidades = JSON.parse(JSON.stringify(response.data.PRESUPUESTO.MODALIDADES.MODALIDAD));
        					vm.appParent.cambiarDatosModal('Solicitud gestionada correctamente');
    					} else {
        					vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
    					}
    				}
    				
    				vm.carga = false;
    			})
    			.catch(function errorCallback(error){
    				vm.appParent.cambiarDatosModal('Ha ocurrido un error al gestionar la solicitud');
    			});
        	} else if(vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 3) {
                if(vm.datos.OPOLIZA.NU_POLIZA == undefined) {
                    vm.msg.textContent('El número de póliza es obligatorio');
                    $mdDialog.show(vm.msg);
                } else {
 
                    vm.gestionarSolicitud();
                }
            } else {
                vm.gestionarSolicitud();
            }
        }

        vm.gestionarSolicitud = function() {
            var tipoGestion = undefined;
            if(vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 28) {
                tipoGestion = 'modificarSolicitud';
            } else {
                tipoGestion = 'gestionar'
            }

            if(tipoGestion != undefined) {

                if(vm.listaArchivos != undefined && vm.listaArchivos.length > 0) {
                    vm.datos.LIST_ARCHIVOS = vm.listaArchivos;
                }
                if(vm.datos.XM_ENVIADO != null && vm.datos.XM_ENVIADO != undefined){
                	delete vm.datos.XM_ENVIADO;
                }

				vm.appParent.abrirModalcargar(true);
                SolicitudService.gestionarSolicitud(vm.datos, tipoGestion)
                .then(function successCallBack(response) {
                    if(response.status == 200) {
                    	if(response.data.ID_RESULT == 0){      
                            vm.datos = response.data;
                            if(vm.busquedaSolicitudes != null && vm.busquedaSolicitudes.gridOptions.data != undefined){
                                var listSolicitudes = vm.busquedaSolicitudes.gridOptions.data;
                                for(var i = 0; i < listSolicitudes.length; i++){
                                    if(listSolicitudes[i].ID_SOLICITUD === response.data.ID_SOLICITUD){
                                        listSolicitudes[i] = response.data;
                                        break;
                                    }
                                }
                            }
//						vm.appParent.cambiarDatosModal('Solicitud gestionada correctamente');
                            vm.msg.textContent("Solicitud gestionada correctamente")
    					    $mdDialog.show(vm.msg);
							vm.getDocuments();
							
						}else if(response.data.ID_RESULT == 2709){
						
							vm.datos = response.data;
                            if(vm.busquedaSolicitudes != null && vm.busquedaSolicitudes.gridOptions.data != undefined){
                                var listSolicitudes = vm.busquedaSolicitudes.gridOptions.data;
                                for(var i = 0; i < listSolicitudes.length; i++){
                                    if(listSolicitudes[i].ID_SOLICITUD === response.data.ID_SOLICITUD){
                                        listSolicitudes[i] = response.data;
                                        break;
                                    }
                                }
                            }
							vm.msg.textContent(response.data.DS_RESULT);
    					    $mdDialog.show(vm.msg);	
							
                    	}else {
//                   	vm.appParent.cambiarDatosModal('Se ha producido un error al gestionar la solicitud. Contacte con el administrador');
                    	vm.msg.textContent(response.data.DS_RESULT)
                    	$mdDialog.show(vm.msg);
                    	}
                    }
                }, function errorCallback(response){
					vm.appParent.cambiarDatosModal('Se ha producido un error al gestionar la solicitud, póngase en contacto con un administrador');
        		});
            }
        }
        
        vm.mostrarPrecio = function(tipo){
        	var formaPago = vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO;
        	var modalidad = null;
        	
        	if(vm.datos.PRESUPUESTO != undefined && vm.datos.PRESUPUESTO.MODALIDADES != undefined && vm.datos.PRESUPUESTO.MODALIDADES.MODALIDAD != undefined){
        		for(var i = 0; i < vm.datos.PRESUPUESTO.MODALIDADES.MODALIDAD.length; i++){
        			if(vm.datos.PRESUPUESTO.MODALIDADES.MODALIDAD[i].NO_MODALIDAD == tipo && formaPago == vm.datos.PRESUPUESTO.MODALIDADES.MODALIDAD[i].ID_FORMAPAGO){
        				modalidad = vm.datos.PRESUPUESTO.MODALIDADES.MODALIDAD[i];
        				break;
        			}
        		}
        	}
        	
        	if(modalidad != null){
        		return modalidad.IM_PRIMA_ANUAL_TOT;
        	} else {
        		return 0;
        	}
        }
        
        vm.seleccionarModalidad = function(tipo){
        	$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/modalidad.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog','AseguradoraService','TiposService','PolizaService', function ($mdDialog, AseguradoraService, TiposService) {
                    var md = this;
                    md.tipos = {};
                    md.datos = JSON.parse(JSON.stringify(vm.datos));
                    
                    md.modalidad = null;
                    md.precioAnual = 0;
                    md.precioSemestral = 0;
                    md.precioTrimestral = 0;
                    md.nombreModalidad = "";
                    md.tipo = tipo;
                    
                    this.$onInit = function (bindings) {
                        md.listaModalidades = JSON.parse(JSON.stringify(md.datos.PRESUPUESTO.MODALIDADES.MODALIDAD));
                        var isAsis = false;
                    	var asisGarantia = null;
                    	var isProt = false;
                    	var protGarantia = null;
                        
                        for(var i = 0; i < md.listaModalidades.length; i++){
                        	if(md.listaModalidades[i].NO_MODALIDAD == tipo && md.listaModalidades[i].ID_FORMAPAGO == vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO){
                        		md.modalidad = md.listaModalidades[i];
                        		break;
                        	}
                        }
                        
                        if(md.modalidad.LIST_GARANTIA != null){
                    		for(var i = 0; i < md.modalidad.LIST_GARANTIA.length; i++){
                    			if(md.modalidad.LIST_GARANTIA[i].CO_COBERTURA == "AUR"){
                    				asisGarantia = md.modalidad.LIST_GARANTIA[i];
                    				md.asisUrgHogar = md.modalidad.LIST_GARANTIA[i].IN_SELECTED;
                    			}
                    			if(md.modalidad.LIST_GARANTIA[i].CO_COBERTURA == "PJV"){
                    				protGarantia = md.modalidad.LIST_GARANTIA[i];
                    				md.protJurVivienda = md.modalidad.LIST_GARANTIA[i].IN_SELECTED;
                    			}
                    		}
                    	}

                    	if(asisGarantia == null){
                    		md.asisUrgHogar = false;
                    	}
                    	
                    	if(protGarantia == null){
                    		md.protJurVivienda = false;
                    	}
                    	
                    	md.nombreModalidad = md.modalidad.NO_MODALIDAD;
                        
                        md.getPrecios(md.modalidad.NO_MODALIDAD, md.modalidad.ID_FORMAPAGO);
                    }
                    
                    md.getPrecios = function(tipo, formaPago){
                    	var modalidadAnual = null;
                    	var modalidadSemestral = null;
                    	var modalidadTrimestral = null;
                    	
                    	for(var i = 0; i < md.listaModalidades.length; i++){
                    		if(md.listaModalidades[i].NO_MODALIDAD == tipo){
                    			if(md.listaModalidades[i].ID_FORMAPAGO == '2'){
                    				modalidadAnual = md.listaModalidades[i];
                    			} else if(md.listaModalidades[i].ID_FORMAPAGO == '3'){
                    				modalidadSemestral = md.listaModalidades[i];
                    			} else if(md.listaModalidades[i].ID_FORMAPAGO == '5'){
                    				modalidadTrimestral = md.listaModalidades[i];
                    			}
                    		}
                    	}
                    	
                    	md.precioAnual = modalidadAnual.IM_PRIMA_ANUAL_TOT - md.modalidad.IM_PRIMA_ANUAL_TOT;
                        md.precioSemestral = modalidadSemestral.IM_PRIMA_ANUAL_TOT - md.modalidad.IM_PRIMA_ANUAL_TOT;
                        md.precioTrimestral = modalidadTrimestral.IM_PRIMA_ANUAL_TOT - md.modalidad.IM_PRIMA_ANUAL_TOT;
                    }
                    
                    md.recalcular = function(){
                    	md.cargaRecalcular = true;
                    	var obj = {
                			SOLICITUD: 	vm.datos,
                			PRESUPUESTO: vm.datos.PRESUPUESTO
                		}
                    	
                    	obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD = md.modalidad;

                    	if(obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD.GARANTIAS != undefined && obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD.GARANTIAS.GARANTIA != undefined){
                        	if(md.asisUrgHogar == true){
                        		obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD.GARANTIAS.GARANTIA.push({
                        			NO_GARANTIA: "Asistencia Urgente",
                    				IN_OPCIONAL: true,
                    				IN_SELECTED: true,
                    				CO_COBERTURA: "AUR"
                        		});
                        	}
                        	
                        	if(md.protJurVivienda == true){
                    			obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD.GARANTIAS.GARANTIA.push({
                    				NO_GARANTIA: "Protección Jurídica de la Vivienda",
                					IN_OPCIONAL: true,
                					IN_SELECTED: true,
                					CO_COBERTURA: "PJV"
                        		});
                        	}
                    	}
                    	
                    	PolizaService.tarifica(obj, false)
            			.then(function successCallback(response){
            				if(response.data != undefined){
            					vm.datos = JSON.parse(JSON.stringify(response.data.SOLICITUD));
            					vm.datos.PRESUPUESTO = JSON.parse(JSON.stringify(response.data.PRESUPUESTO));
            					md.datos = JSON.parse(JSON.stringify(vm.datos));
            					md.listaModalidades = JSON.parse(JSON.stringify(md.datos.PRESUPUESTO.MODALIDADES.MODALIDAD));
                                
                                for(var i = 0; i < md.listaModalidades.length; i++){
                                	if(md.listaModalidades[i].NO_MODALIDAD == md.tipo && md.listaModalidades[i].ID_FORMAPAGO == vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO){
                                		md.modalidad = md.listaModalidades[i];
                                		break;
                                	}
                                }
                                
                                md.getPrecios(md.modalidad.NO_MODALIDAD, vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO);

            				}
            				
            				md.cargaRecalcular = false;
            			})
            			.catch(function errorCallback(error){
            				md.cargaRecalcular = false;
            			});
                    	
                    }
                    
                    md.reemplazarPoliza = function(){
                		md.cargaRecalcular = true;
                    	
                    	var obj = {
                			SOLICITUD: 	vm.datos,
                			PRESUPUESTO: vm.datos.PRESUPUESTO
                		}

                		if (obj.PRESUPUESTO != null && obj.PRESUPUESTO.MODALIDADES != null && obj.PRESUPUESTO.MODALIDADES.MODALIDAD != null) {
                			var modalidades = obj.PRESUPUESTO.MODALIDADES.MODALIDAD;
                			for (var i = 0; i < modalidades.length; i++) {
                				if (modalidades[i].LIST_GARANTIA != null) {
                					modalidades[i].GARANTIAS = {
                						GARANTIA: modalidades[i].LIST_GARANTIA
                					}
                					delete modalidades[i].LIST_GARANTIA;
                				}
                			}
                		}

                		if (obj.SOLICITUD != null && obj.SOLICITUD.ORECIBO != null) {
                            delete obj.SOLICITUD.ORECIBO;
                		}

                		if (obj.SOLICITUD != null && obj.SOLICITUD.TIPO_SOLICITUD != null) {
                            delete obj.SOLICITUD.TIPO_SOLICITUD;
                		}
                		
                    	obj.PRESUPUESTO.ID_RAMO = 20;
                    	obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD = md.modalidad;
                    	
                    	PolizaService.reemplazo(obj, false)
            			.then(function successCallback(response){
            				vm.appParent.abrirModalcargar(true);
            				if(response.data != undefined && response.data.ID_RESULT == 0){
            					vm.datos = response.data.SOLICITUD;
            					var nuevaPoliza = "";
            					var msg = "";
            					if(response.data.SOLICITUD != null && response.data.SOLICITUD.OPOLIZA != null && response.data.SOLICITUD.OPOLIZA.NU_POLIZA != null){
            						nuevaPoliza = response.data.SOLICITUD.OPOLIZA.NU_POLIZA;
            					}
            					
            					if(nuevaPoliza != ""){
            						msg = "Se ha transferido a la póliza " + nuevaPoliza;
            					} else {
            						msg = "Se ha reemplazado correctamente";
            					}
            					
            					vm.appParent.cambiarDatosModal(msg);
            				} else {
            					vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
            				}
            				md.cargaRecalcular = false;
            			})
            			.catch(function errorCallback(error){
            				md.cargaRecalcular = false;
            				vm.appParent.cambiarDatosModal('Ha ocurrido un error con la solicitud');
            			});
                    }
                    
                    md.changeFormaPago= function(formaPago){
                    	for(var i = 0; i < md.listaModalidades.length; i++){
                    		if(md.listaModalidades[i].NO_MODALIDAD == md.tipo && md.listaModalidades[i].ID_FORMAPAGO == formaPago){
                    			md.modalidad = md.listaModalidades[i];
                    			break;
                    		}
                    	}
                    	
                    	md.getPrecios(md.modalidad.NO_MODALIDAD, formaPago);
                    }
                    
                    md.tieneGarantias = function(){
                    	var isAsis = false;
                    	var asisGarantia = null;
                    	var isProt = false;
                    	var protGarantia = null;
                    	
                    	if(md.modalidad.GARANTIAS != undefined && md.modalidad.GARANTIAS.GARANTIA != undefined){
                    		for(var i = 0; i < md.modalidad.GARANTIAS.GARANTIA.length; i++){
                    			if(md.modalidad.GARANTIAS.GARANTIA[i].CO_COBERTURA == "AUR"){
                    				asisGarantia = md.modalidad.GARANTIAS.GARANTIA[i];
                    				isAsis = md.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                    			}
                    			if(md.modalidad.GARANTIAS.GARANTIA[i].CO_COBERTURA == "PJV"){
                    				protGarantia = md.modalidad.GARANTIAS.GARANTIA[i];
                    				isProt = md.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                    			}
                    		}
                    	}
                    	
                    	if(asisGarantia == null){
                    		isAsis = false;
                    	}
                    	
                    	if(protGarantia == null){
                    		isProt = false;
                    	}
                    	
                    	if(md.asisUrgHogar != isAsis || md.protJurVivienda != isProt){
                    		return true;
                    	} else {
                    		return false;
                    	}
                    	
                    }
                    
                    md.toFixed = function(value){
                		value = value.toFixed(2);
                		return parseFloat(value);
                	}
                    
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                }]				 
            });
        }
        
        
        vm.seleccionarModalidadBBVA = function(modalidad){
        	$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/modalidadBBVA.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog','AseguradoraService','TiposService','PolizaService', function ($mdDialog, AseguradoraService, TiposService) {
                    var md = this;
                    md.tipos = {};
                    md.datos = JSON.parse(JSON.stringify(vm.datos));
                    
                    md.modalidad = null;
                    md.precioAnual = 0;
                    md.precioSemestral = 0;
                    md.precioTrimestral = 0;
                    md.nombreModalidad = "";
                    
                    this.$onInit = function (bindings) {
                        md.listaModalidades = JSON.parse(JSON.stringify(md.datos.PRESUPUESTO.MODALIDADES.MODALIDAD));
                        md.modalidad = modalidad;
                        md.listGarantias = JSON.parse(JSON.stringify(modalidad.GARANTIAS.GARANTIA));
                    }
                    
                    //Función para mostrar la prima
                    md.showPrima = function(prima){
                    	
                    	if(prima == null || prima == undefined){
                    		prima = 0;
                    	}
                    	
                    	var importe = prima;
                    	
                    	//Recorrer lista guardada de garantías y comprobar cuáles eran las que se mostraban ()IN_sELECTED a false y IN_OPCIONAL a true
						for(var i = 0; i < md.listGarantias.length; i++){
                            if(md.listGarantias[i].IN_SELECTED == false && md.listGarantias[i].IN_OPCIONAL == true){
                            	for(var j = 0; j < md.modalidad.GARANTIAS.GARANTIA.length; j++){
                            		var garantia = md.modalidad.GARANTIAS.GARANTIA[j];
                            		if(garantia.ID_GARANTIA == md.listGarantias[i].ID_GARANTIA && garantia.IN_SELECTED == true){
                                        importe += garantia.IM_PRIMA_NETA;
                                        break;
                            		}
                            	}
                            }
						}
						
						return md.toFixed(importe);
                    }   
                    
                    //Recalcular tarifas
                    md.recalcular = function(formaPago){
                    	vm.datos.PRESUPUESTO.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO = formaPago;
                    	md.cargaRecalcular = true;
                    	var obj = {
                			SOLICITUD: 	vm.datos,
                			PRESUPUESTO: vm.datos.PRESUPUESTO
                		}
                    	
                    	obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD = md.modalidad;
                    	
                    	PolizaService.tarifica(obj, false)
            			.then(function successCallback(response){
            				if(response.data != undefined){
            					vm.datos = JSON.parse(JSON.stringify(response.data.SOLICITUD));
            					vm.datos.PRESUPUESTO = JSON.parse(JSON.stringify(response.data.PRESUPUESTO));
            					md.datos = JSON.parse(JSON.stringify(vm.datos));
            					md.listaModalidades = JSON.parse(JSON.stringify(md.datos.PRESUPUESTO.MODALIDADES.MODALIDAD));
                                
                                for(var i = 0; i < md.listaModalidades.length; i++){
                                	if(md.listaModalidades[i].ID_MODALIDAD == md.modalidad.ID_MODALIDAD){
                                		md.modalidad = md.listaModalidades[i];
                                		md.listGarantias = JSON.parse(JSON.stringify(md.listaModalidades[i].GARANTIAS.GARANTIA));
                                		break;
                                	}
                                }
                                
            				}
            				
            				md.cargaRecalcular = false;
            			})
            			.catch(function errorCallback(error){
            				md.cargaRecalcular = false;
            			});
                    	
                    }
                    
                    md.reemplazarPoliza = function(){
                    	md.cargaRecalcular = true;
                    	
                    	var obj = {
                			SOLICITUD: 	vm.datos,
                			PRESUPUESTO: vm.datos.PRESUPUESTO
                		}
                    	
                    	obj.PRESUPUESTO.PRESUPUESTO.MODALIDAD = md.modalidad;
                    	
                    	PolizaService.reemplazo(obj, false)
            			.then(function successCallback(response){
            				vm.appParent.abrirModalcargar(true);
            				if(response.data != undefined && response.data.ID_RESULT == 0){
            					vm.datos = response.data.SOLICITUD;
            					var nuevaPoliza = "";
            					var msg = "";
            					if(response.data.SOLICITUD != null && response.data.SOLICITUD.OPOLIZA != null && response.data.SOLICITUD.OPOLIZA.NU_POLIZA != null){
            						nuevaPoliza = response.data.SOLICITUD.OPOLIZA.NU_POLIZA;
            					}
            					
            					if(nuevaPoliza != ""){
            						msg = "Se ha transferido a la póliza " + nuevaPoliza;
            					} else {
            						msg = "Se ha reemplazado correctamente";
            					}
            					
            					vm.appParent.cambiarDatosModal(msg);
            				} else {
            					vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
            				}
            				md.cargaRecalcular = false;
            			})
            			.catch(function errorCallback(error){
            				md.cargaRecalcular = false;
            				vm.appParent.cambiarDatosModal('Ha ocurrido un error con la solicitud');
            			});
                    }
                    
                    md.toFixed = function(value){
                		value = value.toFixed(2);
                		return parseFloat(value);
                	}
                    
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                }]				 
            });
        }
        
        vm.comprobarGarantiaOpcional = function (idGarantia){
			if(vm.garantiasIntroducidas != undefined && vm.garantiasIntroducidas.length > 0)	{
				let garantiaIntroducida = vm.garantiasIntroducidas.find(data => data.ID_GARANTIA == idGarantia);
				if(garantiaIntroducida != undefined){
					return garantiaIntroducida.IN_SELECTED;
				}
			}
		}
        
		vm.enviarMailCliente = function() {
			SolicitudService.enviarMailCliente(vm.datos)
			.then(function successCallBack(response) {
				if(response.status == 200) {
					vm.abrirDialogo('Email enviado correctamente');
				} else {
					vm.abrirDialogo('Error al enviar el email');
				}
			})
		}

		vm.reenviarMailCia = function() {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/reenviar_mail_cia.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog','AseguradoraService','TiposService', function ($mdDialog, AseguradoraService, TiposService) {
                    var md = this;
                    md.tipos = {};
                    this.$onInit = function (bindings) {
                    	if(vm.datos != null && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.ID_COMPANIA != null){
                            AseguradoraService.getContactosByAseguradoraRamo(vm.datos.OPOLIZA.ID_COMPANIA,vm.datos.OPOLIZA.ID_RAMO)
							.then(function successCallback(response) {
								if (response.status == 200) {
									vm.tipos.estadoSolicitud = response.data.LISTA_CONTACTOS;
									md.gridMails.data = vm.tipos.estadoSolicitud;
								}
							}, function callBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.appParent.logout();
								}
							});
                    	}
                    	
                    	TiposService.getCompania({})
            			.then(function successCallback(response){
            				if(response.status == 200){
            					md.listCompanias = response.data.TIPOS.TIPO;
            					
            					for(var j = 0; j < md.listCompanias.length; j++){
            						md.listCompanias[j].id = md.listCompanias[j].NO_COMPANIA;
            					}
            					if(md.gridMails.data != undefined){
            						for(var i = 0; i < md.gridMails.data.length; i++){
            							md.gridMails.data[i].companias = md.listCompanias;
            						}
            					}
            				}
            			}, function callBack(response){
            				if(response.status == 406 || response.status == 401){
                            	vm.appParent.logout();
                            }
            			});
                    	
                    }
                    
                    this.$onChanges = function(){
                		if(md.gridMails.data != undefined){
            				for(var i = 0; i < md.gridMails.data.length; i++){
            					md.gridMails.data[i].companias = md.listCompanias;
            				}
            			}
                	}
                    
                    this.$doCheck = function(){
                		if(md.gridApi != undefined){
                			md.gridApi.core.resfresh;
                		}
                	}
                    
                    md.cargar = true;
                    md.colModificado = {};
                    //UI.GRID Configurado
                    md.gridMails = {
                        enableSorting: true,
                        enableHorizontalScrollbar: 0,
                        paginationPageSizes: [15, 30, 50],
                        paginationPageSize: 30,
                        treeRowHeaderAlwaysVisible: true,
                        enableRowSelection: true,
                        enableSelectAll: true,
                        selectionRowHeaderWidth: 29,
                        paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                        data: [],
                        columnDefs: [
                            {field: 'NO_EMAIL', displayName: 'Mail'},
                            {field: 'NO_COMPANIA', displayName: 'Compañía', editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'NO_COMPANIA', editDropdownRowEntityOptionsArrayPath: 'companias', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_COMPANIA]">{{row.entity.NO_COMPANIA}}</div>'}
                        ]
                    };
                                       
                    md.seleccionable = function(fila) {
                        return true;
                    }
                    md.gridMails.onRegisterApi = function (gridApi) {
                        md.gridApi = gridApi;
                        md.listaSeleccionados = [];
                        gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
                            md.elementoSeleccionado = fila.entity;
                            md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
                        });
                        gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
                            md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
                        });
                        
                        md.gridApi.edit.on.afterCellEdit(null, function (rowEntity, colDef, newValue, oldValue) {
                            if(newValue != oldValue) {
                                if(!rowEntity.IS_NEW) {
                                    rowEntity.IS_UPDATED = true;
                                }
                                if (colDef.field == 'NO_EMAIL') {
                                }
                                
                                if(colDef.field == "NO_COMPANIA"){
                                	rowEntity.ID_COMPANIA = _.find(md.listCompanias, {'NO_COMPANIA':rowEntity.NO_COMPANIA}).ID_COMPANIA;
                                }
                                
                            }
                        });
                    }
                    md.addMail = function() {
                        md.gridMails.data.unshift({
                            'NO_EMAIL': 'Email',
                            'NO_COMPANIA': 'Seleccione compañía',
                            'companias': md.listCompanias
                        });
                    };
                    // Btn - Eliminar mails seleccionados del ui-grid
                    md.eliminarMail = function() {
                        for(var i = 0; i < md.gridMails.data.length; i++) {
                            for(var ii = 0; ii < md.listaSeleccionados.length; ii++) {
                                if(md.gridMails.data[i].$$hashKey == md.listaSeleccionados[ii].$$hashKey) {
                                    var indx = md.gridMails.data.indexOf(md.gridMails.data[i]);
                                    md.gridMails.data.splice(indx, 1);
                                }
                            }
                        }
                    };
                    md.listaMails = md.gridMails.data;

                    md.enviarMail = function() {
                        SolicitudService.enviarMailAseguradora(md.gridMails.data)
                        .then(function successCallBack(response) {
                            if(response.status == 200) {
                                vm.msg.textContent('Mail enviado correctamente');
                                $mdDialog.show(vm.msg);
                            }
                        }, function callBack(response) {
                            vm.msg.textContent('Se ha producido un error al enviar el mail. Contacte con el administrador');
                            $mdDialog.show(vm.msg);
                        });
                    };
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                        
                }]				 
            });
        }
        
        vm.comprobarMail = function(mail) {
            var regex = "/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";
            return regex.test(mail);
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
            return parts.join(",") + " €";
        }
        
    }
    ng.module('App').component('solicitudSd', Object.create(solicitudComponent));

})(window.angular);