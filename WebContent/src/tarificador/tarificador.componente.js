(function(ng) {	


	//Crear componente de app
    var tarificadorComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$q', '$location', '$timeout','$mdDialog', '$window', 'TiposService', 'ClienteService', 'DescargaService', 'constantsTipos', 'BASE_SRC', 'AseguradoraService'],
    		require: {
            	parent:'^sdApp',
    		}
    }
    
    
    
    tarificadorComponent.controller = function tarificadorComponentControler($rootScope, $q, $location, $timeout, $mdDialog, $window, TiposService, ClienteService, DescargaService, constantsTipos, BASE_SRC, AseguradoraService) {
		var vm = this;
		vm.isTarMovil = false;
        vm.isTarEmpresa = false;
		
    	this.$onInit = function() {

			var perfil = null;
        	vm.perfil = null;
            vm.mediador = null;
			var idMediador;
			vm.idPrograma;
			vm.dsPrograma;
    		vm.rol = window.sessionStorage.rol;
			vm.programUnq = false;
			// vm.isLogueado = $window.sessionStorage.isLogged == 'logueado' ? 'YES' : 'NO';
			// vm.lang = $window.sessionStorage.lang;
			// vm.url = window.location.origin + window.location.pathname;

			if($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				perfil = JSON.parse($window.sessionStorage.perfil);
				vm.perfil = JSON.parse($window.sessionStorage.perfil);

				if(perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
					vm.mediador = {
						ID_COMPANIA: perfil.adicional.ID_COMPANIA,
						NO_COMPANIA: perfil.adicional.NO_COMPANIA
					}
					idMediador = vm.mediador.ID_COMPANIA;
				}
            }
			vm.checkProgram();
			vm.checkUserProducts();
            var smovilUrl = vm.getUrlParam('smovil', $location.url());
			var empUrl = vm.getUrlParam('emp', $location.url());
			if($location.$$search.tar != undefined && $location.$$search.tar != '') {
				vm.tipoTarificador = $location.$$search.tar;
			}
            
    		//Comprobarsi existe el idPrograma en la url
            if (smovilUrl != null && smovilUrl != "" && smovilUrl == "true") {
            	vm.isTarMovil = true;
            }

			if (empUrl != null && empUrl != "" && empUrl == "true") {
            	vm.isTarEmpresa = true;
            }
		}
		
    	this.$onChanges = function(){
			
    	}
    	
    	this.loadTemplate=function() {
			return "src/tarificador/tarificador.view.html";
			// if(vm.tipoTarificador != undefined) {
			// 	return "src/tarificador/tarificador.view.html";
			// } else {
            //     return "src/error/404.html";
            // }
    	}
    	
    	vm.enviarPresupuestoPDF = function(){
    		if(vm.tarifas!=undefined && datos!=undefined )
    			DescargaService.enviarPresupuestoPDF(vm.tarifas,datos.PRESUPUESTO);
			else {
				msg.textContent("No se dispone de ninguna tarifa para exportar el presupuesto");
				$mdDialog.show(msg);
			}
//    			DescargaService.enviarPresupuestoPDF(vm.detalles.LIST_TARIFAS,vm.detalles);
    	}
    	
    	vm.descargarPresupuesto = function(){
    		if(vm.tarifas!=undefined && datos!=undefined )
    			DescargaService.descargarPresupuesto(vm.tarifas,datos.PRESUPUESTO);
			else {
				msg.textContent("No se dispone de ninguna tarifa para exportar el presupuesto");
				$mdDialog.show(msg);
			}
//    			DescargaService.descargarPresupuesto(vm.detalles.LIST_TARIFAS,vm.detalles);
    	}
    	
    	vm.validarFormulario = function(form){
    		for(var i=0; i<form.length; i++){
    			if(form[i]==true){
					msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
					$mdDialog.show(msg)
        			break;
        		}
    		}
		}


		
		vm.getAge = function(date) { 
            var now = Date.now() - date.getTime();
            var dt = new Date(now); 
            return Math.abs(dt.getUTCFullYear() - 1970);
        }

        vm.getDateLimit = function (person, type) {
            var now = new Date();
            var date;
            if(person == 'adult') {
                if(type == 'max') {
                    date = new Date(
                        now.getFullYear() - 18,
                        now.getMonth(),
                        now.getDate()
                    );
				}
				return date;
            } else {
                if(type == 'min') {
                    date = new Date(
                        now.getFullYear() - 18,
                        now.getMonth(),
                        now.getDate() + 1
                    );
                    
                } else {
                    date = new Date();
				}
				return date;
            }
		}
        
        
        vm.chooseMediator = function(){
        	if(vm.mediador != undefined && vm.mediador.ID_COMPANIA != 4){
        		 vm.navTo('#!/broker?idPrograma=2'); 
        		 vm.parent.dataLayer('portalgestor:{{'+ vm.dsPrograma + '}}:home', vm.dsPrograma);
        		
        	}else if(vm.mediador != undefined && vm.mediador.ID_COMPANIA == 4 && (vm.rol == 1 || vm.rol == 4)){
	        	$mdDialog.show({
	                templateUrl: BASE_SRC+'detalle/detalle.modals/select_mediador.modal.html',
	                controllerAs: '$ctrl',
	                clickOutsideToClose: false,
	                escapeToClose: false,
	                parent: angular.element(document.body),
	                fullscreen:false,
	                controller:['$mdDialog', function($mdDialog){
	                    var md = this;
	                    md.cargarReconectar = false;
	                    md.colectivos = vm.colectivos;
	                    md.idColectivo = null;
	                    md.colectivosHijo = [];
	                    md.productos = JSON.parse(window.sessionStorage.perfil).productos;
	                    
	                    this.$onInit = function() { 
	            			AseguradoraService.getAseguradorasByFilter({IN_COMISIONISTA: true})
		            			.then(function successCallback(response){
		            				if(response.status == 200){
		            					md.mediadores = response.data.ASEGURADORAS;
		            				}
		            			}, function callBack(response){
									if(response.status == 406 || response.status == 401){
										vm.parent.logout();
									}
	            				});
	                	}
	                    
	                    md.confirmarMediador = function () {
	                    	vm.idMediador = md.idMediador;
	                        vm.mediador = md.mediadores.find(x => x.ID_COMPANIA == vm.idMediador);
	                        vm.parent.mediador = vm.mediador;
	                        $mdDialog.hide();
	                        vm.navTo('#!/broker?idPrograma=2'); 
	               		 	vm.parent.dataLayer('portalgestor:{{'+ vm.dsPrograma + '}}:home', vm.dsPrograma);
	                    }
	                    
	                    md.cancel = function() {
	                        $mdDialog.hide();
	                    };
	
	                    md.answer = function(answer) {
	                        $mdDialog.hide(answer);
	                    };
	              
	                }]
	            });
        	}
        }
		
		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}
		
		vm.checkProgram = function (){
			programas = [];
			
			if(vm.parent.userProducts != undefined && vm.parent.userProducts.length > 0) {
				for(var i = 0; i < vm.parent.userProducts.length; i++) {
					if(!programas.find((element) => element == vm.parent.userProducts[i].ID_PROGRAMA))
						programas.push(vm.parent.userProducts[i].ID_PROGRAMA);
				}
				
				if(programas.length == 1)
					vm.programUnq = true;
			}
		}

		vm.checkUserProducts = function() {
			if(vm.parent.userProducts != undefined && vm.parent.userProducts.length > 0) {
				for(var i = 0; i < vm.parent.userProducts.length; i++) {
					switch (vm.parent.userProducts[i].ID_PRODUCTO) {
						case 1:
						case 2:
							//hogar 5
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnSH = true;
							} else {
								vm.showBtnSH = false;
							}
							break;
						case 3:
						case 4:
						case 5:
						case 6:
							//empresas 3
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnCS = true;
								vm.idPrograma = vm.parent.userProducts[i].ID_PROGRAMA;
								vm.dsPrograma = vm.parent.userProducts[i].DS_PROGRAMA;
								if(vm.programUnq)
									vm.openTarEmpresa();
							} else {
								vm.showBtnCS = false;
							}
							break;
						case 7:
							//hijos 2
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnCH = true;
							} else {
								vm.showBtnCH = false;
							}
							break;
						case 8:
							//identidad 4
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnCI = true;
							} else {
								vm.showBtnCI = false;
							}
							break;
						case 10:
						case 11:
						case 12:
							//movil 1
							vm.showBtnSM = true;
							break;
						case 14:
						case 16:
						case 17:
						case 18:
							//Seguro dispositivos
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnSD = true;
							} else {
								vm.showBtnSD = false;
							}
							break;
						case 19:
							//empresas -de
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnCS_de = true;
							} else {
								vm.showBtnCS_de = false;
							}
							break;
						case 28:
							//particulares
							if (vm.mostrarProducto(vm.parent.userProducts[i].ID_PRODUCTO) == true) {
								vm.showBtnCP = true;
							} else {
								vm.showBtnCP = false;
							}
							break;
						default:
							break;
					}
				}
			}
		}

		vm.mostrarProducto = function (id) {
			var mostrar = false;
			
			if (vm.parent.userProducts != null && vm.parent.userProducts.length > 0) {
				for (var i = 0; i < vm.parent.userProducts.length; i++) {
					var producto = vm.parent.userProducts[i];
					if (producto.ID_PRODUCTO == id && producto.IN_TARIFICA == true) {
						mostrar = true;
						break;
					}
				}
			}
			
			return mostrar;
		}
		
		vm.openTarMovil = function () {
			vm.isTarMovil = true;
		}
		
        vm.openTarEmpresa = function () {
            vm.isTarEmpresa = true;
			// vm.parent.dataLayer('portalgestor:'+vm.dsPrograma+':tarificador', vm.dsPrograma);
        }
		
        vm.getUrlParam = function ( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }
	}
    
    ng.module('App').component('sdTarificador', Object.create(tarificadorComponent));
    
    
    
})(window.angular);