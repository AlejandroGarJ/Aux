(function(ng) {	

	//Crear componente de app
    var colaboradorComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$window', '$location', '$scope', 'BusquedaService','TiposService', '$mdToast','BASE_SRC', '$mdDialog', '$translate', 'AseguradoraService', 'ComisionService','$scope', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		}
    }
    
    colaboradorComponent.controller = function colaboradorComponentControler($window, $location, $scope, BusquedaService, TiposService, $mdToast, BASE_SRC, $mdDialog, $translate, AseguradoraService, ComisionService, constantsTipos){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
    	vm.listFiles = [];
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    
    	this.$onInit = function(bindings) {
    		vm.showTable = 0;
    		vm.datos = vm.parent.datos;
    		vm.listFiles = vm.datos.LISTA_ARCHIVOS;
			vm.load = false;
			vm.tipos = {};
            vm.listaSeleccionados = [];
            vm.lstSelectedContacts = [];
			vm.contactosDeleted = [];
			
			vm.medidaEdicion = 294; //223
			
			//Si no es nuevo recuperar comisiones
			if (vm.datos != null && vm.datos.ID_COMPANIA != null) {
				vm.getComisiones();
				AseguradoraService.getContactosByAseguradora(vm.datos.ID_COMPANIA)
				.then(function successCallback(response){
					if(response.status == 200 && response.data != null && response.data.LISTA_CONTACTOS.length > 0){
						vm.listContactos = response.data.LISTA_CONTACTOS;
						vm.gridContactos.data = response.data.LISTA_CONTACTOS;
					}
				});
			}
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_UNIDADES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.unidades = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.pre.logout();
                }
			});
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_COMISIONES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.comisiones = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.pre.logout();
                }
			});
    		
    		if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$path.substring(1, $location.$$path.length));
    		}
    		
			// TiposService.getRamos({})
            // .then(function successCallback(response){
            //     if(response.status == 200){
            //         if(response.data.TIPOS != undefined){
            //             vm.listRamos = response.data.TIPOS.TIPO;
            //         }
            //     }
            // })
            
            TiposService.getTipos({ID_CODIGO: constantsTipos.TIPOS_CONTACTO})
            .then(function successCallback(response){
                if(response.status == 200){
                    if(response.data.TIPOS != undefined){
                        vm.listTiposContacto = response.data.TIPOS.TIPO;
                    }
                }
            })

            TiposService.getTipos({ID_CODIGO: constantsTipos.IN_TIPO_DESTINATARIO})
            .then(function successCallback(response){
                if(response.status == 200){
                    if(response.data.TIPOS != undefined){
                        vm.lstRecipientType = response.data.TIPOS.TIPO;
                    }
                }
            })

			TiposService.getProgramas({})
            .then(function successCallback(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0 && response.data.NUMERO_TIPOS > 0) {
						vm.lstPrograms = response.data.TIPOS.TIPO;
					}
				}
            });

    	}
    	
    	vm.getComisiones = function () {
    		ComisionService.getComisionistasProducto({"ID_COMPANIA": vm.datos.ID_COMPANIA})
        	.then(function successCallBack(response){
        		if(response.status == 200) {
        			if(response.data != undefined && response.data.COMISIONISTASPROD != undefined && response.data.COMISIONISTASPROD.COMISIONISTAPROD != undefined){
        				vm.listComisiones = response.data.COMISIONISTASPROD.COMISIONISTAPROD;
        			}else{
        				vm.listComisiones = [];
        			}
        			vm.gridOptions.data = vm.listComisiones;
					// $scope.$apply();
				}
        	}, function errorCallBack(response){
        		
        	});
    	}

		vm.getDs = function(co, tp) {
			if(co && tp) {
				let ds = '';
				let tmp = ''
				switch (tp) {
					case 'commission':
						if(vm.tipos.comisiones)
							tmp = vm.tipos.comisiones.find(x => x.CO_TIPO == co).DS_TIPOS;
						break;
					case 'unit':
						if(vm.tipos.unidades)
							tmp = vm.tipos.unidades.find(x => x.CO_TIPO == co).DS_TIPOS;
						break;
					case 'recipient':
						if(vm.lstRecipientType)
							tmp = vm.lstRecipientType.find(x => x.CO_TIPO == co).DS_TIPOS;
						break;
					case 'contactType':
						if(vm.listTiposContacto)
							tmp = vm.listTiposContacto.find(x => x.CO_TIPO == co).DS_TIPOS;
						break;
					// case 'branch':
					// 	if(vm.listRamos)
					// 		tmp = vm.listRamos.find(x => x.ID_RAMO == co).NO_RAMO;
					case 'program':
						if(vm.lstPrograms)
							tmp = vm.lstPrograms.find(x => x.ID_PROGRAMA == co).DS_PROGRAMA;
						break;
					default:
						break;
				}
				if(tmp)
					ds = tmp;
				return ds;
			}
		} 
    	
    	vm.gridOptions = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			columnDefs: [
				{field: 'COLECTIVO', 
					displayName: 'Partner', 
					cellTooltip: function(row){return row.entity.COLECTIVO}
				},
				{field: 'CANAL', displayName: 'Canal', cellTooltip: function(row){return row.entity.CANAL}},
				{field: 'NO_PRODUCTO', displayName: 'Producto', cellTooltip: function(row){return row.entity.NO_PRODUCTO}},
				// {field: 'CO_AGENTE', displayName: 'Agente', cellTooltip: function(row){return row.entity.CO_AGENTE}, enableCellEdit: true,  editDropdownValueLabel: 'CO_AGENTE', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_AGENTE]">{{row.entity.CO_AGENTE}}</div>'},
				{field: 'CO_TIPO_UNIDAD', displayName: 'Unidad', cellTooltip: function(row){return vm.getDs(row.entity.CO_TIPO_UNIDAD, 'unit')}, editDropdownValueLabel: 'CO_TIPO_UNIDAD', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_TIPO_UNIDAD]">{{grid.appScope.$ctrl.getDs(row.entity.CO_TIPO_UNIDAD, "unit")}}</div>'},
				{field: 'CO_TIPO_COMISION', displayName: 'Tipo de comisión', cellTooltip: function(row){return vm.getDs(row.entity.CO_TIPO_COMISION, 'commission')}, editDropdownValueLabel: 'CO_TIPO_COMISION', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.CO_TIPO_COMISION]">{{grid.appScope.$ctrl.getDs(row.entity.CO_TIPO_COMISION, "commission")}}</div>'},
				{field: 'NU_PORCENTAJE', displayName: 'Comisión', cellTooltip: function(row){return row.entity.NU_PORCENTAJE}, enableCellEdit: true,  editDropdownValueLabel: 'NU_PORCENTAJE', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NU_PORCENTAJE]">{{row.entity.NU_PORCENTAJE}}</div>'},
				{field: 'FT_VIGENCIA_INI', displayName: 'Inicio vigencia', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_VIGENCIA_INI}},
				{field: 'FT_VIGENCIA_FIN', displayName: 'Fin vigencia', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_VIGENCIA_FIN}},
				{field: 'NO_USU_MOD', displayName: 'Modificado por', cellTooltip: function(row){return row.entity.NO_USU_MOD}},
				{field: 'FT_USU_MOD', displayName: 'Modificado en', cellFilter: 'date:\'dd/MM/yyyy\'', cellTooltip: function(row){return row.entity.FT_USU_MOD}}
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApi = gridApi;
				
				vm.listaSeleccionados = [];
				
				gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
				gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
					vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				});
			}
    	}

		vm.gridContactos = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,             
			multiSelect: false,
			paginationPageSizes: [15,30,50],
			paginationPageSize: 30,
			treeRowHeaderAlwaysVisible: true,
			data:[],
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			columnDefs: [
				{
					field: 'NO_PERSONA',
					displayName: 'Nombre',
					cellTooltip: function(row){return row.entity.NO_PERSONA}
				},
				{
					field: 'ID_TIPOCONTACTO',
					displayName: 'Tipo de contacto',
					cellTooltip: function(row){return row.entity.ID_TIPOCONTACTO},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.DS_TIPOCONTACTO]">{{grid.appScope.$ctrl.getDs(row.entity.ID_TIPOCONTACTO, "contactType")}}</div>'
				},
				{
					field: 'IN_TIPO_DESTINATARIO',
					displayName: 'Tipo de destinatario',
					cellTooltip: function(row){return row.entity.IN_TIPO_DESTINATARIO},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.IN_TIPO_DESTINATARIO]">{{grid.appScope.$ctrl.getDs(row.entity.IN_TIPO_DESTINATARIO, "recipient")}}</div>'  
				},
				{
					field: 'ID_PROGRAMA',
					displayName: 'Programa',
					cellTooltip: function(row){return row.entity.ID_PROGRAMA},
					cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.DS_PROGRAMA]">{{grid.appScope.$ctrl.getDs(row.entity.ID_PROGRAMA, "program")}}</div>'
				},
				{
					field: 'NO_DIRECCION',
					displayName: 'Dirección',
					cellTooltip: function(row){return row.entity.NO_DIRECCION}
				},
				{
					field: 'NO_EMAIL',
					displayName: 'Email',
					cellTooltip: function(row){return row.entity.NO_EMAIL}
				},
				{
					field: 'NU_TELEFONO1',
					displayName: 'Teléfono',
					cellTooltip: function(row){return row.entity.NU_TELEFONO1}
				},
				{
					id: "btnEdit",
					name: ' ',
					displayName: 'Editar',
					width: 80,
					cellTemplate: '<div class="ui-grid-cell-contents td-icon"><a ng-click="grid.appScope.$ctrl.dialogElement(\'contact\', row.entity)"><span style="font-size: 22px; top: -2px;" class="glyphicon glyphicon-pencil"><md-tooltip md-direction="bottom">Editar contacto</md-tooltip></a></div>',
					enableSorting: false,
					enableColumnMenu: false,
					enableCellEdit: false
				},
			],
			onRegisterApi: function( gridApi ) {
				vm.gridApiCon = gridApi;
				vm.lstSelectedContacts = [];
				gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
					vm.elementoSeleccionado = fila.entity;
					vm.lstSelectedContacts = vm.gridApiCon.selection.getSelectedRows();
				});
			}
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.colaborador.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.saveColaborador = function() {
			var json = vm.datos;
			
			json.IN_COMISIONISTA = true;
			json.IN_REASEGURADORA = false;
			json.LISTA_COMISIONES = vm.gridOptions.data;
			vm.checkGridData(vm.gridContactos.data, json, 'LISTA_CONTACTOS', vm.contactosDeleted);

			let objSave = JSON.parse(JSON.stringify(json));
			if(objSave.LISTA_CONTACTOS && objSave.LISTA_CONTACTOS.length > 0) {
				for(let i = 0; i < objSave.LISTA_CONTACTOS.length; i++) {
					if(objSave.LISTA_CONTACTOS[i].listTiposContacto)
						delete objSave.LISTA_CONTACTOS[i].listTiposContacto;
					if(objSave.LISTA_CONTACTOS[i].ramos)
						delete objSave.LISTA_CONTACTOS[i].ramos;
				}
			}

			vm.appParent.abrirModalcargar(true);
            AseguradoraService.saveAseguradora(objSave)
        	.then(function successCallBack(response){
        		vm.datos.NU_CIF = response.data.NU_CIF;
        		if(response.data.ID_RESULT == 0) {
        			if(vm.datos.ID_COMPANIA == undefined){
        				msg.textContent('Se ha creado correctamente');
	                	$mdDialog.show(msg).then(function() {
	                		if (vm.datos.NU_CIF != null) {
		                		$window.location.href = window.location.origin + window.location.pathname + '#!/catalogo_comisionistas_list/?documentoColaborador=' + vm.datos.NU_CIF;
	                		}
	        		    });
        			}else{
						vm.appParent.cambiarDatosModal($translate.instant('MSG_EDITED_SUCCESS'));
        			}
        			vm.datos = response.data;
        			vm.getComisiones();
				} else {
					vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
				}
        	}, function errorCallBack(response){
        		vm.status == response.status;
        		if(vm.datos.ID_COMPANIA == undefined){
					vm.appParent.cambiarDatosModal('Error al crear la aseguradora');
    			}else{
					vm.appParent.cambiarDatosModal('Error al editar la aseguradora');
    			}
        	});
    	}
    	
    	vm.validar = function(form2Validate) {
            if (form2Validate) {
				objFocus=angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
                vm.indice = vm.indice;
            } else {
				vm.indice = vm.indice + 1;
				vm.checkIndex(vm.indice);
            }
        }

		vm.siguiente = function (ind) {
			if(ind == 1){
				vm.validar(vm.formColaborador.$invalid);
			}else{
				vm.indice = vm.indice + 1;
				vm.checkIndex(vm.indice);
			}
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
			vm.checkIndex(vm.indice);
        }
    	
    	vm.add = function() {
			if(vm.indice == 2) {
				$mdDialog.show({
					templateUrl: BASE_SRC+'detalle/detalle.modals/colaborador.modal.html',
					controllerAs: '$ctrl',
					clickOutsideToClose:true,
					parent: angular.element(document.body),
					fullscreen:false,
					controller:['$mdDialog', function($mdDialog){
						var md = this;
						md.tipos = vm.tipos;
						
						this.$onInit = function(){
							md.messageError = '';
							TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
							.then(function successCallback(response){
								if(response.status == 200){
									md.canales = response.data.TIPOS.TIPO;
								}
							}, function callBack(response){
								if(response.status == 406 || response.status == 401){
									vm.parent.logout();
								}
							});
							
							TiposService.getRamos({"IN_TARIFICABLE": true})
							.then(function successCallback(response){
								if(response.status == 200){
									md.ramos = response.data.TIPOS.TIPO;
								}
							}, function callBack(response){
								if(response.status == 406 || response.status == 401){
									vm.parent.logout();
								}
							});
							
							TiposService.getCompania()
							.then(function successCallback(response){
								if(response.status == 200){
									md.aseguradoras = response.data.TIPOS.TIPO;
								}
							});
							
							TiposService.getCompRamoProd({})
							.then(function successCallback(response) {
								md.productos = response.data.CIARAMOS.CIA_RAMO;
								console.log(response);
							}, function errorCallBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parent.parent.logout();
								}
							});
							
							md.colectivos = vm.parent.colectivos;
						}
						
						
						md.cambiarRamo = function () {
							TiposService.getRamoCompania({
								"ID_RAMO": md.form.ID_RAMO
							})
							.then(function successCallback(response) {
								md.aseguradoras = response.data.CIARAMOS.CIA_RAMO;
							}, function errorCallBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parent.parent.logout();
								}
							});
						}
						
						
						md.cambiarAseguradora = function () {
							md.form.ID_COMP_RAMO_PROD = null;
							TiposService.getCompRamoProd({
								"ID_COMPANIA": md.form.ID_COMPANIA,
								"ID_RAMO": md.form.ID_RAMO
							})
							.then(function successCallback(response) {
								md.productos = response.data.CIARAMOS.CIA_RAMO;
								console.log(response);
							}, function errorCallBack(response) {
								if (response.status == 406 || response.status == 401) {
									vm.parent.parent.logout();
								}
							});
						}
						
						md.addComision = function(){
							if (md.formColaboradorModal.$invalid) {
								objFocus=angular.element('.ng-empty.ng-invalid-required:visible');           	
								md.messageError = 'Se deben rellenar correctamente los datos de este paso antes de continuar';
							} else {
								md.messageError = '';
								vm.gridOptions.data.push({
									"COLECTIVO": md.colectivos.find( x => x.ID_TIPO_POLIZA == md.form.ID_TIPO_COLECTIVO).DS_TIPO_POLIZA,
									"ID_TIPOCOLECTIVO": md.form.ID_TIPO_COLECTIVO, 
									"CANAL": "Área privada",
									"ID_TIPO": 17,
									"NO_PRODUCTO": md.productos.find( x => x.ID_COMP_RAMO_PROD == md.form.ID_COMP_RAMO_PROD).NO_PRODUCTO,
									"ID_COMP_RAMO_PROD": md.form.ID_COMP_RAMO_PROD,
									"NU_PORCENTAJE": md.form.NU_PORCENTAJE,
									"CO_TIPO_UNIDAD": md.form.CO_TIPO_UNIDAD,
									"CO_TIPO_COMISION": md.form.CO_TIPO_COMISION,
									"ID_COMPANIA": vm.datos.ID_COMPANIA
									}
								);
								md.hide();
							}
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
				
					}]
				})
			} else
				vm.addContacto();
    	}
    	
    	//Cambiar tabs
    	vm.changeTabs = function(index){
    		vm.showTable = index;
		}
		
		vm.checkGrid = function(api) {
			setTimeout(function() {
				if(api != undefined) {
					api.core.handleWindowResize();
				}
			}, 100);
		}

		vm.checkIndex = function(index) {
			if(index != undefined) {
				var api;
				switch (index) {
					case 2:
						api = vm.gridApi;
						break;
					case 3:
						api = vm.gridApiCon;
						break;
					default:
						break;
				}
				vm.checkGrid(api);
			}
		}
		
		vm.deleteComision = function () {
			var confirm = $mdDialog.confirm()
	        .textContent("¿Estás seguro de borrar las comisiones seleccionadas?")
	        .ariaLabel('Lucky day')
	        .ok('Aceptar')
	        .cancel('Cancelar');
	      	$mdDialog.show(confirm).then(function() {
	          	for (var i = 0; i < vm.listaSeleccionados.length; i++) {
	          		if (vm.listaSeleccionados[i].ID_COMISIONISTA_PRODUCTO != null) {
		          		var index = vm.gridOptions.data.findIndex(x => x.ID_COMISIONISTA_PRODUCTO == vm.listaSeleccionados[i].ID_COMISIONISTA_PRODUCTO);
		          		if (index >= 0) {
		          			vm.gridOptions.data[index].IN_BAJA_REG = 1;
		          			// vm.gridOptions.data.splice(index, 1);
		          		}
	          		} else {
		          		var index = vm.gridOptions.data.findIndex(x => x == vm.listaSeleccionados[i] );
		          		if (index >= 0) {
		          			// vm.gridOptions.data[index].IN_BAJA_REG = 1;
		          			vm.gridOptions.data.splice(index, 1);
		          		}
	          		}
	          	}

				//Si no es nuevo, hacer petición para borrar
				if (vm.datos != null && vm.datos.ID_COMPANIA != null) {
		          	vm.saveColaborador();
				}
	  	    }, function() {
	  	    	$mdDialog.cancel();
	  	    });
		}

		vm.delete = function(indice) {
			if(indice == 2) {
				vm.deleteComision();
			} else {
				if(vm.elementoSeleccionado != null && vm.elementoSeleccionado != undefined && vm.gridContactos != null && vm.gridContactos != undefined && vm.gridContactos.data != null && vm.gridContactos.data != undefined){
					for(var i = 0; i < vm.gridContactos.data.length; i++) {
						if(vm.gridContactos.data[i] == vm.elementoSeleccionado){
							vm.gridContactos.data[i].IS_DELETED = true;
							vm.contactosDeleted.push(vm.gridContactos.data[i]);
							vm.gridContactos.data.splice(i, 1);
							break;
						}
					}
				}
			}
		}

		vm.addContacto = function() {
			if(vm.lstPrograms && vm.listTiposContacto && vm.lstRecipientType)
				vm.dialogElement('contact');
		}

		vm.checkGridData = function(gridData, obj, lst, lstDeleted) {
			if(gridData != undefined) {
				obj[lst] = JSON.parse(JSON.stringify(gridData));
				for(var i = 0; i < lstDeleted.length; i++) {
					obj[lst].push(lstDeleted[i]);
				}
			}
		}

		vm.dialogElement = function(elemType, row) {
			$mdDialog.show({
				templateUrl: `${BASE_SRC}detalle/detalle.modals/add_element_aseguradora.modal.html`,
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
					md.elemType = elemType;
					md.datos = vm.datos;
					md.lstPrograms = vm.lstPrograms;
					md.listTiposContacto = vm.listTiposContacto;
					md.lstRecipientType = vm.lstRecipientType;
					md.parent = vm.parent;
					md.appParent = vm.appParent;
					md.element = 'contacto'

					if(row) {
						md.edit = true;
						md.form = {
							'NO_PERSONA': row.NO_PERSONA,
							'IN_TIPO_DESTINATARIO': row.IN_TIPO_DESTINATARIO,
							'ID_TIPOCONTACTO': row.ID_TIPOCONTACTO,
							'ID_PROGRAMA': row.ID_PROGRAMA,
							'NO_DIRECCION': row.NO_DIRECCION,
							'NO_EMAIL': row.NO_EMAIL,
							'NU_TELEFONO1': row.NU_TELEFONO1,
						}
					}
					
					md.addElement = function(elemType) {
						if(elemType == 'contact') {
							if(row) {
								for(let data in md.form) {
									if(md.form[data]) {
										row[data] = md.form[data];
									}
								}
								vm.showSimpleToast(`Contacto '${row.NO_PERSONA}' editado`);
							} else {
								// if(!md.form || !md.form.NO_PERSONA || !md.form.ID_TIPOCONTACTO || !md.form.IN_TIPO_DESTINATARIO || !md.form.NO_EMAIL) {
								if(!md.formAddElement.$valid) {
									
									vm.showSimpleToast('Debe introducir los datos correctamente para añadir un contacto');

								} else {
									vm.gridContactos.data.push({
										'ID_PROGRAMA': md.form.ID_PROGRAMA,
										'NO_PERSONA': md.form.NO_PERSONA,
										'ID_TIPOCONTACTO': md.form.ID_TIPOCONTACTO,
										'NO_DIRECCION': md.form.NO_DIRECCION,
										'NO_EMAIL': md.form.NO_EMAIL,
										'NU_TELEFONO1': md.form.NU_TELEFONO1,
										'ID_COMPANIA': md.datos.ID_COMPANIA,
										'IN_TIPO_DESTINATARIO': md.form.IN_TIPO_DESTINATARIO,
										'IS_NEW': true
									});
									vm.showSimpleToast(`Contacto '${md.form.NO_PERSONA}' añadido`);
									md.cancel();
								}
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

		vm.showSimpleToast = function(msg) {
			$mdToast.show(
				$mdToast.simple()
				.textContent(msg)
				.position('bottom center')
				.hideDelay(3000))
			.then(function() {
			}).catch(function() {
			});
		};

    }   
    
    ng.module('App').component('colaboradorSd', Object.create(colaboradorComponent));
    
})(window.angular);