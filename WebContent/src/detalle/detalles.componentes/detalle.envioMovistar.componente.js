(function(ng) {	

	//Crear componente de app
    var detEnvMovistarComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q','$scope', '$location', '$mdDialog',  'uiGridConstants','MovilService',  'BASE_SRC', '$window'],
    		require: {
    			appParent: '^sdApp',
    			busqueda:'^busquedaApp',
    			busquedaMovistar: '^?busquedaEnviomovistar'
            },
            bindings:{
            	detallesDispositivo: '<'
    		}
    }
    
    detEnvMovistarComponent.controller = function detEnvMovistarComponentControler($q, $scope, $location, $mdDialog, uiGridConstants, MovilService,  BASE_SRC, $window){
    	var vm=this;
    	var url=window.location;
    	vm.form = {};
    	vm.isNew = false; 
    	vm.isError = false;
    	var nLoad = 0;
    	vm.disabledEstado = false;
		vm.medida = 0;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.navegador = bowser.name.toLowerCase();
		vm.disabledTxt = true;
		vm.rol = sessionStorage.rol;
		vm.url = window.location.hash;
		vm.prePoliza = "Prepóliza";
		vm.isEmited = "";
		vm.modCodpreCom = false;
		vm.modelNew = {};
		vm.copiado = false;
		vm.isPrepoliza = false;
		vm.checkReacondicionado = false;
		vm.lstDevicesReac = [];
		vm.lstDevicesNew = [];

		var perfil=JSON.parse($window.sessionStorage.perfil);
    	vm.usuario = perfil.usuario;
		
    	this.$onInit = function(bindings) {
    		
			//Cargar permisos
    	vm.permisos = vm.busquedaMovistar.permisos;
    		if(vm.appParent.getPermissions != undefined) {
				if($location.$$path == '/envios_movistar_main') {
                    vm.permisos = { EXISTE: true };
				} 
    		}
    		
    		if(vm.busquedaMovistar.detallesDispositivo != null && vm.busquedaMovistar.detallesDispositivo != undefined){
	    		vm.datos = JSON.parse(JSON.stringify(vm.busquedaMovistar.detallesDispositivo));
	    		vm.datosCopy = JSON.parse(JSON.stringify(vm.datos));
    		}
    		vm.medida = 315;
    			
    		if(vm.datos != null){
    			
    			if (vm.datos.FT_USU_MOD == undefined)
                	vm.datos.FT_USU_MOD = null;
    			
    			angular.forEach(vm.datos, function(values, key){   				
	    			vm.form[key] = {};	            	
	            });
    			
                backupJSON = JSON.stringify(vm.datos);
                
                if(vm.datos.apellido_1 != null && vm.datos.apellido_2 != null)
        			vm.apellidosCliente = vm.datos.apellido_1 + " " + vm.datos.apellido_2;
        		else
        			vm.apellidosCliente = "";
        		
        		if(vm.datos.inEmited != null && vm.datos.inEmited != undefined){
        			if(vm.datos.inEmited == 0) 
        				vm.isEmited = "No";
        			else
        				vm.isEmited = "Si";
        		}

        		if (vm.datos.policyNumber != null && typeof vm.datos.policyNumber == "string" && vm.datos.policyNumber.substr(0,2) == "SM") {
        			vm.isPrepoliza = true;
        		}
    		}else{
    			vm.isNew = true;
    		}

    		vm.nuForm = Object.keys(vm.form).length;
    		
    		MovilService.getDevicesMobile({})
			.then(function successCallback(response) {
				if(response.status == 200){
					vm.lstDevices = [];
					vm.lstBrandsAux = [];
					vm.lstBrands = [];
					
					if(response.data.result.length > 0) {
						vm.lstDevices = response.data.result;

					    for(var i = 0; i < vm.lstDevices.length; i++) {
							var device = {

								'brandId': vm.lstDevices[i].brandId,
								'brandName': vm.lstDevices[i].brandName,
								'codPrecom': vm.lstDevices[i].codPrecom
							}

							if(vm.lstBrandsAux.map(x => x.brandId).indexOf(vm.lstDevices[i].brandId) == -1) {
								vm.lstBrandsAux.push(device);
							}

							if(vm.lstDevices[i].coversWMO !== undefined){
								if(vm.lstDevices[i].coversWMO[0].productCode === 'SRE'){
									vm.lstDevicesReac.push(vm.lstDevices[i])
								}else{
									vm.lstDevicesNew.push(vm.lstDevices[i])
								}
							}

						}
					    vm.lstBrands = _.sortBy( vm.lstBrandsAux, 'brandName' );
					}
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
				}
			});
    	}

    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.envioMovistar.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	
    	//Marcha atras
    	vm.atras = function(){
    		window.history.back();
    	}
    	
    	//Abrir la sección
    	vm.mostrarSeccion = function(id,seccion,id2){
            $(seccion).slideDown();
            $(id).hide();
            $(id2).show();
        }
    	
    	//Cerrar la sección
        vm.ocultarSeccion = function(id,seccion,id2){
            $(seccion).slideUp();
            $(id).hide();
            $(id2).show();
        }
	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key){
    		console.log(fila);
    		if(key == 'cliente'){
    			localStorage.cliente=JSON.stringify(fila);
    			$location.path('/detalle/clientes');
    		}
    		else{
    			localStorage.cliente=JSON.stringify(fila);
    			$location.path('/detalle/cliente');
    		}
    	}

    	 vm.querySearch = function(query, list, key) {
             if (list != undefined) {
                 var results = query ? list.filter(createFilterFor(query, key)) : list,
                     deferred;
                 if (self.simulateQuery) {
                     deferred = $q.defer();
                     $timeout(function () {
                         deferred.resolve(results);
                     }, Math.random() * 1000, false);
                     return deferred.promise;
                 } else {
                     return results;
                 }
             }
         }

		 vm.isReacondicicionado = function() {
			 vm.selBrand = "";
			 vm.selModel = "";
		 }

         function createFilterFor(query, key) {
             var uppercaseQuery = query.toUpperCase();
             return function filterFn(list) {
				if(key != "modelName"){
					return (list[key].indexOf(uppercaseQuery) === 0);
				} else {
					if(list[key]) {
						return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
					}
				}
 			};
 		}
 		
 		vm.getModels = function() {
             if(vm.selBrand != undefined && vm.selBrand != null && vm.selBrand != "") {
 				vm.lstModelsAux = [];
 				vm.lstModels = [];

 				if(vm.checkReacondicionado === true){
					for(var i = 0; i < vm.lstDevicesReac.length; i++) {
						if(vm.selBrand.brandId === vm.lstDevicesReac[i].brandId && vm.lstDevicesReac[i].modelName !== undefined) {
							if(vm.lstModelsAux.map(x => x.modelId).indexOf(vm.lstDevicesReac[i].modelId) === -1) {
								vm.lstModelsAux.push(vm.lstDevicesReac[i]);
							}
						}
					}
				}else{
					for(var n = 0; n < vm.lstDevicesNew.length; n++) {
						if(vm.selBrand.brandId === vm.lstDevicesNew[n].brandId && vm.lstDevicesNew[n].modelName !== undefined) {
							if(vm.lstModelsAux.map(x => x.modelId).indexOf(vm.lstDevicesNew[n].modelId) === -1) {
								vm.lstModelsAux.push(vm.lstDevicesNew[n]);
							}
						}
					}
				}

 			    vm.lstModels = _.sortBy( vm.lstModelsAux, 'modelName' );
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

 		vm.generateToken = function() {
    		if(vm.opOption != undefined && vm.msisdn != undefined && vm.imei != undefined && vm.selModel.codPrecom != undefined){
				var obj = {};
				vm.dateNow = new Date();
	
				if(vm.opOption > 1) {
					obj.opComercial = 'SIM_ONLY';
					if(vm.opOption == 2) {
						vm.dateNow.setDate(vm.dateNow.getDate() - 25);
					}
				} else {
					obj.opComercial = 'ONE_CLICK';
				}
				vm.dateNowStr = vm.formatDate(vm.dateNow, 'YYYY-MM-dd');

				if(vm.model_aprox == true) { mAprox = 1; }else{ mAprox = 0; }
				
				obj.codPrecom = vm.selModel.codPrecom;
				obj.model_aprox = mAprox;
				obj.creationUser = vm.usuario;
				obj.msisdn = vm.msisdn;
				obj.imei = vm.imei;
				obj.feCambioImei = vm.dateNowStr;

				msg.htmlContent(null);
	    		MovilService.generateToken(obj)
	    		.then(function successCallback(response){
	    			if(response.status == 200){
						if(response.data.code == 0) {
							if (response.data.result != null && response.data.result.token != null) {
								msg.htmlContent("Se ha insertado el registro correctamente." + "<br>Token: <b>" + response.data.result.token + "</b><br>Se ha copiado el token a tu portapapeles de forma automática.");
								vm.tokenGenerado = response.data.result.token;
								
				                // Crea un campo de texto "oculto"
								setTimeout(function () {
					                var aux = document.createElement("input");
					                aux.setAttribute("value", vm.tokenGenerado);
					                document.body.appendChild(aux);
					                aux.select();
					                document.execCommand("copy");
					                document.body.removeChild(aux);
								}, 500);
				                
								$mdDialog.show(msg);	
								vm.isNew = false;
								vm.busquedaMovistar.vista = 4
								vm.busquedaMovistar.gridOptions.data = [];
								vm.busquedaMovistar.gridOptions.data.push(response.data.result);
								vm.busquedaMovistar.cerrarTab();
							} 												
						} else {
							msg.textContent(response.data.msg);
							$mdDialog.show(msg);	
						}
	    			}
	    		}, function errorCallback(response){
	    			if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
						msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
	                    $mdDialog.show(msg);
	        	    } else {
		    			msg.textContent('Ha ocurrido un error al generar el token. Contacte con el administrador.');
						$mdDialog.show(msg);
	        	    }
	    		});
	    		
	    	}else{
	    		msg.textContent('Faltan campos por rellenar');
				$mdDialog.show(msg);
	    	}
    	}
 		
 		
 		vm.recuperarPin = function() {
 			 $mdDialog.show({
               templateUrl: BASE_SRC + 'detalle/detalle.modals/accept.reject.modal.html',
               controllerAs: '$ctrl',
               clickOutsideToClose: true,
               parent: angular.element(document.body),
               fullscreen: false,
               controller: ['$mdDialog', function ($mdDialog) {
                   var md = this;
                   msisdn = vm.datos.msisdn;
                   md.msg = "recuperar el Pin de " + vm.datos.imei;
                   md.styleLetter = "height:25px; font-size: 17px;";
                   
                   md.accept = function () {
			    		MovilService.recuperarPin(msisdn)
			    		.then(function successCallback(response){
			    			if(response.status == 200){
			    				if(response.data.code == 0){
									msg.textContent('Se ha recuperado el código Pin correctamente. Pin:'+ response.data.msg);	
									$mdDialog.show(msg);	
									vm.form.msisdn = "";
			    				}else{
			    					msg.textContent(response.data.msg);
									$mdDialog.show(msg);
			    				}
			    			}
			    		}, function errorCallback(response){
			    			if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
								msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
			                    $mdDialog.show(msg);
			        	    } else {
				    			msg.textContent('Ha ocurrido un error al recuperar el codigo Pin. Contacte con el administrador.');
								$mdDialog.show(msg);
			        	    }
			    		});
                   	};
                   		
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
 			 });
    	}
     	
    	vm.cambiarFecha = function() {
    		 $mdDialog.show({
                 templateUrl: BASE_SRC + 'detalle/detalle.modals/accept.reject.modal.html',
                 controllerAs: '$ctrl',
                 clickOutsideToClose: true,
                 parent: angular.element(document.body),
                 fullscreen: false,
                 controller: ['$mdDialog', function ($mdDialog) {
                     var md = this;
                     msisdn = vm.datos.msisdn;
                     imei = vm.datos.imei;
                     md.msg = "cambiar la fecha de contratación de " + vm.datos.imei;
                     md.styleLetter = "height:30px; font-size: 14px;";
                     
                     md.accept = function () {			
						MovilService.cambiarFecha(msisdn,imei)
			    		.then(function successCallback(response){
			    			if(response.status == 200){
								if(response.data.code == 0) {
									msg.textContent('Se ha cambiado la fecha de contratación correctamente.');	
									$mdDialog.show(msg);
								} else {
									msg.textContent(response.data.msg);	
									$mdDialog.show(msg);
								} 				
			    			}
			    		}, function errorCallback(response){
			    			if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
								msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
			                    $mdDialog.show(msg);
			        	    } else {
				    			msg.textContent('Ha ocurrido un error al cambiar la fecha de contratación. Contacte con el administrador.');
								$mdDialog.show(msg);
			        	    }
			    		});  
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
      			 });
    		}

    	vm.getListCodPreCom = function(){
    		vm.codPreModels = [];
    		
    		if(vm.lstBrands != undefined && vm.lstBrands != null){
	    		vm.idBrand = vm.lstBrands.find( data => data.brandName == vm.datos.brandName).brandId;
	    		
	    		for(var i = 0 ; i < vm.lstDevices.length; i++){
	    			if(vm.lstDevices[i].brandId == vm.idBrand)
	    				vm.codPreModels.push(vm.lstDevices[i]);
	    		}
				vm.sortedModels = _.sortBy(vm.codPreModels, 'modelName');
    		}
    	}
    	
    	vm.editCodpreCom = function(){
    		if(vm.modelNew != undefined && vm.modelNew != null){
    			 $mdDialog.show({
                     templateUrl: BASE_SRC + 'detalle/detalle.modals/accept.reject.modal.html',
                     controllerAs: '$ctrl',
                     clickOutsideToClose: true,
                     parent: angular.element(document.body),
                     fullscreen: false,
                     controller: ['$mdDialog', function ($mdDialog) {
                         var md = this;
                         msisdn = vm.datos.msisdn;
                         imei = vm.datos.imei;
                         md.msg = "cambiar el codprecom de " + vm.datos.imei;
                         md.styleLetter = "height:30px; font-size: 14px;";
	                         obj = {
	                        	"token" : vm.datos.token,
	             			 	"codPrecom" : vm.modelNew.codPrecom
	                         }
                         md.accept = function () {			    			    			
			    			MovilService.cambiarCodprecom(obj)
				    		.then(function successCallback(response){
				    			if(response.status == 200){
									if(response.data.code == 0) {
										msg.textContent('Se ha cambiado el CodPreCom correctamente.');	
										$mdDialog.show(msg);								
										vm.show = false;
										//vm.dispAnt = vm.busquedaMovistar.gridOptions.data.find(data => data.imei == vm.datos.imei);
										vm.datos = response.data.result;		
										vm.busquedaMovistar.listBusqueda.push(vm.datos);
										vm.busqueda.recargarListado();
									} else {
										msg.textContent(response.data.msg);	
										$mdDialog.show(msg);
									} 				
				    			}
				    		}, function errorCallback(response){
				    			if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
									msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
				                    $mdDialog.show(msg);
				        	    } else {
					    			msg.textContent('Ha ocurrido un error al cambiar el CodPreCom. Contacte con el administrador.');
									$mdDialog.show(msg);
				        	    }
				    		});  
                        	 
                        	vm.modCodpreCom = false;
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
           			 });
         		}
    	    }
    	
    	vm.getModelNew = function(model){
    		if(model != undefined && model != null)
    			vm.modelNew = model;
    	}
    	
    	vm.copyToken = function(token){
    		  var aux = document.createElement("input");
    		  aux.setAttribute("value", token);
    		  document.body.appendChild(aux);
    		  aux.select();
    		  vm.copiado = true;
    		  document.execCommand("copy");
    		  if(vm.copiado){
	    		  $(document).ready(function() {
	    			    setTimeout(function() {
	    			        $(".divCopiado").fadeOut(1500);
	    			    },1500);
	    		  });
    		  }
    	}
    	
    	vm.sendLinkApp = function () {
    		var obj = {
				token: vm.datos.token,
				msisdn: vm.datos.msisdn
    		}
    		
    		MovilService.sendLinkApp(obj)
    		.then(function successCallback(response){
    			if(response.status == 200){
					if(response.data.code == 0) {
						msg.textContent(response.data.msg);	
						$mdDialog.show(msg);								
					} else {
						msg.textContent(response.data.msg);	
						$mdDialog.show(msg);
					} 				
    			}
    		}, function errorCallback(response){
    			if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
					msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
                    $mdDialog.show(msg);
        	    } else {
        			msg.textContent('Ha ocurrido un error al enviar link. Contacte con el administrador.');
    				$mdDialog.show(msg);
        	    }
    		});  
    	}
    	
    }   
    

    ng.module('App').component('detalleMovistar', Object.create(detEnvMovistarComponent));
    
})(window.angular);


