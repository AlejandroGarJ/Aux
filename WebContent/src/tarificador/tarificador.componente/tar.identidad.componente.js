(function (ng) {


    //Crear componente de app
    var tarIdentidadComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$mdDialog', '$location', 'IdentidadService', 'BASE_CON', 'BASE_SRC', 'PresupuestoService', 'TiposService', 'PolizaService', '$window', 'ComisionService', 'UsuarioWSService', 'LocalidadesService', 'constantsTipos'],
        require: {
            parent: '^sdApp',
            busquedaPresupuesto: '^?busquedaPresupuesto'
        },
        bindings: {
        	detalles: '<',
        	llave: '<'
        }
    }



    tarIdentidadComponent.controller = function tarIdentidadComponentControler($q, $mdDialog, $location, IdentidadService, BASE_CON, BASE_SRC, PresupuestoService, TiposService, PolizaService, $window, ComisionService, UsuarioWSService, LocalidadesService, constantsTipos) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.step = 1;
        vm.calc = false;
        vm.objHolder = {};
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
        vm.showSelectColectivos = false;
        vm.listComisionistas = [];
        vm.idComisionista = null;
        vm.listUsers = [];
        vm.idUsuario = null;
        vm.loadGestores = false;
        vm.rol = window.sessionStorage.rol;

        this.loadTemplate = function() {
            return "src/tarificador/tarificador.view/tar.identidad.html";
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

            vm.maxDateA = vm.getDateLimit('adult','max');
            vm.minDateC = vm.getDateLimit('child','min');
            vm.maxDateC = vm.getDateLimit('child','max');
            
            //Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.isEdited = true;
                vm.budgetId_A = vm.detalles.ID_PRESUPUESTO;
                
                //Cuando estamos viendo el detalle, se carga otro tarificador más resumido
                vm.templateTarificador = "resumen";
                
                if (vm.detalles.IS_NUEVO_PRESU_EXISTENTE == true) {
                	delete vm.detalles.IS_NUEVO_PRESU_EXISTENTE;
                	vm.retarificarEdit(true);
                } else if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
                	vm.price_A = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
                	vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
                }
                
                if (vm.objPres == null && vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
                    vm.objPres = {
                        ID_PRESUPUESTO: vm.detalles.ID_PRESUPUESTO,
                        PRESUPUESTO: {
                            CO_PRODUCTO: "CBI",
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
                    vm.objHolder.NO_EMAIL = vm.detalles.OCLIENTE.NO_EMAIL;
                    vm.objHolder.NU_DOCUMENTO = vm.detalles.OCLIENTE.NU_DOCUMENTO;
                    vm.objHolder.NU_TELEFONO = vm.detalles.OCLIENTE.NU_TELEFONO1;
                    
                    if (vm.detalles.OCLIENTE.NO_NOMBRE_COMPLETO != null) {
                        var nombreCompleto = vm.detalles.OCLIENTE.NO_NOMBRE_COMPLETO;
                        nombreCompleto = nombreCompleto.split(" ");
                        
                        if (nombreCompleto != null) {
                            if (nombreCompleto[0] != null) {
                                vm.objHolder.NO_NOMBRE = nombreCompleto[0];
                            }
                            if (nombreCompleto[1] != null) {
                                vm.objHolder.NO_APELLIDO1 = nombreCompleto[1];
                            }
                            if (nombreCompleto[2] != null) {
                                vm.objHolder.NO_APELLIDO2 = nombreCompleto[2];
                            }
                        }
                    }
                }

                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.HIJOSEIDENTIDAD != null) {
                    vm.assuredNumber_A = vm.detalles.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_NUMBER;
                    vm.dataWarning = false;
                    
                    vm.lstAssured_A = [];
                    var asn = '';
                    for(var i = 0; i < vm.assuredNumber_A; i++) {
                        if(i > 0) {
                            asn = i + 1; 
                        }
                        vm.lstAssured_A.push({
                            'name': '',
                            'surname1': '',
                            'surname2': '',
                            'documentNumber': '',
                            'phones': [{
                                'phoneTypeCode': 'M',
                                'phoneNumber': ''}],
                            'email': '',
                            'bornDate': '',
                            'lopdFlag': true,
                            'advertisingFlag': false
                        })
                    }
                    
                }        
                
                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.DATOS_PAGO != null) {
                    vm.formaPago = vm.detalles.PECUNIARIAS.DATOS_PAGO.ID_FORMAPAGO;
                }
            }
            
            if (vm.budgetId_A == null) {
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
            	
                ComisionService.getComisionistasProducto({"ID_COMP_RAMO_PROD": "8", "CO_TIPO_COMISION": "MD"})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.listComisionistas = [];
                        if (response.data != null && response.data.COMISIONISTASPROD != null && response.data.COMISIONISTASPROD.COMISIONISTAPROD != null) {
                            vm.listComisionistas = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
                            if (vm.listComisionistas != null && vm.listComisionistas.length == 1) {
                                if (vm.autocomplete == null) {
                                    vm.autocomplete = {};
                                }
                                vm.autocomplete.COMISIONISTA = vm.listComisionistas[0];
                                vm.idComisionista = vm.autocomplete.COMISIONISTA.ID_COMPANIA;
                            }
                        }
                    }
                }, function callBack(response) {
                
                });
            }

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
            	
