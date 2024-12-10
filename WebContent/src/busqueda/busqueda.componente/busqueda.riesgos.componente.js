(function(ng) {	

	//Crear componente de busqueda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$timeout', '$window', '$mdDialog', 'PolizaService', 'TiposService', 'BusquedaService', 'BASE_SRC'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
                isConsultagdpr: '<'
            }
    } 
    
    busquedaComponent.controller = function busquedaComponentController($location, $timeout, $window, $mdDialog, PolizaService, TiposService, BusquedaService, BASE_SRC){
    	var vm=this;
    	var json = {};
    	var url = $location.url();
    	vm.numDetalles = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		//Cargar las listas
    		if(/riesgos/.test(url)){
    			if(localStorage.riesgos != undefined && localStorage.riesgos != ""){
    				vm.gridOptions.data = JSON.parse(localStorage.riesgos);
    				vm.vista = 4;
    			}
    			else{
    				localStorage.clear();
    			}
    		}
			
			
    	}
    	
    	//Reaccionar los cambios por los componentes
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		if(vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /riesgos/.test(url)){
    			if(vm.view == 4 && vm.listBusqueda.tipo == "riesgos"){
	    			vm.gridOptions.data = vm.listBusqueda.listas;
	    			//vm.active = vm.dsActive;
	    			vm.active = 0;
	    		}
    			if(/riesgos/.test(url)){
    				vm.gridOptions.data = vm.listBusqueda;
	    			//vm.active = vm.dsActive;
    				vm.active = 0;
    			}
    		}
    		else{
    			vm.vista = 4;
    			vm.active = 0;
			}
			
			if(vm.parent.url == 'clientes'){
                if(vm.view == 4 && vm.listBusqueda.tipo == 'riesgos'){
                    // var idCliente = vm.parent.detalleCliente.LST_ASEGURADOS[0].ID_CLIENTE;
                    var idCliente = vm.parent.detalleCliente.ID_CLIENTE;
                    vm.parent.urlExport = 'riesgos'; 
                    vm.parent.form = {"ID_CLIENTE":idCliente};
                }
            }
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
			treeRowHeaderAlwaysVisible: true,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name: 'NO_RAMO',
					displayName: 'Ramo',
					grouping: {
						groupPriority: 0
					},
					sort: {
						priority: 0,
						direction: 'asc'
					},
					// width: "20%",
					cellTooltip: function(row){return row.entity.NO_RAMO}
				},
				{
					name:'NO_RIESGO',
					displayName:'Riesgo',
					// width: "20%",
					cellTooltip: function(row){return row.entity.NO_RIESGO}
				},
				/*{field: 'NO_COMPANIA',
					displayName: 'Aseguradora',
					// width: "30%",
					cellTooltip: function(row){return row.entity.NO_COMPANIA}
				},*/
				{
					field: 'IM_PRIMA_TOTAL',
					displayName: 'Importe total',
					cellFilter: 'currency:"€" : 2',
					// width: "15%",
					// cellTooltip: function(row){return row.entity.IM_PRIMA_TOTAL}
				},
				{
					field: 'FT_VENCIMIENTO',
					displayName: 'Fecha vencimiento',
					cellFilter: 'date:\'dd/MM/yyyy\'',
					// width: "15%",
					cellTooltip: function(row){return row.entity.FT_VENCIMIENTO}
				},
				{
					name:' ',
					// cellTemplate:'<div ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA == true" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.dialogRisk(\'Editar\', row.entity)">Editar</a></div>',
					cellTemplate:'<div ng-if="row.entity.ID_RIESGO != undefined" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.dialogRisk(\'Editar\', row.entity)">Editar</a></div>',
					width: 48,
					enableSorting:false,
					enableColumnMenu:false
				},
				{
					name:'  ',
					// cellTemplate:'<div ng-if="grid.appScope.$ctrl.permisos.IN_BORRADO == true" class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.deleteRisk(row.entity)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>',
					cellTemplate:'<div ng-if="row.entity.ID_RIESGO != undefined" class="ui-grid-cell-contents td-trash disabled_st"><a ng-click="grid.appScope.$ctrl.deleteRisk(row.entity)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>',
					width: 36,
					enableSorting:false,
					enableColumnMenu:false
				}
			],
			onRegisterApi: function( gridApi ) {
				//vm.grid1Api = gridApi;
				vm.gridApi = gridApi;
				//console.log(gridApi);
				vm.gridApi.grid.registerDataChangeCallback(function() {
					vm.gridApi.treeBase.expandAllRows();
				});
			}
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"busqueda/busqueda.view/busqueda.riesgos.html";
    	}
    	
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}    	
    	
    	//Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
    	vm.verDetalle = function(fila){
    		
    		cargarDetalle(fila);
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(tab){
    		var index = vm.numDetalles.indexOf(tab);
    		vm.numDetalles.splice(index,1);
    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Función para cargar los datos al abrir el tab.
    	function cargarDetalle(fila){
    		if(!vm.numDetalles.includes(fila)){
    			vm.numDetalles.push(fila);
				vm.active = vm.numDetalles.length;

    		}
    	}

		vm.formatDate = function(date) {
        	if(date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())){
        	
        		date = new Date(date);
        		
        		var year = date.getFullYear();
        		
        		var month = date.getMonth() + 1;
        		if(month.toString().length == 1){
        			month = "0" + month;
        		}
        		
        		var day = date.getDate();
        		if(day.toString().length == 1){
        			day = "0" + day;
        		}
        		
        		return year + "-" + month + "-" + day;
        	}
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

		vm.deleteRisk = function(riskData) {
			//PENDIENTE DE TERMINAR
			/*
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/add_risk.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.parent = vm.parent;

					md.deleteRisk = function() {
						var obj = JSON.parse(JSON.stringify(riskData));
						PolizaService.deleteRiesgo(obj.ID_RIESGO, obj.IT_VERSION)
						.then(function successCallback(response) {
							if(response.status == 200){
								if(response.data.ID_RESULT == 0) {
									vm.parent.recargarListado('riesgos');
									// vm.gridOptions.data;
									md.cancel();
								} else {

								}
							}
						}, function errorCallBack(response) {
							if (response.status == 406 || response.status == 401) {
								vm.parent.parent.logout();
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
			})
			*/
		}

		vm.dialogRisk = function(dialogType, riskData) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/add_risk.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.dialogType = dialogType;
					md.lstBranches = [];
					md.parent = vm.parent;

					if(dialogType == 'Editar' && riskData != undefined) {
						md.form = JSON.parse(JSON.stringify(riskData));
						delete md.form.$$hashKey;
					}

					TiposService.getRamos({})
					.then(function successCallback(response) {
						if(response.status == 200){
							if(response.data.TIPOS != undefined){
								md.lstBranches = response.data.TIPOS.TIPO;
								if(dialogType == 'Editar') {
									for(var i = 0; i < md.lstBranches.length; i++) {
										if(md.form.ID_RAMO == md.lstBranches[i].ID_RAMO) {
											md.selBranch = md.lstBranches[i];
											break;
										}
									}
								}
							}
						}
					}, function errorCallBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.parent.parent.logout();
						}
					});

					// TiposService.getCompania({})
					// .then(function successCallback(response) {
					// 	if(response.status == 200){
					// 		md.lstCompanies = response.data.TIPOS.TIPO;
					// 	}
					// }, function errorCallBack(response) {
					// 	if (response.status == 406 || response.status == 401) {
					// 		vm.parent.parent.logout();
					// 	}
					// });
					
					md.saveRisk = function(type) {

						if (md.formAddRisk.$valid) {
							var obj = JSON.parse(JSON.stringify(md.form));
							obj.ID_CLIENTE = vm.parent.detalleCliente.ID_CLIENTE;
							obj.ID_RAMO = md.selBranch.ID_RAMO;
							obj.NO_RAMO = md.selBranch.NO_RAMO;
							obj.FT_VENCIMIENTO = vm.formatDate(md.form.FT_VENCIMIENTO);


			                vm.parent.parent.abrirModalcargar(true, true);
							if(type == 'Nuevo') {
								
								PolizaService.nuevoRiesgo(obj)
								.then(function successCallback(response) {
									if(response.status == 200){
										if(response.data.ID_RESULT == 0) {
											BusquedaService.buscar({'ID_CLIENTE': obj.ID_CLIENTE}, 'riesgos')
											.then(function successCallback(response) {
												if(response.status == 200){
													if(response.data.ID_RESULT == 0) {
														vm.gridOptions.data = response.data.RIESGOS.RIESGO;
														vm.vista = 4;
													}
												}
											}, function errorCallBack(response) {
												if (response.status == 406 || response.status == 401) {
													vm.parent.parent.logout();
												}
											});
											md.cancel();
							      			msg.textContent('Se ha creado correctamente');
											$mdDialog.show(msg);
										} else {
							      			msg.textContent(response.data.DS_RESULT);
											$mdDialog.show(msg);
										}
									}
								}, function errorCallBack(response) {
					      			msg.textContent('Ha ocurrido un error al realizar la operación');
									$mdDialog.show(msg);
									if (response.status == 406 || response.status == 401) {
										vm.parent.parent.logout();
									}
								});

							} else {

								PolizaService.editarRiesgo(obj)
								.then(function successCallback(response) {
									if(response.status == 200){
										if(response.data.ID_RESULT == 0) {
											BusquedaService.buscar({'ID_CLIENTE': obj.ID_CLIENTE}, 'riesgos')
											.then(function successCallback(response) {
												if(response.status == 200){
													if(response.data.ID_RESULT == 0) {
														vm.gridOptions.data = response.data.RIESGOS.RIESGO;
													}
												}
											}, function errorCallBack(response) {
												if (response.status == 406 || response.status == 401) {
													vm.parent.parent.logout();
												}
											});
											md.cancel();
							      			msg.textContent('Se ha guardado correctamente');
											$mdDialog.show(msg);
										} else {
							      			msg.textContent(response.data.DS_RESULT);
											$mdDialog.show(msg);
										}
									}
								}, function errorCallBack(response) {
					      			msg.textContent('Ha ocurrido un error al realizar la operación');
									$mdDialog.show(msg);
									if (response.status == 406 || response.status == 401) {
										vm.parent.parent.logout();
									}
								});
							}
						} else {
							var msgRellenaDatos = $mdDialog.alert().multiple(true)
									.clickOutsideToClose(true)
									.textContent('Rellene todos los datos correctamente')
									.ok('Aceptar');
							$mdDialog.show(msgRellenaDatos);
							
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
    	
    }    
    ng.module('App').component('busquedaRiesgos', Object.create(busquedaComponent));    
})(window.angular);