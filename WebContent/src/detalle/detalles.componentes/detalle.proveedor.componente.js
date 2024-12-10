(function(ng) {	

	//Crear componente de app
    var ProveedorComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
            $inject:['$location', '$scope', '$mdDialog', '$translate', 'BusquedaService', 'TiposService', '$templateCache', 'BASE_SRC', 'ProveedoresService', 'FicherosService'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		}
    }
    
    ProveedorComponent.controller = function ProveedorComponentControler($location, $scope, $mdDialog, $translate, BusquedaService, TiposService, $templateCache, BASE_SRC, ProveedoresService, FicherosService){
    	var vm=this;
    	var url=window.location;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	this.$onInit = function(bindings) {
			vm.datos = vm.parent.datos;
			vm.contratosGuardados = [];
			vm.isNew = false;
			vm.listProgramas = [];
			vm.minDate = new Date();
			vm.archivo = null;
			vm.isEditContrato = false;
			vm.isNewContrato = false;
			vm.form = null;
    		
			if(vm.datos != null && vm.datos.ID_PROVEEDORES_PROGRAMAS != null){
				vm.getDetalle();
			} else if (vm.datos == null) {
				vm.isNew = true;
			}
			
			TiposService.getProgramas({})
            .then(function successCallback(response) {
             	if(response.data.ID_RESULT == 0){
                    if (response.data.NUMERO_TIPOS > 0) {
                        vm.listProgramas = response.data.TIPOS.TIPO;
                    } else {
                        vm.vista = 3;
                    }
             	 }
            });
			
			TiposService.getTipos({"ID_TIPOS": "22029"})
			.then(function successCallback(response){
				if(response.status == 200){
					if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0 && response.data.TIPOS.TIPO[0].CO_TIPO != null) {
					    vm.diaPreavisoContrato = response.data.TIPOS.TIPO[0].CO_TIPO;
					    vm.diaPreavisoContratoCopy = response.data.TIPOS.TIPO[0].CO_TIPO;
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
					    vm.diasAvisoFinContrato = response.data.TIPOS.TIPO[0].CO_TIPO;
					}
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
		}
    	
    	vm.getDetalle = function () {
    		vm.appParent.abrirModalcargar(true);
    		ProveedoresService.getProvProgramaDetail(vm.datos.ID_PROVEEDORES_PROGRAMAS)
    		.then(function successCallback(response){
        		$mdDialog.cancel();
				if (response.data != null && response.data.PROVEEDORESPROGRAMAS != null && response.data.PROVEEDORESPROGRAMAS.length > 0) {
					vm.datos = response.data.PROVEEDORESPROGRAMAS[0];
					if (vm.datos.LST_CONTRATOS != null) {
						vm.contratosGuardados = JSON.parse(JSON.stringify(vm.datos.LST_CONTRATOS));
						for(var i = 0; i < vm.contratosGuardados.length; i++){
							if(vm.contratosGuardados[i].NU_DIAS_PREAVISO != null && vm.contratosGuardados[i].NU_DIAS_PREAVISO.length > 10){
								var dias = vm.contratosGuardados[i].NU_DIAS_PREAVISO.split(",");
								vm.contratosGuardados[i].NU_DIAS_PREAVISO = dias[0] + "," + dias[1];
								vm.contratosGuardados[i].IS_UNDEFINED = dias[3];
							}
						}
			    		vm.gridOptionsContratos.data = vm.contratosGuardados;
					}
				}
			})
    	}
    	
    	vm.gridOptionsContratos = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
		    paginationPageSize: 30,
            showGridFooter: true,
            enableRowHashing: false,
			gridFooterTemplate: '<div class="leyendaInferior">' +
				'<div class="contenedorElemento"><span>Avisado vencimiento</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
				'<div class="contenedorElemento"><span>Vencido</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
			'</div>',
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
		    columnDefs: [
			    {field: 'NO_ARCHIVO', displayName: 'Archivo', enableCellEdit: false, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, cellTooltip: function(row){return row.entity.NO_ARCHIVO}},
			    {field: 'DS_ARCHIVO', displayName: 'Descripción', enableCellEdit: false, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, cellTooltip: function(row){return row.entity.DS_ARCHIVO}},
			    {field: 'FECHA_VENCIMIENTO', displayName: 'Fecha vencimiento', enableCellEdit: false, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getFechaVencimiento(row.entity)}}</div>'},
			    {field: 'FECHA_PREAVISO', displayName: 'Fecha preaviso', enableCellEdit: false, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDiaPreaviso(row.entity)}}</div>'},
				{field: 'NU_DIAS_PREAVISO', displayName: 'Días de preaviso', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDiasAviso(row.entity)}}</div>'},
				{field: 'IS_RENOVABLE_ANUAL', displayName: 'Renovable anualmente', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.IS_RENOVABLE_ANUAL == 1" layout="row" layout-align="center center"><span class="material-icons" style="color: #31577e">check</span></div>'},
				{field: 'IS_UNDEFINED', displayName: 'Indefinido', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }, enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.IS_UNDEFINED == 1" layout="row" layout-align="center center"><span class="material-icons" style="color: #31577e">check</span></div>'},
            	{
                    name: ' ',
                    cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center"><a ng-if="row.entity.ID_ARCHIVO != null" ng-click="grid.appScope.$ctrl.descargarArchivo(row.entity)" style="font-family: TelefonicaWebRegular;font-size: 1em;"><i class="fas fa-download" style="margin-right: 5px"></i></a></div>',
                    width: '5%', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
            	{
                    name: '  ',
                    cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center"><a ng-if="row.entity.ID_ARCHIVO != null" ng-click="grid.appScope.$ctrl.clickEditContrato(row.entity)" style="font-family: TelefonicaWebRegular;font-size: 1em;">Editar</a></div>',
                    width: '5%', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
		    ],
		    onRegisterApi: function( gridApi ) {
  		      vm.gridApi = gridApi;
  		    }
		}
    	
    	function colorearEstado (fila) {
    		if (fila.FD_VENCIMIENTO != null) {
    			var vencimiento = new Date(fila.FD_VENCIMIENTO);
    			var vencimientoTime = new Date(fila.FD_VENCIMIENTO).getTime();
    			if (vencimiento < new Date().getTime()) {
    				return 'filaRoja';
    			}
    			
    			var avisado = false;
    			if (fila.NU_DIAS_PREAVISO != null) {
    				var diasPreavisoList = fila.NU_DIAS_PREAVISO.split(',');
    				if (diasPreavisoList != null) {
    					for (var i = 0; i < diasPreavisoList.length; i++) {
    						var diaPreaviso = diasPreavisoList[i];
    						if (diaPreaviso != null && diaPreaviso.length != 10) {
    		        			var fechaPreavisoVencimiento = new Date(vencimiento.setDate(vencimiento.getDate() - parseInt(diaPreaviso)));
    		        			if (fechaPreavisoVencimiento < new Date().getTime()) {
    		        				avisado = true;
    		        				break;
    		        			}
    		    			}
    					}
    				}
    			}
    			
    			if (avisado == true) {
    				return 'filaAmarilla';
    			}
                return '';
    		}
            else {
                return '';
            }
    	}
    	
    	vm.getDiasAviso = function (data) {
    		var fecha = "";
    		if (data != null && data.NU_DIAS_PREAVISO != null && typeof data.NU_DIAS_PREAVISO == "string") {
    			var diasAvisoSplit = data.NU_DIAS_PREAVISO.split(",");
    			var listAvisos = [];
    			for (var i = 0; i < diasAvisoSplit.length; i++) {
    				if (diasAvisoSplit[i].length != 10) {
    					listAvisos.push(diasAvisoSplit[i]);
    				}
    			}
    			for (var i = 0; i < listAvisos.length; i++) {
    				fecha += listAvisos[i];
    				if (i+1 < listAvisos.length) {
    					fecha += ",";
        			}
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getFechaPreaviso = function (data) {
    		var fecha = "";
    		if (data != null && data.NU_DIAS_PREAVISO != null && typeof data.NU_DIAS_PREAVISO == "string") {
    			var fechaPreavisoSplit = data.NU_DIAS_PREAVISO.split(",");
    			if (fechaPreavisoSplit.length == 2) {
                    fecha = fechaPreavisoSplit[0];
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getDiaPreaviso = function (data) {
    		var fecha = "";
    		if (data != null && data.NU_DIAS_PREAVISO != null && typeof data.NU_DIAS_PREAVISO == "string") {
    			var fechaPreavisoSplit = data.NU_DIAS_PREAVISO.split(",");
    			if (fechaPreavisoSplit[fechaPreavisoSplit.length-1].length == 10) {
                    fecha =  moment(fechaPreavisoSplit[fechaPreavisoSplit.length-1]).format('DD/MM/YYYY');
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getFechaVencimiento = function (data) {
    		var fecha = "";
    		if (data != null && data.FD_VENCIMIENTO != null && typeof data.FD_VENCIMIENTO == "string") {
    			var fechaVencimiento = new Date(data.FD_VENCIMIENTO);
    			if (fechaVencimiento != null) {
                    fecha = moment(fechaVencimiento).format('DD/MM/YYYY');
    			}
    		}
    		return fecha;
    	}
    	
    	//Descargar archivo
    	vm.descargarArchivo = function (archivo) {
    		
    		vm.appParent.abrirModalcargar(true);
    		FicherosService.download(archivo.ID_ARCHIVO)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data != null){
						saveAs(new Blob([response.data]), archivo.NO_ARCHIVO);
						msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
						$mdDialog.show(msg);
					}else{
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response) {
					if(response.status == 500){
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
			});
    	}
    	
    	vm.changeCodigoPostal = function (valor) {
			if (valor.length == 5) {
				vm.localidades = [];
				TiposService.getLocalidades(valor)
				.then(function successCallBack(response) {
					if (!Array.isArray(response.data.LOCALIDAD)) {
						vm.localidades = [];
						vm.localidades.push(response.data.LOCALIDAD);
					} else {
						vm.localidades = response.data.LOCALIDAD;
						if(vm.localidades.length>1){
							LocalidadesService.elegirLocalidad(vm.localidades, vm.datos);
						}else
							vm.datos.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
					}
					
					vm.datos.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
					vm.datos.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
					vm.datos.DS__CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
					vm.datos.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
					
				}, function errorCallBack(response) {});
			} else {
				vm.datos.ID_LOCALIDAD = null;
				vm.datos.NO_LOCALIDAD = null;
				vm.datos.CO_PROVINCIA = null;
				vm.datos.DS__CO_PROVINCIA = null;
				vm.datos.NO_PROVINCIA = null;
			}
		}
    	
    	vm.guardar = function () {
    		if(!vm.formProveedor) {

    			if (vm.listContratosPendientes != null && vm.listContratosPendientes.length > 0) {
                    if (vm.datos.LST_CONTRATOS == null) {
                    	vm.datos.LST_CONTRATOS = [];
                    }
                    for (var i = 0; i < vm.listContratosPendientes.length; i++) {
                        vm.datos.LST_CONTRATOS.push(vm.listContratosPendientes[i]);
                    }
    			}
    			
        		vm.appParent.abrirModalcargar(true);
        		ProveedoresService.updateProvPrograma([vm.datos])
                .then(function successCallback(response) {
                    if (response.data.ID_RESULT == 0) {
                    	vm.getDetalle();
                    	vm.listContratosPendientes = [];
                        msg.textContent("Se ha guardado correctamente");
                    } else {
                        msg.textContent(response.data.DS_RESULT);
                    }
                    $mdDialog.show(msg);
                }, function errorCallback(response) {
                    msg.textContent("Ha ocurrido un error al guardar el aviso.");
                    $mdDialog.show(msg);
                    if (response.status == 406) {
                        vm.parent.parent.logout();
                    }
                })
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
            }
    	}
                    
        vm.dateStringToDate = function (date) {
        	if (date != null && typeof date == "string") {
        		var dateSplit = date.split("/");
        		var day = dateSplit[0];
        		var month = dateSplit[1];
        		var year = dateSplit[2];
        		return year + "-" + month + "-" + day;
        	} return "";
        }
        
        vm.addContrato = function () {
        	if (vm.archivo == null && vm.isNewContrato == true) {
                msg.textContent("Debe rellenar todos los datos obligatorios para añadir un contrato.");
                $mdDialog.show(msg);
                return null;
        	}
        	
        	if(!vm.formNuevoContrato) {

        		vm.appParent.abrirModalcargar(true);
        		
        		if (vm.isNewContrato == true) {

            		if (vm.listContratosPendientes == null) {
            			vm.listContratosPendientes = [];
            		}

            		var nuDiasPreaviso = "";
                    if (vm.form.PREAVISO_1 != null) {
                    	nuDiasPreaviso += vm.form.PREAVISO_1;
                    	delete vm.form.PREAVISO_1;
                    }
                    
                    if (vm.form.PREAVISO_2 != null) {
                    	nuDiasPreaviso += "," + vm.form.PREAVISO_2;
                    	delete vm.form.PREAVISO_2;
                    }
                    
        			if(vm.form.IS_UNDEFINED == null || vm.form.IS_UNDEFINED == undefined || vm.form.IS_UNDEFINED == false){
        				vm.form.IS_UNDEFINED = 0;
        			}else{
        				vm.form.IS_UNDEFINED = 1;
        			}
        			
            		var objContrato = {
        				NU_DIAS_PREAVISO: nuDiasPreaviso + "," + moment(vm.form.FECHA_PREAVISO).format('YYYY-MM-DD')+","+vm.form.IS_UNDEFINED,
        				FD_VENCIMIENTO: moment(vm.form.FD_VENCIMIENTO).format('YYYY-MM-DD'),
        				DS_ARCHIVO: vm.form.DS_ARCHIVO
        			}
            		
            		if (vm.archivo != null) {
            			objContrato.ARCHIVO_STRING = vm.archivo.ARCHIVO_STRING;
            			objContrato.NO_ARCHIVO = vm.archivo.NO_ARCHIVO;
            			objContrato.ID_TIPO_ARCHIVO = 230;
            			if(vm.form.IS_RENOVABLE_ANUAL != null && vm.form.IS_RENOVABLE_ANUAL != undefined){
            				objContrato.IS_RENOVABLE_ANUAL = vm.form.IS_RENOVABLE_ANUAL;
            			}else{
            				objContrato.IS_RENOVABLE_ANUAL = false;
            			}
            		}
            		
            		vm.listContratosPendientes.push(objContrato);
            		
    				vm.form.ID_EMPRESA = vm.datos.ID_EMPRESA;
    				vm.form.ID_PROVEEDORES_PROGRAMAS = vm.datos.ID_PROVEEDORES_PROGRAMAS;
    				vm.form.ID_PROGRAMA = vm.datos.ID_PROGRAMA;
    				vm.form.LST_CONTRATOS = vm.listContratosPendientes;
    				
        			ProveedoresService.createProvPrograma(vm.form)
                    .then(function successCallback(response) {
                        if (response.data.ID_RESULT == 0) {
                    		$mdDialog.cancel();
                    		vm.nombreArchivoContrato = null;
                    		vm.form = {};
                        	vm.getDetalle();
                        	vm.listContratosPendientes = [];
                            msg.textContent("Se ha guardado correctamente");
                    		if (document.getElementById("file_contrato_modal") != null && document.getElementById("file_contrato_modal").value != null) {
                                document.getElementById("file_contrato_modal").value = null;
                    		}
                    		vm.isNewContrato = false; 
                    		vm.isEditContrato = false;
                        } else {
                            msg.textContent(response.data.DS_RESULT);
                        }
                        $mdDialog.show(msg);
                    }, function errorCallback(response) {
                        msg.textContent("Ha ocurrido un error al guardar el aviso.");
                        $mdDialog.show(msg);
                        if (response.status == 406) {
                            vm.parent.parent.logout();
                        }
                    })
        		} else if (vm.isEditContrato == true) {
        			if (vm.archivo != null) {
            			vm.form.ARCHIVO_STRING = vm.archivo.ARCHIVO_STRING;
            			vm.form.NO_ARCHIVO = vm.archivo.NO_ARCHIVO;
            		}

            		var nuDiasPreaviso = "";
                    if (vm.form.PREAVISO_1 != null) {
                    	nuDiasPreaviso += vm.form.PREAVISO_1;
                    	delete vm.form.PREAVISO_1;
                    }
                    
                    if (vm.form.PREAVISO_2 != null) {
                    	nuDiasPreaviso += "," + vm.form.PREAVISO_2;
                    	delete vm.form.PREAVISO_2;
                    }
                    
                    if(vm.form.IS_UNDEFINED){
        				vm.indefinido = 1;
        			}else{
        				vm.indefinido = 0;
        			}
                    
            		if (nuDiasPreaviso != null && vm.form.FECHA_PREAVISO != null) {
            			vm.form.NU_DIAS_PREAVISO = nuDiasPreaviso + "," + moment(vm.form.FECHA_PREAVISO).format('YYYY-MM-DD')+","+vm.indefinido;
            			delete vm.form.FECHA_PREAVISO;
            		}
        			FicherosService.avisoFinContrato([vm.form])
                    .then(function successCallback(response) {
                        $mdDialog.cancel();
                        if (response.data.ID_RESULT == 0) {
                            msg.textContent("Se ha guardado correctamente");
                    		vm.nombreArchivoContrato = null;
                    		vm.form = {};
                        	vm.getDetalle();
                        	vm.listContratosPendientes = [];
                    		vm.isNewContrato = false; 
                    		vm.isEditContrato = false;
                        } else {
                            msg.textContent("Ha ocurrido un error al guardar el aviso.");
                        }
                        $mdDialog.show(msg);
                    }, function errorCallback(response) {
                		md.cargar = false;
                        msg.textContent("Ha ocurrido un error al guardar el aviso.");
                        $mdDialog.show(msg);
                        if (response.status == 406) {
                            vm.parent.parent.logout();
                        }
                    })
        		}
        		
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if(objFocus != undefined) {
                    objFocus.focus();
                }
                msg.textContent("Debe rellenar todos los datos obligatorios para añadir un contrato.");
                $mdDialog.show(msg);
            }
        }
        
        vm.clickNewContrato = function (bool) {
			vm.isEditContrato = false;
			vm.isNewContrato = bool;
			vm.form = {};
			if (bool == true) {
				vm.diaPreavisoContrato = JSON.parse(JSON.stringify(vm.diaPreavisoContratoCopy));
				if (vm.diasAvisoFinContrato != null) {
					var diasPreavisoSplit = vm.diasAvisoFinContrato.split(",");
					for (var i = 0; i < diasPreavisoSplit.length; i++) {
						if (diasPreavisoSplit[i].length != 10) {
							vm.form["PREAVISO_" + (i+1)] = diasPreavisoSplit[i];
						}
					}
				}
			}
        }
        
        vm.changeFechaVencimiento = function () {
        	if(vm.form.IS_UNDEFINED == "1")
        		vm.form.IS_UNDEFINED = true;
        	if(vm.form.IS_UNDEFINED == "0")
        		vm.form.IS_UNDEFINED = false;
    		if (vm.diaPreavisoContrato != null && vm.form.FD_VENCIMIENTO != null) {
    			var fechaVencimiento = new Date(vm.form.FD_VENCIMIENTO);
				var hoy = new Date();
				var year = hoy.getFullYear();
				vm.form.FECHA_PREAVISO = moment(fechaVencimiento).format(year+'-'+'MM-DD');
				var fechaPreaviso = new Date(vm.form.FECHA_PREAVISO);
				fechaPreaviso = fechaPreaviso.setDate(fechaPreaviso.getDate() - vm.diaPreavisoContrato);
    			vm.form.FECHA_PREAVISO = moment(fechaPreaviso).format('YYYY-MM-DD');
    			fechaPreaviso = new Date(vm.form.FECHA_PREAVISO);
    			if(fechaPreaviso <= hoy){
    				vm.form.FECHA_PREAVISO = fechaPreaviso.setFullYear(fechaPreaviso.getFullYear()+ 1);
    				vm.form.FECHA_PREAVISO = moment(vm.form.FECHA_PREAVISO).format('YYYY-MM-DD');
    			}
    			vm.getDsAvisos();
    		}
    	}
        
        vm.addYearsToFechaVencimiento = function(){
    		if(vm.form.IS_UNDEFINED){
    			if(vm.form.FD_VENCIMIENTO != null && vm.form.FD_VENCIMIENTO != undefined){
    				var fechaVencimientoInd = new Date(vm.form.FD_VENCIMIENTO);
    			}else{
    				var fechaVencimientoInd = new Date();
    			}
    			fechaVencimientoInd.setFullYear(fechaVencimientoInd.getFullYear()+ 77);
    		}else{
				var fechaVencimientoInd = new Date(vm.form.FD_VENCIMIENTO);
    			fechaVencimientoInd.setFullYear(fechaVencimientoInd.getFullYear()- 77);
    		}
			vm.form.FD_VENCIMIENTO = moment(fechaVencimientoInd).format('YYYY-MM-DD');
			vm.changeFechaVencimiento();
        }

        vm.changeDiasPreaviso = function () {
    		if (vm.diaPreavisoContrato == null || vm.diaPreavisoContrato == "") {
    			vm.form.FECHA_PREAVISO = null;
    		} else if (vm.form.FD_VENCIMIENTO != null) {
    			var fechaVencimiento = new Date(vm.form.FD_VENCIMIENTO);
    			fechaVencimiento = fechaVencimiento.setDate(fechaVencimiento.getDate() - vm.diaPreavisoContrato);
    			vm.form.FECHA_PREAVISO = moment(fechaVencimiento).format('YYYY-MM-DD');
    		}
    	}
    	
    	vm.formatBeautyDate = function (date) {
    		if (date != null) {
    			return moment(date).format('DD-MM-YYYY');
    		}
    	}
    	
    	vm.getDsAvisos = function () {
			var avisosDs = "";
			var avisosList = [];
    		if (vm.form.FECHA_PREAVISO != null && vm.form.PREAVISO_1 != null) {
    			var nuDiasPreavisoList = [];
    			if (vm.form.PREAVISO_1 != null) { nuDiasPreavisoList.push(vm.form.PREAVISO_1); }
    			if (vm.form.PREAVISO_2 != null) { nuDiasPreavisoList.push(vm.form.PREAVISO_2); }
    			for (var i = 0; i < nuDiasPreavisoList.length; i++) {
    				var fechaPreaviso = new Date(vm.form.FECHA_PREAVISO);
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
        
        vm.clickEditContrato = function (archivo) {
			vm.isEditContrato = true;
			vm.isNewContrato = false;
			vm.form = JSON.parse(JSON.stringify(archivo));
    		vm.nombreArchivoContrato = null;
    		
    		if (document.getElementById("file_contrato_modal") != null && document.getElementById("file_contrato_modal").value != null) {
                document.getElementById("file_contrato_modal").value = null;
    		}
    		
    		if (archivo.FD_VENCIMIENTO != null) {
        		vm.form.FD_VENCIMIENTO = moment(new Date(archivo.FD_VENCIMIENTO)).format('YYYY-MM-DD');
    		}

    		if (archivo.NU_DIAS_PREAVISO != null) {
    			var diasAvisoSplit = archivo.NU_DIAS_PREAVISO.split(',');
    			var listAvisos = [];
    			var campoDiasAviso = "";
    			for (var i = 0; i < diasAvisoSplit.length; i++) {
    				if (diasAvisoSplit[i].length != 10) {
    					listAvisos.push(diasAvisoSplit[i]);
    				} else {
    					vm.form.FECHA_PREAVISO = diasAvisoSplit[i];
    				}
    			}
    			for (var i = 0; i < listAvisos.length; i++) {
    				campoDiasAviso += listAvisos[i];
					vm.form["PREAVISO_" + (i+1)] = listAvisos[i];
    				if (i+1 < listAvisos.length) {
    					campoDiasAviso += ",";
        			}
    			}
    			vm.form.NU_DIAS_PREAVISO = campoDiasAviso;

    			if (vm.form.FECHA_PREAVISO == null && vm.form.FD_VENCIMIENTO != null) {
    				vm.changeFechaVencimiento();
    			} else if (vm.form.FECHA_PREAVISO != null && vm.form.FD_VENCIMIENTO != null) {
    				var diferenciaFechas = new Date(vm.form.FD_VENCIMIENTO).getTime() - new Date(vm.form.FECHA_PREAVISO).getTime();
    			    vm.diaPreavisoContrato = Math.round(diferenciaFechas/ (1000*60*60*24));
    			}
    		}
        }
        
        vm.dateStringToDate = function (date) {
        	if (date != null && typeof date == "string") {
        		var dateSplit = date.split("/");
        		var day = dateSplit[0];
        		var month = dateSplit[1];
        		var year = dateSplit[2];
        		return new Date(year + "-" + month + "-" + day);
        	} return "";
        }
        
        $(document).on('change', '#file_contrato_modal', function(e) {
            if (angular.element("#file_contrato_modal") != null && angular.element("#file_contrato_modal").scope != null) {
                $scope = angular.element("#file_contrato_modal").scope();
                vm = angular.element("#file_contrato_modal").scope().$ctrl;
            }
			if(e) {
				$scope.$apply();
				if(document.getElementById('file_contrato_modal').files != null && document.getElementById('file_contrato_modal').files.length > 0 != null){
					
                    for (var i = 0; i < document.getElementById('file_contrato_modal').files.length; i++) {
                    	var f = document.getElementById('file_contrato_modal').files[i];

						vm.nombreArchivoContrato = f.name;
						vm.archivo = null;

						var reader = new FileReader();
						reader.filename = f.name;
						
						reader.onload = function(readerEvt) {

							var base64 = reader.result.split("base64,")[1];
							var dsArchivo = "";

							var fileName = readerEvt.target.filename;
							fileName = fileName.split(".");
							if (fileName.length > 1) {
								fileName[0] = vm.appParent.changeSpecialCharacters(fileName[0]);
							}
							fileName = fileName.join('.');
							vm.nombreArchivoMov = fileName;

							vm.archivo =
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

    	this.loadTemplate = function() {
            return BASE_SRC + "detalle/detalles.views/detalle.proveedor.html";
		}
    	
	}    
    
    ng.module('App').component('proveedorSd', Object.create(ProveedorComponent));
    
})(window.angular);