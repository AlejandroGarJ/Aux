(function(ng) {	

	//Crear componente de busqueda
    var filtrosRecibosDevueltosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosRecibosDevueltosComponent.controller = function filtrosRecibosDevueltosComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
    	vm.calendar = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){

    		TiposService.getTipos({"ID_CODIGO": constantsTipos.DEVOLUCIONES})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.motivos = response.data.TIPOS.TIPO;
    			}
    		}, function callBack(response){
    			if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
    		});

    	}
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.recibosDevueltos.html";
    	}
    	
    	vm.buscar = function(tipo){
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
						if(value.value == "" || value.value==null){
							delete vm.form[key];
						}
					});
				if (window.location.href.includes('?')) {
	                var url = window.location.href.split('?');
	                if (url.length > 1) {
	                	vm.inDuplicado = url[1];
	                	vm.form.IN_DUPLICADO = {};
	                	vm.form.IN_DUPLICADO.value = vm.inDuplicado;
	                }
	            }
				if(vm.parent.filtrar(vm.form, tipo)){
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);    			

				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosRecibosDevueltosApp', Object.create(filtrosRecibosDevueltosComponent));    
})(window.angular);