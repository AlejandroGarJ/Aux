(function(ng) {	

	//Crear componente de app
    var clienteComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$scope','sharePropertiesService', '$location', '$mdDialog','$uibModal', '$translate', 'validacionesService', 'BusquedaService', 'ClienteService', 'TiposService', 'uiGridConstants', 'BASE_SRC', 'LocalidadesService', '$window', 'HogarService', 'FicherosService', 'CommonUtils', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busquedaCliente: '^?busquedaCliente'
            },
            bindings:{
                isConsultagdpr: '<'
            }
    }
    
    clienteComponent.controller = function clienteComponentControler($q, $scope, sharePropertiesService, $location, $mdDialog, $uibModal, $translate, validacionesService, BusquedaService, ClienteService, TiposService, uiGridConstants, BASE_SRC, LocalidadesService, $window, HogarService, FicherosService, CommonUtils, constantsTipos) {
    	var vm=this;
    	vm.db=sharePropertiesService.get('db');
    	var url=window.location;
    	vm.domicilios = [];
    	vm.bancos = [];
    	vm.form = {};
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.cargarTabla = false;
		vm.openingPre = false;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		var msgConfirm = $mdDialog.confirm()
	        .title($translate.instant('MSG_WANT_DELETE'))
	        .ariaLabel('Lucky day')
	        .ok('Aceptar')
	        .cancel('Cancelar');
    	vm.navegador = bowser.name.toLowerCase();
    	vm.listaArchivos = [];
        vm.date = new Date();
		vm.minLengthTelefono = 9;
		vm.maxLengthTelefono = 9;
		
    	this.$onInit = function(bindings) {
			
    		vm.datos = vm.parent.datos
    		vm.colectivos = vm.parent.colectivos;
    		/*var tipo = bindings.tipo.currentValue;
    		console.log(tipo);*/
    		vm.list = vm.parent.datos.LST_ASEGURADOS;
    		vm.showTable = 0;
    		
    		vm.mostrarResumen = true;
    		
    		if(vm.busquedaCliente != null && vm.busquedaCliente != undefined && vm.busquedaCliente.permisos != undefined){
        		vm.permisos = vm.busquedaCliente.permisos;
    		}else if(vm.parent.permisos != undefined){
    			vm.permisos = vm.parent.permisos;
    		}else{
    			if(vm.parent.pre.getPermissions != undefined){
            		vm.permisos = vm.parent.pre.getPermissions('clientes_main');
        		}
    		}
    		
    		if($window.sessionStorage.rol != '1' && $window.sessionStorage.rol != '2' && $window.sessionStorage.rol != '4' && $window.sessionStorage.rol != '12' && $window.sessionStorage.rol != '13' && $window.sessionStorage.rol != '14')
    			vm.soyAdmin = false
			else
    			vm.soyAdmin = true;	
    		
    		if(vm.datos.NU_POLIZAS_CONTRATADAS!=0 || vm.datos.NU_SOLICITUDES!=0 || vm.datos.NU_PRESUPUESTOS!=0){
    			vm.mostrarResumen = false
    		}
    		
    		angular.forEach(vm.list, function(values,key){
    			if(values.ID_TIPO_CLIENTE == 1){
    				vm.pagador = vm.list[key];
    			}
    			else if(values.ID_TIPO_CLIENTE == 2){
    				vm.conductor = vm.list[key];
    			}
    			else{
    				vm.tomador = vm.list[key];
    			}
    		});
    		
    		vm.json = {
    			ID_CLIENTE:vm.datos.ID_CLIENTE
    		}
    		
    		//Obtener los detalles del cliente
    		ClienteService.getCliente(vm.json)
    		.then(function successCallback(response){
				if(response.status == 200){
					vm.datos = response.data;
					angular.forEach(vm.datos, function(value, key){
    					vm.form[key] = {};
    					if(key=="FD_NACIMIENTO" || key == "FD_CARNET"){
    						// fecha = vm.datos[key];
    						// var n2 = vm.datos[key].indexOf(':');
							// values = fecha.substring(0, n2 != -1 ? n2-3 : fecha.length);
							// vm.form[key].value = new Date(values);
							fecha = value;
    						var n2 = value.indexOf(':');
							values = fecha.substring(0, n2 != -1 ? n2-3 : fecha.length);
							var m = moment(values);
							vm.form[key].value = m.format('YYYY-MM-DD');
    					}
    					else
							vm.form[key].value = vm.datos[key];							
    				});
					
		    		/*angular.forEach(vm.datos, function(values, key){
	                    vm.form[key]={};
	                    vm.form[key].value = vm.datos[key];
	                });*/
					
					if (vm.datos.CO_NACIONALIDAD == "DEU") {
						vm.minLengthTelefono = 1;
						vm.maxLengthTelefono = 25;
					}
		    		
		    		if(vm.datos.LIST_DOMICILIOS != null){
		    			if(Array.isArray(vm.datos.LIST_DOMICILIOS))
			    			vm.domicilios = vm.datos.LIST_DOMICILIOS;
			    		else
			    			vm.domicilios.push(vm.datos.LIST_DOMICILIOS);
		    			
		    			if (vm.datos.CO_NACIONALIDAD != "DEU") {
			    			$.each(vm.domicilios, function(index, object){
			    				vm.domicilios[index].IN_CORRESPONDENCIA = vm.domicilios[index].IN_CORRESPONDENCIA == 0 ? false : true;
			    				
			    				if(vm.domicilios[index].CO_POSTAL != null && vm.domicilios[index].CO_POSTAL != ""){
		    						TiposService.getLocalidades(vm.domicilios[index].CO_POSTAL)
		    		    			.then(function successCallBack(response){
		    		    				if(!Array.isArray(response.data.LOCALIDAD)){
		    		    					vm.domicilios[index].localidades = [];
		    		    					vm.domicilios[index].localidades.push(response.data.LOCALIDAD);
		    		    					vm.domicilios[index]['ID_LOCALIDAD'] = response.data.LOCALIDAD.ID_LOCALIDAD;
		    		    				}
		    		    				else{
		    		    					vm.domicilios[index]['localidades'] = response.data.LOCALIDAD;
		    		    				}
		    		    				
//		    		    				vm.domicilios[index]['NO_PROVINCIA'] = response.data.LOCALIDAD[0].NO_PROVINCIA ;
	                                    if(vm.domicilios[index]['NO_PROVINCIA']!="undefined"){
	                                        vm.domicilios[index]['NO_PROVINCIA'] = response.data.LOCALIDAD[0].NO_PROVINCIA;
	                                    }
		    		    			}, function errorCallBack(response){
		    		    				console.log(response);
		    		    			});
		    					}
			    				
	                        })
		    			}
		    			
                        backupJSONDomicilios = JSON.stringify(vm.domicilios);
		    		}
		    		
		    		if(vm.datos.LIST_CUENTASBANCARIAS != null){
		    			if(Array.isArray(vm.datos.LIST_CUENTASBANCARIAS))
			    			vm.bancos = vm.datos.LIST_CUENTASBANCARIAS;
			    		else
			    			vm.bancos.push(vm.datos.LIST_CUENTASBANCARIAS);
                    }
                    backupJSONBancos = JSON.stringify(vm.bancos);
                    $q.all({'datosRequest':validacionesService.getData(), 'dictRequest':validacionesService.getDict()}).then(function(data){
                    vm.dictionary = data.dictRequest.dict;
	    		}); 
                    backupJSON = JSON.stringify(vm.form);
				}
			},function errorCallback(response){
				/*if(response.status == 406 || response.status == 401){
                	vm.busqueda.logout();
                	$location.path('/');
                }*/
				$q.all({'datosRequest':validacionesService.getData(), 'dictRequest':validacionesService.getDict()}).then(function(data){
	    			vm.form = data.datosRequest.data;
                    vm.dictionary = data.dictRequest.dict;
	    		});
			});
    		
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
                    	vm.parent.pre.logout();
                    }
    			});
    		}

    		ClienteService.getValorCliente(vm.json)
    		.then(function successCallback(response){
				if(response.status == 200){
					vm.resumen = response.data;
//                  Cargar dashboard en resumen cliente
                    if(vm.resumen != null && vm.resumen != undefined){
                        var datosResumen = {
                                recibosPendientes: vm.resumen.NU_RECIBOS_PENDIENTES,
                                recibosDevueltos: vm.resumen.NU_RECIBOS_DEVUELTOS,

                        };
                        var options = {
                            legend: { display: false,},
                            title: { display: false, },
                            tooltips: { enabled: false }
                        };       
                        
                        // Recibos
                        if(angular.element( document.querySelector('#chartRecibos'))[0] != undefined) {
                            var myChart = new Chart(angular.element( document.querySelector('#chartRecibos'))[0], {
                                type: 'doughnut',
                                data: {
                                    labels: [datosResumen.recibosPendientes, datosResumen.recibosDevueltos],
                                    datasets: [{
                                        label: 'Resumen',
                                        data: [datosResumen.recibosDevueltos, datosResumen.recibosPendientes],
                                        backgroundColor: [ "#5bc500", "#b6ff77" ],
                                        hoverBackgroundColor: [ "#5bc500","#b6ff77" ]
                                    }]
                                },
                                options: options
                            });
                        }    
                    }        
					
					
				}
			},function errorCallback(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.pre.logout();
                }
			});
    		
    		if(vm.appParent.listServices.listTiposVia != null && vm.appParent.listServices.listTiposVia.length > 0){
    			vm.tipos.tiposVia = vm.appParent.listServices.listTiposVia;
    		} else {
    			HogarService.getTiposVia({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposVia = response.data.TIPO_VIA;
    					vm.appParent.listServices.listTiposVia = vm.tipos.tiposVia;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listProvincias != null && vm.appParent.listServices.listProvincias.length > 0){
    			vm.tipos.provincias = vm.appParent.listServices.listProvincias;
    		} else {
    			TiposService.getProvincias()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.provincias = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listProvincias = vm.tipos.provincias;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
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
    		
    		if(vm.appParent.listServices.listMedioPago != null && vm.appParent.listServices.listMedioPago.length > 0){
            	vm.tipos.medioPago = vm.appParent.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
        		.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.medioPago = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listMedioPago = vm.tipos.medioPago;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listSituaCliente != null && vm.appParent.listServices.listSituaCliente.length > 0){
            	vm.tipos.situaCliente = vm.appParent.listServices.listSituaCliente;
    		} else {
    			TiposService.getSituaCliente({})
        		.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.situaCliente = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listSituaCliente = vm.tipos.situaCliente;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
                    }
    			});
    		}
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.ESTADO_CIVIL})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.civiles = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.pre.logout();
                }
			});
    		
    		vm.getDocuments();

    		
    	}
    	
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.clientes2.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.changeTabs = function(index){
    		vm.showTable = index;
    		if (index == 8) {
    			vm.cargarHistorico();
    		}
    	}
    	
    	//Redirigir desde dash de resumen
        vm.redirectUrl = function(id, tabla){
            vm.changeTabs(id);
            vm.cargarTabla(tabla);
        }
    	
    	//Añadir direcciones
    	vm.anadirDir=function(){
    		var i=0;
    		var keepGoing = true;

    		if(vm.domicilios!=undefined){ //Comprueba los inputs si están vacíos.
    			$.each(vm.domicilios, function(index, key){
    				angular.forEach(vm.domicilios[index], function(valor, key){
    					if(key != "IN_CORRESPONDENCIA"){
    						if(keepGoing){
	    						if(valor===""){
			    					i++;
			    					if(i>6){
			    						keepGoing = false;
			    					}
			    				}
	    						else{
	    							i=0;
	    							return;
	    						}
	    					}
    					}
    				});
    			});
    			//Si supera mas de 6 inputs vacíos, no se añadira nueva fila
    			if(i == 0)
    				vm.domicilios.push({"ID_TIPO_VIA":"","NO_DIRECCION":"","NU_NUMERO":"","CO_POSTAL":"","NO_LOCALIDAD":"","CO_PROVINCIA":"","IN_CORRESPONDENCIA":false});
    			
    		}else{//Si no tienen filas, se añade una nueva.
    			vm.domicilios=[];
    			vm.domicilios.push({"ID_TIPO_VIA":"","NO_DIRECCION":"","NU_NUMERO":"","CO_POSTAL":"","NO_LOCALIDAD":"","CO_PROVINCIA":"","IN_CORRESPONDENCIA":false});
    		}
    	}
    	
    	//Identificar la localidad por código postal
		vm.updateDir = function (valor,index) {
			if (valor != undefined && valor.length == 5 && vm.datos.CO_NACIONALIDAD != "DEU") {
				vm.localidades = [];
				TiposService.getLocalidades(valor)
					.then(function successCallBack(response) {
						if (!Array.isArray(response.data.LOCALIDAD)) {
							vm.localidades = [];
							vm.localidades.push(response.data.LOCALIDAD);
						} else {
							vm.localidades = response.data.LOCALIDAD;
							if(vm.localidades.length>1){
								LocalidadesService.elegirLocalidad(vm.localidades,vm.domicilios[index]);
							}else
								vm.domicilios[index].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
						}
						
						vm.domicilios[index].NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
						vm.domicilios[index].CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
						vm.domicilios[index].DS__CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
						vm.domicilios[index].NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
						
					}, function errorCallBack(response) {
						msg.textContent('No hemos podido verificar el código postal como válido. Por favor, revísalo');
    				    $mdDialog.show(msg);
					});
			}
		}
    	
    	//Añadir bancos
    	vm.anadirBanco=function(){
    		var i=0;
    		var keepGoing = true;

    		if(vm.bancos!=undefined){ //Comprueba los inputs si están vacíos.
    			angular.forEach(vm.bancos, function(value, key){
    				angular.forEach(value, function(valor, key){
    					if(keepGoing){
    						if(valor===""){
		    					i++;
		    					if(i>1){
		    						keepGoing = false;
		    					}
		    				}
    						else{
    							i=0;
    							return;
    						}
    					}
    					
    				});
    			});
    			//Si supera mas de 6 inputs vacíos, no se añadira nueva fila
    			if(i == 0)
    				vm.bancos.push({"CO_IBAN":""});
//    			"NU_BANCO":"","NU_SUCURSAL":"","NU_DC":"","NU_CUENTA":"","CO_IBAN":"","CO_BIC":""
    		}else{//Si no tienen filas, se añade una nueva.
    			vm.bancos=[];
    			vm.bancos.push({"CO_IBAN":""});
//    			"NU_BANCO":"","NU_SUCURSAL":"","NU_DC":"","NU_CUENTA":"","CO_IBAN":"","CO_BIC":""
    		}
    	}
    	
    	vm.eliminarDeLista = function(lista, dato){
    	
		    $mdDialog.show(msgConfirm).then(function() {
		    	
		    	if(lista != undefined && Array.isArray(lista)){
	    			var index = lista.indexOf(dato);
	    			lista.splice(index, 1);
	    		}
		    	
		    }, function() {
		    });
		    
    	}
    	
    	function validaDocumentoAsync (key, value, documento){
    	    return new Promise((resolve ,reject)=>{
    	    	ClienteService.validaDocumento({'NU_DOCUMENTO': value, 'ID_TIPO_DOCUMENTO': documento})
                .then(function successCallback(response) {
                    if(response.status == 200) {
//                    	return response.data.ID_RESULT;
        	            resolve(response.data.ID_RESULT);
                    }
                }, function callBack(response) {
                    if(response.data.ID_RESULT == 103) {
						required = 'Error de documento';
						isErrors = true;
                    }
					else vm.resetErrors(key);
                });
    	    });
    	};
    	
    	//Modificar el cliente
    	vm.editarCliente = async function () {
    		if(vm.formCliente.$valid == false){
                objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();
                msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
                $mdDialog.show(msg);
                if(objFocus != undefined) {
					objFocus.focus();
				}
            	return null;
            }
    		
    		isErrors = false;
    		json = {};
    		
    		// // Realizamos validaciones
            for (var data in vm.form) {
            	if(vm.form[data].value instanceof Date){
            		vm.form[data].value=vm.appParent.dateFormat(vm.form[data].value);
				}
            	var dict = vm.dictionary[data];
				if(dict != undefined && dict.format) {
					if (vm.form.ID_TIPO_DOCUMENTO.value === 2) {
						var responseValidaDocumento = await validaDocumentoAsync(data, vm.form[data].value, vm.form.ID_TIPO_DOCUMENTO.value);

                        if(responseValidaDocumento == 103) {
							required = 'Error de documento';
							isErrors = true;
							msg.textContent('Documento erróneo, formato no válido')
							$mdDialog.show(msg);
                        }
						else vm.resetErrors(data);
					}
					else if(vm.form.ID_TIPO_DOCUMENTO.value === 1 || vm.form.ID_TIPO_DOCUMENTO.value === 4) {
						var responseValidaDocumento = await validaDocumentoAsync(data, vm.form[data].value, vm.form.ID_TIPO_DOCUMENTO.value);

                        if(responseValidaDocumento == 103) {
							required = 'Error de documento';
							isErrors = true;
							msg.textContent('NIF/DNI erróneo, formato no válido')
							$mdDialog.show(msg);
                        }
						else vm.resetErrors(data);
					}
				}

				if(vm.form[data].value != null) {
					json[data] = vm.form[data].value;
				}
            }
    
            if(!isErrors){
            	console.log(json);
            	json.ID_CLIENTE = vm.datos.ID_CLIENTE;
            	json.IT_VERSION = vm.datos.IT_VERSION;
            	
            	// Comprobar si se han rellenado los campos requeridos de la cuenta bancaria
            	if(vm.bancos != undefined && Array.isArray(vm.bancos)) {
					vm.editValido = true;
            		for(var i = 0; i < vm.bancos.length; i++){
                		if(vm.bancos[i].CO_IBAN == undefined){
							msg.textContent('Número de cuenta no válido');
							$mdDialog.show(msg);
							vm.editValido = false;
                		}
                	}
            	}
            	
            	json.LIST_CUENTASBANCARIAS = vm.bancos;
            	json.LIST_DOMICILIOS = JSON.parse( JSON.stringify(vm.domicilios));
        		$.each(vm.domicilios, function(index, value) {
        			json.LIST_DOMICILIOS[index].IN_CORRESPONDENCIA = vm.domicilios[index].IN_CORRESPONDENCIA ? 1:0;
					if (json.LIST_DOMICILIOS[index].ID_TIPO_VIA == "") {
						delete json.LIST_DOMICILIOS[index].ID_TIPO_VIA;
					}
        			//vm.domicilios[index].IN_CORRESPONDENCIA = vm.domicilios[index].IN_CORRESPONDENCIA == 0 ? false:true;
				});
				
				// Eliminar los arrays de direcciones y cuentas si están vacíos antes de enviar los datos a editar
				if(json.LIST_CUENTASBANCARIAS.length == 0) {
        			delete json.LIST_CUENTASBANCARIAS;
        		}
        		if (json.LIST_DOMICILIOS.length == 0) {
        			delete json.LIST_DOMICILIOS;
        		}
				
        		if(vm.editValido != false) {
					vm.appParent.abrirModalcargar(true);
					ClienteService.editarCliente(json)
					.then(function successCallBack(response){
						vm.datos.IT_VERSION = response.data.IT_VERSION;
                        if(response.status == 200 && response.data.ID_RESULT == 0) {
							vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
						} else {
                            if(response.data.DS_RESULT != undefined){
                                vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
                            }else{
                                vm.appParent.cambiarDatosModal('Error al editar el cliente');
                            }
						}
					}, function errorCallBack(response){
						vm.status == response.status;
						vm.appParent.cambiarDatosModal('Error al editar cliente');
					});
				}
            }
    	}
    	
    	
    	
    	//Abrir el modal del aviso de borrado
    	vm.borrarCliente = function(){
    			$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/delete_cliente.modal.html',
    			size: 'lg',
    			clickOutsideToClose:true,
	            parent: angular.element(document.body),
    	        fullscreen:false,
    			controllerAs: '$ctrl',
    			controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				var jsonBorrar = {
    						"ID_CLIENTE":vm.datos.ID_CLIENTE,
    						"IT_VERSION":vm.datos.IT_VERSION
    				};
    				
    				md.borrarCliente = function(option){
    					if(option){
    						ClienteService.borrarClientes(jsonBorrar)
    						.then(function successCallback(response){
    							
								$mdDialog.hide();
								msg.textContent('Cliente eliminado correctamente');
								$mdDialog.show(msg);
    							
    							//Eliminar cliente del grid
    							for(cliente in vm.busquedaCliente.gridOptions.data){
    								if(vm.busquedaCliente.gridOptions.data[cliente].ID_CLIENTE == vm.datos.ID_CLIENTE){
										vm.busquedaCliente.gridOptions.data.splice(cliente,1);
    									break;
    								}
    							}
    							
    							//Eliminar cliente del tab
    							for(cliente in vm.busquedaCliente.numDetalles){
    								if(vm.busquedaCliente.numDetalles[cliente].ID_CLIENTE == vm.datos.ID_CLIENTE){
    									vm.busquedaCliente.numDetalles.splice(cliente,1);
    									break;
    								}
    							}
    							
    							//Enviar a listado de clientes
    							localStorage.clientes = JSON.stringify(vm.busquedaCliente.gridOptions.data);
	    	            		$location.path('/clientes_main');
    							
    						}, function errorCallback(response){
    							if(response.status == 406){
    								vm.parent.logout();
    								$mdDialog.hide();
    							}
    						})
    					}
    					else
    						$mdDialog.hide();
    				}
    				
    			}]
    		});
    	}
    	
    	//Ver detalle de polizas
    	vm.verDetalle = function(fila){
    		vm.detalles = fila;
    		vm.vistaPoliza = 2;
    	}
    	
    	vm.putMatricula=function(){
    		var situa = vm.form.ID_SITUACION_LABORAL.value;
    		if(situa == 1 || situa == 4 || situa == 5)
    			vm.show=true;
    		else
    			vm.show=false;
    	}

        //Abrir presupuesto
        vm.crearPresupuesto=function(ev, cliente){
        	$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/presupuesto.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				md.tipos = {};
    				
    				TiposService.getRamos({"IN_TARIFICABLE":true})
					.then(function successCallback(response){
						if(response.status == 200){
							md.tipos.ramos = response.data.TIPOS.TIPO;
						}
					});
    				
    				md.colectivos = vm.parent.colectivos;
                	
    				md.nuevoPresupuesto = function(){
    					if(md.form != undefined){	
	    					if((md.form.ID_RAMO != null && md.form.ID_RAMO) && (md.form.ID_COLECTIVO != null && md.form.ID_COLECTIVO)){
	    						vm.typePresupuesto = {
	            						"ID_RAMO":md.form.ID_RAMO,
	            						"ID_COLECTIVO":md.form.ID_COLECTIVO
	            				}
	        					vm.openingPre = true;
	    						$mdDialog.hide();
	    					}
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
        
        //Cargar la lista de polizas
        vm.cargarTabla = function(tipo){
        	var json = {}
        	if(tipo == "polizas"){
        		json.LST_ASEGURADOS = [
    				{
    					"ID_CLIENTE":vm.datos.ID_CLIENTE
    				}
    			];
        	}
        	else if(tipo == "recibos"){
        		json.OPAGADOR = {"NU_DOCUMENTO":vm.datos.NU_DOCUMENTO};
        	}
        	else if(tipo == "solicitud" || tipo == "presupuestos"){
        		json.OCLIENTE = {"ID_CLIENTE":vm.datos.ID_CLIENTE};
        	}
        	else if(tipo == "siniestros"){
        		json.OPOLIZA = {"LST_ASEGURADOS":[{"ID_CLIENTE":vm.datos.ID_CLIENTE}]};
        	}
        	else if(tipo == "riesgos"){
        		json = {"ID_CLIENTE":vm.datos.ID_CLIENTE};
        	}
        	vm.parent.searchFromDetalle(json, tipo);
        }	
        	/*vm.json = {};
        	vm.vistaPoliza = 1;
        	vm.vista = 1;
        	
        	if(tipo == "polizas"){
        		vm.json = {
    				LST_ASEGURADOS:[
    					{ID_CLIENTE: vm.parent.datos.ID_CLIENTE}
    				]
        		}
        		
        		if(localStorage.listDPolizas != undefined && localStorage.listDPolizas != ""){
        			vm.gridPolizas.data = JSON.parse(localStorage.listDPolizas);
        			vm.vista = 2
        		}
        		else{
        			BusquedaService.buscar(vm.json, tipo)
        			.then(function successCallback(response){
        				console.log(response);
        				if(response.status === 200){
    						var respuesta = getPolizas(response);
    						if(respuesta.NUMERO_POLIZAS > 0){
    							
    							var respuesta = getPolizas(response);
    	    					if(respuesta.NUMERO_POLIZAS == 1)
    	    						polizas.push(respuesta.POLIZAS.POLIZA);
    	    					else
    	    						polizas = respuesta.POLIZAS.POLIZA
    	    					
    							sharePropertiesService.set('polizas', respuesta.POLIZAS.POLIZA);
    	                     	vm.gridPolizas.data = sharePropertiesService.get('polizas');
    	                     	localStorage.listDPolizas = JSON.stringify(polizas);
    	                     	vm.totalItems = respuesta.NUMERO_POLIZAS;
    	                     	
    	                     	//Cambio de vista
    	                        vm.vista = 2
    						}
    						else{
    							vm.vista = 3;
    						}
        				}
        			},function errorCallback(response){
                        if(response.status == 406 || response.status == 401){
                        	vm.busqueda.logout();
                        	$location.path('/');
                        }
                        else{
                        	vm.vista = 3;
                        }

                        alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
                	});
        		}
        		
        		
        	}
        	else{
        		vm.json = {
        			OPAGADOR:{
        				ID_CLIENTE: vm.parent.datos.ID_CLIENTE
        			}
            	}
        		
        		if(localStorage.listDRecibos != undefined && localStorage.listDRecibos != ""){
        			vm.gridRecibos.data = JSON.parse(localStorage.listDRecibos);
        			vm.vista = 2
        		}
        		else{
        			BusquedaService.buscar(vm.json, tipo)
        			.then(function successCallback(response){
        				console.log(response);
        				if(response.status === 200){
    						var respuesta = getRecibos(response);
    						
    						if(respuesta.NUMERO_RECIBOS > 0){
    							
    							var respuesta = getRecibos(response);
    	    					if(respuesta.NUMERO_RECIBOS == 1)
    	    						recibos.push(respuesta.RECIBOS.RECIBOS);
    	    					else
    	    						recibos = respuesta.RECIBOS.RECIBO;
    	    					
    							sharePropertiesService.set('recibos', respuesta.RECIBOS.RECIBO);
    	                     	vm.gridRecibos.data = sharePropertiesService.get('recibos');
    	                     	localStorage.listDRecibos = JSON.stringify(recibos);
    	                     	vm.totalItems = respuesta.NUMERO_RECIBOS;
    	                     	
    	                     	//Cambio de vista
    	                        vm.vista = 2
    						}
    						else{
    							vm.vista = 3;
    						}
        				}
        			},function errorCallback(response){
                        if(response.status == 406 || response.status == 401){
                        	vm.busqueda.logout();
                        	$location.path('/');
                        }
                        else{
                        	vm.vista = 3;
                        }

                        alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
                	});
        		}
        		
        		
        	}*/
        
        vm.openRecibo = function(){
        	var uibModalInstance = $uibModal.open({
                template:'<detalle-poliza-modal></detalle-poliza-modal>', 
                plain: true,
                size: 'lg',
                windowClass: 'app-modal-window',
                component: 'detallePolizaModal'
               
            });
//        vm.openRecibo = function(){
//        	var uibModalInstance = $uibModal.open({
//                template:'<detalle-cliente-modal></detalle-cliente-modal>', 
//                plain: true,
//                size: 'lg',
//                windowClass: 'app-modal-window',
//                component: 'detalleClienteModal'
//                
//            });
        }
        
      //Deshacer el formulario modificado
    	vm.deshacer = function(){
            vm.form = JSON.parse(backupJSON);
            vm.domicilios = JSON.parse(backupJSONDomicilios);
            vm.bancos = JSON.parse(backupJSONBancos);
		}
		
		vm.resetErrors = function (id) {
			vm.form[id].$error = {};
		}

		function validateCIF(doc) {
			//Quitamos el primer caracter y el ultimo digito
			var valuedoc = doc.substr(1, doc.length - 2);
	
			var suma = 0;
	
			//Sumamos las docras pares de la cadena
			for (var i = 1; i < valuedoc.length; i = i + 2) {
				suma = suma + parseInt(valuedoc.substr(i, 1));
			}
	
			var suma2 = 0;
	
			//Sumamos las docras impares de la cadena
			for (var i = 0; i < valuedoc.length; i = i + 2) {
				var result = parseInt(valuedoc.substr(i, 1)) * 2;
				if (String(result).length == 1) {
					// Un solo caracter
					suma2 = suma2 + parseInt(result);
				} else {
					// Dos caracteres. Los sumamos...
					suma2 = suma2 + parseInt(String(result).substr(0, 1)) + parseInt(String(result).substr(1, 1));
				}
			}
	
			// Sumamos las dos sumas que hemos realizado
			suma = suma + suma2;
	
			var unidad = String(suma).substr(String(suma).length - 1, 1);
			unidad = 10 - parseInt(unidad);
	
			var primerCaracter = doc.substr(0, 1).toUpperCase();
	
			if (primerCaracter.match(/^[FJKNPQRSUVW]$/)) {
				//Empieza por .... Comparamos la ultima letra
				if (String.fromCharCode(64 + unidad).toUpperCase() == doc.substr(doc.length - 1, 1).toUpperCase())
					return true;
			} else if (primerCaracter.match(/^[XYZ]$/)) {
				//Se valida como un dni
				var newdoc;
				if (primerCaracter == "X")
					newdoc = doc.substr(1);
				else if (primerCaracter == "Y")
					newdoc = "1" + doc.substr(1);
				else if (primerCaracter == "Z")
					newdoc = "2" + doc.substr(1);
				return validateDNI(newdoc);
			} else if (primerCaracter.match(/^[ABCDEFGHLM]$/)) {
				//Se revisa que el ultimo valor coincida con el calculo
				if (unidad == 10)
					unidad = 0;
				if (doc.substr(doc.length - 1, 1) == String(unidad))
					return true;
			}
			msg.textContent('Formato erroneo de CIF');
			$mdDialog.show(msg);
			return false;
		}
		//Funcion para validar DNI y NIE
		function validateDNI(documento) {
			var numero, lt, ltra;
			var expresion_regular_dni_nie = /^[XYZ]?\d{5,8}[A-Z]$/;
	
			if(documento != undefined) {
				documento = documento.toUpperCase();
	
				if (expresion_regular_dni_nie.test(documento) === true) {
					numero = documento.substr(0, documento.length - 1);
					numero = numero.replace('X', 0);
					numero = numero.replace('Y', 1);
					numero = numero.replace('Z', 2);
					//lt2 = documento.substr(0,1);
					lt = documento.substr(documento.length - 1, 1);
					numero = numero % 23;
					ltra = 'TRWAGMYFPDXBNJZSQVHLCKET';
					ltra = ltra.substring(numero, numero + 1);
					if (ltra != lt) {
						if (vm.form.ID_TIPO_DOCUMENTO.value === 1) {
							msg.textContent('La letra del NIF/DNI no se corresponde')
							$mdDialog.show(msg);
						} else if (vm.form.ID_TIPO_DOCUMENTO.value === 4) {
							msg.textContent('La letra no se corresponde con el NIE')
							$mdDialog.show(msg);
						}
	
						return false;
					} else {
						return true;
					}
				} else {
					if (vm.form.ID_TIPO_DOCUMENTO.value === 1) {
						msg.textContent('NIF/DNI erroneo, formato no válido')
						$mdDialog.show(msg);
					} else if (vm.form.ID_TIPO_DOCUMENTO.value === 4) {
						msg.textContent('NIE erroneo, formato no válido')
						$mdDialog.show(msg);
					}
					return false;
				}
			}
		}
		
		//recuperar documentación ya subida (desde padre)
        vm.getDocuments = function(){
			// var idCliente = vm.datos.ID_CLIENTE;
			// var ruta = 'clientes\\'+ idCliente;
			// vm.appParent.getDocuments(ruta, 228);
			if(vm.datos.ID_CLIENTE) {
				FicherosService.getFicherosType({'ID_TIPO': 228, 'NO_RUTA': `clientes/${vm.datos.ID_CLIENTE}`})
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0) {
							vm.listaArchivos =  response.data.RESULT;
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
  		// vm.refreshList =  function() {	
  		// 	if(vm.appParent.archives_clientes != null){
  		// 		for(var i = 0; i < vm.appParent.archives_clientes.length; i++)  {
  		// 			if(!vm.listaArchivos.find( archivo => archivo.ID_ARCHIVO === vm.appParent.archives_clientes[i].ID_ARCHIVO))
  		// 				vm.listaArchivos.push(vm.appParent.archives_clientes[i]);
  		// 			else
  		// 				break;
  		// 		}
  		// 	}
  		// }
  		
		//subir documentación
		$(document).on('change', '#file_pol', function(e) {
			if(e) {
				$scope.$apply();
				if(document.getElementById('file_pol').files != null && document.getElementById('file_pol').files.length > 0 != null){
					
                    for (var i = 0; i < document.getElementById('file_pol').files.length; i++) {
                    	var f = document.getElementById('file_pol').files[i];

						vm.nombreArchivoMov = f.name;
						vm.archivo = null;
						vm.listaArchivosCliente = []

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
							var fileName = readerEvt.target.filename;
							fileName = fileName.split(".");
							if (fileName.length > 1) {
								fileName[0] = vm.appParent.changeSpecialCharacters(fileName[0]);
							}
							fileName = fileName.join('.');

							vm.listaArchivosCliente.push({
								ARCHIVO: bytes,
								NO_ARCHIVO: fileName,
								ID_TIPO: 228
							});

							$scope.$apply();

							vm.subirFicheros();
						}

						reader.readAsDataURL(f);
                    }

                    e.stopImmediatePropagation();
				}
			}
			
			
			
//			if(e) {
//				vm.idCliente = vm.datos.ID_CLIENTE;
//				$scope.$apply();
//				if(document.getElementById('file_pol').files[0] != null){
//					var f = document.getElementById('file_pol').files[0];
//					vm.appParent.getBase64(f, 228);
//				}
//			}
		});

		vm.subirFicheros = function () {
			if (vm.listaArchivosCliente != null && vm.listaArchivosCliente.length > 0 && vm.datos.ID_CLIENTE != null) {
				var obj = {
					FICHEROS: vm.listaArchivosCliente,
					ID_CLIENTE: vm.datos.ID_CLIENTE
				}
				vm.appParent.abrirModalcargar(true);
                // document.getElementById("file_pol").value = null;
				FicherosService.sendDocumentation(obj, 'clientes')
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							msg.textContent("Se ha enviado la documentación correctamente");
							$mdDialog.show(msg);
							vm.listaArchivosCliente = [];
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
			}
		}

		$scope.$watch('$ctrl.files', function () {
			vm.upload(vm.files);
		});

		vm.upload = function(files) {
			if(files && files.length > 0) {
				vm.listaArchivosCliente = [];
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
								'ID_TIPO': 228
							};
							
							$scope.$apply(function() {
								vm.listaArchivosCliente.push(file);
							});
							if(vm.listaArchivosCliente.length == files.length) {
								vm.subirFicheros();
							}
							console.log(i);
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
			
		}
		
		vm.deleteFile = function(file) {
			// for(var i = 0; i < vm.listaArchivos.length; i++){
			// 	if(vm.listaArchivos[i].NO_ARCHIVO === file.NO_ARCHIVO){
			// 		vm.listaArchivos.splice(i, 1);
			// 		break;
			// 	}
			// }
			// if(file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined){
			// 	vm.appParent.deleteArchive(file.ID_ARCHIVO);
			// 	vm.listaArchivos.splice(i, 1);
			// }
			if(!file.ESTADO) {
				vm.listaArchivos.splice(index, 1);
			} else {
				if(file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined) {
					vm.appParent.deleteArchive(file.ID_ARCHIVO);
					vm.getDocuments();
				}
			}
		}
		
		//Refrescar lista de archivos
		vm.refData = function(){		
    	   for(var i = 0; i < vm.appParent.listArchivos.length; i++)  {
    		   vm.listaArchivos.push(vm.appParent.listArchivos[i]);
			}
		}
    	
    	vm.cargarHistorico = function () {
    		var json = {
	    		"ID_CLIENTE":vm.datos.ID_CLIENTE,
	    		"IS_SELECTED":true
	    	};

			vm.appParent.abrirModalcargar(true);
	    	BusquedaService.buscar(json, "clientes")
			.then(function successCallback(response){
				var clientes = [];
				if(response.data.ID_RESULT == 0){
					var respuesta = response.data;
					if(respuesta.NUMERO_CLIENTES > 0){
						clientes = respuesta.CLIENTES.CLIENTE;        				
                     	vm.gridOptionsHistorico.data = respuesta.CLIENTES.CLIENTE;
        				$mdDialog.cancel();
					} else {
						msg.textContent('No se han encontrado históricos para este cliente');
						$mdDialog.show(msg);
					}
                } else {
    				msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
    				$mdDialog.show(msg);
                }
			},function errorCallback(response){
				msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
				$mdDialog.show(msg);
			});
    	}
    	
    	vm.gridOptionsHistorico = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
		    paginationPageSize: 15,
		    columnDefs: [
			  {field: 'DS_TIPO_DOCUMENTO', displayName: 'Tipo Documento', width: '5%'},
		      {field: 'NU_DOCUMENTO', displayName: 'Documento'},
			  {field: 'NO_NOMBRE_COMPLETO', displayName: 'Nombre y Apellidos', width: "20%"},
		      {field: 'NO_EMAIL', displayName: 'Email'},
		    //   {field: 'DS_TIPOEMPLEADO', displayName: 'Partner'},
		      {field: 'NU_TELEFONO1', displayName: 'Teléfono'},
		      {field: 'FT_USU_ALTA', displayName: $translate.instant('DATE_DISCHARGE'),  cellFilter: 'date:\'dd/MM/yyyy\'',}
		    ]
    	}
    	
    	vm.changeTipoDocumento = function () {
    		if (vm.form.ID_TIPO_DOCUMENTO.value == '4') {
    			vm.form.CO_NACIONALIDAD.value = null;
    		} else if (vm.form.ID_TIPO_DOCUMENTO.value == '1' || vm.form.ID_TIPO_DOCUMENTO.value == '2') {
    			vm.form.CO_NACIONALIDAD.value = 'ESP';
    		}
    	}
        
        vm.checkDocument = function () {
        	var valValue = false;
        	if (vm.form != null && vm.form.ID_TIPO_DOCUMENTO.value != null && vm.form.NU_DOCUMENTO.value != null) {
        		ClienteService.validaTipoDocumento({ 'NU_DOCUMENTO': vm.form.NU_DOCUMENTO.value, 'ID_TIPO_DOCUMENTO': vm.form.ID_TIPO_DOCUMENTO.value })
				.then(function successCallback(response) {
					if(response.status == 200) {
						if (vm.formCliente && vm.formCliente.documentNumber && response.data != null) {
							vm.formCliente.documentNumber.$setValidity('docValidation', response.data);
						}
					}
				}, function callBack(response) {
					vm.formCliente.documentNumber.$setValidity('docValidation', false);
				});
        	}
        }
    }   

    ng.module('App').component('clienteSd', Object.create(clienteComponent));
    
})(window.angular);


