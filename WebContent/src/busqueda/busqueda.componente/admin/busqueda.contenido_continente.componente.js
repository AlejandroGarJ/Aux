(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', 'PresupuestoService', '$scope', '$mdDialog', '$templateCache'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, PresupuestoService, $scope, $mdDialog, $templateCache){
    	var vm=this;
    	var json = {};
    	var url=window.location;
    	vm.colModificado = {};
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.typeContinente = "continente";
    	vm.typeContenido = "contenido";
    	
    	$templateCache.put('ui-grid/selectionRowHeaderButtons',
    			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
    	    );
    	
    	vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.alarmas != undefined && localStorage.alarmas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.alarmas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			if(/pendientes/.test(url)){
				vm.parent.buscar({}, "alarmas");
			}
			
			if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
        		vm.parent.ckPermisos = vm.permisos;
    		}
			
			vm.recargarListado();
			
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridContinente.data = vm.listContinente;
    		vm.gridContenido.data = vm.listContenido;
    		//vm.active = vm.dsActive;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.recargarListado = function(tipo){
    		
    		//Si recarga lista de contenido
    		if(tipo == "contenido"){
    			vm.loadContenido = true;
    			PresupuestoService.getContinenteContenido({"IN_CONTINENTE": false})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.loadContenido = false;
    					vm.listContenido = response.data.continentesContenidos;
    					vm.gridContenido.data = vm.listContenido;
    				}
    			});
    		} 
    		//Si recarga lista de continente
    		else if(tipo == "continente"){
    			vm.loadContinente = true;
    			PresupuestoService.getContinenteContenido({"IN_CONTINENTE": true})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.loadContinente = false;
    					vm.listContinente = response.data.continentesContenidos;
    					vm.gridContinente.data = vm.listContinente;
    				}
    			});
    		}
    		//Si inicia el componente y type es undefined
    		else {
    			vm.loadContinente = true;
    			vm.loadContenido = true;
    			PresupuestoService.getContinenteContenido({"IN_CONTINENTE": false})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.loadContenido = false;
    					vm.listContenido = response.data.continentesContenidos;
    					vm.gridContenido.data = vm.listContenido;
    				}
    			});
    			PresupuestoService.getContinenteContenido({"IN_CONTINENTE": true})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.loadContinente = false;
    					vm.listContinente = response.data.continentesContenidos;
    					vm.gridContinente.data = vm.listContinente;
    				}
    			});
    		}

    	}
    	
    	vm.gridContenido = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
				showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.recargarListado(grid.appScope.$ctrl.typeContenido)"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
    		      {field: 'DS_DESCRIPCION', 
    		    	  enableCellEdit: false,
    		    	  displayName: 'Tipo de vivienda', 
    		    	  cellTooltip: function(row){return row.entity.DS_DESCRIPCION},
    		      },
    		      {field: 'IM_CAPITAL', 
    		    	  displayName: 'Capital mínimo', 
    		    	  cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IM_CAPITAL]">{{row.entity.IM_CAPITAL}} €</div>'},
    		      {field: 'IM_PRECIO', 
		    		  displayName: 'Precio m/2', 
    		    	  cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IM_PRECIO]">{{row.entity.IM_PRECIO}} €/m2</div>'}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      
    		    	vm.gridApi = gridApi;
        		      
        		      vm.listaContinentesSeleccionados = [];
  		    	
	  		    	  gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
	      	              vm.listaContinentesSeleccionados = vm.gridApi.selection.getSelectedRows();
	      	          });
	  		    	
	                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
	      	              vm.listaContinentesSeleccionados = vm.gridApi.selection.getSelectedRows();
	      	          });
	                    
	                    vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
		  	      			  if(newValue != oldValue){
		  	      				  console.log(rowEntity);
		  	      				  vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
		  	      				  if(!rowEntity.IS_NEW)
		  	      					  rowEntity.IS_UPDATED = true;
//		  	      				  
//		  	      				  rowEntity.ID_CLIENTE = _.find(vm.tipos.concesiones, {'NO_NOMBRE':rowEntity.NO_NOMBRE}).ID_CLIENTE;
//		  	      				  rowEntity.ID_COMPANIA = _.find(vm.tipos.companias, {'NO_COMPANIA':rowEntity.NO_COMPANIA}).ID_COMPANIA;
		  	      			  }
		  	    		});
      		    }
    	}
    	
    	vm.gridContinente = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.recargarListado(grid.appScope.$ctrl.typeContinente)"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
    		      {field: 'DS_DESCRIPCION', 
    		    	  displayName: 'Tipo de vivienda', 
    		    	  enableCellEdit: false,
    		    	  cellTooltip: function(row){return row.entity.DS_DESCRIPCION},
    		      },
    		      {field: 'IM_PRECIO', 
    		    	  displayName: 'Precio m/2', 
    		    	  cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IM_PRECIO]">{{row.entity.IM_PRECIO}} €/m2</div>'}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      
    		    	vm.gridApi = gridApi;
        		      
        		      vm.listaContenidosSeleccionados = [];
  		    	
	  		    	  gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
	      	              vm.listaContenidosSeleccionados = vm.gridApi.selection.getSelectedRows();
	      	          });
	  		    	
	                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
	      	              vm.listaContenidosSeleccionados = vm.gridApi.selection.getSelectedRows();
	      	          });
	                    
	  	      		  vm.gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      			  }
	  	    		  });
      		    }
    	}
    	
    	vm.guardar = function(tipo){
    		var lista = [];
    		if(tipo == 'continente'){
    			lista = vm.gridContinente.data;
    		}else{
    			lista = vm.gridContenido.data;
    		}
    		
    		var json = {
				"continentesContenidos": lista
    		};
    		
    		PresupuestoService.saveContinenteContenido(json)
				.then(function successCallback(response){
					if(response.status == 200){
						msg.textContent('Se ha guardado correctamente.');
						$mdDialog.show(msg);
					}else{
						msg.textContent('Ha ocurrido un error al guardar. Contacte con el administrador.');
						$mdDialog.show(msg);
					}
			});
    		
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.contenido_continente.html";
    	}
    	
    }

    
    ng.module('App').component('busquedaContenidoContinente', Object.create(busquedaComponent));
    
})(window.angular);