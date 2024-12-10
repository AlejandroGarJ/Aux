(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.tipos = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
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
    		
    		vm.colectivos = vm.parent.colectivos;
    		
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.garantias.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if(vm.form == undefined){
    			vm.form = {
    				"NO_GARANTIA":{
    					"value":""
    				}
    			}
    		}
    		if(vm.parent.filtrar(vm.form, tipo, true)){
    			//$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    }    
    ng.module('App').component('filtrosGarantiasApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);