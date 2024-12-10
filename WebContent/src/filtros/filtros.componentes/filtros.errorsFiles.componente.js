(function(ng) {	

	//Crear componente de busqueda
    var filtrosErrorsFilesComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'FicherosService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosErrorsFilesComponent.controller = function filtrosErrorsFilesComponentController($location, $routeParams, validacionesService, sharePropertiesService, BusquedaService, TiposService, ColectivoService, FicherosService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
		vm.tipos = {};
		vm.colectivos = {};
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
    		TiposService.getMedioPago({})
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
			// ColectivoService.getListColectivos({})
			// .then(function successCallback(response) {
			// 	if(response.status == 200){
			// 		vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
			// 	}
			// }, function callBack(response) {
			// 	if(response.status == 406 || response.status == 401){
			// 		vm.parent.logout();
			// 	}
			// });
			vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
    		
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.errorsFiles.html";
    	}
    	
    	vm.buscar = function(){
            angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null){
    				delete vm.form[key];
                }
            });
            var tipo = "errorFicheros";
            
            if ((vm.form.imei != null && vm.form.imei.value != null && vm.form.imei.value != "") ||
        		(vm.form.msisdn != null && vm.form.msisdn.value != null && vm.form.msisdn.value != "") ||
        		(vm.form.documentNumber != null && vm.form.documentNumber.value != null && vm.form.documentNumber.value != "")) {
            	tipo = "errorFicheros-errorFicherosMovil";
            }
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
    ng.module('App').component('filtrosErrorsFilesApp', Object.create(filtrosErrorsFilesComponent));    
})(window.angular);