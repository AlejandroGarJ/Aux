(function (ng) {

    //Crear componente de busqueda
    var busquedaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$location', '$window', '$mdDialog', '$routeParams', 'PolizaService', 'ClienteService', 'DescargaService', 'BASE_SRC', 'MovilService'],
        require: {
			appParent: '^sdApp',
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            isClient: '<',
            datosCliente: '<',
            isConsultagdpr: '<'
        }
    }

    busquedaComponent.controller = function busquedaComponentController($location, $window, $mdDialog, $routeParams, PolizaService, ClienteService, DescargaService, BASE_SRC, MovilService) {
        var vm = this;
        var json = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
        vm.callGetDetail = false;
        vm.listadoActualizado  = false;
        
        var templateVar= `<div class="ui-grid-cell-contents">
            <a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 100, 120)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'rgpd_clientes\', row)">{{row.entity.tomador.NO_NOMBRE_COMPLETO}}</a>
            <span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 100, 120)">{{row.entity.tomador.NO_NOMBRE_COMPLETO}}</span>
        </div>`;

        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.vista = 1;
            
            //Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
                vm.permisos = vm.parent.parent.getPermissions('rgpd_polizas');
    		}
    		
            //Cargar las listas
            if (/rgpd_polizas/.test(url)) {
                if (localStorage.polizas != undefined && localStorage.polizas != "") {
                    vm.gridOptions.data = JSON.parse(localStorage.polizas);
                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }

            //Abrir el detalle de la póliza cuando si tiene parametro
            if ($routeParams.id != null) {
                var poliza = JSON.parse(localStorage.polizas);
                var fila = _.filter(poliza, { 'ID_POLIZA': $routeParams.id })

                cargarDetalle(fila[0]);
            }

        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }

            if (vm.parent.url == 'rgpd_polizas')
                vm.tipo = 'rgpd_polizas';

            if (vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0 || /rgpd_polizas/.test(url)) {
                if (vm.view == 4 && vm.tipo == "rgpd_polizas") { 
                    vm.gridOptions.data = vm.listBusqueda; 
                    vm.active = 0;
                }
                
                if(vm.listBusqueda != undefined && vm.listBusqueda.listas != undefined){
                	vm.gridOptions.data = vm.listBusqueda;
                }
                
                if (vm.gridOptions != undefined && vm.gridOptions.columnDefs != undefined)
                	vm.gridOptions.columnDefs[3].cellTemplate = templateVar;
                
            }
            else {
                vm.vista = 4;
                vm.active = 0;
            }

        }

        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: 0,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
            columnDefs: [
                {
                    field: 'DS_PRODUCTO',
                    displayName: 'Producto',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: 300,
                    cellTooltip: function (row) { return row.entity.NO_RAMO }
                },
                {
                    field: 'NU_POLIZA',
                    displayName: 'Poliza',
                    cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'rgpd_polizas\', row)">{{row.entity.NU_POLIZA}}</a></div>',
                    cellTooltip: function (row) { return row.entity.NU_POLIZA }
                },
                {
                    field: 'DS_TIPO_POLIZA',
                    displayName: 'Partner',
                    cellTooltip: function (row) { return row.entity.DS_TIPO_POLIZA }
                },              
                {
                    field: 'tomador.NO_NOMBRE_COMPLETO',
                    displayName: 'Tomador',
                    cellTemplate: templateVar,
                    cellTooltip: function (row) { 
                    	if(row.entity.OPAGADOR != undefined){
                    		return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO;
                    	}else {
                    		return templateVar;
                    	}
                	}
                },               
                {
                    field: 'IM_PRIMA_TOTAL',
                    displayName: 'Importe',
                    cellFilter: "currency:'€' : 2",
                    cellTooltip: function (row) { return row.entity.IM_PRIMA_TOTAL }
                },
                {
                    field: 'FD_EMISION',
                    displayName: 'Fecha de Emisión',
                    cellTooltip: function (row) { return row.entity.FD_EMISION },
                    cellFilter: 'date:\'dd/MM/yyyy\''
                },
                {
                    field: 'FD_INICIO',
                    displayName: 'Fecha de Efecto',
                    cellTooltip: function (row) { return row.entity.FD_INICIO },
                    cellFilter: 'date:\'dd/MM/yyyy\''
                },
                {
                    field: 'FD_VENCIMIENTO',
                    displayName: 'Fecha de Vencimiento',
                    cellTooltip: function (row) { return row.entity.FD_VENCIMIENTO },
                    cellFilter: 'date:\'dd/MM/yyyy\''
                },
                {
                    field: 'menu',
                    displayName: '',
                    width: "3%",
                    cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_POLIZA != null">
			                    	<md-menu>
			                			<md-button ng-click="$mdMenu.open()">
			                				<i class="fa-regular fa-ellipsis-vertical"></i>
		                				</md-button>
		                				<md-menu-content>
			                				<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnDescarga(row.entity)" ng-click="grid.appScope.$ctrl.descargarPDF(row.entity)">
			                					<md-button>
			                						<span class="menuItemCheckBundlePO">
			                							<i class="fa-sharp fa-solid fa-download"></i>
			                							DESCARGAR
		                							</span>
		            							</md-button>
		        							</md-menu-item>
		        							<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnRenovar(row.entity)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'renovar-poliza\', row)">
			                					<md-button>
			                						<span class="menuItemCheckBundlePO">
			                							<i class="fa-sharp fa-solid fa-rotate"></i>
			                							RENOVAR
		                							</span>
		            							</md-button>
		        							</md-menu-item>
		        							<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnRetarificar(row.entity)" ng-click="grid.appScope.$ctrl.retarificar(row.entity)">
			                					<md-button >
			                						<span class="menuItemCheckBundlePO">
			                							<i class="fa-sharp fa-solid fa-calculator-simple"></i>
			                							RETARIFICAR
		                							</span>
		            							</md-button>
		        							</md-menu-item>
			                				<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnOpciones(row.entity) == false">
		                						<span class="menuItemCheckBundlePO">
		                							NO HAY OPCIONES
	                							</span>
		        							</md-menu-item>
	        							</md-menu-content>
        							</md-menu>
    							</div>`
                }

            ],
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                if(vm.permisos != undefined) {
                    for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
                        switch (vm.gridOptions.columnDefs[i].name) {
                            case '  ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
                                break;
                            case ' ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_BORRADO;
                                break;
                            case '   ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_EXPORTAR;
                                    break;
                            default:
                                break;
                        }
                    }
                }
                vm.gridApi.grid.registerDataChangeCallback(function () {
                    vm.gridApi.treeBase.expandAllRows();
                });
                vm.parent.translateHeaders(vm.gridOptions);    
            }
        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function () {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.polizas_rgpd.html";
            } else {
                return "src/error/404.html";
            }
        }
        
        vm.mostrarBtnDescarga = function (poliza) {
        	if (poliza.NU_POLIZA != null && poliza.ID_PRODUCTO != 9 && poliza.ID_PRODUCTO != 13 && poliza.ID_SITUAPOLIZA != 3) {
        		return true;
        	} else return false;
        }
        
        vm.mostrarBtnRenovar = function (poliza) {
        	if (poliza.NU_POLIZA != null && poliza.IN_RENOVADA == true) {
        		return true;
        	} else return false;
        }
        
        vm.mostrarBtnRetarificar = function (poliza) {
        	if (poliza.NU_POLIZA != null && poliza.ID_RAMO == 10) {
        		return true;
        	} else return false;
        }
        
        vm.mostrarBtnOpciones = function (poliza) {
        	if (vm.mostrarBtnDescarga(poliza) == true || vm.mostrarBtnRenovar(poliza) == true) {
        		return true;
        	} else return false;
        }


        //Borrar casillas al cambiar
        vm.clearModel = function () {
            angular.forEach(vm.form, function (value, key) {
                value.value = "";
            });
        }

        //Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
        vm.verDetalle = function (fila, key) {
        	if(key && key=='rgpd_clientes'){
                ClienteService.getCliente({"ID_CLIENTE":fila.tomador.ID_CLIENTE})
                .then(function successCallback(response) {
                    vm.detallesCliente = response.data;
                    vm.llave = 'rgpd_clientes';
                    cargarDetalle(vm.detallesCliente);
                }, function errorCallBack(response) {
                    
                });
        	} else if (key == "renovar-poliza") {
        		vm.llave = "renovar-poliza";
        		cargarDetalle(fila);
        	} else{
        		vm.llave = 'poliza';
        		cargarDetalle(fila);
        	}
        }

        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
            
            if(vm.listadoActualizado){
            	vm.parent.buscar(vm.parent.form, "polizas");
            }
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        //Abrir modal de nuevo poliza
        vm.openNewPoliza = function () {
        	var existe = false;
        	for(var i = 0; i < vm.numDetalles.length; i++) {
        		if(vm.numDetalles[i] === null){
        			existe = true;
        			break;
        		}
        	}
        	if(!existe) {
                if(vm.numDetalles.length < 1) {
                    vm.numDetalles.push(null);
                    vm.nomDetalles.push('poliza');
                    vm.active = vm.numDetalles.length;
                    vm.actives = vm.numDetalles.length + 1;
                    vm.cargarDetalle = false;
                } else {
                    msg.textContent('Ya hay un detalle de póliza abierto');
					$mdDialog.show(msg);
                }
            } else {
                msg.textContent('Hay un nuevo formulario de póliza abierto');
                $mdDialog.show(msg);
            }
        }

        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila) {
        	
        	 var existe = false;
 			 var dato = ''
 			
             if(vm.llave == 'rgpd_clientes'){
             	dato = 'ID_CLIENTE';
             } else if(vm.llave == 'rgpd_polizas' || vm.llave == "renovar-poliza") {
             	dato = 'ID_POLIZA';
             }
             for(var i = 0; i < vm.numDetalles.length; i++) {
 				if(vm.numDetalles[i] != null) {
 					if(vm.numDetalles[i][dato] == fila[dato]) {
 						existe = true;
 						break;
 					}
             	}
             }
             if (!existe) {
            	 
            	//Para intercambiar en la misma pestaña
     			if (vm.numDetalles.length > 0) {
     				vm.numDetalles = [];
     				vm.nomDetalles = [];
         			setTimeout( function () { 
         					vm.datosPoliza = fila;
     	    				vm.numDetalles.push(fila);
     	    				vm.nomDetalles.push(vm.llave);
     	    				vm.active = vm.numDetalles.length;
         				}, 
         			10);
     			} else {
 					vm.datosPoliza = fila;
     				vm.numDetalles.push(fila);
     				vm.nomDetalles.push(vm.llave);
     				vm.active = vm.numDetalles.length;
     			}
     			
             } else if (vm.numDetalles[0] == fila && vm.nomDetalles[0] == vm.llave) {
 				vm.active = vm.numDetalles.length;
 			} else {
 				vm.numDetalles.splice(0, 1);
 				vm.nomDetalles.splice(0, 1);

 				vm.numDetalles.push(fila);
 				vm.nomDetalles.push(vm.llave);
 				vm.active = vm.numDetalles.length;
				vm.datosPoliza = fila;
 			}
        }

        //Retarificación
        vm.retarificar = function (fila) {
            if(fila.ID_POLIZA != null && fila.ID_POLIZA != undefined){
	            PolizaService.getRetarificarPoliza(fila)
	            .then(function successCallback(response) {
	                if (response.status == 200) {
	                	if(response.data.ID_RESULT == 702 || response.data.ID_RESULT == 999){
                            msg.textContent(response.data.DS_RESULT)
					        $mdDialog.show(msg);
	                	}else if(response.data.ID_PRESUPUESTO == undefined){
                            msg.textContent('Ha ocurrido un error al generar el presupuesto');
                            $mdDialog.show(msg);
		              	}else{
                            msg.textContent("Se ha retarificado la póliza. Presupuesto generado: "+ response.data.ID_PRESUPUESTO);
                            $mdDialog.show(msg);                 		
	                	}
	                    return response.data;
	                }
	            }, function errorCallback(response) {
                    msg.textContent("Se ha producido un error. Pongase en contacto con el administrador");
                    $mdDialog.show(msg);	
	            });
            }else{
                msg.textContent("Ha ocurrido un error al retarificar la póliza");
                $mdDialog.show(msg);
            }
            

        }

      //Función que muestra una solicitud creada en el momento
        vm.showNuevaSolicitud = function(solicitud){
        	vm.callGetDetail = false;
        	var detallesAbiertos = [];

        	vm.numDetalles.push(solicitud);
			vm.nomDetalles.push('solicitud');
            
            if(vm.numDetalles != null){
                for(var i = 0; i < vm.numDetalles.length; i++){
                    detallesAbiertos.push(vm.numDetalles[i]);
                }
            }
            
            for(var i = 0; i < detallesAbiertos.length; i++){
            	if(detallesAbiertos[i] == null && vm.nomDetalles[i] == 'solicitud'){
                    detallesAbiertos.splice(1, i);
                    vm.nomDetalles.splice(1, i);
                    break;
            	}
            }
            
            vm.numDetalles = [];
            setTimeout( function () { 
                    for(var i = 0; i < detallesAbiertos.length; i++){
                        vm.numDetalles.push(detallesAbiertos[i]);
                    }
                    
                    vm.active = vm.numDetalles.length;
                }, 
            10);

        }
        
        vm.exportarExcel = function () {
        	if (vm.comprobarObjetoExportar() == true) {
                if(vm.parent.url == 'clientes'){
                    if(vm.view == 4 && vm.listBusqueda.tipo == 'polizas'){
                        var idCliente = vm.parent.detalleCliente.LST_ASEGURADOS[0].ID_CLIENTE;
                        vm.parent.urlExport = 'polizas'; 
                        vm.parent.form = {"LST_ASEGURADOS":[{"ID_CLIENTE":idCliente}]};
                    }
                } else {
                    if(vm.gridOptions && vm.gridOptions.data) {
                        if(!vm.checkDataExport(vm.gridOptions.data))
                            return;
                    }
                }
                vm.parent.exportarExcel();
        	} else {
                if(vm.parent.form.LST_PRODUCTOS == null || vm.parent.form.LST_PRODUCTOS.length == 0)
                    msg.textContent('Debes seleccionar un producto para poder exportar a excel.');
                else
                    msg.textContent("Debes filtrar más la búsqueda para poder exportar a excel.");
                $mdDialog.show(msg);
        	}
        }
        
        vm.comprobarObjetoExportar = function () {
        	if ((vm.parent.form.LST_ID_TIPO_POLIZA == null || vm.parent.form.LST_ID_TIPO_POLIZA.length == 0) && (vm.parent.form.LST_PRODUCTOS == null || vm.parent.form.LST_PRODUCTOS.length == 0) && (vm.parent.form.NU_POLIZA == null || vm.parent.form.NU_POLIZA == "") && (vm.parent.form.LST_ASEGURADOS == null || vm.parent.form.LST_ASEGURADOS[0] == null || vm.parent.form.LST_ASEGURADOS[0].NU_DOCUMENTO == null || vm.parent.form.LST_ASEGURADOS[0].NU_DOCUMENTO == "")) {
        		return false;
        	} else {
        		return true;
        	}
        }

        vm.checkDataExport = function(data) {
			let inExport = true;
			if(data && data.length >= 1) {
				let products = JSON.parse(sessionStorage.perfil).productos;
				for(let i = 0; i < data.length; i++) {
					for(let j = 0; j < products.length; j++) {
						if(data[i].ID_PRODUCTO == products[j].ID_PRODUCTO && !products[j].IN_EXPORTAR) {
							inExport = false;
							msg.textContent('Los productos seleccionados no pueden ser exportados');
							$mdDialog.show(msg);
							break;
						}
					}
					if(!inExport)
						break;
				}
			}
			return inExport;
		}
        
        //Eliminar 
        vm.eliminarPoliza = function (fila) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_poliza_modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    var jsonBorrar = {
                        "ID_POLIZA":fila.ID_POLIZA,
                        "IT_VERSION":fila.IT_VERSION
                    };
                    md.borrarPoliza = function (option) {
                        if (option) {
                            var borrarPoliza = PolizaService.eliminarPoliza(jsonBorrar);
                            borrarPoliza.then(function successCallback(response) {
                                if (response.status == 200) {
                                    var polizas = [];
                                    for (var i = 0; i < vm.gridOptions.data.length; i++) {
                                        if (vm.gridOptions.data[i].ID_POLIZA != fila.ID_POLIZA) {
                                            polizas.push(vm.gridOptions.data[i]);
                                        }
                                    }

                                    vm.gridOptions.data = polizas;
                                    localStorage.polizas = polizas;
                                    $mdDialog.cancel();
                                    msg.textContent("La póliza se ha borrado con éxito");
                                    $mdDialog.show(msg);
                                }

                            }, function errorCallback(response) {
                                msg.textContent("Ha ocurrido un error al eliminar la póliza. Contacte con el administrador.");
                                $mdDialog.show(msg);
                                if (response.status == 406) {
                                    vm.parent.parent.logout();
                                }
                            })
                        }
                        else
                            $mdDialog.cancel();
                    }

                }]
            });

        }

        vm.descargarPDF = function(fila) {
            if(fila.ID_POLIZA != null && fila.ID_POLIZA != undefined) {

            	if (fila.ID_COMP_RAMO_PROD == 10 || fila.ID_COMP_RAMO_PROD == 11 || fila.ID_COMP_RAMO_PROD == 12 || fila.ID_COMP_RAMO_PROD == 33 || fila.ID_COMP_RAMO_PROD == 34) {
        			vm.appParent.abrirModalcargar(true);
            		MovilService.condiciones(fila.NU_POLIZA)
        	       	.then(function successCallback(response){
        	       		
        	       		if(response.status==200){
    						let utf8decoder = new TextDecoder();
                            var mensajeUArchivo = utf8decoder.decode(response.data);
                            if(mensajeUArchivo.search('code') != -1 && mensajeUArchivo.search('msg') != -1) {
                            	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                            	if(objtMensajeUArchivo.code != 0) {
                            		vm.cargando = false;
    								msg.textContent(objtMensajeUArchivo.msg);
    								$mdDialog.show(msg);
    							}
    						} else {
    							vm.cargar = false;
    							saveAs(new Blob([response.data]), fila.NU_POLIZA + ".pdf");
    							msg.textContent("Se ha descargado correctamente");
    							$mdDialog.show(msg);
    						}
                		}else{
    						msg.textContent(response.data.msg);
    						$mdDialog.show(msg);
                		}
            		},function(error) {
            			let utf8decoder = new TextDecoder();
                        var mensajeUArchivo = utf8decoder.decode(error.data);
                        error.data = JSON.parse(mensajeUArchivo);
            			if ((error.status == 400 || error.status == 500) && error.data.error != null && error.data.error.codigoErrorNegocio != null) {
    						msg.textContent("CODERRROR-" + error.data.error.codigoErrorNegocio + " DESC: " + error.data.error.descripcionErrorNegocio);
    	                    $mdDialog.show(msg);
    	        	    } else {
            				msg.textContent('Se ha producido un error al descargar las condiciones');
            				$mdDialog.show(msg);
    	        	    }
                   });
            	} else {
                    for(var i = 0; i < fila.LST_ASEGURADOS.length; i++) {
                        if(fila.LST_ASEGURADOS[i].ID_TIPO_CLIENTE == 3) {
                            tomador = fila.LST_ASEGURADOS[i];
                        }
                    }
                    if(tomador != undefined) {
                        DescargaService.getCondiciones(tomador, fila.ID_POLIZA);
                    } else {
                        msg.textContent("No se dispone de ninguna información para exportar esta póliza");
                        $mdDialog.show(msg);
                    }
            	}
            }
        }
        
        vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 30;
            
            var totalItems = vm.gridOptions.totalItems;
            if (totalItems > vm.gridOptions.paginationPageSize) {
            	totalItems = vm.gridOptions.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight) + "px"
            };
        }

    }
    ng.module('App').component('busquedaPolizaRgpd', Object.create(busquedaComponent));
})(window.angular);