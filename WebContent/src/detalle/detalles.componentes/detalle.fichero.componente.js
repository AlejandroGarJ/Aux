(function(ng) {	

	//Crear componente de app
    var ficheroComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', 'uiGridConstants','BASE_SRC', 'FicherosService'],
    		require: {
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		},
    		bindings: {
                idDetalle: '<',
            }
    }
    
    ficheroComponent.controller = function ficheroComponentControler($mdDialog, uiGridConstants, BASE_SRC, FicherosService){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
    	vm.listFiles = [];
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.listFicheros = [];
		
    	this.$onInit = function(bindings) {
    		vm.datos = vm.parent.idDetalle;
    		
    		FicherosService.getErroresFicheros({"ID_TIPO_ARCHIVO": vm.datos.ID_TIPO_ARCHIVO})
    		.then(function successCallBack(response){
    			if(response.status == 200){
    				if(response.data.FICHEROS != undefined && response.data.FICHEROS.FICHERO != undefined){
    					vm.listFicheros = response.data.FICHEROS.FICHERO;
    				}
    				if(vm.listFicheros != undefined && vm.listFicheros.length > 0){
    					vm.gridOptions.data = vm.listFicheros;
    				}
				}
    		});
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.fichero.html";
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableCellEdit: false,
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
//    		      {name: 'DS_NIVEL_ERROR', displayName: 'Ramo', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' }, cellTooltip: function (row) { return row.entity.DS_NIVEL_ERROR } },
      		      {field: 'DS_TIPO_COLECTIVO', displayName: 'Partner', cellTooltip: function(row){return row.entity.DS_TIPO_COLECTIVO}},
      		      {field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Via de pago', cellTooltip: function(row){return row.entity.DS_TIPO_MEDIO_PAGO}},
      		      {field: 'DS_NIVEL_ERROR', displayName: 'Nivel Error', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' }, cellTooltip: function(row){return row.entity.DS_NIVEL_ERROR}},
      		      {field: 'CO_DATO', displayName: 'Código', cellTooltip: function(row){return row.entity.CO_DATO}},
      		      {field: 'DS_ERROR', displayName: $translate.instant('DESCRIPTION'), cellTooltip: function(row){return row.entity.DS_ERROR}},
      		      {field: 'OB_ERROR', displayName: 'Observaciones', cellTooltip: function(row){return row.entity.OB_ERROR}},
      		      {field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}}
  		        ],
    		    onRegisterApi: function( gridApi ) {
    		    	vm.gridApi = gridApi;
      		    }
    	}
    	
    	//Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
        }
    	
    }   
    
    ng.module('App').component('ficheroSd', Object.create(ficheroComponent));
    
})(window.angular);