(function(ng) {	

	//Crear componente de app
    var movimientoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$window', '$q', '$location', '$mdDialog', '$translate', 'BusquedaService', 'TiposService', 'SiniestroService', 'PolizaService', 'BASE_SRC', 'GarantiaService', '$scope', 'uiGridExporterService', 'uiGridExporterConstants', 'FicherosService', 'constantsTipos'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busquedaSiniestro: '?^busquedaSiniestro'
    		}
    }
    
    movimientoComponent.controller = function movimientoComponentControler($window, $q, $location, $mdDialog, $translate, BusquedaService, TiposService, SiniestroService, PolizaService, BASE_SRC, GarantiaService, $scope, uiGridExporterService, uiGridExporterConstants, FicherosService, constantsTipos){
    	var vm=this;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
        vm.tipos = {};
        vm.tab = 1;
        vm.detallesSiniestro = null;
		vm.cargarSiniestro = false;
        
    	this.$onInit = function() {
    		
			vm.datos = vm.parent.datos;
			vm.permisos = null;
    		vm.rol = window.sessionStorage.rol;
			
			if (vm.busquedaSiniestro != null) {
				vm.permisos = vm.busquedaSiniestro.permisos;
			}
			
			TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPO_MOV})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				vm.tipos.movEcon = response.data.TIPOS.TIPO;
    			}
    		});
			
			TiposService.getTipos({ "ID_CODIGO": constantsTipos.FORMA_PAGO_SINIESTRO })
            .then(function successCallback(response) {
                if (response.status == 200) {
                	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                		vm.tipos.formaPagoList = response.data.TIPOS.TIPO;
                	}
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
	        
	        TiposService.getTipos({ "ID_CODIGO": constantsTipos.ESTADO_PAGO_SINIESTRO })
            .then(function successCallback(response) {
                if (response.status == 200) {
                	if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                		vm.tipos.estadoPagoList = response.data.TIPOS.TIPO;
                	}
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
		}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.movimiento.html";
    	}
		
		vm.openSiniestro = function () {
			if (vm.detallesSiniestro == null && vm.datos.ID_SINIESTRO != null) {
				vm.cargarSiniestro = true;
				SiniestroService.getDetalleSiniestro({ ID_SINIESTRO: vm.datos.ID_SINIESTRO })
                .then(function successCallback(response) {
                	if (response.data != null && response.data.SINIESTROS != null && response.data.SINIESTROS.SINIESTRO != null && response.data.SINIESTROS.SINIESTRO.length > 0) {
                        vm.detallesSiniestro = response.data.SINIESTROS.SINIESTRO[0];
                	} else {
                		vm.tab = 1;
                		msg.textContent("Ha ocurrido un error al recuperar el siniestro");
						$mdDialog.show(msg);
                	}
    				vm.cargarSiniestro = false;
                }, function errorCallBack(response) {
    				vm.cargarSiniestro = false;
            		vm.tab = 1;
            		msg.textContent("Ha ocurrido un error al recuperar el siniestro");
					$mdDialog.show(msg);
                });
			}
		}
    	
		vm.formatDate = function(date, format){
        	if(date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())){
        		date = new Date(date);
        		var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();
				
        		if(month.toString().length == 1){
        			month = "0" + month;
        		}
        		if(day.toString().length == 1){
        			day = "0" + day;
				}
				
        		if(format == 'DMY') {
					return day + "/" + month + "/" + year;
				} else {
					return year + "-" + month + "-" + day;
				}
        	}
        }

		vm.formatDecimal = function (number) {
			if (number != null && number != 0 && number != "") {
				//Si tiene decimales, redondear a 2
				if (number % 1 != 0) {
			         number = number.toFixed(2)
			    }
			}
			
			return number;
		}

		vm.beautifyImporte = function (x) {
			if (typeof x === "string") {
	            if (isNaN(parseFloat(x)) === false) {
	                x = x.replace(",", ".");
	            }
	        }

	        if (x == undefined || x == '' || isNaN(x) === true) {
	            x = 0;
	        }

	        if (typeof x === 'string') {
	            x = parseFloat(x);
	        }
	        x = x.toFixed(2);

	        var parts = x.toString().split(".");
	        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	        return parts.join(",");
		}
		
		vm.descargarArchivo = function (archivo) {
    		vm.appParent.abrirModalcargar(true);
    		FicherosService.download(archivo.ID_ARCHIVO)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data != null){
						saveAs(new Blob([response.data]), archivo.NO_ARCHIVO);
						msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
						$mdDialog.show(msg);
					}else{
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response) {
					if(response.status == 500){
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
			});
		}
    }   
    
    
    ng.module('App').component('movimientoSd', Object.create(movimientoComponent));
    
})(window.angular);
