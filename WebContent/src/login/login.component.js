(function(ng) {
	
	//Crear componente de app
    var loginComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$cookies', '$location', '$window', '$timeout', '$mdDialog', 'AuthenticationService', 'sharePropertiesService', 'FlashService', 'BASE_SRC'],
    		require:{
            	parent:'^sdApp'
            }
    }
    
    loginComponente.controller = function loginComponenteController($rootScope, $cookies, $location, $window, $timeout, $mdDialog, AuthenticationService, sharePropertiesService, FlashService, BASE_SRC){
		const vm = this;

		vm.isLogged = 'noLogueado';
		vm.responseLogin = null;
		vm.showPass = false;
		vm.showCPI = false;
		vm.showRPI = false;
		vm.secondStep = false;
		vm.mfaValidation = false;
		vm.authMethodPref = 'EMAIL'
		vm.versionPackage= '132.11.08'
		vm.versionPackage = '132.11.08'

		if(vm.versionPackage && vm.versionPackage != $cookies.get('appVersion')) {
            $cookies.put('appVersion', vm.versionPackage);
            $window.location.reload(true);
        }
		const pixelRatio = (window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth).toFixed(2)
		vm.resolutionDesc = screen.width + " x " + screen.height + " píxeles (" +pixelRatio + ")"

    	this.$onInit = function() {

			if( $cookies.get('auth-method') === undefined){
				$cookies.put('auth-method', 'EMAIL')
			}else{
				vm.authMethodPref = $cookies.get('auth-method')
			}

			if(vm.authMethodPref ==='GOOGLE'){
				vm.mfa = 2;
			}else {
				vm.mfa = 1;
			}

    		vm.showPass = false;
			vm.lang = vm.parent.lang;
			
			if ($window.sessionStorage.isLogged == "logueado") {
				$location.path('/area_privada');
			} else if(document.referrer != '' && document.referrer != document.location.origin + document.location.pathname) {
				var token = $location.search()['auth'];
				if(token != undefined && token != '' && token != true && token != false) {
					$location.search('auth', null)
					decToken = atob(token);
					this.parent.login(decToken.split(':')[0], decToken.split(':')[1]);
				}
			} else {
				if($window.sessionStorage.perfil != undefined) {
					//vm.parent.logout();
				}
	
				AuthenticationService.ClearCredentials();
				$('#divCerrarSesion').hide();
				localStorage.pBuscada = "";
				localStorage.poliza = "";
				sharePropertiesService.remove('polizas');
			}
			
            // angular.element('body').css('background-color','#003245');

			/*COOKIE PARA ALMACENAR EL METODO DE AUTENTIFICACIÓN DE DOBLE FACTOR PREFERIDO POR EL USUARIO*/

		}

		this.$doCheck = function() {
			vm.lang = vm.parent.lang;
			
			if(vm.parent.codeResponse != undefined && vm.parent.codeResponse != "" && (vm.code == undefined || vm.code == "")){
				vm.dataLoading = false;				
				
			}else if(vm.parent.responseLogin != undefined && vm.parent.responseLogin.ID_RESULT == 0 && vm.code != undefined && vm.resendCode == true){
				vm.dataLoading = false;		
			}
		}
    	
    	vm.login = function() {
    		if(vm.code != undefined && vm.code != ""){
    			vm.resendCode = true;
    		}
			
			if(vm.username != undefined && vm.password != undefined && vm.username.length > 0 && vm.password.length > 0) {
				vm.isError = false;
				vm.dataLoading = true;
				vm.idResult = 0;
				$('.msgError').slideUp();

				vm.responseLogin = this.parent.login(vm.username, vm.password, vm.mfa);

				$timeout(function(){
					if(vm.responseLogin.$$state.value == 401 || vm.responseLogin.$$state.value == 406){
						vm.isError = true;
						vm.msgError = 'El usuario o la contraseña son incorrectos';
						//alert("El usuario o la contraseña son incorrectos");
						vm.dataLoading = false;
					} 
					else if(vm.responseLogin.$$state.value == 500 || vm.responseLogin.$$state.value == 404 || vm.responseLogin.$$state.value == 502){
						vm.isError = true;
						vm.msgError = 'En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.';
						//alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
						vm.dataLoading = false;
					}
					if(vm.responseLogin.$$state.value == 200 && vm.parent.getCredentials() != null && vm.parent.getCredentials().error != undefined) {
						vm.isError = true;
						vm.msgError = vm.parent.getCredentials().error;
						if(vm.parent.getCredentials().idResult) {
							vm.idResult = vm.parent.getCredentials().idResult;
						}
						vm.dataLoading = false;
					}
					
					if (vm.responseLogin.$$state.value == 1) {
						vm.dataLoading = false;
					}
				}, 3000);
				var response = vm.parent.getCredentials();
			} else {
				if(vm.username == undefined || vm.username.length < 1) {
					vm.noUser = true;
				} else {
					vm.noUser = false;
				}
				if(vm.password == undefined || vm.password.length < 1) {
					vm.noPassword = true;
				} else {
					vm.noPassword = false;
				}
			}
            
            /*if(response == null || response.status == 500){
            	vm.dataLoading = false;
            	$('.msgError').slideDown();
            }*/
            
            
            /*if (vm.responseLogin){
				$('#nombreUsuarioHeader').html('Hola, ' + responseLogin.data.NO_NOMBRE + ' ' + responseLogin.data.NO_APELLIDOS);                                              
                $location.path('/busqueda/polizas');
			}*/
            
            
            /*
            AuthenticationService.login(vm.username, vm.password)

                .then(function successCallback(response){
                    if (response.status === 200) {
                        AuthenticationService.SetCredentials(vm.username, response.data.NO_TOKEN);
                        $('#nombreUsuarioHeader').html('Hola, ' + response.data.NO_NOMBRE + ' ' + response.data.NO_APELLIDOS);                                              
                        $location.path('/busqueda/polizas');
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                }, function errorCallback(response) {
                    alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
                    vm.dataLoading = false;
                });
                */
			
    	}
    	var i=0;
    	/*this.$doCheck = function() {
    		
    		var a = this.parent.getCredentials();
    		$timeout(function(){
    			
    			if (a != null) {
	    			console.log('Credenciales', a);
	    			console.log(this.parent.isLogged);
	    			//console.log('Estado peticion ' , vm.responseLogin, vm.responseLogin.status);
	    			if (a.status === 200){
	    				console.log('Congrats!!! Redirect to APP');
	    				
	//					$('#nombreUsuarioHeader').html('Hola, ' + vm.responseLogin.data.NO_NOMBRE + ' ' + vm.responseLogin.NO_APELLIDOS);                                              
		                $location.path('/busqueda/polizas');
					}
	    			else if (a.status === 1){
	    				FlashService.Error(response.message);
		                vm.dataLoading = false;
		                a = null;
	    			}else if (i==0){
	    				alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
	    				i=1;
	                    vm.dataLoading = false;
	                    responseLogin = null 
	    			}
	    		}
    		},5000);	    			
    		
    	}  */
    		
//    		
//        	this.isLogged = this.parent.login();
//        	console.log(this.isLogged);
    	
    	this.loadTemplate=function(){
    		return "src/login/login.view.html"
		}
		
		vm.checkPassOpt = function(opt1, strOpt1) {
			vm.parent.checkPassOpt(opt1, strOpt1);
		}

		vm.changeLang = function(lang) {
			vm.parent.changeLang(lang);
		};
		
		vm.showPassword = function () {
			vm.showPass = !vm.showPass;
		}

		vm.redirectLogin = function(appPath) {
			vm.parent.errorAuth = false;
			window.location = window.location.origin + window.location.pathname + appPath;
		}
		
		vm.loginCode = function(){			
			if(vm.code != undefined && vm.code != "" && vm.parent.codeResponse != undefined && vm.parent.codeResponse != ""){
				vm.dataLoading = true;
				vm.resendCode = false;
				vm.isErrorCode = false;
				
				this.parent.loginCode(vm.code);
				
				$timeout(function(){
					vm.dataLoading = false;
					if(vm.parent.responseLogin.status == 401 || vm.parent.responseLogin.status == 406){
						vm.isErrorCode = true;
						vm.msgErrorCode = 'El código es incorrecto.';
					} 
					else if(vm.parent.responseLogin.status == 500 || vm.parent.responseLogin.status == 404 || vm.parent.responseLogin.status == 502){
						vm.isErrorCode = true;
						vm.msgErrorCode = 'En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.';
					}
					if(vm.parent.credential.status == 200 && vm.parent.getCredentials() != null && vm.parent.getCredentials().error != undefined) {
						vm.isErrorCode = true;
						vm.msgErrorCode = vm.parent.getCredentials().error;
						if(vm.parent.getCredentials().idResult) {
							vm.idResult = vm.parent.getCredentials().idResult;
						}						
					}
					
				}, 3000);
			} 
		}
		
		vm.setAuthentication = function (mfa) {
			vm.mfa = mfa;
			vm.mfaValidation = true;
			if(mfa === 1)
				vm.literalCodigo = "  que se ha enviado a tu email.";
			else
				vm.literalCodigo = " de Google Authenticator.";
		}

		vm.setCookieAuthMethod = function (method) {

			const expireDate = new Date();
			expireDate.setFullYear(expireDate.getFullYear() + 10);

			$cookies.put('auth-method', method, {'expires': expireDate.toUTCString()})

			vm.authMethodPref = method
			vm.mfa = vm.authMethodPref ==='GOOGLE' ? 2 : 1;

		}

		vm.switchToEmailMFA = function (){
			vm.setCookieAuthMethod('EMAIL')
			vm.login()
		}
    }
    
    ng.module('App').component('sdLogin', Object.create(loginComponente));
    
})(window.angular);