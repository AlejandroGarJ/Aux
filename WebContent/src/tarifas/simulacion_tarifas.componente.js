(function (ng) {
	
    'use strict';
    	
    //Componente de header
    var simulacionComponent = {
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        controllerAs: '$ctrl',
        $inject: ['$routeParams','BASE_SRC','$mdDialog','BusquedaService'],
        require: {
        	parent:'^sdApp'
        }
    };
    
    //vista 1: listado de resultados
    simulacionComponent.controller = function simulacionComponentController(routeParams, BASE_SRC, $mdDialog, BusquedaService) {
    	
        var vm = this;
        
        vm.vista = 1;
        
        vm.gridOptions = {
        	enableFiltering : true,
			enableHorizontalScrollbar: false,
			paginationPageSizes: [15,30,50],
		    paginationPageSize: 15,
		    treeRowHeaderAlwaysVisible: true,
		    animateRows: true,
	        enableRangeSelection: true,
	        rowData: null,
	        enableSorting:true,
		    columnDefs: [
		      {field: "NO_SIMULACION",
		    	  displayName: "Nombre",
		    	  cellTooltip: function(row){return row.entity.NO_SIMULACION},
		    	  cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.cargarDetalle(row.entity)">{{row.entity.NO_SIMULACION}}</a></div>'
    		  },
			  {field: "TXT_OBSERVACIONES", displayName: "Observaciones", cellTooltip: function(row){return row.entity.TXT_OBSERVACIONES}},
			  //{field: "ID_TIPO_POLIZA", displayName: "Código flota", cellTooltip: function(row){return row.entity.ID_TIPO_POLIZA}},
			  {field: "DS_TIPO_POLIZA", displayName: "Tipo de flota", cellTooltip: function(row){return row.entity.DS_TIPO_POLIZA}},
			  {field: "FD_INI", displayName: "Fecha de inicio", cellTooltip: function(row){return row.entity.FD_INI}},
			  {field: "FD_FIN", displayName: "Fecha de fin", cellTooltip: function(row){return row.entity.FD_FIN}},
			  {field: "IN_TERMINADO", displayName: "Finalizado", cellTooltip: function(row){return row.entity.IN_TERMINADO}},
		    ],
		    onRegisterApi: function( gridApi ) {
  		      vm.gridApi = gridApi;
  		      //gridApi = gridApi.core.refresh;
  		      //console.log(gridApi);
  		    }
    	}
        
        vm.gridOptions.data = vm.lista;
        
        vm.tabs = [];
        
        vm.openNewSimulacion = function() {
    		if(!vm.tabs.includes(null)){
    			vm.tabs.push(null);   
    			vm.simulacion = null;
    		}
    	}
		
		vm.cargarDetalle = function(fila){
		console.log(fila);
    		if(!vm.tabs.includes(fila)){
    			vm.tabs.push(fila);   
    			vm.simulacion = fila;
    		}
    	}
			
        vm.cerrarTab = function(tab){
    		var index = vm.tabs.indexOf(tab);
			vm.tabs.splice(index,1);
    	}
        
        this.$onInit = function() {
        	var json = {};
        	
			BusquedaService.buscar(json, 'simulaciones')
			.then(function successCallback(response){
			//console.log(response);
				if(response.status == 200){
					vm.lista = response.data.LISTA_SIMULACIONES.SIMULACIONES;
					
					vm.gridOptions.data = vm.lista;
				}
			}, function callBack(response){
				alert("Error"+ response.status);
			});
        }
        
        this.loadTemplate = function() {
        	return  BASE_SRC + 'tarifas/simulacion_tarifas.view.html';
        }
        
        this.$onChanges = function(){
        	/*vm.gridOptions.data = vm.lista;
        	vm.vista = vm.vista;*/
        }
        
        this.$doCheck = function() {
        	if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
        }
        
    }  
    
    ng.module('App').component('simulacionApp', simulacionComponent);
    
})(window.angular);