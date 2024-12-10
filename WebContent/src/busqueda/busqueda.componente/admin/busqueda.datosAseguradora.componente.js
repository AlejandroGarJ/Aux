(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$scope', '$mdDialog', 'ConversorService', 'TiposService', '$templateCache'],
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
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $scope, $mdDialog, ConversorService, TiposService, $templateCache){
    	var vm=this;
    	var json = {};
    	var url=window.location;
		vm.colModificado = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		
            vm.isEdited = false;
            
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		vm.vista = 1;
    		//Cargar las listas
    		ConversorService.getListCampos({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.campos = response.data.CONVERSORES;
				}
			});
    		
    		TiposService.getCompania()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.compania = response.data.TIPOS.TIPO;
				}
			});
    		
    		TiposService.getRamos({"IN_TARIFICABLE": true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.ramos = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
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
    	}
    	
    	this.$onChanges = function(){
            vm.form = {};
            vm.form.RAMO = null;
            vm.form.CAMPO = null;
            vm.form.COMPANIA = null;
            vm.form.NO_VALOR = null;
            vm.form.NO_OPERACION = null;
            vm.isEdited = false;
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		//vm.active = vm.dsActive;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
        this.editarFila = function (row) {
            vm.isEdited = true;
            vm.rowEdit = row;
            var idCampo = row.ID_CAMPO;
            var idCompania = row.ID_COMPANIA;
            var idRamo = row.ID_RAMO;

            if(idCampo != null && vm.campos != null){
                for(var i = 0; i < vm.campos.length; i++){
                    if(idCampo == vm.campos[i].ID_CAMPO){
                        vm.form.CAMPO = vm.campos[i];
                        break;
                    }
                }
            }

            if(idCompania != null && vm.compania != null){
                for(var i = 0; i < vm.compania.length; i++){
                    if(idCompania == vm.compania[i].ID_COMPANIA){
                        vm.form.COMPANIA = vm.compania[i];
                        break;
                    }
                }
            }

            var existeRamo = false;
            if(idRamo != null && vm.ramos != null){
                for(var i = 0; i < vm.ramos.length; i++){
                    if(idRamo == vm.ramos[i].ID_RAMO){
                        vm.form.RAMO = vm.ramos[i];
                        existeRamo = true;
                        break;
                    }
                }
            }
            if(existeRamo == false){
                vm.form.RAMO = null;
            }

            vm.form.NO_VALOR = row.NO_VALOR;
            vm.form.NO_OPERACION = row.NO_OPERACION;
        }
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableCellEdit: false,
    			enableHorizontalScrollbar: 0,
    			enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						field: 'DS_CAMPO',
						displayName: 'Campo',
						cellTooltip: function(row){return row.entity.DS_CAMPO},
						cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.DS_CAMPO}}</div>'
					},
					{
						field: 'NO_COMPANIA',
						displayName: 'Aseguradora',
						cellTooltip: function(row){return row.entity.NO_COMPANIA},
						cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.NO_COMPANIA}}</div>'
					},
					{
						field: 'NO_RAMO',
						displayName: 'Ramo',
						cellTooltip: function(row){return row.entity.NO_RAMO},
						cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.NO_RAMO}}</div>'
					},
					{
						field: 'NO_VALOR',
						displayName: 'Valor',
						cellTooltip: function(row){return row.entity.NO_VALOR},
						editDropdownValueLabel: 'NO_VALOR',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_VALOR">{{row.entity.NO_VALOR}}</div>',
						enableCellEdit: true
					},
					{
						field: 'NO_OPERACION',
						displayName: 'Operación',
						cellTooltip: function(row){return row.entity.NO_OPERACION},
						editDropdownValueLabel: 'NO_OPERACION',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_OPERACION">{{row.entity.NO_OPERACION}}</div>',
						enableCellEdit: true
					},
					{
						field: 'FT_USU_ALTA',
						cellFilter: 'date:\'dd/MM/yyyy\'',
						displayName: 'Creado en',
						cellTooltip: function(row){return row.entity.FT_USU_ALTA}
					},
					{
						field: 'FT_USU_MOD',
						cellFilter: 'date:\'dd/MM/yyyy\'',
						displayName: 'Modificado en',
						cellTooltip: function(row){return row.entity.FT_USU_MOD}
					}
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
    	
        vm.acceptEditRow = function () {
            if(vm.form == undefined || vm.form.CAMPO == undefined || vm.form.COMPANIA == undefined || vm.form.RAMO == undefined || vm.form.NO_VALOR == undefined || vm.form.NO_VALOR == ''){
                msg.textContent('Seleccione los datos correctamente para editar la fila');
                $mdDialog.show(msg);
            } else {
                var indice = 0;
                for(var i = 0; i < vm.gridOptions.data.length; i++){
                    if (vm.rowEdit == vm.gridOptions.data[i]) {
                        indice = i;
                        break;
                    }
                }
                
                vm.gridOptions.data[indice] = {
                    "ID_CAMPO":vm.form.CAMPO.ID_CAMPO,
                    "NO_CAMPO":vm.form.CAMPO.NO_CAMPO,
                    "DS_CAMPO":vm.form.CAMPO.DS_CAMPO,
                    "ID_COMPANIA":vm.form.COMPANIA != undefined ? vm.form.COMPANIA.ID_COMPANIA : null,
                    "NO_COMPANIA":vm.form.COMPANIA != undefined ? vm.form.COMPANIA.NO_COMPANIA : null,
                    "NU_CIF":vm.form.COMPANIA != undefined ? vm.form.COMPANIA.NU_CIF : null,
                    "NO_COMERCIAL":vm.form.COMPANIA != undefined ? vm.form.COMPANIA.NO_COMERCIAL : null,
                    "ID_RAMO":vm.form.RAMO.ID_RAMO,
                    "NO_RAMO":vm.form.RAMO.NO_RAMO,
                    "NO_VALOR":vm.form.NO_VALOR,
                    "NO_OPERACION":vm.form.NO_OPERACION,
					"IS_UPDATED":true,
					"IT_VERSION": vm.gridOptions.data[indice].IT_VERSION,
                    "ID_DATO_ASEGURADORA": vm.gridOptions.data[indice].ID_DATO_ASEGURADORA
                };
                
                vm.cancelEditRow();
            }
        }
        
        vm.cancelEditRow = function () {
        	vm.form = {};
            vm.form.RAMO = null;
            vm.form.CAMPO = null;
            vm.form.COMPANIA = null;
            vm.form.NO_VALOR = null;
            vm.form.NO_OPERACION = null;
            vm.isEdited = false;
        }
    	
    	vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.datosAseguradora.html";
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		console.log(index);
    		vm.numDetalles.splice(index,1);
    		vm.active = 0;

    	}
    	
    	//////////////////////GUARDAR Y BORRAR///////////////////
    	vm.save = function(){
    		var json = {"CONVERSORES": vm.gridOptions.data.filter(x => (x.IS_NEW == true || x.IS_DELETED == true || x.IS_UPDATED == true))};
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
    			vm.appParent.abrirModalcargar(true);
    			ConversorService.saveDatosAseguradora(json)
					.then(function successCallback(response){
						if(response.status == 200){
							msg.textContent('Se ha guardado correctamente').multiple(false);
							vm.colModificado = {};
	                        
	                        setTimeout(function(){ 
	                            vm.parent.buscar(vm.parent.form,vm.parent.tipo); 
	                        }, 1000);
							$mdDialog.show(msg);
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al guardar').multiple(false);
                    $mdDialog.show(msg);
                });
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
	                md.form = {};
	                md.tipo = 'datosAseguradora';
	                md.campos = vm.campos;
	                md.compania = vm.compania;
	                md.ramos = vm.ramos;
	                md.parent = vm.parent;
	                
	                md.add = function () {
                		if(md.form == undefined || md.form.CAMPO == undefined || md.form.COMPANIA == undefined || md.form.RAMO == undefined || md.form.NO_VALOR == undefined || md.form.NO_VALOR == ''){
                			msg.textContent('Seleccione los datos correctamente para añadir el dato').multiple(true);
            				$mdDialog.show(msg);
                		}else{
                			vm.gridOptions.data.unshift({"ID_CAMPO":md.form.CAMPO.ID_CAMPO, "NO_CAMPO":md.form.CAMPO.NO_CAMPO,"DS_CAMPO":md.form.CAMPO.DS_CAMPO,"ID_COMPANIA":md.form.COMPANIA != undefined ? md.form.COMPANIA.ID_COMPANIA : null, "NO_COMPANIA":md.form.COMPANIA != undefined ? md.form.COMPANIA.NO_COMPANIA : null, "NU_CIF":md.form.COMPANIA != undefined ? md.form.COMPANIA.NU_CIF : null, "NO_COMERCIAL":md.form.COMPANIA != undefined ? md.form.COMPANIA.NO_COMERCIAL : null,  "ID_RAMO":md.form.RAMO.ID_RAMO, "NO_RAMO":md.form.RAMO.NO_RAMO, "NO_VALOR":md.form.NO_VALOR, "NO_OPERACION":md.form.NO_OPERACION,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
                			md.form = {};
                			vm.save();
    	                	$mdDialog.cancel();
                		}
	                }
	                
	                md.cancel = function () {
	                	$mdDialog.cancel();
	                }
	            }]
    		})
    	}
    	
    	vm.borrar = function(){
    		if(vm.listaSeleccionados.length > 0){
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				if (vm.listaSeleccionados[i].ID_DATO_ASEGURADORA == null) {
						var index = vm.gridOptions.data.findIndex(x => x == vm.listaSeleccionados[i]);
						if (index >= 0) {
							vm.gridOptions.data.splice(i, 1);
						}
						vm.listaSeleccionados.splice(i, 1);
						i--;
					} else {
	    				vm.listaSeleccionados[i].IS_DELETED = true;
					}
    			}

    			if (vm.listaSeleccionados.length > 0) {
	    			var json = {"CONVERSORES": vm.listaSeleccionados};
	    			vm.appParent.abrirModalcargar(true);
	    			ConversorService.saveDatosAseguradora(json)
						.then(function successCallback(response){
							if(response.status == 200){
								for(var i = 0; i < vm.listaSeleccionados.length; i++){
									for(var j = 0; j < vm.gridOptions.data.length; j++){
										if(vm.gridOptions.data[j].ID_DATO_ASEGURADORA === vm.listaSeleccionados[i].ID_DATO_ASEGURADORA){
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
    			} else {
					msg.textContent('Se ha eliminado correctamente');
					$mdDialog.show(msg);
    			}
    		}else{
    			msg.textContent('Seleccione al menos una opción para borrar');
				$mdDialog.show(msg);
    		}
    	}
    }

    
    ng.module('App').component('busquedaDatosAseguradora', Object.create(busquedaComponent));
    
})(window.angular);