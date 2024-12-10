(function (ng) {


    //Crear componente de busqeuda
    var busquedaFusionComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$rootScope', '$scope', '$location', '$timeout', '$interval', '$window', '$mdDialog', 'validacionesService', 'sharePropertiesService', 'TiposService', 'BusquedaService', 'BASE_SRC', 'MovilService', 'i18nService', 'PolizaService'],
        require: {
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            detallesDispositivo: '<'
        }
    }

    busquedaFusionComponent.controller = function busquedaFusionComponentController($rootScope, $scope, $location, $timeout, $interval, $window, $mdDialog, validacionesService, sharePropertiesService, TiposService, BusquedaService, BASE_SRC, MovilService, i18nService, PolizaService) {
        var vm = this;
        var json = {};
        vm.llave = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.isNew = false;
        vm.codprecom = false;

        vm.screenHeight = $window.innerHeight;
        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active=0;
            vm.vista = 1;
           
            vm.parent.ckPermisos = { EXISTE: true };
    		
    		//Cargar las listas
			if(localStorage.envioMovistar != undefined && localStorage.envioMovistar != ""){
				vm.gridOptions.data = JSON.parse(localStorage.envioMovistar);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}			
    	}
    	
    	//Reaccionar los cambios por los componentes
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		
    		if(vm.gridOptions.data != undefined && vm.gridOptions.data != null && Object.keys(vm.gridOptions.data).length > 0){
	    		vm.active = 0;
    		}else{
    			vm.active = 0;
    		}

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
    	}

        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: true,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
            gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
            						'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'envios_movistar_main\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
        						'</div>',
        	paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		data: [],
            columnDefs: [
            {
                field: 'confirmar',
                displayName: '',
                width: '11%',
                cellTemplate: `<div class="ui-grid-cell-contents text-center">
                                    <a class="font-weight-normal" ng-if="(row.entity.imei.includes(\'TMP-BNR\') || row.entity.imei.includes(\'TMP-RTR\') || row.entity.imei.includes(\'TMP-WCA\') || row.entity.imei.includes(\'TMP-WCD\')) && !row.entity.processing" ng-click="grid.appScope.$ctrl.abrirModalImei(row.entity)">
                                        <i class="fas fa-check"></i>&nbsp;
                                        <span ng-if="(!row.entity.imei.includes(\'TMP-WCD\'))">CONFIRMAR IMEI</span>
                                        <span ng-if="(row.entity.imei.includes(\'TMP-WCD\'))">CONFIRMAR IBAN</span>
                                    </a>
                                    <span ng-if="(row.entity.imei.includes(\'TMP-WCD\') && (row.entity.processing))">PROCESANDO...</span>
                                </div>`
                // cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.abrirModalImei(row.entity)">Confirmar</a></div>'
            },
            {
                field: 'suspender',
                displayName: '',
                width: '9%',
                cellTemplate: '<div class="ui-grid-cell-contents text-center"><a class="font-weight-normal" ng-if="(row.entity.imei.includes(\'TMP-BNR\') || row.entity.imei.includes(\'TMP-RTR\') || row.entity.imei.includes(\'TMP-WCA\') || row.entity.imei.includes(\'TMP-WCD\'))" ng-click="grid.appScope.$ctrl.abrirModalSuspender(row.entity)"><i class="fas fas fa-times"></i>&nbsp;CANCELAR</a></div>'
//            	cellTemplate: '<div class="ui-grid-cell-contents text-center"><a ng-click="grid.appScope.$ctrl.abrirModalSuspender(row.entity)">CANCELAR</a></div>'
            },
            {
                field: 'opComercial',
                displayName: 'Operación comercial',width: '10%',
                cellTooltip: function (row) {
                	if (row.entity != undefined){
                		if(row.entity.opComercial != 1){return row.entity.opComercial;}else{ return row.entity.opComercial = 'ONE_CLICK';}
                	}                      
                }
            },
            {
                field: 'imei',
                displayName: 'IMEI',width:'12%',
                cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.imei}}</div>'
            },
            {
                field: 'msisdn',
                displayName: 'MSISDN',width: '7%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.msisdn;
                }
            },
            {
                field: 'brandName',
                displayName: 'Marca',width: '8%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.brandName;
                }
            },
            {
                field: 'modelName',
                displayName: 'Modelo',width: '14%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.modelName;
                }
            },
            {field: 'policyNumber',
            displayName: 'Nº Póliza',width: '7%',
            cellTooltip: function (row) {
                if (row.entity != undefined)
                    if(row.entity.policyNumber == undefined && row.entity.policyId != undefined){ return 'Prepóliza'} else {return row.entity.policyNumber;} }
            },
            {
                field: 'creationUser',
                displayName: 'Creado por',width: '9%',
                cellTooltip: function (row) {
                	if (row.entity != undefined)
                        return row.entity.NO_USU_ALTA;
                }
            },
            {
                field: 'creationDate',
                displayName: 'Creado en',
                cellFilter: 'date:\'dd/MM/yyyy\'',
                width: '10%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.FT_USU_ALTA;
                }
            },
            ],
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                vm.gridApi.grid.registerDataChangeCallback(function() {
                    vm.gridApi.treeBase.expandAllRows();
                });

                if(vm.permisos != undefined) {
                    for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
                        switch (vm.gridOptions.columnDefs[i].name) {
                            case ' ':
                            case '  ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
                                break;
                            case '   ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_EXPORTAR;
                                    break;
                            default:
                                break;
                        }
                    }
                }
                vm.parent.translateHeaders(vm.gridOptions);
            }
        }


        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
            return BASE_SRC + "busqueda/busqueda.view/busqueda.fusion.html";
        }

        //Link para ver el detalle viene del Ui-grid  
    	  vm.verDetalle = function (fila, key) {
              vm.llave = {};
              vm.llave = key;
              
  		 	  vm.detallesDispositivo = vm.gridOptions.data.find( data => data.imei == fila.imei);
              vm.cargarDetalle(fila);
          }
            
        //Función para cargar los datos al abrir el tab.
          vm.cargarDetalle = function(fila) {
        	  vm.existe = false;
	          for(var i = 0; i < vm.numDetalles.length; i++){//Mirar si el presupuesto está abierto ya sea resumen, editar o contratar
                  if(fila.imei == vm.numDetalles[i].imei){
	          		  vm.detalles = vm.numDetalles[i];
	          		  vm.existe = true;
	          		  break;
	          	  } else if (vm.nomDetalles[i] == 'nuevo' && vm.numDetalles[i].imei == undefined && fila.imei != undefined) {
	          		  vm.detalles = fila;
	          		  vm.existe = true;
	          		  break;
	          	  }
	          }
	          
              if (!vm.existe) {//Si no está abierto, se abre
              	//Para intercambiar en la misma pestaña
      			if (vm.numDetalles.length > 0) {
      				vm.numDetalles = [];
      				vm.nomDetalles = [];
          			setTimeout( function () { 
  	    				vm.numDetalles.push(fila);
  	    				vm.nomDetalles.push(vm.llave);
  	    				vm.active = vm.numDetalles.length;
      				}, 
          			10);
      			} else {
      				vm.numDetalles.push(fila);
      				vm.nomDetalles.push(vm.llave);
      				vm.active = vm.numDetalles.length;
      			}

                } else {//Si está abierto, se abre el nuevo y se cierra el que estaba abierto, dejando el nuevo en el mismo índice que el cerrado
                    // var index = vm.numDetalles.indexOf(vm.detalles);
                    var index = '';
                    for(var i = 0; i < vm.nomDetalles.length; i++) {
                        if(vm.nomDetalles[i] != 'nuevo') {
                            index = vm.numDetalles.indexOf(vm.detalles);
                        } else {
                            index = i;
                        }
                    }
              	    if (vm.nomDetalles[index]!=vm.llave) {
              		    if (index > -1) {
              			    vm.numDetalles[index] = vm.detalles;
                            vm.nomDetalles[index] = vm.llave;
              		    }
                        vm.active = index + 1;
              	    } else {
              		    vm.active = index + 1;
              	    }
               }		 
          }


        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }
    
        vm.abrirModalImei = function (obj) {
        	vm.objFusion = obj;
        	$mdDialog.show({
				templateUrl: BASE_SRC + 'detalle/detalle.modals/confirmar_fusion.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				fullscreen: false,
				controller: ['$mdDialog', function ($mdDialog) {
					var md = this;
					md.vista = 0;
					md.cargar = false;
		        	md.objFusion = vm.objFusion;
                    md.dialogType = 'imei';
                    if(md.objFusion.imei.includes('TMP-WCD'))
                        md.dialogType = 'iban';
					md.confirmar = function(){

                        if(md.dialogType == 'iban') {

                            if(md.form.iban) {
                                md.cargar = true;
                                PolizaService.confirmPoliza(md.objFusion.policyId, md.form.iban)
                                .then(function successCallback(response){
                                    if(response.status == 200) {
                                        msg.textContent(response.data.DS_RESULT);
                                        $mdDialog.show(msg);
                                        vm.parent.recargarListado();
                                        md.objFusion.processing = true;
                                    }
                                    md.cargar = false;
                                }, function errorCallback(response) {
                                    md.cargar = false;
                                    msg.textContent('Se ha producido un error al confirmar');
                                    $mdDialog.show(msg);
                                });
                            }
                        } else {

                            var objConfirmar = {
                                token: md.objFusion.token,
                                imei: md.form.imei,
                                budgetId: md.objFusion.budgetId
                            }
                            md.cargar = true;
                            MovilService.confirmImei(objConfirmar, 'OK')
                            .then(function successCallback(response){
                                if (response.status == 200) {
                                    msg.textContent(response.data.msg);
                                    $mdDialog.show(msg);
                                    vm.parent.recargarListado();
                                }
                                md.cargar = false;
                            },function(error) {
                                if ((error.status == 400 || error.status == 500) && error.data.error != null && error.data.error.codigoErrorNegocio != null) {
                                    msg.textContent("CODERRROR-" + error.data.error.codigoErrorNegocio + " DESC: " + error.data.error.descripcionErrorNegocio);
                                    $mdDialog.show(msg);
                                } else {
                                    msg.textContent('Se ha producido un error al confirmar');
                                    $mdDialog.show(msg);
                                }
                                md.cargar = false;
                            });
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
    
        vm.abrirModalSuspender = function (obj) {
        	var mensaje = "¿Cancelar prepóliza?";
        	
        	if (obj.policyNumber != null) {
        		mensaje = "¿Cancelar prepóliza " + obj.policyNumber + "?";
        	}
        	
        	var confirm = $mdDialog.confirm()
	          .textContent(mensaje)
	          .ariaLabel('Lucky day')
	          .ok('Aceptar')
	          .cancel('Cancelar');
        	$mdDialog.show(confirm).then(function() {
            	vm.parent.parent.abrirModalcargar(true);
        		PolizaService.confirm('ko', { "token": obj.token }, "cancelReason=CANCELADA")
                .then(function successCallback(response) {
             	   if(response.data.code != 0){
     					if (response.data != null && response.data.error != null && response.data.error.descripcionErrorNegocio != null) {
     						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
         					$mdDialog.show(msg);
     					} else {
         					msg.textContent(response.data.msg);
         					$mdDialog.show(msg);
     					}
     				} else {
     					msg.textContent(response.data.msg);
     					$mdDialog.show(msg).then(function() {
         					vm.parent.recargarListado();
     					}, function() {
         					vm.parent.recargarListado();
     		    	    });
     				}
                }, function callBack(response){
                	if (response.data != null && response.data.error != null && response.data.error.descripcionErrorNegocio != null) {
 						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
     					$mdDialog.show(msg);
 					} else {
     					msg.textContent(response.data.msg);
     					$mdDialog.show(msg);
 					}
                    if(response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
    	    }, function() {
    	    	$mdDialog.cancel();
    	    });
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

    ng.module('App').component('busquedaFusion', Object.create(busquedaFusionComponent));

})(window.angular);