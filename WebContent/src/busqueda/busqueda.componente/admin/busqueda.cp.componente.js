(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$location', 'BusquedaService', 'TiposService', 'BASE_SRC', '$mdDialog', '$templateCache'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($scope, $location, BusquedaService, TiposService, CodPostalService, BASE_SRC, $mdDialog, $templateCache){
    	var vm=this;
    	var json = {};
    	var url=window.location
    	vm.tipos = {};
    	vm.colModificado = {};
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.codpostal != undefined && localStorage.codpostal != ""){
				vm.gridOptions.data = JSON.parse(localStorage.codpostal);
				vm.backupJSON = JSON.parse(localStorage.codpostal);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			TiposService.getProvincias({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.provincias = response.data.TIPOS.TIPO;
					for(var j=0; j<vm.tipos.provincias.length; j++){
						vm.tipos.provincias[j].id = vm.tipos.provincias[j].NO_PROVINCIA;
					}
					if(vm.gridOptions.data != undefined){
						for(var i=0; i<vm.gridOptions.data.length; i++){
							vm.gridOptions.data[i].provincias = vm.tipos.provincias;
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
					vm.gridOptions.data[i].provincias = vm.tipos.provincias;
				}
				vm.backupJSON = vm.gridOptions.data;
			}
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined){
    			vm.gridApi.core.resfresh;
    		}
    	}
    	
    	vm.seleccionable = function(fila) {
			return true;
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
    		      {field: 'CO_CODIGO_POSTAL', displayName: 'Código Postal', cellTooltip: function(row){return row.entity.CO_CODIGO_POSTAL}, cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_CODIGO_POSTAL">{{row.entity.CO_CODIGO_POSTAL}}</div>'},
    		      {field: 'NO_PROVINCIA', displayName: 'Provincia', cellTooltip: function(row){return row.entity.NO_PROVINCIA}, editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'NO_PROVINCIA', editDropdownRowEntityOptionsArrayPath: 'provincias', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_PROVINCIA">{{row.entity.NO_PROVINCIA}}</div>'},
    		      {field: 'NO_POBLACION', displayName: 'Localidad', cellTooltip: function(row){return row.entity.NO_POBLACION}, cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_POBLACION">{{row.entity.NO_POBLACION}}</div>'},
    		      {field: 'NO_POBLACION_INE', displayName: 'Localidad INE', cellTooltip: function(row){return row.entity.NO_POBLACION_INE}, cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_POBLACION_INE">{{row.entity.NO_POBLACION_INE}}</div>'},
    		      {field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}, enableCellEdit:false},
    		      {field: 'FT_USU_MOD', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Modificado en', cellTooltip: function(row){return row.entity.FT_USU_MOD}, enableCellEdit:false},
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      
      		      vm.listaSeleccionados = [];
		    	
		    	  gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
    	              vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
    	          });
		    	
                  gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
    	              vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
    	          });
                  
	      		  vm.gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	      			  if(newValue != oldValue){

						  if (rowEntity.colModificado == null) {
  	      					  rowEntity.colModificado = {};
  	      				  }
  	      				  
  	      				  rowEntity.colModificado[colDef.field] = 'colModificado';
	      				  
	      				  if(!rowEntity.IS_NEW)
	      					  rowEntity.IS_UPDATED = true;
	      				  
	      				  rowEntity.CO_PROVINCIA = _.find(vm.tipos.provincias, {'NO_PROVINCIA':rowEntity.NO_PROVINCIA}).CO_PROVINCIA;
	      			  }
	    		  });

      		    }
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.cp.html";
    	}
    	
    	//////////////////////GUARDAR Y BORRAR///////////////////
    	vm.save = function(){
    		var datos = [];
			var json = {"CODPOSTALES":{"CODPOSTAL": datos}};
			if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
				for(var i=0; i<vm.gridOptions.data.length; i++){
    				if(vm.gridOptions.data[i].IS_NEW == true || vm.gridOptions.data[i].IS_UPDATED == true || vm.gridOptions.data[i].IS_DELETED == true){
    					datos.push(vm.gridOptions.data[i]);
    				}
				}
				
    			CodPostalService.addCodPostales(json)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data.ID_RESULT != 0){
                                msg.textContent(response.data.DS_RESULT);
                            } else{
                                msg.textContent("Se ha guardado correctamente");
                                vm.colModificado = {};
                            }
							
							if (vm.parent.form != null) {
		                        setTimeout(function(){ 
		                            vm.parent.buscar(vm.parent.form,vm.parent.tipo); 
		                        }, 1000);
							}
							
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
    				obj.push({ ID_POSTAL: vm.listaSeleccionados[i].ID_POSTAL, IS_DELETED: true, IT_VERSION: vm.listaSeleccionados[i].IT_VERSION });
    			}
    			
    			var json = {"CODPOSTALES":{"CODPOSTAL": obj}};
    			
    			CodPostalService.addCodPostales(json)
					.then(function successCallback(response){
						if(response.status == 200){
							for(var i = 0; i < vm.listaSeleccionados.length; i++){
								for(var j = 0; j < vm.gridOptions.data.length; j++){
									if(vm.gridOptions.data[j].ID_POSTAL === vm.listaSeleccionados[i].ID_POSTAL){
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
    			msg.textContent("Seleccione al menos una opción para borrar");
				$mdDialog.show(msg);
    		}
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
	                md.form = {};
	                md.tipo = "cp";
	                md.tipos = vm.tipos;
	                
	                md.add = function () {
	                	if (md.form == undefined || md.form.CO_POSTAL == '' || md.form.CO_POSTAL == undefined || md.form.NO_POBLACION == '' || md.form.NO_POBLACION == undefined || md.form.PROVINCIA == undefined){
	            			msg.textContent("Elija los datos para crear un código postal").multiple(true);
	        				$mdDialog.show(msg);
	            		} else {

	        				if(vm.gridOptions.data == undefined) {
	        					vm.gridOptions.data = [];
	        					if(vm.vista == 1) {
	        						vm.vista = 4;
	        					}
	        				}
	                        var obj = {"CO_CODIGO_POSTAL": md.form.CO_POSTAL, "NO_POBLACION": md.form.NO_POBLACION, "CO_PROVINCIA": md.form.PROVINCIA.CO_PROVINCIA, "NO_PROVINCIA": md.form.PROVINCIA.NO_PROVINCIA, "ID_PROVINCIA": md.form.PROVINCIA.ID_PROVINCIA, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil,"FT_USU_ALTA":new Date()};
	                        
	                        if(md.form.NO_POBLACION_INE != null && md.form.NO_POBLACION_INE != undefined){
	                            obj.NO_POBLACION_INE = md.form.NO_POBLACION_INE;
	                        }                
	        				
	                        vm.gridOptions.data.push(obj);
	        				md.form = {};
	        				vm.save();
	            		}
	                }
	                
	                md.cancel = function () {
	                	$mdDialog.cancel();
	                }
	            }]
    		})
    	}
    	
    }

    
    ng.module('App').component('busquedaCp', Object.create(busquedaComponent));
    
})(window.angular);