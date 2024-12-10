(function(ng) {	

	//Crear componente de busqueda
    var filtrosClientesRgpdComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog'],
    		require: {
                parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp',
                busquedaCliente: '^?busquedaCliente'
            }
    } 
    
    filtrosClientesRgpdComponent.controller = function filtrosClientesRgpdComponentComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
    	vm.calendar = {};
		vm.desplegado = true;
		vm.basicSearch = false;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		if(vm.parentApp.listServices.listTipoDocumento != null && vm.parentApp.listServices.listTipoDocumento.length > 0){
            	vm.tipos.tiposDocumento = vm.parentApp.listServices.listTipoDocumento;
    		} else {
    			TiposService.getTipoDocumento({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    	
			vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
    		
        }
        
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.cliente_rgpd.html";
    	}
    	
    	vm.buscar = function(tipo){
    		
			vm.form.IN_BAJA_REG = '2';
    	
    		if(vm.parent.filtrar(vm.form, tipo)){
				var msg = $mdDialog.alert()
					.clickOutsideToClose(true)
					.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
					.ok('Aceptar');
				$mdDialog.show(msg);
            
    		} else {
				vm.desplegado = false;
				vm.basicSearch = true;
			}
        }
        
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		
    		if (vm.filtro != null) {
    			vm.filtro.vista = 1;
    			vm.desplegado = true;
    		}
    	}
		
		vm.desplegar = function () {
			vm.desplegado = !vm.desplegado;
		}

		vm.showBasicSearch = function () {
			vm.desplegado = true;
			vm.basicSearch = !vm.basicSearch;
		}
    	
    }    
    ng.module('App').component('filtrosClientesRgpdApp', Object.create(filtrosClientesRgpdComponent));    
})(window.angular);