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
			
			if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
				vm.parent.ckPermisos = vm.permisos;
    		}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
            vm.active = 0;
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
    		    columnDefs: [
    		      {field: 'ID_ALARMA', 
    		    	  displayName: 'Nº Alarma', 
    		    	  cellTooltip: function(row){return row.entity.ID_ALARMA},
    		      },
    		      {field: 'DS_ALARMA', displayName: 'Detalle alarma', cellTooltip: function(row){return row.entity.DS_ALARMA}},
    		      {field: 'CO_DATO', displayName: 'Solicitud', cellTooltip: function(row){return row.entity.CO_DATO}},
//    		      {field: 'DS_TIPOEMPLEADO', displayName: 'S', cellTooltip: function(row){return row.entity.DS_TIPOEMPLEADO}},
    		      {field: 'FT_USU_ALTA', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}},
    		      {field: 'NO_USU_RECEPTOR', displayName: 'Usuario receptor', cellTooltip: function(row){return row.entity.NO_USU_RECEPTOR}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.colectivos.html";
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

    
    ng.module('App').component('busquedaColectivos', Object.create(busquedaComponent));
    
})(window.angular);