(function(ng) {	


	//Crear componente de busqeuda
    var busquedaProveedoresComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'UsuarioWSService', 'TiposService', 'ProveedoresService'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaProveedoresComponent.controller = function busquedaProveedoresComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, UsuarioWSService, TiposService, ProveedoresService){
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
    		
    		//Cargar las listas
			if(localStorage.alarmas != undefined && localStorage.alarmas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.alarmas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
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
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{field: 'ID_PROVEEDORES_PROGRAMAS', 
					displayName: 'ID Proveedor', 
					cellTooltip: function(row){return row.entity.ID_PROVEEDORES_PROGRAMAS},
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'proveedor\', row)">{{row.entity.ID_PROVEEDORES_PROGRAMAS}}</a></div>',
					},
    		      {field: 'NU_DOCUMENTO', displayName: 'CIF', cellTooltip: function(row){return row.entity.NU_DOCUMENTO}}, 
				  {field: 'NO_EMPRESA', displayName: 'Proveedor', cellTooltip: function(row){return row.entity.NO_EMPRESA}},
    		      {field: 'NO_PROGRAMA', displayName: 'Programa', cellTooltip: function(row){ return row.entity.DS_PROGRAMA}},
    		      {field: 'NUMERO_CONTRATOS', displayName: 'Nº Contratos'},
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		    }
    	}
		
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.proveedores.html";
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
		
		//Abrir modal de nuevo proveedor
        vm.nuevoProveedor = function() {
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
    	
    	vm.anadirProveedor = function () {
    		$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/add_proveedor.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', '$window', function ($mdDialog, $window) {
                    var md = this;
                    md.minDate = new Date();
                    
                    this.$onInit = function () {
                    	md.showContractForm = false;
                    	md.form = {};
                    	md.listProveedores = [];
                    	md.listProductos = [];
                    	
            			ProveedoresService.getEmpresasProveedor()
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
                                    if (response.data.PROVEEDORESPROGRAMAS != null && response.data.PROVEEDORESPROGRAMAS.length > 0) {
                                    	md.listProveedores = response.data.PROVEEDORESPROGRAMAS;
                                    }
                             	}
                            }
                        });
            			
            			TiposService.getProgramasProveedor({})
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
                                    if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                                    	md.listProductos = response.data.TIPOS.TIPO;
                                    	
                                    	if (vm.parent.form != null && vm.parent.form.NO_PROGRAMA != null) {
                                        	md.idPrograma = md.listProductos.find(x => x.NO_PROGRAMA == vm.parent.form.NO_PROGRAMA).ID_PROGRAMA;
                                    	}
                                    }
                             	}
                            }
                        });
            			
            			TiposService.getTipos({"ID_TIPOS": "22029"})
            			.then(function successCallback(response){
            				if(response.status == 200){
            					if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0 && response.data.TIPOS.TIPO[0].CO_TIPO != null) {
            					    md.diaPreavisoContrato = response.data.TIPOS.TIPO[0].CO_TIPO;
            					}
            				}
            			}, function callBack(response){
            				if(response.status == 406 || response.status == 401){
                            	vm.parent.logout();
                            }
            			});
            			
            			TiposService.getTipos({"ID_TIPOS": "22030"})
            			.then(function successCallback(response){
            				if(response.status == 200){
            					if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0 && response.data.TIPOS.TIPO[0].CO_TIPO != null) {
            					    md.diasAvisoFinContrato = response.data.TIPOS.TIPO[0].CO_TIPO;
            					    md.form.NU_DIAS_PREAVISO = response.data.TIPOS.TIPO[0].CO_TIPO;
            					    
            					    if (md.form.NU_DIAS_PREAVISO != null) {
            					    	var diasPreavisoSplit = md.form.NU_DIAS_PREAVISO.split(",");
            					    	for (var i = 0; i < diasPreavisoSplit.length; i++) {
            					    		if (diasPreavisoSplit[i].length != 10) {
            					    			md.form["PREAVISO_" + (i+1)] = diasPreavisoSplit[i];
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
                	
                	md.changeFechaVencimiento = function () {
                		if (md.diaPreavisoContrato != null && md.form.FD_VENCIMIENTO != null) {
	                		var fechaVencimiento = new Date(md.form.FD_VENCIMIENTO);
	                		fechaVencimiento = fechaVencimiento.setDate(fechaVencimiento.getDate() - md.diaPreavisoContrato);
	                		md.form.FECHA_PREAVISO = moment(fechaVencimiento).format('YYYY-MM-DD');
	                		md.getDsAvisos();
                		}
                	}
                	
                	md.changeDiasPreaviso = function () {
                		if (md.diaPreavisoContrato == null || md.diaPreavisoContrato == "") {
                			md.form.FECHA_PREAVISO = null;
                		} else if (md.form.FD_VENCIMIENTO != null) {
                			var fechaVencimiento = new Date(md.form.FD_VENCIMIENTO);
                			fechaVencimiento = fechaVencimiento.setDate(fechaVencimiento.getDate() - md.diaPreavisoContrato);
                			md.form.FECHA_PREAVISO = moment(fechaVencimiento).format('YYYY-MM-DD');
                		}
                	}
                	
                	md.formatBeautyDate = function (date) {
                		if (date != null) {
                			return moment(date).format('DD-MM-YYYY');
                		}
                	}
                	
                	md.getDsAvisos = function () {
            			var avisosDs = "";
            			var avisosList = [];
                		if (md.form.FECHA_PREAVISO != null && md.form.NU_DIAS_PREAVISO != null) {
                			var nuDiasPreavisoList = [];
                			if (md.form.PREAVISO_1 != null) { nuDiasPreavisoList.push(md.form.PREAVISO_1); }
                			if (md.form.PREAVISO_2 != null) { nuDiasPreavisoList.push(md.form.PREAVISO_2); }
                			for (var i = 0; i < nuDiasPreavisoList.length; i++) {
                				var fechaPreaviso = new Date(md.form.FECHA_PREAVISO);
                				fechaPreaviso = fechaPreaviso.setDate(fechaPreaviso.getDate() - nuDiasPreavisoList[i]);
                				avisosList.push(moment(fechaPreaviso).format('DD-MM-YYYY'));
                			}
                		}
                		
                		for (var i = 0; i < avisosList.length; i++) {
                			avisosDs += avisosList[i];
                			if (i+2 == avisosList.length) {
                				avisosDs += " y ";
                			} else if (i+1 < avisosList.length) {
                				avisosDs += ", ";
                			}
                		}
                		
                		return avisosDs;
                	}
                    
                    md.guardar = function () {
                    	if (!md.formNuevoContrato && md.archivo != null) {
                    		md.load = true;

                    		var nuDiasPreaviso = "";

                            if (md.form.PREAVISO_1 != null) {
                            	nuDiasPreaviso += md.form.PREAVISO_1;
                            }
                            
                            if (md.form.PREAVISO_2 != null) {
                            	nuDiasPreaviso += "," + md.form.PREAVISO_2;
                            }

	                    	var obj = {
	                        	ID_EMPRESA: md.PROVEEDOR.ID_EMPRESA,
	                        	ID_PROGRAMA: md.idPrograma,
	                        	NO_USU_ALTA: JSON.parse($window.sessionStorage.perfil).usuario,
	                        	LST_CONTRATOS: [
	                                {
	                                	NO_ARCHIVO: md.archivo.NO_ARCHIVO,
	                                	DS_ARCHIVO: md.form.DS_ARCHIVO,
	                                	ID_TIPO_ARCHIVO: 230,
	                                	ARCHIVO_STRING: md.archivo.ARCHIVO_STRING,
	                                	NO_USU_ALTA: JSON.parse($window.sessionStorage.perfil).usuario,
										NU_DIAS_PREAVISO: nuDiasPreaviso + "," + md.form.FECHA_PREAVISO,
										FD_VENCIMIENTO: moment(md.form.FD_VENCIMIENTO).format('YYYY-MM-DD')
	                                }
	                        	]
	                        };
	                    	
	            			ProveedoresService.createProvPrograma(obj)
	                        .then(function successCallback(response) {
	                            if (response.status === 200) {
	                        		md.load = false;
	                            	if(response.data.ID_RESULT == 0){
	                                    msg.textContent("Se ha guardado correctamente.");
	                                    $mdDialog.show(msg);
	                                    vm.parent.recargarListado();
	                             	} else {
	                                    msg.textContent(response.data.DS_RESULT);
	                                    $mdDialog.show(msg);
	                             	}
	                            }
	                        });
	                    } else {
	                        objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
	                        if(objFocus != undefined) {
	                            objFocus.focus();
	                        }
	                    }
                    }
                    
                    md.querySearch = function (query, list, key) {
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
                    
                    $(document).on('change', '#file_contrato_modal_proveedor', function(e) {
                        if (angular.element("#file_contrato_modal_proveedor") != null && angular.element("#file_contrato_modal_proveedor").scope != null) {
                            $scope = angular.element("#file_contrato_modal_proveedor").scope();
                            md = angular.element("#file_contrato_modal_proveedor").scope().$ctrl;
                        }
            			if(e) {
            				$scope.$apply();
            				if(document.getElementById('file_contrato_modal_proveedor').files != null && document.getElementById('file_contrato_modal_proveedor').files.length > 0 != null){
            					
                                for (var i = 0; i < document.getElementById('file_contrato_modal_proveedor').files.length; i++) {
                                	var f = document.getElementById('file_contrato_modal_proveedor').files[i];

            						md.nombreArchivoContrato = f.name;
            						md.archivo = null;

            						var reader = new FileReader();
            						reader.filename = f.name;
            						
            						reader.onload = function(readerEvt) {

            							var base64 = reader.result.split("base64,")[1];
            							var dsArchivo = "";

            							var fileName = readerEvt.target.filename;
            							fileName = fileName.split(".");
            							if (fileName.length > 1) {
            								fileName[0] = vm.parent.parent.changeSpecialCharacters(fileName[0]);
            							}
            							fileName = fileName.join('.');
            							md.nombreArchivoMov = fileName;

            							md.archivo =
            								{                    
            									ARCHIVO_STRING: base64,
            									NO_ARCHIVO: fileName,
            									ID_TIPO_ARCHIVO: 230,          
            								}

            							$scope.$apply();

            						}

            						reader.readAsDataURL(f);
                                }

                                e.stopImmediatePropagation();
            				}
            			}
            		});
                	
                	function createFilterFor(query, key) {
                        var uppercaseQuery = query.toUpperCase();

                        return function filterFn(list) {
                        	if (list[key] == null) {
                        		return false;
                        	} else {
                                if (key != "text") 
                                    return (list[key].toUpperCase().includes(uppercaseQuery));
                                else
                                    return (list[key].toUpperCase().includes(uppercaseQuery));
                        	}
                        };
                    }
                	
                	md.cancel = function () {
                		$mdDialog.cancel();
                	}

                }]
            });
    	}
		
    }

    
    ng.module('App').component('busquedaProveedores', Object.create(busquedaProveedoresComponent));
    
})(window.angular);