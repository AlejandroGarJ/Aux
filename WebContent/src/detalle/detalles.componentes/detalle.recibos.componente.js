(function(ng) {	

	//Crear componente de app
    var reciboComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q','$scope', '$location', '$mdDialog', '$translate', 'BusquedaService', 'TiposService', 'ComisionService', 'ReciboService', 'PolizaService', 'ExportService', 'BASE_SRC', 'FicherosService', 'CommonUtils'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			//appRecibo: '^busquedaRecibo',
				busqueda:'^busquedaApp',
				busquedaRecibo: '^?busquedaRecibo'
    		}
    }
    
    reciboComponent.controller = function reciboComponentControler($q, $scope, $location, $mdDialog, $translate, BusquedaService, TiposService, ComisionService, ReciboService, PolizaService, ExportService, BASE_SRC, FicherosService, CommonUtils){
    	var vm=this;
    	var url=window.location;
    	vm.form = {};
    	vm.tipos = {};
    	vm.isNuevo = false; 
    	vm.isError = false;
    	var nLoad = 0;
    	vm.disabledEstado = false;
		vm.medida = 0;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
		vm.disabledTxt = true;
		vm.rol = sessionStorage.rol;
		vm.url = window.location.hash;
		vm.listaArchivos = [];
		
    	this.$onInit = function(bindings) {
    		
			//Cargar permisos
			// vm.permisos = vm.busquedaRecibo.permisos;
    		if(vm.parent.parent.parent.getPermissions != undefined) {
    			var urlComprobarPermisos = "";
				if($location.$$path == '/recibos_list') {
					vm.permisos = vm.parent.parent.parent.getPermissions('recibos_list');
    			    urlComprobarPermisos = "recibos_movimientos_list";
				} else {
					vm.permisos = vm.parent.parent.parent.getPermissions('recibos_movimientos_list');
    			    urlComprobarPermisos = "recibos_list";
				}

				//Si no existen menús con ese código, se prueba con el otro
	    		if(vm.permisos.EXISTE == false){
	                vm.permisos = vm.parent.parent.parent.getPermissions(urlComprobarPermisos);
//	                vm.parent.ckPermisos = vm.permisos;
	    		}
    		}
    		vm.datos = JSON.parse(JSON.stringify(vm.parent.datos));
    		vm.datosCopy = JSON.parse(JSON.stringify(vm.datos));
    		vm.colectivos = vm.parent.colectivos;
			//vm.tipos = vm.appRecibo.tipos;
    		
    		//Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
    		//Parámetro utilizado en: ng-style="resizeHeight({{$ctrl.medida}})"
    		if(vm.parent.parent.url == 'recibos' || vm.parent.parent.url == 'ultRecibos')
    			vm.medida = 276;
    		else if(vm.parent.parent.url == 'clientes' || vm.parent.parent.url == 'polizas')
    			vm.medida = 315;
    			
    		if(vm.datos != null){
    			
    			if (vm.datos.FT_USU_MOD == undefined)
                	vm.datos.FT_USU_MOD = null;
    			
    			angular.forEach(vm.datos, function(values, key){
    				
	    			vm.form[key] = {};
	            	if(vm.form[key] != undefined) {
	            		if(key == "FD_EMISION" || key == "FD_INICIO" || key == "FD_VENCIMIENTO" || key == "FD_COBRO") {
							vm.form[key].value = new Date(values);
						} else {
							vm.form[key].value = values;
						}
					}
					// Pasar a null la fecha de cobro si es undefined para el datepicker
					if(vm.datos.FD_COBRO == undefined) {
						// vm.datos.FD_COBRO = {};
						vm.datos.FD_COBRO = null;
	            	}
	            	
	            });
                backupJSON = JSON.stringify(vm.datos);
    		}
    		else{
    			vm.isNuevo = true;
    			/*$q.all({'datosRequest':validacionesService.getData(), 'dictRequest':validacionesService.getDict()}).then(function(data){
	    			vm.form = data.datosRequest.data;
	    			vm.dictionary = data.dictRequest.dict;
	    		});*/
    		}
    		
    		vm.nuForm = Object.keys(vm.form).length;
    		
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
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listMonedas != null && vm.appParent.listServices.listMonedas.length > 0){
    			vm.tipos.monedas = vm.appParent.listServices.listMonedas;
    		} else {
    			TiposService.getMonedas()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.monedas = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listMonedas = vm.tipos.monedas;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
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
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listMedioPago != null && vm.appParent.listServices.listMedioPago.length > 0){
    			vm.tipos.pago = vm.appParent.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.pago = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listMedioPago = vm.tipos.pago;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listSituaRecibo != null && vm.appParent.listServices.listSituaRecibo.length > 0){
    			vm.tipos.situaRecibo = vm.appParent.listServices.listSituaRecibo;
    			arrancar();
    		} else {
    			TiposService.getSituaRecibo({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.situaRecibo = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listSituaRecibo = vm.tipos.situaRecibo;
    					arrancar();
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listTiposRecibo != null && vm.appParent.listServices.listTiposRecibo.length > 0){
    			vm.tipos.tiposRecibo = vm.appParent.listServices.listTiposRecibo;
    			arrancar();
    		} else {
    			TiposService.getTiposRecibo()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposRecibo = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listTiposRecibo = vm.tipos.tiposRecibo;
    					arrancar();
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.appParent.listServices.listFormaPago != null && vm.appParent.listServices.listFormaPago.length > 0){
    			vm.tipos.formasPago = vm.appParent.listServices.listFormaPago;
    		} else {
    			TiposService.getFormasPago({})
        		.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.formasPago = response.data.TIPOS.TIPO;
    					vm.appParent.listServices.listFormaPago = vm.tipos.formasPago;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
			var idPagador;
			var idPoliza;
			if($location.$$url == '/clientes_main') {
				if(angular.element('#idCliente').val() != undefined) {
					idPagador = angular.element('#idCliente').val();
				}
			} else if ($location.$$url == '/recibos_movimientos_list' || $location.$$url == '/recibos_list') {
				if(vm.parent.datos.OPAGADOR.ID_CLIENTE != undefined) {
					idPagador = vm.parent.datos.OPAGADOR.ID_CLIENTE;
				} else {
					obtenerPoliza();
				}

			} else if($location.$$url == '/polizas_list') {
				obtenerPoliza();
			}
			if(idPagador != undefined) {
				if(vm.datos != null) {
					if(vm.datos.OPOLIZA.ID_POLIZA == undefined) {
						obtenerPoliza();
					} else {
						vm.tipos.polizas = [vm.datos.OPOLIZA];
					}
				} else {
					BusquedaService.buscar({"LST_ASEGURADOS":[
						{"ID_CLIENTE": idPagador}
					]}, "polizas")
					.then(function successCallback(response){
						if(response.status == 200){
							vm.tipos.polizas = response.data.POLIZAS.POLIZA;
							if(vm.datos != null)
								vm.tipos.polizas = [vm.datos.OPOLIZA];
						}
					});
				}
				
                if(vm.parent.parent != null && vm.parent.parent.detalleCliente != null && vm.parent.parent.detalleCliente.ID_POLIZA != null){
                    obtenerPoliza();
                }
                
			}

			function obtenerPoliza() {
				idPoliza = vm.parent.parent.detalleCliente.ID_POLIZA;
				PolizaService.getPolizasByFilter({"ID_POLIZA": idPoliza})
				.then(function successCallback(response) {
					vm.tipos.polizas = response.data.POLIZAS.POLIZA;
                    
                    if(vm.datos == null){
                        vm.datos = {};
                    }
                    
					vm.datos.OPOLIZA = vm.tipos.polizas[0];
					vm.addData();
				});
			}
			
			vm.getDocuments();

			// if(angular.element('#idCliente').val() != undefined) {
			// 	idPagador = angular.element('#idCliente').val();
			// } else {
			// 	var listaAsegurados = vm.objetoPoliza.datos.LST_ASEGURADOS;
			// 	for(var i = 0; i < listaAsegurados.length; i++) {
			// 		if(listaAsegurados[i].ID_TIPO_CLIENTE == 1) {
			// 			idPagador = listaAsegurados[i].ID_CLIENTE;
			// 		}
			// 	}
			// }
			// BusquedaService.buscar({"LST_ASEGURADOS":[
			// 	{"ID_CLIENTE": idPagador}
			// ]}, "polizas")
			// .then(function successCallback(response){
			// 	if(response.status == 200){
			// 		vm.tipos.polizas = response.data.POLIZAS.POLIZA;
			// 		if(vm.datos != null)
			// 			vm.tipos.polizas = [vm.datos.OPOLIZA];
			// 	}
			// });
			
			// Dentro del cliente
			// if($location.$$url == '/clientes_main') {
			// 	if(angular.element('#idCliente').val() != undefined){
			// 		BusquedaService.buscar({"LST_ASEGURADOS":[
			// 			{'ID_CLIENTE':angular.element('#idCliente').val()}
			// 		]}, 'polizas')
			// 		.then(function successCallback(response){
			// 			if(response.status == 200){
			// 				vm.tipos.polizas = response.data.POLIZAS.POLIZA;
			// 				if(vm.datos != null)
			// 					vm.tipos.polizas = [vm.datos.OPOLIZA];
			// 			}
			// 		});
			// 	}
			// }

    		// Dentro de la póliza.
			// if ($location.$$url == '/polizas_list') {
			// 	var listaAsegurados = vm.detallePoliza.datos.LST_ASEGURADOS;
			// 	for(var i = 0; i < listaAsegurados.length; i++) {
			// 		if(listaAsegurados[i].ID_TIPO_CLIENTE == 1) {
			// 			var pagador = listaAsegurados[i];
			// 			BusquedaService.buscar({'LST_ASEGURADOS':[
			// 				{'ID_CLIENTE':pagador.ID_CLIENTE}
			// 			]}, 'polizas')
			// 			.then(function successCallback(response){
			// 				if(response.status == 200){
			// 					vm.tipos.polizas = response.data.POLIZAS.POLIZA;
			// 					if(vm.datos != null)
			// 						vm.tipos.polizas = [vm.datos.OPOLIZA];
			// 				}
			// 			});
			// 		}
			// 	}
			// }
    	}

    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.recibos.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.changeEstadoViaPago = function(){
    		if(vm.datos != undefined && vm.datos.ID_RECIBO != undefined){
    			if(vm.datos.ID_TIPO_MEDIO_PAGO != vm.datosCopy.ID_TIPO_MEDIO_PAGO || vm.datos.ID_SITUARECIBO != vm.datosCopy.ID_SITUARECIBO){
    				vm.disabledTxt = false;
    			}else{
    				vm.disabledTxt = true;
    			}
    		}
    	}
    	
    	//Arrancar cuando está todo cargado
    	function arrancar(){
    		nLoad++;
    		if(vm.datos != null && nLoad == 2){

    			vm.tipos.fsituaRecibo = vm.tipos.situaRecibo;

    		} else if (vm.datos == null && nLoad == 2) {
    			vm.tipos.fsituaRecibo = JSON.parse(JSON.stringify(vm.tipos.situaRecibo));
    		}
    	}
    	
    	//Marcha atras
    	vm.atras = function(){
    		window.history.back();
    	}
    	
    	//Abrir la sección
    	vm.mostrarSeccion = function(id,seccion,id2){
            $(seccion).slideDown();
            $(id).hide();
            $(id2).show();
        }
    	
    	//Cerrar la sección
        vm.ocultarSeccion = function(id,seccion,id2){
            $(seccion).slideUp();
            $(id).hide();
            $(id2).show();
        }
	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key){
    		if(key == 'cliente'){
    			localStorage.cliente=JSON.stringify(fila);
    			$location.path('/detalle/clientes');
    		}
    		else{
    			localStorage.cliente=JSON.stringify(fila);
    			$location.path('/detalle/cliente');
    		}
    	}
    	
    	//Filtrar los estados de un recibo por una vía de pago
    	vm.filterSitua = function(){
    		var via = vm.datos.ID_TIPO_MEDIO_PAGO;
    		vm.datos.ID_SITUARECIBO = null;
    		if(via == 2 || via == 3 || via == 4){
    			vm.tipos.fsituaRecibo = _.filter(vm.tipos.situaRecibo, function(n){
    				return (n.ID_SITUARECIBO == 2 || n.ID_SITUARECIBO == 4) 
    			});
    		}
    		else{
    			vm.tipos.fsituaRecibo = _.filter(vm.tipos.situaRecibo, function(n){
    				return ( n.ID_SITUARECIBO == 4) 
    			});
    			vm.datos.ID_SITUARECIBO = 4;
    		}
    	}
    	
    	//Añadir datos por póliza
    	vm.addData = function(){
    		vm.datos.ID_RAMO = vm.datos.OPOLIZA.ID_RAMO;
    		vm.datos.ID_COMPANIA = vm.datos.OPOLIZA.ID_COMPANIA;
    		
            
            if(vm.datos.ID_MONEDA == null){
                vm.datos.ID_MONEDA = "EUR";
            }
            if(vm.datos.IM_TIPO_CAMBIO == null){
                vm.datos.IM_TIPO_CAMBIO = 1;
            }
            
            if(vm.datos.NU_PORCENTAJE_COMI == null && vm.datos.OPOLIZA.NU_COMISION != null){
                vm.datos.NU_PORCENTAJE_COMI = vm.datos.OPOLIZA.NU_COMISION;
            }
            
            if(vm.datos.ID_TIPO_MEDIO_PAGO == null){
                vm.datos.ID_TIPO_MEDIO_PAGO = vm.datos.OPOLIZA.ID_TIPO_MEDIO_PAGO;
            }
            
            if(vm.datos.ID_FORMAPAGO == null){
                vm.datos.ID_FORMAPAGO = vm.datos.OPOLIZA.ID_FORMAPAGO;
            }
            
            //Si la forma de pago es Anual o Única, arrastrar la fecha de inicio, fecha de vencimiento y prima tarifa de la póliza
            if (vm.isNuevo == true && (vm.datos.ID_FORMAPAGO == 1 || vm.datos.ID_FORMAPAGO == 2)) {
                vm.datos.FD_INICIO_REC = vm.datos.OPOLIZA.FD_INICIO;
                vm.datos.FD_VCTO_REC = vm.datos.OPOLIZA.FD_VENCIMIENTO;
                vm.datos.IM_PRIMA_TARIFA = vm.datos.OPOLIZA.IM_PRIMA_NETA;
            }
            
    		//Recoger el pagador de la póliza
            if (vm.isNuevo == true && vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.LST_ASEGURADOS != null){
                for (var i = 0; i < vm.datos.OPOLIZA.LST_ASEGURADOS.length; i++) {
                    var asegurado = vm.datos.OPOLIZA.LST_ASEGURADOS[i];
                    if (asegurado.ID_TIPO_CLIENTE == 1) {
                        vm.datos.OPAGADOR = asegurado;
                        break;
                    }
                }
            } else {
            	//Si no existe el obj OPAGADOR
    			var existePagador = false;
				if (vm.datos.OPAGADOR != null && vm.datos.OPAGADOR.NO_NOMBRE_COMPLETO != null) {
                    existePagador = true;
				}

				if (existePagador == false) {
					if (vm.datos.OPOLIZA != null && vm.datos.OPOLIZA.LST_ASEGURADOS != null) {
						var pagador = vm.datos.OPOLIZA.LST_ASEGURADOS.find(x=> x.ID_TIPO_CLIENTE == 1);
					    var tomador = vm.datos.OPOLIZA.LST_ASEGURADOS.find(x=> x.ID_TIPO_CLIENTE == 3);

                        //Si el pagador existe, añadirle los datos del pagador
                        //Si no, añadirle el nombre del tomador para mostrarlo
                        if (pagador != null) {
                        	vm.datos.OPAGADOR = JSON.parse(JSON.stringify(pagador));
                        } else if (tomador != null) {
                        	vm.datos.OPAGADOR.NO_NOMBRE_COMPLETO = tomador.NO_NOMBRE_COMPLETO;
                        }
					}
				}
            }
    	}
    	
    	//Calcular el importe
    	vm.calcular = function(){
			var tarifa = 0;
			if (vm.datos.IM_PRIMA_TARIFA != null) {
				tarifa = vm.datos.IM_PRIMA_TARIFA.toString().replace(',','.') != undefined ? parseFloat(vm.datos.IM_PRIMA_TARIFA.toString().replace(',','.')) : 0;
			}

            var bonificacion = vm.datos.IM_BONIFICACION != undefined ? parseFloat(vm.datos.IM_BONIFICACION) : 0;
            var recargos = vm.datos.IM_RECARGO != undefined ? parseFloat(vm.datos.IM_RECARGO) : 0;
            var tipoCambio = vm.datos.IM_TIPO_CAMBIO != undefined ? parseInt(vm.datos.IM_TIPO_CAMBIO) : 0;
            var impuestos = vm.datos.IM_IMPUESTOS != undefined ? parseFloat(vm.datos.IM_IMPUESTOS) : 0;
            var consorcio = vm.datos.IM_CONSORCIO != undefined ? parseFloat(vm.datos.IM_CONSORCIO) : 0;
            var clea = vm.datos.IM_CLEA != undefined ? parseFloat(vm.datos.IM_CLEA) : 0;
            var comision = vm.datos.NU_PORCENTAJE_COMI != undefined ? parseInt(vm.datos.NU_PORCENTAJE_COMI) : 0;
            var recConsorcio = vm.datos.IM_REC_CONSORCIO != undefined ? parseFloat(vm.datos.IM_REC_CONSORCIO) : 0;
            var riesgosExt = vm.datos.IM_RIESGOS_EXTRA != undefined ? parseFloat(vm.datos.IM_RIESGOS_EXTRA) : 0;
            var recRiesgosExt = vm.datos.IM_REC_RIESGO_EXTRA != undefined ? parseFloat(vm.datos.IM_REC_RIESGO_EXTRA) : 0;

			vm.datos.IM_PRIMANETA = parseFloat((tarifa - bonificacion + recargos).toFixed(2));
			vm.datos.IM_RECIBO_TOTAL = parseFloat((vm.datos.IM_PRIMANETA + impuestos + consorcio + clea + recConsorcio + riesgosExt + recRiesgosExt).toFixed(2));
			vm.datos.IM_PRIMANETA_EURO = parseFloat((tipoCambio * vm.datos.IM_PRIMANETA).toFixed(2));
			vm.datos.IM_RECIBO_TOTAL_EURO = parseFloat((tipoCambio * vm.datos.IM_RECIBO_TOTAL).toFixed(2));
			vm.datos.IM_COMISION_CALC = parseFloat(((vm.datos.IM_PRIMANETA * comision)/100).toFixed(2));
			vm.datos.IM_COMISION_CALC_EURO = parseFloat((vm.datos.IM_COMISION_CALC).toFixed(2));
			vm.datos.IM_COMISION_CALC = parseFloat(((vm.datos.IM_PRIMANETA * comision)/100).toFixed(2));
			vm.datos.IM_IMPUESTOS_TOTAL = parseFloat((consorcio + clea + impuestos + recConsorcio + riesgosExt + recRiesgosExt).toFixed(2));
    	}
		
    	//Añadir o modificar el recibo
    	vm.nuevoRecibo = function(){
    		if(!vm.formRecibo){
	    		if(vm.isNuevo){
	    			rellenarJSON(vm.datos);
	    			if(!vm.isError)
						var json = JSON.parse(JSON.stringify(vm.datos));
						vm.borrarNulls(json);
	    		} else {
					var json = JSON.parse(JSON.stringify(vm.datos));
					vm.borrarNulls(json);
	    			// var json = {
	        		// 		"ID_RECIBO": vm.datos.ID_RECIBO,
	        		// 		"IT_VERSION": vm.datos.IT_VERSION,
	        		// 		"ID_SITUARECIBO":vm.datos.ID_SITUARECIBO,
	        		// 		"ID_TIPO_MEDIO_PAGO":vm.datos.ID_TIPO_MEDIO_PAGO,
	        		// 		"TX_OBSERVACIONES": vm.datos.TX_OBSERVACIONES
	        		// }
	    		}
	    		
	    		if(!vm.isError) {
					vm.appParent.abrirModalcargar(true);
	    			ReciboService.guardarRecibo(json)
	        		.then(function successCallback(response) {
						if(response.status == 200) {
							if (response.data.ID_RESULT == 0) {
								if(vm.datos.ID_RECIBO != undefined) {
									vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
								} else {
									vm.appParent.cambiarDatosModal('Se ha creado correctamente');
								}
								if (vm.parent.parent.url != "polizas") {
	                            	vm.busqueda.recargarListado();
								} else if (vm.busquedaRecibo != null && vm.busquedaRecibo.numDetalles != null) {
									var indexNuevoRecibo = vm.busquedaRecibo.numDetalles.findIndex(x => x == null);
									if (indexNuevoRecibo > -1) {
										vm.busquedaRecibo.numDetalles.splice(indexNuevoRecibo, 1);
										vm.busquedaRecibo.nomDetalles.splice(indexNuevoRecibo, 1);
									}
								}
							} else {
                            	msg.textContent(response.data.DS_RESULT);
                            	$mdDialog.show(msg);
                            }  
							if (vm.parent.parent.url == "polizas" && vm.busquedaRecibo != null && vm.busquedaRecibo.cargarTablaRecibo != null) {
								vm.busquedaRecibo.cargarTablaRecibo('recibosByPoliza');
							}
						}
	        		}, function errorCallback(response){
						vm.appParent.cambiarDatosModal('Ha ocurrido un error inesperado, por favor, póngase en contacto con el administrador.');
	        		});
	    		}else{
					msg.textContent('Rellene los datos del recibo correctamente');
					$mdDialog.show(msg);
	    		}
    		}else{
				var objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();
				msg.textContent('Rellene los datos del recibo correctamente');
				$mdDialog.show(msg);
    			objFocus.focus();
    		}
		}
		
		vm.borrarNulls = function(json) {
			for(atr in json) {
				if(json[atr] == null) {
					delete json[atr];
				}
			}
		}
    	
    	function rellenarJSON(form){
    		var i = 0;
    		
    		angular.forEach(form, function(value, key){
				if(value instanceof Date){
					value=vm.appParent.dateFormat(value);
					form[key]=value;
				}
				
    			if(key == 'NU_RECIBO' || key == 'OPOLIZA' || key == 'FD_EMISION' || key == 'FD_INICIO_REC' || key == 'FD_VCTO_REC' || key=='ID_SITUARECIBO' || key=='ID_TIPORECIBO' || key=='ID_TIPO_MEDIO_PAGO' || key=='ID_FORMAPAGO' || key=='ID_MONEDA' || key=='IM_TIPO_CAMBIO' || key=='IM_PRIMA_TARIFA'){
    				if(value !== undefined && value !== null && value !== ''){
    					if(key == 'OPOLIZA'){
    						form.ID_POLIZA = value.ID_POLIZA;
    					}
    					
    					//if(key == 'ID_SITUARECIBO')
    					
    					i++;
    				}	
    			}
    		});
    		if(i < 12)
    			vm.isError = true;
    		else
    			vm.isError = false;
    	}
    	
    	//Abrir modal
    	function abrir(status){
			$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/accept.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				md.tipos = {};
    				
    				var md = this;
 				
    				this.$onInit = function(){
    					if(status == 200){
    						if(vm.datos.ID_RECIBO != undefined){
    							md.msg = $translate.instant('MSG_EDITED_SUCCESS')
    						}else{
    							md.msg = "Se ha creado correctamente."
    						}
    						
    					}
    					else{
    						md.msg = "En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros."
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
    		});
    	}
    	
    	
    	//Abrir comisionista
    	vm.openComisionista = function(ev){
    		$mdDialog.show({
    			controller: ComisionistaController,
    			templateUrl: BASE_SRC+'detalle/detalle.modals/comisionista.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    targetEvent: ev,
    		    fullscreen: false
    		})
    	}
    	function ComisionistaController($mdDialog) {
    		var md = this;
    		md.tipos = {};
    		md.selected = [];
    		md.comisionistas = [];
    		md.cargar = false;
    		md.vista = 0;
    		md.cargar = true;
    		BusquedaService.buscar({'ID_RECIBO':vm.datos.ID_RECIBO},'comisionistaByRecibo')
    		.then(function successCallback(response){
    			md.cargar = false;
    			if(response.data.NUMERO_COMISIONISTASRECIBO > 0){
    				md.vista = 0;
        			md.comisionistas = response.data.COMISIONISTASRECIBO.COMISIONISTARECIBO;
    			}else
    				md.vista = 3;
    		})
    		
    		TiposService.getComisionista({})
    		.then(function successCallback(response){
    			md.tipos.comisionistas = response.data.TIPOS.TIPO;
    		});
    		
    		md.toggle = function (item, list) {
    		    var idx = list.indexOf(item);
    		    if (idx > -1) {
    		      list.splice(idx, 1);
    		    }
    		    else {
    		      list.push(item);
    		    }
    		};
    		
    		md.exists = function (item, list) {
    		    return list.indexOf(item) > -1;
    		};
    		
    		md.isIndeterminate = function() {
    		    return (md.selected.length !== 0 &&
    		        md.selected.length !== md.comisionistas.length);
    		  };

    		md.isChecked = function() {
    			if(md.comisionistas != undefined)
    				return md.selected.length === md.comisionistas.length;
    		};

    		md.toggleAll = function() {
    		    if (md.selected.length === md.comisionistas.length) {
    		    	md.selected = [];
    		    } else if (md.selected.length === 0 || md.selected.length > 0) {
    		    	md.selected = md.comisionistas.slice(0);
    		    }
    		};
    		
    		
    		//Añadir nueva comisionista
    		md.addComisionista = function(){
    			if(md.comisionistas != undefined){
    				md.comisionista.ID_RECIBO = vm.datos.ID_RECIBO;
    				md.comisionista.ID_COMP_RAMO_PROD = vm.datos.OPOLIZA.ID_COMP_RAMO_PROD;
    				md.comisionista.ID_TIPOCOLECTIVO = vm.datos.OPOLIZA.ID_TIPO_POLIZA;
    				md.comisionista.IS_NEW = true;
    				md.comisionistas.push(JSON.parse(JSON.stringify(md.comisionista)));
    			}
    		}
    		
    		//Calcular comision
    		md.calcularComision = function(col){
    			col.NU_COMISION = (vm.datos.IM_COMISION * col.NU_PORCENTAJE) / 100;
    			col.NU_COMISION_EURO = col.NU_COMISION;
    			//vm.datos.IM_COMISION
    		}
    		
    		md.eliminarComisionista = function(list){
    			for(var i=0; i<list.length; i++){
    				list[i].IS_DELETED = true;
    			}
    		}
    		
    		 md.editarComisionista = function(comisionista, $index){
    			 if(!comisionista.IS_UPDATED && !comisionista.IS_DELETED)
    				 md.comisionistas[$index].IS_UPDATED = true;
    		 }
    		
    		//Guardar comisionistas
    		md.guardarComisionista = function(){
    			md.cargar = true;
    			ComisionService.saveComisionistasRecibo({"COMISIONISTASRECIBO":{"COMISIONISTARECIBO":md.comisionistas}, "NUMERO_COMISIONISTASRECIBO":md.comisionistas.length})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					for(var i=0; i<md.comisionistas.length; i++){
    						if(md.comisionistas[i].IS_DELETED){
    							var index = md.comisionistas.indexOf(md.comisionistas[i]);
    							if(index > -1){
    								md.comisionistas.splice(index, 1);
    							}
    							i--;
    						}
    					}
    					md.comisionistaGuardado = true;
    				}else{
    					md.comisionistaGuardado = false;
    				}
    				md.cargar = false;
    			},function errorCallback(response){
						md.cargar = false;
						msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
						$mdDialog.show(msg);
		        });
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
    	  }
        
        //Cargar la lista de polizas
        vm.cargarTabla = function(tipo){
    		
        	vm.json = {};
        	
        	if(tipo == "polizas"){
        		vm.json = {
    				LST_ASEGURADOS:[
    					{ID_CLIENTE: vm.parent.datos.ID_CLIENTE}
    				]
        		}
        	}
        	else{
        		vm.json = {
        			OPAGADOR:{
        				ID_CLIENTE: vm.parent.datos.ID_CLIENTE
        			}
            	}
        	}
    		
    		
    		vm.vista=1;
    		
    		BusquedaService.buscar(vm.json, tipo)
			.then(function successCallback(response){
				if(response.status === 200){
					if(tipo == "polizas"){
						var respuesta = getPolizas(response);
						if(respuesta.NUMERO_POLIZAS > 0){
							
							var respuesta = getPolizas(response);
	    					if(respuesta.NUMERO_POLIZAS == 1)
	    						polizas.push(respuesta.POLIZAS.POLIZA);
	    					else
	    						polizas = respuesta.POLIZAS.POLIZA
	    					
							sharePropertiesService.set('polizas', respuesta.POLIZAS.POLIZA);
	                     	vm.gridPolizas.data = sharePropertiesService.get('polizas');
	                     	vm.totalItems = respuesta.NUMERO_POLIZAS;
	                     	
	                     	//Cambio de vista
	                        vm.vista = 2
						}
						else{
							vm.vista = 3;
						}
					}
					else{
						var respuesta = getRecibos(response);
						if(respuesta.NUMERO_RECIBOS > 0){
							
							var respuesta = getRecibos(response);
	    					if(respuesta.NUMERO_RECIBOS == 1)
	    						recibos.push(respuesta.RECIBOS.RECIBOS);
	    					else
	    						recibos = respuesta.RECIBOS.RECIBO;
	    					
							sharePropertiesService.set('recibos', respuesta.RECIBOS.RECIBO);
	                     	vm.gridRecibos.data = sharePropertiesService.get('recibos');
	                     	vm.totalItems = respuesta.NUMERO_RECIBOS;
	                     	
	                     	//Cambio de vista
	                        vm.vista = 2
						}
						else{
							vm.vista = 3;
						}
					}
				}
			},function errorCallback(response){
                if(response.status == 406 || response.status == 401){
                	vm.busqueda.logout();
                }
                else{
                	vm.vista = 3;
                }
				msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
				$mdDialog.show(msg);
        	});
        }
        
        //Deshacer el formulario modificado
    	vm.deshacer = function(){
            vm.datos = JSON.parse(backupJSON);
            vm.parent.idDetalle.NU_RECIBO=vm.datos.NU_RECIBO;

    	}
        
    	//recuperar documentación ya subida (desde padre)
        vm.getDocuments = function(){
			// var idPoliza = vm.datos.OPOLIZA.ID_POLIZA;
			// var idRecibo = vm.datos.ID_RECIBO;
			// var ruta = 'polizas\\'+ idPoliza + '\\recibos\\' + idRecibo ;
			// vm.appParent.getDocuments(ruta, 226);

			if(vm.datos.OPOLIZA.ID_POLIZA && vm.datos.ID_RECIBO) {
				FicherosService.getFicherosType({'ID_TIPO': 226, 'NO_RUTA': `polizas/${vm.datos.OPOLIZA.ID_POLIZA}/recibos/${vm.datos.ID_RECIBO}`})
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
  			if(vm.appParent.archives_recibos != null){
  				for(var i = 0; i < vm.appParent.archives_recibos.length; i++)  {
  					if(!vm.listaArchivos.find( archivo => archivo.ID_ARCHIVO === vm.appParent.archives_recibos[i].ID_ARCHIVO))
  						vm.listaArchivos.push(vm.appParent.archives_recibos[i]);
  					else
  						break;
  				}
  			}
  		}
    	
    	//subir documentación
    	$(document).on('change', '#file_pol', function(e) {
			if(e) {
				vm.idRecibo = vm.datos.ID_RECIBO;
				vm.idPoliza = vm.datos.OPOLIZA.ID_POLIZA;
				$scope.$apply();
				if(document.getElementById('file_pol').files[0] != null){
					var f = document.getElementById('file_pol').files[0];
					vm.appParent.getBase64(f, 226);
				}(file, idArchivo, idTipoArchPol, funcRefresh)
			}
		});

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
								'ID_TIPO': 226,
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

		vm.uploadFiles = function(listaArchivos, tipo, id, idPoliza){
			obj = {};
			obj.FICHEROS = [];
			obj.OPOLIZA = {};
			for(let i = 0; i < listaArchivos.length; i++) {
				if(!listaArchivos[i].ESTADO) {
					obj.FICHEROS.push(listaArchivos[i]);
				}
			}
			obj.ID_RECIBO =  id;
			obj.OPOLIZA.ID_POLIZA =  idPoliza;
				
			if(obj.FICHEROS != null &&  obj.FICHEROS != undefined) {
				
				vm.appParent.abrirModalcargar(true);
				
				FicherosService.sendDocumentation(obj, tipo)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							msg.textContent("Se ha enviado la documentación correctamente");
							$mdDialog.show(msg);
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

		vm.descargarArchivo = function(file) {
			vm.appParent.abrirModalcargar(true);
            ExportService.downloadFile(file.ID_ARCHIVO)
            .then(function successCallback(response) {
                if (response.status === 200) {
                    saveAs(new Blob([response.data]), file.NO_ARCHIVO);
                }
				msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
				$mdDialog.show(msg);
            }, function callBack(response){
                msg.textContent("Se ha producido un error al descargar el archivo");
                $mdDialog.show(msg);
    			vm.cargarArchivos = false;
                if(response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        };
		
		vm.deleteFile = function(file, index) {
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
		
		vm.refData = function(){
    	   for(var i = 0; i < vm.appParent.listArchivos.length; i++)  {
				vm.listaArchivos.push(vm.appParent.listArchivos[i]);
			}
	   }

    }   
    
    
    ng.module('App').component('reciboSd', Object.create(reciboComponent));
    
})(window.angular);


