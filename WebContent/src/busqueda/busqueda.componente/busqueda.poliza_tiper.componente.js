(function (ng) {

    //Crear componente de busqueda
    var busquedaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$location', '$window', '$mdDialog', '$routeParams', 'PolizaService', 'ClienteService', 'DescargaService', 'uiGridConstants', 'BASE_SRC', 'MovilService'],
        require: {
			appParent: '^sdApp',
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            isClient: '<',
            datosCliente: '<',
            isConsultagdpr: '<'
        }
    }

    busquedaComponent.controller = function busquedaComponentController($location, $window, $mdDialog, $routeParams, PolizaService, ClienteService, DescargaService, uiGridConstants, BASE_SRC, MovilService) {
        var vm = this;
        var json = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
        vm.callGetDetail = false;

        var templateVar= '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'tomador\', row)">{{row.entity.tomador.NO_NOMBRE_COMPLETO}}</a></div>';
        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.vista = 1;
            
            //Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
                vm.permisos = vm.parent.parent.getPermissions('polizas_tiper');
//                vm.parent.ckPermisos = vm.permisos;
    		}
    		
            //Cargar las listas
            if (/polizas/.test(url)) {
                if (localStorage.polizas != undefined && localStorage.polizas != "") {
                    vm.gridOptions.data = JSON.parse(localStorage.polizas);
                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }

            //Abrir el detalle de la póliza cuando si tiene parametro
            if ($routeParams.id != null) {
                var poliza = JSON.parse(localStorage.polizas);
                var fila = _.filter(poliza, { 'ID_POLIZA': $routeParams.id })

                cargarDetalle(fila[0]);
            }

        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
            if(/clientes/.test(url) || vm.isClient == true){
            	templateVar= null;	 
		 	}
            
            if (vm.parent.url == 'polizas')
                vm.tipo = 'polizas';
            else
                vm.tipo = 'polizasBy';

            if (vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /polizas/.test(url) || /clientes/.test(url)) {
                if (vm.view == 4 && vm.listBusqueda.tipo == "polizas") {
                    vm.gridOptions.data = vm.listBusqueda.listas;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
                
                
                if (/polizas/.test(url)) {
                    vm.gridOptions.data = vm.listBusqueda;
                    //vm.active = vm.dsActive;
                    vm.active = 0;
                }
                
                if(vm.listBusqueda != undefined && vm.listBusqueda.listas != undefined){
                	vm.gridOptions.data = vm.listBusqueda.listas;
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
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: 0,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
            gridFooterTemplate: '<div class="leyendaInferior">' +
                '<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'polizas\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '<div class="contenedorElemento"><span>Canceladas</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
                '<div class="contenedorElemento"><span>Pendiente</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
                '</div>',
            //useExternalPagination: true,
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'NU_POLIZA',
                    displayName: 'Poliza',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.NU_POLIZA}}</div>',
                    cellTooltip: function (row) { return row.entity.NU_POLIZA },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'tomador.NO_NOMBRE_COMPLETO',
                    displayName: 'Tomador',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.tomador.NO_NOMBRE_COMPLETO}}</div>',
                    cellTooltip: function (row) { 
                    	if(row.entity.OPAGADOR != undefined){
                    		return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO;
                    	}else {
                    		return templateVar;
                    	}
                	},
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'IM_PRIMA_TOTAL',
                    displayName: 'Importe',
                    cellFilter: "currency:'€' : 2",
                    cellTooltip: function (row) { return row.entity.IM_PRIMA_TOTAL },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FD_EMISION',
                    displayName: 'Fecha de Emisión',
                    cellTooltip: function (row) { return row.entity.FD_EMISION },
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FD_INICIO',
                    displayName: 'Fecha de Efecto',
                    cellTooltip: function (row) { return row.entity.FD_INICIO },
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FD_VENCIMIENTO',
                    displayName: 'Fecha de Vencimiento',
                    cellTooltip: function (row) { return row.entity.FD_VENCIMIENTO },
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                }
            ],
            onRegisterApi: function (gridApi) {
                //vm.grid1Api = gridApi;
                vm.gridApi = gridApi;
                if(vm.permisos != undefined) {
                    for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
                        switch (vm.gridOptions.columnDefs[i].name) {
                            case '  ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
                                break;
                            case ' ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_BORRADO;
                                break;
                            case '   ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_EXPORTAR;
                                    break;
                            default:
                                break;
                        }
                    }
                }
                //vm.gridApi.grid.options.totalItems = vm.gridApi.grid.options.data.length;
                //console.log(gridApi);
                vm.gridApi.grid.registerDataChangeCallback(function () {
                    vm.gridApi.treeBase.expandAllRows();
                });
                vm.parent.translateHeaders(vm.gridOptions);    
            }
        }

    	/*vm.gridOptions.$gridServices.DomUtilityService.RebuildGrid(
    			vm.gridOptions.$gridScope, 
    			vm.gridOptions.ngGrid
    	);*/

    	/********************************
    	 * 	¡Guía de UI-GRID!
    	 * 	Se crea un configurador de ui-grid que tienes arriba, enableSorting(ordenar), paginationPageSizes(filas por páginas).
    	 * 	Cada columna se puede configurar, por ejemplo cellTemplate sirve para pintar HTML, cellClass sirve para añadir clase como el color de estado (en vigor, cancelado, etc)
    	 * 	width el tamaño de la columna, se puede la ordenación de una columna o desactivar el menú y por último cellFilter lo he usado para cambiar el formato de la fecha.
    	 * 	Si ves algún valor que se llama "row.entity" contiene datos de una fila que puede ser utilidad.
    	 * 
    	 *******************************/

        //Función para colorear la fila, en realidad lo pinta en una celda.
        function colorearEstado(entidad) {
            if (entidad.NU_POLIZA != null) {
                if (entidad.ID_SITUAPOLIZA == 2 || entidad.ID_SITUAPOLIZA == 4) {
                    return 'filaRoja';
                } else if (entidad.ID_SITUAPOLIZA == 3) {
                    return 'filaAmarilla';
                } 
                //	    		if(typeof entidad.LST_ASEGURADOS[2] !== "undefined"){
                //	    			if(entidad.LST_ASEGURADOS[1].ID_CLIENTE!==entidad.LST_ASEGURADOS[2].ID_CLIENTE){
                //		    			return 'filaNoTomador';
                //		    		}
                //	    		}
            }
            else {
                return 'rowGroup';
            }

        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function () {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.polizas_tiper.html";
            } else {
                return "src/error/404.html";
            }
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

    }
    ng.module('App').component('busquedaPolizaTiper', Object.create(busquedaComponent));
})(window.angular);