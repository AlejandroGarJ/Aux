(function(ng) {	

	//Crear componente de busqueda
    var filtrosAlarmasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAlarmasComponent.controller = function filtrosAlarmasComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
    	vm.tipos = {};
    	vm.calendar = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPO_ALARMA})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.tiposAlarmas = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		// vm.colectivos = vm.parent.colectivos;
    		vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.alarma.html";
    	}
    	
    	vm.buscar = function(tipo){
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
						if(value.value == "" || value.value==null){
							delete vm.form[key];
						}
					});
				if(vm.parent.filtrar(vm.form, tipo)){
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
	//                $mdDialog.show({
	//    			templateUrl: BASE_SRC+'filtros/filtros.error.html',
	//    			controllerAs: '$ctrl',
	//    			clickOutsideToClose:true,
	//    			parent: angular.element(document.body),
	//    		    fullscreen:false,
	//    		    controller:['$mdDialog', function($mdDialog){
	//    		    	var md = this;
	//    	    	    md.cancel = function() {
	//    	    	      $mdDialog.cancel();
	//    	    	    };
	//                }]
	//    		});
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosAlarmasApp', Object.create(filtrosAlarmasComponent));    
})(window.angular);