(function(ng) {	


	//Crear componente de app
    var procesoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$q', '$location', '$timeout', 'TiposService', 'BusquedaService','$mdDialog', 'BASE_SRC', 'ProcesoService', 'ColectivoService'],
    		require: {
            	parent:'^sdApp',
            	busquedaProcesos: '^busquedaProcesos'
    		},
    		bindings: {
    			llave:'<',
    			detalles:'<'
    		}
    }
    
    
    
    procesoComponent.controller = function procesoComponentControler($rootScope, $q, $location, $timeout, TiposService, BusquedaService, $mdDialog, BASE_SRC, ProcesoService, ColectivoService) {
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.form = {};
    	vm.polizas = [];
    	vm.tiposSolicitud = [];
    	var init = false;
    	var x2js = new X2JS();
    	vm.cargar = 0;
    	var datos = {};
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	vm.movimientos = [];
    	this.$onInit = function(){
    		vm.tipoRamo = vm.idRamo;
    		
			vm.datos = vm.detalles;

			if(vm.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.getPermissions('procesos_main');
			}
    		
    		if(vm.parent.listServices.listMedioPago != null && vm.parent.listServices.listMedioPago.length > 0){
            	vm.medioPago = vm.parent.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
        		.then(function successCallback(response){
    				if(response.status == 200){
    					vm.medioPago = response.data.TIPOS.TIPO;
    					vm.parent.listServices.listMedioPago = vm.medioPago;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
    					vm.parent.pre.logout();
                    }
    			});
    		}
			
			if(vm.parent.listServices.listColectivos != null && vm.parent.listServices.listColectivos.length > 0) {
    			vm.colectivos = vm.parent.listServices.listColectivos;
    		} else {
    			ColectivoService.getListColectivos({})
    			.then(function successCallback(response) {
    				if(response.status == 200){
    					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
    					vm.parent.listServices.listColectivos = vm.colectivos;
    				}
    			}, function callBack(response) {
    				if(response.status == 406 || response.status == 401){
    					vm.parent.logout();
    				}
    			});
			}
			if(vm.parent.listServices.listCompanias != null && vm.parent.listServices.listCompanias.length > 0) {
    			vm.companias = vm.parent.listServices.listCompanias;
    		} else {
    			TiposService.getCompania({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.companias = response.data.TIPOS.TIPO;
    					vm.parent.listServices.listCompanias = vm.tipos.compania;
    				}
    			}, function callBack(response) {
    				if(response.status == 406 || response.status == 401){
    					vm.parent.logout();
    				}
    			});
    		}
			
			TiposService.getSituaRecibo({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.movimientos = response.data.TIPOS.TIPO;
					
					if (vm.movimientos != null && vm.movimientos.length > 0) {
						for (var i = 0; i < vm.movimientos.length; i++) {
							if (vm.movimientos[i].ID_SITUARECIBO == 0) {
								vm.movimientos.splice(i, 1);
								i--;
							}
						}
					}
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    	}
    	this.$onChanges = function(){
    		vm.tipoRamo = vm.idRamo;
    	}
    	
    	this.loadTemplate=function(){
    		return "src/procesos/proceso.view.html";
    	}
    	
    	vm.guardarProceso = function(){
    		ProcesoService.guardarProceso(vm.datos)
    		.then(function successCallback(response){
    			if(response.status == 200){
    				msg.textContent('Se ha guardado correctamente.');
    				$mdDialog.show(msg);
    				
    				if (vm.busquedaProcesos != null && vm.busquedaProcesos.parent != null && vm.busquedaProcesos.parent.recargarListado != null) {
        		    	vm.busquedaProcesos.parent.recargarListado();
        		    	vm.busquedaProcesos.cerrarTab(vm.busquedaProcesos.active - 1);
    				}
    			}
    		}, function errorCallback(response){
    			msg.textContent('Ha ocurrido un error al guardar. Contacte con el administrador.');
				$mdDialog.show(msg);
    		});
    	}
    	
    }
    
    ng.module('App').component('sdProceso', Object.create(procesoComponent));
    
    
    
})(window.angular);