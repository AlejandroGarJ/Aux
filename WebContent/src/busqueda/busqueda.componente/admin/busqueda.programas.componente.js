(function(ng) {	


	//Crear componente de busqeuda
    var busquedaProgramasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'UsuarioWSService', 'TiposService', '$scope'],
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
 
    busquedaProgramasComponent.controller = function busquedaProgramasComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, UsuarioWSService, TiposService, $scope){
    	var vm=this;
    	var json = {};
		var url=window.location
		vm.numDetalles = [];
		vm.canales = [];
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
            vm.active = 0;
    		vm.gridOptions.data = vm.listBusqueda;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}

    	this.getGridOptions = function () {
    		var vv = vm;
    		return {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                enableRowHashing: false,
				gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{field: 'ID_PROGRAMA', 
					displayName: 'ID Programa', enableCellEdit: false,
					cellTooltip: function(row){return row.entity.ID_PROGRAMA},
					cellClass: function (grid, row) {if (row.entity.IS_DELETED == true) {return 'filaRoja';} else if (row.entity.IS_UPDATED == true) {return 'filaAmarilla';} else if (row.entity.IS_NEW == true) {return 'filaVerde';}},
	                },
				  {field: 'NO_PROGRAMA', displayName: 'Programa', enableCellEdit: false, 
	                	cellClass: function (grid, row) {if (row.entity.IS_DELETED == true) {return 'filaRoja';} else if (row.entity.IS_UPDATED == true) {return 'filaAmarilla';} else if (row.entity.IS_NEW == true) {return 'filaVerde';}}, 
	                	cellTooltip: function(row){return row.entity.DS_PROGRAMA}},
    		      {field: 'NO_EMAIL_CONTRATO', displayName: 'Emails', enableCellEdit: true, 
	                	cellClass: function (grid, row) {
	                		if (row.entity.IS_DELETED == true) {return 'filaRoja';} 
	                		else if (row.entity.IS_UPDATED == true) {return 'filaAmarilla';} 
	                		else if (row.entity.IS_NEW == true) {return 'filaVerde';}
                		},
	                	cellTooltip: function(row){return row.entity.NO_EMAIL_CONTRATO}, cellTemplate: '<div class="ui-grid-cell-contents celda-editable">{{row.entity.NO_EMAIL_CONTRATO}}</div>'}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      
      		      vm.listaSeleccionados = [];
				
				  if(gridApi.selection != undefined) {
					  gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
						  vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					  });
					
					  gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
						  vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					  });
					  gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
						  vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					  });
				  }
				
	  	      	  vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
  	      			  if(newValue != oldValue){
  	      				  if(!rowEntity.IS_NEW) {
  	      					          
							  if (colDef.field == 'NO_EMAIL_CONTRATO' && newValue == "") {
							  	  rowEntity.NO_EMAIL_CONTRATO = null;
	  	      					  rowEntity.IS_DELETED = true;
							  } else {
	  	      					  rowEntity.IS_UPDATED = true;
							  }
							  
  	      					  vv.refreshGrid();
  	      				  }
  	      			  }
	  	    	   });
      		    }
    		}
    	}
    	
    	vm.gridOptions = this.getGridOptions();
		
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.programasProv.html";
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
		
		//Abrir modal de nuevo usuario ws
        vm.openNewUserWS = function() {
        	vm.isNew = true;
        	vm.numDetalles.push(null);
            vm.active = vm.numDetalles.length;
    	}
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null && vm.numDetalles[i].NO_USUARIO === fila.NO_USUARIO){
    				existe = true;
    				break;
    			}
    		}
    		
    		if(!existe){
    			vm.numDetalles.push(fila);
                vm.active = vm.numDetalles.length;
    		}else {
                vm.active = vm.numDetalles.length;
            }
        	vm.isNew = false;
    	}
    	
    	//Boton de cerrar tabs
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
    	
    	//Creamos JSON
    	function rellenarJSON(){
    		json = {};
    		vm.isError = false;
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null){
    				delete vm.form[key];
    			}
				else{
					if(value.value instanceof Date){
						json[key]=vm.parent.dateFormat(value.value);
						
						//Comprueba las fechas que no sean al revés
						angular.forEach(vm.form, function(value2, key2){
							if(!vm.isError){
								vm.isError = vm.parent.validFechas(key2, value2.value, key, value.value);
							}
						});
					}
					else if(typeof(value.value) == 'object'){
						json[key]=[]
						for(var i=0;i<value.value.length;i++){
							json[key][i]=value.value[i].id;
						}
						json[key]=json[key].toString();
					}
					else{
						json[key]=value.value;
					}
					
				}
    		});
    	}
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		localStorage.clear();
    		rellenarJSON();
    		
			console.log(vm.json);
			
			if(!vm.isError){
				if(Object.keys(json).length !== 0){
				}
				else{
					$('#checkVacio').slideDown().delay(1500).slideUp();
				}
			}
			else{
				$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
			}
		}
    	
    	vm.addPrograma = function() {
    		if(vm.form == undefined || vm.form.DS_PROGRAMA == '' || vm.form.DS_PROGRAMA == undefined || vm.form.NO_EMAIL_CONTRATO == '' || vm.form.NO_EMAIL_CONTRATO == undefined) {
				msg.textContent('Elija los datos para crear el programa');
				$mdDialog.show(msg);
    		} else {
    			vm.gridOptions.data.unshift({"DS_PROGRAMA":vm.form.DS_PROGRAMA,"NO_EMAIL_CONTRATO": vm.form.NO_EMAIL_CONTRATO,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil});
    			vm.form = {};
    			vm.refreshGrid();
    		}
    	}
    	
    	vm.saveProgramas = function () {
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){

    			var obj = {
                	TIPOS: {
                		TIPO: []
                	}
                }

                for (var i = 0; i < vm.gridOptions.data.length; i++) {
                	var fila = vm.gridOptions.data[i];
                	if (fila.IS_UPDATED == true || fila.IS_NEW == true || fila.IS_DELETED == true) {
                		var objFila = {
                            "ID_TIPO_INTERNO": fila.ID_PROGRAMA,
							"CO_TIPO": fila.NO_EMAIL_CONTRATO,
							"NO_USU_ALTA": vm.parent.perfil
						};
                		
                		if (fila.IS_DELETED == true) {
                			objFila.IS_DELETED = true;
                		} else {
                			objFila.IS_NEW = true;
                		}
                		
                		obj.TIPOS.TIPO.push(objFila);
                	}
                }
    			
    			vm.appParent.abrirModalcargar(true);
    			
	    		TiposService.saveMailProgramaProveedor(obj)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data.ID_RESULT == 0){
								msg.textContent('Se ha guardado correctamente');
	                            
	                            setTimeout(function(){ 
	                            	vm.parent.recargarListado();
	                        	}, 1000);
	                            
								$mdDialog.show(msg);
							}else{
								msg.textContent(response.data.DS_RESULT);
			                    $mdDialog.show(msg);
							}
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al guardar');
                    $mdDialog.show(msg);
                });
    		}
    	}
    	
    	vm.deleteProgramas = function(modal){
    		if(vm.listaSeleccionados.length > 0){
	    		if (modal == true) {
	    			var confirm = $mdDialog.confirm()
		            .textContent('¿Está seguro de eliminar los programas seleccionados?')
		            .ariaLabel('Lucky day')
		            .targetEvent()
		            .ok('Aceptar')
		            .cancel('Cancelar');
	
		    	    $mdDialog.show(confirm).then(function() {
		    	        vm.deleteProgramas(false);
		    	    }, function() {
		    	    	$mdDialog.cancel();
		    	    });
	    		} else {
	        		var json = {};
	        		if(vm.listaSeleccionados.length > 0){
	        			for(var i = 0; i < vm.listaSeleccionados.length; i++){
	        				vm.listaSeleccionados[i].IS_DELETED = true;
	        			}
	        			
	        			var obj = {"TIPOS":{"TIPO": vm.listaSeleccionados}};

	        			vm.appParent.abrirModalcargar(true);
	        			TiposService.saveTiposPrograma(obj)
	    				.then(function successCallback(response){
	    					if(response.status == 200){
	    						if(response.data.ID_RESULT == 0){
	    							msg.textContent('Se ha eliminado correctamente');
	                                
	                                setTimeout(function(){ 
	                                	vm.parent.recargarListado();
	                            	}, 1000);
	                                
	    							$mdDialog.show(msg);
	    						}else{
	    							msg.textContent(response.data.DS_RESULT);
	    		                    $mdDialog.show(msg);
	    						}
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
    		} else {
				msg.textContent('Seleccione al menos una opción para borrar');
				$mdDialog.show(msg);
    		}
    	}
		
    	vm.refreshGrid = function () {
		    var data = vm.gridOptions.data;
		    vm.gridOptions = vm.getGridOptions();
		    vm.gridOptions.data = data;
    	}
    }

    
    ng.module('App').component('busquedaProgramas', Object.create(busquedaProgramasComponent));
    
})(window.angular);