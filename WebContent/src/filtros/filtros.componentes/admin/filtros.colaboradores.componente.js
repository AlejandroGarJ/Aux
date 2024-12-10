(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC){
    	var vm=this;
    	var json = {};
    	vm.tipos = {};
        var url = $location.url();
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var documentoColaboradorUrl = vm.filtro.getUrlParam('documentoColaborador', url);
            if (documentoColaboradorUrl != null && documentoColaboradorUrl != "") {
            	if (vm.form == null) {
            		vm.form = {};
            	}
            	
            	vm.form.NU_CIF = {
        			value: documentoColaboradorUrl
            	}
            	
            	vm.buscar('tipo-comisionistas');
            }
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.colaboradores.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if (vm.form == undefined){
    			vm.form = {};
			}
    		
    		vm.form.IN_COMISIONISTA = { value: true};
    		if(vm.parent.filtrar(vm.form, tipo, true)){
    			//$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosColaboradoresApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);