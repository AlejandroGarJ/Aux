(function(ng) {	

	//Crear componente de busqueda
    var filtrosBajaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'TiposService', 'BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosBajaComponent.controller = function filtrosBajaComponentController($routeParams, TiposService, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
    	vm.tipos = {};
    	vm.calendar = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		TiposService.getCompania({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.TIPOS.TIPO;
				}
			});
    		
    	}
    
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.bajasVehiculos.html";
    	}
    	
    	vm.buscar = function(tipo){
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
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosBajaApp', Object.create(filtrosBajaComponent));    
})(window.angular);