(function(ng) {	

	//Crear componente de busqueda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$timeout', '$window', 'validacionesService', '$routeParams', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
            }
    } 
    
    busquedaComponent.controller = function busquedaComponentController($location, $timeout, $window, validacionesService, $routeParams, sharePropertiesService, TiposService, BusquedaService, uiGridConstants, BASE_SRC){
    	var vm=this;
    	var json = {};
    	var url = $location.url();
    	vm.numDetalles = [];
    	
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
			vm.vista = 1;
			
			if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('tarifas_list');
				vm.parent.ckPermisos = vm.permisos;
			}
    		
    		//Cargar las listas
    		if(/tarifas/.test(url)){
    			if(localStorage.tarifas != undefined && localStorage.tarifas != ""){
    				vm.gridOptions.data = JSON.parse(localStorage.tarifas);
    				vm.vista = 4;
    			}
    			else{
    				localStorage.clear();
    			}
    		}
			
    	}
    	
    	//Reaccionar los cambios por los componentes
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		if(vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /polizas/.test(url)){
    			if(vm.view == 4 && vm.listBusqueda.tipo == "polizas"){
	    			vm.gridOptions.data = vm.listBusqueda.listas;
	    			//vm.active = vm.dsActive;
	    			vm.active = 0;
	    		}
    			if(/polizas/.test(url)){
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
    		    treeRowHeaderAlwaysVisible: true,
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{field: 'ID_TARIFAS_D', 
						  displayName: 'Código Tarifa', 
						  width: '5%',
						  cellTooltip: function(row){return row.entity.ID_TARIFAS_D},
					},
					{field: 'DS_TIPOS', displayName: 'Tipo de vehículo', width: '9%', cellTooltip: function(row){return row.entity.DS_TIPOS}},
					{field: 'DS_MODELO', displayName: 'Descripción del vehículo', width: '7%', cellTooltip: function(row){return row.entity.DS_MODELO}},
					{field: 'FD_INI', displayName: 'Fecha inicio', cellFilter: 'date:\'dd/MM/yyyy\'', width: '7%', cellTooltip: function(row){return row.entity.FD_INI}},
					{field: 'FD_FIN', displayName: 'Fecha fin', cellFilter: 'date:\'dd/MM/yyyy\'', width: '7%', cellTooltip: function(row){return row.entity.FD_FIN}},
					{field: 'ID_NEGOCIO', displayName: 'Código negocio', width: '4%', cellTooltip: function(row){return row.entity.ID_NEGOCIO}},
					{field: 'NU_DOCUMENTO', displayName: 'Código del tomador', width: '10%', cellTooltip: function(row){return row.entity.NU_DOCUMENTO}},
					{field: 'ID_COMP_RAMO_PROD', displayName: 'Código producto', width: '7%', cellTooltip: function(row){return row.entity.ID_COMP_RAMO_PROD}},
					{field: 'IM_PNETA', displayName: 'Prima neta', width: '7%', cellTooltip: function(row){return row.entity.IM_PNETA}},
					{field: 'IM_PTOTAL', displayName: 'Prima total', width: '7%', cellTooltip: function(row){return row.entity.IM_PTOTAL}},
					{field: 'IM_CLEA', displayName: 'IM_CLEA', width: '5%', cellTooltip: function(row){return row.entity.IM_CLEA}},
					{field: 'IM_IPS', displayName: 'IM_IPS', width: '5%', cellTooltip: function(row){return row.entity.IM_IPS}},
					{field: 'IM_OFESAUTO', displayName: 'IM_OFESAUTO', width: '5%', cellTooltip: function(row){return row.entity.IM_OFESAUTO}},
					{field: 'IM_CCS_SO', displayName: 'IM_CCS_SO', width: '5%', cellTooltip: function(row){return row.entity.IM_CCS_SO}},
					{field: 'IM_CCS_RE', displayName: 'IM_CCS_RE', width: '5%', cellTooltip: function(row){return row.entity.IM_CCS_RE}},
					{field: 'IM_CCS_ACC', displayName: 'IM_CCS_ACC', width: '5%', cellTooltip: function(row){return row.entity.IM_CCS_ACC}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
    		      //vm.grid1Api = gridApi;
    		      vm.gridApi = gridApi;
    		      //console.log(gridApi);
    		    }
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.tarifas.html";
    	}
    	
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}    	
    	
    	//Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
    	vm.verDetalle = function(fila){
    		
    		cargarDetalle(fila);
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(tab){
    		var index = vm.numDetalles.indexOf(tab);
    		vm.numDetalles.splice(index,1);
    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Abrir modal de nuevo poliza
    	vm.openNewTarifa = function() {
    		if(!vm.numDetalles.includes(null)){
    			vm.numDetalles.push(null);
    			vm.active = vm.numDetalles.length;	    			
	    		vm.actives = vm.numDetalles.length+1;
	    		vm.cargarDetalle = false;	    			
    		}
    		vm.vista = 4;
    	}
    	
    	//Función para cargar los datos al abrir el tab.
    	function cargarDetalle(fila){
    		if(!vm.numDetalles.includes(fila)){
    			vm.numDetalles.push(fila);
	    			vm.actives = vm.numDetalles.length;

    		}
    	}
    }    
    ng.module('App').component('busquedaTarifa', Object.create(busquedaComponent));    
})(window.angular);