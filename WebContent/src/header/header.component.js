(function (ng) {
	
    'use strict';
    	
    //Componente de header
    var pleHeaderComponent = {
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        controllerAs: '$ctrl',
        $inject: ['$window', '$location', '$cookies', '$q', 'AuthenticationService', 'BASE_SRC', '$translate', '$rootScope'],
        require: {
        	parent:'^sdApp'
        },
        bindings: {
        	appCredential:'<'
        }
    };

    pleHeaderComponent.controller = function HeaderComponentController($window, $location, $cookies, AuthenticationService, BASE_SRC, $translate, $rootScope) {
    	
        var vm = this;
        vm.nombre = "";
        vm.isLogged=false;
		//var parent;
        
        //this.cerrarSesion = cerrarSesion;
        //this.login = parent.login;
        //Inicializar el sistema de login

		/*Mensaje de Bienvenida en el header*/
		vm.noNombreWelcome = ""
		vm.noUsuarioWelcome = ""

        this.$onInit = function() {   
        	//vm.isLogged = this.parent.checkLogin();
			//console.log(vm.isLogged);
			vm.lang = vm.parent.lang;
			vm.rol = sessionStorage.getItem('rol');
			var perfil = null;
			
			if (window.sessionStorage.getItem("perfil") != null && window.sessionStorage.getItem("perfil") != "undefined") {
				perfil = JSON.parse(window.sessionStorage.getItem("perfil"));
			}
			
			vm.idCompania = null;

			if(perfil != null && perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
				vm.idCompania = perfil.adicional.ID_COMPANIA;
			}


        }
        
        this.loadTemplate = function() {
        	return 'src/header/header.view.html';
        }
        
        this.$onChanges = function(){
			vm.rol = sessionStorage.getItem('rol');
			
        	var perfil = null;
			vm.idCompania = null;
			
			if (window.sessionStorage.getItem("perfil") != null && window.sessionStorage.getItem("perfil") != "undefined") {
				perfil = JSON.parse(window.sessionStorage.getItem("perfil"));
			}
			
			if(perfil != null){
        		vm.nombre = perfil.nombreCompleto;
				vm.menus = perfil.menus;
				// vm.checkUserProducts();

				if(perfil.adicional != null){						
					if(perfil.adicional.ID_COMPANIA != null) {
						vm.idCompania = perfil.adicional.ID_COMPANIA;
					}
					
					vm.noNombreWelcome 	= perfil.adicional.NO_NOMBRE.toLowerCase()
					vm.noUsuarioWelcome = perfil.adicional.NO_USUARIO.toLowerCase()
				}
        	}			
        }
        
        this.$doCheck = function() {
        	this.isLogged = this.parent.checkLogin();
        	if(this.parent.perfil != undefined && this.parent.perfil != "undefined"){
        		var perfil = JSON.parse(this.parent.perfil);
        		vm.nombre = perfil.nombreCompleto;
        		// vm.checkUserProducts();
			}
			if($location.$$path != '/area_privada') {
				$location.search('tar', null)
			}
			vm.lang = vm.parent.lang;
        }

        this.cerrarSesion = function(){
            this.parent.logout(true);
		}
		
		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}
		
		vm.checkPassOpt = function(opt1, strOpt1) {
			vm.parent.checkPassOpt(opt1, strOpt1);
		}
		
		vm.redirect = function (url) {
			if ($window.sessionStorage.rol == 11 || $window.sessionStorage.rol == 6) {
				window.location.hash = '#!/polizas_list';
			} else {
				window.location.hash = '#!/area_privada?tar=0';
			}
		}
		
		vm.openMenuAdmin = function($mdMenu, ev) {
	    	$mdMenu.open(ev);
	    };

		/*
		vm.navPricing = function(id) {
			if(id > 0) {
				vm.parent.idPricing = id;
				window.location = window.location.origin + window.location.pathname +  '#!/area_privada';
			} else {
				window.location = window.location.origin + window.location.pathname +  '#!/tarificador_hogar';
			}
			
		}
		vm.checkUserProducts = function() {
			if(vm.parent.userProducts != undefined && vm.parent.userProducts.length > 0) {
				for(var i = 0; i < vm.parent.userProducts.length; i++) {
					switch (vm.parent.userProducts[i].ID_PRODUCTO) {
						case 1:
						case 2:
							//hogar 0
							vm.showBtnSH = true;
							break;
						case 3:
						case 4:
						case 5:
						case 6:
							//empresas 3
							vm.showBtnCS = true;
							break;
						case 7:
							//hijos 2
							vm.showBtnCH = true;
							break;
						case 8:
							//identidad 4
							vm.showBtnCI = true;
							break;
						case 10:
						case 11:
						case 12:
							//movil 1
							vm.showBtnSM = true;
							break;
						default:
							break;
					}
				}
			}
		}
		*/

		vm.changeLang = function(lang) {
			vm.parent.changeLang(lang);
		};

    }  
    
    ng.module('App').component('pleHeader', pleHeaderComponent);
    
    
    
    //Componente de navbar
    var navBarComponent = {
    	templateUrl: 'src/header/navbar.view.html',
        controllerAs: '$ctrl',
        $inject: ['$timeout', 'sharePropertiesService', '$rootScope', '$window'],
        require:{
        	parent:'^sdApp'
        },
        bindings:{
        	appMenus:'<'
        }
    }
    
    navBarComponent.controller = function navBarComponentController($timeout, sharePropertiesService, $rootScope, $window){
    	
    	var vm=this;
		vm.isLogged = false;
    	
    	//Inicializar el sistema de login
        this.$onInit = function() {        	     
			vm.rol = sessionStorage.getItem('rol');	
            vm.coToken = _.get($rootScope, 'globals.currentUser.coToken');
        }
        
		this.$onChanges = function(){
        	this.isLogged = this.parent.checkLogin();
        	if(vm.appMenus){
        		vm.menus = vm.appMenus;
        		vm.menus = _.sortBy(vm.menus,['NO_MENU']);
        		var inicioMenu;
        		angular.forEach(vm.menus, function(menu, key) {

					if(menu.SUBMENUS) {
						menu.SUBMENUS.SUBMENU = _.sortBy(menu.SUBMENUS.SUBMENU,['NO_MENU']);
						angular.forEach(menu.SUBMENUS.SUBMENU, function(submenu){
							if(submenu)
								submenu.SUBMENU = _.sortBy(submenu.SUBMENU,['NO_MENU']);
						});
					}

					switch (menu.NO_MENU){
						case "Clientes":
							menu.ICON = "fas fa-user-tie"
							break;
						case "Búsquedas y Listados":
							menu.ICON = "fas fa-stream"
							break;
						case "Administrador":
							menu.ICON = "fas fa-user-shield"
							break;
						case "Ficheros":
							menu.ICON = "far fa-copy"
							break;
						case 'Inicio':
						case "Nuevo Presupuesto":
							menu.ICON = "fas fa-grip-horizontal"
							inicioMenu = menu;
							break;
						case 'Acceso CRM':
							menu.ICON = 'fas fa-external-link-alt'
							break;
						case 'Acceso ITSM':
							menu.ICON = 'fas fa-external-link-alt'
							break;
						case 'RGPD':
							menu.ICON = 'fas fa-lock-open'
							break;
						case 'Firma Digital':
							menu.ICON = 'fa-regular fa-pen-to-square'
							break;
					}
        			
        		});

				if(inicioMenu) {
					const index = vm.menus.indexOf(inicioMenu);
					vm.menus.splice(index, 1);
					const newArray = [inicioMenu].concat(vm.menus)
					vm.menus = newArray
				}
        	}
        	
        	var perfil = null;
			vm.idCompania = null;
			
			if (window.sessionStorage.getItem("perfil") != null && window.sessionStorage.getItem("perfil") != "undefined") {
				perfil = JSON.parse(window.sessionStorage.getItem("perfil"));
			}
			
			if(perfil != null && perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
				vm.idCompania = perfil.adicional.ID_COMPANIA;
        	}
        }

		this.$doCheck = function() {
        	this.isLogged = this.parent.checkLogin();
        	if(this.parent.getMenus()) {
        		vm.menus = this.parent.getMenus();
        		vm.menus = _.sortBy(vm.menus,['NO_MENU']);
        		var inicioMenu;
        		angular.forEach(vm.menus, function(menu, key) {

					if(menu.SUBMENUS) {
						menu.SUBMENUS.SUBMENU = _.sortBy(menu.SUBMENUS.SUBMENU,['NO_MENU']);
						angular.forEach(menu.SUBMENUS.SUBMENU, function(submenu){
							if(submenu)
								submenu.SUBMENU = _.sortBy(submenu.SUBMENU,['NO_MENU']);
						});
					}

					switch (menu.NO_MENU){
						case "Clientes":
							menu.ICON = "fas fa-user-tie"
							break;
						case "Búsquedas y Listados":
							menu.ICON = "fas fa-stream"
							break;
						case "Administrador":
							menu.ICON = "fas fa-user-shield"
							break;
						case "Ficheros":
							menu.ICON = "far fa-copy"
							break;
						case 'Inicio':
						case "Nuevo Presupuesto":
							menu.ICON = "fas fa-grip-horizontal"
							inicioMenu = menu;
							break;
						case 'Acceso CRM':
							menu.ICON = 'fas fa-external-link-alt'
							break;
						case 'Acceso ITSM':
							menu.ICON = 'fas fa-external-link-alt'
							break;
						case 'RGPD':
							menu.ICON = 'fas fa-lock-open'
							break;
						case 'Firma Digital':
							menu.ICON = 'fa-regular fa-pen-to-square'
							break;
					}
        		});
        	}
			if(inicioMenu) {
				const index = vm.menus.indexOf(inicioMenu);
				vm.menus.splice(index, 1);
				const newArray = [inicioMenu].concat(vm.menus)
				vm.menus = newArray
			}
        }


        
        //Redirigir las páginas elegidas
        vm.redirigirWeb = function(menu){
        	
        }
        
        var entrado = false;
        vm.openMenu = function(mdMenu, event, noToken){
        	var entrado = false;
        	mdMenu.open();

        	if(event.currentTarget.id == "900") {
				window.location = window.location.origin + window.location.pathname +  '#!/area_privada?tar=0';
				mdMenu.close();
        	} else if(event.currentTarget.id == "300") {
				window.location = window.location.origin + window.location.pathname +  '#!/firma_digital';
				mdMenu.close();
			} else if (noToken && noToken.startsWith('http', 0) == true) {
				if(event.currentTarget.id == "1100") {
					window.open(noToken, '_blank' );
					mdMenu.close();
			   	} else {
					var perfil = null;
					if (window.sessionStorage.getItem("perfil") != null && window.sessionStorage.getItem("perfil") != "undefined") {
						perfil = JSON.parse(window.sessionStorage.getItem("perfil"));
					}

				   window.open(noToken + perfil.token, '_blank' );
				   mdMenu.close();
			   	}	
			}
        }
        vm.cerrarMenu = function(mdMenu) {
        	$timeout(function(){
    			if(!entrado){
    				mdMenu.close();
    				angular.element('.md-scroll-mask').remove();
    				angular.element('.md-menu-backdrop').remove();
    			}	
    		}, 100);
        }
        
        vm.noCerrar = function(){
        	entrado = true;;
        }
        
        vm.cerrarContent = function(mdMenu){
        	entrado = false;
        	mdMenu.close();
        	angular.element('.md-scroll-mask').remove();
			angular.element('.md-menu-backdrop').remove();
		}
        
        vm.openCRM = function () {
        	$window.open('https://www.google.com', '_blank');
        }
		
    }
    
    ng.module('App').component('navBar', Object.create(navBarComponent));
    
//    document.addEventListener('DOMContentLoaded', function () {
//    	  angular.bootstrap(document, ['App']);
//    	});
})(window.angular);