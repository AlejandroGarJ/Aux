(function(ng) {	

	//Crear componente de busqueda
    var filtrosAvisosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAvisosComponent.controller = function filtrosAvisosComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.form = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.form.ID_TIPO_ARCHIVO = { value: "230" };
    		var usuario = vm.parent.perfil;
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.avisos.html";
    	}
    	
    	vm.buscar = function(tipo){
			if(vm.parent.filtrar(vm.form, tipo, true)){
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		vm.form.ID_TIPO_ARCHIVO = { value: "230" };
			vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosAvisosApp', Object.create(filtrosAvisosComponent));    
})(window.angular);