(function (ng) {


    //Crear componente de app
    var tarDispositivosComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$rootScope', '$q', '$mdDialog', '$location', 'BASE_SRC', 'BASE_CON', 'DispositivosService', 'TiposService', '$window', 'LocalidadesService', 'PolizaService', 'ClienteService', 'HogarService'],
        require: {
            parent: '^sdApp',
            busquedaPresupuesto: '^?busquedaPresupuesto'
        },
        bindings: {
        	detalles: '<',
        	llave: '<'
        }
    }



    tarDispositivosComponent.controller = function tarDispositivosComponentControler($rootScope, $q, $mdDialog, $location, BASE_SRC, BASE_CON, DispositivosService, TiposService, $window, LocalidadesService, PolizaService, ClienteService, HogarService) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.step = 1;
        vm.calc = false;
        vm.acceptTC = false;
        vm.acceptAdds = false;
        vm.objDispositivosAll = [];
        vm.nuDispositivos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        vm.dispositivos = {};
        vm.ampRobo = false;
        vm.ampCamb = false;
        vm.idPresupuesto = null;
        vm.macbookAir = "";
		vm.macbookPro = "";
		vm.isEdited = false;
		vm.periodicidad = {};
		vm.periodicidad = {
			ID_FORMAPAGO: 7,
			DS_FORMAPAGO: "Mensual"
		}
		vm.isEmpresa = false;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
    	vm.camposEditablesContratacion = {
			NO_NOMBRE: false,
			NO_APELLIDO1: false,
			NO_APELLIDO2: false,
			NO_DIRECCION: false,
			CO_POSTAL: false,
			NO_EMAIL: false,
			NU_TELEFONO: false,
			CO_IBAN: true
    	}
    	vm.coToken = _.get($rootScope, 'globals.currentUser.coToken');
        vm.condicionadoPresupuesto = false;
    	vm.hideAmplDispo = false;
    	vm.rol = window.sessionStorage.rol;
    	vm.confirmando = false;
        this.loadTemplate = function() {
            return "src/tarificador/tarificador.view/tar.dispositivos.html";
        }

        this.$onInit = function() {
        	
        	vm.colectivos = [];
            vm.idColectivo = null;
				
            vm.medidaEdicion = 169;

            if (/presupuestos/.test($location.url())) {
                vm.medidaEdicion = 212;
            } else if (/clientes/.test($location.url())) {
                vm.medidaEdicion = 262;
            }
            
            //Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.isEdited = true;
                vm.idPresupuesto = vm.detalles.ID_PRESUPUESTO;
                
                if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
                	vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_TOT.toFixed(2));
                }
            }
            
            if (vm.idPresupuesto == null) {
	            var perfil = JSON.parse(sessionStorage.getItem('perfil'));
				if (perfil != null) {
		            vm.colectivos = perfil.colectivos;
		            vm.idColectivo = null;
                    var colectivosTarificables = vm.getColectivosTarificables();

                    if (vm.colectivos.length == 1) {
                        vm.idColectivo = vm.colectivos[0].ID_TIPO_POLIZA;
                        vm.colectivo = vm.colectivos[0];
                    } else if (colectivosTarificables != null && colectivosTarificables.length == 1) {
                        vm.idColectivo = colectivosTarificables[0].ID_TIPO_POLIZA;
                        vm.colectivo = colectivosTarificables[0];
                    } else {
                        vm.showColectivos();
                    }
	            }
            }

            DispositivosService.getDispositivos()
            .then(function successCallback(response) {
                if (response.status == 200) {
                    
                    vm.objDispositivos = [];

                    for (var i = 0; i < response.data.LST_DISPOSITIVOS.length; i++) {
                      var dispositivo = response.data.LST_DISPOSITIVOS[i];
                      vm.objDispositivosAll.push(dispositivo);

                      if (dispositivo.ID_TIPO_DISPOSITIVO == 3) {
                      	if (dispositivo.ID_BANDA_DISPOSITIVO == 2) {
                      		vm.macbookAir = dispositivo.DS_BANDA_DISPOSITIVO;
                      	} else if (dispositivo.ID_BANDA_DISPOSITIVO == 3) {
                      		vm.macbookPro = dispositivo.DS_BANDA_DISPOSITIVO;
                      	}
                      }
                      
                      if (vm.objDispositivos.find( x => x.ID_TIPO_DISPOSITIVO == dispositivo.ID_TIPO_DISPOSITIVO) == null) {
                        var obj = {
                          DS_TIPO_DISPOSITIVO: dispositivo.DS_TIPO_DISPOSITIVO,
                        //   DS_BANDA_DISPOSITIVO: dispositivo.ID_TIPO_DISPOSITIVO == 3 ? "Apple" : dispositivo.ID_TIPO_DISPOSITIVO == 5 ? "PS5 o XBOX Series X" : dispositivo.DS_BANDA_DISPOSITIVO,
                          ID_TIPO_DISPOSITIVO: dispositivo.ID_TIPO_DISPOSITIVO,
                          DATA_QUESTION: ""
                        }

						switch (dispositivo.ID_TIPO_DISPOSITIVO) {
							case 1:
								obj['DS_BANDA_DISPOSITIVO'] = 'Mayor de 43"';
								break;
							case 3:
							case 4:
								obj['DS_BANDA_DISPOSITIVO'] = 'Apple';
								break;
							case 5:
								obj['DS_BANDA_DISPOSITIVO'] = 'PS5 o XBOX Series X';
								break;
							default:
								obj['DS_BANDA_DISPOSITIVO'] = dispositivo.DS_BANDA_DISPOSITIVO
								break;
						}

                        if (dispositivo.ID_TIPO_DISPOSITIVO == 3) {
                          obj.DATA_QUESTION = "portatil";
                        }

                        vm.objDispositivos.push(obj);
                        vm.dispositivos[obj.ID_TIPO_DISPOSITIVO] = {};
                        vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].DS_TIPO_DISPOSITIVO = obj.DS_TIPO_DISPOSITIVO;
                        vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].ID_TIPO_DISPOSITIVO = obj.ID_TIPO_DISPOSITIVO;
                        vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].NU_DISPOSITIVOS = 0;
                        vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].NU_BANDA = 0;
                        
                        if (dispositivo.ID_TIPO_DISPOSITIVO == 3) {
                          	vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].AIR = 0;
                          	vm.dispositivos[obj.ID_TIPO_DISPOSITIVO].PRO = 0;
                        }
                      }

                    }

                    vm.objDispositivos.sort(function (a, b) {
                      if (a.ID_TIPO_DISPOSITIVO > b.ID_TIPO_DISPOSITIVO) {
                        return 1;
                      }
                      if (a.ID_TIPO_DISPOSITIVO < b.ID_TIPO_DISPOSITIVO) {
                        return -1;
                      }
                      // a must be equal to b
                      return 0;
                    });
                    
                    if (vm.isEdited == true) {
                    	vm.getDispositivosEdit();
                    }
                    
                    vm.parent.listServices.listDispositivos = vm.objDispositivos;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

        }

        this.$onChanges = function() {

        }
        
        vm.getDispositivosEdit = function () {
        	if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.DISPOSITIVOS != null && vm.detalles.PECUNIARIAS.DISPOSITIVOS.LST_DISPOSITIVOS != null) {
        		var listDispositivos = vm.detalles.PECUNIARIAS.DISPOSITIVOS.LST_DISPOSITIVOS;
        		
        		for (var i = 0; i < listDispositivos.length; i++) {
        			vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_DISPOSITIVOS = vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_DISPOSITIVOS + 1;
        			if (listDispositivos[i].ID_TIPO_DISPOSITIVO != 3 && listDispositivos[i].ID_BANDA_DISPOSITIVO != 1) {
        				vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_BANDA = vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_BANDA + 1;
        			} else if (listDispositivos[i].ID_TIPO_DISPOSITIVO == 3 && listDispositivos[i].ID_BANDA_DISPOSITIVO != 1) {
        				vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_BANDA = vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].NU_BANDA + 1;
        				if (listDispositivos[i].ID_BANDA_DISPOSITIVO == 2) {
        					//Apple Macbook Air
        					vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].AIR = vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].AIR + 1;
        				} else if (listDispositivos[i].ID_BANDA_DISPOSITIVO == 3) {
        					//Apple Macbook Pro
        					vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].PRO = vm.dispositivos[listDispositivos[i].ID_TIPO_DISPOSITIVO].PRO + 1;
        				}
        			}
        		}
        	}
        }
        
        vm.checkPostal = function (code, localidadGuardada) {
            if(code != undefined && code.length == 5) {

            	TiposService.getLocalidades(code)
                .then(function successCallBack(response) {
                	var localidadSeleccionada = false;
                    if (!Array.isArray(response.data.LOCALIDAD)) {
                        vm.localidades = [];
                        vm.localidades.push(response.data.LOCALIDAD);
                    } else {
                    	vm.localidades = response.data.LOCALIDAD;
                    	if (vm.localidades.length > 1) {
                    		if (localidadGuardada != null && localidadGuardada != "") {
                    			var localidad = vm.localidades.find( x => x.NO_LOCALIDAD == localidadGuardada);
                    			if (localidad != null) {
                    				vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.ID_LOCALIDAD = localidad.ID_LOCALIDAD;
                    				vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_LOCALIDAD = localidad.NO_LOCALIDAD;
                    				localidadSeleccionada = true;
                    			}
                    		} else {
                                LocalidadesService.elegirLocalidad(vm.localidades, vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR);
                    		}
                        } else {
                            vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.ID_LOCALIDAD = vm.localidades[0].ID_LOCALIDAD;
                        }  
                    }

                    if (localidadSeleccionada != true) {
                        vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                        vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                        vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_PROVINCIA = vm.localidades[0].NO_PROVINCIA;
                    }

					if(response.data.ID_RESULT != 0 && vm.camposEditablesContratacion.CO_POSTAL == false) {
						vm.camposEditablesContratacion.CO_POSTAL = true;
					}

                }, function errorCallBack(response) {
					if(vm.camposEditablesContratacion.CO_POSTAL == false)
						vm.camposEditablesContratacion.CO_POSTAL = true;
				});
            }
        }
        
        vm.validarApple = function () {
        	var dispositivo = vm.dispositivos[3];

    		var selMacbook = document.getElementById("select-air");
    		var selPro = document.getElementById("select-pro");
    		
        	if (dispositivo != null && dispositivo.NU_BANDA > 0 && (dispositivo.AIR + dispositivo.PRO) != dispositivo.NU_BANDA) {
        		if (selMacbook != null) {
            		selMacbook.className += " ng-empty ng-invalid-required border-red";
        		}
        		if (selPro != null) {
            		selPro.className += " ng-empty ng-invalid-required border-red";
        		}
				vm.price = 0;
        		return false;
        	} else {
        		if (selMacbook != null) {
            		selMacbook.className = selMacbook.className.replaceAll("ng-empty", "");
            		selMacbook.className = selMacbook.className.replaceAll("ng-invalid-required", "");
            		selMacbook.className = selMacbook.className.replaceAll("border-red", "");
        		}
        		if (selPro != null) {
        			selPro.className = selPro.className.replaceAll("ng-empty", "");
            		selPro.className = selPro.className.replaceAll("ng-invalid-required", "");
            		selPro.className = selPro.className.replaceAll("border-red", "");
        		}
        		return true;
        	}
        } 
        
        vm.checkDispoSwap = function () {
			var listaDispositivos = vm.getListaDispositivos();
			var existeTv = false;
			var existePs5 = false;
			if (listaDispositivos != null && listaDispositivos.find(x => x.ID_TIPO_DISPOSITIVO == 5 && x.ID_BANDA_DISPOSITIVO == 3) != null) {
				existePs5 = true;
			}
			if (listaDispositivos != null && listaDispositivos.find(x => x.ID_TIPO_DISPOSITIVO == 1) != null) {
				existeTv = true;
			}
			if (existePs5 == false && existeTv == false) {
				vm.ampCamb = false;
			}
        }
        
        vm.tarificar = function (bool, next, idDispositivo, nuDispositivo, banda) {
        	
        	//Comprobar si se ha eliminado TV, si es así, comprobar si queda algún dispositivo con SWAP obligatorio
			if ((idDispositivo === 1 || idDispositivo === 5) && nuDispositivo === 0) {
				vm.checkDispoSwap();
			}
        	
        	if (vm.getListaDispositivos().length == 0) {
        		vm.price = 0;
        		return null;
        	}
        	
        	if (vm.validarApple() == false) {
        		return null;
        	} 

			var objTarifica = vm.getObjTarifica();
			
            if(vm.idColectivo != null) {
            	objTarifica.ID_TIPO_POLIZA = vm.idColectivo;
            }

            // if (vm.colectivo != null) {
            // 	objTarifica.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            // }
        	
			vm.parent.abrirModalcargar(true);
			
			DispositivosService.tarificacionCias(bool, objTarifica)
            .then(function successCallback(response) {
                if (response.status == 200) {
                	if (response.data.ID_RESULT == 0) {
                		vm.datos = response.data;
                		if (response.data.ID_PRESUPUESTO != null) {
                            vm.idPresupuesto = response.data.ID_PRESUPUESTO;
            	        }
                		
                        if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                            vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_TOT;  
                        }
                        
                        //Cambiar al paso 2
                        if (next == true) {
                    		
                            if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
    							vm.isFirmaDigital(response.data.MODALIDADES.MODALIDAD[0].ID_COMP_RAMO_PROD); 
                            }
                            
                        	vm.confirmarDispositivos();
                        }
                    } else {
                    	vm.price = 0;
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
                    }
                	$mdDialog.cancel();
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }
        
        vm.emitir = function () {
        	vm.parent.abrirModalcargar(true);
        	
        	if (vm.datos.MODALIDADES != null && vm.datos.MODALIDADES.MODALIDAD != null & vm.datos.MODALIDADES.MODALIDAD[0] != null) {
        		vm.datos.OTARIFA = vm.datos.MODALIDADES.MODALIDAD[0];
        		vm.datos.OTARIFA_INDIVIDUAL = vm.datos.MODALIDADES.MODALIDAD[0];
        		delete vm.datos.MODALIDADES;
        	}
        	
        	vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = {};

            if (vm.condicionadoPresupuesto == false) {
            	DispositivosService.emitirPresupuesto(vm.datos)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if(response.data.ID_RESULT == 0){
                            if (response.data.CO_ESTADO == 1) {
                                vm.datos = response.data;
                                vm.step = 3;
                            	$mdDialog.cancel();
                            } else if (response.data.CO_ESTADO == 3) {
                                vm.datos = response.data;
                                vm.step = 4;
                            	$mdDialog.cancel();
                            }
                            if(response.data.MESSAGES != undefined && response.data.MESSAGES.MESSAGE[0] != undefined){
                            	msg.textContent(response.data.MESSAGES.MESSAGE[0].DS_MESSAGE);
         						$mdDialog.show(msg);
         						vm.firmaDigital = false;
         						vm.signatureFailed = true;
                            }
                        } else{
                            msg.textContent(response.data.DS_RESULT);
    						$mdDialog.show(msg);
    						vm.firmaDigital = false;
                        }
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            } else {
            	HogarService.condicionadoPresupuesto(vm.datos)
				.then(function successCallback(response) {
					if (response.status === 200) {
						let utf8decoder = new TextDecoder();
						var mensajeUArchivo = utf8decoder.decode(response.data);
						if(mensajeUArchivo.search('ID_RESULT') != -1) {
							var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
							if(objtMensajeUArchivo.ID_RESULT != 0) {
								var mensaje = "Ha ocurrido un error en la emisión";
								if (objtMensajeUArchivo.DS_RESULT != null) {
									var mensaje = objtMensajeUArchivo.DS_RESULT;
								}
								msg.textContent(mensaje);
								$mdDialog.show(msg);
							}
						} else {
							vm.dataCondicionadoPresupuesto = response.data;
							vm.step = 5;
                        	$mdDialog.cancel();
						}
					} else {
                        msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
                        $mdDialog.show(msg);
					}
					vm.cargando = false;
				}, function errorCallback(response) {
                    msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
                    $mdDialog.show(msg);
					vm.cargando = false;
				});
            }
        }
        
        vm.validatePinCode = function(){
        	vm.confirmando = true;
        	if(vm.pinCode != undefined && vm.pinCode.length == 6){
        		json = { "pincode" : vm.pinCode };
        		
	        	DispositivosService.validatePinCode(json, vm.datos.NU_POLIZA)
					.then(function successCallback(response) {
						if (response.status === 200) {
							if(response.data.ID_RESULT != undefined){	
								 vm.confirmando = false;
								 msg.textContent(response.data.DS_RESULT);
						         $mdDialog.show(msg);
						         if(response.data.ID_RESULT == 0)
						        	 vm.firmaDigital = false;
							}else{
								msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
					            $mdDialog.show(msg);
					            vm.confirmando = false;			
							}					
					}}, function errorCallback(response) {
		                msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
		                $mdDialog.show(msg);
		                vm.confirmando = false;						
					});
        	}else{
                msg.textContent('Introduce un pin code de 6 dígitos.');
                $mdDialog.show(msg);
                vm.confirmando = false;
        	}
        }
        
        vm.resendPinCode = function(){
        	$mdDialog.show({
                templateUrl: BASE_SRC+'detalle/detalle.modals/confirm.phone.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    md.telefono = vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO1;
                    md.error = "No has introducido un teléfono móvil válido. Por favor, corrígelo.";
                    const regex = /(6|7)([0-9]){8}/;
                    md.errorResult = false;
                    md.title = "REENVÍO DE PIN";
                    md.button = "REENVIAR PIN";
                    md.action = "reenviar";

                    md.checkMobilePhoneNumber = function(telefono) {                      
                        if(telefono.substr(0, 1).match(/[6-7]/) == null || !regex.test(telefono) || telefono.length != 9 ){                        	
                        	md.errorResult = true;
                    	}else{
                        	md.errorResult = false;
                    	}
                    }
                    
                    md.confirmPhone = function(){
                    	md.reenviandoCode = true;
                    	vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_POLIZA = vm.datos.NU_POLIZA;
                    	vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO1 = md.telefono;
                    	
                    	DispositivosService.resendPinCode(vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR)
                			.then(function successCallback(response) {
                				if (response.status === 200) {
                					if(response.data != null && response.data.ID_RESULT != null){
                						 msg.textContent(response.data.DS_RESULT);
                				         $mdDialog.show(msg);
                				     	 md.reenviandoCode = false;
                					}
                			}}, function errorCallback(response) {
                                msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
                                $mdDialog.show(msg);
                				md.reenviandoCode = false;
                			});                  	
                    	}

                    md.cancel = function() {
                        $mdDialog.cancel();
                    };            
                }]
            });        	        	
        }
        
        vm.resendSign = function(){
        	vm.reenviando = true;
        	
        	$mdDialog.show({
                templateUrl: BASE_SRC+'detalle/detalle.modals/confirm.phone.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    md.telefono = vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO1;
                    md.error = "No has introducido un teléfono móvil válido. Por favor, corrígelo.";
                    const regex = /(6|7)([0-9]){8}/;
                    md.errorResult = false;
                    md.title = "REENVÍO DE PIN";
                    md.button = "REENVIAR PIN";
                    md.action = "reenviar un";

                    md.checkMobilePhoneNumber = function(telefono) {                      
                        if(telefono.substr(0, 1).match(/[6-7]/) == null || !regex.test(telefono) || telefono.length != 9){                        	
                        	md.errorResult = true;
                    	}else{
                        	md.errorResult = false;
                    	}
                    }
                    
                    md.confirmPhone = function(){                    	
                        vm.reenviando = false;
                        telefonoMod = md.telefono;
                        
                  	  $mdDialog.show({
                            templateUrl: BASE_SRC + 'detalle/detalle.modals/reenviar_firma.modal.html',
                            controllerAs: '$ctrl',
                            clickOutsideToClose: true,
                            parent: angular.element(document.body),
                            fullscreen: false,
                            controller: ['$mdDialog', function ($mdDialog) {
                                var md = this;
                            	  md.rol = window.sessionStorage.rol;
                            	  md.datos = vm.datos;
                            	  md.reenviando = vm.reenviando;
                            	  md.reenviando = true;
                            	  md.signatureFailed = true;
                            	  md.confirmando = false;
                            	  md.reenviandoCode = false;
                            	  md.pinCodeEnviado = false;
                            	  
                                  md.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO1 = telefonoMod;
                                  md.datos.LST_ASEGURADOS = [];
                                  md.datos.LST_ASEGURADOS[0] = {};
                                  md.datos.LST_ASEGURADOS[0].ID_CLIENTE = md.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.ID_CLIENTE;
                                  md.datos.LST_ASEGURADOS[0].NU_TELEFONO1 = telefonoMod;
                            	
                              	  DispositivosService.resendSign(vm.datos, vm.rol, true)
                				  .then(function successCallback(response) {
                					if (response.status === 200) {
                						if(response.data != null && response.data.ID_RESULT != null){
                							 msg.textContent(response.data.DS_RESULT);
                					         $mdDialog.show(msg);
                					     	 vm.reenviando = false;
                					     	 
                					     	 if(response.data.ID_RESULT == 0){
                					     	 	vm.firmaDigital = true;
                					     	 	vm.signatureFailed = false;
                							}
                						}
	                				}}, function errorCallback(response) {
	                	                msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
	                	                $mdDialog.show(msg);
	                					vm.reenviando = false;
	                				});
                            	                            	
		                            md.cancel = function () {
		                               $mdDialog.cancel();
		                            }
                            	}]
                  	  		});  
                    	}

                    md.cancel = function() {
                        $mdDialog.cancel();
                    };            
                }]
            });        	
        }
        
        vm.descargarCondicionado = function () {
        	saveAs(new Blob([vm.dataCondicionadoPresupuesto], { type: 'application/pdf' }), 'Condiciones.pdf');
        }
        
        vm.getObjTarifica = function () {
        	var obj = {
  			    NO_USUARIO: vm.usuario,
    			ID_RAMO: 103,
    			PECUNIARIAS: {
    				DATOS_PAGO: {
                        DS_FORMAPAGO: vm.periodicidad.DS_FORMAPAGO,
						FD_INICIO: vm.getFdInicio(),
                        ID_FORMAPAGO: vm.periodicidad.ID_FORMAPAGO,
						ID_TIPO_MEDIO_PAGO: 7
    				},
    				DISPOSITIVOS: {
    					LST_DISPOSITIVOS: vm.getListaDispositivos()
    				}
    			}
        	}
        	
        	obj.CO_PRODUCTO = vm.getCoProducto();
        	
        	if (vm.idPresupuesto != null) {
        		obj.ID_PRESUPUESTO = vm.idPresupuesto;
        	}
        	
            if (vm.detalles != null && vm.detalles.OCLIENTE != null) {
            	obj.PECUNIARIAS.DATOS_TOMADOR = vm.detalles.OCLIENTE;
            	if (vm.detalles.OCLIENTE.NU_TELEFONO1 != null) {
            		obj.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO =  vm.detalles.OCLIENTE.NU_TELEFONO1;
            	}
            	
            }
        	
        	return obj;
        }
        
        vm.getCoProducto = function () {
            if (vm.ampRobo == false && vm.ampCamb == false) {
        	   return "DISBA";
            } else if (vm.ampRobo == true && vm.ampCamb == true) {
                return "DISTO";
            } else if (vm.ampRobo == false && vm.ampCamb == true) {
                return "DISSW";
            } else if (vm.ampRobo == true && vm.ampCamb == false) {
                return "DISRO";
            }
        }
        
        vm.getFdInicio = function () {
        	//Formateamos fecha
            var fdInicio = new Date();
            var dia = fdInicio.getDate();
            if (dia < 10) {
              dia = "0" + dia;
            }
            var mes = fdInicio.getMonth() + 1;
            if (mes < 10) {
              mes = "0" + mes;
            }
            fdInicio = fdInicio.getFullYear() + "-" + mes + "-" + dia;

            return fdInicio;
        }
        
        vm.getNuDispositivos = function () {
        	var nuDispositivos = 0;
        	
        	if (vm.dispositivos != null) {
        		for (var dispositivo in vm.dispositivos) {
        			nuDispositivos += vm.dispositivos[dispositivo].NU_DISPOSITIVOS;
        		}
        	}
        	
        	return nuDispositivos;
        }
        
        vm.getNuMaxDispositivos = function (id) {
        	var nuMax = 0;
        	var lista = [];
        	if (id == 1) {
        		nuMax = 3;
        	} else if (id == 2) {
        		nuMax = 4;
        	} else if (id == 3) {
        		nuMax = 4;
        	} else if (id == 4) {
        		nuMax = 3;
        	} else if (id == 5) {
        		nuMax = 2;
        	} 
        	
        	for (var i = 0; i <= nuMax; i++ ) {
        		lista.push(i);
        	}
        	
        	return lista;
        }
        
        vm.getListaDispositivos = function () {
        	var listaDispositivos = [];
        	vm.hideAmplDispo = false;
        	
        	for (var dispositivo in vm.dispositivos) {
        		var index = 0;
    			var countAir = 0;
    			var countPro = 0;
        		for (var j = 0; j < vm.dispositivos[dispositivo].NU_DISPOSITIVOS; j++) {
        			var isBanda = false;
        			var obj = {
        				DS_TIPO_DISPOSITIVO: vm.dispositivos[dispositivo].DS_TIPO_DISPOSITIVO,
                        ID_FORMAPAGO: vm.periodicidad.ID_FORMAPAGO,
        				ID_TIPO_DISPOSITIVO: vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO,
        				NU_DISPOSITIVOS: vm.getNuDispositivos()
            		}
            		
        			if (vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO != 5) {
						if (vm.dispositivos[dispositivo].NU_BANDA > 0 && index < vm.dispositivos[dispositivo].NU_BANDA) {

							if (dispositivo == 3) {
								if (vm.dispositivos[dispositivo].AIR > 0 && countAir < vm.dispositivos[dispositivo].AIR) {
									obj.ID_BANDA_DISPOSITIVO = 2;
									obj.DS_BANDA_DISPOSITIVO = vm.getDsBanda(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
									obj.NU_FRANQUICIA = vm.getNuFranquicia(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
									countAir++;
								} else if (vm.dispositivos[dispositivo].PRO > 0 && countPro < vm.dispositivos[dispositivo].PRO) {
									obj.ID_BANDA_DISPOSITIVO = 3;
									obj.DS_BANDA_DISPOSITIVO = vm.getDsBanda(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
									obj.NU_FRANQUICIA = vm.getNuFranquicia(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
									countPro++;
								}
							} else {
								obj.ID_BANDA_DISPOSITIVO = 2;
								obj.DS_BANDA_DISPOSITIVO = vm.getDsBanda(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
								obj.NU_FRANQUICIA = vm.getNuFranquicia(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
							}
						} else {
							obj.ID_BANDA_DISPOSITIVO = 1;
							obj.DS_BANDA_DISPOSITIVO = vm.getDsBanda(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
							obj.NU_FRANQUICIA = vm.getNuFranquicia(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, obj.ID_BANDA_DISPOSITIVO);
						}

						if (obj.ID_TIPO_DISPOSITIVO == 1 && obj.NU_DISPOSITIVOS > 0) {
							vm.ampCamb = true;
							vm.hideAmplDispo = true;
						}
            		} else {
            			var bandaConsola = 2;
            			if (vm.dispositivos[dispositivo].NU_BANDA > 0 && index < vm.dispositivos[dispositivo].NU_BANDA) {
            				bandaConsola = 3;
							vm.ampCamb = true;
							vm.hideAmplDispo = true;
            			}
            			obj.ID_BANDA_DISPOSITIVO = bandaConsola;
						obj.DS_BANDA_DISPOSITIVO = vm.getDsBanda(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, bandaConsola);
						obj.NU_FRANQUICIA = vm.getNuFranquicia(vm.dispositivos[dispositivo].ID_TIPO_DISPOSITIVO, bandaConsola);
            		}
        			
        			listaDispositivos.push(obj);
        			index++;
        		}
        	}
        	
        	return listaDispositivos;
        }
        
        vm.validate = function(form2Validate) {
            if(form2Validate.$valid) {
                if(vm.step == 2) {
                    vm.emitir();
                }
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
            }
        }
        
        vm.getDsBanda = function (idDispositivo, idBanda) {
        	return vm.objDispositivosAll.find(x => x.ID_TIPO_DISPOSITIVO == idDispositivo && x.ID_BANDA_DISPOSITIVO == idBanda).DS_BANDA_DISPOSITIVO;
        }
        
        vm.getNuFranquicia = function (idDispositivo, idBanda) {
        	return vm.objDispositivosAll.find(x => x.ID_TIPO_DISPOSITIVO == idDispositivo && x.ID_BANDA_DISPOSITIVO == idBanda).NU_FRANQUICIA;
        }

        vm.dlPolicy = function() {
        	vm.parent.abrirModalcargar(true);
        	PolizaService.getCondicionesExt(vm.datos.NU_POLIZA)
        	.then(function successCallback(response){
        		if(response.status==200){
					let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(response.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                    	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                    	if(objtMensajeUArchivo.ID_RESULT != 0) {
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						saveAs(new Blob([response.data]), vm.datos.NU_POLIZA + '.pdf');
						msg.textContent('Se ha descargado la póliza correctamente');
						$mdDialog.show(msg);
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar las condiciones');
					$mdDialog.show(msg);
        		}
     		},function(error) {
				msg.textContent('Se ha producido un error al descargar las condiciones');
				$mdDialog.show(msg);
            });
        	
//            window.open(BASE_CON + '/external/getCondiciones/' + vm.datos.NU_POLIZA,'_blank');
        }
        
        vm.volver = function () {
        	vm.step = 1;
        }
        
        vm.confirmarDispositivos = function () {
        	$mdDialog.show({
                templateUrl: BASE_SRC+'detalle/detalle.modals/confirmacion_dispositivos.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    md.cargarReconectar = false;
                    
                    md.aceptar = function(){
                        vm.step = 2;
                        md.cancel();
                    }
                    
                    md.$onChanges = function(){
                        
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
            });
        }
        
        vm.getColectivosTarificables = function () {
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
            var colectivosTarificables = [];
            for(var i = 0; i < productos.length; i++) {
                var producto = productos[i];
                if(producto.ID_PRODUCTO != null && producto.ID_PRODUCTO == 18 && producto.IN_TARIFICA == true) {
                    colectivosTarificables.push(producto)
                }
            }
            return colectivosTarificables;
        }
        
        vm.showColectivos = function (tar) {
			$mdDialog.show({
                templateUrl: BASE_SRC+'detalle/detalle.modals/select_colectivo.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                escapeToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    md.cargarReconectar = false;
                    md.colectivos = vm.colectivos;
                    md.idColectivo = null;
                    md.colectivosHijo = [];
                    md.productos = JSON.parse(window.sessionStorage.perfil).productos;
                    
                    this.$onInit = function() { 
                        var listProductos = [18];
                        for(var i = 0; i < md.productos.length; i++) {
                            var producto = md.productos[i];
                            if(producto.ID_PRODUCTO != null && listProductos.includes(producto.ID_PRODUCTO)) {
                                md.colectivosHijo.push(producto)
                            }
                        }
                	}
                    
                    md.confirmarColectivo = function () {
                    	vm.idColectivo = md.idColectivo;
                        vm.colectivo = md.productos.find(x => x.ID_TIPO_POLIZA == vm.idColectivo);
                        $mdDialog.cancel();
                    }
                    
                    md.hide = function() {
                        $mdDialog.hide();
                    };

                    md.cancel = function() {
                    	if (/clientes/.test($location.url()) && vm.busquedaPresupuesto != null) {
                    		vm.busquedaPresupuesto.cerrarTab(vm.busquedaPresupuesto.numDetalles.length);
                    		$mdDialog.cancel();
                    		vm.busquedaPresupuesto.crearPresupuesto();
                    	} else {
                        	window.location = window.location.origin + window.location.pathname + '#!/area_privada';
                            $mdDialog.cancel();
                    	}
                    };

                    md.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };
              
                }]
            });
		}
        
        vm.getOwnPartners = function(partners, atr, id) {
            var lstPartners = [];
            for(var i = 0; i < partners.length; i++) {
                if(partners[i][atr] != undefined && partners[i][atr] ==  id) {
                    lstPartners.push(partners[i])
                }
            }
            return lstPartners;
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
        
        vm.buscarClienteContratacion = function () {
        	vm.documentoBuscadoContratacion = true;
        	vm.clienteEncontradoContratacion = null;
        	vm.loadClienteContratacion = true;
        	
        	//Eliminar datos del tomador
        	if (vm.datos != null && vm.datos.PRESUPUESTO != null && vm.datos.PRESUPUESTO.PECUNIARIAS != null && vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR != null) {
            	for (var campo in vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR) {
            		if (campo != "NU_DOCUMENTO") {
            			vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR[campo] = null;
            		}
            	}
        	}
        	
        	//Eliminar IBAN
        	if (vm.datos != null && vm.datos.PRESUPUESTO != null && vm.datos.PRESUPUESTO.PECUNIARIAS != null && vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO != null && vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN != null) {
        		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN = null;
        	}
        	
        	
        	ClienteService.getCliente({ NU_DOCUMENTO: vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_DOCUMENTO})
            .then(function successCallback(data) {
            	if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
            		vm.clienteEncontradoContratacion = true;
                	
            		var cliente = data.data;
            		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = cliente;
            		vm.isDomicilioTomador = false;

					if(data.data.ID_TIPO_DOCUMENTO == 2 || data.data.ID_TIPO_DOCUMENTO == 6) {
						vm.isEmpresa = true;
					} else {
						vm.isEmpresa = false;
					}
            		
                	vm.camposEditablesContratacion = {
            			NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
            			NO_APELLIDO1: (cliente.NO_APELLIDO1 == null || cliente.NO_APELLIDO1 == "") ? true : false,
            			NO_APELLIDO2: (cliente.NO_APELLIDO2 == null || cliente.NO_APELLIDO2 == "") ? true : false,
            			NO_DIRECCION: true,
            			CO_POSTAL: true,
            			NO_EMAIL: true,
            			NU_TELEFONO: true,
            			CO_IBAN: true
                	}
                	
                	if (cliente.NU_TELEFONO1 != null && cliente.NU_TELEFONO1 != "") {
                		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO2 = cliente.NU_TELEFONO1;
                	}
					// else if (cliente.NU_FAX != null && cliente.NU_FAX != "") {
                	// 	vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_FAX;
                	// }

                	if (cliente.LIST_CUENTASBANCARIAS != null && cliente.LIST_CUENTASBANCARIAS.length > 0 && cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
                		vm.camposEditablesContratacion.CO_IBAN = true;
                		
                		if (vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO == null) {
                			vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO = {};
                		}
                		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN = cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN;
                	}

                	if (cliente.LIST_DOMICILIOS != null && cliente.LIST_DOMICILIOS.length > 0 && cliente.LIST_DOMICILIOS[0] != null) {
                		vm.noDireccion = "";
						var domicilio = cliente.LIST_DOMICILIOS[0];
						
						//Juntamos los campos de la dirección para mostrarlo en no dirección
						var listCamposDireccion = ['DS_TIPO_VIA', 'NO_DIRECCION', 'NU_NUMERO', 'NO_ESCALERA', 'NU_PLANTA', 'NO_PISO', 'NO_PUERTA'];
						for (var i = 0; i < listCamposDireccion.length; i++) {
							if (domicilio[listCamposDireccion[i]] != null && domicilio[listCamposDireccion[i]] != "") {
								vm.noDireccion += domicilio[listCamposDireccion[i]] + " ";
							}
						}

						//Seteamos los datos de la dirección al tomador
						var listCamposSetearTomador = ['CO_POSTAL', 'NO_LOCALIDAD', 'NO_PROVINCIA', 'ID_PROVINCIA', 'ID_TIPO_VIA', 'DS_TIPO_VIA', 'NO_DIRECCION', 'NU_NUMERO', 'NO_ESCALERA', 'NU_PLANTA', 'NO_PISO', 'NO_PUERTA'];
						for (var i = 0; i < listCamposSetearTomador.length; i++) {
							if (domicilio[listCamposSetearTomador[i]] != null && domicilio[listCamposSetearTomador[i]] != "") {
								vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR[listCamposSetearTomador[i]] = domicilio[listCamposSetearTomador[i]];
								
								if (listCamposSetearTomador[i] == "CO_POSTAL") {
									vm.camposEditablesContratacion.CO_POSTAL = false;
									vm.checkPostal(domicilio[listCamposSetearTomador[i]], domicilio.NO_LOCALIDAD);
								}
							}
						}
						
						if (vm.noDireccion != null && vm.noDireccion != "") {
							vm.isDomicilioTomador = true;
							vm.camposEditablesContratacion.NO_DIRECCION = false;
						}
					}
                	
            		vm.loadClienteContratacion = false;
            	} else {
            		vm.camposEditablesContratacion = { NO_NOMBRE: true, NO_APELLIDO1: true, NO_APELLIDO2: true, NO_DIRECCION: true, CO_POSTAL: true, NO_EMAIL: true, NU_TELEFONO: true, CO_IBAN: true }
            		vm.loadClienteContratacion = false;
            		vm.clienteEncontradoContratacion = false;
					if(data.data.ID_TIPO_DOCUMENTO == 2 || data.data.ID_TIPO_DOCUMENTO == 6) {
						vm.isEmpresa = true;
					} else {
						vm.isEmpresa = false;
					}
            	}
            }, function callBack(response) {
            	vm.loadClienteContratacion = false;
            });
        }
        
        vm.emailCorrect = function (email) {
        	if (email != null && email != "") {
        		return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
        	} else {
        		return false;
        	}
        }
        
        vm.isPrepoliza = function (producto) {
            TiposService.isPrepoliza(producto)
            .then(function successCallback(response) {
            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                    if (response.data.TIPOS.TIPO[0].DS_TIPOS == "true" || response.data.TIPOS.TIPO[0].DS_TIPOS == true) {
                        vm.condicionadoPresupuesto = true;
                    } else {
                        vm.condicionadoPresupuesto = false;
                    }
                } else {
                    vm.condicionadoPresupuesto = false;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }
        
        vm.isFirmaDigital = function(producto){
            TiposService.isFirmaDigital(producto)
            .then(function successCallback(response) {
            	if (response.data != null) {
                   vm.firmaDigital = response.data;
                    
                } else {
                    vm.firmaDigital = false;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }
        
        vm.abrirAccesoMovistar = function () {
        	$mdDialog.show({
                templateUrl: BASE_SRC+'presupuesto/form.presupuesto.modal/protocolo_acceso_movistar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    
                    md.$onInit = function () {
                    	md.datos = vm.datos.PRESUPUESTO.PECUNIARIAS;
                    }
                    
                    md.buscarCliente = function(){
                    	vm.documentoBuscado = true;
                    	md.loadCliente = true;
                    	md.clienteEncontradoMovistar = null;
                    	ClienteService.getClienteMovistar({ NU_DOCUMENTO: vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_DOCUMENTO})
                        .then(function successCallback(data) {
                        	if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                            	
                        		var cliente = data.data;
                        		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = cliente;
                        		vm.isDomicilioTomador = false;
                        		
                            	vm.camposEditablesContratacion = {
                        			NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                        			NO_APELLIDO1: (cliente.NO_APELLIDO1 == null || cliente.NO_APELLIDO1 == "") ? true : false,
                        			NO_APELLIDO2: (cliente.NO_APELLIDO2 == null || cliente.NO_APELLIDO2 == "") ? true : false,
                        			NO_DIRECCION: (cliente.NO_DIRECCION == null || cliente.NO_DIRECCION == "") ? true : false,
                        			CO_POSTAL: (cliente.CO_POSTAL == null || cliente.CO_POSTAL == "") ? true : false,
                        			NO_EMAIL: true,
                        			NU_TELEFONO: true,
                        			CO_IBAN: true
                            	}
                            	
                            	if (cliente.NU_TELEFONO1 != null && cliente.NU_TELEFONO1 != "") {
                            		vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO2 = cliente.NU_TELEFONO1;
                            	}
								// else if (cliente.NU_FAX != null && cliente.NU_FAX != "") {
                            	// 	vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_FAX;
                            	// }

    							if (cliente.LIST_CUENTASBANCARIAS != null && cliente.LIST_CUENTASBANCARIAS.length > 0) {
    								if (vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO == null) {
    									vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO = {};
    								}
    								if (cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
    									vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN = cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN;
    									vm.camposEditablesContratacion.CO_IBAN = true;
    								}
    							}
    							
    		                    if (cliente.LIST_DOMICILIOS != null && cliente.LIST_DOMICILIOS.length > 0 && cliente.LIST_DOMICILIOS[0] != null) {
    		                        vm.noDireccion = "";
    		                        var domicilio = cliente.LIST_DOMICILIOS[0];
    		                        
    		                        //Juntamos los campos de la dirección para mostrarlo en no dirección
    		                        var listCamposDireccion = ['DS_TIPO_VIA', 'NO_DIRECCION', 'NU_NUMERO', 'NO_ESCALERA', 'NU_PLANTA', 'NO_PISO', 'NO_PUERTA'];
    		                        for (var i = 0; i < listCamposDireccion.length; i++) {
    		                            if (domicilio[listCamposDireccion[i]] != null && domicilio[listCamposDireccion[i]] != "") {
    		                                vm.noDireccion += domicilio[listCamposDireccion[i]] + " ";
    		                            }
    		                        }

    		                        //Seteamos los datos de la dirección al tomador
    		                        var listCamposSetearTomador = ['CO_POSTAL', 'NO_LOCALIDAD', 'NO_PROVINCIA', 'ID_PROVINCIA', 'ID_TIPO_VIA', 'DS_TIPO_VIA', 'NO_DIRECCION', 'NU_NUMERO', 'NO_ESCALERA', 'NU_PLANTA', 'NO_PISO', 'NO_PUERTA'];
    		                        for (var i = 0; i < listCamposSetearTomador.length; i++) {
    		                            if (domicilio[listCamposSetearTomador[i]] != null && domicilio[listCamposSetearTomador[i]] != "") {
    		                                vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR[listCamposSetearTomador[i]] = domicilio[listCamposSetearTomador[i]];
    		                                
    		                                if (listCamposSetearTomador[i] == "CO_POSTAL") {
    		                                    vm.camposEditablesContratacion.CO_POSTAL = false;
    		                                    vm.checkPostal(domicilio[listCamposSetearTomador[i]], domicilio.NO_LOCALIDAD);
    		                                }
    		                            }
    		                        }
    		                        
    		                        if (vm.noDireccion != null && vm.noDireccion != "") {
    		                            vm.isDomicilioTomador = true;
    		                            vm.camposEditablesContratacion.NO_DIRECCION = false;
    		                        }
    		                    }

                            	md.clienteEncontradoMovistar = true;
                            	md.cancel();
                        	} else {
                        		vm.camposEditablesContratacion = { NO_NOMBRE: true, NO_APELLIDO1: true, NO_APELLIDO2: true, NO_DIRECCION: true, CO_POSTAL: true, NO_EMAIL: true, NU_TELEFONO: true, CO_IBAN: true }
                        		md.clienteEncontradoMovistar = false;
                        	}
                        	md.loadCliente = false;
                        }, function callBack(response) {
                        	md.loadCliente = false;
                        });
                    }
                    
                    md.hide = function() {
                        $mdDialog.hide();
                    };

                    md.cancel = function() {
                        $mdDialog.cancel();
                    };

                }]
            });
        }

		vm.checkMobilePhoneNumber	= function() {
			if(vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO.substr(0, 1).match(/[6-7]/) == null)
				vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO = vm.datos.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NU_TELEFONO.substr(1);
		}
    }
    ng.module('App').component('tarDispositivosApp', Object.create(tarDispositivosComponent));

})(window.angular);