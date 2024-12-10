(function(ng) {	

	//Crear componente de busqeuda
    var busquedaMovimientosEconomicosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', '$mdDialog', '$scope', '$templateCache', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'SiniestroService', 'PolizaService', 'BASE_SRC', 'TiposService', 'constantsTipos'],
    		require: {
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
 
    busquedaMovimientosEconomicosComponent.controller = function busquedaMovimientosEconomicosComponentController($q, $location, $timeout, $window, $mdDialog, validacionesService, sharePropertiesService, BusquedaService, PolizaService, SiniestroService, $scope, $templateCache, BASE_SRC, TiposService, constantsTipos){
    	var vm=this;
    	vm.mensajeBuscar = true;
    	var url = $location.url();
    	vm.numDetalles = [];
    	vm.nomDetalles = [];
    	vm.cargarDetalle = [];
    	vm.intoCliente = false;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;

		$templateCache.put('ui-grid/selectionRowHeaderButtons',
        	    "<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('movimientos_economicos');
    		}
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPO_MOV})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.movEcon = response.data.TIPOS.TIPO;
    			}
    		});
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
            
    		if(vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /movimientos_economicos/.test(url)){
    			if(vm.view == 4 && vm.listBusqueda.tipo == "movimientos_economicos"){
	    			vm.gridOptions.data = vm.listBusqueda.listas;
	    			//vm.active = vm.dsActive;
	    			vm.active = 0;
	    		}
    			if(/movimientos_economicos/.test(url)){
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
					'<div class="contenedorElemento"><span>Cerrados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
					'<div class="contenedorElemento"><span>Rechazados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
				'</div>', 
				paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
				columnDefs: [
					{field: 'NU_SINIESTRO', displayName: $translate.instant('CLAIM_NUMBER'), cellTooltip: function (row) {return row.entity.NU_SINIESTRO},  },
					{field: 'ID_MOV_ECOM', displayName: 'Id movimiento', cellTooltip: function (row) {return row.entity.ID_MOV_ECOM}, 
						cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'movimiento\', row)">{{row.entity.ID_MOV_ECOM}}</a></div>', },
					{field: 'CO_TIPOMOV', displayName: $translate.instant('MOVEMENT_TYPE'), 
						cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDsTipoMov(row.entity.CO_TIPOMOV)}}</div>',
						cellTooltip: function (row) {
							return vm.getDsTipoMov(row.entity.CO_TIPOMOV);
						}
					},
					{field: 'DS_PERCEPTOR', displayName: 'Proveedor', cellTooltip: function (row) {return row.entity.DS_PERCEPTOR},  },
					{field: 'IM_TOTAL', displayName: 'Importe total', 
						cellTemplate: '<div ng-if="row.entity.IM_TOTAL != null && row.entity.IM_TOTAL != 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_TOTAL)}} €</div><div ng-if="row.entity.IM_TOTAL == null || row.entity.IM_TOTAL == 0" class="ui-grid-cell-contents">{{grid.appScope.$ctrl.beautifyImporte(row.entity.IM_BASE)}} €</div>',
						cellFilter: 'currency: "€" : 2', cellTooltip: function (row) {return row.entity.IM_TOTAL},  },
					{field: 'FT_MOV', displayName: 'Fecha movimiento', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_MOV}},
					{field: 'NU_SAP', displayName: 'Enviado a SAP', 
						cellTemplate: '<div style="text-align: center" ng-if="row.entity.NU_SAP != undefined" class="ui-grid-cell-contents"><span class="ui-grid-icon-ok"></span></div>',
						cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function (row) {return row.entity.FT_MOV}
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
			return BASE_SRC+"busqueda/busqueda.view/busqueda.movimientosEconomicos.html";
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
		
		vm.getDsTipoMov = function (coTipoMov) {
			var dsTipoMov = "";

			if (vm.movEcon != null && vm.movEcon.length > 0) {
				var objMov = vm.movEcon.find(x => x.CO_TIPO == coTipoMov);

				if (objMov != null) {
					dsTipoMov = objMov.DS_TIPOS;
				}
			}

			return dsTipoMov;
		}
		
        vm.exportarExcel = function () {
            if (vm.parent.form != null) {
            	vm.parent.form.IS_SELECTED = true;
            }
            
            vm.parent.exportarExcel();
        }
		
		vm.beautifyImporte = function (x) {
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
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		vm.llave = {};
            vm.llave = key;
            cargarDetalle(fila);
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
          var idPoliza = fila.ID_POLIZA;
            var idSiniestro = fila.ID_SINIESTRO;
            var ruta = 'polizas\\'+ idPoliza + '\\siniestros\\' + idSiniestro;
                
            vm.parent.parent.getDocuments(ruta, 229);
        }	
		
		vm.formatDecimal = function (number) {
			if (number != null && number != 0 && number != "") {
				//Si tiene decimales, redondear a 2
				if (number % 1 != 0) {
			         number = number.toFixed(2)
			    }
			}
			
			return number;
		}	
    }

    
    ng.module('App').component('busquedaMovimientosEconomicos', Object.create(busquedaMovimientosEconomicosComponent));
    
})(window.angular);