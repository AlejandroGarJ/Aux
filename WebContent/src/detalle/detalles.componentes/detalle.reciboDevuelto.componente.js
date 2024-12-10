(function(ng) {	

	//Crear componente de app
    var reciboDevueltoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', 'ReciboService', 'BASE_SRC', 'TiposService', '$window', 'ClienteService', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
				busqueda:'^busquedaApp'
    		}
    }
    
    reciboDevueltoComponent.controller = function reciboDevueltoComponentControler($mdDialog, ReciboService, BASE_SRC, $window, TiposService, ClienteService, constantsTipos){
    	var vm = this;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.emited = false;
		vm.navegador = bowser.name.toLowerCase();
		vm.rol = $window.sessionStorage.rol;
		vm.gestionesRol = [];
		vm.gestionesSuspendida = [];		
    	vm.IN_PROCESO = false;
    	vm.IN_COPY = true;
		
    	this.$onInit = function(bindings) {
    		
			//Cargar permisos
    		if(vm.parent.parent.parent.getPermissions != undefined) {
				vm.permisos = vm.parent.parent.parent.getPermissions('recibos_devueltos_list');
			}
			
    		vm.datos = vm.parent.datos;
			vm.datosCopy = JSON.parse(JSON.stringify(vm.datos));
			
			if(vm.datos.OPAGADOR.NO_EMAIL != null && vm.datos.OPAGADOR.NO_EMAIL != undefined && vm.datos.OPAGADOR.NO_EMAIL != ""){
				vm.mailAntiguo = vm.datos.OPAGADOR.NO_EMAIL;
			}else if(vm.datos.OPAGADOR.NO_EMAIL2 != null && vm.datos.OPAGADOR.NO_EMAIL2 != undefined && vm.datos.OPAGADOR.NO_EMAIL2 != ""){
				vm.mailAntiguo = vm.datos.OPAGADOR.NO_EMAIL2;
			}
			if(vm.datos.OPAGADOR.NU_TELEFONO1 != null && vm.datos.OPAGADOR.NU_TELEFONO1 != undefined && vm.datos.OPAGADOR.NU_TELEFONO1 != ""){
				vm.telefonoAntiguo = vm.datos.OPAGADOR.NU_TELEFONO1;
			}else if(vm.datos.OPAGADOR.NU_TELEFONO2 != null && vm.datos.OPAGADOR.NU_TELEFONO2 != undefined && vm.datos.OPAGADOR.NU_TELEFONO2 != ""){
				vm.telefonoAntiguo = vm.datos.OPAGADOR.NU_TELEFONO2;
			}
			
    		//Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
    		//Parámetro utilizado en: ng-style="resizeHeight({{$ctrl.medida}})"
			vm.medida = 276;
			
			TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPO_GESTION_DEVOLUCION})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.gestiones = response.data.TIPOS.TIPO;
					for(var i=0; i < vm.gestiones.length; i++){
						if(vm.gestiones[i].ID_TIPOS == 57004 || vm.gestiones[i].ID_TIPOS == 57005){
							vm.gestionesSuspendida.push(vm.gestiones[i]);
						}
						if(vm.gestiones[i].ID_TIPOS != 57002){
							vm.gestionesRol.push(vm.gestiones[i]);
						}
					}
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
	            	vm.parent.logout();
	            }
			});	
			

	    	if(vm.datos != null && vm.datos != undefined){
	    		if(vm.datos.IN_DUPLICADO == 4){
	        		vm.IN_PROCESO = true;
	        	}
	    	}

    	}

    	this.loadTemplate = function() {
//			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.reciboDevuelto.html";
//            } else {
//                return 'src/error/404.html';
//            }
    	}
    
		
		vm.cambiarDatos = function(datos){
			$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/cambiar_datos.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.telefono = vm.telefonoAntiguo;
                    md.email = vm.mailAntiguo;                   
                    
                    md.cambiar = function () {
                    	md.telNuevo = md.telefono;
                    	md.emailNuevo = md.email;
                    	
                    	if(md.telNuevo != vm.telefonoAntiguo || md.emailNuevo != vm.mailAntiguo){
                    		
                    		ClienteService.contactoCliente({"ID_CLIENTE" : vm.datos.OPAGADOR.ID_CLIENTE,
                    										"NU_TELEFONO1" : md.telNuevo,
                    										"NO_EMAIL" : md.emailNuevo})
                    		.then(function successCallback(response){
                    			if(response.status == 200){
                    				if(response.data.ID_RESULT == 0){
                    					msg.textContent("Los datos del cliente se han modificado correctamente");
                						$mdDialog.show(msg); 
                						vm.telefonoAntiguo = response.data.NU_TELEFONO1;
                						vm.mailAntiguo = response.data.NO_EMAIL;
                    				}else{
                    					msg.textContent("Los datos del cliente no se han podido modificar");
                						$mdDialog.show(msg); 
                    				}
                    			}
                    		}, function callBack(response){
                    			if(response.status == 406 || response.status == 401){
                                	vm.parent.logout();
                                }
                    		});
                    	}else{                    		
	                		msg.textContent("Los datos del cliente son iguales");
							$mdDialog.show(msg);                    	
                        }                     	
                    }
                    
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                }]
            })
		}

		vm.gestionarRecibo = function() {
			
			if((vm.gestion.CO_TIPO == 4 || vm.gestion.CO_TIPO == 5) && (vm.mailAntiguo == undefined || vm.mailAntiguo == null || vm.mailAntiguo == "")){
				msg.textContent("Por favor, introduzca un email de contacto para poder gestionar el recibo.");
				$mdDialog.show(msg);
			} else {
				var json = JSON.parse(JSON.stringify(vm.datos));
				if((vm.gestion != null && vm.gestion != undefined) && !vm.datos.IN_PROCESO){
					json.ID_TIPO_RESOLUCION_DEVUELTO = vm.gestion.CO_TIPO;
				}
				if(vm.datos.IN_PROCESO && vm.gestion.CO_TIPO == 1){
					delete vm.datos.OPOLIZA.CO_IBAN;				
				}
				
				if(vm.IN_PROCESO){
					json.ID_TIPO_RESOLUCION_DEVUELTO = 0;
					json.IN_DUPLICADO = 4;
				}
				
				vm.appParent.abrirModalcargar(true);
				ReciboService.gestionarReciboDevuelto(json, vm.IN_COPY)
				.then(function successCallback(response) {
					if(response.status == 200) {
						if(response.data.ID_RESULT == 0){
							msg.textContent("Recibo gestionado correctamente.");
							$mdDialog.show(msg);
							vm.emited = true;
							vm.parent.parent.recargarListado();
						}else{
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
				}, function errorCallback(response){
					msg.textContent("Se ha producido un error al realizar la acción");
					$mdDialog.show(msg);
				});
			}
		}
    }   
    
    
    ng.module('App').component('reciboDevueltoSd', Object.create(reciboDevueltoComponent));
    
})(window.angular);


