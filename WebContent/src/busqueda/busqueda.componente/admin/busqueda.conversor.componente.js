(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', 'ConversorService', 'TiposService', '$mdDialog', '$scope', '$templateCache'],
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
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, ConversorService, TiposService, $mdDialog, $scope, $templateCache){
    	var vm=this;
    	var json = {};
		var url=window.location
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		
		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

		vm.colModificado = {};
		var fieldCol = {
			field: 'DS_CAMPO',
			displayName: 'Campo',
			cellTooltip: function(row){return row.entity.DS_CAMPO},
			cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_CAMPO">{{row.entity.DS_CAMPO}}</div>',
			enableCellEdit: true,
			editableCellTemplate: 'ui-grid/dropdownEditor',
			editDropdownValueLabel: 'DS_CAMPO',
			editDropdownOptionsArray: []
		};
		var companyCol = {
			field: 'NO_COMPANIA',
			displayName: 'Aseguradora',
			cellTooltip: function(row){return row.entity.NO_COMPANIA},
			cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_COMPANIA">{{row.entity.NO_COMPANIA}}</div>',
			enableCellEdit: true,
			editableCellTemplate: 'ui-grid/dropdownEditor',
			editDropdownValueLabel: 'NO_COMPANIA',
			editDropdownOptionsArray: [],
		};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
            vm.isEdited = false;
    		
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		ConversorService.getListCampos({"IS_SELECTED": true})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.campos = response.data.CONVERSORES;
					setDdOptions(vm.campos, fieldCol, 'ID_CAMPO', 'DS_CAMPO');
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getCompania()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.compania = response.data.TIPOS.TIPO;
					setDdOptions(vm.compania, companyCol, 'ID_COMPANIA', 'NO_COMPANIA');
				}
			});

    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		vm.form = {};
            vm.form.COMPANIA = null;
            vm.form.CAMPO = null;
            vm.form.CO_DATO_COMPANIA = null;
            vm.form.CO_DATO_INTERNO = null;
            vm.isEdited = false;
    		//vm.active = vm.dsActive;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
        this.editarFila = function (row) {
            vm.isEdited = true;
            vm.rowEdit = row;
            var idCampo = row.NO_CAMPO;
            var idCompania = row.ID_COMPANIA;

            var existeCampo = false;
            if(idCampo != null && vm.campos != null){
                for(var i = 0; i < vm.campos.length; i++){
                    if(idCampo == vm.campos[i].NO_CAMPO){
                    	existeCampo = true;
                        vm.form.CAMPO = vm.campos[i];
                        vm.searchCampo = vm.campos[i].DS_CAMPO;
                        break;
                    }
                }
            }
            if(existeCampo == false){
            	vm.form.CAMPO = null;
            }

            if(idCompania != null && vm.compania != null){
                for(var i = 0; i < vm.compania.length; i++){
                    if(idCompania == vm.compania[i].ID_COMPANIA){
                        vm.form.COMPANIA = vm.compania[i];
                        vm.searchAseg = vm.compania[i].NO_COMERCIAL;
                        break;
                    }
                }
            }
            
            vm.form.CO_DATO_COMPANIA = row.CO_DATO_COMPANIA;
            vm.form.CO_DATO_INTERNO = row.CO_DATO_INTERNO;
        }
        
        vm.acceptEditRow = function(){
            if(vm.form == undefined || vm.form.CAMPO == undefined || vm.form.COMPANIA == undefined){
                msg.textContent('Elija los datos para crear el conversor');
                $mdDialog.show(msg);
            }else{
                var indice = 0;
                for(var i = 0; i < vm.gridOptions.data.length; i++){
                    if (vm.rowEdit == vm.gridOptions.data[i]) {
                        indice = i;
                        break;
                    }
                }
                
                vm.gridOptions.data[indice] = {
					"ID_CONVERSOR": vm.gridOptions.data[indice].ID_CONVERSOR,
                    "DS_CAMPO":vm.form.CAMPO.DS_CAMPO,
                    "ID_CAMPO":vm.form.CAMPO.ID_CAMPO,
                    "NO_COMPANIA":vm.form.COMPANIA.NO_COMPANIA,
                    "ID_COMPANIA":vm.form.COMPANIA.ID_COMPANIA,
                    "CO_DATO_COMPANIA": vm.form.CO_DATO_COMPANIA,
                    "CO_DATO_INTERNO": vm.form.CO_DATO_INTERNO,
					"NO_USU_MOD":vm.parent.perfil,
					"IT_VERSION": vm.gridOptions.data[indice].IT_VERSION,
                    "IS_UPDATED":true
                };
                vm.form = {};
                
                vm.cancelEditRow();
            }
        }
        
        vm.cancelEditRow = function () {
            vm.form = {};
            vm.form.COMPANIA = null;
            vm.form.CAMPO = null;
            vm.form.CO_DATO_COMPANIA = null;
            vm.form.CO_DATO_INTERNO = null;
            vm.isEdited = false;
            vm.searchCampo = "";
            vm.searchAseg = "";
        }
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableCellEdit: false,
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
					fieldCol,
					companyCol,
					{
						field: 'CO_DATO_COMPANIA',
						displayName: 'Dato Aseguradora',
						cellTooltip: function(row){return row.entity.CO_DATO_COMPANIA},
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_DATO_COMPANIA">{{row.entity.CO_DATO_COMPANIA}}</div>',
						enableCellEdit: true
					},
					{
						field: 'CO_DATO_INTERNO',
						displayName: 'Dato Intermedio',
						cellTooltip: function(row){return row.entity.CO_DATO_INTERNO},
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_DATO_INTERNO">{{row.entity.CO_DATO_INTERNO}}</div>',
						enableCellEdit: true
					},
					{
						field: 'FT_USU_ALTA',
						cellFilter: 'date:\'dd/MM/yyyy\'',
						displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}
					},
					{
						field: 'FT_USU_MOD',
						cellFilter: 'date:\'dd/MM/yyyy\'',
						displayName: 'Modificado en',
						cellTooltip: function(row){return row.entity.FT_USU_MOD}
					},
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
							switch (colDef.field) {
								case 'DS_CAMPO':
									rowEntity.ID_CAMPO = _.find(vm.campos, {'DS_CAMPO':rowEntity.DS_CAMPO}).ID_CAMPO;
									break;
								case 'NO_COMPANIA':
									rowEntity.ID_COMPANIA = _.find(vm.compania, {'NO_COMPANIA':rowEntity.NO_COMPANIA}).ID_COMPANIA;
									break
							
								default:
									break;
							}
						}
	  	    		});
      		    }
    	}
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.conversor.html";
    	}
    	
    	//////////////////////GUARDAR Y BORRAR///////////////////
    	vm.save = function(){
			var json = {"CONVERSORES": vm.gridOptions.data.filter(x => (x.IS_NEW == true || x.IS_DELETED == true || x.IS_UPDATED == true))};			
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
    			vm.appParent.abrirModalcargar(true);
    			ConversorService.saveConversor(json)
					.then(function successCallback(response){
						if(response.status == 200){
							msg.textContent('Se ha guardado correctamente').multiple(false);
							$mdDialog.show(msg);
	                        vm.colModificado = {};
	                        
	                        setTimeout(function(){ 
	                            vm.parent.buscar(vm.parent.form,vm.parent.tipo); 
	                        }, 1000);
						}else{
							msg.textContent('Ha ocurrido un error al guardar').multiple(false);
							$mdDialog.show(msg);
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al guardar').multiple(false);
                    $mdDialog.show(msg);
                });
			}
		}
    	
    	vm.borrar = function(){
    		if(vm.listaSeleccionados.length > 0){
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				if (vm.listaSeleccionados[i].ID_CONVERSOR == null) {
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
        			ConversorService.saveConversor(json)
    					.then(function successCallback(response){
    						if(response.status == 200){
    							for(var i = 0; i < vm.listaSeleccionados.length; i++){
    								for(var j = 0; j < vm.gridOptions.data.length; j++){
    									if(vm.gridOptions.data[j].ID_CONVERSOR === vm.listaSeleccionados[i].ID_CONVERSOR){
    										var index = vm.gridOptions.data.indexOf(vm.gridOptions.data[j]);
    										vm.gridOptions.data.splice( index, 1 );
    										break;
    									}
    								}
    							}
    							msg.textContent('Se ha eliminado correctamente').multiple(false);
    							$mdDialog.show(msg);
    						}else{
    							msg.textContent('Ha ocurrido un error al eliminar').multiple(false);
    							$mdDialog.show(msg);
    						}
    				}, function errorCallback(response) {
        				msg.textContent('Ha ocurrido un error al eliminar');
                        $mdDialog.show(msg);
                    });
    			} else {
					msg.textContent('Se ha eliminado correctamente').multiple(false);
					$mdDialog.show(msg);
    			}
    		}else{
    			msg.textContent('Seleccione al menos una opción para borrar');
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
	                md.form = {};
	                md.tipo = 'conversor';
	                md.campos = vm.campos;
	                md.compania = vm.compania;
	                md.parent = vm.parent;
	                
	                md.add = function () {
                		if(md.form == undefined || md.autocomplete.CAMPO == undefined || md.autocomplete.ASEG == undefined){
                			msg.textContent('Elija los datos para crear el conversor').multiple(true);
            				$mdDialog.show(msg);
                		}else{
                			vm.gridOptions.data.unshift({"DS_CAMPO":md.autocomplete.CAMPO.DS_CAMPO,"ID_CAMPO":md.autocomplete.CAMPO.ID_CAMPO,"NO_COMPANIA":md.autocomplete.ASEG.NO_COMPANIA,"ID_COMPANIA":md.autocomplete.ASEG.ID_COMPANIA,"CO_DATO_COMPANIA": md.form.CO_DATO_COMPANIA,"CO_DATO_INTERNO": md.form.CO_DATO_INTERNO != null ? md.form.CO_DATO_INTERNO : 0,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
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

		setDdOptions = function(lst, col, atrId, atrTxt) {
			if(lst && col) {
				let options = [];
				for(let i = 0; i < lst.length; i++) {
					options.push({
						id: lst[i][atrTxt],
						[atrId]: lst[i][atrId],
						[atrTxt]: lst[i][atrTxt]
					})
				}
				col.editDropdownOptionsArray = options;
			}
		}
    	
    }

    
    ng.module('App').component('busquedaConversor', Object.create(busquedaComponent));
    
})(window.angular);