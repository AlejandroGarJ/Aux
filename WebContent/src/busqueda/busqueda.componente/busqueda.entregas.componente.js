(function (ng) {

    //Crear componente de busqueda
    var busquedaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$location', '$window', '$mdDialog', '$routeParams', 'uiGridConstants', 'BASE_SRC'],
        require: {
			appParent: '^sdApp',
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<'
        }
    }

    busquedaComponent.controller = function busquedaComponentController($location, $window, $mdDialog, $routeParams, uiGridConstants, BASE_SRC) {
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
        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
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
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'DS_PRODUCTO',
                    displayName: 'Producto',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: 300,
                    cellTooltip: function (row) { return row.entity.NO_RAMO },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'NU_POLIZA',
                    displayName: 'Poliza',
                    cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.NU_POLIZA}}</a></div>',
                    cellTooltip: function (row) { return row.entity.NU_POLIZA },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_TIPO_POLIZA',
                    displayName: 'Partner',
                    cellTooltip: function (row) { return row.entity.DS_TIPO_POLIZA },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'ID_SITUAPOLIZA',
                    displayName: 'Estado',
                    cellTooltip: function (row) { return row.entity.ID_SITUAPOLIZA },
                    cellTemplate: '<div ng-if="row.entity.ID_POLIZA != undefined" class="ui-grid-cell-contents">{{row.entity.DS_SITUAPOLIZA}}</div>',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'tomador.NO_NOMBRE_COMPLETO',
                    displayName: 'Tomador',
                    cellTemplate: templateVar,
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
                    field: 'CO_CANAL',
                    displayName: 'Canal',
                    cellTooltip: function (row) { return row.entity.CO_CANAL },
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
                },
                {
                    name: 'Descargar Póliza',
                    cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center"><a ng-if="row.entity.NU_POLIZA != null && row.entity.ID_PRODUCTO != 9 && row.entity.ID_PRODUCTO != 13 && row.entity.ID_SITUAPOLIZA != 3" ng-click="grid.appScope.$ctrl.descargarPDF(row.entity)" style="font-family: TelefonicaWebRegular;font-size: 1em;"><i class="fas fa-download" style="margin-right: 5px"></i> Descargar</a></div>',
                    width: 130,
                    enableSorting: false, enableColumnMenu: false,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    name: 'Renovar Póliza', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'renovar-poliza\', row)" ng-if="row.entity.NU_POLIZA != null && row.entity.IN_RENOVADA == true" style="font-family: TelefonicaWebRegular;font-size: 1em; display: flex"><span class="material-icons" style="margin-right: 5px; font-size: 18px">sync</span> Renovar</a></div>',
                    width: 80,
                    enableSorting: false, enableColumnMenu: false,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    name: '  ', cellTemplate: '<div class="ui-grid-cell-contents td-trash"><a ng-if="row.entity.NU_POLIZA != null && row.entity.ID_RAMO == 10" ng-click="grid.appScope.$ctrl.retarificar(row.entity)">Retarificar</a></div>',
                    width: 80,
                    enableSorting: false, enableColumnMenu: false,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                }
                //    	    	  {name:'Ver', cellTemplate:'<div class="ui-grid-cell-contents td-eye" ng-if="row.entity.NU_POLIZA != null"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'cliente\', row)"><span style="font-size: 15px;" class="glyphicon glyphicon-eye-open"></span></a></div>', 
                //    	 	           cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {return colorearEstado(row.entity);},
                //    	 	           width: 36,
                //    	 	           enableSorting:false, enableColumnMenu : false
                //    	    	  }

            ],
            onRegisterApi: function (gridApi) {}
        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function () {
            return BASE_SRC + "busqueda/busqueda.view/busqueda.entregas.html";
        }


        //Borrar casillas al cambiar
        vm.clearModel = function () {
            angular.forEach(vm.form, function (value, key) {
                value.value = "";
            });
        }

        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function (fila, key) {
    		cargarDetalle(fila);
        }

        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila) {
        	
        	 var existe = false;
 			var dato = ''
 			
             if(vm.llave == 'tomador'){
             	dato = 'ID_CLIENTE';
             } else if(vm.llave == 'poliza' || vm.llave == "renovar-poliza") {
             	dato = 'ID_POLIZA';
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

    }
    ng.module('App').component('busquedaEntregas', Object.create(busquedaComponent));
})(window.angular);