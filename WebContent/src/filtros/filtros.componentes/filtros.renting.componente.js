(function(ng) {	

	//Crear componente de busqueda
    var filtrosRentingComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosRentingComponent.controller = function filtrosRentingComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
    	vm.calendar = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		TiposService.getSituaSolicitud()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.estadoSolicitud = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.canales = response.data.TIPOS.TIPO;
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

    	//Cargar la plantilla de filtro
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.renting.html";
    	}
    	
    	vm.buscar = function(tipo){
            angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || value.value==null){
        				delete vm.form[key];
                    }
                });
            
            vm.form["OTIPO_SOLICITUD"] = {
	        	"ID_TIPO_SOLICITUD": {
	        		"value": 28	        		
	        	}
        	}
            
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
    		vm.form = {
				"OTIPO_SOLICITUD": {
		        	"ID_TIPO_SOLICITUD": 28
		        }
	    	}
    	}
    	
    }    
    ng.module('App').component('filtrosRentingApp', Object.create(filtrosRentingComponent));    
})(window.angular);