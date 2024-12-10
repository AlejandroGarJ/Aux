(function(ng) {	

	//Crear componente de app
    var ficheroErrorComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', 'uiGridConstants', 'BASE_SRC', 'FicherosService'],
    		require: {
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		},
    		bindings: {
                idDetalle: '<',
            }
    }
    
    ficheroErrorComponent.controller = function ficheroErrorComponentControler($mdDialog, uiGridConstants, BASE_SRC, FicherosService){
    	var vm = this;
    	vm.datos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
    	this.$onInit = function(bindings) {

			vm.datos = vm.parent.idDetalle;

			if(/ficheros_procesados/.test(window.location)) {
				FicherosService.getErroresFicheros({"ID_TIPO_ARCHIVO": vm.parent.idDetalle.ID_TIPO_ARCHIVO})
				.then(function successCallBack(response){
					if(response.status == 200){
						if(response.data.FICHEROS != undefined && response.data.FICHEROS.FICHERO != undefined){
							vm.listFicheros = response.data.FICHEROS.FICHERO;
						}
						if(vm.listFicheros != undefined && vm.listFicheros.length > 0){
							vm.formatData(vm.listFicheros[0].JS_DESCRIPCION);
						}
					}
				});
			} else {
				vm.formatData(vm.parent.idDetalle.JS_DESCRIPCION);
			}
    		
			if(vm.gridOptions) {
				vm.gridOptions.columnDefs[1].filter.selectOptions = vm.setOptions(vm.gridData, 1);
				vm.gridOptions.columnDefs[11].filter.selectOptions = vm.setOptions(vm.gridData, 11);
				vm.gridOptions.columnDefs[12].filter.selectOptions = vm.setOptions(vm.gridData, 12);
			}
    	}

		vm.formatData = function(data) {
			if(data) {
				vm.descriptionData = JSON.parse(data);
				if(vm.descriptionData.unloaded && vm.descriptionData.unloaded.length > 0) {
					vm.gridData = [];
					let unloadedLst = vm.descriptionData.unloaded;
					for(let i = 0; i < unloadedLst.length; i++) {
						let unloadedObj = {};
						let unloadedData = unloadedLst[i].split('|');
						for(let j = 0; j < unloadedData.length; j++) {
							unloadedObj[j] = unloadedData[j];
						}
						vm.gridData.push(unloadedObj);
					}
					vm.gridOptions.data = JSON.parse(JSON.stringify(vm.gridData));
				}

				if (vm.descriptionData.traces && vm.descriptionData.traces.length > 0) {
					vm.traceData = [];
					for (var i = 0; i < vm.descriptionData.traces.length; i++) {
						var trace = vm.descriptionData.traces[i];
						var record = trace.record;
						if (trace && trace.steps != null && trace.steps.length > 0) {
							//Comprobar si hay algún fail, si lo hay, lo mostramos
							var failIndex = trace.steps.findIndex(x => x.fail != null && x.fail.code == "FAIL");
							if (failIndex >= 0) {
								trace.steps[failIndex].record = record;
								trace.steps[failIndex].type = trace.steps[failIndex].fail.code;
								trace.steps[failIndex].descStep = trace.steps[failIndex].fail.description;
								vm.traceData.push(trace.steps[failIndex]);
							} else {
								//Comprobamos si está success, si es así, solo pintamos esta
								// var successIndex =  trace.steps.findIndex(x => x.success != null && x.success.code == "SUCCESS");
								var successIndex =  -1;
								for(let i = 0; i < trace.steps.length; i++) {
									if(trace.steps[i].success && trace.steps[i].success.code == 'SUCCESS') {
										successIndex = i;
									}
								}
								if (successIndex >= 0) {
									trace.steps[successIndex].record = record;
									trace.steps[successIndex].type = trace.steps[successIndex].success.code;
									trace.steps[successIndex].descStep = trace.steps[successIndex].success.description;
									vm.traceData.push(trace.steps[successIndex]);
								}

								//Añadimos los steps de error, y controlamos que sean los 3 últimos
								if (successIndex < 0) {
									for (var j = trace.steps.length - 1; j < trace.steps.length; j--) {
										var numero = 0;
										if (numero == 3 || j < 0) {
											break;
										} else {
											trace.steps[j].record = record;
											trace.steps[j].type = trace.steps[j].fail.code;
											trace.steps[j].descStep = trace.steps[j].fail.description;
											vm.traceData.push(trace.steps[j]);
											numero++;
										}
									}
								}
							}
						}
					}
					vm.gridOptionsTrace.data = vm.traceData;
				}
			}
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.ficheroError.html";
    	}
    	
    	vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			enableCellEdit: false,
			enableFiltering: true,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					field: '0',
					displayName: '0',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[0]}
				},
				// {
				// 	field: '1',
				// 	displayName: '1',
				// 	headerCellClass: vm.highlightFilteredHeader,
				// 	cellTooltip: function(row){return row.entity[1]}
				// },
				{
					field: '1',
					displayName: '1',
					filter: {
						type: uiGridConstants.filter.SELECT,
						// selectOptions: vm.selOptions_c1
					},
					headerCellClass: vm.highlightFilteredHeader,
					cellTooltip: function(row){return row.entity[1]}
				},
				{
					field: '2',
					displayName: '2',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[2]}
				},
				{
					field: '3',
					displayName: '3',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[3]}
				},
				{
					field: '4',
					displayName: '4',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[4]}
				},
				{
					field: '5',
					displayName: '5',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[5]}
				},
				{
					field: '6',
					displayName: '6',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[6]}
				},
				{
					field: '7',
					displayName: '7',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[7]}
				},
				{
					field: '8',
					displayName: '8',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[8]}
				},
				{
					field: '9',
					displayName: '9',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[9]}
				},
				{
					field: '10',
					displayName: '10',
					enableFiltering: false,
					cellTooltip: function(row){return row.entity[10]}
				},
				// {
				// 	field: '11',
				// 	displayName: '11',
				// 	headerCellClass: vm.highlightFilteredHeader,
				// 	cellTooltip: function(row){return row.entity[11]}
				// },
				// {
				// 	field: '12',
				// 	displayName: '12',
				// 	headerCellClass: vm.highlightFilteredHeader,
				// 	cellTooltip: function(row){return row.entity[12]}
				// }
				{
					field: '11',
					displayName: '11',
					filter: {
						type: uiGridConstants.filter.SELECT
					},
					headerCellClass: vm.highlightFilteredHeader,
					cellTooltip: function(row){return row.entity[11]}
				},
				{
					field: '12',
					displayName: '12',
					filter: {
						type: uiGridConstants.filter.SELECT
					},
					headerCellClass: vm.highlightFilteredHeader,
					cellTooltip: function(row){return row.entity[12]}
				},
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
			}
    	}
    	
    	
    	vm.gridOptionsTrace = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    			paginationPageSize: 30,
    			enableCellEdit: false,
    			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    			columnDefs: [
    				{
    					field: 'type',
    					displayName: 'Tipo',
    					width: "10%",
    					cellTooltip: function(row){return row.entity.type},
						grouping: {
							groupPriority: 0
						},
						sort: {
							priority: 0,
							direction: 'asc'
						}
    				},
    				{
    					field: 'record',
    					displayName: 'Registro',
    					enableFiltering: false, 
    					width: "30%",
						cellTooltip: function(row){return row.entity.record}
    				},
    				{
    					field: 'code',
    					displayName: 'Código',
    					width: "10%",
    					cellTooltip: function(row){return row.entity.code}
    				},
    				{
    					field: 'descStep',
    					displayName: $translate.instant('DESCRIPTION'),
    					cellTooltip: function(row){return row.entity.descStep}
    				}
    			],
    			onRegisterApi: function( gridApi ) {
    				vm.gridApiTraces = gridApi;
    				vm.gridApiTraces.grid.registerDataChangeCallback(function() {
    					vm.gridApiTraces.treeBase.expandAllRows();
			        });
    			}
        	}

		vm.highlightFilteredHeader = function(row, rowRenderIndex, col, colRenderIndex) {
			if(col.filters[0].term) {
			  	return 'header-filtered';
			} else {
			  	return '';
			}
		};

		vm.setOptions = function(lst, column) {
			let optionsLst = [];
			let propList = [];
			if(lst) {
				for(let i = 0; i < lst.length; i++) {
					if(propList.indexOf(lst[i][column]) == -1) {
						propList.push(lst[i][column]);
					}
				}
				for(let i = 0; i < propList.length; i++) {
					if(propList[i]) {
						optionsLst.push(
							{
								label: propList[i],
								value: propList[i]
							}
						)
					}
				}
			}
			return optionsLst;
		};
    	
    	//Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
        }
    	
		vm.exportExcel = function() {
			if(vm.gridOptionsTrace) {
				vm.busqueda.exportarExcelGrid(vm.gridOptionsTrace, vm.gridApiTraces.grid, 'errores_en_ficheros.xlsx')
			} else {
				if(vm.gridOptionsTrace) {
					vm.busqueda.exportarExcelGrid(vm.gridOptions, vm.gridApi.grid, 'errores_en_ficheros.xlsx')
				}
			}
		}

    }   
    
    ng.module('App').component('ficheroErrorSd', Object.create(ficheroErrorComponent));
    
})(window.angular);