(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$element', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'AseguradoraService', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($element, $routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, AseguradoraService, constantsTipos){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		vm.colectivos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
  	      	vm.searchTerm = "";

			AseguradoraService.getAseguradorasByFilter({IS_SELECTED: true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.ASEGURADORAS;
				}
			}, function successCallback(response){
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
			
			ColectivoService.getListColectivos({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
				}
			}, function callBack(response) {
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
	          
            $element.find('input').on('keydown', function (ev) {
                ev.stopPropagation();
            });
            
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.usuarios.html";
    	}
    	
    	vm.buscar = function(tipo){
    		angular.forEach(vm.form, function(value, key) {
                if(value != null && (value.value == "" || value.value == null)){
                    delete vm.form[key];
                }
                
                if (typeof value.value == "string") {
                    value.value = value.value.toLowerCase();
                }
            });
            if(vm.form == undefined || Object.keys(vm.form).length <= 0) {
				msg.textContent('Debe introducir al menos un criterio de búsqueda');
				$mdDialog.show(msg);
    			return false;
    		}else{
    			if(vm.parent.filtrar(vm.form, tipo)){
        			//$('#checkVacio').text("Las fechas están mal");
        			$('#checkVacio').slideDown().delay(1500).slideUp();
        		}
    		}
    		
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
			vm.autocomplete = null;
    	}
    	
    	vm.clearSearchTerm = function () {
    	      vm.searchTerm = '';
        };
    	
    }    
    ng.module('App').component('filtrosUsuariosApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);