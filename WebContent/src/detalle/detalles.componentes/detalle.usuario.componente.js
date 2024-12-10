(function(ng) {	

	//Crear componente de app
    var userwsComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
            $inject:['$location', '$scope', '$mdDialog', 'BusquedaService', 'TiposService', 'ColectivoService', 'UsuarioWSService', 'AseguradoraService', 'BASE_SRC', 'UsuarioService', , '$templateCache', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busqUsuario:'^busquedaUsuarios',
    		}
    }
    
    userwsComponent.controller = function userwsComponentControler($location, $scope, $mdDialog, BusquedaService, TiposService, ColectivoService, UsuarioWSService, AseguradoraService, BASE_SRC, UsuarioService, $templateCache, constantsTipos){
    	var vm=this;
    	var url=window.location;
		vm.permisos = [];
		vm.tipos = {};
		vm.colectivos = {};        
		vm.listaSeleccionados = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.permisos_lst = [];
		vm.last = 3;
		vm.ID_OLD_ROL;
        vm.colModificado = {};
        vm.compChanged = false;
        vm.permisosBorrados = [];
        vm.colectivosBorrados = [];
        vm.autocomplete = {};
		vm.emailOld;
    	
    	this.$onInit = function(bindings) {
			
			vm.showTable = 0;
			vm.datos = vm.parent.datos;
			vm.load = true;
			vm.switchAll = false;
			
			if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			console.log(vm.permisos);
    		}
			
			vm.medidaEdicion = 294; //223
    		
			if(vm.datos != null && vm.datos.ID_USUARIO != null){
	    		BusquedaService.buscar({"ID_USUARIO": vm.datos.ID_USUARIO}, "usuario")
	    		.then(function successCallback(response){
	    			if(response.status == 200){
	    				if(response.data.ID_RESULT == 0){
							vm.datos = response.data.USUARIOS[0];
							
							if(vm.datos !=null){
								vm.last = 0;
								if(vm.datos.ID_ROL == 7)
									vm.last = 0;
								else if(vm.datos.ID_ROL == 10 || (vm.datos.ID_ROL == null && vm.datos.ID_ROL == undefined))
									vm.last = 3;
								else
									vm.last = 2;
								
								if(vm.datos.permisosDetalle != null && vm.datos.permisosDetalle != undefined){
									vm.gridOptions.data = vm.datos.permisosDetalle;
								}

								if (vm.datos.ID_COMPANIA != null && vm.companiaUsuario != null && vm.companiaUsuario.length > 0) {
									vm.autocomplete.MEDIADOR = vm.companiaUsuario.find(x => x.ID_COMPANIA == vm.datos.ID_COMPANIA);
								}
								
								if (vm.datos.ID_TIPOCOLECTIVO != null && vm.colectivos != null && vm.colectivos.length > 0) {
									vm.autocomplete.PARTNER = vm.colectivos.find(x => x.ID_TIPO_POLIZA == vm.datos.ID_TIPOCOLECTIVO);
								}

								if(vm.datos.NO_EMAIL != null){
									vm.emailOld = vm.datos.NO_EMAIL;
								}
							}
	    				}else{
                            msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
	    				}
	    			}
				})
			}

			AseguradoraService.getAseguradorasByFilter({IS_SELECTED: true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.companiaUsuario = response.data.ASEGURADORAS;
					if (vm.datos.ID_COMPANIA != null && vm.companiaUsuario != null && vm.companiaUsuario.length > 0) {
						vm.autocomplete.MEDIADOR = vm.companiaUsuario.find(x => x.ID_COMPANIA == vm.datos.ID_COMPANIA);
					}
				}
			}, function successCallback(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    		
			UsuarioService.getRoles()
			.then(function successCallback(response){
				vm.roles = response.data.ROLES;
			});

			TiposService.getTipos({ "ID_CODIGO": constantsTipos.CANALES })
			.then(function successCallback(response) {
				if (response.status == 200) {
					vm.canales = response.data.TIPOS.TIPO;
				}
			}, function callBack(response) {
				if (response.status == 406 || response.status == 401) {
					vm.parent.logout();
				}
			});	

			ColectivoService.getListColectivos({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
					vm.colectivos.sort(function (a, b) {
                        if (a.DS_TIPO_POLIZA > b.DS_TIPO_POLIZA) {
                          return 1;
                        }
                        if (a.DS_TIPO_POLIZA < b.DS_TIPO_POLIZA) {
                          return -1;
                        }
                        // a must be equal to b
                        return 0;
                    });
					
					vm.colectivosFiltrados = JSON.parse(JSON.stringify(vm.colectivos));

					if (vm.datos.ID_TIPOCOLECTIVO != null && vm.colectivos != null && vm.colectivos.length > 0) {
						vm.autocomplete.PARTNER = vm.colectivos.find(x => x.ID_TIPO_POLIZA == vm.datos.ID_TIPOCOLECTIVO);
					}
					
					if(vm.parent.datos != null && vm.parent.datos.NO_USUARIO != null){
						ColectivoService.getColectivosFiltroUsuario({"NO_USUARIO":vm.parent.datos.NO_USUARIO})
			    		.then(function successCallback(response){
			    			if(response.status == 200){
			    				if(response.data.NUMERO_COLECTIVOS > 0){
			    					vm.permisos_lst = response.data.COLECTIVOS.COLECTIVO;
				    				for(i=0; i< vm.colectivos.length; i++){
				        				for(j=0; j<response.data.COLECTIVOS.COLECTIVO.length; j++){
				        					if(response.data.COLECTIVOS.COLECTIVO[j].ID_TIPO_POLIZA == vm.colectivos[i].ID_TIPO_POLIZA)
				            					vm.colectivos[i].isActivo = true;
				        				}
				        			}
				    				
				    				//Comprobar si todos los colectivos están activos para poner el switch padre activo
				    				var index = vm.colectivos.findIndex( x => x.isActivo != true);
				    				if (index >= 0) {
				    					vm.switchAll = false;
				    				} else {
				    					vm.switchAll = true;
				    				}
			    				}
			    			}
			    			
			    		})
					}
				}
				}, function callBack(response) {
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
					}
				});
	
		}
    	
    	this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }
		
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    			paginationPageSize: 30,
                enableRowSelection: true,
                enableSelectAll: true,
                data:[],
            	paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    			columnDefs: [
                    {field: 'NO_COMERCIAL', 
    				  displayName: 'Aseguradora', 
                      cellTooltip: function(row){return row.entity.NO_COMERCIAL},
                      editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'NO_COMERCIAL', editDropdownRowEntityOptionsArrayPath: 'companias',
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_COMERCIAL]" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.NO_COMERCIAL]">{{row.entity.NO_COMERCIAL}}</div>'},
                  {field: 'NO_RAMO', 
                      displayName: 'Ramo', 
                      editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'NO_RAMO', editDropdownRowEntityOptionsArrayPath: 'ramos',
                      cellTooltip: function(row){return row.entity.NO_RAMO},
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_RAMO]" ng-click="grid.appScope.$ctrl.changeCompania(row.entity.ID_COMPANIA, false)" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.NO_RAMO]">{{row.entity.NO_RAMO}}</div>'},
                  {field: 'NO_MODALIDAD', displayName: 'Modalidad', cellTooltip: function(row){return row.entity.NO_MODALIDAD},
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_MODALIDAD]"  ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.FT_USU_ALTA]">{{row.entity.NO_MODALIDAD}}</div>'},
                  {field: 'IN_EMITIBLE', displayName: 'Contratable', type: 'boolean', cellTooltip: function(row){ if(row.entity.IN_EMITIBLE){return 'Sí'} else return 'No'}, 
                      cellTemplate: '<div ng-if="row.entity.IN_EMITIBLE == true" class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IN_EMITIBLE]" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.IN_EMITIBLE]">Sí</div><div ng-if="row.entity.IN_EMITIBLE == false" class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IN_EMITIBLE]" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.IN_EMITIBLE]">No</div>'},
                  {field: 'NO_USU_ALTA', displayName: 'Creado por', cellTooltip: function(row){return row.entity.NO_USU_ALTA}, enableCellEdit:false,
                        cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.NO_USU_ALTA]">{{row.entity.NO_USU_ALTA}}</div>'}, 
                  {field: 'FT_USU_ALTA', displayName: 'Creado en', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_ALTA}, enableCellEdit:false,
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.FT_USU_ALTA]">{{row.entity.FT_USU_ALTA}}</div>'}, 
                  {field: 'NO_USU_MOD', displayName: 'Modificado por', cellTooltip: function(row){return row.entity.NO_USU_MOD}, enableCellEdit:false,
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.NO_USU_MOD]">{{row.entity.NO_USU_MOD}}</div>'},
                  {field: 'FT_USU_MOD', displayName: 'Modificado en', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_MOD}, enableCellEdit:false,
                      cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.deletePermiso[row.entity.FT_USU_MOD]">{{row.entity.FT_USU_MOD}}</div>'},
              ],
              
              onRegisterApi: function (gridApi) {
                  vm.gridApi = gridApi;
                  
                  vm.listaSeleccionados = [];
                  
                  gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
                      vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
                  });
                  gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
                      vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
                  });
                  vm.gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                    if(rowEntity.ID_COMPANIA == null || rowEntity.ID_COMPANIA == undefined){
                        rowEntity.ID_RAMO = null;
                          rowEntity.NO_RAMO = null;
                     }
                    if(newValue != null && newValue != null 
                            && newValue != oldValue){
                        vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
                        if(!rowEntity.IS_NEW)
                            rowEntity.IS_UPDATED = true;
                        
                        if(colDef.name == 'NO_COMERCIAL'){
                          rowEntity.ID_COMPANIA = _.find(vm.companiaTarificador, {'NO_COMPANIA':rowEntity.NO_COMPANIA}).ID_COMPANIA;
                          vm.compChanged = true;
                          vm.changeCompania(rowEntity.ID_COMPANIA, false);    
                        }
                        
                        if(colDef.name == 'NO_RAMO')
                            rowEntity.ID_RAMO = _.find(rowEntity.ramos, {'NO_RAMO':rowEntity.NO_RAMO}).ID_RAMO;
                    }
                  });
              }    
        }

    	this.loadTemplate = function() {
            if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.usuario.html";
            } else {
                return 'src/error/404.html';
            }
		}
		
        vm.borrarPermiso = function(){
            vm.permisosBorrados = vm.listaSeleccionados;
            
            if(vm.listaSeleccionados != undefined && vm.listaSeleccionados != null && vm.listaSeleccionados.length > 0){
                $mdDialog.show({
                    templateUrl: BASE_SRC + 'detalle/detalle.modals/permisos.modal.html',
                    controllerAs: '$ctrl',
                    clickOutsideToClose: true,
                    parent: angular.element(document.body),
                    fullscreen: false,
                    controller: ['$mdDialog', function ($mdDialog) {
                        var md = this

                        md.eliminarPermisoModal = function(bool){
                            if (bool == true) {
                                if(vm.listaSeleccionados != null && vm.listaSeleccionados.length > 0){
                                    for(var i = 0; i < vm.listaSeleccionados.length; i++){

                                        var index = vm.gridOptions.data.indexOf(vm.listaSeleccionados[i]);
                                        
                                        if(index >= 0){
                                            vm.gridOptions.data.splice(index, 1);
                                        }
                                    }
                                    
                                    vm.listaSeleccionados = [];
                                    md.cancel();
                                    
                                }else{
                                    msg.textContent('Elija al menos un permiso para eliminar');
                                    $mdDialog.show(msg);
                                }
                            } else {
                                md.cancel();    
                            }
                        }
                        
                        md.cancel = function () {
                            $mdDialog.cancel();
                        };

                    }]
                });
            }else{
                msg.textContent('Elija al menos un permiso para eliminar');
                $mdDialog.show(msg);
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
                vm.checkGrid(vm.gridApi);
            }
        }
    	
    	vm.siguiente = function (ind) {
			if(ind == 1){
				vm.validar(vm.formUsuarioWs.$invalid);
			}else{
				vm.indice = vm.indice + 1;
			}
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }
    	
    	//Guardar usuarios
	    vm.guardarUsuarioWs = function(){
	
			vm.appParent.abrirModalcargar(true);
	         	
			if(vm.permisos_lst != null && vm.permisos_lst.length > 0){
	          	vm.datos.COLECTIVOS = {};
	      		vm.datos.COLECTIVOS = vm.permisos_lst;
			}	
			
	        if(vm.permisos_lst.length == 0 && vm.colectivosBorrados.length > 0){
	            vm.datos.COLECTIVOS = [];                  
	        }
			
	      	if(vm.gridOptions.data != null && vm.gridOptions.data.length > 0){  				
				vm.datos.permisosDetalle = vm.gridOptions.data;
	      	}	
	      	
	      	if(vm.ID_OLD_ROL != null && vm.ID_OLD_ROL != undefined && vm.ID_OLD_ROL != vm.datos.ID_ROL){
	      		vm.datos.ID_ROL = vm.ID_OLD_ROL;
	      		vm.datos.DS_ROL_NEW = vm.roles.find( data => data.ID_ROL == vm.datos.ID_ROL_NEW).DS_ROL;
	      	}
	      	
	      	if(vm.datos != null && vm.datos.ID_ROL != null && vm.datos.ID_ROL != undefined){
	      		vm.datos.DS_ROL = vm.roles.find( data => data.ID_ROL == vm.datos.ID_ROL).DS_ROL;
	      	}
	      	
	        if(vm.permisosBorrados != null && vm.permisosBorrados.length != 0){
	            for(var i = 0; i < vm.permisosBorrados.length; i++){
	              vm.permisosBorrados[i].IN_BAJA_REG = 1;
	              vm.datos.permisosDetalle.push(vm.permisosBorrados[i]);
	          }
	        }
	      	
	      	if(vm.datos != null && vm.datos != undefined){
				UsuarioWSService.saveUser(vm.datos)
				.then(function successCallback(response){
					if(response.status == 200) {
						if(response.data.ID_RESULT !=0){
							vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
						}else{
							vm.appParent.cambiarDatosModal('El usuario se ha guardado correctamente');
							vm.busqUsuario.cerrarTab();
							vm.busqueda.recargarListado("usuario");				
						}
					}
				}, function errorCallback(response){
					vm.appParent.cambiarDatosModal('Ha ocurrido un error al guardar usuario');
				});		
				
	      	}else{
	      		vm.appParent.cambiarDatosModal('Faltan datos por rellenar.');
	      	}
	    }
    	
        vm.changeCompania = function(idCompania, select){
        	vm.tipos.ramos = null;
			r = vm.gridOptions.data.find( data => data.ID_COMPANIA == idCompania);
        		 
            if((idCompania != null && idCompania != undefined) && vm.compChanged == true
                    || (vm.compChanged == false && (vm.gridOptions.data.length == 0 || (r != undefined && r.ramos == undefined) || select))){
            	
                if(vm.compChanged){
                    if(vm.gridOptions.data != undefined){
                        for(var a=0; a<vm.gridOptions.data.length; a++){
                            if(vm.gridOptions.data[a].ID_COMPANIA == idCompania){
                                vm.gridOptions.data[a].ramos = [];
                                vm.gridOptions.data[a].NO_RAMO = undefined;
                                vm.gridOptions.data[a].ID_RAMO = undefined;
                            }
                        }
                    }
                }
            	
            	TiposService.getRamoCompania({"ID_COMPANIA": idCompania})
                .then(function successCallback(response){
                    if(response.status == 200){
                    	if(response.data.ID_RESULT == 0){       
                    		if(!select){
                    			if(response.data.CIARAMOS.CIA_RAMO[0].ID_COMPANIA == r.ID_COMPANIA){
	                    			r.ramos = response.data.CIARAMOS.CIA_RAMO;	                    			
                    			}
                    		}
                    			vm.tipos.ramos = response.data.CIARAMOS.CIA_RAMO;
                    			
                            if(vm.gridOptions.data != null && vm.gridOptions.data != undefined){
                                if(vm.tipos.ramos != undefined){
                                    for(var j=0; j < vm.tipos.ramos.length; j++){
                                        vm.tipos.ramos[j].id = vm.tipos.ramos[j].NO_RAMO;
                                    }                                                   
                                }
                           } 
                    	}
                    }
                }, function callBack(response){
                    if(response.status == 406 || response.status == 401){
                        vm.parent.logout();
                    }
                });            
            }
        }
        
        vm.changeRamo = function(){
            if(vm.form.ID_RAMO != undefined){
                for(var i = 0; i < vm.tipos.ramos.length; i++){
                    if(vm.form.ID_RAMO == vm.tipos.ramos[i].ID_RAMO){
                        vm.form.NO_RAMO = vm.tipos.ramos[i].NO_RAMO;
                        break;
                    }
                }
            }
        }
        
        vm.addPermiso = function(){
            if(vm.form.ID_RAMO != null && vm.form.ID_COMPANIA != null && vm.form.IN_EMITIBLE != null){
                
                var date = new Date();
                var day = date.getDate();
                if(day < 10){
                    day = "0" + day;
                }
                
                var month = date.getMonth() + 1;
                if(month < 10){
                    month = "0" + month;
                }
                
                var year = date.getFullYear();
                
                vm.form.NO_USU_ALTA = vm.parent.parent.perfil;
                vm.form.FT_USU_ALTA = year + "-" + month + "-" + day;
                
                vm.form.NO_COMERCIAL = _.find(vm.companiaTarificador, {'ID_COMPANIA':vm.form.ID_COMPANIA}).NO_COMERCIAL;
                vm.gridOptions.data.unshift(vm.form);
                vm.form = {};
            }
        }
        
        vm.checkGrid = function(api) {      
	        AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: false})
			.then(function successCallback(response){
				if(response.status == 200){
                    vm.companiaTarificador = response.data.ASEGURADORAS;
                    vm.putGrid();
				}
			}, function successCallback(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
	    }   
        
        vm.putGrid = function(){
            if(vm.companiaTarificador != undefined){
                for(var j=0; j < vm.companiaTarificador.length; j++){
                	vm.companiaTarificador[j].id = vm.companiaTarificador[j].NO_COMPANIA;
                }
                if(vm.gridOptions.data != undefined){
                	
                    for(var i=0; i<vm.gridOptions.data.length; i++){
                        vm.gridOptions.data[i].companias = vm.companiaTarificador;
                    }
                }
            }                       
       } 

      //Activar o desactivar un colectivo
    	vm.addColectivo = function(col){
    		
            var index = vm.permisos_lst.findIndex(a => a.DS_TIPO_POLIZA === col.DS_TIPO_POLIZA);
            
    		if(col.isActivo){
    			vm.permisos_lst.push(col);
            }else{
                vm.permisos_lst.splice(index, 1);
                vm.colectivosBorrados.push(col);       
            }

            if (vm.switchAll == true) {
            	vm.switchAll = false;
            }
			
			//Comprobar si todos los colectivos están activos para poner el switch padre activo
			var index = vm.colectivos.findIndex( x => x.isActivo != true);
			if (index >= 0) {
				vm.switchAll = false;
			} else {
				vm.switchAll = true;
			}
    	}
    	
    	vm.changeGrupo = function (rol) {
			if(rol.ID_ROL == 7)
				vm.last = 0;
			else if(rol.ID_ROL == 10 || (rol.ID_ROL == null && rol.ID_ROL == undefined))
				vm.last = 3;
			else
				vm.last = 2;
			
			if(vm.datos != null && vm.datos.ID_ROL != null && vm.datos.ID_ROL != rol.ID_ROL){
				vm.ID_OLD_ROL = vm.datos.ID_ROL;
	        	vm.datos.ID_ROL_NEW = rol.ID_ROL;
	        }
    	}
    	
    	vm.selectSwitchAll = function () {
    		vm.permisos_lst = [];
			vm.colectivosBorrados = [];
			for (var i = 0; i < vm.colectivos.length; i++) {
				var colectivo = vm.colectivos[i];
				if (vm.switchAll == true) {
					vm.permisos_lst.push(colectivo);
					colectivo.isActivo = true;
				} else {
					if (colectivo.isActivo == true) {
						vm.colectivosBorrados.push(colectivo);
					}
					colectivo.isActivo = false;
				}
			}
    	}
    	
    	vm.mostrarColectivo = function (colectivo) {
    		var mostrar = true;
    		if (vm.filtroColectivo != null && vm.filtroColectivo != "" && colectivo != null) {
    			if (vm.formateoTextoFiltro(colectivo).includes(vm.formateoTextoFiltro(vm.filtroColectivo))) {
    				mostrar = true;
    			} else {
    				mostrar = false;
    			}
    		}
    		return mostrar;
    	}
    	
    	vm.mostrarColectivoPadre = function (colectivos) {
    		var mostrar = true;
    		if (vm.filtroColectivo != null && vm.filtroColectivo != "" && colectivos != null && colectivos.length > 0) {
    			var index = colectivos.findIndex(x => x.DS_TIPO_POLIZA != null && vm.formateoTextoFiltro(x.DS_TIPO_POLIZA).includes(vm.formateoTextoFiltro(vm.filtroColectivo)));
	    		if (index > -1) {
					mostrar = true;
				} else {
					mostrar = false;
				}
			}
    		return mostrar;
    	}
    	
		vm.reactivarUser = function (){

			var confirm = $mdDialog.confirm()
			  .title('Reactivar usuario')
			  .textContent('¿Está seguro de reactivar el usuario ' + vm.datos.NO_USUARIO + "?")
			  .multiple(true)
			  .ariaLabel('Lucky day')
			  .ok('Aceptar')
			  .cancel('Cancelar');
			$mdDialog.show(confirm).then(function() {
				vm.appParent.abrirModalcargar(true);

				if(vm.datos.IN_CUENTA_ACTIVA == 1){
					UsuarioWSService.reactivaUsuario(vm.datos.NO_USUARIO)
					.then(function successCallback(response) {
						if (response.status == 200) {
							if (response.data != null && response.data.ID_RESULT == 0) {
								msg.textContent('El usuario '+vm.datos.NO_USUARIO+' ha sido reactivado correctamente');
								$mdDialog.show(msg);
								// vm.busqueda.recargarListado("usuario");
							}else{
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
								vm.datos.IN_CUENTA_ACTIVA = 0;
							}
						}
					}, function successCallback(response){
						if(response.status == 406 || response.status == 401){
							vm.parent.logout();
						}
					});
				}
			}, function() {
				$mdDialog.hide(confirm);
				vm.datos.IN_CUENTA_ACTIVA = 0;
			});
		}

		vm.desbloquearUser = function (){

			var confirm = $mdDialog.confirm()
			  .title('Desbloquear usuario')
			  .textContent('¿Está seguro de desbloquear el usuario ' + vm.datos.NO_USUARIO + "?")
			  .multiple(true)
			  .ariaLabel('Lucky day')
			  .ok('Aceptar')
			  .cancel('Cancelar');
			$mdDialog.show(confirm).then(function() {
				vm.appParent.abrirModalcargar(true);

				if(vm.datos.IN_BLOQUEADO_TEMPORALMENTE == 0){
					UsuarioWSService.desbloquearUsuario(vm.datos.NO_USUARIO)
					.then(function successCallback(response) {
						if (response.status == 200) {
							if (response.data != null && response.data.ID_RESULT == 0) {
								msg.textContent('El usuario '+vm.datos.NO_USUARIO+' ha sido desbloqueado correctamente');
								$mdDialog.show(msg);
								// vm.busqueda.recargarListado("usuario");
							}else{
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
								vm.datos.IN_BLOQUEADO_TEMPORALMENTE = 1;
							}
						}
					}, function successCallback(response){
						if(response.status == 406 || response.status == 401){
							vm.parent.logout();
						}
					});
				} else {
					vm.appParent.abrirModalcargar(true);
				}
			}, function() {
				$mdDialog.hide(confirm);
				vm.datos.IN_BLOQUEADO_TEMPORALMENTE = 1;
			});
		}
		
		vm.chEmail = function(){
			
			(vm.datos.NO_EMAIL != vm.emailOld) ? vm.datos.IS_CONDICIONADO = true : false;
		}

    	vm.formateoTextoFiltro = function (texto) {
    		if (texto != null && typeof texto == "string") {
    			return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    		} else return texto;
    	}
	}    
    
    ng.module('App').component('userwsSd', Object.create(userwsComponent));
    
})(window.angular);