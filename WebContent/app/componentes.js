(function(ng) {

    "use strict";
     
    ng.module('App', ['ngRoute', 'ngCookies', 'ngMessages','ui.bootstrap','ngResource','isteven-multi-select']);
    ng.module('App').constant({
    	'BASE_APP':'/Proyecto_SD/',
    	'BASE_SRC':'/Proyecto_SD/src/'
    	});
        
//    var config = {
//    	$inject: 
//    };
    //config.$inject = ['$routeProvider', '$locationProvider'];
    ng.module('App').config(['$routeProvider', '$locationProvider', 'BASE_APP', function appComponentConfig($routeProvider, $locationProvider, BASE_APP){
    	
    	console.log("funciona");
    	
    	$routeProvider
	    	.when('/', {
	    		//controller: 'LoginController',
	            template: '<sd-login></sd-login>'
	        })
		
	        .when('/detalle/polizas', {
	        	template: '<detalle-sd></detalle-sd>'
	        })
	        
	        .when('/detalle/cliente',{
	        	template: '<detalle-sd></detalle-sd>'
	        })
	        
	                    
            .when('/detalle/reclamacion',{
                template: '<detalle-pleyade></detalle-pleyade>'
            })
	        /*.when('/register', {
	            controller: 'RegisterController',
	            templateUrl: 'register/register.view.html',
	            controllerAs: 'vm'
	        })
	
	        .when('/passforgotten', {
	            controller: 'LoginController',
	            templateUrl: 'login/passforgotten.view.html',
	            controllerAs: 'vm'
	        })*/
	        
	        .when('/cliente/create', {
	        	template: '<sd-cliente></sd-cliente>'
			})
			
	        /*.when('/busqueda/clientes', {
	        	template: '<busqueda-app></busqueda-app>'
	        })*/
	        
	        .when('/busqueda/*', {
	        	template: '<busqueda-app></busqueda-app>'
	        })
	
	        /*.when('/busqueda/recibos', {
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/presupuestos',{
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/siniestros',{
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/remesas',{
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/ultRecibos',{
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/solicitudes',{
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        
	        .when('/busqueda/renting',{
	        	template: '<busqueda-app></busqueda-app>'
	        })	*/       
	        //.otherwise({ redirectTo: '/' });
    }
    ]);
    
    // Arrancamos la aplicacion
    ng.element(function() {
        angular.bootstrap(document, ['App'], {
            stricDI: true
        });
    }); 
    
    //ng.run.$inject = ['$rootScope', '$location', '$cookies', '$http'];
    ng.module('App').run(['$rootScope', '$location', '$cookies', '$http', function appRun($rootScope, $location, $cookies, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
        }

        /*$rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register', '/passforgotten']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/');
            }
        });*/
    }]);
    

})(window.angular);
(function(ng) {	


	//Crear componente de app
    var appComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$window', '$location', 'AuthenticationService'],
    		/*require:{
            	child:'^sdLogin'
            }*/
    }
    
    
    
    appComponent.controller = function appComponentControler($window, $location, AuthenticationService){
    	var vm=this;
    	
    	vm.isLogged = $window.sessionStorage.isLogged;
    	vm.credential = null;
    	
    	this.loadTemplate=function(){
    		return "app.html";
    	}
    	
    	this.checkLogin = function() {
    		return this.isLogged;
    	}
    	
    	this.logout = function() {
    		$window.sessionStorage.isLogged='noLogueado';
    		vm.isLogged='noLogueado';
    	}
    	
    	this.getCredentials = function() {
    		return this.credential;
    	}
    	
    	this.login = function(username, password) {
    		    		    	
            return AuthenticationService.login(username, password).then(
        		function successCallback(response){
        			if (response.status === 200) {
        				
        				vm.isLogged = 'logueado';
        				AuthenticationService.SetCredentials(username, response.data.NO_TOKEN);
        				
        				vm.credential = {
        					status: 200,
        					nombre: response.data.NO_NOMBRE,
        					apellido: response.data.NO_APELLIDO
        				}
        				$window.sessionStorage.isLogged='logueado';
        				//$location.path('/busqueda/polizas');
        				return response;
        				
        			} else {
        				
        				vm.credential = {
        					status: response.status,
        					error: 'Credenciales incorrectas'
        				}     
        				
        				return response;
        			}
        		}, 
        		function errorCallback(response) {
    				vm.credential = {
        				status: response.status,
        				error: response.data
        			}    
    				
        			return response;
    				
        		}
           );              
    		
    	}
    	
    	//Cuando desaparece la sesión
    	console.log($window.sessionStorage.isLogged);
    	if($window.sessionStorage.isLogged == undefined || $window.sessionStorage.isLogged == "noLogueado"){
    		$location.path('/');
    	}
    	
    }
    
    ng.module('App').component('sdApp', Object.create(appComponent));
    
})(window.angular);
(function () {
    'use strict';

    angular
        .module('App')
        .factory('UserService', UserService);

    UserService.$inject = ['$timeout', '$filter', '$q'];
    function UserService($timeout, $filter, $q) {

        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            var deferred = $q.defer();
            deferred.resolve(getUsers());
            return deferred.promise;
        }

        function GetById(id) {
            var deferred = $q.defer();
            var filtered = $filter('filter')(getUsers(), { id: id });
            var user = filtered.length ? filtered[0] : null;
            deferred.resolve(user);
            return deferred.promise;
        }

        function GetByUsername(username) {
            var deferred = $q.defer();
            var filtered = $filter('filter')(getUsers(), { username: username });
            var user = filtered.length ? filtered[0] : null;
            deferred.resolve(user);
            return deferred.promise;
        }

        function Create(user) {
            var deferred = $q.defer();

            // simulate api call with $timeout
            $timeout(function () {
                GetByUsername(user.username)
                    .then(function (duplicateUser) {
                        if (duplicateUser !== null) {
                            deferred.resolve({ success: false, message: 'Username "' + user.username + '" is already taken' });
                        } else {
                            var users = getUsers();

                            // assign id
                            var lastUser = users[users.length - 1] || { id: 0 };
                            user.id = lastUser.id + 1;

                            // save to local storage
                            users.push(user);
                            setUsers(users);

                            deferred.resolve({ success: true });
                        }
                    });
            }, 1000);

            return deferred.promise;
        }

        function Update(user) {
            var deferred = $q.defer();

            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === user.id) {
                    users[i] = user;
                    break;
                }
            }
            setUsers(users);
            deferred.resolve();

            return deferred.promise;
        }

        function Delete(id) {
            var deferred = $q.defer();

            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.id === id) {
                    users.splice(i, 1);
                    break;
                }
            }
            setUsers(users);
            deferred.resolve();

            return deferred.promise;
        }

        // private functions

        function getUsers() {
            if(!localStorage.users){
                localStorage.users = JSON.stringify([]);
            }

            return JSON.parse(localStorage.users);
        }

        function setUsers(users) {
            localStorage.users = JSON.stringify(users);
        }
    }
})();
(function (ng) {

    'use strict';
    ng.module('App')
	.factory('sharePropertiesService', function() {
		var savedData = {}
		savedData.properties = {}
		savedData.properties.db = {}


		savedData.set = set;
		savedData.get = get;
		savedData.remove = remove;

		savedData.properties.db.tipoDoc= [
			{"id": 1, "key": "cif", "text": "CIF"},
            {"id": 2, "key": "nie", "text": "NIE"},
            {"id": 3, "key": "nif", "text": "NIF"},
            {"id": 4, "key": "otros", "text": "Otros(Internacional)"},
            {"id": 5, "key": "pasaporte", "text": "Pasaporte"}
		];
		savedData.properties.db.aseguradoras = [
            {"id": 1, "key": "adeslas", "text": "Adeslas"},
            {"id": 2, "key": "allianz", "text": "Allianz"},
            {"id": 3, "key": "caser", "text": "Caser"},
            {"id": 4, "key": "legalitas", "text": "Legálitas"}
        ];

        savedData.properties.db.ramos = [
            {"id": 60, "key": "accidentes", "text": "Accidentes"},
            {"id": 2, "key": "asistencia_viaje", "text": "Asistencia en Viaje"},
            {"id": 10, "key": "automoviles", "text": "Automóviles"},
            {"id": 4, "key": "caucion", "text": "Caución"},
            {"id": 5, "key": "contingencias", "text": "Contingencias"},
            {"id": 6, "key": "credito", "text": "Crédito"},
            {"id": 100, "key": "danios_materiales", "text": "Daños Materiales"},
            {"id": 8, "key": "decesos", "text": "Decesos"},
            {"id": 9, "key": "diversos", "text": "Diversos"},
            {"id": 100, "key": "equipos_electronicos", "text": "Equipos Electrónicos"},
            {"id": 70, "key": "incendios", "text": "Incendios"},
            {"id": 12, "key": "maquinaria", "text": "Maquinaria"},
            {"id": 13, "key": "montaje", "text": "Montaje"},
            {"id": 11, "key": "moto", "text": "Moto"},
            {"id": 20, "key": "multirriesgos", "text": "Multirriesgos"},
            {"id": 16, "key": "perdida_beneficios", "text": "Pérdida de Beneficios"},
            {"id": 17, "key": "perdida_pecuniarias", "text": "Pérdida Pecuniaria"},
            {"id": 18, "key": "proteccion_juridica", "text": "Protección Jurídica"},
            {"id": 30, "key": "responsabilidad_civil", "text": "Responsabilidad Civil"},
            {"id": 20, "key": "responsabilidad_medioambiental", "text": "Responsabilidad Medioambiental"},
            {"id": 80, "key": "robos", "text": "Robos"},
            {"id": 50, "key": "salud", "text": "Salud"},
            {"id": 23, "key": "salud_dental", "text": "Salud Dental"},
            {"id": 40, "key": "transportes", "text": "Transportes"},
            {"id": 25, "key": "vida", "text": "Vida"}
        ];


        savedData.properties.db.productos = [
            {"id": 1, "key": "adeslas", "text": "Auto"},
            {"id": 2, "key": "allianz", "text": "Allianz Auto Flota"},
            {"id": 3, "key": "caser", "text": "Auto Plus"},
            {"id": 4, "key": "legalitas", "text": "Vehículo Comercial"}
        ];

        savedData.properties.db.periodicidad = [
            {"id": 1, "key": "anual", "text": "Anual"},
            {"id": 2, "key": "bimensual", "text": "Bimensual"},
            {"id": 3, "key": "cuatrimestral", "text": "Cuatrimestral"},
            {"id": 4, "key": "mensual", "text": "Mensual"},
            {"id": 5, "key": "no_informada", "text": "No Informada"},
            {"id": 6, "key": "semestral", "text": "Semestral"},
            {"id": 7, "key": "trimestral", "text": "Trimestral"},
            {"id": 8, "key": "unica", "text": "Única"}
        ];

        savedData.properties.db.via_de_pago = [
            {"id": 1, "key": "aseguradora", "text": "Aseguradora"},
            {"id": 2, "key": "cobro_broker", "text": "Cobro Broker"},
            {"id": 3, "key": "pleyade", "text": "Pleyade"},
            {"id": 4, "key": "pleyade_banco", "text": "Pleyade Banco"},
            {"id": 5, "key": "pleyade_broker", "text": "Pleyade Broker"},
            {"id": 6, "key": "pleyade_nomina", "text": "Pleyade Nomina"},
            {"id": 7, "key": "servicios_broker", "text": "Servicios Broker"}
        ];   
        
        savedData.properties.db.laboral=[
        	{"id":1, "key": "activo", "text": "Activo"},
        	{"id":2, "key": "activo_alta_direccion", "text": "Activo alta direccion"},
        	{"id":3, "key": "activo_nucleo_corporativo", "text": "Activo nucleo corporativo"},
        	{"id":4, "key": "ex_activo", "text": "Ex-activo"},
        	{"id":5, "key": "familiar", "text": "Familiar"},
        	{"id":6, "key": "sin_notificar", "text": "Sin notificar"},
        ];
        
        savedData.properties.db.colectivo = [
        	{"id": 1, "key": "empleados", "text": "Empleados"},
            {"id": 2, "key": "accionistas", "text": "Accionistas"},
            {"id": 3, "key": "medicos_de_cataluña", "text": "Médicos de Cataluña"},
            {"id": 4, "key": "affinity_general", "text": "Affinity general"},
            {"id": 5, "key": "gestor_seguros", "text": "Gestor seguros"},
            {"id": 6, "key": "drivies", "text": "Drivies"},
            {"id": 7, "key": "uni_rasa", "text": "Uni Rasa"},
            {"id": 8, "key": "esprosys", "text": "Esprosys"},
            {"id": 9, "key": "bansabadell_renting", "text": "Bansabadell Renting"},
            {"id": 10, "key": "fuden/satse", "text": "Fuden/Satse"},
            {"id": 11, "key": "funcionarios", "text": "Funcionarios"},
            {"id": 12, "key": "seguros_colectivos", "text": "Seguros colectivos"},
            {"id": 13, "key": "empresas", "text": "Salud individual"},
            {"id": 14, "key": "salud_individual", "text": "Salud individual"},
            {"id": 15, "key": "salud_colectivo", "text": "Salud colectivo"},
            {"id": 16, "key": "internacional", "text": "Internacional"},
            {"id": 17, "key": "proveedores", "text": "Proveedores"},
            {"id": 18, "key": "movil", "text": "Móvil"},
            {"id": 19, "key": "aux_enfermeria", "text": "Aux enfermería (SAE)"},
            {"id": 20, "key": "resto_codem/satse", "text": "Resto de CODEM/SATSE (Antiguo ATS)"}
        ];
        
        savedData.properties.db.campanas = [
        	{"id": 1, "key": "maxbonificacion", "text": "Máxima bonificación"},
        	{"id": 2, "key": "campaign_si2", "text": "CAMPAIGN_SORTEO_IPADMINI_2013"},
        	{"id": 3, "key": "campaign_adw", "text": "CAMPAIGN_ADWORKS"},
        	{"id": 4, "key": "campaign_tuseguro", "text": "CAMPAIGN_TUSEGURO"},
        	{"id": 5, "key": "campaign_hd", "text": "CAMPAIGN_HOGAR_DEFAULT"},
        	{"id": 6, "key": "campaign_vc", "text": "CAMPAIGN_VIDA_CRUZADA"},
        	{"id": 7, "key": "campana_blackfriday", "text": "Campaña de Black Friday"},
        	{"id": 8, "key": "campaign_bf", "text": "CAMPAIGN_BLACK_FRIDAY"},
        	{"id": 9, "key": "prueba_camapana", "text": "Prueba de campaña"}
        ]
        
        savedData.properties.db.canal = [
        	{"id": 1, "key": "affinity", "text": "Affinity"},
        	{"id": 2, "key": "drivies", "text": "Drivies"},
        	{"id": 3, "key": "gestor_seguros", "text": "Gestor seguros"},
        	{"id": 4, "key": "intermediacion", "text": "Intermediación"},
        	{"id": 5, "key": "portal_cliente", "text": "Portal del cliente"},
        	{"id": 6, "key": "proveedores", "text": "Proveedores"},
        	{"id": 7, "key": "tarificadorweb", "text": "TarificadorWEB"}
        ]
        
		 function set(key,value) {
		   savedData.properties[key] = value;
		 }

		 function get(key) {
		  return  savedData.properties[key];
		 }

		 function remove(key) {
		  return  delete savedData.properties[key];
		 }


		 return  savedData;


	})

})(angular);
(function () {
    'use strict';

    angular
        .module('App')
        .factory('FlashService', FlashService);

    FlashService.$inject = ['$rootScope'];
    function FlashService($rootScope) {
        var service = {};

        service.Success = Success;
        service.Error = Error;

        initService();

        return service;

        function initService() {
            $rootScope.$on('$locationChangeStart', function () {
                clearFlashMessage();
            });

            function clearFlashMessage() {
                var flash = $rootScope.flash;
                if (flash) {
                    if (!flash.keepAfterLocationChange) {
                        delete $rootScope.flash;
                    } else {
                        // only keep for a single location change
                        flash.keepAfterLocationChange = false;
                    }
                }
            }
        }

        function Success(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'success', 
                keepAfterLocationChange: keepAfterLocationChange
            };
        }

        function Error(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
        }
    }

})();
(function () {
    'use strict';

    angular
        .module('App')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError('Error creating user'));
        }

        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('App')
        .factory('AuthenticationService', AuthenticationService);
    
    
    //Auntenticación del login y tambien para las peticiones.
    AuthenticationService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'UserService'];
    function AuthenticationService($http, $cookies, $rootScope, $timeout, UserService) {
        var service = {};

        service.login = login;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;

        return service;
        
        function login(username, password) {

            var response;
            var authdata = Base64.encode(username + ':' + password);
            var contentType = 'application/json';
            //var url = 'http://10.102.7.147/intermediacion-war/rest/Users/login';
            var url = 'http://10.102.10.219:8080/IntermediacionWeb/rest/Users/login'

            return $http({
                method: 'POST',
                url: url,
                data: '',
                headers: {'Authorization':'Basic ' +authdata, 'Content-Type': 'application/json'}
                });
        }

        function SetCredentials(username, token) {

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    token: token
                }
            };
            // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
            var cookieExp = new Date();
            cookieExp.setDate(cookieExp.getDate() + 7);
            $cookies.putObject('globals', $rootScope.globals, { expires: cookieExp });
        }

        function ClearCredentials() {
            $rootScope.globals = {};
            $cookies.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic';
        }
    }

    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

})();
(function () {
    'use strict';

    angular
        .module('App')
        .factory('BusquedaService', BusquedaService);

    //Es un servicio de busqueda como hacer las consultas.
    BusquedaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout'];
    function BusquedaService($http, $cookies, $rootScope, $timeout) {
        var service = {};
        service.buscar = buscar;

        return service;
        
        function buscar(jsonBusqueda, tipo) {

            var response;
            var url;
            var contentype='application/json';
            //Petición al de cliente
            if(tipo=="clientes"){ 
            	url="http://10.102.10.219:8080/IntermediacionWeb/rest/Clientes/getClientes";
            }
            //Petición al de polizas
            else if(tipo=="polizas"){
            	url = 'http://10.102.10.219:8080/IntermediacionWeb/rest/Polizas/getPolizas';
            }
            
            return $http({
                method: 'POST',
                url: url,
                data: jsonBusqueda,
                headers: {'Authorization':'Token ' +$rootScope.globals.currentUser.token, 'Content-Type': 'application/json'}	//Permiso para la petición.
            });
        }
    };
    
})();
// Servicio de Validaciones
(function(ng) {

    "use strict";

    function validacionesService($resource,BASE_APP) {    

        var services = {
            getData: obtener_datos,
            getDict: obtener_diccionario
        }

        return services;

        function obtener_datos() {
            return $resource(BASE_APP+'dictionaries/data.busqueda.cliente.json').get().$promise;
        }

        function obtener_diccionario() {
            return $resource(BASE_APP+'dictionaries/dict.busqueda.cliente.json').get().$promise;
        }        

    }

    validacionesService.$inject = ['$resource', 'BASE_APP'];
    
    ng.module('App').factory('validacionesService', validacionesService);

})(window.angular);
(function(ng){
	
	"use strict";
	
	function validSgCliente(){
		
		return{
			restrict: 'A',
			require: 'ngModel',
			link: function(scopes, $element, attributes, ngModelCtrl){
				
				if(!ngModelCtrl) return;
				
				function validateMe(modelValue){
					var dict = attributes['validSgCliente'] !== undefined ? angular.fromJson(attributes['validSgCliente']) : "";
					var values = ngModelCtrl.$viewValue;
					var isValid = true;
					var errors = "";
					console.log(values);
					console.log("validar");
					//Validación de CIF y DNI
					var primerCaracter=values.substr(0,1).toUpperCase();
	    			console.log(primerCaracter);
	    			if(primerCaracter.match(/^[0-9]$/)){
	    				if(!validateDNI(values)){
							console.log("DNI");
							errors='Error de NIF/NIE';
						}
						else errors="";
	    			}else{
	    				if(!validateCIF(values)){
							console.log("CIF");
							errors='Error de CIF';
						}
						else errors="";
	    			}
	    			if(values == ""){
	    				errors="";
	    			}
					
					// Asignamos errores al controlador interno de Angular
                    if (errors != "") {
                        ngModelCtrl.$error = {'customMsg': errors};
                        ngModelCtrl.$setValidity('custom', false);
                    } else {
                       ngModelCtrl.$error = {};
                       ngModelCtrl.$setValidity('custom', true);                        
                    }

                    return modelValue;
				}
				
				ngModelCtrl.$parsers.unshift(validateMe);
			}
		}
	}
	
	ng.module('App').directive('validSgCliente', validSgCliente);
	
	function validateCIF(doc){
    	//Quitamos el primer caracter y el ultimo digito
		var valuedoc=doc.substr(1,doc.length-2);
	 
		var suma=0;
	 
		//Sumamos las docras pares de la cadena
		for(var i=1;i<valuedoc.length;i=i+2)
		{
			suma=suma+parseInt(valuedoc.substr(i,1));
		}
	 
		var suma2=0;
	 
		//Sumamos las docras impares de la cadena
		for(var i=0;i<valuedoc.length;i=i+2)
		{
			var result=parseInt(valuedoc.substr(i,1))*2;
			if(String(result).length==1)
			{
				// Un solo caracter
				suma2=suma2+parseInt(result);
			}else{
				// Dos caracteres. Los sumamos...
				suma2=suma2+parseInt(String(result).substr(0,1))+parseInt(String(result).substr(1,1));
			}
		}
	 
		// Sumamos las dos sumas que hemos realizado
		suma=suma+suma2;
	 
		var unidad=String(suma).substr(String(suma).length - 1, 1);
		unidad=10-parseInt(unidad);
	 
		var primerCaracter=doc.substr(0,1).toUpperCase();
	 
		if(primerCaracter.match(/^[FJKNPQRSUVW]$/))
		{
			//Empieza por .... Comparamos la ultima letra
			if(String.fromCharCode(64+unidad).toUpperCase()==doc.substr(doc.length-1,1).toUpperCase())
				return true;
		}else if(primerCaracter.match(/^[XYZ]$/)){
			//Se valida como un dni
			var newdoc;
			if(primerCaracter=="X")
				newdoc=doc.substr(1);
			else if(primerCaracter=="Y")
				newdoc="1"+doc.substr(1);
			else if(primerCaracter=="Z")
				newdoc="2"+doc.substr(1);
			return validateDNI(newdoc);
		}else if(primerCaracter.match(/^[ABCDEFGHLM]$/)){
			//Se revisa que el ultimo valor coincida con el calculo
			if(unidad==10)
				unidad=0;
			if(doc.substr(doc.length-1,1)==String(unidad))
				return true;
		}
		return false;
    }
    function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();
	 
		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	}
})(window.angular);
(function () {
    'use strict';

    angular
        .module('App')
        .factory('SolicitarBajaService', SolicitarBajaService);

    SolicitarBajaService.$inject = ['$http', '$cookies', '$rootScope', '$timeout'];
    function SolicitarBajaService($http, $cookies, $rootScope, $timeout) {
        var service = {};
        service.darDeBaja = darDeBaja;

        return service;
        
        function darDeBaja(idPoliza) {

            var response;
            //var url = 'http://10.102.7.147/intermediacion-war/rest/Solicitudes/solicitudBajaRenting';
            var url = 'http://10.102.10.219:8080/IntermediacionWeb/rest/Solicitudes/solicitudBajaRenting'
            var contentType = 'application/json';
            var jsonBusqueda = {
                      "ID_CAUSAANULACION": 19,
                      "OPOLIZA":
                        {"ID_POLIZA":idPoliza}
                    };

            return $http({
                method: 'POST',
                url: url,
                data: jsonBusqueda,
                headers: {'Authorization':'Token ' +$rootScope.globals.currentUser.token, 'Content-Type': 'application/json'}
                });
        }
    };

})();
(function(ng){
	
	"use strict";
	
	function validAltaCliente(){
		
		return{
			restrict: 'A',
			require: 'ngModel',
			link: function(scopes, $element, attributes, ngModelCtrl){
				
				if(!ngModelCtrl) return;
				
				function validateMe(modelValue){
					var dict = attributes['validAltaCliente'] !== undefined ? angular.fromJson(attributes['validAltaCliente']) : "";
					var values = modelValue;
					var isValid = true;
					var errors = "";
					
					console.log(ngModelCtrl);
					//Validación de CIF y DNI
					var primerCaracter=values.substr(0,1).toUpperCase();
	    			console.log(primerCaracter);
	    			if(primerCaracter.match(/^[0-9]$/)){
	    				if(!validateDNI(values)){
							errors='Error de NIF/NIE';
						}
						else errors="";
	    			}else{
	    				if(!validateCIF(values)){
							errors='Error de CIF';
						}
						else errors="";
	    			}
	    			if(values == ""){
	    				errors="";
	    			}
					
					// Asignamos errores al controlador interno de Angular
                    if (errors != "") {
                        ngModelCtrl.$error = {'customMsg': errors};
                        ngModelCtrl.$setValidity('custom', false);
                    } else {
                       ngModelCtrl.$error = {};
                       ngModelCtrl.$setValidity('custom', true);                        
                    }

                    return modelValue;
				}
				
				ngModelCtrl.$parsers.unshift(validateMe);
			}
		}
	}
	
	ng.module('App').directive('validAltaCliente', validAltaCliente);
	
	function validateCIF(doc){
    	//Quitamos el primer caracter y el ultimo digito
		var valuedoc=doc.substr(1,doc.length-2);
	 
		var suma=0;
	 
		//Sumamos las docras pares de la cadena
		for(var i=1;i<valuedoc.length;i=i+2)
		{
			suma=suma+parseInt(valuedoc.substr(i,1));
		}
	 
		var suma2=0;
	 
		//Sumamos las docras impares de la cadena
		for(var i=0;i<valuedoc.length;i=i+2)
		{
			var result=parseInt(valuedoc.substr(i,1))*2;
			if(String(result).length==1)
			{
				// Un solo caracter
				suma2=suma2+parseInt(result);
			}else{
				// Dos caracteres. Los sumamos...
				suma2=suma2+parseInt(String(result).substr(0,1))+parseInt(String(result).substr(1,1));
			}
		}
	 
		// Sumamos las dos sumas que hemos realizado
		suma=suma+suma2;
	 
		var unidad=String(suma).substr(String(suma).length - 1, 1);
		unidad=10-parseInt(unidad);
	 
		var primerCaracter=doc.substr(0,1).toUpperCase();
	 
		if(primerCaracter.match(/^[FJKNPQRSUVW]$/))
		{
			//Empieza por .... Comparamos la ultima letra
			if(String.fromCharCode(64+unidad).toUpperCase()==doc.substr(doc.length-1,1).toUpperCase())
				return true;
		}else if(primerCaracter.match(/^[XYZ]$/)){
			//Se valida como un dni
			var newdoc;
			if(primerCaracter=="X")
				newdoc=doc.substr(1);
			else if(primerCaracter=="Y")
				newdoc="1"+doc.substr(1);
			else if(primerCaracter=="Z")
				newdoc="2"+doc.substr(1);
			return validateDNI(newdoc);
		}else if(primerCaracter.match(/^[ABCDEFGHLM]$/)){
			//Se revisa que el ultimo valor coincida con el calculo
			if(unidad==10)
				unidad=0;
			if(doc.substr(doc.length-1,1)==String(unidad))
				return true;
		}
		return false;
    }
    function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();
	 
		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	}
})(window.angular);
(function (ng) {
	
    'use strict';
    	
    //Componente de header
    var pleHeaderComponent = {
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        controllerAs: '$ctrl',
        $inject: ['$location', '$cookies', '$q', 'AuthenticationService', 'BASE_SRC'],
        require: {
        	parent:'^sdApp'
        }
    };

    pleHeaderComponent.controller = function HeaderComponentController($location, $cookies, AuthenticationService, BASE_SRC) {
    	
        var vm = this;
        vm.isLogged=false;
        //var parent;
        
        //this.cerrarSesion = cerrarSesion;
        //this.login = parent.login;
        //Inicializar el sistema de login
        this.$onInit = function() {   
        	//vm.isLogged = this.parent.checkLogin();
        	//console.log(vm.isLogged);
        }
        
        this.loadTemplate = function() {
        	return 'src/header/header.view.html';
        }
        
        this.$doCheck = function() {
        	this.isLogged = this.parent.checkLogin();
        	//console.log('isLogged', this.isLogged);
        }

        this.cerrarSesion = function(){
            //AuthenticationService.ClearCredentials();
            localStorage.pBuscada = "";
            localStorage.poliza = "";
            //$('#divCerrarSesion').hide();
            this.parent.logout();
            //console.log(vm.isLogged);
            $location.path('/');
        }        
        
    }  
    
    ng.module('App').component('pleHeader', pleHeaderComponent);
    
    
    
    //Componente de navbar
    var navBarComponent = {
    	templateUrl: 'src/header/navbar.view.html',
        controllerAs: '$ctrl',
        require:{
        	parent:'^sdApp'
        }
    }
    
    navBarComponent.controller = function navBarComponentController($q){
    	
    	var vm=this;
    	vm.isLogged = false;
    	
    	//Inicializar el sistema de login
        this.$onInit = function() {        	
        	/*this.parent;
        	console.log(this.parent.login);
        	vm.login='login';*/     	
        }
        
        this.$doCheck = function() {
        	this.isLogged = this.parent.checkLogin();
        	//console.log('isLogged', this.isLogged);
        }
        
        
    }
    
    ng.module('App').component('navBar', Object.create(navBarComponent));
    
//    document.addEventListener('DOMContentLoaded', function () {
//    	  angular.bootstrap(document, ['App']);
//    	});
})(window.angular);
(function(ng) {	
	
	//Crear componente de app
    var loginComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$cookies', '$location', '$window', '$timeout', 'AuthenticationService', 'sharePropertiesService', 'FlashService'],
    		require:{
            	parent:'^sdApp'
            }
    }
    
    loginComponente.controller = function loginComponenteController($rootScope, $cookies, $location, $window, $timeout, AuthenticationService, sharePropertiesService, FlashService){
    	var vm=this;
    	vm.isLogged = 'noLogueado';
    	vm.responseLogin = null;
    	
    	//console.log(vm.login);
    	//Inicia el sistema
    	this.$onInit = function() { 
    		AuthenticationService.ClearCredentials();
            $('#divCerrarSesion').hide();
            localStorage.pBuscada = "";
            localStorage.poliza = "";
            sharePropertiesService.remove('polizas');
    	}
    	
    	vm.login = function(){
    		
    		vm.dataLoading = true;    		
            vm.responseLogin = this.parent.login(vm.username, vm.password);            
            //console.log(vm.responseLogin);
            
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
    	
    	this.$doCheck = function() {
    		
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
	    			}else{
	    				alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
	                    vm.dataLoading = false;
	                    responseLogin = null 
	    			}
	    		}
    		},5000);	    			
    		
    	}  
    		
