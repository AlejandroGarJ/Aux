(function(ng) {	

	//Crear componente de app
    var remesaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', '$location', 'uiGridConstants','BASE_SRC', 'ColectivoService', 'TiposService', 'ReciboService', 'AseguradoraService', 'BusquedaService'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		},
    		bindings: {
                idDetalle: '<',
            }
    }
    
    remesaComponent.controller = function remesaComponentControler($mdDialog, $location, uiGridConstants, BASE_SRC, ColectivoService, TiposService, ReciboService, AseguradoraService, BusquedaService){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
		vm.tipos = {};
		vm.colectivos = {};
		vm.tipos.programa = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		vm.medida = 276;

    	this.$onInit = function(bindings) {
			vm.datos = vm.parent.idDetalle;
			
			if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$url.substring(1, $location.$$url.length));
        		console.log(vm.permisos);
    		}
			
			var perfil = sessionStorage.getItem('perfil');

			vm.tipos.programa = [];
            
            if (perfil != null) {
                perfil = JSON.parse(perfil);
                if (perfil.productos != null && perfil.productos.length > 0) {
                    var programa = null;
                    
                    for (var i = 0; i < perfil.productos.length; i++) {
                        var programa = perfil.productos[i];
                        
                        //Comprobamos si el programa está ya en la lista. Si no está, se añade
                        var existePrograma = vm.tipos.programa.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
                        if (existePrograma == -1) {
                            vm.tipos.programa.push({
                                ID_PROGRAMA: programa.ID_PROGRAMA,
                                DS_PROGRAMA: programa.DS_PROGRAMA
                            })
                        }
                        
                    }

                }
            }
            
			// TiposService.getCompania({})
			// .then(function successCallback(response){
			// 	if(response.status == 200){
			// 		vm.tipos.compania = response.data.TIPOS.TIPO;
			// 	}
			// }, function callBack(response){
			// 	if(response.status == 406 || response.status == 401){
            //     	vm.parent.logout();
            //     }
			// });

			//Filtrar por COMINISIONISTAS
			AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.ASEGURADORAS;
				}
			}, function successCallback(response){
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

			TiposService.getMedioPago({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.pago = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.remesas.html";
		}
		
		vm.buscarCliente = function(documento){
			BusquedaService.buscar({"NU_DOCUMENTO": documento }, "clientes")
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						if(response.data.NUMERO_CLIENTES > 0 ){
							// vm.datos.OPAGADOR = response.data.CLIENTES.CLIENTE[0]; 	
							vm.clientes = response.data.CLIENTES.CLIENTE[0];	
						}else{
							vm.datos.OPAGADOR = [];
						}
					}else{
					 msg.textContent(response.data.DS_RESULT)
					 $mdDialog.show(msg);
					}
				}
			});
	  	}
		
		vm.nuevaRemesa = function(){
			var json = rellenarJSON(vm.datos);
			if(!vm.formRemesa){
	    		if(vm.isNuevo){
	    			if(!vm.isError)
						var json = JSON.parse(JSON.stringify(vm.datos));
						// vm.borrarNulls(json);
	    		} else {
					var json = JSON.parse(JSON.stringify(vm.datos));
					// vm.borrarNulls(json);
	    			// var json = {
	        		// 		"ID_RECIBO": vm.datos.ID_RECIBO,
	        		// 		"IT_VERSION": vm.datos.IT_VERSION,
	        		// 		"ID_SITUARECIBO":vm.datos.ID_SITUARECIBO,
	        		// 		"ID_TIPO_MEDIO_PAGO":vm.datos.ID_TIPO_MEDIO_PAGO,
	        		// 		"TX_OBSERVACIONES": vm.datos.TX_OBSERVACIONES
	        		// }
	    		}
	    		
	    		if(!vm.isError) {
	    			vm.appParent.abrirModalcargar(true);
	    			ReciboService.saveRemesa(json)
	        		.then(function successCallback(response) {
							if(response.status == 200) {
//								if(vm.datos.ID_RECIBO_REMESA != undefined) {
									if(response.data.ID_RESULT != 0){
										vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
//									} else {
//									msg.textContent('Se ha editado correctamente');
//									$mdDialog.show(msg);
//								}
								} else {
									vm.appParent.cambiarDatosModal('Se ha creado correctamente');
								}
							}
	        		}, function errorCallback(response){
	        			vm.appParent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
	        		});
	    		}else{
					msg.textContent('Rellene los datos del recibo correctamente');
					$mdDialog.show(msg);
	    		}
    		}else{
				var objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();
				msg.textContent('Rellene los datos del recibo correctamente');
				$mdDialog.show(msg);
    			objFocus.focus();
    		}

		}
    	
    	//Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
		}
		
		function rellenarJSON(form) {
            angular.forEach(form, function(value, key){    
                if(value instanceof Date){
                    value=vm.appParent.dateFormat(value);
                    console.log(value);
                    form[key]=value;
                }    
            });
		}
    }   
    
    ng.module('App').component('remesaSd', Object.create(remesaComponent));
    
})(window.angular);