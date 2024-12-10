(function (ng) {


    //Crear componente de app
    var tarCiberparticularesComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$window', '$q', '$mdDialog', '$location', 'EmpresaService', 'BASE_CON', 'BASE_SRC', 'PresupuestoService', 'TiposService', 'PolizaService', 'ComisionService', 'UsuarioWSService', 'CommonUtils', 'ClienteService', 'LocalidadesService', 'constantsTipos'],
        require: {
            parent: '^sdApp',
            busquedaPresupuesto: '^?busquedaPresupuesto'
        },
        bindings: {
        	detalles: '<',
        	llave: '<'
        }
    }

    tarCiberparticularesComponent.controller = function tarCiberparticularesComponentControler($window, $q, $mdDialog, $location, EmpresaService, BASE_CON, BASE_SRC, PresupuestoService, TiposService, PolizaService, ComisionService, UsuarioWSService, CommonUtils, ClienteService, LocalidadesService, constantsTipos) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.anualPrice = null;
        vm.step = 1;
        vm.calc = false;
        vm.priceable = true;
        vm.selAtks = [];
        vm.msgForm = null;
        vm.amount = {
            'DS_TIPOS': 0
        };
        vm.amountCC = 0;
        vm.loadingForm = false;
        vm.option = 0;
        vm.showDatos = false;
        vm.date = new Date();
        vm.opciones = {
    		fechaEfecto: new Date()
        }
        vm.colectivo = null;
        vm.checkFecha = false;
        vm.objHolder = {};
        vm.maxFacturacion = 31000000;
        vm.idUsuario = null;
    	vm.emailAccept = false;
        vm.tipoMedioPago = null;
        vm.changeComisionistaNumber = 0;
        vm.formaPago = 2;
        vm.showMenusRedirect = {
    		polizas: true,
    		siniestros: true,
    		presupuestos: true,
    		recibos: true
        }
		vm.hidePrice = false;
		vm.switchContratarPoliza = false;
        vm.listComisionistas = [];
        vm.loadingLstComis = false;
        
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');



        this.loadTemplate = function() {
            return "src/tarificador/tarificador.view/tar.ciberparticulares.html";
        }

        this.$onInit = function() {
        	vm.colectivos = [];
            vm.idColectivo = null;
        	var perfil = null;
        	vm.perfil = null;
            vm.mediador = null;
    		vm.rol = window.sessionStorage.rol;
            vm.maxFacturacion = (vm.rol == 1 || vm.rol == 4) ? 999999999 : 31000000;
            vm.productosAll = JSON.parse(window.sessionStorage.perfil).productos;
            
            if ($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				perfil = JSON.parse($window.sessionStorage.perfil);
				vm.perfil = JSON.parse($window.sessionStorage.perfil);
				
			vm.productosPer = vm.productosAll.filter(x => x.ID_PRODUCTO == 28);
			
			if(vm.productosPer.length == 1){
				vm.producto = vm.productosPer[0];
			}

				if (perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
					vm.mediador = {
						ID_COMPANIA: perfil.adicional.ID_COMPANIA,
						NO_COMPANIA: perfil.adicional.NO_COMPANIA
					}
				}
            }
            
            vm.medidaEdicion = 169;
	        if (/clientes/.test($location.url())) {
	            vm.medidaEdicion = 262;
	        }
	        
            //Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.isEdited = true;
                vm.budgetId = vm.detalles.ID_PRESUPUESTO;
                
                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.CIBERPARTICULARES != null) {
                    var ciberparticulares = vm.detalles.PECUNIARIAS.CIBERPARTICULARES;
                    vm.amount = ciberparticulares.AMMOUNT_OPTION;
                }

        		if (vm.objPres == null && vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
        			vm.objPres = {
    					ID_PRESUPUESTO: vm.detalles.ID_PRESUPUESTO,
        				PRESUPUESTO: {
        					CO_PRODUCTO: "CBP",
    						ID_RAMO: vm.detalles.ID_RAMO,
    						NO_USUARIO: vm.detalles.NO_USU_ALTA,
    						PECUNIARIAS: vm.detalles.PECUNIARIAS
        				}
        			}
        			
        			if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
        				vm.objPres.MODALIDADES = {
    						MODALIDAD: [ vm.detalles.LIST_TARIFAS[0] ]
        				}
        			}
        		}
                
                if (vm.detalles.OCLIENTE != null && vm.detalles.OCLIENTE.ID_CLIENTE != null) {
                    let lstAtr = ['NO_NOMBRE', 'NO_APELLIDO1', 'NO_APELLIDO2', 'NU_DOCUMENTO', 'NO_EMAIL', 'FD_NACIMIENTO'];
                    for(var i = 0; i < lstAtr.length; i++) {
                        if(vm.detalles.OCLIENTE[lstAtr[i]])
                            vm.objHolder[lstAtr[i]] = vm.detalles.OCLIENTE[lstAtr[i]];
                    }
                    if(vm.detalles.OCLIENTE.NU_TELEFONO1)
                        vm.objHolder.NU_TELEFONO = vm.detalles.OCLIENTE.NU_TELEFONO1;
                	
                	if(vm.detalles.OCLIENTE.NO_NOMBRE_COMPLETO && (!vm.detalles.OCLIENTE.NO_NOMBRE || !vm.detalles.OCLIENTE.NO_APELLIDO1)) {
                		var nombreCompleto = vm.detalles.OCLIENTE.NO_NOMBRE_COMPLETO;
                		nombreCompleto = nombreCompleto.split(" ");
                		
                		if (nombreCompleto != null) {
                			if (nombreCompleto[0] != null) {
                            	vm.objHolder.NO_NOMBRE = nombreCompleto[0];
                			}
                			if (nombreCompleto[1]) {
                            	vm.objHolder.NO_APELLIDO1 = nombreCompleto[1];
                			}
                		}
                	}
                }

                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.NU_DOCUMENTO != null) {
                	vm.nuDocumento = vm.detalles.PECUNIARIAS.NU_DOCUMENTO;
		        	vm.documentoValido = true;
        			vm.disabledDocumento = true;
                }
                
                if (vm.detalles.IS_NUEVO_PRESU_EXISTENTE == true) {
                	delete vm.detalles.IS_NUEVO_PRESU_EXISTENTE;
                	vm.retarificarEdit(true);
                } else if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
                	vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
                } else {
                	vm.retarificarEdit();
                }

            }
            //Si estamos creando el presupuesto desde un cliente
            else if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO == null) {
                if (vm.detalles.OCLIENTE != null) {
                    var listaCampos = ["NO_NOMBRE","NO_APELLIDO1","NO_APELLIDO2","NU_DOCUMENTO","NO_EMAIL","FD_NACIMIENTO"];
                    for (var i = 0; i < listaCampos.length; i++) {
                        vm.objHolder[listaCampos[i]] = vm.detalles.OCLIENTE[listaCampos[i]];
                    }
                    vm.objHolder.NU_TELEFONO = vm.detalles.OCLIENTE.NU_TELEFONO1;
                }
            }
            
            if (vm.budgetId == null) {
	            var perfil = JSON.parse(sessionStorage.getItem('perfil'));
            }
                   
			//Comprobar si existen los menús, para poder redirigir
			var permisosPoliza = vm.parent.getPermissions('polizas_list');
			if (permisosPoliza == null || permisosPoliza.EXISTE == false) {
				vm.showMenusRedirect.polizas = false;
			}
			var permisosSiniestros = vm.parent.getPermissions('siniestros_list');
			if (permisosSiniestros == null || permisosSiniestros.EXISTE == false) {
				vm.showMenusRedirect.siniestros = false;
			}
			var permisosPresupuestos = vm.parent.getPermissions('presupuestos_list');
			if (permisosPresupuestos == null || permisosPresupuestos.EXISTE == false) {
				vm.showMenusRedirect.presupuestos = false;
			}
			
			//Validamos las url de los recibos
			var permisosRecibosMovimientosList = vm.parent.getPermissions('recibos_movimientos_list');
			var permisosRecibosList = vm.parent.getPermissions('recibos_list');
			vm.urlRecibos = '#!/recibos_movimientos_list?idPrograma=2';
			if (permisosRecibosMovimientosList == null || permisosRecibosMovimientosList.EXISTE == false) {
				if (permisosRecibosList == null || permisosRecibosList.EXISTE == false) {
					vm.showMenusRedirect.recibos = false;
				} else {
					vm.urlRecibos = '#!/recibos_list?idPrograma=2';
				}
			}

            // ID_COMP_RAMO_PROD: 28, ID_RAMO: 103
            ComisionService.getComisionistasProducto({'ID_COMP_RAMO_PROD': '28', 'CO_TIPO_COMISION': 'MD'})
            .then(function successCallback(response) {
                if (response.status === 200) {
                	if (response.data != null && response.data.COMISIONISTASPROD != null && response.data.COMISIONISTASPROD.COMISIONISTAPROD != null) {
                		vm.listComisionistas = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
                	    if (vm.listComisionistas != null && vm.listComisionistas.length === 1) {
                	    	if (vm.autocomplete == null) {
                	    		vm.autocomplete = {};
                	    	}
                	    	vm.autocomplete.COMISIONISTA = vm.listComisionistas[0];
                            vm.idComisionista = vm.autocomplete.COMISIONISTA.ID_COMPANIA;
                	    }

                        if(vm.isEdited) {
                            for(let i = 0; i < vm.listComisionistas.length; i++) {
                                if(vm.detalles.ID_MEDIADOR === vm.listComisionistas[i].ID_COMPANIA) {
                                    vm.autocomplete.COMISIONISTA = vm.listComisionistas[i];
                                    vm.idComisionista = vm.autocomplete.COMISIONISTA.ID_COMPANIA;
                                    vm.loadingLstComis = true;
                                    break;
                                }
                            }
                        }

                        if((vm.rol === 1 || vm.rol === 4) && vm.autocomplete && vm.autocomplete.COMISIONISTA && vm.autocomplete.COMISIONISTA.ID_COMPANIA) {
                            vm.loadGestores = true;
                            UsuarioWSService.getUserByCia(`${vm.autocomplete.COMISIONISTA.ID_COMPANIA}?pr=28`)
                            .then(function successCallback(response) {
                                vm.loadGestores = false;
                                if (response.status === 200) {
                                    vm.listUsers = [];
                                    if (response.data != null && response.data.USUARIOS != null) {
                                        vm.listUsers = response.data.USUARIOS;
            
                                        for (var i = 0; i < vm.listUsers.length; i++) {
                                            vm.listUsers[i].NO_SELECT = vm.getUserName(vm.listUsers[i]);
                                            if(vm.isEdited && vm.detalles.NO_USU_ALTA === vm.listUsers[i].NO_USUARIO) {
                                                vm.autocomplete.GESTOR = vm.listUsers[i]; 
                                            }
                                        }
                                    } 
                                }
                            }, function callBack(response) {
                                vm.loadGestores = false;
                            });
                        }
                	}
                }
            }, function callBack(response) {
            });

            // if(vm.rol !== 1 && vm.rol !== 4) {
            //     vm.listUsers = [];
            //     vm.listUsers = [vm.perfil.adicional];
            //
            //     var gestorSeleccionado = vm.listUsers[0];
            //     if (gestorSeleccionado != null) {
            //         if (vm.autocomplete == null) {
            //             vm.autocomplete = {};
            //         }
            //         vm.autocomplete.GESTOR = gestorSeleccionado;
            //         vm.idUsuario = gestorSeleccionado.NO_USUARIO;
            //     }
            //
            //     for (var i = 0; i < vm.listUsers.length; i++) {
            //         vm.listUsers[i].NO_SELECT = vm.getUserName(vm.listUsers[i]);
            //     }
            // }

            if(vm.rol != 1 && vm.rol != 4) {          
            	          	
            	vm.mediador = vm.producto.ID_COMPANIA;
            	vm.idColectivo = vm.producto.ID_TIPO_POLIZA;
            	
            	
            	vm.idUsuario = vm.perfil.adicional.ID_USUARIO
                vm.NO_AGENTE = vm.perfil.usuario

                TiposService.getAmmount(vm.mediador)
                    .then(function successCallback(response) {
                        if (response.status === 200) {

                            vm.tpAmount = response.data.TIPOS.TIPO;
                            vm.tpAmount.sort(function(a, b) {
                                if (parseInt(a.ID_TIPO_INTERNO) > parseInt(b.ID_TIPO_INTERNO)) {
                                    return 1;
                                }
                                if (parseInt(a.ID_TIPO_INTERNO) < parseInt(b.ID_TIPO_INTERNO)) {
                                    return -1;
                                }
                                return 0;
                            });

                            if (vm.amount != null)
                                vm.amount = vm.tpAmount.find(x => x.CO_TIPO === vm.amount);

                        }
                    }, function callBack(response) {
                        if (response.status === 406 || response.status === 401) {
                            vm.parent.logout();
                        }
                    });

            }else{
              vm.mediador = vm.mediador.ID_COMPANIA
              vm.idColectivo = vm.perfil.adicional.ID_TIPOCOLECTIVO     
            }

        }

        this.$onChanges = function() {

        }
    

        vm.checkAmounts = function(validate) {
            if(vm.addCCE === true) {
                vm.amountCC = '100.000 €';
            } else {
                if(vm.amount.CO_TIPO <= 1) {
                    vm.amountCC = '25.000 €';
                } else {
                    vm.amountCC = '50.000 €';
                }
            }
            if (validate == true) {
                vm.validate(vm.formTarParticulares);
            }
        }

        vm.rate = function(next, nuevoPresupuesto) {

            if(vm.rol == 1 || vm.rol == 4) {

                vm.idColectivo = vm.autocomplete.GESTOR.ID_TIPOCOLECTIVO
                vm.mediador = vm.autocomplete.COMISIONISTA.ID_COMPANIA
                vm.idUsuario = vm.autocomplete.GESTOR.ID_USUARIO
                vm.NO_AGENTE =  vm.autocomplete.GESTOR.NO_USUARIO

            }

            const obj = {
                ID_RAMO: 103,
                CO_PRODUCTO: "CBP",
                ID_COMP_RAMO_PROD: 28,
                ID_TIPO_POLIZA: vm.idColectivo,
                ID_MEDIADOR: vm.mediador,
                ID_USUARIO: vm.idUsuario,
                NO_USUARIO: vm.NO_AGENTE,
                OPOLIZA: {
                    CO_CANAL: '4'
                },
                PECUNIARIAS: {
                    CIBERPARTICULARES: {
                        ID_MEDIADOR: vm.mediador,
                        ID_FORMAPAGO: '2',
                        AMMOUNT_OPTION: vm.amount.CO_TIPO
                    },
                    LST_GARANTIAS: [
                        {
                            ID_GARANTIA: 9,
                            NU_CAPITAL: vm.formatAmount(vm.amount.DS_TIPOS)
                        }
                    ],
                    DATOS_PAGO: {
                        ID_FORMAPAGO: vm.formaPago,
                        FD_INICIO: vm.getFdInicio()
                    }
                }
            };

            if(vm.budgetId !== undefined && vm.budgetId !== '' && nuevoPresupuesto !== true) {
                obj.ID_PRESUPUESTO = vm.budgetId;
            }
        	
            if (vm.objHolder != null && Object.keys(vm.objHolder).length !== 0) {
            	obj.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            }
            
            vm.calc = true;

            EmpresaService.rate(obj)
            .then(function successCallback(response) {
                if(response.status === 200) {
                    if(response.data !== undefined && (response.data.ID_RESULT === 0 || response.data.ID_RESULT === 6)) {
						
                        vm.budgetId = response.data.ID_PRESUPUESTO;
                        
                        if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                        	if (vm.formaPago == 7) {
                                vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_TOT;
                                vm.anualPrice = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        	} else {
                                vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                                vm.anualPrice = null;
                        	}
                        }

                        if (nuevoPresupuesto == true && vm.busquedaPresupuesto != null) {
                        	vm.busquedaPresupuesto.numDetalles[vm.busquedaPresupuesto.active - 1].ID_PRESUPUESTO = response.data.ID_PRESUPUESTO; 
                        }
                        
                        vm.objPres = response.data;
                        vm.calc = false;
                        if (next == true) {
                        	vm.step = 2;
                        }
                        
                        if (vm.detalles == null && next != true && response.data.ID_RESULT == 6) {
                    		vm.hidePrice = true;
                    		var confirm = $mdDialog.confirm()
                            .textContent(response.data.DS_RESULT)
                            .ok('Aceptar');

                	        $mdDialog.show(confirm).then(function () {
                        		vm.hidePrice = false;
                	        }, function () {
                        		vm.hidePrice = false;
                	        	$mdDialog.cancel();
                	        });
                        } else {
                    		vm.hidePrice = false;
                        }
                    } else {
                        // vm.msgWarning = response.data.DS_RESULT;
                        vm.calc = false;
						vm.price = 0;
						msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    // vm.parent.logout();
                    // $location.path('/');
                }
            });
        }
        
        vm.getFdInicio = function () {
        	var date = new Date();
        	
        	var day = date.getDate();
        	if (day < 10) {
        		day = "0" + day;
        	}
        	
        	var month = date.getMonth() + 1;
        	if (month < 10) {
        		month = "0" + month;
        	}
        	
        	return date.getFullYear() + "-" + month + "-" + day;
        }
        
        vm.sendForm = function() {
            var obj = vm.objSendF;
            var listaCampos = ["NU_DOCUMENTO", "NO_NOMBRE", "NO_EMAIL", "NU_TELEFONO1"];

            for (var i = 0; i < listaCampos.length; i++) {
            	if (obj[listaCampos[i]] == null || obj[listaCampos[i]] == "") {
        			msg.textContent("Rellene los campos obligatorios");
        			$mdDialog.show(msg);
        			return null;
            	}
            }
            vm.loadingForm = true;
            
            EmpresaService.sendFormulario(obj, "CBP")
            .then(function successCallback(response) {
                if(response.data != null) {
                    if (response.data.ID_RESULT == 0) {
                        vm.msgForm = response.data.DS_RESULT;
                        vm.objSendF = {};
                    } else {
                        vm.msgForm = response.data.DS_RESULT;
                    }
                }
                vm.loadingForm = false;
            }, function callBack(response) {
                vm.loadingForm = false;
                vm.msgForm = "Ha ocurrido un error al enviar el formulario.";
            });
        }

        vm.contract = function() {
        	
            vm.objHolder.IS_LOPD = true;
            vm.objHolder.IS_ELECTRONICA = vm.acceptAdds == true ? true : false;
            
            if (vm.objHolder.FD_NACIMIENTO != null) {
            	// vm.objHolder.FD_NACIMIENTO = vm.getFd(vm.objHolder.FD_NACIMIENTO);
                vm.objHolder.FD_NACIMIENTO = CommonUtils.dateFormat(vm.objHolder.FD_NACIMIENTO);
            }
            
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = vm.objHolder;
            
            if (vm.bankAccount != null) {
            	for (var campo in vm.bankAccount) {
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO[campo] = vm.bankAccount[campo];
            	}
            }
            
            if (vm.address != null) {
            	for (var campo in vm.address) {
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR[campo] = vm.address[campo];
            	}
            }
            
            //Añadir otarifa
            if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD[0] != null) {
            	vm.objPres.OTARIFA = vm.objPres.MODALIDADES.MODALIDAD[0];
            }

            if(vm.NO_AGENTE != undefined && vm.NO_AGENTE != '') {
            	vm.objPres.NO_USUARIO = vm.NO_AGENTE;
            }
            
            if(vm.policyMail != undefined && vm.policyMail != '') {
            	vm.objPres.NO_EMAIL = vm.policyMail;
            }
            
            if(vm.assured && vm.holderNA) {
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA = vm.assured;
                if(vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.FD_NACIMIENTO)
                    vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.FD_NACIMIENTO = CommonUtils.dateFormat(vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.FD_NACIMIENTO);
            } else {
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;
            }

            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 7;
            
            if (vm.mediador.IN_COBRO_MEDIADOR == true) {
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 4;
            }
            
            vm.loading = true;

            if (vm.opciones.fechaEfecto != null) {

            	var fechaEfecto = new Date(vm.opciones.fechaEfecto);
            	var day = fechaEfecto.getDate();
            	if (day < 10) {
            		day = "0" + day;
            	}
            	var month = fechaEfecto.getMonth() + 1;
            	if (month < 10) {
            		month = "0" + month;
            	}
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.FD_INICIO = fechaEfecto.getFullYear() + "-" + month + "-" + day;
            }

            if (vm.opciones.fechaVencimiento != null && vm.checkFechaVencimiento == true) {
            	var fechaVencimiento = new Date(vm.opciones.fechaVencimiento);
            	var day = fechaVencimiento.getDate();
            	if (day < 10) {
            		day = "0" + day;
            	}
            	var month = fechaVencimiento.getMonth() + 1;
            	if (month < 10) {
            		month = "0" + month;
            	}
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.FD_VENCIMIENTO = fechaVencimiento.getFullYear() + "-" + month + "-" + day;
            }

            if (vm.checkEmail == true && vm.emailAccept == true) {
                vm.objPres.PRESUPUESTO.PECUNIARIAS.EMAIL_DOCUMENTACION = vm.opciones.email;
            }
            
            EmpresaService.contract(vm.objPres)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if (response.data.CO_ESTADO == 1) {
                        vm.objPres = response.data;
                        vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.NO_NOMBRE_COMPLETO = `${vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.NO_NOMBRE} ${vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA.NO_APELLIDO1}`;
                        vm.step = 3;
                    } else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
                    }
                    vm.loading = false;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    // vm.parent.logout();
                    // $location.path('/');
                }
                vm.loading = false;
                vm.calc = false;
            });
        }

        vm.checkPostal = function(code) {
            if(code != undefined && code.length == 5) {

                EmpresaService.cities(code)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if(response.data != undefined && response.data.LOCALIDAD != undefined) {
                            if (response.data.LOCALIDAD.length > 1) {
                                LocalidadesService.elegirLocalidad(response.data.LOCALIDAD, vm.address);
                            } else {
                                vm.address.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                            } 
                            vm.address.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                            vm.address.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                            vm.address.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;      
                            vm.address.ID_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA != null ? parseInt(response.data.LOCALIDAD[0].CO_PROVINCIA) : null;      
                        } else {
                            // vm.msgWarning = response.data.msg;
                            
                        }
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                    vm.calc = false;
                });
            }
        }

        vm.dlPolicy = function() {
        	vm.loading = true;
        	PolizaService.getCondiciones(vm.objPres.NU_POLIZA)
        	.then(function successCallback(response){
        		if(response.status==200){
					let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(response.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                    	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                    	if(objtMensajeUArchivo.ID_RESULT != 0) {
                    		vm.cargando = false;
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						vm.loading = false;
						saveAs(new Blob([response.data]), vm.objPres.NU_POLIZA + '.pdf');
						// vm.parent.abrirModalcargar();
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar las condiciones');
					$mdDialog.show(msg);
        		}
				vm.loading = false;
     		},function(error) {
				msg.textContent('Se ha producido un error al descargar las condiciones');
				$mdDialog.show(msg);
				vm.loading = false;
            });
//        	window.open(BASE_CON + '/tarificacion/getCondiciones/' + vm.objPres.NU_POLIZA,'_blank');
        }

        vm.dlExtension = function () {
            vm.loading = true;
            var extension = true;
        	PolizaService.getCondicionesExt(vm.objPres.NU_POLIZA, extension)
        	.then(function successCallback(response){
        		if(response.status==200){
					let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(response.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                    	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                    	if(objtMensajeUArchivo.ID_RESULT != 0) {
                    		vm.cargando = false;
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						vm.loading = false;
						saveAs(new Blob([response.data]), 'extension_ciberdelincuencia.pdf');
						// vm.parent.abrirModalcargar();
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar la extensión de ciberdelincuencia');
					$mdDialog.show(msg);
        		}
				vm.loading = false;
     		},function(error) {
				msg.textContent('Se ha producido un error al descargar la extensión de ciberdelincuencia');
				$mdDialog.show(msg);
				vm.loading = false;
            });
        	// window.open('src/documentos/extension_ciberdelincuencia.pdf', '_blank');
        }
        
        vm.reset = function() {
            vm.price = 0;
            vm.anualPrice = null;
            vm.budgetId = undefined;
            vm.amount = undefined
            vm.objHolder = null;
            vm.assured = null;
            vm.bankAccount = null;
            vm.address = null;
        }

        vm.formatAmount = function(amount) {
            if(amount != undefined && amount != '' && amount.charAt(0) != 'M') {
                return parseInt(amount.trim().replace("€", "").split(".").join(""));
            } else {
                if(amount != null && amount.charAt(0) == 'M') {
                    // return parseInt(amount.slice(amount.search('1.'), amount.length).trim().replace("€", "").split(".").join(""));
                    if (vm.mostrarTarificacionManual == true && vm.amountValue != null) {
						return vm.formatImporte(vm.amountValue);
					} else {
						return 1000001;
					}
                }
            }
        }

        vm.validate = function(form2Validate, tarificar) {
            if(form2Validate.$valid) {
                if(vm.step == 1) {
                	if (tarificar != false) {
                	}
                } else {
                    if(vm.step == 2 && vm.contractAdhoc != true) {
                        vm.contract();
                    } else if(vm.step == 2 && vm.contractAdhoc == true) {
                    	vm.emitirAdhoc();
                    }
                }
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
            }
        }

        vm.modalPdf = function(id, opt) {

            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/descarga.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.budgetId = id;
                    md.mensaje = null;
                    md.type = "CBP";
                    md.objHolder = {};
                    md.assured = {};
                    md.btnOpt = opt;

                    md.$onInit = function() {
                    }

                    md.sendPdf = function(sendEmail) {

                        if(!md.formDownloadBudget.$valid) {
                            return
                        }
                        
                        vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = md.objHolder;
                        vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = md.objHolder;

                        md.loading = true;
                        PresupuestoService.descargaPresupuesto(vm.objPres, sendEmail)
                        .then(function successCallback(data) {
                            if (data.status === 200) {
                                let utf8decoder = new TextDecoder();
                                var mensajeUArchivo = utf8decoder.decode(data.data);
                                if(mensajeUArchivo.search('ID_RESULT') != -1) {
                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                    if(objtMensajeUArchivo.ID_RESULT != 0) {
                                        var msgError = "Ha ocurrido un error en la exportación";
                                        if (objtMensajeUArchivo.DS_RESULT != null) {
                                            msgError = objtMensajeUArchivo.DS_RESULT;
                                        }
                                        msg.textContent(msgError);
                                        $mdDialog.show(msg);
                                    } else {
                                        if (sendEmail == true) {
                                            msg.textContent("El correo se ha enviado correctamente");
                                            $mdDialog.show(msg);
                                        }
                                    }
                                } else {
                                    if (sendEmail == true) {
                                        msg.textContent("El correo se ha enviado correctamente");
                                        $mdDialog.show(msg);
                                    } else {
                                        saveAs(new Blob([data.data], { type: 'application/pdf' }), md.budgetId + '.pdf');
                                        $mdDialog.hide();
                                    }
                                }
                            }
                            
                            md.loading = false;
                        });
                    }

                    md.buscarCliente = function () {
                    	md.loadCliente = true;
                    	ClienteService.getCliente({ NU_DOCUMENTO: md.objHolder.NU_DOCUMENTO})
                        .then(function successCallback(data) {
                        	if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                        		var cliente = data.data;
                        		md.objHolder.NO_NOMBRE = cliente.NO_NOMBRE;
                        		md.objHolder.NO_APELLIDO1 = cliente.NO_APELLIDO1;
                        		md.objHolder.NO_APELLIDO2 = cliente.NO_APELLIDO2;
                        		md.objHolder.NO_EMAIL = cliente.NO_EMAIL;

                                vm.objHolder = cliente;

                            	md.loadCliente = false;
                        	} else {
                            	md.loadCliente = false;
                        	}
                        }, function callBack(response) {
                        	md.loadCliente = false;
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
            })
            
        }
        
        vm.formatDate = function (date) {
        	if (date != null) {
        		var date = new Date(date);
        		
        		var day = date.getDate();
        		if (day < 10) {
        			day = "0" + day;
        		}
        		
        		var month = date.getMonth() + 1;
        		if (month < 10) {
        			month = "0" + month;
        		}
        		
        		return day + "/" + month + "/" + date.getFullYear();
        	}
        }
        
        vm.formatDateEmision = function (date) {
        	if (date != null) {
        		var date = new Date(date);
        		
        		var day = date.getDate();
        		if (day < 10) {
        			day = "0" + day;
        		}
        		
        		var month = date.getMonth() + 1;
        		if (month < 10) {
        			month = "0" + month;
        		}
        		
        		return date.getFullYear() + "-" + month + "-" + day;
        	}
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
        
        vm.volver = function () {
        	vm.step = 1;
        }

        vm.dateFormat = function (date) {
        	if (date != null) {       		
        		var fechaFormat = moment(date).format('DD/MM/YYYY')
                return fechaFormat;
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
        
        vm.aceptarEmail = function () {
        	vm.emailAccept = !vm.emailAccept;
        }

        vm.redirect = function (nombre) {
        	window.location.href = nombre;
        }
        
        vm.openMenu = function($mdMenu, ev) {
            var originatorEv = ev;
            $mdMenu.open(ev);
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
    	
    	function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
            	if (list[key] == null) {
            		return false;
            	} else {
                    if (key != "text") 
                        return (list[key].toUpperCase().includes(uppercaseQuery));
                    else
                        return (list[key].toUpperCase().includes(uppercaseQuery));
            	}
            };
        }
    	
    	vm.getUserName = function (user) {
    		let txt = ''
    		if(user) {
				if(user.NO_APELLIDO1)
                    return `${user.NO_NOMBRE} ${user.NO_APELLIDO1} - ${user.NO_USUARIO}`
                else
                    return `${user.NO_NOMBRE} - ${user.NO_USUARIO}`
    		}
    		return txt;
    	}
		
		vm.getDescriptivoCompania = function (item) {
			var text = "";
			if (item != null && item.ID_COMPANIA != null && vm.listComisionistas != null) {
				var comisionistasLength = vm.listComisionistas.filter(x => x.ID_COMPANIA == item.ID_COMPANIA).length;
				if (comisionistasLength > 1) {
					text = item.NO_COMPANIA + " (" + item.COLECTIVO + ")";
				} else {
					text = item.NO_COMPANIA;
				}
			}
			return text;
		}
		
		vm.getSumaAsegurada = function (suma) {
			if (vm.mostrarTarificacionManual == true && vm.amountValue != null) {
				return vm.amountValue + " €";
			} else return suma;
		}

        vm.changeOption = function (option) {
        	if (vm.option == option && option != 4) {
        		vm.option = 4;
        	} else if ((option == 4 && vm.option == 4) || (option == 4 && vm.option == 0)) {
        		vm.showDatos = !vm.showDatos;
        	} else if (option == 4 && vm.option == 4) {
        		vm.showDatos = true;
        		vm.option = 4;
        	} else {
        		vm.option = option;
        	}
        }

        // vm.getFd = function (fd) {
        // 	if (fd != null) {
        //     	var date = new Date(fd);
            	
        //     	var day = date.getDate();
        //     	if (day < 10) {
        //     		day = "0" + day;
        //     	}
            	
        //     	var month = date.getMonth() + 1;
        //     	if (month < 10) {
        //     		month = "0" + month;
        //     	}
            	
        //     	return date.getFullYear() + "-" + month + "-" + day;
        // 	}
        // }

        vm.checkHolder = function(opt) {
            vm.objHolderBU = JSON.parse(JSON.stringify(vm.objHolder));
            if(opt == true) {
                vm.assured = {
                    'NO_NOMBRE': '',
                    'NO_APELLIDO1': '',
                    'NO_APELLIDO2': '',
                    'NU_DOCUMENTO': '',
                    'NU_TELEFONO': '',
                    'NO_EMAIL': '',
                    'FD_NACIMIENTO': ''
                }
            } else {
                vm.objHolder = JSON.parse(JSON.stringify(vm.objHolderBU));
                vm.assured = vm.objHolder;
            }
        }

        vm.retarificarEdit = function (nuevoPresu) {
    	    if(vm.amount && vm.amount.CO_TIPO) {
    	    	if (nuevoPresu == null) {
    	    		nuevoPresu = false;
    	    	}
                vm.rate(false, nuevoPresu);
    	    } else {
                setTimeout(function(){ 
                    vm.retarificarEdit(nuevoPresu); 
                }, 1000);
    	    }
    	}

        vm.changeComisionista = function(idComisionista) {
            // if(vm.rol == 1 || vm.rol == 4) {
                if(!vm.loadingLstComis) {

                    if(idComisionista) {
                        vm.loadGestores = true;
                        vm.autocomplete.GESTOR = null;
                        UsuarioWSService.getUserByCia(`${idComisionista}?pr=28`)
                        .then(function successCallback(response) {
                            vm.loadGestores = false;
                            if (response.status == 200) {
                                vm.listUsers = [];
                                if (response.data != null && response.data.USUARIOS != null) {
                                    vm.listUsers = response.data.USUARIOS;
    
                                    for (var i = 0; i < vm.listUsers.length; i++) {
                                        vm.listUsers[i].NO_SELECT = vm.getUserName(vm.listUsers[i]);
                                    }
                                } 
                            }
                        }, function callBack(response) {
                            vm.loadGestores = false;
                        });
                    }

                } else {
                    vm.loadingLstComis = false;
                }
                
                if(vm.parent.listServices.listCantidadAsegurada_cp != null && vm.parent.listServices.listCantidadAsegurada_cp.length > 0) {
                    vm.tpAmount = vm.parent.listServices.listCantidadAsegurada_cp;
                    if (vm.amount != null) {
                        vm.amount = vm.tpAmount.find(x => x.CO_TIPO == vm.amount);    
                    }
                } else {
                	TiposService.getAmmount(vm.mediador)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	
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
                        	
                        	if (vm.amount != null) {
                                vm.amount = vm.tpAmount.find(x => x.CO_TIPO == vm.amount);    
                            }
                          //  vm.parent.listServices.listCantidadAsegurada_cp = vm.tpAmount;
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.parent.logout();
                        }
                    });
                }
                
            // }
        }

    }
    ng.module('App').component('tarCiberparticularesApp', Object.create(tarCiberparticularesComponent));

})(window.angular);