(function(ng) {	


	//Crear componente de app
    var appComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:[ '$window', '$scope','$location', '$rootScope', '$translate', 'AuthenticationService', 'BusquedaService',
				'TiposService', '$mdDialog', 'BASE_SRC', 'FicherosService', 'UsuarioWSService', '$cookies', '$mdToast'],
    		/*require:{
            	child:'^sdLogin'
            }*/
    }
    
    
    
    appComponent.controller = function appComponentControler($window, $scope, $location, $rootScope, $translate, AuthenticationService, BusquedaService,
		TiposService, $mdDialog, BASE_SRC, FicherosService, UsuarioWSService, $cookies, $mdToast) {
    	
		var vm=this;
        vm.numShowReconectar = 0;
    	vm.listServices = {};
		var url = $location.url();
		vm.medidaEdicion = 7;
		vm.listArchivos = [];
		vm.archives = [];
		vm.errorAuth = false;
		vm.isDlgOpen = false;
		vm.isAlemania = false;
		vm.firstStep = false;
		vm.codeResponse = "";
		vm.access = 'validate';
		vm.mediador = {};

		vm.versionPackage = $cookies.get('appVersion');

		vm.lang = $window.navigator.language.slice(0, 2);
		if($window.sessionStorage.lang != undefined) {
			vm.lang = $window.sessionStorage.lang;
			$rootScope.lang = $window.sessionStorage.lang;
			$translate.use($window.sessionStorage.lang);
		}
		
		this.$onInit = function() {
            var auth = vm.getUrlParam('access_token', $location.url());
            var auth2 = vm.getUrlParam('validate', $location.url());
			if(auth2 != undefined && auth2 != null && auth2 != '') {
				auth = auth2;
			}
			if (($window.sessionStorage.isLogged == null || $window.sessionStorage.isLogged == 'noLogueado') && auth != null && auth != "") {
				vm.cargandoAuth = true;
				auth = auth.replace(/%20/g, '+')
				auth = decodeURIComponent(auth);
				if(vm.getUrlParam('access_token', $location.url())){
					vm.access = 'access_token';
					vm.validateMovistar(auth);
				}else if(vm.getUrlParam('validate', $location.url())){
					vm.validateToken(auth);
				}
			}/*else if ($window != null && $window.sessionStorage != null && $window.sessionStorage.rol != null && ($window.sessionStorage.rol == 2 || $window.sessionStorage.rol == 3 || $window.sessionStorage.rol == 11)) {
				var menus = this.getMenus();
				var menuListados = menus.find(x => x.ID_MENU == 400);
	
				if (menuListados != null) {
					vm.menuGestor = menuListados;
				}
			}*/
			TiposService.getTipos({ "CO_TIPO": "ROLES_ADMIN" })
			.then(function successCallback(response) {
				if (response.status == 200) {
					if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
						vm.rolesAdmin = response.data.TIPOS.TIPO[0].DS_TIPOS.split(';');
					}
				}
			}, function callBack(response) {
				if (response.status == 406 || response.status == 401) {
					vm.parent.logout();
				}
			});
			vm.checkIsAlemania();
		}
		
        vm.getUrlParam = function ( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }
		
		var msg = $mdDialog.alert({
			onRemoving: function() {
				if($window.sessionStorage.rfrsh == 'f5') {
					$window.sessionStorage.rfrsh = undefined;
//					window.location.reload();
				}
			}
		}) .clickOutsideToClose(false) .escapeToClose(false) .ok('Aceptar');
    	
    	if($window.sessionStorage.isLogged != null && $window.sessionStorage.isLogged != 'noLogueado'){
    		vm.isLogged = $window.sessionStorage.isLogged;
			vm.menus = JSON.parse($window.sessionStorage.perfil).menus;
			
			/* Mostrar num de solicitudes pendientes en el menu?¿ */
//			BusquedaService.buscar({'CO_USU_RECEPTOR': JSON.parse($window.sessionStorage.perfil).usuario}, 'missolicitud')
//			.then(function successCallback(response) {
//				if (response.status === 200) {
//					if(response.data.NUMERO_SOLICITUDES > 0) {
//						for (var i = 0; i < vm.menus.length; i++) {
//							if(vm.menus[i].ID_MENU == 500) {
//								for (var ii = 0; ii < vm.menus[i].SUBMENUS.SUBMENU.length; ii++) {
//									if(vm.menus[i].SUBMENUS.SUBMENU[ii].ID_MENU == 520) {
//										vm.menus[i].SUBMENUS.SUBMENU[ii].NO_MENU = vm.menus[i].SUBMENUS.SUBMENU[ii].NO_MENU + ' (' + response.data.NUMERO_SOLICITUDES + ')';
//									}
//								}
//							}
//						}
//					}
//				}
//			}, function errorCallback(response) {
//			});

			vm.userProducts = JSON.parse($window.sessionStorage.perfil).productos;
    	}
    	
    	this.perfil = $window.sessionStorage.perfil;
    	vm.credential = null;
    	
    	this.loadTemplate=function(){
    		if (vm.isLogged == "logueado") {
        		vm.medidaEdicion = 147;
				// vm.medidaEdicion = 123;
    		} else {
        		// vm.medidaEdicion = 7;
        		vm.medidaEdicion = 0;
    		}
    		
    		return "app.html";
    	}
    	
    	this.checkLogin = function() {
    		return this.isLogged;
    	}
    	
    	this.getMenus = function(){
    		return this.menus;
    	}
    	
        this.logout = function(bool) {
            
            if(bool == true){
            	vm.firstStep = false;
                vm.numShowReconectar = 0;
                // if($window.sessionStorage.perfil != undefined && $window.sessionStorage.perfil != 'undefined') {
                //     msg.textContent("La sesión de usuario ha finalizado");
                //     $mdDialog.show(msg);
                // }
                $window.sessionStorage.isLogged='noLogueado';
                $window.sessionStorage.perfil = undefined;
                $window.sessionStorage.rol = undefined;
				delete $window.sessionStorage.lang;
                localStorage.clear();
                vm.isLogged='noLogueado';
                AuthenticationService.ClearCredentials();
                $location.path('/');
                // if($window.sessionStorage.rfrsh == 'f5') {
                //     $window.sessionStorage.rfrsh = undefined;
                //     window.location.reload();
                // }
            } else {
                vm.numShowReconectar++;

				// TiposService.getTipos( {ID_TIPO: 22, CO_TIPO: 'VERSION'} ).then(function (response) {
				// 	if(response.status == 200 && response.data.ID_RESULT == 0) {
				// 		if(response.data.TIPOS.TIPO.length > 0) {
				// 			for(let i = 0; i < response.data.TIPOS.TIPO.length; i++) {
				// 				vm.versionAppDb = response.data.TIPOS.TIPO[i].DS_TIPOS;
				// 			}
				// 		}
				// 	}
				// });
                
                if(vm.numShowReconectar <= 1){
                    $mdDialog.show({
                        templateUrl: BASE_SRC+'detalle/detalle.modals/reconectar.modal.html',
                        controllerAs: '$ctrl',
                        clickOutsideToClose: false,
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        fullscreen:false,
                        controller:['$mdDialog', function($mdDialog){
                            var md = this;
                            md.cargarReconectar = false;
							md.is2fa = ($window.sessionStorage.is2fa === "true");
                            
                            md.reconectar = function(){
                                md.cargarReconectar = true;
                                AuthenticationService.login(JSON.parse(sessionStorage.getItem('perfil')).usuario, md.PASS_RECONECTAR)
                                .then(function successCallback(response){
                                    if(response.status == 200){
                                        if(response.data.ID_RESULT == 0){
                                            AuthenticationService.SetCredentials(JSON.parse(sessionStorage.getItem('perfil')).usuario, response.data.USUARIO.NO_TOKEN, response.data.USUARIO.CO_TOKEN, response.data.USUARIO.ID_GRUPO_ROL);
                                            vm.credential = {
                                                status: 200,
                                                usuario: response.data.USUARIO.NO_USUARIO,
                                                nombreCompleto: response.data.USUARIO.NO_NOMBRE+" "+response.data.USUARIO.NO_APELLIDOS,
                                                menus: response.data.USUARIO.MENUS.MENU
                                            };
                                            
                                            $window.sessionStorage.perfil=JSON.stringify({
                                                usuario: response.data.USUARIO.NO_USUARIO,    
                                                nombreCompleto: response.data.USUARIO.NO_NOMBRE+" "+response.data.USUARIO.NO_APELLIDOS,
                                                colectivos: response.data.USUARIO.COLECTIVOS,
                                                menus: response.data.USUARIO.MENUS.MENU,
												token: response.data.USUARIO.NO_TOKEN,
												productos: response.data.USUARIO.PRODUCTOS,
												adicional: response.data.USUARIO.ADICIONAL
                                            });
											$window.sessionStorage.lang = vm.lang;
                                            
                                            vm.menu = response.data.USUARIO.MENUS.MENU;
                                            //$window.location.reload();
                                            vm.numShowReconectar = 0;
                                            md.hide();
                                        } else {
                                            md.desconectar();
                                        }
                                    }
                                    md.cargarReconectar = false;
									if(vm.versionPackage && vm.versionPackage != $cookies.get('appVersion')) {
										$cookies.put('appVersion', vm.versionPackage);
										$window.location.reload(true);
									}
                                }, function callBack(response){
                                    if(response.status == 406 || response.status == 401){
                                        md.cargarReconectar = false;
                                        vm.logout(true);
                                    }
                                });
                            }
                                
                                
                            md.desconectar = function(){
                                vm.numShowReconectar = 0;
                                $mdDialog.hide();
                                vm.logout(true);
                            }
                            
                            md.$onChanges = function(){
                                
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
                }
            }
        }
    	
    	this.getCredentials = function() {
    		return this.credential;
    	}
    	
    	this.getPerfil = function() {
    		return this.perfil;
    	}
    	
    	this.getPermissions = function(token){
    		var menu = [];
    		if(vm.menus != undefined){
    			menu = vm.menus;
    		}else if(vm.menu != undefined){
    			menu = vm.menu;
    		}
    		var stop = false;
    		var permisos = {
				IN_ESCRITURA: false,
				IN_BORRADO: false,
				IN_EXPORTAR: false,
				NO_MENU: "",
				EXISTE: false
    		}
    		
    		for(var i = 0; i < menu.length; i++){
    			if(stop === true){
    				break;
    			}
    			if(stop === false){
        			var firstMenu = menu[i];
        			if(firstMenu.NO_TOKEN === token){
        				permisos.IN_ESCRITURA = firstMenu.IN_ESCRITURA;
						permisos.IN_BORRADO = firstMenu.IN_BORRADO;
						permisos.IN_EXPORTAR = firstMenu.IN_EXPORTAR;
        				permisos.NO_MENU = firstMenu.NO_MENU;
        				permisos.EXISTE = true;
        				stop = true;
        				break;
        			}else{
        				if(firstMenu.SUBMENUS != undefined && firstMenu.SUBMENUS.SUBMENU != undefined && stop === false){
        					for(var j = 0; j < firstMenu.SUBMENUS.SUBMENU.length; j++){
            					var firstSubmenu = firstMenu.SUBMENUS.SUBMENU[j];
        						if(firstSubmenu.NO_TOKEN === token){
        							permisos.IN_ESCRITURA = firstSubmenu.IN_ESCRITURA;
									permisos.IN_BORRADO = firstSubmenu.IN_BORRADO;
									permisos.IN_EXPORTAR = firstSubmenu.IN_EXPORTAR;
        	        				permisos.NO_MENU = firstSubmenu.NO_MENU;
        	        				permisos.EXISTE = true;
        		    				stop = true;
        		    				break;
        						}else{
        							if(firstSubmenu.SUBMENUS != undefined && firstSubmenu.SUBMENUS.SUBMENU != undefined){
        		    					for(var k = 0; k < firstSubmenu.SUBMENUS.SUBMENU.length; k++){
        		        					var secondSubmenu = firstSubmenu.SUBMENUS.SUBMENU[k];
        		    						if(secondSubmenu.NO_TOKEN === token){
        		    							permisos.IN_ESCRITURA = secondSubmenu.IN_ESCRITURA;
												permisos.IN_BORRADO = secondSubmenu.IN_BORRADO;
												permisos.IN_EXPORTAR = secondSubmenu.IN_EXPORTAR;
        	        	        				permisos.NO_MENU = secondSubmenu.NO_MENU;
        	        	        				permisos.EXISTE = true;
        		    		    				stop = true;
        		    		    				break;
        		    						}
        		    					}
        		    				}
        						}
        					}
        				}
        			}
    			}
    		}
    		return permisos;
    		
//    		return {
//    			IN_ESCRITURA: false,
//				IN_BORRADO: false,
//				NO_MENU: ""
//    		}
    		
    	}
    	
    	this.validateMovistar = function (token) {
    		localStorage.clear();
			vm.errorAuth = false;
			
			return AuthenticationService.validateMovistar(token).then(
        		function successCallback(response) {
    				vm.cargandoAuth = false;
    				$location.search('auth', null);
        			if(response.status === 200) {
        				if(response.data.ID_RESULT == 0) {
        					vm.afterLogin(response.data, response.status);
						} else {
							vm.credential = {
								status: response.status,
								error: response.data.DS_RESULT
								// error: 'Credenciales incorrectas'
							}
							return response.status;
						}
					} else {
	    				vm.errorAuth = true;
						vm.credential = {
							status: response.status,
							error: response.data.DS_RESULT
						}     
					}
				},
				function errorCallback(response) {
    				vm.cargandoAuth = false;
    				vm.credential = {
        				status: response.status,
        				error: response.data
        			}    
    				vm.errorAuth = true;
        			return response.status;
        		}
            );   
    	}
    	
    	this.login = function(username, password, mfa) {
    		localStorage.clear();
    		
            return AuthenticationService.login(username, password, mfa).then(
        		function successCallback(response) {
        			if(response.status === 200) {
        				if(response.data.ID_RESULT == 0) {
        					if(response.data.SORT_FIELD != undefined){
        						vm.codeResponse = response.data.SORT_FIELD;
        						vm.responseLogin = response.data;
            					vm.firstStep = true;
            					
        					}else if(response.data.USUARIO && response.data.USUARIO.NO_TOKEN){        						
        						var response = vm.afterLogin(response.data, response.status);
        						return response;
        					}				
						} else {
							vm.credential = {
								status: response.status,
								error: response.data.DS_RESULT,
								idResult: response.data.ID_RESULT
								// error: 'Credenciales incorrectas'
							}
							return response.status;
						}
					} else {
						vm.credential = {
							status: response.status,
							error: response.data.DS_RESULT,
							idResult: response.data.ID_RESULT
						}     
					}
				},
				function errorCallback(response) {
    				vm.credential = {
        				status: response.status,
        				error: response.data
        			}    
        			return response.status;
    				
        		}
            );              
    		
    	}
    	
    	this.loginCode = function(codeMail) {
			AuthenticationService.loginCode(vm.codeResponse, codeMail)
	        .then(function successCallback(response) {

	            if (response.status == 200) {
	 				if(response.data.ID_RESULT == 0) {
						var response = vm.afterLogin(response.data, response.status);
						return response;
		            }else {
						vm.credential = {
							status: response.status,
							error: response.data.DS_RESULT,
							idResult: response.data.ID_RESULT

						}
						return response.status;
						}
				} else {
					vm.credential = {
						status: response.status,
						error: response.data.DS_RESULT,
						idResult: response.data.ID_RESULT
					}     
				}
	        }, function callBack(response) {
	            if (response.status == 406 || response.status == 401) {
		        	vm.responseLogin = response;
	            	return response;
	            }
	        });  
    	}
    	
    	this.afterLogin = function (data, status) {
    		var response = 200;
    		
            if((data != null && data.USUARIO != null && data.USUARIO.ADICIONAL != null && data.USUARIO.ADICIONAL.LANG != null && data.USUARIO.ADICIONAL.LANG == 'RD') && window.location.pathname.indexOf('beta') == -1) {
                let pathname = window.location.pathname.replace(window.location.pathname.slice(1, window.location.pathname.length - 1), `${window.location.pathname.slice(1, window.location.pathname.length - 1)}-beta`);
                window.location = `${window.location.protocol}//${window.location.host}${pathname}#!/?${vm.access}=${data.USUARIO.NO_TOKEN}`;
                return;
            }
    		
    		//Comprobar si el usuario tiene menús o productos. Si no tiene alguno, no se le deja entrar a la aplicación
			if (data == null || data.USUARIO == null || data.USUARIO.MENUS == null || data.USUARIO.MENUS.length == 0 || data.USUARIO.MENUS.MENU == null || data.USUARIO.MENUS.MENU.length == 0) {				
			    msg.textContent('El usuario no tiene permisos para acceder a la aplicación.');
				$mdDialog.show(msg);
				this.logout(true);
				response = 1;
				return response;
			} else if (data == null || data.USUARIO == null || data.USUARIO.PRODUCTOS == null || data.USUARIO.PRODUCTOS.length == 0) {				
			    msg.textContent('El usuario no tiene permisos para acceder a ningún producto de la aplicación.');
				$mdDialog.show(msg);
				this.logout(true);
				response = 1;
				return response;
			}
			
			TiposService.getProvincias()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listServices.listProvincias = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			
			TiposService.getCompania()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listServices.listCompanias = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			
			TiposService.getRamos({"IN_TARIFICABLE": true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listServices.listRamos = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
			});
			
			vm.isLogged = 'logueado';

			AuthenticationService.SetCredentials(data.USUARIO.NO_USUARIO, data.USUARIO.NO_TOKEN, data.USUARIO.CO_TOKEN, data.USUARIO.ID_GRUPO_ROL);
							
			vm.credential = {
				status: 200,
				usuario: data.USUARIO.NO_USUARIO,
				nombreCompleto: data.USUARIO.NO_NOMBRE + " " + data.USUARIO.NO_APELLIDOS,
				menus: data.USUARIO.MENUS.MENU
			}
			$window.sessionStorage.rfrsh = 'f5';
			$window.sessionStorage.isLogged = 'logueado';
			
			/*$window.sessionStorage.rol = response.data.USUARIO.NO_GRUPO_ROL//Rol de usuario para Gestores;*/
			$window.sessionStorage.rol = data.USUARIO.ID_GRUPO_ROL
			$window.sessionStorage.perfil = JSON.stringify({
				usuario: data.USUARIO.NO_USUARIO,	
				nombreCompleto: data.USUARIO.NO_NOMBRE + " " + data.USUARIO.NO_APELLIDOS,
				colectivos: data.USUARIO.COLECTIVOS,
				menus: data.USUARIO.MENUS.MENU,
				token: data.USUARIO.NO_TOKEN,
				productos: data.USUARIO.PRODUCTOS,
				adicional: data.USUARIO.ADICIONAL
			});
			$window.sessionStorage.lang = vm.lang;
			$window.sessionStorage.is2fa = vm.firstStep;
			vm.perfil = $window.sessionStorage.perfil;
			vm.menu = data.USUARIO.MENUS.MENU;
			vm.menus = data.USUARIO.MENUS.MENU;
			
			//Menú para gestores
			/*if (vm.menu != null) {
        		var menuListados = vm.menu.find(x => x.ID_MENU == 400);

        		if (menuListados != null) {
        	        vm.menuGestor = menuListados;
        		}
        	}*/
			
			vm.listServices.listColectivos = data.USUARIO.COLECTIVOS;
			
			/* Mostrar num de solicitudes pendientes en el menu?¿ */
//			BusquedaService.buscar({'CO_USU_RECEPTOR': data.USUARIO.NO_USUARIO}, 'missolicitud')
//			.then(function successCallback(response) {
//				if (response.status === 200) {
//					if(response.data.NUMERO_SOLICITUDES > 0) {
//						for (var i = 0; i < vm.menu.length; i++) {
//							if(vm.menu[i].ID_MENU == 500) {
//								for (var ii = 0; ii < vm.menu[i].SUBMENUS.SUBMENU.length; ii++) {
//									if(vm.menu[i].SUBMENUS.SUBMENU[ii].ID_MENU == 520) {
//										vm.menu[i].SUBMENUS.SUBMENU[ii].NO_MENU = vm.menu[i].SUBMENUS.SUBMENU[ii].NO_MENU + ' (' + response.data.NUMERO_SOLICITUDES + ')';
//									}
//								}
//							}
//							
//						}
//						
//					}
//				}
//				
//			}, function errorCallback(response) {
//			});
		
			vm.userProducts = data.USUARIO.PRODUCTOS;

			if(vm.userProducts != undefined && vm.userProducts.length > 0) {
				vm.lstProds = [];
				for(var i = 0; i < vm.userProducts.length; i++) {
					switch (vm.userProducts[i].ID_PRODUCTO) {
						case 1:
						case 2:
							//hogar 0
							vm.checkProducts(7, vm.lstProds);
							break;
						case 3:
						case 4:
						case 5:
						case 6:
							//empresas 3
							vm.checkProducts(3, vm.lstProds);
							break;
						case 7:
							//hijos 2
							vm.checkProducts(2, vm.lstProds);
							break;
						case 8:
							//identidad 4
							vm.checkProducts(4, vm.lstProds);
							break;
						case 10:
						case 11:
						case 12:
							//movil 1
							vm.checkProducts(1, vm.lstProds);
							break;
						case 14:
							//dispositivos
							vm.checkProducts(5, vm.lstProds);
							break;
						case 16:
							//dispositivos
							vm.checkProducts(5, vm.lstProds);
							break;
						case 17:
							//dispositivos
							vm.checkProducts(5, vm.lstProds);
							break;
						case 18:
							//dispositivos
							vm.checkProducts(5, vm.lstProds);
							break;
						case 19:
							//empresa alemania
							vm.checkProducts(6, vm.lstProds);
							break;
						case 28:
							//particulares
							vm.checkProducts(8, vm.lstProds);
							break;
						default:
							break;
					}
				}
				

					if(parseInt($window.sessionStorage.rol) == 8) {
						if(vm.lstProds.length > 1) {
							$location.path('/area_privada');
						} else {
							if(vm.lstProds[0] < 8) {
								$location.path('/area_privada').search({tar: vm.lstProds[0]});
							} else {
								$location.path('/area_privada').search({tar: 7});
							}
						}
					} else if (parseInt($window.sessionStorage.rol) == 11) {
						$location.path('/polizas_list');
					} else if (parseInt($window.sessionStorage.rol) == 6) {
						$location.path('/polizas_list');
					} else {
						if(vm.lstProds.length > 1) {
							$location.path('/area_privada');
						} else {
							if(vm.lstProds.length == 1) {
								$location.path('/area_privada').search({tar: 0});
							}else if(vm.lstProds[0] < 9) {
								$location.path('/area_privada').search({tar: vm.lstProds[0]});
							} else {
								$location.path('/area_privada').search({tar: 7});
							}
						}
					}	             
					} else {
						if(parseInt($window.sessionStorage.rol) == 8) {
							$location.path('/recibos_devueltos_dashboard');
						} else {
							$location.path('/polizas_list');
						}
					}
			
             
			// if($window.sessionStorage.rol == 'PLEYADE_INTER_GESTORES') {
			// 	$location.path('/tarificador_hogar');
			// } else {
			// 	$location.path('/solicitudes_pendientes_list');
			// }
			angular.element('body').css('background-color','white');
			
            //Si el lenguaje del usuario es distinto al seleccionado, hacer petición para setear el lenguaje seleccionado en el login
            if (data.USUARIO != null && data.USUARIO.ADICIONAL != null && data.USUARIO.ADICIONAL.LANG != vm.lang.toUpperCase()) {
            	UsuarioWSService.saveLanguageUser(vm.lang.toUpperCase())
				.then(function successCallback(response){
					if(response.status == 200){
						
					}
				});
            }
			
			return status;

    	}
    	
    	this.cambiarDatosModal = function(texto){
    		vm.cargarModal = false;
    		vm.textoModal = texto;
    		
//    		setTimeout(function(){ 
//    			$mdDialog.hide();
//        		$mdDialog.cancel();
//			}, 2000);
    	}
    	
    	this.abrirModalcargar = function(cargar, multiple){
    		vm.cargarModal = cargar;
//        	if(cargar){
	        	$mdDialog.show({
	    			templateUrl: BASE_SRC+'detalle/detalle.modals/cargar.modal.html',
	    			controllerAs: '$ctrl',
	    			clickOutsideToClose: vm.cargarModal == true ? false : true,
	    			parent: angular.element(document.body),
	    		    //targetEvent: ev,
	    		    fullscreen:false,
	    		    multiple: multiple != null ? multiple : false,
	    		    escapeToClose: false,
	    		    controller:['$mdDialog', function($mdDialog){
	    		    	var md = this;
	    		    	md.vm = vm;
	    		    	md.cargar = cargar;
	    		    	
	    		    	if(md.cargar == false){
//	    		    		md.text = texto;
	    		    		$mdDialog.hide();
//	    		    		$mdDialog.cancel();
	    		    	}
	    		    	if(vm.textoModal != undefined){
	    		    		md.text = vm.textoModal;
//	    		    		$mdDialog.hide();
//	    		    		$mdDialog.cancel();
	    		    	}
	    		    	
	    		    	this.$onChanges = function(){
	    		    		md.text = vm.textoModal;
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
//        	}else{
//        		$mdDialog.hide();
//        		$mdDialog.cancel();
//        	}
    	}
    	
    	//Cuando desaparece la sesión
    	if($window.sessionStorage.isLogged == undefined || $window.sessionStorage.isLogged == "noLogueado"){
    		this.logout(true);
    		$location.path('/');
		}
		
		vm.checkProducts = function(id, lstOutput) {
			if(lstOutput != undefined && lstOutput.length == 0) {
				lstOutput.push(id)
			} else {
				for(var i = 0; i < lstOutput.length; i++) {
					if(lstOutput.indexOf(id) == -1) {
						lstOutput.push(id)
					}
				}
			}
		}

		vm.checkPassOpt = function(opt1, strOpt1) {

			$mdDialog.show({
				templateUrl: BASE_SRC + 'login/login_opt.modal.html',
				controllerAs: '$ctrl',
				clickOutsideToClose: true,
				parent: angular.element(document.body),
				//targetEvent: ev,
				fullscreen:false,
				controller:['$mdDialog', function($mdDialog){
					var md = this;
					
					if(strOpt1 == 'showCPI') {
						md.showCPI = !opt1;
						md.showRPI = false;
						md.dialogWidth = 458;
					} else {
						md.showRPI = !opt1;
						md.showCPI = false;
						md.dialogWidth = 438;
					}

					this.$onInit = function() {
						function resizeIframe(obj) { 
							if (obj) {
								if(obj.contentWindow.document.body != null) {
									for(var i = 0; i < obj.contentWindow.document.body.children.length; i++) {
										hijo = obj.contentWindow.document.body.children[i]
										if(hijo.tagName == 'FORM') {
											// obj.style.height = (hijo.scrollHeight) + 'px';
											obj.style.height = (hijo.offsetHeight) + 'px';
											// $('[layout="column"]').eq(0).css('height', hijo.clientHeight);
											// $('.md-dialog-content > div').eq(0).css('height', hijo.scrollHeight);
											$('.md-dialog-content > div').eq(0).css('height', hijo.offsetHeight);
											return;
										}
									}
								}
							}
						}
						function resizePassIframe(){
							$('.passOpt_iframe').each(function(index){
								var elem = $(this).get(0);
								resizeIframe(elem);
							});
							setTimeout(resizePassIframe, 250);
						}
						setTimeout( resizePassIframe, 500 );
					}
					
					this.$onChanges = function(){
						
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
		}

		vm.changeLang = function(lang) {
			vm.lang = lang;
			$rootScope.lang = lang;
			$translate.use(lang);
			vm.checkIsAlemania();
		};


		vm.getColectivosPadre = function (colectivos) {
            var listaColectivosPadre = [];
            if (colectivos != null && colectivos.length > 0) {
            	for (var i = 0; i < colectivos.length; i++) {
            		var colectivo = colectivos[i];
            		if (colectivo.ID_TIPOCOLECTIVO_PADRE != null && listaColectivosPadre.findIndex(x => x.ID_TIPO_POLIZA == colectivo.ID_TIPOCOLECTIVO_PADRE) == -1) {
                        listaColectivosPadre.push({
                        	DS_TIPO_POLIZA: colectivo.DS_TIPO_POLIZA_PADRE,
							ID_TIPO_POLIZA: colectivo.ID_TIPOCOLECTIVO_PADRE
                        });
            		} else if (colectivo.ID_TIPOCOLECTIVO_PADRE == null && listaColectivosPadre.findIndex(x => x.ID_TIPO_POLIZA == colectivo.ID_TIPO_POLIZA) == -1) {
            			listaColectivosPadre.push({
                        	DS_TIPO_POLIZA: colectivo.DS_TIPO_POLIZA,
							ID_TIPO_POLIZA: colectivo.ID_TIPO_POLIZA
                        });
            		}
            	}
            }
            return listaColectivosPadre;
		}
		
		this.isRolAdmin = function () {
			vm.rol = window.sessionStorage.rol;
			
			return vm.rolesAdmin.includes(vm.rol) ? true : false;
		}

		//Cambiar formato de la fecha
        this.dateFormat = function dateFormat(fecha){
			var fechaFormat = moment(fecha).format('YYYY-MM-DD')
            return fechaFormat;
        }
        
        this.dateFormatView = function dateFormat(fecha){
			var fechaFormat = moment(fecha).format('DD-MM-YYYY')
            return fechaFormat;
        }
        
       //evita caracteres especiales en nombres
        vm.changeSpecialCharacters = (function(name){
        	             	
        	 var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
             to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
             mapping = {};
        
         for(var i = 0, j = from.length; i < j; i++ )
             mapping[ from.charAt( i ) ] = to.charAt( i );
        
	         return function( str ) {
	             var ret = [];
	             for( var i = 0, j = str.length; i < j; i++ ) {
	                 var c = str.charAt( i );
	                 if( mapping.hasOwnProperty( str.charAt( i ) ) )
	                     ret.push( mapping[ c ] );
	                 else
	                     ret.push( c );
	             }      
	            nameF =  ret.join( '' ).replace( /[^-A-Za-z0-9]+/g, '_' ).toLowerCase();
	            return  nameF;
	         }
        })();
        
      //convertir documentos a bytes
        vm.getBase64 = function(file, idArchivo, idTipoArchPol, funcRefresh){
			var reader = new FileReader();
			var existe = false;
			vm.idArchivo = idArchivo;
			vm.idTipoArchPol = idTipoArchPol;
			vm.archivo = {};
			
			if(file != undefined && file != undefined){
				nam = file.name;
				phrase = nam.split('.');
	        	nameA = phrase[0];
	        	extension = phrase[1];
	        	name = vm.changeSpecialCharacters(nameA);
	        	archivoName =  name +"."+ extension;
	        	reader.readAsDataURL(file);
						
	       
	        reader.onload = function(){
	        	if(Object.keys(vm.archivo).length === 0){	
				
					var base64 = reader.result.split("base64,")[1];
					var binary_string = window.atob(base64);
				    var len = binary_string.length;
				    var bytes = [];
				    for (var i = 0; i < len; i++) {
				        bytes.push(binary_string.charCodeAt(i));
				    }
					    
				   vm.archivo = {	
				    	"DESCARGAR": false,
			        	"ARCHIVO": bytes,
						"ID_TIPO": vm.idArchivo,
						"NO_ARCHIVO": archivoName,
						'ESTADO': 'Pendiente'
				       };
				    
				    if(vm.idTipoArchPol != null && vm.idTipoArchPol != undefined)
				    	vm.archivo.ID_TIPO_ARCHIVO = vm.idTipoArchPol
				    
			    	if(vm.listArchivos.find( arch => arch.NO_ARCHIVO == vm.archivo.NO_ARCHIVO)){
			    		msg.textContent('Ya existe un archivo con ese nombre.');
						$mdDialog.show(msg);
						existe = true;							
			    	}else{
                        vm.listArchivos.push(vm.archivo);
			    	};
				   
			    	if (funcRefresh != null) {
				    	funcRefresh();
			    	}
				}
	 		    $scope.$apply();
			}
		}

		
			
      }
        
        //enviar documentación
		vm.uploadFiles = function(listaArchivos, tipo, id, idPoliza, funcRef){
			obj = {};
			obj.OPOLIZA = {};
			vm.listArchivosPend = [];
			
			for(var a = 0; a < listaArchivos.length; a++){
				if(listaArchivos[a].ESTADO === "Pendiente"){
					vm.listArchivosPend.push(listaArchivos[a]);
				}
			}
				
			switch(tipo){
			case 'polizas':
				obj.ID_POLIZA =  id;
				obj.FICHEROS = vm.listArchivosPend;
			break;
			case 'terminales':
				obj = vm.listArchivosPend[0];
			break;
			case 'recibos':
				obj.ID_RECIBO =  id;
				obj.OPOLIZA.ID_POLIZA =  idPoliza;
				obj.FICHEROS = vm.listArchivosPend;			
			break;
			case 'clientes':				
				obj.FICHEROS = vm.listArchivosPend;
				obj.ID_CLIENTE =  id;
			break;
			case 'presupuestos':				
				obj.FICHEROS = vm.listArchivosPend;
				obj.ID_PRESUPUESTO =  id;
			break;
			case 'siniestros':				
				obj.FICHEROS = vm.listArchivosPend;
				obj.OPOLIZA.ID_POLIZA =  idPoliza;
				obj.ID_SINIESTRO =  id;
			break;
			case 'solicitudes':				
				obj.LIST_ARCHIVOS =vm.listArchivosPend;
				obj.ID_SOLICITUD =  id;
			break;
			default:
			break;
			}
				
			if((obj.FICHEROS != null && obj.FICHEROS != undefined) 
					|| (obj.LIST_ARCHIVOS != null &&  obj.LIST_ARCHIVOS != undefined)
					|| (vm.listArchivosPend[0] != null && vm.listArchivosPend[0] != undefined)){
				
				vm.abrirModalcargar(true);
				
				FicherosService.sendDocumentation(obj, tipo)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							msg.textContent("Se ha enviado la documentación correctamente");
							$mdDialog.show(msg);
							vm.listArchivos = [];
							
							if (funcRef != null) {
								funcRef();
							}
						}else{
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
				},function errorCallback(response){
	                if(response.status == 406 || response.status == 401){
	                	vm.busqueda.logout();
	                }
					msg.textContent($translate.instant('MSG_CONTACT_US'));
					$mdDialog.show(msg);
	        	});
			}else{
				msg.textContent('Debes seleccionar al menos un archivo para subir.');
				$mdDialog.show(msg);
			}
		}
		
		
		//Recuperar documentación ya subida
        vm.getDocuments = function(ruta, tipo){   
    //    	if(vm.archives != null && vm.archives != undefined){
		          FicherosService.getFicherosType({"ID_TIPO":tipo,
		              "NO_RUTA": ruta})
		          .then(function successCallback(response){
		              if(response.status == 200){
		                  if(response.data.ID_RESULT == 0){
		                	  vm.archives_solicitudes, vm.archives_polizas, vm.archives_recibos, vm.archives_presupuestos, vm.archives_clientes, vm.archives_siniestros = [];
		                	  
		                   switch(tipo){
			                   case 222:				
			         				vm.archives_solicitudes =  response.data.RESULT;
			         			break;
			                   case 225:				
			         				vm.archives_polizas =  response.data.RESULT;
			         			break;
			                   case 226:				
			         				vm.archives_recibos =  response.data.RESULT;
			         			break;
			         			case 227:				
			         				vm.archives_presupuestos =  response.data.RESULT;
			         			break;
			         			case 228:				
			         				vm.archives_clientes =  response.data.RESULT;
			         			break;
			         			case 229:				
			         				vm.archives_siniestros =  response.data.RESULT;
			         			break;
			         			default:
			         			break;
		         			}
		                  }
		              }
		          },function errorCallback(response){
		              if(response.status == 406 || response.status == 401){
		                  vm.busqueda.logout();
		              }
		          });
  //      	}
      }
        
        vm.deleteArchive = function(id){
        	if(id != undefined && id != null ){
				FicherosService.removeDocumentation(id)
				.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							msg.textContent("Se ha borrado la documentación correctamente");
							$mdDialog.show(msg);
						}else{
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						}
					}
				},function errorCallback(response){
	                if(response.status == 406 || response.status == 401){
	                	vm.busqueda.logout();
	                }
					msg.textContent('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
					$mdDialog.show(msg);
	        	});
        	}
        }
    	
        vm.getDescriptivo = function (obj, campo) {
        	var ds = "";

        	if (vm.lang == "de" || vm.lang == "en" || vm.lang == "pt") {
            	if (obj != null && obj.JS_IDIOMA != null && obj.JS_IDIOMA != '') {
            		var jsIdioma = JSON.parse(obj.JS_IDIOMA);
            		
            		if (jsIdioma[vm.lang.toUpperCase()] != null) {
            		    ds = jsIdioma[vm.lang.toUpperCase()];
            		} else {
                        ds = obj[campo];
            		}
            		
            	} else {
            		ds = obj[campo];
            	}
        	} else if (obj != null) {
        		ds = obj[campo];
        	}
        	
        	return ds;
        }

		vm.checkVersion = function () {
			$.ajax
		    ({
	        	url : "version.txt",
				dataType: "text",
				success : function (data) 
				{
					vm.versionAppDb = data;
					if(vm.versionAppDb != $cookies.get('appVersion')) {

						//Cargar automáticamente
						$cookies.put('appVersion', vm.versionAppDb);
                    	$window.location.reload(true);
					}
				}
			});

//			TiposService.getTipos( {ID_TIPO: 22, CO_TIPO: 'VERSION'} ).then(function (response) {
//				if(response.status == 200 && response.data.ID_RESULT == 0) {
//					if(response.data.TIPOS.TIPO.length > 0) {
//						for(let i = 0; i < response.data.TIPOS.TIPO.length; i++) {
//							vm.versionAppDb = response.data.TIPOS.TIPO[i].DS_TIPOS;
//							if(vm.versionAppDb != $cookies.get('appVersion')) {
//
//								//Cargar automáticamente
//								$cookies.put('appVersion', vm.versionAppDb);
//		                    	$window.location.reload(true);
//
//								//Mostrar un aviso para actualizar
////								if (vm.isDlgOpen != true) {
////									$mdToast.show({
////						                hideDelay: 0,
////								        position: 'bottom right',
////								        controllerAs: '$ctrl',
////								        bindToController: true,
////								        templateUrl: BASE_SRC+'detalle/detalle.modals/toast_dialog.modal.html',
////						                controller:['$mdToast', '$mdDialog', '$document', '$scope', function($mdToast, $mdDialog, $document, $scope){
////						                	var md = this;
////											vm.isDlgOpen = true;
////											
////						                    md.toastMessage = "Hay una nueva versión disponible en la aplicación, ¿quieres actualizarla?";
////
////						                    md.closeToast = function() {
////						                    	$mdToast.hide();
////												vm.isDlgOpen = false;
////						                    };
////
////						                    md.actualizarVersion = function () {
////												vm.isDlgOpen = false;
////												$cookies.put('appVersion', vm.versionAppDb);
////						                    	$window.location.reload(true);
////						                    }
////						                }]
////						            });
////								}
//
//							}
//						}
//					}
//				}
//			});
		}

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
    		// vm.checkVersion();
    	});
        
        vm.checkIsAlemania = function () {
    		var url = window.location.href;
			if (url != null && (url.includes("telefonicaseguros.de") || url.includes("/alemania"))) {
				vm.isAlemania = true;
			} else if (vm.lang == "de") {
				vm.isAlemania = true;
			} else {
				vm.isAlemania = false;
			}
			return vm.isAlemania;
        }

		vm.validateToken = function (token) {
    		localStorage.clear();
			vm.errorAuth = false;
			
			AuthenticationService.validateToken(token)
			.then(function successCallback(response){
				vm.cargandoAuth = false;
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0) {
						vm.afterLogin(response.data, response.status);
    					vm.errorAuth = false;
					} else {
						vm.errorAuth = true;
						vm.credential = {
							status: response.status,
							error: response.data.DS_RESULT
						}
					}
				} else {
					vm.errorAuth = true;
					vm.credential = {
						status: response.status,
						error: response.data.DS_RESULT
					}
				}
			}, function errorCallBack(response){
				vm.cargandoAuth = false;
				vm.credential = {
					status: response.status,
					error: response.data
				}
				vm.errorAuth = true;
				return response.status;
			});
    	}

		vm.dataLayer = function(pageName, product){
			vm.isLogueado = $window.sessionStorage.isLogged == 'logueado' ? 'YES' : 'NO';
			vm.url = window.location.origin + window.location.pathname;
			// vm.perfil = JSON.parse($window.sessionStorage.perfil);
			var idBrokerUser = JSON.parse(vm.perfil).adicional.ID_USUARIO;
			var brokerCompany = JSON.parse(vm.perfil).adicional.NO_COMPANIA;
			dataLayer.push ({
				'event': 'page_view',
				'pageName' : pageName,
				'product' : product,
				'pageLanguage' : vm.lang,
				'logged' : vm.isLogueado,
				'cleanUrl' : vm.url, // location.href, // 'url limpia sin parámetros',
				'brokerUserId' : idBrokerUser.toString(),
				'brokerCompany' : brokerCompany,
				'brokerMarket' : 'es'
			});
		}

		vm.dataLayerError = function(errorCode, errorType, isBlock, errorCopy, errorDesc, pageName, product){
			vm.isLogueado = $window.sessionStorage.isLogged == 'logueado' ? 'YES' : 'NO';
			vm.url = window.location.origin + window.location.pathname;
			var idBrokerUser = JSON.parse(vm.perfil).adicional.ID_USUARIO;
			var brokerCompany = JSON.parse(vm.perfil).adicional.NO_COMPANIA;
			dataLayer.push ({
				'event' : 'asyncGTM.errores',
				'errorCode' : errorCode,
				'errorType': errorType,
				'errorBlock' : isBlock==true ? 'BLOQUEANTE' : 'NO BLOQUEANTE',
				'errorCopy' : errorCopy,
				'errorDescription' : errorDesc,
				'pageName' : pageName,
				'product' : product,
				'pageLanguage' : vm.lang,
				'logged' : vm.isLogueado,
				'cleanUrl' : vm.url, 
				'brokerUserId' : idBrokerUser.toString(),
				'brokerCompany' : brokerCompany,
				'brokerMarket' : 'es'
			});
		}
    }
    
    ng.module('App').component('sdApp', Object.create(appComponent));
    
})(window.angular);
