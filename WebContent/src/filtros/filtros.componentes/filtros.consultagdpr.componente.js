(function(ng) {	

	//Crear componente de busqueda
    var filtrosConsultagdprComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog'],
    		require: {
                parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosConsultagdprComponent.controller = function filtrosConsultagdprComponentComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivoss = {};
    	vm.calendar = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		TiposService.getTipoDocumento({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
			// ColectivoService.getListColectivos({})
			// .then(function successCallback(response) {
			// 	if(response.status == 200){
			// 		vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
			// 	}
			// }, function callBack(response) {
			// 	if(response.status == 406 || response.status == 401){
			// 		vm.parent.logout();
			// 	}
			// });
			vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;

        }
        
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.consultagdpr.html";
    	}
    	
    	vm.buscar = function(tipo){
    	
    		if(vm.form == undefined || vm.form.NU_DOCUMENTO == undefined){
				var msg = $mdDialog.alert()
					.clickOutsideToClose(true)
					.textContent('Es obligatorio rellenar el número de documento')
					.ok('Aceptar');
				$mdDialog.show(msg);
			} else if(vm.parent.filtrar(vm.form, tipo)){
				var msg = $mdDialog.alert()
					.clickOutsideToClose(true)
					.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
					.ok('Aceptar');
				$mdDialog.show(msg);
                // $mdDialog.show({
					// templateUrl: BASE_SRC+'filtros/filtros.error.html',
					// controllerAs: '$ctrl',
					// clickOutsideToClose:true,
					// parent: angular.element(document.body),
					// fullscreen:false,
					// controller:['$mdDialog', function($mdDialog){
					// 	var md = this;
					// 	md.cancel = function() {
					// 	$mdDialog.cancel();
					// 	};
					// }]
            	// });
            
    		}
        }
        
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosConsultagdprApp', Object.create(filtrosConsultagdprComponent));    
})(window.angular);