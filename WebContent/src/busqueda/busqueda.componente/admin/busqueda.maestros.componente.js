(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'TiposService', '$scope', '$templateCache', '$translate', 'ColectivoService', 'constantsTipos'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, TiposService, $scope, $templateCache, $translate, ColectivoService, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.colModificado = {};
    	vm.numDetalles = [];
		var url=window.location;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.colectivos = vm.parent.colectivos;
    		TiposService.getCodigos()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.codigos = response.data.TIPOS.TIPO;
					for(var i = 0; i<vm.codigos.length; i++){
						var no_codigo = vm.codigos[i].NO_CODIGO;
						delete vm.codigos[i].NO_CODIGO;
						vm.codigos[i].NO_CODIGO = no_codigo;                            
						vm.codigos[i].id = vm.codigos[i].NO_CODIGO;
                    }
                    if(vm.gridOptions.data != undefined){
                        for(var i=0; i<vm.gridOptions.data.length; i++){
                            vm.gridOptions.data[i].codigos = vm.codigos;
                        }
					}
				}
			})
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.ramo != undefined && localStorage.ramo != ""){
				vm.gridOptions.data = JSON.parse(localStorage.ramo);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}

			var idPermiso = 0;
			if(/productos/.test(url)){
				idPermiso = 713;
				vm.textMaestro = "un producto";
				vm.noTextMaestro = "ningún producto";
				vm.gridOptions.columnDefs.unshift(
					/*
					{
						field: 'ID_PRODUCTO', 
						displayName: 'Identificador', 
						cellTooltip: function(row){return row.entity.ID_PRODUCTO},
						sort: { priority: 0, direction: 'desc' }
					},
					{
						field: 'NO_PRODUCTO',
						displayName: 'Nombre',
						cellTooltip: function(row){return row.entity.NO_PRODUCTO},
						enableCellEdit: true, 
						editDropdownValueLabel: 'NO_PRODUCTO',
						cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_PRODUCTO]">{{row.entity.NO_PRODUCTO}}</div>'
					},
					{
						field: 'DS_PRODUCTO',
						displayName: $translate.instant('DESCRIPTION'),
						cellTooltip: function(row){return row.entity.DS_PRODUCTO},
						enableCellEdit: true,  editDropdownValueLabel: 'DS_PRODUCTO',
						cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.DS_PRODUCTO]">{{row.entity.DS_PRODUCTO}}</div>'
					}
					*/
					{
						field: 'ID_PRODUCTO', 
						displayName: 'Identificador', 
						cellTooltip: function(row){return row.entity.ID_PRODUCTO},
						sort: { priority: 0, direction: 'desc' }, width: '7%',
						cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'producto\', row)">{{row.entity.ID_PRODUCTO}}</a></div>'
					},
					{
						field: 'NO_PRODUCTO',
						displayName: 'Nombre',
						cellTooltip: function(row){return row.entity.NO_PRODUCTO},
					},
					{
						field: 'DS_PRODUCTO',
						displayName: $translate.instant('DESCRIPTION'),
						cellTooltip: function(row){return row.entity.DS_PRODUCTO},
					}
				)
			}
			else if(/ramos/.test(url)){
				idPermiso = 712;
				vm.textMaestro = "un ramo";
				vm.noTextMaestro = "ningún ramo";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_RAMO', 
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_RAMO}, width: '7%',
      		    	  sort: { priority: 0, direction: 'desc' }
      		      },
      		      {field: 'NO_RAMO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.NO_RAMO}, enableCellEdit: true,  editDropdownValueLabel: 'NO_RAMO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_RAMO">{{row.entity.NO_RAMO}}</div>'},
      		      {field: 'IN_TARIFICABLE', displayName: 'Tarifica', cellTooltip: function(row){return row.entity.IN_TARIFICABLE}, enableCellEdit: true,  editDropdownValueLabel: 'IN_TARIFICABLE', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.IN_TARIFICABLE">{{row.entity.IN_TARIFICABLE == true ? \'Sí\' : \'No\' }}</div>'})
//      		    {field: 'ID_CONFIGURATION', displayName: 'Configuración', cellTooltip: function(row){return row.entity.ID_CONFIGURATION}, cellFilter: 'number: 2', enableCellEdit: true,  editDropdownValueLabel: 'ID_CONFIGURATION', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="grid.appScope.$ctrl.colModificado[row.entity.ID_CONFIGURATION]">{{row.entity.ID_CONFIGURATION}}</div>'})
			}
			else if(/formas_pago/.test(url)){
				idPermiso = 721;
				vm.textMaestro = "una forma de pago";
				vm.noTextMaestro = "ninguna forma de pago";
				vm.gridOptions.columnDefs.unshift(
					{
						field: 'ID_FORMAPAGO', width: '7%',
						displayName: 'Identificador', 
						cellTooltip: function(row){return row.entity.ID_FORMAPAGO},
					},
					{
						field: 'CO_FORMAPAGO',
						displayName: 'Código',
						cellTooltip: function(row){return row.entity.CO_FORMAPAGO},
						enableCellEdit: true,
						editDropdownValueLabel: 'CO_FORMAPAGO',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_FORMAPAGO">{{row.entity.CO_FORMAPAGO}}</div>'
					},
					{
						field: 'DS_FORMAPAGO',
						displayName: $translate.instant('DESCRIPTION'),
						cellTooltip: function(row){return row.entity.DS_FORMAPAGO},
						enableCellEdit: true,
						editDropdownValueLabel: 'DS_FORMAPAGO',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_FORMAPAGO">{{row.entity.DS_FORMAPAGO}}</div>'
					}
				)
			}
			else if(/medio_pago/.test(url)){
				idPermiso = 722;
				vm.textMaestro = "un medio de pago";
				vm.noTextMaestro = "ningún medio de pago";
				vm.gridOptions.columnDefs.unshift(
					{
						field: 'ID_TIPO_MEDIO_PAGO', width: '7%',
						displayName: 'Identificador', 
						cellTooltip: function(row){return row.entity.ID_TIPO_MEDIO_PAGO},
					},
					{
						field: 'CO_TIPO_MEDIO_PAGO',
						displayName: 'Código',
						cellTooltip: function(row){return row.entity.CO_TIPO_MEDIO_PAGO},
						enableCellEdit: true,
						editDropdownValueLabel: 'CO_TIPO_MEDIO_PAGO',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_TIPO_MEDIO_PAGO">{{row.entity.CO_TIPO_MEDIO_PAGO}}</div>'
					},
					{
						field: 'DS_TIPO_MEDIO_PAGO',
						displayName: $translate.instant('DESCRIPTION'),
						cellTooltip: function(row){return row.entity.DS_TIPO_MEDIO_PAGO},
						enableCellEdit: true,
						editDropdownValueLabel: 'DS_TIPO_MEDIO_PAGO',
						cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPO_MEDIO_PAGO">{{row.entity.DS_TIPO_MEDIO_PAGO}}</div>'
					}
				)
			}
			else if(/tipos_via/.test(url)){
				idPermiso = 723;
				vm.textMaestro = "un tipo de vía";
				vm.noTextMaestro = "ningún tipo de vía";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_TIPO_VIA', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_TIPO_MEDIO_PAGO},
      		      },
      		      {field: 'DS_TIPO_VIA', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_TIPO_VIA}, enableCellEdit: true,  editDropdownValueLabel: 'DS_TIPO_VIA', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPO_VIA">{{row.entity.DS_TIPO_VIA}}</div>'})
			}
			else if(/tipos_documento/.test(url)){
				idPermiso = 751;
				vm.textMaestro = "un tipo de documento";
				vm.noTextMaestro = "ningún tipo de documento";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_TIPO_DOCUMENTO', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_TIPO_DOCUMENTO},
      		      },
      		      {field: 'DS_TIPO_DOCUMENTO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_TIPO_DOCUMENTO}, enableCellEdit: true,  editDropdownValueLabel: 'DS_TIPO_DOCUMENTO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPO_DOCUMENTO">{{row.entity.DS_TIPO_DOCUMENTO}}</div>'})
			}
			else if(/tipos_sexo/.test(url)){
				idPermiso = 752;
				vm.textMaestro = "un tipo de documento";
				vm.noTextMaestro = "ningún tipo de documento";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_SEXO', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_SEXO},
      		      },
      		      {field: 'DS_SEXO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_SEXO}, enableCellEdit: true,  editDropdownValueLabel: 'DS_SEXO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_SEXO">{{row.entity.DS_SEXO}}</div>'})
			}
			else if(/programa/.test(url)){
				idPermiso = 733;
				vm.textMaestro = "un tipo de programa";
				vm.noTextMaestro = "ningún tipo de programa";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_PROGRAMA', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_PROGRAMA},
      		      },
      		      {field: 'DS_PROGRAMA', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_PROGRAMA}, enableCellEdit: true,  editDropdownValueLabel: 'DS_PROGRAMA', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_PROGRAMA">{{row.entity.DS_PROGRAMA}}</div>'}
      		    )
			}
			else if(/tipos/.test(url)){
				idPermiso = 726;
				vm.textMaestro = "un tipo";
				vm.noTextMaestro = "ningún tipo";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_TIPOS', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_TIPOS},
      		      },
      		    {field: 'ID_TIPO_INTERNO', width: '7%', displayName: 'ID Interno', cellTooltip: function(row){return row.entity.ID_TIPO_INTERNO}, cellTemplate: '<div class="ui-grid-cell-contents" ng-class="row.entity.colModificado.ID_TIPO_INTERNO">{{row.entity.ID_TIPO_INTERNO}}</div>'},
      		      {field: 'DS_TIPOS', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_TIPOS}, enableCellEdit: true,  editDropdownValueLabel: 'DS_TIPOS', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPOS">{{row.entity.DS_TIPOS}}</div>'},
      		      {field: 'CO_TIPO', displayName: 'Tipo', cellTooltip: function(row){return row.entity.CO_TIPO}, enableCellEdit: true,  editDropdownValueLabel: 'CO_TIPO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.CO_TIPO">{{row.entity.CO_TIPO}}</div>'},
