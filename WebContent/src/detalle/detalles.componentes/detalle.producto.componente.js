(function(ng) {	

	//Crear componente de app
    var productoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$mdDialog', 'BASE_SRC', '$scope', 'TiposService', 'AseguradoraService', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
				busqueda:'^busquedaApp'
    		}
    }
    
    productoComponent.controller = function productoComponentControler($mdDialog, BASE_SRC, $scope, TiposService, AseguradoraService, BusquedaService, constantsTipos){
    	var vm = this;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.template = 0;
		vm.numDetalles = [];
		vm.selPayMethods = [];
		vm.selPayTypes = [];
		vm.objPayTypes = {};
		vm.objPayTypesFees = {};
		
    	this.$onInit = function(bindings) {

			if(vm.parent.datos != undefined) {
				vm.basicData = vm.parent.datos;
			}
    		
			vm.medida = 276;

			TiposService.getRamos()
			.then(function successCallback(response){
				if(response.status == 200) {
					vm.lstRamos = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			TiposService.getFormasPago()
			.then(function successCallback(response){
				if(response.status == 200) {
					vm.lstPayTypes = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			TiposService.getMedioPago()
			.then(function successCallback(response) {
				if(response.status == 200){
					vm.lstPayMethods = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			TiposService.getTipos({'ID_CODIGO': constantsTipos.TIPOS_UNIDADES})
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					vm.lstUnits = response.data.TIPOS.TIPO;
					// vm.lstUnits = [];
					// for(var i = 0; i < response.data.TIPOS.TIPO.length; i++) {
					// 	vm.lstUnits.push({
					// 		'CO_TIPO_UNIDAD': response.data.TIPOS.TIPO[i].CO_TIPO,
					// 		'DS_TIPO_UNIDAD': response.data.TIPOS.TIPO[i].DS_TIPOS
					// 	})
					// }
					// for(var column in vm.gridCommissions.columnDefs) {
					// 	if(vm.gridCommissions.columnDefs[column].name == 'CO_TIPO_UNIDAD') {
					// 		vm.gridCommissions.columnDefs[column].editDropdownOptionsArray = vm.lstUnits;
					// 		break;
					// 	}
					// }
					
				}

			}, function errorCallBack(response) {
			});

			if(vm.basicData.ID_COMP_RAMO_PROD != undefined){

				AseguradoraService.getProductoByIdCompRamoProd(vm.basicData.ID_COMP_RAMO_PROD)
				.then(function successCallback(response){
					if(response.status == 200) {
						if(response.data.ID_RESULT == 0) {
							vm.data = response.data;
							
							if(response.data.COMMISSIONS != undefined && response.data.COMMISSIONS.length > 0)
							vm.gridCommissions.data = response.data.COMMISSIONS;
							if(response.data.COVERAGES != undefined && response.data.COVERAGES.length > 0)
							vm.gridCoverages.data = response.data.COVERAGES;
							if(response.data.PARTNERS != undefined && response.data.PARTNERS.length > 0)
							vm.gridPartners.data = response.data.PARTNERS;

							if(response.data.PAYMENT_METHODS != undefined && response.data.PAYMENT_METHODS.length > 0) {
								vm.selPayMethods = response.data.PAYMENT_METHODS;
							
								for(var i = 0; i < vm.selPayMethods.length; i++) {
									vm.checkExists(vm.selPayMethods[i], vm.selPayMethods);
								}
							}
							
							if(response.data.PAYMENT_TYPES != undefined && response.data.PAYMENT_TYPES.length > 0) {
								vm.selPayTypes = response.data.PAYMENT_TYPES;
							
								for(var i = 0; i < vm.lstPayTypes.length; i++) {
									for(var j = 0; j < vm.selPayTypes.length; j++) {
										if(vm.lstPayTypes[i].ID_FORMAPAGO == vm.selPayTypes[j].ID_FORMAPAGO) {
											vm.objPayTypes[vm.lstPayTypes[i].ID_FORMAPAGO] = true;
											vm.objPayTypesFees[vm.lstPayTypes[i].ID_FORMAPAGO] = vm.selPayTypes[j].DEBTORS_FEE;
										} else {
											vm.objPayTypes[vm.lstPayTypes[i].ID_FORMAPAGO] = false;
										}
									}
									
								}
							}
						}
					}
				}, function callBack(response){
				});
				
			}
    	}

    	this.loadTemplate = function() {
//			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.producto.html";
//            } else {
//                return 'src/error/404.html';
//            }
		}

		vm.gridCommissions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,             
			multiSelect: false,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name:'NO_COMPANIA',
					displayName:'Mediador',
					enableCellEdit: false,
					sort: { priority: 0, direction: 'asc'}
				},
				{
					name:'DS_TIPO_COMISION',
					displayName:'Tipo comisión',
					enableCellEdit: false
				},
				{
					name:'CO_TIPO_UNIDAD',
					displayName:'Unidad',
					enableCellEdit: true,
					editType: 'dropdown',
					// editableCellTemplate: 'ui-grid/dropdownEditor',
					// editDropdownValueLabel: 'CO_TIPO_UNIDAD',
					editableCellTemplate: '<div><select ng-model="row.entity.CO_TIPO_UNIDAD" data-ng-options="u.CO_TIPO as u.CO_TIPO for u in grid.appScope.$ctrl.lstUnits"><option value="" disabled>Tipo de unidad</option></select></div>'
				},
				{
					name:'NU_PORCENTAJE',
					displayName:'Valor',
					type: 'number',
					enableCellEdit: true,
				},
				{
					name:'FT_VIGENCIA_INI',
					displayName:'Vigente desde',
					cellFilter: 'date:\'dd/MM/yyyy\'',
					enableCellEdit: true,
				},
				{
					name:'FT_VIGENCIA_FIN',
					displayName:'Vigente hasta',
					cellFilter: 'date:\'dd/MM/yyyy\'',
					enableCellEdit: true,
				},
				{
					name:' ',
					cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
					width: 36,
					enableSorting:false,
					enableCellEdit: false
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiCom = gridApi;

				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				// 	vm.elementoSeleccionado = fila.entity;
				// });
				
				vm.gridApiCom.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){

						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;

					}
				});
			}
		}
		

		vm.gridCoverages = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,             
			multiSelect: false,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name:'NO_GARANTIA',
					displayName:'Nombre',
					enableCellEdit: false,
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.editCoverage(row.entity, grid.options.data)">{{row.entity.NO_GARANTIA}}</a></div>'
				},
				{
					field: 'IN_PRINCIPAL',
					displayName: 'Principal',
					type: 'boolean',
					cellTooltip: function(row){ if(row.entity.IN_PRINCIPAL){return 'Sí'} else return 'No'},
					cellTemplate: '<div ng-if="row.entity.IN_PRINCIPAL == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_PRINCIPAL == false" class="ui-grid-cell-contents td-trash">No</div>'
				},
				{
					field: 'IN_OBLIGATORIA',
					displayName: 'Obligatoria',
					type: 'boolean',
					cellTooltip: function(row){ if(row.entity.IN_OBLIGATORIA){return 'Sí'} else return 'No'},
					cellTemplate: '<div ng-if="row.entity.IN_OBLIGATORIA == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_OBLIGATORIA == false" class="ui-grid-cell-contents td-trash">No</div>'
					
				},
				{
					name:' ',
					cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
					width: 36,
					enableSorting:false,
					enableCellEdit: false
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiCov = gridApi;

				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				// 	vm.elementoSeleccionado = fila.entity;
				// });
				
				vm.gridApiCov.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){

						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;

					}
				});
			}
		}

		vm.gridPartners = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,             
			multiSelect: false,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name:'NO_COMPANIA',
					displayName:'Partner',
					enableCellEdit: false,
					grouping: { groupPriority:0},
					sort: { priority: 0, direction: 'asc'}
				},
				{
					field: 'IN_TARIFICA',
					displayName: 'Tarificar',
					type: 'boolean',
					cellTooltip: function(row){ if(row.entity.IN_TARIFICA){return 'Sí'} else return 'No'},
					cellTemplate: '<div ng-if="row.entity.IN_TARIFICA == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_TARIFICA == false" class="ui-grid-cell-contents td-trash">No</div>'
				},
				{
					field: 'IN_EMITE',
					displayName: 'Emitir',
					type: 'boolean',
					cellTooltip: function(row){ if(row.entity.IN_EMITE){return 'Sí'} else return 'No'},
					cellTemplate: '<div ng-if="row.entity.IN_EMITE == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IN_EMITE == false" class="ui-grid-cell-contents td-trash">No</div>'
					
				},
				{
					name:' ',
					cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
					width: 36,
					enableSorting:false,
					enableCellEdit: false
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiPar = gridApi;

				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				// 	vm.elementoSeleccionado = fila.entity;
				// });
				
				vm.gridApiPar.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){

						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;

					}
				});
			}
		}

		
		vm.checkPayMethods = function(method, list) {
			// var idx = list.indexOf(method);
			// if(idx > -1) {
			// 	list.splice(idx, 1);
			// } else {
			// 	list.push(method);
			// }
			var exist = false;
			for(var i = 0; i < list.length; i++) {
				if(method.ID_TIPO_MEDIO_PAGO == list[i].ID_TIPO_MEDIO_PAGO) {
					exist = true;
					break;
				} else {
					exist = false;
				}
			}
			if(exist == true) {
				list.splice(i, 1);
			} else {
				list.push(method);
			}
		}
		vm.checkExists = function(method, list) {
			// return list.indexOf(method) > -1;
			for(var i = 0; i < list.length; i++) {
				if(method.ID_TIPO_MEDIO_PAGO == list[i].ID_TIPO_MEDIO_PAGO) {
					return true;
				}
			}
		};

		vm.checkPayTypes = function(type, list, opt) {
			var exist = false;
			for(var i = 0; i < list.length; i++) {
				if(type.ID_FORMAPAGO == list[i].ID_FORMAPAGO) {
					exist = true;
					break;
				} else {
					exist = false;
				}
			}
			if(exist == true) {
				if(opt == 'del') {
					list.splice(i, 1);
				}
			} else {
				if(opt == 'add') {
					list.push(type);
				}
			}
		}
		
		vm.deleteItem = function(item, data) {
   			data.splice(data.indexOf(item), 1);
		}

		vm.saveProduct = function() {
			
			var obj = JSON.parse(JSON.stringify(vm.data));

			for(var i = 0; i < obj.PAYMENT_TYPES.length; i++) {
				for(let index in vm.objPayTypesFees) {
					if(obj.PAYMENT_TYPES[i].ID_FORMAPAGO == index) {
						obj.PAYMENT_TYPES[i].DEBTORS_FEE = vm.objPayTypesFees[index];
					}
				}
			}

			AseguradoraService.saveProducto(obj)
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					msg.textContent('Producto guardado correctamente');
					$mdDialog.show(msg);
				}
			}, function errorCallBack(response) {
			});
		}

		vm.modalElement = function(elemType) {
			$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/add_element_producto.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
					md.elemType = elemType;
					// md.data = vm.data;
					md.ramos = vm.lstRamos;
					md.parent = vm.parent;
					md.lstUnits = vm.lstUnits
					md.lstTaxes = vm.lstTaxes;

					if (vm.lstTaxes != null && vm.lstTaxes.LISTA_IMPUESTOS != null && vm.lstTaxes.LISTA_IMPUESTOS.IMPUESTOS != null) {
					    md.lstTaxes = vm.lstTaxes.LISTA_IMPUESTOS.IMPUESTOS;
					}
					
					if(elemType == 'commission') {
						TiposService.getComisionista()
						.then(function successCallback(response) {
							if(response.data.ID_RESULT == 0) {
								md.lstCommissions = response.data.TIPOS.TIPO;
							}

						}, function errorCallBack(response) {
						});
						
						TiposService.getTipos({'ID_CODIGO': constantsTipos.TIPOS_COMISIONES})
						.then(function successCallback(response) {
							if(response.data.ID_RESULT == 0) {
								md.lstConcepts = response.data.TIPOS.TIPO;
							}

						}, function errorCallBack(response) {
						});
					}
					if(elemType == 'coverage') {
						BusquedaService.buscar({}, 'garantias')
						.then(function successCallback(response) {
							if(response.data.ID_RESULT == 0) {
								md.lstCoverages = response.data.GARANTIAS;
							}

						}, function errorCallBack(response) {
						});
					}
					if(elemType == 'partner') {
						TiposService.getComisionista()
						.then(function successCallback(response) {
							if(response.data.ID_RESULT == 0) {
								md.lstCommissions = response.data.TIPOS.TIPO;
							}

						}, function errorCallBack(response) {
						});
						BusquedaService.buscar({}, 'colectivos')
						.then(function successCallback(response) {
							if(response.data.ID_RESULT == 0) {
								md.lstPartners = response.data.COLECTIVOS.COLECTIVO;
							}

						}, function errorCallBack(response) {
						});

						// TiposService.getCompania()
						// .then(function successCallback(response) {
						// 	if(response.data.ID_RESULT == 0) {
						// 		md.lstPartners = response.data.TIPOS.TIPO;
						// 	}

						// }, function errorCallBack(response) {
						// });
					}

					// TiposService.getTipoUnidad()
					// .then(function successCallback(response) {
					// 	if(response.data.ID_RESULT == 0) {
					// 		md.lstUnits = response.data.TIPOS.TIPO;
					// 	}

					// }, function errorCallBack(response) {
					// });

					// TiposService.getTipoComision()
					// .then(function successCallback(response) {
					// 	if(response.data.ID_RESULT == 0) {
					// 		md.lstCommissions = response.data.TIPOS.TIPO;
					// 	}

					// }, function errorCallBack(response) {
					// });
					
					md.seleccionarProducto = function(idProducto) {
						if(idProducto != undefined && idProducto != 0) {
							// md.data = md.productoSeleccionado;
							md.data.NO_PRODUCTO = md.autocomplete.PRODUCTO.NO_PRODUCTO;
						} else {
							md.data.NO_PRODUCTO = '';
						}
						// else {
						// 	if(idProducto != undefined && idProducto == 0) {
						// 		md.data = md.autocomplete.PRODUCTO;
						// 		// md.data.NO_PRODUCTO = '';
						// 	}
						// }
					}
					
					md.addElement = function(elemType) {
						if(elemType == 'commission') {
							var exist = false;
    		
							if(md.selCompany.ID_COMPANIA != undefined) {
								for(var i = 0; i < vm.gridCommissions.data.length; i++) {
									if(vm.gridCommissions.data[i].ID_COMPANIA == md.selCompany.ID_COMPANIA) {
										exist = true;
										msg.textContent('La compañia introducida ya figura en el listado de comisiones');
										$mdDialog.show(msg);
										break;
									}
								}
							}
							
							if(exist == false) {
								if(md.selCompany == undefined) {
									md.data.ID_COMPANIA = md.selUnit.ID_COMPANIA;
									md.data.NO_COMPANIA = md.selUnit.NO_COMPANIA;
								}
								if(md.selUnit == undefined) {
									md.data.CO_TIPO_UNIDAD = md.selUnit.CO_TIPO;
									md.data.DS_TIPO_UNIDAD = md.selUnit.DS_TIPOS;
								}
								if(md.selConcept == undefined) {
									md.data.CO_TIPO_COMISION = md.selConcept.CO_TIPO;
									md.data.DS_TIPO_COMISION = md.selConcept.DS_TIPOS;
								}
								vm.gridCommissions.data.push(md.data);
							}
						}

						if(elemType == 'coverage') {
							var exist = false;
    		
							if(md.selCoverage.ID_GARANTIA != undefined) {
								for(var i = 0; i < vm.gridCoverages.data.length; i++) {
									if(vm.gridCoverages.data[i].ID_GARANTIA == md.selCoverage.ID_GARANTIA) {
										exist = true;
										msg.textContent('La garantía introducida ya figura en el listado de garantías');
										$mdDialog.show(msg);
										break;
									}
								}
							}
							
							if(exist == false) {
								if(md.data.IN_PRINCIPAL == undefined) {
									md.data.IN_PRINCIPAL = false;
								}
								if(md.data.IN_OBLIGATORIA == undefined) {
									md.data.IN_OBLIGATORIA = false;
								}
								var obj = JSON.parse(JSON.stringify(md.selCoverage));
								obj.IN_PRINCIPAL = md.data.IN_PRINCIPAL;
								obj.IN_OBLIGATORIA = md.data.IN_OBLIGATORIA;
								vm.gridCoverages.data.push(obj);
							}
						}

						if(elemType == 'partner') {
							var exist = false;
    		
							if(md.selPartner.ID_TIPO_POLIZA != undefined) {
								for(var i = 0; i < vm.gridPartners.data.length; i++) {
									if(vm.gridPartners.data[i].ID_TIPO_POLIZA == md.selPartner.ID_TIPO_POLIZA) {
										exist = true;
										msg.textContent('La opción seleccionada ya figura en el listado de partners');
										$mdDialog.show(msg);
										break;
									}
								}
							}
							if(md.selCompany == undefined) {
								md.data.ID_COMPANIA = md.selUnit.ID_COMPANIA;
								md.data.NO_COMPANIA = md.selUnit.NO_COMPANIA;
							}
							
							if(exist == false) {
								if(md.data.IN_TARIFICA == undefined) {
									md.data.IN_TARIFICA = false;
								}
								if(md.data.IN_EMITE == undefined) {
									md.data.IN_EMITE = false;
								}
								var obj = JSON.parse(JSON.stringify(md.selPartner));
								obj.IN_TARIFICA = md.data.IN_TARIFICA;
								obj.IN_EMITE = md.data.IN_EMITE;
								vm.gridPartners.data.push(obj);
							}
						}

						if(elemType == 'tax') {
							var exist = false;
    		
							if(md.selTax.CO_IMPUESTO != undefined) {
								for(var i = 0; i < vm.gridTaxes.data.length; i++) {
									if(vm.gridTaxes.data[i].CO_IMPUESTO == md.selTax.CO_IMPUESTO) {
										exist = true;
										msg.textContent('El impuesto seleccionado ya figura en el listado de impuestos');
										$mdDialog.show(msg);
										break;
									}
								}
							}
							
							if(exist == false) {
								if(md.data.IN_TARIFICA == undefined) {
									md.data.IN_TARIFICA = false;
								}
								if(md.data.IN_EMITE == undefined) {
									md.data.IN_EMITE = false;
								}
								var obj = JSON.parse(JSON.stringify(md.selTax));
								obj.IN_TARIFICA = md.data.IN_TARIFICA;
								obj.IN_EMITE = md.data.IN_EMITE;
								vm.gridTaxes.data.push(obj);
							}
						}
					}
					
					md.hide = function () {
						$mdDialog.hide();
					};

					md.cancel = function () {
						$mdDialog.cancel();
					};

					md.answer = function (answer) {
						$mdDialog.hide(answer);
					};

				}]
			})
		}



		/* -- COVERAGES -- */

		vm.editCoverage = function(coverage, data) {
			vm.template = 1;
			vm.coverage = coverage;
			TiposService.getTipos({'ID_CODIGO': constantsTipos.LST_RATE_TYPES})
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					vm.lstRateTypes = response.data.TIPOS.TIPO;
				}
			}, function errorCallBack(response) {
			});
			TiposService.getTipos({'ID_CODIGO': constantsTipos.LST_TAXES_APP_TYPES})
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					vm.lstTaxesAppTypes = response.data.TIPOS.TIPO;
				}
			}, function errorCallBack(response) {
			});
			TiposService.getTipos({'ID_CODIGO': constantsTipos.LST_TAXES_PAY_TYPES})
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					vm.lstTaxesPayTypes = response.data.TIPOS.TIPO;
				}
			}, function errorCallBack(response) {
			});
			AseguradoraService.getTiposImpuestos()
			.then(function successCallback(response) {
				if(response.data.ID_RESULT == 0) {
					vm.lstTaxes = response.data;
				}
			}, function errorCallBack(response) {
			});

			vm.gridTaxes.data = vm.coverage.TAXE;
			vm.gridRates.data = vm.coverage.RATES;

			if(vm.coverage.RATES != undefined && vm.coverage.RATES.length > 1) {
				vm.gridRates.columnDefs = [
					{
						name:'P1',
						displayName:'P1',
						enableCellEdit: true,
						sort: { priority: 0, direction: 'asc'}
					},
					{
						name:'P2',
						displayName:'P2',
						enableCellEdit: true,
					},
					{
						name:'P3',
						displayName:'P3',
						enableCellEdit: true,
					},
					{
						name:'P4',
						displayName:'P4',
						enableCellEdit: true,
					},
					{
						name:'IM_TARIFA',
						displayName:'Tarifa',
						cellFilter: 'currency:"€" : 2',
						enableCellEdit: true,
					},
					{
						name:' ',
						cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
						width: 36,
						enableSorting:false,
						enableCellEdit: false
					}
				];
			}
		}
			
		vm.checkRateType = function(rate) {
			if(vm.coverage != undefined) {
				vm.coverage.CO_TIPO_TARIFICACION = rate.CO_TIPO;
				vm.coverage.DS_TIPO_TARIFICACION = rate.DS_CODIGO;
			}
		}
		
		vm.gridTaxes = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,             
			multiSelect: false,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name:'CO_IMPUESTO',
					displayName:'Código',
					enableCellEdit: true,
					sort: { priority: 0, direction: 'asc'}
				},
				{
					name:'DS_IMPUESTO',
					displayName:'Descripción',
					enableCellEdit: true,
				},
				{
					name:'DS_APLICA_SOBRE',
					displayName:'Aplica sobre',
					enableCellEdit: true,
					// editDropdownIdLabel: 'DS_APLICA_SOBRE',
					// editDropdownValueLabel: 'DS_APLICA_SOBRE',
					// editableCellTemplate: 'ui-grid/dropdownEditor'
					editType: 'dropdown',
					editableCellTemplate: '<div><select ng-model="row.entity.CO_APLICA_SOBRE" data-ng-options="u.CO_TIPO as u.DS_TIPOS for u in grid.appScope.$ctrl.lstTaxesAppTypes"><option value="" disabled>Tipo de unidad</option></select></div>'
				},
				{
					name:'DS_TAX_PAYMENT_TYPE',
					displayName:'Pagado en',
					enableCellEdit: true,
					// editDropdownIdLabel: 'DS_TAX_PAYMENT_TYPE',
					// editDropdownValueLabel: 'DS_TAX_PAYMENT_TYPE',
					// editableCellTemplate: 'ui-grid/dropdownEditor'
					editType: 'dropdown',
					editableCellTemplate: '<div><select ng-model="row.entity.CO_TAX_PAYMENT_TYPE" data-ng-options="u.CO_TIPO as u.DS_TIPOS for u in grid.appScope.$ctrl.lstTaxesPayTypes"><option value="" disabled>Tipo de unidad</option></select></div>'
				},
				{
					name:'IM_MINIMO',
					displayName:'Importe mínimo',
					enableCellEdit: true
				},
				{
					name:'IM_TIPO_IMPUESTO',
					displayName:'Porcentaje',
					enableCellEdit: true
				},
				{
					name:' ',
					cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
					width: 36,
					enableSorting: false,
					enableCellEdit: false
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiTax = gridApi;

				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				// 	vm.elementoSeleccionado = fila.entity;
				// });
				
				vm.gridApiTax.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){

						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;

					}
				});
			}
		}

		vm.gridRates = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,             
			multiSelect: false,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					name:'P1',
					displayName:'P1',
					enableCellEdit: true,
					sort: { priority: 0, direction: 'asc'}
				},
				{
					name:'IM_TARIFA',
					displayName:'Tarifa',
					cellFilter: 'currency:"€" : 2',
					enableCellEdit: true,
				},
				{
					name:' ',
					cellTemplate:'<div class="ui-grid-cell-contents td-trash"><span ng-click="grid.appScope.$ctrl.deleteItem(row.entity, grid.options.data)" style="font-size: small" class="glyphicon glyphicon-trash"></span></div>',
					width: 36,
					enableSorting:false,
					enableCellEdit: false
				}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiRat = gridApi;

				// gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				// 	vm.elementoSeleccionado = fila.entity;
				// });
				
				vm.gridApiRat.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
					if(newValue != oldValue){

						if(!rowEntity.IS_NEW)
							rowEntity.IS_UPDATED = true;

					}
				});
			}
		}

    }
    
    ng.module('App').component('productoSd', Object.create(productoComponent));
    
})(window.angular);


