(function(ng) {	


	//Crear componente de app
    var subirFicheroComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['BASE_SRC', '$location', 'FicherosService', '$mdDialog', '$scope', 'CommonUtils'],
    		require: {
            	parent:'^sdApp'
            }
    }
    
    
    
    subirFicheroComponente.controller = function subirFicheroComponentetControler(BASE_SRC, $location, FicherosService, $mdDialog, $scope, CommonUtils){
    	var vm=this;
    	vm.listFiles = [];
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.listCompanias = [];
    	vm.listTiposFichero = [];
    	
    	this.$onInit = function(){
    		
    		if(vm.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.getPermissions('ficheros_subir_fichero');
    		}
    		
			vm.url = $location.url();
			var tipo = '';
			var json = {};
			
			if(vm.url === '/ficheros_subir_facturas'){
				json = {"IN_FICHERO": 9};
				tipo = 'bsr';
			}else if(vm.url === '/ficheros_subir_fichero_roaming'){
				json = {"IN_FICHERO": 5};
				tipo = 'roaming';
			}else if(vm.url === '/ficheros_subir_fichero'){
				json = {"IN_FICHERO": 1};
				tipo = 'cias';
			}
			
            vm.json = json;
			
			FicherosService.getFicheros(json)
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listFicheros = response.data.FICHEROS.FICHERO;
					vm.gridOptions.data = vm.listFicheros;
				}
			}, function callBack(response){
				msg.textContent("Se ha producido un error al cargar los ficheros.");
				$mdDialog.show(msg);
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
			
			FicherosService.getCias(tipo)
			.then(function successCallback(response){
				if(response.status == 200){
					if(vm.url === '/ficheros_subir_facturas' && response.data.ASEGURADORAS != undefined){
						for(var i = 0; i < response.data.ASEGURADORAS.length; i++){
							if(response.data.ASEGURADORAS[i].ID_COMPANIA === 4){
								vm.listCompanias.push(response.data.ASEGURADORAS[i]);
								break;
							}
						}
					}else{
						if(response.data.ASEGURADORAS != undefined){
							vm.listCompanias = response.data.ASEGURADORAS;
						}
					}
				}
			});
			
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listFicheros;
    	}
    	
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC+'subidaFicheros/subidaFicheros.view.html';
            } else {
                return 'src/error/404.html';
            }
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
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
      		      {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function(row){return row.entity.NO_COMPANIA}},
      		      {field: 'NO_TIPO_ARCHIVO', displayName: 'Tipo de archivo', cellTooltip: function(row){return row.entity.NO_TIPO_ARCHIVO}},
      		      {field: 'NO_ARCHIVO', displayName: 'Fichero', cellTooltip: function(row){return row.entity.NO_ARCHIVO}},
      		      {field: 'NO_MENSAJE', displayName: 'Estado', cellTooltip: function(row){return row.entity.NO_MENSAJE}},
				  {field: ' ', displayName: 'Descargar', cellTemplate: '<div ng-if="row.entity.DESCARGAR != false" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarFichero($event,row.entity, row)">Descargar</a></div>'},
				  {field: ' ', displayName: 'Eliminar', cellTemplate: '<div ng-if="grid.appScope.$ctrl.permisos.IN_BORRADO == true" class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.eliminarFichero($event,row.entity, row)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>', width: 60,}	
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
            FicherosService.getFicheros(vm.json)
            .then(function successCallback(response){
                if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						vm.listFicheros = response.data.FICHEROS.FICHERO;
                    	vm.gridOptions.data = vm.listFicheros;
					} else {
						msg.textContent(response.data.DS_RESULT);
                		$mdDialog.show(msg);
					}
                } else {
					msg.textContent("Se ha producido un error al cargar los ficheros.");
                	$mdDialog.show(msg);
				}
            }, function callBack(response){
                msg.textContent("Se ha producido un error al cargar los ficheros.");
                $mdDialog.show(msg);
                if(response.status == 406 || response.status == 401){
                    vm.parent.logout();
                }
            });
        }
    	
    	vm.addFiles = function(){
    		// if(vm.form != undefined && vm.form != null && vm.form.TIPOFICHERO != undefined && vm.form.COMPANIA != undefined && vm.archivo != undefined){
    		// 	vm.listFicheros.unshift({ "DESCARGAR": false, "NO_RUTA_ORIGEN": vm.form.TIPOFICHERO.NO_RUTA_ORIGEN, "NO_TIPO_ARCHIVO": vm.form.TIPOFICHERO.NO_TIPO_ARCHIVO, "NO_COMPANIA": vm.form.COMPANIA.NO_COMPANIA, "ID_COMPANIA": vm.form.COMPANIA.ID_COMPANIA, "ARCHIVO": vm.archivo.ARCHIVO, "NO_ARCHIVO": vm.NO_ARCHIVO, "NO_MENSAJE": "Pendiente" });
    		if(vm.form != undefined && vm.form != null && vm.form.TIPOFICHERO != undefined && vm.form.COMPANIA != undefined && vm.listFiles != undefined){

				for(let i = 0; i < vm.listFiles.length; i++) {
					vm.listFiles[i]['NO_RUTA_ORIGEN'] = vm.form.TIPOFICHERO.NO_RUTA_ORIGEN;
					vm.listFiles[i]['NO_TIPO_ARCHIVO'] = vm.form.TIPOFICHERO.NO_TIPO_ARCHIVO;
					vm.listFiles[i]['NO_COMPANIA'] = vm.form.COMPANIA.NO_COMPANIA;
					vm.listFiles[i]['ID_COMPANIA'] = vm.form.COMPANIA.ID_COMPANIA;
					vm.listFiles[i]['NO_MENSAJE'] = 'Pendiente';
				}
    			
    			var json = {
	    			"FICHEROS": {
	    				"FICHERO": vm.listFiles
	    			}
    			}
    			if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
    				
                    vm.parent.abrirModalcargar(true);
    				FicherosService.uploadAseguradorasFiles(json)
    				.then(function successCallback(response){
    					if(response.status == 200) {
							if(response.data.ID_RESULT != 0){
								vm.parent.cambiarDatosModal(response.data.DS_RESULT);
								vm.form = null;
								vm.listFiles = [];
							} else {
								vm.listFiles = [];
    							vm.form = null;
                            	vm.parent.cambiarDatosModal('El fichero se ha guardado correctamente');
							}
    					} else {
                            vm.parent.cambiarDatosModal('Ha ocurrido un error al guardar el fichero');
    					}
    					vm.recargarListado();
    				}, function errorCallBack(response){
                        vm.parent.cambiarDatosModal('Ha ocurrido un error al guardar el fichero');
						if(response.status == 406 || response.status == 401){
							vm.parent.logout();
						}
                    });
    			}
    			
    		}else{
    			msg.textContent("Elija correctamente los datos para añadir archivo.");
				$mdDialog.show(msg);
    		}
    		
    	}
    	
    	$(document).on('change', '#file_sf', function(e) {
    		var reader,
			file = this.files[0];
    		vm.NO_ARCHIVO = file.name;
    		
			e.preventDefault();
	
			if (!file)
				return;
	
			reader = new FileReader();
			reader.onload = function(){
				var base64 = reader.result.split("base64,")[1];
				var binary_string = window.atob(base64);
			    var len = binary_string.length;
			    var bytes = [];
			    for (var i = 0; i < len; i++) {
			        bytes.push(binary_string.charCodeAt(i));
			    }
			    
				vm.archivo = {
					"ARCHIVO": bytes,
//		        	"ARCHIVO": "LEdBU1RPUyBJTlRFUk5PUyxCYW5kYSwgUmVjdXJzbywgRW5lcm8sIEZlYnJlcm8sIE1hcnpvICwgQWJyaWwsIE1heW8sIEp1bmlvLCBKdWxpbywgQWdvc3RvLCBTZXB0aWVtYnJlLCBPY3R1YnJlLCBOb3ZpZW1icmUsIERpY2llbWJyZSwgVG90YWwgSCwgVG90YWwgRXVyb3MsIFRvdGFsIEHDsW9zIAosLCwsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAgCixUT1RBTCBHQVNUT1MgSU5URVJOT1MsLCwwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLDAsIDAsMCAKLAosCixHQVNUT1MgRVhURVJOT1MsR2FzdG8sIFJlY3Vyc28sIEVuZXJvLCBGZWJyZXJvLCBNYXJ6byAsIEFicmlsLCBNYXlvLCBKdW5pbywgSnVsaW8sIEFnb3N0bywgU2VwdGllbWJyZSwgT2N0dWJyZSwgTm92aWVtYnJlLCBEaWNpZW1icmUsIFRvdGFsIEgsIFRvdGFsIEV1cm9zLCBUb3RhbCBBw7FvcyAKLCwsLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwIAosVE9UQUwgR0FTVE9TIEVYVEVSTk9TLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwwLCAwLDAgCiwKLAosT1RST1MgR0FTVE9TLEdhc3RvcywsIEVuZXJvLCBGZWJyZXJvLCBNYXJ6byAsIEFicmlsLCBNYXlvLCBKdW5pbywgSnVsaW8sIEFnb3N0bywgU2VwdGllbWJyZSwgT2N0dWJyZSwgTm92aWVtYnJlLCBEaWNpZW1icmUsICwgVG90YWwsIFRvdGFsIEHDsW9zIAosLCwsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAgCixUT1RBTCBPVFJPUyBHQVNUT1MsLCwwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCwgMCwwIAosCiwKLElOR1JFU09TLEluZ3Jlc29zLCwgRW5lcm8sIEZlYnJlcm8sIE1hcnpvICwgQWJyaWwsIE1heW8sIEp1bmlvLCBKdWxpbywgQWdvc3RvLCBTZXB0aWVtYnJlLCBPY3R1YnJlLCBOb3ZpZW1icmUsIERpY2llbWJyZSwgLCBUb3RhbCwgVG90YWwgQcOxb3MgCiwsLCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCAKLFRPVEFMIElOR1JFU09TLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAsMCAKLAosSU5HUkVTT1MgWSBHQVNUT1MgVE9UQUxFUywgLCAsICwgLCAgLCAsICwgLCAsICwgLCAsICwgLCAKLFRPVEFMIElOR1JFU09TLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAsMCAKLFRPVEFMIElOR1JFU09TIEFDVU1VTEFET1MsLCwwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCwgMCwwIAosVE9UQUwgR0FTVE9TLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAsMCAKLFRPVEFMIEdBU1RPUyBBQ1VNVUxBRE9TLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAsMCAKLE1BUkdFTiBCUlVUTywsLDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsLCAwLjAwLDAgCixUT1RBTCBNQVJHRU4gQlJVVE8gQUNVTVVMQURPLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAuMDAsMCAKLE1BUkdFTiBCUlVUTyAlLCwsMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwsIDAsMCAKLFRPVEFMIE1BUkdFTiBCUlVUTyBBQ1VNVUxBRE8gJSwsLDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsLCAwLDAgCixUT1RBTCBBVkFOQ0UgJSwsLDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsLCAwLDAgCixUT1RBTCBBVkFOQ0UgQUNVTVVMQURPICUsLCwwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCwgMCwwIAosCg==",
		        	"NO_ARCHIVO": vm.NO_ARCHIVO
		        };
				
				$scope.$apply();
			}
			reader.readAsDataURL(file);
    		
    	});
    	
    	vm.changeAseguradora = function(){
    		if(vm.form.COMPANIA != undefined && vm.form.COMPANIA.ID_COMPANIA != undefined){
    			var id = vm.form.COMPANIA.ID_COMPANIA;
				vm.form.TIPOFICHERO = undefined;

				if(vm.url === '/ficheros_subir_facturas')
					id += '?tipo=9';

    			FicherosService.getFicherosByAseguradora(id)
    			.then(function successCallback(response){
    				if(response.status == 200){
    					if(response.data.FICHEROS != undefined && response.data.FICHEROS.FICHERO != undefined){
    						vm.listTiposFichero = response.data.FICHEROS.FICHERO;
    					}
    				}
    			});
    			
    		}
    	}
    	
    	// vm.upload = function(file, archivo) {
    	//     vm.NO_ARCHIVO = file.name;
    	    
    	// 	var reader = new FileReader();
		//     reader.readAsDataURL(file);
		//     reader.onload = function () {
		//     	var base64 = reader.result;
		//         vm.archivo = {
		//         	"ARCHIVO": base64,
		//         	"NO_ARCHIVO": vm.NO_ARCHIVO
	    //         };
		//         console.log(reader.result);
		//     };
		//     reader.onerror = function (error) {
		//         console.log('Error: ', error);
		//     };
    		
		// }

		$scope.$watch('$ctrl.files', function () {
			vm.upload(vm.files);
		});

		vm.upload = function(files) {
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {								
					(function(oFile) {
						var reader = new FileReader();  
						reader.onload = function(e) {  
							var dataUrl = reader.result;
							var byteString;
							if(dataUrl.split(',')[0].indexOf('base64') >= 0)
								byteString = atob(dataUrl.split(',')[1]);
							else
								byteString = unescape(dataUrl.split(',')[1]);
								
							var len = byteString.length;
							var bytes = [];
							for(let i = 0; i < len; i++){
								bytes.push(byteString.charCodeAt(i));
							}
							var file = {
								'ARCHIVO': bytes,
								'NO_ARCHIVO': CommonUtils.checkFileName(oFile.name),
								'DESCARGAR': false
							};
							// vm.filesToUpload = true;
							$scope.$apply(function() {
								vm.listFiles.push(file);
							});
						}
						reader.readAsDataURL(oFile);
					})(files[i]);
				}
			}
		}
    	
    	vm.descargarFichero = function(event, row){
    		FicherosService.downloadFichero({"NO_RUTA_ORIGEN":row.NO_RUTA_ORIGEN,"NO_ARCHIVO":row.NO_ARCHIVO})
			.then(function successCallback(response){
				if(response.status == 200){
					saveAs(new Blob([response.data]), row.NO_ARCHIVO);
				}
			});
    	}
    	
    	vm.guardarFicheros = function(){
	    	var json = {
				"FICHEROS": {
					"FICHERO": vm.listFicheros
				}
			}
			if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
				
                vm.parent.abrirModalcargar(true);
				FicherosService.uploadAseguradorasFiles(json)
				.then(function successCallback(response){
					if(response.status == 200){
                        vm.parent.cambiarDatosModal('El fichero se ha guardado correctamente');
					} else {
                        vm.parent.cambiarDatosModal('Ha ocurrido un error al guardar el fichero');
					}
				}, function errorCallBack(response){
                    vm.parent.cambiarDatosModal('Ha ocurrido un error al guardar el fichero');
                });
			}
    		
		}
		
    	vm.eliminarFichero = function(e, row) {

    		var listFicheros = vm.gridOptions.data;
    		
			if(listFicheros.length >0 ){


				for (var i = 0 ; i < listFicheros.length; i++){
					if(listFicheros[i] == row){
						listFicheros[i].IS_DELETED = true;
						break;
					}
				}
				
				var json = {
					"FICHEROS": {
						"FICHERO": listFicheros
					}
				}

				vm.parent.abrirModalcargar(true);
				FicherosService.uploadAseguradorasFiles(json)
				.then(function successCallback(response) {
					if(response.status == 200){
						vm.parent.cambiarDatosModal('El fichero se ha eliminado correctamente');
					} else {
						vm.parent.cambiarDatosModal('Ha ocurrido un error al eliminar el fichero');
					}
					vm.recargarListado();
				}, function errorCallBack(response){
					vm.parent.cambiarDatosModal('Ha ocurrido un error al eliminar el fichero');
            	});

			}else{
				msg("Seleccione al menos una opción para eliminar");
				$mdDialog.show(msg);
			}
		}

		vm.showFiles = function(elemType) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'subidaFicheros/show-files.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.listFiles = vm.listFiles;
					
					md.deleteFile = function(index) {
						md.listFiles.splice(index, 1);
					}	
					
					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						$mdDialog.cancel();
					};

				}]
			})
		}
    
    }
    ng.module('App').component('sdUpFile', Object.create(subirFicheroComponente));
    
})(window.angular);