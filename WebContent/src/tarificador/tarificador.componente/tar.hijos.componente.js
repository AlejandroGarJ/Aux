(function (ng) {


    //Crear componente de app
    var tarHijosComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$mdDialog', '$location', 'BASE_SRC', 'BASE_TI', 'ClienteService', 'HijosService', 'BASE_CON', 'PresupuestoService', 'TiposService', 'PolizaService', 'UsuarioWSService', 'ComisionService', 'AseguradoraService', '$window', 'LocalidadesService', 'constantsTipos'],
        require: {
            parent: '^sdApp',
            tar: '^?sdTarificador',
            busquedaPresupuesto: '^?busquedaPresupuesto'
        },
        bindings: {
        	detalles: '<',
        	llave: '<'
        }
    }

    tarHijosComponent.controller = function tarHijosComponentControler($q, $mdDialog, $location, BASE_SRC, BASE_TI, ClienteService, HijosService, BASE_CON, PresupuestoService, TiposService, PolizaService, UsuarioWSService, ComisionService, AseguradoraService, $window, LocalidadesService, constantsTipos) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.step = 1;
        vm.calc = false;
        vm.acceptTC = true;
        vm.acceptAdds = true;
        vm.objHolder = {};
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.showSelectColectivos = false;
    	vm.listComisionistas = [];
        vm.idComisionista = null;
    	vm.listUsers = [];
        vm.idUsuario = null;
        vm.loadGestores = false;
		vm.rol = window.sessionStorage.rol;
        vm.changeComisionistaNumber = 0;

        this.loadTemplate = function() {
            return "src/tarificador/tarificador.view/tar.hijos.html";
        }

        this.$onInit = function() {
        	
        	//Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.isEdited = true;
                vm.budgetId = vm.detalles.ID_PRESUPUESTO;
                
                //Cuando estamos viendo el detalle, se carga otro tarificador más resumido
                vm.templateTarificador = "resumen";
                
                if (vm.detalles.IS_NUEVO_PRESU_EXISTENTE == true) {
                	delete vm.detalles.IS_NUEVO_PRESU_EXISTENTE;
                	vm.retarificarEdit(true);
                } else if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
                	vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
                }

                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.HIJOSEIDENTIDAD != null) {
                    vm.assuredNumber = vm.detalles.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER;
                    vm.dataWarning = false;
                    
                    vm.lstAssured = [];
                    var asn = '';
                    for(var i = 0; i < vm.assuredNumber; i++) {
                        if(i > 0) {
                            asn = i + 1; 
                        }
                        vm.lstAssured.push({
                            'name': '',
                            'surname1': '',
                            'surname2': '',
                            'bornDate': '',
                            'lopdFlag': true,
                            'advertisingFlag': false
                        })
                    }
                    
                }
                
                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.DATOS_PAGO != null) {
                    vm.formaPago = vm.detalles.PECUNIARIAS.DATOS_PAGO.ID_FORMAPAGO;
                }

        		if (vm.objPres == null && vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
        			vm.objPres = {
    					ID_PRESUPUESTO: vm.detalles.ID_PRESUPUESTO,
        				PRESUPUESTO: {
        					CO_PRODUCTO: "CBH",
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

            vm.maxDateA = vm.getDateLimit('adult','max');
            vm.minDateC = vm.getDateLimit('child','min');
            vm.maxDateC = vm.getDateLimit('child','max');
        	vm.colectivos = [];
            vm.idColectivo = null;
            
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
            }
            
            vm.medidaEdicion = 169;

            if (/presupuestos/.test($location.url())) {
                vm.medidaEdicion = 212;
            } else if (/clientes/.test($location.url())) {
            	vm.medidaEdicion = 262;
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
            }

        	ComisionService.getComisionistasProducto({"ID_COMP_RAMO_PROD": "7", "CO_TIPO_COMISION": "MD"})
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

        this.$onChanges = function() {

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

        vm.rateChild = function(next, nuevo) {

            if(vm.assuredNumber > 0 && vm.assuredNumber <= 5) {

                vm.dataWarning = false;

                var obj = {
  			      NO_USUARIO: vm.usuario,
            	  ID_RAMO: 103,
            	  CO_PRODUCTO: "CBH",
            	  OPOLIZA: {
            	    CO_CANAL: '4'
            	  },
            	  PECUNIARIAS: {
            	    HIJOSEIDENTIDAD: {
            	    	ASSURED_CHILDREN_NUMBER: vm.assuredNumber
            	    },
            	    DATOS_PAGO: {
            	      ID_FORMAPAGO: 2,
            	      FD_INICIO: vm.getFdInicio()
            	    }
            	  }
            	}
                
                if (vm.detalles != null && vm.detalles.OCLIENTE != null) {
                	obj.PECUNIARIAS.DATOS_TOMADOR = vm.detalles.OCLIENTE;
                }

                if(vm.budgetId != undefined && vm.budgetId != '' && nuevo != true) {
                    obj.ID_PRESUPUESTO = vm.budgetId
                }

                if(vm.idColectivo != null) {
                    obj.ID_TIPO_POLIZA = vm.idColectivo;
                }

                if (vm.colectivo != null) {
                    obj.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
                }

                if (vm.idUsuario != null) {
                	obj.NO_USUARIO = vm.idUsuario;
                } else {
                	obj.NO_USUARIO = vm.usuario;
                }

                vm.lstAssured = [];
                var asn = '';
                for(var i = 0; i < vm.assuredNumber; i++) {
                    if(i > 0) {
                        asn = i + 1; 
                    }
                    vm.lstAssured.push({
                        'NO_NOMBRE': '',
                        'NO_APELLIDO1': '',
                        'NO_APELLIDO2': '',
                        'FD_NACIMIENTO': '',
                        'IS_LOPD': true,
                        'IS_ELECTRONICO': false
                    })
                }
                
                vm.calc = true;

                if (vm.colectivo != null) {
                	obj.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
                }
                
                HijosService.rate(obj)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if(response.data && response.data.ID_RESULT == 0) {
                            vm.objPres = response.data;
                            
                            if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD[0] != null) {
                                vm.price = vm.objPres.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                            }
                            
                            if (nuevo == true && vm.busquedaPresupuesto != null) {
                                vm.busquedaPresupuesto.numDetalles[vm.busquedaPresupuesto.active - 1].ID_PRESUPUESTO = response.data.ID_PRESUPUESTO; 
                            }

                            if (vm.detalles != null && vm.detalles.IN_EMITIDO == 1 && vm.detalles.ID_PRESUPUESTO != response.data.ID_PRESUPUESTO) {
                            	vm.detalles.IN_EMITIDO = 0;
                            }
                            
                            vm.budgetId = response.data.ID_PRESUPUESTO;
                            vm.calc = false;
                            // vm.step = 2;
                        } else {
                            vm.calc = false;
                            msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                        }
                        if (next == true) {
                        	vm.step = 2;
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

        vm.modalPdf = function(id, opt) {
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
                    md.type = "CBH";
                    md.btnOpt = opt;

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
                            },
                            function errorCallback(response) {
                                md.loading = false;
                                msg.textContent('Ha ocurrido un error en la exportación');
                                $mdDialog.show(msg);
                            });
                    	} else {

                    		md.loading = true;
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

        vm.checkPostal = function (code) {
            if(code != undefined && code.length == 5) {

                HijosService.cities(code)
                .then(function successCallback(response) {
                	if (response.status == 200) {
                        if(response.data != undefined && response.data.LOCALIDAD != undefined) {
                            if(response.data.LOCALIDAD.length > 1) {
                                LocalidadesService.elegirLocalidad(response.data.LOCALIDAD, vm.address);
                            } else {
                                vm.address.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                            } 
                            vm.address.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                            vm.address.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                        } else {
                            // vm.msgWarning = response.data.msg;
                            
                        }
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');  
                    // } else if(response.status == 404){
                    //     msg.textContent("Error con el código postal, inténtelo de nuevo");
					// 	$mdDialog.show(msg);
                    }
                    vm.calc = false;
                });
            }
        }

        vm.contract = function() {
        
            vm.objHolder.IS_LOPD = true;
            vm.objHolder.IS_ELECTRONICA = vm.acceptAdds;
            
            if (vm.objHolder.FD_NACIMIENTO != null) {
            	vm.objHolder.FD_NACIMIENTO = vm.getFd(vm.objHolder.FD_NACIMIENTO);
            }
            
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            
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
            
            if (vm.lstAssured != null && vm.lstAssured.length > 0) {
            	for (var i = 0; i < vm.lstAssured.length; i++) {
            		vm.lstAssured[i].ID_TIPO_CLIENTE = 2;
            		if (vm.lstAssured[i].FD_NACIMIENTO != null) {
            			vm.lstAssured[i].FD_NACIMIENTO = vm.getFd(vm.lstAssured[i].FD_NACIMIENTO);
                    }

                    if (vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS == null) {
                    	vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS = [];
                    }
            		
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS.push(vm.lstAssured[i]);
            	}
            }
            
            //Añadir otarifa
            if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD[0] != null) {
            	vm.objPres.OTARIFA = vm.objPres.MODALIDADES.MODALIDAD[0];
            }
            
            if(vm.sendDoc != undefined && vm.sendDoc == true) {
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.EMAIL_DOCUMENTACION = vm.policyMail;
            }
            
            vm.loading = true;

            HijosService.contract(vm.objPres)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if(response.data.ID_RESULT == 0) {

                        vm.objPol = response.data;

                        if (vm.objPol.PRESUPUESTO != null && vm.objPol.PRESUPUESTO.PECUNIARIAS != null && vm.objPol.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR != null) {
                        	vm.objHolder = vm.objPol.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;
                        	vm.holderSurnames = vm.objHolder.NO_APELLIDO1 + ' ' + vm.objHolder.NO_APELLIDO2;
                        }

                        vm.loading = false;
                        vm.step = 3;
                     } else {
                         vm.loading = false;
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

        vm.dlPolicy = function() {
			vm.parent.abrirModalcargar(true);
        	PolizaService.getCondiciones(vm.objPol.NU_POLIZA)
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
						saveAs(new Blob([response.data]), vm.objPol.NU_POLIZA + '.pdf');
						msg.textContent('Se ha descargado la póliza correctamente');
						$mdDialog.show(msg);
						// vm.parent.abrirModalcargar();
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar las condiciones');
					$mdDialog.show(msg);
        		}
     		},function(error) {
				msg.textContent('Se ha producido un error al descargar las condiciones');
				$mdDialog.show(msg);
            });
//            window.open(BASE_CON + '/tarificacion/getCondiciones/' + vm.objPol.NU_POLIZA,'_blank');
        }
        
        vm.reset = function() {
            vm.price = 0;
            vm.budgetId = undefined;
            vm.assuredNumber = undefined;
            vm.dataWarning = true;
        }

        vm.checkRequired = function(obj) {
            for(var data in obj) {
                if(obj[data] == '' || obj[data] == undefined) {
                    vm.dataWarning = true;
                    return
                } else {
                    vm.dataWarning = false;
                }
            }
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

        vm.checkInput = function(input, type) {
            vm.formConChild.$valid;
            switch (type) {
                case 'docNum':
                    if(input.$viewValue.length >= 9 && input.$viewValue.length <= 10) {
                        if(vm.tar.validateDocument(input.$viewValue).valid == true) {
                            ClienteService.validaDocumento({'NU_DOCUMENTO': input.$viewValue})
                            .then(function successCallback(response) {
                                if(response.status == 200) {
                                    if(response.data.ID_RESULT != 103) {
                                        input.$valid = true;
                                        input.$invalid = false;
                                    } else {
                                        input.$valid = false;
                                        input.$invalid = true;
                                    }
                                }
                            }, function callBack(response) {
                                if (response.status == 406 || response.status == 401) {
                                    // vm.parent.logout();
                                    // $location.path('/');
                                }
                            });
                        } else {
                            input.$valid = false;
                            input.$invalid = true;
                        }
                    }
                    break;
                case 'ibanNum':
                    if(input.$viewValue.length == 24) {
                        if(vm.tar.validateIban(input.$viewValue) == 1) {
                            input.$valid = true;
                            input.$invalid = false;
                        } else {
                            input.$valid = false;
                            input.$invalid = true;
                        }
                    }
                    break;
                case 'dateA':
                    if(input.$modelValue instanceof Date) {
                        if(getAge(input.$modelValue) >= 18) {
                            input.$valid = true;
                            input.$invalid = false;
                        } else {
                            input.$valid = false;
                            input.$invalid = true;
                        }
                    }
                    break;
                case 'dateC':
                    if(input.$modelValue instanceof Date) {
                        if(getAge(input.$modelValue) < 18) {
                            input.$valid = true;
                            input.$invalid = false;
                        } else {
                            input.$valid = false;
                            input.$invalid = true;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        
        vm.getColectivosTarificables = function () {
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
            var colectivosTarificables = [];
            for(var i = 0; i < productos.length; i++) {
                var producto = productos[i];
                if(producto.ID_PRODUCTO != null && producto.ID_PRODUCTO == 7 && producto.IN_TARIFICA == true) {
                    colectivosTarificables.push(producto)
                }
            }
            return colectivosTarificables;
        }

        vm.showColectivos = function (tar) {
        	vm.showSelectColectivos = true;
            vm.colectivosHijo = [];
            var productos = JSON.parse(window.sessionStorage.perfil).productos;

    		var listProductos = [7];
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

        vm.dateFormat = function (date) {
        	if (date != null) {       		
        		var fechaFormat = moment(date).format('DD/MM/YYYY')
                return fechaFormat;
        	}
        }
        
        vm.retarificarEdit = function (nuevoPresu) {
    	    if (vm.assuredNumber != null) {
    	    	if (nuevoPresu == null) {
    	    		nuevoPresu = false;
    	    	}
                vm.rateChild(false, nuevoPresu);
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
	            vm.mediador = productos.find(x => x.ID_COMPANIA == vm.idComisionista && x.ID_PRODUCTO == 7);
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

    ng.module('App').component('tarHijosApp', Object.create(tarHijosComponent));

})(window.angular);