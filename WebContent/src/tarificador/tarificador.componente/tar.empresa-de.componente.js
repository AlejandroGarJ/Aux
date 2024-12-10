(function (ng) {


    //Crear componente de app
    var tarEmpresaDeComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$window', '$q', '$mdDialog', '$location', 'EmpresaService', 'BASE_CON', 'BASE_SRC', 'PresupuestoService', 'TiposService', 'PolizaService', 'LocalidadesService', '$translate', 'constantsTipos'],
        require: {
            parent: '^sdApp',
            busquedaPresupuesto: '^?busquedaPresupuesto'
        },
        bindings: {
        	detalles: '<',
        	llave: '<'
        }
    }

    tarEmpresaDeComponent.controller = function tarEmpresaDeComponentControler($window, $q, $mdDialog, $location, EmpresaService, BASE_CON, BASE_SRC, PresupuestoService, TiposService, PolizaService, LocalidadesService, $translate, constantsTipos) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.franquicia = 0;
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
        vm.objAutPer = {};
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
        vm.option = 0;
        vm.showDatos = false;
        vm.date = new Date();
        vm.opciones = {
            fechaEfecto: new Date()
        }
        vm.colectivo = null;
        vm.checkFecha = false;
        vm.objPri = {};
        vm.tiposEmpresa = [];
        vm.tipoPago = 6;
        // vm.isFranquicia = false;
        vm.disabledFranq = false;

        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Akzeptieren');

        this.loadTemplate = function() {
            return "src/tarificador/tarificador.view/tar.empresa-de.html";
        }

        this.$onInit = function() {
        	vm.colectivos = [];
            vm.idColectivo = null;
    		vm.rol = window.sessionStorage.rol;
        	
            vm.medidaEdicion = 169;
            if (/clientes/.test($location.url())) {
                vm.medidaEdicion = 262;
            }
            
          //Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.isEdited = true;
                vm.budgetId = vm.detalles.ID_PRESUPUESTO;

                //Cuando estamos viendo el detalle, se carga otro tarificador más resumido
                vm.templateTarificador = "src/tarificador/tarificador.view/tarificador.empresa-de.view/tarificador.resumen.html";
                
                if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
                	vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
                }
                
                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.CIBERRIESGO != null) {
                    var ciberriesgo = vm.detalles.PECUNIARIAS.CIBERRIESGO;
                    
                    if (vm.objPri == null) {
                    	vm.objPri = {};
                    }
                    
                    vm.activity = ciberriesgo.ACTIVITY_CODE;
                    vm.objPri.turnover = ciberriesgo.TURNOVER.toString();
                    vm.amount = ciberriesgo.AMMOUNT_OPTION;
                    vm.selActivities = ciberriesgo.FILIAL_ACTIVITY_CODE;
                    vm.objPri.lossAttackAmountOption = ciberriesgo.LOSS_ATTACK_AMOUNT_OPTION;
                    vm.selAtks = ciberriesgo.CIBER_ATTACK_TYPES;
                    vm.addCCE = vm.getAddCCE(vm.detalles.PECUNIARIAS.LST_GARANTIAS);
                    
                    if (vm.addCCE == true) {
                        vm.amountCC = '100.000 €';
                    } else {
                        vm.amountCC = '25.000 €';
                    }
                }

                //Llamamos a vm.changeTipoEmpresa para que recupere facturación y suma asegurada, ya que en el resumen no sabemos el tipo de empresa, la definimos aquí
                vm.changeTipoEmpresa(false);
                
                if (vm.detalles.IN_EMITIDO != 1) {
	                if (vm.detalles.IS_NUEVO_PRESU_EXISTENTE == true) {
	                	delete vm.detalles.IS_NUEVO_PRESU_EXISTENTE;
	                	vm.retarificarEdit(true);
	                }
				}
            }            
            //Si estamos creando el presupuesto desde un cliente
            else if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO == null) {
                if (vm.detalles.OCLIENTE != null) {
                    var listaCampos = ["NO_NOMBRE","NO_APELLIDO1","NO_APELLIDO2","NU_DOCUMENTO","NO_EMAIL","FD_NACIMIENTO"];
                    for (var i = 0; i < listaCampos.length; i++) {
                        vm.objAutPer[listaCampos[i]] = vm.detalles.OCLIENTE[listaCampos[i]];
                    }
                    vm.objAutPer.NU_TELEFONO = vm.detalles.OCLIENTE.NU_TELEFONO1;
                }
            }
            
            if (vm.budgetId == null) {
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
				
                //Cuando estamos tarificando sin haber creado antes el presupuesto, se carga la vista del tarificador
                vm.templateTarificador = "src/tarificador/tarificador.view/tarificador.empresa-de.view/tarificador.normal.html";
            }
            
            if(vm.parent.listServices.listGrupoEmpresaDE_ti != null && vm.parent.listServices.listGrupoEmpresaDE_ti.length > 0) {
                vm.tpGroups = vm.parent.listServices.listGrupoEmpresaDE_ti;
                if (vm.activity != null) {
                    var noSector = vm.activity.substr(0, 1);
                    vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
                    
                    if (vm.sector != null && vm.sector.LST_ACTIVIDADES != null) {
                        vm.activity = vm.sector.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.activity);
                    }
                }
                
                if (vm.selActivities != null) {
                    vm.getFilialActivityByDs();        
                }
                
            } else {
                EmpresaService.groups(19)
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
                        
                        if (vm.activity != null) {
                            var noSector = vm.activity.substr(0, 1);
                            vm.sector = vm.tpGroups.find(x => x.CO_TIPO == noSector);
	                        
	                        if (vm.sector != null && vm.sector.LST_ACTIVIDADES != null) {
                                vm.activity = vm.sector.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD == vm.activity);
                            }
	                    }
                        
	                    if (vm.selActivities != null) {
	                        vm.getFilialActivityByDs();        
	                    }
                        
                        vm.parent.listServices.listGrupoEmpresaDE_ti = vm.tpGroups;
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

            if(vm.parent.listServices.listCantidadAseguradaDE_ti != null && vm.parent.listServices.listCantidadAseguradaDE_ti.length > 0) {
                vm.tpAmount = vm.parent.listServices.listCantidadAseguradaDE_ti;
                if (vm.amount != null) {
                    vm.amount = vm.tpAmount.find(x => x.CO_TIPO == vm.amount);    
                }
            } else {
            	TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.RNG_AMMOUNT_DE
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
                    	
                    	if (vm.amount != null) {
                            vm.amount = vm.tpAmount.find(x => x.CO_TIPO == vm.amount);    
                        }
                        vm.parent.listServices.listCantidadAseguradaDE_ti = vm.tpAmount;
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

	        TiposService.getTipos({
	            "ID_CODIGO": constantsTipos.TYPE_EMPRESA
	        })
	        .then(function successCallback(response) {
	            if (response.status == 200) {
	            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null) {
	                	vm.tiposEmpresa = response.data.TIPOS.TIPO;
	            	}
	            }
	        }, function callBack(response) {
	            if (response.status == 406 || response.status == 401) {
	                vm.parent.logout();
	            }
	        });

        }

        this.$onChanges = function() {

        }
        
        vm.getFilialActivityByDs = function () {
            var listFiliales = [];
            var listSectores = [];

        	if (vm.tpGroups != null && vm.selActivities != null) {
        		var filiales = vm.selActivities.split(".");

                //Recorremos las filiales que tiene el presupuesto
        		for (var i = 0; i < filiales.length; i++) {
        			var anadido = false;
        		    var filial = filiales[i];
        		    if (filial != "") {
                        //Recorremos los sectores
                        for (var j = 0; j < vm.tpGroups.length; j++) {
                            var sector = vm.tpGroups[j];
                            if (sector != null && sector.LST_ACTIVIDADES != null) {
                                //Recorremos las actividades de cada sector para encontrar nuestra filial
                                for (var k = 0; k < sector.LST_ACTIVIDADES.length; k++) {
                                    var actividad = sector.LST_ACTIVIDADES[k];
                                    if (actividad.DS_ACTIVIDAD.includes(filial)) {
                                         listSectores.push(sector);
                                         listFiliales.push(actividad.CO_ACTIVIDAD);
                                         anadido = true;
                                         break;
                                    }
                                }
                            } 
                            
                            if (anadido == true) {
                            	break;
                            }
                        }
        		    }
        		}
        	}

        	vm.affiSector = listSectores;
        	vm.selActivities = listFiliales;
        }
        
        vm.getAddCCE = function (listGarantias) {
        	var addCCe = false;
        	if (listGarantias != null && listGarantias.length > 0) {
        		for (var i = 0; i < listGarantias.length; i++) {
        			if (listGarantias[i].ID_GARANTIA == 57 && listGarantias[i].IS_SELECTED == true) {
        				addCCe = true;
        				break;
        			}
        		}
        	}
        	return addCCe;
        }

        vm.checkAmounts = function(validate) {
            if(vm.addCCE == true) {
                vm.amountCC = '100.000 €';
            } else {
                if(vm.amount.CO_TIPO <= 1) {
                    vm.amountCC = '25.000 €';
                } else {
                    vm.amountCC = '50.000 €';
                }
            }
            if (validate == true) {
                vm.validate(vm.formTarEmpresa);
            }
        }

        vm.rateCompany = function(next, nuevoPresupuesto) {
        	var capitalesGarantias = vm.getListGarantiasAmount();
        	
        	var obj = {
      		  NO_USUARIO: vm.rol == 15 ? undefined : vm.usuario,
          	  ID_RAMO: 103,
          	  CO_PRODUCTO: "CBDE",
          	  OPOLIZA: {
          	    CO_CANAL: '4'
          	  },
          	  PECUNIARIAS: {
          		CIBERRIESGO: {
          			ACTIVITY_CODE: vm.activity.CO_ACTIVIDAD,
          			TURNOVER: vm.objPri.turnover,
          			AMMOUNT_OPTION: vm.amount.CO_TIPO,
          			LOSS_ATTACK_AMOUNT_OPTION: vm.objPri.lossAttackAmountOption,
          			CIBER_ATTACK_TYPES: vm.selAtks,
          			FILIAL_ACTIVITY_CODE: "",
                    // IN_FRANQUICIA: vm.isFranquicia,
          			HAZARD_ACTIVITY_CODE: vm.activity.IN_PELIGROSA
          	    },
      			LST_GARANTIAS: [
      				{
                        ID_GARANTIA: 52,
                        NU_CAPITAL: capitalesGarantias.sumaAmount
                    }, {
                    	ID_GARANTIA: 53,
                    	NU_CAPITAL: capitalesGarantias.sumaAmount
                    }, {
                    	ID_GARANTIA: 54,
                    	NU_CAPITAL: capitalesGarantias.sumaAmount
                    }, {
                    	ID_GARANTIA: 55,
                    	NU_CAPITAL: capitalesGarantias.ciberLimite
                    },{
                    	ID_GARANTIA: 61,
                    	NU_CAPITAL: capitalesGarantias.sumaAmount
                    }
                ],
          	    DATOS_PAGO: {
          	      ID_FORMAPAGO: 2,
          	      FD_INICIO: moment(new Date()).format('YYYY-MM-DD')
          	    }
          	  }
          	}


            if(vm.addCCE == true) {
            	obj.PECUNIARIAS.LST_GARANTIAS.push({
            		ID_GARANTIA: 57,
            		IS_SELECTED: true,
            		NU_CAPITAL: "100000"
                })
            } else {
                if(vm.addCCE == false) {
                    for(var i = 0; i < obj.PECUNIARIAS.LST_GARANTIAS.length; i++) {
                        if(obj.PECUNIARIAS.LST_GARANTIAS[i].ID_GARANTIA == 46) {
                            obj.PECUNIARIAS.LST_GARANTIAS.splice(i, 1);
                        }
                    }
                }
            }

            if(vm.selActivities != undefined && vm.selActivities.length > 0) {
                obj.PECUNIARIAS.CIBERRIESGO.FILIAL_ACTIVITY_CODE = vm.formatFilialActivities(vm.selActivities);
            }

            if(vm.budgetId != undefined && vm.budgetId != '' && nuevoPresupuesto != true) {
                obj.ID_PRESUPUESTO = vm.budgetId;
            }

            if(vm.idColectivo != null) {
                obj.ID_TIPO_POLIZA = vm.idColectivo;
            }

            if (vm.colectivo != null) {
                obj.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            }

            vm.calc = true;

            var rateService = EmpresaService.rate;
            if (vm.rol == 15) {
            	rateService = EmpresaService.rateOpt;
            }
            
            rateService(obj)
            .then(function successCallback(response) {
                if(response.status == 200) {
                    if(response.data != undefined) {
                    	if (response.data.ID_RESULT == 0) {
                            vm.budgetId = response.data.ID_PRESUPUESTO;
                            
                            if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                                vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                                vm.franquicia = response.data.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA;
                            }
                            vm.objPres = response.data;
                            vm.calc = false;
                            
                            if (vm.detalles != null && vm.detalles.IN_EMITIDO == 1 && vm.detalles.ID_PRESUPUESTO != vm.budgetId) {
                                vm.detalles.IN_EMITIDO = 0;
                            }
                            
                            if (next == true) {
                            	vm.step = 2;
                            }
                    	} else if (response.data.ID_RESULT == 700) {
        					msg.textContent("There is no price for selected options");
        					$mdDialog.show(msg);
                            vm.calc = false;
                    	} else {
        					msg.textContent(response.data.DS_RESULT);
        					$mdDialog.show(msg);
                            vm.calc = false;
                    	}
                    } else {
                        vm.msgWarning = response.data.DS_RESULT;
                        vm.calc = false;
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    // vm.parent.logout();
                    // $location.path('/');
                }
            });
        }

        vm.getListGarantiasAmount = function () {
        	var suma = vm.amount.CO_TIPO;
        	var sumaAmount = 0;
        	var ciberLimite = 0;
        	
            //250.000€
            if (suma == "1") {
            	sumaAmount = "100000";
        		ciberLimite = "50000";
            } 
            //500.000€
            else if (suma == "2") {
            	sumaAmount = "250000";
        		ciberLimite = "75000";
            }
            //1.000.000€
            else if (suma == "3") {
            	sumaAmount = "500000";
        		ciberLimite = "100000";
            }
            //1.500.000€
            else if (suma == "4") {
            	sumaAmount = "750000";
        		ciberLimite = "125000";
            }
            //2.000.000€
            else if (suma == "5") {
            	sumaAmount = "1000000";
        		ciberLimite = "150000";
            }
            
            return {
            	sumaAmount: sumaAmount,
        		ciberLimite: ciberLimite
            }
        }

        vm.formatFilialActivities = function (filialActivities) {
        	if (filialActivities != null && filialActivities.length > 0) {
        		var lista = "";
        		
        		for (var i = 0; i < filialActivities.length; i++) {
        			lista += filialActivities[i];
        			if (i+1 < filialActivities.length) {
        				lista += ","
        			}
        		}
        		
        		return lista;
        	} else {
        		return "";
        	}
        }
        
        vm.getCapitalGarantia = function (filialActivities) {
        	if (filialActivities != null && filialActivities.length > 0) {
        		var lista = "";
        		
        		for (var i = 0; i < filialActivities.length; i++) {
        			lista += filialActivities[i];
        			if (i+1 < filialActivities.length) {
        				lista += ","
        			}
        		}
        		
        		return lista;
        	} else {
        		return "";
        	}
        }
        
        vm.filialIsDangerous = function (listFiliales) {
        	var isDangerous = false;
        	
//        	if (vm.affiSector != null && listFiliales != null) {
//        		//Rcorremos filiales para encontrarlas en los sectores
//        		for (var i = 0; i < listFiliales.length; i++) {
//        			var filial = listFiliales[i];
//        			var filialEncontrado = false;
//        			//Recorremos los sectores seleccionados
//        			for (var j = 0; j < vm.affiSector.length; j++) {
//        				var sector = vm.affiSector[j];
//        				
//        				//Recorremos las actividades del sector
//        				for (var k = 0; k < sector.activities.length; k++) {
//        					if (sector.activities[k].typeDescription == filial) {
//        						filialEncontrado = true;
//        						if (sector.activities[k].IN_PELIGROSA == true) {
//        							isDangerous = true;
//        						}
//        						break;
//        					}
//        				}
//        				
//        				if (filialEncontrado == true) {
//        					break;
//        				}
//        			}
//        			
//    				if (isDangerous == true) {
//    					break;
//    				}
//        		}
//        	}
        	
        	return isDangerous;
        }
        
        vm.check_risk = function(type, item) {
            vm.objSendF = {};
            vm.msgForm = null;
            switch (type) {
	            case 'selActivities':
	            	break;
                case 'activity':
                    if(item != undefined) {
                    	if (item.CO_ACTIVIDAD.includes("PROHIBIDA")) {
                            vm.activity = null;
            				msg.textContent($translate.instant('ERROR_ACTIVITY_RESTRICTED'));
                            $mdDialog.show(msg);
                        }
                        vm.objPri.turnover = null;
                        vm.amount = null;
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        vm.franquicia = 0;
                    }
                    break;
                case 'billing':
                    if(item != undefined) {
                        vm.amount = null;
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        vm.franquicia = 0;
                    }

                    break;
                case 'amount':
                    if(item != undefined) {
                        vm.checkAmounts();
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        // if(vm.amount.CO_TIPO >= 3) {
						// 	vm.isFranquicia = 1;
                        //     vm.disabledFranq = true
						// } else {
                        //     vm.isFranquicia = 0;
                        //     vm.disabledFranq = false
                        // }
                    }

                    break;
                case 'atksOpt':
                    break;

                case 'selAtks':
                    break;
                default:
                    break;
            }
            
            vm.isPriceable();
        }
        
        vm.isPriceable = function () {
        	var priceable = true;  
        	vm.priceable = true;           

        	if (vm.activity != null && vm.activity.IN_PELIGROSA == "3") {
        		priceable = false;
        	    vm.priceable = false;
        	}
        	
        	if (vm.amount == null) {
        		priceable = false;
            }
        	
        	if (priceable != false && vm.objPri != null && vm.objPri.lossAttackAmountOption == "2") {
        		priceable = false;
        	    vm.priceable = false;
        	}
        	
        	if (priceable != false && vm.objPri != null && vm.objPri.lossAttackAmountOption == null) {
        		priceable = false;
        	}
        	
        	if (priceable != false && vm.objPri != null && vm.objPri.lossAttackAmountOption != "0" && (vm.selAtks == null || vm.selAtks.length == 0)) {
        		priceable = false;
        	}
        	
        	if (priceable == true) {
        		vm.formTarEmpresa.$invalid = false;
        		vm.formTarEmpresa.$valid = true;
        	}
        	
        	if (vm.priceable == true) {
        		vm.validate(vm.formTarEmpresa, priceable);
        	}
        }

        vm.sendForm = function() {
            var obj = vm.objSendF;
            var listaCampos = ["NO_NOMBRE", "NO_EMAIL", "NU_TELEFONO1"];

            for (var i = 0; i < listaCampos.length; i++) {
            	if (obj[listaCampos[i]] == null || obj[listaCampos[i]] == "") {
        			msg.textContent("Rellene los campos obligatorios");
        			$mdDialog.show(msg);
        			return null;
            	}
            }
            vm.loadingForm = true;
            vm.msgForm = "";
            
            EmpresaService.sendFormulario(obj, "CBDE")
            .then(function successCallback(response) {
                if(response.data != null) {
                    if (response.data.ID_RESULT == 0) {
                        vm.msgForm = $translate.instant('SUCCESS_SEND_FORM');
                        vm.objSendF = {};
                    } else {
                        vm.msgForm = $translate.instant('ERROR_SEND_FORM');
                    }
                }
                vm.loadingForm = false;
            }, function callBack(response) {
                vm.loadingForm = false;
                vm.msgForm = $translate.instant('ERROR_SEND_FORM');
            });
        }

        vm.contract = function() {
            
            vm.objHolder.IS_LOPD = true;
            vm.objHolder.IS_ELECTRONICA = vm.acceptAdds == true ? true : false;
            
            if (vm.objHolder.FD_NACIMIENTO != null) {
            	vm.objHolder.FD_NACIMIENTO = vm.getFd(vm.objHolder.FD_NACIMIENTO);
            }
            
            vm.objHolder.NO_APELLIDO1 = "";
            vm.objHolder.NU_TELEFONO = vm.NU_TELEFONO;
            
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = vm.objHolder;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_AUTORIZADO = vm.objAutPer;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.FD_INICIO = moment(vm.opciones.fechaEfecto).format('YYYY-MM-DD');
            
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
            
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;
            
            if (vm.checkMediador == true) {
                vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 4;
            } else {
            	//7 Domiciliación bancaria
            	//8 Pago por factura
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = vm.tipoPago;
            }
            
            //Añadir documento y nacionalidad
			var figuras = ['DATOS_TOMADOR', 'DATOS_PAGADOR', 'DATOS_AUTORIZADO'];
			for (var i = 0; i < figuras.length; i++) {
				var figura = figuras[i];
				if (vm.objPres.PRESUPUESTO.PECUNIARIAS[figura] != null) {
					vm.objPres.PRESUPUESTO.PECUNIARIAS[figura].CO_NACIONALIDAD = "DEU";
					if (vm.objPres.PRESUPUESTO.PECUNIARIAS[figura].NU_DOCUMENTO != null) {
						vm.objPres.PRESUPUESTO.PECUNIARIAS[figura].ID_TIPO_DOCUMENTO = 6;
					} else {
						vm.objPres.PRESUPUESTO.PECUNIARIAS[figura].ID_TIPO_DOCUMENTO = 4;
					}
				}
			}
            
            vm.loading = true;

            EmpresaService.contract(vm.objPres)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if(response.data.CO_ESTADO == 1) {
                        vm.objPres = response.data;
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
                        if(response.data != undefined) {
                        	if (response.data.LOCALIDAD.length > 1) {
                                LocalidadesService.elegirLocalidad(response.data.LOCALIDAD, vm.address);
                            } else {
                                vm.address.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                            } 
                            vm.address.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                            vm.address.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                            vm.address.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;      
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

        vm.dlPolicy = function(extension) {
        	vm.loading = true;
        	var extension = extension == true ? true : false;
        	
        	PolizaService.getCondiciones(vm.objPres.NU_POLIZA, extension)
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
//        	window.open(BASE_CON + '/external/getCondiciones/' + vm.objPres.NU_POLIZA,'_blank');
        }
        
        vm.dlExtension = function () {
        	window.open('src/documentos/ZUSATZVEREINBARUNG_CYBER-DELIKTE_2021.pdf', '_blank');
        }

        vm.reset = function() {
            vm.price = 0;
            vm.franquicia = 0;
            vm.budgetId = undefined;
            vm.sector = undefined;
            vm.amount = undefined
            vm.affiSector = [];
            vm.selActivities = [];
            vm.selAtks = [];
            vm.objPri = {};
            vm.addCCE = false;
            vm.objHolder = null;
            vm.objAutPer = null;
        }

        vm.formatAmount = function(amount) {
            if(amount != undefined && amount != '' && amount.charAt(0) != 'M') {
                return parseInt(amount.trim().replace("€", "").split(".").join(""));
            } else {
                if(amount.charAt(0) == 'M') {
                    // return parseInt(amount.slice(amount.search('1.'), amount.length).trim().replace("€", "").split(".").join(""));
                    return 1000001;
                }
            }
        }

        vm.validate = function(form2Validate, tarificar) {
            if(form2Validate.$valid) {
                if(vm.step == 1) {
                    if (tarificar != false) {
                        vm.rateCompany();
                    }
                } else {
                    if(vm.step == 2) {
                        vm.contract();
                    }
                }
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
            }
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
        
        vm.getDsTurnover = function () {
            var txt = "";
            if (vm.objPri != null && vm.objPri.turnover != null && vm.tpFacturacion != null) {
                txt = vm.tpFacturacion.find(x => x.CO_TIPO == vm.objPri.turnover).DS_TIPOS;
            }
            return txt;
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
        
        vm.modalDescargaTiper = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/descarga_tiper.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.mensaje = null;
                    
                    md.$onInit = function() {
                    	md.obj = {};
                    }
                    
                    md.sendInfo = function() {
                    	if(md.formDownloadBudgetTiper.$valid) {

                    		md.obj.NOMBRE = vm.usuario;
                    		md.obj.ID_ROL = vm.rol;
                    		md.loading = true;
                    		EmpresaService.redirectTiper(md.obj)
                    		.then(function successCallback(response) {
                                // msg.textContent(response.data.DS_RESULT);
                                if(response.data.GENERADO) {
                                    msg.textContent('Email enviado correctamente');
                                } else {
                                    // msg.textContent(response.data.ERROR);
                                    msg.textContent('Ha ocurrido un error al enviar la información');
                                }
								$mdDialog.show(msg);
	                    		md.loading = false;
                    		}, function callBack(response) {
								msg.textContent("Ha ocurrido un error al enviar la información");
								$mdDialog.show(msg);
	                    		md.loading = false;
                            });
                    	} else {
                    		objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if(objFocus != undefined) {
                                objFocus.focus();
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
            })
        }
        
        vm.modalPdf = function(id) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/descarga.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    vm.objCli = {}
                    md.budgetId = id;
                    md.mensaje = null;
                    md.type = "CBA";
                    md.btnOpt = 0;
                    
                    md.$onInit = function() {
                        if (vm.objHolder != null) {
                            md.objCli = JSON.parse(JSON.stringify(vm.objHolder));
                        }
                    }
                    
                    md.sendPdf = function(sendEmail) {
                    	if(md.formDownloadBudget.$valid) {

                    		vm.objHolder = md.objCli;
                    		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = md.objCli;
                    		md.loading = true;
                    		PresupuestoService.descargaPresupuesto(vm.objPres, sendEmail, 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade'))
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
											saveAs(new Blob([data.data], { type: 'application/pdf' }), 'Angebot_Cyber-Versicherung.pdf');
											$mdDialog.hide();
    	                            	}
    	                            }
                    			}
                        		md.loading = false;
                            },
                            function errorCallback(response) {
                                md.loading = false;
                                msg.textContent('Ha ocurrido un error en la exportación');
                                $mdDialog.show(msg);
                            });
                    	} else {
                    		objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if(objFocus != undefined) {
                                objFocus.focus();
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
            })
        }
        
        vm.getColectivosTarificables = function () {
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
            var colectivosTarificables = [];
            for(var i = 0; i < productos.length; i++) {
                var producto = productos[i];
                if(producto.ID_PRODUCTO != null && producto.ID_PRODUCTO == 19 && producto.IN_TARIFICA == true) {
                    colectivosTarificables.push(producto)
                }
            }
            return colectivosTarificables;
        }
        
        vm.changeAddFilial = function () {
            vm.affiSector = [];
            vm.selActivities = [];
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
                        var listProductos = [19];
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
        
        vm.volver = function () {
        	vm.step = 1;
        }
        
        vm.getAmountText = function (val, ciberextension) {
        	//200.000€
            if (val == "0") {
                textLimite = "200.000 €";
				ciberLimite = "25.000€";
            } 
            //250.000€
            else if (val == "1") {
                textLimite = "100.000 €";
				ciberLimite = "50.000€";
            } 
            //500.000€
            else if (val == "2") {
                textLimite = "250.000 €";
				ciberLimite = "75.000€";
            }
            //1.000.000€
            else if (val == "3") {
                textLimite = "500.000 €";
				ciberLimite = "100.000€";
            }
            //1.500.000€
            else if (val == "4") {
                textLimite = "750.000 €";
				ciberLimite = "125.000€";
            }
            //2.000.000€
            else if (val == "5") {
                textLimite = "1.000.000 €";
				ciberLimite = "150.000€";
            } else {
                textLimite = "";
				ciberLimite = "25.000€";
            }
            
            if (ciberextension == true) {
            	return ciberLimite;
            } else {
            	return textLimite;
            }
        }
        
        vm.changeTipoPago = function () {
        	vm.bankAccount = null;
        	
        	if (vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.PECUNIARIAS != null && vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO != null) {
        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_BIC = null;
        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN = null;
        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.NO_TITULAR = null;
        	}
        }
        
        vm.changeTipoEmpresa = function (reset) {
        	var coAmount = constantsTipos.RNG_AMMOUNT_DE;
        	var coFacturacion = constantsTipos.IM_FACTURACION;
        	
        	if (reset != false) {
            	if (vm.objPri.turnover != null) {
                	vm.objPri.turnover = null;
            	}
            	
            	if (vm.amount != null) {
            		vm.amount = null;
            	}
        	}
        	
        	if (vm.tipoEmpresa == "SELF-EMPLOYED") {
        		coAmount = constantsTipos.RNG_AMMOUNT_DE_SELF_EMPLOYEED;
        		coFacturacion = constantsTipos.IM_FACTURACION_SELF_EMPLOYEED;
        	}
        	
        	TiposService.getTipos({
                "ID_CODIGO": coAmount
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
                	
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        	
        	TiposService.getTipos({
                "ID_CODIGO": coFacturacion
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
                	
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }


    	vm.retarificarEdit = function (nuevoPresu) {
    	    if (vm.activity != null && vm.activity.CO_ACTIVIDAD != null && vm.objPri != null
    	    && vm.objPri.turnover != null && vm.amount != null && vm.amount.CO_TIPO != null 
    	    && vm.objPri.lossAttackAmountOption != null) {
    	    	if (nuevoPresu == null) {
    	    		nuevoPresu = false;
    	    	}
                vm.rateCompany(false, nuevoPresu);
    	    } else {
                setTimeout(function(){ 
                    vm.retarificarEdit(nuevoPresu); 
                }, 1000);
    	    }
    	}
    }
    ng.module('App').component('tarEmpresaDeApp', Object.create(tarEmpresaDeComponent));

})(window.angular);