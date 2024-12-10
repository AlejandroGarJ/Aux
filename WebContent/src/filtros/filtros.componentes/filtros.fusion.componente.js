(function(ng) {	

	//Crear componente de busqueda
    var filtrosFusionComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'UsuarioService', 'uiGridConstants', 'ColectivoService','BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosFusionComponent.controller = function filtrosFusionComponentComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, UsuarioService, ColectivoService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
        var url = $location.url();
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
		vm.calendar = {};
		vm.labelSituaRiesgo = 'No disponible';
		vm.productosMulti = [];
		vm.selectedmodelProductos = [];
        vm.settingsDropdown = { selectedToTop: true, checkBoxes: true, scrollableHeight: '140px', scrollable: true, enableSearch: true, showCheckAll: false };
        vm.settingsDropdownText = { buttonDefaultText: 'Subproductos', checkAll: "", uncheckAll: "Deseleccionar todo", searchPlaceholder: "Subproductos", dynamicButtonTextSuffix: "seleccionados" };
        vm.eventsDropdown = {
			onSelectionChanged: function (item) { vm.onSelectionChanged(item) }
    	}
		vm.desplegado = true;
		vm.busquedaAvanazda = false;
		vm.basicSearch = false;
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
            
            var perfil = sessionStorage.getItem('perfil');
		}
		
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.fusion.html";
    	}
    	
    	vm.showMsisdn = function () {
    		if (vm.form.LST_PRODUCTOS != null && vm.form.LST_PRODUCTOS.value != null) {
    			if (vm.form.LST_PRODUCTOS.value.includes(10) || vm.form.LST_PRODUCTOS.value.includes(11) || vm.form.LST_PRODUCTOS.value.includes(12)) {
    				return true;
    			} else return false;
    		} else return false;
    	}
    	
    	//Buscar
    	vm.buscar = function(tipo){
    		if (vm.form == null) {
    			vm.form = {};
    		}
    		
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
					if(value.value == "" || value.value==null){
						delete vm.form[key];
					}
				});
				if(vm.parent.filtrar(vm.form, tipo)){
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
				} else {
					vm.desplegado = true;
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
            vm.selectedmodelProductos = [];
            vm.ID_PROGRAMA = [];
    		if (vm.filtro != null) {
    			vm.filtro.vista = 1;
    			vm.desplegado = true;
    		}
    	}
		
		vm.desplegar = function () {
			vm.desplegado = !vm.desplegado;
			vm.showCamposBusqueda = !vm.showCamposBusqueda;
		}
		
		vm.cambiarBusquedaAvanzada = function () {
			vm.busquedaAvanazda = !vm.busquedaAvanazda;
		}

		vm.showBasicSearch = function () {
			vm.desplegado = true;
			vm.basicSearch = !vm.basicSearch;
		}

		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}
		
        function getUrlParam( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }    }    
    ng.module('App').component('filtrosFusionApp', Object.create(filtrosFusionComponent));    
})(window.angular);