(function(ng) {	


	//Crear componente de busqeuda
    var ficheroProcesadoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    ficheroProcesadoComponent.controller = function ficheroProcesadoComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog){
    	var vm=this;
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.form = vm.parent.form;
            vm.dictionary = vm.parent.dictionary;
            vm.active=0;
			vm.vista = 1;
			vm.numDetalles = [];
	        vm.screenHeight = $window.innerHeight;
			
    		vm.colectivos = vm.parent.colectivos;
    		
    		angular.forEach(vm.parent.compartir, function(value, key){
				vm[key] = value;
			});
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('ficheros_procesados');
				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		
    		//Cargar las listas
			if(localStorage.ficherosProcesados != undefined && localStorage.ficherosProcesados != ""){
				angular.forEach(vm.parent.pages, function(value, key){
					vm[key] = value;
				});
				
				/*var info = vm.parent.cargarBusqueda('ficherosProcesados');
				angular.forEach(info, function(value, key){
					vm[key] = value;
				});*/
			}
			else{
				localStorage.clear();
			}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		//vm.active = vm.dsActive;
    		vm.active = 0;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
		    	  {field: 'NO_COMPANIA', 
		    		  grouping: {
		                  groupPriority: 0
		              },
		              sort: {
		                  priority: 0,
		                  direction: 'asc'
	                  },
      		    	  displayName: 'Aseguradora', 
      		    	  cellTooltip: function(row){return row.entity.NO_COMPANIA}
      		      },
    		      {field: 'NO_FICHEROS_PROCESADO', 
    		    	  displayName: 'Fichero', 
    		    	  cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'ficheroProcesado\', row)">{{row.entity.NO_FICHEROS_PROCESADO}}</a></div>',
    		    	  cellTooltip: function(row){return row.entity.NO_FICHEROS_PROCESADO}
    		      },
    		      {field: 'NO_FICHERO', displayName: 'Tipo de fichero', cellTooltip: function(row){return row.entity.NO_FICHERO}},
    		      {field: 'IN_EJECUTADO', displayName: 'Ejecutado', cellTooltip: function(row){return row.entity.IN_EJECUTADO}},
    		      {field: 'NO_USU_ALTA', displayName: 'Creado por', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.NO_USU_ALTA}},
    		      {field: 'FT_USU_ALTA', displayName: 'Creado en', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_ALTA}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.ficherosProcesados.html";
    	}
    	
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i] === fila){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe){
    			vm.numDetalles.push(fila);
                vm.active = vm.numDetalles.length;
    		}else{
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
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		var detallesAbiertos = [];
            
            if(vm.numDetalles != null){
                for(var i = 0; i < vm.numDetalles.length; i++){
                    detallesAbiertos.push(vm.numDetalles[i]);
                }
            }
            

            detallesAbiertos.splice(index,1);
            vm.numDetalles = [];
            setTimeout( function () { 
                    for(var i = 0; i < detallesAbiertos.length; i++){
                        vm.numDetalles.push(detallesAbiertos[i]);
                    }
                    
                    vm.active = vm.numDetalles.length;
                }, 
            10);

    	}
    	
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		vm.json={};
    		localStorage.clear();
    		
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || (value.value == 3 && key=='tipo')){
    				delete vm.form[key];
    			}
				else{
					vm.json[key]=value.value;
				}
			});
			
			console.log(vm.json);
			
			if(Object.keys(vm.json).length !== 0){
//				 vm.completed=2;
//	             vm.mensajeBuscar = false;
//	             vm.loading = true;
			}
			else{
				$('#checkVacio').slideDown().delay(1500).slideUp();
			}
    	}
    }

    
    ng.module('App').component('busquedaProcesadoficheros', Object.create(ficheroProcesadoComponent));
    
})(window.angular);