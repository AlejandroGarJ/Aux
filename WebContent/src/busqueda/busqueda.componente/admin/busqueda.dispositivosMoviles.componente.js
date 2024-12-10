(function(ng) {


	// Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['BASE_SRC', '$location', '$mdDialog', 'MovilService'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
				detallesDispositivo: '<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController(BASE_SRC, $location, $mdDialog, MovilService){
    	var vm = this;
		vm.numDetalles = [];
		vm.nomDetalles = [];
		vm.llave = {};
		vm.colModificado = {};
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.typeBusqueda = "moviles";
        vm.rowEdit = {};
        vm.required = true;
        vm.disabled = false;
        vm.marca = false;
    	vm.showOpcionesAvanzadas = false;
    	vm.filtro = {
    	    switchFiltro: "",
    	    terminal: ""
    	}
		vm.listAllDevices = [];
		vm.listGrupos = [];
		vm.rol = window.sessionStorage.rol;
    	
    	// Iniciar el sistema del formulario de busqueda
    	this.$onInit = function() {
            vm.parent.ckPermisos = { EXISTE: true };
			vm.getTerminales();
			MovilService.getDevicesTypes({})
			.then(function successCallback(response) {
				if (response.data != null && response.data.groups != null){
					vm.listGrupos = response.data.groups;
				} else {
					msg.textContent(response.data.msg);
					$mdDialog.show(msg);
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    	}
    	
    	this.$onChanges = function(){
			vm.vista = vm.view;
			/* TEMP */
    		vm.gridOptions.data = vm.listBusqueda;
            vm.active = 0;
    		// vm.active = vm.dsActive;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.getTerminales = function () {
			vm.vista = 2;
			MovilService.getDevices({})
			.then(function successCallback(response) {
				let device;
				if(response.status === 200){
					if(response.data.code === 0){
						vm.devices = [];
						vm.lstDevices = [];
						vm.lstDevicesAux = [];
						vm.lstBrandsAux = [];
						vm.lstBrands = [];
						if(response.data.entity.length > 0) {

							vm.lstDevices = response.data.entity;
							vm.listTipos = _.groupBy(vm.lstDevices, function(tipo) {
								  return tipo.dsTipoTerminal != null ? tipo.dsTipoTerminal.toUpperCase() : null;
							});

						    for(let i = 0; i < vm.lstDevices.length; i++) {

						    	if(vm.lstDevices[i].codPrecom !== undefined && vm.lstDevices[i].codPrecom != null){

						    		let bundleFusion_On = 'NO APLICA';
									let bundleLibre_On = 'NO APLICA';
									let idBanda = 'N/A'
									let simOnlyCodes = "Sin Datos"
									//console.log(vm.lstDevices[i].brandName + ' ' + vm.lstDevices[i].modelName)

									if (vm.lstDevices[i].jsConfiguration != null) {

										const jsConfiguration = JSON.parse(vm.lstDevices[i].jsConfiguration);

										idBanda = jsConfiguration[0].idBanda

										if(jsConfiguration[0].modelos !== undefined)
											simOnlyCodes = jsConfiguration[0].modelos.join(', ')

										//console.log("Banda " + idBanda)
										if (jsConfiguration[0].WCA_BundleFusion != null) {

											const js_WCABundleFusion = jsConfiguration[0].WCA_BundleFusion

											//console.log("JS Bundle Fusion " + JSON.stringify(js_WCABundleFusion))

											js_WCABundleFusion.forEach(function (valor, i, array) {
												if(!js_WCABundleFusion[i].startDate)
													js_WCABundleFusion[i].startDate = moment(js_WCABundleFusion[i].startDate).format('DD/MM/YYYY')
												if (!js_WCABundleFusion[i].endDate){
													var PO_PRINCIPAL = js_WCABundleFusion[i].ids[0].pOffering
													var PO_ADICIONAL = " SIN ADICIONAL"
													if(js_WCABundleFusion[i].ids[1] !== undefined)
														PO_ADICIONAL = " ADICIONAL " + js_WCABundleFusion[i].ids[1].pOffering

													//bundleFusion_On = 'TARIFICABLE DESDE ' + moment(js_WCABundleFusion[i].startDate).format('DD/MM/YYYY')
													bundleFusion_On = "PRINCIPAL " + PO_PRINCIPAL + PO_ADICIONAL
												}
											});
										}

										if (jsConfiguration[0].WCA_BundleLibre != null) {

											const js_WCABundleLibre = jsConfiguration[0].WCA_BundleLibre

											//console.log("JS Bundle Fusion " + JSON.stringify(js_WCABundleLibre))

											js_WCABundleLibre.forEach(function (valor, i, array) {
												if(!js_WCABundleLibre[i].startDate)
													js_WCABundleLibre[i].startDate = moment(js_WCABundleLibre[i].startDate).format('DD/MM/YYYY')
												if (!js_WCABundleLibre[i].endDate){
													var PO_PRINCIPAL = js_WCABundleLibre[i].ids[0].pOffering
													var PO_ADICIONAL = " SIN ADICIONAL"
													if(js_WCABundleLibre[i].ids[1] !== undefined)
														PO_ADICIONAL = " ADICIONAL " + js_WCABundleLibre[i].ids[1].pOffering

													bundleLibre_On = "PRINCIPAL " + PO_PRINCIPAL + PO_ADICIONAL
												}
													//bundleLibre_On = 'TARIFICABLE DESDE ' + moment(js_WCABundleLibre[i].startDate).format('DD/MM/YYYY')
											});
										}

										/*if (jsConfiguration[0].WCA_BundleLibre != null) {
											vm.lstDevices[i].WCA_BundleLibre = jsConfiguration[0].WCA_BundleLibre;
											vm.lstDevices[i].WCA_BundleLibre.forEach(function (valor, i, array) {
												if (!vm.lstDevices[i].WCA_BundleLibre[i].endDate)
													bundleLibre_On = true
											});
										}*/
									}

									device = {
										'brandId': vm.lstDevices[i].brandId,
										'brandName': vm.lstDevices[i].brandName.toUpperCase(),
										'modelName': vm.lstDevices[i].modelName.toUpperCase(),
										'dsTipoTerminal': vm.lstDevices[i].dsTipoTerminal.toUpperCase(),
										'onWebMobile': vm.lstDevices[i].onWebMobile ? 'SÍ' : 'NO',
										'codPrecom': vm.lstDevices[i].codPrecom,
										'codRENT' : vm.lstDevices[i].codRENT ? vm.lstDevices[i].codRENT : "N/A",
										'idBanda': idBanda,
										'WCABundleFusion': bundleFusion_On,
										'WCABundleLibre': bundleLibre_On,
										'jsConfiguration': vm.lstDevices[i].jsConfiguration,
										'fullName': vm.lstDevices[i].brandName.toUpperCase() + ' ' + vm.lstDevices[i].modelName.toUpperCase(),
										'simOnlyCodes' :  simOnlyCodes
									};

									vm.lstDevicesAux.push(device);

						    	}else{
									device = {
										'brandId': vm.lstDevices[i].brandId,
										'brandName': vm.lstDevices[i].brandName.toUpperCase()
									};
								}
								if(vm.lstBrandsAux.map(x => x.brandId).indexOf(vm.lstDevices[i].brandId) === -1) {
										vm.lstBrandsAux.push(device);
								}
								vm.lstBrands = _.sortBy( vm.lstBrandsAux, 'brandName' );
								vm.devices = _.sortBy( vm.lstDevicesAux, 'fullName' );
							}
	
							/* TEMP */
							vm.lstBands = [1, 2, 3, 4, 5, 6];													
							vm.gridOptions.data = vm.devices;
							vm.listAllDevices = JSON.parse(JSON.stringify(vm.devices));
							vm.vista = 4;
//							if(vm.gridOptions.data != undefined) {
//								for(var i = 0; i < vm.gridOptions.data.length; i++){
//									vm.gridOptions.data[i].lstBrands = vm.lstBrands;
//									vm.gridOptions.data[i].lstBands = vm.lstBands;
//								}
//							}
						}
					}
				}else{
					msg.textContent(response.data.msg);
					$mdDialog.show(msg);
				}
			}, function callBack(response) {
				vm.vista = 4;
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    	}
    	
    	vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			showGridFooter: true,
			gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
			'<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.getTerminales()"><md-icon>autorenew</md-icon></a></div>' +
			'</div>',
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			// treeRowHeaderAlwaysVisible: true,
			columnDefs: [
				{
					field: 'modelName',
					displayName: 'TERMINAL',
					enableCellEdit: false,
					cellTooltip: function(row){return row.entity.fullName},
					//cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.modelName}}</a></div>'
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.fullName}}</a></div>',
				},
				{
					field: 'dsTipoTerminal',
					displayName: 'TIPO',
					enableCellEdit: false,
					cellTooltip: function(row){return row.entity.dsTipoTerminal},
					//cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.modelName}}</a></div>'
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.dsTipoTerminal]">{{row.entity.dsTipoTerminal}}</div>',
				},
				{
					field: 'onWebMobile',
					displayName: 'TIPO DE SEGURO',
					cellTooltip: function(row){return row.entity.onWebMobile},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.onWebMobile]">SEGURO <span ng-if="row.entity.onWebMobile == \'SÍ\'">MÓVIL MOVISTAR</span><span ng-if="row.entity.onWebMobile == \'NO\'">DISPOSITIVOS</span></div>',
				},
				{
					field: 'codPrecom',
					displayName: 'PRECOM LIBRE',width:"7%",
					enableCellEdit: false,
					cellTooltip: function(row){return row.entity.fullName},
					//cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.modelName}}</a></div>'
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.codPrecom]">{{row.entity.codPrecom}}</div>',
				},
				{
					field: 'codRENT',
					displayName: 'PRECOM RENT',width:"7%",
					enableCellEdit: false,
					cellTooltip: function(row){return row.entity.fullName},
					//cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.modelName}}</a></div>'
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.codRENT]">{{row.entity.codRENT}}</div>',
				},
				{
					field: 'bundleFusion',
					displayName: 'WEB CARRITO FUSIÓN',
					enableSorting: false,
					enableCellEdit: false,
					cellTooltip: function(row){return row.entity.WCABundleFusion},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.WCABundleFusion]" >{{row.entity.WCABundleFusion}}</div>',
				},
				{
					field: 'bundleLibre',
					displayName: 'WEB CARRITO LIBRE',
					enableCellEdit: false,
					enableSorting: false,
					cellTooltip: function(row){return row.entity.WCABundleLibre},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.WCABundleLibre]">{{row.entity.WCABundleLibre}}</div>',
				},
				// {
				// 	field: 'idBanda',
				// 	displayName: 'MODALIDAD',
				// 	cellTooltip: function(row){return row.entity.idBanda},
				// 	cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.idBanda]">MODALIDAD 0{{row.entity.idBanda}}</div>',
				// }
				// {
                //     field: 'edit',
                //     displayName: '',
                //     enableSorting: false,
                //     enableColumnMenu: false, width: 100,
				// 	cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">Abrir opciones</a></div>'
				//
				// 	//cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.editarFila(row.entity, row, $index)">Editar</a></div>'
				// }
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
				// gridApi = gridApi.core.resfresh;
				// console.log(gridApi);
				vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){
						vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;
					}
				});
			}
    	}
    	
    	vm.closeEdit = function () {
            vm.required = true;
            vm.disabled = false;
            vm.isEdited = false;
            vm.rowEdit = {};
            vm.isRent = false;
            vm.codPrecom = null;
            vm.searchBrand = null;
            vm.selBrand = null;
            vm.modelName = null;
            vm.band = null;
            vm.coModeloTecnico = null;
    		vm.pOffering1 = "";
    		vm.pOffering2 = "";
    		vm.idCapacidad1 = "";
    		vm.idCapacidad2 = "";
    	}
    	
    	vm.editarFila = function (row) {
    		vm.required = false;
    		vm.disabled = true;
            vm.isEdited = true;
            vm.rowEdit = JSON.parse(JSON.stringify(row));
            
            vm.codPrecom = row.codPrecom;
            vm.searchBrand = row.brandName;
            vm.selBrand = vm.lstBrands.find(x => x.brandId == row.brandId);
            vm.modelName = row.modelName;
            vm.band = row.idBanda;
            vm.isRent = row.isRENT == null ? false : true;
            vm.coModeloTecnico = row.coModeloTecnico;
//            	vm.lstDevices.find(x => x.codPrecom == row.codPrecom).coModeloTecnico;
        }
    	
    	// Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.dispositivosMoviles.html";
    	}

		vm.verDetalle = function (fila, key) {
			vm.llave = {};
			vm.llave = key;

			vm.detallesDispositivo = vm.gridOptions.data.find( data => data.codPrecom == fila.codPrecom);
			vm.cargarDetalle(fila);
		}

		//Función para cargar los datos al abrir el tab.
		vm.cargarDetalle = function(fila) {
			vm.existe = false;
			for(var i = 0; i < vm.numDetalles.length; i++){
				if(fila.imei == vm.numDetalles[i].imei){
					vm.detalles = vm.numDetalles[i];
					vm.existe = true;
					break;
				} else if (vm.nomDetalles[i] == 'nuevo' && vm.numDetalles[i].imei == undefined && fila.imei != undefined) {
					vm.detalles = fila;
					vm.existe = true;
					break;
				}
			}

			if (!vm.existe) {//Si no está abierto, se abre
				//Para intercambiar en la misma pestaña
				if (vm.numDetalles.length > 0) {
					vm.numDetalles = [];
					vm.nomDetalles = [];
					setTimeout( function () {
							vm.numDetalles.push(fila);
							vm.nomDetalles.push(vm.llave);
							vm.active = vm.numDetalles.length;
						},
						10);
				} else {
					vm.numDetalles.push(fila);
					vm.nomDetalles.push(vm.llave);
					vm.active = vm.numDetalles.length;
				}

			} else {//Si está abierto, se abre el nuevo y se cierra el que estaba abierto, dejando el nuevo en el mismo índice que el cerrado
				// var index = vm.numDetalles.indexOf(vm.detalles);
				var index = '';
				for(var i = 0; i < vm.nomDetalles.length; i++) {
					if(vm.nomDetalles[i] != 'nuevo') {
						index = vm.numDetalles.indexOf(vm.detalles);
					} else {
						index = i;
					}
				}
			}
		}
    	
    	vm.addBrand = function () {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/nueva_marca_terminal.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
					md.form = { marca: "" };
					md.loadMarca = false;
					
					md.saveBanda = function () {
						if (md.formModalMarca.$invalid == true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {
			    			var obj = {
		        				'brandId' : 0 ,
		        				'modelName': md.form.marca,
		        				'deviceBrandTypeId':0
		        			}
//		    	            vm.parent.parent.abrirModalcargar(true);

							md.loadMarca = true;
		    				MovilService.insertDevice(obj)
		    				.then(function successCallback(response) {
		    					if(response.data.code == 0){
		    						msg.textContent(response.data.msg).multiple(true);
		    						$mdDialog.show(msg);
		    			    		vm.getTerminales();
		    						md.form.marca = "";
		    					} else {
		    						msg.textContent(response.data.msg).multiple(true);
		    						$mdDialog.show(msg);
		    					}
		    					md.loadMarca = false;
		    				}, function callBack(response) {
		    					md.loadMarca = false;
		    					if(response.status == 406 || response.status == 401){
		    						vm.parent.logout();
		    					}

		    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
		    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
		    	                    $mdDialog.show(msg);
		    	        	    } else {
		    						msg.textContent("Ha ocurrido un error al insertar la marca").multiple(true);
		    						$mdDialog.show(msg);
		    	        	    }
		    				});
			    		}
					}
					
					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						md.form = { marca: "" };
						$mdDialog.cancel();
					};

					md.answer = function (answer) {
						$mdDialog.hide(answer);
					};

				}]
			});
    	}
    	
    	vm.changeFiltro = function () {
    		if (vm.listAllDevices != null) {
    			var filtro = null;
    			if (vm.filtro != null && vm.filtro.switchFiltro != null && vm.filtro.switchFiltro != "") {
    				if (vm.filtro.switchFiltro == 'wcaFusion') {
    					vm.gridOptions.data = vm.listAllDevices.filter(x => x.WCABundleFusion != "NO APLICA");
    				} else if (vm.filtro.switchFiltro == 'wcaCalibre') {
    					vm.gridOptions.data = vm.listAllDevices.filter(x => x.WCABundleLibre != "NO APLICA");
    				} else if (vm.filtro.switchFiltro == 'wcaDisp') {
    					vm.gridOptions.data = vm.listAllDevices.filter(x => x.onWebMobile == "NO");
    				} else {
    					vm.gridOptions.data = JSON.parse(JSON.stringify(vm.listAllDevices));
    				}
    			} else {
					vm.gridOptions.data = JSON.parse(JSON.stringify(vm.listAllDevices));
				}
    		}
    		
    		if (vm.filtro.terminal != null && vm.filtro.terminal != "") {
    			vm.gridOptions.data =
					vm.gridOptions.data.filter(x => x.fullName.toUpperCase()
						.includes(vm.filtro.terminal.toUpperCase())
						|| x.codRENT.includes(vm.filtro.terminal.toUpperCase())
						|| x.codPrecom.includes(vm.filtro.terminal.toUpperCase())
						|| x.dsTipoTerminal.toUpperCase().includes(vm.filtro.terminal.toUpperCase())
						|| x.WCABundleFusion.toUpperCase().includes(vm.filtro.terminal.toUpperCase())
						|| x.WCABundleLibre.toUpperCase().includes(vm.filtro.terminal.toUpperCase()));
    		}
    		
    		if (vm.filtroTipo != null && vm.filtroTipo.length > 0) {
    			vm.gridOptions.data = vm.gridOptions.data.filter(x => vm.filtroTipo.includes(x.dsTipoTerminal.toUpperCase()));
    		}
    	}
    	
		vm.addDevice = function() {
    		$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/nuevo_modelo_terminal.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
					md.form = { isRENT: false };
					md.loadModelo = false;
					md.searchBrand = "";
					md.querySearch = vm.querySearch;
					md.lstBrands = vm.lstBrands;
					md.advancedOptions = {};
					md.showAdvancedOptions = false;
					md.listGrupos = vm.listGrupos;
					md.listSubrupos = [];
					
					md.saveModel = function () {
						if (md.formModalModelo.$invalid == true) {
							msg.textContent("Rellene todos los datos obligatorios.").multiple(true);
							$mdDialog.show(msg);	
			                var objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
			                if(objFocus != undefined) {
			                    objFocus.focus();
			                }
			    			return null;
			    		} else {
				    		var obj = {
			    				'codPrecom': md.form.codPrecom,
			    				'codRENT': (md.form.codRENT == null || md.form.codRENT == "") ? undefined : md.form.codRENT,
			    				'brandId' : md.selBrand.brandId,
			    				'modelName': md.form.modelName,
			    				'idBanda': md.form.band == null ? 1 : md.form.band,
			    				'idTipoTerminal': md.form.subgroup
			    			}
				    		
				    		if (md.showAdvancedOptions == true) {
				    			obj.infoWCA = [
				    				{
										'pOffering': md.advancedOptions.pOffering1,
										'idCapacidad': md.advancedOptions.idCapacidad1
									}, {
										'pOffering': md.advancedOptions.pOffering2,
										'idCapacidad': md.advancedOptions.idCapacidad2
									}
				    			]
				    		}
			    			
			    			if(obj != null && obj != undefined){

			    				md.loadModel = true;
			    				MovilService.insertDevice(obj)
			    				.then(function successCallback(response) {
			    					if(response.data.code == 0){
			    						md.hide();
			    						msg.textContent(response.data.msg).multiple(true);
			    						$mdDialog.show(msg);
			    			    		vm.getTerminales();
					    				md.loadModel = false;
			    					} else {
			    						msg.textContent(response.data.msg).multiple(true);
			    						$mdDialog.show(msg);	
					    				md.loadModel = false;
			    					}
			    				}, function callBack(response) {
				    				md.loadModel = false;
			    					if(response.status == 406 || response.status == 401){
			    						vm.parent.logout();
			    					}
			    					
			    					if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
			    						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).multiple(true);
			    	                    $mdDialog.show(msg);
			    	        	    } else {
			    						msg.textContent("Ha ocurrido un error al insertar modelo").multiple(true);
			    						$mdDialog.show(msg);
			    	        	    }
			    				});
			    			}
			    		}
					}
					
					md.changeGroup = function () {
						md.form.subgroup = null;
						md.form.band = null;
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
			});
		}
		
		vm.validar = function (list) {
			var continuar = true;
			
			for (var i = 0; i < list.length; i++) {
				if (list[i] === "" || list[i] === null || list[i] === undefined) {
					continuar = false;
					break;
				}
			}
			
			return continuar;
		}

		vm.querySearch = function(query, list, key) {
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
                if(key != "modelName")
                    return (list[key].indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
			};
		}
    	
    	// // Botón para ver el detalle
    	// vm.verDetalle = function(fila, key, index){
    	// 	var existe = false;
    	// 	for(var i = 0; i < vm.numDetalles.length; i++){
    	// 		if(vm.numDetalles[i].NO_USUARIO === fila.NO_USUARIO){
    	// 			existe = true;
    	// 			break;
    	// 		}
    	// 	}
    	//
    	// 	if(!existe){
    	// 		vm.numDetalles.push(fila);
        //         vm.active = vm.numDetalles.length;
    	// 	}else {
        //         vm.active = vm.numDetalles.length;
        //     }
    	// }

		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}
    	
    	// Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		var detallesAbiertos = [];
            
            if(vm.numDetalles != null){
                for(var i = 0; i < vm.numDetalles.length; i++){
                    detallesAbiertos.push(vm.numDetalles[i]);
                }
            }
            

            detallesAbiertos.splice(index,1);
            vm.numDetalles = [];
            setTimeout( function () { 
                    for(var i = 0; i < detallesAbiertos.length; i++){
                        vm.numDetalles.push(detallesAbiertos[i]);
                    }
                    
                    vm.active = vm.numDetalles.length;
                }, 
            10);

    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    }

    ng.module('App').component('busquedaDispositivosMoviles', Object.create(busquedaComponent));
    
})(window.angular);