(function (ng) {

    //Crear componente de busqueda
    var entregasComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$location', '$window', '$mdDialog', '$routeParams', 'uiGridConstants', 'BASE_SRC', '$http', 'AdminService', 'FicherosService'],
        require: {
			appParent: '^sdApp',
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<'
        }
    }

    entregasComponent.controller = function entregasComponentController($location, $window, $mdDialog, $routeParams, uiGridConstants, BASE_SRC, $http, AdminService, FicherosService) {
        var vm = this;
        var json = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.vista = 1;
            vm.screenHeight = $window.innerHeight;
            vm.baseSrc = BASE_SRC;

			vm.appParent.abrirModalcargar(true);
            AdminService.entregas({})
			.then(function successCallback(response){
				if (response.data != null && response.data.ENTREGAS != null && response.data.ENTREGAS.length > 0) {
            		vm.gridOptions.data = response.data.ENTREGAS;
                    vm.vista = 4;
    				$mdDialog.cancel();
            	}
			}, function errorCallBack(response)  {
				$mdDialog.cancel();
			});
        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }

        }

        // this.$doCheck = function () {
        //     if (vm.gridApi != undefined)
        //         vm.gridApi.core.resfresh;
        // }

        //UI.GRID Configurado
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: 0,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            showGridFooter: true,
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'NU_PETICION',
                    displayName: 'Petición de subida',
                    cellTemplate: '<div ng-if="grid.appScope.$ctrl.getRequestNum(row.entity) != null" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getRequestNum(row.entity)}}</div>',
                    cellTooltip: function (row) { return row.entity.NU_PETICION }
                },
                {
                    field: 'FD_ENTREGA',
                    displayName: 'Fecha de entrega',
                    sort: { priority: 0, direction: 'desc' },
                    cellTooltip: function (row) { return row.entity.FD_ENTREGA },
                    cellFilter: 'date:\'dd/MM/yyyy\''
                },
                {
                    field: 'NO_ENTREGA_FRONT',
                    displayName: 'Entrega frontal',
                    cellTemplate: '<div ng-if="grid.appScope.$ctrl.getEntrega(row.entity, 1) != null" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, row, grid.appScope.$ctrl.getEntrega(row.entity, 1))">{{grid.appScope.$ctrl.getEntrega(row.entity, 1).NU_ENTREGA}}</a></div>',
                    cellTooltip: function (row) { return row.entity.NO_ENTREGA }
                },
                // {
                //     field: 'NO_ENTREGA_BACK',
                //     displayName: 'Entrega backend',
                //     cellTemplate: '<div ng-if="grid.appScope.$ctrl.getEntrega(row.entity, 2) != null" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, row, grid.appScope.$ctrl.getEntrega(row.entity, 2))">{{grid.appScope.$ctrl.getEntrega(row.entity, 2).NU_ENTREGA}}</a></div>',
                //     cellTooltip: function (row) { return row.entity.NO_ENTREGA }
                // },
                {
                    field: 'NO_ENTREGA_BACK',
                    displayName: 'Entrega backend',
                    cellTemplate: '<div ng-if="grid.appScope.$ctrl.getDelivery(row.entity) != null" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, row, grid.appScope.$ctrl.getDelivery(row.entity))">{{grid.appScope.$ctrl.getDelivery(row.entity).NU_ENTREGA}}</a></div>',
                    cellTooltip: function (row) { return row.entity.NO_ENTREGA }
                },
                {
                    field: 'REPORTE_QA',
                    displayName: 'Reporte QA',
                    cellTemplate: '<div ng-if="grid.appScope.$ctrl.getEntrega(row.entity, 3) != null" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarQA(grid.appScope.$ctrl.getEntrega(row.entity, 3))"><i class="fas fa-download" style="margin-right: 5px"></i> Descargar</a></div>',
                    cellTooltip: function (row) { return row.entity.NO_ENTREGA }
                },
