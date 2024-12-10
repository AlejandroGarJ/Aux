(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC','$mdDialog', 'GarantiaService', '$scope', '$templateCache'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, GarantiaService, $scope, $templateCache){
    	var vm=this;
    	var json = {};
    	var url=window.location
    	vm.colModificado = {};
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
				vm.parent.ckPermisos = vm.permisos;
    		}
    		//Cargar las listas
//			if(localStorage.garantias != undefined && localStorage.garantias != ""){
//				vm.gridOptions.data = JSON.parse(localStorage.garantias);
//				vm.vista = 4;
//			}
//			else{
//				localStorage.clear();
//			}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
            
            if (vm.gridOptions.data == "undefined" || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /garantias/.test(url)) {
                if (vm.view == 4 && vm.listBusqueda.tipo == "garantias") {
                    vm.gridOptions.data = vm.listBusqueda.listas;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
                if (/garantias/.test(url)) {
                    vm.gridOptions.data = vm.listBusqueda;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
            } else {
                vm.vista = 4;
                vm.active = 0;
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
    		      {field: 'ID_GARANTIA', 
    		    	  displayName: 'Identificador', 
    		    	  cellTooltip: function(row){return row.entity.ID_GARANTIA},
    		      	  enableCellEdit: false,
    		      	  width: '7%',
    		      	  sort: { priority: 0, direction: 'desc' }, 
    		      },
    		      {field: 'NO_GARANTIA', displayName: 'Nombre garantía', cellTooltip: function(row){return row.entity.NO_GARANTIA},enableCellEdit: true,  editDropdownValueLabel: 'NO_GARANTIA', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_GARANTIA">{{row.entity.NO_GARANTIA}}</div>'},
    		      {field: 'FT_USU_ALTA', displayName: 'Creado en', width: '10%',cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_ALTA}, enableCellEdit: false},
    		      {field: 'FT_USU_MOD', displayName: 'Modificado en',width: '10%',cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_MOD}, enableCellEdit: false},
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
                    
                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
        	        });
                    
	  	      		vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  console.log(rowEntity);
	  	      				  
	  	      				  if (rowEntity.colModificado == null) {
	  	      					  rowEntity.colModificado = {};
	  	      				  }
	  	      				  
	  	      				  rowEntity.colModificado[colDef.field] = 'colModificado';
	  	      				  
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      			  }
	  	    		});
      		    }
		}
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC + "busqueda/busqueda.view/admin/busqueda.garantias.html";
    	}
    	
    	vm.add = function () {
    		$mdDialog.show({
	            templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_admin.modal.html',
	            controllerAs: '$ctrl',
	            clickOutsideToClose: true,
	            parent: angular.element(document.body),
	            fullscreen: false,
	            controller: ['$mdDialog', function ($mdDialog) {
	            	var md = this;
	                var obj = {};
	                var recibos = {};
	                md.tipo = "garantias";
	                
	                md.add = function () {
	            		if(md.noGarantia == undefined){
	            			msg.textContent("Elija un nombre para la garantía").multiple(true);
	        				$mdDialog.show(msg);
	            		}else{
	                        vm.gridOptions.data.push({"NO_GARANTIA": md.noGarantia, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA": new Date()});
	            			vm.save();
	        				vm.noGarantia = undefined;
	            		}
	                }
	                
	                md.cancel = function () {
	                	$mdDialog.cancel();
	                }
	            }]
    		})
    	}

    	//////////////////////GUARDAR Y BORRAR///////////////////
    	vm.save = function(){
    		var datos = [];
			var json = {"GARANTIAS": datos};
    		
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
				for(var i=0; i<vm.gridOptions.data.length; i++){
    				if(vm.gridOptions.data[i].IS_NEW == true || vm.gridOptions.data[i].IS_UPDATED == true || vm.gridOptions.data[i].IS_DELETED == true){
    					datos.push(vm.gridOptions.data[i]);
    					break;
					}
    			}
    			GarantiaService.actualizarGarantia(json)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data.ID_RESULT != 0){
								msg.textContent(response.data.DS_RESULT);
							} else{
								msg.textContent("Se ha guardado correctamente");
								vm.colModificado = {};
							}
                            setTimeout(function(){ 
                                vm.parent.buscar(vm.parent.form,vm.parent.tipo); 
                            }, 1000);
		    				$mdDialog.show(msg);
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al guardar');
                    $mdDialog.show(msg);
                });
    		}
    	}
    	
    	vm.borrar = function(){
			let obj = [];
    		if(vm.listaSeleccionados.length > 0){
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
					obj.push(
						{
							ID_GARANTIA: vm.listaSeleccionados[i].ID_GARANTIA,
							IT_VERSION: vm.listaSeleccionados[i].IT_VERSION,
							IS_DELETED: true
						}
					);
    			}
    			
    			GarantiaService.actualizarGarantia({"GARANTIAS": obj})
					.then(function successCallback(response){
						if(response.status == 200){
							for(var i = 0; i < vm.listaSeleccionados.length; i++){
								for(var j = 0; j < vm.gridOptions.data.length; j++){
									if(vm.gridOptions.data[j].ID_GARANTIA === vm.listaSeleccionados[i].ID_GARANTIA){
										var index = vm.gridOptions.data.indexOf(vm.gridOptions.data[j]);
										vm.gridOptions.data.splice( index, 1 );
										break;
									}
								}
							}
							msg.textContent("Se ha eliminado correctamente");
		    				$mdDialog.show(msg);
						}else{
							msg.textContent("Ha ocurrido un error al eliminar");
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
    }

    
    ng.module('App').component('busquedaGarantias', Object.create(busquedaComponent));
    
})(window.angular);