(function (ng) {

    //Crear componente de busqueda
    var busquedaComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$location', '$window', '$mdDialog', '$routeParams', 'PolizaService', 'ClienteService', 'DescargaService', 'BASE_SRC', 'MovilService', 'DispositivosService'],
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

    busquedaComponent.controller = function busquedaComponentController($location, $window, $mdDialog, $routeParams, PolizaService, ClienteService, DescargaService, BASE_SRC, MovilService, DispositivosService) {
        var vm = this;
        var json = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
        vm.callGetDetail = false;
        vm.listadoActualizado  = false;

        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active = 0;
            vm.vista = 1;
            
            //Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
                vm.permisos = vm.parent.parent.getPermissions('firma_digital');
    		}
    		
            //Cargar las listas
            if (/firma_digital/.test(url)) {
                if (localStorage.polizas != undefined && localStorage.polizas != "") {
                    vm.gridOptions.data = JSON.parse(localStorage.polizas);
                    vm.vista = 4;
                }
                else {
                    localStorage.clear();
                }
            }

        }

        //Reaccionar los cambios por los componentes
        this.$onChanges = function () {
            vm.vista = vm.view;
        
        if (vm.gridOptions.data == undefined || vm.gridOptions.data == null || Object.keys(vm.gridOptions.data).length == 0|| /firma_digital/.test(url)) {
            if (vm.view == 4 && vm.listBusqueda.tipo == "firma_digital") {
                vm.gridOptions.data = vm.listBusqueda.listas;
                vm.active = 0;
            }
            
            
            if (/firma_digital/.test(url)) {
                vm.gridOptions.data = vm.listBusqueda;
                vm.active = 0;
            }
            
            if(vm.listBusqueda != undefined && vm.listBusqueda.listas != undefined){
            	vm.gridOptions.data = vm.listBusqueda.listas;
            }               
            
        }else {
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
                    field: 'menu',
                    displayName: '',
                    width: "8%",
                    cellTemplate: '<div class="ui-grid-cell-contents menuTableContainer" ng-if="row.entity.NU_POLIZA != null" style="margin-top:6px;"> <a style:"color: #0066ff ;"><span style="font-size:10px; letter-spacing: 1.2px;" ng-click="grid.appScope.$ctrl.changePhone(row.entity)">INICIAR FIRMADO</span></a></div>',
                },
                {
                    field: 'NU_POLIZA',
                    displayName: 'Poliza',
                    cellTooltip: function (row) { return row.entity.NU_POLIZA },
                },
                {
                    field: 'FD_EMISION',
                    displayName: 'Fecha de Emisión',
                    cellTooltip: function (row) { return row.entity.FD_EMISION },
                    cellFilter: 'date:\'dd/MM/yyyy\'',
                },
                {
                    field: 'ID_SITUAPOLIZA',
                    displayName: 'Estado',
                    cellTooltip: function (row) { return row.entity.ID_SITUAPOLIZA },
                    cellTemplate: '<div ng-if="row.entity.ID_POLIZA != undefined" class="ui-grid-cell-contents">{{row.entity.DS_SITUAPOLIZA}}</div>',
                    cellClass: 'filaAmarillaClaro',
                },
                {
                    field: 'pagador.NU_DOCUMENTO',
                    displayName: 'NIF',
                    cellTooltip: function (row) { return row.entity.pagador.NU_DOCUMENTO },
                },
                {
                    field: 'tomador.NO_NOMBRE_COMPLETO',
                    displayName: 'Tomador',
                    cellTooltip: function (row) { 
                    	if(row.entity.pagador != undefined){
                    		return row.entity.pagador.NO_NOMBRE_COMPLETO;
                    	}else {
                    		return 'No disponible';
                    	}
                	},
                },
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
                vm.parent.translateHeaders(vm.gridOptions);    
            }
        }

        //Cargar la plantilla de busqueda
        this.loadTemplate = function () {
        	if(vm.permisos != undefined && vm.permisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view/busqueda.firmaDigital.html";
            } else {
                return "src/error/404.html";
            }
        }

        this.resetErrors = function (id) {
            vm.form[id].$error = {};
        }
        
        vm.changePhone = function(poliza){
        	$mdDialog.show({
                templateUrl: BASE_SRC+'detalle/detalle.modals/confirm.phone.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                    var md = this;
                    md.telefono = poliza.tomador.NU_TELEFONO1;
                    md.error = "No has introducido un teléfono móvil válido. Por favor, corrígelo.";
                    const regex = /(6|7)([0-9]){8}/;
                    md.errorResult = false;
                    md.resendPin = false;
                    md.title = "ENVÍO DE PIN";
                    md.button = "ENVIAR PIN";
                    md.action = "enviar";

                    md.checkMobilePhoneNumber = function(telefono) {                      
                        if(telefono.substr(0, 1).match(/[6-7]/) == null || !regex.test(telefono) || telefono.length != 9){                        	
                        	md.errorResult = true;
                    	}else{
                        	md.errorResult = false;
                    	}
                    }
                    
                    md.confirmPhone = function(){                    	
                        vm.reenviando = false;
                        telefonoMod = md.telefono;
                        
                  	  $mdDialog.show({
                            templateUrl: BASE_SRC + 'detalle/detalle.modals/reenviar_firma.modal.html',
                            controllerAs: '$ctrl',
                            clickOutsideToClose: true,
                            parent: angular.element(document.body),
                            fullscreen: false,
                            controller: ['$mdDialog', function ($mdDialog) {
                                var md = this;
                            	  md.rol = window.sessionStorage.rol;
                            	  md.datos = poliza;
                            	  md.reenviando = vm.reenviando;
                            	  md.reenviando = true;
                            	  md.signatureFailed = true;
                            	  md.confirmando = false;
                            	  md.reenviandoCode = false;
                            	  md.pinCodeEnviado = false;
                            	  md.resendPin = true;
                            	  
                                  md.datos.LST_ASEGURADOS[0].NU_TELEFONO1 = telefonoMod;
                            	
                            	DispositivosService.resendSign(md.datos, md.rol, false)
                    				.then(function successCallback(response) {
                    					if (response.status === 200) {
                    						if(response.data != null && response.data.ID_RESULT == 0){
                    					        md.reenviando = false;      					     	
                    					     	md.signatureFailed = false;
                    					        md.pinCodeEnviado = true;
                    					        vm.parent.buscar(vm.parent.form, 'firma_digital')
                    					     	      					     	
                    						}else{
                    							msg.textContent(response.data.DS_RESULT);
                    							$mdDialog.show(msg);
                    						}
                    				}}, function errorCallback(response) {
                    	                msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
                    	                $mdDialog.show(msg);
                    	                md.reenviando = false;
                    				});
                            	
                            	
                            	md.validatePinCode = function(){
	              		        	md.confirmando = true;
	              		        	md.pinCodeEnviado = false;
	              		        	md.errorResult = false;
	              		        	
	              		        	if(md.pinCode != undefined && md.pinCode.length == 6){
	              		        		json = { "pincode" : md.pinCode };
	              		        		
	              			        	DispositivosService.validatePinCode(json, md.datos.NU_POLIZA)
	              							.then(function successCallback(response) {
	              								if (response.status === 200) {
	              									 md.confirmando = false;
	              									if(response.data.ID_RESULT != undefined){	 
		              									if(response.data.ID_RESULT == 0){	
		              								        vm.parent.buscar(vm.parent.form, 'firma_digital')
		              								        md.firmaDigital = false;
		              								        $mdDialog.cancel();
		              								        
		              								        msg.textContent(response.data.DS_RESULT);
		              						                $mdDialog.show(msg);
		
		              									}else{
		              										if(response.data.ID_RESULT != '4224')
		              											md.resendPin = false;
	
		              										md.errorResult = true;
		              										md.error = response.data.DS_RESULT;
		              									}
	              									}else{
	              										msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
	    	              				                $mdDialog.show(msg);
	    	              				                md.confirmando = false;	
	              									}
	              							}}, function errorCallback(response) {
	              				                msg.textContent('Se ha producido un error al registrar la solicitud. Vuelva a intentarlo más tarde.');
	              				                $mdDialog.show(msg);
	              				                md.confirmando = false;						
	              							});
	              		        	}else{
	              		                md.errorResult = true;
	              						md.error = 'Introduce un PINCODE de 6 dígitos.';
	              		                md.confirmando = false;
	              		        	}
                            	}

                            md.cancel = function () {
                               $mdDialog.cancel();
                            }

                         }]
                     });  
                    }

                    md.cancel = function() {
                        $mdDialog.cancel();
                    };            
                }]
            });        	        	
        }


    }
    ng.module('App').component('busquedaFirmaDigital', Object.create(busquedaComponent));
})(window.angular);