//                {
//                    field: 'REPORTE_QA',
//                    displayName: 'Reporte QA',
//                    width: 300,
//                    cellTemplate: '<div ng-if="row.entity.URL_REPORTE != null" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarReporte(row.entity)">Descargar reporte</a></div>',
//                    cellTooltip: function (row) { return row.entity.NO_ENTREGA }
//                },
            ],
            onRegisterApi: function (gridApi) {}
        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function () {
            return BASE_SRC + "entregas/entregas.view.html";
        }


        //Borrar casillas al cambiar
        vm.clearModel = function () {
            angular.forEach(vm.form, function (value, key) {
                value.value = "";
            });
        }

        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function (fila, key, entrega) {
    		cargarDetalle(entrega);
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
		    var dato = '';
            	//Para intercambiar en la misma pestaña
 			if (vm.numDetalles.length > 0) {
 				vm.numDetalles = [];
     			setTimeout( function () { 
 	    				vm.numDetalles.push(fila);
 	    				vm.active = vm.numDetalles.length;
     				}, 
     			10);
 			} else {
 				vm.numDetalles.push(fila);
 				vm.active = vm.numDetalles.length;
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
        
        vm.descargarQA = function (row) {
    		if (row != null && row.LIST_ARCHIVOS != null && row.LIST_ARCHIVOS.length > 0) {
    			vm.archivo = row.LIST_ARCHIVOS[0];
    			if (vm.archivo.NO_ARCHIVO != null && vm.archivo.NO_RUTA != null) {
    				vm.appParent.abrirModalcargar(true);
    	    		FicherosService.downloadFichero({"NO_RUTA_ORIGEN": vm.archivo.NO_RUTA,"NO_ARCHIVO": vm.archivo.NO_ARCHIVO})
    				.then(function successCallback(response){
    					saveAs(new Blob([response.data]), vm.archivo.NO_ARCHIVO);
        				$mdDialog.cancel();
    				});
    			}
    		}
        }
        
        vm.descargarEntrega = function (detalles, tipoEntrega) {
        	var nombre =  detalles[detalles.SHOW_ENTREGA];
        	nombre = nombre.split("/");
        	nombre = nombre[nombre.length-1];
      	    vm.descargar(detalles, BASE_SRC + 'entregas/' + detalles[detalles.SHOW_ENTREGA], nombre);
        }
        
        vm.descargarReporte = function (detalles) {
    	    var nombre =  detalles.URL_REPORTE;
    	    nombre = nombre.split("/");
    	    nombre = nombre[nombre.length-1];
    	    vm.descargar(detalles, BASE_SRC + 'entregas/' + detalles.URL_REPORTE, nombre);
        }
        
        vm.descargar = function (detalle, href, nombre) {
    	    var element = document.createElement('a');
    	    element.setAttribute('href', href);
    	    element.setAttribute('download', nombre);
    	    element.style.display = 'none';
    	    document.body.appendChild(element);
    	    element.click();
    	    document.body.removeChild(element);
        }
        
        vm.getNombreEntrega = function (detalles) {
        	if (detalles.ID_TIPO_ENTREGA == 1) {
        		return "Entrega Frontal: " + detalles.NU_ENTREGA;
        	} else if (detalles.ID_TIPO_ENTREGA == 2 || detalles.ID_TIPO_ENTREGA == 3) {
        		return "Entrega Backend: " + detalles.NU_ENTREGA;
        	} /*else if (detalles.ID_TIPO_ENTREGA == 3) {
        		return "Entrega QA: " + detalles.NU_ENTREGA;
        	}*/
        }

        vm.getEntrega = function (row, tipoEntrega) {
        	var entrega = null;
        	if (row != null && row.ENTREGA != null) {
        		entrega = row.ENTREGA.find(x => x.ID_TIPO_ENTREGA == tipoEntrega);
        	}
        	return entrega;
        }

        vm.getRequestNum = function (row) {
        	if(row != null && row.ENTREGA != null) {
                let requestNum = '';
                for(let i = 0; i < row.ENTREGA.length; i++) {
                    if(row.ENTREGA[i].NU_PETICION) {
                        requestNum = row.ENTREGA[i].NU_PETICION;
                        break;
                    }
                }
        		return requestNum;
        	}
        }

        vm.getDelivery = function (row) {
        	if(row != null && row.ENTREGA != null) {
                let delivery;
                for(let i = 0; i < row.ENTREGA.length; i++) {
                    if(row.ENTREGA[i].ID_TIPO_ENTREGA == 2 || row.ENTREGA[i].ID_TIPO_ENTREGA == 3) {
                        delivery = row.ENTREGA[i];
                        break;
                    }
                }
        		return delivery;
        	}
        }

    }
    ng.module('App').component('sdEntregas', Object.create(entregasComponent));
})(window.angular);