(function(ng) {	

	//Crear componente de app
    var reaseguradoraComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$window', '$location', 'TiposService','BASE_SRC', '$mdDialog', '$translate', 'AseguradoraService', 'ComisionService','$scope', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		}
    }
    
    reaseguradoraComponent.controller = function reaseguradoraComponentControler($scope, $window, $location,TiposService, BASE_SRC, $mdDialog, $translate, AseguradoraService, ComisionService, constantsTipos){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
    	vm.listFiles = [];
		vm.tipos = {};
        vm.listaSeleccionados = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    
    	this.$onInit = function(bindings) {
    		vm.showTable = 0;
    		vm.datos = vm.parent.datos;
    		vm.listFiles = vm.datos.LISTA_ARCHIVOS;
			vm.load = true;
			vm.tipos = {};
			
			vm.medidaEdicion = 294; //223
    		
            if (vm.datos != null && vm.datos.ID_COMPANIA != null) {
            	vm.getComisiones();
            }
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_UNIDADES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.unidades = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.pre.logout();
                }
			});
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_COMISIONES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.comisiones = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.pre.logout();
                }
			});
    		
    		if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$path.substring(1, $location.$$path.length));
    		}
    		
    	}
    	
    	vm.getComisiones = function () {
    		ComisionService.getComisionistasProducto({"ID_COMPANIA": vm.datos.ID_COMPANIA})
        	.then(function successCallBack(response){
        		if(response.status == 200) {
        			if(response.data != undefined && response.data.COMISIONISTASPROD != undefined && response.data.COMISIONISTASPROD.COMISIONISTAPROD != undefined){
        				vm.listComisiones = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
        			}else{
        				vm.listComisiones = [];
        			}
        			vm.gridOptions.data = vm.listComisiones;
					// $scope.$apply();
				}
        	}, function errorCallBack(response){
        		
        	});
    	}
    	
    	vm.getDsComision = function (codigo) {
    		var text = "";
    		if (vm.tipos.comisiones != null) {
    			var comision = vm.tipos.comisiones.find(x => x.CO_TIPO == codigo);
    			
    			if (comision != null) {
    				text = comision.DS_TIPOS;
    			}
    		}
    		return text;
    	}
    	
    	vm.getDsUnidad = function (codigo) {
    		var text = "";
    		if (vm.tipos.unidades != null) {
    			var unidad = vm.tipos.unidades.find(x => x.CO_TIPO == codigo);
    			
    			if (unidad != null) {
    				text = unidad.DS_TIPOS;
    			}
    		}
    		return text;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    columnDefs: [
    		      {field: 'COLECTIVO', 
    		    	  displayName: 'Partner', 
    		    	  cellTooltip: function(row){return row.entity.COLECTIVO}
    		      },
    		      {field: 'CANAL', displayName: 'Canal', cellTooltip: function(row){return row.entity.CANAL}},
    		      {field: 'NO_PRODUCTO', displayName: 'Producto', cellTooltip: function(row){return row.entity.NO_PRODUCTO}},
    		      {field: 'CO_AGENTE', displayName: 'Agente', cellTooltip: function(row){return row.entity.CO_AGENTE}, enableCellEdit: true,  editDropdownValueLabel: 'CO_AGENTE', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_AGENTE]">{{row.entity.CO_AGENTE}}</div>'},
    		      {field: 'CO_TIPO_UNIDAD', displayName: 'Unidad', cellTooltip: function(row){return vm.getDsUnidad(row.entity.CO_TIPO_UNIDAD)}, editDropdownValueLabel: 'CO_TIPO_UNIDAD', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_TIPO_UNIDAD]">{{grid.appScope.$ctrl.getDsUnidad(row.entity.CO_TIPO_UNIDAD)}}</div>'},
    		      {field: 'CO_TIPO_COMISION', displayName: 'Tipo de comisión', cellTooltip: function(row){return vm.getDsComision(row.entity.CO_TIPO_COMISION)}, editDropdownValueLabel: 'CO_TIPO_COMISION', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_TIPO_COMISION]">{{grid.appScope.$ctrl.getDsComision(row.entity.CO_TIPO_COMISION)}}</div>'},
    		      {field: 'NU_PORCENTAJE', displayName: 'Comisión', cellTooltip: function(row){return row.entity.NU_PORCENTAJE}, enableCellEdit: true,  editDropdownValueLabel: 'NU_PORCENTAJE', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NU_PORCENTAJE]">{{row.entity.NU_PORCENTAJE}}</div>'},
    		      {field: 'NO_USU_MOD', displayName: 'Modificado por', cellTooltip: function(row){return row.entity.NO_USU_MOD}},
    		      {field: 'FT_USU_MOD', displayName: 'Modificado en', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_MOD}}   		   
    		      ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      vm.listaSeleccionados = [];
                
      		      gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
      		    	  	vm.elementoSeleccionado = fila.entity;
	    	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
    	          });
	      	      gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
	      	    	  vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
	      	      });
      		    }
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.reaseguradora.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.saveReaseguradora = function(){
			var json = vm.datos;
			
			json.IN_COMISIONISTA = true;
			json.IN_REASEGURADORA = false;
			json.LISTA_COMISIONES = vm.gridOptions.data;
			
			vm.appParent.abrirModalcargar(true);
            AseguradoraService.saveAseguradora(json)
        	.then(function successCallBack(response){
        		vm.datos.NU_CIF = response.data.NU_CIF;
        		if(response.status == 200) {
        			if(vm.datos.ID_COMPANIA == undefined){
                        msg.textContent('Se ha creado correctamente');
                        $mdDialog.show(msg).then(function() {
                            if (vm.datos.NU_CIF != null) {
                                $window.location.href = window.location.origin + window.location.pathname + '#!/reaseguradoras_list/?documentoReaseguradora=' + vm.datos.NU_CIF;
                            }
                        });
        			}else{
						vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
        			}
        			vm.getComisiones();
				}
        	}, function errorCallBack(response){
        		vm.status == response.status;
        		if(vm.datos.ID_COMPANIA == undefined){
					vm.appParent.cambiarDatosModal('Error al crear la reaseguradora');
    			}else{
					vm.appParent.cambiarDatosModal('Error al editar la reaseguradora');
    			}
        	});
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
				vm.validar(vm.formReaseguradora.$invalid);
			}else{
				vm.indice = vm.indice + 1;
				vm.checkGrid(vm.gridApi);
			}
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }
    	
    	vm.anadirReaseguradora = function(){
    		$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/colaborador.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;
    		    	md.tipos = vm.tipos;
    				
    		    	this.$onInit = function(){
    		    		md.messageError = '';
    		    		TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
    					.then(function successCallback(response){
    						if(response.status == 200){
    							md.canales = response.data.TIPOS.TIPO;
    						}
    					}, function callBack(response){
    						if(response.status == 406 || response.status == 401){
    		                	vm.parent.logout();
    		                }
    					});
    		    		
    		    		TiposService.getRamos({"IN_TARIFICABLE": true})
    					.then(function successCallback(response){
    						if(response.status == 200){
    							md.ramos = response.data.TIPOS.TIPO;
    						}
    					}, function callBack(response){
    						if(response.status == 406 || response.status == 401){
    		                	vm.parent.logout();
    		                }
    					});
    		    		
    		    		TiposService.getCompania()
    					.then(function successCallback(response){
    						if(response.status == 200){
    							md.aseguradoras = response.data.TIPOS.TIPO;
    						}
    					});
    		    		
    		    		TiposService.getCompRamoProd({})
                        .then(function successCallback(response) {
                            md.productos = response.data.CIARAMOS.CIA_RAMO;
                            console.log(response);
                        }, function errorCallBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.parent.logout();
                            }
                        });
    		    		
    		    		md.colectivos = vm.parent.colectivos;
    		    	}
    		    	
    		    	
    		    	md.cambiarRamo = function () {
    		    		TiposService.getRamoCompania({
                            "ID_RAMO": md.form.ID_RAMO
                        })
                        .then(function successCallback(response) {
                            md.aseguradoras = response.data.CIARAMOS.CIA_RAMO;
                        }, function errorCallBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.parent.logout();
                            }
                        });
    		    	}
    		    	
    		    	
    		    	md.cambiarAseguradora = function () {
    		    		md.form.ID_COMP_RAMO_PROD = null;
                        TiposService.getCompRamoProd({
                            "ID_COMPANIA": md.form.ID_COMPANIA,
                            "ID_RAMO": md.form.ID_RAMO
                        })
                        .then(function successCallback(response) {
                            md.productos = response.data.CIARAMOS.CIA_RAMO;
                            console.log(response);
                        }, function errorCallBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.parent.logout();
                            }
                        });
                    }
    		    	
    		    	md.addComision = function(){
    		    		if (md.formColaboradorModal.$invalid) {
    		            	objFocus=angular.element('.ng-empty.ng-invalid-required:visible');           	
    		            	md.messageError = 'Se deben rellenar correctamente los datos de este paso antes de continuar';
    		            } else {
    		            	md.messageError = '';
    		            	vm.gridOptions.data.push({
        		    			"COLECTIVO": md.colectivos.find( x => x.ID_TIPO_POLIZA == md.form.ID_TIPO_COLECTIVO).DS_TIPO_POLIZA,
        		    			"ID_TIPOCOLECTIVO": md.form.ID_TIPO_COLECTIVO, 
        		    			"CANAL": "Área privada",
        		    			"ID_TIPO": 17,
        		    			"NO_PRODUCTO": md.productos.find( x => x.ID_COMP_RAMO_PROD == md.form.ID_COMP_RAMO_PROD).NO_PRODUCTO,
        		    			"ID_COMP_RAMO_PROD": md.form.ID_COMP_RAMO_PROD,
        		    			"NU_PORCENTAJE": md.form.NU_PORCENTAJE,
        		    			"CO_TIPO_UNIDAD": md.form.CO_TIPO_UNIDAD,
        		    			"CO_TIPO_COMISION": md.form.CO_TIPO_COMISION,
        		    			"ID_COMPANIA": vm.datos.ID_COMPANIA
        		    			}
        		    		);
        		    		md.hide();
    		            }
    		    	}
    		    	
    				md.hide = function() {
		    	      $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
		    	      $mdDialog.cancel();
		    	    };

		    	    md.answer = function(answer) {
		    	      $mdDialog.hide(answer);
		    	    };
              
                }]
    		})
    	}
    	
    	//Cambiar tabs
    	vm.changeTabs = function(index){
    		vm.showTable = index;
		}
		
		vm.checkGrid = function(api) {
			setTimeout(function() {
				if(api != undefined) {
					api.core.handleWindowResize();
				}
			}, 100);
		}
		
		vm.deleteComision = function () {
			var confirm = $mdDialog.confirm()
	        .textContent("¿Estás seguro de borrar las comisiones seleccionadas?")
	        .ariaLabel('Lucky day')
	        .ok('Aceptar')
	        .cancel('Cancelar');
	      	$mdDialog.show(confirm).then(function() {
	          	for (var i = 0; i < vm.listaSeleccionados.length; i++) {
	          		if (vm.listaSeleccionados[i].ID_COMISIONISTA_PRODUCTO != null) {
		          		var index = vm.gridOptions.data.findIndex(x => x.ID_COMISIONISTA_PRODUCTO == vm.listaSeleccionados[i].ID_COMISIONISTA_PRODUCTO);
		          		if (index >= 0) {
		          			vm.gridOptions.data[index].IN_BAJA_REG = 1;
//		          			vm.gridOptions.data.splice(index, 1);
		          		}
	          		} else {
		          		var index = vm.gridOptions.data.findIndex(x => x == vm.listaSeleccionados[i] );
		          		if (index >= 0) {
//		          			vm.gridOptions.data[index].IN_BAJA_REG = 1;
		          			vm.gridOptions.data.splice(index, 1);
		          		}
	          		}
	          	}

				//Si no es nuevo, hacer petición para borrar
				if (vm.datos != null && vm.datos.ID_COMPANIA != null) {
		          	vm.saveReaseguradora();
				}
	  	    }, function() {
	  	    	$mdDialog.cancel();
	  	    });
		}
    }   
    
    ng.module('App').component('reaseguradoraSd', Object.create(reaseguradoraComponent));
    
})(window.angular);