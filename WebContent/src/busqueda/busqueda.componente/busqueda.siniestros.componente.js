(function(ng) {	

	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', '$mdDialog', '$scope', '$templateCache', '$translate', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'SiniestroService', 'PolizaService', 'BASE_SRC', 'TiposService', 'constantsTipos'],
    		require: {
				appParent: '^sdApp',
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
                isConsultagdpr: '<',
                idPoliza: '<',
                poliza: '<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window, $mdDialog, $scope, $templateCache, $translate, validacionesService, sharePropertiesService, BusquedaService, PolizaService, SiniestroService, BASE_SRC, TiposService, constantsTipos){
    	var vm=this;
    	vm.mensajeBuscar = true;
    	var url = $location.url();
    	vm.numDetalles = [];
    	vm.nomDetalles = [];
    	vm.cargarDetalle = [];
    	vm.intoCliente = false;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
    		vm.rol = $window.sessionStorage.rol;
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('siniestros_list');
//				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		//Cargar las listas
    		if(/siniestros/.test(url)){
    			if(localStorage.siniestros != undefined && localStorage.siniestros != ""){
    				vm.gridOptions.data = JSON.parse(localStorage.siniestros);
    				vm.vista = 4;
    			}
    			else{
    				localStorage.clear();
    			}
    		}
    		if(/clientes/.test(url)){
    			vm.intoCliente = true;
    			//console.log(vm.idCliente);
    		}

			if(($window.sessionStorage.rol == 2 || $window.sessionStorage.rol == 3 || $window.sessionStorage.rol == 5) && vm.gridOptions != null && vm.gridOptions.columnDefs != null) {
				for (var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
					if (vm.gridOptions.columnDefs[i].field == "Ver" || vm.gridOptions.columnDefs[i].field == "IM_INDEMNIZACION"|| vm.gridOptions.columnDefs[i].field == "IM_PAGO") {
                        vm.gridOptions.columnDefs[i].visible = false;
					}
				}
            }
			
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
    		if(vm.parent.url == 'siniestros')
            	vm.tipo = 'siniestros';
            else
            	vm.tipo = 'siniestrosBy';

    		if(vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /siniestros/.test(url)){
    			if(vm.view == 4 && vm.listBusqueda.tipo == "siniestros"){
	    			vm.gridOptions.data = vm.listBusqueda.listas;
	    			//vm.active = vm.dsActive;
	    			vm.active = 0;
	    		}
    			if(/siniestros/.test(url)){
    				vm.gridOptions.data = vm.listBusqueda;
	    			//vm.active = vm.dsActive;
    				vm.active = 0;
    			}
    		}
    		else{
    			vm.vista = 4;
    			vm.active = 0;
			}
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }
    	
    	//UI.GRID Configurado
    	vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			showGridFooter: true,
			gridFooterTemplate: '<div class="leyendaInferior">' +
									'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'siniestros\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
									'<div class="contenedorElemento"><span>{{ \'REJECTED\' | translate }}</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
									'<div class="contenedorElemento"><span>{{ \'CLOSED\' | translate }}</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
								'</div>',
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{field: 'NU_SINIESTRO', displayName: 'Siniestro', 
					cellTooltip: function(row){return row.entity.NU_SINIESTRO},
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'siniestro\', row)">{{row.entity.NU_SINIESTRO}}</a></div>',
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'OPOLIZA.NU_POLIZA', displayName: $translate.instant('POLICY_NU'),
					cellTooltip: function(row){return row.entity.OPOLIZA.NU_POLIZA},
				//   cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a></div>',
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'OPOLIZA.LST_ASEGURADOS[0].NO_NOMBRE_COMPLETO', displayName: 'Cliente', width: "13%",
					cellTooltip: function(row){return row.entity.OPOLIZA.LST_ASEGURADOS[0].NO_NOMBRE_COMPLETO},
				//   cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a></div>',
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'OPOLIZA.NO_PRODUCTO', displayName: $translate.instant('PRODUCT'),
					cellTooltip: function(row){return row.entity.OPOLIZA.NO_PRODUCTO},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'DS_ESTADO_SINIESTRO', displayName: $translate.instant('STATUS'),
					cellTooltip: function(row){return row.entity.DS_ESTADO_SINIESTRO},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'DS_SUBESTADO_SINIESTRO', displayName: $translate.instant('SUBSTATE'),
					cellTooltip: function(row){return row.entity.DS_SUBESTADO_SINIESTRO},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				// {field: 'NU_DIGITO', displayName: 'Nº Expediente',
				// 	cellTooltip: function(row){return row.entity.NU_DIGITO},
				// 	cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				// },
				// {field: 'OPOLIZA.NO_COMPANIA', displayName: 'Aseguradora',
				// 	cellTooltip: function(row){return row.entity.OPOLIZA.NO_COMPANIA},
				// 	cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				// },
				{field: 'FD_OCURRENCOMPANIA', displayName: 'Fecha Ocurrencia', cellFilter: 'date:\'dd/MM/yyyy\'',
					cellTooltip: function(row){return row.entity.FD_OCURRENCOMPANIA},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'FD_APERTURA', displayName: 'Fecha Apertura', cellFilter: 'date:\'dd/MM/yyyy\'',
					cellTooltip: function(row){return row.entity.FD_APERTURA},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'FD_TERMINACION', displayName: 'Fecha Cierre', cellFilter: 'date:\'dd/MM/yyyy\'',
					cellTooltip: function(row){return row.entity.FD_TERMINACION},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'IM_INDEMNIZACION', displayName: 'Indemnización',
					cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.IM_INDEMNIZACION != null ? grid.appScope.$ctrl.formatDecimal(row.entity.IM_INDEMNIZACION) : grid.appScope.$ctrl.formatDecimal(0)}}€</div>',
					cellTooltip: function(row){return row.entity.IM_INDEMNIZACION},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'IM_PAGO', displayName: 'Pago',
					cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.IM_PAGO != null ? grid.appScope.$ctrl.formatDecimal(row.entity.IM_PAGO) : grid.appScope.$ctrl.formatDecimal(0)}}€</div>',
					cellTooltip: function(row){return row.entity.IM_PAGO},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{field: 'IM_RESERVA', displayName: 'Reserva',
					cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.IM_RESERVA != null ? grid.appScope.$ctrl.formatDecimal(row.entity.IM_RESERVA) : grid.appScope.$ctrl.formatDecimal(0)}}€</div>',
					cellTooltip: function(row){return row.entity.IM_PAGO},
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{
					field: 'menu',
					displayName: '',
					width: "3%",
					cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_SINIESTRO != null">
									<md-menu>
										<md-button ng-click="$mdMenu.open()">
											<i class="fa-regular fa-ellipsis-vertical"></i>
										</md-button>
										<md-menu-content class="optionMenuContent">
											<md-menu-item ng-if="grid.appScope.$ctrl.rol != 2 && grid.appScope.$ctrl.rol != 3 && grid.appScope.$ctrl.rol != 5" ng-click="grid.appScope.$ctrl.verDetalleSiniestro(row.entity,\'siniestro\', row)">
												<md-button>
													<span class="menuItemBlue">
														<i class="fa-sharp fa-solid fa-eye"></i>
														{{ 'SHOW_MOVEMENTS' | translate | uppercase }}
													</span>
												</md-button>
											</md-menu-item>
											<md-menu-item ng-if="(row.entity.OPOLIZA.ID_PRODUCTO == 9 || row.entity.OPOLIZA.ID_PRODUCTO == 30) && row.entity.FD_ACEPTACION == null && row.entity.ID_ESTADO_SINIESTRO == 1 && grid.appScope.$ctrl.cargaValidaSiniestro !== 1" ng-click="grid.appScope.$ctrl.validarSiniestro(row.entity, 1)">
												<md-button>
													<span class="menuItemYellow">
														<i class="fa-sharp fa-solid fa-check"></i>
														APROBAR
													</span>
												</md-button>
											</md-menu-item>
											<md-menu-item ng-if="(row.entity.OPOLIZA.ID_PRODUCTO == 9 || row.entity.OPOLIZA.ID_PRODUCTO == 30) && row.entity.FD_ACEPTACION == null && row.entity.ID_ESTADO_SINIESTRO == 1 && grid.appScope.$ctrl.cargaValidaSiniestro !== 0" ng-click="grid.appScope.$ctrl.validarSiniestro(row.entity, 0)">
												<md-button>
													<span class="menuItemRed">
														<i class="fa-sharp fa-solid fa-xmark"></i>
														DENEGAR
													</span>
												</md-button>
											</md-menu-item>
										</md-menu-content>
									</md-menu>
								</div>`,
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
				//gridApi = gridApi.core.resfresh;
				//console.log(gridApi);
				
				vm.parent.translateHeaders(vm.gridOptions);
			}
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
    			return BASE_SRC+"busqueda/busqueda.view/busqueda.siniestros.html";
            } else {
                return "src/error/404.html";
            }
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	vm.openNewSiniestro = function() {
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i] === null){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe){
    			vm.numDetalles.push(null);
    			vm.active = vm.numDetalles.length;	    			
	    		vm.actives = vm.numDetalles.length+1;
	    		vm.cargarDetalle = false;	  
    		}
    		
    		
//    		if(!vm.numDetalles.includes(null)){
//    			vm.numDetalles.push(null);
//    			vm.active = vm.numDetalles.length;	    			
//	    		vm.actives = vm.numDetalles.length+1;
//	    		vm.cargarDetalle = false;	    			
//    		}
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
//    		if(!vm.numDetalles.includes(fila)){
//    			vm.numDetalles.push(fila);
//	    			vm.active = vm.numDetalles.length;
//    		}
    		if(key=='poliza'){
    			PolizaService.getPolizasByFilter({"ID_POLIZA":fila.OPOLIZA.ID_POLIZA})
                .then(function successCallback(response) {
                    vm.detallesPoliza = response.data.POLIZAS.POLIZA[0];
                    vm.llave = 'poliza';
                    cargarDetalle(fila);
                }, function errorCallBack(response) {
                    
                });
    		 } else if(key == 'documentacion'){
    			 if(fila.ID_ESTADO_SINIESTRO != 2 && fila.ID_ESTADO_SINIESTRO != 4 && fila.ID_ESTADO_SINIESTRO != 5){
    				vm.getDocuments(fila);
	             	$mdDialog.show({
	                     templateUrl: BASE_SRC + 'detalle/detalle.modals/subirDocumentacion.modal.html',
	                     controllerAs: '$ctrl',
	                     clickOutsideToClose: true,
	                     parent: angular.element(document.body),
	                     fullscreen: false,
	                     controller: ['$mdDialog', function ($mdDialog) {
	                         var md = this;
	                         md.fila = fila;
	                         md.vista = 0;
	                         md.listaArchivos = [];
	
	                       //meter desde lista padre los documentos recuperados
                             md.refreshList =  function() {    
                                 if(vm.parent.parent.archives_siniestros != null){
                                     for(var i = 0; i < vm.parent.parent.archives_siniestros.length; i++)  {
                                         if(!md.listaArchivos.find( archivo => archivo.ID_ARCHIVO === vm.parent.parent.archives_siniestros[i].ID_ARCHIVO)){
                                             md.listaArchivos.push(vm.parent.parent.archives_siniestros[i]);
                                         }else{
                                             break;
                                         }
                                     }
                                 }
                                for(var i = 0; i < vm.parent.parent.listArchivos.length; i++)  {
                                    md.listaArchivos.push(vm.parent.parent.listArchivos[i]);
                                    vm.parent.parent.listArchivos = [];
                                }
                             }
          
                           $(document).on('change', '#file_pol', function(e) {
                               if(e) {                                 
                                  md.idSiniestro = fila.ID_SINIESTRO;
                                  md.idPoliza = fila.OPOLIZA.ID_POLIZA;
                                  $scope.$apply();
                                  if(document.getElementById('file_pol').files[0] != null){
                                      var f = document.getElementById('file_pol').files[0];
                                      vm.parent.parent.getBase64(f, 229);
                                  }                                          
                               }
                          });
                              
                          md.uploadFiles = function(){
                              vm.parent.parent.uploadFiles(md.listaArchivos, 'siniestros', md.idSiniestro, md.idPoliza);
                          }
	                       md.deleteFile = function(file) {
	                           for(var i = 0; i < md.listaArchivos.length; i++){
	                               if(md.listaArchivos[i].NO_ARCHIVO === file.NO_ARCHIVO){
	                                   md.listaArchivos.splice(i, 1);
	                                   break;
	                               }
	                           }
	                           if(file.ESTADO === 'Guardado' && file.ID_ARCHIVO != null && file.ID_ARCHIVO != undefined){
                   				vm.parent.parent.deleteArchive(file.ID_ARCHIVO);
                   				md.listaArchivos.splice(i, 1);
                   				}
	                       }
                           md.hide = function () {
                               $mdDialog.hide();
                           };
                           md.cancel = function () {
                               $mdDialog.cancel();
                           };
                           md.answer = function (answer) {
                               $mdDialog.hide(answer);
                           };
                               }]
                           })
	    		 }else{
	      			msg.textContent('El estado del siniestro ya no permite adjuntar documentación.');
					$mdDialog.show(msg);
	     		 }
    		} else {
	    		vm.llave = {};
	            vm.llave = key;
	            cargarDetalle(fila);
        	}
    	}
    	
    	function cargarDetalle(fila){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(fila != undefined && vm.numDetalles[i] != null && vm.numDetalles[i].ID_SINIESTRO === fila.ID_SINIESTRO){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe){
    			
    			//Para intercambiar en la misma pestaña
     			if (vm.numDetalles.length > 0) {
     				vm.numDetalles = [];
     				vm.nomDetalles = [];
         			setTimeout( function () { 
     	    				vm.numDetalles.push(fila);
     	    				vm.nomDetalles.push(vm.llave);
     	    				vm.active = vm.numDetalles.length;
         				}, 
         			10);
     			} else {
     				vm.numDetalles.push(fila);
     				vm.nomDetalles.push(vm.llave);
     				vm.active = vm.numDetalles.length;
     			}
     			
//				if(vm.numDetalles < 1) {
//					vm.numDetalles.push(fila);
//					vm.nomDetalles.push(vm.llave);
//					vm.cargarDetalle = true;
//					vm.active = vm.numDetalles.length;
//				} else {
//					if (vm.nomDetalles[0] != vm.llave) {
//						
//						vm.numDetalles.splice(0, 1);
//						vm.nomDetalles.splice(0, 1);
//
//						vm.numDetalles.push(fila);
//						vm.nomDetalles.push(vm.llave);
//						vm.active = vm.numDetalles.length;
//					} else {
//						var tipo;
//						if(vm.llave == 'siniestro') {
//							tipo = 'siniestro'
//						} else if (vm.llave == 'poliza') {
//							tipo = 'póliza'
//						}
//						msg.textContent('Ya hay un detalle de ' + tipo + ' abierto');
//						$mdDialog.show(msg);
//					}
//				}
    		} else if (vm.numDetalles[0] == fila && vm.nomDetalles[0] == vm.llave) {
				vm.active = vm.numDetalles.length;
			} else {
				vm.numDetalles.splice(0, 1);
				vm.nomDetalles.splice(0, 1);

				vm.numDetalles.push(fila);
				vm.nomDetalles.push(vm.llave);
				vm.active = vm.numDetalles.length;
			}
    		
//    		if (!vm.numDetalles.includes(fila)) {
//                vm.numDetalles.push(fila);
//                vm.nomDetalles.push(vm.llave);
//                vm.cargarDetalle = true;
//                vm.active = vm.numDetalles.length;
//            }
    	}
    	
    	//Boton de cerrar tabs
//    	vm.cerrarTab = function(index){
//    		
//    		console.log(index);
//    		vm.numDetalles.splice(index,1);
//    		vm.nomDetalles.splice(index,1);
//    		vm.active = 0;
//    		console.log(vm.numDetalles);
//
//    	}
    	vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }
    	
    	function colorearEstado(entidad) {
            if (entidad.ID_ESTADO_SINIESTRO != null) {
                if (entidad.ID_ESTADO_SINIESTRO == 2)
                    return 'filaAmarilla';
                else if (entidad.ID_ESTADO_SINIESTRO == 5)
                    return 'filaRoja';
            }
            else
                return 'rowGroup';
		}

		vm.gridOptions.onRegisterApi = function(gridApi){
			vm.gridApi = gridApi;
			vm.parent.translateHeaders(vm.gridOptions);
			if(vm.permisos != undefined) {
				for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
					switch (vm.gridOptions.columnDefs[i].name) {
						case ' ':
						case '  ':
							vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
							break;
						default:
							break;
					}
				}
			}
		}

		vm.gestionarSiniestro = function(fila, opcion) {
			if(fila) {
				if(opcion == 'aprobar') {
					
				} else {

				}
			}
		}
		
        vm.exportarExcel = function (isSelected) {
        	if (vm.comprobarObjetoExportar() == true) {
	            if(vm.parent.url == 'clientes'){
	                if(vm.view == 4 && vm.listBusqueda.tipo == 'siniestros'){
	                    var idCliente = vm.parent.detalleCliente.OPOLIZA.LST_ASEGURADOS[0].ID_CLIENTE;
	                    vm.parent.urlExport = 'siniestros'; 
	                    vm.parent.form = {"OPOLIZA": {"LST_ASEGURADOS":[{"ID_CLIENTE":idCliente}]}};
	                }
	            }
	            
	            if (vm.parent.form != null) {
	            	vm.parent.form.IS_SELECTED = isSelected;
	            }
	            
	            vm.parent.exportarExcel();
        	} else {
                msg.textContent("Debes filtrar más la búsqueda para poder exportar a excel.");
                $mdDialog.show(msg);
        	}
        }
        
        vm.comprobarObjetoExportar = function () {
        	if ((vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.LST_ASEGURADOS == null || vm.parent.form.OPOLIZA.LST_ASEGURADOS.length == 0) && (vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.LST_ID_COMP_RAMO_PROD == null || vm.parent.form.OPOLIZA.LST_ID_COMP_RAMO_PROD.length == 0) && (vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.LST_ID_TIPO_POLIZA == null || vm.parent.form.OPOLIZA.LST_ID_TIPO_POLIZA.length == 0) && (vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == "") && (vm.parent.form.NU_SINIESTRO == null || vm.parent.form.NU_SINIESTRO == "")) {
        		return false;
        	} else {
        		return true;
        	}
        }
		
		vm.verDetalleSiniestro = function(fila, key, index){
			vm.fila = fila;
			vm.key = key;
			vm.index = index;

			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/detalle_siniestro.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.cargar=true;
					md.movEcon = [];

					md.seleccionable = function(fila){
						if(fila.NU_SINIESTRO != undefined || fila.NU_SINIESTRO != null) 
							return false;
						 else 
							return true;
					}
					
		    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPO_MOV})
		    		.then(function successCallback(response){
		    			if(response.status == 200){
		    				md.movEcon = response.data.TIPOS.TIPO;
		    			}
		    		});
					
					SiniestroService.getDetalleSiniestro({"ID_SINIESTRO": fila.ID_SINIESTRO})
						.then(function successCallback(response){
							if(response.status == 200){
								if(response.data.ID_RESULT !=0){
									msg.textContent(response.data.DS_RESULT);
									$mdDialog.show(msg);
								} else if(response.data.SINIESTROS != null && response.data.SINIESTROS.SINIESTRO != null && response.data.SINIESTROS.SINIESTRO[0] != null){
									if (response.data.NUMERO_SINIESTROS == 0 || response.data.SINIESTROS.SINIESTRO[0].LST_MOVS_ECONOMICOS == undefined) {
										msg.textContent('No existen movimientos económicos para este siniestro');
										$mdDialog.show(msg);	
										md.cargar = false;
									} else {
										md.gridDetalleSiniestro.data = response.data.SINIESTROS.SINIESTRO[0].LST_MOVS_ECONOMICOS;
										md.cargar = false;
									}
								}
							}
						}, function errorCallBack(response){
							md.cargar=false;
					});
					
					md.getDsTipoMov = function (coTipoMov) {
						var dsTipoMov = "";

						if (md.movEcon != null && md.movEcon.length > 0) {
							var objMov = md.movEcon.find(x => x.CO_TIPO == coTipoMov);

							if (objMov != null) {
								dsTipoMov = objMov.DS_TIPOS;
							}
						}

						return dsTipoMov;
					}

					//UI.GRID Configurado
					md.gridDetalleSiniestro = {
						enableSorting: true, 
						enableHorizontalScrollbar: 0,
						paginationPageSizes: [15, 30 , 50],
						paginationPageSize: 30, 
						treeRowHeaderAlwaysVisible: false,
						showGridFooter: true,
						gridFooterTemplate: '<div class="leyendaInferior">' + 
												'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'siniestros\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
												'<div class="contenedorElemento"><span>Cerrados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
												'<div class="contenedorElemento"><span>Rechazados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
											'</div>', 
						enableRowSelection: false,
						enableSelectAll: false, 
						selectionRowHeaderWidth: 29, 
						paginationTemplate:  BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
						data: [],
						columnDefs: [
							{field: 'NU_SINIESTRO', displayName: $translate.instant('CLAIM_NUMBER'), cellTooltip: function (row) {return row.entity.NU_SINIESTRO},  },
							{field: 'ID_MOV_ECOM', displayName: 'Id movimiento', cellTooltip: function (row) {return row.entity.ID_MOV_ECOM},  },
							{field: 'CO_TIPOMOV', displayName: $translate.instant('MOVEMENT_TYPE'), 
								cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDsTipoMov(row.entity.CO_TIPOMOV)}}</div>',
								cellTooltip: function (row) {
									return md.getDsTipoMov(row.entity.CO_TIPOMOV);
								}
							},
							{field: 'DS_PERCEPTOR', displayName: $translate.instant('SUPPLIER'), cellTooltip: function (row) {return row.entity.DS_PERCEPTOR},  },
//							{field: 'IM_BASE', displayName: 'Importe base', cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_BASE},  },
//							{field: 'IM_IVA', displayName: 'IVA', cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_IVA},  },
//							{field: 'IM_IRPF', displayName: 'IRPF', cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_IRPF},  },
							{field: 'IM_TOTAL', displayName: $translate.instant('TOTAL'), 
								cellTemplate: '<div ng-if="row.entity.IM_TOTAL != null && row.entity.IM_TOTAL != 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_TOTAL)}} €</div><div ng-if="row.entity.IM_TOTAL == null || row.entity.IM_TOTAL == 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_BASE)}} €</div>',
								cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_TOTAL},  },
							{field: 'FT_MOV', displayName: $translate.instant('DATE_MOVEMENT'), cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_MOV}},
							{field: 'NU_SAP', displayName: $translate.instant('SENT_SAP'), 
								cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
								cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_MOV},
//							{field: 'DS_PERCEPTOR', displayName: 'Perceptor', cellTooltip: function (row) {return row.entity.DS_PERCEPTOR},  },
//							{field: 'CO_TIPOMOV', displayName: 'Movimiento', cellTooltip: function (row) {
//								if(row.entity.CO_TIPOMOV === "1"){
//									return "Pago";
//								} else
//									return "Reserva";
//								},  },
//							{field: 'FT_MOV', displayName: 'Fecha Movimiento', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_MOV},  },
//							{field: 'IM_BASE', displayName: 'Importe Movimiento', cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_BASE},  },
//							{field: 'ID_FPAGO', displayName: 'Forma de Pago', cellTooltip: function (row) {return row.entity.ID_FPAGO},  },
//							{field: 'ID_SITPAGO', displayName: 'Situación Pago', cellTooltip: function (row) {return row.entity.ID_SITPAGO},  }
						  }
						],
					}

					md.gridDetalleSiniestro.isRowSelectable = function(fila) {
						if(fila.entity.NU_SINIESTRO != undefined || fila.entity.NU_SINIESTRO != null)
							return false;
						else
							return true;
					}
					
					md.beautifyImporte = function (x) {
						if (typeof x === "string") {
				            if (isNaN(parseFloat(x)) === false) {
				                x = x.replace(",", ".");
				            }
				        }

				        if (x == undefined || x == '' || isNaN(x) === true) {
				            x = 0;
				        }

				        if (typeof x === 'string') {
				            x = parseFloat(x);
				        }
				        x = x.toFixed(2);

				        var parts = x.toString().split(".");
				        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
				        return parts.join(",");
					}

					md.gridDetalleSiniestro.onRegisterApi = function (gridApi){
						md.gridApi= gridApi;
						md.register=md.gridDetalleSiniestro.columnDefs[0];

						// md.listaSeleccionados = [];

						// gridApi.selection.on.rowSelectionChanged($scope, function(fila){
						// 	md.elementoSeleccionado = fila.entity;
						// 	md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
						// });
						// md.gridApi.selection.on.rowSelectionChangedBatch($scope, function(filas){
						// 	md.listaSeleccionados = md.gridApi.selection.getSelecteRows();
						// });
					}

					md.cancel = function(){
						$mdDialog.cancel();
					};

				}]
			});
		}
        
        vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 30;
            
            var totalItems = vm.gridOptions.totalItems;
            if (totalItems > vm.gridOptions.paginationPageSize) {
            	totalItems = vm.gridOptions.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight) + "px"
            };
        }

        vm.validarSiniestro = function(row, tipo) {
        	var objValida = {
    			"idSiniestro": row.ID_SINIESTRO,
    			"aprobado": tipo.toString(),
    			"checkOnSystem": "1"
    		}
        	vm.cargaValidaSiniestro = tipo;
        	vm.cargaValidaSiniestroID = row.ID_SINIESTRO;
        	vm.parent.parent.abrirModalcargar(true);
        	SiniestroService.validaSiniestroMascota(objValida)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.code !=0){
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					} else {
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
						vm.parent.recargarListado();
					}
				}
	        	vm.cargaValidaSiniestro = false;
	        	vm.cargaValidaSiniestroID = null;
			}, function errorCallBack(response){
				msg.textContent("Ha ocurrido un error al realizar la operación");
	        	vm.cargaValidaSiniestro = false;
	        	vm.cargaValidaSiniestroID = null;
			});
        }
        
      //recuperar documentación ya subida (desde padre)
        vm.getDocuments = function(fila){
          var idPoliza = fila.ID_POLIZA;
            var idSiniestro = fila.ID_SINIESTRO;
            var ruta = 'polizas\\'+ idPoliza + '\\siniestros\\' + idSiniestro;
                
            vm.parent.parent.getDocuments(ruta, 229);
        }	
		
		vm.formatDecimal = function (x) {
			if (typeof x === "string") {
	            if (isNaN(parseFloat(x)) === false) {
	                x = x.replace(",", ".");
	            }
	        }

	        if (x == undefined || x == '' || isNaN(x) === true) {
	            x = 0;
	        }

	        if (typeof x === 'string') {
	            x = parseFloat(x);
	        }
	        x = x.toFixed(2);

	        var parts = x.toString().split(".");
	        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	        return parts.join(",");
		}	
    }

    
    ng.module('App').component('busquedaSiniestro', Object.create(busquedaComponent));
    
})(window.angular);