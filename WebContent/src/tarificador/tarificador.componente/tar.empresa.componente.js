(function (ng) {


    //Crear componente de app
    var tarEmpresaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$scope', '$window', '$q', '$mdDialog', '$location', 'EmpresaService', 'BASE_CON', 'BASE_SRC', 'PresupuestoService', 'TiposService', 'PolizaService', 'ComisionService', 'UsuarioWSService', 'AseguradoraService', 'ClienteService', 'LocalidadesService', 'BusquedaService', 'GarantiaService', 'ExportService', 'constantsTipos', 'CommonUtils','FicherosService'],
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

    tarEmpresaComponent.controller = function tarEmpresaComponentControler($scope, $window, $q, $mdDialog, $location, EmpresaService, BASE_CON, BASE_SRC, PresupuestoService, TiposService, PolizaService, ComisionService, UsuarioWSService, AseguradoraService, ClienteService, LocalidadesService, BusquedaService, GarantiaService, ExportService, constantsTipos, CommonUtils, FicherosService) {
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
		vm.rol = window.sessionStorage.rol;
        vm.date = (vm.rol == 1 || vm.rol == 4 || vm.rol == 8) ? new Date(new Date().setDate(new Date().getDate() - 7)) : new Date();
        vm.opciones = {
    		fechaEfecto: new Date()
        }
        vm.colectivo = null;
        vm.checkFecha = false;
        vm.objAutPer = {};
        vm.objHolder = {};
        vm.superAdmin = false;
        vm.optionAdminSelected = null;
        vm.empresasAdminList = [];
        vm.mostrarTarificacionNormal = true;
        vm.mostrarAdmin = false;
        vm.maxFacturacion = 31000000;
        vm.mostrarTarificacionManual = false;
        vm.contractAdhoc = false;
        vm.addCodigoDescuento = false;
        vm.codigoDescuento = null;
    	vm.listComisionistas = [];
        vm.idComisionista = null;
    	vm.listUsers = [];
        vm.idUsuario = null;
        vm.loadGestores = false;
    	vm.showSelectColectivos = false;
    	vm.emailAccept = false;
    	vm.listAseguradosAdhoc = [];
		vm.listaArchivos = [];
        vm.tipoMedioPago = null;
        vm.cuponAplicado = false;
        vm.changeComisionistaNumber = 0;
        vm.formaPago = 2;
        vm.isBancaMarch = false;
        vm.showMenusRedirect = {
    		polizas: true,
    		siniestros: true,
    		presupuestos: true,
    		recibos: true
        }
        vm.showDocumento = false;
        vm.documentoValido = false;
        vm.colectivosDocumento = [];
        vm.disabledDocumento = false;
		vm.hidePrice = false;
		vm.switchContratarPoliza = false;
	    vm.addDescuento = false;
	    vm.checkEmail = false;
	    vm.budgetIdAgregados = null;
		vm.calcAgregados = false;
	    vm.checkAseguradoEsTomador = true;
	    vm.objAsegurado = {};
	    vm.addressAsegurado = {};
		vm.regexEmail='/^.+@.+\\..+$/';
		vm.isSumAsegCoberturas = false;
		vm.isCaducado = false;
		vm.valores = [1, 9, 10, 4, 0];
		vm.filesNew = [];

		//Objeto para mostrar/ocultar/confirmar los pasos en la tarificación de administrador
		vm.newSteps = [
			{ paso: 1, mostrar: true, añadido: false, extender: true }, 
			{ paso: 2, mostrar: false, añadido: false, extender: true }, 
			{ paso: 3, mostrar: false, añadido: false, extender: true }, 
			{ paso: 4, mostrar: false, añadido: false, extender: true }, 
			{ paso: 5, mostrar: false, añadido: false, extender: true }, 
			{ paso: 6, mostrar: false, añadido: false, extender: true }
		];
		
		//Objeto para mostrar/ocultar/confirmar los pasos en la contratación
		vm.stepsInfo = {
			datosEmpresa: { mostrar: true, anadido: false, extender: true },
			datosAutorizado: { mostrar: false, anadido: false, extender: true },
			asegurados: [],
			datosPago: { mostrar: false, anadido: false, extender: true },
			requisitosRenovacion: { mostrar: false, anadido: false, extender: true },
			datosFechasGestor: { mostrar: false, anadido: false, extender: true },
			documentos: { mostrar: false, anadido: false, extender: true },
			dominios: { mostrar: false, anadido: false, extender: true },
			ebroker: { mostrar: false, anadido: false, extender: true }
		}
		
		//Variable para definir el tipo de tarificación en parte administrador
		vm.tarifaAdhoc = "auto";
		
		//Objeto para mostrar/ocultar secciones de las coberturas
		vm.seccionesCobertura = {
			cobertura1: false,
			cobertura2: false,
			cobertura3: false,
			cobertura4: false
		}
		
		vm.objAgregados = {
			LST_FRANQUICIAS: [{ NO_FRANQUICIA: "FRANQUICIA GENERAL" }]
		}
        
    	vm.usuario = JSON.parse($window.sessionStorage.perfil).usuario;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        this.loadTemplate = function() {
        	if (vm.loadTemplateAdhoc == true) {
            	vm.isAdhoc = true;
                return "src/tarificador/tarificador.view/tarificador.empresa.view/tar.empresa.admin.html";
        	} else {
            	vm.isAdhoc = false;
                return "src/tarificador/tarificador.view/tarificador.empresa.view/tar.empresa.gestor.html";
        	}
        }

        this.$onInit = function() {
        	vm.colectivos = [];
            vm.idColectivo = null;
        	var perfil = null;
        	vm.perfil = null;
            vm.mediador = null;
    		vm.rol = window.sessionStorage.rol;
            vm.maxFacturacion = (vm.rol == 1 || vm.rol == 4 || vm.rol == 8) ? 999999999 : 31000000;
            vm.productosAll = JSON.parse(window.sessionStorage.perfil).productos;
            vm.productosCiber = [];
            vm.productoCiberSelected = null;
            vm.maxDateInicio = new Date();
            vm.maxDateInicio = new Date(vm.maxDateInicio.setMonth(vm.maxDateInicio.getMonth() + 1));
            vm.minDate = new Date();
            vm.docAllowed = false;
            vm.presuClonado = false;

			vm.listCoberturas3 = ["Selecciona una Sección", "Sección A: Daños a los Sistemas y Costes de Rectificación", "Sección B: Interrupción del Negocio", "Sección C: Daño Reputacional Consecuente", "Sección D: Gastos de Ajuste de Siniestro"];

			vm.isBudgetImport = false
			vm.isObservaciones = false

			if (vm.rol == 1 || vm.rol == 4 || vm.rol == 8 ) {
				vm.loadTemplateAdhoc = true;
			} else {
				vm.loadTemplateAdhoc = false;
			}
			
            if (vm.productosAll != null) {
            	//Recuperar producTos a mostrar en adhoc
            	var productosDisponibles = [5, 6, 29];
                for (var i = 0; i < vm.productosAll.length; i++) {
                	if ((vm.productosAll[i].ID_PROGRAMA == 2 || vm.productosAll[i].ID_PROGRAMA == 18) && productosDisponibles.includes(vm.productosAll[i].ID_PRODUCTO)) {
                		//Comprobar que no se ha añadido este producto a la lista
                		var index = vm.productosCiber.findIndex(x => x.ID_PRODUCTO == vm.productosAll[i].ID_PRODUCTO);
                		if (index < 0) {
                    		vm.productosCiber.push(vm.productosAll[i]);
                		}
                	}
                }
                
                //Si solo se tiene un producto disponible, marcar ese producto por defecto
                if (vm.productosCiber.length == 1) {
                	vm.productoCiberSelected = vm.productosCiber[0];
                	
                	if (vm.autocomplete == null) {
                		vm.autocomplete = {};
                	}
                	
                	vm.autocomplete.PRODUCTOCIBER = vm.productosCiber[0];
                	vm.searchProductosCiber = vm.productosCiber[0].NO_PRODUCTO;
                }
            }
            
            if ($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				perfil = JSON.parse($window.sessionStorage.perfil);
				vm.perfil = JSON.parse($window.sessionStorage.perfil);

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

	        
	        TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONF_PRESUPUESTOS, "CO_TIPO": "MED_NEED_DOC" })
            .then(function successCallback(response) {
                if (response.status == 200) {
                	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO[0] != null && response.data.TIPOS.TIPO[0].DS_TIPOS != null) {
                		var colectivosDocumentoString = response.data.TIPOS.TIPO[0].DS_TIPOS;
                		vm.colectivosDocumento = colectivosDocumentoString.split('|');
                		vm.showDocumentoFunction();
                	}
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
	        
	        // ComisionService.getComisionistasProducto({"ID_COMP_RAMO_PROD": vm.productoSeleccionado, "CO_TIPO_COMISION": "MD", 'IS_SELECTED': true})
            // .then(function successCallback(response) {
            //     if (response.status == 200) {
            //     	vm.listComisionistas = [];
            //     	if (response.data != null && response.data.COMISIONISTASPROD != null && response.data.COMISIONISTASPROD.COMISIONISTAPROD != null) {
            //     		vm.listComisionistas = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
            //     		// vm.listComisionistas.unshift({NO_COMPANIA: '--SIN MEDIADOR--', ID_COMPANIA: 4});
			// 			for (let i = 0; i < vm.listComisionistas.length; i++) {
			// 				if(vm.listComisionistas[i].ID_COMPANIA == 4) {
			// 					vm.listComisionistas.unshift(JSON.parse(JSON.stringify(vm.listComisionistas[i])));
			// 					vm.listComisionistas[0].NO_COMPANIA = '--SIN MEDIADOR--';
			// 					vm.listComisionistas[0].NO_SELECCIONABLE = true;
			// 					break;
			// 				}
			// 			}
            //     	    if (vm.listComisionistas != null && vm.listComisionistas.length == 1) {
            //     	    	if (vm.autocomplete == null) {
            //     	    		vm.autocomplete = {};
            //     	    	}
            //     	    	vm.autocomplete.COMISIONISTA = vm.listComisionistas[0];
            //     	    	vm.idComisionista = vm.autocomplete.COMISIONISTA.ID_COMPANIA;
            //     	    	vm.changeComisionista();
            //     	    }

            //     	    if (vm.detalles != null && vm.detalles.ID_TIPO_COLECTIVO != null) {
            //     	    	var comisionistaSeleccionado = vm.listComisionistas.find(x => x.ID_TIPOCOLECTIVO == vm.detalles.ID_TIPO_COLECTIVO);
                	        
			// 				if (comisionistaSeleccionado != null) {
			// 					if (vm.autocomplete == null) {
			// 						vm.autocomplete = {};
			// 					}
			// 					vm.autocomplete.COMISIONISTA = comisionistaSeleccionado;
			// 					vm.idComisionista = comisionistaSeleccionado.ID_COMPANIA;

            //                     //Cuando no le mostramos a un usuario el select de gestores
            //                     //Llamamos a la función de changeComisionista, ya que en un usuario con posibilidad de seleccionar gestores se llama automáticamente a esa función, pero como estos usuarios no tienen ese select, no hace nada 
			// 					if (vm.optionAdminSelected != 2 && vm.rol != 1 && vm.rol != 4 && vm.showSelectColectivos != true) {
            //                         vm.changeComisionista();
			// 					}
			// 				}
            //     	    } else {
            //     	    	//Rellenamos el objeto vm.mediador con más datos,  como IN_COBRO_MEDIADOR
            //                 var productos = JSON.parse(window.sessionStorage.perfil).productos;
                            
            //                 if (productos != null && vm.mediador != null) {
            //                 	if(vm.productoSeleccionado == 29){
			// 						vm.mediador = vm.listComisionistas[0];
			// 					} else {
			// 						vm.mediador = productos.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.ID_PRODUCTO == 6);
			// 					}
            //                     var inMediador = false;
            //                     var objMediador = vm.listComisionistas.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.NO_SELECCIONABLE != true);
            //                     if (objMediador != null) {
            //                     	inMediador = objMediador.IN_COBRO_MEDIADOR;
            //                     }
            //     	            vm.mediador.IN_COBRO_MEDIADOR = inMediador;
            //     	            vm.idColectivo = vm.mediador.ID_TIPO_POLIZA; 
            //     	            vm.colectivo = vm.mediador;
            //             		vm.showDocumentoFunction();
            //                 }
            //     	    }
            //     	}
            //     }
            // }, function callBack(response) {
			// 	if (response.status == 406 || response.status == 401) {
			// 		vm.parent.logout();
			// 	}
            // });
	        
          	//Si estamos editando o viendo el presupuesto
            if (vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
            	vm.nuAseguradosAdhoc = 0;
            	vm.isEdited = true;
            	vm.loadTemplateAdhoc = false;
                vm.budgetId = vm.detalles.ID_PRESUPUESTO;
				if (vm.detalles.ID_PRODUCTO != null) {
					vm.productoCiberSelected = vm.productosCiber.find(x => x.ID_PRODUCTO == vm.detalles.ID_PRODUCTO);
				}
				if(vm.detalles.ID_TIPO_COLECTIVO != null){
					vm.idColectivo = vm.detalles.ID_TIPO_COLECTIVO;
					vm.colectivo = vm.mediador;
				}
				if(vm.detalles.CO_PRESUPUESTO != null && vm.detalles.CO_PRESUPUESTO == 'AD-HOC'){
					vm.tarifaAdhoc = "adhoc";
				}
                //Cuando estamos viendo el detalle, se carga otro tarificador más resumido
                vm.templateTarificador = "src/tarificador/tarificador.view/tarificador.empresa.view/tarificador.resumen.html";
                
                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.CIBERRIESGO != null) {
                    var ciberriesgo = vm.detalles.PECUNIARIAS.CIBERRIESGO;
                    
                    if (vm.objPri == null) {
                    	vm.objPri = {};
                    }
                    
                    vm.activity = ciberriesgo.ACTIVITY_CODE;
					// vm.activity = ciberriesgo.ACTIVITY_DESC;
                    vm.objPri.turnover = ciberriesgo.TURNOVER.toString();
                    vm.amount = ciberriesgo.AMMOUNT_OPTION;
                    vm.selActivities = ciberriesgo.FILIAL_ACTIVITY_CODE;
                    vm.objPri.lossAttackAmountOption = ciberriesgo.LOSS_ATTACK_AMOUNT_OPTION;
                    vm.selAtks = ciberriesgo.CIBER_ATTACK_TYPES;
                    vm.addCCE = vm.getAddCCE(vm.detalles.PECUNIARIAS.LST_GARANTIAS);
                    
                    if (vm.selActivities != null && vm.selActivities != "") {
                    	vm.existenFilialesEspanolas = true;
                    }
                    
                    if (vm.addCCE == true) {
                        vm.amountCC = '100.000 €';
                    } else {
                        vm.amountCC = '25.000 €';
                    }
                }

        		if (vm.objPres == null && vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null) {
        			vm.objPres = {
    					ID_PRESUPUESTO: vm.detalles.ID_PRESUPUESTO,
        				PRESUPUESTO: {
        	                CO_PRODUCTO: vm.productoCiberSelected != null ? vm.productoCiberSelected.CO_PRODUCTO : "CBEMP-INDEP",
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
                		}
                	}
                }

                if (vm.detalles.PECUNIARIAS != null && vm.detalles.PECUNIARIAS.NU_DOCUMENTO != null) {
                	vm.nuDocumento = vm.detalles.PECUNIARIAS.NU_DOCUMENTO;
		        	vm.documentoValido = true;
        			vm.disabledDocumento = true;
                }

				if (vm.detalles.IN_EMITIDO != 1) {
	                if (vm.detalles.IS_NUEVO_PRESU_EXISTENTE == true) {
	                	delete vm.detalles.IS_NUEVO_PRESU_EXISTENTE;
	                	vm.retarificarEdit(true);
	                } else if (vm.detalles.LIST_TARIFAS != null && vm.detalles.LIST_TARIFAS[0] != null) {
	                	if(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT == 0){
	                		vm.isPrice = false;
	                	}else{
	                		vm.price = parseFloat(vm.detalles.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
	                		vm.isPrice = true;
	                	}
	                } else if(vm.detalles.CO_PRESUPUESTO == "AD-HOC"){

	                } else{
                	vm.retarificarEdit();
	                }
				} else {
					vm.price = vm.detalles.OPOLIZA.IM_PRIMA_TOTAL;
					vm.isPrice = true;
				}

				//Comprobar si el presupuesto está dentro de los 30 días de la caducidad
				var fdBudget = new Date(vm.detalles.FT_USU_ALTA);
				var fdCaducidad = vm.parent.dateFormat(new Date(fdBudget.setDate(fdBudget.getDate() +40)));
				(vm.parent.dateFormat(new Date()) > fdCaducidad) ? vm.isCaducado = true : false;
				
				//Recuperar documentacion asociada al presupuesto
				vm.recuperarDoc();
				
				if(vm.detalles.ID_SUBESTADO != null && vm.valores.indexOf(vm.detalles.ID_SUBESTADO) > -1){
					vm.docAllowed = true;
				}
				
				vm.idSubestado = vm.detalles.ID_SUBESTADO;
				
				//hacer backup del presu recuperado para ver si se han hecho cambios
				vm.presuBackup = JSON.stringify(vm.detalles);
				
				if(vm.detalles.PECUNIARIAS.OBSERVACIONES_ADHOC != undefined){
					vm.detObsAdhoc = true;
				}
				
    			if(vm.detalles.PECUNIARIAS.SUBESTADO != undefined && vm.detalles.PECUNIARIAS.SUBESTADO.FD_ENVIADO_BEAZLEY != undefined){
    				vm.fechaEnvBeazley = vm.detalles.PECUNIARIAS.SUBESTADO.FD_ENVIADO_BEAZLEY;
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
            }            //Si es nuevo
            else {
                var url = $location.url();
                var productUrl = getUrlParam('prod', url);
                if (productUrl == null || productUrl == "") {
                    productUrl = 6;
                }
                
                vm.productoCiberSelected = vm.productosCiber.find(x => x.ID_PRODUCTO == productUrl);
                
                if (vm.loadTemplateAdhoc == true) {
                    vm.productoSeleccionado = vm.productoCiberSelected.ID_PRODUCTO;
                    vm.changeProductoAdhoc();
                }
            }

			//Si se está creando el presuñuesto desde el listado, recuperar el producto elegido
			if (vm.detalles != null && vm.detalles.productoBusqueda != null) {
				vm.productoCiberSelected = vm.productosCiber.find(x => x.ID_PRODUCTO == vm.detalles.productoBusqueda);
                
                if (vm.loadTemplateAdhoc == true) {
                    vm.productoSeleccionado = vm.productoCiberSelected.ID_PRODUCTO;
                    vm.changeProductoAdhoc();
                }
			}
            
            if (vm.productoCiberSelected == null) {
				vm.productoCiberSelected = vm.productosCiber.find(x => x.ID_PRODUCTO == vm.productoSeleccionado);
				vm.productoSeleccionado = vm.productoCiberSelected.ID_PRODUCTO;
			}
            
            if (vm.budgetId == null) {
	            var perfil = JSON.parse(sessionStorage.getItem('perfil'));
				if (perfil != null) {
		            vm.colectivos = perfil.colectivos;
		            vm.idColectivo = null;
		            var colectivosTarificables = vm.getColectivosTarificables();
		            
		            if (vm.colectivos.length == 1) {
		            	vm.idColectivo = vm.colectivos[0].ID_TIPO_POLIZA;
						vm.changePartner();
						vm.showDocumentoFunction();
		            } else if (colectivosTarificables != null && colectivosTarificables.length == 1) {
		            	vm.idColectivo = colectivosTarificables[0].ID_TIPO_POLIZA;
		            	vm.colectivo = colectivosTarificables[0];
		            	vm.showDocumentoFunction();
		            } else {
		            	vm.showColectivos();
		            	vm.showDocumentoFunction();
		            }
	            }
				
                //Cuando estamos tarificando sin haber creado antes el presupuesto, se carga la vista del tarificador
                vm.templateTarificador = "src/tarificador/tarificador.view/tarificador.empresa.view/tarificador.normal.html";
            }
            
            if(vm.parent.listServices.listGrupoEmpresa_ti != null && vm.parent.listServices.listGrupoEmpresa_ti.length > 0) {
                vm.tpGroups = vm.parent.listServices.listGrupoEmpresa_ti;
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

            vm.getListTpAmount();

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

			if(vm.parent.listServices.listEstadoPresupuesto != null && vm.parent.listServices.listEstadoPresupuesto.length > 0){
    			vm.estadosPresupuesto = vm.parent.listServices.listEstadoPresupuesto;
    		} else {
    			TiposService.getTipos({"ID_CODIGO": constantsTipos.ESTADOS_PRESUPUESTO})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.estadosPresupuesto = response.data.TIPOS.TIPO;
    					vm.parent.listServices.listEstadoPresupuesto = vm.estadosPresupuesto;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
					
            if(vm.detalles != null && vm.detalles.ID_PRESUPUESTO != null){
            	vm.getSubestadosPresu();
        	}

			if(vm.parent.listServices.listTiposRiesgos != null && vm.parent.listServices.listTiposRiesgos.length > 0) {
                vm.tpRiesgos = vm.parent.listServices.listTiposRiesgos;
            } else {
            	TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.TIPOS_RIESGO_PRESUP
                })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	vm.tpRiesgos = response.data.TIPOS.TIPO;                    	
                    	vm.parent.listServices.listTiposRiesgos = vm.tpRiesgos;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            }

			if(vm.parent.listServices.listMotivosNoContrat != null && vm.parent.listServices.listMotivosNoContrat.length > 0) {
                vm.motivosNoContratacion = vm.parent.listServices.listMotivosNoContrat;
            } else {
            	TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.MOTIV_NO_CONTRATACION
                })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	vm.motivosNoContratacion = response.data.TIPOS.TIPO;                    	
                    	vm.parent.listServices.listMotivosNoContrat = vm.motivosNoContratacion;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            }

            vm.colectivosPadre = vm.parent.getColectivosPadre(vm.colectivos);
			for(var i = 0; i < vm.colectivos.length; i++) {
				if(vm.colectivos[i].ID_TIPOCOLECTIVO_PADRE != undefined && vm.colectivos[i].ID_TIPOCOLECTIVO_PADRE ==  100) {
					vm.empresasAdminList.push(vm.colectivos[i])
				}
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
        }

        this.$onChanges = function() {
        	
        }
        
        vm.recuperarDoc = function(){
        	FicherosService.getFicherosType({'ID_TIPO': 227, 'NO_RUTA': `presupuestos/${vm.detalles.ID_PRESUPUESTO}`})
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0) {
						vm.listaArchivos =  response.data.RESULT;
						vm.archivosRec = vm.listaArchivos.length;
					}
				}
			},function errorCallback(response){
				if(response.status == 406 || response.status == 401){
					vm.busqueda.logout();
				}
			});
        }
        
        vm.getFilialActivityByDs = function () {
            var listFiliales = [];
            var listSectores = [];

        	if (vm.tpGroups != null && vm.selActivities != null && vm.selActivities != "") {
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
                                    if (filial.charAt(0) == ",") {
                                    	filial = filial.replace(',','');
                                    }
                                    if (actividad.DS_ACTIVIDAD.includes(filial)) {
                                        listSectores.push(sector);
                                        listFiliales.push(actividad.DS_ACTIVIDAD);
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

			if (vm.optionAdminSelected == 2 && vm.budgetId == null) {
                return null;
			}
			
    		if (vm.addCCE == true) {
                vm.amountCC = '100.000 €';
            } else {
            	if (vm.tarifaAdhoc == 'adhoc' && vm.amountValue < 500000) {
                    vm.amountCC = '25.000 €';
				} else if (vm.tarifaAdhoc != 'adhoc' && vm.amount.CO_TIPO <= 1) {
                    vm.amountCC = '25.000 €';
				} else {
                    vm.amountCC = '50.000 €';
				}
            }
			
        	var obj = {
          	  ID_RAMO: 103,
			  ID_TIPO_COLECTIVO: vm.idColectivo,
              CO_PRODUCTO: vm.productoCiberSelected != null ? vm.productoCiberSelected.CO_PRODUCTO : "CBEMP-INDEP",
          	  OPOLIZA: {
          	    CO_CANAL: '4'
          	  },
          	  PECUNIARIAS: {
          		CIBERRIESGO: {
        	        ID_FORMAPAGO: vm.formaPago,
          			ACTIVITY_CODE: vm.activity.CO_ACTIVIDAD,
					ACTIVITY_DESC: vm.activity.DS_ACTIVIDAD,
          			TURNOVER: vm.objPri.turnover,
          			AMMOUNT_OPTION: vm.amountValue != null ? 4 : vm.amount.CO_TIPO,
          			LOSS_ATTACK_AMOUNT_OPTION: vm.objPri.lossAttackAmountOption,
          			CIBER_ATTACK_TYPES: vm.selAtks,
          			FILIAL_ACTIVITY_CODE: "",
					AMMOUNT: vm.amountValue != null ? vm.formatImporte(vm.amountValue) : null
          	    },
      			LST_GARANTIAS: [
      				{
                        ID_GARANTIA: 52,
                        NU_CAPITAL: vm.formatAmount(vm.amount.DS_TIPOS)
                    }, {
                    	ID_GARANTIA: 53,
                    	NU_CAPITAL: vm.formatAmount(vm.amount.DS_TIPOS)
                    }, {
                    	ID_GARANTIA: 54,
                    	NU_CAPITAL: vm.formatAmount(vm.amount.DS_TIPOS)
                    }, {
                    	ID_GARANTIA: 55,
                    	NU_CAPITAL: vm.formatAmount(vm.amountCC)
                    }
                ],
          	    DATOS_PAGO: {
          	      ID_FORMAPAGO: vm.formaPago,
          	      FD_INICIO: vm.getFdInicio()
          	    }
          	  }
          	}

          	if (vm.showDocumento == true && vm.nuDocumento != null) {
          		obj.PECUNIARIAS.NU_DOCUMENTO = vm.nuDocumento;
          	}

          	if (vm.cuponAplicado == true) {
          		obj.PECUNIARIAS.DATOS_PAGO.PO_DESCUENTO = vm.codigoDescuento;
          		obj.PECUNIARIAS.DATOS_PAGO.CO_DESCUENTO = vm.idDescuento;
          	}

            if(vm.addCCE == true) {
            	obj.PECUNIARIAS.LST_GARANTIAS.push({
            		ID_GARANTIA: 57,
                    ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(57),
            		IS_SELECTED: true,
            		NU_CAPITAL: vm.formatAmount(vm.amountCC)
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
				obj.ID_TIPO_COLECTIVO = vm.idColectivo;
            }

            if (vm.colectivo != null) {
                obj.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            }

            if (vm.idUsuario != null) {
            	obj.NO_USUARIO = vm.idUsuario;
            } else {
            	obj.NO_USUARIO = vm.usuario;
            }

            if (vm.objHolder != null && Object.keys(vm.objHolder).length !== 0) {
            	obj.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            }

    		vm.franquiciaGestor = null;
            vm.calc = true;

            //Si estamos en template gestor, hacemos scroll hacia precio
            if (vm.loadTemplateAdhoc != true && vm.isEdited != true) {
            	vm.scrollTo('box-price');
            }
            EmpresaService.rate(obj)
            .then(function successCallback(response) {
                if(response.status == 200) {
                    if(response.data != undefined && (response.data.ID_RESULT == 0 || response.data.ID_RESULT == 6 || response.data.ID_RESULT == 700)) {
						
                        vm.budgetId = response.data.ID_PRESUPUESTO;
                        
                        if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                        	if (vm.formaPago == 7) {
                                vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_TOT;
                                vm.anualPrice = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                        	} else {
                                vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                                vm.anualPrice = null;
                        	}
                        }else{
                        	vm.isPrice = false;
                        }
                        
                    	if (response.data.MODALIDADES  != null && response.data.MODALIDADES.MODALIDAD[0] != null && response.data.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA != null) {
                    		vm.franquiciaGestor = vm.beautifyImporte(+(Math.round(response.data.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA + "e+2")  + "e-2"));
                    	} else {
                    		vm.franquiciaGestor = null;
                    	}
                        
                        if (vm.detalles != null && vm.detalles.IN_EMITIDO == 1 && vm.detalles.ID_PRESUPUESTO != vm.budgetId) {
                        	vm.detalles.IN_EMITIDO = 0;
                        }

                        if (nuevoPresupuesto == true && vm.busquedaPresupuesto != null) {
                        	vm.busquedaPresupuesto.numDetalles[vm.busquedaPresupuesto.active - 1].ID_PRESUPUESTO = response.data.ID_PRESUPUESTO; 
                        }
                        
                        if (nuevoPresupuesto == true)
                        	vm.presuClonado = true;
                        
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
  				  
	  				//Comprobamos si se ha elegido una compañía de ebroker
	  				if (vm.mediador.ID_COMPANIA == 8 || vm.mediador.ID_COMPANIA == 20 || vm.mediador.ID_COMPANIA == 17) {
	  			        vm.showEbroker = true;
	  				}
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    // vm.parent.logout();
                    // $location.path('/');
                }
            });
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
        
        vm.filialIsDangerous = function (listFiliales) {
        	var isDangerous = false;
        	
        	if (vm.affiSector != null && listFiliales != null) {
        		//Rcorremos filiales para encontrarlas en los sectores
        		for (var i = 0; i < listFiliales.length; i++) {
        			var filial = listFiliales[i];
        			var filialEncontrado = false;
        			//Recorremos los sectores seleccionados
        			for (var j = 0; j < vm.affiSector.length; j++) {
        				var sector = vm.affiSector[j];
        				
        				//Recorremos las actividades del sector
        				for (var k = 0; k < sector.activities.length; k++) {
        					if (sector.activities[k].typeDescription == filial) {
        						filialEncontrado = true;
        						if (sector.activities[k].IN_PELIGROSA == true) {
        							isDangerous = true;
        						}
        						break;
        					}
        				}
        				
        				if (filialEncontrado == true) {
        					break;
        				}
        			}
        			
    				if (isDangerous == true) {
    					break;
    				}
        		}
        	}
        	
        	return isDangerous;
        }
        
        vm.isPriceable = function () {
        	var priceable = true;
        	var tarificar = true;
    		var role = $window.sessionStorage.perfil;
        	
    		if (vm.optionAdminSelected != 2 && vm.isAdhoc != true) {
            	if (vm.activity.IN_PELIGROSA == true && vm.rol != '1' && vm.rol != '4' && vm.rol != '8') {
            		priceable = false;
            	}
            	
            	if (vm.objPri != null && vm.objPri.turnover != null && priceable != false) {
            		if (vm.optionAdminSelected == 2) {
    					priceable = true;
                    } else if(vm.rol == '1' || vm.rol == '4' || vm.rol == '8') {
                        if(vm.objPri.turnover > 50000000) {
                            priceable = false;
                        } else {
                            priceable = true;
                        }
                    } else {
                        if(vm.objPri.turnover > 31000000 && vm.optionAdminSelected != 1) {
                            priceable = false;
                        } else {
                            priceable = true;
                        }
                    }
            	}
            	
            	if (vm.amount != null && priceable != false) {
                	if((vm.productoSeleccionado == 6 && vm.formatAmount(vm.amount.DS_TIPOS) > 1000000) || (vm.productoSeleccionado == 5 && vm.formatAmount(vm.amount.DS_TIPOS) > 2000000)) {
                        priceable = false;
                    } else {
                        if(vm.objPri.turnover < 250000 && vm.formatAmount(vm.amount.DS_TIPOS) > 250000) {
                            priceable = false;
                        } else {
                            priceable = true;
                        }
                    }
            	}
            	
            	if (vm.objPri != null && vm.objPri.lossAttackAmountOption != null && priceable != false) {
            		if(vm.objPri.lossAttackAmountOption != undefined) {
                        if(vm.objPri.lossAttackAmountOption == '2' && vm.optionAdminSelected != 2) {
                            priceable = false;
                        } else if (vm.objPri.lossAttackAmountOption == "0") {
                            priceable = true;
                        } else {
                            priceable = true;
                        }
                    }
            	} else if (vm.objPri.lossAttackAmountOption == null) {
            		tarificar = false;
            	}
    		}
        	
        	vm.priceable = priceable;
//        	if (!(vm.detalles != null && vm.detalles.IN_EMITIDO != 1) && vm.priceable == true) {
        	if (vm.priceable == true) {
        		vm.validate(vm.formTarEmpresa, tarificar);
        	}
        }
        
        vm.confirmarActividadPeligrosa = function () {
            var confirm = $mdDialog.confirm()
            .textContent("Esta actividad  se considera de riesgo, ¿Seguro que quiere continuar?")
            .ok('Aceptar')
            .cancel('Cancelar');;

	        $mdDialog.show(confirm).then(function () {
	        	$mdDialog.cancel();
	        }, function () {
	        	vm.activity = null;
	        	$mdDialog.cancel();
	        });
        }
        
        vm.check_risk = function(type, item) {
            vm.objSendF = {};
            vm.msgForm = null;
    		vm.franquiciaGestor = null;
            switch (type) {
	            case 'selActivities':
	            	break;
                case 'activity':
                    if(item != undefined) {
                    	if (item.CO_ACTIVIDAD.includes("PROHIBIDA")) {
                            vm.activity = null;
            				msg.textContent("La actividad seleccionada está restringida");
                            $mdDialog.show(msg);
                        }
                    	vm.objPri = {};
                        vm.objPri.turnover = null;
                        vm.amount = null;
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        vm.anualPrice = null;
                        
                        if (item.CO_ACTIVIDAD == "I1" && vm.isBancaMarch() == true) {
                            vm.formaPago = 7;
                        } else {
                            vm.formaPago = 2;
                        }
                        
                        if (item.IN_PELIGROSA == true && (vm.rol == '1' || vm.rol == '4' || vm.rol == '8')) {
                    		vm.confirmarActividadPeligrosa();
                    	}
                    }
                    break;
                case 'billing':
                    if(item != undefined && vm.isAdhoc != true) {
                        vm.amount = null;
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        vm.anualPrice = null;
                    } else if (item != undefined && vm.isAdhoc == true) {
                        vm.price = 0;
                        vm.anualPrice = null;
                    }

                    break;
                case 'amount':
                    if(item != undefined && vm.isAdhoc != true) {
                        vm.checkAmounts();
                        vm.objPri.lossAttackAmountOption = null;
                        vm.selAtks = null;
                        vm.price = 0;
                        vm.anualPrice = null;
                    } else if (item != undefined && vm.isAdhoc == true) {
                        vm.price = 0;
                        vm.anualPrice = null;
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

        vm.sendForm = function() {
            var obj = vm.objSendF;
            var listaCampos = ["NU_DOCUMENTO", "NO_NOMBRE", "NO_EMAIL"];

            for (var i = 0; i < listaCampos.length; i++) {
            	if (obj[listaCampos[i]] == null || obj[listaCampos[i]] == "") {
        			msg.textContent("Rellene los campos obligatorios");
        			$mdDialog.show(msg);
        			return null;
            	}
            }
            vm.loadingForm = true;
            
            EmpresaService.sendFormulario(obj, "CBEMP-INDEP")
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
            	vm.objHolder.FD_NACIMIENTO = vm.getFd(vm.objHolder.FD_NACIMIENTO);
            }
            
            vm.objHolder.NO_APELLIDO1 = "";
            vm.objHolder.NU_TELEFONO = vm.NU_TELEFONO;
            
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = vm.objHolder;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_AUTORIZADO = vm.objAutPer;
            
            if (vm.colectivo != null && vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.ID_MEDIADOR == null) {
            	vm.objPres.PRESUPUESTO.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
            }
            if(vm.idColectivo != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.ID_TIPO_POLIZA == null) {
            	vm.objPres.PRESUPUESTO.ID_TIPO_POLIZA = vm.idColectivo;
            }
            
            if (vm.idUsuario != null) {
            	vm.objPres.PRESUPUESTO.NO_USUARIO = vm.idUsuario;
            } else {
            	vm.objPres.PRESUPUESTO.NO_USUARIO = vm.usuario;
            }
            
            //Añadir los asegurados
            if (vm.listAseguradosAdhoc != null && vm.listAseguradosAdhoc.length > 0) {
            	vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS = [];
            	for (var i = 0; i < vm.listAseguradosAdhoc.length; i++) {
                    var idAsegurado = 5 + i;
            		var asegurado = vm.listAseguradosAdhoc[i];
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.LIST_ASEGURADOS.push(
                        {
                            NO_NOMBRE: asegurado.NO_NOMBRE,
                            NU_DOCUMENTO: asegurado.NU_DOCUMENTO,
							ID_TIPO_CLIENTE: idAsegurado
                        }
            		);
            	}
            }
            
            if (vm.bankAccount != null) {
				var listCamposIban = ["DC", "ENTIDAD", "OFICINA", "DIGITO_CONTROL", "NU_CUENTA"];
				if (vm.rol != 1 && vm.rol != 4 && vm.rol != 8) {
					vm.bankAccount.CO_IBAN = "";
					for (var i = 0; i < listCamposIban.length; i++) {
						if (vm.bankAccount[listCamposIban[i]] != null) {
							vm.bankAccount.CO_IBAN += vm.bankAccount[listCamposIban[i]];
						}
					}
				}
            	for (var campo in vm.bankAccount) {
            		if (!listCamposIban.includes(campo)) {
                		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO[campo] = vm.bankAccount[campo];
            		}
            	}
            }
            
            if (vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.PECUNIARIAS != null && vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO != null) {
            	if (vm.tipoPagoAdhoc != null) {
            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = vm.tipoPagoAdhoc;
                	if (vm.tipoPagoAdhoc == 7) {
                		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_IBAN = vm.bankAccount.CO_IBAN;   
                		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_BIC = vm.bankAccount.CO_BIC;
                		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.NO_TITULAR = vm.bankAccount.NO_TITULAR; 
                	}
            	} else {
                    vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 7;
                    
                    if (vm.mediador.IN_COBRO_MEDIADOR == true) {
                        vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.ID_TIPO_MEDIO_PAGO = 4;
                    }
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
            	vm.objPres.OTARIFA.IS_TACITA = vm.checkRenovacionTacita;
            }

            if(vm.NO_AGENTE != undefined && vm.NO_AGENTE != '') {
            	vm.objPres.NO_USUARIO = vm.NO_AGENTE;
            }
            
            if(vm.policyMail != undefined && vm.policyMail != '') {
            	vm.objPres.NO_EMAIL = vm.policyMail;
            }

        	vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.REQUISITOS_RENOVACION = vm.requisitoRenovacion;
            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR;

            //Si el asegurado es distinto al tomador
			if (vm.checkAseguradoEsTomador == false && vm.objAsegurado != null) {
				vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA = vm.objAsegurado;
				if (vm.addressAsegurado != null) {
	            	for (var campo in vm.addressAsegurado) {
	            		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PERSONA_ASEGURADA[campo] = vm.addressAsegurado[campo];
	            	}
	            }
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

            if (vm.opciones.fechaVencimiento != null) {
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

			if(vm.lstDomains) {
				vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.DOMINIOS = vm.lstDomains;
			}
            
            EmpresaService.contract(vm.objPres)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    if (response.data.CO_ESTADO == 1) {
                        
                        vm.objPres = response.data;
                        vm.step = 3;

                        //Si hemos emitido con una compañía ebroker, hacemos una petición con los datos añadidos de la correduría
                        if (vm.showEbroker == true) {
                        	vm.callEbroker();
                        }
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

        vm.checkPostal = function(code, obj) {
        	if (obj == null) {
        		obj = "address";
        	}
            if(code != undefined && code.length == 5) {

                EmpresaService.cities(code)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if(response.data != undefined && response.data.LOCALIDAD != undefined) {
                            if (response.data.LOCALIDAD.length > 1) {
                                LocalidadesService.elegirLocalidad(response.data.LOCALIDAD, vm[obj]);
                            } else {
                                vm[obj].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                            } 
                            vm[obj].NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                            vm[obj].NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                            vm[obj].CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;      
                            vm[obj].ID_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA != null ? parseInt(response.data.LOCALIDAD[0].CO_PROVINCIA) : null;      
                        } else {
                            // vm.msgWarning = response.data.msg;
                            
                        }
                    }
                }, function callBack(response) {
    				msg.textContent('No hemos podido verificar el código postal como válido. Por favor, revísalo');
    				$mdDialog.show(msg);
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
        
        vm.reset = function (changeGestor) {
        	if (changeGestor == true && vm.presupuestoSeleccionado != true) {
                vm.price = 0;
                vm.anualPrice = null;
                vm.budgetId = undefined;
                vm.sector = undefined;
                vm.amount = undefined
                vm.affiSector = [];
                vm.selActivities = [];
                vm.selAtks = [];
                vm.objPri = {};
                vm.addCCE = false;
                vm.objAgregados = {
    				LST_FRANQUICIAS: [{ NO_FRANQUICIA: "FRANQUICIA GENERAL" }]
        		}
        	}
			vm.objAutPer = null;

			if(vm.isBudgetImport === false) {
				vm.objHolder = null;
			}

			if (vm.showDocumento === true && vm.nuDocumento != null) {
				vm.objHolder = {
					NU_DOCUMENTO: vm.nuDocumento
				}
			}

        }

        vm.formatAmount = function(amount) {
        	if (amount != null && typeof amount == 'number') {
				amount = amount.toString();
			}
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
            if(form2Validate != null && form2Validate.$valid) {
                if(vm.step == 1) {
                	if (tarificar != false) {
                        vm.rateCompany();
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

        vm.modalPdf = function(id, opt, agregados) {
        	var modalTemplate = agregados == true ? "tarificador/tarificador.modal/descarga_agregados.modal.html" : "tarificador/tarificador.modal/descarga.modal.html"
            $mdDialog.show({
                templateUrl: BASE_SRC + modalTemplate,
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    vm.objCli = {}
                    md.budgetId = id;
                    md.mensaje = null;
                    md.type = "CBR";
                    md.objHolder = {};
                    md.objAutPer = {};
                    md.btnOpt = opt;
                    md.objAgregados = vm.objAgregados;
                    md.price = vm.tarifaAdhoc === 'adhoc' ? vm.formatPrice(vm.priceAdhoc) : vm.formatPrice(vm.price);
                    md.tarifaAdhoc = vm.tarifaAdhoc;
                    // md.checkFranquicia2 = vm.checkFranquicia2;
					md.isCambioSublimite = vm.isCambioSublimite;
					md.showCliente = false;
					md.tpRiesgos = vm.tpRiesgos;

                    md.$onInit = function() {
	                    if (vm.objHolder != null) {
	                    	md.objHolder = JSON.parse(JSON.stringify(vm.objHolder));
	                    }
	                    if (vm.objAutPer != null) {
	                    	md.objAutPer = JSON.parse(JSON.stringify(vm.objAutPer));
	                    }
						// if (vm.objPres && vm.objPres.PRESUPUESTO
						// 	&& vm.objPres.PRESUPUESTO.PECUNIARIAS
						// 	&& vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS
						// 	&& vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS.length > 0) {
						// 	var existeSublimite = false;
						// 	var objSublimite = vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS.find(x => x.SECTIONS != null && x.SECTIONS.length > 0);
						// 	if (objSublimite != null) {
						// 		setTimeout(function () {
						// 			// vm.objAgregados.SECCION_SELECCIONADA = objSublimite.SECTIONS[0].NO_SECCION;
						// 			// vm.objAgregados.LIMITE_SECCION = objSublimite.SECTIONS[0].NU_CAPITAL;
						// 			md.objAgregados = vm.objAgregados;
						// 			$scope.$apply();
						// 		}, 100);
						// 		md.isCambioSublimite = true;
						// 	}
						// }



						if (vm.objPres && vm.objPres.PRESUPUESTO && vm.objPres.PRESUPUESTO.PECUNIARIAS && vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR) {
							md.objHolder.NO_NOMBRE = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_NOMBRE;
							md.objHolder.NO_EMAIL = vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_EMAIL;
						}
                    }
                    
                    md.sendPdf = function(sendEmail) {
                    	if(md.formDownloadBudget.$valid) {

                    		vm.objHolder = JSON.parse(JSON.stringify(md.objHolder));
                    		vm.objAutPer = JSON.parse(JSON.stringify(md.objAutPer));
                    		
                    		if (vm.address == null) {
                    			vm.address = {};
                    		}
                    		
                    		vm.address.CO_POSTAL = vm.objHolder.CO_POSTAL;
                    		vm.NU_TELEFONO = vm.objHolder.NU_TELEFONO;
                    		
                            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = vm.objHolder;
                            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = vm.objHolder;
                            vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_AUTORIZADO = vm.objAutPer;

							vm.objPres.PRESUPUESTO.LIST_TARIFAS = [];

							var tarifa = {};
							if (vm.primas) {
								tarifa.IM_PRIMA_ANUAL =  vm.formatImporte(vm.primas.PRIMA_NETA);
								tarifa.IM_PRIMA_ANUAL_TOT  =  vm.formatImporte(vm.primas.PRIMA_TOTAL);
								tarifa.IM_FRANQUICIA  =  vm.formatImporte(vm.primas.FRANQUICIA);
								tarifa.IM_CLEA  =  vm.formatImporte(vm.primas.LEA);
								tarifa.IM_IPS  =  vm.formatImporte(vm.primas.IPS);
								tarifa.IM_REASEGURO = vm.formatImporte(vm.primas.PRIMA_REASEGURO);
							}

							vm.objPres.PRESUPUESTO.LIST_TARIFAS.push(tarifa);

							if (md.isCambioSublimite === true
								&& vm.objAgregados.SECCION_SELECCIONADA != null
								&& vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS != null) {

								md.objAgregados = vm.objAgregados;
								md.objAgregados.SECCION_SELECCIONADA = vm.objAgregados.SECCION_SELECCIONADA
								md.objAgregados.LIMITE_SECCION = vm.formatImporte(vm.objAgregados.LIMITE_SECCION)

								var index = vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS.findIndex(x => x.ID_GARANTIA == 54);
								if (index >= 0) {
									vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS = [];
									vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS.push(
										{
											NO_SECCION: md.objAgregados.SECCION_SELECCIONADA,
									        NU_CAPITAL: vm.formatImporte(md.objAgregados.LIMITE_SECCION)
										}
									)
								}
							}

							if (md.isCambioSublimite === false) {
								var index = vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS.findIndex(x => x.ID_GARANTIA == 54);
								if (index >= 0 && vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS != null) {
									vm.objPres.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS = null;
									md.objAgregados.SECCION_SELECCIONADA = null;
									md.objAgregados.NU_CAPITAL = null;
								}
							}

							if (vm.tarifaAdhoc === "adhoc") {

								vm.objPres.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS = []

								md.objAgregados.LST_FRANQUICIAS.forEach( function(valor, indice, array) {
									vm.objPres.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS.push(
										{
											NO_FRANQUICIA: valor.NO_FRANQUICIA.toUpperCase(),
											IMP_FRANQUICIA: vm.formatImporte(valor.IMP_FRANQUICIA)
										}
									)
								});
								vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.CO_TIPO_RIESGO = md.riesgo;
								vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.IN_POLIZA_CIBER_OTRA_ASEGURADORA = md.polizaOtraCia;

								vm.objAdhoc.PRESUPUESTO.PECUNIARIAS = JSON.parse(JSON.stringify(vm.objPres.PRESUPUESTO.PECUNIARIAS));
							}

							// vm.objPres.PRESUPUESTO.PECUNIARIAS.OBSERVACIONES = md.objAgregados.DS_OBSERVACIONES;

							// if (vm.tarifaAdhoc === "adhoc") {
							// 	if (md.objAgregados.LST_FRANQUICIAS != null) {
							// 		vm.objPres.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS = md.objAgregados.LST_FRANQUICIAS;
							// 	}
							// 	vm.primas.FRANQUICIA = vm.formatImporte(md.objAgregados.LST_FRANQUICIAS[0].IMP_FRANQUICIA);
							// 	if (vm.objPres.PRESUPUESTO.LIST_TARIFAS != null && vm.objPres.PRESUPUESTO.LIST_TARIFAS.length > 0) {
							// 		vm.objPres.PRESUPUESTO.LIST_TARIFAS[0].IM_FRANQUICIA = vm.formatAmount(md.objAgregados.LST_FRANQUICIAS[0].IMP_FRANQUICIA)
							// 	}
							// 	if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD.length > 0) {
							// 		vm.objPres.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA = vm.formatAmount(md.objAgregados.LST_FRANQUICIAS[0].IMP_FRANQUICIA)
							// 	}
							//
							// }
							md.loading = true;

                    		PresupuestoService.descargaPresupuesto(vm.objPres, sendEmail)
                            .then(function successCallback(data) {
                            	if (data.status === 200) {
    	                            let utf8decoder = new TextDecoder();
    	                            var mensajeUArchivo = utf8decoder.decode(data.data);
    	                            if(mensajeUArchivo.search('ID_RESULT') !== -1) {
    	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
    	                                if(objtMensajeUArchivo.ID_RESULT !== 0) {
    	                                	var msgError = "Vaya, ha ocurrido un error generando el presupuesto " + vm.objPres.ID_PRESUPUESTO + " en el sistema.";
    	                                	if (objtMensajeUArchivo.DS_RESULT != null) {
    	                                		msgError = objtMensajeUArchivo.DS_RESULT;
    	                                	}
    	                                    msg.textContent(msgError);
    	                                    $mdDialog.show(msg);
    	                                } else {
    	                                	if (sendEmail === true) {
												msg.textContent("¡Perfecto! Hemos enviado el presupuesto  " + vm.objPres.ID_PRESUPUESTO + " por email a " + vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_EMAIL.toLowerCase());
												$mdDialog.show(msg);
    	                                	}
										}
    	                            } else {
    	                            	if (sendEmail === true) {
											msg.textContent("¡Perfecto! Hemos enviado el presupuesto " + vm.objPres.ID_PRESUPUESTO + " por email a " + vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR.NO_EMAIL.toLowerCase());
											$mdDialog.show(msg);
    	                            	} else {
											saveAs(new Blob([data.data], { type: 'application/pdf' }), md.budgetId + '.pdf');
											$mdDialog.hide();
    	                            	}
    	                            }
                    			}
                            	
                                //Cargar localidad y provincia
                                if (vm.address.CO_POSTAL != null) {
                                    vm.checkPostal(vm.address.CO_POSTAL)
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

					if(vm.productoSeleccionado == null || vm.productoSeleccionado ==  undefined){
						vm.productoSeleccionado = vm.productoCiberSelected.ID_PRODUCTO;
					}

                    md.buscarCliente = function () {
                    	md.loadCliente = true;
						md.clienteEncontrado = null;
                    	ClienteService.getClienteProducto(vm.productoSeleccionado, { NU_DOCUMENTO: md.objHolder.NU_DOCUMENTO})
                        .then(function successCallback(data) {
							if(data != null && data.data.ID_RESULT != 0){
								md.loadCliente = false;
								md.clienteEncontrado = true;
								msg.textContent(data.data.DS_RESULT);
                                $mdDialog.show(msg);
							} else if(data != null && data.data.ID_RESULT == 0  && data.data.ID_CLIENTE == undefined){
								md.loadCliente = false;
								md.clienteEncontrado = false;
							} else if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
								md.clienteEncontrado = true;
                        		var cliente = data.data;
                        		md.objHolder.NO_NOMBRE = cliente.NO_NOMBRE;
                        		md.objHolder.NU_TELEFONO = cliente.NU_TELEFONO1;
                        		md.objHolder.NO_EMAIL = cliente.NO_EMAIL;

                        		if (cliente.LIST_DOMICILIOS != null && cliente.LIST_DOMICILIOS.length > 0 && cliente.LIST_DOMICILIOS[0].CO_POSTAL != null) {
                        		    md.objHolder.CO_POSTAL = cliente.LIST_DOMICILIOS[0].CO_POSTAL;
                        		}
                            	md.loadCliente = false;
                        	} else {
                            	md.loadCliente = false;
                        	}
							md.showCliente = true;
                        }, function callBack(response) {
                        	md.loadCliente = false;
                        });
                    }
                    
                    // md.changeCheckFranquicia2 = function () {
            		// 	if (md.checkFranquicia2 == false && vm.objAgregados.LST_FRANQUICIAS && vm.objAgregados.LST_FRANQUICIAS[1]) {
            		// 		md.objAgregados.LST_FRANQUICIAS[1].NO_FRANQUICIA = null;
            		// 		md.objAgregados.LST_FRANQUICIAS[1].IMP_FRANQUICIA = null;
            		// 	}
            		// 	vm.objAgregados = md.objAgregados;
            		// 	vm.checkFranquicia2 = md.checkFranquicia2;
            		// }
                    
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
                if(producto.ID_PRODUCTO != null && producto.ID_PRODUCTO == 6 && producto.IN_TARIFICA == true) {
                	colectivosTarificables.push(producto)
                }
            }
            return colectivosTarificables;
        }
        
        vm.changePartner = function () {
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
        	if (vm.idColectivo != null) {
            	vm.colectivo = productos.find(x => x.ID_TIPO_POLIZA == vm.idColectivo);
        	}
        }
        
        vm.showColectivos = function (tar) {
        	vm.showSelectColectivos = true;
            vm.colectivosHijo = [];
            var productos = JSON.parse(window.sessionStorage.perfil).productos;

    		var listProductos = [6, 5];
        	for(var i = 0; i < productos.length; i++) {
        		var producto = productos[i];
                if(producto.ID_PRODUCTO != null && listProductos.includes(producto.ID_PRODUCTO)) {
                	vm.colectivosHijo.push(producto);
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
        	if (vm.optionAdminSelected != 2 && vm.objPri != null && vm.objPri.turnover != null && vm.tpFacturacion != null) {
        		txt = vm.tpFacturacion.find(x => x.CO_TIPO == vm.objPri.turnover).DS_TIPOS;
        	} else if (vm.optionAdminSelected == 2) {
        		txt = vm.objPri.turnover;
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
        
        //Al clickar botón de superadmin
        vm.changeSuperAdmin = function () {
        	var perfil = null;
            vm.mediador = null;
        	if ($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				perfil = JSON.parse($window.sessionStorage.perfil);

				if (perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
					vm.mediador = {
						ID_COMPANIA: perfil.adicional.ID_COMPANIA,
						NO_COMPANIA: perfil.adicional.NO_COMPANIA
					}
				}
            }

        	vm.step = 1;
            vm.documentoValido = false;
            vm.nuDocumento = null;
            vm.idColectivo = null; 
        	vm.autocomplete = null;
        	vm.searchComisionista = null;
        	vm.searchGestor = null;
        	vm.nuAseguradosAdhoc = null;
        	vm.listAseguradosAdhoc = [];
        	vm.empresaAdmin = null;
        	vm.gestorAdmin = null;
        	vm.optionAdminSelected = null;
        	vm.mostrarTarificacionManual = false;
            vm.maxFacturacion = (vm.rol == 1 || vm.rol == 4 || vm.rol == 8) ? 999999999 : 31000000;
        	vm.mostrarAdmin = !vm.mostrarAdmin;
            vm.budgetId = null; 
            vm.objPres = {};
            vm.contractAdhoc = false;
            vm.addCodigoDescuento = null;
            vm.codigoDescuento = null;
            vm.idComisionista = null;
            vm.idUsuario = null;
            vm.activity = null;
            vm.affiSector = [];
            vm.amount = null;
            vm.sector = null;
            vm.selActivities = [];
            vm.objPri = null;
            vm.selAtks = null;
            vm.addCCE = false;
            vm.price = 0;
            vm.anualPrice = null;
            vm.amountCC = 0;
            vm.existenFilialesEspanolas = false;
    		vm.switchContratarPoliza = false;
    		vm.newSteps = [{ paso: 1, mostrar: true, añadido: false, extender: true }, { paso: 2, mostrar: false, añadido: false, extender: true }, { paso: 3, mostrar: false, añadido: false, extender: true }, { paso: 4, mostrar: false, añadido: false, extender: true }, { paso: 5, mostrar: false, añadido: false, extender: true }, { paso: 6, mostrar: false, añadido: false, extender: true }];
    		vm.stepsInfo = {datosEmpresa: { mostrar: true, anadido: false, extender: true },datosAutorizado: { mostrar: false, anadido: false, extender: true },asegurados: [],datosPago: { mostrar: false, anadido: false, extender: true },datosFechasGestor: { mostrar: false, anadido: false, extender: true }, documentos: { mostrar: false, anadido: false, extender: true },ebroker: { mostrar: false, anadido: false, extender: true },requisitosRenovacion: { mostrar: false, anadido: false, extender: true }}
    		vm.tarifaAdhoc = "auto";
    		vm.seccionesCobertura = {cobertura1: false,cobertura2: false,cobertura3: false,cobertura4: false};
    		vm.showBoxFinalizar = false;
    		vm.objEbroker = {};
    		vm.checkEmail = false;
    		vm.opciones = {};
    		vm.bankAccount = {};
    		vm.listAseguradosAdhoc = [];
    		vm.objAutPer = {};
    		vm.address = {};
    		vm.objHolder = {};
    		vm.modificarFechas = false;
    		vm.checkFecha = false;
    		vm.checkFechaVencimiento = false;
        }

        //Al cambiar a adhoc o 31-51M
        vm.changeOptionAdmin = function (option) {
    		vm.mostrarTarificacionNormal = false;
            vm.maxFacturacion = (vm.rol == 1 || vm.rol == 4 || vm.rol == 8) ? 999999999 : 31000000;
        	vm.optionAdminSelected = option;
            vm.budgetId = null; 
            vm.objPres = {};
            vm.contractAdhoc = false;
            vm.addCodigoDescuento = false;
            vm.codigoDescuento = null;
            vm.idComisionista = null;
            vm.cuponAplicado = false;
            vm.idUsuario = null;
            vm.activity = null;
            vm.affiSector = [];
            vm.amount = null;
            vm.sector = null;
            vm.selActivities = [];
            vm.objPri = null;
            vm.selAtks = null;
            vm.addCCE = false;
            vm.price = 0;
            vm.anualPrice = null;
            vm.amountCC = 0;
        	vm.mostrarTarificacionManual = true;
            
            if (option == 1) {
            	vm.mostrarTarificacionManual = false;
            }
        }
        
        vm.confirmarAdmin = function (tipo) {
        	if (tipo == 1) {
        		vm.mostrarTarificacionNormal = true;
        		vm.maxFacturacion = 999999999;
        	} else {
        		vm.mostrarTarificacionNormal = true;
        		vm.mostrarTarificacionManual = true;
        	}

        	if (vm.nuAseguradosAdhoc != null && vm.nuAseguradosAdhoc > 0) {
        		for (var i = 0; i < vm.nuAseguradosAdhoc; i++) {
        			vm.listAseguradosAdhoc.push({ NO_NOMBRE: null, NU_DOCUMENTO: null});
        		}
        	}
        	
        	//Añadir valor a las fechas
        	vm.opciones.fechaEfecto = vm.formatDateEmision(new Date());
        	
        	var fechaVencimiento = new Date();
        	fechaVencimiento = fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
        	vm.opciones.fechaVencimiento = vm.formatDateEmision(fechaVencimiento);
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
						if (valorSplit.length === 2 && valorSplit[1].length < 3) {
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
        
        vm.changePrimasAdmin = function (changePrima) {
        	vm.changePrimas = changePrima;
        	if (vm.primas == null) {
        		vm.primas = {};
        	}

			if(vm.budgetId && !vm.changePrimas){
				vm.isCalcula = true;
        		var primaNeta = vm.formatImporte(vm.primas.PRIMA_NETA);
        		// var primaNeta = (primaTotal100 * 2000)/2163;
        		var ipsValue = parseFloat(primaNeta * 0.08);
        		var leaValue = parseFloat(primaNeta*0.0015);
        		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
        		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
				var primaTotal = primaNeta + ips8+ lea;
        		var reaseguro = primaNeta*0.6;

        		vm.primas.PRIMA_NETA = vm.beautifyImporte(vm.formatImporte(vm.primas.PRIMA_NETA));
        		vm.primas.IPS = vm.beautifyImporte(ips8);
        		vm.primas.LEA = vm.beautifyImporte(lea);
        		vm.primas.FRANQUICIA = vm.beautifyImporte(0);
        		vm.primas.PRIMA_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));
        		vm.primas.PRIMA_REASEGURO = vm.beautifyImporte(reaseguro);
				vm.precalculada = true;
				
				if (vm.objAgregados != null
					&& vm.objAgregados.LST_FRANQUICIAS != null
					&& vm.objAgregados.LST_FRANQUICIAS.length > 0) {

					vm.primas.FRANQUICIA = vm.objAgregados.LST_FRANQUICIAS[0].IMP_FRANQUICIA;

				}
			} else {
        	
        	if (vm.primas.PRIMA_NETA != null && vm.primas.PRIMA_NETA !== "") {
				var confirm = $mdDialog.confirm()
            	.textContent("Está introduciendo la prima neta para el cálculo, ¿seguro que quiere continuar?")
            	.ok('Aceptar')
            	.cancel('Cancelar');

				$mdDialog.show(confirm).then(function () {
					$mdDialog.cancel();

        		vm.isCalcula = true;
        		var primaNeta = vm.formatImporte(vm.primas.PRIMA_NETA);
        		// var primaNeta = (primaTotal100 * 2000)/2163;
        		var ipsValue = parseFloat(primaNeta * 0.08);
        		var leaValue = parseFloat(primaNeta*0.0015);
        		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
        		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
				var primaTotal = primaNeta + ips8+ lea;
        		var reaseguro = primaNeta*0.6;

        		vm.primas.PRIMA_NETA = vm.beautifyImporte(vm.formatImporte(vm.primas.PRIMA_NETA));
        		vm.primas.IPS = vm.beautifyImporte(ips8);
        		vm.primas.LEA = vm.beautifyImporte(lea);
        		vm.primas.FRANQUICIA = vm.beautifyImporte(0);
        		vm.primas.PRIMA_TOTAL = vm.beautifyImporte(+(Math.round(primaTotal + "e+2")  + "e-2"));
        		vm.primas.PRIMA_REASEGURO = vm.beautifyImporte(reaseguro);
				vm.precalculada = true;
				
				if (vm.objAgregados != null
					&& vm.objAgregados.LST_FRANQUICIAS != null
					&& vm.objAgregados.LST_FRANQUICIAS.length > 0) {

					vm.primas.FRANQUICIA = vm.objAgregados.LST_FRANQUICIAS[0].IMP_FRANQUICIA;

				}

				}, function () {
					$mdDialog.cancel();
				});
        	} else {
			    msg.textContent("Rellena la prima bruta para poder realizar el cálculo de la prima neta e impuestos.")
			    $mdDialog.show(msg);
        	}

			}

            if (vm.tarifaAdhoc === 'adhoc') {
            	vm.rateAdhoc();
            }
        }
        
        vm.rateAdhoc = function() {
        	
        	if(vm.amountValue == undefined && vm.detalles != undefined && vm.detalles.PECUNIARIAS != undefined && vm.detalles.PECUNIARIAS.CIBERRIESGO != undefined 
        			&& vm.detalles.PECUNIARIAS.CIBERRIESGO.AMMOUNT != undefined )
        		vm.amountValue = vm.detalles.PECUNIARIAS.CIBERRIESGO.AMMOUNT;
        	
        	if (vm.objPri != null && vm.objPri.turnover != null && (vm.amount != null || vm.amountValue != null)) {
            	
        		if (vm.addCCE == true) {
                    vm.amountCC = '100.000 €';
                } else {
                	if (vm.tarifaAdhoc == 'adhoc' && vm.amountValue < 500000) {
	                    vm.amountCC = '25.000 €';
					} else if (vm.tarifaAdhoc != 'adhoc' && vm.amount.CO_TIPO <= 1) {
	                    vm.amountCC = '25.000 €';
					} else {
	                    vm.amountCC = '50.000 €';
					}
                }
        		
        		if(vm.autocomplete && vm.autocomplete.GESTOR && vm.autocomplete.GESTOR.NO_USUARIO){
        			usuarioPresu = vm.autocomplete.GESTOR.NO_USUARIO;
        		} else if (vm.detallesPresu){
        			usuarioPresu = vm.detallesPresu.NO_USU_ALTA;
        		} else if (vm.detalles){
        			usuarioPresu = vm.detalles.NO_USU_ALTA;
        		}
        		
            	var presu = {
    			  NO_USUARIO: usuarioPresu,
              	  ID_RAMO: 103,
              	  CO_PRODUCTO: vm.productoCiberSelected.CO_PRODUCTO,
				  ID_TIPO_COLECTIVO: vm.idColectivo,
              	  OPOLIZA: {
              	    CO_CANAL: '4'
              	  },
              	  PECUNIARIAS: {
              		CIBERRIESGO: {
            	        ID_FORMAPAGO: vm.formaPago,
              			ACTIVITY_CODE: vm.activity.CO_ACTIVIDAD,
						ACTIVITY_DESC: vm.activity.DS_ACTIVIDAD,
              			TURNOVER: vm.tarifaAdhoc == 'adhoc' ? vm.formatImporte(vm.objPri.turnover) : vm.objPri.turnover,
              			AMMOUNT_OPTION: vm.amountValue != null ? 4 : vm.amount.CO_TIPO,
              			LOSS_ATTACK_AMOUNT_OPTION: vm.objPri.lossAttackAmountOption,
              			CIBER_ATTACK_TYPES: vm.selAtks,
              			FILIAL_ACTIVITY_CODE: "",
    					AMMOUNT: vm.amountValue != null ? vm.formatImporte(vm.amountValue) : null
              	    },
          			LST_GARANTIAS: [
          				{
                            ID_GARANTIA: 52,
                            DS_GARANTIA_PRODUCTO: "RESPUESTA ANTE INCIDENTES INFORMATICOS",
                            NU_CAPITAL: vm.formatAmount(vm.tarifaAdhoc == 'adhoc' ? vm.amountValue : vm.amount.DS_TIPOS),
                            ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(52)
                        }, {
                        	DS_GARANTIA_PRODUCTO: "RESPONSABILIDAD CIVIL POR SEGURIDAD EN LAS REDES, Y PRIVACIDAD",
                        	ID_GARANTIA: 53,
                        	ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(53),
                        	NU_CAPITAL: vm.formatAmount(vm.tarifaAdhoc == 'adhoc' ? vm.amountValue : vm.amount.DS_TIPOS)
                        }, {
                        	DS_GARANTIA_PRODUCTO: "DAÑOS A LOS SISTEMAS e INTERRUPCIÓN DE NEGOCIO",
                        	ID_GARANTIA: 54,
                        	ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(54),
                        	NU_CAPITAL: vm.formatAmount(vm.tarifaAdhoc == 'adhoc' ? vm.amountValue : vm.amount.DS_TIPOS)
                        }, {
							DS_GARANTIA_PRODUCTO: "CIBERDELINCUENCIA",
							ID_GARANTIA: 55,
							ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(55),
							NU_CAPITAL: vm.formatAmount(vm.amountCC)
						}
                    ],
              	    DATOS_PAGO: {
              	      ID_FORMAPAGO: vm.formaPago,
              	      FD_INICIO: vm.getFdInicio()
              	    },
					OBSERVACIONES: vm.objAgregados.DS_OBSERVACIONES,
					OBSERVACIONES_ADHOC : vm.observacionesAdhoc,
              	  }
              	}

				if (vm.tarifaAdhoc === "adhoc") {
					presu.PECUNIARIAS.FRANQUICIAS = vm.objAgregados.LST_FRANQUICIAS;
					presu.CO_PRESUPUESTO = 'AD-HOC';
				}

	          	if (vm.cuponAplicado === true) {
	          		presu.PECUNIARIAS.DATOS_PAGO.PO_DESCUENTO = vm.codigoDescuento;
	          		presu.PECUNIARIAS.DATOS_PAGO.CO_DESCUENTO = vm.idDescuento;
	          	}

                if (vm.colectivo != null) {
                	presu.ID_MEDIADOR = vm.colectivo.ID_COMPANIA;
                }
            	
              	if (vm.showDocumento === true && vm.nuDocumento != null) {
              		presu.PECUNIARIAS.NU_DOCUMENTO = vm.nuDocumento;
              	}

                if(vm.addCCE === true) {
                	presu.PECUNIARIAS.LST_GARANTIAS.push({
                		ID_GARANTIA: 57,
                		ID_GARANTIA_PRODUCTO: vm.getIdGarantiaProducto(57),
                		IS_SELECTED: true,
                		NU_CAPITAL: vm.formatAmount(vm.amountCC)
                    })
                } else {
                    if(vm.addCCE == false) {
                        for(var i = 0; i < presu.PECUNIARIAS.LST_GARANTIAS.length; i++) {
                            if(presu.PECUNIARIAS.LST_GARANTIAS[i].ID_GARANTIA == 46) {
                                presu.PECUNIARIAS.LST_GARANTIAS.splice(i, 1);
                            }
                        }
                    }
                }

                if(vm.selActivities != undefined && vm.selActivities.length > 0) {
                    presu.PECUNIARIAS.CIBERRIESGO.FILIAL_ACTIVITY_CODE = vm.formatFilialActivities(vm.selActivities);
                }
                
                if(vm.idColectivo != null) {
                    presu.ID_TIPO_POLIZA = vm.idColectivo;
                }

            	vm.objAdhoc = {
                	PRESUPUESTO: presu
                }
            	
                if (vm.tarifaAdhoc == 'adhoc') {
                	return null;
                }

                vm.calc = true;
                vm.bloquearFranquicia = false;
                
                EmpresaService.rate(presu)
                .then(function successCallback(response) {
                    if(response.status == 200) {
                        if(response.data != undefined && response.data.ID_RESULT != 700) {
    						
                            vm.budgetId = response.data.ID_PRESUPUESTO;
                            
                            if (response.data.MODALIDADES != null && response.data.MODALIDADES.MODALIDAD != null && response.data.MODALIDADES.MODALIDAD[0] != null) {
                            	if (vm.formaPago == 7) {
                                    vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_TOT;
                                    vm.anualPrice = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                            	} else {
                                    vm.price = response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT;
                                    vm.anualPrice = null;
                            	}
                            	
                            	var primaBrutaAnual = vm.beautifyImporte(+(Math.round(response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL_TOT + "e+2")  + "e-2"));
                            	var primaNetaAnual = vm.beautifyImporte(+(Math.round(response.data.MODALIDADES.MODALIDAD[0].IM_PRIMA_ANUAL + "e+2")  + "e-2"));
                            	var ips = 0;
                            	var lea = 0;
                            	var franquicia = 0;
                            	
                            	if (response.data.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA != null) {
                            		franquicia = vm.beautifyImporte(+(Math.round(response.data.MODALIDADES.MODALIDAD[0].IM_FRANQUICIA + "e+2")  + "e-2"));
                            		vm.bloquearFranquicia = true;
                            	}
                            	
                            	if (response.data.MODALIDADES.MODALIDAD[0].IMPUESTOS != null && response.data.MODALIDADES.MODALIDAD[0].IMPUESTOS.IMPUESTOS != null && response.data.MODALIDADES.MODALIDAD[0].IMPUESTOS.IMPUESTOS.length > 0) {
                            		var impuestos = response.data.MODALIDADES.MODALIDAD[0].IMPUESTOS.IMPUESTOS;
                            		for (var i = 0; i < impuestos.length; i++) {
                            			if (impuestos[i].CO_IMPUESTO == "IPS") {
                            				ips = vm.beautifyImporte(+(Math.round(impuestos[i].IM_IMPUESTO + "e+2")  + "e-2"));
                            			}
                            			if (impuestos[i].CO_IMPUESTO == "LEA") {
                            				lea = vm.beautifyImporte(+(Math.round(impuestos[i].IM_IMPUESTO + "e+2")  + "e-2"));
                            			}
                            		}
                            	}
                            	
                            	vm.primas = {
                        			PRIMA_TOTAL: primaBrutaAnual,
                        			PRIMA_NETA: primaNetaAnual,
                        			FRANQUICIA: franquicia,
                        			IPS: ips,
                        			LEA: lea
                            	}
                            	
                            	vm.isCalcula = true;
                            }
                            
                            if (response.data.PRESUPUESTO != null && response.data.PRESUPUESTO.ID_PRESUPUESTO == null) {
                            	response.data.PRESUPUESTO.ID_PRESUPUESTO = vm.budgetId;
                            }
                            
                            vm.objPres = response.data;
                            vm.calc = false;
                            
                            if (vm.detalles == null && response.data.ID_RESULT == 6) {
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
    						if(response.data.ID_RESULT == 700) {
    							vm.isPrice = false;
    							vm.price = 0;
    							vm.budgetId = '';
    							msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
    						}
                        }
                    }
                }, function callBack(response) {
                    vm.calc = false;
					vm.price = 0;
					msg.textContent("Ha ocurrido un error al tarificar. Vuelva a intentarlo más tarde");
                    $mdDialog.show(msg);
                });
        	}
        }
        
        vm.changeDescuento = function () {
        	vm.codigoDescuento = null;
        	
        	if (vm.addCodigoDescuento == false) {
            	vm.cuponAplicado = false;
            	vm.idDescuento = null;
                vm.rateCompany();
        	}
        }
        
        vm.emitirAdhoc = function() {
        	let campo;
			let domicilio;
			let day;
        	let month;

        	if (vm.tarifaAdhoc !== "adhoc") {
				vm.contract();
				return null;
			}

			let fdInicio = new Date(new Date().setDate(new Date().getDate() + 1));
			let fdVencimiento = fdInicio;
			if (vm.opciones.fechaEfecto != null) {
				const fechaEfecto = new Date(vm.opciones.fechaEfecto);
				fdVencimiento = fechaEfecto;
				day = fechaEfecto.getDate();
				if (day < 10) {
                    day = "0" + day;
                }
				month = fechaEfecto.getMonth() + 1;
				if (month < 10) {
                    month = "0" + month;
                }
                fdInicio = fechaEfecto.getFullYear() + "-" + month + "-" + day;
            }

            if (vm.opciones.fechaVencimiento != null && vm.checkFechaVencimiento === true) {
				const fechaVencimiento = new Date(vm.opciones.fechaVencimiento);
				fdVencimiento = fechaVencimiento;
            	day = fechaVencimiento.getDate();
            	if (day < 10) {
            		day = "0" + day;
            	}
            	month = fechaVencimiento.getMonth() + 1;
            	if (month < 10) {
            		month = "0" + month;
            	}
            	fdVencimiento = fechaVencimiento.getFullYear() + "-" + month + "-" + day;
            }

            var compania = vm.listComisionistas.find(x => x.ID_COMPANIA === vm.idComisionista && x.NO_SELECCIONABLE !== true);
            var dsCompania = "";
            if (compania != null && compania.NO_COMPANIA != null) {
            	dsCompania = compania.NO_COMPANIA;
            }
            //Siel check de fecha vencimiento está marcado
            // var tipoPrima = "";
            // if (vm.checkFechaVencimiento === true) {
            // 	tipoPrima = "_PERIODO";
            // }
        	// vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.IM_PRIMA_NETA_RENOVACION = vm.formatImporte(vm.primas["PRIMA_NETA" + tipoPrima]);
			// vm.objAdhoc.OTARIFA = {
			// 	GARANTIAS: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS,
			// 	IM_PRIMA: 0,
			// 	IM_PRIMA_ANUAL: vm.formatImporte(vm.primas["PRIMA_TOTAL" + tipoPrima]) - (vm.formatImporte(vm.primas["PRIMA_TOTAL" + tipoPrima]) * 0.0754),
			// 	IM_PRIMA_ANUAL_TOT: vm.formatImporte(vm.primas["PRIMA_TOTAL" + tipoPrima]),
			// 	IM_PRIMA_ANUAL_VAT: (vm.formatImporte(vm.primas["PRIMA_TOTAL" + tipoPrima]) * 0.0754),
			// 	IM_PRIMA_RESTO: 0,
			// 	IM_PRIMA_RESTO_TOT: 0,
			// 	IM_PRIMA_RESTO_VAT: 0,
			// 	IM_PRIMA_TOT: 0,
			// 	IM_PRIMA_VAT: 0,
			// 	// IM_FRANQUICIA: vm.formatImporte(vm.primas["FRANQUICIA" + tipoPrima])
			// 	IM_FRANQUICIA: vm.formatImporte(vm.primas["FRANQUICIA"])
			// };

			if (vm.objAdhoc.PRESUPUESTO != null && vm.objAdhoc.PRESUPUESTO.PECUNIARIAS != null && vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO != null)
				vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.ID_FORMAPAGO = vm.formaPago;

			if(vm.lstDomains)
				vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.DOMINIOS = vm.lstDomains

			if(vm.requisitoRenovacion)
				vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.REQUISITOS_RENOVACION = vm.requisitoRenovacion;

			if(vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS != undefined){
				vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS.forEach( function(valor, indice, array) {
					valor.IMP_FRANQUICIA = vm.formatImporte(valor.IMP_FRANQUICIA)
				});
			}

        	var objEmision = {
				ID_PRESUPUESTO:	vm.objPres.ID_PRESUPUESTO,
				ID_COMP_RAMO_PROD: vm.productoCiberSelected.ID_PRODUCTO,
				NO_COMPANIA: dsCompania,
				ID_RAMO: 103,
				ID_PRODUCTO: vm.productoCiberSelected.ID_PRODUCTO,
				NO_PRODUCTO: vm.productoCiberSelected.NO_PRODUCTO,
				ID_FORMAPAGO: vm.formaPago,
				ID_TIPO_AGENTE: 602,
				ID_TIPO_MEDIO_PAGO: vm.tipoPagoAdhoc,
				ID_TIPO_POLIZA: vm.idColectivo,
				FD_INICIO: vm.formatDateEmision(fdInicio),
				FD_VENCIMIENTO: (vm.opciones.fechaVencimiento != null && vm.checkFechaVencimiento === true) ? fdVencimiento : vm.formatDateEmision(fdVencimiento.setFullYear(fdVencimiento.getFullYear()+1)),
				// IM_FRANQUICIA: vm.formatImporte(vm.checkFechaVencimiento === true ? vm.primas["FRANQUICIA_PERIODO"] :  vm.primas["FRANQUICIA"]),

				IM_PRIMA_NETA: vm.formatImporte(vm.checkFechaVencimiento === true ? vm.primas["PRIMA_NETA_PERIODO"] : vm.primas["PRIMA_NETA"]),
				IM_PRIMA_TOTAL: vm.formatImporte(vm.checkFechaVencimiento === true ? vm.primas["PRIMA_TOTAL_PERIODO"] : vm.primas["PRIMA_TOTAL"]),
				IM_IMPUESTOS: parseInt(vm.formatImporte(vm.checkFechaVencimiento === true ? vm.primas["IPS_PERIODO"] : vm.primas["IPS"])),
				IM_MIN_CTA: vm.formatImporte(vm.primas["PRIMA_REASEGURO"]),

				LST_ID_TIPO_POLIZA: [
					vm.idColectivo
				],
				IS_TACITA: vm.checkRenovacionTacita,
				CO_PRODUCTO: vm.productoCiberSelected.CO_PRODUCTO,
                CO_SITUA_RIESGO: vm.objHolder.NU_DOCUMENTO, 
                DS_SITUA_RIESGO: vm.objHolder.NU_DOCUMENTO + "|" + vm.objHolder.NO_NOMBRE,
				ID_MEDIADOR: vm.idComisionista,
				LST_GARANTIAS: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS,
				LST_ASEGURADOS: [],
				NO_USUARIO: vm.idUsuario, 
                NO_USU_ALTA: vm.idUsuario,
				IM_FRANQUICIA: (vm.tarifaAdhoc === 'adhoc') ? vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS[0].IMP_FRANQUICIA : vm.formatImporte(vm.primas["FRANQUICIA"]),
				JS_ENVIADO: JSON.stringify({
					CIBERRIESGO: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO,
					DATOS_AUTORIZADO: vm.objAutPer,
					DATOS_PAGADOR: vm.objHolder,
					DATOS_PAGO: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO,
					DATOS_PERSONA_ASEGURADA: (vm.checkAseguradoEsTomador === false && vm.objAsegurado != null) ? vm.objAsegurado : vm.objHolder,
					DATOS_TOMADOR: vm.objHolder,
					LST_GARANTIAS: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.LST_GARANTIAS,
					OBSERVACIONES: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.OBSERVACIONES,
					FRANQUICIAS: vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS,
					IM_PRIMA_RENOVACION: vm.formatImporte(vm.primas["PRIMA_NETA"]),
				})
            }

			if(vm.tarifaAdhoc === 'adhoc'){
				objEmision.IM_FRANQUICIA = vm.formatImporte(vm.objAdhoc.PRESUPUESTO.PECUNIARIAS.FRANQUICIAS[0].IMP_FRANQUICIA)
				objEmision.ID_PROGRAMA = vm.productoSeleccionado == 29 ? 18 : 2;
			}else{
				objEmision.IM_FRANQUICIA = vm.formatImporte(vm.primas["FRANQUICIA"])
			}

        	if (vm.tipoPagoAdhoc === 7) {
        		objEmision.CO_IBAN = vm.bankAccount.CO_IBAN;   
        		objEmision.CO_BIC = vm.bankAccount.CO_BIC;
        		objEmision.NO_TITULAR = vm.bankAccount.NO_TITULAR; 
        	}
            
            if (vm.address != null) {
            	vm.objHolder.LIST_DOMICILIOS = [];
            	domicilio = {};
            	for (campo in vm.address) {
            		domicilio[campo] = vm.address[campo];
            	}
            	vm.objHolder.LIST_DOMICILIOS.push(domicilio);
            }

            //AÑADIMOS LISTADE ASEGURADOS
            vm.objHolder.NO_APELLIDO1 = "";
            vm.objHolder.NU_TELEFONO1 = vm.NU_TELEFONO;
            vm.objHolder.ID_TIPO_CLIENTE = 3;
            vm.objHolder.DS_TIPO_CLIENTE = "Tomador";
            
            vm.objPagador = JSON.parse(JSON.stringify(vm.objHolder));
            vm.objPagador.ID_TIPO_CLIENTE = 1;
            vm.objPagador.DS_TIPO_CLIENTE = "Pagador";
            
            //Si el asegurado es distinto al tomador
            if (vm.checkAseguradoEsTomador === false && vm.objAsegurado != null) {
	            vm.objAsegurado = JSON.parse(JSON.stringify(vm.objAsegurado));
	            vm.objAsegurado.ID_TIPO_CLIENTE = 2;
	            vm.objAsegurado.DS_TIPO_CLIENTE = "Asegurado";
				if (vm.addressAsegurado != null) {
	            	vm.objAsegurado.LIST_DOMICILIOS = [];
					domicilio = {};
					for (campo in vm.addressAsegurado) {
	            		domicilio[campo] = vm.addressAsegurado[campo];
	            	}
	            	vm.objAsegurado.LIST_DOMICILIOS.push(domicilio);
	            }
			} else {
	            vm.objAsegurado = JSON.parse(JSON.stringify(vm.objPagador));
	            vm.objAsegurado.ID_TIPO_CLIENTE = 2;
	            vm.objAsegurado.DS_TIPO_CLIENTE = "Asegurado";
			}
            
            vm.objAutPer.DS_TIPO_CLIENTE = "Autorizado";
            vm.objAutPer.ID_TIPO_CLIENTE = 14;
            vm.objAutPer.NU_TELEFONO1 = vm.objAutPer.NU_TELEFONO;
            
            objEmision.LST_ASEGURADOS.push(vm.objHolder, vm.objPagador, vm.objAsegurado, vm.objAutPer);

            //Añadir los asegurados
            if (vm.listAseguradosAdhoc != null && vm.listAseguradosAdhoc.length > 0) {
            	for (var i = 0; i < vm.listAseguradosAdhoc.length; i++) {
                    var idAsegurado = 5 + i;
            		var asegurado = vm.listAseguradosAdhoc[i];
            		objEmision.LST_ASEGURADOS.push(
                        {
                            NO_NOMBRE: asegurado.NO_NOMBRE,
                            NU_DOCUMENTO: asegurado.NU_DOCUMENTO,
							ID_TIPO_CLIENTE: idAsegurado
                        }
            		);
            	}
            }
            
            vm.loading = true;

            PolizaService.altaPoliza(objEmision)
            .then(function successCallback(response) {
                if (response.status === 200) {
                    if (response.data.ID_RESULT === 0 && response.data.NU_POLIZA != null) {
                        
                        var datosTomador = null;
                        var datosAutorizado = null;
                        
                        if (response.data.LST_ASEGURADOS != null) {
                        	datosTomador = response.data.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE === 3);
                        	datosAutorizado = response.data.LST_ASEGURADOS.find(x => x.ID_TIPO_CLIENTE === 14);
                        	if (datosTomador != null && datosTomador.NU_TELEFONO1 != null) {
                        		datosTomador.NU_TELEFONO = datosTomador.NU_TELEFONO1;
                        		delete datosTomador.NU_TELEFONO1;
                        	}
                        	if (datosAutorizado != null && datosAutorizado.NU_TELEFONO1 != null) {
                        		datosAutorizado.NU_TELEFONO = datosAutorizado.NU_TELEFONO1;
                        		delete datosAutorizado.NU_TELEFONO1;
                        	}
                        }
                    	
                    	//Creamos el nuevo objeto
                        vm.objPres = {
                    		PRESUPUESTO: {
                    			PECUNIARIAS: {
                    				DATOS_PAGO: {
                    					FD_INICIO: response.data.FD_INICIO
                    				},
                    				DATOS_TOMADOR: datosTomador,
                    				DATOS_AUTORIZADO: datosAutorizado,
                                    LST_GARANTIAS: response.data.LST_GARANTIAS
                    			}
                    		},
                    		NU_POLIZA: response.data.NU_POLIZA,
                    		OTARIFA: {
                    			NO_PRODUCTO: response.data.NO_PRODUCTO,
                    			IM_PRIMA_ANUAL_TOT: response.data.IM_PRIMA_TOTAL
                    		}
                        };
                        
						if(response.data.ID_SITUAPOLIZA == 1){
							var email = "";
							if (vm.checkEmail == true && vm.emailAccept == true) {
								email = vm.opciones.email;
							} else {
								email = datosTomador.NO_EMAIL;
							}

							PolizaService.sendCondiciones(response.data.ID_POLIZA, email)
							.then(function successCallback(response){
								console.log("Condiciones ", response.data.DS_RESULT);
							},function(error) {
								console.log('Se ha producido un error al enviar las condiciones');
							});
						}
						
                        //Si hemos emitido con una compañía ebroker, hacemos una petición con los datos añadidos de la correduría                     
                        if (vm.showEbroker == true) {
                        	vm.callEbroker();
                        }
						
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
				msg.textContent('Se ha producido un error inesperado. Contacte con el administrador');
				$mdDialog.show(msg);
            });
        }
        
        vm.changeComisionista = function (getPresupuesto) {
            vm.loadGestores = true;
            vm.idUsuario = null;
            vm.searchGestor = null;
            vm.tipoMedioPago = null;
            var productos = JSON.parse(window.sessionStorage.perfil).productos;
            
            //Si venimos del listado de presupuestos, la primera vez no reseteamos datos
            if (vm.presupuestoSeleccionado != true && (vm.llave != "presupuesto" && vm.llave != "resumen" && vm.llave != "contratar") || (vm.changeComisionistaNumber > 0 && (vm.llave == "presupuesto" || vm.llave == "contratar" || vm.llave == "resumen"))) {
                vm.price = 0;
                vm.anualPrice = null;
                vm.budgetId = undefined;
                vm.sector = undefined;
                vm.amount = undefined
                vm.affiSector = [];
                vm.selActivities = [];
                vm.selAtks = [];
                vm.objPri = {};
                vm.addCCE = false;
            } else {
            	vm.changeComisionistaNumber = 1;
            }
            
            if (vm.autocomplete != null) {
            	vm.autocomplete.GESTOR = null;
            }

            if (vm.idComisionista != null && vm.listComisionistas != null) {
            	vm.mediador = productos.find(x => x.ID_COMPANIA == vm.idComisionista && x.ID_PRODUCTO == vm.productoSeleccionado);
	            // vm.mediador = vm.listComisionistas.find(x => x.ID_COMPANIA == vm.idComisionista);
				var inMediador = false;
                var objMediador = vm.listComisionistas.find(x => x.ID_COMPANIA == vm.idComisionista && x.NO_SELECCIONABLE != true);
				if (objMediador != null) {
					inMediador = objMediador.IN_COBRO_MEDIADOR;
				}
	            if(vm.mediador != undefined){
					vm.mediador.IN_COBRO_MEDIADOR = inMediador;
					vm.idColectivo = vm.mediador.ID_TIPO_POLIZA; 
	            	vm.colectivo = vm.mediador;
				} else {
					vm.mediador = {};
					vm.mediador.ID_COMPANIA = vm.idComisionista;
					vm.mediador.ID_PRODUCTO = vm.productoSeleccionado;
				}
            } else if (vm.idComisionista == null) {
            	vm.mediador = null;
	            vm.idColectivo = null; 
	            vm.colectivo = null;
            }
            
    		vm.showDocumentoFunction();
            
            if (vm.idComisionista != null) {
				if(vm.idComisionista != 81){
            	UsuarioWSService.getUserByCia(`${vm.idComisionista}?pr=6`)
                .then(function successCallback(response) {
                    vm.loadGestores = false;
                    if (response.status == 200) {
                    	vm.listUsers = [];
                    	if (response.data != null && response.data.USUARIOS != null) {
                        	vm.listUsers = response.data.USUARIOS;

							console.log("Gestores Recuperados > " + vm.listUsers)

                        	if (vm.detalles != null && vm.detalles.NO_USU_ALTA != null) {
                        		var gestorSeleccionado = vm.listUsers.find(x => x.NO_USUARIO === vm.detalles.NO_USU_ALTA);
								if (gestorSeleccionado != null) {
									if (vm.autocomplete == null) {
										vm.autocomplete = {};
									}
									vm.autocomplete.GESTOR = gestorSeleccionado;
									vm.idUsuario = gestorSeleccionado.NO_USUARIO;
									vm.changeGestor();
								}
                        	}
                        	
                        	if (getPresupuesto == true && vm.detallesPresu && vm.detallesPresu.ID_TIPO_COLECTIVO) {
                        		var gestorSeleccionado = vm.listUsers.find(x => x.NO_USUARIO == vm.detallesPresu.NO_USU_ALTA);
								if (gestorSeleccionado != null) {
									if (vm.autocomplete == null) {
										vm.autocomplete = {};
									}
									vm.autocomplete.GESTOR = gestorSeleccionado;
									vm.idUsuario = gestorSeleccionado.NO_USUARIO;
									vm.changeGestor();
								}
                        	}

                        	for (var i = 0; i < vm.listUsers.length; i++) {
                        		vm.listUsers[i].NO_SELECT = vm.listUsers[i].NO_NOMBRE + " " + vm.listUsers[i].NO_APELLIDO1 + " - " + vm.listUsers[i].NO_USUARIO;
                        	}
                        	
                        	if(vm.listUsers.length == 1){
                        		vm.autocomplete.GESTOR = vm.listUsers[0];
                        		vm.idUsuario = vm.listUsers[0].NO_NOMBRE.toUpperCase();
                        	}
                        	
                        	vm.nuAseguradosAdhoc;
                    	} 
                    }
                }, function callBack(response) {
                    vm.loadGestores = false;
                });
            	
            	AseguradoraService.getProductoByIdCompRamoProd(vm.mediador.ID_PRODUCTO)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	if (response.data != null) {
                        	vm.tipoMedioPago = response.data;
                    	} 
                    }
                }, function callBack(response) {
                    vm.loadGestores = false;
                });
			} else {
				
				vm.listUsers = [];
				vm.listUsers.push({NO_USUARIO: 'Helvetia', NO_NOMBRE: 'Helvetia', NO_APELLIDO1: 'Ciberempresas', NO_SELECT: 'Helvetia' + " " + 'Ciberempresas' + " - " + 'User'});
				if (vm.autocomplete == null) {
					vm.autocomplete = {};
				}
				vm.autocomplete.GESTOR = vm.listUsers[0];
				vm.idUsuario = vm.listUsers[0].NO_USUARIO;
				vm.loadGestores = false;
			}
            } else {
                vm.loadGestores = false;
            }
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
    	
    	vm.getUsuario = function (usuario) {
    		var text = "";
    		if (usuario != null) {
				text = usuario.NO_NOMBRE + " " + usuario.NO_APELLIDO1 + " - " + usuario.NO_USUARIO;
    		}
    		return text;
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
    	
		vm.aplicarDecuento = function (adhoc) {
			if (vm.tarifaAdhoc != 'adhoc') {
	    		if (vm.objPres != null && vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD[0] != null) {
	    			vm.objPres.OTARIFA = vm.objPres.MODALIDADES.MODALIDAD[0];
	    			
	    			if (vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.PECUNIARIAS != null && vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO != null) {
	    				vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.PO_DESCUENTO = vm.codigoDescuento;
	    				vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_PAGO.CO_DESCUENTO = vm.idDescuento;
	    			}
	    		}
	            vm.calcDescuento = true;
	    		
	    		EmpresaService.validaDescuento(vm.objPres)
	            .then(function successCallback(response) {
	                if(response.status == 200) {
	                    if(response.data != undefined && response.data.ID_RESULT == 0) {
	                        vm.cuponAplicado = true;
	                        // if (adhoc == true) {
	                        //     vm.rateAdhoc();
	                        // } else {
	                            vm.rateCompany();
	                        // }
	                    } else {
	        				msg.textContent(response.data.DS_RESULT);
	                        $mdDialog.show(msg);
	                    }
	                }
	                vm.calcDescuento = false;
	            }, function callBack(response) {
	                vm.calcDescuento = false;
	                if (response.status == 406 || response.status == 401) {
	                    // vm.parent.logout();
	                    // $location.path('/');
	                }
	            });
			} else {
                vm.cuponAplicado = true;
			}
    	}
		
		vm.isBancaMarch = function () {
			if (vm.perfil.adicional.ID_COMPANIA == 22 || vm.idComisionista == 22) {
		        return true;
			} else {
				return false;
			}
		}
		
		vm.changeCheckFdVencimiento = function () {
			if (vm.checkFechaVencimiento == true) {
				vm.opciones.fechaVencimiento = JSON.parse(JSON.stringify(vm.opciones.fechaEfecto));
			} else {
				vm.opciones.fechaVencimiento = null;
			}
		}
		
		vm.changeFechaVencimientoPolizaCheck = function () {
			var listPrimas = ["PRIMA_TOTAL", "PRIMA_NETA", "IPS", "LEA", "FRANQUICIA"];
			if (vm.checkFechaVencimiento == true) {
				//Añadimos a las primas periodo el mismo valor que las primas anuales
				for (var i = 0; i < listPrimas.length; i++) {
					vm.primas[listPrimas[i] + "_PERIODO"] = vm.primas[listPrimas[i]];
				}
			} else {
				//Eliminamos primas periodo
				for (var i = 0; i < listPrimas.length; i++) {
					vm.primas[listPrimas[i] + "_PERIODO"] = 0;
				}
				
				//Calculamos un año desde la fecha de entrada
	        	var fechaVencimiento = new Date(vm.opciones.fechaEfecto);
	        	fechaVencimiento = fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
	        	vm.opciones.fechaVencimiento = vm.formatDateEmision(fechaVencimiento);
	        	
	        	vm.calcularPrimasPeriodo();
			}
		}
		
		vm.calcularPrimasPeriodo = function () {
			var listPrimas = ["PRIMA_TOTAL", "PRIMA_NETA", "IPS", "LEA", "FRANQUICIA"];
			if (vm.opciones.fechaEfecto != null && vm.opciones.fechaVencimiento != null &&vm.primas != null && vm.primas.PRIMA_TOTAL != null) {
				//Calculamos los días de diferencia entre la fecha de vigor y la de vencimiento
				var fechaVigor = new Date(vm.opciones.fechaEfecto).getTime();
				var fechaVencimiento = new Date(vm.opciones.fechaVencimiento).getTime();
				
				var diasDiferencia = fechaVencimiento - fechaVigor;
				diasDiferencia = diasDiferencia/(1000*60*60*24);
				diasDiferencia = Math.ceil(diasDiferencia);
				
				if (diasDiferencia != null) {
					for (var i = 0; i < listPrimas.length; i++) {
						//Calculamos el valor de la prima periodo según los días
						vm.setPrimaPeriodo(vm.primas[listPrimas[i]], listPrimas[i], diasDiferencia);
					}
				}
			}
		}
		
		vm.setPrimaPeriodo = function (valorPrima, nombrePrima, dias) {
			//Según los días y el valor de la prima, calculamos la prima periodo
			if (valorPrima != null && nombrePrima != null && dias != null) {
				if (nombrePrima != "FRANQUICIA") {
					valorPrima = vm.formatImporte(valorPrima);
					var valorPrimaPeriodo = (valorPrima * dias)/365;
					if (valorPrimaPeriodo != null) {
						vm.primas[nombrePrima + "_PERIODO"] = vm.beautifyImporte(+(Math.round(valorPrimaPeriodo + "e+2")  + "e-2"));
					}
				} else {
					vm.primas[nombrePrima + "_PERIODO"] = vm.beautifyImporte(+(Math.round(valorPrima + "e+2")  + "e-2"));
				}
			}
		}
		
		vm.changeFechaVigor = function () {
			//Si la fecha de vencimiento es de un año, calculamos la fecha
			if (vm.checkFechaVencimiento != true) {
				//Calculamos un año desde la fecha de entrada
	        	var fechaVencimiento = new Date(vm.opciones.fechaEfecto);
	        	fechaVencimiento = fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
                vm.opciones.fechaVencimiento = vm.formatDateEmision(fechaVencimiento);
			    setTimeout( function () { 
				  if (vm.opciones != null && vm.opciones.fechaVencimiento != null) {
	                  vm.opciones.fechaVencimiento = new Date(vm.opciones.fechaVencimiento);
	                  $scope.$apply();
				  }
			    },500);
			} else {
				vm.calcularPrimasPeriodo();
			}
			vm.getMaxDateFdVencimiento();
		}
		
		vm.changeFechaVigorPolizaCheck = function () {
			if (vm.checkFecha == false) {
	        	//Añadir valor a las fechas
	        	vm.opciones.fechaEfecto = vm.formatDateEmision(new Date());
	        	
	        	if (vm.checkFechaVencimiento != true) {
		        	var fechaVencimiento = new Date();
		        	fechaVencimiento = fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
		        	vm.opciones.fechaVencimiento = vm.formatDateEmision(fechaVencimiento);
	        	} else {
	        		vm.calcularPrimasPeriodo();
	        	}
			}
		}
		
		vm.validarDocumento = function (keyEvent) {
			if (vm.nuDocumento != null && vm.nuDocumento != "" && (keyEvent == null || keyEvent.which == null || keyEvent.which == 13)) {
				vm.loadGestores = true;
				ClienteService.validaDocumento({ 'NU_DOCUMENTO': vm.nuDocumento })
				.then(function successCallback(response) {
					if(response.status == 200) {
						if(response.data.ID_RESULT != 103 && response.data.ID_RESULT != undefined) {
				        	vm.documentoValido = true;
		        			vm.disabledDocumento = true;

							if (vm.objHolder == null) {
								vm.objHolder = {};
							}
							vm.objHolder.NU_DOCUMENTO = vm.nuDocumento;
							
						} else {
				        	vm.documentoValido = false;
		        			msg.textContent("Rellene un documento válido");
		        			$mdDialog.show(msg);
						}
						vm.loadGestores = false;
					}
				}, function callBack(response) {
		        	vm.documentoValido = false;
	    			msg.textContent("Rellene un documento válido");
	    			$mdDialog.show(msg);
					vm.loadGestores = false;
				})
			}
		}
		
		vm.showDocumentoFunction = function () {
			if (vm.colectivo != null && vm.colectivosDocumento.includes(vm.colectivo.ID_TIPO_POLIZA.toString())) {
				vm.showDocumento = true;
			} else {
				vm.showDocumento = false;
			}
			vm.disabledDocumento = false;
		}
		
		vm.changeGestor = function () {
			if (vm.autocomplete != null && vm.autocomplete.GESTOR != null && vm.autocomplete.GESTOR.ID_TIPOCOLECTIVO != null && vm.autocomplete.GESTOR.ID_TIPOCOLECTIVO != vm.idColectivo) {
				vm.idColectivo = vm.autocomplete.GESTOR.ID_TIPOCOLECTIVO;
			}
		}
		
		vm.getDescriptivoCompania = function (item) {
			var text = "";
			if (item != null && item.ID_COMPANIA != null && vm.listComisionistas != null) {
				var comisionistasLength = vm.listComisionistas.filter(x => x.ID_COMPANIA == item.ID_COMPANIA).length;
				if (comisionistasLength > 1 && item.NO_SELECCIONABLE != true) {
					text = item.NO_COMPANIA + " (" + item.COLECTIVO + ")";
				} else {
					text = item.NO_COMPANIA;
				}
			}
			return text;
		}
		

		//Comprobamos si el bloque de la parte de tarificación se puede mostrar
		vm.mostrarPaso = function (paso) {
			var mostrar = false;
			var pasoObj = vm.newSteps.find(x => x.paso == paso);
			
			if (pasoObj.mostrar == true || pasoObj.añadido == true) {
				mostrar = true
			}

			return mostrar;
		}

		//Comprobamos si el bloque de la parte de tarificación se ha confirmado
		vm.pasoAnadido = function (paso) {
			var anadido = false;
			var pasoObj = vm.newSteps.find(x => x.paso == paso);
			
			if (pasoObj.añadido == true) {
				anadido = true
			}

			return anadido;
		}

		//Comprobamos si el bloque de la parte de tarificación se ha confirmado
		vm.pasoExtender = function (paso) {
			var extender = false;
			var pasoObj = vm.newSteps.find(x => x.paso == paso);
			
			if (pasoObj.extender == true) {
				extender = true
			}

			return extender;
		}
		
		vm.extenderPaso = function (paso, extender) {
			var pasoObj = vm.newSteps.find(x => x.paso == paso);
			
			pasoObj.extender = extender;

			return extender;
		}
		
		vm.getSumaAsegurada = function (suma) {
			if (vm.mostrarTarificacionManual == true && vm.amountValue != null) {
				return vm.amountValue + " €";
			} else return suma;
		}
        
		vm.changeProductoAdhoc = function (cargarTpAmount) {
			if (vm.productoSeleccionado != null) {
				vm.productoCiberSelected = {
					CO_PRODUCTO: vm.productoSeleccionado == 6 ? "CBEMP-INDEP" : vm.productoSeleccionado == 5 ? "CBEMP-AGREG" : "CBEMP-HREA",
					ID_PRODUCTO: vm.productoSeleccionado == 6 ? 6 : vm.productoSeleccionado == 5 ? 5 : 29,
					NO_PRODUCTO: vm.productoSeleccionado == 6 ? "CiberSeguro Telefónica" : vm.productoSeleccionado == 5 ? "CiberSeguro Empresa límites agregados" : "Ciberempresas Helvetia",
				}

				ComisionService.getComisionistasProducto({"ID_COMP_RAMO_PROD": vm.productoSeleccionado, "CO_TIPO_COMISION": "MD", 'IS_SELECTED': true})
				.then(function successCallback(response) {
					if (response.status == 200) {
						vm.listComisionistas = [];
						if (vm.productoSeleccionado == 29 || (response.data != null && response.data.COMISIONISTASPROD != null && response.data.COMISIONISTASPROD.COMISIONISTAPROD != null)) {
							if(vm.productoSeleccionado == 29){
								vm.listComisionistas = [];
								vm.listComisionistas.push({ID_COMPANIA: 81, NO_COMPANIA: '--SIN MEDIADOR--', ID_PRODUCTO: 29, ID_COMP_RAMO_PROD: 29, ID_TIPO_POLIZA: 1500, IN_COBRO_MEDIADOR: false, NO_SELECCIONABLE: true});
								vm.mediador = vm.listComisionistas[0];
							} else {
								vm.listComisionistas = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
							// vm.listComisionistas.unshift({NO_COMPANIA: '--SIN MEDIADOR--', ID_COMPANIA: 4});
							}
							for (let i = 0; i < vm.listComisionistas.length; i++) {
								if(vm.listComisionistas[i].ID_COMPANIA == 4) {
									vm.listComisionistas.unshift(JSON.parse(JSON.stringify(vm.listComisionistas[i])));
									vm.listComisionistas[0].NO_COMPANIA = '--SIN MEDIADOR--';
									vm.listComisionistas[0].NO_SELECCIONABLE = true;
									break;
								}
							}

							if (vm.listComisionistas != null && vm.listComisionistas.length == 1) {
								if (vm.autocomplete == null) {
									vm.autocomplete = {};
								}
								vm.autocomplete.COMISIONISTA = vm.listComisionistas[0];
								vm.idComisionista = vm.autocomplete.COMISIONISTA.ID_COMPANIA;
								vm.changeComisionista();
								
							}else if (vm.detallesPresu != undefined && vm.detallesPresu.ID_MEDIADOR != undefined  && vm.listComisionistas && vm.listComisionistas.length > 0) {
								vm.completeComisionista();
							}

							if (vm.detalles != null && vm.detalles.ID_TIPO_COLECTIVO != null) {
								var comisionistaSeleccionado = vm.listComisionistas.find(x => x.ID_TIPOCOLECTIVO == vm.detalles.ID_TIPO_COLECTIVO);
								
								if (comisionistaSeleccionado != null) {
									if (vm.autocomplete == null) {
										vm.autocomplete = {};
									}
									vm.autocomplete.COMISIONISTA = comisionistaSeleccionado;
									vm.idComisionista = comisionistaSeleccionado.ID_COMPANIA;

									//Cuando no le mostramos a un usuario el select de gestores
									//Llamamos a la función de changeComisionista, ya que en un usuario con posibilidad de seleccionar gestores se llama automáticamente a esa función, pero como estos usuarios no tienen ese select, no hace nada 
									if (vm.optionAdminSelected != 2 && vm.rol != 1 && vm.rol != 4 && vm.rol != 8 && vm.showSelectColectivos != true) {
										vm.changeComisionista();
									}
								}
							} else {
								//Rellenamos el objeto vm.mediador con más datos,  como IN_COBRO_MEDIADOR
								var productos = JSON.parse(window.sessionStorage.perfil).productos;
								
								if (productos != null && vm.mediador != null) {
									vm.mediador = productos.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.ID_PRODUCTO == vm.productoSeleccionado);
									var inMediador = false;
									var objMediador = vm.listComisionistas.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.NO_SELECCIONABLE != true);
									if (objMediador != null) {
										inMediador = objMediador.IN_COBRO_MEDIADOR;
									}
									vm.mediador.IN_COBRO_MEDIADOR = inMediador;
									vm.idColectivo = vm.mediador.ID_TIPO_POLIZA; 
									vm.colectivo = vm.mediador;
									vm.showDocumentoFunction();
								}
							}
						}
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});

				if(vm.productoSeleccionado == 29){
					vm.tarifaAdhoc = "adhoc";
				} else {
					vm.tarifaAdhoc = "auto";
				}	

				if (cargarTpAmount === true) {
					vm.getListTpAmount();
				}
			}
		}
		
		//Función que llamamos al pasar al siguiente paso en la parte de tarificación
		vm.siguientePaso = function (paso) {
			switch (paso) {
			  case 1:
				  if (vm.productoSeleccionado == null || vm.productoSeleccionado == false) {
        			  msg.textContent("Selecciona un producto antes de continuar");
        			  $mdDialog.show(msg);
        			  return null;
				  }
				  break;
			  case 2:
				  if (vm.formPaso2 != undefined && vm.formPaso2.$invalid == true) {
					  msg.textContent("Paso 2: Rellene todos los datos obligatorios")
					  $mdDialog.show(msg);
	                  var objFocus = angular.element('#formPaso2 .ng-empty.ng-invalid-required:visible');
	                  if(objFocus != undefined) {
	                      objFocus.focus();
	                  }
	    			  return null;
	    		  }
				  vm.scrollTo('formPaso3');
				  
				  //Comprobamos si se ha elegido una compañía de ebroker
				  if (vm.mediador.ID_COMPANIA == 8 || vm.mediador.ID_COMPANIA == 20 || vm.mediador.ID_COMPANIA == 17) {
					  vm.showEbroker = true;
					  // vm.tarifaAdhoc = 'adhoc';
				  } else {
					  vm.showEbroker = false;
				  }
				  break;
			  case 3:
				  if (vm.formPaso3 != undefined && vm.formPaso3.$invalid == true) {
					  msg.textContent("Paso 3: Rellene todos los datos obligatorios")
					  $mdDialog.show(msg);
	                  var objFocus = angular.element('#formPaso3 .ng-empty.ng-invalid-required:visible');
	                  if(objFocus != undefined) {
	                      objFocus.focus();
	                  }
	    			  return null;
	    		  }
				  vm.scrollTo('formPaso4');
				  break;
			  case 4:
				  if (vm.formPaso4 != undefined && vm.formPaso4.$invalid == true) {
					  msg.textContent("Paso 4: Rellene todos los datos obligatorios")
					  $mdDialog.show(msg);
	                  var objFocus = angular.element('#formPaso4 .ng-empty.ng-invalid-required:visible');
	                  if(objFocus != undefined) {
	                      objFocus.focus();
	                  }
	    			  return null;
	    		  }
				  
				  if (vm.rol == 1 || vm.rol == 4 || vm.rol == 8) {
				      vm.minDate = new Date(vm.minDate.setDate(vm.minDate.getDate() - 7));
				  } else {
				      vm.minDate = new Date();
				  }
				  
				  vm.scrollTo('formPaso5');
				  break;
			  case 5:
				  if (vm.formPaso5.$invalid == true) {
					  msg.textContent("Paso 5: Rellene todos los datos obligatorios")
					  $mdDialog.show(msg);
	                  var objFocus = angular.element('#formPaso5 .ng-empty.ng-invalid-required:visible');
	                  if(objFocus != undefined) {
	                      objFocus.focus();
	                  }
	    			  return null;
	    		  } else if (vm.checkAceptaPrimas != true) {
					  msg.textContent("Debes aceptar el check para confirmar que has comprobado las primas, impuestos y franquicia añadidas")
					  $mdDialog.show(msg);
	    			  return null;
	    		  }
				  vm.scrollTo('formPaso6');

				  if (vm.opciones == null) {
					  vm.opciones = {};
				  }
				  
				  if (vm.opciones.fechaEfecto == null) {
				  	  vm.opciones.fechaEfecto = new Date();
				  }  
				
	        	  var fechaVencimiento = new Date(vm.opciones.fechaEfecto);
	        	  fechaVencimiento = fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
	        	  vm.opciones.fechaVencimiento = vm.formatDateEmision(fechaVencimiento);
            	  
				  break;
			  case 6:
				  if (vm.formPaso6.$invalid == true) {
					  msg.textContent("Paso 6: Rellene todos los datos obligatorios")
					  $mdDialog.show(msg);
	                  var objFocus = angular.element('#formPaso6 .ng-empty.ng-invalid-required:visible');
	                  if(objFocus != undefined) {
	                      objFocus.focus();
	                  }
	    			  return null;
	    		  } else if (vm.checkFechaVencimiento == true && vm.checkAceptaPrimasPeriodo != true) {
					  msg.textContent("Debes aceptar el check para confirmar que has comprobado las primas, impuestos y franquicia añadidas")
					  $mdDialog.show(msg);
	    			  return null;
	    		  } 
	    		//   else if (vm.modificarFechas == true) {
	    		// 	  var fechaEfecto = new Date(vm.opciones.fechaEfecto);
	    		// 	  var fechaVencimiento = new Date(vm.opciones.fechaVencimiento);
	    			  
	    		// 	  if (fechaEfecto.getDate() == fechaVencimiento.getDate() && fechaEfecto.getMonth() == fechaVencimiento.getMonth() && (fechaEfecto.getFullYear()+1) == fechaVencimiento.getFullYear()) {
				// 		//   msg.textContent("Has establecido una fecha de vencimiento personalizada pero el periodo de vigencia final no es menor a 1 año. Si la vigencia que deseas es anual, por favor, desactiva la opción seleccionada.")
						  
				// 		  $mdDialog.show(
				// 			  $mdDialog.alert()
				// 			  .htmlContent('<p>Has establecido una fecha de vencimiento personalizada pero el periodo de vigencia final no es menor a 1 año. Si la vigencia que deseas es anual, por favor, desactiva la opción seleccionada.</p>')
				// 			 .ok('Aceptar')
				// 		  );
		    	// 		  return null;
	    		// 	  }
	    		//   }
				  vm.scrollTo('formPasoDatosEmpresa');
				  break;
			}

			
			if (paso < 6) {
				vm.newSteps[paso - 1].añadido = true;
				vm.newSteps[paso - 1].extender = false;
				vm.newSteps[paso].mostrar = true;
			} else {
				//Si ya se han terminado todos los pasos de la contratación
				//Pasamos a los datos de contratación
				vm.newSteps[paso - 1].añadido = true;
				vm.newSteps[paso - 1].extender = false;
				vm.step = 2;
				vm.stepsInfo.asegurados = [];
				//Para los asegurados, existe el array 'asegurados', en el que dentro, meteremos cada objeto de asegurado con su 'mostrar' y 'anadido'
				if (vm.nuAseguradosAdhoc > 1) {
					for (var i = 0; i < vm.nuAseguradosAdhoc-1; i++) {
						vm.stepsInfo.asegurados.push({asegurado: i+1, mostrar: false, anadido: false, extender: true});
					}
				}
			}
		}

		//Comprobamos si el bloque de la parte de contratación se puede mostrar
		vm.mostrarPasoEmision = function (paso, indexAsegurado) {
			var mostrar = false;
			var pasoObj;
			
			if (paso != 'datosAsegurado') {
				pasoObj = vm.stepsInfo[paso];
			} else {
				pasoObj = vm.stepsInfo.asegurados[indexAsegurado];
			}

			if (pasoObj && (pasoObj.mostrar == true || pasoObj.añadido == true)) {
				mostrar = true
			}
			
			return mostrar;
		}
		
		//Comprobamos si el bloque de la parte de contratación está confirmado
		//Si está confirmado, mostramos y deshabilitamos ese paso
		vm.pasoAnadidoEmision = function (paso, indexAsegurado) {
			var anadido = false;
			var pasoObj = null;
			
			if (paso != 'datosAsegurado') {
				pasoObj = vm.stepsInfo[paso];
			} else {
				pasoObj = vm.stepsInfo.asegurados[indexAsegurado];
			}
			
			if (pasoObj.anadido == true) {
				anadido = true
			}

			return anadido;
		}
		
		//Comprobamos si el bloque de la parte de contratación está confirmado
		//Si está confirmado, mostramos y deshabilitamos ese paso
		vm.pasoExtenderEmision = function (paso, indexAsegurado) {
			var extender = false;
			var pasoObj = null;
			
			if (paso != 'datosAsegurado') {
				pasoObj = vm.stepsInfo[paso];
			} else {
				pasoObj = vm.stepsInfo.asegurados[indexAsegurado];
			}
			
			if (pasoObj.extender == true) {
				extender = true;
			}

			return extender;
		}
		
		//Comprobamos si el bloque de la parte de contratación está confirmado
		//Si está confirmado, mostramos y deshabilitamos ese paso
		vm.extenderPasoEmision = function (paso, extender, indexAsegurado) {
			var pasoObj = null;
			
			if (paso != 'datosAsegurado') {
				pasoObj = vm.stepsInfo[paso];
			} else {
				pasoObj = vm.stepsInfo.asegurados[indexAsegurado];
			}
			
			pasoObj.extender = extender;
		}
		
		//Función que se llama al darle a 'anterior' en los bloques de la tarificación
		vm.anteriorPaso = function (paso) {
			
			//Según el paso en el que estemos, reseteamos los datos de ese paso
			switch (paso) {
			  case 2:
				  vm.nuAseguradosAdhoc = 0;
				  vm.idComisionista = null;
				  vm.searchComisionista = "";
				  vm.autocomplete.COMISIONISTA = null;
				  vm.searchGestor = "";
				  vm.autocomplete.GESTOR = null;
				  vm.idUsuario = null;
				  vm.nuDocumento = null;
				  break;
			  case 3:
				  if (vm.presupuestoSeleccionado != true) {
					  vm.sector = null;
					  vm.activity = null;
					  vm.affiSector = null;
					  vm.selActivities = null;
					  vm.objPri.lossAttackAmountOption = null;
					  vm.selAtks = null;
				  }
				  break;
			  case 4:
				  vm.bloquearFranquicia = false;
				  
				  if (vm.mediador.ID_COMPANIA == 8 || vm.mediador.ID_COMPANIA == 20 || vm.mediador.ID_COMPANIA == 17) {
					  vm.tarifaAdhoc = 'adhoc';
				  } else {
					  vm.tarifaAdhoc = 'auto';
				  }
				  
				  vm.codigoDescuento = null;
				  vm.cuponAplicado = false;
				  vm.idDescuento = null;
				  vm.addDescuento = false;
				  if (vm.presupuestoSeleccionado != true) {
	                  vm.budgetId = null; 
	                  vm.objPres = {};
					  vm.price = 0;
	                  vm.anualPrice = null;
					  vm.objPri.turnover = null;
					  vm.amount = null;
					  vm.addCCE = false;
				  }
				  break;
			  case 5:
				  if (vm.tarifaAdhoc == 'adhoc') {
					  vm.isCalcula = false;
					  if(vm.budgetIdAgregados == null){
						if (vm.presupuestoSeleccionado != true) {
							// vm.objPri.turnover = null;
							// vm.amount = null;
							// vm.amountValue = null;
							vm.primas = {};
						}
						// vm.objAgregados = {
						// 	LST_FRANQUICIAS: [{ NO_FRANQUICIA: "FRANQUICIA GENERAL", IMP_FRANQUICIA: 0 }]
						// };
					  }
					  vm.budgetIdAgregados = null;
					  vm.priceAdhoc = 0;
					//   vm.checkFranquicia2 = false;
					  vm.precalculada = false;
				  }
				  vm.checkAceptaPrimas = false;
				  break;
			  case 6:
				  vm.modificarFechas = false;
				  vm.checkFecha = false;
				  vm.changeFechaVigorPolizaCheck();
				  vm.checkFechaVencimiento = false;
				  vm.changeFechaVencimientoPolizaCheck();
				  vm.checkAceptaPrimasPeriodo = false;
				  break;
			}
			vm.newSteps[paso - 1] = { paso: paso, añadido: false, mostrar: false, extender: true };
			vm.newSteps[paso - 2] = { paso: paso - 1, añadido: false, mostrar: true, extender: true };
		}
		
		vm.getMaxDateFdVencimiento = function () {
			vm.maxDateVencimiento = new Date('4999-01-01');
			if (vm.opciones != null && vm.opciones.fechaEfecto != null) {
				var fechaEfecto = new Date(vm.opciones.fechaEfecto);
				vm.maxDateVencimiento = new Date(fechaEfecto.setFullYear(fechaEfecto.getFullYear() + 1));
			}
		}
		
		//Función cuando pasamos de bloque en el paso de rellenar datos
		vm.siguienteInfo = function (form, paso, indexAsegurado) {
			//Primero comprobamos si el formulario que hemos confirmado es válido o falta por rellenar algún dato
			//Si falta algún dato por rellenar, mostramos mensaje
			if (vm[form].$invalid == true) {
				  msg.textContent("Paso " + paso + ": Rellene todos los datos obligatorios")
				  $mdDialog.show(msg);
                var objFocus = angular.element('#' + form + ' .ng-empty.ng-invalid-required:visible');
                if(objFocus != undefined) {
                    objFocus.focus();
                }
  			  return null;
  		  	}
			
			//Cuando cambiemos de paso, al sigueinte objeto del formulario le añadimos el campo 'mostrar' a true y 'anadido' a false
			//Esto significa que si mostrar es true, se mostrará el formulario; si anadido es true, significa que ese bloque ya ha sido confirmado
			switch (paso) {
				case 'datosEmpresa':
					vm.stepsInfo.datosEmpresa = { mostrar: true, anadido: true, extender: false };
					vm.stepsInfo.datosAutorizado = { mostrar: true, anadido: false, extender: true };
					
					if (vm.objAutPer == null) {
						vm.objAutPer = {};
					}
					
					if (vm.objHolder != null) {
						vm.objAutPer.NO_EMAIL = vm.objHolder.NO_EMAIL;
					}
						
					if (vm.NU_TELEFONO != null) {
						vm.objAutPer.NU_TELEFONO = vm.NU_TELEFONO;
					}
					
					vm.scrollTo('formPasoDatosAutorizado');
					break;
				case 'datosAutorizado':
					if (vm.stepsInfo.asegurados != null && vm.stepsInfo.asegurados.length > 0) {
						vm.stepsInfo.asegurados[0] = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formPasoDatosAsegurado1');
					} else {
						vm.stepsInfo.datosPago = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formPasoDatosPago');
					}
					vm.stepsInfo.datosAutorizado = { mostrar: true, anadido: true, extender: false };

					if (vm.mediador.IN_COBRO_MEDIADOR != true || vm.loadTemplateAdhoc == true) {
						if (vm.bankAccount == null) {
							vm.bankAccount = {};
						}
						vm.bankAccount.NO_TITULAR = vm.objHolder.NO_NOMBRE;
					}
					break;
				case 'datosAsegurado':
					vm.stepsInfo.asegurados[indexAsegurado] = { mostrar: true, anadido: true, extender: false };
					//Comprobamos si hay más asegurados añadidos
					if (vm.stepsInfo.asegurados[indexAsegurado+1] != null) {
						vm.stepsInfo.asegurados[indexAsegurado+1] = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formPasoDatosAsegurado' + (indexAsegurado+1));
					} 
					//Si no hay más asegurados, mostramos el bloque de datos de pago
					else {
						vm.stepsInfo.datosPago = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formPasoDatosPago');
					}
					break;
				case 'datosPago':
					if (vm.loadTemplateAdhoc == false) {
						vm.stepsInfo.datosFechasGestor = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formFechasGestor');
					} else {
						vm.stepsInfo.documentos = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formPasoDocumentos');
					}
					vm.stepsInfo.datosPago = { mostrar: true, anadido: true, extender: false };
					break;
				case 'datosFechasGestor':
					vm.stepsInfo.documentos = { mostrar: true, anadido: false, extender: true };
					vm.stepsInfo.datosFechasGestor = { mostrar: true, anadido: true, extender: false };
					vm.scrollTo('formPasoDocumentos');
					break;
				case 'documentos':
					vm.stepsInfo.documentos = { mostrar: true, anadido: true, extender: false };
					
					/*
					//Si se ha seleccionado correduría de ebroker, mostramos bloque de ebroker
					if (vm.showEbroker == true) {
						vm.scrollTo('formPasoEbroker');
						vm.stepsInfo.ebroker = { mostrar: true, anadido: false, extender: true };
					} else if (vm.isAdhoc == true) {
						vm.stepsInfo.requisitosRenovacion = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formRequisitosRenovacion');
					} else if (vm.isAdhoc == false) {
						//Mostramos botón para finalizar contratación
						vm.showBoxFinalizar = true;
						vm.scrollTo('box-button-Contratar');
					}
					*/
					if(vm.isAdhoc) {
						if (vm.showEbroker == true) {
							vm.scrollTo('formPasoEbroker');
							vm.stepsInfo.ebroker = { mostrar: true, anadido: false, extender: true };
						} else {
							vm.stepsInfo.requisitosRenovacion = { mostrar: true, anadido: false, extender: true };
							vm.scrollTo('formRequisitosRenovacion');
						}
					} else {
						vm.stepsInfo.dominios = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formDominios');
					}
					break;
				case 'dominios':
					vm.stepsInfo.dominios = { mostrar: true, anadido: true, extender: false };
					
					//Si se ha seleccionado correduría de ebroker, mostramos bloque de ebroker
					if (vm.showEbroker == true) {
						vm.scrollTo('formPasoEbroker');
						vm.stepsInfo.ebroker = { mostrar: true, anadido: false, extender: true };
					} else {
						//Mostramos botón para finalizar contratación
						vm.showBoxFinalizar = true;
						vm.scrollTo('box-button-Contratar');
					}
					break;
				case 'ebroker':
					vm.stepsInfo.ebroker = { mostrar: true, anadido: true, extender: false };

					if (vm.isAdhoc == true) {
						vm.stepsInfo.requisitosRenovacion = { mostrar: true, anadido: false, extender: true };
						vm.scrollTo('formRequisitosRenovacion');
					} else {
						//Mostramos botón para finalizar contratación
						vm.showBoxFinalizar = true;
						vm.scrollTo('box-button-Contratar');
					}
					break;
				case 'requisitosRenovacion':
					vm.stepsInfo.requisitosRenovacion = { mostrar: true, anadido: true, extender: false };
					
					//Mostramos botón para finalizar contratación
					vm.showBoxFinalizar = true;
					
					vm.scrollTo('box-button-Contratar');
					break;
			}
		}
		
		//Función que se llama al darle a 'anterior' en los bloques de la contratación
		vm.anteriorInfo = function (form, paso, indexAsegurado) {
			//Según el paso en el que estemos, reseteamos los datos de ese paso
			switch (paso) {
				case 'datosEmpresa':
					vm.objHolder = {};
					if (vm.documentoValido == true) {
						vm.objHolder.NU_DOCUMENTO = vm.nuDocumento;
					}
					vm.NU_TELEFONO = null;
					vm.address = {};
					vm.step = 1;
					vm.stepsInfo[paso] = { añadido: false, mostrar: true, extender: true };
					vm.newSteps[5].añadido = false;
					vm.newSteps[5].extender = true;
					vm.checkAseguradoEsTomador = true;
					vm.objAsegurado = {};
					vm.addressAsegurado = {};
					setTimeout( function () { 
						if (vm.loadTemplateAdhoc == true) {
							vm.scrollTo('formPaso6');
						} else if (vm.isEdited != true) {
							vm.scrollTo('box-price');
						}
					},500);
					break;
				case 'datosAutorizado':
					vm.objAutPer = {};
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };
					vm.stepsInfo['datosEmpresa'] = { añadido: false, mostrar: true, extender: true };
					vm.scrollTo('formPasoDatosEmpresa');
					break;
				case 'datosAsegurado':
					vm.stepsInfo.asegurados[indexAsegurado] = { añadido: false, mostrar: false, extender: true };
					vm.listAseguradosAdhoc[indexAsegurado] = {};
					if (vm.stepsInfo.asegurados[indexAsegurado-1] != null) {
						vm.stepsInfo.asegurados[indexAsegurado-1] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDatosAsegurado' + (indexAsegurado+1));
					} else {
						vm.stepsInfo['datosAutorizado'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDatosAutorizado');
					}
					break;
				case 'datosPago':
					vm.bankAccount = {};
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };
					if (vm.stepsInfo.asegurados != null && vm.stepsInfo.asegurados.length > 0) {
						vm.stepsInfo.asegurados[vm.stepsInfo.asegurados.length-1] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDatosAsegurado' + vm.stepsInfo.asegurados.length);
					} else {
						vm.stepsInfo['datosAutorizado'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDatosAutorizado');
					}
					break;
				case "datosFechasGestor":
					vm.checkFecha = false;
					vm.changeFechaVigorPolizaCheck();
					vm.getMaxDateFdVencimiento();
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };
					vm.stepsInfo['datosPago'] = { añadido: false, mostrar: true, extender: true };
					break;
				case 'documentos':
					if (vm.opciones != null) {
						vm.opciones.email = null;
					}
					vm.checkEmail = false;
					vm.emailAccept = false;
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };

					if (vm.loadTemplateAdhoc == true) {
						vm.stepsInfo['datosPago'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDatosPago');
					} else {
						vm.stepsInfo['datosFechasGestor'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('datosFechasGestor');
					}
						
					break;
				case 'dominios':
					vm.requisitoRenovacion = null;
					vm.nuDomains = null;
					vm.lstDomains = null;
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };

					if(!vm.loadTemplateAdhoc) {
						vm.stepsInfo['documentos'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('documentos');
					}
						
					break;
				case 'ebroker':
					vm.objEbroker = {};
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };
					if(vm.loadTemplateAdhoc) {
						vm.stepsInfo['documentos'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDocumentos');
					} else {
						vm.stepsInfo['dominios'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDominios');
					}
					break;
				case 'requisitosRenovacion':
					// vm.requisitoRenovacion = null;
					vm.stepsInfo[paso] = { añadido: false, mostrar: false, extender: true };
					
					if (vm.showEbroker == true) {
						vm.stepsInfo['ebroker'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoEbroker');
					} else {
						if(vm.loadTemplateAdhoc) {
							vm.stepsInfo['documentos'] = { añadido: false, mostrar: true, extender: true };
							vm.scrollTo('formPasoDocumentos');
						} else {
							vm.stepsInfo['dominios'] = { añadido: false, mostrar: true, extender: true };
							vm.scrollTo('formPasoDominios');
						}
						
					}
					
					break;
				case 'finalizacion':
					if (vm.isAdhoc == true) {
						vm.stepsInfo['requisitosRenovacion'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formRequisitosRenovacion');
					} else if (vm.showEbroker == true) {
						vm.stepsInfo['ebroker'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoEbroker');
					} else {
						vm.stepsInfo['documentos'] = { añadido: false, mostrar: true, extender: true };
						vm.scrollTo('formPasoDocumentos');
					}
					vm.showBoxFinalizar = false;
					break;
			}
			vm.stepsInfo[paso - 1] = { paso: paso, añadido: false, mostrar: false, extender: true };
			vm.stepsInfo[paso - 2] = { paso: paso - 1, añadido: false, mostrar: true, extender: true };
		}
		
		
		vm.changeTemplate = function () {
			vm.loadChangeTemplate = true;
			vm.changeSuperAdmin();
            setTimeout(function(){ 
    			vm.loadTemplateAdhoc = !vm.loadTemplateAdhoc;

				if (vm.loadTemplateAdhoc == false) {
					var productos = JSON.parse(window.sessionStorage.perfil).productos;
                            
					if (productos != null && vm.mediador != null && vm.productoSeleccionado != undefined) {
						vm.mediador = productos.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.ID_PRODUCTO == vm.productoSeleccionado);
						var inMediador = false;
						var objMediador = vm.listComisionistas.find(x => x.ID_COMPANIA == vm.mediador.ID_COMPANIA && x.NO_SELECCIONABLE != true);
						if (objMediador != null) {
							inMediador = objMediador.IN_COBRO_MEDIADOR;
						}
						vm.mediador.IN_COBRO_MEDIADOR = inMediador;
						vm.idColectivo = vm.mediador.ID_TIPO_POLIZA; 
						vm.colectivo = vm.mediador;
						vm.showDocumentoFunction();
					}
				}
				
    			setTimeout(function(){ 
    				vm.loadChangeTemplate = false; $scope.$apply(); 
//    				if (vm.loadTemplateAdhoc == false) {
//    					vm.seleccionarProducto();
//    				}
				}, 500);
    			$scope.$apply();
            }, 500);
		}
		
		//Función que se llama alcambiar la tarifa a 'adhoc' o 'auto', con la que borramos el presupuesto
		vm.changeTipoTarifa = function () {
			vm.tarifaAdhoc = vm.tipoTarifa == 'auto' ? 'auto' : 'adhoc';
            vm.budgetId = null; 
            vm.objPres = {};
		    vm.price = 0;
		    vm.amount = null;
		    vm.primas = {};
		    vm.isCalcula = false;
            vm.addCodigoDescuento = false;
            vm.codigoDescuento = null;
            vm.cuponAplicado = false;
            vm.idDescuento = null;
            vm.addDescuento = false;
		    if (vm.objPri != null) vm.objPri.turnover = null;
		}

		//Recupera localidad y provincia al cambiar el código postal de la correduría
        vm.changeCoPostalCorreduria = function() {
            if(vm.objEbroker != null && vm.objEbroker.cpCorreduria != undefined && vm.objEbroker.cpCorreduria.length == 5) {

                EmpresaService.cities(vm.objEbroker.cpCorreduria)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if(response.data != undefined && response.data.LOCALIDAD != undefined) {
                            vm.objEbroker.poblacionCorreduria = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                            vm.objEbroker.provinciaCorreduria = response.data.LOCALIDAD[0].NO_PROVINCIA;
                        }
                    }
                }, function callBack(response) {
                });
            }
        }
        
        
        //Función que se llama cuando se ha emitido y ha seleccionado empresa e2k, ideas u opencall
        vm.callEbroker = function () {
        	if (vm.objEbroker != null) {
        		vm.objEbroker.razonSocialCorreduria = vm.objEbroker.nombreCorreduria;
        		vm.objEbroker.logos = [];
        		vm.objEbroker.numPoliza = vm.objPres.NU_POLIZA;
        		
        		PolizaService.documentacionEbroker(vm.objEbroker)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                });
        	}
        }
        
        //Mostrar/ocultar bloque de cobertura
        vm.changeSeccionCobertura = function (cobertura) {
        	vm.seccionesCobertura['cobertura' + cobertura] = !vm.seccionesCobertura['cobertura' + cobertura];
        }
        
        //Se llama al cambiar el check de filiales españolas, para borrar las filiales añadidas
        vm.changeCheckFilialesEspanolas = function () {
        	vm.affiSector = null;
        	vm.selActivities = null;
        }
        
        //Scroll a id
        vm.scrollTo = function (id) {
        	setTimeout( function () { 
        		if (document.getElementById(id) != null) {
            		document.getElementById(id).scrollIntoView() 
        		}
    		}, 
    		500);
        }
        
        //Función que devuelve si se puede pasar al siguiente bloque de la tarificación
        vm.disabledContinuarBloqueTarifica = function () {
        	if (vm.tarifaAdhoc == 'adhoc') {
        		return false;
        	} else if (vm.tarifaAdhoc == 'auto' && vm.price != null && vm.price != 0) {
        		return false;
        	} else return true;
        }
        
        //Al mostrar/ocultar bloque de descuento
        vm.changeSwitchDescuento = function () {
            vm.addCodigoDescuento = false;
            vm.codigoDescuento = null;
            vm.idDescuento = null;
            vm.cuponAplicado = false;
            
            if (vm.tarifaAdhoc == 'auto' && vm.addDescuento == false) {
                vm.rateCompany();
            }
        }
        
        vm.changeSwitchPresupuesto = function () {
        	if (vm.switchPresupuesto == false) {
        		vm.detallesPresu = null;
                vm.presupuestoSeleccionado = false;
        		vm.reset();
        	}
        }
        
        vm.getPresupuesto = function () {

			if(vm.idPresupuesto === undefined || vm.idPresupuesto ===''){
				msg.textContent("Introduce un número de presupuesto válido.");
				$mdDialog.show(msg)
				return
			}

			vm.loadBuscarPresupuesto = true;

        	BusquedaService.buscar({"ID_PRESUPUESTO": vm.idPresupuesto}, 'presupuestos')
            .then(function successCallback(response){
                let compania;
				if(response.data.ID_RESULT === 0 && response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS.length > 0){

					vm.detallesPresu = response.data.PRESUPUESTOS[0];

					if (vm.detallesPresu.IN_EMITIDO === 1) {
						vm.detallesPresu = null;
						vm.presupuestoSeleccionado = false;
						msg.textContent("El presupuesto " + vm.idPresupuesto + " ya se encuentra emitido.");
						$mdDialog.show(msg)
						return;
					}

					vm.objAgregados = {}

					vm.budgetId 				= response.data.PRESUPUESTOS[0].ID_PRESUPUESTO;
					vm.presupuestoSeleccionado 	= true;
					vm.productoSeleccionado 	= vm.detallesPresu.ID_PRODUCTO;
					const ciberriesgo 			= vm.detallesPresu.PECUNIARIAS.CIBERRIESGO;

					vm.changeProductoAdhoc();

					//Si tiene campo AMMOUNT es adhoc
					if (ciberriesgo.AMMOUNT != null && ciberriesgo.AMMOUNT !== "")
						vm.tarifaAdhoc = "adhoc";

					if (vm.objPri == null)
						vm.objPri = {};

					if (vm.detallesPresu != undefined && vm.detallesPresu.ID_MEDIADOR != undefined && vm.listComisionistas && vm.listComisionistas.length > 0) {
						vm.completeComisionista();
					}
								
					/*TOMADOR*/

					vm.objHolder.NU_DOCUMENTO = vm.detallesPresu.OCLIENTE.NU_DOCUMENTO
					vm.objHolder.NO_NOMBRE = vm.detallesPresu.OCLIENTE.NO_NOMBRE_COMPLETO

					/*FRANQUICIAS*/

					if (vm.tarifaAdhoc === "adhoc" && vm.detallesPresu.PECUNIARIAS.FRANQUICIAS != undefined) {
						vm.objAgregados.LST_FRANQUICIAS =[]

						if(vm.detallesPresu.PECUNIARIAS.FRANQUICIAS.length > 1)
							vm.checkFranquicia2 = true

						vm.detallesPresu.PECUNIARIAS.FRANQUICIAS.forEach(function (valor, indice, array) {
							vm.objAgregados.LST_FRANQUICIAS.push(
								{
									NO_FRANQUICIA: valor.NO_FRANQUICIA.toUpperCase(),
									IMP_FRANQUICIA: new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(valor.IMP_FRANQUICIA)
								}
							)
						});
					}

					const index = vm.detallesPresu.PECUNIARIAS.LST_GARANTIAS.findIndex(x => x.ID_GARANTIA === 54);
					console.log("index Garantía 54 (Cobertura 3) " + index)
					if(vm.detallesPresu.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS !== undefined){
						vm.isCambioSublimite = true
						vm.detallesPresu.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS.forEach(function (valor, indice, array) {
							valor.NU_CAPITAL = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(valor.NU_CAPITAL)
							vm.objAgregados.LIMITE_SECCION = valor.NU_CAPITAL
							vm.objAgregados.SECCION_SELECCIONADA = vm.listCoberturas3.find(x => x === valor.NO_SECCION);
						});
					}

					/*OBSERVACIONES/REQUISITOS DE RENOVACIÓN*/
					if (vm.detallesPresu.PECUNIARIAS.OBSERVACIONES != null) {
						vm.objAgregados.DS_OBSERVACIONES = vm.detallesPresu.PECUNIARIAS.OBSERVACIONES;
						vm.isObservaciones = true
					}


					if (vm.tarifaAdhoc === "adhoc") {
						// vm.budgetIdAgregados = vm.budgetId;
						if (vm.detallesPresu.LIST_TARIFAS != null && vm.detallesPresu.LIST_TARIFAS[0] != null) {
							vm.priceAdhoc = parseFloat(vm.detallesPresu.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));
						}
					}

					vm.activity 						= ciberriesgo.ACTIVITY_CODE;
					vm.sector 							= vm.tpGroups.find(x => x.CO_TIPO === vm.activity.substr(0, 1));
					vm.activity 						= vm.sector.LST_ACTIVIDADES.find(x => x.CO_ACTIVIDAD === vm.activity);

					vm.selActivities 					= ciberriesgo.FILIAL_ACTIVITY_CODE;

					vm.objPri.turnover 					= vm.tarifaAdhoc === "adhoc"
															? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(ciberriesgo.TURNOVER)
															: ciberriesgo.TURNOVER;

					vm.amountValue 						= vm.tarifaAdhoc === "adhoc"
															? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(ciberriesgo.AMMOUNT)
															: null;

					vm.amount 							= vm.tarifaAdhoc !== "adhoc"
															? vm.tpAmount.find(x => x.CO_TIPO === ciberriesgo.AMMOUNT_OPTION)
															: null;


					vm.objPri.lossAttackAmountOption 	= ciberriesgo.LOSS_ATTACK_AMOUNT_OPTION;
					vm.selAtks 							= ciberriesgo.CIBER_ATTACK_TYPES;

					vm.amountCC 						= vm.getAddCCE(vm.detallesPresu.PECUNIARIAS.LST_GARANTIAS) === true ? "100.000 €" : "25.000 €";

					vm.addCCE							= vm.getAddCCE(vm.detallesPresu.PECUNIARIAS.LST_GARANTIAS) === true;

					if (vm.selActivities != null)
						vm.getFilialActivityByDs();

					if (vm.selActivities != null && vm.selActivities !== "" && vm.selActivities.length > 0)
						vm.existenFilialesEspanolas = true;

					if (vm.detallesPresu.LIST_TARIFAS != null && vm.detallesPresu.LIST_TARIFAS[0] != null)
						vm.price = parseFloat(vm.detallesPresu.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT.toFixed(2));

					if (vm.detallesPresu.PECUNIARIAS != null && vm.detallesPresu.PECUNIARIAS.NU_DOCUMENTO != null) {
						vm.nuDocumento = vm.detallesPresu.PECUNIARIAS.NU_DOCUMENTO;
						vm.documentoValido = true;
						vm.disabledDocumento = true;
						vm.objHolder.NU_DOCUMENTO = vm.nuDocumento;
					}



					//Añadir primas
					if (vm.detallesPresu.LIST_TARIFAS != null && vm.detallesPresu.LIST_TARIFAS.length > 0) {
						var primaBrutaAnual = vm.beautifyImporte(+(Math.round(vm.detallesPresu.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT + "e+2")  + "e-2"));
						var primaNetaAnual = vm.beautifyImporte(+(Math.round(vm.detallesPresu.LIST_TARIFAS[0].IM_PRIMA_ANUAL + "e+2")  + "e-2"));
						var ips = 0;
						var lea = 0;
						var franquicia = 0;

						if (vm.detallesPresu.LIST_TARIFAS[0].IM_FRANQUICIA) {
							franquicia = vm.beautifyImporte(+(Math.round(vm.detallesPresu.LIST_TARIFAS[0].IM_FRANQUICIA + "e+2")  + "e-2"));
							vm.bloquearFranquicia = true;
						}

						if (vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS != null && vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS.length > 0) {
							var impuestos = vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS;
							for (var i = 0; i < impuestos.length; i++) {
								if (impuestos[i].CO_IMPUESTO === "IPS") {
									ips = vm.beautifyImporte(+(Math.round(impuestos[i].IM_IMPUESTO + "e+2")  + "e-2"));
								}
								if (impuestos[i].CO_IMPUESTO === "LEA") {
									lea = vm.beautifyImporte(+(Math.round(impuestos[i].IM_IMPUESTO + "e+2")  + "e-2"));
								}
							}
						}

						if (vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS != null) {
							vm.detallesPresu.LIST_TARIFAS[0].IMPUESTOS = {
								IMPUESTOS: vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS
							}
							delete vm.detallesPresu.LIST_TARIFAS[0].LIST_IMPUESTOS;
						}

						if (vm.detallesPresu.LIST_TARIFAS[0].LIST_GARANTIA != null) {
							vm.detallesPresu.LIST_TARIFAS[0].GARANTIAS = {
								GARANTIA: vm.detallesPresu.LIST_TARIFAS[0].LIST_GARANTIA
							}
							delete vm.detallesPresu.LIST_TARIFAS[0].LIST_GARANTIA;
						}

						vm.primas = {
							PRIMA_TOTAL: primaBrutaAnual,
							PRIMA_NETA: primaNetaAnual,
							FRANQUICIA: franquicia,
							IPS: ips,
							LEA: lea
						}

						vm.isCalcula = true;
						if (vm.tarifaAdhoc === "adhoc") {
							vm.changePrimasAdmin(false);
						}

					}
					//Crear objeto presupuesto
					vm.objPres = {
						ID_PRESUPUESTO: vm.detallesPresu.ID_PRESUPUESTO,
						MODALIDADES: {
							MODALIDAD: (vm.detallesPresu.LIST_TARIFAS != null && vm.detallesPresu.LIST_TARIFAS.length > 0) ? [vm.detallesPresu.LIST_TARIFAS[0]] : []
						},
						PRESUPUESTO: {
							CO_PRODUCTO: vm.productoCiberSelected.CO_PRODUCTO,
							ID_RAMO: 103,
							PECUNIARIAS: vm.detallesPresu.PECUNIARIAS,
							NO_USUARIO: vm.detallesPresu.NO_USU_ALTA,
							ID_PRESUPUESTO: vm.detallesPresu.ID_PRESUPUESTO
						}
					}

					if(vm.tarifaAdhoc === 'adhoc')
						vm.objAdhoc = vm.objPres;

					msg.textContent("Presupuesto " + vm.budgetId + " recuperado correctamente.");
					$mdDialog.show(msg)

                } else {
            		vm.detallesPresu = null;
                    vm.presupuestoSeleccionado = false;
                    msg.textContent("No se ha encontrado ningún presupuesto.");
                    $mdDialog.show(msg)
                }
            	vm.loadBuscarPresupuesto = false;
				vm.isBudgetImport = true;
            }, function errorCallBack(response)  {
            	vm.loadBuscarPresupuesto = false;
                vm.presupuestoSeleccionado = false;
        		vm.detallesPresu = null;
                msg.textContent("No se ha encontrado ningún presupuesto.");
                $mdDialog.show(msg)
            });        
        }
		
		vm.getIdGarantiaProducto = function (idGarantia) {
			var obj = {};
			if (vm.productoCiberSelected != null && vm.productoCiberSelected.ID_PRODUCTO != null && vm.productoCiberSelected.ID_PRODUCTO == 5) {
				obj = { 52: 94, 53: 95, 54: 96, 55: 97, 57: 99 };
			} else {
				obj = { 52: 100, 53: 104, 54: 107, 55: 102, 57: 101 };
			}
			return obj[idGarantia];
		}
        
        vm.insertarPresupuesto = function () {
			vm.parent.abrirModalcargar(true);	
        	var obj = null;
			var modalidad = {};
			
			if(vm.objAdhoc == undefined){
				vm.rateAdhoc();
			}
        	
			if ((vm.objAdhoc && vm.objAdhoc.PRESUPUESTO)) {
				obj = JSON.parse(JSON.stringify(vm.objAdhoc.PRESUPUESTO));

				if (vm.isCambioSublimite === true) {

					const index = obj.PECUNIARIAS.LST_GARANTIAS.findIndex(x => x.ID_GARANTIA === 54);
					if (index >= 0) {
						obj.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS = [];
						obj.PECUNIARIAS.LST_GARANTIAS[index].SECTIONS.push(
							{
								NO_SECCION: vm.objAgregados.SECCION_SELECCIONADA,
								NU_CAPITAL: vm.formatImporte(vm.objAgregados.LIMITE_SECCION)
							}
						)
					}
				}

				if(vm.tipoTarifa == 'adhocsin'){
					obj.FICHEROS = [];
	
					if(vm.listaArchivos != undefined && vm.listaArchivos.length > 0) {
						for(var i = 0; i < vm.listaArchivos.length; i++) {			
							if(vm.listaArchivos[i].ESTADO == undefined && vm.listaArchivos[i].ESTADO != "Guardado"){
								obj.FICHEROS.push(vm.listaArchivos[i]);
							}
						}
					}
				} 
				
				if(vm.tipoTarifa != "adhocsin"){
					obj.LIST_TARIFAS = [];
					var tarifa = {};
					tarifa.LIST_GARANTIA = obj.PECUNIARIAS.LST_GARANTIAS;
					
					//Añadir primas a la póliza
					if (vm.primas) {
						tarifa.IM_PRIMA_ANUAL =  vm.formatImporte(vm.primas.PRIMA_NETA);
						tarifa.IM_PRIMA_ANUAL_TOT  =  vm.formatImporte(vm.primas.PRIMA_TOTAL);
						tarifa.IM_FRANQUICIA  =  vm.formatImporte(vm.primas.FRANQUICIA);
						tarifa.IM_CLEA  =  vm.formatImporte(vm.primas.LEA);
						tarifa.IM_IPS  =  vm.formatImporte(vm.primas.IPS);
						tarifa.IM_REASEGURO = vm.formatImporte(vm.primas.PRIMA_REASEGURO);
					}
					
					obj.LIST_TARIFAS.push(tarifa);				
				
					modalidad.MODALIDAD = [];
					tarifa.GARANTIAS = { GARANTIA: tarifa.LIST_GARANTIA };
					tarifa.ID_PRODUCTO = vm.productoSeleccionado;
					tarifa.ID_COMP_RAMO_PROD = vm.productoSeleccionado;
					delete tarifa.LIST_GARANTIA;
					modalidad.MODALIDAD.push(tarifa);
				}

				if (vm.budgetId != null){
					obj.ID_PRESUPUESTO = vm.budgetId;
					obj.IT_VERSION = (vm.detallesPresu != undefined && vm.detallesPresu.IT_VERSION != undefined) ? vm.detallesPresu.IT_VERSION : vm.detalles.IT_VERSION;
					vm.isBudgetImport = true;
				}

				if(vm.objAgregados.DS_OBSERVACIONES != null)
					obj.OBSERVACIONES = vm.objAgregados.DS_OBSERVACIONES

				if (vm.tarifaAdhoc === "adhoc" && vm.objAgregados.LST_FRANQUICIAS != undefined) {
					obj.PECUNIARIAS.FRANQUICIAS = []

					vm.objAgregados.LST_FRANQUICIAS.forEach( function(valor, indice, array) {
						obj.PECUNIARIAS.FRANQUICIAS.push(
							{
								NO_FRANQUICIA: valor.NO_FRANQUICIA.toUpperCase(),
								IMP_FRANQUICIA: vm.formatImporte(valor.IMP_FRANQUICIA)
							}
						)
					});
				}
			}

			vm.objAdhoc.PRESUPUESTO = JSON.parse(JSON.stringify(obj));
			vm.objAdhoc.MODALIDADES = modalidad;
			vm.objPres = JSON.parse(JSON.stringify(vm.objAdhoc));

			if (obj) {
				vm.calcAgregados = true;
				PresupuestoService.savePresupuesto(obj)
				.then(function successCallback(response){
					if(response.status === 200){
						if(response.data.ID_RESULT != 0){
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						} else if (response.data.ID_RESULT === 0 && response.data.ID_PRESUPUESTO != null) {
							vm.detallesPresu = response.data;
							vm.budgetIdAgregados = response.data.ID_PRESUPUESTO;
							vm.objPres.ID_PRESUPUESTO = vm.budgetIdAgregados;
							vm.objPres.PRESUPUESTO.ID_PRESUPUESTO = vm.budgetIdAgregados;
							if (response.data.LIST_TARIFAS && response.data.LIST_TARIFAS.length > 0 && response.data.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT) {
								vm.priceAdhoc = response.data.LIST_TARIFAS[0].IM_PRIMA_ANUAL_TOT;
							}
							if(vm.detalles != undefined){
								msg.textContent("El presupuesto se ha modificado correctamente.");
								vm.recuperarDoc();
							}else{
								msg.textContent("El presupuesto se ha guardado correctamente.");
							}
							$mdDialog.show(msg);
							vm.siguientePaso(4);
							if(vm.actualizaSubestado)
								vm.actualizarSubestado();
						}
						vm.calcAgregados = false;
					}
				}, function callBack(response) {
					vm.calcAgregados = false;
                });
			}
        }
        
        function getUrlParam( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        } 
		
        vm.seleccionarProducto = function () {
            vm.reset(true);
            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/seleccionar_producto_ciber.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                escapeToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

                    md.$onInit = function() {
                        md.listProductos = vm.productosCiber;
                        md.producto = null;
                    }
                    
                    md.seleccionarProducto = function() {
                        vm.productoCiberSelected = md.producto;
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
		
		vm.checkDocument = function (bloque, form, id) {
			if (id == null) {
				id = "documentNumber";
			}
        	var valValue = false;
        	if (vm[bloque] != null && vm[bloque].NU_DOCUMENTO != null) {
        		ClienteService.validaTipoDocumento({ 'NU_DOCUMENTO': vm[bloque].NU_DOCUMENTO, 'ID_TIPO_DOCUMENTO': 2 })
				.then(function successCallback(response) {
					if(response.status == 200) {
						if (vm[form] && vm[form][id] && response.data != null) {
							vm[form][id].$setValidity('docValidation', response.data);
						}
					}
				}, function callBack(response) {
					vm[form][id].$setValidity('docValidation', false);
				});
        	}
        }
		
		vm.getListTpAmount = function () {
			var obj = {};
			if (vm.productoCiberSelected.ID_PRODUCTO == 6 || vm.productoCiberSelected.ID_PRODUCTO == 29) {
				obj = { "ID_CODIGO": constantsTipos.RNG_AMMOUNT };
			} else if (vm.productoCiberSelected.ID_PRODUCTO == 5) {
				obj = { "ID_CODIGO": constantsTipos.RNG_AMMOUNT_AGR };
			}
        	TiposService.getTipos(obj)
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
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
		}
		
		vm.changeCheckFranquicia2 = function () {
			if (vm.checkFranquicia2 == false && vm.objAgregados.LST_FRANQUICIAS && vm.objAgregados.LST_FRANQUICIAS[1]) {
				vm.objAgregados.LST_FRANQUICIAS[1].NO_FRANQUICIA = null;
				vm.objAgregados.LST_FRANQUICIAS[1].IMP_FRANQUICIA = null;
			}
		}
		
		vm.mostrarOpcionSumaAsegurada = function (suma, facturacion) {
			var mostrar = true;

			if (facturacion != null && vm.formatImporte(facturacion) < 250000 && vm.formatAmount(suma) > 250000) {
				mostrar = false;
			}
			
			return mostrar;
		}

		vm.chkDomains = function(num) {
			vm.lstDomains = [];
			for(let i = 0; i < num; i++) {
				vm.lstDomains.push('');
			}
		}

		vm.chkPolicyStatus = function(swch, status) {
			if(swch && status == 8) {
				msg.textContent('Para emitir este presupuesto mandar un email a ciberseguro@telefonica.com');
				$mdDialog.show(msg);
				vm.switchContratarPoliza = false;
			}
		}

		vm.getMedioPago = function () {
			TiposService.getMedioPago({ 'ID_TIPO_POLIZA': vm.idColectivo })
				.then(function successCallback(response) {
					if (response.status == 200) {
						if (response.data.ID_RESULT != 0) {
							msg.textContent('No tiene configurada una vía de pago para la emisión');
							$mdDialog.show(msg);
						} else if (response.data.ID_RESULT == 0) {
							if (response.data.TIPOS != null) {
								vm.tiposMedioPago = response.data.TIPOS.TIPO;
							} else {
								msg.textContent('No tiene configurada una vía de pago para la emisión');
								$mdDialog.show(msg);
							}
						}
					}
				}, function callBack(response) {
					if (response.status == 406 || response.status == 401) {
						vm.parent.logout();
					}
				});
		}

		vm.buttonSAsegCoberturas = function () {

			vm.isSumAsegCoberturas = !vm.isSumAsegCoberturas;
		}

		vm.changeSubstate = function () {

			if(vm.detalles != null && vm.detalles.IN_EMITIDO != null && vm.subEstadosPresupuesto != null && vm.subEstadosPresupuesto.length > 0){
				
				if (vm.detalles.IN_EMITIDO == 0 || (vm.detalles.IN_EMITIDO == 4 && !vm.isCaducado)){ // no emitido  
					// vm.detalles.ID_SUBESTADO = ; //  2, 5 y 6
					var array = [vm.subEstadosPresupuesto.find(x => x.CO_TIPO == 2), 
						vm.subEstadosPresupuesto.find(x => x.CO_TIPO == 5), vm.subEstadosPresupuesto.find(x => x.CO_TIPO == 6)]
					for (var i = vm.subEstadosPresupuesto.length -1; i >= 0; i--) {
						if(!array.includes(vm.subEstadosPresupuesto[i])){
							vm.subEstadosPresupuesto.splice(i, 1);
						}						
					}
				}
			}
		}

		vm.actualizarSubestado = function() {       	
			subEstado = {};
			idSubestado = vm.detalles.ID_SUBESTADO;
			            	
			if(vm.detalles.ID_SUBESTADO == 2 || vm.detalles.ID_SUBESTADO == 6){
				subEstado.ID_MOTIVO_SUBESTADO = vm.detalles.PECUNIARIAS.SUBESTADO.ID_MOTIVO_SUBESTADO;
				subEstado.OTRO_MOTIVO = vm.detalles.PECUNIARIAS.SUBESTADO.OTRO_MOTIVO;
			} 
        	if(vm.detalles.ID_SUBESTADO == 4){
        		fEnvio = new Date(vm.detalles.PECUNIARIAS.SUBESTADO.FD_ENVIADO_BEAZLEY);
        		fEnvio.setDate(fEnvio.getDate() + 1);
        		subEstado.FD_ENVIADO_BEAZLEY = new Date(fEnvio);   		
        	}
        	if(vm.detalles.ID_SUBESTADO == 1){
        		subEstado.ID_MOTIVO_SUBESTADO = vm.detalles.PECUNIARIAS.SUBESTADO.ID_MOTIVO_SUBESTADO;
        	}

			var obj = {
				ID_PRESUPUESTO: vm.detalles.ID_PRESUPUESTO,
				ID_SUBESTADO: vm.detalles.ID_SUBESTADO,
				PECUNIARIAS: {
					SUBESTADO: subEstado
				}
			};
			
			if(subEstado.FD_ENVIADO_BEAZLEY != undefined){
				fVencimiento = new Date(subEstado.FD_ENVIADO_BEAZLEY);
				fVencimiento.setDate(fVencimiento.getDate() + 2);
				obj.FD_VENCIMIENTO = new Date(fVencimiento);
			}
			
			PresupuestoService.actualizarSubestado(obj)
			.then(function successCallback(response){
				if(response.status === 200){
					if (response.data.ID_RESULT === 0) {
						if(vm.presuAnt != undefined && idSubestado != undefined)
							vm.presuAnt.ID_SUBESTADO = idSubestado;
						if(vm.presuAnt != undefined && vm.detalles.PECUNIARIAS != undefined && subEstado != undefined)
							vm.presuAnt.PECUNIARIAS.SUBESTADO = subEstado;
						if(response.data.PRESUPUESTOS != undefined)
							vm.detalles.IT_VERSION = response.data.PRESUPUESTOS[0].IT_VERSION;
						if(vm.detallesPresu != undefined && vm.detallesPresu.IT_VERSION != vm.detalles.IT_VERSION)
							vm.detallesPresu.IT_VERSION = vm.detalles.IT_VERSION;
						vm.getSubestadosPresu();
						if(vm.detalles.ID_SUBESTADO != null && vm.valores.indexOf(vm.detalles.ID_SUBESTADO) > -1){
							vm.docAllowed = true;
						}
						if(vm.actualizaSubestado == false){
							msg.textContent("Se ha modificado el subestado correctamente.");
				            $mdDialog.show(msg);
						}
						vm.actualizaSubestado = false;
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response) {
				if (response.status == 406 || response.status == 401) {
					vm.parent.logout();
				}
            });
		}
			
		vm.uploadFiles = function(files) {
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {			
					if(files[i].ESTADO == undefined && files[i].ESTADO != "Guardado"){
						(function(oFile) {
							var reader = new FileReader(); 
							var name = oFile.newName != undefined ? oFile.newName : oFile.name;
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
									'ID_TIPO': 227,
									'NO_ARCHIVO': CommonUtils.checkFileName(name)
								};
								
								vm.fileC = file;
								
								$scope.$apply(function() {
									vm.listaArchivos.push(file);
								});
							}
							reader.readAsDataURL(oFile);
						})(files[i]);
					}
				}
			}
		}
		
		$scope.$watch('$ctrl.files', function () {
			vm.upload(vm.files);
		});

		vm.upload = function(files) {
			vm.filesNew = [];
			sigue = false;
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {	
					if(vm.listaArchivos.find(x => x.NO_ARCHIVO== files[i].name)){
						vm.tratarFichero(files[i]);
					}else{
						vm.filesNew.push(files[i]);
						sigue = true;
					}
					if(sigue){
						vm.uploadFiles(vm.filesNew);
					}	
				}
			}
		}
		
		vm.tratarFichero = function (file){
			 $mdDialog.show({
	                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/gestion_archivos.modal.html',
	                controllerAs: '$ctrl',
	                clickOutsideToClose: false,
	                escapeToClose: false,
	                parent: angular.element(document.body),
	                fullscreen: false,
	                controller: ['$mdDialog', function ($mdDialog) {
	                    var md = this;
	                    md.cambio = false;
	                    
	                    md.sustituir = function (){ 
	                   		fileAnt = vm.listaArchivos.find(x => x.NO_ARCHIVO == file.name);
	                    	file.newName = file.name;
	                   		vm.filesNew.push(file);
	                   		vm.uploadFiles(vm.filesNew);
	                   		
	                   		vm.parent.deleteArchive(fileAnt.ID_ARCHIVO);
	                   		fileAnt.ESTADO = "Borrado";
                    		$mdDialog.hide();
	                    }
	                    
	                    md.cambNombre = function (){
	                    	if(md.nombreFichero.indexOf(".") != -1) {
	                    		file.newName = md.nombreFichero;
	                    	}else{
	                    		extension = file.name.split(".")[1];
	                    		file.newName = md.nombreFichero + "." + extension;
	                    	}
	                   		vm.filesNew.push(file);
	                   		vm.uploadFiles(vm.filesNew);
                    		$mdDialog.hide();
	                    }
	                    
	                    md.hide = function () {
	                        $mdDialog.hide();
	                    };
	                    
	                    md.mod = function () {
	                       md.cambio = true;
	                    };

	                    md.cancel = function () {
	                        $mdDialog.cancel();
	                    };
	                }]
	            })
			
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
                    vm.parent.logout();
                }
            });
        };

        vm.deleteFile = function(file, index) {
			if(!file.ESTADO) {
				vm.listaArchivos.splice(index, 1);
			} else {
				if(file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined) {
					vm.parent.deleteArchive(file.ID_ARCHIVO);
					vm.recuperarDoc();
				}
			}
		}
        
        vm.getMotivosRechazo = function(subestado){
        	var codigo = 0;
        	
        	if(subestado && subestado == 1){
        		codigo = constantsTipos.MOTIV_RECHAZO_BEAZLEY;
        	}else if (subestado && (subestado == 6 || subestado && subestado == 2)){
        		codigo = constantsTipos.MOTIV_NO_CONTRATACION;
        	}
        	
        	if(codigo != 0){
	        	TiposService.getTipos({
	                "ID_CODIGO": codigo
	            })
	            .then(function successCallback(response) {
	                if (response.status == 200) {
	                	vm.motivosRechazo = response.data.TIPOS.TIPO;                    	
	                }
	            }, function callBack(response) {
	                if (response.status == 406 || response.status == 401) {
	                    vm.parent.logout();
	                }
	            });
        	}
        }

		$(document).on('change', '#file_ns', function() {
		});
		
		vm.getSubestadosPresu = function(){
			PresupuestoService.getSubestadosPresupuestos(vm.detalles.ID_PRESUPUESTO)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data != null && response.data.TIPOS.TIPO.length > 0){
						vm.subEstadosPresupuesto = response.data.TIPOS.TIPO;
					}
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
	            	vm.parent.logout();
	            }
			});
		}
		
		vm.modPresuEmpresas = function(){
			vm.tipoTarifa = 'adhocsin';
			vm.actualizaSubestado = false;
			
			if(vm.presuAnt == undefined){
				vm.presuAnt = JSON.parse(vm.presuBackup);
			}
			
			if(vm.presuAnt.ID_SUBESTADO != vm.detalles.ID_SUBESTADO || vm.presuAnt.PECUNIARIAS.SUBESTADO == undefined
			|| (vm.presuAnt.PECUNIARIAS.SUBESTADO != undefined && vm.detalles.PECUNIARIAS.SUBESTADO != undefined && vm.presuAnt.PECUNIARIAS.SUBESTADO.ID_MOTIVO_SUBESTADO != vm.detalles.PECUNIARIAS.SUBESTADO.ID_MOTIVO_SUBESTADO)){
				vm.actualizaSubestado = true;
			}
			
			if(vm.archivosRec != vm.listaArchivos.length || vm.presuAnt.PECUNIARIAS.OBSERVACIONES_ADHOC != vm.detalles.PECUNIARIAS.OBSERVACIONES_ADHOC){
				vm.insertarPresupuesto();				
			}else{
				vm.actualizaSubestado = false;
				vm.actualizarSubestado();
			}
		}
		
        vm.openTarEmpresa = function () {
        	vm.isTarEmpresa = true;
        	vm.tipoTarificador = 3;
            vm.redirect('#!/area_privada?tar=0');
        }
        
        vm.chooseMediator = function(){
        	vm.tar.chooseMediator();
        }
        
        vm.redirectEmpresas = function (){
        	vm.productoCiberSelected.ID_PRODUCTO == "5" ? vm.productoCiberSelected.ID_PRODUCTO = "6" : vm.productoCiberSelected.ID_PRODUCTO = "5";
        	vm.loadTemplateAdhoc = false;
        	vm.loadTemplate();
        }
        
        vm.confirmExit = function (metodo){
        	if(vm.budgetId != undefined){
	        	$mdDialog.show({
					templateUrl: BASE_SRC+'detalle/detalle.modals/accept-cancel.modal.html',
					controllerAs: '$ctrl',
					clickOutsideToClose: false,
					parent: angular.element(document.body),
					fullscreen: false,
					controller:['$mdDialog', function($mdDialog){
						var md = this;
						if(metodo == 1){
							md.header = '¿Estás seguro de cambiar de producto?';
							md.msg = 'Si cambias el producto generarás un nuevo presupuesto y para acceder al que acabas de hacer deberás buscarlo.';
						}else if(metodo == 2){
							md.header = '¿Estás seguro de entrar en Espacio Broker?';
							md.msg = 'Tendrás que buscar el presupuesto que acabas de hacer para recuperarlo.';
						}
						md.cancel = function() {
							$mdDialog.cancel();
						};
	
						md.accept = function() {
						  	if(metodo == 1){				        	
						  		vm.reset(true);
						  		vm.redirectEmpresas();
						  	}	else if(metodo == 2){
						  		vm.chooseMediator();
							}
						  	$mdDialog.cancel();
						};
				  
					}]
				});
	        }else{
			  	if(metodo == 1)
			  		vm.redirectEmpresas();
			  	else if(metodo == 2)
			  		vm.chooseMediator();
	        }
        }
        
        vm.completeComisionista = function (){
			compania = vm.listComisionistas.find(x => x.ID_COMPANIA === vm.detallesPresu.ID_MEDIADOR && x.NO_SELECCIONABLE !== true);

			if (vm.autocomplete == null)
				vm.autocomplete = {};

			if (compania != null) {
				vm.autocomplete.COMISIONISTA = compania;
				vm.idComisionista = compania.ID_COMPANIA;
				console.log("Import budget > Company recover > " + compania.NO_COMPANIA)
				vm.changeComisionista(true);
			}
        }
        
    }
    ng.module('App').component('tarEmpresaApp', Object.create(tarEmpresaComponent));

})(window.angular);