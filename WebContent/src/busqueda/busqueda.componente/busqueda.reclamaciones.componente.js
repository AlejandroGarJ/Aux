(function (ng) {


    //Crear componente de busqueda
    var busquedaReclamacionesComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$location', '$timeout', '$window', '$mdDialog', 'validacionesService', '$routeParams', 'sharePropertiesService', 'BusquedaService', 'uiGridConstants', 'BASE_SRC'],
        require: {
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<'
        }
    }

    busquedaReclamacionesComponent.controller = function busquedaReclamacionesComponentController($q, $location, $timeout, $window, $mdDialog, validacionesService, $routeParams, sharePropertiesService, BusquedaService, uiGridConstants, BASE_SRC) {
        var vm = this;
        var json = {};
        vm.db = sharePropertiesService.get('db');
        var url = window.location;
        vm.numDetalles = [];
        vm.actives = 0;
        vm.heading = null;
        vm.msg = $mdDialog.alert();
		vm.msg.ok('Aceptar');
		vm.msg.clickOutsideToClose(true);

        vm.changePage = function (key) {
            vm[key] = vm.parent.changePage(key, vm.currentPage);
        }

        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
        	
        	if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions("reclamacion_list");
        		console.log(vm.permisos);
    		}
        	
            vm.active = 0;
            vm.vista = 1;
            vm.txtTabLabel = "Listado De Reclamaciones";
            
            //Cargar las listas
            if (/reclamacion/.test(url)) {
                if (localStorage.reclamacion != undefined && localStorage.reclamacion != "") {
                    vm.gridOptions.data = JSON.parse(localStorage.reclamacion);
                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }
            
          //Abrir el detalle de la póliza cuando si tiene parametro
            if ($routeParams.id != null) {
                var consulta = JSON.parse(localStorage.reclamacion);
                var fila = _.filter(reclamacion, { 'ID_SOLICITUD': $routeParams.id })

                cargarDetalle(fila[0]);
            }
            
            //Reaccionar los cambios por los componentes
            this.$onChanges = function () {
                vm.vista = vm.view;

                if (vm.parent.url == 'reclamaciones_list')
                    vm.tipo = 'reclamaciones';
            
                if (vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /reclamaciones/.test(url)) {
                    if (vm.view == 4 && vm.listBusqueda.tipo == "reclamaciones") {
                        vm.gridOptions.data = vm.listBusqueda.listas;
                        vm.active = 0;

                    }
                    if (/reclamaciones_list/.test(url)) {
                        vm.gridOptions.data = vm.listBusqueda;
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
            vm.gridOptions = {
                enableSorting: true,
                enableHorizontalScrollbar: 0,
                paginationPageSizes: [15, 30, 50],
                paginationPageSize: 30,
                // reeRowHeaderAlwaysVisible: true,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior">' +
                    '<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'consultas\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                    '<div class="contenedorElemento"><span>Pendiente gestión manual</span><span class="elementoLeyenda leyendaBlanco"></span></div>' +
                    '<div class="contenedorElemento"><span>Solicitud finalizada</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
                    '<div class="contenedorElemento"><span>Solicitud rechazada</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
                    '<div class="contenedorElemento"><span>En proceso automático</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
                    '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                columnDefs: [
//                    {
//                        name: 'OTIPO_SOLICITUD.DS_TIPO_SOLICITUD',
//                        displayName: 'Tipo de solicitud',
//                        grouping: { groupPriority: 0 },
//                        sort: { priority: 0, direction: 'asc' },
//                        width: 238,
//                        cellTooltip: function (row) {
//                            if (row.entity.OTIPO_SOLICITUD != undefined)
//                                return row.entity.OTIPO_SOLICITUD.DS_TIPO_SOLICITUD;
//                        },
//                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
//                    },
                   
                    {
                        field: 'ID_SOLICITUD', displayName: 'Reclamación',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'remesa\', row)">{{row.entity.ID_SOLICITUD}}</a></div>',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'OCLIENTE.NO_NOMBRE_COMPLETO', displayName: 'Cliente',
                        cellTooltip: function (row) {
                            if (row.entity.OCLIENTE != undefined)
                                return row.entity.OCLIENTE.NO_NOMBRE_COMPLETO;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'OPOLIZA.NU_POLIZA', displayName: 'Póliza',
                        cellTooltip: function (row) {
                            if (row.entity.OPOLIZA != undefined)
                                return row.entity.OPOLIZA.NU_POLIZA;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'DS_SITUACION_SOLICITUD', displayName: 'Estado',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.DS_SITUACION_SOLICITUD;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'DS_TIPO_COLECTIVO', displayName: 'Colectivo',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.DS_TIPO_COLECTIVO;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'DS_TIPO', displayName: 'Canal',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.DS_TIPO;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'CO_USU_RECEPTOR', displayName: 'Usuario receptor',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.CO_USU_RECEPTOR;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'NO_USU_EMISOR', displayName: 'Creado por',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.NO_USU_EMISOR;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'FT_USU_ALTA', displayName: 'Fecha de Alta', cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.FT_USU_ALTA;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'FD_VALIDACION', displayName: 'Fecha de Validación', cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.FD_VALIDACION;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'FD_CONFIRMACION', displayName: 'Fecha de Confirmación', cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.FD_CONFIRMACION;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'FD_CIERRE', displayName: 'Fecha de Resolución', cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellTooltip: function (row) {
                            if (row.entity != undefined)
                                return row.entity.FD_CIERRE;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    }
                ],
                onRegisterApi: function (gridApi) {
                    vm.gridApi = gridApi;
                    vm.gridApi.grid.registerDataChangeCallback(function () {
                        vm.gridApi.treeBase.expandAllRows();
                    });
                }
            }
            
            function colorearEstado(entidad) {
                if (entidad.ID_SOLICITUD != null) {
                    if (entidad.ID_SITUACION_SOLICITUD == 3) {
                        return 'filaRoja';
                    } else if (entidad.ID_SITUACION_SOLICITUD == 4) {
                        return 'filaAmarilla';
                    } else if (entidad.ID_SITUACION_SOLICITUD == 9) {
                        return 'filaNaranja';
                    }
                }
                else {
                    return 'rowGroup';
                }

            }
            
          //Cargar la plantilla de busqueda
            this.loadTemplate = function () {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.reclamacion.html";
            }
            

            vm.abrirNuevaReclamacion = function () {
            	vm.nuevaReclamacion = [];
            	 vm.heading = "Reclamacion cliente";
                 vm.headTipo = "Reclamacion";

            	
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
                         vm.nuevaReclamacion.push(vm.headTipo);
                         vm.active = vm.numDetalles.length;
                     } else {
                     	vm.numDetalles = [];
                         setTimeout( function () { 
                                 vm.numDetalles.push(null);
                                 vm.nuevaReclamacion.push(vm.headTipo);
                                 vm.active = vm.numDetalles.length;
                             }, 
                         10);
                     }
             	}
             }
            
            //Borrar casillas al cambiar
            vm.clearModel = function () {
                angular.forEach(vm.form, function (value, key) {
                    value.value = "";
                });
            }

            //Botón para ver el detalle
            vm.verDetalle = function (fila, key, index) {
            	cargarDetalle(fila);
            }

             //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {

            var index = vm.numDetalles.indexOf(tab);
 
            vm.numDetalles.splice(index, 1);
            if(vm.nuevaSolicitud != undefined) {
                vm.nuevaSolicitud.splice(index, 1);
            }
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        function cargarDetalle(fila) {

            var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null) {
                    if(vm.numDetalles[i].ID_SOLICITUD === fila.ID_SOLICITUD){
                        existe = true;
                        break;
                    }
    			}
    		}
    		if(!existe) {
    			
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
                
			} else {
                vm.active = vm.numDetalles.length;
            }

        }
       }
    }
    ng.module('App').component('busquedaReclamaciones', Object.create(busquedaReclamacionesComponent));

})(window.angular);