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
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.alarmas != undefined && localStorage.alarmas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.alarmas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			if(/pendientes/.test(url)){
				vm.parent.buscar({}, "alarmas");
			}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		//vm.active = vm.dsActive;
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
      		    
				  {field: 'ID_CAMPAIGN', displayName: 'Identificador', cellTooltip: function(row){return row.entity.ID_CAMPAIGN}},
				  {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function(row){return row.entity.NO_COMPANIA}},
				  {field: 'DS_SHORT', displayName: 'Nombre Camapaña', cellTooltip: function(row){return row.entity.DS_SHORT}},
      		      {field: 'NO_RAMO', displayName: 'Ramo', cellTooltip: function(row){return row.entity.NO_RAMO}},
				  {field: 'DS_COLECTIVO', displayName: 'Colectivo', cellTooltip: function(row){return row.entity.DS_COLECTIVO}},
				  {field: 'DS_TIPOS', displayName: 'Canal', cellTooltip: function(row){return row.entity.DS_TIPOS}},
      		      {field: 'FT_START_CAMPAIGN', displayName: 'Fecha Inicio',  cellFilter: 'date:\'dd/MM/yyyy\'',  cellTooltip: function(row){return row.entity.FT_START_CAMPAIGNO}},
      		      {field: 'FT_END_CAMPAIGN', displayName: 'Fecha Fin',  cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_END_CAMPAIGN}},
      		      
      		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.campanas.html";
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		if(!vm.numDetalles.includes(fila)){
    			vm.numDetalles.push(fila);
    		
	    		vm.cargarDetalle = true;
	    		$timeout(function(){
	    			vm.active = vm.numDetalles.length;
	    			
	    			vm.actives = vm.numDetalles.length+1;
	    			vm.cargarDetalle = false;
	    			
	    		},3000)
    		}
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		console.log(index);
    		vm.numDetalles.splice(index,1);
    		vm.active = 0;
    		console.log(vm.numDetalles);

    	}
    	
    	//Cambiar los tipos de identificación
    	/*vm.changeType=function(){
    		//this.form.tipo.value = "";
            this.updateModel('NU_DOCUMENTO','cliente');
            //this.resetErrors();
    	}
    	
    	//Valida el CIF y DNI
    	this.updateModel = function(id, tipo) {
    		
    		this.form.NU_DOCUMENTO.$error=null;
    		var errors=null;
    		
        }*/
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Creamos JSON
    	function rellenarJSON(){
    		json = {};
    		vm.isError = false;
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null){
    				delete vm.form[key];
    			}
				else{
					if(value.value instanceof Date){
						json[key]=vm.parent.dateFormat(value.value);
						
						//Comprueba las fechas que no sean al revés
						angular.forEach(vm.form, function(value2, key2){
							if(!vm.isError){
								vm.isError = vm.parent.validFechas(key2, value2.value, key, value.value);
							}
						});
					}
					else if(typeof(value.value) == 'object'){
						json[key]=[]
						for(var i=0;i<value.value.length;i++){
							json[key][i]=value.value[i].id;
						}
						json[key]=json[key].toString();
					}
					else{
						json[key]=value.value;
					}
					
				}
    		});
    	}
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		localStorage.clear();
    		rellenarJSON();
    		
			console.log(vm.json);
			
			if(!vm.isError){
				if(Object.keys(json).length !== 0){
	//				 vm.completed=2;
	//	             vm.mensajeBuscar = false;
	//	             vm.loading = true;
				}
				else{
					$('#checkVacio').slideDown().delay(1500).slideUp();
				}
			}
			else{
				$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
			}
    	}
    }

    
    ng.module('App').component('busquedaCampanas', Object.create(busquedaComponent));
    
})(window.angular);