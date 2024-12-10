(function(ng) {	

	//Crear componente de busqueda
    var filtrosRemesasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'AseguradoraService', 'uiGridConstants', 'BASE_SRC','$mdDialog'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosRemesasComponent.controller = function filtrosRemesasComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, AseguradoraService, uiGridConstants, BASE_SRC,$mdDialog){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
    	vm.calendar = {};
		vm.desplegado = true;
		vm.basicSearch = false;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
            vm.tipos.programa = [];
            vm.tipos.productos = [];
    		vm.tipos.programa = [];
            vm.tipos.colectivosProducto = [];
            
            var perfil = sessionStorage.getItem('perfil');

            vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
            vm.productosMulti = JSON.parse(JSON.stringify(vm.tipos.productos));
            
            if (perfil != null) {
                perfil = JSON.parse(perfil);
                if (perfil.productos != null && perfil.productos.length > 0) {
                    var programa = null;
                    
                    for (var i = 0; i < perfil.productos.length; i++) {
                        var programa = perfil.productos[i];
                        
                        //Añadimos el producto
                        vm.tipos.productos.push({
                            ID_PRODUCTO: programa.ID_PRODUCTO,
                            DS_PRODUCTO: programa.DS_PRODUCTO,
                            NO_PRODUCTO: programa.NO_PRODUCTO,
                            ID_PROGRAMA: programa.ID_PROGRAMA,
                            DS_PROGRAMA: programa.DS_PROGRAMA,
                            ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
                            DS_TIPO_POLIZA: vm.parent.getDsColectivo(programa.ID_TIPO_POLIZA)
                        });
                        
                        //Añadir al listado de productos múltiples
                        vm.productosMulti.push({
                            id: programa.ID_PRODUCTO,
                            label: programa.DS_PRODUCTO,
                            ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
                            DS_TIPO_POLIZA: vm.parent.getDsColectivo(programa.ID_TIPO_POLIZA)
                        });
                        
                        //Comprobamos si el programa está ya en la lista. Si no está, se añade
                        var existePrograma = vm.tipos.programa.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
                        if (existePrograma == -1) {
                            vm.tipos.programa.push({
                                ID_PROGRAMA: programa.ID_PROGRAMA,
                                DS_PROGRAMA: programa.DS_PROGRAMA
                            })
                        }
                        
                    }

                    if (vm.tipos.programa.length == 1) {
                        vm.ID_PROGRAMA = [];
                        vm.ID_PROGRAMA.push(vm.tipos.programa[0].ID_PROGRAMA);
                        vm.changePrograma();
                    }
                }
            }
    		
    		if(vm.parentApp.listServices.listCompanias != null && vm.parentApp.listServices.listCompanias.length > 0){
    			vm.tipos.compania = vm.parentApp.listServices.listCompanias;
    		} else {
    			// TiposService.getCompania({})
    			// .then(function successCallback(response){
    			// 	if(response.status == 200){
				// 		vm.tipos.compania = response.data.TIPOS.TIPO;
				//COMISIONISTAS
				AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true})
				.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.ASEGURADORAS;
    					vm.parentApp.listServices.listCompanias = vm.tipos.compania;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listRamos != null && vm.parentApp.listServices.listRamos.length > 0){
    			vm.tipos.ramos = vm.parentApp.listServices.listRamos;
    		} else {
    			TiposService.getRamos({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.ramos = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listRamos = vm.tipos.ramos;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listMedioPago != null && vm.parentApp.listServices.listMedioPago.length > 0){
    			vm.tipos.pago = vm.parentApp.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.pago = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listMedioPago = vm.tipos.pago;
    				}
    			});
    		}
    		
    		if(vm.parentApp.listServices.listSituaRecibo != null && vm.parentApp.listServices.listSituaRecibo.length > 0){
    			vm.tipos.situaRecibo = vm.parentApp.listServices.listSituaRecibo;
    		} else {
    			TiposService.getSituaRecibo({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.situaRecibo = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listSituaRecibo = vm.tipos.situaRecibo;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listTiposRecibo != null && vm.parentApp.listServices.listTiposRecibo.length > 0){
    			vm.tipos.tiposRecibo = vm.parentApp.listServices.listTiposRecibo;
    		} else {
    			TiposService.getTiposRecibo()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposRecibo = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listTiposRecibo = vm.tipos.tiposRecibo;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		// if(vm.parentApp.listServices.listColectivos != null && vm.parentApp.listServices.listColectivos.length > 0){
    		// 	vm.colectivos = vm.parentApp.listServices.listColectivos;
    		// } else {
    		// 	ColectivoService.getListColectivos({})
    		// 	.then(function successCallback(response){
    		// 		if(response.status == 200){
    		// 			vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
    		// 			vm.parentApp.listServices.listColectivos = vm.colectivos;
    		// 		}
    		// 	}, function callBack(response) {
    		// 		if(response.status == 406 || response.status == 401){
    		// 			vm.parent.logout();
    		// 		}
    		// 	});
    		// }
    		vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de filtro
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.remesas.html";
    	}
    	
    	vm.buscar = function(tipo){
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
//                $mdDialog.show({
//    			templateUrl: BASE_SRC+'filtros/filtros.error.html',
//    			controllerAs: '$ctrl',
//    			clickOutsideToClose:true,
//    			parent: angular.element(document.body),
//    		    fullscreen:false,
//    		    controller:['$mdDialog', function($mdDialog){
//    		    	var md = this;
//    	    	    md.cancel = function() {
//    	    	      $mdDialog.cancel();
//    	    	    };
//                }]
//    		});
    		} else {
				vm.desplegado = false;
                vm.basicSearch = true;
			}
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
		
        vm.showBasicSearch = function () {
            vm.desplegado = true;
            vm.basicSearch = !vm.basicSearch;
        }
        
        vm.changeColectivos = function (colectivo) {
            if (vm.form == null) {
                vm.form = {};
            }

            if (vm.form.LST_TIPOCOLECTIVO == null) {
                vm.form.LST_TIPOCOLECTIVO = {
                    value: []
                }
            }

            //Si hemos seleccionado un colectivo padre
            if (colectivo.IS_PADRE == true) {

                //Si el colectivo ya estaba añadido, lo deseleccionamos y deseleccionamos los hijos
                if (vm.form.LST_TIPOCOLECTIVO.value != null && vm.form.LST_TIPOCOLECTIVO.value.includes(colectivo.ID_TIPO_POLIZA)) {
                    var index = vm.form.LST_TIPOCOLECTIVO.value.findIndex(x => x == colectivo.ID_TIPO_POLIZA);
//                    vm.form.LST_TIPOCOLECTIVO.value.slice(index, 1);

                    //Recorremos los colectivos para encontrar los hijos y eliminarlos de la listaColectivo
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && vm.form.LST_TIPOCOLECTIVO.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            var indexHijo = vm.form.LST_TIPOCOLECTIVO.value.findIndex(x => x == vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                            vm.form.LST_TIPOCOLECTIVO.value.splice(indexHijo, 1);
                        }
                    } 
                } 
                //Si no está añadido a la lista, se añade y se seleccionan todos sus hijos
                else {
//                    vm.form.LST_TIPOCOLECTIVO.value.push(colectivo.ID_TIPO_POLIZA);

                    //Recorremos los productos para encontrar sus hijos y añadirlos
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && !vm.form.LST_TIPOCOLECTIVO.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            vm.form.LST_TIPOCOLECTIVO.value.push(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                        }
                    } 
                }
            } else {
                if (vm.form.LST_TIPOCOLECTIVO.value.includes(colectivo.ID_TIPO_POLIZA) && vm.form.LST_TIPOCOLECTIVO.value.includes(colectivo.ID_TIPOCOLECTIVO_PADRE)) {
                    var indexColectivoPadre = vm.form.LST_TIPOCOLECTIVO.value.findIndex(x => x == colectivo.ID_TIPOCOLECTIVO_PADRE);
                    vm.form.LST_TIPOCOLECTIVO.value.splice(indexColectivoPadre, 1);
                }
            }
        }
        
    }    
    ng.module('App').component('filtrosRemesasApp', Object.create(filtrosRemesasComponent));    
})(window.angular);