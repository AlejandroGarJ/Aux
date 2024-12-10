(function () {
    'use strict';

    angular
        .module('App')
        .factory('DescargaService', DescargaService);

    //Es un servicio de busqueda como hacer las consultas.
    DescargaService.$inject = ['$http', '$rootScope', 'BASE_CON','BASE_SRC','PresupuestoService', 'PolizaService', '$mdDialog', 'EmpresaService'];
    function DescargaService($http, $rootScope, BASE_CON, BASE_SRC, PresupuestoService,PolizaService,$mdDialog, EmpresaService) {
    	var vm = this;
        var service = {};
        service.enviarPresupuestoPDF = enviarPresupuestoPDF;
        service.descargarPresupuesto = descargarPresupuesto;
        service.descargarArchivo = descargarArchivo;
        service.exportarExcel = exportarExcel;
		service.abrirDialogo = abrirDialogo;
		service.getCondiciones = getCondiciones;
		service.sendCondiciones = sendCondiciones;
        return service;     
       
        
        function enviarPresupuestoPDF(tarifas,datos) {
			var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        	if(tarifas!=null && tarifas!=undefined && tarifas.length>0){
				vm.cargar = true;
        		if(datos.OCLIENTE.NO_NOMBRE==undefined && datos.OCLIENTE.NO_APELLIDO1==undefined && datos.OCLIENTE.NO_APELLIDO2==undefined){
        			var arrayNombre = (datos.OCLIENTE.NO_NOMBRE_COMPLETO).split(" ");
        			datos.OCLIENTE.NO_NOMBRE = arrayNombre[0];
        			datos.OCLIENTE.NO_APELLIDO1 = arrayNombre[1];
        			datos.OCLIENTE.NO_APELLIDO2 = arrayNombre[2];
        		}

        		abrirModalcargar();
    			PresupuestoService.enviarPresupuestoPDF(datos)
            	.then(function successCallback(response){
            		if(response.status==200){
            			datos = response.data;
                		vm.cargar = false;
                		abrirModalcargar();
                		if (datos.OCLIENTE.NO_EMAIL != undefined) {
							msg.textContent('Presupuesto enviado a "' + datos.OCLIENTE.NO_EMAIL + '" correctamente');
                    		$mdDialog.show(msg);
                		} else {
							msg.textContent('Compruebe la dirección de email para enviar el presupuesto');
                    		$mdDialog.show(msg);
                		}
            		}else{
						msg.textContent('Se ha producido un error al descargar el presupuesto');
						$mdDialog.show(msg);
            		}
         		},function(error) {
					msg.textContent('Se ha producido un error al descargar el presupuesto');
					$mdDialog.show(msg);
         			vm.cargar = false;
         			abrirModalcargar();
                });
    		}else{
				msg.textContent('No se dispone de ninguna tarifa para generar el presupuesto');
				$mdDialog.show(msg);
    		}
        }
        
        function descargarPresupuesto(tarifas,datos){
			var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        	if(tarifas!=null && tarifas!=undefined && tarifas.length>0){
        		vm.cargar = true;
        		if(datos.OCLIENTE.NO_NOMBRE==undefined && datos.OCLIENTE.NO_APELLIDO1==undefined && datos.OCLIENTE.NO_APELLIDO2==undefined){
        			var arrayNombre = (datos.OCLIENTE.NO_NOMBRE_COMPLETO).split(" ");
        			datos.OCLIENTE.NO_NOMBRE = arrayNombre[0];
        			datos.OCLIENTE.NO_APELLIDO1 = arrayNombre[1];
        			datos.OCLIENTE.NO_APELLIDO2 = arrayNombre[2];
        		}
        		abrirModalcargar();
    			PresupuestoService.descargarPresupuesto(datos)
            	.then(function successCallback(response){
            		if(response.status==200){
	            		if(response.data.ID_RESULT != 0) {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						} else {
							if(response.data.NO_NOMBRE != undefined && response.data.NO_FORMATO != undefined && response.data.FILE != undefined) {
								// descargarArchivo(response.data.NO_NOMBRE, response.data.NO_FORMATO, response.data.FILE);
								var i8a = new Uint8Array(response.data.FILE)
								saveAs(new Blob([i8a], {type: 'application/pdf'}), response.data.NO_NOMBRE + '.' + response.data.NO_FORMATO);
							}
						}
	            		vm.cargar = false;
	            		abrirModalcargar();
            		}else{
						msg.textContent('Se ha producido un error al descargar el presupuesto');
						$mdDialog.show(msg);
            		}
         		},function(error) {
					msg.textContent('Se ha producido un error al descargar el presupuesto');
					$mdDialog.show(msg);
         			vm.cargar = false;
         			abrirModalcargar();
                });
    		}else{
				msg.textContent('No se dispone de ninguna tarifa para exportar el presupuesto');
				$mdDialog.show(msg);
    		}
		}
		
		function getCondiciones(tomador, valor, nuPoliza){
			var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
			vm.nuPoliza = nuPoliza;
        	if(tomador!=null && tomador!=undefined ){
        		vm.cargar = true;
				abrirModalcargar();
    			PolizaService.getCondicionesPol(valor)
            	.then(function successCallback(response){
            		if(response.status==200){
						let utf8decoder = new TextDecoder();
                        var mensajeUArchivo = utf8decoder.decode(response.data);
                        
                        if(mensajeUArchivo.search('ID_RESULT') != -1) {
                        	var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                        	if(objtMensajeUArchivo.ID_RESULT != 0 && objtMensajeUArchivo.ID_RESULT != 16) {
                        		vm.cargando = false;
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
							} else if (objtMensajeUArchivo.ID_RESULT == 16) {
                        		vm.cargando = false;
								$mdDialog.show({
					                templateUrl: BASE_SRC + 'detalle/detalle.modals/descarga-ebroker.modal.html',
					                controllerAs: '$ctrl',
					                clickOutsideToClose: false,
					                parent: angular.element(document.body),
					                fullscreen: false,
					                controller: ['$mdDialog', function ($mdDialog) {
					                    var md = this;
					                    md.objEbroker = {};

					                    md.$onInit = function() {

					                    }
					                    
					                    md.changeCoPostalCorreduria = function () {
					                    	if(md.objEbroker != null && md.objEbroker.cpCorreduria != undefined && md.objEbroker.cpCorreduria.length == 5) {

					                            EmpresaService.cities(md.objEbroker.cpCorreduria)
					                            .then(function successCallback(response) {
					                                if (response.status == 200) {
					                                    if(response.data != undefined && response.data.LOCALIDAD != undefined) {
					                                    	md.objEbroker.poblacionCorreduria = response.data.LOCALIDAD[0].NO_LOCALIDAD;
					                                    	md.objEbroker.provinciaCorreduria = response.data.LOCALIDAD[0].NO_PROVINCIA;
					                                    }
					                                }
					                            }, function callBack(response) {
					                            });
					                        }
					                    }
					                    
					                    md.descargar = function () {
					                    	if(md.formEbroker.$valid) {
					                    		if (md.objEbroker != null) {
					                    			md.objEbroker.razonSocialCorreduria = md.objEbroker.nombreCorreduria;
					                    			md.objEbroker.logos = [];
					                    			md.objEbroker.numPoliza = vm.nuPoliza;
					                        		md.cargarEbroker = true;
					                        		PolizaService.documentacionEbrokerBlob(md.objEbroker)
					                                .then(function successCallback(response) {
					                                    if (response.status == 200) {
					                                    	vm.cargar = false;
					            							saveAs(new Blob([response.data]), 'Condiciones_Particulares.pdf'); 
					                                    }
					                                    md.cancel();
						                        		md.cargarEbroker = false;
					                                }, function callBack(response) {
							            				msg.textContent('Ha ocurrido un error al descargar el condicionado de la póliza, vuelve a intentarlo más tarde.').multiple(true);
							            				$mdDialog.show(msg);
						                        		md.cargarEbroker = false;
					                                });
					                        	}
					                        } else {
					            				msg.textContent('Rellena los datos del formulario correctamente.').multiple(true);
					            				$mdDialog.show(msg);
					                            objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
					                            if(objFocus != undefined) {
					                                objFocus.focus();
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
						} else {
							vm.cargar = false;
							saveAs(new Blob([response.data]), 'Condiciones_Particulares.pdf');
							abrirModalcargar();
						}
            		}else{
						msg.textContent('Se ha producido un error al descargar las condiciones');
						$mdDialog.show(msg);
            		}
         		},function(error) {
					msg.textContent('Se ha producido un error al descargar las condiciones');
					$mdDialog.show(msg);
         			vm.cargar = false;
         			abrirModalcargar();
                });
    		}else{
				msg.textContent('No se dispone de ninguna información para exportar las condiciones');
				$mdDialog.show(msg);
    		}
		}

		function sendCondiciones(tomador, valor, email){
			var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        	if(tomador!=null && tomador!=undefined ){
				vm.cargar = true;
        		abrirModalcargar();
    			PolizaService.sendCondiciones(valor, email)
            	.then(function successCallback(response){
            		if(response.status==200){
						if(response.data.ID_RESULT != 0){
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						} else {
							msg.textContent('Condiciones enviadas correctamente');
                    		$mdDialog.show(msg);
						}
                		vm.cargar = false;
            		}else{
						msg.textContent('Se ha producido un error al descargar las condiciones');
						$mdDialog.show(msg);
            		}
         		},function(error) {
					msg.textContent('Se ha producido un error al descargar las condiciones');
					$mdDialog.show(msg);
         			vm.cargar = false;
         			abrirModalcargar();
                });
    		}else{
				msg.textContent('No se dispone de ninguna información para generar las condiciones');
				$mdDialog.show(msg);
    		}
		}
        
        function exportarExcel(form) {
			var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        	PresupuestoService.enviarPresupuestoPDF(form)
        	.then(function successCallback(response){
        		var datos = response.data;
     		},function(error) {
				msg.textContent('Se ha producido un error al exportar');
				$mdDialog.show(msg);
            });
        }
        
        function descargarArchivo(nombreFichero, formato, file){
        	const linkSource = "data:application/"+formato+";base64,"+file;
    	    const downloadLink = document.createElement("a");
    	    const fileName = nombreFichero;

    	    downloadLink.href = linkSource;
    	    downloadLink.download = fileName;
    	    downloadLink.click();
		}
        
        function abrirDialogo(msg){
        	$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/accept.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;

    		    	md.msg = msg;
    				
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
    		});
    	}
        
        function abrirModalcargar(){
        	if(vm.cargar){
	        	$mdDialog.show({
	    			templateUrl: BASE_SRC+'detalle/detalle.modals/cargar.modal.html',
	    			controllerAs: '$ctrl',
	    			clickOutsideToClose:true,
	    			parent: angular.element(document.body),
	    		    //targetEvent: ev,
	    		    fullscreen:false,
	    		    controller:['$mdDialog', function($mdDialog){
	    		    	var md = this;
	    		    	md.vm = vm;
	    		    	md.vm.cargarModal = vm.cargar;
	    		    	
	    		    	if(vm.cargar==false){
	    		    		$mdDialog.hide();
	    		    		$mdDialog.cancel();
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
	    		});
        	}else{
        		$mdDialog.hide();
        		$mdDialog.cancel();
        	}
    	}
    };
    
})();