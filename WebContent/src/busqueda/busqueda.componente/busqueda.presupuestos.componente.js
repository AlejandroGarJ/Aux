(function (ng) {


    //Crear componente de busqeuda
    var busquedaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$rootScope', '$scope', '$location', '$timeout', '$interval', '$window', '$mdDialog', '$translate', 'CommonUtils', 'EmpresaService', 'TiposService', 'BusquedaService', 'BASE_SRC', 'PresupuestoService', 'PolizaService', 'ClienteService', 'DescargaService', 'i18nService'],
        require: {
            parent: '^busquedaApp',
            clienteSd: '^?clienteSd'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            detalles: '<',
            isConsultagdpr: '<',
            detallesCliente: '<'
        }
    }

    busquedaComponent.controller = function busquedaComponentController($rootScope, $scope, $location, $timeout, $interval, $window, $mdDialog, $translate, CommonUtils, EmpresaService, TiposService, BusquedaService, BASE_SRC, PresupuestoService, PolizaService, ClienteService, DescargaService, i18nService) {
        var vm = this;
        var json = {};
        vm.llave = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        vm.intoCliente = false;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
        vm.isAdhoc = false;

        // vm.totalAgrupaciones = 0;
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active=0;
            vm.vista = 1;

            //Cargar las listas
            // if (/presupuestos/.test(url)) {
            //     if (vm.listBusqueda.presupuestos != undefined && vm.listBusqueda.presupuestos != "") {
            //         vm.gridOptions.data = JSON.parse(vm.listBusqueda.presupuestos);
            //         vm.vista = 4;
            //     } else {
            //         vm.listBusqueda = [];
            //     }
            // }
            
            //Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
                vm.permisos = vm.parent.parent.getPermissions('presupuestos_list');
            //    vm.parent.ckPermisos = vm.permisos;
    		}
    		
            if (/clientes/.test(url)) {
                vm.intoCliente = true;
            }
            
            // if(vm.permisos != undefined){
            // 	// vm.gridOptions.columnDefs[14].visible = vm.permisos.IN_ESCRITURA;
            // 	vm.gridOptions.columnDefs[13].visible = vm.permisos.IN_ESCRITURA;
            // 	vm.gridOptions.columnDefs[12].visible = vm.permisos.IN_ESCRITURA;
            // }
        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
            if(vm.parent.url == 'presupuestos')
            	vm.tipo = 'presupuestos';
            else
            	vm.tipo = 'presupuestosBy';
            
            if (vm.gridOptions.data == "undefined" || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /presupuestos/.test(url)) {
                if (vm.view == 4 && vm.listBusqueda.tipo == "presupuestos") {
                    vm.gridOptions.data = vm.listBusqueda.listas;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
                if (/presupuestos/.test(url)) {
                    vm.gridOptions.data = vm.listBusqueda;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
            } else {
                vm.vista = 4;
                vm.active = 0;
            }
        }

        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: true,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
            // gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
            // 						'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'presupuestos\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
        	// 					'</div>',
            gridFooterTemplate: `<div class="leyendaInferior">
                                    <div class="contenedorElemento">
                                        <a ng-if="grid.appScope.$ctrl.parent.url == \'presupuestos\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()">
                                        <md-icon>autorenew</md-icon></a>
                                    </div>
                                    <div ng-if="grid.appScope.$ctrl.parent.isAdhoc == false">
	                                    <div class="contenedorElemento">
	                                        <span>Editable</span><span class="elementoLeyenda row-edit"></span>
	                                    </div>
	                                    <div class="contenedorElemento">
	                                        <span>Contratable</span><span class="elementoLeyenda row-contract"></span>
	                                    </div>
	                                    <div class="contenedorElemento">
	                                        <span>Vencido</span><span class="elementoLeyenda row-expired"></span>
	                                    </div>
	                                 </div>
	                                 <div ng-if="grid.appScope.$ctrl.parent.isAdhoc == true">
	                                    <div class="contenedorElemento">
	                                        <span>Aviso Rea</span><span class="elementoLeyenda leyendaNaranja"></span>
	                                    </div>
	                                    <div class="contenedorElemento">
	                                        <span>Estado Crítico Rea</span><span class="elementoLeyenda leyendaRojo"></span>
	                                    </div>
	                                 </div>
                                </div>`,
        	paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		data: [],
            columnDefs: [
                {
                    field: 'NO_RAMO',
                    displayName: $translate.instant('BRANCH'), width: '10%',
                    grouping: {
                        groupPriority: 0
                    },
                    sort: {
                        priority: 0,
                        direction: 'asc'
                    },
                    cellTooltip: function (row, vm) {
                        return row.entity.NO_RAMO
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'ID_PRESUPUESTO',
                    displayName: 'Presupuesto',width:'5%',
                    cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'resumen\', row)">{{row.entity.ID_PRESUPUESTO}}</a></div>',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OCLIENTE.NO_NOMBRE_COMPLETO',
                    displayName: $translate.instant('CLIENT'),width: '14%',
                    // cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'clientes\', row)">{{row.entity.OCLIENTE.NO_NOMBRE_COMPLETO}}</a></div>',
                    cellTooltip: function (row) {
                        if (row.entity.OCLIENTE != undefined)
                            return row.entity.OCLIENTE.NO_NOMBRE_COMPLETO;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_TIPO_COLECTIVO',
                    displayName: $translate.instant('PARTNER'),width: '11%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_TIPO_COLECTIVO;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_ESTADO_PRESUPUESTO',
                    displayName: $translate.instant('STATUS'),
                    width: '8%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_ESTADO_PRESUPUESTO;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FD_EMISION',
                    displayName: $translate.instant('DATE_ISSUANCE'),
                    width: '6%',
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.FD_EMISION;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OPOLIZA.NU_POLIZA',
                    displayName: 'Poliza',width: '6%',
                    cellTemplate: `<div class="ui-grid-cell-contents">
                                    <a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'cliente\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a>
                                    <span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)">{{row.entity.OPOLIZA.NU_POLIZA}}</span>
                                </div>`,
                    cellTooltip: function (row) {
                        if (row.entity.OPOLIZA != undefined)
                            return row.entity.OPOLIZA.NU_POLIZA;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OPOLIZA.IM_PRIMA_TOTAL',
                    displayName: $translate.instant('TOTAL'),width: '7%',
                    cellTooltip: function (row) {
                        if (row.entity.OPOLIZA != undefined)
                            return row.entity.OPOLIZA.IM_PRIMA_TOTAL;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_SOURCE_ALTA',
                    displayName: $translate.instant('CHANNEL_2'),
                    width: '6%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_SOURCE_ALTA;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'NO_USU_ALTA',
                    displayName: $translate.instant('CREATED_BY'),width: '8%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.NO_USU_ALTA;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FT_USU_ALTA',
                    displayName: $translate.instant('CREATED_ON'),
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    width: '7%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.FT_USU_ALTA;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FT_USU_MOD',
                    displayName: $translate.instant('EDITED_ON'),
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    width: '7%',
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.FT_USU_MOD;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'menu',
                    displayName: '',
                    cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.ID_PRESUPUESTO != null">
                                    <md-menu>
                                        <md-button ng-click="$mdMenu.open()">
                                            <i class="fa-regular fa-ellipsis-vertical"></i>
                                        </md-button>
                                        <md-menu-content class="table-menu">
                                           <md-menu-item ng-if="row.entity.IN_EMITIDO == 0 && row.entity.ID_RAMO != 103" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'presupuesto\', row)">
                                                <md-button ng-disabled="row.entity.ID_RAMO == 20 && row.entity.IS_CONDICIONADO"
                                                ng-if="row.entity.ID_RAMO != 103">
                                                    <span class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-pen"></i>
                                                        {{ 'EDIT' | translate }}
                                                    </span>
                                                </md-button>
                                            </md-menu-item> 
                                            <md-menu-item ng-if="row.entity.IN_EMITIDO == 0 && row.entity.ID_RAMO == 103 && row.entity.OPOLIZA.IM_PRIMA_TOTAL != undefined" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'presupuesto\', row)">
                                                <md-button ng-disabled="row.entity.ID_RAMO == 20 && !row.entity.IS_CONDICIONADO">
                                                    <span class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-pen"></i>
                                                        CONTRATAR
                                                    </span>
                                                </md-button>
                                            </md-menu-item> 
                                            <md-menu-item ng-if="row.entity.IN_EMITIDO == 0 && row.entity.ID_RAMO != 103" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'contratar\', row)">
                                                <md-button ng-disabled="row.entity.ID_RAMO == 20 && row.entity.IS_CONDICIONADO">
                                                    <span class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-pen-to-square"></i>
                                                        CONTRATAR
                                                    </span>
                                                </md-button>
                                            </md-menu-item>
                                            <md-menu-item ng-if="row.entity.ID_RAMO == 103 && row.entity.OPOLIZA.IM_PRIMA_TOTAL != undefined" ng-disabled="grid.appScope.$ctrl.loadDescarga == true" ng-click="grid.appScope.$ctrl.descargarPresu(row.entity, false)">
                                                <md-button>
                                                    <span ng-if="grid.appScope.$ctrl.loadDescarga != true || grid.appScope.$ctrl.loadDescargaId != row.entity.ID_PRESUPUESTO" class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-download"></i>
                                                        DESCARGAR
                                                    </span>
                                                    <div ng-if="grid.appScope.$ctrl.loadDescarga == true && grid.appScope.$ctrl.loadDescargaId == row.entity.ID_PRESUPUESTO" class="spinner"></div>
                                                </md-button>
                                            </md-menu-item>
                                            <md-menu-item ng-if="row.entity.ID_RAMO == 103 && row.entity.OPOLIZA.IM_PRIMA_TOTAL != undefined" ng-disabled="grid.appScope.$ctrl.loadEnvio == true" ng-click="grid.appScope.$ctrl.descargarPresu(row.entity, true)">
                                                <md-button>
                                                    <span ng-if="grid.appScope.$ctrl.loadEnvio != true || grid.appScope.$ctrl.loadDescargaId != row.entity.ID_PRESUPUESTO" class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-paper-plane-top"></i>
                                                        ENVIAR PRESUPUESTO
                                                    </span>
                                                    <div ng-if="grid.appScope.$ctrl.loadEnvio == true && grid.appScope.$ctrl.loadDescargaId == row.entity.ID_PRESUPUESTO" class="spinner"></div>
                                                </md-button>
                                            </md-menu-item>
                                            <md-menu-item ng-if="row.entity.IN_EMITIDO==0 && row.entity.ID_RAMO==103" ng-click="grid.appScope.$ctrl.nuevoPresuApartirExistente(row)">
                                                <md-button>
                                                    <span class="menuItemCheckBundlePO">
                                                        <i class="fa-sharp fa-solid fa-plus"></i>
                                                        NUEVO PRESUPUESTO A PARTIR DE ESTE
                                                    </span>
                                                </md-button>
                                            </md-menu-item>
                                            <md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnOpciones(row.entity) == false">
                                                <span class="menuItemCheckBundlePO">
                                                    NO HAY OPCIONES
                                                </span>
                                            </md-menu-item>
                                        </md-menu-content>
                                    </md-menu>
                                </div>`
                }
            ],
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                vm.gridApi.grid.registerDataChangeCallback(function() {
                    vm.gridApi.treeBase.expandAllRows();
//                    var totalAgrupaciones = Object.keys(vm.gridApi.grid.grouping.groupingHeaderCache).length;
//                    vm.totalAgrupaciones = totalAgrupaciones;
                    //console.log('Num agrupaciones - ' + vm.totalAgrupaciones);
                });

                if(vm.permisos != undefined) {
                    for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
                        switch (vm.gridOptions.columnDefs[i].name) {
                            case ' ':
                            case '  ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
                                break;
                            case '   ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_EXPORTAR;
                                    break;
                            default:
                                break;
                        }
                    }
                }
                vm.parent.translateHeaders(vm.gridOptions);
            }
        }

        function colorearEstado(entidad) {
        	if(vm.parent.isAdhoc){
        		if(entidad.ID_SUBESTADO == 4 && entidad.FD_VENCIMIENTO != undefined){
	        		hoy = new Date();
	        		hoyMiliseg = hoy.getTime();
	        		fVenc = new Date(entidad.FD_VENCIMIENTO);
	        		fVencMiliseg = fVenc.getTime();
	       			
	        		if(hoyMiliseg < fVencMiliseg){
	        			return 'leyendaNaranja';
	        		}else if(hoyMiliseg > fVencMiliseg){
	        			return 'leyendaRojo';
	        		}
        		}
        	}else{
                if(entidad.ID_PRESUPUESTO != null && entidad.IN_EMITIDO != 1 && entidad.IN_EMITIDO != 7) {
                    if(!entidad.IS_CONDICIONADO) {
                        return 'row-edit';
                    } else if (entidad.IS_CONDICIONADO) {
                        return 'row-contract';
                    }
                }
                if(entidad.ID_PRESUPUESTO && entidad.IN_EMITIDO == 7) {
                    return 'row-expired';
                }
        	}
        }


        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.presupuestos.html";
            } else {
                return "src/error/404.html";
            }
        }
        
        vm.mostrarBtnOpciones = function (poliza) {
        	if (poliza.IN_EMITIDO == 0 || (poliza.IN_EMITIDO == 0 && poliza.ID_RAMO != 103) || poliza.ID_RAMO == 103) {
        		return true;
        	} else return false;
        }

        //Link para ver el detalle viene del Ui-grid
        vm.verDetalle = function (fila, key, row, nuevoPresu) {
            if (key == 'cliente') {
                PolizaService.getPolizasByFilter({ "ID_POLIZA": fila.OPOLIZA.ID_POLIZA })
                    .then(function successCallback(response) {
                        vm.detallesPoliza = response.data.POLIZAS.POLIZA[0];
                        vm.llave = 'cliente';
                        cargarDetalle(fila);
                    }, function errorCallBack(response) {

                    });
                } else if(key == 'clientes'){
                    ClienteService.getClientes({"ID_CLIENTE": fila.OCLIENTE.ID_CLIENTE})
                        .then(function successCallback(response){
                            vm.detallesCliente = response.data.CLIENTES.CLIENTE[0];
                            vm.llave = 'clientes';
                            cargarDetalle(fila);
                        }, function errorCallBack(response)  {
                        });        
                } else if(key == 'documentacion'){
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
                                if(vm.parent.parent.archives_presupuestos != null){
                                    for(var i = 0; i < vm.parent.parent.archives_presupuestos.length; i++)  {
                                        if(!md.listaArchivos.find( archivo => archivo.ID_ARCHIVO === vm.parent.parent.archives_presupuestos[i].ID_ARCHIVO)){
                                            md.listaArchivos.push(vm.parent.parent.archives_presupuestos[i]);
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
                    				md.idPresupuesto = fila.ID_PRESUPUESTO;
                    				$scope.$apply();
                    				if(document.getElementById('file_pol').files[0] != null){
                    					var f = document.getElementById('file_pol').files[0];
                    					vm.parent.parent.getBase64(f, 227);
                    				}
                    			}
                    		});
                            
                            md.uploadFiles = function(){
                            	vm.parent.parent.uploadFiles(md.listaArchivos, 'presupuestos', md.idPresupuesto);
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
                	
            } else {
                vm.llave = {};
                vm.llave = key;

                if((fila.ID_RAMO == 20 && (fila.ID_PRODUCTO == 1 || fila.ID_PRODUCTO == 2) && fila.IS_CONDICIONADO && vm.llave == 'presupuesto') || (fila.ID_RAMO == 20 && (fila.ID_PRODUCTO == 1 || fila.ID_PRODUCTO == 2) && !fila.IS_CONDICIONADO && vm.llave == 'contratar'))
                    return;

                BusquedaService.buscar({"ID_PRESUPUESTO": fila.ID_PRESUPUESTO}, 'presupuestos')
                .then(function successCallback(response){
                    if(response.data.ID_RESULT == 0){
                        vm.detallesPresu = response.data.PRESUPUESTOS[0];
                        if(key == "contratar" && ((vm.detallesPresu.LIST_TARIFAS == null || vm.detallesPresu.LIST_TARIFAS == undefined) || (vm.detallesPresu.LIST_TARIFAS != null && vm.detallesPresu.LIST_TARIFAS.length == 0))){
                    	    msg.textContent("El presupuesto no tienen tarifas disponible. Edítelo para obtener tarifas antes de contratar.");
					        $mdDialog.show(msg);
                        }else{
                        	
                            if(key == 'contratar' && vm.detallesPresu.ID_RAMO == 20 && vm.detallesPresu.LIST_TARIFA_EMISION && !vm.detallesPresu.LIST_TARIFA_EMISION[0].IM_PRIMA_ANUAL) {
                                msg.textContent(`La contratación del presupuesto ${vm.detallesPresu.ID_PRESUPUESTO} no está disponible`);
                                $mdDialog.show(msg);
                                return;
                            }

                        	if (nuevoPresu == true) {
                        		vm.detallesPresu.IS_NUEVO_PRESU_EXISTENTE = true;
                        	}
	                        cargarDetalle(vm.detallesPresu);
                        }   
                    } else {
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg)
                    }
                    
                }, function errorCallBack(response)  {
                });        
            }
        }     
            
        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila) {
        	vm.existe = false;
        	for(var i = 0; i < vm.numDetalles.length; i++){//Mirar si el presupuesto está abierto ya sea resumen, editar o contratar
        		if(fila.ID_PRESUPUESTO == vm.numDetalles[i].ID_PRESUPUESTO){
        			vm.detalles = vm.numDetalles[i];
        			vm.existe = true;
        			break;
        		} else if (vm.nomDetalles[i] == 'nuevo' && vm.numDetalles[i].ID_PRESUPUESTO == undefined && fila.ID_PRESUPUESTO != undefined) {
        			vm.detalles = fila;
        			vm.existe = true;
        			break;
        		}
        	}
            if (!vm.existe) {//Si no está abierto, se abre
                // vm.numDetalles.push(fila);
                // vm.nomDetalles.push(vm.llave);
                // vm.active = vm.numDetalles.length;
                
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
            	
            	
//                if(vm.numDetalles.length < 1) {
//					vm.numDetalles.push(fila);
//                    vm.nomDetalles.push(vm.llave);
//                    vm.active = vm.numDetalles.length;
//				} else {
//					msg.textContent('Ya hay un detalle de presupuesto abierto');
//					$mdDialog.show(msg);
//				}

            }else{//Si está abierto, se abre el nuevo y se cierra el que estaba abierto, dejando el nuevo en el mismo índice que el cerrado
                // var index = vm.numDetalles.indexOf(vm.detalles);
                var index = '';
                for(var i = 0; i < vm.nomDetalles.length; i++) {
                    if(vm.nomDetalles[i] != 'nuevo') {
                        index = vm.numDetalles.indexOf(vm.detalles);
                    } else {
                        index = i;
                    }
                }
            	if(vm.nomDetalles[index]!=vm.llave){
            		if(index > -1){
            			vm.numDetalles[index] = vm.detalles;
                        vm.nomDetalles[index] = vm.llave;
            		}
                    vm.active = index + 1;
            	} else {
            		vm.active = index + 1;
            	}
            }
//            if (!vm.numDetalles.includes(fila)) {
//                vm.numDetalles.push(fila);
//                vm.nomDetalles.push(vm.llave);
//                vm.active = vm.numDetalles.length;
//            }else{
//            	var index = vm.numDetalles.indexOf(fila);
//            	if(vm.nomDetalles[index]!=vm.llave){
//            		if(index > -1){
//            			vm.numDetalles.splice(index, 1);
//            			vm.nomDetalles.splice(index, 1);
//            		}
//            		vm.numDetalles.push(fila);
//                    vm.nomDetalles.push(vm.llave);
//                    vm.active = vm.numDetalles.length;
//            	}
//            }
        }


        //Boton de cerrar tabs
        vm.cerrarTab = function (tab, opt) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
            if(opt) {
                for(let i = 0; i < vm.listBusqueda.length; i++) {
                    if(tab.ID_PRESUPUESTO == vm.listBusqueda[i].ID_PRESUPUESTO) {
                        tab = vm.listBusqueda[i];
                        break;
                    }
                }
                vm.verDetalle(tab, opt)
            }
            // 	$timeout.cancel($rootScope.prop);
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        //Botón para ver emisión manual
        vm.verEmisionManual = function (ev, fila, key, index) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/emisionmanual.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

                    md.fila = fila;
                    md.vista = 0;
                    md.navegador = bowser.name.toLowerCase();
                    
                    TiposService.getRamoCompania({
                        "ID_RAMO": md.fila.ID_RAMO
                    })
                        .then(function successCallback(response) {
                            md.aseguradoras = response.data.CIARAMOS.CIA_RAMO;
                            console.log(response);
                        }, function errorCallBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.parent.logout();
                            }
                        });

                    md.cambiarAseguradora = function () {
                        TiposService.getCompRamoProd({
                            "ID_COMPANIA": md.form.ID_COMPANIA,
                            "ID_RAMO": md.fila.ID_RAMO
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

                    md.guardar = function () {
                        var datos = {};
                        datos.OPRESUPUESTO = md.fila;
                        datos.OTARIFA_INDIVIDUAL = md.form;
                        datos.CO_ESTADO = 1;
                        datos.NU_POLIZA = md.form.NU_POLIZA;
                        datos.OPRESUPUESTO.OPOLIZA.CO_IBAN = md.form.CO_IBAN;

                        PresupuestoService.emisionManual(datos)
                            .then(function successCallback(response) {
                                msg.textContent(response.data.DS_RESULT.toLowerCase());
                                $mdDialog.show(msg);
                            }, function errorCallBack(response) {
                                msg.textContent('No se ha podido emitir el presupuesto');
                                $mdDialog.show(msg);
                            });
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
        }

        //Crear un nuevo presupuesto, abre modal
        vm.crearPresupuesto = function (ev) {
        	vm.crearNuevo = true;
        	for(llave in vm.nomDetalles){
        		if(vm.nomDetalles[llave]=='nuevo'){
        			vm.crearNuevo = false;
        			break;
        		}
        	}
        	if(vm.crearNuevo){
	            $mdDialog.show({
	                templateUrl: BASE_SRC + 'detalle/detalle.modals/presupuesto.modal.html',
	                controllerAs: '$ctrl',
	                clickOutsideToClose: true,
	                parent: angular.element(document.body),
	                targetEvent: ev,
	                fullscreen: false,
	                controller: ['$mdDialog', function ($mdDialog) {
	                    var md = this;
	                    md.tipos = {};
	                    md.showMenuEmpresas = false;
	
                    	var detallesCliente = null;
	                    
	                    if (vm.clienteSd != null) {
							var detallesCliente = vm.clienteSd.datos;
	                    }
	                    
	                    if(vm.parent.parent != undefined && vm.parent.parent.userProducts != undefined && vm.parent.parent.userProducts.length > 0) {
	        				for(var i = 0; i < vm.parent.parent.userProducts.length; i++) {
	        					switch (vm.parent.parent.userProducts[i].ID_PRODUCTO) {
	        						case 1:
	        						case 2:
	        							//hogar 5
	        							md.showBtnSH = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 3:
	        						case 4:
	        						case 5:
	        						case 6:
	        							//empresas 3
	        							md.showBtnCS = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 7:
	        							//hijos 2
	        							md.showBtnCH = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 8:
	        							//identidad 4
	        							md.showBtnCI = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 10:
	        						case 11:
	        						case 12:
	        							//movil 1
	        							md.showBtnSM = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 14:
	        						case 16:
	        						case 17:
	        						case 18:
	        							//Seguro dispositivos
	        							md.showBtnSD = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 19:
	        							//empresas -de
	        							md.showBtnCS_de = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						case 28:
	        							//particulares
	        							md.showBtnCP = vm.showProduct(vm.parent.parent.userProducts[i].ID_PRODUCTO);
	        							break;
	        						default:
	        							break;
	        					}
	        				}
	        			}
	                    
	                    md.nuevoPresupuesto = function (ramo, tipo, producto) {
	                        vm.llave = 'nuevo';
                            if (ramo != null) {
                            	var fila = {
                                    "ID_RAMO": ramo,
                                    "OCLIENTE": detallesCliente,
                                    "productoBusqueda": producto
                                };
                            	
                            	if (ramo == 103) {
                            		vm.llave = tipo;
                            	}
                            	
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
                            	$mdDialog.hide();
                            	
                            	if (vm.parent != null && vm.parent.desplegar != null) {
                            		vm.parent.desplegar()
                            	}
                            }
	                    }
	                    
	                    md.abrirCiberempresas = function () {
	                    	md.showMenuEmpresas = !md.showMenuEmpresas;
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
        		var index = vm.nomDetalles.indexOf('nuevo');
        		vm.active = index+1;
        	}
        }

        vm.showProduct = function (id) {
            let show = false;
            
            if (vm.parent.parent.userProducts != null && vm.parent.parent.userProducts.length > 0) {
                for (var i = 0; i < vm.parent.parent.userProducts.length; i++) {
                    var producto = vm.parent.parent.userProducts[i];
                    if (producto.ID_PRODUCTO == id && producto.IN_TARIFICA == true) {
                        show = true;
                        break;
                    }
                }
            }
            
            return show;
        }

        vm.exportarExcel = function () {
        	if (vm.comprobarObjetoExportar() == true) {
	            if(vm.parent.url == 'clientes'){
	                if(vm.view == 4 && (vm.listBusqueda.tipo == 'presupuestos' || vm.listBusqueda.tipo == 'presupuestosRed')){
	                    vm.parent.urlExport = 'presupuestos'; 
	                    vm.parent.form = {"OCLIENTE":{"ID_CLIENTE":vm.detallesCliente.ID_CLIENTE}};
	                }
	            }
	            vm.parent.exportarExcel();
        	} else {
                msg.textContent("Debes filtrar más la búsqueda para poder exportar a excel.");
                $mdDialog.show(msg);
        	}
        }
        
        vm.comprobarObjetoExportar = function () {
        	if ((vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == "") && (vm.parent.form.LST_ID_TIPO_POLIZA == null || vm.parent.form.LST_ID_TIPO_POLIZA.length == 0) && (vm.parent.form.LST_PRODUCTOS == null || vm.parent.form.LST_PRODUCTOS.length == 0) && (vm.parent.form.ID_PRESUPUESTO == null || vm.parent.form.ID_PRESUPUESTO == "") && (vm.parent.form.OCLIENTE == null || vm.parent.form.OCLIENTE.NU_DOCUMENTO == null || vm.parent.form.OCLIENTE.NU_DOCUMENTO == "")) {
        		return false;
        	} else {
        		return true;
        	}
        }
        
        vm.stringTrueFalse = function(valor) {
        	if(valor == true)
        		return 'Sí'
    		else
    			return 'No';
        }

        vm.descargarPDF = function(obj, sendEmail) {
            PresupuestoService.descargaPresupuesto(obj, sendEmail, vm.idProduct == 19 ? 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade') : undefined)
            .then(function successCallback(data) {
                if (data.status === 200) {
                    let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(data.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                        var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                        if(objtMensajeUArchivo.ID_RESULT != 0) {
                            var msgError = "Ha ocurrido un error en la exportación";
                            if (objtMensajeUArchivo.DS_RESULT != null) {
                                msgError = objtMensajeUArchivo.DS_RESULT;
                            }
                            msg.textContent(msgError);
                            $mdDialog.show(msg);
                        } else {
                            if (sendEmail == true) {
                                msg.textContent("El correo se ha enviado correctamente");
                                $mdDialog.show(msg);
                            }
                        }
                    } else {
                        if (sendEmail == true) {
                            msg.textContent("El correo se ha enviado correctamente");
                            $mdDialog.show(msg);
                        } else {
                            saveAs(new Blob([data.data], { type: 'application/pdf' }), vm.objDescargaPresu.ID_PRESUPUESTO + '.pdf');
                            $mdDialog.hide();
                        }
                    }
                }
                vm.loadDescarga = false;
                vm.loadEnvio = false;
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
        
        //recuperar documentación ya subida (desde padre)
        vm.getDocuments = function(fila){
            var idPresupuesto = fila.ID_PRESUPUESTO;
            var ruta = 'presupuestos\\'+ idPresupuesto;
                
            vm.parent.parent.getDocuments(ruta, 227);
        }      

        vm.nuevoPresuApartirExistente = function (row) {
        	vm.verDetalle(row.entity,'contratar', row, true);
        }
        
        vm.descargarPresu = function (row, sendEmail) {
//        	if (sendEmail != true) {
//        		vm.loadDescarga = true;
//        	} else {
//        		vm.loadEnvio = true;
//        	}
//    		vm.loadDescargaId = row.ID_PRESUPUESTO;
			vm.parent.parent.abrirModalcargar(true);
        	BusquedaService.buscar({"ID_PRESUPUESTO": row.ID_PRESUPUESTO}, 'presupuestos')
            .then(function successCallback(response){
                if(response.data.ID_RESULT == 0){

                	if (response.data.PRESUPUESTOS != null && response.data.PRESUPUESTOS[0] != null && response.data.PRESUPUESTOS[0].PECUNIARIAS != null) {
                		var presupuesto = response.data.PRESUPUESTOS[0];
                		vm.idProduct = presupuesto.ID_PRODUCTO;
                		var coProducto = "";
                        presupuesto.CO_PRESUPUESTO = "AD-HOC" ? vm.tarifaAdhoc ="adhoc" : "auto";

                        // if (presupuesto.PECUNIARIAS != null && presupuesto.PECUNIARIAS.CIBERRIESGO != null) {
                        // 	coProducto = "CBEMP-INDEP";
                        // } else if (presupuesto.PECUNIARIAS != null && presupuesto.PECUNIARIAS.HIJOSEIDENTIDAD != null && presupuesto.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_CHILDREN_NUMBER != null) {
                        // 	coProducto = "CBH";
                        // } else if (presupuesto.PECUNIARIAS != null && presupuesto.PECUNIARIAS.HIJOSEIDENTIDAD != null && presupuesto.PECUNIARIAS.HIJOSEIDENTIDAD.ASSURED_NUMBER != null) {
                        // 	coProducto = "CBI";
                        // } else if (presupuesto.PECUNIARIAS != null && presupuesto.PECUNIARIAS.CIBERPARTICULARES != null) {
                        // 	coProducto = 'CBP';
                        // }

                        if(vm.idProduct == 6)
                            coProducto = "CBEMP-INDEP";
                        else if(vm.idProduct == 5)
                            coProducto = "CBEMP-AGREG";
                        else if(vm.idProduct == 7)
                            coProducto = "CBH";
                        else if(vm.idProduct == 5)
                            coProducto = "CBI";
                        else if(vm.idProduct == 28)
                        	coProducto = "CBP";
                        else if(vm.idProduct == 19)
                            coProducto = 'CBDE';

            			var obj = {
        					ID_PRESUPUESTO: presupuesto.ID_PRESUPUESTO,
            				PRESUPUESTO: {
	        					CO_PRODUCTO: coProducto,
	    						ID_RAMO: presupuesto.ID_RAMO,
	    						NO_USUARIO: presupuesto.NO_USU_ALTA,
	    						PECUNIARIAS: presupuesto.PECUNIARIAS
            				}
            			}
                			
            			if (presupuesto.LIST_TARIFAS != null && presupuesto.LIST_TARIFAS[0] != null) {
            				obj.MODALIDADES = {
        						MODALIDAD: [ presupuesto.LIST_TARIFAS[0] ]
            				}
            			}
                        
                        if (row.OCLIENTE != null && row.OCLIENTE.ID_CLIENTE != null) {
                        	var objCliente = {
            	    			NO_EMAIL: row.OCLIENTE.NO_EMAIL != null ? row.OCLIENTE.NO_EMAIL : undefined,
            	    			NU_DOCUMENTO: row.OCLIENTE.NU_DOCUMENTO != null ? row.OCLIENTE.NU_DOCUMENTO : undefined,
            	    			NU_TELEFONO: row.OCLIENTE.NU_TELEFONO1 != null ? row.OCLIENTE.NU_TELEFONO1 : undefined,
            	    		}

            	    		if (row.OCLIENTE.NO_NOMBRE_COMPLETO != null) {
                                var nombreCompleto = row.OCLIENTE.NO_NOMBRE_COMPLETO.split(" ");
                                if (nombreCompleto[0] != null) {
                                	objCliente.NO_NOMBRE = nombreCompleto[0];
                                }
                                if (nombreCompleto[1] != null) {
                                	objCliente.NO_APELLIDO1 = nombreCompleto[1];
                                }
                                if (nombreCompleto[2] != null) {
                                	objCliente.NO_APELLIDO2 = nombreCompleto[2];
                                }
            	    		}

            	    		obj.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = objCliente;
            	    		obj.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = objCliente;
            	    		
            	    		vm.objDescargaPresu = obj;

                            if(coProducto == 'CBP') {
                                ClienteService.getCliente({'ID_CLIENTE': row.OCLIENTE.ID_CLIENTE})
                                .then(function successCallback(response) {
                                    if(response.status === 200 && response.data) {

                                        let clientData = response.data;
                                        let lstData = ['NU_DOCUMENTO', 'NO_NOMBRE', 'NO_APELLIDO1', 'NO_APELLIDO2', 'FD_NACIMIENTO', 'NU_TELEFONO1', 'NO_EMAIL'];
                                        let lstAdData = ['NO_DIRECCION', 'CO_POSTAL', 'NO_LOCALIDAD', 'NO_PROVINCIA'];

                                        for(let i = 0; i < lstData.length; i++) {
                                            if(clientData[lstData[i]]){
                                                if(lstData[i] != 'NU_TELEFONO1')
                                                    objCliente[lstData[i]] = clientData[lstData[i]]
                                                else
                                                    objCliente['NU_TELEFONO'] = clientData[lstData[i]];
                                            }
                                        }

                                        for(let i = 0; i < lstAdData.length; i++) {
                                            if(clientData.LIST_DOMICILIOS[0][lstAdData[i]]){
                                                objCliente[lstAdData[i]] = clientData.LIST_DOMICILIOS[0][lstAdData[i]]
                                            }
                                        }

                                        obj.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = objCliente;
            	    		            obj.PRESUPUESTO.PECUNIARIAS.DATOS_PAGADOR = objCliente;
                                        vm.descargarPDF(obj, sendEmail);
                                    }
                                });
                            } else {
                                vm.descargarPDF(obj, sendEmail);
                            }
                        } else {
                        	$mdDialog.cancel();
                        	vm.modalPdf(obj, sendEmail);
                        }
                        
                        
                	}
                	
                } else {
                    msg.textContent(response.data.DS_RESULT);
                    $mdDialog.show(msg)
                }
                
            }, function errorCallBack(response)  {
                msg.textContent("Ha ocurrido un error al descargar el presupuesto");
                $mdDialog.show(msg);
            });    
        }
        
        vm.modalPdf = function (row, sendEmail) {
        	$mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/descarga.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    vm.objCli = {}
                    md.mensaje = null;
                    md.type = row.PRESUPUESTO.CO_PRODUCTO;
                    md.budgetId = row.ID_PRESUPUESTO;
                    md.tarifaAdhoc = vm.tarifaAdhoc;
                    md.tpRiesgos = vm.parent.tpRiesgos;
                    md.showCliente = false;

                    md.$onInit = function() {
                    	vm.objPres = row;
                    	md.disabledOpt = true;
                    	
                    	if (sendEmail == false) {
                    		md.btnOpt = 0;
                    		vm.loadDescarga = false;
                    	} else {
                    		md.btnOpt = 1;
                    		vm.loadDescargaId = null;
                    		vm.loadEnvio = false;
                    	}
                    	
                    	if (md.type == "CBEMP-INDEP" || md.type == "CBEMP-AGREG" || md.type == "CBDE") {
                    		md.type = "CBR";
                    	}
                    }
                    
                    md.sendPdf = function(sendEmail) {
                    	if(md.formDownloadBudget.$valid) {
                    		
                    		if (md.objCli != null) {
                    			for (var i in md.objCli) {
                    				if (md.objCli[i] == null || md.objCli[i] == "") {
                    					delete md.objCli[i];
                    				}
                    			}
                                if(md.objCli.FD_NACIMIENTO)
                                    md.objCli.FD_NACIMIENTO = CommonUtils.dateFormat(md.objCli.FD_NACIMIENTO);
                    		}
                    		
                    		if (md.objHolder != null) {
                    			for (var i in md.objHolder) {
                    				if (md.objHolder[i] == null || md.objHolder[i] == "") {
                    					delete md.objHolder[i];
                    				}
                    			}
                    		}
                    		
                    		if (md.type == 'CBR' || md.type == 'CBP') {
                        		vm.objHolder = md.objHolder;
                        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = md.objHolder;
                    		} else {
                        		vm.objHolder = md.objCli;
                        		vm.objPres.PRESUPUESTO.PECUNIARIAS.DATOS_TOMADOR = md.objCli;
                    		}

                            if(vm.tarifaAdhoc == 'adhoc'){
                                vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.CO_TIPO_RIESGO = md.riesgo;
                                vm.objPres.PRESUPUESTO.PECUNIARIAS.CIBERRIESGO.IN_POLIZA_CIBER_OTRA_ASEGURADORA = md.polizaOtraCia;
                            }

                    		md.loading = true;
                    		PresupuestoService.descargaPresupuesto(vm.objPres, sendEmail, vm.idProduct == 19 ? 'Basic ' + btoa('TIPGTW:InterX0X0Pleyade') : undefined)
                            .then(function successCallback(data) {
                            	if (data.status === 200) {
    	                            let utf8decoder = new TextDecoder();
    	                            var mensajeUArchivo = utf8decoder.decode(data.data);
    	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
    	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
    	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
    	                                	var msgError = "Ha ocurrido un error en la exportación";
    	                                	if (objtMensajeUArchivo.DS_RESULT != null) {
    	                                		msgError = objtMensajeUArchivo.DS_RESULT;
    	                                	}
    	                                    msg.textContent(msgError);
    	                                    $mdDialog.show(msg);
    	                                } else {
    	                                	if (sendEmail == true) {
												msg.textContent("El correo se ha enviado correctamente");
												$mdDialog.show(msg);
    	                                	}
										} 
    	                            } else {
    	                            	if (sendEmail == true) {
											msg.textContent("El correo se ha enviado correctamente");
											$mdDialog.show(msg);
    	                            	} else {
											saveAs(new Blob([data.data], { type: 'application/pdf' }), vm.objPres.ID_PRESUPUESTO + '.pdf');
											$mdDialog.hide();
    	                            	}
    	                            }
                    			}
                        		md.loading = false;
                            },
                            function errorCallback(response) {
                                md.loading = false;
                                msg.textContent('Ha ocurrido un error en la exportación');
                                $mdDialog.show(msg);
                            });
                    	} else {
                    		md.loading = false;
                    		objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if(objFocus != undefined) {
                                objFocus.focus();
                            }
                    	}
                    }

                    md.buscarCliente = function () {
                    	md.loadCliente = true;
                        md.clienteEncontrado = null;
                    	ClienteService.getCliente({ NU_DOCUMENTO: md.objHolder.NU_DOCUMENTO})
                        .then(function successCallback(data) {
                            if(data != null && data.data.ID_RESULT != 0){
								md.loadCliente = false;
                                md.clienteEncontrado = true;
								msg.textContent(data.data.DS_RESULT);
                                $mdDialog.show(msg);
                            } else if(data != null && data.data.ID_RESULT == 0  && data.data.ID_CLIENTE == undefined){
								md.loadCliente = false;
								md.clienteEncontrado = false;
                        	}else if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                                md.clienteEncontrado = true;
                        		var cliente = data.data;
                        		md.objHolder.NO_NOMBRE = cliente.NO_NOMBRE;
                        		md.objHolder.NU_TELEFONO = cliente.NU_TELEFONO1;
                        		md.objHolder.NO_EMAIL = cliente.NO_EMAIL;
                                md.clienteEncontrado = true;
                        		if (cliente.LIST_DOMICILIOS != null && cliente.LIST_DOMICILIOS.length > 0 && cliente.LIST_DOMICILIOS[0].CO_POSTAL != null) {
                        		    md.objHolder.CO_POSTAL = cliente.LIST_DOMICILIOS[0].CO_POSTAL;
                        		}
                            	md.loadCliente = false;
                        	} else {
                            	md.loadCliente = false;
                        	}
                            md.showCliente = true;
                        }, function callBack(response) {
                        	md.loadCliente = false;
                        });
                    }
                    
                    md.checkPostal = function(code) {
                        if(code != undefined && code.length == 5) {
                            EmpresaService.cities(code)
                            .then(function successCallback(response) {
                                if (response.status == 200) {
                                    if(response.data != undefined && response.data.LOCALIDAD != undefined) {
                                        if (response.data.LOCALIDAD.length > 1) {
                                            // LocalidadesService.elegirLocalidad(response.data.LOCALIDAD, vm.address);
                                        } else {
                                            md.objCli.ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                                        } 
                                        md.objCli.NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                                        md.objCli.NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                                        md.objCli.CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;      
                                        md.objCli.ID_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA != null ? parseInt(response.data.LOCALIDAD[0].CO_PROVINCIA) : null;      
                                    } else {
                                    }
                                }
                            }, function callBack(response) {
                                if (response.status == 406 || response.status == 401) {
                                }
                            });
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
        }
    }

    ng.module('App').component('busquedaPresupuesto', Object.create(busquedaComponent));

})(window.angular);