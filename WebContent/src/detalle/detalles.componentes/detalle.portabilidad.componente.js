(function(ng) {	

	//Crear componente de app
    var detallePortabilidadComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q','$scope', '$location', '$mdDialog',  'uiGridConstants','MovilService',  'BASE_SRC', '$window'],
    		require: {
    			appParent: '^sdApp',
    			busqueda:'^busquedaApp',
    			busquedaMovistar: '^?busquedaPortabilidad'
            },
            bindings:{
            	detalles: '<'
    		}
    }
    
    detallePortabilidadComponent.controller = function detallePortabilidadComponentControler($q, $scope, $location, $mdDialog, uiGridConstants, MovilService,  BASE_SRC, $window){
    	var vm=this;
    	var url=window.location;
    	vm.form = {};
    	vm.isNew = false; 
    	vm.isError = false;
    	var nLoad = 0;
    	vm.disabledEstado = false;
		vm.medida = 0;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
		vm.disabledTxt = true;
		vm.rol = sessionStorage.rol;
		vm.url = window.location.hash;
		vm.prePoliza = "Prepóliza";
		vm.isEmited = "";
		vm.modCodpreCom = false;
		vm.modelNew = {};
		vm.copiado = false;
		vm.isPrepoliza = false;
		
		var perfil=JSON.parse($window.sessionStorage.perfil);
    	vm.usuario = perfil.usuario;
        vm.tipoLinea = "";
		
    	this.$onInit = function(bindings) {
    		
			//Cargar permisos
    		vm.permisos = vm.busquedaMovistar.permisos;
    		if(vm.appParent.getPermissions != undefined) {
				if($location.$$path == '/portabilidad') {
                    vm.permisos = { EXISTE: true };
				} 
    		}
    		
    		if(vm.detalles != null && vm.detalles != undefined){
	    		vm.datos = JSON.parse(JSON.stringify(vm.detalles));
	    		vm.datosCopy = JSON.parse(JSON.stringify(vm.datos));

	    		if (vm.datos != null && vm.datos.policy != null && vm.datos.policy.aditionalFields != null && vm.datos.policy.aditionalFields.jsEnviado != null) {
	    			var jsEnviado = JSON.parse(vm.datos.policy.aditionalFields.jsEnviado);
	    		    if (jsEnviado != null && jsEnviado.portRetInfo != null) {
                        vm.tipoLinea = jsEnviado.portRetInfo.system;
	    		    }
	    		}
    		}
    	}

    	this.loadTemplate = function() {
            return BASE_SRC + "detalle/detalles.views/detalle.portabilidad.html";
    	}
    	
    	vm.nuevaPortabilidad = function () {
    		var objPortabilidad = {
			    token : vm.datos.token,
			    in_publicidad : false,
			    iban: vm.form.iban
    		};
    		
    		vm.load = true;
    		MovilService.nuevaPortabilidad(vm.form.opcion, vm.tipoLinea, objPortabilidad)
			.then(function successCallback(response){
				if(response.data.code == 0){
					var confirm = $mdDialog.confirm()
				        .textContent(response.data.msg)
				        .ok('Aceptar');

				    $mdDialog.show(confirm).then(function () {
//				    	if (vm.busquedaMovistar != null) {
//				    		vm.busquedaMovistar.numDetalles = [];
//				    		vm.busquedaMovistar.nomDetalles = [];
//				    		vm.busquedaMovistar.gridOptions.data = [];
//				    		vm.busquedaMovistar.listBusqueda = [];
//                            vm.busquedaMovistar.vista = 1;
//				    	}
			        	$window.location.href = window.location.origin + window.location.pathname + '#!/portabilidad/';
				    }, function () {
			        	$window.location.href = window.location.origin + window.location.pathname + '#!/portabilidad/';
				    });
				  
				}else{
					msg.textContent(response.data.msg);
					$mdDialog.show(msg);
				}
	    		vm.load = false;
			}, function errorCallBack(response){
				if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
					msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
                    $mdDialog.show(msg);
	    	    } else {
	    	    	msg.textContent(response.data.msg);
                    $mdDialog.show(msg);
	    	    }
	    		vm.load = false;
            });
    	}
    	
    }   

    ng.module('App').component('detallePortabilidad', Object.create(detallePortabilidadComponent));
    
})(window.angular);


