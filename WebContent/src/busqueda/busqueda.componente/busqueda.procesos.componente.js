(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC){
    	var vm=this;
    	var json = {};
    	var url=window.location
    	vm.numDetalles = [];
        vm.nomDetalles = [];
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
			
			if(/procesos_main/.test(url)){
				vm.parent.buscar({}, "procesos");
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
//    			paginationPageSizes: [15,30,50],
//    		    paginationPageSize: 30,
//    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
    		      {field: 'ID_PROCESO', 
    		    	  displayName: 'Identificador', 
    		    	  width: "5%",
    		    	  cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'proceso\', row)">{{row.entity.ID_PROCESO}}</a></div>',
    		    	  cellTooltip: function(row){return row.entity.ID_PROCESO},
    		      },
    		      {field: 'ACTIVO', width: "4%", displayName: 'Activo', cellTooltip: function(row){return row.entity.FD_NEXT_EXEC}, cellTemplate: '<div class="ui-grid-cell-contents text-center"><md-icon ng-if="row.entity.IN_BAJA_REG == \'0\'" class="done-icon">done</md-icon><md-icon ng-if="row.entity.IN_BAJA_REG == \'1\'" class="clear-icon">clear</md-icon></div>'},
    		      {field: 'NO_PROCESO', displayName: 'Tipo de proceso', cellTooltip: function(row){return row.entity.NO_PROCESO}},
    		      {field: 'DS_PROCESO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_PROCESO}},
    		      {field: 'FD_LAST_EXEC', width: "10%", cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha ult. ejecución', cellTooltip: function(row){return row.entity.FD_LAST_EXEC}},
    		      {field: 'FD_NEXT_EXEC', width: "10%", cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha prox. ejecución', cellTooltip: function(row){return row.entity.FD_NEXT_EXEC}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"busqueda/busqueda.view/busqueda.procesos.html";
    	}
    	
    	//Link para ver el detalle viene del Ui-grid
        vm.verDetalle = function (fila, key) {
            vm.llave = {};
            vm.llave = key;
            cargarDetalle(fila);
        }

        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila) {
            if (!vm.numDetalles.includes(fila)) {
                vm.numDetalles.push(fila);
                vm.nomDetalles.push(vm.llave);
                vm.active = vm.numDetalles.length;
            }else{
            	var index = vm.numDetalles.indexOf(fila);
            	if(vm.nomDetalles[index]!=vm.llave){
            		if(index > -1){
            			vm.numDetalles.splice(index, 1);
            			vm.nomDetalles.splice(index, 1);
            		}
            		vm.numDetalles.push(fila);
                    vm.nomDetalles.push(vm.llave);
                    vm.active = vm.numDetalles.length;
            	}
            }
        }
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){		
    		console.log(index);
    		vm.numDetalles.splice(index,1);
    		vm.active = 0;
    		console.log(vm.numDetalles);
    	}
    	
    }

    
    ng.module('App').component('busquedaProcesos', Object.create(busquedaComponent));
    
})(window.angular);