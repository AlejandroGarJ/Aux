(function(ng) {	

	//Crear componente de app
    var detalleDispositivoMovilComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q','$scope', '$location', '$mdDialog',  'uiGridConstants','MovilService',  'BASE_SRC', '$window'],
    		require: {
    			appParent: '^sdApp',
    			busqueda:'^busquedaApp',
    			busquedaMovistar: '^?busquedaDispositivosMoviles'
            },
            bindings:{
            	detalles: '<'
    		}
    }
    
    detalleDispositivoMovilComponent.controller = function detalleDMovilComponentControler($q, $scope, $location, $mdDialog, uiGridConstants, MovilService,  BASE_SRC, $window){
    	var vm=this;
    	var url=window.location;
    	vm.form = {};
    	vm.isNew = false; 
    	vm.isError = false;
    	var nLoad = 0;
    	vm.disabledEstado = false;
		vm.medida = 0;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
		vm.disabledTxt = true;
		vm.rol = sessionStorage.rol;
		vm.url = window.location.hash;
		vm.prePoliza = "Prepóliza";
		vm.isEmited = "";
		vm.modCodpreCom = false;
		vm.modelNew = {};
		vm.copiado = false;
		vm.isPrepoliza = false;
		vm.showAddThumbnail = true;
		vm.loadOfferingPrincipal = false;
		vm.loadOfferingAdicional = false;
		
		var perfil=JSON.parse($window.sessionStorage.perfil);
    	vm.usuario = perfil.usuario;
        vm.tipoLinea = "";
		
    	this.$onInit = function(bindings) {
    		
			//Cargar permisos
    		vm.permisos = vm.busquedaMovistar.permisos;
    		if(vm.appParent.getPermissions !== undefined) {
				if($location.$$path === '/gestion_terminales') {
					vm.permisos = vm.appParent.getPermissions('portabilidad');
				} 
    		}
    		
    		if(vm.detalles != null){
    			vm.formatData();
    		}
    	}
    	
    	vm.formatData = function () {

    		vm.datos = JSON.parse(JSON.stringify(vm.detalles));
    		vm.datosCopy = JSON.parse(JSON.stringify(vm.datos));

    		if (vm.datos != null && vm.datos.jsConfiguration != null) {

				const jsConfiguration = JSON.parse(vm.datos.jsConfiguration);
				console.log(jsConfiguration[0])

				vm.datos.idBanda = jsConfiguration[0].idBanda;
				vm.datos.groupName = jsConfiguration[0].groupName;

				if(jsConfiguration[0].imageURLs)
					vm.datos.imageURL = jsConfiguration[0].imageURLs[0]
					vm.showAddThumbnail = false;

				if(jsConfiguration[0].WCA_BundleFusion != null){

					vm.datos.WCA_BundleFusion = jsConfiguration[0].WCA_BundleFusion;
					vm.datos.WCA_BundleFusion.forEach( function(valor, i, array) {
						// console.log("En el índice " + i + " hay este valor: " + valor);

						vm.datos.WCA_BundleFusion[i].startDate = moment(vm.datos.WCA_BundleFusion[i].startDate).format('DD/MM/YYYY')

						if(!vm.datos.WCA_BundleFusion[i].ids[1]) {
							vm.datos.WCA_BundleFusion[i].ids[1] = {}
							vm.datos.WCA_BundleFusion[i].ids[1].pOffering = "SIN ADICIONAL"
						}

						if(!vm.datos.WCA_BundleFusion[i].endDate){
							vm.datos.WCA_BundleFusion[i].endDate = "VIGENTE"
							vm.datos.WCA_BundleFusion[i].active = vm.datos.WCA_BundleFusion[i]
						}else {
							vm.datos.WCA_BundleFusion[i].endDate = moment(vm.datos.WCA_BundleFusion[i].endDate).format('DD/MM/YYYY')
						}
					});
				}

				if(jsConfiguration[0].WCA_BundleLibre != null){
					vm.datos.WCA_BundleLibre = jsConfiguration[0].WCA_BundleLibre;
					vm.datos.WCA_BundleLibre.forEach( function(valor, i, array) {
						console.log("En el índice " + i + " hay este valor: " + valor);

						vm.datos.WCA_BundleLibre[i].startDate =  moment(vm.datos.WCA_BundleLibre[i].startDate).format('DD/MM/YYYY')

						if(!vm.datos.WCA_BundleLibre[i].ids[1]){
							vm.datos.WCA_BundleLibre[i].ids[1] = {}
							vm.datos.WCA_BundleLibre[i].ids[1].pOffering = "SIN ADICIONAL"
						}

						if(!vm.datos.WCA_BundleLibre[i].endDate){
							vm.datos.WCA_BundleLibre[i].endDate = "VIGENTE"
							vm.datos.WCA_BundleLibre[i].active = vm.datos.WCA_BundleLibre[i]
						}else {
							vm.datos.WCA_BundleLibre[i].startDate = moment(vm.datos.WCA_BundleLibre[i].endDate).format('DD/MM/YYYY')
						}
					});
				}
    		}else{
    			console.log("NO JS INFO")
			}
    	}
    	
    	vm.nuevoPo = function (tipo) {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/nuevo_po_terminal.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.tipo = tipo;
					md.datos = vm.datos;
					md.minDate = new Date();
					
					md.save = function () {
						if (md.formModalNuevoPo.$invalid == true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);	
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {
				    		var obj = {
								startDate: moment(md.form.startDate).format('YYYYMMDD'),
								ids: [
									{
										pOffering : md.form.pOffering_1,
								        idCapacidad : md.form.idCapacidad,
								        type : "MAIN"
									}
								]
							};
				    		
				    		if (md.form.pOffering_2 != null && md.form.pOffering_2 > 0) {
				    			obj.ids.push(
			    					{
			    						pOffering : md.form.pOffering_2,
								        idCapacidad : md.form.idCapacidad,
								        type : "ADDITIONAL"
			    					}
				    			);
				    		}
			    			
			    			if(obj != null && obj != undefined){

			    				md.cargar = true;
			    				MovilService.confirmarAltaBloqueo(obj, md.tipo, md.datos.codPrecom)
			    				.then(function successCallback(response) {
			    					if(response.data.code == 0){
			    						msg.textContent(response.data.msg).multiple(false);
			    						$mdDialog.show(msg);
					    				md.cargar = false;
			    						if (response.data.entity != null) {
			    							vm.detalles = response.data.entity;
			    			    			vm.formatData();
			    						}
			    					} else {
			    						msg.textContent(response.data.msg).multiple(true);
			    						$mdDialog.show(msg);	
					    				md.cargar = false;
			    					}
			    				}, function callBack(response) {
				    				md.cargar = false;
			    					if(response.status == 406 || response.status == 401){
			    						vm.parent.logout();
			    					}
			    					
			    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
			    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
			    	                    $mdDialog.show(msg);
			    	        	    } else {
			    						msg.textContent("Ha ocurrido un error al confirmar el alta").multiple(true);
			    						$mdDialog.show(msg);
			    	        	    }
			    				});
			    			}
			    		}
					}
					
					md.inputLengthLimiter = (value, maxLength) => {
						var valor = md.form[value];
						if (typeof valor == "number") {
							valor = valor.toString();
						}
				        if(valor.length > maxLength){
				        	valor = valor.substring(0, maxLength);
				        }
				        md.form[value] = parseInt(valor);
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
			});
		}
    	
    	vm.bajaPo = function (tipo) {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/baja_po_terminal.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.tipo = tipo;
					md.datos = vm.datos;
					md.minDate = new Date();
					
					md.save = function () {
						
						if (md.formModalBajaPo.$invalid == true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);	
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {
				    		var obj = {
								endDate: moment(md.form.endDate).format('YYYYMMDD'),
								ids: []
							};
		    				md.cargar = true;
		    				MovilService.confirmarBajaBloqueo(obj, md.tipo, md.datos.codPrecom)
		    				.then(function successCallback(response) {
		    					if(response.data.code == 0){
		    						msg.textContent(response.data.msg).multiple(false);
		    						$mdDialog.show(msg);
		    						if (response.data.entity != null) {
		    							vm.detalles = response.data.entity;
		    			    			vm.formatData();
		    						}
				    				md.cargar = false;
		    					} else {
		    						msg.textContent(response.data.msg).multiple(true);
		    						$mdDialog.show(msg);	
				    				md.cargar = false;
		    					}
		    				}, function callBack(response) {
			    				md.cargar = false;
		    					if(response.status == 406 || response.status == 401){
		    						vm.parent.logout();
		    					}
		    					
		    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
		    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
		    	                    $mdDialog.show(msg);
		    	        	    } else {
		    						msg.textContent("Ha ocurrido un error al dar de baja").multiple(true);
		    						$mdDialog.show(msg);
		    	        	    }
		    				});
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
			});
		}
    	
    	vm.comprobacionPo = function (productOffering, idCapacidad, tipo) {
    		if (tipo === 0) {
    			vm.loadOfferingPrincipal = true;
    		} else {
    			vm.loadOfferingAdicional = true;
    		}
    		vm.cargarComprobacionPo = true;
			MovilService.comprobarPo(productOffering, idCapacidad)
			.then(function successCallback(response) {
				if(response.data.code === 0){
					var detalle = "";
					var displays = "";

					response.data.result.forEach( function(valor, i, array) {

						response.data.result[i].displays.forEach( function(valor, j, array) {
							displays = displays + "Display 0" + (j+1) + ": " + response.data.result[i].displays[j].desc + " ACTIVO\n"
						});

						detalle = detalle + "Modalidad " + response.data.result[i].nombre + " : " + response.data.result[i].tarifa + "€\n"
						+ "Promoción en Modalidad: " + (response.data.result[i].promo !== undefined ? response.data.result[i].promo : "NINGUNA") + "\n" + displays + "\n\n";

						displays = "";

					});

					msg.textContent(response.data.result[0].marca + " " + response.data.result [0].modelo + " IDENTIFICADO\n\n" + detalle)
					$mdDialog.show(msg);

				} else {
					msg.textContent(response.data.result)
					$mdDialog.show(msg);	
				}
    			vm.loadOfferingPrincipal = false;
    			vm.loadOfferingAdicional = false;
				vm.cargarComprobacionPo = false;
			}, function callBack(response) {
				vm.cargarComprobacionPo = false;
    			vm.loadOfferingPrincipal = false;
    			vm.loadOfferingAdicional = false;
				if(response.status === 406 || response.status === 401){
					vm.parent.logout();
				}
				
				if ((response.status === 400 || response.status === 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
					msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio)
                    $mdDialog.show(msg);
        	    } else {
					msg.textContent("No se ha podido procesar la solicitud")
					$mdDialog.show(msg);
        	    }
			});
    	}
    	
    	vm.cambiarPrecom = function (tipo) {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/cambio_precom.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.datos = vm.datos;
					md.datos.typePrecom = (tipo === 'COD_PRECOM' ? "PRECOM LIBRE" : "PRECOM RENT")
					
					md.save = function () {
						if (md.formCambioPrecom.$invalid === true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);	
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {

							var obj = {
								codPrecom: md.datos.codPrecom,
								newPrecom: (tipo === 'COD_PRECOM' ? md.form.newPrecom : null),
								newCodRENT: (tipo === 'COD_RENT' ? md.form.newPrecom : null)
							}

							md.cargar = true;
							MovilService.device(obj)
								.then(function successCallback(response) {
									if(response.data.code === 0){
										msg.textContent(response.data.msg).multiple(false);
										$mdDialog.show(msg);
										md.cargar = false;
										if (response.data.entity != null) {
											if(tipo === 'COD_PRECOM') {
												vm.detalles.codPrecom = md.form.newPrecom;
											}else if (tipo === 'COD_RENT'){
												vm.detalles.codRENT = md.form.newPrecom;
											}

											vm.formatData();
										}
									} else {
										msg.textContent(response.data.msg).multiple(true);
										$mdDialog.show(msg);
										md.cargar = false;
									}
								}, function callBack(response) {
									md.cargar = false;
									if(response.status == 406 || response.status == 401){
										vm.parent.logout();
									}

									if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
										msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
										$mdDialog.show(msg);
									} else {
										msg.textContent("Ha ocurrido un error al cambiar el PRECOM").multiple(true);
										$mdDialog.show(msg);
									}
								});
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
			});
		}
    	
    	vm.cambiarBanda = function (tipo) {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/cambio_banda.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.datos = vm.datos;
					
					md.save = function () {
						if (md.formCambioBanda.$invalid == true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);	
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {
		    				var obj = {
								codPrecom: md.datos.codPrecom
							};

							if (md.datos.jsConfiguration != null) {
								let jsConfigurationParse = JSON.parse(md.datos.jsConfiguration);
								if (jsConfigurationParse != null && jsConfigurationParse.length > 0) {
									jsConfigurationParse[0].idBanda = md.form.band;
									obj.jsConfiguration = JSON.stringify(jsConfigurationParse);
								}
							} else {
								obj.jsConfiguration = JSON.stringify([{ idBanda: md.form.band }]);
							}
			    			
			    			if(obj != null && obj != undefined){

			    				md.cargar = true;
			    				MovilService.device(obj)
			    				.then(function successCallback(response) {
			    					if(response.data.code == 0){
			    						msg.textContent(response.data.msg).multiple(false);
			    						$mdDialog.show(msg);
					    				md.cargar = false;
			    						if (response.data.entity != null) {
			    							vm.detalles.jsConfiguration = response.data.entity.jsConfiguration;
			    							vm.detalles.idBanda = md.form.band;
			    			    			vm.formatData();
			    						}
			    					} else {
			    						msg.textContent(response.data.msg).multiple(true);
			    						$mdDialog.show(msg);	
					    				md.cargar = false;
			    					}
			    				}, function callBack(response) {
				    				md.cargar = false;
			    					if(response.status == 406 || response.status == 401){
			    						vm.parent.logout();
			    					}
			    					
			    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
			    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
			    	                    $mdDialog.show(msg);
			    	        	    } else {
			    						msg.textContent("Ha ocurrido un error al cambiar la banda").multiple(true);
			    						$mdDialog.show(msg);
			    	        	    }
			    				});
			    			}
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
			});
		}
    	
    	vm.addThumbnail = function () {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/anadir_thumbnail.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.datos = vm.datos;
					
					md.save = function () {
						var obj = {
							codPrecom: md.datos.codPrecom
						};
						if (md.datos.jsConfiguration != null) {
							var jsConf = JSON.parse(md.datos.jsConfiguration);
							if (jsConf != null && jsConf.length > 0) {
								var jsConfNuevo = {
									idPartner: jsConf[0].idPartner,
									imageURLs: [md.form.imageURLs]
								}
								obj.jsConfiguration = JSON.stringify([jsConfNuevo]);
							}
						}
						
						md.cargar = true;
	    				MovilService.device(obj)
	    				.then(function successCallback(response) {
	    					if(response.data.code == 0){
	    						msg.textContent(response.data.msg).multiple(false);
	    						$mdDialog.show(msg);
			    				md.cargar = false;
			    				vm.showAddThumbnail = false;
			    				vm.datos.imageURL = md.form.imageURLs;
			    				vm.detalles.imageURL = md.form.imageURLs;
	    					} else {
	    						msg.textContent(response.data.msg).multiple(true);
	    						$mdDialog.show(msg);	
			    				md.cargar = false;
	    					}
	    				}, function callBack(response) {
		    				md.cargar = false;
	    					if(response.status == 406 || response.status == 401){
	    						vm.parent.logout();
	    					}
	    					
	    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
	    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
	    	                    $mdDialog.show(msg);
	    	        	    } else {
	    						msg.textContent("Ha ocurrido un error al añadir la imagen").multiple(true);
	    						$mdDialog.show(msg);
	    	        	    }
	    				});
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
			});
		}
    	
    	vm.editCodes = function () {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/editar_codigos.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar = false;
					md.form = {};
					md.datos = vm.datos;
					
					this.$onInit = function() {
						if (md.datos.simOnlyCodes != null) {
							md.form.modelos = JSON.parse(JSON.stringify(md.datos.simOnlyCodes));
						}
					}
					
					md.save = function () {
						var obj = {
							codPrecom: md.datos.codPrecom
						};
						if (md.datos.jsConfiguration != null) {
							var jsConf = JSON.parse(md.datos.jsConfiguration);
							if (jsConf != null && jsConf.length > 0) {
								var jsConfNuevo = {
									idPartner: jsConf[0].idPartner
								}
								if (md.form.modelos != null) {
									jsConfNuevo.modelos = md.form.modelos.split(",").trim();
								}
								obj.jsConfiguration = JSON.stringify([jsConfNuevo]);
							}
						}
						
						md.cargar = true;
	    				MovilService.device(obj)
	    				.then(function successCallback(response) {
	    					if(response.data.code == 0){
	    						msg.textContent(response.data.msg).multiple(false);
	    						$mdDialog.show(msg);
			    				md.cargar = false;
			    				vm.datos.simOnlyCodes = md.form.modelos;
			    				vm.detalles.simOnlyCodes = md.form.modelos;
	    					} else {
	    						msg.textContent(response.data.msg).multiple(true);
	    						$mdDialog.show(msg);	
			    				md.cargar = false;
	    					}
	    				}, function callBack(response) {
		    				md.cargar = false;
	    					if(response.status == 406 || response.status == 401){
	    						vm.parent.logout();
	    					}
	    					
	    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
	    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
	    	                    $mdDialog.show(msg);
	    	        	    } else {
	    						msg.textContent("Ha ocurrido un error al añadir la imagen").multiple(true);
	    						$mdDialog.show(msg);
	    	        	    }
	    				});
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
			});
		
    		
    	}

    	this.loadTemplate = function() {
            return BASE_SRC + "detalle/detalles.views/detalle.dispositivoMovil.html";
    	}
    }   

    ng.module('App').component('detalleDispositivoMovil', Object.create(detalleDispositivoMovilComponent));
    
})(window.angular);


