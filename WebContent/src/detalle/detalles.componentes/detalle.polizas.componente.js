(function(ng) {	

	//Crear componente de app
    var polizaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$timeout', '$scope', '$q', '$window', 'sharePropertiesService', '$location', '$timeout','$mdDialog', '$translate', 'BusquedaService', 'TiposService', 'PolizaService', 'validacionesService', 'BASE_SRC', 'ClienteService', 'DescargaService', 'ValidacionPagoService', 'HijosService', 'IdentidadService', 'EmpresaService', 'ConversorService', 'FicherosService', 'MovilService', 'ExportService', 'SolicitudService', 'HogarService', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busquedaPoliza: '^?busquedaPoliza',
    			busquedaSolicitudes: '^?busquedaSolicitudes'
    		},
            bindings: {
				datosCliente: '<',
				readOnly: '<'
            }
    }
    
    polizaComponent.controller = function clienteComponentControler($timeout, $scope, $q, $window, sharePropertiesService, $location, $timeout, $mdDialog, $translate, BusquedaService, TiposService, PolizaService, validacionesService, BASE_SRC, ClienteService, DescargaService, ValidacionPagoService, HijosService, IdentidadService, EmpresaService, ConversorService, FicherosService, MovilService, ExportService, SolicitudService, HogarService, constantsTipos) {
		var vm = this;
		vm.db = sharePropertiesService.get('db');
		var url = window.location;
		vm.dato = {};
		vm.form = {};
		vm.tipos = {};
		vm.calendar = {};
		vm.clientes = [];
		vm.dato.asegurados = [];
		var id_producto_ramo = null;
		var backupJSON = null;
		vm.medida = 0;
		var msg = $mdDialog.alert().clickOutsideToClose(true).ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
		var x2js = new X2JS();
		vm.rol = sessionStorage.rol;
		vm.numDetalles = [];
		vm.heading = null;
		vm.result = true;
		vm.listaArchivos = [];
		vm.msg = $mdDialog.alert().ok('Aceptar').clickOutsideToClose(true);
		vm.idPoliza = 0;
		vm.ruta = "";
		vm.extCiber = false;
		vm.tipoArchivo = null;
		vm.tipos.archivoPoliza = [];
		vm.joyas = false;
		vm.valorEspecial = false;
		vm.listJoyas = [];
		vm.listValorEspecial = [];
		vm.listaSolicitudes = 0;
		vm.fechaLimite = false;
		vm.inputDomain = null;

		this.$onInit = function () {
			vm.tipoBanco = 'IBAN';
			vm.dato = vm.parent.datos;
			vm.datosCliente = vm.datosCliente;
			vm.active = 0;
			vm.showDocumentacionSM = false;
			vm.appParent.listArchivos = [];
			vm.listaArchivos = [];

			if (vm.readOnly != true) {
				vm.cargarTabla('solicitud', false);
			}

			if (vm.busquedaPoliza != undefined && vm.busquedaPoliza.permisos != undefined) {
				vm.permisos = vm.busquedaPoliza.permisos;
			} else {
				//Cargar permisos
				if (vm.parent.pre.getPermissions != undefined) {
					vm.permisos = vm.parent.pre.getPermissions('polizas_list');
				}
			}

			if (vm.dato != undefined && vm.dato.ID_RAMO != undefined) {
				switch (vm.dato.ID_RAMO) {
					case 10:
						//AUTO
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_AUTO;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.automovil.html";
						break;
					case 11:
						//MOTO
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_MOTO;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.automovil.html";
						break;
					case 20:
						//MULTI
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_MULTIRRIESGOS;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.multirriesgos.html";
						break;
					case 200:
						//VIDA
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_VIDA;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.vida.html";
						break;
					case 170:
						//ASISTENCIA
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_ASISTENCIA_VIAJE;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.asistencia.html";
						break;
					case 230:
						//DECESOS
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_DECESOS;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.decesos.html";
						break;
					case 180:
						//PROTECCIÓN JURÍDICA
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_JURIDICA;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.proteccion.html";
						break;
					case 50:
						//SALUD
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_SALUD;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.salud.html";
						break;
					case 220:
						//SALUD DENTAL
						if (vm.dato.XM_ENVIADO != undefined)
							vm.datos = x2js.xml2js(vm.dato.XM_ENVIADO).PRESUPUESTO_DENTAL;
						vm.templateForm = "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.dental.html";
						break;
					default:
						// vm.template = "<h3>No existe pantalla</h3>";
						break;
				}
			}

			if (vm.dato != null && vm.dato.XM_ENVIADO != null && vm.dato.XM_ENVIADO != undefined) {
				delete vm.dato.XM_ENVIADO;
			}

			vm.colectivos = vm.parent.colectivos;
			vm.nuevo = vm.parent.nuevo;
			vm.showTable = 0;

			//Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
			//Parámetro utilizado en: ng-style="resizeHeight({{$ctrl.medida}})"
			if (vm.parent.parent.url == 'polizas' || vm.parent.parent.url == 'recibos' || vm.parent.parent.url == 'ultRecibos' || vm.parent.parent.url == 'renting' || vm.parent.parent.url == 'siniestros' || vm.parent.parent.url == 'presupuestos')
				vm.medida = 276;
			else if (vm.parent.parent.url == 'clientes')
				vm.medida = 315;


			if (vm.dato != null) {

				vm.getPolizaDetail();

			} else {
				$q.all({
					'datosRequest': validacionesService.getDataPoliza(),
					'dictRequest': validacionesService.getDictPoliza()
				}).then(function (data) {
					vm.dictionary = data.dictRequest.dict;
				});
				vm.nuevo = true;
			}

			TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_EMISION})
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.tipos.emision = response.data.TIPOS.TIPO;
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

			ConversorService.getEstadosInternos()
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.tipos.estadosInternos = response.data.CONVERSORES;
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

			if (vm.appParent.listServices.listMotivosAnulacion != null && vm.appParent.listServices.listMotivosAnulacion.length > 0) {
				vm.tipos.causas = vm.appParent.listServices.listMotivosAnulacion;
				vm.existeCausa(vm.tipos.causas);
			} else {
				// TiposService.getMotivosAnul({"ID_TIPOANULACION": 901})
				TiposService.getMotivosAnul({})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.causas = response.data.TIPOS.TIPO;
							vm.appParent.listServices.listMotivosAnulacion = vm.tipos.causas;
							vm.existeCausa(vm.tipos.causas);
						}
					}, function callBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.parent.logout();
						}
					});
			}

			// TiposService.getProgramas({})
			// .then(function successCallback(response){
			// 	if(response.status == 200){
			// 		vm.tipos.programas = response.data.TIPOS.TIPO;
			// 	}
			// }, function callBack(response){
			// 	if(response.status == 406 || response.status == 401){
			//     	vm.parent.logout();
			//     	$location.path('/');
			//     }
			// });

			TiposService.getTipos({"CO_TIPO": "PRODUCTO_APERTURA_SINIESTRO"})
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

			if (vm.appParent.listServices.listFormaPago != null && vm.appParent.listServices.listFormaPago.length > 0) {
				vm.tipos.formasPago = vm.appParent.listServices.listFormaPago;
			} else {
				TiposService.getFormasPago({})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.formasPago = response.data.TIPOS.TIPO;
							vm.appParent.listServices.listFormaPago = vm.tipos.formasPago;
						}
					}, function callBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.appParent.logout();
						}
					});
			}

			if (vm.appParent.listServices.listCompanias != null && vm.appParent.listServices.listCompanias.length > 0) {
				vm.tipos.compania = vm.appParent.listServices.listCompanias;
			} else {
				TiposService.getCompania({})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.compania = response.data.TIPOS.TIPO;
							vm.appParent.listServices.listCompanias = vm.tipos.compania;
						}
					});
			}

			if (vm.appParent.listServices.listMedioPago != null && vm.appParent.listServices.listMedioPago.length > 0) {
				vm.tipos.pago = vm.appParent.listServices.listMedioPago;
			} else {
				TiposService.getMedioPago({})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.pago = response.data.TIPOS.TIPO;
							vm.appParent.listServices.listMedioPago = vm.tipos.pago;
						}
					});
			}

			if (vm.appParent.listServices.listSituaPolizas != null && vm.appParent.listServices.listSituaPolizas.length > 0) {
				vm.tipos.estados = vm.appParent.listServices.listSituaPolizas;
			} else {
				TiposService.getSituaPolizas({})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.estados = response.data.TIPOS.TIPO;
							vm.appParent.listServices.listSituaPolizas = vm.tipos.estados;
						}
					});
			}

			TiposService.getTipos({"ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "HISTO_COMU"})
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
							if (response.data.TIPOS.TIPO[0].DS_TIPOS == "TRUE" || response.data.TIPOS.TIPO[0].DS_TIPOS == true) {
								vm.mostrarHistoCumu = true;
							} else if (response.data.TIPOS.TIPO[0].DS_TIPOS == null || response.data.TIPOS.TIPO[0].DS_TIPOS != "TRUE") {
								vm.mostrarHistoCumu = false;
							} else {
								vm.mostrarHistoCumu = false;
							}
						}
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

			TiposService.getPolArchives()
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.tipos.archivoPoliza = response.data.TIPOS.TIPO;
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.appParent.logout();
					}
				});
			vm.getDocuments();

			SolicitudService.getTiposSolicitudFilter({
				"ID_RAMO": vm.dato.ID_RAMO,
				"ID_COMPANIA": vm.dato.ID_COMPANIA,
				"ID_COMP_RAMO_PROD": vm.dato.ID_COMP_RAMO_PROD
			})
				.then(function successCallback(response) {
					if (response.data != null && response.data.TIPOS_SOLICITUD != null && response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD != null) {
						vm.listSolicitudesPadre = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD.filter(x => x.ID_TIPO_SOLICITUDPADRE == null);
						vm.listSolicitudesPadre = vm.listSolicitudesPadre.filter(x => x.ID_TIPO_SOLICITUD != 3);
						if (vm.dato.ID_PRODUCTO == 3 || vm.dato.ID_PRODUCTO == 4 || vm.dato.ID_PRODUCTO == 5 || vm.dato.ID_PRODUCTO == 6 || vm.dato.ID_PRODUCTO == 19) {
							TiposService.getTipos({"NO_CODIGO": "TIPO_SOLICITUD_PRODUCTO_ROL"})
								.then(function successCallback(response) {
									if (response.status == 200) {
										var listSolRolPadre = [];
										if (response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
											for (var i = 0; i < response.data.TIPOS.TIPO.length; i++) {
												var listRol = response.data.TIPOS.TIPO[i].DS_TIPOS;
												listRol = listRol.split(",");
												if (listRol.includes(vm.rol)) {
													var listTiposSolicitudesRol = response.data.TIPOS.TIPO[i].CO_TIPO;
													if (listTiposSolicitudesRol != null) {

														listTiposSolicitudesRol = listTiposSolicitudesRol.split("|");
														var idSolicitudPadre = listTiposSolicitudesRol[0];

														if (vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == idSolicitudPadre)) {
															var indexSol = vm.listSolicitudesPadre.findIndex(x => x.ID_TIPO_SOLICITUD == idSolicitudPadre);
															listSolRolPadre.push(vm.listSolicitudesPadre[indexSol]);
														}
													}
												}
											}
										}

										vm.listSolicitudesPadre = listSolRolPadre;
									}
								}, function callBack(response) {
									if (response.status == 406 || response.status == 401) {
										vm.parentApp.logout();
									}
								});
						}
					} else {
						vm.listSolicitudesPadre = [];
					}
				});

			/* id_comp_ramo_prod
				sl -> 2
				bbva -> 1
				lovys -> 22, 23, 24
			*/
			if (vm.dato.ID_COMP_RAMO_PROD == 1 || vm.dato.ID_COMP_RAMO_PROD == 22 || vm.dato.ID_COMP_RAMO_PROD == 23 || vm.dato.ID_COMP_RAMO_PROD == 24) {
				if (vm.appParent.listServices.listTipoVivienda_bbva != null && vm.appParent.listServices.listTipoVivienda_bbva.length > 0) {
					vm.tiposVivienda_bbva = vm.appParent.listServices.listTipoVivienda_bbva;
				} else {
					HogarService.getTiposVivienda({})
						.then(function successCallBack(response) {
							if (response.status == 200) {
								if (response.data.FIELD) {
									vm.tiposVivienda_bbva = response.data.FIELD;
									vm.appParent.listServices.listTipoVivienda_bbva = vm.tiposVivienda_bbva;
								}
							}
						}, function callBack(reponse) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}

				if (vm.appParent.listServices.listRegimenVivienda_bbva != null && vm.appParent.listServices.listRegimenVivienda_bbva.length > 0) {
					vm.regimenesVivienda = vm.appParent.listServices.listRegimenVivienda_bbva;
				} else {
					HogarService.getRegimenesVivienda({})
						.then(function successCallback(response) {
							if (response.status == 200) {
								vm.regimenesVivienda = response.data.FIELD;
								vm.appParent.listServices.listRegimenVivienda_bbva = vm.regimenesVivienda;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}

				//Usos vivienda BBVA
				if (vm.appParent.listServices.listUsoVivienda_bbva != null && vm.appParent.listServices.listUsoVivienda_bbva.length > 0) {
					vm.usosVivienda_bbva = vm.appParent.listServices.listUsoVivienda_bbva;
				} else {
					HogarService.getUsosVivienda({})
						.then(function successCallback(response) {
							if (response.status == 200) {
								vm.usosVivienda_bbva = response.data.FIELD;
								vm.appParent.listServices.listUsoVivienda_bbva = vm.usosVivienda_bbva;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}
			} else if (vm.dato.ID_COMP_RAMO_PROD == 2) {
				if (vm.appParent.listServices.listTipoVivienda_sl != null && vm.appParent.listServices.listTipoVivienda_sl.length > 0) {
					vm.tiposVivienda_sl = vm.appParent.listServices.listTipoVivienda_sl;
				} else {
					HogarService.getTiposVivienda2({})
						.then(function successCallBack(response) {
							if (response.status == 200) {
								if (response.data.FIELD) {
									vm.tiposVivienda_sl = response.data.FIELD;
									vm.appParent.listServices.listTipoVivienda_sl = vm.tiposVivienda_sl;
								}
							}
						}, function callBack(reponse) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}


				//Usos vivienda SL
				if (vm.appParent.listServices.listUsoVivienda_sl != null && vm.appParent.listServices.listUsoVivienda_sl.length > 0) {
					vm.usosVivienda_sl = vm.appParent.listServices.listUsoVivienda_sl;
				} else {
					HogarService.getUsosVivienda2({})
						.then(function successCallback(response) {
							if (response.status == 200) {
								vm.usosVivienda_sl = response.data.FIELD;
								vm.appParent.listServices.listUsoVivienda_sl = vm.usosVivienda_sl;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}

				if (vm.appParent.listServices.listRegimenVivienda_sl != null && vm.appParent.listServices.listRegimenVivienda_sl.length > 0) {
					vm.regimenesVivienda = vm.appParent.listServices.listRegimenVivienda_sl;
				} else {
					HogarService.getRegimenesVivienda2({})
						.then(function successCallback(response) {
							if (response.status == 200) {
								vm.regimenesVivienda = response.data.FIELD;
								vm.appParent.listServices.listRegimenVivienda_sl = vm.regimenesVivienda;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.appParent.logout();
							}
						});
				}


				if (vm.appParent.listServices.listSituacionVivienda_sl != null && vm.appParent.listServices.listSituacionVivienda_sl.length > 0) {
					vm.situacionesVivienda = vm.appParent.listServices.listSituacionVivienda_sl;
				} else {
					HogarService.getSituacionesVivienda({})
						.then(function successCallback(response) {
							if (response.status == 200) {
								vm.situacionesVivienda = response.data.FIELD;
								vm.appParent.listServices.listSituacionVivienda_sl = vm.situacionesVivienda;
							}
						}, function callBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.parent.logout();
							}
						});
				}
			}
		}


		//Cargar plantilla
		this.loadTemplate = function () {
			if (vm.permisos != undefined && vm.permisos.EXISTE != false) {
				return BASE_SRC + "detalle/detalles.views/detalle.polizas2.html";
			} else {
				return 'src/error/404.html';
			}
		}

		// vm.getPolizaDetail = function () {
		vm.getPolizaDetail = function (recargar) {
			PolizaService.getDetail(vm.dato.ID_POLIZA)
				.then(function successCallback(response) {
					if (response.data.ID_RESULT == 0) {

						vm.list = response.data.LST_ASEGURADOS;
						vm.dato = response.data;
						vm.dato.conductor = [];
						vm.dato.asegurados = [];
						vm.dato.autorizado = null;

						if (vm.busquedaPoliza != null) {
							vm.busquedaPoliza.datosPoliza = JSON.parse(JSON.stringify(vm.dato));
						}

						fec = new Date("10/06/2023");
						fEmi = new Date(vm.dato.FD_EMISION);
						if (fec.getTime() > fEmi.getTime()) {
							vm.fechaLimite = true;
						}

						//Si se ha confirmado póliza, recargar datos
						if (recargar == true && vm.busquedaPoliza != null) {
							vm.busquedaPoliza.numDetalles[vm.busquedaPoliza.active - 1] = response.data;
							if (vm.busquedaPoliza != null && vm.busquedaPoliza.gridOptions != null && vm.busquedaPoliza.gridOptions.data != null) {
								var indexPoliza = vm.busquedaPoliza.gridOptions.data.findIndex(x => x.ID_POLIZA == response.data.ID_POLIZA);
								if (indexPoliza != null) {
									vm.busquedaPoliza.gridOptions.data[indexPoliza] = response.data;
								}
							}
						}

						if (vm.dato.JS_ENVIADO != null && vm.dato.JS_ENVIADO != undefined && vm.dato.JS_ENVIADO != "") {
							vm.bloques = JSON.parse(vm.dato.JS_ENVIADO);

							//Crear terminal asegurado si la póliza es de seguro móvil
							if (vm.dato.ID_COMP_RAMO_PROD == 10 || vm.dato.ID_COMP_RAMO_PROD == 11 || vm.dato.ID_COMP_RAMO_PROD == 12 || vm.dato.ID_COMP_RAMO_PROD == 33 || vm.dato.ID_COMP_RAMO_PROD == 34) {
								if (vm.bloques.device != null && vm.bloques.device.brandName != null && vm.bloques.device.modelName != null) {
									vm.terminalAsegurado = `${vm.bloques.device.brandName} ${vm.bloques.device.modelName}`;
								} else if (vm.bloques.brand != null && vm.bloques.model != null) {
									vm.terminalAsegurado = `${vm.bloques.brand} ${vm.bloques.model}`;
								}

								//Comprobar si los datos adicionales tienen IBAN, para mostrarlo por pantalla
								if (vm.bloques != null && vm.bloques.portRetInfo != null && vm.bloques.portRetInfo.iban != null) {
									vm.dato.CO_IBAN = vm.bloques.portRetInfo.iban;
								}

								//Comprobar banda, en caso de no tener el dato, obtenerlo de los datos del dispositivo
								if (!vm.dato.NO_MODALIDAD && vm.bloques.device != null && vm.bloques.device.jsConfiguration) {
									vm.band = JSON.parse(vm.bloques.device.jsConfiguration)[0].idBanda;
								}
							}

							//Si es de ciberempresas, formateamos a miles
							if (vm.dato.ID_PROGRAMA == 2 || vm.dato.ID_PROGRAMA == 10 || vm.dato.ID_PROGRAMA == 18 || vm.dato.ID_PROGRAMA == 19) {
								if (vm.bloques.CIBERRIESGO) {
									//Formatear turnover
									if (vm.bloques.CIBERRIESGO.TURNOVER && typeof vm.bloques.CIBERRIESGO.TURNOVER == "number") {
										vm.bloques.CIBERRIESGO.TURNOVER = vm.formatAmount(vm.bloques.CIBERRIESGO.TURNOVER.toString());
									}

									//Formatear
									if (vm.bloques.CIBERRIESGO.AMMOUNT && typeof vm.bloques.CIBERRIESGO.AMMOUNT == "number") {
										vm.bloques.CIBERRIESGO.AMMOUNT = vm.formatAmount(vm.bloques.CIBERRIESGO.AMMOUNT.toString());
									}
								}

								if (vm.bloques.FRANQUICIAS != null && vm.bloques.FRANQUICIAS.length > 0) {
									for (var i = 0; i < vm.bloques.FRANQUICIAS.length; i++) {
										if (vm.bloques.FRANQUICIAS[i].IMP_FRANQUICIA)
											vm.bloques.FRANQUICIAS[i].IMP_FRANQUICIA = vm.formatAmount(vm.bloques.FRANQUICIAS[i].IMP_FRANQUICIA.toString(), false);
									}
								}

								if (vm.bloques.LST_GARANTIAS != null && vm.bloques.LST_GARANTIAS.length > 0) {
									var garantia = vm.bloques.LST_GARANTIAS.find(x => x.ID_GARANTIA == 54);
									if (garantia != null && garantia.SECTIONS != null && garantia.SECTIONS.length > 0) {
										vm.sublimiteCobertura = garantia.SECTIONS;
										for (var i = 0; i < vm.sublimiteCobertura.length; i++) {
											if (vm.sublimiteCobertura[i].NO_SECCION != null && vm.sublimiteCobertura[i].NO_SECCION.includes(":")) {
												vm.sublimiteCobertura[i].NO_SECCION = vm.sublimiteCobertura[i].NO_SECCION.split(":")[0];
											}
											vm.sublimiteCobertura[i].NU_CAPITAL = vm.formatAmount(vm.sublimiteCobertura[i].NU_CAPITAL);
											vm.sublimiteCobertura[i].ID_GARANTIA = garantia.ID_GARANTIA;
										}
									}
								}
							}

							//Crear listas con objetos de valor
							if (vm.dato.ID_RAMO == 20 && vm.bloques != null && vm.bloques.BLOCK_CAPITALES != null) {

								if (vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA != null || vm.bloques.BLOCK_CAPITALES.IM_JOYAS_EN_VIVIENDA == 0
									|| (vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA == undefined && (vm.bloques.DETALLE_JOYAS == undefined || Object.keys(vm.bloques.DETALLE_JOYAS).length == 0))) {
									vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA = '02';
								}
								if (vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA == null || vm.bloques.BLOCK_CAPITALES.IM_OBJETOS_VALOR_EN_VIVIENDA == 0
									|| (vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA == undefined && (vm.bloques.DETALLE_VALOR_ESPECIAL == undefined || Object.keys(vm.bloques.DETALLE_VALOR_ESPECIAL).length == 0))) {
									vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA = false;
								}


								if (vm.bloques.DETALLE_JOYAS != null) {
									var joya = {};

									if (vm.bloques.DETALLE_JOYAS.NO_JOYA1 != null && vm.bloques.DETALLE_JOYAS.IM_JOYA1 != null) {
										vm.joyas = true;
										Object.defineProperty(joya, 'name', {value: vm.bloques.DETALLE_JOYAS.NO_JOYA1});
										Object.defineProperty(joya, 'value', {value: vm.bloques.DETALLE_JOYAS.IM_JOYA1});
										vm.listJoyas.push(joya);
									}

									if (vm.bloques.DETALLE_JOYAS.IM_JOYA2 != null && vm.bloques.DETALLE_JOYAS.NO_JOYA2 != null) {
										joya = {};
										Object.defineProperty(joya, 'name', {value: vm.bloques.DETALLE_JOYAS.NO_JOYA2});
										Object.defineProperty(joya, 'value', {value: vm.bloques.DETALLE_JOYAS.IM_JOYA2});
										vm.listJoyas.push(joya);
									}

									if (vm.bloques.DETALLE_JOYAS.IM_JOYA3 != null && vm.bloques.DETALLE_JOYAS.NO_JOYA3 != null) {
										joya = {};
										Object.defineProperty(joya, 'name', {value: vm.bloques.DETALLE_JOYAS.NO_JOYA3});
										Object.defineProperty(joya, 'value', {value: vm.bloques.DETALLE_JOYAS.IM_JOYA3});
										vm.listJoyas.push(joya);
									}

									if (vm.bloques.BLOCK_CAPITALES != null && vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA == null || vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA == undefined) {
										vm.bloques.BLOCK_CAPITALES.IN_JOYAS_EN_VIVIENDA = '01';
									}
								}

								if (vm.bloques.DETALLE_VALOR_ESPECIAL != null) {
									var objeto = {};

									if (vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO1 != null && vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO1 != null) {
										vm.valorEspecial = true;
										Object.defineProperty(objeto, 'name', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO1});
										Object.defineProperty(objeto, 'value', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO1});
										vm.listValorEspecial.push(objeto);
									}
									if (vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO2 != null && vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO2 != null) {
										objeto = {};
										Object.defineProperty(objeto, 'name', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO2});
										Object.defineProperty(objeto, 'value', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO2});
										vm.listValorEspecial.push(objeto);
									}
									if (vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO3 != null && vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO3 != null) {
										objeto = {};
										Object.defineProperty(objeto, 'name', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO3});
										Object.defineProperty(objeto, 'value', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO3});
										vm.listValorEspecial.push(objeto);
									}
									if (vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO4 != null && vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO4 != null) {
										objeto = {};
										Object.defineProperty(objeto, 'name', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO4});
										Object.defineProperty(objeto, 'value', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO4});
										vm.listValorEspecial.push(objeto);
									}
									if (vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO5 != null && vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO5 != null) {
										objeto = {};
										Object.defineProperty(objeto, 'name', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.NO_OBJETO5});
										Object.defineProperty(objeto, 'value', {value: vm.bloques.DETALLE_VALOR_ESPECIAL.IM_OBJETO5});
										vm.listValorEspecial.push(objeto);
									}

									if (vm.bloques.BLOCK_CAPITALES != null && (vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA == null || vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA == undefined)) {
										vm.bloques.BLOCK_CAPITALES.IN_OBJETOS_VALOR_EN_VIVIENDA = true;
									}
								}

								if (vm.appParent.listServices.listBancos != null && vm.appParent.listServices.listBancos.length > 0) {
									vm.bancos = vm.appParent.listServices.listBancos;
								} else {
									HogarService.getBancos({})
										.then(function successCallback(response) {
											if (response.status == 200) {
												vm.bancos = response.data.FIELD;
												vm.appParent.listServices.listBancos = vm.bancos;
											}
										}, function callBack(response) {
											if (response.status == 406 || response.status == 401) {
												vm.appParent.logout();
											}
										});
								}
							}
						}

						angular.forEach(vm.list, function (values, key) {
							if (values.ID_TIPO_CLIENTE == 1) {
								vm.dato.pagador = vm.list[key];
							} else if (values.ID_TIPO_CLIENTE == 2) {
								vm.list[key].NO_ASEGURADO = "Asegurado " + (vm.dato.conductor.length + 1);
								vm.dato.conductor.push(vm.list[key]);
								vm.dato.asegurados.push(vm.list[key]);
							} else if (values.ID_TIPO_CLIENTE == 14) {
								vm.dato.autorizado = vm.list[key];
							} else if (values.ID_TIPO_CLIENTE == 3) {
								vm.dato.tomador = vm.list[key];
							}
						});

						angular.forEach(vm.dato, function (values, key) {
							vm.form[key] = {};
							if (vm.form[key] != undefined) {
								if (key == "FD_EMISION" || key == "FD_INICIO" || key == "FD_VENCIMIENTO" || key == "FD_CANCELACION")
									vm.form[key].value = new Date(values);
								else
									vm.form[key].value = values;
							}

						});

						//Para ciberriesgo
						if (vm.dato.ID_RAMO == 103 && (vm.dato.ID_COMP_RAMO_PROD == 5 || vm.dato.ID_COMP_RAMO_PROD == 6 || vm.dato.ID_COMP_RAMO_PROD == 25 || vm.dato.ID_COMP_RAMO_PROD == 29 || vm.dato.ID_COMP_RAMO_PROD == 19 || vm.dato.ID_COMP_RAMO_PROD == 32) && vm.bloques != null && vm.bloques.CIBERRIESGO != null) {

							if (vm.appParent.listServices.listGrupoEmpresa_ti != null && vm.appParent.listServices.listGrupoEmpresa_ti.length > 0) {
								vm.tpGroups = vm.appParent.listServices.listGrupoEmpresa_ti;
								if (vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
									var noSector = vm.bloques.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
									vm.bloques.CIBERRIESGO.SECTOR = vm.tpGroups.find(x => x.CO_TIPO == noSector);

									if (vm.bloques.CIBERRIESGO.SECTOR != null && vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
										vm.bloques.CIBERRIESGO.ACTIVITY_CODE = vm.bloques.CIBERRIESGO.SECTOR.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.bloques.CIBERRIESGO.ACTIVITY_CODE);
									}
								}

							} else {
								EmpresaService.groupsDetail(1)
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

											if (vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
												var noSector = vm.bloques.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
												vm.bloques.CIBERRIESGO.SECTOR = vm.tpGroups.find(x => x.CO_TIPO == noSector);

												if (vm.bloques.CIBERRIESGO.SECTOR != null && vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
													vm.bloques.CIBERRIESGO.ACTIVITY_CODE = vm.bloques.CIBERRIESGO.SECTOR.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.bloques.CIBERRIESGO.ACTIVITY_CODE);
												}
											}

											vm.appParent.listServices.listGrupoEmpresa_ti = vm.tpGroups;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.parent.logout();
										}
									});
							}


							if (vm.appParent.listServices.listCiberAtaque_ti != null && vm.appParent.listServices.listCiberAtaque_ti.length > 0) {
								vm.tpCbatk = vm.appParent.listServices.listCiberAtaque_ti;
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.TYPE_CBATK
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.tpCbatk = response.data.TIPOS.TIPO;

											//Ordenar lista
											vm.tpCbatk.sort(function (a, b) {
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

							if (vm.appParent.listServices.listCantidadAsegurada_ti != null && vm.appParent.listServices.listCantidadAsegurada_ti.length > 0) {
								vm.tpAmount = vm.appParent.listServices.listCantidadAsegurada_ti;

								if (vm.bloques.CIBERRIESGO.AMMOUNT_OPTION != null) {
									vm.bloques.CIBERRIESGO.AMMOUNT_OPTION = vm.tpAmount.find(x => x.CO_TIPO == vm.bloques.CIBERRIESGO.AMMOUNT_OPTION);
								}
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.RNG_AMMOUNT
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.tpAmount = response.data.TIPOS.TIPO;

											//Ordenar lista
											vm.tpAmount.sort(function (a, b) {
												if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
													return 1;
												}
												if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
													return -1;
												}
												return 0;
											});

											if (vm.bloques.CIBERRIESGO.AMMOUNT_OPTION != null) {
												vm.bloques.CIBERRIESGO.AMMOUNT_OPTION = vm.tpAmount.find(x => x.CO_TIPO == vm.bloques.CIBERRIESGO.AMMOUNT_OPTION);
											}
											vm.appParent.listServices.listCantidadAsegurada_ti = vm.tpAmount;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.appParent.logout();
										}
									});
							}

							if (vm.appParent.listServices.listCantidadPerdida_ti != null && vm.appParent.listServices.listCantidadPerdida_ti.length > 0) {
								vm.tpLosses = vm.appParent.listServices.listCantidadPerdida_ti;
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.RNG_LOSSES
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.tpLosses = response.data.TIPOS.TIPO;

											//Ordenar lista
											vm.tpLosses.sort(function (a, b) {
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

							if (vm.appParent.listServices.listCantidadFacturacion_ti != null && vm.appParent.listServices.listCantidadFacturacion_ti.length > 0) {
								vm.tpFacturacion = vm.appParent.listServices.listCantidadFacturacion_ti;
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.IM_FACTURACION
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.tpFacturacion = response.data.TIPOS.TIPO;

											//Ordenar lista
											vm.tpFacturacion.sort(function (a, b) {
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
						}

						//Para ciberriesgo
						if (vm.dato.ID_RAMO == 103 && (vm.dato.ID_COMP_RAMO_PROD == 3 || vm.dato.ID_COMP_RAMO_PROD == 4) && vm.bloques != null && vm.bloques.CIBERRIESGO != null) {

							if (vm.appParent.listServices.listGrupoEmpresa_ti != null && vm.appParent.listServices.listGrupoEmpresa_ti.length > 0) {
								vm.tpGroups = vm.appParent.listServices.listGrupoEmpresa_ti;
								if (vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
									var noSector = vm.bloques.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
									vm.bloques.CIBERRIESGO.SECTOR = vm.tpGroups.find(x => x.CO_TIPO == noSector);

									if (vm.bloques.CIBERRIESGO.SECTOR != null && vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
										vm.bloques.CIBERRIESGO.ACTIVITY_CODE = vm.bloques.CIBERRIESGO.SECTOR.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.bloques.CIBERRIESGO.ACTIVITY_CODE);
									}
								}

							} else {
								EmpresaService.groupsDetail(1)
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

											if (vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
												var noSector = vm.bloques.CIBERRIESGO.ACTIVITY_CODE.substr(0, 1);
												vm.bloques.CIBERRIESGO.SECTOR = vm.tpGroups.find(x => x.CO_TIPO == noSector);

												if (vm.bloques.CIBERRIESGO.SECTOR != null && vm.bloques.CIBERRIESGO.ACTIVITY_CODE != null) {
													vm.bloques.CIBERRIESGO.ACTIVITY_CODE = vm.bloques.CIBERRIESGO.SECTOR.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.bloques.CIBERRIESGO.ACTIVITY_CODE);
												}
											}

											vm.appParent.listServices.listGrupoEmpresa_ti = vm.tpGroups;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.parent.logout();
										}
									});
							}


							if (vm.appParent.listServices.listCantidadAsegurada_ti != null && vm.appParent.listServices.listCantidadAsegurada_ti.length > 0) {
								vm.tpAmount = vm.appParent.listServices.listCantidadAsegurada_ti;

								if (vm.bloques.CIBERRIESGO.AMMOUNT_OPTION != null) {
									vm.bloques.CIBERRIESGO.AMMOUNT_OPTION = vm.tpAmount.find(x => x.CO_TIPO == vm.bloques.CIBERRIESGO.AMMOUNT_OPTION);
								}
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.RNG_AMMOUNT
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.tpAmount = response.data.TIPOS.TIPO;

											//Ordenar lista
											vm.tpAmount.sort(function (a, b) {
												if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
													return 1;
												}
												if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
													return -1;
												}
												return 0;
											});

											if (vm.bloques.CIBERRIESGO.AMMOUNT_OPTION != null) {
												vm.bloques.CIBERRIESGO.AMMOUNT_OPTION = vm.tpAmount.find(x => x.CO_TIPO == vm.bloques.CIBERRIESGO.AMMOUNT_OPTION);
											}
											vm.appParent.listServices.listCantidadAsegurada_ti = vm.tpAmount;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.appParent.logout();
										}
									});
							}
						}

						//Para ciberidentidad
						if (vm.dato.ID_RAMO == 103 && vm.dato.ID_COMP_RAMO_PROD == 8) {
							if (vm.appParent.listServices.listNumAdultos_ti != null && vm.appParent.listServices.listNumAdultos_ti.length > 0) {
								vm.typesIdent = vm.appParent.listServices.listNumAdultos_ti;
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.TYPE_IDENTIDAD
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.typesIdent = response.data.TIPOS.TIPO;
											vm.appParent.listServices.listNumAdultos_ti = vm.typesIdent;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.appParent.logout();
										}
									});
							}
						}

						//Para ciberhijos
						if (vm.dato.ID_RAMO == 103 && (vm.dato.ID_COMP_RAMO_PROD == 7 || vm.dato.ID_COMP_RAMO_PROD == 8)) {
							if (vm.appParent.listServices.listNumHijos_ti != null && vm.appParent.listServices.listNumHijos_ti.length > 0) {
								vm.typesHijos = vm.appParent.listServices.listNumHijos_ti;
							} else {
								TiposService.getTipos({
									"ID_CODIGO": constantsTipos.TYPE_HIJOS
								})
									.then(function successCallback(response) {
										if (response.status == 200) {
											vm.typesHijos = response.data.TIPOS.TIPO;
											vm.appParent.listServices.listNumHijos_ti = vm.typesHijos;
										}
									}, function callBack(response) {
										if (response.status == 406 || response.status == 401) {
											vm.appParent.logout();
										}
									});
							}
						}

						//Para seguro móvil
						if (vm.dato.ID_COMP_RAMO_PROD == 10 || vm.dato.ID_COMP_RAMO_PROD == 11 || vm.dato.ID_COMP_RAMO_PROD == 12 || vm.dato.ID_COMP_RAMO_PROD == 33 || vm.dato.ID_COMP_RAMO_PROD == 34) {
							PolizaService.fillCampaign(vm.dato)
								.then(function successCallback(response) {
									if (response.data != null && response.data.ID_RESULT == 0) {
										if (response.data.JS_CAMPAIGN != null) {
											vm.campaign = JSON.parse(response.data.JS_CAMPAIGN);
										}
									}
								}, function callBack(response) {
									if (response.status == 406 || response.status == 401) {
										vm.appParent.logout();
									}
								});
						}

						/* Particulares */
						if (vm.appParent.listServices.listCantidadAsegurada_cp != null && vm.appParent.listServices.listCantidadAsegurada_cp.length > 0) {
							vm.amountCP = vm.appParent.listServices.listCantidadAsegurada_cp;

							if (vm.bloques && vm.bloques.CIBERPARTICULARES && vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION) {
								vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION = vm.amountCP.find(x => x.CO_TIPO == vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION);
							}
						} else {
							TiposService.getTipos({
								"ID_CODIGO": constantsTipos.RNG_AMMOUNT_CP
							})
								.then(function successCallback(response) {
									if (response.status == 200) {
										vm.amountCP = response.data.TIPOS.TIPO;

										//Ordenar lista
										vm.amountCP.sort(function (a, b) {
											if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
												return 1;
											}
											if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
												return -1;
											}
											return 0;
										});

										if (vm.bloques && vm.bloques.CIBERPARTICULARES && vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION) {
											vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION = vm.amountCP.find(x => x.CO_TIPO == vm.bloques.CIBERPARTICULARES.AMMOUNT_OPTION);
										}
										vm.appParent.listServices.listCantidadAsegurada_cp = vm.amountCP;
									}
								}, function callBack(response) {
									if (response.status == 406 || response.status == 401) {
										vm.appParent.logout();
									}
								});
						}

						TiposService.getRamoCompania({"ID_COMPANIA": vm.dato.ID_COMPANIA})
							.then(function successCallBack(response) {
								if (response.status == 200) {
									vm.tipos.ramos = response.data.CIARAMOS.CIA_RAMO;
								}
							});

						TiposService.getCompRamoProd({"ID_COMPANIA": vm.dato.ID_COMPANIA, "ID_RAMO": vm.dato.ID_RAMO})
							.then(function successCallBack(response) {
								if (response.status == 200) {
									vm.tipos.productos = response.data.CIARAMOS.CIA_RAMO;
									id_producto_ramo = _.find(vm.tipos.productos, {"ID_PRODUCTO": vm.dato.ID_PRODUCTO});
								}
							});

						$q.all({
							'datosRequest': validacionesService.getDataPoliza(),
							'dictRequest': validacionesService.getDictPoliza()
						}).then(function (data) {
							//vm.form = data.datosRequest.data;
							vm.dictionary = data.dictRequest.dict;
						});

						backupJSON = JSON.stringify(vm.dato);
						BusquedaService.buscar({'ID_POLIZA': vm.dato.ID_POLIZA}, 'garantiasByPoliza')
							.then(function successCallback(response) {
								vm.garantias = response.data.GARANTIAS;
								if (vm.dato.ID_RAMO == 103 && (vm.dato.ID_COMP_RAMO_PROD == 5 || vm.dato.ID_COMP_RAMO_PROD == 6 || vm.dato.ID_COMP_RAMO_PROD == 25 || vm.dato.ID_COMP_RAMO_PROD == 29 || vm.dato.ID_COMP_RAMO_PROD == 19 || vm.dato.ID_COMP_RAMO_PROD == 32) && vm.bloques != undefined && vm.bloques.CIBERRIESGO != null) {
									vm.addCCE = vm.getAddCCE(vm.garantias);
								}
							}, function errorCallBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parent.logout();
								}
							});

						if (vm.dato.ID_COMP_RAMO_PROD == 14 || vm.dato.ID_COMP_RAMO_PROD == 16 || vm.dato.ID_COMP_RAMO_PROD == 17 || vm.dato.ID_COMP_RAMO_PROD == 18) {
							PolizaService.getRiesgosPoliza({"ID_POLIZA": vm.dato.ID_POLIZA})
								.then(function successCallBack(response) {
									if (response.status == 200 && response.data != null) {
										if (response.data.RIESGOS != null && response.data.RIESGOS.RIESGO != null) {
											vm.listaDispositivos = response.data.RIESGOS.RIESGO;
										}
									}
								});
						}

					}

				}, function errorCallBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

			SolicitudService.countSolicitudesByPoliza(vm.dato.ID_POLIZA)
				.then(function successCallBack(response) {
					if (response.status == 200 && response.data != null) {
						if (response.data.NUMERO_SOLICITUDES != null) {
							vm.listaSolicitudes = response.data.NUMERO_SOLICITUDES;
						}
					}
				});
		}

		vm.existeCausa = function (listCausas) {
			if (vm.dato.ID_CAUSAANULACION != null && listCausas != null) {
				var causa = listCausas.find(x => x.ID_CAUSAANULACION == vm.dato.ID_CAUSAANULACION);
				if (causa == null || causa == undefined) {
					vm.noExisteCausa = true;
				}
			}
		}

		vm.getAddCCE = function (listGarantias) {
			var addCCe = "No";
			vm.extCiber = false;
			if (listGarantias != null && listGarantias.length > 0) {
				var garantia = listGarantias.find(x => x.ID_GARANTIA == 57);
				if (garantia != null) {
					addCCe = "Sí";
					vm.extCiber = true;
				}
			}
			return addCCe;
		}

		//Cambiar tabs
		vm.changeTabs = function (index) {
			vm.showTable = index;
			if (index == 8) {
				vm.cargarHistoricoPoliza();
				if (vm.dato.ID_COMP_RAMO_PROD == 1 || vm.dato.ID_COMP_RAMO_PROD == 2) {
					vm.cargarHistoricoComunicaciones();
				}
			}
		}

		//Filtrar los combos
		vm.filtraCombo = function (tipos) {
			if (tipos == 'aseguradora') {

			}
		}

		//Marcha atras
		vm.atras = function () {
			window.history.back();
		}

		//Abrir la sección
		vm.mostrarSeccion = function (id, seccion, id2) {
			$(seccion).slideDown();
			$(id).hide();
			$(id2).show();
		}

		//Cerrar la sección
		vm.ocultarSeccion = function (id, seccion, id2) {
			$(seccion).slideUp();
			$(id).hide();
			$(id2).show();
		}

		//comprobar IBAN
		vm.validarIban = function (IBAN) {
			vm.result = ValidacionPagoService.validarIban(IBAN)
		}

		//Cargar la tabla
		vm.cargarTabla = function (tipo, isPeticion) {
			vm.json = {}
			if (tipo == "siniestros" || tipo == "solicitud") {
				if (vm.parent.datos != null && (vm.parent.datos.LST_ASEGURADOS != undefined || vm.parent.datos.LST_ASEGURADOS != null)) {
					vm.json.OPOLIZA = {"ID_POLIZA": vm.parent.datos.ID_POLIZA};
					var tomador = vm.parent.datos.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE == 3);
					if (tomador != null && tomador.ID_CLIENTE != null && tipo != "solicitud") {
						vm.json.OCLIENTE = {"ID_CLIENTE": tomador.ID_CLIENTE};
					}
				}
			} else {
				vm.json = {
					"ID_POLIZA": vm.parent.datos.ID_POLIZA
				}
			}

			if (isPeticion != false) {
				vm.parent.searchFromDetalle(vm.json, tipo);
			} else {
				if (vm.parent != null && vm.parent.parent != null) {
					vm.parent.parent.detalleCliente = JSON.parse(JSON.stringify(vm.json));
				}
			}
		}

		//Recuperar los datos de garantías
		vm.cargarGarantias = function () {
			if (vm.dato.ID_COMP_RAMO_PROD != undefined) {
				TiposService.getGarantias({"ID_COMP_RAMO_PROD": vm.dato.ID_COMP_RAMO_PROD})
					.then(function successCallback(response) {
						if (response.status == 200) {
							vm.tipos.garantias = response.data.GARANTIAS;
						}
					});
			}

			// BusquedaService.buscar({"ID_POLIZA":vm.dato.ID_POLIZA},"garantiasByPoliza")
			// .then(function successCallback(response){
			// 	vm.garantias = response.data.GARANTIAS;
			// },function errorCallBack(response){
			// 	if(response.status == 406 || response.status == 401){
			//     	vm.parent.logout();
			//     	$location.path('/');
			//     }
			// });

		}

		//Añadir garantía
		vm.addNewGarantia = function () {
			var anadir = true;
			var nombreCompania = "";
			vm.newGarantia.IS_NEW = true;
			if (vm.garantias == undefined || vm.garantias == null || vm.garantias.length == 0) {
				vm.garantias = []
				vm.garantias.push(JSON.parse(JSON.stringify(vm.newGarantia)));
			} else {
				for (var i = 0; i < vm.garantias.length; i++) {
					if (vm.garantias[i].NO_GARANTIA == vm.newGarantia.NO_GARANTIA) {
						anadir = false;
						nombreCompania = vm.newGarantia.NO_GARANTIA;
					}
				}
				if (!anadir) {
					msg.textContent('No se puede insertar más de una vez la misma garantía. ' + nombreCompania + ' ya ha sido insertada');
					$mdDialog.show(msg);
				} else {
					vm.garantias.push(JSON.parse(JSON.stringify(vm.newGarantia)));
				}
			}
		}

		vm.eliminarGarantia = function (datos) {
			for (var i = 0; i < vm.garantias.length; i++) {
				if (vm.garantias[i] == datos) {
					var index = vm.garantias.indexOf(vm.garantias[i]);
					if (index >= -1) {
						vm.garantias.splice(index, 1);
						msg.textContent('La garantía se ha elminado correctamente. Guarda para registrar tus datos');
						$mdDialog.show(msg);
					}
				}
			}
		}

		//Guardar garantía
		vm.guardarGarantia = function () {
			var rowsUpdate = [];
			for (var i = 0; i < vm.garantias.length; i++) {
				if (vm.garantias[i].IS_UPDATED || vm.garantias[i].IS_NEW) {
					rowsUpdate.push(vm.garantias[i]);
				}
			}
			PolizaService.addPoliza({
				"LST_GARANTIAS": rowsUpdate,
				"NU_POLIZA": vm.dato.NU_POLIZA,
				"ID_SITUAPOLIZA": vm.dato.ID_SITUAPOLIZA,
				"ID_POLIZA": vm.dato.ID_POLIZA,
				"IT_VERSION": vm.dato.IT_VERSION
			})
				.then(function successCallback(response) {
					msg.textContent('Registrado correctamente');
					$mdDialog.show(msg);
					if (response.status == 200) {
						if (response.data.ID_RESULT == 0) {
							vm.colModificado = {};
							vm.dato.IT_VERSION = response.data.IT_VERSION;
							for (var i = 0; i < response.data.LST_GARANTIAS.length; i++) {
								for (var j = 0; j < vm.garantias.length; j++) {
									if (response.data.LST_GARANTIAS[i].ID_GARANTIA == vm.garantias[j].ID_GARANTIA) {
										vm.garantias[j] = response.data.LST_GARANTIAS[i];
										vm.garantias[j].IS_NEW = false;
									}
								}
							}
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
				});
			var rowsUpdate = [];
		}

		//Recuperar los datos de comisionistas
		vm.cargarComisionistas = function () {
			vm.vista = 2;
			vm.json = {
				"ID_POLIZA": vm.parent.datos.ID_POLIZA
			}
			BusquedaService.buscar({"ID_POLIZA": vm.dato.ID_POLIZA}, "comisionistasByPoliza")
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (response.data.NUMERO_COMISIONISTASPOLIZA != 0) {
							vm.comisionistas = response.data.COMISIONISTASPOLIZA.COMISIONISTAPOLIZA;
							vm.gridOptions.data = vm.comisionistas;
							vm.vista = 4;
						} else
							vm.vista = 3;
					}

				}, function errorCallBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

		}

		//Validar póliza
		vm.validarPoliza = function () {
			var objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
			msg.textContent('Rellene los datos de la póliza correctamente');
			$mdDialog.show(msg);
			objFocus.focus();
		}

		//UI.GRID Configurado
		vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15, 30, 50],
			paginationPageSize: 15,
			treeRowHeaderAlwaysVisible: true,
			columnDefs: [
				{
					name: 'NO_COMPANIA',
					enableCellEdit: false,
					displayName: 'Aseguradora',
					sort: {priority: 0, direction: 'asc'},
					cellTooltip: function (row) {
						return row.entity.NO_COMPANIA
					},
					width: 170,
				},
				{
					field: 'NU_PORCENTAJE',
					enableCellEdit: true,
					displayName: '% Comisión',
					cellTemplate: '<div ng-if="row.entity.NU_PORCENTAJE!=undefined" class="ui-grid-cell-contents">{{row.entity.NU_PORCENTAJE}} %</div><div ng-if="row.entity.NU_PORCENTAJE==undefined" class="ui-grid-cell-contents">0 %</div>',
					cellTooltip: function (row) {
						return row.entity.NU_PORCENTAJE
					}
				},
				{
					field: 'NU_COMISION',
					enableCellEdit: true,
					displayName: 'Comisión',
					cellTemplate: '<div ng-if="row.entity.NU_COMISION!=undefined" class="ui-grid-cell-contents">{{row.entity.NU_COMISION}} €</div><div ng-if="row.entity.NU_COMISION==undefined" class="ui-grid-cell-contents">0 €</div>',
					cellTooltip: function (row) {
						return row.entity.NU_COMISION
					}
				}
			],
			onRegisterApi: function (gridApi) {
			}
		}

		vm.cargarHistoricoPoliza = function () {			
			vm.appParent.abrirModalcargar(true);
			PolizaService.obtenerHistoricoCambiosPoliza(vm.dato.ID_POLIZA)
				.then(function successCallback(response) {
					// if (response.data.ID_RESULT == 0) {
					if(response.data != null && response.data.length > 0){
						// vm.gridOptionsHistorico.data = response.data;
						for(var i=0; i<response.data.length; i++){
							var fdCambios = moment(response.data[i].FT_CAMBIO).format('DD/MM/YYYY');
							var cambios = response.data[i].LST_CAMBIOS;
							
							var cambio = [];
							for(var j=0; j<cambios.length; j++){
								cambio = cambios[j];
								vm.gridOptionsHistorico.data.push({'FT_CAMBIO': fdCambios, 'LST_CAMBIOS': cambio});
							}
						}				
					} else {
						msg.textContent($translate.instant('NOT_FOUND_RESULTS'));
						$mdDialog.show(msg);
					}
					$mdDialog.cancel();
				}, function errorCallback(response) {
					msg.textContent($translate.instant('MSG_CONTACT_US'));
					$mdDialog.show(msg);
				});
		}

		vm.gridOptionsHistorico = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [5, 15, 30, 50],
			paginationPageSize: 5,
			treeRowHeaderAlwaysVisible: true,
			columnDefs: [
				{field: 'FT_CAMBIO', displayName: 'Fecha cambio', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' }, cellTooltip: function (row) {return moment(row.entity.FT_CAMBIO).format('DD/MM/YYYY')}, cellFilter: 'date:\'dd/MM/yyyy\'',},
				{field: 'LST_CAMBIOS.NO_RUTA_CAMPO', displayName: 'Campo modificado', cellTooltip: function (row) {return row.entity.LST_CAMBIOS.NO_RUTA_CAMPO},},
				{field: 'LST_CAMBIOS.NO_VALOR_ANTERIOR', displayName: 'Valor anterior', cellTooltip: function (row) {return row.entity.LST_CAMBIOS.NO_VALOR_ANTERIOR},},
				{field: 'LST_CAMBIOS.NO_VALOR_NUEVO', displayName: 'Valor nuevo',}
			]
		}

		vm.cargarHistoricoComunicaciones = function () {

			let id_poliza = vm.dato.ID_POLIZA;
			
			// vm.appParent.abrirModalcargar(true);
    		PolizaService.getHistoricoComunicacionesPoliza(id_poliza)
			.then(function successCallback(response){
				if(response.data.ID_RESULT == 0 && response.data.COMUNICACIONES != null && response.data.COMUNICACIONES.length > 0){
                 	vm.gridOptionsHistoricoComunicaciones.data = response.data.COMUNICACIONES;
					if (vm.gridOptionsHistoricoComunicaciones.data != null) {
						for(let i= 0; i<vm.gridOptionsHistoricoComunicaciones.data.length; i++){
							vm.gridOptionsHistoricoComunicaciones.data[i].js_envio_des = JSON.parse(vm.gridOptionsHistoricoComunicaciones.data[i].js_envio);
							
							let js_envio_des = JSON.parse(vm.gridOptionsHistoricoComunicaciones.data[i].js_envio);
							js_envio_des.destination[0] = js_envio_des.destination[0].replace(/["]/g, "");; 
							vm.gridOptionsHistoricoComunicaciones.data[i].js_envio_desc = js_envio_des;
						}					
					}
				} 
			},function errorCallback(response){
				msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
				$mdDialog.show(msg);
			});
    	}
    	
    	vm.gridOptionsHistoricoComunicaciones = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [5,15,30,50],
    		    paginationPageSize: 5,
				
    		    columnDefs: [
					{field: 'type_Envio', displayName: 'Tipo de Comunicación'},
					//{field: 'FD_EMISION', displayName: 'Fecha emisión',  cellFilter: 'date:\'dd/MM/yyyy\'',}
					{field: 'FT_USU_MOD', displayName: 'Fecha de envío',  cellFilter: 'date:\'dd/MM/yyyy HH:mm:ss\'',},
					{field: 'js_envio_des.destination[0]', displayName: 'Destinatario'},
					{field: 'id_envio', displayName: 'Comunicación', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarComunicacion(row.entity.id_envio, row)">Descargar</a></div>'}
				  ]
    	}
    	
    	
    	vm.descargarComunicacion = function(id_envio){
			PolizaService.descargarComunicacionesPolizaCliente(id_envio)
				.then(function successCallback(response) {
					if (response.status == 200) {
						var bytes = new Uint8Array(response.data.file);
						var decoder = new TextDecoder('utf-8');
						var contenidoHTML = decoder.decode(bytes);
						var blob = new Blob([contenidoHTML], {type: 'text/html'});
						var url = URL.createObjectURL(blob);
						var link = document.createElement('a');
						link.href = url;
						link.download = response.data.name + '.' + response.data.type;
						link.click();
						URL.revokeObjectURL(url);
					} else {
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					}
				}, function errorCallback(response) {
					msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
					$mdDialog.show(msg);
				});
		}

		//Recuperar los ramos por una aseguradora
		vm.getRamos = function (value) {
			TiposService.getRamoCompania({"ID_COMPANIA": value, "IN_TARIFICABLE": true})
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (Array.isArray(response.data.CIARAMOS.CIA_RAMO)) {
							vm.tipos.ramos = response.data.CIARAMOS.CIA_RAMO;
						} else {
							vm.tipos.ramos = [];
							vm.tipos.ramos.push(response.data.CIARAMOS.CIA_RAMO);
						}

					}
				})
			vm.dato.ID_RAMO = undefined;
			vm.dato.ID_COMP_RAMO_PROD = undefined;
			if (vm.form.ID_RAMO != undefined) {
				vm.form.ID_RAMO.value = "";
			}
			if (vm.form.ID_PRODUCTO != undefined) {
				vm.form.ID_PRODUCTO.value = "";
			}
			vm.tipos.productos = undefined;
		}

		//Recuperar los productos por una aseguradora
		vm.getProductos = function (compania, ramo) {
			TiposService.getCompRamoProd({"ID_COMPANIA": compania, "ID_RAMO": ramo})
				.then(function successCallBack(response) {
					if (response.status == 200) {
						if (response.data.CIARAMOS != undefined) {
							if (Array.isArray(response.data.CIARAMOS.CIA_RAMO)) {
								vm.tipos.productos = response.data.CIARAMOS.CIA_RAMO;
							} else {
								vm.tipos.productos = [];
								vm.tipos.productos.push(response.data.CIARAMOS.CIA_RAMO);
							}
						}
					}
				})

			if (vm.form.ID_PRODUCTO != undefined) {
				vm.form.ID_PRODUCTO.value = "";
			}

			vm.dato.ID_COMP_RAMO_PROD = undefined;
		}

		//Buscar un cliente
		vm.buscarCliente = function (value) {
		}

		//Añadir nuevo asegurado
		vm.addAsegurado = function (tipoAsegurado) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/buscar_cliente.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;

					md.buscarCliente = function (json) {
						md.cargar = true;
						if (json['NU_DOCUMENTO'] != undefined && json['NU_DOCUMENTO'] != "") {
							json['NU_DOCUMENTO'] = json['NU_DOCUMENTO'].toUpperCase();
						} else
							delete json['NU_DOCUMENTO'];

						if (json['NO_NOMBRE_COMPLETO'] == undefined || json['NO_NOMBRE_COMPLETO'] == "")
							delete json['NO_NOMBRE_COMPLETO'];

						ClienteService.getClientes(json)
							.then(function successCallBack(response) {
								if (response.data.NUMERO_CLIENTES > 0) {
									md.clientes = response.data.CLIENTES.CLIENTE;
									md.vista = 0;
								} else
									md.vista = 3;
								md.cargar = false;
							}, function errorCallBack(response) {
								md.cargar = false;
								msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
								$mdDialog.show(msg);
							})

					}

					md.anadirAsegurado = function (cliente) {
						cliente.DS_TIPO_CLIENTE = tipoAsegurado;
						switch (tipoAsegurado) {
							case 'Asegurado':
								if (vm.dato.conductor == undefined) {
									vm.dato.conductor = [];
								}
								if (vm.dato.asegurados == undefined) {
									vm.dato.asegurados = [];
								}
								cliente.ID_TIPO_CLIENTE = 2;
								vm.dato.conductor.push(cliente);
								vm.dato.asegurados.push(cliente);
								break;
							case 'Tomador':
								cliente.ID_TIPO_CLIENTE = 3;
								vm.dato.tomador = cliente;
								vm.dato.pagador = JSON.parse(JSON.stringify(cliente));
								vm.dato.pagador.ID_TIPO_CLIENTE = 1;
								vm.dato.pagador.DS_TIPO_CLIENTE = 'Pagador';
								break;
							case 'Pagador':
								/*
                                // PAGADOR = TOMADOR, EN SD?
                                cliente.ID_TIPO_CLIENTE = 1;
                                vm.dato.pagador = cliente;
                                */
								break;
						}


						$mdDialog.hide();
					}
					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						$mdDialog.cancel();
					};

					md.answer = function (answer) {
						$mdDialog.hide(answer);
					};

				}]
			})

			// if(!Array.isArray(vm.dato.conductor)){
			// vm.dato.conductor = [];
			// vm.dato.asegurados = [];
			// vm.searchAsegurado = [];
			// }
			// vm.dato.conductor.push({"NO_NOMBRE_COMPLETO":""});
			// vm.searchAsegurado[vm.dato.conductor.length-1] = "";
		}

		//Autocompleto Async
		vm.querySearch = function (query) {
			if (query.length >= 3) {
				var deferred = $q.defer();
				BusquedaService.buscar({"NO_NOMBRE_COMPLETO": query}, "clientes")
					.then(function successCallback(response) {
						if (response.data.NUMERO_CLIENTES > 0) {
							vm.clientes = response.data.CLIENTES.CLIENTE;
							deferred.resolve(response.data.CLIENTES.CLIENTE);
						} else {
							vm.clientes = [];
						}

					});
				return deferred.promise;
			} else {
				vm.clientes = [];
			}
		}

		//Deshacer el formulario modificado
		vm.deshacer = function () {
			vm.dato = JSON.parse(backupJSON);
			vm.parent.idDetalle.NU_POLIZA = vm.dato.NU_POLIZA;
		}

		//Guardar o editar poliza
		vm.guardar = function (isNuevo) {
			// var json = rellenarJSON(vm.dato);
			var pagadorOK = false;
			var tomadorOK = false;
			if (isNuevo) {
				if (!vm.isError) {
					vm.dato.LST_ASEGURADOS = [];
					vm.dato.LST_ASEGURADOS.push(vm.dato.tomador);
					vm.dato.LST_ASEGURADOS.push(vm.dato.pagador);
					if (vm.dato.asegurados != undefined) {
						for (var i = 0; i < vm.dato.asegurados.length; i++) {
							vm.dato.LST_ASEGURADOS.push(vm.dato.asegurados[i]);
						}
					}
					/* // POR AHORA NO SE PUEDEN AÑADIR GARANTÍAS AL NO TENER ASEGURADORAS
					if(vm.garantias != undefined && vm.garantias != null && vm.garantias.length > 0) {
						vm.dato.LST_GARANTIAS = [];
						for(var i=0; i < vm.garantias.length; i++) {
							vm.dato.LST_GARANTIAS.push(vm.garantias[i]);
						}
					}
					*/
					// Objeto póliza a enviar al servicio, eliminando datos de figuras sobrantes
					vm.poliza = JSON.parse(JSON.stringify(vm.dato));
					vm.eliminarFiguras(vm.poliza);

					if (vm.poliza.LST_ASEGURADOS.length > 0) {
						for (var i = 0; i < vm.poliza.LST_ASEGURADOS.length; i++) {
							if (vm.poliza.LST_ASEGURADOS[i] != null) {
								if (vm.poliza.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 1) {
									pagadorOK = true;
								} else if (vm.poliza.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3) {
									tomadorOK = true;
								}
							}
						}

						if (pagadorOK != undefined && pagadorOK == true && tomadorOK != undefined && tomadorOK == true) {
							// && vm.poliza.LST_GARANTIAS != undefined && vm.poliza.LST_GARANTIAS.length > 0) {
							vm.appParent.abrirModalcargar(true);
							PolizaService.addPoliza(vm.poliza)
								.then(function successCallBack(response) {
									if (response.status == 200) {
										if (response.data.ID_RESULT == 0) {
											vm.appParent.cambiarDatosModal('Se ha guardado correctamente');
											/* PRUEBAS NUEVA PESTAÑA */
											vm.polizaCreada = response.data;
											if (vm.busquedaPoliza.numDetalles.length > 0) {
												vm.busquedaPoliza.numDetalles.splice(0, 1);
											}
											vm.busquedaPoliza.numDetalles.push(vm.polizaCreada);
										} else {
											msg.textContent(response.data.DS_RESULT);
											$mdDialog.show(msg);
										}
									}
								}, function errorCallBack(response) {
									vm.appParent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
								})
						} else {
							if (pagadorOK == false || tomadorOK == false) {
								msg.textContent('No se ha añadido el tomador');
								$mdDialog.show(msg);
							}
						}
					}
					// vm.appParent.abrirModalcargar(true);
					// PolizaService.addPoliza(vm.poliza)
					// .then(function successCallBack(response){
					// 	if(response.status == 200) {
					// 		vm.appParent.cambiarDatosModal('Se ha guardado correctamente');
					// 	}
					// }, function errorCallBack(response){
					// 	vm.appParent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros..');
					// })
				}
			} else {
				//json.ID_POLIZA = vm.dato.ID_POLIZA;
				//json.IT_VERSION = vm.dato.IT_VERSION;
				if (!vm.isError) {
					vm.dato.LST_ASEGURADOS = [];
					vm.dato.LST_ASEGURADOS.push(vm.dato.tomador);
					vm.dato.LST_ASEGURADOS.push(vm.dato.pagador);
					for (var i = 0; i < vm.dato.asegurados.length; i++) {
						vm.dato.LST_ASEGURADOS.push(vm.dato.asegurados[i]);
					}

					for (var campo in vm.dato) {
						if (vm.dato[campo] != null && vm.dato[campo] instanceof Date) {
							vm.dato[campo] = moment(vm.dato[campo]).format('YYYY-MM-DD');
						}
					}

					// Objeto póliza a enviar al servicio, eliminando datos de figuras sobrantes
					vm.poliza = JSON.parse(JSON.stringify(vm.dato));
					vm.eliminarFiguras(vm.poliza);

					vm.appParent.abrirModalcargar(true);
					PolizaService.editarPoliza(vm.poliza)
						.then(function successCallBack(response) {
							vm.dato.IT_VERSION = response.data.IT_VERSION;
							if (response.status == 200) {
								if (response.data.ID_RESULT == 0) {
									vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
								} else {
									msg.textContent(response.data.DS_RESULT);
									$mdDialog.show(msg);
								}
							}
						}, function errorCallBack(response) {
							vm.appParent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros..');
						})

				}
			}
		}

		vm.eliminarFiguras = function (obj) {
			for (atr in obj) {
				if (atr == 'tomador' || atr == 'pagador' || atr == 'asegurados' || atr == 'conductor') {
					delete obj[atr];
				}
			}
		}

		//Abrir modal
		function abrir(status) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/accept.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.tipos = {};

					var md = this;

					this.$onInit = function () {
						if (status == 200) {
							md.msg = $translate.instant('MSG_EDITED_SUCCESS')
						} else {
							md.msg = "En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros."
						}
					}

					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						$mdDialog.cancel();
					};

					md.answer = function (answer) {
						$mdDialog.hide(answer);
					};

				}]
			})
		}

		vm.descargarPoliza = function () {
			var valor = vm.dato.ID_POLIZA;
			var valor = vm.dato.ID_POLIZA;
			if (vm.dato.ID_COMP_RAMO_PROD == 10 || vm.dato.ID_COMP_RAMO_PROD == 11 || vm.dato.ID_COMP_RAMO_PROD == 12 || vm.dato.ID_COMP_RAMO_PROD == 33 || vm.dato.ID_COMP_RAMO_PROD == 34) {
				vm.appParent.abrirModalcargar(true);
				MovilService.condiciones(vm.dato.NU_POLIZA)
					.then(function successCallback(response) {

						if (response.status == 200) {
							let utf8decoder = new TextDecoder();
							var mensajeUArchivo = utf8decoder.decode(response.data);
							if (mensajeUArchivo.search('code') != -1 && mensajeUArchivo.search('msg') != -1) {
								var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
								if (objtMensajeUArchivo.code != 0) {
									vm.cargando = false;
									msg.textContent(objtMensajeUArchivo.msg);
									$mdDialog.show(msg);
								}
							} else {
								vm.cargar = false;
								saveAs(new Blob([response.data]), vm.dato.NU_POLIZA + ".pdf");
								msg.textContent("Se ha descargado correctamente");
								$mdDialog.show(msg);
							}
						} else {
							msg.textContent(response.data.msg);
							$mdDialog.show(msg);
						}
					}, function (error) {
						if ((error.status == 400 || error.status == 500) && error.data.error != null && error.data.error.codigoErrorNegocio != null) {
							msg.textContent("CODERRROR-" + error.data.error.codigoErrorNegocio + " DESC: " + error.data.error.descripcionErrorNegocio);
						} else {
							msg.textContent('Se ha producido un error al descargar las condiciones');
						}
						$mdDialog.show(msg);
						vm.appParent.abrirModalcargar(false);
					});
			} else {
				if (vm.dato.tomador != undefined && vm.dato != undefined) {

					// if((vm.dato.ID_COMP_RAMO_PROD == 5 || vm.dato.ID_COMP_RAMO_PROD == 6 || vm.dato.ID_COMP_RAMO_PROD == 29) && (vm.rol == 1 || vm.rol == 4)) {
					// 	vm.dialogDownloadPDF();
					// } else {
					DescargaService.getCondiciones(vm.dato.tomador, valor, vm.dato.NU_POLIZA);
					// }

				} else {
					msg.textContent("No se dispone de ninguna información para exportar esta póliza");
					$mdDialog.show(msg);
				}
			}
		}

		//Rellenar JSON
		function rellenarJSON(form) {
			var json = {};
			vm.isError = false;
			angular.forEach(vm.dictionary, function (value, key) {
				//angular.forEach(form, function(data,key2){
				if (!vm.isError) {
					if (form[key] == undefined || form[key] == null) {
						vm.isError = true;
						if (key == "FD_CANCELACION") {
							if (form[key] != 2)
								vm.isError = false;
						}
						if (key == "tomador" || key == "pagador" || key == "asegurados") {
							if (form[key] == undefined || form[key] == null) {
								$mdDialog.show({
									templateUrl: BASE_SRC + 'detalle/detalle.modals/polizas.modal.html',
									controllerAs: '$ctrl',
									clickOutsideToClose: true,
									parent: angular.element(document.body),
									fullscreen: false,
									controller: ['$mdDialog', function ($mdDialog) {
										var md = this;

										md.irAlTomador = function () {
											vm.showTable = 3;
											$mdDialog.cancel();
										}

										md.hide = function () {
											$mdDialog.hide();
										};

										md.cancel = function () {
											$mdDialog.cancel();
										};

										md.answer = function (answer) {
											$mdDialog.hide(answer);
										};

									}]
								})
							}
						}
					} else {
						if (key == "tomador")
							form[key].ID_TIPO_CLIENTE = 3;
						else if (key == "pagador")
							form[key].ID_TIPO_CLIENTE = 1;
						else if (key == "asegurados") {
							for (var i = 0; i < form[key].length; i++) {
								form[key][i].ID_TIPO_CLIENTE = 2;
							}
						}
						vm.isError = false;
					}
				}
			});
		}

		vm.openRecibo = function () {
			var uibModalInstance = $uibModal.open({
				template: '<detalle-poliza-modal></detalle-poliza-modal>',
				plain: true,
				size: 'lg',
				windowClass: 'app-modal-window',
				component: 'detallePolizaModal'
				/*controllerAs: 'md',
                controller: ['$scope', function($scope,$uibModalInstance){
                    var md=this;
                    md.poliza=vm.dato;
                    md.db=vm.db;

                    md.crearRecibo = function(){
                        angular.forEach(md.recibo, function(data, key) {
                            if (dict != undefined && dict.required) {
                                if (value == "") {
                                    data.$error['required'] = 'Campo obligatorio';
                                }
                            }
                        });

                        $scope.cancel = function(){
                            $uibModalInstance.dismiss('cancel');
                        };
                    };
                }]*/
			});
		}

		vm.openNewSolicitud = function (tipo) {
			vm.nuevaSolicitud = [];
			var busqueda = "busquedaPoliza";
			if (/solicitudes/.test(url)) {
				busqueda = "busquedaSolicitudes";
			}

			//    if (tipo == 5) {
			//    vm[busqueda].heading = "Baja póliza";
			//    vm[busqueda].headTipo = tipo
			//    }
			//    else if (tipo == "modificacion") {
			//    vm[busqueda].heading = "Modificación de póliza";
			//    vm[busqueda].headTipo = tipo;
			//    vm[busqueda].datosPoliza = vm.dato;
			//    }
			vm[busqueda].heading = vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == tipo).DS_TIPO_SOLICITUD;
			vm[busqueda].headTipo = tipo;
			vm[busqueda].datosPoliza = vm.dato;
			vm[busqueda].numDetalles.push(null);
			vm[busqueda].nomDetalles.push('solicitud');
			vm[busqueda].active = vm[busqueda].numDetalles.length;
		}

		//recuperar documentación ya subida (desde padre)
		vm.getDocuments = function (idPolizaProp) {
			if (vm.json != null && vm.json.OPOLIZA != null && vm.json.OPOLIZA.ID_POLIZA != null) {
				var idPoliza = null;

				if (idPolizaProp != null) {
					idPoliza = idPolizaProp;
				} else {
					idPoliza = vm.json.OPOLIZA.ID_POLIZA;
				}

				var ruta = 'polizas/' + idPoliza;
				vm.cargarArchivos = true;
				FicherosService.getFicherosType({"ID_TIPO": 225, "NO_RUTA": ruta})
					.then(function successCallback(response) {
						if (response.status == 200) {
							if (response.data.ID_RESULT == 0) {
								vm.listaArchivos = response.data.RESULT;

								if (vm.listaArchivos != null && vm.listaArchivos.length > 0) {
									for (var i = 0; i < vm.listaArchivos.length; i++) {
										if (vm.listaArchivos[i].ID_TIPO_ARCHIVO != null) {
											var tipoArchivo = vm.tipos.archivoPoliza.find(x => x.ID_TIPOS == vm.listaArchivos[i].ID_TIPO_ARCHIVO);
											if (tipoArchivo != null) {
												vm.listaArchivos[i].NO_TIPO_ARCHIVO = tipoArchivo.DS_TIPOS;
											} else {
												vm.listaArchivos[i].NO_TIPO_ARCHIVO = null;
											}
										}
									}
								}
							} else {
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
							}
						}
						vm.cargarArchivos = false;
					}, function errorCallback(response) {
						if (response.status == 406 || response.status == 401) {
							vm.busqueda.logout();
						}
						msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
						$mdDialog.show(msg);
						vm.cargarArchivos = false;
					});
			}
		}

		//meter desde lista padre los documentos recuperados
		vm.refreshList = function () {
			if (vm.appParent.archives_polizas != null) {
				for (var i = 0; i < vm.appParent.archives_polizas.length; i++) {
					if (!vm.listaArchivos.find(archivo => archivo.ID_ARCHIVO === vm.appParent.archives_polizas[i].ID_ARCHIVO))
						vm.listaArchivos.push(vm.appParent.archives_polizas[i]);
					else
						break;
				}
			}
		}

		//Abrir historico de un cliente
		vm.openHistory = function (nuDocumento, ev) {
			$mdDialog.show({
				controller: PolizaModalController,
				templateUrl: BASE_SRC + 'detalle/detalle.modals/poliza_historico.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				targetEvent: ev,
				fullscreen: false
			})
		}

		function PolizaModalController($scope, $mdDialog) {
			var md = this;

			//UI.GRID Configurado
			md.gridPolizaHistoricos = {
				enableSorting: true,
				enableHorizontalScrollbar: 0,
				paginationPageSizes: [15, 30, 50],
				paginationPageSize: 15,
				columnDefs: [
					{field: 'NU_POLIZA', displayName: 'Póliza'},
					{field: 'DS_SITUAPOLIZA', displayName: 'Estado'},
					{field: 'DS_FORMAPAGO', displayName: 'Periodicidad'},
					{field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Vía de pago'},
					{field: 'DS_TIPO_POLIZA', displayName: 'Colectivo'},
					{field: 'NO_COMPANIA', displayName: 'Aseguradora'},
					{field: 'NO_RAMO', displayName: 'Ramo'},
					{field: 'FT_USU_ALTA', displayName: 'Creado en', cellFilter: 'date:\'dd/MM/yyyy\'',},
					{field: 'NO_USU_ALTA', displayName: 'Creado por', cellFilter: 'date:\'dd/MM/yyyy\'',},
					{field: 'FD_EMISION', displayName: 'Fecha emisión', cellFilter: 'date:\'dd/MM/yyyy\'',},
					{field: 'FD_VENCIMIENTO', displayName: 'Fecha efecto', cellFilter: 'date:\'dd/MM/yyyy\'',}
				]
			}

			var json = {
				"ID_POLIZA": vm.dato.ID_POLIZA,
				"IS_SELECTED": true
			};

			BusquedaService.buscar(json, "polizas")
				.then(function successCallback(response) {
					var clientes = [];
					if (response.status === 200) {
						//No reconoce getClientes, utilizo response.data - Preguntar
						var respuesta = response.data;

						if (respuesta.NUMERO_POLIZAS > 0) {
							polizas = respuesta.POLIZAS.POLIZA;
							sharePropertiesService.set('polizas', polizas);
							md.totalItems = respuesta.NUMERO_POLIZAS;
							md.gridPolizaHistoricos.data = sharePropertiesService.get('polizas');
						}
					}
				}, function errorCallback(response) {
					vm.completed = "";
					vm.mensajeBuscar = true;
					vm.loading = false;
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
					msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
					$mdDialog.show(msg);
				});

			md.hide = function () {
				$mdDialog.hide();
			};

			md.cancel = function () {
				$mdDialog.cancel();
			};

			md.answer = function (answer) {
				$mdDialog.hide(answer);
			};
		}

		//Subir documentación
		$(document).on('change', '#file_pol_firmada', function (e) {
			if (e) {
				$scope.$apply();
				if (document.getElementById('file_pol_firmada').files != null && document.getElementById('file_pol_firmada').files.length > 0 != null) {

					for (var i = 0; i < document.getElementById('file_pol_firmada').files.length; i++) {
						var f = document.getElementById('file_pol_firmada').files[i];

						if (e.target != null && e.target.dataset != null && e.target.dataset.tipoArchivo != null) {
							vm.tipoArchivo = JSON.parse(e.target.dataset.tipoArchivo);
						} else {
							vm.tipoArchivo = null;
						}

						var idPoliza = null;
						if (e.target != null && e.target.dataset != null && e.target.dataset.idPoliza != null) {
							idPoliza = e.target.dataset.idPoliza;
						}

						var datosPoliza = [];
						if (e.target != null && e.target.dataset != null && e.target.dataset.datosPoliza != null) {
							vm.dato = JSON.parse(e.target.dataset.datosPoliza);
						}

						if (vm.tipoArchivo != null && vm.tipoArchivo != undefined) {

							vm.idTipoArchPol = vm.tipoArchivo.ID_TIPOS;
							vm.nombreArchivoMov = f.name;
							vm.archivo = null;
							vm.listaArchivos = []

							var reader = new FileReader();
							reader.filename = f.name;

							reader.onload = function (readerEvt) {

								var base64 = reader.result.split("base64,")[1];
								var binary_string = window.atob(base64);
								var len = binary_string.length;
								var bytes = [];
								for (var i = 0; i < len; i++) {
									bytes.push(binary_string.charCodeAt(i));
								}
								var archivo = bytes;
								var fileName = readerEvt.target.filename;
								fileName = fileName.split(".");
								if (fileName.length > 1) {
									// fileName[0] = vm.appParent.changeSpecialCharacters(fileName[0]);
									for (var i = 0; i < fileName.length; i++) {
										fileName[i] = vm.appParent.changeSpecialCharacters(fileName[i]);
									}
								}
								fileName = fileName.join('.');

								vm.listaArchivos.push({
									"DESCARGAR": false,
									"ARCHIVO": bytes,
									"ID_TIPO": 225,
									"NO_ARCHIVO": fileName,
									'ESTADO': 'Pendiente',
									'ID_TIPO_ARCHIVO': vm.idTipoArchPol != null ? vm.idTipoArchPol : null,
									'NO_TIPO_ARCHIVO': vm.idTipoArchPol != null ? vm.tipoArchivo.DS_TIPOS : null
								});

								$scope.$apply();

								vm.uploadFiles(idPoliza);
								// vm.subirFicheros();
							}

							reader.readAsDataURL(f);
						} else {
							vm.msg.textContent("Debes de seleccionar un tipo de archivo");
							$mdDialog.show(vm.msg);
						}
					}

					e.stopImmediatePropagation();
				}
			}


			// if(e) {
			// 	$scope.$apply();

			// 	$timeout(
			// 		function(){

			// 			if (e.target != null && e.target.dataset != null && e.target.dataset.tipoArchivo != null) {
			// 				vm.tipoArchivo = JSON.parse(e.target.dataset.tipoArchivo);
			// 			} else {
			// 				vm.tipoArchivo = null;
			// 			}

			// 			if(vm.tipoArchivo != null && vm.tipoArchivo != undefined){
			// 				vm.idPoliza = vm.json.OPOLIZA.ID_POLIZA;
			// 				$scope.$apply();
			// 				if(document.getElementById('file_pol_firmada').files[0] != null){
			// 					var file = document.getElementById('file_pol_firmada').files[0];

			// 					var reader = new FileReader();
			// 					vm.idArchivo = 225;
			// 					vm.idTipoArchPol = vm.tipoArchivo.ID_TIPOS;
			// 					vm.archivo = {};

			// 					if(file != null){
			// 						nam = file.name;
			// 						phrase = nam.split('.');
			// 			        	nameA = phrase[0];
			// 			        	extension = phrase[1];
			// 			        	name = vm.appParent.changeSpecialCharacters(nameA);
			// 			        	archivoName =  name +"."+ extension;

			// 				        reader.onload = function(){
			// 				        	if(Object.keys(vm.archivo).length === 0){	

			// 								var base64 = reader.result.split("base64,")[1];
			// 								var binary_string = window.atob(base64);
			// 							    var len = binary_string.length;
			// 							    var bytes = [];
			// 							    for (var i = 0; i < len; i++) {
			// 							        bytes.push(binary_string.charCodeAt(i));
			// 							    }

			// 							    vm.archivo = {	
			// 							    	"DESCARGAR": false,
			// 						        	"ARCHIVO": bytes,
			// 									"ID_TIPO": vm.idArchivo,
			// 									"NO_ARCHIVO": archivoName,
			// 									'ESTADO': 'Pendiente'
			// 						        };

			// 							    if(vm.idTipoArchPol != null && vm.idTipoArchPol != undefined) {
			// 							    	vm.archivo.ID_TIPO_ARCHIVO = vm.idTipoArchPol;
			// 							    	vm.archivo.NO_TIPO_ARCHIVO = vm.tipoArchivo.DS_TIPOS;
			// 							    }

			// 							    vm.listaArchivos = [];
			// 		                        vm.listaArchivos.push(vm.archivo);
			// 					 		    $scope.$apply();
			// 		                        vm.uploadFiles(vm.listaArchivos, 'polizas', vm.idPoliza, null, vm.refData);

			// 							}
			// 						}
			// 			        	reader.readAsDataURL(file);
			// 					}
			//                     e.stopImmediatePropagation();

			// 				}		
			// 			}else{
			// 				vm.msg.textContent("Debes de seleccionar un tipo de archivo");
			// 	            $mdDialog.show(vm.msg);
			//                 e.stopImmediatePropagation();
			// 			}
			// 		},
			// 	1);
			// }
		});

		//enviar documentación
		vm.uploadFiles = function (idPoliza) {
			obj = {};
			obj.OPOLIZA = {};
			vm.listArchivosPend = [];

			for (var a = 0; a < vm.listaArchivos.length; a++) {
				if (vm.listaArchivos[a].ESTADO === "Pendiente") {
					vm.listArchivosPend.push(vm.listaArchivos[a]);
				}
			}

			obj.ID_POLIZA = idPoliza;
			obj.FICHEROS = vm.listArchivosPend;
			document.getElementById("file_pol_firmada").value = null;

			if ((obj.FICHEROS != null && obj.FICHEROS != undefined) || (obj.LIST_ARCHIVOS != null && obj.LIST_ARCHIVOS != undefined) || (vm.listArchivosPend[0] != null && vm.listArchivosPend[0] != undefined)) {

				vm.appParent.abrirModalcargar(true);

				FicherosService.sendDocumentation(obj, 'polizas')
					.then(function successCallback(response) {
						if (response.status == 200) {
							if (response.data.ID_RESULT == 0) {
								msg.textContent("Ficheros subidos correctamente al sistema.");
								$mdDialog.show(msg);
								vm.listaArchivos = [];
								vm.getDocuments(idPoliza);
							} else {
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
							}
						}
					}, function errorCallback(response) {
						msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
						$mdDialog.show(msg);
					});
			} else {
				msg.textContent('Debes seleccionar al menos un archivo para subir.');
				$mdDialog.show(msg);
			}
		}

		vm.descargarArchivo = function (file) {
			vm.appParent.abrirModalcargar(true);
			ExportService.downloadFile(file.ID_ARCHIVO)
				.then(function successCallback(response) {
					if (response.status === 200) {
						saveAs(new Blob([response.data]), file.NO_ARCHIVO);
					}
					msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
					$mdDialog.show(msg);
				}, function callBack(response) {
					msg.textContent("Se ha producido un error al descargar el archivo");
					$mdDialog.show(msg);
					vm.cargarArchivos = false;
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});
		};

		vm.deleteFile = function (file) {
			for (var i = 0; i < vm.listaArchivos.length; i++) {
				if (vm.listaArchivos[i].NO_ARCHIVO === file.NO_ARCHIVO && vm.listaArchivos[i].ID_ARCHIVO === file.ID_ARCHIVO) {
					vm.listaArchivos.splice(i, 1);
					break;
				}
			}
			for (var i = 0; i < vm.appParent.listArchivos.length; i++) {
				if (vm.appParent.listArchivos[i].NO_ARCHIVO === file.NO_ARCHIVO && vm.listaArchivos[i].ID_ARCHIVO === file.ID_ARCHIVO) {
					vm.appParent.listArchivos.splice(i, 1);
					break;
				}
			}
			if (file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined) {
				vm.appParent.deleteArchive(file.ID_ARCHIVO);
			}
		}

		//Refrescar lista de archivos
		vm.refData = function () {
			$scope.$apply();

			$timeout(
				function () {
					vm.listaArchivos = [];
					for (var i = 0; i < vm.appParent.listArchivos.length; i++) {
						vm.listaArchivos.push(vm.appParent.listArchivos[i]);
					}
					//    $scope.$apply();
					$timeout(function () {
						$scope.$apply();
					}, 500);
				},
				1);
		}

		vm.openNewSiniestro = function () {
			var busqueda = "busquedaPoliza";
			if (vm.busquedaPoliza == null && vm.busquedaSolicitudes != null) {
				busqueda = "busquedaSolicitudes";
			}
			vm[busqueda].numDetalles.push(null);
			vm[busqueda].nomDetalles.push('siniestro');
			vm[busqueda].active = vm[busqueda].numDetalles.length;
		}
		vm.openNewDominio = function () {
			var busqueda = "busquedaPoliza";
			if (vm.busquedaPoliza == null && vm.busquedaSolicitudes != null) {
				busqueda = "busquedaSolicitudes";
			}
			vm[busqueda].numDetalles.push(null);
			vm[busqueda].nomDetalles.push('dominio');
			vm[busqueda].active = vm[busqueda].numDetalles.length;
		}
		vm.confirmarSuspenderPoliza = function (tipo) {
			vm.loadConfirm = true;
			PolizaService.confirm(tipo, {"policyNumber": vm.dato.NU_POLIZA})
				.then(function successCallback(response) {
					if (response.data.code != 0) {
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					} else {
						vm.getPolizaDetail(true);
						// vm.getPolizaDetail();
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					}
					vm.loadConfirm = false;
				}, function callBack(response) {
					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
						vm.msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
						$mdDialog.show(vm.msg);
					} else {
						vm.msg.textContent("Se ha producido un error");
						$mdDialog.show(vm.msg);
					}
					vm.loadConfirm = false;
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});
		}

		vm.sendDocumentacionSM = function () {
			vm.showDocumentacionSM = !vm.showDocumentacionSM;
		}

		vm.dlExtension = function () {
			vm.loading = true;
			var extension = true;
			PolizaService.getCondicionesPol(vm.dato.ID_POLIZA, extension)
				.then(function successCallback(response) {
					if (response.status == 200) {
						let utf8decoder = new TextDecoder();
						var mensajeUArchivo = utf8decoder.decode(response.data);
						if (mensajeUArchivo.search('ID_RESULT') != -1) {
							var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
							if (objtMensajeUArchivo.ID_RESULT != 0) {
								vm.cargando = false;
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
							}
						} else {
							vm.loading = false;
							saveAs(new Blob([response.data]), 'extension_ciberdelincuencia.pdf');
							// vm.appParent.abrirModalcargar();
						}
					} else {
						msg.textContent('Se ha producido un error al descargar la extensión de ciberdelincuencia');
						$mdDialog.show(msg);
					}
					// vm.appParent.abrirModalcargar(false);
				}, function (error) {
					msg.textContent('Se ha producido un error al descargar la extensión de ciberdelincuencia');
					$mdDialog.show(msg);
					// vm.appParent.abrirModalcargar(false);
				});
			//  window.open('src/documentos/extension_ciberdelincuencia.pdf', '_blank');
		}

		vm.mostrarBtnNuevoSiniestro = function () {
			var listProductosAceptados = [3, 4, 5, 6, 25, 28, 29, 19, 32];
			if (vm.dato != null && vm.dato.ID_COMP_RAMO_PROD != null && listProductosAceptados.includes(vm.dato.ID_COMP_RAMO_PROD) && vm.dato.ID_SITUAPOLIZA == 1 && vm.readOnly != true && vm.parent.pre.getPermissions('siniestros_list').IN_ESCRITURA == true) {
				return true;
			} else return false;
		}

		vm.mostrarBtnNuevoDominio = function () {
			var listProductosAceptados = [5, 6];
			if (vm.dato != null && vm.dato.ID_COMP_RAMO_PROD != null && listProductosAceptados.includes(vm.dato.ID_COMP_RAMO_PROD) && vm.dato.ID_SITUAPOLIZA == 1 && vm.readOnly != true && vm.permisos.IN_ESCRITURA) {
				return true;
			} else return false;
		}

		vm.showNewReqBtn = function () {
			var lstProducts = [3, 4, 5, 6, 19];
			if (vm.dato && vm.dato.ID_COMP_RAMO_PROD && lstProducts.includes(vm.dato.ID_COMP_RAMO_PROD) && vm.readOnly != true && vm.parent.pre.getPermissions('solicitudes_list').EXISTE) {
				return true;
			} else if (vm.dato && vm.dato.ID_COMP_RAMO_PROD && vm.dato.ID_COMP_RAMO_PROD != 3 && vm.dato.ID_COMP_RAMO_PROD != 4 && vm.dato.ID_COMP_RAMO_PROD != 5 && vm.dato.ID_COMP_RAMO_PROD != 6 && vm.dato.ID_COMP_RAMO_PROD != 19 && vm.parent.pre.getPermissions('solicitudes_list').EXISTE) {
				return true;
			} else return false;
		}

		vm.enviarPolizaPdf = function () {
			var regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

			if (vm.emailDocumentacionSM != null && vm.emailDocumentacionSM.length > 0) {
				if (regex.test(vm.emailDocumentacionSM) == false) {
					msg.textContent("Introduzca el email correctamente");
					$mdDialog.show(msg);
					return null;
				}
			}

			if (vm.dato.ID_COMP_RAMO_PROD != 10 && vm.dato.ID_COMP_RAMO_PROD != 11 && vm.dato.ID_COMP_RAMO_PROD != 12 && vm.dato.ID_COMP_RAMO_PROD != 33 && vm.dato.ID_COMP_RAMO_PROD != 34   ) {
				var valor = vm.dato.ID_POLIZA;
				if (vm.dato.tomador != undefined && vm.dato != undefined)
					DescargaService.sendCondiciones(vm.dato.tomador, valor, vm.emailDocumentacionSM);
				else {
					msg.textContent("No se dispone de ninguna información para enviar esta póliza");
					$mdDialog.show(msg);
				}
			} else {
				var obj = {
					policyNumber: vm.dato.NU_POLIZA,
					no_email: vm.emailDocumentacionSM,
					reloadDocs: false
				}
				vm.appParent.abrirModalcargar(true);
				PolizaService.sendMailConditions(obj)
					.then(function successCallback(response) {
						if (response.status == 200) {
							if (response.data.code != 0) {
								msg.textContent(response.data.msg);
								$mdDialog.show(msg);
							} else {
								msg.textContent(response.data.msg);
								$mdDialog.show(msg);
								vm.emailDocumentacionSM = "";
								vm.showDocumentacionSM = false;
							}
						} else {
							msg.textContent('Se ha producido un error al descargar las condiciones');
							$mdDialog.show(msg);
						}
					}, function (error) {
						msg.textContent('Se ha producido un error al descargar las condiciones');
						$mdDialog.show(msg);
					});
			}
		}

		vm.setArchivoPoliza = function (archivo) {
			vm.tipoArchivo = archivo;
			$scope.$apply();
		}

		vm.openComisionista = function () {
			$mdDialog.show({
				controller: ComisionistaController,
				templateUrl: BASE_SRC + 'detalle/detalle.modals/comisionista.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false
			})
		}

		vm.getEncodedIBAN = function (CO_IBAN) {
			if (CO_IBAN)
				return CO_IBAN.substring(0, 6) + "**************" + CO_IBAN.substring(20, 24)
		}

		vm.formatAmount = function (x, decimals) {
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

			if (decimals == true || decimals == null) {
				x = x.toFixed(2);
			}

			var parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			return parts.join(",");
		}

		function ComisionistaController($mdDialog) {
			var md = this;
			md.comisionistas = [];
			md.cargar = false;
			md.vista = 0;
			md.cargar = true;
			md.permisos = vm.permisos;
			md.formatAmount = vm.formatAmount;

			// UI.GRID Configurado
			md.gridComisionistas = {
				enableSorting: true,
				enableHorizontalScrollbar: 0,
				paginationPageSizes: [15, 30, 50],
				paginationPageSize: 15,
				columnDefs: [
					{field: 'NO_COMPANIA', displayName: 'Colaborador', enableCellEdit: false},
					{field: 'NU_PORCENTAJE', displayName: '% Comisión', enableCellEdit: false},
					{
						field: 'NU_COMISION',
						displayName: 'Comisión',
						cellTemplate: '<div ng-if="row.entity.NU_COMISION!=undefined" class="ui-grid-cell-contents">{{ grid.appScope.$ctrl.formatAmount(row.entity.NU_COMISION)}} €</div>',
						enableCellEdit: false
					},
					{field: 'DS_TIPO_COMISION', displayName: 'Tipo comisión', enableCellEdit: false},
				],
				onRegisterApi: function (gridApi) {
					md.gridApi = gridApi;
				}
			}

			md.getComisionistasByPoliza = function () {
				BusquedaService.buscar({'ID_POLIZA': vm.dato.ID_POLIZA}, 'comisionistaByPoliza')
					.then(function successCallback(response) {
						md.cargar = false;
						if (response.data.NUMERO_COMISIONISTASPOLIZA > 0) {
							md.vista = 0;
							md.comisionistas = response.data.COMISIONISTASPOLIZA.COMISIONISTAPOLIZA;
							md.gridComisionistas.data = md.comisionistas;
						} else
							md.vista = 3;
					})
			}

			md.getComisionistasByPoliza();

			md.hide = function () {
				$mdDialog.hide();
			};

			md.cancel = function () {
				$mdDialog.cancel();
			};

		}

		vm.confirmarPoliza = function () {
			vm.cargando = true;
			vm.usuarioMod = JSON.parse($window.sessionStorage.perfil).usuario;

			if (vm.usuarioMod != undefined) {
				vm.dato.NO_USU_MOD = vm.usuarioMod;
			}

			PolizaService.confirmarPoliza(vm.dato)
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (response.data.ID_RESULT == 0) {
							vm.dato = response.data;
							vm.cargando = false;
							msg.textContent('Se ha confirmado la póliza correctamente.');
							$mdDialog.show(msg);
							vm.busquedaPoliza.listadoActualizado = true;
						} else {
							vm.cargando = false;
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						vm.cargando = false;
						msg.textContent('Se ha producido un error al confirmar la póliza');
						$mdDialog.show(msg);
					}
				}, function (error) {
					msg.textContent('Se ha producido un error al confirmar la póliza');
					$mdDialog.show(msg);
				});
		}

		vm.dialogDownloadPDF = function () {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/download.cyberPDF.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.header = 'Descarga de póliza en PDF'
					md.msg = '¿Desea descargar la documentación nueva o la antigua?'

					md.download = function () {

					};

					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						$mdDialog.cancel();
					};

				}]
			})
		}

		//Guardar Dominio
		vm.guardarDominio = function (formDomain) {

			if (formDomain === true) {
				objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent($translate.instant('MSG_DATA_CORRECTLY'));
				$mdDialog.show(msg);
				if (objFocus !== undefined) {
					objFocus.focus();
				}
				return null;
			}


			let pecuniarias = JSON.parse(vm.dato.JS_ENVIADO);
			if(pecuniarias.CIBERRIESGO.DOMINIOS === null || pecuniarias.CIBERRIESGO.DOMINIOS == undefined){
				pecuniarias.CIBERRIESGO.DOMINIOS = [];
			}

			let domains = vm.inputDomain.split('\n').filter(value => value!=='')
			pecuniarias.CIBERRIESGO.DOMINIOS.push(...domains);

			let poliza = JSON.parse(JSON.stringify(vm.dato));
			poliza.JS_ENVIADO = JSON.stringify(pecuniarias);

			PolizaService.guardarDominio(poliza)
				.then(function successCallback(response){
			if (response.status === 200) {
				if (response.data.ID_RESULT === 0) {
					vm.dato = response.data;
					if(vm.bloques.CIBERRIESGO.DOMINIOS == undefined){
						vm.bloques.CIBERRIESGO.DOMINIOS = [];
					}
					vm.bloques.CIBERRIESGO.DOMINIOS.push(...domains);
					vm.inputDomain = '';
					vm.cargando = false;
					vm.newDomain = false;
					msg.textContent('Se ha guardado el dominio correctamente.');
					$mdDialog.show(msg);
				} else {
					vm.cargando = false;
					msg.textContent(response.data.DS_RESULT);
					$mdDialog.show(msg);
				}
			} else {
				vm.cargando = false;
				msg.textContent('Se ha producido un error al guardar el dominio');
				$mdDialog.show(msg);
			}
			}, function (error) {
				msg.textContent('Se ha producido un error al guardar el dominio');
				$mdDialog.show(msg);
			});

		}

		vm.formatDateIssue = function(date){
			if (date != null) {       		
        		var dateFormat = moment(date).format('DD/MM/YYYY HH:mm');
                return dateFormat;
        	}
		}

	}
    
    
    ng.module('App').component('polizaSd', Object.create(polizaComponent));
    
})(window.angular);

