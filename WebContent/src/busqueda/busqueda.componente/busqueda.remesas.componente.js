(function(ng) {	


	//Crear componente de busqueda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', '$mdDialog', '$scope', 'validacionesService', 'sharePropertiesService', 'TiposService', 'BusquedaService', 'ReciboService', 'BASE_SRC'],
    		require: {
            	parent:'^busquedaApp',
    			appParent: '^sdApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window, $mdDialog, $scope, validacionesService, sharePropertiesService, TiposService,BusquedaService, ReciboService, BASE_SRC){
    	var vm=this;
    	var json = {};
    	var url = $location.url();
		vm.numDetalles = [];
        vm.nomDetalles = [];
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
    	
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('remesas_list');
				vm.parent.ckPermisos = vm.permisos;
    		}
			
    		//Cargar las listas
			if(localStorage.remesas != undefined && localStorage.remesas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.remesas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
    	}
    	
    	//Reaccionar los cambios por los componentes
    	this.$onChanges = function(){
    		vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
    		vm.gridOptions.data = vm.listBusqueda;
    		vm.active = 0;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
		//UI.GRID Configurado
		vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			enableRowSelection: true,
			enableSelectionAll: true, 
			selectionRowHeaderWidth: 29,
			//enableColumnResizing: true,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
			  
			  {field: 'ID_RECIBO_REMESA', displayName: 'Remesa', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalleRemesa(row.entity,\'detalleRemesaList\', row)">{{row.entity.ID_RECIBO_REMESA}}</a></div>'},
			  {field: 'DS_TIPORECIBO', displayName: 'Partner'},
			  {field: 'DS_SITUARECIBO', displayName: 'Estado'},
			  {field: 'NO_COMPANIA', displayName: 'Aseguradora'},
			  {field: 'NO_RAMO', displayName: 'Ramo'},
			  {field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Vía de pago'},
			  {field: 'IM_RECIBO_TOTAL', displayName: 'Importe total'},
			  {field: 'IM_PRIMANETA', displayName: 'Prima neta'},
			  {field: 'IM_COMISION', displayName: 'Comisión'},
			  {field: 'FD_EMISION', displayName: 'Fecha Emsión', cellFilter: 'date:\'dd/MM/yyyy\''},
			  {field: 'FD_SAP', displayName: 'Fecha Contabilidad', cellFilter: 'date:\'dd/MM/yyyy\''},
			  {field: 'NU_SAP', displayName: 'Nº Envío SAP'}, 
			  {field: 'NO_USU_ALTA', displayName: 'Creado por'}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
				
				vm.listaSeleccionados = [];
				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				//     vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				// });
				// gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
				//     vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				// });
				
				gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					console.log("Recibo " + fila.entity.ID_RECIBO_REMESA + " seleccionado: " + fila.isSelected);
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
				});
				gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
//            	            filas.forEach(vm.elementoSeleccionado);
//            	        	vm.listaSeleccionados = filas;
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
				});
			  }
		}

    	vm.gridRecibos = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			enableRowSelection: true,
			enableSelectionAll: true, 
			selectionRowHeaderWidth: 29,
			//enableColumnResizing: true,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
			  
			  {field: 'NU_RECIBO', displayName: 'Recibo', cellTooltip: function (row) { return row.entity.NU_RECIBO }},
			  {field: 'OPOLIZA.NU_POLIZA', displayName: 'Póliza', cellTooltip: function (row) { return row.entity.OPOLIZA.NU_POLIZA }},
			  {field: 'OPAGADOR.NO_NOMBRE_COMPLETO', displayName: 'Cliente', cellTooltip: function (row) { return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO },},
			  {field: 'OPOLIZA.DS_TIPO_POLIZA', displayName: 'Colectivo', cellTooltip: function (row) { return row.entity.OPOLIZA.DS_TIPO_POLIZA }},
			  {field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Vía de pago', cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },},
			  {field: 'DS_SITUARECIBO', displayName: 'Estado', cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },},
			  {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function (row) { return row.entity.NO_COMPANIA },},
			  {field: 'NO_RAMO', displayName: 'Ramo', cellTooltip: function (row) { return row.entity.NO_RAMO },},
			  {field: 'IM_RECIBO_TOTAL', displayName: 'Importe total', cellFilter: 'currency:"€" : 2',},
			  {field: 'IM_COMISION', displayName: 'Comisión', cellFilter: 'currency:"€" : 2',},
			  {field: 'FD_INICIO_REC', displayName: 'Fecha de Inicio', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) { return row.entity.FD_INICIO_REC },},
			  {field: 'NO_USU_ALTA', displayName: 'Creado por', cellTooltip: function (row) { return row.entity.NO_USU_ALTA },},
			  {field: 'FD_SAP', displayName: 'Fecha Contabilidad', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) { return row.entity.FD_SAP },},
			  {field: 'ID_RECIBO_REMESA', displayName: 'Remesa', cellTooltip: function (row) { return row.entity.ID_RECIBO_REMESA }},
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiRecibos = gridApi;
				
				vm.listaSeleccionados = [];
				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				//     vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				// });
				// gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
				//     vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				// });
				
				gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					console.log("Recibo " + fila.entity.ID_RECIBO_REMESA + " seleccionado: " + fila.isSelected);
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
				});
				gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
