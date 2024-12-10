(function (ng) {


    //Crear componente de busqeuda
    var busquedaRecibosComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$location', '$timeout', '$window', '$mdDialog', 'validacionesService', 'sharePropertiesService', 'uiGridConstants', 'BusquedaService', 'TiposService', 'PolizaService', 'ReciboService', 'BASE_SRC', 'ComisionService', 'ClienteService', 'DescargaService', '$templateCache', '$scope', '$translate', 'constantsTipos'],
        require: {
			appParent: '^sdApp',
            parent: '^busquedaApp'
        },
        bindings: {
        	idPoliza: '<',
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
			isClient: '<',
            isConsultagdpr: '<',
            detallesCliente: '<',
            cargarTablaRecibo: '<',
            datosPoliza: '<'
        }
    }

    busquedaRecibosComponent.controller = function busquedaRecibosComponentController($q, $location, $timeout, $window, $mdDialog, validacionesService, sharePropertiesService, uiGridConstants, BusquedaService, TiposService, PolizaService, ReciboService, BASE_SRC, ComisionService, ClienteService, DescargaService, $templateCache, $scope, $translate, constantsTipos) {
        var vm = this;
        var json = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
		vm.intoClientePoliza = false;
        vm.screenHeight = $window.innerHeight;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		var tarjeta = false;
		var templateVar = `<div class="ui-grid-cell-contents">
							<a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 100, 120)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'tomador\', row)">{{row.entity.OPAGADOR.NO_NOMBRE_COMPLETO}}</a>
							<span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 100, 120)">{{row.entity.OPAGADOR.NO_NOMBRE_COMPLETO}}</span>
						</div>`;
		vm.listProductosDescargablesMediador = {};
		vm.listProductosDescargablesCliente = {};

	        //no repetir tab, evita recursividad
//	        this.noRepeat = function(){
//	        	console.log("Funciona");
//	            templateVar = '<div  class="ui-grid-cell-contents"><p>{{row.entity.OPAGADOR.NO_NOMBRE_COMPLETO}}</p></div>';
//	            console.log(templateVar);
//	        }
//	    //
	        if(/clientes/.test(url)){
		        templateVar=null;
			}
		        
	        
//        $templateCache.put('ui-grid/selectionRowHeader',
//        	    "<div class=\"ui-grid-disable-selection\"><div class=\"ui-grid-cell-contents\"><ui-grid-selection-row-header-buttons></ui-grid-selection-row-header-buttons></div></div>"
//        	  );
        	  
        $templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-ok':true}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
        
      
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
			
			if (vm.parent.url == 'polizas') {
				vm.medida = 277;
            } else {
				if(vm.parent.url == 'clientes' && vm.idPoliza != null && vm.idPoliza != undefined){
					vm.medida = 286;
				} else {
					vm.medida = 248;
				}
            }		

            vm.active=0;
            vm.vista = 1;
            angular.forEach(vm.parent.pages, function (value, key) {
                vm[key] = value;
            });


            //Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('recibos_movimientos_list');
//				vm.parent.ckPermisos = vm.permisos;
				
				//Si no existen menús con ese código, se prueba con el otro
	    		if(vm.permisos.EXISTE == false && (/clientes_main/.test(url) || /polizas_list/.test(url) || /recibos_list/.test(url))){
	                vm.permisos = vm.parent.parent.getPermissions('recibos_list');
//	                vm.parent.ckPermisos = vm.permisos;
	    		}
    		}
            
            //Recuperar los datos de la busqueda general
            angular.forEach(vm.parent.compartir, function (value, key) {
                vm[key] = value;
            });

            //Cargar las listas
            if (/recibos/.test(url)) {
                if (vm.listBusqueda != undefined && vm.listBusqueda != "") {
                    /*var info = vm.parent.cargarBusqueda('polizas');
                    angular.forEach(info, function(value, key){
                        vm[key] = value;

                    });*/                    //vm.currentPage = localStorage.page != undefined ? localStorage.page : 1;
                    vm.gridRecibos.data = JSON.parse(vm.listBusqueda);
                    
                    //vm.gridDetalleRecibo.data = JSON.parse(vm.listBusqueda);

                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }

            if (/polizas/.test(url)) {
                vm.intoClientePoliza = true;
            }

            TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "DESCARGA_RECIBO_MEDIADOR" })
            .then(function successCallback(response) {
            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                    if (response.data.TIPOS.TIPO[0].DS_TIPOS != null) {
                        var list = response.data.TIPOS.TIPO[0].DS_TIPOS.split(";");
                        for (var i = 0; i < list.length; i++) {
                        	var productoMedioPago = list[i];
                        	var medioPago = "";
                        	var producto = productoMedioPago.split(":")[0];
                        	if (productoMedioPago.includes(":")) {
                        		producto = productoMedioPago.split(":")[0];
                        		medioPago = productoMedioPago.split(":")[1]
                        	}
                        	var obj = {
                    			produto: producto,
                    			listMedioPago: medioPago == "" ? [] : medioPago.split("-")
                        	}
                        	
                        	vm.listProductosDescargablesMediador[producto] = obj;
                        }
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

            TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "DESCARGA_RECIBO_CLIENTE" })
            .then(function successCallback(response) {
            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                    if (response.data.TIPOS.TIPO[0].DS_TIPOS != null) {
                        var list = response.data.TIPOS.TIPO[0].DS_TIPOS.split(";");
                        for (var i = 0; i < list.length; i++) {
                        	var productoMedioPago = list[i];
                        	var medioPago = "";
                        	var producto = productoMedioPago.split(":")[0];
                        	if (productoMedioPago.includes(":")) {
                        		producto = productoMedioPago.split(":")[0];
                        		medioPago = productoMedioPago.split(":")[1]
                        	}
                        	var obj = {
                    			produto: producto,
                    			listMedioPago: medioPago == "" ? [] : medioPago.split("-")
                        	}
                        	
                        	vm.listProductosDescargablesCliente[producto] = obj;
                        }
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }
        
        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
			var isClient = false;
            
            if(vm.isClient != undefined && vm.isClient == true){
            	isClient = true;
            }
            
            if (vm.gridRecibos.data == undefined || vm.gridRecibos.data == null || vm.gridRecibos.data != vm.listBusqueda.listas || Object.keys(vm.gridRecibos.data).length == 0 || /recibos/.test(url)) {
                if (vm.view == 4 && vm.listBusqueda.tipo == "recibos") {
					vm.tipo = 'recibosByCliente';
					vm.gridRecibos.data = vm.listBusqueda.listas;
                    vm.active = 0;
                    
                } else if (vm.view == 4 && vm.listBusqueda.tipo == "recibosByPoliza") {
					vm.tipo = 'recibosByPoliza';
                    //Se muestran diferentes columnas si la búsqueda del recibo es por el número de póliza 
                    vm.gridRecibos.columnDefs = [
						{
							field: 'NU_RECIBO',
                            displayName: $translate.instant('RECEIPT'),
							cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'remesa\', row)" ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</a><span ng-if="!grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</span></div>',
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                        },
                        {
							field: 'DS_SITUARECIBO',
							displayName: $translate.instant('STATUS'),
							cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'DS_TIPO_MEDIO_PAGO',
							displayName: $translate.instant('PAYMENT_METHOD'),
							cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'DS_TIPORECIBO',
							displayName: $translate.instant('RECEIPT_TYPE'),
							cellTooltip: function (row) { return row.entity.DS_TIPORECIBO },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'FD_EMISION',
							displayName: $translate.instant('DATE_ISSUANCE'),
							cellFilter: 'date:\'dd/MM/yyyy\'',
							cellTooltip: function (row) { return row.entity.FD_EMISION },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'FD_INICIO_REC',
							displayName: $translate.instant('DATE_INCEPTION'),
							cellFilter: 'date:\'dd/MM/yyyy\'',
							sort: { priority: 0, direction: 'asc'},
							cellTooltip: function (row) { return row.entity.FD_INICIO_REC },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'FD_VCTO_REC',
							displayName: $translate.instant('DATE_EXPIRATION'),
							cellFilter: 'date:\'dd/MM/yyyy\'',
							cellTooltip: function (row) { return row.entity.FD_VCTO_REC },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'IM_PRIMANETA',
							displayName: $translate.instant('NET_PREMIUM'),
							cellTooltip: function (row) { 
								return row.entity.IM_PRIMANETA 
							},
							cellFilter: "currency:'€' : 2",
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'IM_RECIBO_TOTAL',
							displayName: $translate.instant('TOTAL'),
							cellFilter: "currency:'€' : 2",
							cellTooltip: function (row) { 
								return row.entity.IM_RECIBO_TOTAL 
							},
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
						{
	                        field: 'menu',
	                        displayName: '',
	                        width: "3%",
	                        cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_RECIBO != null">
	    			                    	<md-menu>
	    			                			<md-button ng-click="$mdMenu.open()">
	    			                				<i class="fa-regular fa-ellipsis-vertical"></i>
	    		                				</md-button>
	    		                				<md-menu-content class="optionMenuContent">
	    			                				<md-menu-item ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA" ng-click="grid.appScope.$ctrl.openComisionista($event,row.entity, row)">
	    			                					<md-button>
	    			                						<span class="menuItemBlue">
	    			                							<i class="fa-sharp fa-solid fa-eye"></i>
	    			                							{{ 'SEE_COMMISSION_AGENTS' | translate }}
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    			                				<md-menu-item ng-click="grid.appScope.$ctrl.verDetalleRecibo(row.entity,\'recibo\', row)">
	    			                					<md-button>
	    			                						<span class="menuItemBlue">
	    			                							<i class="fa-sharp fa-solid fa-eye"></i>
	    			                							{{ 'SHOW_MOVEMENTS' | translate | uppercase }}
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null && grid.appScope.$ctrl.datosPoliza != null && grid.appScope.$ctrl.productosDescargables(grid.appScope.$ctrl.datosPoliza.ID_COMP_RAMO_PROD, row.entity, \'cliente\') == true" ng-click="grid.appScope.$ctrl.descargarRecibo(row.entity)">
	    			                					<md-button>
	    			                						<span class="menuItemYellow">
	    			                							<i class="fa-sharp fa-solid fa-download"></i>
	    			                							DESCARGAR RECIBO CLIENTE
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null && grid.appScope.$ctrl.datosPoliza != null && grid.appScope.$ctrl.productosDescargables(grid.appScope.$ctrl.datosPoliza.ID_COMP_RAMO_PROD, row.entity, \'mediador\') == true" ng-click="grid.appScope.$ctrl.downloadReceiptBroker(row.entity)">
	    			                					<md-button>
	    			                						<span class="menuItemYellow">
	    			                							<i class="fa-sharp fa-solid fa-download"></i>
	    			                							DESCARGAR RECIBO MEDIADOR
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    			                				<md-menu-item ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA == true && row.entity.NU_RECIBO != null && row.entity.ID_SITUARECIBO == 2 && grid.appScope.$ctrl.datosPoliza != null" ng-click="grid.appScope.$ctrl.generarExtorno(row.entity, true)">
	    			                					<md-button>
	    			                						<span class="menuItemRed">
	    			                							<i class="fa-sharp fa-solid fa-share-from-square"></i>
	    			                							GENERAR EXTORNO
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    	        							</md-menu-content>
	            							</md-menu>
	        							</div>`,
	                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
	                    }
                    ];
                    vm.gridRecibos.onRegisterApi = function (gridApi) {
                        vm.gridApi = gridApi;

						if(vm.permisos) {
							for(let i = 0; i < vm.gridRecibos.columnDefs.length; i++) {
								if(vm.gridRecibos.columnDefs[i].id == 'btnComisionistas' || vm.gridRecibos.columnDefs[i].id == 'btnEye' || vm.gridRecibos.columnDefs[i].id == 'btnGenerarExtorno') {
									vm.gridRecibos.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
								}
							}
						}

						vm.parent.translateHeaders(vm.gridRecibos);
                    }


                    vm.gridRecibos.data = vm.listBusqueda.listas;
                    vm.active = 0;
                }
                if (/recibos/.test(url) && vm.tipo != 'recibosByPoliza') {
					vm.tipo = 'recibos';
					vm.gridRecibos.treeRowHeaderAlwaysVisible = true;
					vm.gridRecibos.showGridFooter = true;
					vm.gridRecibos.gridFooterTemplate = '<div class="leyendaInferior">' +
															'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'recibos\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
															// '<div class="contenedorElemento"><span>Liquidados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
															// '<div class="contenedorElemento"><span>Cobrados</span><span class="elementoLeyenda leyendaVerde"></span></div>' +
															'<div class="contenedorElemento"><span>Anulados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
															'<div class="contenedorElemento"><span>Devueltos</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
															// '<div class="contenedorElemento"><span>Liquidado reaseguro</span><span class="elementoLeyenda leyendaAnil"></span></div>' +
															'<div class="contenedorElemento"><span>Bloqueados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
														'</div>';
					vm.gridRecibos.enableRowSelection = true;
					vm.gridRecibos.enableSelectAll = true;
					vm.gridRecibos.selectionRowHeaderWidth = 29;
					
                    //Se muestran diferentes columnas si la búsqueda del recibo es desde los movimientos
                    vm.gridRecibos.columnDefs = [
                        {
							field: 'OPOLIZA.NU_POLIZA',
							displayName: $translate.instant('POLICY_NU'),
							width: 125,
                        	grouping: { groupPriority: 0 },
							sort: { priority: 0, direction: 'asc' },
    	            		cellTooltip: function (row) { if(row.entity.OPOLIZA != undefined) return row.entity.OPOLIZA.NU_POLIZA },
    	            		headerCellTemplate: '<div class="ui-grid-cell-contents"></div>',
    	        			cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return 'dispNone ' + colorearEstado(row.entity); },
    	        			//treeAggregationLabel: ' nombre ',
    	            		//customTreeAggregationFinalizerFn: function( aggregation ){ aggregation.rendered = 'Póliza ' + aggregation.label + ' (' + aggregation.value + ')'; }
						},
                        {
							field: 'NU_RECIBO',
							displayName: $translate.instant('RECEIPT'),
	            			cellTooltip: function (row) { return row.entity.NU_RECIBO },
                            cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'remesa\', row)" ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</a><span ng-if="!grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</span></div>',
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'OPOLIZA.NU_POLIZA',
							displayName: $translate.instant('POLICY_NU'),
                        	cellTooltip: function (row) { return row.entity.OPOLIZA.NU_POLIZA },
                            cellTemplate: `<div class="ui-grid-cell-contents">
											<a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a>
											<span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)">{{row.entity.OPOLIZA.NU_POLIZA}}</span>
										</div>`,
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                            
                        {
							field: 'OPAGADOR.NO_NOMBRE_COMPLETO',
							displayName: $translate.instant('CLIENT'),
                        	cellTooltip: function (row) { return row.entity.OPAGADOR != null ? row.entity.OPAGADOR.NO_NOMBRE_COMPLETO : "" },
                            cellTemplate: (templateVar != null && isClient == false) ? templateVar : null,
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                            
                        {
							field: 'OPOLIZA.DS_TIPO_POLIZA',
							displayName: $translate.instant('PARTNER'),
                        	cellTooltip: function (row) { return (row.entity.OPOLIZA != undefined ? row.entity.OPOLIZA.DS_TIPO_POLIZA : '') },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                            
                        {
							field: 'DS_TIPO_MEDIO_PAGO',
							displayName: $translate.instant('PAYMENT_METHOD'),
                        	cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                            
                        {
							field: 'DS_SITUARECIBO',
							displayName: $translate.instant('STATUS'),
                        	cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'DS_TIPORECIBO',
							displayName: $translate.instant('RECEIPT_TYPE'),
							cellTooltip: function (row) { return row.entity.DS_TIPORECIBO },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        // {field: 'NO_COMPANIA', displayName: 'Aseguradora',
                        // 	cellTooltip: function (row) { return row.entity.NO_COMPANIA },
                        //     cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }},
                        {
							field: 'enviado_sap',
							displayName: $translate.instant('SENT_SAP'),
							cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'IM_RECIBO_TOTAL',
							displayName: $translate.instant('TOTAL'),
							cellFilter: "currency:'€' : 2",
							cellTooltip: function (row) { return row.entity.IM_RECIBO_TOTAL },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'FD_INICIO_REC',
							displayName: $translate.instant('DATE_START'),
							cellFilter: 'date:\'dd/MM/yyyy\'',
							sort: { priority: 0, direction: 'asc'},
                        	cellTooltip: function (row) { return row.entity.FD_INICIO_REC },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        // {
						// 	field: 'NO_USU_MOD',
						// 	displayName: $translate.instant('CREATED_BY'),
                        // 	cellTooltip: function (row) { return row.entity.NO_USU_MOD },
                        //     cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						// },
                        {
							field: 'FD_SAP',
							displayName: $translate.instant('DATE_ACCOUNTING'),
							cellFilter: 'date:\'dd/MM/yyyy\'',
                        	cellTooltip: function (row) { return row.entity.FD_SAP },
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
                        {
							field: 'ID_RECIBO_REMESA',
							displayName: $translate.instant('REMITTANCE'),
                        	cellTooltip: function (row) { return row.entity.ID_RECIBO_REMESA },
							cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
						{
							field: 'IN_ENVIO_LIQ_SAP',
							displayName: "Liquidado",
							cellTemplate: '<div style="text-align: center" ng-if="row.entity.IN_ENVIO_LIQ_SAP != undefined && row.entity.IN_ENVIO_LIQ_SAP == true" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
						{
							field: 'FD_LIQ_REA',
							displayName: $translate.instant('SETTLED_REA'),
							cellTemplate: '<div style="text-align: center" ng-if="row.entity.FD_LIQ_REA != null" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
                            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						},
						// {
						// 	field: 'Presuspendida', cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.ID_SITUAPOLIZA == 1 || row.entity.ID_ESTADO_INTERNO == 8"><span class="material-icons" style="color: #31577e">check</span></div>',
						// 	width: 36,
						// 	enableSorting: false, enableColumnMenu: false,
						// 	cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
						// },
						{
	                        field: 'menu',
	                        displayName: '',
	                        width: "3%",
	                        cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_RECIBO != null">
	    			                    	<md-menu>
	    			                			<md-button ng-click="$mdMenu.open()">
	    			                				<i class="fa-regular fa-ellipsis-vertical"></i>
	    		                				</md-button>
	    		                				<md-menu-content class="optionMenuContent">
	    			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null" ng-click="grid.appScope.$ctrl.openComisionista($event,row.entity, row)">
	    			                					<md-button>
	    			                						<span class="menuItemBlue">
	    			                							<i class="fa-sharp fa-solid fa-eye"></i>
	    			                							{{ 'SEE_COMMISSION_AGENTS' | translate }}
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null && row.entity.OPOLIZA != null && grid.appScope.$ctrl.productosDescargables(row.entity.OPOLIZA.ID_COMP_RAMO_PROD, row.entity, \'cliente\') == true" ng-click="grid.appScope.$ctrl.descargarRecibo(row.entity)">
	    			                					<md-button>
	    			                						<span class="menuItemYellow">
	    			                							<i class="fa-sharp fa-solid fa-download"></i>
	    			                							DESCARGAR
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
	    	        							</md-menu-content>
	            							</md-menu>
	        							</div>`,
	                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
	                    }
                    ];
                    
                    vm.gridRecibos.isRowSelectable = function(fila) {
                    	return true;
                    }
                    
                    vm.seleccionable = function(fila) {
                    	return true;
					}
                    
                    vm.gridRecibos.onRegisterApi = function (gridApi) {
                        vm.gridApi = gridApi;
                        vm.gridApi.grid.registerDataChangeCallback(function() {
                            vm.gridApi.treeBase.expandAllRows();
                        });
                        
                        vm.listaSeleccionados = [];
                        
                        gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
            	            vm.elementoSeleccionado = fila.entity;
            	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
            	        });
            	        gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
            	        	vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
            	        });

                        vm.parent.translateHeaders(vm.gridRecibos);
                    }
                    
                    if(vm.listBusqueda != undefined && Array.isArray(vm.listBusqueda)){
                    	vm.gridRecibos.data = vm.listBusqueda;
                    }else if(vm.listBusqueda != undefined && vm.listBusqueda.listas != undefined && Array.isArray(vm.listBusqueda.listas)){
                    	vm.gridRecibos.data = vm.listBusqueda.listas;
                    }
                    
					if(vm.permisos) {
						for(let i = 0; i < vm.gridRecibos.columnDefs.length; i++) {
							if(vm.gridRecibos.columnDefs[i].id == 'btnComisionistas') {
								vm.gridRecibos.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
							}
						}
					}

                    vm.active = 0;
                    
                }
            }
            else {
                vm.vista = 4;
                vm.active = 0;
			}
        }
								
        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridRecibos = {
            enableSorting: true,
            enableHorizontalScrollbar: 1,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            showGridFooter: true,
			gridFooterTemplate: '<div class="leyendaInferior">' +
									// '<div class="contenedorElemento"><span>Liquidados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
									// '<div class="contenedorElemento"><span>Cobrados</span><span class="elementoLeyenda leyendaVerde"></span></div>' +
									'<div class="contenedorElemento"><span>Anulados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
									'<div class="contenedorElemento"><span>Devueltos</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
									// '<div class="contenedorElemento"><span>Bloqueados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
									// '<div class="contenedorElemento"><span>Liquidado reaseguro</span><span class="elementoLeyenda leyendaAnil"></span></div>' +
								'</div>',
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'NU_RECIBO',
					displayName: $translate.instant('RECEIPT'),
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'remesa\', row)" ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</a><span ng-if="!grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</span></div>',
                    cellTooltip: function (row) { return row.entity.NU_RECIBO },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OPOLIZA.NU_POLIZA',
					displayName: $translate.instant('POLICY_NU'),
					cellTemplate: `<div class="ui-grid-cell-contents">
									<a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a>
									<span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)"></span>
								</div>`,
                    cellTooltip: function (row) { return row.entity.OPOLIZA.NU_POLIZA },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OPAGADOR.NO_NOMBRE_COMPLETO',
					displayName: $translate.instant('POLICY_HOLDER'),
                    cellTooltip: function (row) { return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO },
                   	// cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'tomador\', row)">{{row.entity.OPAGADOR.NO_NOMBRE_COMPLETO}}</a></div>',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_TIPO_MEDIO_PAGO',
					displayName: $translate.instant('PAYMENT_METHOD'),
                    cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_SITUARECIBO',
					displayName: $translate.instant('STATUS'),
                    cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
					field: 'DS_TIPORECIBO',
					displayName: $translate.instant('RECEIPT_TYPE'),
					cellTooltip: function (row) { return row.entity.DS_TIPORECIBO },
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
                // {
                //     field: 'NO_COMPANIA', displayName: 'Aseguradora',
                //     cellTooltip: function (row) { return row.entity.NO_COMPANIA },
                //     cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                // },
                {
                    field: 'IM_RECIBO_TOTAL',
					displayName: $translate.instant('TOTAL'),
					cellFilter: "currency:'€' : 2",
					cellTooltip: function (row) { return row.entity.IM_RECIBO_TOTAL },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FD_INICIO_REC',
					displayName: $translate.instant('DATE_START'),
					cellFilter: 'date:\'dd/MM/yyyy\'',
					sort: { priority: 0, direction: 'asc'},
                    cellTooltip: function (row) { return row.entity.FD_INICIO_REC },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                // {
                //     field: 'NO_USU_ALTA',
				// 	displayName: $translate.instant('CREATED_BY'),
                //     cellTooltip: function (row) { return row.entity.NO_USU_ALTA },
                //     cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                // },
				{
					field: 'IN_ENVIO_LIQ_SAP',
					displayName: "Liquidado",
					cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{
					field: 'FD_LIQUIDADO',
					displayName: $translate.instant('SETTLED_REA'),
					cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
					cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
				},
				{
                    field: 'menu',
                    displayName: '',
                    width: "3%",
                    cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_RECIBO != null">
			                    	<md-menu>
			                			<md-button ng-click="$mdMenu.open()">
			                				<i class="fa-regular fa-ellipsis-vertical"></i>
		                				</md-button>
		                				<md-menu-content class="optionMenuContent">
			                				<md-menu-item ng-click="grid.appScope.$ctrl.verDetalleRecibo(row.entity,\'recibo\', row)">
			                					<md-button>
			                						<span class="menuItemBlue">
			                							<i class="fa-sharp fa-solid fa-eye"></i>
			                							{{ 'SHOW_MOVEMENTS' | translate | uppercase }}
		                							</span>
		            							</md-button>
		        							</md-menu-item>
			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null && row.entity.OPOLIZA != null && (row.entity.OPOLIZA.ID_COMP_RAMO_PROD == 6 || row.entity.OPOLIZA.ID_COMP_RAMO_PROD == 7 || row.entity.OPOLIZA.ID_COMP_RAMO_PROD == 8)" ng-click="grid.appScope.$ctrl.descargarRecibo(row.entity)">
			                					<md-button>
			                						<span class="menuItemYellow">
			                							<i class="fa-sharp fa-solid fa-download"></i>
			                							DESCARGAR RECIBO CLIENTE
		                							</span>
		            							</md-button>
		        							</md-menu-item>
			                				<md-menu-item ng-if="row.entity.NU_RECIBO != null && row.entity.OPOLIZA != null && grid.appScope.$ctrl.productosDescargables(row.entity.OPOLIZA.ID_COMP_RAMO_PROD, row.entity, \'mediador\') == true" ng-click="grid.appScope.$ctrl.downloadReceiptBroker(row.entity)">
			                					<md-button>
			                						<span class="menuItemYellow">
			                							<i class="fa-sharp fa-solid fa-download"></i>
			                							DESCARGAR RECIBO MEDIADOR
		                							</span>
		            							</md-button>
		        							</md-menu-item>
	        							</md-menu-content>
        							</md-menu>
    							</div>`,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                }
            ]
        };

        vm.gridRecibos.onRegisterApi = function (gridApi) {
            vm.gridApi = gridApi;
			
			if(vm.isClient == true) {
				var columnsRemove = ["eliminarRecibo"];
				for (var i = 0; i < vm.gridRecibos.columnDefs.length; i++) {
					var column = vm.gridRecibos.columnDefs[i];
					if (columnsRemove.includes(column.id)) {
						vm.gridRecibos.columnDefs[i].visible = false;
					}
				}
			}

			if(vm.tipo == 'recibosByCliente' && vm.permisos) {
				for(let i = 0; i < vm.gridRecibos.columnDefs.length; i++) {
					if(vm.gridRecibos.columnDefs[i].id == 'btnEye')
						vm.gridRecibos.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
				}
			}

			vm.parent.translateHeaders(vm.gridRecibos);
        }


        function colorearEstado(entidad) {
            if (entidad.NU_RECIBO != null) {
            	// if (entidad.FD_LIQ_REA != null && entidad.FD_LIQUIDADO != null) {
                //     return 'filaAnil';
                // } else if (entidad.IN_ENVIO_LIQ_SAP == true) {
                //     return 'filaAmarilla';
                // } else 
				if (entidad.ID_SITUARECIBO == 3) {
                    return 'filaRoja';
                } else if (entidad.ID_SITUARECIBO == 6 || entidad.ID_SITUAPOLIZA == 4) {
                    return 'filaNaranja';
                } else if (entidad.IN_BLOQUEADO == true) {
                	return 'filaAmarilla';
            	}
            }
            else {
                return 'rowGroup';
            }
        }

        vm.verDetalleRecibo = function(fila, key, index){
        	
        	vm.fila = fila;
        	vm.key = key;
        	vm.index = index;
        	
        	$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/detalle_recibo.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.cargar = true;
                    md.permisos = vm.permisos;
                    
                    ReciboService.getRecibos({"ID_RECIBO":fila.ID_RECIBO, "IS_NEW":true})
    				.then(function successCallback(response) {
    					if(response.data.RECIBOS!=undefined)
    						md.gridDetalleRecibo.data = response.data.RECIBOS.RECIBO;
                        md.cargar = false;
    				}, function errorCallBack(response) {
    					md.cargar = false;
    				});
                    
                    md.seleccionable = function(fila) {
                        if(fila.NU_SAP != undefined || fila.NU_SAP != null)
                          return false;
                        else
                          return true;
                    }
                    
                    //UI.GRID Configurado
					md.gridDetalleRecibo = {
						enableSorting: true,
						enableHorizontalScrollbar: 0,
						paginationPageSizes: [15, 30, 50],
						paginationPageSize: 30,
						treeRowHeaderAlwaysVisible: true,
						showGridFooter: true,
						gridFooterTemplate: '<div class="leyendaInferior">' +
												'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'recibos\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
												// '<div class="contenedorElemento"><span>Liquidados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
												// '<div class="contenedorElemento"><span>Cobrados</span><span class="elementoLeyenda leyendaVerde"></span></div>' +
												'<div class="contenedorElemento"><span>Anulados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
												'<div class="contenedorElemento"><span>Devueltos</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
											//	'<div class="contenedorElemento"><span>Enviados a SAP</span><span class="elementoLeyenda ui-grid-icon-ok"></span></div>' +
												'<div class="contenedorElemento"><span>Bloqueados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
											'</div>',
						enableRowSelection: true,
						enableSelectAll: true,
						selectionRowHeaderWidth: 29,
						paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
						data: [],
						columnDefs: [
							{
								field: 'NU_RECIBO',
								displayName: $translate.instant('RECEIPT'),
								cellTooltip: function (row) { return row.entity.NU_RECIBO },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'DS_SITUARECIBO',
								displayName: $translate.instant('STATUS'),
								cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'DS_TIPO_MEDIO_PAGO',
								displayName: $translate.instant('PAYMENT_METHOD'),
								cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'FT_USU_ALTA',
								cellFilter: 'date:\'dd/MM/yyyy\'',
								displayName: $translate.instant('CREATED_ON'),
								cellTooltip: function (row) { return row.entity.FT_USU_ALTA },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'FD_SAP',
								cellFilter: 'date:\'dd/MM/yyyy\'',
								displayName: $translate.instant('DATE_ACCOUNTING'),
								cellTooltip: function (row) { return row.entity.FD_SAP },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'NU_SAP',
								width: '18%',
								displayName: $translate.instant('SAP_SHIPPING_NUMBER'),
								cellTooltip: function (row) { return row.entity.NU_SAP },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'IM_RECIBO_TOTAL',
								cellFilter: 'currency:"€" : 2',
								displayName: $translate.instant('TOTAL'),
								cellTooltip: function (row) { return row.entity.IM_RECIBO_TOTAL },
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'enviado_sap',
								displayName: $translate.instant('SENT_SAP'),
								cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'liquidado',
								displayName: "Liquidado",
								cellTemplate: '<div style="text-align: center" ng-if="row.entity.IN_ENVIO_LIQ_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							},
							{
								field: 'liquidado_reaseguro',
								displayName: $translate.instant('SETTLED_REA'),
								cellTemplate: '<div style="text-align: center" ng-if="row.entity.FD_LIQ_REA != null" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
								cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
							}
						]
//                                    {name: ' ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a>Bloquear</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }},
//                                    {name: '  ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a>Desbloquear</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }},
//                                    {name: '   ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a>Enviar a SAP</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }}],
							
					}
                	  
					md.gridDetalleRecibo.isRowSelectable = function(fila) {
						if(fila.entity.NU_SAP != undefined || fila.entity.NU_SAP != null) 
							return false;
						else
							return true;
					}
                	    
					md.gridDetalleRecibo.onRegisterApi = function (gridApi) {
						md.gridApi = gridApi;
						md.hola = md.gridDetalleRecibo.columnDefs[0];
						/*md.gridApi.grid.options.totalItems = md.gridApi.grid.options.data.length;
						md.gridOptions.totalItems = vm.gridApi.grid.options.data.length;
						md.gridApi.grid.registerDataChangeCallback(function() {
							md.gridApi.treeBase.expandAllRows();
						});*/
						
						md.listaSeleccionados = [];
						
						gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
							md.elementoSeleccionado = fila.entity;
							console.log("Recibo " + fila.entity.NU_RECIBO + " seleccionado: " + fila.isSelected);
							md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
							console.log(md.listaSeleccionados.length + ' elemento/s seleccionado/s')
						});
						gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
							md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
							console.log(md.listaSeleccionados.length + ' elemento/s seleccionado/s')
						});
						vm.parent.translateHeaders(md.gridDetalleRecibo);
					}
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                    md.bloquearRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != true){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/bloquear_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                    var mdm = this;
            		                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.bloqRecibo = function (option) {
            		                        if (option) {
            		                        	for(var i = 0; i < lista.length; i++){
            	                					if(lista[i].IN_BLOQUEADO == false){
            	                						lista[i] = {
        	                								ID_RECIBO: lista[i].ID_RECIBO,
        	                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
        	                								IN_BLOQUEADO: true,
        	                								IT_VERSION: lista[i].IT_VERSION
        		                						}
            	                					}
            	                				}
            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.bloqRecibo(obj)
            		                			.then(function successCallback(response) {
            		                				setTimeout(function(){ vm.recargarMovimientos(); }, 500);
//            		                				setTimeout(function(){ vm.abrirDialogo("Recibos bloqueados correctamente"); }, 1000);
            		                                }, function errorCallback(response) {
														msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
														$mdDialog.show(msg);
            		                                    if (response.status == 406) {
            		                                    	vm.parent.parent.logout();
            		                                    }
            		                                })
            		                        }
            		                        else
            		                            $mdDialog.cancel();
            		                    }
            		                }]
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén desbloqueados');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		
            		md.desbloquearRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != false){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/desbloquear_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                    var mdm = this;
            		                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.desbloqRecibo = function (option) {
            		                        if (option) {
            		                        	for(var i = 0; i < lista.length; i++){
            	                					if(lista[i].IN_BLOQUEADO == true){
            	                						lista[i] = {
        	                								ID_RECIBO: lista[i].ID_RECIBO,
        	                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
        	                								IN_BLOQUEADO: false,
        	                								IT_VERSION: lista[i].IT_VERSION
        		                						}
            	                					}
            	                				}
            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.bloqRecibo(obj)
            		                			.then(function successCallback(response) {
            		                				setTimeout(function(){ vm.recargarMovimientos(); }, 500);
//            		                				setTimeout(function(){ vm.abrirDialogo("Recibos desbloqueados correctamente"); }, 1000);
            		                                }, function errorCallback(response) {
														msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
														$mdDialog.show(msg);
            		                                    if (response.status == 406) {
            		                                        vm.parent.parent.logout();
            		                                    }
            		                                })
            		                        }
            		                        else
            		                            $mdDialog.cancel();
            		                    }
            		                }]
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén bloqueados');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		
            		md.cambiarFContRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				$mdDialog.show({
            	                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/cambiarfecha_recibo.modal.html',
            	                controllerAs: '$ctrl',
            	                clickOutsideToClose: true,
            	                parent: angular.element(document.body),
            	                fullscreen: false,
            	                controller: ['$mdDialog', function ($mdDialog) {
            	                	var mdm = this;
            	                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            	                    var obj = {};
            	                    var recibos = {};
            	                    
            	                    mdm.updateFDContab = function (option) {
										rellenarJSON(mdm.form);
            	                        if (option) {
            	                        	var nuevaFecha = mdm.form.FD_SAP;
            	                        	for(var i = 0; i < lista.length; i++){
            		        					// if(lista[i].FD_SAP != undefined){
            		        						lista[i] = {
                        								ID_RECIBO: lista[i].ID_RECIBO,
                        								ID_RECIBO_H: lista[i].ID_RECIBO_H,
                        								FD_SAP: nuevaFecha,
                        								IT_VERSION: lista[i].IT_VERSION
        	                						}
            		        					// }
                            				}
            	                        	obj['RECIBOS'] = {};
            	                        	obj['RECIBOS']['RECIBO'] = lista;
            	                        	$mdDialog.cancel();

                                			vm.appParent.abrirModalcargar(true);
            	                        	ReciboService.updateFDContab(obj)
            	                			.then(function successCallback(response) {
            	                				setTimeout(function(){ vm.recargarMovimientos(); }, 500);
//            	                				setTimeout(function(){ vm.abrirDialogo("Fecha de contabilización modificada correctamente"); }, 1000);
            	                                }, function errorCallback(response) {
													msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
													$mdDialog.show(msg);
            	                                    if (response.status == 406) {
            	                                    	vm.parent.parent.logout();
            	                                    }
            	                                })
            	                        }
            	                        else
            	                            $mdDialog.cancel();
            	                    }
            	                }]
            	            })
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		
            		md.liquidarRecibo = function(idTipo) {

            			var listRecibos = [];
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = true;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if (idTipo == 0) {
            						if(md.listaSeleccionados[i].IN_ENVIO_LIQ_SAP == true){
            							md.mostrar = false;
            						}
            					} else {
            						if(md.listaSeleccionados[i].FD_LIQ_REA != null && md.listaSeleccionados[i].FD_LIQUIDADO != null){
            							md.mostrar = false;
            						}
            					}
            					
                                listRecibos.push({ ID_RECIBO_H: md.listaSeleccionados[i].ID_RECIBO_H });
                            }
            				
            				if(md.mostrar != false) {
            					
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_observacion_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                	var re = this;
            		                	re.aceptar = function () {
            		                		re.cancel();
                                			vm.appParent.abrirModalcargar(true);
            		                		ReciboService.updateLiquidacionesRecibos(listRecibos, re.obs, idTipo, vm.parent.perfil)
            		            			.then(function successCallback(response) {
            		    						
            		            				if (response.data.ID_RESULT == 0) {
            		                				if (vm.parent.recargarListado != null) {
            		                    				vm.parent.recargarListado();
            		                				}
            		                				
            		    							msg.textContent("Se ha liquidado correctamente");
            		    							$mdDialog.show(msg);
            		            				} else {
            		    							msg.textContent(response.data.DS_RESULT);
            		    							$mdDialog.show(msg);
            		            				}
            		    							
            		                        }, function errorCallback(response) {
            		    						msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
            		    						$mdDialog.show(msg);
            		                            if (response.status == 406) {
            		                            	vm.parent.parent.logout();
            		                            }
            		                        })
            		                	}
            		                	
            		                	re.cancel = function() {
            	                	      $mdDialog.cancel();
            	                	    };
            		                }]
            		            })
            				}
            				else {
            					msg.textContent('Revise que los recibos seleccionados no estén liquidados');
            					$mdDialog.show(msg);
            				}
            			} else {
            				msg.textContent('No hay ningún recibo seleccionado');
            				$mdDialog.show(msg);
            			}
            		}
            		
            		md.enviarsapRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != true){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/enviarsap_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                	var mdm = this;
            		                    var lista = md.listaSeleccionados;
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.enviarSAP = function (option) {
            		                        if (option) {
            		                        	for(var i = 0; i < lista.length; i++){
            			        					if(lista[i].IN_BLOQUEADO == false){
            			        						if(lista[i].IN_ENVIO_LIQ_SAP == false){
                                                            lista[i].IN_ENVIO_LIQ_SAP = true;
//            			        							lista[i] = {
//        		                								ID_RECIBO: lista[i].ID_RECIBO,
//        		                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
//        		                								IN_ENVIO_LIQ_SAP: true,
//        		                								IT_VERSION: lista[i].IT_VERSION,
//        		                								NU_RECIBO: lista[i].NU_RECIBO
//        			                						}
            			        						}
            			        					}
            	                				}
            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.enviarSAP(obj)
            		                			.then(function successCallback(response) {
													if (response.data.ID_RESULT == 0) {
														msg.textContent(response.data.DS_RESULT);
														$mdDialog.show(msg);
														vm.recargarMovimientos();
													} else {
														msg.textContent(response.data.DS_RESULT);
														$mdDialog.show(msg);
													}
												}, function errorCallback(response) {
													msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
													$mdDialog.show(msg);
													if (response.status == 406) {
														vm.parent.parent.logout();
													}
												})
            		                        }
            		                        else
            		                            $mdDialog.cancel();
            		                    }
            		                }]
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
                }]				 
            });	
    	}

        //Eliminar Recibo
        vm.eliminarRecibo = function (fila) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_recibo.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    var jsonBorrar = {
                        "ID_RECIBO": fila.ID_RECIBO,
                        "IT_VERSION": fila.IT_VERSION
                    };
                    md.borrarRecibo = function (option) {
                        if (option) {
                            ReciboService.borrarRecibo(jsonBorrar)
                                .then(function successCallback(response) {
									
                                	var pGrid = vm.gridRecibos.data;
                                	var indx = pGrid.indexOf(fila);
									pGrid.splice(indx, 1);
									msg.textContent("Recibo borrado con éxito");
									$mdDialog.show(msg);
									
                                    var recibos = sharePropertiesService.get('recibos');
                                    recibos = _.remove(recibos, function (n) {
                                        n.ID_CLIENTE == vm.datos.ID_CLIENTE;
                                    })
									
									$mdDialog.cancel();
									
                                }, function errorCallback(response) {
                                    if (response.status == 406) {
                                        vm.parent.parent.logout();
                                    }
                                })
                        }
                        else
                            $mdDialog.cancel();
                    }
                }]
            })
        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
    			return BASE_SRC + "busqueda/busqueda.view/busqueda.recibo.html";
            } else {
                return "src/error/404.html";
            }
        }

        //Abrir modal de nuevo recibo
        vm.openNewRecibo = function () {
        	var existe = false;
        	for(var i = 0; i < vm.numDetalles.length; i++) {
        		if(vm.numDetalles[i] === null){
        			existe = true;
        			break;
        		}
        	}
        	if(!existe) {
				if(vm.numDetalles.length < 1) {
					vm.numDetalles.push(null);
					vm.nomDetalles.push('remesa');
					vm.active = vm.numDetalles.length +1;
					vm.actives = vm.numDetalles.length + 1;
					vm.cargarDetalle = false;
				} else {
					msg.textContent('Ya hay un detalle de recibo abierto');
					$mdDialog.show(msg);
				}
        	} else {
				msg.textContent('Hay un nuevo formulario de recibo abierto');
				$mdDialog.show(msg);
			}
        }

        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function(fila, key, index){
            if(key=='poliza'){
                PolizaService.getDetail(fila.OPOLIZA.ID_POLIZA)
                .then(function successCallback(response) {
                    vm.detallesPoliza = response.data;
                    vm.llave = 'poliza';
                    cargarDetalle(vm.detallesPoliza);
                }, function errorCallBack(response) {
                    
                });
            }else if(key=='tomador'){
                ClienteService.getCliente({"ID_CLIENTE":fila.OPAGADOR.ID_CLIENTE})
                .then(function successCallback(response) {
                    vm.detallesCliente = response.data;
                    vm.llave = 'tomador';
                    cargarDetalle(vm.detallesCliente);
                }, function errorCallBack(response) {
                    
                });
            }else{
                vm.llave = {};
                vm.llave = key;
                cargarDetalle(fila);
            }
            
        }


        //Abrir comisionista
      	vm.openComisionista = function(ev, row){
      		vm.row = row;
      		$mdDialog.show({
      			controller: ComisionistaController,
      			templateUrl: BASE_SRC+'detalle/detalle.modals/comisionista.modal.html',
      			controllerAs: '$ctrl',
      			clickOutsideToClose:true,
      			parent: angular.element(document.body),
      		    targetEvent: ev,
      		    fullscreen: false
      		})
      	}
      	function ComisionistaController($mdDialog) {
      		var md = this;
      		md.tipos = {};
      		md.selected = [];
      		md.comisionistas = [];
      		md.cargar = false;
      		md.vista = 0;
      		md.cargar = true;
      		md.permisos = vm.permisos;
	    	md.listaSeleccionados = [];
	    	
    		//UI.GRID Configurado
	    	md.gridComisionistas = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 15,
    		    columnDefs: [
    		    	{
						field: 'NO_COMPANIA',
						displayName: 'Colaborador',
						enableCellEdit: false
					},
					{
						field: 'NU_PORCENTAJE',
						displayName: '% Comisión',
						enableCellEdit: false
					},
					{
						field: 'NU_COMISION',
						displayName: 'Comisión',
						enableCellEdit: false
					},
					{
						field: 'NU_COMISION_EURO',
						displayName: 'Comisión (€)',
						enableCellEdit: false
					},
					{
						field: 'DS_TIPO_COMISION',
						displayName: 'Tipo comisión',
						enableCellEdit: false
					},
				], onRegisterApi: function( gridApi ) {
					    md.gridApi = gridApi;
		        		      
					    md.listaSeleccionados = [];
	                    
//	                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
//	                    	md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
//						});
//						gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
//							md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
//	        	        });
//	                    
//	                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
//	                    	md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
//	        	        });
	    		    	
		  	      		md.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
		  	      			  if(newValue != oldValue){
		  	      				  if(!rowEntity.IS_NEW)
		  	      					  rowEntity.IS_UPDATED = true;
		  	      			  }
		  	    		});
	      		    }
	    	}
      		
      		var idPoliza = null;
      		if (vm.idPoliza != null) {
      			idPoliza = vm.idPoliza;
      		} else if (vm.row != null && vm.row.OPOLIZA != null && vm.row.OPOLIZA.ID_POLIZA != null) {
                idPoliza = vm.row.OPOLIZA.ID_POLIZA;
      		}
      		
      		PolizaService.getHistoricoPoliza({"ID_POLIZA":idPoliza})
            .then(function successCallback(response) {
                md.detallesPoliza = response.data.POLIZAS.POLIZA[0];
            }, function errorCallBack(response) {
                
            });
      		
      		TiposService.getComisionista({})
      		.then(function successCallback(response){
      			md.tipos.comisionistas = response.data.TIPOS.TIPO;
      		});
      		
      		md.getComisionistasByRecibo = function () {
          		BusquedaService.buscar({'ID_RECIBO':vm.row.ID_RECIBO},'comisionistaByRecibo')
          		.then(function successCallback(response){
          			md.cargar = false;
          			if(response.data.NUMERO_COMISIONISTASRECIBO > 0){
          				md.vista = 0;
              			md.comisionistas = response.data.COMISIONISTASRECIBO.COMISIONISTARECIBO;
              			md.gridComisionistas.data = md.comisionistas;
          			}else
          				md.vista = 3;
          		})
      		}

      		md.getComisionistasByRecibo();
      		
      		md.colorearEstado = function (row) {
      			if (row.IS_DELETED == true) {
      				return 'filaRoja';
      			} else {
      				return 'rowGroup';
      			}
      		}
      		
      		md.toggle = function (item, list) {
      		    var idx = list.indexOf(item);
      		    if (idx > -1) {
      		      list.splice(idx, 1);
      		    }
      		    else {
      		      list.push(item);
      		    }
      		};
      		
      		md.exists = function (item, list) {
      		    return list.indexOf(item) > -1;
      		};
      		
      		md.isIndeterminate = function() {
      		    return (md.selected.length !== 0 &&
      		        md.selected.length !== md.comisionistas.length);
      		  };

      		md.isChecked = function() {
      			if(md.comisionistas != undefined)
      				return md.selected.length === md.comisionistas.length;
      		};

      		md.toggleAll = function() {
      		    if (md.selected.length === md.comisionistas.length) {
      		    	md.selected = [];
      		    } else if (md.selected.length === 0 || md.selected.length > 0) {
      		    	md.selected = md.comisionistas.slice(0);
      		    }
      		};
      		
      		
      		//Añadir nueva comisionista
      		md.addComisionista = function(){
      			if(md.comisionistas != undefined){
      				md.comisionista.ID_RECIBO = vm.row.ID_RECIBO;
      				md.comisionista['ID_COMP_RAMO_PROD'] = md.detallesPoliza.ID_COMP_RAMO_PROD;
      				md.comisionista['ID_TIPOCOLECTIVO'] = md.detallesPoliza.ID_TIPO_POLIZA;
      				md.comisionista.IS_NEW = true;
      				
      				if (md.comisionista.ID_COMPANIA != null) {
      				    md.comisionista.NO_COMPANIA = md.tipos.comisionistas.find(x => x.ID_COMPANIA == md.comisionista.ID_COMPANIA).NO_COMPANIA;
      				}
      				
      				md.comisionistas.push(JSON.parse(JSON.stringify(md.comisionista)));
      			}
      		}
      		
      		//Calcular comision
      		md.calcularComision = function(col){
      			col.NU_COMISION = (vm.row.IM_COMISION * col.NU_PORCENTAJE) / 100;
      			col.NU_COMISION_EURO = col.NU_COMISION;
      			//vm.datos.IM_COMISION
      		}
      		
      		md.eliminarComisionistas = function(){
      			if (md.listaSeleccionados != null && md.listaSeleccionados.length > 0) {
      				
      				//Modal de confirmación al eliminar comisionista
      				var confirm = $mdDialog.confirm().textContent('¿Estás seguro de eliminar los comisionistas seleccionados?').ariaLabel('Lucky day').ok('Aceptar').multiple(true).cancel('Cancelar');
	
	      		    $mdDialog.show(confirm).then(function () {
	      		      for (var i = 0; i < md.listaSeleccionados.length; i++) {
	      		      	var indexComisionistaEliminado = -1;
	      		      	if (md.listaSeleccionados[i].ID_COMISIONISTA_RECIBO != null) {
						    //Si ya estaba creado en BBDD buscamos por ID_COMISIONISTA_RECIBO
						    indexComisionistaEliminado = md.comisionistas.findIndex(x => x.ID_COMISIONISTA_RECIBO == md.listaSeleccionados[i].ID_COMISIONISTA_RECIBO);
	      		      	} else {
						    //Si aún no estaba creado en BBDD, buscamos por ID_COMPANIA
						    indexComisionistaEliminado = md.comisionistas.findIndex(x => x.ID_COMPANIA == md.listaSeleccionados[i].ID_COMPANIA);
	      		      	}
	      		      	
	      		      	//Añadimos el IS_DELETED a los comisionistas seleccionados
						if (indexComisionistaEliminado > -1) {
							md.comisionistas[indexComisionistaEliminado].IS_DELETED = true;
						}
	      		      }
	      		      
		      		    md.cargar = true;
		      			ComisionService.saveComisionistasRecibo({"COMISIONISTASRECIBO":{"COMISIONISTARECIBO":md.comisionistas}, "NUMERO_COMISIONISTASRECIBO":md.comisionistas.length})
		      			.then(function successCallback(response){
		      				if(response.status == 200){
		      					md.comisionistaGuardado = true;
		      		      		md.getComisionistasByRecibo();
	      						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('Se ha guardado correctamente').ok('Aceptar').multiple(true));
		      				}else{
		      					md.comisionistaGuardado = false;
								$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
		      				}
		      				md.cargar = false;
		      			},function errorCallback(response){
							md.cargar = false;
							$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
		      	        });
	      		    }, function () {
	      		    });
      			} else {
					msg.textContent("Debe seleccionar al menos un comisionista");
					$mdDialog.show(msg);
      			}
      		}
      		
      		 md.editarComisionista = function(comisionista, $index){
      			 if(!comisionista.IS_UPDATED && !comisionista.IS_DELETED)
      				 md.comisionistas[$index].IS_UPDATED = true;
      		 }
      		
      		//Guardar comisionistas
      		md.guardarComisionista = function(){
      			md.cargar = true;
      			ComisionService.saveComisionistasRecibo({"COMISIONISTASRECIBO":{"COMISIONISTARECIBO":md.comisionistas}, "NUMERO_COMISIONISTASRECIBO":md.comisionistas.length})
      			.then(function successCallback(response){
      				if(response.status == 200){
      					md.comisionistaGuardado = true;
      		      		md.getComisionistasByRecibo();
  						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('Se ha guardado correctamente').ok('Aceptar').multiple(true));
      				}else{
      					md.comisionistaGuardado = false;
  						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
      				}
      				md.cargar = false;
      			},function errorCallback(response){
					md.cargar = false;
					msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
					$mdDialog.show(msg);
      	        });
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
      	  }
        
        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }

        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila) {
            var existe = false;
			var dato = ''
			
            if(vm.llave == 'tomador'){
            	dato = 'ID_CLIENTE';
            } else if(vm.llave == 'poliza') {
            	dato = 'ID_POLIZA';
            } else if(vm.llave == 'remesa') {
            	dato = 'ID_RECIBO';
            }
            for(var i = 0; i < vm.numDetalles.length; i++) {
				if(vm.numDetalles[i] != null) {
					if(vm.numDetalles[i][dato] == fila[dato]) {
						existe = true;
						break;
					}
            	}
            }
            if (!existe) {
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
     			
            } else if (vm.numDetalles[0] == fila && vm.nomDetalles[0] == vm.llave) {
				vm.active = vm.numDetalles.length;
			} else {
				vm.numDetalles.splice(0, 1);
				vm.nomDetalles.splice(0, 1);

				vm.numDetalles.push(fila);
				vm.nomDetalles.push(vm.llave);
				vm.active = vm.numDetalles.length;
			}
        }
 		
		vm.bloquearRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == true || vm.listaSeleccionados[i].NU_SAP != undefined ){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/bloquear_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                    var md = this;
		                    var lista = JSON.parse(JSON.stringify(vm.listaSeleccionados));
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.bloqRecibo = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
	                					if(lista[i].IN_BLOQUEADO == false){
	                						lista[i] = {
                								ID_RECIBO: lista[i].ID_RECIBO,
                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
                								IN_BLOQUEADO: true,
                								IT_VERSION: lista[i].IT_VERSION
	                						}
	                					}
	                				}
		                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();

                        			vm.appParent.abrirModalcargar(true);
		                        	ReciboService.bloqRecibo(obj)
		                			.then(function successCallback(response) {
		                				
//		                				vm.abrirDialogo("Recibos bloqueados correctamente");
		                				vm.parent.recargarListado();
		                				setTimeout(function(){ 
											msg.textContent("Recibos bloqueados correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                    	vm.parent.parent.logout();
		                                    }
		                                })
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.desbloquearRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == false || vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/desbloquear_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                    var md = this;
		                    var lista = JSON.parse(JSON.stringify(vm.listaSeleccionados));
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.desbloqRecibo = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
	                					if(lista[i].IN_BLOQUEADO == true){
	    									lista[i] = {
                								ID_RECIBO: lista[i].ID_RECIBO,
                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
                								IN_BLOQUEADO: false,
                								IT_VERSION: lista[i].IT_VERSION
	                						}
	                					}
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	//	                        		recibos[i] = {'RECIBO':lista[i]};
	//                        		}
	//	                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();

                        			vm.appParent.abrirModalcargar(true);
		                        	ReciboService.bloqRecibo(obj)
		                			.then(function successCallback(response) {
		                				
//		                				vm.abrirDialogo("Recibos desbloqueados correctamente");
		                				vm.parent.recargarListado();
		                				setTimeout(function(){ 
											msg.textContent("Recibos desbloqueados correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                        vm.parent.parent.logout();
		                                    }
		                                })
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén bloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.cambiarFContRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
				
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/cambiarfecha_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var md = this;
		                    var lista = JSON.parse(JSON.stringify(vm.listaSeleccionados));
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.updateFDContab = function (option) {
								rellenarJSON(md.form);
		                        if (option) {
		                        	
		                        	var nuevaFecha = md.form.FD_SAP;
		                        		                        	
		                        	for(var i = 0; i < lista.length; i++){
			        					// if(lista[i].FD_SAP != undefined){
			        						lista[i] = {
                								ID_RECIBO: lista[i].ID_RECIBO,
                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
                								FD_SAP: nuevaFecha,
                								IT_VERSION: lista[i].IT_VERSION
	                						}
			        					// }
	                				}
		                        	
		                        	obj['RECIBOS'] = {};
		                        	obj['RECIBOS']['RECIBO'] = lista;
		                        	
		                        	$mdDialog.cancel();

                        			vm.appParent.abrirModalcargar(true);
		                        	ReciboService.updateFDContab(obj)
		                			.then(function successCallback(response) {
		                				
		                				vm.parent.recargarListado();
		                				setTimeout(function(){
											msg.textContent("Fecha de contabilización modificada correctamente");
											$mdDialog.show(msg);
										}, 2000);
											
		                                }, function errorCallback(response) {
											msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
											$mdDialog.show(msg);
		                                    if (response.status == 406) {
		                                    	vm.parent.parent.logout();
		                                    }
		                                })
		                        	
		                        }
		                        else
		                            $mdDialog.cancel();
		                    }
		                }]
		            })
				} else {
					msg.textContent('Revise que los recibos seleccionados no estén enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
        vm.exportarExcel = function () {
        	if (vm.comprobarObjetoExportar() == true) {
	            if(vm.parent.url == 'clientes'){
	                if(vm.view == 4 && vm.listBusqueda.tipo == 'recibos'){
	                    vm.parent.urlExport = 'recibos'; 
	                    vm.parent.form = {"OPAGADOR":{"ID_CLIENTE":vm.detallesCliente.ID_CLIENTE}};
	                }
	            } else {
                    if(vm.gridRecibos && vm.gridRecibos.data) {
                        if(!vm.checkDataExport(vm.gridRecibos.data))
                            return;
                    }
                }
	            vm.parent.exportarExcel();
        	} else {
                msg.textContent("Debes filtrar más la búsqueda para poder exportar a excel.");
                $mdDialog.show(msg);
        	}
        }
        
        vm.comprobarObjetoExportar = function () {
        	if ((vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == "") && (vm.parent.form.LST_ID_TIPO_POLIZA == null || vm.parent.form.LST_ID_TIPO_POLIZA.length == 0) && (vm.parent.form.LST_PRODUCTOS == null || vm.parent.form.LST_PRODUCTOS.length == 0) && (vm.parent.form.NU_RECIBO == null || vm.parent.form.NU_RECIBO == "") && (vm.parent.form.OPAGADOR == null || vm.parent.form.OPAGADOR.NU_DOCUMENTO == null || vm.parent.form.OPAGADOR.NU_DOCUMENTO == "")) {
        		return false;
        	} else {
        		return true;
        	}
        }

		vm.checkDataExport = function(data) {
			let inExport = true;
			if(data && data.length >= 1) {
				let products = JSON.parse(sessionStorage.perfil).productos;
				for(let i = 0; i < data.length; i++) {
					for(let j = 0; j < products.length; j++) {
						if(data[i].OPOLIZA.ID_COMP_RAMO_PROD == products[j].ID_PRODUCTO && !products[j].IN_EXPORTAR) {
							inExport = false;
							msg.textContent('Los productos seleccionados no pueden ser exportados');
							$mdDialog.show(msg);
							break;
						}
					}
					if(!inExport)
						break;
				}
			}
			return inExport;
		}
		
		vm.enviarsapRecibo = function() {
			
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				tarjeta = false;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_BLOQUEADO == true || vm.listaSeleccionados[i].NU_SAP != undefined){
						vm.mostrar = false;
					}
				}
				
				if(vm.mostrar != false) {
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/enviarsap_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var md = this;
		                    var lista = JSON.parse(JSON.stringify(vm.listaSeleccionados));
		                    var obj = {};
		                    var recibos = {};
		                    
		                    md.enviarSAP = function (option) {
		                        if (option) {
		                        	
		                        	for(var i = 0; i < lista.length; i++){
			        					if(lista[i].IN_BLOQUEADO == false){
			        						if(lista[i].IN_ENVIO_LIQ_SAP == false){
                                                lista[i].IN_ENVIO_LIQ_SAP = true;
//				        						lista[i] = {
//	                								ID_RECIBO: lista[i].ID_RECIBO,
//	                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
//	                								IN_ENVIO_LIQ_SAP: true,
//	                								IT_VERSION: lista[i].IT_VERSION,
//	                								NU_RECIBO: lista[i].NU_RECIBO
//		                						}
			        						}
			        					}
	                				}
		                        	
	//	                        	for (var i = 0; i < lista.length; i++) {
	//	                        		recibos[i] = {'RECIBO':lista[i]};
	//                        		}
		                        	
		                        	// for(var i = 0; i < lista.length; i++){
                                    //     if(lista[i].ID_TIPO_MEDIO_PAGO == 1){
                                    //         msg.textContent("No se pueden enviar recibos de pago con tarjeta de forma manual.");
                                    //         $mdDialog.show(msg);
                                    //         tarjeta = true;
                                    //     }
                                    // }        
                                    
                                    obj['RECIBOS'] = {};
                                    obj['RECIBOS']['RECIBO'] = lista;
                                    
                                    $mdDialog.cancel();
                                    if(tarjeta != true){

                            			vm.appParent.abrirModalcargar(true);
                                        ReciboService.enviarSAP(obj)
                                        .then(function successCallback(response) {
                                            if (response.status === 200) {
                                                if(response.data.ID_RESULT == 0){
                                                    vm.parent.recargarListado();
                                                    setTimeout(function(){ 
                                                        msg.textContent("Envio a SAP realizado correctamente");
                                                        $mdDialog.show(msg);
                                                    }, 2000);
                                                }else{
                                                    msg.textContent(response.data.DS_RESULT);
                                                    $mdDialog.show(msg);
                                                }
                                              }
                                            }, function errorCallback(response) {                                        
                                                msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
                                                $mdDialog.show(msg);
                                                if (response.status == 406) {
                                                    vm.parent.parent.logout();
                                                }
                                            });
                                    }
                                }else
                                    $mdDialog.cancel();
                            }
                        }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.liquidarRecibo = function(idTipo) {

			var listRecibos = [];
			if(vm.listaSeleccionados.length != 0) {
				
				vm.mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if (idTipo == 0) {
						if(vm.listaSeleccionados[i].IN_ENVIO_LIQ_SAP == true){
							vm.mostrar = false;
						}
					} else {
						if(vm.listaSeleccionados[i].FD_LIQ_REA != null && vm.listaSeleccionados[i].FD_LIQUIDADO != null){
							vm.mostrar = false;
						}
					}
                    listRecibos.push({ ID_RECIBO_H: vm.listaSeleccionados[i].ID_RECIBO_H });
				
				}
				
				if(vm.mostrar != false) {
					
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_observacion_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var md = this;
		                	md.aceptar = function () {
		                		md.cancel();
                    			vm.appParent.abrirModalcargar(true);
		                		ReciboService.updateLiquidacionesRecibos(listRecibos, md.obs, idTipo, vm.parent.perfil)
		            			.then(function successCallback(response) {
		    						
		            				if (response.data.ID_RESULT == 0) {
		                				if (vm.parent.recargarListado != null) {
		                    				vm.parent.recargarListado();
		                				}
		                				
		    							msg.textContent("Se ha liquidado correctamente");
		    							$mdDialog.show(msg);
		            				} else {
		    							msg.textContent(response.data.DS_RESULT);
		    							$mdDialog.show(msg);
		            				}
		    							
		                        }, function errorCallback(response) {
		    						msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
		    						$mdDialog.show(msg);
		                            if (response.status == 406) {
		                            	vm.parent.parent.logout();
		                            }
		                        })
		                	}
		                	
		                	md.cancel = function() {
	                	      $mdDialog.cancel();
	                	    };
		                }]
		            })
					
				}
				else {
					msg.textContent('Revise que los recibos seleccionados no estén liquidados');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}
		
		vm.recargarMovimientos = function(){
        	vm.verDetalleRecibo(vm.fila, vm.key, vm.index);
		}

		function rellenarJSON(form){
			angular.forEach(form, function(value, key){
				
				if(value.value instanceof Date){
					value=vm.appParent.dateFormat(value.value);
					form[key]=value;
				}
    		});
		}
		
		vm.descargarPDF = function(fila) {
    		// if(fila != undefined)
    		// 	DescargaService.descargarPresupuesto(vm.tarifas, datos.PRESUPUESTO);
			// else {
			// 	msg.textContent("No se dispone de ninguna tarifa para exportar el recibo");
			// 	$mdDialog.show(msg);
			// }
    	}
        
        vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 30;
            
            var totalItems = vm.gridRecibos.totalItems;
            if (totalItems > vm.gridRecibos.paginationPageSize) {
            	totalItems = vm.gridRecibos.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight + 20) + "px"
            };
        }
		
        vm.descargarRecibo = function (row) {
			vm.appParent.abrirModalcargar(true);
        	ReciboService.getPdfReciboByNuRecibo(row.NU_RECIBO)
			.then(function successCallback(response) {
				
				if(response.status==200){
					let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(response.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                    	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                    	if(objtMensajeUArchivo.ID_RESULT != 0) {
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						saveAs(new Blob([response.data]), row.NU_RECIBO + '.pdf');
						$mdDialog.cancel();
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar el pdf');
					$mdDialog.show(msg);
        		}
					
            }, function errorCallback(response) {
				msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
				$mdDialog.show(msg);
            })
        }

        vm.downloadReceiptBroker = function (row) {
			let idBroker = row.OPOLIZA.ID_MEDIADOR;
			if(vm.datosPoliza)
				idBroker = vm.datosPoliza.ID_MEDIADOR
			if(idBroker && row.NU_RECIBO) {
				vm.appParent.abrirModalcargar(true);
				ReciboService.getPdfReciboByIdBrokerAndNuRecibo(idBroker, row.NU_RECIBO)
				.then(function successCallback(response) {
					
					if(response.status==200){
						let utf8decoder = new TextDecoder();
						var mensajeUArchivo = utf8decoder.decode(response.data);
						if(mensajeUArchivo.search('ID_RESULT') != -1) {
							var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
							if(objtMensajeUArchivo.ID_RESULT != 0) {
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
							}
						} else {
							saveAs(new Blob([response.data]), row.NU_RECIBO + '.pdf');
							$mdDialog.cancel();
						}
					}else{
						msg.textContent('Se ha producido un error al descargar el pdf');
						$mdDialog.show(msg);
					}
						
				}, function errorCallback(response) {
					msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
					$mdDialog.show(msg);
				})
			}
        }
        
        vm.productosDescargables = function (producto, recibo, tipo) {
        	var listaProductos = tipo == "cliente" ? vm.listProductosDescargablesCliente : vm.listProductosDescargablesMediador;
        	
        	if (listaProductos[producto] != null && listaProductos[producto].listMedioPago != null && listaProductos[producto].listMedioPago.length == 0) {
        		return true;
        	} else if (listaProductos[producto] != null && listaProductos[producto].listMedioPago != null && listaProductos[producto].listMedioPago.length > 0 && listaProductos[producto].listMedioPago.includes(recibo.ID_TIPO_MEDIO_PAGO.toString())) {
        		return true;
        	} else {
        		return false;
        	}
        }
        
        vm.generarExtorno = function (recibo, confirmar) {
        	if (confirmar == true) {
    			var confirm = $mdDialog.confirm()
                .textContent("Se va a generar un extorno sobre el recibo " + recibo.NU_RECIBO + ", ¿está de acuerdo?")
	  			  .multiple(true)
	  			  .ariaLabel('Lucky day')
	  			  .ok('Aceptar')
	  			  .cancel('Cancelar');
	  			$mdDialog.show(confirm).then(function() {
	  				vm.generarExtorno(recibo, false);
	  			}, function() {
	//  				$mdDialog.hide(confirm);
	  			});
        	} else {
        		var obj = JSON.parse(JSON.stringify(recibo));
        		obj.ID_RECIBO = null;
        		obj.NU_RECIBO = null;
        		obj.ID_TIPORECIBO = 1;
        		obj.ID_SITUARECIBO = 4;
//        		obj.NU_RECIBO = "SDF";
        		var importesNegativos = ["IM_CLEA", "IM_CONSORCIO", "IM_COMISION", "IM_COMISION_EURO", "IM_IMPUESTOS", "IM_IMPUESTOS_TOTAL", "IM_PRIMANETA", "IM_PRIMANETA_EURO", "IM_PRIMA_TARIFA", "IM_RECIBO_TOTAL", "IM_RECIBO_TOTAL_EURO"];
        		for (var i = 0; i < importesNegativos.length; i++) {
        			if (obj[importesNegativos[i]] != null && obj[importesNegativos[i]] != 0) {
        				obj[importesNegativos[i]] = obj[importesNegativos[i]] * -1;
        			}
        		}

				if (vm.datosPoliza != null) {
					obj.OPOLIZA = JSON.parse(JSON.stringify(vm.datosPoliza));
					obj.ID_POLIZA = obj.OPOLIZA.ID_POLIZA;
				}

    			vm.appParent.abrirModalcargar(true);
        		ReciboService.guardarRecibo(obj)
        		.then(function successCallback(response) {
					if(response.status == 200) {
						if (response.data.ID_RESULT == 0){
							vm.appParent.cambiarDatosModal('Se ha generado correctamente');
//                        	vm.parent.recargarListado();
						} else {
                            msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                        }  
						
						if (vm.parent.url == "polizas" && vm.cargarTablaRecibo != null) {
							vm.cargarTablaRecibo('recibosByPoliza');
						}
					}
        		}, function errorCallback(response){
					vm.appParent.cambiarDatosModal('Ha ocurrido un error inesperado, por favor, póngase en contacto con el administrador.');
        		});
        	}
        }
    }

    ng.module('App').component('busquedaRecibo', Object.create(busquedaRecibosComponent));

})(window.angular);