//      		      {field: 'NO_CODIGO', displayName: 'Código', cellTooltip: function(row){return row.entity.NO_CODIGO}, enableCellEdit: true, editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownRowEntityOptionsArrayPath: 'codigo', editDropdownValueLabel: 'NO_CODIGO', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_CODIGO]">{{row.entity.NO_CODIGO}}</div>'}
                  {field: 'NO_CODIGO', displayName: 'Código', cellTooltip: function(row){return row.entity.NO_CODIGO}, 
                      enableCellEdit: true, 
                      editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'NO_CODIGO',
                    editDropdownRowEntityOptionsArrayPath: 'codigos',
                    cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.NO_CODIGO">{{row.entity.NO_CODIGO}}</div>'
                  }
      		    )
			}
			else if(/situacion_poliza/.test(url)){
				idPermiso = 744;
				vm.textMaestro = "un estado de poliza";
				vm.noTextMaestro = "ningún estado de poliza";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_SITUAPOLIZA', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_SITUAPOLIZA},
      		      },
      		      {field: 'DS_SITUAPOLIZA', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_SITUAPOLIZA}, enableCellEdit: true,  editDropdownValueLabel: 'DS_SITUAPOLIZA', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_SITUAPOLIZA">{{row.entity.DS_SITUAPOLIZA}}</div>'}
      		    )
			}
			else if(/situacion_cliente/.test(url)){
				idPermiso = 742;
				vm.textMaestro = "un estado de cliente";
				vm.noTextMaestro = "ningún estado de cliente";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_SITUACION_CLIENTE', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_SITUACION_CLIENTE},
      		      },
      		      {field: 'DS_SITUACION_CLIENTE', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_SITUACION_CLIENTE}, enableCellEdit: true,  editDropdownValueLabel: 'DS_SITUACION_CLIENTE', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_SITUACION_CLIENTE">{{row.entity.DS_SITUACION_CLIENTE}}</div>'}
      		    )
			}
			else if(/situacion_recibo/.test(url)){
				idPermiso = 741;
				vm.textMaestro = "un estado de recibo";
				vm.noTextMaestro = "ningún estado de recibo";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_SITUARECIBO', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_SITUARECIBO},
      		      },
      		      {field: 'DS_SITUARECIBO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_SITUARECIBO}, enableCellEdit: true,  editDropdownValueLabel: 'DS_SITUARECIBO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_SITUARECIBO">{{row.entity.DS_SITUARECIBO}}</div>'}
      		    )
			}
			else if(/estados_siniestro/.test(url)){
				idPermiso = 743;
				vm.textMaestro = "un estado de siniestro";
				vm.noTextMaestro = "ningún estado de siniestro";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_ESTADO_SINIESTRO', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_ESTADO_SINIESTRO},
      		      },
      		      {field: 'DS_ESTADO_SINIESTRO', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_ESTADO_SINIESTRO}, enableCellEdit: true,  editDropdownValueLabel: 'DS_ESTADO_SINIESTRO', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_ESTADO_SINIESTRO">{{row.entity.DS_ESTADO_SINIESTRO}}</div>'}
      		    )
			}
			else if(/anulacion/.test(url)){
				idPermiso = 731;
				TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_CAUSA_ANULACION})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.usos = response.data.TIPOS.TIPO;
                        for(var i = 0; i<vm.usos.length; i++){
                            var uso = vm.usos[i].DS_TIPOS;
                            delete vm.usos[i].DS_TIPOS;
                            vm.usos[i].DS_TIPOS = uso;
                            vm.usos[i].id = vm.usos[i].DS_TIPOS;
                        }
                        if(vm.gridOptions.data != undefined){
                            for(var i=0; i<vm.gridOptions.data.length; i++){
                                vm.gridOptions.data[i].usos = vm.usos;
                            }
                        }
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
	                	vm.parent.logout();
	                }
				});
				
				vm.textMaestro = "un motivo de anulación";
				vm.noTextMaestro = "ningún motivo de anulación";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_CAUSAANULACION', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_CAUSAANULACION},
      		      },
      		      {field: 'DS_CAUSAANULACION', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_CAUSAANULACION}, enableCellEdit: true,  editDropdownValueLabel: 'DS_CAUSAANULACION', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_CAUSAANULACION">{{row.entity.DS_CAUSAANULACION}}</div>'},
                  {field: 'DS_TIPOS', displayName: 'Uso', cellTooltip: function(row){return row.entity.DS_TIPOS}, enableCellEdit: true,
                      editableCellTemplate: 'ui-grid/dropdownEditor',
                      editDropdownValueLabel: 'DS_TIPOS',
                      editDropdownRowEntityOptionsArrayPath: 'usos',
                      cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPOS">{{row.entity.DS_TIPOS}}</div>'
            	  }
      		    )
			}
			else if(/sujetos/.test(url)){
				idPermiso = 732;
				vm.textMaestro = "un tipo de cliente";
				vm.noTextMaestro = "ningún tipo de cliente";
				vm.gridOptions.columnDefs.unshift(
				  {field: 'ID_TIPO_CLIENTE', width: '7%',
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_TIPO_CLIENTE},
      		      },
      		      {field: 'DS_TIPO_CLIENTE', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_TIPO_CLIENTE}, enableCellEdit: true,  editDropdownValueLabel: 'DS_TIPO_CLIENTE', cellTemplate: '<div class="ui-grid-cell-contents celda-editable" ng-class="row.entity.colModificado.DS_TIPO_CLIENTE">{{row.entity.DS_TIPO_CLIENTE}}</div>'}
      		    )
			}
			else{
				idPermiso = 724;
				vm.textMaestro = "un colectivo";
				vm.noTextMaestro = "ningún colectivo";
				vm.gridOptions.columnDefs.unshift(
				      {
			              field: 'ID_TIPO_POLIZA',width: '7%',
			              displayName: 'Identificador',
			              cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, row)">{{row.entity.ID_TIPO_POLIZA}}</a></div>'
			          },
	      		      {field: 'DS_TIPO_POLIZA', displayName: 'Partner', cellTooltip: function(row){return row.entity.DS_TIPO_POLIZA}},
	      		      {field: 'DS_TIPO_POLIZA_PADRE', displayName: 'Subcolectivo', cellTooltip: function(row){return row.entity.DS_TIPO_POLIZA_PADRE}});
				vm.gridOptions.columnDefs.push({
			                  name: ' ', cellTemplate: '<div ng-if="grid.appScope.$ctrl.permisos.IN_BORRADO == true" class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.borrarColectivo(row.entity)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>',
			                  width: 36,
			              });
			}
			

			if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
            vm.active = 0;
            
            if(vm.gridOptions.data != undefined && /tipos/.test(url)){
                for(var i=0; i<vm.gridOptions.data.length; i++){
                    vm.gridOptions.data[i].codigos = vm.codigos;
                }
            }
            
            if(vm.gridOptions.data != undefined && /anulacion/.test(url)){
                for(var i=0; i<vm.gridOptions.data.length; i++){
                    vm.gridOptions.data[i].usos = vm.usos;
                }
            }
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    enableCellEdit: false,
    		    columnDefs: [
      		      {field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'',width: '10%', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}},
      		      {field: 'FT_USU_MOD', cellFilter: 'date:\'dd/MM/yyyy\'', width: '10%',displayName: 'Modificado en', cellTooltip: function(row){return row.entity.FT_USU_MOD}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
    		    	vm.gridApi = gridApi;
      		      
					vm.listaSeleccionados = [];
					
					if(gridApi.selection != undefined) {
						gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
							vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
						});
						
						gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
							vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
						});
						gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
							vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
						});
					}
	  	      		vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  console.log(rowEntity);
	  	      				  
	  	      				  if (rowEntity.colModificado == null) {
	  	      					  rowEntity.colModificado = {};
	  	      				  }
	  	      				  
	  	      				  rowEntity.colModificado[colDef.field] = 'colModificado';
	  	      				  
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      				  
                              if (/tipos/.test(url)) {
                                  rowEntity.ID_CODIGO = _.find(vm.codigos, {'NO_CODIGO':rowEntity.NO_CODIGO}).ID_CODIGO;
                              }
                              
                              if (/anulacion/.test(url)) {
                                  rowEntity.ID_TIPOANULACION = _.find(vm.usos, {'DS_TIPOS':rowEntity.DS_TIPOS}).ID_TIPOS;
                              }
	  	      			  }
	  	    		});
      		    }
		}
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			if(vm.parent.tipo == "tipo-producto"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.productos.html";
			}else if(vm.parent.tipo == "tipo-ramo"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.ramos.html";
			}else if(vm.parent.tipo == "tipo-anul"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.anulacion.html";
			}else if(vm.parent.tipo == "tipo-sujetos"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.sujetos.html";
			}else if(vm.parent.tipo == "tipo-programa"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.programas.html";
			}else if(vm.parent.tipo == "tipo-statPoliza"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.statPoliza.html";
			}else if(vm.parent.tipo == "tipo-statCliente"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.statCliente.html";
			}else if(vm.parent.tipo == "tipo-statRecibo"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.statRecibo.html";
			}else if(vm.parent.tipo == "tipo-statSiniestro"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.statSiniestro.html";
			}else if(vm.parent.tipo == "tipo-tiposDocumento"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tiposDocumento.html";
			}else if(vm.parent.tipo == "tipo-tiposSexo"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tiposSexo.html";
			}else if(vm.parent.tipo == "tipo-tiposVia"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tiposVia.html";
			}else if(vm.parent.tipo == "tipo-tiposTipos"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tiposTipos.html";
			}else if(vm.parent.tipo == "tipo-medio_pago"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tipoMedioPago.html";
			}else if(vm.parent.tipo == "tipo-formas_pago"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tipoFormasPago.html";
			}else if(vm.parent.tipo == "tipo-colectivos"){
				return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.tipoColectivos.html";
			}
