(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($mdDialog, $routeParams, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		
    		TiposService.getCompania({"IN_COMISIONISTA": false})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.companias = response.data.TIPOS.TIPO;
				}
			});
    		
    		BusquedaService.buscar({}, 'concesion')
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.concesion = response.data.CONCESIONESCOMPANIAS.CONCESIONCOMPANIA;
    			}
    		});
    		
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.concesiones.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if(vm.form != undefined){
    			if(vm.parent.filtrar(vm.form, tipo, true)){
	    			//$('#checkVacio').text("Las fechas están mal");
	    			$('#checkVacio').slideDown().delay(1500).slideUp();
	    		}
    		}else{
				msg.textContent('Debe introducir al menos un criterio de búsqueda');
				$mdDialog.show(msg);
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
			vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosConcesionesApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);