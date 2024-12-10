(function(ng) {	


	//Crear componente de app
    var renovacionPolizasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$q', '$location', '$timeout', '$mdDialog', '$translate', 'BASE_SRC', 'PolizaService'],
    		require: {
            	parent:'^sdApp'
    		},
    		bindings: {
    			llave:'<',
    			detalles:'<'
    		}
    }
    
    
    
    renovacionPolizasComponent.controller = function renovacionPolizasComponentControler($rootScope, $q, $location, $timeout, $mdDialog, $translate, BASE_SRC, PolizaService) {
    	var vm=this;
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.cargandoPoliza = false;
		vm.polizaSelected = false;
    	vm.primas = {};
    	vm.date = new Date();
    	vm.poliza = null;
    	vm.inPoliza = false;
		
    	this.$onInit = function(){
    		if (vm.detalles != null && vm.detalles.ID_POLIZA != null) {
    			vm.poliza = JSON.parse(JSON.stringify(vm.detalles));
    			vm.polizaSelected = true;
    			vm.nuPoliza = vm.poliza.NU_POLIZA;
    			vm.inPoliza = true;
    		}
    	}
    	
    	this.$onChanges = function(){
    		
    	}
    	
    	this.loadTemplate=function(){
    		return "src/renovacion/renovacion-polizas.view.html";
    	}
    	
    	vm.getPoliza = function () {
			if (vm.nuPoliza != null && vm.nuPoliza != "") {
				vm.cargandoPoliza = true;
				PolizaService.getPolizasByFilter({ NU_POLIZA: vm.nuPoliza})
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							vm.polizaSelected = true;
							if (response.data.POLIZAS != null && response.data.POLIZAS.POLIZA != null && response.data.POLIZAS.POLIZA[0] != null) {
								vm.poliza = response.data.POLIZAS.POLIZA[0];
							}
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
					vm.cargandoPoliza = false;
				});
			} else {
				msg.textContent($translate.instant('ADD_POLICY_NUMBER'));
				$mdDialog.show(msg);
			}
		}

        vm.changePrimas = function () {
        	
        	if (vm.primas == null) {
        		vm.primas = {};
        	}
        	
        	if (vm.primas.PRIMA_TOTAL != null && vm.primas.PRIMA_TOTAL != "") {
        		vm.isCalcula = true;
        		var primaTotal100 = vm.primas.PRIMA_TOTAL;
        		var primaNeta = (primaTotal100 * 2000)/2163;
        		var ipsValue = parseFloat(primaNeta * 0.08);
        		var leaValue = parseFloat(primaNeta*0.0015);
        		var ips8 = +(Math.round(ipsValue + "e+2")  + "e-2");
        		var lea = +(Math.round(leaValue + "e+2")  + "e-2");
        		
        		vm.primas.IPS = ips8;
        		vm.primas.LEA = lea;
        		vm.primas.FRANQUICIA = 0;
        		vm.primas.PRIMA_NETA = +(Math.round(primaNeta + "e+2")  + "e-2");
        	} else {
        		vm.isCalcula = true;
        		vm.primas.IPS = "";
        		vm.primas.LEA = "";
        		vm.primas.FRANQUICIA = "";
        		vm.primas.PRIMA_NETA = "";
        	}
        	
        }
        
        vm.replicarPrimas = function () {
        	if (vm.poliza != null) {
        		if (vm.poliza.IM_PRIMA_TOTAL != null) {
        			vm.primas.PRIMA_TOTAL = vm.poliza.IM_PRIMA_TOTAL;
        			vm.changePrimas();
        		}
        		if (vm.poliza.IM_PRIMA_NETA != null) {
        			vm.primas.PRIMA_NETA = vm.poliza.IM_PRIMA_NETA;
        		}
        		if (vm.poliza.IM_FRANQUICIA != null) {
        			vm.primas.FRANQUICIA = vm.poliza.IM_FRANQUICIA;
        		}
        	}
        }
        
        vm.reset = function () {
    		vm.cargandoPoliza = false;
    		vm.polizaSelected = false;
        	vm.primas = {};
        	vm.poliza = null;
        	vm.FD_VENCIMIENTO = null;
        	vm.FD_EFECTO = null;
        }
    }
    
    ng.module('App').component('renovacionPolizasApp', Object.create(renovacionPolizasComponent));
    
    
    
})(window.angular);