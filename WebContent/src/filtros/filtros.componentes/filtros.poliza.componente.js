(function(ng) {	

	//Crear componente de busqueda
    var filtrosPolizasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'UsuarioService', 'uiGridConstants', 'ColectivoService','BASE_SRC','$mdDialog', 'AseguradoraService', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosPolizasComponent.controller = function filtrosPolizasComponentComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, UsuarioService, ColectivoService, uiGridConstants, BASE_SRC,$mdDialog, AseguradoraService, constantsTipos){
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
		vm.rol = window.sessionStorage.rol;
		vm.showMovField = false;
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
            var policyNumberUrl = getUrlParam('policyNumber', url);
            var idProgramaUrl = vm.parent.getUrlParam('idPrograma', $location.url());
            
            vm.tipos.programa = [];
            vm.tipos.productos = [];
            vm.tipos.colectivosProducto = [];
            
            var perfil = sessionStorage.getItem('perfil');

            vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
            var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
            vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
            
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
                        if (vm.productosMulti.findIndex(x => x.id == programa.ID_PRODUCTO) == -1) {
							vm.productosMulti.push({
								id: programa.ID_PRODUCTO,
								label: programa.NO_PRODUCTO,
								ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
								DS_TIPO_POLIZA: vm.parent.getDsColectivo(programa.ID_TIPO_POLIZA)
							});
    		    		}
                        
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

			AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.mediadores = response.data.ASEGURADORAS;
				}
			}, function successCallback(response){
			});
			
