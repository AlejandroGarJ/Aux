(function(ng) {	

	//Crear componente de busqueda
    var filtrosPortabilidadComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'UsuarioService', 'uiGridConstants', 'ColectivoService','BASE_SRC','$mdDialog', 'MovilService'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosPortabilidadComponent.controller = function filtrosPortabilidadComponentComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, UsuarioService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, MovilService){
    	var vm=this;
    	var json = {};
        var url = $location.url();
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
		vm.calendar = {};
		vm.labelSituaRiesgo = 'No disponible';
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
    		return BASE_SRC+"filtros/filtros.view/filtros.portabilidad.html";
    	}
    	
    	//Buscar
    	vm.buscar = function(tipo){
    		if (vm.form == null) {
    			vm.form = {};
    		}
    		
    		vm.form.comercialOps = {
				value: ["PORTABILIDAD"]
    		};
    		
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
		
		vm.generarInforme = function () {
			vm.loadInforme = true;
			MovilService.portabilidadStatus()
			.then(function successCallback(response){
            	var msg = $mdDialog.alert().clickOutsideToClose(true).textContent(response.data.msg).ok('Aceptar');
				$mdDialog.show(msg);
			}, function callBack(response){
            	var msg = $mdDialog.alert().clickOutsideToClose(true).textContent('Ha ocurrido un error al generar informe').ok('Aceptar');
				if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
	            	var msg = $mdDialog.alert().clickOutsideToClose(true).textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio).ok('Aceptar');
	    	    }
				$mdDialog.show(msg);
			});
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
    ng.module('App').component('filtrosPortabilidadApp', Object.create(filtrosPortabilidadComponent));    
})(window.angular);