//                IdentidadService.cfam_hijos()
//                .then(function successCallback(response) {
//                    if (response.status == 200) {
//                        vm.typesHijos = response.data;
//                        vm.parent.listServices.listNumHijos_ti = vm.typesHijos;
//                    }
//                }, function callBack(response) {
//                    if (response.status == 406 || response.status == 401) {
//                        vm.parent.logout();
//                    }
//                });
            }

        }

        this.$onChanges = function() {

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

        vm.rateIdentity = function(next, nuevo) {

            vm.dataWarning = false;

            vm.objA = {
      		  NO_USUARIO: vm.usuario,
          	  ID_RAMO: 103,
          	  CO_PRODUCTO: "CBI",
          	  OPOLIZA: {
          	    CO_CANAL: '4'
          	  },
          	  PECUNIARIAS: {
          	    HIJOSEIDENTIDAD: {
          	      ASSURED_NUMBER: vm.assuredNumber_A
          	    },
          	    DATOS_PAGO: {
          	      ID_FORMAPAGO: 2,
          	      FD_INICIO: vm.getFdInicio()
          	    }
          	  }
          	}
            
            
            if (vm.detalles != null && vm.detalles.OCLIENTE != null) {
            	vm.objA.PECUNIARIAS.DATOS_TOMADOR = vm.detalles.OCLIENTE;
            }

            if(vm.budgetId_A != undefined && vm.budgetId_A != '' && nuevo != true) {
                //vm.objA.budgetId = vm.budgetId_A;
            	vm.objA.ID_PRESUPUESTO = vm.budgetId_A
            }

            if(vm.idColectivo != null) {
            	vm.objA.ID_TIPO_POLIZA = vm.idColectivo;
            }
            
            if (vm.colectivo != null) {
            	vm.objA.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            }
            
            if (vm.idUsuario != null) {
            	vm.objA.NO_USUARIO = vm.idUsuario;
            } else {
            	vm.objA.NO_USUARIO = vm.usuario;
            }
            
            
//            if(vm.budgetId_C != undefined && vm.budgetId_C != '') {
//                vm.objA.budgetIdAsoc = vm.budgetId_C;
//            }
            if(vm.assuredNumber_C != undefined && vm.assuredNumber_C != '') {
                vm.objA.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER = vm.assuredNumber_C;
            }

            if (vm.objPres_C != null && vm.objPres_C.ID_PRESUPUESTO != null) {
            	vm.objA.PECUNIARIAS.HIJOSEIDENTIDAD.BUDGETID_ASOC = vm.objPres_C.ID_PRESUPUESTO;
            }

            vm.lstAssured_A = [];
            var asn = '';
            for(var i = 0; i < vm.assuredNumber_A; i++) {
                if(i > 0) {
                    asn = i + 1; 
                }
                vm.lstAssured_A.push({
                    'NO_NOMBRE': '',
                    'NO_APELLIDO1': '',
                    'NO_APELLIDO2': '',
                    'FD_NACIMIENTO': '',
                    'IS_LOPD': true,
                    'IS_ELECTRONICO': false
                })
            }

            vm.calc = true;
            
            IdentidadService.rate(vm.objA)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if(response.data && response.data.ID_RESULT == 0) {
                    	vm.objPres = response.data;
                    	
                        vm.budgetId_A = response.data.ID_PRESUPUESTO;

                        if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                            vm.price_A = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        }

                        if (vm.detalles != null && vm.detalles.IN_EMITIDO == 1 && vm.detalles.ID_PRESUPUESTO != vm.budgetId_A) {
                        	vm.detalles.IN_EMITIDO = 0;
                        }
                        
                        if (nuevo == true && vm.busquedaPresupuesto != null) {
                            vm.busquedaPresupuesto.numDetalles[vm.busquedaPresupuesto.active - 1].ID_PRESUPUESTO = response.data.ID_PRESUPUESTO; 
                        }
                        
                        if(vm.price_A != undefined && vm.price_C != undefined) {
                            vm.price = (vm.price_A + vm.price_C).toFixed(2);
                        } else {
                            vm.price = (vm.price_A).toFixed(2);
                        }

						if (nuevo != true) {
                            vm.objHolder = vm.lstAssured_A[0];
						}

                        //Si se ha creado el presupuesto desde un cliente, le añadimos los datos del cliente a objHolder
                        if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO == null) {
                            if (vm.detalles.OCLIENTE != null) {
                                var listaCampos = ["NO_NOMBRE","NO_APELLIDO1","NO_APELLIDO2","NU_DOCUMENTO","NO_EMAIL","FD_NACIMIENTO"];
                                for (var i = 0; i < listaCampos.length; i++) {
                                    vm.objHolder[listaCampos[i]] = vm.detalles.OCLIENTE[listaCampos[i]];
                                }
                                vm.objHolder.NU_TELEFONO = vm.detalles.OCLIENTE.NU_TELEFONO1;
                            }
                        }
                        
                        vm.calc = false; 
                        
                        if (next == true) {
                        	vm.step = 2;
                        }           
                        
                    } else {
                        vm.calc = false;
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
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

        vm.rateChild = function() {

        	vm.objC = {
      		  NO_USUARIO: vm.usuario,
        	  ID_RAMO: 103,
        	  CO_PRODUCTO: "CBH",
        	  OPOLIZA: {
        	    CO_CANAL: '4'
        	  },
        	  PECUNIARIAS: {
        	    HIJOSEIDENTIDAD: {
        	      ASSURED_CHILDREN_NUMBER: vm.assuredNumber_C
        	    },
        	    DATOS_PAGO: {
        	      ID_FORMAPAGO: 2,
        	      FD_INICIO: vm.getFdInicio()
        	    }
        	  }
        	}

            if(vm.budgetId_C != undefined && vm.budgetId_C != '') {
                vm.objC.ID_PRESUPUESTO = vm.budgetId_C;
            }

            if(vm.idColectivo != null) {
            	vm.objC.ID_TIPO_POLIZA = vm.idColectivo;
            }
            
            if (vm.colectivo != null) {
            	vm.objC.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            }

            if (vm.idUsuario != null) {
            	vm.objC.NO_USUARIO = vm.idUsuario;
            } else {
            	vm.objC.NO_USUARIO = vm.usuario;
            }

            vm.lstAssured_C = [];
            var asn = '';
            for(var i = 0; i < vm.assuredNumber_C; i++) {
                if(i > 0) {
                    asn = i + 1; 
                }
                vm.lstAssured_C.push({
                    'NO_NOMBRE': '',
                    'NO_APELLIDO1': '',
                    'NO_APELLIDO2': '',
                    'FD_NACIMIENTO': '',
                    'IS_LOPD': true,
                    'IS_ELECTRONICO': false
                })
            }

            vm.calc = true;
            
            IdentidadService.rate(vm.objC)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if(response.data && response.data.ID_RESULT == 0) {
                        
                    	vm.objPres_C = response.data;
                        
                        if (vm.objPres_C.MODALIDADES != null && vm.objPres_C.MODALIDADES.MODALIDAD != null && vm.objPres_C.MODALIDADES.MODALIDAD[0] != null) {
                            vm.price_C = vm.objPres_C.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        }

                        if(vm.price_C != undefined && vm.price_A != undefined) {
                            vm.price = (vm.price_A + vm.price_C).toFixed(2);
                        } else {
                            vm.price = vm.price_C.toFixed(2);
                        }
                        
                        vm.budgetId_C = response.data.ID_PRESUPUESTO;
                    	
                        vm.calc = false;   
                        vm.rateIdentity();   
                    } else {
                        vm.calc = false;
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
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

        vm.checkBudgets = function(opt) {
            if(opt == false) {
                vm.lstAssured_C = [];
                vm.objC = {};
                vm.assuredNumber_C = undefined
                vm.budgetId_C = undefined;
                vm.price_C = undefined;
                vm.objA.assuredChildrenNumber = 0,
                delete vm.objA.budgetIdAsoc;
                vm.rateIdentity();
            }
        }

        vm.checkPostal = function(code) {
            if(code != undefined && code.length == 5) {

                IdentidadService.cities(code)
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
                        } else {
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
        }

        vm.checkHolder = function(opt) {
            vm.objHolderBU = JSON.parse(JSON.stringify(vm.objHolder));
            if(opt == true) {
                vm.lstAssured_A[0] = {
                    'NO_NOMBRE': '',
                    'NO_APELLIDO1': '',
                    'NO_APELLIDO2': '',
                    'FD_NACIMIENTO': '',
                    'IS_LOPD': true,
                    'IS_ELECTRONICO': false
                }
            } else {
                vm.objHolder = JSON.parse(JSON.stringify(vm.objHolderBU));
                vm.lstAssured_A[0] = vm.objHolder;
            }
        }
        
        vm.getFd = function (fd) {
        	if (fd != null) {
            	var date = new Date(fd);
            	
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


        vm.contract = function() {

            // vm.objHolder.lopdFlag = true;
            // vm.objHolder.advertisingFlag = false;
            // vm.objHolder.phones = [{
            //     'phoneTypeCode': 'M',
            //     'phoneNumber': vm.phoneNumber}]
            var holder = JSON.parse(JSON.stringify(vm.objHolder));
            delete holder.subjectTypeCode;

            if (holder.FD_NACIMIENTO != null) {
            	holder.FD_NACIMIENTO = vm.getFd(holder.FD_NACIMIENTO);
            }
            
        	vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = holder;
            
            if (vm.address != null) {
            	for (var campo in vm.address) {
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR[campo] = vm.address[campo];
            	}
            }

            if (vm.bankAccount != null) {
            	for (var campo in vm.bankAccount) {
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO[campo] = vm.bankAccount[campo];
            	}
        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 7;
            }

            //Si el asegurado es el tomador, añadirle todos los datos del tomador
            if (vm.holderNA != true && vm.lstAssured_A != null && vm.lstAssured_A.length > 0) {
                vm.lstAssured_A[0] = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;
            }
            
            if (vm.lstAssured_A != null && vm.lstAssured_A.length > 0) {
            	for (var i = 0; i < vm.lstAssured_A.length; i++) {
            		vm.lstAssured_A[i].ID_TIPO_CLIENTE = 2;
            		if (vm.lstAssured_A[i].FD_NACIMIENTO != null) {
            			vm.lstAssured_A[i].FD_NACIMIENTO = vm.getFd(vm.lstAssured_A[i].FD_NACIMIENTO);
                    }
            		
            		if (vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS == null) {
                    	vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS = [];
                    }
            		
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS.push(vm.lstAssured_A[i]);

            	}
            }

            if(vm.sendDoc != undefined && vm.sendDoc == true) {
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.EMAIL_DOCUMENTACION = vm.policyMail;
            }
            
            if(vm.assuredNumber_C != undefined) {
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER = vm.assuredNumber_C;
            } else {
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER = 0;
            }
            
            //Añadir otarifa
            if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD[0] != null) {
            	vm.objPres.OTARIFA = vm.objPres.MODALIDADES.MODALIDAD[0];
            }
            
            vm.loading = true;
            
            IdentidadService.contract(vm.objPres)
            .then(function successCallback(response) {
                if (response.status == 200) {
                     if(response.data.ID_RESULT == 0) {

                        vm.objPres = response.data;
                        vm.objPolA = response.data;
                        vm.objHolder_pol = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;
                        
                        if(vm.objPres.PRESUPUESTO.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER > 0) {

                        	//Añadir asegurado
                        	if (vm.lstAssured_C != null && vm.lstAssured_C.length > 0) {
                            	for (var i = 0; i < vm.lstAssured_C.length; i++) {
            		                vm.lstAssured_C[i].ID_TIPO_CLIENTE = 2;
                            		
                            		if (vm.lstAssured_C[i].FD_NACIMIENTO != null) {
                            			vm.lstAssured_C[i].FD_NACIMIENTO = vm.getFd(vm.lstAssured_C[i].FD_NACIMIENTO);
                                    }

									if (vm.objPres_C.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS == null) {
										vm.objPres_C.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS = [];
									}

									vm.objPres_C.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS.push(vm.lstAssured_C[i]);
                            	}
                            }
                        	
                        	//Añadir datos pago
                            if (vm.bankAccount != null) {
                            	for (var campo in vm.bankAccount) {
                            		vm.objPres_C.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO[campo] = vm.bankAccount[campo];
                            	}
                            }
                            
                            //Añadir datos tomador
                            vm.objPres_C.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = holder;
                            
                            //Añadir otarifa
                            if (vm.objPres_C.MODALIDADES != null && vm.objPres_C.MODALIDADES.MODALIDAD != null && vm.objPres_C.MODALIDADES.MODALIDAD[0] != null) {
                            	vm.objPres_C.OTARIFA = vm.objPres_C.MODALIDADES.MODALIDAD[0];
                            }
                            
                            IdentidadService.contract(vm.objPres_C)
                            .then(function successCallback(response) {
                                if (response.status == 200) {
                                	if(response.data.ID_RESULT == 0) {

	                                    vm.objPolC = response.data;
	                                    vm.loading = false;
	                                    vm.step = 3;
                                    
	                                 } else {
	                                     vm.loading = false;
	                                     msg.textContent(response.data.DS_RESULT);
	                                     $mdDialog.show(msg);
	                                 }
                                }
                            }, function callBack(response) {
                                vm.loading = false;
                                if(response.data != undefined && response.data != '') {
                                    msg.textContent(response.data);
                                    $mdDialog.show(msg);
                                }
                            });


                        } else {
                            vm.loading = false;
                            vm.step = 3;
                        }
                        
                     } else {
                         vm.loading = false;
                         msg.textContent(response.data.DS_RESULT);
                         $mdDialog.show(msg);
                     }


                }
            }, function callBack(response) {
                vm.loading = false;
                if(response.data != undefined && response.data != '') {
                    msg.textContent(response.data);
                    $mdDialog.show(msg);
                }
            });
/*
            var objC = {
                "condiciones": "true",
                "policyTypeCode": "PP",
                "productCode": "CIBERHIJOS",
                "paymentTypeCode": "AN",
                "budgetId": 52141,
                "policyLifeCode": "S",
                "paymentMethodCode": "DB",
                "people": [
                  {
                    "name": "romina",
                    "surname1": "ramirez",
                    "surname2": "romero",
                    "bornDate": "2016-2-28T00:00:00.000+0200",
                    "subjectTypeCode": "AS",
                    "lopdFlag": "true",
                    "advertisingFlag": "false"
                  },
                  {
                    "name": "ramiro",
                    "surname1": "ramirez",
                    "surname2": "romero",
                    "bornDate": "2016-2-28T00:00:00.000+0200",
                    "subjectTypeCode": "AS2",
                    "lopdFlag": "true",
                    "advertisingFlag": "false"
                  },
                  {
                    "name": "ramona",
                    "surname1": "ramirez",
                    "surname2": "romero",
                    "documentNumber": "73779995c",
                    "email": "ramona@rmail.com",
                    "phones": [
                      {
                        "phoneTypeCode": "M",
                        "phoneNumber": "601010101"
                      }
                    ],
                    "bornDate": "1992-2-28T00:00:00.000+0200",
                    "lopdFlag": "true",
                    "advertisingFlag": "false"
                  }
                ],
                "address": {
                  "address": "c/ juela 1",
                  "postalCode": "28017",
                  "city": "MADRID",
                  "province": "MADRID"
                },
                "bankAccount": {
                  "holderName": "ramona ramirez romero",
                  "ibanCode": "ES9020387832123727758665",
                  "swift": "CAGLESM1417"
                }
            }
            */
        }

        vm.dlPolicy = function(polNum) {
			vm.parent.abrirModalcargar(true);
        	PolizaService.getCondiciones(polNum)
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
						saveAs(new Blob([response.data]), polNum + '.pdf');
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
        }

        vm.reset = function() {
            vm.price = 0;
            vm.price_A = undefined;
            vm.price_C = undefined;
            vm.budgetId_A = undefined;
            vm.budgetId_C = undefined;
            vm.assuredNumber_A = undefined;
            vm.assuredNumber_C = undefined;
            vm.addChild = false;
            vm.dataWarning = true;
        }

        vm.validate = function(form2Validate) {
            if(form2Validate.$valid) {
                if(vm.step == 2) {
                    vm.contract();
                }
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
            }
        }
        
        vm.modalPdf = function(idIdentidad, idHijos, opt) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/descarga.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    vm.objCli = {}
                    md.mensaje = null;
                    md.type = "CBI";
                    md.idIdentidad = idIdentidad;
                    md.idHijos = idHijos;
                    md.btnOpt = opt;
                    
                    md.$onInit = function() {
                        if (vm.objHolder != null) {
                            md.objCli = JSON.parse(JSON.stringify(vm.objHolder));
                        }
                    }
                    
                    md.sendPdf = function(sendEmail) {
                    	if(md.formDownloadBudget.$valid) {
                    		
                    		if (md.objCli != null) {
                    			for (var i in md.objCli) {
                    				if (md.objCli[i] == null || md.objCli[i] == "") {
                    					delete md.objCli[i];
                    				}
                    			}
                    		}
                    		
                    		vm.objHolder = md.objCli;
                    		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = md.objCli;

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
											saveAs(new Blob([data.data], { type: 'application/pdf' }), vm.objPres.ID_PRESUPUESTO + '.pdf');
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
                    		md.loading = false;
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
                if(producto.ID_PRODUCTO != null && producto.ID_PRODUCTO == 8 && producto.IN_TARIFICA == true) {
                    colectivosTarificables.push(producto)
                }
            }
            return colectivosTarificables;
        }
        
        vm.showColectivos = function (tar) {
        	vm.showSelectColectivos = true;
            vm.colectivosHijo = [];
            var productos = JSON.parse(window.sessionStorage.perfil).productos;

    		var listProductos = [8];
        	for(var i = 0; i < productos.length; i++) {
        		var producto = productos[i];
                if(producto.ID_PRODUCTO != null && listProductos.includes(producto.ID_PRODUCTO)) {
                	vm.colectivosHijo.push(producto);
                }
            }
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
        
        vm.formatFdInicio = function (date) {
        	var dateFormat = "";
        	
        	if (date != null) {
        		var dateFormat = new Date(date);

        		let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dateFormat);
        		let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(dateFormat);
        		let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateFormat);
        		
        		dateFormat = day + "-" + month + "-" + year;
        	}
        	
        	return dateFormat;
        }
        
        vm.volver = function () {
        	vm.step = 1;
        }

        vm.getDateLimit = function (person, type) {
            var now = new Date();
            var date;
            if(person == 'adult') {
                if(type == 'max') {
                    date = new Date(
                        now.getFullYear() - 18,
                        now.getMonth(),
                        now.getDate()
                    );
				}
				return date;
            } else {
                if(type == 'min') {
                    date = new Date(
                        now.getFullYear() - 18,
                        now.getMonth(),
                        now.getDate() + 1
                    );
                    
                } else {
                    date = new Date();
				}
				return date;
            }
        }
        
        vm.dateFormat = function (date) {
        	if (date != null) {       		
        		var fechaFormat = moment(date).format('DD/MM/YYYY')
                return fechaFormat;
        	}
        }
        
        vm.retarificarEdit = function (nuevoPresu) {
            if (vm.assuredNumber_A != null) {
                if (nuevoPresu == null) {
                    nuevoPresu = false;
                }
                vm.rateIdentity(false, nuevoPresu);
            } else {
                setTimeout(function(){ 
                    vm.retarificarEdit(nuevoPresu); 
                }, 1000);
            }
        }
        
        vm.changeComisionista = function () {
            vm.loadGestores = true;
            vm.idUsuario = null;
            vm.searchGestor = null;
            vm.tipoMedioPago = null;
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
            
            if (vm.autocomplete != null) {
                vm.autocomplete.GESTOR = null;
            }

            if (vm.idComisionista != null && vm.listComisionistas != null) {
                vm.mediador = productos.find(x => x.ID_COMPANIA == vm.idComisionista && x.ID_PRODUCTO == 8);
                vm.idColectivo = vm.mediador.ID_TIPO_POLIZA; 
                vm.colectivo = vm.mediador;
            } else if (vm.idComisionista == null) {
                vm.mediador = null;
                vm.idColectivo = null; 
                vm.colectivo = null;
            }
            
            if (vm.idComisionista != null) {
                UsuarioWSService.getUserByCia(vm.idComisionista)
                .then(function successCallback(response) {
                    vm.loadGestores = false;
                    if (response.status == 200) {
                        vm.listUsers = [];
                        if (response.data != null && response.data.USUARIOS != null) {
                            vm.listUsers = response.data.USUARIOS;
                            if (vm.listUsers.length == 1) {
                                vm.autocomplete.GESTOR = vm.listUsers[0];
                                vm.idUsuario = vm.autocomplete.GESTOR.NO_USUARIO;
                            }
                        } 
                    }
                }, function callBack(response) {
                    vm.loadGestores = false;
                });
            } else {
                vm.loadGestores = false;
            }
            
            if ((vm.llave != "presupuesto" && vm.llave != "resumen" && vm.llave != "contratar") || (vm.changeComisionistaNumber > 0 && (vm.llave == "presupuesto" || vm.llave == "contratar" || vm.llave == "resumen"))) {
            	vm.reset();
            } else {
            	vm.changeComisionistaNumber = 1;
            }
        }
        
        vm.getUsuario = function (usuario) {
            var text = "";
            if (usuario != null) {
                text = usuario.NO_USUARIO + " - " + usuario.NO_NOMBRE + " " + usuario.NO_APELLIDO1;
            }
            return text;
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
                if (key != "text")
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
            };
        }

    }
    ng.module('App').component('tarIdentidadApp', Object.create(tarIdentidadComponent));

})(window.angular);