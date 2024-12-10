(function(ng) {	

	//Crear componente de busqueda
    var filtrosbackupComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'FicherosService', 'uiGridConstants', 'BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosbackupComponent.controller = function filtrosbackupComponent($routeParams, sharePropertiesService, BusquedaService, FicherosService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		vm.companias = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
			var usuario = vm.parent.perfil;
			var tipo = 'cias';
    		
			FicherosService.getCias(tipo)
			.then(function successCallback(response){
				if(response.status == 200){
					vm.companias = response.data.ASEGURADORAS;
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
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.backup.html";
    	}
    	
    	vm.buscar = function(tipo){
            angular.forEach(vm.form, function(value, key) {
    				if(value.value === "" || value.value === null){
        				delete vm.form[key];
                    }
                });
            
            if(vm.form.FT_USU_ALTA_FROM == undefined || vm.form.FT_USU_ALTA_TO == undefined){
            	var msg = $mdDialog.alert()
					.clickOutsideToClose(true)
					.textContent('Es obligatorio rellenar las dos fechas de alta')
					.ok('Aceptar');
				$mdDialog.show(msg);
            }else{
            	if(vm.parent.filtrar(vm.form, tipo)){
        			var msg = $mdDialog.alert()
        				.clickOutsideToClose(true)
        				.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
        				.ok('Aceptar');
        			$mdDialog.show(msg);
            
            	}
            }
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosBackupApp', Object.create(filtrosbackupComponent));    
})(window.angular);