//    		return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.maestros.html";
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i] == fila){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe){
    			vm.numDetalles.push(fila);
                vm.active = vm.numDetalles.length;
    		}else {
                vm.active = vm.numDetalles.length;
            }
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		var detallesAbiertos = [];
            
            if(vm.numDetalles != null){
                for(var i = 0; i < vm.numDetalles.length; i++){
                    detallesAbiertos.push(vm.numDetalles[i]);
                }
            }
            

            detallesAbiertos.splice(index,1);
            vm.numDetalles = [];
            setTimeout( function () { 
                    for(var i = 0; i < detallesAbiertos.length; i++){
                        vm.numDetalles.push(detallesAbiertos[i]);
                    }
                    
                    vm.active = vm.numDetalles.length;
                }, 
            10);

    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Creamos JSON
    	function rellenarJSON(){
    		json = {};
    		vm.isError = false;
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null){
    				delete vm.form[key];
    			}
				else{
					if(value.value instanceof Date){
						json[key]=vm.parent.dateFormat(value.value);
						
						//Comprueba las fechas que no sean al revés
						angular.forEach(vm.form, function(value2, key2){
							if(!vm.isError){
								vm.isError = vm.parent.validFechas(key2, value2.value, key, value.value);
							}
						});
					}
					else if(typeof(value.value) == 'object'){
						json[key]=[]
						for(var i=0;i<value.value.length;i++){
							json[key][i]=value.value[i].id;
						}
						json[key]=json[key].toString();
					}
					else{
						json[key]=value.value;
					}
					
				}
    		});
    	}
    	
    	
    	
    	//Colectivo
    	vm.borrarColectivo = function(colectivo){
    		vm.colectivo = colectivo;
    		$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_colectivos.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose:true,
                parent: angular.element(document.body),
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                var md = this;
                
                md.borrar = function(option){
                  if(option){

                      vm.parent.parent.abrirModalcargar(true);
                	  ColectivoService.borrarColectivo(vm.colectivo)
	              		.then(function successCallBack(response){
	              			if(response.status == 200){
	              				var listColectivos = vm.gridOptions.data;
	              				for(var i = 0; i < listColectivos.length; i++){
	              					if(listColectivos[i].ID_TIPO_POLIZA == vm.colectivo.ID_TIPO_POLIZA){
	              						listColectivos.splice(i,1);
	              						break;
	              					}
	              				}
	          					msg.textContent('Se ha eliminado correctamente');
	          					$mdDialog.show(msg);
	          				}else{
	          					msg.textContent('Ha ocurrido un error al eliminar');
	          					$mdDialog.show(msg);
	          				}
	              		}, function error(error){
	              			msg.textContent('Ha ocurrido un error al eliminar');
	          				$mdDialog.show(msg);
	          			});
                  }else
                     $mdDialog.cancel();
                }
                
              }]
            });
    	}
    	

    	//Ramo
    	vm.addRamo = function(){
    		if(vm.form == undefined || vm.form.noDescripcionRamo == '' || vm.form.noDescripcionRamo == undefined) {
				msg.textContent('Elija una descripción para el ramo');
				$mdDialog.show(msg);
    		}else{
    			vm.gridOptions.data.push({"NO_RAMO":vm.form.noDescripcionRamo, "IN_TARIFICABLE":vm.form.tarificaRamo == undefined ? false : vm.form.tarificaRamo, "ID_CONFIGURATION":vm.form.configuracionRamo, "IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
    			vm.form = {};
    		}
    	}
    	
    	//////////////////////GUARDAR Y BORRAR TIPOS///////////////////
    	vm.save = function(servicio){
    		var datos = [];
    		if(servicio === 'saveListRamos' || servicio === 'saveListProductos'){   			
				// var json = {"CIARAMOS":{"CIA_RAMO": datos}};
				var json =[];
    			for(var i=0; i<vm.gridOptions.data.length; i++){
    				if(vm.gridOptions.data[i].IS_NEW == true || vm.gridOptions.data[i].IS_UPDATED == true || vm.gridOptions.data[i].IS_DELETED == true){
    					json.push(vm.gridOptions.data[i]);
    					// break;
    				}
				}	   						
    		}else {
    			var json = {"TIPOS":{"TIPO": datos}};
				for(var i=0; i<vm.gridOptions.data.length; i++){
    				if(vm.gridOptions.data[i].IS_NEW == true || vm.gridOptions.data[i].IS_UPDATED == true || vm.gridOptions.data[i].IS_DELETED == true){
    					datos.push(vm.gridOptions.data[i]);
    					// break;
    				} else {
						// var json = {"TIPOS":{"TIPO": vm.gridOptions.data}};
						// msg.textContent('Se requieren datos nuevos para la petición');
						// $mdDialog.show(msg);
					}
				}	
			}
			
    		if(vm.gridOptions.data != undefined && Array.isArray(vm.gridOptions.data)){
                vm.parent.parent.abrirModalcargar(true);
	    		TiposService[servicio](json)
					.then(function successCallback(response){
						if(response.status == 200){
							if(response.data.ID_RESULT == 0){
								msg.textContent('Se ha guardado correctamente');
	                            vm.colModificado = {};
	                            
	                            setTimeout(function(){ 
	                            	vm.parent.buscar(vm.parent.form,vm.parent.tipo); 
	                        	}, 1000);
	                            
								$mdDialog.show(msg);
							}else{
								msg.textContent(response.data.DS_RESULT);
			                    $mdDialog.show(msg);
							}
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al guardar');
                    $mdDialog.show(msg);
                });
    		}
    	}
    	
    	vm.borrar = function(id, servicio, idTipo){
    		var json = {};
    		if(vm.listaSeleccionados.length > 0){
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				vm.listaSeleccionados[i].IS_DELETED = true;
    				if (idTipo != null) {
    					vm.listaSeleccionados[i] = {
							[idTipo]: vm.listaSeleccionados[i][idTipo],
							IT_VERSION: vm.listaSeleccionados[i].IT_VERSION,
							IS_DELETED: true
    					}
    				}
    			}
    			
    			if(servicio === 'saveListRamos' || servicio === 'saveListProductos'){
        			json = vm.listaSeleccionados;
        		}else{
        			var json = {"TIPOS":{"TIPO": vm.listaSeleccionados}};
        		}

                vm.parent.parent.abrirModalcargar(true);
    			TiposService[servicio](json)
					.then(function successCallback(response){
						if(response.status == 200){
							for(var i = 0; i < vm.listaSeleccionados.length; i++){
								for(var j = 0; j < vm.gridOptions.data.length; j++){
									if(vm.gridOptions.data[j][id] === vm.listaSeleccionados[i][id]){
										var index = vm.gridOptions.data.indexOf(vm.gridOptions.data[j]);
										vm.gridOptions.data.splice( index, 1 );
										break;
									}
								}
							}
							msg.textContent('Se ha eliminado correctamente');
							$mdDialog.show(msg);
						}else{
							msg.textContent('Ha ocurrido un error al eliminar');
							$mdDialog.show(msg);
						}
				}, function errorCallback(response) {
    				msg.textContent('Ha ocurrido un error al eliminar');
                    $mdDialog.show(msg);
                });
    		}else{
				msg.textContent('Seleccione al menos una opción para borrar');
				$mdDialog.show(msg);
    		}
    	}
    	
    	//Colectivos
    	vm.addColectivo = function(){
    		vm.numDetalles.push(undefined);
            vm.active = vm.numDetalles.length;
    	}
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		localStorage.clear();
    		rellenarJSON();
    		
			console.log(vm.json);
			
			if(!vm.isError){
				if(Object.keys(json).length !== 0){
	//				 vm.completed=2;
	//	             vm.mensajeBuscar = false;
	//	             vm.loading = true;
				}
				else{
					$('#checkVacio').slideDown().delay(1500).slideUp();
				}
			}
			else{
				$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
			}
    	}
    	
    	vm.add = function (tipo) {
    		$mdDialog.show({
	            templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_admin.modal.html',
	            controllerAs: '$ctrl',
	            clickOutsideToClose: true,
	            parent: angular.element(document.body),
	            fullscreen: false,
	            controller: ['$mdDialog', function ($mdDialog) {
	            	var md = this;
	                var obj = {};
	                var recibos = {};
	                md.tipo = tipo;
	                md.form = {};
	                md.codigos = vm.codigos;
	                md.usos = vm.usos;
	                
	                md.add = function () {
	            		if (md.tipo == "productos") {
            	    		if(md.form == undefined || md.form.noProducto == '' || md.form.noProducto == undefined) {
            					msg.textContent('Elija un nombre para el producto').multiple(true);
            					$mdDialog.show(msg);
            	    		}else if(md.form.noDescProducto == undefined || md.form.noDescProducto == '') {
            					msg.textContent('Elija una descripción para el producto').multiple(true);
            					$mdDialog.show(msg);
            	    		}else{
            	    			vm.gridOptions.data.push({"NO_PRODUCTO": md.form.noDescProducto, "DS_PRODUCTO": md.form.noDescProducto, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA": new Date()});
            	    			md.form = {};
            	    			vm.save('saveListProductos');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == "ramos") {
	                		if(md.form == undefined || md.form.noDescripcionRamo == '' || md.form.noDescripcionRamo == undefined) {
	            				msg.textContent('Elija una descripción para el ramo').multiple(true);
	            				$mdDialog.show(msg);
	                		}else{
	                			vm.gridOptions.data.push({"NO_RAMO": md.form.noDescripcionRamo, "IN_TARIFICABLE": md.form.tarificaRamo == undefined ? false : md.form.tarificaRamo, "ID_CONFIGURATION": md.form.configuracionRamo, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA":new Date()});
	                			md.form = {};
            	    			vm.save('saveListRamos');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "formaPago") {
	                		if(md.form == undefined || md.form.DS_FORMAPAGO == '' || md.form.DS_FORMAPAGO == undefined || md.form.CO_FORMAPAGO == '' || md.form.CO_FORMAPAGO == undefined) {
	            				msg.textContent('Elija los datos para crear la forma de pago').multiple(true);
	            				$mdDialog.show(msg);
	                		} else {
	                			vm.gridOptions.data.unshift({
	            					'DS_FORMAPAGO': md.form.DS_FORMAPAGO,
	            					'CO_FORMAPAGO': md.form.CO_FORMAPAGO,
	            					'IS_NEW': true,
	            					'NO_USU_ALTA': vm.parent.perfil,
	            					'FT_USU_ALTA': new Date()
	            				});
	                			md.form = {};
	                			vm.save('saveFormasPago');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "medioPago") {
	                		if(md.form == undefined || md.form.DS_TIPO_MEDIO_PAGO == '' || md.form.DS_TIPO_MEDIO_PAGO == undefined || md.form.CO_TIPO_MEDIO_PAGO == '' || md.form.CO_TIPO_MEDIO_PAGO == undefined) {
	            				msg.textContent('Elija los datos para crear el medio de pago').multiple(true);
	            				$mdDialog.show(msg);
	                		} else {
	                			vm.gridOptions.data.unshift({
	            					'DS_TIPO_MEDIO_PAGO': md.form.DS_TIPO_MEDIO_PAGO,
	            					'CO_TIPO_MEDIO_PAGO': md.form.CO_TIPO_MEDIO_PAGO,
	            					'IS_NEW': true,
	            					'NO_USU_ALTA': vm.parent.perfil,
	            					'FT_USU_ALTA': new Date()
	            				});
	                			md.form = {};
	                			vm.save('saveTiposMedioPago');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "tiposTipos") {
	                		if (md.form == undefined || md.form.CODIGO == undefined) {
	            				msg.textContent('Elija los datos necesarios para crear un tipo').multiple(true);
	            				$mdDialog.show(msg);
	                		} else {
	                			vm.gridOptions.data.unshift({"DS_TIPOS": md.form.DS_TIPOS, "CO_TIPO": md.form.CO_TIPO, "NO_CODIGO": md.form.CODIGO.NO_CODIGO, "ID_CODIGO": md.form.CODIGO.ID_CODIGO, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA": new Date()});
	                			md.form = {};
	                			vm.save('saveTipos');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "tiposVia") {
	                		if (md.form == undefined || md.form.DS_TIPO_VIA == '' || md.form.DS_TIPO_VIA == undefined) {
	            				msg.textContent('Elija los datos para crear el tipo de via').multiple(true);
	            				$mdDialog.show(msg);
	                		} else {
	                			vm.gridOptions.data.unshift({"DS_TIPO_VIA": md.form.DS_TIPO_VIA, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA": new Date()});
	                			md.form = {};
	                			vm.save('saveTiposVia');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "tiposDocumento") {
	                		if (md.form == undefined || md.form.DS_TIPO_DOCUMENTO == '' || md.form.DS_TIPO_DOCUMENTO == undefined) {
	            				msg.textContent('Elija los datos para crear el tipo de documento').multiple(true);
	            				$mdDialog.show(msg);
	                		} else {
	                			vm.gridOptions.data.unshift({ "DS_TIPO_DOCUMENTO": md.form.DS_TIPO_DOCUMENTO, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA":new Date()});
	                			md.form = {};
	                			vm.save('saveTiposDocumento');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == "tiposSexo") {
	                		if(md.form == undefined || md.form.DS_SEXO == '' || md.form.DS_SEXO == undefined) {
	            				msg.textContent('Elija los datos para crear el tipo de sexo').multiple(true);
	            				$mdDialog.show(msg);
	                		}else{
	                			vm.gridOptions.data.unshift({ "DS_SEXO": md.form.DS_SEXO, "IS_NEW": true, "NO_USU_ALTA": vm.parent.perfil, "FT_USU_ALTA":new Date()});
	                			md.form = {};
	                			vm.save('saveTiposSexo');
        	                	$mdDialog.cancel();
	                		}
	            		} else if (md.tipo == 'tiposPoliza') {
            	    		if (md.form == undefined || md.form.DS_SITUAPOLIZA == '' || md.form.DS_SITUAPOLIZA == undefined) {
            					msg.textContent('Elija los datos para crear el estado').multiple(true);
            					$mdDialog.show(msg);
            	    		} else {
            	    			vm.gridOptions.data.unshift({"DS_SITUAPOLIZA":md.form.DS_SITUAPOLIZA,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveSituacionesPoliza');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == 'tiposCliente') {
            	    		if(md.form == undefined || md.form.DS_SITUACION_CLIENTE == '' || md.form.DS_SITUACION_CLIENTE == undefined) {
            					msg.textContent('Elija los datos para crear el estado').multiple(true);
            					$mdDialog.show(msg);
            	    		} else {
            	    			vm.gridOptions.data.unshift({"DS_SITUACION_CLIENTE":md.form.DS_SITUACION_CLIENTE,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveSituacionCliente');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == 'tiposRecibo') {
            	    		if(md.form == undefined || md.form.DS_SITUARECIBO == '' || md.form.DS_SITUARECIBO == undefined) {
            					msg.textContent('Elija los datos para crear el estado').multiple(true);
            					$mdDialog.show(msg);
            	    		}else{
            	    			vm.gridOptions.data.unshift({"DS_SITUARECIBO":md.form.DS_SITUARECIBO,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveSituacionesRecibo');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == 'tiposSiniestro') {
            	    		if(md.form == undefined || md.form.DS_ESTADO_SINIESTRO == '' || md.form.DS_ESTADO_SINIESTRO == undefined) {
            					msg.textContent('Elija los datos para crear el estado').multiple(true);
            					$mdDialog.show(msg);
            	    		}else{
            	    			vm.gridOptions.data.unshift({"DS_ESTADO_SINIESTRO":md.form.DS_ESTADO_SINIESTRO,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveEstadosSiniestro');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == "anulacion") {
            	    		if(md.form == undefined || md.form.TIPOS == '' || md.form.TIPOS == undefined || md.form.DS_CAUSAANULACION == '' || md.form.DS_CAUSAANULACION == undefined) {
            					msg.textContent('Elija los datos para crear el motivo').multiple(true);
            					$mdDialog.show(msg);
            	    		} else {
            	    			vm.gridOptions.data.unshift({ "CO_TIPO": md.form.TIPOS.CO_TIPO, "DS_CODIGO": md.form.TIPOS.DS_CODIGO, "ID_CODIGO": md.form.TIPOS.ID_CODIGO, "ID_TIPOANULACION": md.form.TIPOS.ID_TIPOS, "DS_TIPOS":md.form.TIPOS.DS_TIPOS, "DS_CAUSAANULACION":md.form.DS_CAUSAANULACION, "IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveMotivosAnulacion');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == 'tiposSujetos') {
            	    		if(md.form == undefined || md.form.DS_TIPO_CLIENTE == '' || md.form.DS_TIPO_CLIENTE == undefined) {
            					msg.textContent('Elija los datos para crear el sujeto').multiple(true);
            					$mdDialog.show(msg);
            	    		}else{
            	    			vm.gridOptions.data.unshift({"DS_TIPO_CLIENTE":md.form.DS_TIPO_CLIENTE,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveTiposCliente');
        	                	$mdDialog.cancel();
            	    		}
	            		} else if (md.tipo == 'programas') {
            	    		if(md.form == undefined || md.form.DS_PROGRAMA == '' || md.form.DS_PROGRAMA == undefined) {
            					msg.textContent('Elija los datos para crear el programa').multiple(true);
            					$mdDialog.show(msg);
            	    		} else {
            	    			vm.gridOptions.data.unshift({"DS_PROGRAMA":md.form.DS_PROGRAMA,"IS_NEW":true,"NO_USU_ALTA":vm.parent.perfil,"FT_USU_ALTA":new Date()});
            	    			md.form = {};
	                			vm.save('saveTiposPrograma');
        	                	$mdDialog.cancel();
            	    		}
	            		}
	                }
	                
	                md.cancel = function () {
	                	$mdDialog.cancel();
	                }
	            }]
    		})
    	}
    	
    }

    
    ng.module('App').component('busquedaMaestros', Object.create(busquedaComponent));
    
})(window.angular);