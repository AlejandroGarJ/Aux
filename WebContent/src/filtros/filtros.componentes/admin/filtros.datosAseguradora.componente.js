(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC', 'ConversorService', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC, ConversorService, $mdDialog, constantsTipos){
    	var vm = this;
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		ConversorService.getListCampos({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.campos = response.data.CONVERSORES;
				}
			});
    		
    		TiposService.getCompania()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.TIPOS.TIPO;
				}
			});
    		TiposService.getMedioPago()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.pago = response.data.TIPOS.TIPO;
				}
			});
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.NIVEL_ERROR})
    		.then(function successCallback(response){
    			if(response.status == 200){
					vm.tipos.errores = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.CODIGO_ERROR})
    		.then(function successCallback(response){
    			if(response.status == 200){
					vm.tipos.tipoDato = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getRamos({"IN_TARIFICABLE": true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.ramos = response.data.TIPOS.TIPO;
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
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.datosAseguradora.html";
    	}
    	
    	vm.buscar = function(tipo){
            angular.forEach(vm.form, function(value, key) {
                if(value != null && (value.value == "" || value.value == null)){
                    delete vm.form[key];
                }
            });
            if(vm.form == undefined || Object.keys(vm.form).length <= 0) {
				msg.textContent('Debe introducir al menos un criterio de búsqueda');
				$mdDialog.show(msg);
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
    	
    }    
    ng.module('App').component('filtrosDatosAseguradoraApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);