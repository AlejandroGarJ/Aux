(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
		controllerAs: '$ctrl',
		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
		$inject:['$q', '$location', '$timeout', '$window', '$mdDialog', 'validacionesService', 'sharePropertiesService','uiGridConstants', 'BusquedaService', 'TiposService', 'PolizaService', 'ReciboService', '$scope', '$templateCache', 'BASE_SRC', 'ComisionService', 'BASE_CON', '$translate', 'constantsTipos'],
		require: {
			appParent: '^sdApp',
			parent:'^busquedaApp'
		},
		bindings:{
			listBusqueda:'<',
			view:'<',
			dsActive:'<'
		}
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window, $mdDialog, validacionesService, sharePropertiesService, uiGridConstants, BusquedaService, TiposService, PolizaService, ReciboService, $scope, $templateCache, BASE_SRC, ComisionService, BASE_CON, $translate, constantsTipos){
    	var vm=this;
    	var json = {};
		vm.numDetalles = [];
		vm.nomDetalles = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
		vm.listProductosDescargablesMediador = {};
		vm.listProductosDescargablesCliente = {};
    	
    	$templateCache.put('ui-grid/selectionRowHeaderButtons',
        	    "<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-ok':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('recibos_list');
				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		angular.forEach(vm.parent.pages, function(value, key){
				vm[key] = value;
			});
    		
    		//Recuperar los datos de la busqueda general
    		angular.forEach(vm.parent.compartir, function(value, key){
				vm[key] = value;
			});
    		
    		//Cargar las listas
			if(localStorage.recibos != undefined && localStorage.recibos != ""){
				vm.gridOptions.data = JSON.parse(localStorage.recibos);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}

            TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "DESCARGA_RECIBO_MEDIADOR" })
            .then(function successCallback(response) {
            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                    if (response.data.TIPOS.TIPO[0].DS_TIPOS != null) {
                        var list = response.data.TIPOS.TIPO[0].DS_TIPOS.split(";");
                        for (var i = 0; i < list.length; i++) {
                        	var productoMedioPago = list[i];
                        	var medioPago = "";
                        	var producto = productoMedioPago.split(":")[0];
                        	if (productoMedioPago.includes(":")) {
                        		producto = productoMedioPago.split(":")[0];
                        		medioPago = productoMedioPago.split(":")[1]
                        	}
                        	var obj = {
                    			produto: producto,
                    			listMedioPago: medioPago == "" ? [] : medioPago.split("-")
                        	}
                        	
                        	vm.listProductosDescargablesMediador[producto] = obj;
                        }
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

            TiposService.getTipos({ "ID_CODIGO": constantsTipos.CONFIGURACION, "CO_TIPO": "DESCARGA_RECIBO_CLIENTE" })
            .then(function successCallback(response) {
            	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                    if (response.data.TIPOS.TIPO[0].DS_TIPOS != null) {
                        var list = response.data.TIPOS.TIPO[0].DS_TIPOS.split(";");
                        for (var i = 0; i < list.length; i++) {
                        	var productoMedioPago = list[i];
                        	var medioPago = "";
                        	var producto = productoMedioPago.split(":")[0];
                        	if (productoMedioPago.includes(":")) {
                        		producto = productoMedioPago.split(":")[0];
                        		medioPago = productoMedioPago.split(":")[1]
                        	}
                        	var obj = {
                    			produto: producto,
                    			listMedioPago: medioPago == "" ? [] : medioPago.split("-")
                        	}
                        	
                        	vm.listProductosDescargablesCliente[producto] = obj;
                        }
                    }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;

            if (vm.vista == 1) {
            	vm.numDetalles = [];
        		vm.nomDetalles = [];
            }
            
    		vm.gridOptions.data = vm.listBusqueda;
    		vm.active = 0;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}

    	//UI.GRID Configurado
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    showGridFooter: true,
	            gridFooterTemplate: '<div class="leyendaInferior">' +
										// '<div class="contenedorElemento"><span>Liquidados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
										'<div class="contenedorElemento"><span>Anulados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
										'<div class="contenedorElemento"><span>Devueltos</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
									'</div>',
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
                    {
                        field: 'NU_RECIBO',
						displayName: $translate.instant('RECEIPT'),
						cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'recibo\', row)" ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</a><span ng-if="!grid.appScope.$ctrl.permisos.IN_ESCRITURA">{{row.entity.NU_RECIBO}}</span></div>',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'OPOLIZA.NU_POLIZA',
						displayName: $translate.instant('POLICY_NU'),
						cellTemplate: `<div class="ui-grid-cell-contents">
										<a ng-if="grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a>
										<span ng-if="!grid.appScope.$ctrl.parent.checkMenuOption(grid.appScope.$ctrl.parent.parent.menus, 400, 410)">{{row.entity.OPOLIZA.NU_POLIZA}}</span>
									</div>`,
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'OPAGADOR.NO_NOMBRE_COMPLETO',
						displayName: $translate.instant('CLIENT'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
						field: 'OPOLIZA.DS_TIPO_POLIZA',
						displayName: $translate.instant('PARTNER'),
						cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
            		},
                    {
                        field: 'DS_TIPO_MEDIO_PAGO',
						displayName: $translate.instant('PAYMENT_METHOD'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'DS_SITUARECIBO',
						displayName: $translate.instant('STATUS'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'DS_TIPORECIBO',
						displayName: $translate.instant('RECEIPT_TYPE'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    // {
                    //     field: 'NO_COMPANIA', displayName: 'Aseguradora',
                    //     cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    // },
                    {
                        field: 'IM_RECIBO_TOTAL',
						displayName: $translate.instant('TOTAL'),
						cellFilter: 'currency:"€" : 2',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'FD_INICIO_REC',
						displayName: $translate.instant('DATE_START'),
						cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
					{
                        field: 'FD_COBRO',
						displayName: $translate.instant('DATE_CHARGE'),
						cellFilter: 'date:\'dd/MM/yyyy\'',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    },
                    {
                        field: 'menu',
                        displayName: '',
                        width: "3%",
                        cellTemplate: `<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_RECIBO != null">
    			                    	<md-menu>
    			                			<md-button ng-click="$mdMenu.open()">
    			                				<i class="fa-regular fa-ellipsis-vertical"></i>
    		                				</md-button>
    		                				<md-menu-content class="optionMenuContent">
    			                				<md-menu-item ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA" ng-click="grid.appScope.$ctrl.verDetalleRecibo(row.entity,\'recibo\', row)">
    			                					<md-button>
    			                						<span class="menuItemBlue">
    			                							<i class="fa-sharp fa-solid fa-eye"></i>
    			                							{{ 'SHOW_MOVEMENTS' | translate | uppercase }}
    		                							</span>
    		            							</md-button>
    		        							</md-menu-item>
    			                				<md-menu-item ng-if="grid.appScope.$ctrl.permisos.IN_ESCRITURA" ng-click="grid.appScope.$ctrl.openComisionista($event,row.entity, row)">
    			                					<md-button>
    			                						<span class="menuItemBlue">
    			                							<i class="fa-sharp fa-solid fa-eye"></i>
    			                							{{ 'SEE_COMMISSION_AGENTS' | translate }}
    		                							</span>
    		            							</md-button>
    		        							</md-menu-item>
												<md-menu-item ng-if="row.entity.NU_RECIBO != null && (row.entity.ID_SITUARECIBO == 4 || row.entity.ID_SITUARECIBO == 2 || row.entity.ID_SITUARECIBO == 6) && (row.entity.ID_TIPO_MEDIO_PAGO == 3 || row.entity.ID_TIPO_MEDIO_PAGO == 4)" ng-click="grid.appScope.$ctrl.gestionarRecibo(row.entity, true)">
	    			                					<md-button>
	    			                						<span class="menuItemYellow">
															<i class="fa-sharp fa-solid fa-edit"></i>
	    			                							GESTIONAR RECIBO
	    		                							</span>
	    		            							</md-button>
	    		        							</md-menu-item>
    			                				<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnDescargarReciboCliente(row.entity)" ng-click="grid.appScope.$ctrl.descargarPDF(row.entity)">
    			                					<md-button>
    			                						<span class="menuItemYellow">
    			                							<i class="fa-sharp fa-solid fa-download"></i>
    			                							DESCARGAR RECIBO CLIENTE
    		                							</span>
    		            							</md-button>
    		        							</md-menu-item>
    			                				<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnDescargarReciboMediador(row.entity)" ng-click="grid.appScope.$ctrl.downloadReceiptBroker(row.entity)">
    			                					<md-button>
    			                						<span class="menuItemYellow">
    			                							<i class="fa-sharp fa-solid fa-download"></i>
    			                							DESCARGAR RECIBO MEDIADOR
    		                							</span>
    		            							</md-button>
    		        							</md-menu-item>
    			                				<md-menu-item ng-if="grid.appScope.$ctrl.mostrarBtnBorrar(row.entity)" ng-click="grid.appScope.$ctrl.eliminarRecibo(row.entity)">
    			                					<md-button>
    			                						<span class="menuItemRed">
    			                							<i class="fa-sharp fa-solid fa-trash-list"></i>
    			                							ELIMINAR RECIBO
    		                							</span>
    		            							</md-button>
    		        							</md-menu-item>
    	        							</md-menu-content>
            							</md-menu>
        							</div>`,
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
                    }
                ]
//    		    onRegisterApi: function( gridApi ) {
//    		      vm.gridApi = gridApi;
//    		    }
    	};
    	
    	vm.gridOptions.onRegisterApi = function (gridApi) {
            vm.gridApi = gridApi;
            if ($window.sessionStorage.rol != '1' || vm.permisos.IN_BORRADO === false) {
            	var columnaBorrado = vm.gridOptions.columnDefs.findIndex(x => x.name == "BORRADO");
                if (columnaBorrado != null && columnaBorrado > -1) {
                	vm.gridOptions.columnDefs[columnaBorrado].visible = false;
                }
            };

			if(vm.permisos) {
				for(let i = 0; i < vm.gridOptions.columnDefs.length; i++) {
					if(vm.gridOptions.columnDefs[i].id == 'btnMovimientos' || vm.gridOptions.columnDefs[i].id == 'btnComisionistas') {
						vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
					}
				}
			}
            
			vm.parent.translateHeaders(vm.gridOptions);
        }
        
        vm.mostrarBtnDescargarReciboCliente = function (recibo) {
        	if (recibo.NU_RECIBO != null && recibo.OPOLIZA != null && vm.productosDescargables(recibo.OPOLIZA.ID_COMP_RAMO_PROD, recibo, 'cliente') == true) {
        		return true;
        	} else return false;
        }
        
        vm.mostrarBtnDescargarReciboMediador = function (recibo) {
        	if (recibo.NU_RECIBO != null && recibo.OPOLIZA != null && vm.productosDescargables(recibo.OPOLIZA.ID_COMP_RAMO_PROD, recibo, "mediador") == true) {
        		return true;
        	} else return false;
        }
        
        vm.mostrarBtnBorrar = function (recibo) {
        	if (vm.permisos.IN_BORRADO == true) {
        		return true;
        	} else return false;
        }
    	
    	function colorearEstado(entidad) {
            if (entidad.NU_RECIBO != null) {
                if (entidad.FD_LIQUIDADO != null) {
                    // return 'filaAmarilla';
                } else if (entidad.ID_SITUARECIBO == 3) {
                    return 'filaRoja';
                } else if (entidad.ID_SITUARECIBO == 6) {
                    return 'filaNaranja';
                } else if (entidad.IN_BLOQUEADO != false) {
                	// return 'filaAmarilla';
                }
            }
            else {
                return 'rowGroup';
            }

            
          //Abrir comisionista
          	vm.openComisionista = function(ev, row){
          		vm.row = row;
          		$mdDialog.show({
          			controller: ComisionistaController,
          			templateUrl: BASE_SRC+'detalle/detalle.modals/comisionista.modal.html',
          			controllerAs: '$ctrl',
          			clickOutsideToClose:true,
          			parent: angular.element(document.body),
          		    targetEvent: ev,
          		    fullscreen: false
          		})
          	}
          	function ComisionistaController($mdDialog) {
          		var md = this;
          		md.tipos = {};
          		md.selected = [];
          		md.comisionistas = [];
          		md.cargar = false;
          		md.vista = 0;
          		md.cargar = true;
          		md.permisos = vm.permisos;

        		//UI.GRID Configurado
    	    	md.gridComisionistas = {
        			enableSorting: true,
        			enableHorizontalScrollbar: 0,
        			paginationPageSizes: [15,30,50],
        		    paginationPageSize: 15,
        		    columnDefs: [
        		    	{
							field: 'NO_COMPANIA',
							displayName: 'Colaborador',
							enableCellEdit: false
						},
    					{
							field: 'NU_PORCENTAJE',
							displayName: '% Comisión',
							enableCellEdit: false
						},
    					{
							field: 'NU_COMISION',
							displayName: 'Comisión',
							enableCellEdit: false
						},
    					{
							field: 'NU_COMISION_EURO',
							displayName: 'Comisión (€)',
							enableCellEdit: false
						},
    					{
							field: 'DS_TIPO_COMISION',
							displayName: 'Tipo comisión',
							enableCellEdit: false
						},
    				], onRegisterApi: function( gridApi ) {
    					    md.gridApi = gridApi;
    		        		      
    					    md.listaSeleccionados = [];
    	    		    	
    		  	      		md.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
    		  	      			  if(newValue != oldValue){
    		  	      				  console.log(rowEntity);
    		  	      				  if(!rowEntity.IS_NEW)
    		  	      					  rowEntity.IS_UPDATED = true;
    		  	      			  }
    		  	    		});
    	      		    }
    	    	}
          		
          		var idPoliza = null;
          		if (vm.idPoliza != null) {
          			idPoliza = vm.idPoliza;
          		} else if (vm.row != null && vm.row.OPOLIZA != null && vm.row.OPOLIZA.ID_POLIZA != null) {
                    idPoliza = vm.row.OPOLIZA.ID_POLIZA;
          		}
          		
          		PolizaService.getPolizasByFilter({"ID_POLIZA": idPoliza})
                .then(function successCallback(response) {
                    md.detallesPoliza = response.data.POLIZAS.POLIZA[0];
                }, function errorCallBack(response) {
                    
                });
          		
          		md.getComisionistasByRecibo = function () {
              		BusquedaService.buscar({'ID_RECIBO':vm.row.ID_RECIBO},'comisionistaByRecibo')
              		.then(function successCallback(response){
              			md.cargar = false;
              			if(response.data.NUMERO_COMISIONISTASRECIBO > 0){
              				md.vista = 0;
              				console.log(response);
                  			md.comisionistas = response.data.COMISIONISTASRECIBO.COMISIONISTARECIBO;
                  			md.gridComisionistas.data = md.comisionistas;
              			}else
              				md.vista = 3;
              		})
          		}

          		md.getComisionistasByRecibo();
          		
          		TiposService.getComisionista({})
          		.then(function successCallback(response){
          			md.tipos.comisionistas = response.data.TIPOS.TIPO;
          		});
          		
          		md.toggle = function (item, list) {
          		    var idx = list.indexOf(item);
          		    if (idx > -1) {
          		      list.splice(idx, 1);
          		    }
          		    else {
          		      list.push(item);
          		    }
          		};
          		
          		md.exists = function (item, list) {
          		    return list.indexOf(item) > -1;
          		};
          		
          		md.isIndeterminate = function() {
          		    return (md.selected.length !== 0 &&
          		        md.selected.length !== md.comisionistas.length);
          		  };

          		md.isChecked = function() {
          			if(md.comisionistas != undefined)
          				return md.selected.length === md.comisionistas.length;
          		};

          		md.toggleAll = function() {
          		    if (md.selected.length === md.comisionistas.length) {
          		    	md.selected = [];
          		    } else if (md.selected.length === 0 || md.selected.length > 0) {
          		    	md.selected = md.comisionistas.slice(0);
          		    }
          		};
          		
          		
          		//Añadir nueva comisionista
          		md.addComisionista = function(){
          			if(md.comisionistas != undefined){
          				md.comisionista.ID_RECIBO = vm.row.ID_RECIBO;
          				md.comisionista['ID_COMP_RAMO_PROD'] = md.detallesPoliza.ID_COMP_RAMO_PROD;
          				md.comisionista['ID_TIPOCOLECTIVO'] = md.detallesPoliza.ID_TIPO_POLIZA;
          				md.comisionista.IS_NEW = true;
          				
          				if (md.comisionista.ID_COMPANIA != null) {
          				    md.comisionista.NO_COMPANIA = md.tipos.comisionistas.find(x => x.ID_COMPANIA == md.comisionista.ID_COMPANIA).NO_COMPANIA;
          				}
          				
          				md.comisionistas.push(JSON.parse(JSON.stringify(md.comisionista)));
          			}
          		}
          		
          		//Calcular comision
          		md.calcularComision = function(col){
          			col.NU_COMISION = (vm.row.IM_COMISION * col.NU_PORCENTAJE) / 100;
          			col.NU_COMISION_EURO = col.NU_COMISION;
          			//vm.datos.IM_COMISION
          		}
          		
          		md.eliminarComisionistas = function(){
          			if (md.listaSeleccionados != null && md.listaSeleccionados.length > 0) {
          				
          				//Modal de confirmación al eliminar comisionista
          				var confirm = $mdDialog.confirm().textContent('¿Estás seguro de eliminar los comisionistas seleccionados?').ariaLabel('Lucky day').ok('Aceptar').multiple(true).cancel('Cancelar');
    	
    	      		    $mdDialog.show(confirm).then(function () {
    	      		      for (var i = 0; i < md.listaSeleccionados.length; i++) {
    	      		      	var indexComisionistaEliminado = -1;
    	      		      	if (md.listaSeleccionados[i].ID_COMISIONISTA_RECIBO != null) {
    						    //Si ya estaba creado en BBDD buscamos por ID_COMISIONISTA_RECIBO
    						    indexComisionistaEliminado = md.comisionistas.findIndex(x => x.ID_COMISIONISTA_RECIBO == md.listaSeleccionados[i].ID_COMISIONISTA_RECIBO);
    	      		      	} else {
    						    //Si aún no estaba creado en BBDD, buscamos por ID_COMPANIA
    						    indexComisionistaEliminado = md.comisionistas.findIndex(x => x.ID_COMPANIA == md.listaSeleccionados[i].ID_COMPANIA);
    	      		      	}
    	      		      	
    	      		      	//Añadimos el IS_DELETED a los comisionistas seleccionados
    						if (indexComisionistaEliminado > -1) {
    							md.comisionistas[indexComisionistaEliminado].IS_DELETED = true;
    						}
    	      		      }
    	      		      
    		      		    md.cargar = true;
    		      			ComisionService.saveComisionistasRecibo({"COMISIONISTASRECIBO":{"COMISIONISTARECIBO":md.comisionistas}, "NUMERO_COMISIONISTASRECIBO":md.comisionistas.length})
    		      			.then(function successCallback(response){
    		      				if(response.status == 200){
    		      					md.comisionistaGuardado = true;
    		      		      		md.getComisionistasByRecibo();
    	      						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('Se ha guardado correctamente').ok('Aceptar').multiple(true));
    		      				}else{
    		      					md.comisionistaGuardado = false;
    								$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
    		      				}
    		      				md.cargar = false;
    		      			},function errorCallback(response){
    							md.cargar = false;
    							$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
    		      	        });
    	      		    }, function () {
    	      		    });
          			} else {
    					msg.textContent("Debe seleccionar al menos un comisionista");
    					$mdDialog.show(msg);
          			}
          		}
          		
          		 md.editarComisionista = function(comisionista, $index){
          			 if(!comisionista.IS_UPDATED && !comisionista.IS_DELETED)
          				 md.comisionistas[$index].IS_UPDATED = true;
          		 }
          		
          		//Guardar comisionistas
          		md.guardarComisionista = function(){
          			md.cargar = true;
          			ComisionService.saveComisionistasRecibo({"COMISIONISTASRECIBO":{"COMISIONISTARECIBO":md.comisionistas}, "NUMERO_COMISIONISTASRECIBO":md.comisionistas.length})
          			.then(function successCallback(response){
          				if(response.status == 200){
          					md.comisionistaGuardado = true;
          		      		md.getComisionistasByRecibo();
      						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('Se ha guardado correctamente').ok('Aceptar').multiple(true));
          				}else{
          					md.comisionistaGuardado = false;
      						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.').ok('Aceptar').multiple(true));
          				}
          				md.cargar = false;
          			},function errorCallback(response){
    					md.cargar = false;
    					msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
    					$mdDialog.show(msg);
          	        });
          		}
          		
          	    md.hide = function() {
          	      $mdDialog.hide();
          	    };

          	    md.cancel = function() {
          	      $mdDialog.cancel();
          	    };

          	    md.answer = function(answer) {
          	      $mdDialog.hide(answer);
          	    };
          	  }
        }
    	
    	vm.verDetalleRecibo = function(fila, key, index){
    		
    		vm.fila = fila;
        	vm.key = key;
        	vm.index = index;
        	
        	$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/detalle_recibo.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.cargar = true;
                    md.permisos = vm.permisos;
                    
                    md.seleccionable = function(fila) {
                        if(fila.NU_SAP != undefined || fila.NU_SAP != null)
                          return false;
                        else
                          return true;
                    }
                    
                    ReciboService.getRecibos({"ID_RECIBO":fila.ID_RECIBO, "IS_NEW":true})
    				.then(function successCallback(response) {
    					if(response.data.RECIBOS!=undefined)
    						md.gridDetalleRecibo.data = response.data.RECIBOS.RECIBO;
                        md.cargar = false;
    				}, function errorCallBack(response) {
    					md.cargar = false;
    				});
                    
                    //UI.GRID Configurado
                	  md.gridDetalleRecibo = {
                	            enableSorting: true,
                	            enableHorizontalScrollbar: 0,
                	            paginationPageSizes: [15, 30, 50],
                	            paginationPageSize: 30,
                	            treeRowHeaderAlwaysVisible: true,
                	            showGridFooter: true,
                	            gridFooterTemplate: '<div class="leyendaInferior">' +
														'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'recibos\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
														// '<div class="contenedorElemento"><span>Liquidados</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
														'<div class="contenedorElemento"><span>Anulados</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
														'<div class="contenedorElemento"><span>Devueltos</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
														// '<div class="contenedorElemento"><span>Enviados a SAP</span><span class="elementoLeyenda ui-grid-icon-ok"></span></div>' +
														// '<div class="contenedorElemento"><span>Bloqueados</span><span class="elementoLeyenda leyendaAmarillo">Aa</span></div>' +
													'</div>',
								enableRowSelection: true,
                	            enableSelectAll: true,
                	            selectionRowHeaderWidth: 29,
                	            paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                	            data: [],
                	            columnDefs: [
									{
										field: 'NU_RECIBO',
										displayName: $translate.instant('RECEIPT'),
										cellTooltip: function (row) { return row.entity.NU_RECIBO },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'DS_SITUARECIBO',
										displayName: $translate.instant('STATUS'),
										cellTooltip: function (row) { return row.entity.DS_SITUARECIBO },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'DS_TIPO_MEDIO_PAGO',
										displayName: $translate.instant('PAYMENT_METHOD'),
										cellTooltip: function (row) { return row.entity.DS_TIPO_MEDIO_PAGO },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'FT_USU_ALTA',
										cellFilter: 'date:\'dd/MM/yyyy\'',
										displayName: $translate.instant('CREATED_ON'),
										cellTooltip: function (row) { return row.entity.FT_USU_ALTA },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'FD_SAP',
										cellFilter: 'date:\'dd/MM/yyyy\'',
										displayName: $translate.instant('DATE_ACCOUNTING'),
										cellTooltip: function (row) { return row.entity.FD_SAP },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'NU_SAP', width: '18%',
										displayName: $translate.instant('SAP_SHIPPING_NUMBER'),
										cellTooltip: function (row) { return row.entity.NU_SAP },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
									{
										field: 'FD_LIQUIDADO',
										cellFilter: 'date:\'dd/MM/yyyy\'',
										displayName: $translate.instant('DATE_SETTLEMENT'),
										cellTooltip: function (row) { return row.entity.FD_LIQUIDADO },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
									{
										field: 'FD_LIQ_IPS',
										cellFilter: 'date:\'dd/MM/yyyy\'',
										displayName: $translate.instant('SETTLED_IPS'),
										cellTooltip: function (row) { return row.entity.FD_LIQ_IPS },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
									{
										field: 'FD_LIQ_TIREA',
										cellFilter: 'date:\'dd/MM/yyyy\'',
										displayName: $translate.instant('SETTLED_TIREA'),
										cellTooltip: function (row) { return row.entity.FD_LIQ_TIREA },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									},
                                    {
										field: 'IM_RECIBO_TOTAL',
										cellFilter: 'currency:"€" : 2',
										displayName: $translate.instant('TOTAL'),
										cellTooltip: function (row) { return row.entity.IM_RECIBO_TOTAL },
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }
									}
								]
//                                    {name: ' ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a ng-click="#">Bloquear</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }},
//                                    {name: '  ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a ng-click="#">Desbloquear</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }},
//                                    {name: '   ', cellTemplate: '<div ng-if="row.entity.NU_SAP==undefined" class="ui-grid-cell-contents td-trash"><a ng-click="#">Enviar a SAP</a></div>', width: '8%', enableSorting: false, enableColumnMenu: false,cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return colorearEstado(row.entity); }}],
                	}
                	  
            	  	md.gridDetalleRecibo.isRowSelectable = function(fila) {
                      if(fila.entity.NU_SAP != undefined || fila.entity.NU_SAP != null) 
                    	  return false;
                      else
                    	  return true;
            	    }
            	    
            	    md.gridDetalleRecibo.onRegisterApi = function (gridApi) {
		                md.gridApi = gridApi;
		                md.hola = md.gridDetalleRecibo.columnDefs[0];
		                /*md.gridApi.grid.options.totalItems = md.gridApi.grid.options.data.length;
		                md.gridOptions.totalItems = vm.gridApi.grid.options.data.length;
		                md.gridApi.grid.registerDataChangeCallback(function() {
		                    md.gridApi.treeBase.expandAllRows();
		                });*/
		                
		                md.listaSeleccionados = [];
	                    
	                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
	        	            md.elementoSeleccionado = fila.entity;
	        	            console.log("Recibo " + fila.entity.NU_RECIBO + " seleccionado: " + fila.isSelected);
	        	            md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
	                        console.log(md.listaSeleccionados.length + ' elemento/s seleccionado/s')
	        	        });
	        	        gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
	        	        	md.listaSeleccionados = md.gridApi.selection.getSelectedRows();
	        	        	console.log(md.listaSeleccionados.length + ' elemento/s seleccionado/s')
	        	        });
    	            }
                  
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                    md.bloquearRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != true){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/bloquear_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                    var mdm = this;
            		                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.bloqRecibo = function (option) {
            		                        if (option) {
            		                        	
            		                        	for(var i = 0; i < lista.length; i++){
            	                					if(lista[i].IN_BLOQUEADO == false){
            	                						lista[i] = {
        	                								ID_RECIBO: lista[i].ID_RECIBO,
        	                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
        	                								IN_BLOQUEADO: true,
        	                								IT_VERSION: lista[i].IT_VERSION
        		                						}
            	                					}
            	                				}
            		                        	
            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.bloqRecibo(obj)
            		                			.then(function successCallback(response) {
            		                				
//            		                				setTimeout(function(){ vm.abrirDialogo("Recibos bloqueados correctamente"); }, 1000);
            		                				setTimeout(function(){ vm.recargarMovimientos(); }, 1000);
            											
            		                                }, function errorCallback(response) {
														msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
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
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén desbloqueados');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		
            		md.desbloquearRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != false){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/desbloquear_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                    var mdm = this;
            		                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.desbloqRecibo = function (option) {
            		                        if (option) {
            		                        	
            		                        	for(var i = 0; i < lista.length; i++){
            	                					if(lista[i].IN_BLOQUEADO == true){
            	                						lista[i] = {
        	                								ID_RECIBO: lista[i].ID_RECIBO,
        	                								ID_RECIBO_H: lista[i].ID_RECIBO_H,
        	                								IN_BLOQUEADO: false,
        	                								IT_VERSION: lista[i].IT_VERSION
        		                						}
            	                					}
            	                				}
            		                        	
            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.bloqRecibo(obj)
            		                			.then(function successCallback(response) {
            		                				
            		                				setTimeout(function(){ vm.recargarMovimientos(); }, 1000);
//            		                				setTimeout(function(){ vm.abrirDialogo("Recibos desbloqueados correctamente"); }, 1000);
            											
            		                                }, function errorCallback(response) {
														msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
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
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén bloqueados');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		
            		md.cambiarFContRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				$mdDialog.show({
            	                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/cambiarfecha_recibo.modal.html',
            	                controllerAs: '$ctrl',
            	                clickOutsideToClose: true,
            	                parent: angular.element(document.body),
            	                fullscreen: false,
            	                controller: ['$mdDialog', function ($mdDialog) {
            	                	var mdm = this;
            	                    var lista = JSON.parse(JSON.stringify(md.listaSeleccionados));
            	                    var obj = {};
            	                    var recibos = {};
            	                    
            	                    mdm.updateFDContab = function (option) {
            	                        if (option) {
            	                        	rellenarJSON(mdm.form);
            	                        	var nuevaFecha = mdm.form.FD_SAP;
            	                        	
            	                        	for(var i = 0; i < lista.length; i++){
            		        					// if(lista[i].FD_SAP != undefined){
            		        						lista[i] = {
                        								ID_RECIBO: lista[i].ID_RECIBO,
                        								ID_RECIBO_H: lista[i].ID_RECIBO_H,
                        								FD_SAP: nuevaFecha,
                        								IT_VERSION: lista[i].IT_VERSION
        	                						}
            		        					// }
                            				}
            	                        	
            	                        	obj['RECIBOS'] = {};
            	                        	obj['RECIBOS']['RECIBO'] = lista;
            	                        	
            	                        	$mdDialog.cancel();

                                			vm.appParent.abrirModalcargar(true);
            	                        	ReciboService.updateFDContab(obj)
            	                			.then(function successCallback(response) {
            	                				
            	                				setTimeout(function(){ vm.recargarMovimientos(); }, 1000);
//            	                				setTimeout(function(){ vm.abrirDialogo("Fecha de contabilización modificada correctamente"); }, 1000);
            										
            	                                }, function errorCallback(response) {
													msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
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
            	            })
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
            		

            		
            		md.liquidarRecibo = function(idTipo) {

            			var listRecibos = [];
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = true;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if (idTipo == 0) {
            						if(md.listaSeleccionados[i].IN_ENVIO_LIQ_SAP == true){
            							md.mostrar = false;
            						}
            					} else {
            						if(md.listaSeleccionados[i].FD_LIQ_REA != null && md.listaSeleccionados[i].FD_LIQUIDADO != null){
            							md.mostrar = false;
            						}
            					}
            					
                                listRecibos.push({ ID_RECIBO_H: md.listaSeleccionados[i].ID_RECIBO_H });
                            }
            				
            				if(md.mostrar != false) {
            					
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_observacion_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                	var re = this;
            		                	re.aceptar = function () {
            		                		re.cancel();
                                			vm.appParent.abrirModalcargar(true);
            		                		ReciboService.updateLiquidacionesRecibos(listRecibos, re.obs, idTipo, vm.parent.perfil)
            		            			.then(function successCallback(response) {
            		            				setTimeout(function(){ vm.recargarMovimientos(); }, 1000);
//            	                				setTimeout(function(){ vm.abrirDialogo("Fecha de contabilización modificada correctamente"); }, 1000);
            										
        	                                }, function errorCallback(response) {
												msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
												$mdDialog.show(msg);
        	                                    if (response.status == 406) {
        	                                    	vm.parent.parent.logout();
        	                                    }
        	                                })
            		                	}
            		                	
            		                	re.cancel = function() {
            	                	      $mdDialog.cancel();
            	                	    };
            		                }]
            		            })
            				}
            				else {
            					msg.textContent('Revise que los recibos seleccionados no estén liquidados');
            					$mdDialog.show(msg);
            				}
            			} else {
            				msg.textContent('No hay ningún recibo seleccionado');
            				$mdDialog.show(msg);
            			}
            		}
            		
            		md.enviarsapRecibo = function() {
            			
            			if(md.listaSeleccionados.length != 0) {
            				
            				md.mostrar = false;
            				for(var i = 0; i < md.listaSeleccionados.length; i++){
            					if(md.listaSeleccionados[i].IN_BLOQUEADO != true){
            						md.mostrar = true;
            					}
            				}
            				
            				if(md.mostrar != false) {
            					$mdDialog.show({
            		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/enviarsap_recibo.modal.html',
            		                controllerAs: '$ctrl',
            		                clickOutsideToClose: true,
            		                parent: angular.element(document.body),
            		                fullscreen: false,
            		                controller: ['$mdDialog', function ($mdDialog) {
            		                	var mdm = this;
            		                    var lista = md.listaSeleccionados;
            		                    var obj = {};
            		                    var recibos = {};
            		                    
            		                    mdm.enviarSAP = function (option) {
            		                        if (option) {
            		                        	
            		                        	for(var i = 0; i < lista.length; i++){
            			        					if(lista[i].IN_BLOQUEADO == false){
            			        						if(lista[i].IN_ENVIO_LIQ_SAP == false){
            			        							lista[i].IN_ENVIO_LIQ_SAP = true;
            			        						}
            			        					}
            	                				}

            		                        	obj['RECIBOS'] = {};
            		                        	obj['RECIBOS']['RECIBO'] = lista;
            		                        	
            		                        	$mdDialog.cancel();

                                    			vm.appParent.abrirModalcargar(true);
            		                        	ReciboService.enviarSAP(obj)
            		                			.then(function successCallback(response) {
            										
            		                				setTimeout(function(){ vm.recargarMovimientos(); }, 1000);
//            		                				setTimeout(function(){ vm.abrirDialogo("Envio a SAP realizado correctamente"); }, 1000);
            											
            		                                }, function errorCallback(response) {
														msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.")
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
            		            })
            				}
            				else {
								msg.textContent('Revise que los recibos seleccionados estén desbloqueados y no enviados a SAP');
								$mdDialog.show(msg);
            				}
            			} else {
							msg.textContent('No hay ningún recibo seleccionado');
							$mdDialog.show(msg);
            			}
            		}
                    
                }]							 
            });	
    	}

        //Eliminar Recibo
        vm.eliminarRecibo = function (fila) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_recibo.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    var jsonBorrar = {
                        "ID_RECIBO": fila.ID_RECIBO,
                        "IT_VERSION": fila.IT_VERSION
                    };
                    md.borrarRecibo = function (option) {
                        if (option) {
                            ReciboService.borrarRecibo(jsonBorrar)
                                .then(function successCallback(response) {
									if (response.data.ID_RESULT == 0) {
	                                	var pGrid = vm.gridOptions.data;
	                                	var indx = pGrid.indexOf(fila);
										pGrid.splice(indx, 1);
										msg.textContent("Recibo borrado con éxito");
										$mdDialog.show(msg);
										
	                                    var recibos = sharePropertiesService.get('recibos');
	                                    recibos = _.remove(recibos, function (n) {
	                                        n.ID_CLIENTE == vm.datos.ID_CLIENTE;
	                                    })
									} else {
										msg.textContent(response.data.DS_RESULT);
										$mdDialog.show(msg);
									}
									
									$mdDialog.cancel();
                                }, function errorCallback(response) {
                                    if (response.status == 406) {
                                        vm.parent.parent.logout();
                                    }
									msg.textContent("Ha ocurrido un error al borrar el recibo");
									$mdDialog.show(msg);
                                })
                        }
                        else
                            $mdDialog.cancel();
                    }
                }]
            })
        }
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.ultRecibos.html";
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}    	
    	
    	//Botón para ver el detalle, observalo en busqueda.componente.js y el botón que está dentro de ui.grid
//    	vm.verDetalle = function(fila, key, index){
//    		cargarDetalle(fila);
//    	}
    	vm.verDetalle = function(fila, key, index){
            if(key=='poliza'){
                PolizaService.getDetail(fila.OPOLIZA.ID_POLIZA)
                .then(function successCallback(response) {
                    vm.detallesPoliza = response.data;
                    vm.llave = 'poliza';
                    cargarDetalle(vm.detallesPoliza);
                }, function errorCallBack(response) {
                    
                });
            }else if(key=='tomador'){
                ClienteService.getCliente({"ID_CLIENTE":fila.OPAGADOR.ID_CLIENTE})
                .then(function successCallback(response) {
                    vm.detallesCliente = response.data;
                    vm.llave = 'tomador';
                    cargarDetalle(vm.detallesCliente);
                }, function errorCallBack(response) {
                    
                });
            }else{
                vm.llave = {};
                vm.llave = key;
                cargarDetalle(fila);
            }
            
        }
    	
    	//Boton de cerrar tabs
    	// vm.cerrarTab = function(index, event){
    	// 	vm.numDetalles.splice(index,1);
    	// 	vm.active = vm.numDetalles.length;
		// }
		vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Abrir modal de nuevo poliza
    	vm.openNewRecibo = function() {
    		if(!vm.numDetalles.includes(null)){
    			vm.numDetalles.push(null);
    			vm.active = vm.numDetalles.length;	    			
	    		vm.actives = vm.numDetalles.length+1;
	    		vm.cargarDetalle = false;	    			
    		}
    		//vm.vista = 4;
    	}
		
    	//Función para cargar los datos al abrir el tab.
    	// function cargarDetalle(fila){
    	// 	if(!vm.numDetalles.includes(fila)){
    	// 		vm.numDetalles.push(fila);
    		
	    // 		vm.cargarDetalle = true;
	    // 		$timeout(function(){
	    // 			vm.active = vm.numDetalles.length;	    			
	    // 			vm.actives = vm.numDetalles.length+1;
	    // 			vm.cargarDetalle = false;	    			
	    // 		},3000)
    	// 	}
		// }
		function cargarDetalle(fila) {
            // if (!vm.numDetalles.includes(fila)) {
            //     vm.numDetalles.push(fila);
            //     vm.nomDetalles.push(vm.llave);
            //     vm.cargarDetalle = true;
            //     vm.active = vm.numDetalles.length;
			// }
			
			var existe = false;
			var dato = ''
			
			if(vm.llave == 'poliza') {
            	dato = 'ID_POLIZA';
            } else if(vm.llave == 'recibo') {
            	dato = 'ID_RECIBO';
            }
            for(var i = 0; i < vm.numDetalles.length; i++) {
            	if(vm.numDetalles[i][dato] == fila[dato]) {
            		existe = true;
            		break;
            	}
            }

            if (!existe) {
				if(vm.numDetalles.length < 1) {
					vm.numDetalles.push(fila);
					vm.nomDetalles.push(vm.llave);
					vm.active = vm.numDetalles.length;
				} else {
					if (vm.nomDetalles[0] != vm.llave) {
						
						vm.numDetalles.splice(0, 1);
						vm.nomDetalles.splice(0, 1);

						vm.numDetalles.push(fila);
						vm.nomDetalles.push(vm.llave);
						vm.active = vm.numDetalles.length;
					} else {
						var tipo;
						if(vm.llave == 'recibo') {
							tipo = 'recibo'
						} else if (vm.llave == 'poliza') {
							tipo = 'póliza'
						}
						msg.textContent('Ya hay un detalle de ' + tipo + ' abierto');
						$mdDialog.show(msg);
					}
				}
            } else if (vm.numDetalles[0] == fila && vm.nomDetalles[0] == vm.llave) {
				vm.active = vm.numDetalles.length;
			} else {
				vm.numDetalles.splice(0, 1);
				vm.nomDetalles.splice(0, 1);

				vm.numDetalles.push(fila);
				vm.nomDetalles.push(vm.llave);
				vm.active = vm.numDetalles.length;
			}
        }
        
              
        vm.recargarMovimientos = function(){
        	vm.verDetalleRecibo(vm.fila, vm.key, vm.index);
        }

		function rellenarJSON(form){
			angular.forEach(form, function(value, key){
				
				if(value.value instanceof Date){
					value=vm.appParent.dateFormat(value.value);
					console.log(value);
					form[key]=value;
				}
    		});
		}
		
		vm.descargarPDF = function(fila) {
			vm.appParent.abrirModalcargar(true);
    		ReciboService.getPdfReciboByNuRecibo(fila.NU_RECIBO)
		    .then(function successCallback(response) {
				
				if(response.status==200){
					let utf8decoder = new TextDecoder();
                    var mensajeUArchivo = utf8decoder.decode(response.data);
                    if(mensajeUArchivo.search('ID_RESULT') != -1) {
                    	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                    	if(objtMensajeUArchivo.ID_RESULT != 0) {
							msg.textContent(objtMensajeUArchivo.DS_RESULT);
							$mdDialog.show(msg);
						}
					} else {
						saveAs(new Blob([response.data]), fila.NU_RECIBO + '.pdf');
						$mdDialog.cancel();
					}
        		}else{
					msg.textContent('Se ha producido un error al descargar el pdf');
					$mdDialog.show(msg);
        		}
					
            }, function errorCallback(response) {
				msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
				$mdDialog.show(msg);
            })
    	}

		vm.downloadReceiptBroker = function (row) {
			let idBroker = row.OPOLIZA.ID_MEDIADOR;
			if(vm.datosPoliza)
				idBroker = vm.datosPoliza.ID_MEDIADOR
			if(idBroker && row.NU_RECIBO) {
				vm.appParent.abrirModalcargar(true);
				ReciboService.getPdfReciboByIdBrokerAndNuRecibo(idBroker, row.NU_RECIBO)
				.then(function successCallback(response) {
					
					if(response.status==200){
						let utf8decoder = new TextDecoder();
						var mensajeUArchivo = utf8decoder.decode(response.data);
						if(mensajeUArchivo.search('ID_RESULT') != -1) {
							var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
							if(objtMensajeUArchivo.ID_RESULT != 0) {
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
							}
						} else {
							saveAs(new Blob([response.data]), row.NU_RECIBO + '.pdf');
							$mdDialog.cancel();
						}
					}else{
						msg.textContent('Se ha producido un error al descargar el pdf');
						$mdDialog.show(msg);
					}
						
				}, function errorCallback(response) {
					msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
					$mdDialog.show(msg);
				})
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
        
        vm.productosDescargables = function (producto, recibo, tipo) {
    		var listaProductos = tipo == "cliente" ? vm.listProductosDescargablesCliente : vm.listProductosDescargablesMediador;
        	
        	if (listaProductos[producto] != null && listaProductos[producto].listMedioPago != null && listaProductos[producto].listMedioPago.length == 0) {
        		return true;
        	} else if (listaProductos[producto] != null && listaProductos[producto].listMedioPago != null && listaProductos[producto].listMedioPago.length > 0 && listaProductos[producto].listMedioPago.includes(recibo.ID_TIPO_MEDIO_PAGO.toString())) {
        		return true;
        	} else {
        		return false;
        	}
        }

		vm.gestionarRecibo = function (recibo, confirmar) {
        	if (confirmar == true) {

			$mdDialog.show({
				templateUrl: BASE_SRC + 'busqueda/busqueda.modals/gestionar_recibo.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
				var mdm = this;
				mdm.recibo = recibo.NU_RECIBO;
				mdm.nuPoliza = recibo.OPOLIZA.NU_POLIZA;
				mdm.mediador = recibo.OPOLIZA.NO_MEDIADOR;
				mdm.estado = recibo.ID_SITUARECIBO == 4 || recibo.ID_SITUARECIBO == 6 ? 'Cobrado' : 'Devuelto';
				mdm.fecha;
					// SI ES 'EMITIDO' (4) --> COBRADO (2), SI ES COBRADO (2) --> DEVUELTO (6), si es DEVUELTO --> COBRADO
				
				mdm.gestionarRecibo = function(){

					var obj = {};

					obj.ID_RECIBO = recibo.ID_RECIBO;
					obj.ID_SITUARECIBO = recibo.ID_SITUARECIBO == 4 || recibo.ID_SITUARECIBO == 6 ? 2 : 6; // COBRADO
					mdm.tipoFecha = obj.ID_SITUARECIBO == 2 ? 'FD_COBRO' : 'FD_DEVUELTO';
					obj[mdm.tipoFecha] = vm.appParent.dateFormat(mdm.fecha);

					vm.appParent.abrirModalcargar(true);
					ReciboService.gestionarRecibo(obj)
					.then(function successCallback(response) {
						if(response.status == 200) {
							if (response.data.ID_RESULT == 0){
								vm.appParent.cambiarDatosModal('El estado se ha actualizado correctamente');
	                       		vm.parent.recargarListado();
							} else {
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
							}
						}
					}, function errorCallback(response){
						vm.appParent.cambiarDatosModal('Ha ocurrido un error inesperado, por favor, póngase en contacto con el administrador.');
					});
				}

				mdm.cancel = function() {
					$mdDialog.cancel();
				};
				
			}]})
        	}
        }
    }

    
    ng.module('App').component('busquedaUltrecibos', Object.create(busquedaComponent));
    
})(window.angular);