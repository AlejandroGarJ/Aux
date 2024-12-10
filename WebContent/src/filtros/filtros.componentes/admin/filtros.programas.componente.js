(function(ng) {	

	//Crear componente de busqueda
    var filtrosProgramasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'ProveedoresService'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosProgramasComponent.controller = function filtrosProgramasComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, ProveedoresService){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.form = {};
		vm.form.NO_PROGRAMA = { value: "" };
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		var perfil = sessionStorage.getItem('perfil');
            vm.listProductos = [];
			TiposService.getProgramasProveedor({})
            .then(function successCallback(response) {
                if (response.status === 200) {
                	if(response.data.ID_RESULT == 0){
                        if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                        	vm.listProductos = response.data.TIPOS.TIPO;
                        }
                 	}
                }
            });
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.programasProveedor.html";
    	}
    	
    	vm.buscar = function(tipo){
			if(vm.parent.filtrar(vm.form, tipo, true)){
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		vm.form.NO_PROGRAMA = { value: "" };
			vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosProgramasApp', Object.create(filtrosProgramasComponent));    
})(window.angular);