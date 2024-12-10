(function(ng) {	

	//Crear componente de app
    var aseguradoraComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
            $inject:['$window', '$location', '$scope', '$mdDialog', '$translate', 'BusquedaService', 'AseguradoraService','TiposService', 'uiGridConstants','BASE_SRC', 'ExportService', 'CommonUtils', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busquedaAseguradoras: '^?busquedaAseguradoras'
    		}
    }
    
    aseguradoraComponent.controller = function aseguradoraComponentControler($window, $location, $scope, $mdDialog, $translate, BusquedaService, AseguradoraService, TiposService, uiGridConstants, BASE_SRC, ExportService, CommonUtils, constantsTipos){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
    	vm.listFiles = [];
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
	
		vm.nuevaAseg = false;

    	this.$onInit = function(bindings) {
    		vm.showTable = 0;
    		vm.datos = vm.parent.datos;
    		vm.listFiles = vm.datos.LISTA_ARCHIVOS != undefined ? vm.datos.LISTA_ARCHIVOS : [];
    		vm.load = true;
			vm.tipos.ramos = [];
			vm.tipos.productos = [];
			vm.tipos.garantias = []; 
            vm.negociosDeleted = [];
            vm.garantiasDeleted = [];
            vm.productosDeleted = [];
            vm.contactosDeleted = [];
            vm.archivosDeleted = [];
            vm.ramosDeleted = [];
			vm.medidaEdicion = 294; //223
            
            //Lista para emitible
            vm.listEmitible = [
            	{
            		name: "No",
            		id: "0"
            	},{
            		name: "Web Services",
            		id: "1"
            	},{
            		name: "Interno",
            		id: "2"
            	},
            ];
			
			if((Object.keys(vm.datos).length === 0 || vm.datos.ID_COMPANIA == undefined) && vm.datos.constructor === Object) {
				vm.nuevaAseg = true;
			}

			if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$path.substring(1, $location.$$path.length));
    		}
			
    		//Recuperar ramos
    		if(vm.datos.ID_COMPANIA != undefined){
    			//Recuperar los ramos por una aseguradora
        		TiposService.getRamoCompania({"ID_COMPANIA":vm.datos.ID_COMPANIA})
        		.then(function successCallback(response){
        			if(response.status == 200){
        				if(response.data.CIARAMOS != undefined){
        					vm.tipos.ramos = response.data.CIARAMOS.CIA_RAMO;
        				}
    					vm.gridRamos.data = vm.tipos.ramos;
    		            if(vm.gridRamos.data != undefined){
    		                for(var i = 0; i < vm.gridRamos.data.length; i++){
    		                    vm.gridRamos.data[i].listEmitible = vm.listEmitible;
    		                }
    		            }
    					vm.load = false;
    				}
        		})
            	
            	//Recuperar productos por aseguradora
        		TiposService.getCompRamoProd({"ID_COMPANIA":vm.datos.ID_COMPANIA, "ID_RAMO":undefined})
        		.then(function successCallBack(response){
        			if(response.status == 200){
        				if(response.data.CIARAMOS != undefined){
        					vm.tipos.productos = response.data.CIARAMOS.CIA_RAMO;
        				}
    					vm.gridProductos.data = vm.tipos.productos;
    					vm.load = false;
    				}
        		})
        		
        		//Recuperar garantías
        		TiposService.getGarantias({"ID_COMPANIA":vm.datos.ID_COMPANIA})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.garantias = response.data.GARANTIAS;
    					vm.gridGarantias.data = response.data.GARANTIAS;
    				}
				});
				
				/*
				//Recuperar negocios
				AseguradoraService.getNegociosByAseguradora({"ID_COMPANIA":vm.datos.ID_COMPANIA})
				.then(function successCallback(response){
					if(response.status == 200 && response.data != null && response.data.NUMERO_TIPOS > 0){
						vm.listNegocios = response.data.TIPOS.TIPO;
						vm.gridNegocios.data = response.data.TIPOS.TIPO;
					}
				});
				*/
				
				//Recuperar contactos
				AseguradoraService.getContactosByAseguradora(vm.datos.ID_COMPANIA)
				.then(function successCallback(response){
					if(response.status == 200 && response.data != null && response.data.LISTA_CONTACTOS.length > 0){
						vm.listContactos = response.data.LISTA_CONTACTOS;
						vm.gridContactos.data = response.data.LISTA_CONTACTOS;
						
	
						if(vm.listTiposContacto != null && vm.listTiposContacto != undefined && vm.listTiposContacto.length > 0){
							for(var j = 0; j < vm.listTiposContacto.length; j++){
								vm.listTiposContacto[j].id = vm.listTiposContacto[j].DS_TIPOS;
								vm.listTiposContacto[j].DS_TIPOCONTACTO = vm.listTiposContacto[j].DS_TIPOS;
							}
							if(vm.gridContactos.data != undefined){
								for(var i = 0; i < vm.gridContactos.data.length; i++){
									vm.gridContactos.data[i].listTiposContacto = vm.listTiposContacto;
								}
							}
						}
						
						if(vm.listRamos != null && vm.listRamos != undefined && vm.listRamos.length > 0){
							for(var j = 0; j < vm.listRamos.length; j++){
								vm.listRamos[j].id = vm.listRamos[j].NO_RAMO;
							}
							if(vm.gridContactos.data != undefined){
								for(var i = 0; i < vm.gridContactos.data.length; i++){
									vm.gridContactos.data[i].ramos = vm.listRamos;
								}
							}
						}
					}
				});

    		}else{
    			vm.gridRamos.data = vm.tipos.ramos;
    			vm.gridProductos.data = vm.tipos.productos;
    			vm.gridGarantias.data = vm.tipos.garantias;
    			vm.load = false;
    		}
    		
            //Recuperar los ramos por una 
            TiposService.getRamos({})
            .then(function successCallback(response){
                if(response.status == 200){
                    if(response.data.TIPOS != undefined){
                        vm.listRamos = response.data.TIPOS.TIPO;
                        
                        for(var j = 0; j < vm.listRamos.length; j++){
                            vm.listRamos[j].id = vm.listRamos[j].NO_RAMO;
                        }
                        if(vm.gridContactos.data != undefined){
                            for(var i = 0; i < vm.gridContactos.data.length; i++){
                                vm.gridContactos.data[i].ramos = vm.listRamos;
                            }
                        }
                    }
                    vm.load = false;
                }
            })
            
            //Recuperar los ramos por una 
            TiposService.getTipos({ID_CODIGO: constantsTipos.TIPOS_CONTACTO})
            .then(function successCallback(response){
                if(response.status == 200){
                    if(response.data.TIPOS != undefined){
                        vm.listTiposContacto = response.data.TIPOS.TIPO;
                        
                        for(var j = 0; j < vm.listTiposContacto.length; j++){
                            vm.listTiposContacto[j].id = vm.listTiposContacto[j].DS_TIPOS;
                            vm.listTiposContacto[j].DS_TIPOCONTACTO = vm.listTiposContacto[j].DS_TIPOS;
                        }
                    }
                    vm.load = false;
                }
            })
            
    		
    		TiposService.getRamos({"IN_TARIFICABLE": true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.ramos = [];
					if(response.data.TIPOS != undefined){
						vm.ramos = response.data.TIPOS.TIPO;
					}
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    	}
    	
        this.$onChanges = function(){
            if(vm.gridRamos.data != undefined){
                for(var i = 0; i < vm.gridRamos.data.length; i++){
                    vm.gridRamos.data[i].companias = vm.listRamos;
                }
            }
        }
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                if(vm.nuevaAseg == false) {
					return BASE_SRC + 'detalle/detalles.views/detalle.aseguradora.html';
				} else {
					return BASE_SRC + 'detalle/detalles.views/nuevo/detalle.aseguradora_new.html';
				}
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.gridProductos = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    treeRowHeaderAlwaysVisible: true,
    		    enableRowSelection: true,
				enableSelectAll: true,                
				multiSelect: false,
				selectionRowHeaderWidth: 29,
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						name:'NO_RAMO',
						displayName:'Ramo',
						enableCellEdit: false,
						grouping: { groupPriority:0},
						sort: { priority: 0, direction: 'asc'},
						width:170
					},
					{
						field: 'ID_COMP_RAMO_PROD',
						displayName: 'Identificador',
						enableCellEdit: false,
						width: 100,
						cellTooltip: function(row){return row.entity.ID_COMP_RAMO_PROD}
					},
					{
						field: 'NO_PRODUCTO',
						displayName: 'Producto',
						cellTooltip: function(row){return row.entity.NO_PRODUCTO}
					},
					// {
					// 	field: 'NU_COMISION',
					// 	width: 100,
					// 	displayName: 'Comisión',
					// 	type: 'number',
					// 	cellTooltip: function(row){return row.entity.NU_COMISION}
					// },
					// {
					// 	field: 'NU_COMISION_CARTERA',
					// 	width: 120,
					// 	displayName: 'Comisión Cartera',
					// 	type: 'number',
					// 	cellTooltip: function(row){return row.entity.NU_COMISION_CARTERA}
					// },
					// {
					// 	name:' ',
					// 	width: 36,
					// 	cellTemplate:'<div class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.eliminarAseguradora(row.entity)" ng-if="row.entity.ID_COMP_RAMO_PROD != null"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>',
					// 	enableSorting:false, enableColumnMenu:false
					// }
    		    ],
    		    onRegisterApi: function( gridApi ) {
					vm.gridApiPro = gridApi;

					gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
						vm.elementoSeleccionado = fila.entity;
					});
					
					vm.gridApiPro.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
						if(newValue != oldValue){

							if(!rowEntity.IS_NEW)
								rowEntity.IS_UPDATED = true;

						}
					});
    		    }
    	}
    	
    	vm.gridRamos = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    treeRowHeaderAlwaysVisible: true,             
				multiSelect: false,
				data:[],
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						name:'NO_RAMO',
						displayName:'Ramo',
						enableCellEdit: false,
						grouping: { groupPriority:0},
						sort: { priority: 0, direction: 'asc'}
					},
					{
						field: 'IN_TARIFICABLE',
						displayName: 'Tarificable',
						type: 'boolean',
						cellTooltip: function(row){ if(row.entity.IN_TARIFICABLE){return 'Sí'} else return 'No'},
						cellTemplate: '<div ng-if="row.entity.IN_TARIFICABLE == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_TARIFICABLE == false" class="ui-grid-cell-contents td-trash">No</div>'
					},
					{
						field: 'IN_EMISION_WS',
						displayName: 'Emitible',
						editableCellTemplate: 'ui-grid/dropdownEditor',
						editDropdownValueLabel: 'name',
	                    editDropdownRowEntityOptionsArrayPath: 'listEmitible',
	                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.IN_EMISION_WS == 0">No</div><div class="ui-grid-cell-contents" ng-if="row.entity.IN_EMISION_WS == 1">Web Services</div><div class="ui-grid-cell-contents" ng-if="row.entity.IN_EMISION_WS == 2">Interno</div>'
					}
    		    ],
    		    onRegisterApi: function( gridApi ) {
					vm.gridApiRam = gridApi;

					gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
						vm.elementoSeleccionado = fila.entity;
					});
					
					vm.gridApiRam.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
						if(newValue != oldValue){

							if(!rowEntity.IS_NEW)
								rowEntity.IS_UPDATED = true;

						}
                        rowEntity.IN_EMISION_WS = _.find(vm.listEmitible, {'id':rowEntity.IN_EMISION_WS}).id;
					});
    		    }
    	}
    	
    	vm.getEmitibleName = function (id) {
    		if (vm.listEmitible != null && vm.listEmitible.length > 0) {
                return _.find(vm.listEmitible, {'id':rowEntity.IN_EMISION_WS}).name;
    		}
    	}
    	
    	vm.gridGarantias = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],             
				paginationPageSize: 30,
				multiSelect: false,
    		    treeRowHeaderAlwaysVisible: true,
				data:[],
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						name:'NO_PRODUCTO',
						displayName:'Producto',
						enableCellEdit: false,
						grouping: { groupPriority:0},
						sort: { priority: 0, direction: 'asc'},
					},
					{
						field: 'ID_GARANTIA',
						displayName: 'Identificador',
						enableCellEdit: false,
						cellTooltip: function(row){return row.entity.ID_GARANTIA}
					},
					{
						field: 'NO_GARANTIA',
						displayName: 'Garantía',
						cellTooltip: function(row){return row.entity.NO_GARANTIA}
					},
					{
						field: 'NO_PRODUCTO',
						displayName: 'Producto',
						enableCellEdit: false,
						cellTooltip: function(row){return row.entity.NO_PRODUCTO}
					},
					{
						field: 'NO_RAMO',
						displayName: 'Ramo',
						enableCellEdit: false,
						cellTooltip: function(row){return row.entity.NO_RAMO}
					},
					{
						field: 'IN_PRINCIPAL',
						type: 'boolean',
						displayName: 'Principal',
						cellTemplate: '<div ng-if="row.entity.IN_PRINCIPAL == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_PRINCIPAL == false" class="ui-grid-cell-contents td-trash">No</div>',
						cellTooltip: function(row){ if(row.entity.IN_PRINCIPAL){return 'Sí'} else return 'No'}
					},
					{
						field: 'IN_OBLIGATORIA',
						type: 'boolean',
						displayName: 'Obligatoria',
						cellTemplate: '<div ng-if="row.entity.IN_OBLIGATORIA == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_OBLIGATORIA == false" class="ui-grid-cell-contents td-trash">No</div>',
						cellTooltip: function(row){ if(row.entity.IN_OBLIGATORIA){return 'Sí'} else return 'No'}
					}
    		    ],
    		    onRegisterApi: function( gridApi ) {
					vm.gridApiGar = gridApi;

					gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
						vm.elementoSeleccionado = fila.entity;
					});
				  
					vm.gridApiGar.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue) {
						if(newValue != oldValue){

							if(!rowEntity.IS_NEW)
								rowEntity.IS_UPDATED = true;

						}
					});
    		    }
    	}
    	
    	// vm.gridNegocios = {
    	// 		enableSorting: true,
    	// 	    multiSelect: false,
    	// 		enableHorizontalScrollbar: 0,
    	// 		paginationPageSizes: [15,30,50],
    	// 	    paginationPageSize: 30,
    	// 	    treeRowHeaderAlwaysVisible: true,
		// 		data:[],
		// 		paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    	// 	    columnDefs: [
		// 			{
		// 				field: 'NO_NEGOCIO',
		// 				displayName: 'Nombre',
		// 				cellTooltip: function(row){return row.entity.NO_NEGOCIO}
		// 			},
		// 			{
		// 				field: 'CO_NEGOCIO',
		// 				displayName: 'Código',
		// 				enableCellEdit: false,
		// 				cellTooltip: function(row){return row.entity.CO_NEGOCIO}
		// 			},
		// 			{
		// 				field: 'NO_MEDIADOR',
		// 				displayName: 'Mediador',
		// 				cellTooltip: function(row){return row.entity.NO_MEDIADOR}
		// 			},
		// 			{
		// 				field: 'NO_RAMO',
		// 				displayName: 'Ramo',
		// 				enableCellEdit: false,
		// 				grouping: { groupPriority:0},
		// 				sort: { priority: 0, direction: 'asc'},
		// 				cellTooltip: function(row){return row.entity.NO_RAMO}
		// 			},
		// 			{
		// 				field: 'NU_COMISION',
		// 				displayName: 'Comisión',
		// 				type: 'number',
		// 				cellTooltip: function(row){return row.entity.IN_TERCEROS_LUNAS}
		// 			}
    	// 	    ],
    	// 	    onRegisterApi: function( gridApi ) {
		//             vm.gridApiNeg = gridApi;
		            
	    //   	        gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
		// 				vm.elementoSeleccionado = fila.entity;
	    //   	        });
	      	        
        //             vm.gridApiNeg.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
        //                 if(newValue != oldValue){

        //                     if(!rowEntity.IS_NEW)
        //                         rowEntity.IS_UPDATED = true;

        //                 }
        //             });
    	// 	    }
    	// }
    	
    	vm.gridContactos = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,             
				multiSelect: false,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    treeRowHeaderAlwaysVisible: true,
				data:[],
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						field: 'NO_PERSONA',
						displayName: 'Nombre',
						cellTooltip: function(row){return row.entity.NO_PERSONA}
					},
					{
						field: 'DS_TIPOCONTACTO',
						displayName: 'Tipo de contacto',
						cellTooltip: function(row){return row.entity.DS_TIPOCONTACTO},
						editableCellTemplate: 'ui-grid/dropdownEditor', 
						editDropdownValueLabel: 'DS_TIPOCONTACTO', 
						editDropdownRowEntityOptionsArrayPath: 'listTiposContacto', 
						cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.DS_TIPOCONTACTO]">{{row.entity.DS_TIPOCONTACTO}}</div>'  
					},
					{
						field: 'NO_RAMO',
						displayName: 'Ramo',
						cellTooltip: function(row){return row.entity.NO_RAMO},
						editableCellTemplate: 'ui-grid/dropdownEditor', 
						editDropdownValueLabel: 'NO_RAMO', 
						editDropdownRowEntityOptionsArrayPath: 'ramos', 
						cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_RAMO]">{{row.entity.NO_RAMO}}</div>'
					},
					{
						field: 'NO_DIRECCION',
						displayName: 'Dirección',
						cellTooltip: function(row){return row.entity.NO_DIRECCION}
					},
					{
						field: 'NO_EMAIL',
						displayName: 'Email',
						cellTooltip: function(row){return row.entity.NO_EMAIL}
					},
					{
						field: 'NU_TELEFONO1',
						displayName: 'Teléfono',
						cellTooltip: function(row){return row.entity.NU_TELEFONO1}
					}
    		    ],
    		    onRegisterApi: function( gridApi ) {
    		      vm.gridApiCon = gridApi;
    		      
                  gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
						vm.elementoSeleccionado = fila.entity;
                  });
                  
                  vm.gridApiCon.edit.on.afterCellEdit(null, function (rowEntity, colDef, newValue, oldValue) {
                      if(newValue != oldValue) {
                          console.log(rowEntity);
//                          md.colModificado[rowEntity[colDef.field]] = 'colModificado';
                          if(!rowEntity.IS_NEW) {
                              rowEntity.IS_UPDATED = true;
                          }
                          
                          if(colDef.field == "NO_RAMO"){
                              rowEntity.ID_RAMO = _.find(vm.listRamos, {'NO_RAMO':rowEntity.NO_RAMO}).ID_RAMO;
                          }
                          
                      }
                  });
    		    }
    	}
		
		vm.newAseguradora = function() {
    		if(vm.formNewAseguradora.$valid) {
	            var json = vm.datos;
	            
	            json.IN_REASEGURADORA = false;
	            json.IN_COMISIONISTA = false;
	            
	            // json.LISTA_RAMOS = JSON.parse(JSON.stringify(vm.gridRamos.data));
	            
	            vm.appParent.abrirModalcargar(true);
	            AseguradoraService.saveAseguradora(json)
	            .then(function successCallBack(response){
	                vm.datos.NU_CIF = response.data.NU_CIF;
	                if(response.status == 200) {
	                	msg.textContent('Aseguradora guardada correctamente');
	                	$mdDialog.show(msg).then(function() {
	                		if (vm.datos.NU_CIF != null) {
		                		$window.location.href = window.location.origin + window.location.pathname + '#!/catalogo_aseguradoras_list/?documentoAseguradora=' + vm.datos.NU_CIF;
	                		}
	        		    });
	//                        vm.appParent.cambiarDatosModal('Aseguradora guardada correctamente');
	                }
	            }, function errorCallBack(response){
	                vm.status == response.status;
	                vm.appParent.cambiarDatosModal('Error al guardar la aseguradora');
	            });
    		} else {
    			objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
                msg.textContent('Rellena los datos requeridos.');
                $mdDialog.show(msg);
    		}
		}

		
		
    	vm.addAseguradora = function(){
    		if(vm.gridRamos.data != undefined && vm.gridRamos.data.length > 0){
    			var json = vm.datos;
    			
    			json.IN_REASEGURADORA = false;
				json.IN_COMISIONISTA = false;
				
				/*
                json.LISTA_RAMOS = JSON.parse(JSON.stringify(vm.gridRamos.data));
                for(var i = 0; i < vm.ramosDeleted.length; i++){
                    json.LISTA_RAMOS.push(vm.ramosDeleted[i]);
                }
                
                json.LISTA_ARCHIVOS = JSON.parse(JSON.stringify(vm.listFiles));
                for(var i = 0; i < vm.archivosDeleted.length; i++){
                    json.LISTA_ARCHIVOS.push(vm.archivosDeleted[i]);
                }
                
                json.LISTA_CONTACTOS = JSON.parse(JSON.stringify(vm.gridContactos.data));
                for(var i = 0; i < vm.contactosDeleted.length; i++){
                    json.LISTA_CONTACTOS.push(vm.contactosDeleted[i]);
                }
                
                json.LISTA_PRODUCTOS = JSON.parse(JSON.stringify(vm.gridProductos.data));
                for(var i = 0; i < vm.productosDeleted.length; i++){
                    json.LISTA_PRODUCTOS.push(vm.productosDeleted[i]);
                }
                
                json.LISTA_GARANTIAS = JSON.parse(JSON.stringify(vm.gridGarantias.data));
                for(var i = 0; i < vm.garantiasDeleted.length; i++){
                    json.LISTA_GARANTIAS.push(vm.garantiasDeleted[i]);
                }
                */

				vm.checkGridData(vm.gridRamos.data, json, 'LISTA_RAMOS', vm.ramosDeleted);
				vm.checkGridData(vm.listFiles, json, 'LISTA_ARCHIVOS', vm.archivosDeleted);
				vm.checkGridData(vm.gridContactos.data, json, 'LISTA_CONTACTOS', vm.contactosDeleted);
				vm.checkGridData(vm.gridProductos.data, json, 'LISTA_PRODUCTOS', vm.productosDeleted);
				vm.checkGridData(vm.gridGarantias.data, json, 'LISTA_GARANTIAS', vm.garantiasDeleted);

                // json.LISTA_NEGOCIO = JSON.parse(JSON.stringify(vm.gridNegocios.data));
                // for(var i = 0; i < vm.negociosDeleted.length; i++){
                //     json.LISTA_NEGOCIO.push(vm.negociosDeleted[i]);
				// }
				
				/* SIMPLIFICAR LISTADO DE NUEVOS PRODUCTOS (NO_PRODUCTO, DS_PRODUCTO, IS_NEW) */

				if(json.LISTA_PRODUCTOS != undefined && json.LISTA_PRODUCTOS.length > 0) {
					var lstNewProducts = [];
					for(var i = 0; i < json.LISTA_PRODUCTOS.length; i++) {
						if(json.LISTA_PRODUCTOS[i].ID_COMP_RAMO_PROD == null || json.LISTA_PRODUCTOS[i].ID_COMP_RAMO_PROD == 0) {
							lstNewProducts.push(json.LISTA_PRODUCTOS[i]);
						}
					}
					if(lstNewProducts.length > 0) {
						TiposService.saveListProductos(lstNewProducts)
						.then(function successCallBack(response){
							if(response.status == 200) {
								if(response.data.ID_RESULT == 0) {
									vm.saveAseguradora(json);
								} else {
									msg.textContent(response.data.DS_RESULT);
									$mdDialog.show(msg);
								}
							}
						}, function errorCallBack(response){
						});
					} else {
						vm.saveAseguradora(json);
					}
				} else {
	    			msg.textContent('Se necesita un producto asociado para guardar la aseguradora');
					$mdDialog.show(msg);
				}
    		}else{
    			msg.textContent('Se necesita un ramo asociado para guardar la aseguradora');
				$mdDialog.show(msg);
    		}   
		}

		vm.checkGridData = function(gridData, obj, lst, lstDeleted) {
			if(gridData != undefined) {
				obj[lst] = JSON.parse(JSON.stringify(gridData));
				for(var i = 0; i < lstDeleted.length; i++) {
					obj[lst].push(lstDeleted[i]);
				}
			}
		}
		
		vm.saveAseguradora = function(json) {
			if(json != undefined) {
				vm.appParent.abrirModalcargar(true);
				AseguradoraService.saveAseguradora(json)
				.then(function successCallBack(response){
					vm.datos.NU_CIF = response.data.NU_CIF;
					if(response.status == 200) {
						if(response.data.ID_RESULT == 0) {
						    vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
							vm.listFiles = response.data.LISTA_ARCHIVOS;
							vm.datos.IT_VERSION = response.data.IT_VERSION;
						} else {
						    vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
						}
					}
				}, function errorCallBack(response){
					vm.status == response.status;
					vm.appParent.cambiarDatosModal('Error al editar la aseguradora');
				});
			}
		}
    	
    	vm.addRamo = function() {
    		
    		var existeRamo = false;
    		
    		if(vm.form == undefined || vm.form.RAMO == undefined || vm.form.IN_TARIFICABLE == undefined || vm.form.IN_EMISION_WS == undefined) {
				msg.textContent('Elija los datos que faltan para añadir el ramo');
				$mdDialog.show(msg);
    		}else{
    			for(var i = 0; i<vm.tipos.ramos.length; i++){
        			if(vm.tipos.ramos[i].ID_RAMO == vm.form.RAMO.ID_RAMO) {
						existeRamo = true;
						msg.textContent('El ramo ya existe');
						$mdDialog.show(msg);
        				vm.form = {};
        				break;
        			}
        		}
        		
        		if(existeRamo == false){
        			vm.gridRamos.data.push({
						"NO_RAMO":vm.form.RAMO.NO_RAMO,
						"ID_RAMO":vm.form.RAMO.ID_RAMO,
						"IN_TARIFICABLE":vm.form.IN_TARIFICABLE,
						"IN_EMISION_WS":vm.form.IN_EMISION_WS,
						"IS_NEW": true,
	                    "listEmitible": vm.listEmitible
					});
        		}
    		}
    	}
    	
    	
    	vm.addProducto = function(){
    		
    		// var existeProducto = false;
    		
    		// if(vm.form == undefined || vm.form.PRODUCTO == undefined || vm.form.RAMO == undefined) {
			// 	msg.textContent('Elija los datos que faltan para añadir el ramo');
			// 	$mdDialog.show(msg);
    		// }else{
    		// 	for(var i = 0; i<vm.tipos.productos.length; i++){
        	// 		if(vm.tipos.productos[i].ID_COMP_RAMO_PROD == vm.form.PRODUCTO.ID_COMP_RAMO_PROD) {
			// 			existeProducto = true;
			// 			msg.textContent('El producto ya existe');
			// 			$mdDialog.show(msg);
        	// 			vm.form = {};
        	// 			break;
        	// 		}
        	// 	}
        		
        	// 	if(existeProducto == false){
        	// 		vm.gridProductos.data.push({
			// 			"NO_PRODUCTO":vm.form.PRODUCTO.NO_PRODUCTO,
			// 			"NO_RAMO":vm.form.RAMO.NO_RAMO,
			//			"ID_RAMO":vm.form.RAMO.ID_RAMO,
			// 			"NU_COMISION":vm.form.NU_COMISION,
			// 			"NU_COMISION_CARTERA":vm.form.NU_COMISION_CARTERA,
			// 			"IS_NEW": true
			// 		});
        	// 	}
			// }
			
			vm.modalElement('producto');
    	}
    	
    	vm.addGarantia = function(){
    		
    		var existeGarantia = false;
    		
    		if(vm.form == undefined || vm.form.GARANTIA == undefined || vm.form.PRODUCTO == undefined || vm.form.RAMO == undefined) {
				msg.textContent('Elija los datos que faltan para añadir la garantía');
				$mdDialog.show(msg);
    		}else{
    			for(var i = 0; i<vm.tipos.garantias.length; i++){
        			if(vm.tipos.garantias[i].ID_GARANTIA == vm.form.GARANTIA.ID_GARANTIA){
						existeGarantia = true;
						msg.textContent('La garantía ya existe');
						$mdDialog.show(msg);
        				vm.form = {};
        				break;
        			}
        		}
        		
        		if(existeGarantia == false){
        			vm.gridGarantias.data.push({
						"NO_GARANTIA":vm.form.GARANTIA.NO_GARANTIA,
						"ID_RAMO":vm.form.RAMO.ID_RAMO,
						"NO_RAMO":vm.form.RAMO.NO_RAMO,
						"NO_PRODUCTO":vm.form.PRODUCTO.NO_PRODUCTO,
						"IN_OPCIONAL":vm.form.IN_OPCIONAL == undefined ? false : vm.form.IN_OPCIONAL,
						"IS_NEW": true
					});
        		}
    		}
    	}
    	
    	vm.addNegocio = function(){
    		
    		// var existeNegocio = false;
    		
    		// if(vm.form == undefined || vm.form.NO_NEGOCIO == undefined || vm.form.CO_NEGOCIO == undefined || vm.form.NO_MEDIADOR == undefined || vm.form.RAMO.NO_RAMO == undefined || vm.form.NU_COMISION == undefined){
			// 	msg.textContent('Elija los datos que faltan para añadir un negocio');
			// 	$mdDialog.show(msg);
    		// }else{
        	// 	if(existeNegocio == false){
			// 		vm.gridNegocios.data.push({
			// 			"NO_NEGOCIO":vm.form.NO_NEGOCIO,
			// 			"CO_NEGOCIO":vm.form.CO_NEGOCIO,
			// 			"ID_RAMO":vm.form.RAMO.ID_RAMO,
			// 			"NO_RAMO":vm.form.RAMO.NO_RAMO,
			// 			"NO_MEDIADOR":vm.form.NO_MEDIADOR,
			// 			"NU_COMISION":vm.form.NU_COMISION,
			// 			"IS_NEW": true
			// 		});
        	// 	}
			// }
			
			vm.modalElement('negocio');
    	}
    	
    	vm.addContacto = function(){
    		
    		var existeContacto = false;
    		
    		if(vm.form == undefined || vm.form.RAMO == undefined || vm.form.NO_PERSONA == undefined || vm.form.TIPOCONTACTO == undefined || vm.form.NO_DIRECCION == undefined || vm.form.NO_EMAIL == undefined || vm.form.NU_TELEFONO1 == undefined){
				msg.textContent('Elija los datos que faltan para añadir contacto');
				$mdDialog.show(msg);
    		}else{
        		if(existeContacto == false){
                    vm.gridContactos.data.unshift({"ramos": vm.listRamos, "listTiposContacto": vm.listTiposContacto,"ID_RAMO":vm.form.RAMO.ID_RAMO,"NO_RAMO":vm.form.RAMO.NO_RAMO, "NO_PERSONA":vm.form.NO_PERSONA, "ID_TIPOCONTACTO":vm.form.TIPOCONTACTO.ID_TIPOS, "DS_TIPOCONTACTO":vm.form.TIPOCONTACTO.DS_TIPOS, "NO_DIRECCION":vm.form.NO_DIRECCION, "NO_EMAIL":vm.form.NO_EMAIL, "NU_TELEFONO1":vm.form.NU_TELEFONO1, "IS_NEW": true});
                    vm.form = {};
        		}
    		}
		}
		
		vm.modalElement = function(elemType) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/add_element_aseguradora.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
					md.elemType = elemType;
					md.datos = vm.datos;
					md.ramos = vm.tipos.ramos;
					md.parent = vm.parent;

					TiposService.getProducto()
					.then(function successCallback(response) {
						md.productos = response.data.TIPOS.TIPO;
						md.productos.push({
							'ID_PRODUCTO': 0,
							'NO_PRODUCTO': 'Otro producto'
						})

					}, function errorCallBack(response) {
						if (response.status == 406 || response.status == 401) {
							vm.parent.parent.logout();
						}
					});
					
					md.seleccionarProducto = function(idProducto) {
						if(md.form == undefined) {
							md.form = {};
						}
						if(idProducto != undefined && idProducto != 0) {
							md.form.NO_PRODUCTO = md.autocomplete.PRODUCTO.NO_PRODUCTO;
							md.form.ID_COMP_RAMO_PROD = md.autocomplete.PRODUCTO.ID_PRODUCTO;
							md.form.ID_PRODUCTO = md.autocomplete.PRODUCTO.ID_PRODUCTO;
						} else {
							md.form.NO_PRODUCTO = '';
						}
					}
					
					md.addElement = function(elemType) {
						if(elemType == 'producto') {
							var existeProducto = false;
    		
							if(md.form == undefined || md.autocomplete.PRODUCTO == undefined || md.autocomplete.RAMO == undefined) {
								msg.textContent('Elija los datos que faltan para añadir el ramo');
								$mdDialog.show(msg);
							} else {
								// if(md.autocomplete.PRODUCTO.ID_COMP_RAMO_PROD != undefined) {
								// 	for(var i = 0; i < vm.tipos.productos.length; i++) {
								// 		if(md.productos[i].ID_COMP_RAMO_PROD == md.autocomplete.PRODUCTO.ID_COMP_RAMO_PROD) {
								// 			existeProducto = true;
								// 			msg.textContent('El producto ya existe');
								// 			$mdDialog.show(msg);
								// 			md.form = {};
								// 			break;
								// 		}
								// 	}
								// }
								
								if(existeProducto == false){
									vm.gridProductos.data.push({
										'NO_PRODUCTO': md.form.NO_PRODUCTO,
										'ID_COMP_RAMO_PROD': md.autocomplete.PRODUCTO.ID_PRODUCTO,
										'ID_PRODUCTO': md.autocomplete.PRODUCTO.ID_PRODUCTO,
										'DS_PRODUCTO': md.form.DS_PRODUCTO != undefined ? md.form.DS_PRODUCTO : '',
										'NO_RAMO': md.autocomplete.RAMO.NO_RAMO,
										'ID_RAMO': md.autocomplete.RAMO.ID_RAMO,
										'NU_COMISION': md.form.NU_COMISION,
										'NU_COMISION_CARTERA': md.form.NU_COMISION_CARTERA,
										'IS_NEW': true
									});
									$mdDialog.cancel();
								}
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

    	vm.descargarArchivo = function(file){
            ExportService.downloadFile(file.ID_ARCHIVO)
            .then(function successCallback(response) {
                if (response.status === 200) {
                    saveAs(new Blob([response.data]), file.NO_ARCHIVO);
                }
            }, function callBack(response){
                msg.textContent("Se ha producido un error al descargar el archivo");
                $mdDialog.show(msg);
                if(response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
		};
		
		vm.eliminarArchivo = function(file, index){
    		if(vm.listFiles != undefined && Array.isArray(vm.listFiles)){
    			// for(var i = 0; i < vm.listFiles.length; i++){
    			// 	if(vm.listFiles[i].ID_ARCHIVO === file.ID_ARCHIVO){
    			// 		vm.listFiles.splice(i,1);
    			// 		msg.textContent('Se ha eliminado correctamente');
    			// 		$mdDialog.show(msg);
    			// 		break;
    			// 	}
    			// }
				if(!file.ESTADO) {
					vm.listFiles.splice(index, 1);
				} else {
					if(file.IS_DELETED)
						file.IS_DELETED = false;
					else
					 	file.IS_DELETED = true;
				}
    		}
    	}

        // vm.deleteFile = function(file) {
		// 	for(var i = 0; i < vm.listFiles.length; i++){
		// 		if(vm.listFiles[i].NO_ARCHIVO === file.NO_ARCHIVO){
		// 			vm.listFiles.splice(i,1);
		// 			break;
		// 		}
		// 	}
		// }
		
		vm.deleteRow = function(indice){
			var grid = "";
			var listName = "";
			
			switch (indice) {
			case 2:
				grid = "gridRamos";
				listName = "ramosDeleted";
				break;
			case 3:
				grid = "gridProductos";
				listName = "productosDeleted";
				break;
			case 4:
				grid = "gridGarantias";
				listName = "garantiasDeleted";
				break;
			case 5:
				grid = "gridContactos";
				listName = "contactosDeleted";
				break;
			}
			
			if(vm.elementoSeleccionado != null && vm.elementoSeleccionado != undefined && vm[grid] != null && vm[grid] != undefined && vm[grid].data != null && vm[grid].data != undefined){
				for(var i = 0; i < vm[grid].data.length; i++){
					if(vm[grid].data[i] == vm.elementoSeleccionado){
                    	// vm[grid].data.splice(i, 1);
						vm[grid].data[i].IS_DELETED = true;
						vm[listName].push(vm[grid].data[i]);
						vm[grid].data.splice(i, 1);
						break;
					}
				}
			}
		}

		// vm.upload = function($file) {
		// 	var reader = new FileReader();
		//     reader.onload = function() {
		//         var dataUrl = reader.result;
		// 		var byteString;
		// 		if(dataUrl.split(',')[0].indexOf('base64') >= 0)
		// 			byteString = atob(dataUrl.split(',')[1]);
		// 		else
		// 			byteString = unescape(dataUrl.split(',')[1]);
					
		// 		var len = byteString.length;
		// 		var bytes = [];
		// 		for(var i=0; i<len; i++){
		// 			bytes.push(byteString.charCodeAt(i));
		// 		}
		//         var file = {
		// 			"DESCARGAR": false,
		// 			"ARCHIVO": bytes,
		// 			"ID_TIPO": 220,
		// 	        "NO_ARCHIVO": vm.checkFileName($file.name),
		// 			"IS_NEW": true
		// 			// "ESTADO": 'Pendiente'
		//         };
				
		// 		$scope.$apply(function() {
		// 			vm.listFiles.push(file);
		// 		});
				
		//     };
		// 	if($file)
		//     	reader.readAsDataURL($file);
		// }

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
								'DESCARGAR': false,
								'ARCHIVO': bytes,
								'ID_TIPO': 220,
								'NO_ARCHIVO': CommonUtils.checkFileName(oFile.name),
								'IS_NEW': true
							};
							
							$scope.$apply(function() {
								vm.listFiles.push(file);
							});
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
		}
    	
    	vm.validar = function(form2Validate) {
            if (form2Validate) {
				objFocus=angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}  	
                vm.indice = vm.indice;
            } else {
				vm.indice = vm.indice + 1;
				vm.checkIndex(vm.indice);
//                vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_VIDA');
            }
        }

		vm.siguiente = function (ind) {
			if(ind == 1){
				vm.validar(vm.formAseguradora.$invalid);
			}else{
				vm.indice = vm.indice + 1;
				vm.checkIndex(vm.indice);
			}
        }

        vm.anterior = function () {
			vm.indice = vm.indice - 1;
			vm.checkIndex(vm.indice);
        }
    	
        vm.checkGrid = function(api) {
			setTimeout(function() {
				if(api != undefined) {
					api.core.handleWindowResize();
				}
			}, 100);
		}
		
		vm.checkIndex = function(index) {
			if(index != undefined) {
				var api;
				switch (index) {
					case 2:
						api = vm.gridApiRam;
						break;
					case 3:
						api = vm.gridApiPro;
						break;
					case 4:
						api = vm.gridApiGar;
						break;
					case 5:
						api = vm.gridApiCon;
						break;
					default:
						break;
				}
				vm.checkGrid(api);
			}
		}

    	//Cambiar tabs
    	vm.changeTabs = function(index){
    		vm.showTable = index;
    	}   	
    }   
    
    ng.module('App').component('aseguradoraSd', Object.create(aseguradoraComponent));
    
})(window.angular);