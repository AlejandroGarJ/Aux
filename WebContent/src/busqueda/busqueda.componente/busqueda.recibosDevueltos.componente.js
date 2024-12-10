(function (ng) {


    //Crear componente de busqeuda
    var busquedaRecibosDevueltosComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$mdDialog', 'BASE_SRC', '$location'],
        require: {
            parent: '^busquedaApp'
        },
        bindings: {
            idPoliza: '<',
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
			isClient: '<'
        }
    }

    busquedaRecibosDevueltosComponent.controller = function busquedaRecibosDevueltosComponentController($mdDialog, BASE_SRC, $location) {
        var vm = this;
        var json = {};
        var url = window.location;
        vm.numDetalles = [];
        vm.actives = 0;
        vm.callGetDetail = true;
        vm.heading = null;
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.vista = 1;
            vm.inDuplicado = "";
            
            if (window.location.href.includes('?')) {
                var url = window.location.href.split('?');
                if (url.length > 1) {
                	vm.inDuplicado = url[1];
                    //window.history.replaceState({}, null, url[0]);
                }
            }
            
          
            //Cargar permisos
            vm.permisos = vm.parent.parent.getPermissions('recibos_devueltos_dashboard');
            vm.parent.ckPermisos = vm.permisos;
           
            
            if(vm.inDuplicado == "0"){
                vm.parent.buscar({'IN_DEVUELTO': true}, "recibosDevueltos");
            }else{
                vm.parent.buscar({'IN_DEVUELTO': true,     'IN_DUPLICADO' : vm.inDuplicado}, "recibosDevueltos");
            }
 
        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;
        	
                vm.gridRecibos.data = vm.listBusqueda;
                vm.active = 0;
                
            if(vm.listBusqueda != null && vm.listBusqueda != undefined && vm.listBusqueda.length > 0){
            		switch(vm.inDuplicado){
	            		case '1':
	            			vm.txtTabLabel = "Recibos sin gestionar";
	            			break;
	            		case '2':
	            			vm.txtTabLabel = "Recibos gestionados automáticamente";
	            			break;
	            		case '3':
	            			vm.txtTabLabel = "Recibos enviados al cobro";
	            			break;
	            		case '4':
	            			vm.txtTabLabel = "Recibos en proceso";
	            			break;
	               		case '0':
	            			vm.txtTabLabel = "Recibos totales";
	            			break;
            		}
            }
                
        }

        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridRecibos = {
    		enableSorting: true,
            enableHorizontalScrollbar: 0,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'NU_RECIBO', displayName: 'Recibo', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'recibodevuelto\', row)">{{row.entity.NU_RECIBO}}</a></div>',
                    cellTooltip: function (row) { return row.entity.NU_RECIBO },
                },
                {
                    field: 'DS_DEVUELTO', displayName: 'Motivo devolución',
                    cellTooltip: function (row) { return row.entity.DS_DEVUELTO },
                },
                {
                    field: 'OPOLIZA.NU_POLIZA', displayName: 'Póliza',
                    cellTooltip: function (row) { return row.entity.OPOLIZA.NU_POLIZA },
                },
                {
                    field: 'OPOLIZA.DS_SITUAPOLIZA', displayName: 'Estado póliza',
                    cellTooltip: function (row) { return row.entity.OPOLIZA.DS_SITUAPOLIZA },
                },
                {
                    field: 'OPAGADOR.NO_NOMBRE_COMPLETO', displayName: 'Tomador',
                    cellTooltip: function (row) { return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO },
                },
                {
                    field: 'IM_RECIBO_TOTAL', displayName: 'Importe total', cellFilter: 'currency:"€" : 2',
                },
                {
                    field: 'FD_INICIO_REC', displayName: 'Fecha de Inicio', cellFilter: 'date:\'dd/MM/yyyy\'',
                    cellTooltip: function (row) { return row.entity.FD_INICIO_REC },
                },
                {
                    field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Vía de pago',
                    cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
                },
                { field: 'DS_TIPORECIBO', displayName: 'Tipo de recibo',
					cellTooltip: function (row) { return row.entity.DS_TIPORECIBO },
				}
            ]
        };

        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
            return BASE_SRC + "busqueda/busqueda.view/busqueda.recibosDevueltos.html";
        }
        
        //volver al dashboard
		vm.volverDash = function(){
			$location.path('recibos_devueltos_dashboard');
			$location.replace();
		}

        //Borrar casillas al cambiar
        vm.clearModel = function () {
            angular.forEach(vm.form, function (value, key) {
                value.value = "";
            });
        }
        
        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function (fila, key, index) {
            cargarDetalle(fila);
        }

        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
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
        

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        function cargarDetalle(fila) {
        	vm.callGetDetail = true;

            var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null) {
                    if(vm.numDetalles[i].ID_RECIBO === fila.ID_RECIBO){
                        existe = true;
                        break;
                    }
    			}
    		}
    		if(!existe) {   			
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
     			
			} else {
                vm.active = vm.numDetalles.length;
            }

        }
    }

    ng.module('App').component('busquedaRecibosDevueltos', Object.create(busquedaRecibosDevueltosComponent));

})(window.angular);