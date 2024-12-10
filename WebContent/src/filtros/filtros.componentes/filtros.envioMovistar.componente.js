(function(ng) {	

	//Crear componente de busqueda
    var filtrosEnvioMovistarComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'UsuarioService', 'uiGridConstants', 'ColectivoService','BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosEnvioMovistarComponent.controller = function filtrosEnvioMovistarComponentComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, UsuarioService, ColectivoService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.calendar = {};
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
            
            var perfil = sessionStorage.getItem('perfil');
       }
			
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.envioMovistar.html";
    	}
    	  	
    	//Buscar
    	vm.buscar = function(tipo){
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
						if(value == null || (value.value == "" || value.value==null)){
							delete vm.form[key];							
						}
					});
				if(vm.form != null && Object.keys(vm.form).length !== 0){
					vm.parent.filtrar(vm.form, tipo);

				}else{
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(form){
    		angular.forEach(form, function(value,key){
    			if(form != null)
    				form[key] = undefined;				 
			});
    		
    		if (vm.filtro != null) {
    			vm.filtro.vista = 1;
    		}
    		
			return form;
		}

		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}


    }    
    ng.module('App').component('filtrosEnviomovistarApp', Object.create(filtrosEnvioMovistarComponent));    
})(window.angular);