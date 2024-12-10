(function(ng) {	

	//Crear componente de busqueda
    var filtrosFirmaDigitalComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'UsuarioService', 'uiGridConstants', 'ColectivoService','BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosFirmaDigitalComponent.controller = function filtrosFirmaDigitalComponentComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, UsuarioService, ColectivoService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
        var url = $location.url();
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
           
            var perfil = sessionStorage.getItem('perfil');
		}


    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.firmaDigital.html";
    	}

    	//Buscar
    	vm.buscar = function(tipo){
    		if (vm.form == null) {
    			vm.form = {};
    		}
    		
    		vm.form.ID_SITUAPOLIZA = {};
    		vm.form.ID_SITUAPOLIZA.value = 3;
    		vm.form.CO_CANAL = {};
    		vm.form.CO_CANAL.value = "PIN";
    		
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
					if(value.value == "" || value.value==null){
						delete vm.form[key];
					}
				});
				
				if(vm.form.telefono == undefined && vm.form.documento == undefined && vm.form.NU_POLIZA == undefined){
					var msg = $mdDialog.alert()
					.clickOutsideToClose(true)
					.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
					.ok('Aceptar');
					$mdDialog.show(msg);
					
				}else{
					vm.parent.filtrar(vm.form, tipo);
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		if (vm.filtro != null) {
    			vm.filtro.vista = 1;
    		}
    	}
  
   }    
    ng.module('App').component('filtrosFirmaDigitalApp', Object.create(filtrosFirmaDigitalComponent));    
})(window.angular);