//            	            filas.forEach(vm.elementoSeleccionado);
//            	        	vm.listaSeleccionados = filas;
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
				});
			  }

	}

    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function(){
			return BASE_SRC+"busqueda/busqueda.view/busqueda.remesas.html";
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
		} 

		//Abrir modal de nueva remesa
        vm.openNewRemesa = function() {
    		var existe = false;
        	for(var i = 0; i < vm.numDetalles.length; i++) {
        		if(vm.numDetalles[i] === null){
        			existe = true;
        			break;
        		}
        	}
        	if(!existe) {
                if(vm.numDetalles.length < 1) {
                    vm.numDetalles.push(null);
                    vm.nomDetalles.push('remesa');
                    vm.active = vm.numDetalles.length;
                    vm.actives = vm.numDetalles.length + 1;
                    vm.cargarDetalle = false;
                } else {
                	vm.numDetalles = [];
                    vm.nomDetalles = [];
                    setTimeout( function () { 
                            vm.numDetalles.push(null);
                            vm.nomDetalles.push('remesa');
                            vm.active = vm.numDetalles.length;
                        }, 
                    10);
                }
            } else {
                msg.textContent('Hay un nuevo formulario de póliza abierto');
                $mdDialog.show(msg);
            }
    		
		}
		
        vm.verDetalleRemesa = function(fila,key,index){

			vm.fila = fila;
        	vm.key = key;
        	vm.index = index;

			ReciboService.getRecibos({"ID_RECIBO_REMESA": fila.ID_RECIBO_REMESA, "IS_NEW":true})
			.then(function successCallback(response) {
				if(response.status == 200){
					if(response.data.RECIBOS!=undefined){
						vm.gridRecibos.data = response.data.RECIBOS.RECIBO;
						vm.cargar = false;
						cargarDetalle(vm.fila, key);
						
					} else if(response.data.ID_RESULT != 0){
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
						
					} else {
						msg.textContent("No se ha encontrado ningún recibo");
						$mdDialog.show(msg);
					}
				}

			}, function errorCallBack(response) {
				vm.cargar = false;
			});

		}
    	
    	//Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
    	vm.verDetalle = function(fila, key, index){
			cargarDetalle(fila);
			
			// vm.vista = 5;
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index, event){
    		vm.numDetalles.splice(index,1);
    		vm.nomDetalles.splice(index,1);
    		vm.active = vm.numDetalles.length;
    	}
    	
    	vm.bloquearRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == true || vm.listaSeleccionados[i].NU_SAP != undefined ){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/bloquear_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                    var md = this;
		                    var lista = vm.listaSeleccionados;
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.bloqRecibo = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
	                					if(lista[i].IN_BLOQUEADO == false){
	                						lista[i].IN_BLOQUEADO = true;
	                					}
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	////	                        		recibos[i] = {'RECIBO':lista[i]};
	//	                        		recibos = {'RECIBO':lista[i]};
	//                        		}
		                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();
		                        	
		                        	ReciboService.bloqRecibo(obj)
		                			.then(function successCallback(response) {
		                				
//		                				vm.abrirDialogo("Recibos bloqueados correctamente");
		                				vm.parent.recargarListado();
		                				setTimeout(function(){ 
											msg.textContent("Recibos bloqueados correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                    	vm.parent.parent.logout();
		                                    }
		                                })
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.desbloquearRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == false || vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/desbloquear_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                    var md = this;
		                    var lista = vm.listaSeleccionados;
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.desbloqRecibo = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
	                					if(lista[i].IN_BLOQUEADO == true){
	    									lista[i].IN_BLOQUEADO = false;
	                					}
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	//	                        		recibos[i] = {'RECIBO':lista[i]};
	//                        		}
	//	                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();
		                        	
		                        	ReciboService.bloqRecibo(obj)
		                			.then(function successCallback(response) {
		                				
//		                				vm.abrirDialogo("Recibos desbloqueados correctamente");
		                				vm.parent.recargarListado();
		                				setTimeout(function(){ 
											msg.textContent("Recibos desbloqueados correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                        vm.parent.parent.logout();
		                                    }
		                                })
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén bloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.cambiarFContRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
				
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/cambiarfecha_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var md = this;
		                    var lista = vm.listaSeleccionados;
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.updateFDContab = function (option) {
								rellenarJSON(md.form);
		                        if (option) {
		                        	
		                        	var nuevaFecha = md.form.FD_SAP;
		                        	// nuevaFecha.setDate(nuevaFecha.getDate()+1); 
		                        		                        	
		                        	for(var i = 0; i < lista.length; i++){
			        					// if(lista[i].FD_SAP != undefined){
			        						lista[i].FD_SAP = nuevaFecha;
	//		        						lista[i].FD_SAP = md.dateFormat(nuevaFecha);
			        					// }
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	//	                        		recibos[i] = {'RECIBO':lista[i]};
	//                        		}
		                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();
		                        	
		                        	ReciboService.updateFDContab(obj)
		                			.then(function successCallback(response) {
		                				
	//	                				vm.abrirDialogo("Fecha de contabilización modificada correctamente");
		                				vm.parent.recargarListado();
		                				setTimeout(function(){
											msg.textContent("Fecha de contabilización modificada correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                    	vm.parent.parent.logout();
		                                    }
		                                })
		                        	
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				} else {
					msg.textContent('Revise que los recibos seleccionados no estén enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.enviarsapRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				tarjeta = false;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == true || vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/enviarsap_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var md = this;
		                    var lista = vm.listaSeleccionados;
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.enviarSAP = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
			        					if(lista[i].IN_BLOQUEADO == false){
			        						if(lista[i].IN_ENVIO_LIQ_SAP == false){
			        							lista[i].IN_ENVIO_LIQ_SAP = true;
			        						}
			        					}
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	//	                        		recibos[i] = {'RECIBO':lista[i]};
	//                        		}
		                        	
		                        	for(var i = 0; i < lista.length; i++){
                                        if(lista[i].ID_TIPO_MEDIO_PAGO == 1){
                                            msg.textContent("No se pueden enviar recibos de pago con tarjeta de forma manual.");
                                            $mdDialog.show(msg);
                                            tarjeta = true;
                                        }
                                    }        
                                    
                                    obj['RECIBOS'] = {};
                                    obj['RECIBOS']['RECIBO'] = lista;
                                    
                                    $mdDialog.cancel();
                                                                        if(tarjeta != true){
                                        ReciboService.enviarSAP(obj)
                                        .then(function successCallback(response) {
                                            if (response.status === 200) {
                                                if(response.data.ID_RESULT == 0){
                                                    vm.parent.recargarListado();
                                                    setTimeout(function(){ 
                                                        msg.textContent("Envio a SAP realizado correctamente");
                                                        $mdDialog.show(msg);
                                                    }, 2000);
                                                }else{
                                                    msg.textContent(response.data.DS_RESULT);
                                                    $mdDialog.show(msg);
                                                }
                                              }
                                            }, function errorCallback(response) {                                        
                                                msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
                                                $mdDialog.show(msg);
                                                if (response.status == 406) {
                                                    vm.parent.parent.logout();
                                                }
                                            });
                                    }
                                }else
                                    $mdDialog.cancel();
                            }
                        }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}

		function rellenarJSON(form){
			angular.forEach(form, function(value, key){
				
				if(value.value instanceof Date){
					value=vm.appParent.dateFormat(value.value);
					console.log(value);
					form[key]=value;
				}
    		});
		}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Función para cargar los datos al abrir el tab.
    	function cargarDetalle(fila, key){
    		if(!vm.numDetalles.includes(fila)){
    			//Para intercambiar en la misma pestaña
                if (vm.numDetalles.length > 0) {
                    vm.numDetalles = [];
                	vm.nomDetalles = [];
                    setTimeout( function () { 
                            vm.numDetalles.push(fila);
                            vm.nomDetalles.push(key);
                            vm.active = vm.numDetalles.length;
                        }, 
                    10);
                } else {
                    vm.numDetalles.push(fila);
                    vm.nomDetalles.push(key);
                    vm.active = vm.numDetalles.length;
                }
    		}else{
    			vm.active = vm.numDetalles.length;
    		}
    	}
    }

    
    ng.module('App').component('busquedaRemesas', Object.create(busquedaComponent));
    
})(window.angular);