//    		
//        	this.isLogged = this.parent.login();
//        	console.log(this.isLogged);
    	
    	this.loadTemplate=function(){
    		return "src/login/login.view.html"
    	}
    }
    
    ng.module('App').component('sdLogin', Object.create(loginComponente));
    
})(window.angular);
(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC']
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, validacionesService, sharePropertiesService, BusquedaService, BASE_SRC){
    	var vm=this;
    	vm.db=sharePropertiesService.get('db');
    	var url=window.location;

    	//Paginación
    	vm.currentPage = 1;
    	vm.maxSize = 10;
    	vm.itemsPerPage = 10;
    	vm.totalItems = 0;
    	vm.mensajeBuscar = true;
    	
    	vm.changePage = function (key){
    		vm[key] = sharePropertiesService.get(key);
    		localStorage.page = vm.currentPage;
    		vm[key] = vm[key].slice(((vm.currentPage-1)*vm.itemsPerPage), ((vm.currentPage)*vm.itemsPerPage));
    	}
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		$q.all({'datosRequest':validacionesService.getData(), 'dictRequest':validacionesService.getDict()}).then(function(data){
    			console.data;
    			vm.form = data.datosRequest.data;
    			vm.dictionary = data.dictRequest.dict;
    			vm.loaded = true;
    			
    		});
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		if(/polizas$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.polizas.html";
    		}
    		else if(/clientes$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.clientes.html";
    		}
    		else if(/recibos$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.recibo.html";
    		}
    		else if(/presupuestos$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.presupuestos.html";
    		}
    		else if(/siniestros$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.siniestros.html";
    		}
    		else if(/remesas$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.remesas.html";
    		}
    		else if(/ultRecibos$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.ultRecibos.html";
    		}
    		else if(/solicitudes$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.solicitudes.html";
    		}
    		else if(/renting$/.test(url)){
    			return BASE_SRC+"busqueda/busqueda.renting.html";
    		}
            else if(/reclamaciones$/.test(url)){
                return BASE_SRC+"busqueda/busqueda.reclamacion.html";
            }
    	}
    	
    	//Cargar las listas
    	if(localStorage.pBuscada != undefined && localStorage.pBuscada != ""){
    		vm.polizas = JSON.parse(localStorage.pBuscada);
    		sharePropertiesService.set('polizas', vm.polizas);
    		vm.totalItems = vm.polizas.length;
    		//vm.polizas = vm.polizas.slice(0,10);
    		vm.currentPage = localStorage.page;
            console.log(vm.totalItems);
            vm.mensajeBuscar = false;
            vm.completed = 1;
            vm.polizas = vm.polizas.slice(((vm.currentPage-1)*vm.itemsPerPage), ((vm.currentPage)*vm.itemsPerPage));
    	}
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key){
    		console.log(fila);
    		if(key == 'poliza'){
    			localStorage.poliza=JSON.stringify(fila);
    			localStorage.cliente="";
    			$location.path('/detalle/polizas');
    		}
    		else{
    			localStorage.cliente=JSON.stringify(fila);
    			localStorage.poliza="";
    			$location.path('/detalle/cliente');
    		}
    	}
    	
    	//Cambiar los tipos de identificación
    	vm.changeType=function(){
    		//this.form.tipo.value = "";
            this.updateModel('NU_DOCUMENTO','cliente');
            //this.resetErrors();
    	}
    	
    	//Valida el CIF y DNI
    	this.updateModel = function(id, tipo) {
    		
    		this.form.NU_DOCUMENTO.$error=null;
    		var errors=null;
    		
    		//Valida la validación cuando es cliente porque tiene un select de tipo de indetificación
    		if(tipo == 'cliente'){
    			if(this.form.tipo.value != ""){
					if(this.form.tipo.value=="1" || this.form.tipo.value=="4"){
						if(!validateCIF(this.form.NU_DOCUMENTO.value)){		//Valida el CIF
							console.log("CIF");
							errors='Error de CIF';
							this.form.NU_DOCUMENTO.$error={errors};
						}
						else this.resetErrors(id);
					}
					else{
						if(!validateDNI(this.form.NU_DOCUMENTO.value)){		//Valida el Dni
							console.log("DNI");
							errors='Error de NIF/NIE';
							this.form.NU_DOCUMENTO.$error={errors};
						}
						else this.resetErrors(id);
					}
				}
	    		else if(this.form.NU_DOCUMENTO.value == undefined || this.form.NU_DOCUMENTO.value == ""){
	    			this.resetErrors(id);
	    		}
				else{
					console.log("No tiene");
					errors="Elige un tipo";
					this.form.NU_DOCUMENTO.$error={errors};
				} 
	    		//this.form.NU_DOCUMENTO.$error={errors};
	    		console.log(this.form.NU_DOCUMENTO.$error);
	    		console.log(this.form.$valid);
    		}
    		else{
    			 if(this.form.NU_DOCUMENTO.value != undefined && this.form.NU_DOCUMENTO.value != ""){
					var primerCaracter=this.form.NU_DOCUMENTO.value.substr(0,1).toUpperCase();
	    			console.log(primerCaracter);
	    			if(primerCaracter.match(/^[0-9]$/)){
	    				if(validateDNI(this.form.NU_DOCUMENTO.value)){
	    					this.resetErrors(id);
	    				}
	    				else{
	    					errors='Error de NIF/NIE';
	    					this.form.NU_DOCUMENTO.$error={errors};
	    				}
	    			}else{
	    				if(validateCIF(this.form.NU_DOCUMENTO.value)){
	    					this.resetErrors(id);
	    				}
	    				else{
	    					errors='Error de CIF';
	    					this.form.NU_DOCUMENTO.$error={errors};
	    				}
	    			}
				}
	    		else{
	    			this.resetErrors(id);
	    		}
    			
    			console.log(this.form.NU_DOCUMENTO.$error);
    		}
        }
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		vm.json={};
    		if(tipo == 'clientes'){
    			
    			angular.forEach(vm.form, function(value, key) {
    				console.log(value || (value.value == 3 && key=='tipo'));
    				if(value.value == ""){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			
    			if(Object.keys(vm.json).length !== 0){
    				$('#mensajeNingunResultado').hide();
                    $('#resultadosBusqueda').hide();
                    $('#mensajeBuscar').hide();
                    $('#buscandoGif').show();
                    console.log(vm.json);
            		var jsonBusqueda={
            				"NU_DOCUMENTO":"",
            				"NO_NOMBRE":"carlos"
            			}
            		BusquedaService.buscar(vm.json, tipo)
            			.then(function successCallback(response){
            				if(response.status === 200){
            					
            					$.each(response.data.CLIENTES.CLIENTE, function(index, value) {
                                    var fechaNacimiento = response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO;
                                    var fechaCarnet = response.data.CLIENTES.CLIENTE[index].FD_CARNET;
                                    if(fechaNacimiento != null && fechaNacimiento != ""){
                                    	var n2 = response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO.indexOf(':');
                                    	fechaNacimiento = fechaNacimiento.substring(0, n2 != -1 ? n2-3 : fechaNacimiento.length);
                                    	response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO = fechaNacimiento;                                	
                                    }
                                    if(fechaCarnet != null && fechaCarnet != ""){
                                    	var n2 = response.data.CLIENTES.CLIENTE[index].FD_CARNET.indexOf(':');
                                    	fechaCarnet = fechaCarnet.substring(0, n2 != -1 ? n2-3 : fechaCarnet.length);
                                    	response.data.CLIENTES.CLIENTE[index].FD_CARNET = fechaCarnet;                                	
                                    }
                                });
                                
            					if(response.data.IN_CLIENTE_VIP){
            						response.data.IN_CLIENTE_VIP="SI"
            					}else{
            						response.data.IN_CLIENTE_VIP="NO";
            					}
            					if(response.data.IN_LOPD){
            						response.data.IN_LOPD="SI";
            					}else{
            						response.data.IN_LOPD="NO";
            					}
            					if(response.data.NUMERO_CLIENTES != '0'){
            						//$.each(response.data.CLIENTES.CLIENTE, function(index, value) {
        							sharePropertiesService.set('clientes', response.data.CLIENTES.CLIENTE);
	                                //localStorage.pBuscada = JSON.stringify(sharePropertiesService.get('clientes'));
        							
	                                vm.clientes = sharePropertiesService.get('clientes');
	                                vm.clientes = vm.clientes.slice(0,10);
	                                
	                                vm.totalItems = response.data.NUMERO_CLIENTES;
	                                console.log(vm.totalItems);
            						//});
            						
            					}

                                $('#buscandoGif').hide();
                                $('#mensajeNingunResultado').hide();
                                $('#resultadosBusqueda').show('fast');

                            }else{
                                $('#buscandoGif').hide();
                                $('#resultadosBusqueda').hide('fast');
                                $('#mensajeNingunResultado').show();
                            }
            			},function errorCallback(response){
            				$('#buscandoGif').hide();
                            $('#mensajeBuscar').show();
                            alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
            			});
    				
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		
    		else if(tipo == 'polizas'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || (value.value == 3 && key=='tipo') || value.value==null){
        				delete vm.form[key];
        			}
    				else{
    					if(value.value)
    					vm.json[key]=value.value;
    				}
    			});
    			
    			console.log(vm.json);
    			
    			if(Object.keys(vm.json).length !== 0){
//    				$('#mensajeNingunResultado').hide();
//                    $('#resultadosBusqueda').hide();
//                    $('#mensajeBuscar').hide();
//                    $('#buscandoGif').show();
                    vm.completed=2;
                    vm.mensajeBuscar = false;
                    vm.loading = true;
                    //console.log(this.form.fdEfectoInicio.value);
                    var jsonBusqueda = {
    	                      /*"DS_SITUA_RIESGO":"",
    	                      "FD_INICIO_FROM": this.form.fdEfectoInicio.value,
    	                      "FD_INICIO_TO": "",*/
    	                      "ID_RAMO": 10,
    	                      "ID_TIPO_POLIZA" : 44
    	            };
            		BusquedaService.buscar(jsonBusqueda, tipo)
            			.then(function successCallback(response){
            				if(response.status === 200){
            					console.log(response.data);
            					$.each(response.data.POLIZAS.POLIZA, function(index, value) {
                                    var fechaEfecto = response.data.POLIZAS.POLIZA[index].FD_INICIO;
                                    var fechaVencimiento = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO;
                                    var fechaEmision = response.data.POLIZAS.POLIZA[index].FD_EMISION;
                                    var fechaAlta = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA;
                                    var fechaMod = response.data.POLIZAS.POLIZA[index].FT_USU_MOD;

                                    if(fechaEfecto != null && fechaEfecto != ""){
                                    	var n2 = response.data.POLIZAS.POLIZA[index].FD_INICIO.indexOf(':');
                                    	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-2 : fechaEfecto.length);
                                    	response.data.POLIZAS.POLIZA[index].FD_INICIO = fechaEfecto;                                    	
                                    }

                                    if(fechaVencimiento != null && fechaVencimiento != ""){
                                    	var n2 = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO.indexOf(':');
                                    	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-2 : fechaVencimiento.length);
                                    	response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO = fechaVencimiento;
                                    }
                                    
                                    if(fechaEmision != null && fechaEmision != ""){
                                    	var n2 = response.data.POLIZAS.POLIZA[index].FD_EMISION.indexOf(':');
                                    	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-2 : fechaEmision.length);
                                    	response.data.POLIZAS.POLIZA[index].FD_EMISION = fechaEmision;
                                    }
                                    
                                    if(fechaAlta != null && fechaAlta != ""){
                                    	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA.indexOf(':');
                                    	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-2 : fechaAlta.length);
                                    	response.data.POLIZAS.POLIZA[index].FT_USU_ALTA = fechaAlta;
                                    }
                                    
                                    if(fechaMod != null && fechaMod != ""){
                                    	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_MOD.indexOf(':');
                                    	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-2 : fechaMod.length);
                                    	response.data.POLIZAS.POLIZA[index].FT_USU_MOD = fechaMod;
                                    }

                                });
            					if(response.data.NUMERO_POLIZAS != '0'){
            						//$.each(response.data.CLIENTES.CLIENTE, function(index, value) {
        							sharePropertiesService.set('polizas', response.data.POLIZAS.POLIZA);
	                                localStorage.pBuscada = JSON.stringify(sharePropertiesService.get('polizas'));
        							
	                                vm.polizas = sharePropertiesService.get('polizas');
	                                vm.polizas = vm.polizas.slice(0,10);
	                                
	                                vm.totalItems = response.data.NUMERO_POLIZAS;
	                                console.log(vm.totalItems);
            						
            					}

//                                $('#buscandoGif').hide();
//                                $('#mensajeNingunResultado').hide();
//                                $('#resultadosBusqueda').show('fast');
                                vm.completed=1;
                                vm.loading = false;

                            }else{
//                                $('#buscandoGif').hide();
//                                $('#resultadosBusqueda').hide('fast');
//                                $('#mensajeNingunResultado').show();
                                vm.completed=0;
                                vm.loading = false;
                            }
            			},function errorCallback(response){
            				vm.completed="";
                            vm.mensajeBuscar = true;
                            vm.loading = false;
//            				$('#buscandoGif').hide();
//                            $('#mensajeBuscar').show();
                            alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
            			});
    			}else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		else if(tipo == 'presupuestos'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || value.value == undefined || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.json);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		
    		else if(tipo == 'recibos'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.form);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		else if(tipo == 'remesas'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.form);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		else if(tipo == 'ultRecibos'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.form);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		else if(tipo == 'siniestros'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || value.value == undefined || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.form);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    		else if(tipo == 'solicitud'){
    			angular.forEach(vm.form, function(value, key) {
    				if(value.value == "" || value.value == undefined || (value.value == 3 && key=='tipo')){
        				delete vm.form[key];
        			}
    				else{
    					vm.json[key]=value.value;
    				}
    			});
    			console.log(vm.form);
    			if(Object.keys(vm.json).length !== 0){
    				
    			}
    			else{
    				$('#checkVacio').slideDown().delay(1500).slideUp();
    			}
    		}
    	}
    	
    	/*this.$onInit = function() {        	
        	vm.login="hola";
        }*/
    }
    
    function validateCIF(doc){
    	//Quitamos el primer caracter y el ultimo digito
		var valuedoc=doc.substr(1,doc.length-2);
	 
		var suma=0;
	 
		//Sumamos las docras pares de la cadena
		for(var i=1;i<valuedoc.length;i=i+2)
		{
			suma=suma+parseInt(valuedoc.substr(i,1));
		}
	 
		var suma2=0;
	 
		//Sumamos las docras impares de la cadena
		for(var i=0;i<valuedoc.length;i=i+2)
		{
			var result=parseInt(valuedoc.substr(i,1))*2;
			if(String(result).length==1)
			{
				// Un solo caracter
				suma2=suma2+parseInt(result);
			}else{
				// Dos caracteres. Los sumamos...
				suma2=suma2+parseInt(String(result).substr(0,1))+parseInt(String(result).substr(1,1));
			}
		}
	 
		// Sumamos las dos sumas que hemos realizado
		suma=suma+suma2;
	 
		var unidad=String(suma).substr(String(suma).length - 1, 1);
		unidad=10-parseInt(unidad);
	 
		var primerCaracter=doc.substr(0,1).toUpperCase();
	 
		if(primerCaracter.match(/^[FJKNPQRSUVW]$/))
		{
			//Empieza por .... Comparamos la ultima letra
			if(String.fromCharCode(64+unidad).toUpperCase()==doc.substr(doc.length-1,1).toUpperCase())
				return true;
		}else if(primerCaracter.match(/^[XYZ]$/)){
			//Se valida como un dni
			var newdoc;
			if(primerCaracter=="X")
				newdoc=doc.substr(1);
			else if(primerCaracter=="Y")
				newdoc="1"+doc.substr(1);
			else if(primerCaracter=="Z")
				newdoc="2"+doc.substr(1);
			return validateDNI(newdoc);
		}else if(primerCaracter.match(/^[ABCDEFGHLM]$/)){
			//Se revisa que el ultimo valor coincida con el calculo
			if(unidad==10)
				unidad=0;
			if(doc.substr(doc.length-1,1)==String(unidad))
				return true;
		}
		return false;
    }
    function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();
	 
		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	}
    
    ng.module('App').component('busquedaApp', Object.create(busquedaComponent));
    
})(window.angular);
(function(ng) {	

	//Crear componente de app
    var detalleComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', 'sharePropertiesService', '$uibModal', 'BASE_APP'],
    }
    
    detalleComponent.controller = function detalleComponentControler($q, sharePropertiesService, $uibModal, BASE_APP){
    	var vm=this;
    	vm.db=sharePropertiesService.get('db');
    	var url=window.location;
    	
    	//Cargar los datos necesarios que ha elegido
    	if(localStorage.poliza != null && localStorage.poliza != ""){
    		vm.datos = JSON.parse(localStorage.poliza);
    		vm.list = vm.datos.LST_ASEGURADOS;
    		console.log(vm.list);
    		angular.forEach(vm.list, function(values,key){
    			console.log(values.ID_TIPO_CLIENTE);
    			if(values.ID_TIPO_CLIENTE == 1){
    				vm.pagador = vm.list[key];
    			}
    			else if(values.ID_TIPO_CLIENTE == 2){
    				vm.conductor = vm.list[key];
    			}else{
    				vm.tomador = vm.list[key];
    			}
    		});
    	}
    	else{
    		vm.datos = JSON.parse(localStorage.cliente);
    		for(var i=0;i<vm.db.tipoDoc.length;i++){
        		if(vm.db.tipoDoc[i].id == vm.datos.ID_TIPO_DOCUMENTO){
        			vm.selected=vm.db.tipoDoc[i];
        		}
        	}
    	}
    	
    	this.loadTemplate=function(){
    		if(/polizas$/.test(url)){
    			return "src/detalle/detalle.polizas.html";
    		}
    		else if(/cliente$/.test(url)){
    			return "src/detalle/detalle.clientes.html";
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
        
        //Abrir presupuesto
        vm.crearPresupuesto=function(){
        	$uibModal.open({
        		templateUrl: BASE_APP+'src/detalle/cliente.modal.html',
                plain: true,
                backdrop: true,
                windowClass: 'app-modal-window',
                controller: ['$scope', '$http', function($scope, $http){
                	$scope.showBoton=true;
                    $scope.abrirRamo = function(){
                    	$('#modalCuerpo').html('<iframe src="http://10.102.10.219:8080/TarificadorWeb/?userId='+$scope.ramos+'&type=10" style="width:100%; min-height:700px; border:none;"></iframe>');
                    	/*$http.get('http://10.102.10.219:8080/TarificadorWeb/?userId='+$scope.ramo+'&type=10')
                    		.then(function (response){
                    			$('#modalCuerpo').html('<iframe src="http://10.102.10.219:8080/TarificadorWeb/?userId="'+$scope.ramo+'"&type=10" style="width:100%; heigth:500px"></iframe>');
                    		})*/
                    	$scope.showBoton=false;
                    };
              
                }]
            });
        }
        
        vm.openRecibo = function(){
        	var uibModalInstance = $uibModal.open({
                template:'<detalle-poliza-modal></detalle-poliza-modal>', 
                plain: true,
                size: 'lg',
                windowClass: 'app-modal-window',
                component: 'detallePolizaModal'
                /*controllerAs: 'md',
                controller: ['$scope', function($scope,$uibModalInstance){
                	var md=this;
                	md.poliza=vm.datos;
                	md.db=vm.db;
                	
                	console.log(md.poliza);
                	
                    md.crearRecibo = function(){
                    	console.log(md.recibo);
                    	angular.forEach(md.recibo, function(data, key) {
                            console.log(key);
                            if (dict != undefined && dict.required) {
                                if (value == "") {
                                    data.$error['required'] = 'Campo obligatorio';
                                }
                            }
                        });
                    	
                    	$scope.cancel = function(){
                            $uibModalInstance.dismiss('cancel');
                        };
                    };
                }]*/
            });
        }
    }
    
    
    
    ng.module('App').component('detalleSd', Object.create(detalleComponent));
    
})(window.angular);


(function(ng) {
	var modalPolizaComponent = {
    		controllerAs: 'md',
    		template:'<div ng-include="md.loadTemplate()"></div>',
    		$inject:['sharePropertiesService', 'BASE_APP'],
    		bindings: {
    		    resolve: '<',
    		    close: '&',
    		    dismiss: '&'
    		}
    }
    
	modalPolizaComponent.controller = function detalleComponentControler(sharePropertiesService, BASE_APP){
		var md=this;
		md.db=sharePropertiesService.get('db');
		
		this.loadTemplate=function(){
    		return BASE_APP+'src/detalle/polizas.modal.html';
    	}
		
		md.crearRecibo = function(){
			console.log("funciona");
        	console.log(md.recibo);
        	
        	var users = [
        		  { firstName: "John", lastName: "Doe", age: 28, gender: "male" },
        		  { firstName: "Jane", lastName: "Doe", age: 5, gender: "female" },
        		  { firstName: "Jim", lastName: "Carrey", age: 54, gender: "male" },
        		  { firstName: "Kate", lastName: "Winslet", age: 40, gender: "female" }
        		];

        	var user = _.find(users, { lastName: "Doe", gender: "male" });
        	
        	angular.forEach(md.recibo, function(data, key) {
        		
            });
            	
			//md.close({$value: 'cancel'});
		}
		
		md.cancel = function(){
			md.dismiss({$value: 'cancel'});
		}
		
	}
	
	ng.module('App').component('detallePolizaModal', Object.create(modalPolizaComponent));
	
})(window.angular);


(function(ng) {	


	//Crear componente de app
    var clienteComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$q', 'validacionesService', 'sharePropertiesService'],
    }
    
    
    
    clienteComponent.controller = function clienteComponentControler($q, validacionesService, sharePropertiesService){
    	var vm=this;
    	vm.db=sharePropertiesService.get('db');
    	
    	this.$onInit = function(){
    		$q.all({'datosRequest':validacionesService.getData(), 'dictRequest':validacionesService.getDict()}).then(function(data){
    			vm.form = data.datosRequest.data;
    			console.log(vm.form);
    			vm.dictionary = data.dictRequest.dict;
    			vm.loaded = true;
    		});
    	}
    	
    	this.loadTemplate=function(){
    		return "src/cliente/cliente.view.html";
    	}
    	this.updateModel = function(id) {
            this.resetErrors(id);
            var required= "";
            if(id == 'NU_DOCUMENTO'){
            	if(this.form.tipo.value != ""){
					if(this.form.tipo.value=="1" || this.form.tipo.value=="4"){
						if(!validateCIF(this.form.NU_DOCUMENTO.value)){
							required='Error de CIF';
						}
						else this.resetErrors(id);
					}
					else{
						if(!validateDNI(this.form.NU_DOCUMENTO.value)){
							required='Error de NIF/NIE';
						}
						else this.resetErrors(id);
					}
				}
	    		else if(this.form.NU_DOCUMENTO.value == undefined || this.form.NU_DOCUMENTO.value == ""){
	    			this.resetErrors(id);
	    		}
				else{
					required="Elige un tipo";
				}
	            
	    		this.form.NU_DOCUMENTO.$error={required};
            }
            else{
            	if(this.form[id].value != ""){
            		this.resetErrors(id);
            	}
            }
        }
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	vm.changeForm = function(){
    		console.log(vm.form);
        	vm.changeDoc=vm.form.tipo.value;
        	console.log(vm.changeDoc);
        	this.updateModel('NU_DOCUMENTO');
        	//localStorage.tipo=vm.tipoDoc;
    	}
    	vm.putMatricula=function(){
    		vm.show=vm.laboral;
    	}
    	
    	vm.anadirDir=function(dirs){
    		vm.dirs=dirs;
    		var i=0;
    		var keepGoing = true;
    		var i=0;
    		if(dirs!=undefined){ //Comprueba los inputs si están vacíos.
    			/*angular.forEach(dirs, function(value, key){
    				angular.forEach(value, function(value, key){
    					if(keepGoing){
    						if(value==""){
		    					i++;
		    					if(i<6){
		    						keepGoing = false;
		    					}
		    				}
    						else{
    							//i=0;
    							return;
    						}
    					}
    					
    				});
    			});*/
    			//Si supera mas de 6 inputs vacíos, no se añadira nueva fila
    			
    			vm.dirs.push({"tipo":"","dir":"","num":"","cp":"","localidad":"","provincia":"","correspondiente":false});
    			
    		}else{//Si no tienen filas, se añade una nueva.
    			vm.dirs=[];
    			vm.dirs.push({"tipo":"","dir":"","num":"","cp":"","localidad":"","provincia":"","correspondiente":false});
    		}
    	}
    	
    	vm.anadirBanco=function(bancos){
    		vm.bancos=bancos;
    		var i=0;
    		var keepGoing = true;
    		var i=0;
    		if(bancos!=undefined){
    			//Si supera mas de 6 inputs vacíos, no se añadira nueva fila
    			vm.bancos.push({"banco":"","sucursal":"","dc":"","cuenta":"","iban":"","bic":""});
    			
    		}else{//Si no tienen filas, se añade una nueva.
    			vm.bancos=[];
    			vm.bancos.push({"banco":"","sucursal":"","dc":"","cuenta":"","iban":"","bic":""});
    		}
    	}
    	
    	vm.altaCliente=function(isValid){
    		// Realizamos validaciones
            if (isValid) {
                angular.forEach(vm.form, function(data, key) {
                    var dict = vm.dictionary[key];
                    var value = data.value;
                    if (dict != undefined && dict.required) {
                        if (value == "") {
                            data.$error['required'] = 'Campo obligatorio';
                        }
                    }
                    else if(dict != undefined && dict.format){
                    	if(this.form.tipo.value != ""){
        					if(this.form.tipo.value=="1" || this.form.tipo.value=="4"){
        						if(!validateCIF(this.form.NU_DOCUMENTO.value)){
        							required='Error de CIF';
        						}
        						else this.resetErrors(id);
        					}
        					else{
        						if(!validateDNI(this.form.NU_DOCUMENTO.value)){
        							required='Error de NIF/NIE';
        						}
        						else this.resetErrors(id);
        					}
        				}
                    	else{
        					required="Elige un tipo";
        				}
                    }
                });
            }
    	}
    }
    
    function validateCIF(doc){
    	//Quitamos el primer caracter y el ultimo digito
		var valuedoc=doc.substr(1,doc.length-2);
	 
		var suma=0;
	 
		//Sumamos las docras pares de la cadena
		for(var i=1;i<valuedoc.length;i=i+2)
		{
			suma=suma+parseInt(valuedoc.substr(i,1));
		}
	 
		var suma2=0;
	 
		//Sumamos las docras impares de la cadena
		for(var i=0;i<valuedoc.length;i=i+2)
		{
			var result=parseInt(valuedoc.substr(i,1))*2;
			if(String(result).length==1)
			{
				// Un solo caracter
				suma2=suma2+parseInt(result);
			}else{
				// Dos caracteres. Los sumamos...
				suma2=suma2+parseInt(String(result).substr(0,1))+parseInt(String(result).substr(1,1));
			}
		}
	 
		// Sumamos las dos sumas que hemos realizado
		suma=suma+suma2;
	 
		var unidad=String(suma).substr(String(suma).length - 1, 1);
		unidad=10-parseInt(unidad);
	 
		var primerCaracter=doc.substr(0,1).toUpperCase();
	 
		if(primerCaracter.match(/^[FJKNPQRSUVW]$/))
		{
			//Empieza por .... Comparamos la ultima letra
			if(String.fromCharCode(64+unidad).toUpperCase()==doc.substr(doc.length-1,1).toUpperCase())
				return true;
		}else if(primerCaracter.match(/^[XYZ]$/)){
			//Se valida como un dni
			var newdoc;
			if(primerCaracter=="X")
				newdoc=doc.substr(1);
			else if(primerCaracter=="Y")
				newdoc="1"+doc.substr(1);
			else if(primerCaracter=="Z")
				newdoc="2"+doc.substr(1);
			return validateDNI(newdoc);
		}else if(primerCaracter.match(/^[ABCDEFGHLM]$/)){
			//Se revisa que el ultimo valor coincida con el calculo
			if(unidad==10)
				unidad=0;
			if(doc.substr(doc.length-1,1)==String(unidad))
				return true;
		}
		return false;
    }
    function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();
	 
		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	}
    
    ng.module('App').component('sdCliente', Object.create(clienteComponent));
    
})(window.angular);