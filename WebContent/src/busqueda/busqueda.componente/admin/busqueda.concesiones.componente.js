(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', 'BusquedaService', 'TiposService', 'ConcesionService', 'BASE_SRC', '$mdDialog', '$scope', '$templateCache', 'ConversorService'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, BusquedaService, TiposService, ConcesionService, BASE_SRC, $mdDialog, $scope, $templateCache, ConversorService){
    	var vm=this;
    	var json = {};
    	var url=window.location;
    	vm.tipos = {};
		vm.colModificado = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.concesion != undefined && localStorage.concesion != ""){
				vm.gridOptions.data = JSON.parse(localStorage.concesion);
				vm.backupJSON = vm.gridOptions.data;
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			TiposService.getCompania({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.companias = response.data.TIPOS.TIPO;
					for(var j=0; j<vm.tipos.companias.length; j++){
						vm.tipos.companias[j].id = vm.tipos.companias[j].NO_COMPANIA;
					}
					if(vm.gridOptions.data != undefined){
						for(var i=0; i<vm.gridOptions.data.length; i++){
							vm.gridOptions.data[i].companias = vm.tipos.companias;
						}
					}
				}
			});
    		
			BusquedaService.buscar({}, 'concesion')
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.concesiones = response.data.CONCESIONESCOMPANIAS.CONCESIONCOMPANIA;
					for(var j = 0; j < vm.tipos.concesiones.length; j++){
						vm.tipos.concesiones[j].id = vm.tipos.concesiones[j].NO_NOMBRE;
					}
					if(vm.tipos.companias != undefined) {
						for(var j = 0; j < vm.tipos.companias.length; j++){
							vm.tipos.companias[j].id = vm.tipos.companias[j].NO_COMPANIA;
						}
					}
					if(vm.gridOptions.data != undefined) {
						for(var i = 0; i < vm.gridOptions.data.length; i++){
							vm.gridOptions.data[i].concesiones = vm.tipos.concesiones;
							vm.gridOptions.data[i].companias = vm.tipos.companias;
						}
					}
    			}
    		});

    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		
    		if(vm.gridOptions.data != undefined){
				for(var i=0; i<vm.gridOptions.data.length; i++){
					vm.gridOptions.data[i].concesiones = vm.tipos.concesiones;
				}
				vm.backupJSON = JSON.parse(JSON.stringify(vm.gridOptions.data));
			}
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
    		      {field: 'NO_NOMBRE', 
    		    	  displayName: 'Concesión', 
    		    	  cellTooltip: function(row){return row.entity.NO_NOMBRE}, editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'NO_NOMBRE', editDropdownRowEntityOptionsArrayPath: 'concesiones', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_NOMBRE]">{{row.entity.NO_NOMBRE}}</div>'
    		      },
    		      {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function(row){return row.entity.NO_COMPANIA}, editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'id', editDropdownRowEntityOptionsArrayPath: 'companias', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_COMPANIA]">{{row.entity.NO_COMPANIA}}</div>'},
    		      {field: 'FD_INICIO', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha inicio', cellTooltip: function(row){return row.entity.FD_INICIO}},
    		      {field: 'FD_FIN', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha fin', cellTooltip: function(row){return row.entity.FD_FIN}},
    		      {field: 'NO_USU_ALTA', displayName: 'Creado por', cellTooltip: function(row){return row.entity.NO_USU_ALTA}},
    		      {field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}},
    		      {field: 'NO_USU_MOD', displayName: 'Modificado por', cellTooltip: function(row){return row.entity.NO_USU_MOD}},
    		      {field: 'FT_USU_MOD', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Modificado en', cellTooltip: function(row){return row.entity.FT_USU_MOD}},
    		      {field: 'NO_COMPANIA', displayName: ' ', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verConversiones(row.entity)">Ver conversiones</a></div>'}
    		      ],
    		    onRegisterApi: function( gridApi ) {
    		    	vm.gridApi = gridApi;
        		      
    		    	vm.listaSeleccionados = [];
                    
                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					});
					gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
        	        });
                    
	  	      		vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  console.log(rowEntity);
	  	      				  vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      				  
	  	      				  rowEntity.ID_CLIENTE = _.find(vm.tipos.concesiones, {'NO_NOMBRE':rowEntity.NO_NOMBRE}).ID_CLIENTE;
	  	      				  rowEntity.ID_COMPANIA = _.find(vm.tipos.companias, {'NO_COMPANIA':rowEntity.NO_COMPANIA}).ID_COMPANIA;
	  	      			  }
	  	    		});
      		    }
    	}
    	vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.concesiones.html";
    	}
    	
    	//Añadir una fila nueva
    	vm.addConcesion = function(){
			if (vm.formNuevaConcesion.$invalid) {
            	objFocus=angular.element('.ng-empty.ng-invalid-required:visible');           	
				msg.textContent("Se deben rellenar correctamente los datos para añadir una concesión");
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
                vm.indice = vm.indice;
            }else{
            	vm.gridOptions.data.push({
	    			"NO_NOMBRE":vm.form.CLIENTE.NO_NOMBRE, 
	    			"NO_COMPANIA":vm.form.COMPANIA.NO_COMPANIA,
	    			"FD_INICIO": vm.form.FD_INICIO,
	    			"FD_FIN": vm.form.FD_FIN,
	    			"NO_USU_ALTA": vm.parent.perfil,
	    			"FT_USU_ALTA": new Date(),
	    			"IS_NEW": true,
	    			"ID_COMPANIA": vm.form.COMPANIA.ID_COMPANIA,
	    			"ID_CLIENTE": vm.form.CLIENTE.ID_CLIENTE 
	    		});
	    		vm.form = {};
            }
    	}    	
    	
    	//////////////////////GUARDAR Y BORRAR TIPOS///////////////////
    	vm.save = function(){
    		var datos = [];
    		var json = {"CONCESIONESCOMPANIAS":{"CONCESIONCOMPANIA":datos}};
    		
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
				for(var i=0; i<vm.gridOptions.data.length; i++){
    				if(vm.gridOptions.data[i].IS_NEW == true || vm.gridOptions.data[i].IS_UPDATED == true || vm.gridOptions.data[i].IS_DELETED == true){
    					datos.push(vm.gridOptions.data[i]);
    					break;
    				}
				}
				
    			ConcesionService.addConcesiones(json)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data.ID_RESULT == 0){
								msg.textContent('Se ha guardado correctamente');
                                vm.colModificado = {};
                                vm.parent.buscar(vm.parent.form,vm.parent.tipo);
								$mdDialog.show(msg);
							}else{
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
							}
						}else{
							msg.textContent('Ha ocurrido un error al guardar.');
							$mdDialog.show(msg);
						}
	                }, function errorCallback(response) {
	    				msg.textContent('Ha ocurrido un error al guardar');
	                    $mdDialog.show(msg);
	                });
    		}
    	}
    	
    	vm.borrar = function(){
    		var json = {"CONCESIONESCOMPANIAS":{"CONCESIONCOMPANIA":vm.listaSeleccionados}};
    		if(vm.listaSeleccionados.length > 0){
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				vm.listaSeleccionados[i].IS_DELETED = true;
    			}
    			
    			ConcesionService.addConcesiones(json)
					.then(function successCallback(response){
						if(response.status == 200){
							for(var i = 0; i < vm.listaSeleccionados.length; i++){
								for(var j = 0; j < vm.gridOptions.data.length; j++){
									if(vm.gridOptions.data[j].ID_CONCESION_COMPANIA === vm.listaSeleccionados[i].ID_CONCESION_COMPANIA){
										var index = vm.gridOptions.data.indexOf(vm.gridOptions.data[j]);
										vm.gridOptions.data.splice( index, 1 );
										break;
									}
								}
							}
							msg.textContent('Se ha eliminado correctamente');
							$mdDialog.show(msg);
						}else{
							msg.textContent('Ha ocurrido un error al eliminar');
							$mdDialog.show(msg);
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al eliminar');
                    $mdDialog.show(msg);
                });
    		}else{
				msg.textContent('Seleccione al menos una opción para borrar');
				$mdDialog.show(msg);
    		}
    	}
    	
    	
    	
    	//Ver conversiones
    	vm.verConversiones = function(row){
    		vm.conversor = row;
    		$mdDialog.show({
    			templateUrl: BASE_SRC+'busqueda/busqueda.modals/conversiones.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;
    		    	md.$onInit = function(){
    		    		ConversorService.getConversorByFilter({"ID_COMPANIA": vm.conversor.ID_COMPANIA})
	    					.then(function successCallback(response){
	    						if(response.status == 200){
	    							md.gridOptions.data = response.data.CONVERSORES;
	    						}else{
	    							msg.textContent('Ha ocurrido un error al recuperar las conversiones.');
	    							$mdDialog.show(msg);
	    						}
	    				});
    		    	}
    		    	
    		    	md.gridOptions = {
    		    			enableSorting: true,
    		    			enableHorizontalScrollbar: 0,
    		    			paginationPageSizes: [15,30,50],
    		    		    paginationPageSize: 30,
    		    		    enableRowSelection: true,
    						enableSelectAll: true,
    						selectionRowHeaderWidth: 29,
    		    		    columnDefs: [
    		    		      {field: 'CO_DATO_COMPANIA', displayName: 'Dato aseguradora', cellTooltip: function(row){return row.entity.CO_DATO_COMPANIA}, cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_DATO_COMPANIA]">{{row.entity.CO_DATO_COMPANIA}}</div>'},
    		    		      {field: 'NO_USU_ALTA', displayName: 'Creado por', cellTooltip: function(row){return row.entity.NO_USU_ALTA}},
    		    		      {field: 'FT_USU_MOD', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Modificado en', cellTooltip: function(row){return row.entity.FT_USU_MOD}}
    		    		      ],
    		    		    onRegisterApi: function( gridApi ) {
    		    		    	vm.gridApi = gridApi;
    		      		    }
    		    	}
    		    	
    		    	md.addConversion = function(){
    		    		if(md.form.Aseguradora != undefined){
    		    			md.gridOptions.data.push({
    		    				'CO_DATO_COMPANIA': md.form.Aseguradora,
    		    				'NO_USU_ALTA': vm.parent.perfil,
    		    				'FT_USU_MOD': new Date()
    		    			});
    		    		}
    		    		md.form.Aseguradora = undefined;
					};
					
					md.saveConversion = function(){
						var json = {"CONVERSORES": {"CONVERSOR": md.gridOptions.data}};
						if(md.gridOptions.data != undefined && Array.isArray(md.gridOptions.data)){
							ConversorService.saveConversor(json)
								.then(function successCallback(response){
									if(response.status == 200){
										msg.textContent('Se ha guardado correctamente');
										$mdDialog.show(msg);
									}else{
										msg.textContent('Ha ocurrido un error al guardar');
										$mdDialog.show(msg);
									}
							});
						}
					}

					md.borrarConversion = function(){
						if(md.listaSeleccionados.length > 0){
							for(var i = 0; i < md.listaSeleccionados.length; i++){
								md.listaSeleccionados[i].IS_DELETED = true;
							}
							
							var json = {"CONVERSORES": md.listaSeleccionados};
							
							ConversorService.saveConversor(json)
								.then(function successCallback(response){
									if(response.status == 200){
										for(var i = 0; i < md.listaSeleccionados.length; i++){
											for(var j = 0; j < md.gridOptions.data.length; j++){
												if(md.gridOptions.data[j].ID_CONVERSOR === md.listaSeleccionados[i].ID_CONVERSOR){
													var index = md.gridOptions.data.indexOf(md.gridOptions.data[j]);
													md.gridOptions.data.splice( index, 1 );
													break;
												}
											}
										}
										msg.textContent('Se ha eliminado correctamente');
										$mdDialog.show(msg);
									}else{
										msg.textContent('Ha ocurrido un error al eliminar');
										$mdDialog.show(msg);
									}
							});
						}else{
							msg.textContent('Seleccione al menos una opción para borrar');
							$mdDialog.show(msg);
						}
					}
    		    	
    				md.hide = function() {
		    	      $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
		    	      $mdDialog.cancel();
		    	      if(objFocus!=undefined){
			    	      	objFocus.focus();
			    	      } 
		    	      
		    	    };

		    	    md.answer = function(answer) {
		    	      $mdDialog.hide(answer);
					};

                }]
    		});
    	}
		
		
    	
    }

    
    ng.module('App').component('busquedaConcesiones', Object.create(busquedaComponent));
    
})(window.angular);