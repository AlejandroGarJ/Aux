(function (ng) {


    //Crear componente de busqeuda
    var busquedaSolicitudesComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$location', '$timeout', '$window', '$mdDialog', '$translate', 'validacionesService', '$routeParams', 'sharePropertiesService', 'BusquedaService', 'uiGridConstants', 'BASE_SRC', 'PolizaService', 'SolicitudService'],
        require: {
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            datosCliente: '<',
            isConsultagdpr: '<'
        }
    }

    busquedaSolicitudesComponent.controller = function busquedaSolicitudesComponentController($q, $location, $timeout, $window, $mdDialog, $translate, validacionesService, $routeParams, sharePropertiesService, BusquedaService, uiGridConstants, BASE_SRC, PolizaService, SolicitudService) {
        var vm = this;
        var json = {};
        vm.db = sharePropertiesService.get('db');
        var url = window.location;
        vm.numDetalles = [];
        vm.nomDetalles = [];
        vm.actives = 0;
        vm.callGetDetail = true;
        vm.heading = null;
        vm.msg = $mdDialog.alert();
		vm.msg.ok('Aceptar');
		vm.msg.clickOutsideToClose(true);
        vm.screenHeight = $window.innerHeight;

 
        vm.changePage = function (key) {
            vm[key] = vm.parent.changePage(key, vm.currentPage);
        }

        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.isPendiente = false;
            vm.vista = 1;
    		/*vm.form = vm.parent.form;
			vm.dictionary = vm.parent.dictionary;
            vm.colectivos = vm.parent.colectivos;*/
            // vm.txtTabLabel = "Resultado de la búsqueda";


            if(/solicitudes_pendientes_list/.test(url)){
            	vm.isPendiente = true;
            }
            
            //Cargar permisos
            //Según la url se coge el 520 o el 510
            var coSolicitud = 510;
    		if(vm.parent.parent.getPermissions != undefined && /solicitudes_list/.test(url)){
    			coSolicitud = 'solicitudes_list';
    		}else if(vm.parent.parent.getPermissions != undefined && /solicitudes_pendientes_list/.test(url)){
    			coSolicitud = 'solicitudes_list';
    		} else {
    			coSolicitud = 'solicitudes_list';
    		}
    		
            vm.permisos = vm.parent.parent.getPermissions(coSolicitud);
//            vm.parent.ckPermisos = vm.permisos;
            
    		//Si no existen menús con ese código, se prueba con el otro
    		if(vm.permisos.EXISTE == false){
    			if(coSolicitud == 510){
    				coSolicitud = 'solicitudes_list';
    			}else{
    				coSolicitud = 'solicitudes_list';
    			}
    				
                vm.permisos = vm.parent.parent.getPermissions(coSolicitud);
//                vm.parent.ckPermisos = vm.permisos;
    		}
    		
            //Cargar las listas
            if (/solicitudes/.test(url)) {
                if (localStorage.solicitud != undefined && localStorage.solictud != "") {
                    vm.gridOptions.data = JSON.parse(localStorage.solicitud);
                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }

            //Abrir el detalle de la póliza cuando si tiene parametro
            if ($routeParams.id != null) {
                var solicitud = JSON.parse(localStorage.solicitudes);
                var fila = _.filter(solicitud, { 'NU_SOLICITUD': $routeParams.id })

                cargarDetalle(fila[0]);
            }


            if (/pendientes/.test(url)) {
                var perfil = JSON.parse($window.sessionStorage.perfil);
                //console.log(perfil);
                vm.parent.buscar({ "CO_USU_RECEPTOR": perfil.usuario }, "missolicitud");
                // vm.txtTabLabel += " Pendientes";
            }

            SolicitudService.getTiposSolicitudFilter({})
			.then(function successCallback(response){
				if (response.data != null && response.data.TIPOS_SOLICITUD != null && response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD != null) {
					var tiposSolicitudes = response.data.TIPOS_SOLICITUD.TIPO_SOLICITUD;
					vm.listSolicitudesPadre = [];
					for (var i = 0; i < tiposSolicitudes.length; i++) {
						if (tiposSolicitudes[i].ID_TIPO_SOLICITUD != null && tiposSolicitudes[i].ID_TIPO_SOLICITUDPADRE == null && vm.listSolicitudesPadre.findIndex(x => x.ID_TIPO_SOLICITUD == tiposSolicitudes[i].ID_TIPO_SOLICITUD) == -1) {
							vm.listSolicitudesPadre.push(tiposSolicitudes[i]);
						}
					}
				}
            });
        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            }

            if (vm.parent.url == 'solicitudes')
                vm.tipo = 'solicitudes';
            else
                vm.tipo = 'solicitudesBy';

            if ((vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /solicitudes/.test(url)) ||
 			   (vm.listBusqueda != null && vm.listBusqueda.listas != null && vm.gridOptions.data != vm.listBusqueda.listas)) {
                     if (vm.view == 4 && vm.listBusqueda.tipo == "solicitud") {
                         //                	vm.tipo = 'solicitudesBy';
                         vm.gridOptions.data = vm.listBusqueda.listas;
                         vm.active = 0;

                     } else if (/solicitudes/.test(url)) {
                         //                	vm.tipo = 'solicitudes';
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
                '<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'solicitudes\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '<div class="contenedorElemento"><span>Pendiente gestión</span><span class="elementoLeyenda leyendaBlanco"></span></div>' +
                '<div class="contenedorElemento"><span>Solicitud finalizada</span><span class="elementoLeyenda leyendaVerde"></span></div>' +
                '<div class="contenedorElemento"><span>Solicitud rechazada</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
                '<div class="contenedorElemento"><span>En proceso automático</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
                '</div>',
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'OTIPO_SOLICITUD.DS_TIPO_SOLICITUD',
                    displayName: $translate.instant('REQUEST_TYPE'),
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: 238,
                    cellTooltip: function (row) {
                        if (row.entity.OTIPO_SOLICITUD != undefined)
                            return row.entity.OTIPO_SOLICITUD.DS_TIPO_SOLICITUD;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'ID_SOLICITUD', displayName: $translate.instant('REQUEST'),
                    cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'solicitud\', row)">{{row.entity.ID_SOLICITUD}}</a></div>',
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'OCLIENTE.NO_NOMBRE_COMPLETO', displayName: $translate.instant('CLIENT'),
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
                    cellTemplate: `<div class="ui-grid-cell-contents">
                                    <a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410) && grid.appScope.$ctrl.parent.url != \'polizas\'" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a>
                                    <span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410) || grid.appScope.$ctrl.parent.url == \'polizas\'">{{row.entity.OPOLIZA.NU_POLIZA}}</span>
                                </div>`,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_SITUACION_SOLICITUD', displayName: $translate.instant('STATE'),
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_SITUACION_SOLICITUD;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_TIPO_COLECTIVO', displayName: $translate.instant('PARTNER'),
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_TIPO_COLECTIVO;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'DS_TIPO', displayName: $translate.instant('CHANNEL_2'),
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.DS_TIPO;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'CO_USU_RECEPTOR', displayName: $translate.instant('RECEPTOR'),
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.CO_USU_RECEPTOR;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'NO_USU_EMISOR', displayName: $translate.instant('CREATED_BY'),
                    cellTooltip: function (row) {
                        if (row.entity != undefined)
                            return row.entity.NO_USU_EMISOR;
                    },
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                },
                {
                    field: 'FT_USU_ALTA', displayName: 'Fecha de Alta', sort: { priority: 0, direction: 'asc' }, cellFilter: 'date:\'dd/MM/yyyy\'',
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
                vm.parent.translateHeaders(vm.gridOptions);
            }
        }

        //1- Pendiente
        //2- En trámite
        //9- En trámite pendiente de confirmación - Naranja
        //4- Tramitada aceptada - Amarillo
        //3- Tramitación rechazada - Rojo
        function colorearEstado(entidad) {
            if (entidad.ID_SOLICITUD != null) {
            	if (entidad.ID_SITUACION_SOLICITUD == 3) {
                    return 'filaRoja';
                } else if (entidad.ID_SITUACION_SOLICITUD == 4) {
	                    return 'filaVerde';
                } else if (entidad.ID_SITUACION_SOLICITUD == 9) {
                    return 'filaNaranja';
                }
            }
            else {
                return 'rowGroup';
            }

        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.solicitudes.html";
            } else {
                return "src/error/404.html";
            }
        }

        vm.openNewSolicitud = function (tipo) {
        	vm.nuevaSolicitud = [];
        	vm.client = [];
            // vm.vista = 4;
            // vm.active = 100;
            
        	for(var i=0; i< vm.parent.listDatos.length;i++){
		        if(vm.parent.listDatos[i].ID_CLIENTE == vm.parent.detalleCliente.OCLIENTE.ID_CLIENTE){
		           vm.client =   vm.parent.listDatos[i];       
		        }  		    
        	}

        	if(vm.parent.url == "clientes" && vm.client.NU_POLIZAS_CONTRATADAS == 0){
        		vm.msg.textContent("No existen pólizas asociadas a este cliente");
        		$mdDialog.show(vm.msg);
        		vm.cerrarTab(detalles);

        	}
			vm.heading = vm.listSolicitudesPadre.find(x => x.ID_TIPO_SOLICITUD == tipo).DS_TIPO_SOLICITUD;
			vm.headTipo = tipo;
			
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
					vm.nomDetalles.push("solicitud");
                    vm.nuevaSolicitud.push(vm.headTipo);
                    vm.active = vm.numDetalles.length;
                } else {
                    vm.numDetalles = [];
                    setTimeout( function () { 
                            vm.numDetalles.push(null);
        					vm.nomDetalles.push("solicitud");
                            vm.nuevaSolicitud.push(vm.headTipo);
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

        
        //Función que muestra una solicitud creada en el momento
        vm.showNuevaSolicitud = function(solicitud){
        	vm.callGetDetail = false;
        	if(vm.numDetalles.length > 0) {
				vm.numDetalles.splice(vm.numDetalles.length-1, vm.numDetalles.length);
			}
        	if(vm.nomDetalles.length > 0) {
				vm.nomDetalles.splice(vm.nomDetalles.length-1, vm.nomDetalles.length);
			}

			setTimeout( function () { 
					vm.numDetalles.push(solicitud);
					vm.nomDetalles.push("solicitud");
					vm.active = vm.numDetalles.length;
				}, 
			10);
        }
        
        vm.exportarExcel = function () {
        	if (vm.comprobarObjetoExportar() == true) {
	            if(vm.parent.url == 'clientes'){
	                if(vm.view == 4 && vm.listBusqueda.tipo == 'solicitud'){
	                    var idCliente = vm.parent.detalleCliente.OCLIENTE.ID_CLIENTE;
	                    vm.parent.urlExport = 'solicitudes'; 
	                    vm.parent.form = {"OCLIENTE":{"ID_CLIENTE":idCliente}};
	                }
	            }
	            vm.parent.exportarExcel();
        	} else {
                vm.msg.textContent("Debes filtrar más la búsqueda para poder exportar a excel.");
                $mdDialog.show(vm.msg);
        	}
        }
        
        vm.comprobarObjetoExportar = function () {
        	if ((vm.parent.form.OPOLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == null || vm.parent.form.OPOLIZA.NU_POLIZA == "") && (vm.parent.form.LST_ID_TIPO_POLIZA == null || vm.parent.form.LST_ID_TIPO_POLIZA.length == 0) && (vm.parent.form.LST_PRODUCTOS == null || vm.parent.form.LST_PRODUCTOS.length == 0) && (vm.parent.form.ID_SOLICITUD == null || vm.parent.form.ID_SOLICITUD == "") && (vm.parent.form.OCLIENTE == null || vm.parent.form.OCLIENTE.NU_DOCUMENTO == null || vm.parent.form.OCLIENTE.NU_DOCUMENTO == "")) {
        		return false;
        	} else {
        		return true;
        	}
        }
        
        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function (fila, key, index) {
        	if(key=='poliza'){
                PolizaService.getDetail(fila.OPOLIZA.ID_POLIZA)
                .then(function successCallback(response) {
                    vm.detallesPoliza = response.data;
                    vm.llave = key;
                    cargarDetalle(vm.detallesPoliza);
                }, function errorCallBack(response) {
                    
                });
            } else {
                vm.llave = key;
                cargarDetalle(fila);
            }
        }

        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
            if(vm.nuevaSolicitud != undefined) {
                vm.nuevaSolicitud.splice(index, 1);
            }
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        function cargarDetalle(fila) {
        	vm.callGetDetail = true;
            var existe = false;
			var dato = ''
			
            if (vm.llave == 'poliza') {
            	dato = 'ID_POLIZA';
            } else {
            	dato = 'ID_SOLICITUD';
            }
			
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null) {
                    if(vm.numDetalles[i][dato] === fila[dato]){
                        existe = true;
                        break;
                    }
    			}
    		}
    		if(!existe) {
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

    ng.module('App').component('busquedaSolicitudes', Object.create(busquedaSolicitudesComponent));

})(window.angular);