//    		UsuarioService.getUsuariosByFilter({ ID_GRUPO_ROL: 3 })
//    		.then(function successCallBack(response){
//    			if(response.status == 200){
//    				vm.listUsuarios = response.data.USUARIOS;
//				}
//    		}, function callBack(response){
//				if(response.status == 406 || response.status == 401){
//                	vm.parent.logout();
//                }
//			});
    		
    		if(vm.parentApp.listServices.listProvincias != null && vm.parentApp.listServices.listProvincias.length > 0){
    			vm.tiposProvincia = vm.parentApp.listServices.listProvincias;
    		} else {
    			TiposService.getProvincias({})
                .then(function successCallback(response){
                    if(response.status == 200){
                        vm.tiposProvincia = response.data.TIPOS.TIPO;
                        vm.parentApp.listServices.listProvincias = vm.tiposProvincia;
                    }
                }, function callBack(response){
                    if(response.status == 406 || response.status == 401){
                        vm.parent.logout();
                    }
                });
    		}
    		
    		if(vm.parentApp.listServices.listCompanias != null && vm.parentApp.listServices.listCompanias.length > 0){
    			vm.tipos.compania = vm.parentApp.listServices.listCompanias;
    		} else {
    			TiposService.getCompania({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.compania = response.data.TIPOS.TIPO;
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
    			TiposService.getRamos({"IN_TARIFICABLE": true})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.ramos = response.data.TIPOS.TIPO;
    					//¿Eliminar accidentes de la lista de ramos?
    					for(var i = 0; i < vm.tipos.ramos.length; i++) {
    						if (vm.tipos.ramos[i].NO_RAMO == 'Accidentes') {
    							vm.tipos.ramos.splice(i,1);
    						}
    					}
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
    		
    		if(vm.parentApp.listServices.listSituaPolizas != null && vm.parentApp.listServices.listSituaPolizas.length > 0){
    			vm.tipos.estados = vm.parentApp.listServices.listSituaPolizas;
    		} else {
    			TiposService.getSituaPolizas({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.estados = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listSituaPolizas = vm.tipos.estados;
    				}
    			});
    		}

			if(vm.parentApp.listServices.listEmisiones != null && vm.parentApp.listServices.listEmisiones.length > 0){
    			vm.tipos.emision = vm.parentApp.listServices.listEmisiones;
    		} else {
    			TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_EMISION})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.tipos.emision = response.data.TIPOS.TIPO;
						vm.parentApp.listServices.listEmisiones = vm.tipos.emision;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
					}
				});
    		}
			
			if(vm.parentApp.listServices.listMotivosAnulacion != null && vm.parentApp.listServices.listMotivosAnulacion.length > 0){
    			vm.tipos.causas = vm.parentApp.listServices.listMotivosAnulacion;
    		} else {
    			TiposService.getMotivosAnul({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.causas = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listMotivosAnulacion = vm.tipos.causas;
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
			
			if(vm.parentApp.listServices.listCanales != null && vm.parentApp.listServices.listCanales.length > 0) {
    			vm.canales = vm.parentApp.listServices.listCanales;
    		} else {
    			TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.canales = response.data.TIPOS.TIPO;
						vm.parentApp.listServices.listCanales = vm.canales;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
					}
				});
			}

            if (policyNumberUrl != null && policyNumberUrl != "") {
            	if (vm.form == null) {
            		vm.form = {};
            	}
            	
            	vm.form.NU_POLIZA = {
        			value: policyNumberUrl
            	}
            	
            	vm.buscar('polizas');
            }
            
    		//Comprobarsi existe el idPrograma en la url
            if (idProgramaUrl != null && idProgramaUrl != "") {
            	vm.ID_PROGRAMA = [];
            	vm.ID_PROGRAMA.push(parseInt(idProgramaUrl));
            	vm.changePrograma();
            }

			if(vm.parent.parent.userProducts) {
				for(let i = 0; i < vm.parent.parent.userProducts.length; i++) {
					if(vm.parent.parent.userProducts[i].ID_PROGRAMA == 5 ||
						vm.parent.parent.userProducts[i].ID_PROGRAMA == 11 || 
						vm.parent.parent.userProducts[i].ID_PROGRAMA == 12) {
							vm.showMovField = true;
					}
				}
			}

		}
		
		vm.checkProduct = function(idProducto) {
			switch (idProducto) {
				case 10:
				case 11:
				case 12:
					vm.labelSituaRiesgo = 'Nº Teléfono';
					break;
			
				default:
					vm.labelSituaRiesgo = 'No disponible';
					break;
			}
		}
		
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.poliza.html";
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
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
						if(value.value == "" || value.value==null){
							delete vm.form[key];
						}
					});
				if(vm.parent.filtrar(vm.form, tipo)){
					// $mdDialog.show({
					// templateUrl: BASE_SRC+'filtros/filtros.error.html',
					// controllerAs: '$ctrl',
					// clickOutsideToClose:true,
					// parent: angular.element(document.body),
					// fullscreen:false,
					// controller:['$mdDialog', function($mdDialog){
					// 	var md = this;
					//     md.cancel = function() {
					//       $mdDialog.cancel();
					//     };
					// }]
					// });
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
				} else {
					vm.desplegado = false;
					vm.basicSearch = true;
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
    	
    	vm.onSelectionChanged = function (item) {
    		if (vm.form.LST_PRODUCTOS == undefined) {
    			vm.form.LST_PRODUCTOS = {
    					value: []
    			};
    		} else {
    			vm.form.LST_PRODUCTOS.value = [];
    		}
    		vm.settingsDropdownText.dynamicButtonTextSuffix = "";

    		if (vm.selectedmodelProductos != null && vm.selectedmodelProductos.length > 0) {
    			for (var i = 0; i < vm.selectedmodelProductos.length; i++) {
                    if (!vm.form.LST_PRODUCTOS.value.includes(vm.selectedmodelProductos[i].id)) {
                        vm.form.LST_PRODUCTOS.value.push(vm.selectedmodelProductos[i].id);
                    }
    			}
    		} else {
    			vm.form.LST_PRODUCTOS.value = [];
    			vm.ID_PROGRAMA = [];
                vm.tipos.colectivosProducto = JSON.parse(window.sessionStorage.perfil).colectivos;
                vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
    		}
    	}
		
		vm.desplegar = function () {
			vm.desplegado = !vm.desplegado;
			vm.showCamposBusqueda = !vm.showCamposBusqueda;
		}
		
        vm.changePrograma = function () {
            if (vm.ID_PROGRAMA != null && vm.tipos.productos != null) {
                vm.selectedmodelProductos = [];
                vm.productosMulti = [];
                vm.tipos.colectivosProducto = [];
                for (var i = 0; i < vm.tipos.productos.length; i++) {
                    var producto = vm.tipos.productos[i];
                    
                    if (vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA)) {
                    	
                    	if (vm.productosMulti.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
	                        vm.productosMulti.push({
	                            id: producto.ID_PRODUCTO,
	                            label: producto.NO_PRODUCTO,
	                            ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
	                            DS_TIPO_POLIZA: vm.parent.getDsColectivo(producto.ID_TIPO_POLIZA)
	                        });
                    	}
                        
                    	if (vm.selectedmodelProductos.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
	                        vm.selectedmodelProductos.push({
	                            id: producto.ID_PRODUCTO,
	                            label: producto.DS_PRODUCTO
	                        });
                    	}
                        

                        //Añadimos los colectivos
                        if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
                            var obj = {
                                ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
                                DS_TIPO_POLIZA: vm.parent.getDsColectivo(producto.ID_TIPO_POLIZA),
                                ID_PRODUCTO: producto.ID_PRODUCTO,
                                DS_PRODUCTO: producto.DS_PRODUCTO
                            };

                            var colectivoPadre = vm.parent.getColectivoPadre(producto.ID_TIPO_POLIZA);
                            if (colectivoPadre.ID_TIPOCOLECTIVO_PADRE == undefined) {
                                obj.IS_PADRE = true;                                
                                obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPO_POLIZA;
                            } else {
                                obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPOCOLECTIVO_PADRE;
                            }
                            
                            if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
                                vm.tipos.colectivosProducto.push(obj);
                            }
                            
                            if (obj.IS_PADRE != true && colectivoPadre != null && vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == colectivoPadre.ID_TIPOCOLECTIVO_PADRE) == -1) {
                                vm.tipos.colectivosProducto.push({
                                    ID_TIPOCOLECTIVO_PADRE: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
                                    ID_TIPO_POLIZA: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
                                    DS_TIPO_POLIZA: colectivoPadre.DS_TIPO_POLIZA_PADRE,
                                    ID_PRODUCTO: producto.ID_PRODUCTO,
                                    DS_PRODUCTO: producto.DS_PRODUCTO,
                                    IS_PADRE: true
                                });
                            }
                        }
                    }
                }
                
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
            } else {
                vm.selectedmodelProductos = [];
                vm.productosMulti = [];
                vm.tipos.colectivosProducto = [];
                vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
            }
            
            if (vm.form == undefined) {
                vm.form = {};
            }
            vm.form.LST_ID_TIPO_POLIZA = {
                value: []
            }
            vm.onSelectionChanged();
        }
        
        vm.changeColectivos = function (colectivo) {
            if (vm.form == null) {
                vm.form = {};
            }

            if (vm.form.LST_ID_TIPO_POLIZA == null) {
                vm.form.LST_ID_TIPO_POLIZA = {
                    value: []
                }
            }

            //Si hemos seleccionado un colectivo padre
            if (colectivo.IS_PADRE == true) {

                //Si el colectivo ya estaba añadido, lo deseleccionamos y deseleccionamos los hijos
                if (vm.form.LST_ID_TIPO_POLIZA.value != null && vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPO_POLIZA)) {
                    var index = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == colectivo.ID_TIPO_POLIZA);
//                    vm.form.LST_COLECTIVOS.value.slice(index, 1);

                    //Recorremos los colectivos para encontrar los hijos y eliminarlos de la listaColectivo
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && vm.form.LST_ID_TIPO_POLIZA.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            var indexHijo = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                            vm.form.LST_ID_TIPO_POLIZA.value.splice(indexHijo, 1);
                        }
                    } 
                } 
                //Si no está añadido a la lista, se añade y se seleccionan todos sus hijos
                else {
//                    vm.form.LST_COLECTIVOS.value.push(colectivo.ID_TIPO_POLIZA);

                    //Recorremos los productos para encontrar sus hijos y añadirlos
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && !vm.form.LST_ID_TIPO_POLIZA.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            vm.form.LST_ID_TIPO_POLIZA.value.push(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                        }
                    } 
                }
            } else {
                if (vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPO_POLIZA) && vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPOCOLECTIVO_PADRE)) {
                    var indexColectivoPadre = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == colectivo.ID_TIPOCOLECTIVO_PADRE);
                    vm.form.LST_ID_TIPO_POLIZA.value.splice(indexColectivoPadre, 1);
                }
            }
        }

        vm.changeSubproducto = function () {

            //Comprobar si se han deseleccionado todos los subproductos de algún producto seleccionadofor (var i = 0; i < vm.tipos.productos.length; i++) {
            for (var j = 0; j < vm.ID_PROGRAMA.length; j++) {
                var deseleccionarPrograma = true;

                for (var i = 0; i < vm.tipos.productos.length; i++) {
                    var producto = vm.tipos.productos[i];

                    if (vm.form != null && vm.form.LST_PRODUCTOS != null && vm.form.LST_PRODUCTOS.value != null) {
                        //Si deseleccionamos todos los subproductos de X producto, desaparece el producto del filtro. Si volvemos a añadir algún subproducto, se añade el `producto al filtro
                        if (vm.form.LST_PRODUCTOS.value.findIndex(x => x == producto.ID_PRODUCTO) > -1 && !vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA)) {
                            vm.ID_PROGRAMA.push(producto.ID_PROGRAMA);
                        }
                        
                        if (vm.ID_PROGRAMA[j] == producto.ID_PROGRAMA) {
                            if (vm.form.LST_PRODUCTOS.value.findIndex(x => x == producto.ID_PRODUCTO) > -1) {
                                deseleccionarPrograma = false;
                            }
                        }
                    }
                }

                if (deseleccionarPrograma == true) {
                    vm.ID_PROGRAMA.splice(j, 1);
                    j--;
                }
            }
        }
		
		vm.clearAnul = function(){
			if(!vm.parent.selectedFilter(vm.form.LST_SITUAPOLIZA.value, [2])){
				vm.form.LST_CAUSASANULACION.value = undefined;
			}
		}

		vm.cambiarBusquedaAvanzada = function () {
			vm.busquedaAvanazda = !vm.busquedaAvanazda;
		}

		vm.showBasicSearch = function () {
			vm.desplegado = true;
			vm.basicSearch = !vm.basicSearch;
		}
		
        function getUrlParam( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }    }    
    ng.module('App').component('filtrosPolizasApp', Object.create(filtrosPolizasComponent));    
})(window.angular);