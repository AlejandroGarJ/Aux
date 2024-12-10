(function(ng) {	


	//Crear componente de app
    var documentacionComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['BASE_SRC', '$location', 'FicherosService', '$mdDialog', '$scope', 'TiposService', 'AseguradoraService', 'BrokerService', 'ExportService', '$translate'],
    		require: {
            	parent:'^sdApp'
            }
    }
    
    
    
    documentacionComponente.controller = function documentacionComponentetControler(BASE_SRC, $location, FicherosService, $mdDialog, $scope, TiposService, AseguradoraService, BrokerService, ExportService, $translate){
    	var vm=this;
    	vm.listFiles = [];
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.listProductos = [];
    	vm.productos = [];
    	vm.compania = [];
		vm.rol = window.sessionStorage.rol;
    	
    	this.$onInit = function(){
    		
    		if(vm.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.getPermissions('documentacion');
    		}
    		
			vm.url = $location.url();
			var tipo = '';		
			var idCompania = null;
			var perfil = sessionStorage.getItem('perfil');
			var idProgramaUrl = vm.parent.getUrlParam('idPrograma', $location.url());

			AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true, IS_SELECTED: true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.compania = response.data.ASEGURADORAS;
				}
			}, function successCallback(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
			  
            if (perfil != null) {
                perfil = JSON.parse(perfil);
                
                //Setear el idcomania si lo tiene
                if (perfil.adicional != null) {
                	idCompania = perfil.adicional.ID_COMPANIA;
                }
                
                if (perfil.productos != null && perfil.productos.length > 0) {
                    var programa = null;
                    
                    for (var i = 0; i < perfil.productos.length; i++) {
                        var programa = perfil.productos[i];
                        
                        //Añadimos el producto
                        vm.productos.push({
                            ID_PRODUCTO: programa.ID_PRODUCTO,
                            DS_PRODUCTO: programa.DS_PRODUCTO,
                            NO_PRODUCTO: programa.NO_PRODUCTO,
                            ID_PROGRAMA: programa.ID_PROGRAMA,
                            DS_PROGRAMA: programa.DS_PROGRAMA,
                            ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
                        });
                                                
                        //Comprobamos si el programa está ya en la lista. Si no está, se añade
                        var existePrograma = vm.listProductos.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
                        if (existePrograma == -1) {
                            vm.listProductos.push({
                                ID_PROGRAMA: programa.ID_PROGRAMA,
                                DS_PROGRAMA: programa.DS_PROGRAMA,
                                ID_PRODUCTO: programa.ID_PRODUCTO
                            })
                        }
                        
                    }

                    if (vm.listProductos.length == 1) {
						vm.ID_COMP_RAMO_PROD = vm.listProductos[0].ID_PRODUCTO;
                        // vm.ID_PROGRAMA = vm.listProductos[0].ID_PROGRAMA;
                    }
                }
            }
            
			//Comprobar si existe el idPrograma en la url
            if (idProgramaUrl != null && idProgramaUrl != "") {
				vm.ID_COMP_RAMO_PROD = vm.listProductos.find(x => x.ID_PROGRAMA == parseInt(idProgramaUrl)).ID_PRODUCTO;
				// vm.ID_PROGRAMA = vm.listProductos.find(x => x.ID_PROGRAMA == parseInt(idProgramaUrl)).ID_PROGRAMA;
            }
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listFicheros;
    	}
    	
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC+'documentacion/documentacion.view.html';
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.getDsArchivo = function (archivo) {
    		var ds = "";
    		if (archivo.NO_ARCHIVO != null && archivo.NO_ARCHIVO.includes('USO-INTERNO')) {
    			ds = "Documento de uso interno exclusivo";
    		} else if (archivo.NO_ARCHIVO != null && archivo.NO_ARCHIVO.includes('USO-EXTERNO')) {
    			ds = "Documento habilitado para compartir con tu cliente";
    		}
    		return ds;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableCellEdit: false,
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.buscarFicheros(grid.appScope.$ctrl.ID_COMP_RAMO_PROD)"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						field: 'NO_ARCHIVO',
						displayName: $translate.instant('FILE'),
						cellTooltip: function(row){return row.entity.NO_ARCHIVO}
					},
					{
						field: 'Descripcion',
						displayName: $translate.instant('DESCRIPTION'),
						cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDsArchivo(row.entity)}}</div>'
					},
					{
						field: ' ',
						displayName: $translate.instant('DOWNLOAD'),
						cellTemplate: '<div ng-if="row.entity.DESCARGAR != false" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarFichero($event,row.entity, row)">Descargar</a></div>'
					},
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
					gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
        	        });
    		    	
	  	      		vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  console.log(rowEntity);
	  	      				  vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      			  }
	  	    		});
      		    }
		}
		vm.seleccionable = function(fila) {
			return true;
		}

        vm.recargarListado = function(){
        	vm.gridOptions.data = vm.listFicheros;
        }
    	
    	
    	vm.descargarFichero = function(event, row){
			vm.parent.abrirModalcargar(true);
    		FicherosService.downloadFichero({"NO_RUTA_ORIGEN":row.NO_RUTA_ORIGEN,"NO_ARCHIVO":row.NO_ARCHIVO})
			.then(function successCallback(response){
				if(response.status == 200){
					saveAs(new Blob([response.data]), row.NO_ARCHIVO);
				}
				$mdDialog.cancel();
			});
    	};

		// vm.downloadFile = function (file) {
		// 	ExportService.downloadFile(file.ID_ARCHIVO)
        //     .then(function successCallback(response) {	
		// 		if(response.ID_RESULT != null && response.ID_RESULT != 0) {
		// 			vm.cargando = false;
		// 			msg.textContent(response.DS_RESULT);
		// 			$mdDialog.show(msg);
		// 		} else {
		// 			saveAs(new Blob([response.data]), file.NO_ARCHIVO);
		// 		}
        //     }, function callBack(response){
        //         msg.textContent("Se ha producido un error al descargar el archivo");
        //         $mdDialog.show(vm.msg);
        //         if(response.status == 406 || response.status == 401) {
        //             vm.parent.logout();
        //         }
        //     });
		// }
    	
    	vm.querySearch = function (query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
        }
    	
    	function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                if (key != "NO_COMPANIA")
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
            };
        }

    	vm.buscarFicheros = function(producto, mediador){
    		if(vm.formDocumentacion.$invalid == true) {
				objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Seleccione los datos necesarios');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
    		} else {
    			vm.gridOptions.data = [];
				vm.parent.abrirModalcargar(true);
    			FicherosService.getFicherosDocumentacion(producto, mediador)
    			.then(function successCallback(response){
    				if(response.status == 200){
    					if(response.data.FICHEROS.FICHERO.length > 0){
    						vm.listFicheros = response.data.FICHEROS.FICHERO;
    						vm.gridOptions.data = vm.listFicheros;
    						$mdDialog.cancel();
    					}else{
    						msg.textContent("No se han encontrado ficheros.");
    						$mdDialog.show(msg);		
    					}
    				}
    			}, function callBack(response){
    				msg.textContent("Se ha producido un error al cargar los ficheros.");
    				$mdDialog.show(msg);
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
			
    	}
    
		vm.buscarDocumentacion = function(mediador, programa){
    		if(vm.formDocumentacion.$invalid == true) {
				objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Seleccione los datos necesarios');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
    		} else {
				mediador = vm.ID_COMPANIA !=  null ? vm.ID_COMPANIA : perfil.adicional.ID_COMPANIA;
				vm.parent.abrirModalcargar(true);
    			BrokerService.getFilesBroker(mediador, programa)
    			.then(function successCallback(response){
    				if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							if(response.data.LIST_DOCUMENTOS != undefined){
								vm.listDocuments = response.data.LIST_DOCUMENTOS; // 
								$mdDialog.cancel();
							}else{
								msg.textContent("No se han encontrado documentos.");
								$mdDialog.show(msg);		
							}
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);	
						}
    					
    				}
    			}, function callBack(response){
    				msg.textContent("Se ha producido un error al cargar los documentos.");
    				$mdDialog.show(msg);
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
			
    	}
    }
    ng.module('App').component('documentacionApp', Object.create(documentacionComponente));
    
})(window.angular);