(function(ng) {	

	//Crear componente de busqueda
    var filtrosCampanaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosCampanaComponent.controller = function filtrosCampanaComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, constantsTipos){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		vm.colectivos = {};
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		TiposService.getCompania({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.TIPOS.TIPO;
				}
			});
    		TiposService.getRamos({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.ramos = response.data.TIPOS.TIPO;
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
			.then(function successCallback(response) {
				if(response.status == 200){
					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    		
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.campana.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if(vm.form == undefined){
    			vm.form = {
    					"ID_CAMPAIGN": {
    						"value": ''
    					}
    			};
    		}
    		if(vm.parent.filtrar(vm.form, tipo, true)){
    			//$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
			vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosCampanaApp', Object.create(filtrosCampanaComponent));    
})(window.angular);