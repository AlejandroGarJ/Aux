(function(ng) {	

	//Crear componente de busqueda
    var filtrosProveedoresComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'AseguradoraService', 'ProveedoresService', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosProveedoresComponent.controller = function filtrosProveedoresComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, AseguradoraService, ProveedoresService, constantsTipos){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		vm.colectivos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.form = {};
		vm.form.NO_EMPRESA = { value: "" };
		vm.listProveedores = [];
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		var perfil = sessionStorage.getItem('perfil');
    		vm.listProveedores = [];
    		vm.listProductos = [];
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
			
			TiposService.getProgramasProveedor({})
            .then(function successCallback(response) {
                if (response.status === 200) {
                	if(response.data.ID_RESULT == 0){
                        if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                        	vm.listProductos = response.data.TIPOS.TIPO;
                        }
                 	}
                }
            });
			
			ProveedoresService.getEmpresasProveedor()
            .then(function successCallback(response) {
                if (response.status === 200) {
                	if(response.data.ID_RESULT == 0){
                        if (response.data.PROVEEDORESPROGRAMAS != null && response.data.PROVEEDORESPROGRAMAS.length > 0) {
                        	vm.listProveedores = response.data.PROVEEDORESPROGRAMAS;
                        }
                 	}
                }
            });
    		
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.proveedores.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if (vm.form == null ) {
				form = {};
    		} else {
    			if(vm.parent.filtrar(vm.form, tipo, true)){
        			$('#checkVacio').slideDown().delay(1500).slideUp();
        		}
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
			vm.autocomplete = null;
    	}
        
        vm.querySearch = function (query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
        }
    	
    	function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
            	if (list[key] == null) {
            		return false;
            	} else {
                    if (key != "text") 
                        return (list[key].toUpperCase().includes(uppercaseQuery));
                    else
                        return (list[key].toUpperCase().includes(uppercaseQuery));
            	}
            };
        }
    	
    }    
    ng.module('App').component('filtrosProveedoresApp', Object.create(filtrosProveedoresComponent));    
})(window.angular);