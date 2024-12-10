(function(ng) {	

	//Crear componente de busqueda
    var filtrosTarifasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'MotorService', 'TiposService', 'uiGridConstants', 'BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosTarifasComponent.controller = function filtrosTarifasComponentController($location, $routeParams, sharePropertiesService, MotorService, TiposService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		MotorService.getMarcas(1)
    		.then(function successCallback(response){
    			vm.marcas = response.data.MARCA;
    		});
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.tarifas.html";
    	}
    	
    	vm.querySearch = function(query, list, key){
    		var results = query ? list.filter( createFilterFor(query, key) ) : list,
    		          deferred;
    		if (self.simulateQuery) {
		        deferred = $q.defer();
		        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		        return deferred.promise;
    		} 
    		else {
		        return results;
		    }
    	}
    	
    	function createFilterFor(query, key) {
    		var uppercaseQuery = query.toUpperCase();
	
    		return function filterFn(list) {
    			if(key != "DS_VERSION")
    				return (list[key].indexOf(uppercaseQuery) === 0);
    			else
    				return (list[key].indexOf(uppercaseQuery) >= 0);
    		};
    	}
    	
    	//Conseguir datos de modelos
    	vm.getModelos = function(){
    		vm.searchModelo = "";
    		vm.searchVersion = "";
    		MotorService.getModelos(1, vm.form.MARCA.value.CO_MARCA)
    		.then(function successCallback(response){
    			vm.modelos = response.data.MODELO;
    		});
    	}
    	
    	//Conseguir datos de versiones
    	vm.getVersiones = function(){
    		vm.searchVersion = "";
    		MotorService.getVersiones(1, vm.form.MARCA.value.CO_MARCA, vm.form.MODELO.value.CO_MODELO)
    		.then(function successCallback(response){
    			vm.versiones = response.data.VERSION;
    			for (var i = 0; i < vm.versiones.length; i++) {
					vm.versiones[i].text = vm.versiones[i].DS_VERSION +"- F.LANZ:"+vm.versiones[i].FD_LANZAMIENTO+" - PUERTAS:"+vm.versiones[i].NU_PUERTAS+" - POT:"+vm.versiones[i].NU_POTENCIA+" - TARA:"+vm.versiones[i].NU_CILINDRADA+" - PLAZAS:"+vm.versiones[i].NU_PLAZAS;
				}
    			console.log(vm.versiones);
    		});
    		
    	}
    	
    	//Buscar
    	vm.buscar = function(tipo){
            angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null) {
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
    ng.module('App').component('filtrosTarifasApp', Object.create(filtrosTarifasComponent));    
})(window.angular);