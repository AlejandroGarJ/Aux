import { COMPONENTS } from "./angular2/angularComponentsDeclaration";
import { DetalleMediadorComponent } from "./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component";


 
var url = window.location.pathname;
var origin = window.location.origin;
(function (ng) {
  "use strict";

  ng.module("App", [
    "ngMaterial",
    "ngRoute",
    "ngCookies",
    "ngAnimate",
    "ngSanitize",
    /*'ngTouch',*/ "ngAria",
    "ngMessages",
    "ngFileUpload",
    "angular.filter",
    "ui.grid",
    "ui.grid.edit",
    "ui.grid.cellNav",
    "ui.grid.pagination",
    "ui.grid.grouping",
    "ui.grid.resizeColumns",
    "ui.grid.autoResize",
    "ui.grid.treeBase",
    "ui.grid.treeView",
    "ui.grid.selection",
    "ui.grid.exporter",
    "ui.bootstrap",
    "ngResource",
    "treeControl",
    "pascalprecht.translate",
    "angularjs-dropdown-multiselect",
  ]);
  ng.module("App").constant({
    BASE_APP: url,
    BASE_SRC: url + "src/",

    //desa
    // 'BASE_CON': 'https://10.102.10.205:8181/SeguroDigitalRest/rest',
    // 'BASE_SF': 'https://10.102.10.205:8181/mobile',
    // 'BASE_TI': 'https://desa.telefonicainsurance.com/services',

    //pre
    BASE_CON: "https://prep.telefonicainsurance.com/sd/SeguroDigitalRest/rest",
    BASE_SF: "https://10.102.97.135:8181/mobile",
    BASE_TI: "https://prep.telefonicainsurance.com/services",

    //local
    //  'BASE_CON':'http://localhost:7070/SeguroDigitalRest/rest',
    //  'BASE_SF': 'sd/mobile',
    //  'BASE_TI': 'https://desa.telefonicainsurance.com/services',

    //desplegar
    // 'BASE_CON': '/portal-gestor/sd/SeguroDigitalRest/rest',
    // 'BASE_SF': '/portal-gestor/sd/mobile',
    // 'BASE_TI': '/services'

    //desplegar 203
    // 'BASE_CON': '/sd203/SeguroDigitalRest/rest',
    // 'BASE_SF': '/sd203/mobile',
    // 'BASE_TI': '/services'
  });

  ng.module("App").value("version", "2.0");
  // ng.module('App').value('version', ${project.version});

  // var config = {
  // 	$inject:
  // };
  //config.$inject = ['$routeProvider', '$locationProvider'];

  /*   console.log(PruebaController);
  ng.module("App").controller("PruebaController", PruebaController); */

  /* Declarar los componentes de Angular2 en el modulo Angularjs */

  /* COMPONENTS.forEach((component) => {
    console.log(component.name);
    ng.module("App").controller(component.name, component);
  }); */

  COMPONENTS.forEach((component) => {
    ng.module("App").controller(
      component.name.replace("Component", "Controller"),
      component
    );
  });

  /* ng.directive(
    (DetalleMediadorComponent.name.charAt(0).toLowerCase() + DetalleMediadorComponent.name.slice(1)).replace(
      "Component",
      ""
    ),
  ) */


  window.app = ng.module("App");

  ng.module("App").config([
    "$routeProvider",
    "$locationProvider",
    "$httpProvider",
    "BASE_APP",
    "BASE_SRC",
    "$mdDateLocaleProvider",
    "$translateProvider",
    "$mdIconProvider",
    function appComponentConfig(
      $routeProvider,
      $locationProvider,
      $httpProvider,
      BASE_APP,
      BASE_SRC,
      $mdDateLocaleProvider,
      $translateProvider,
      $mdIconProvider
    ) {
      $mdDateLocaleProvider.formatDate = function (date) {
        // return moment(date).format('DD/MM/YYYY');
        var navegador = bowser.name.toLowerCase();
        if (date === undefined) {
          date = null;
        }
        var m = moment(date);
        return m.isValid() ? m.format("DD/MM/YYYY") : "";
      };
      $mdDateLocaleProvider.parseDate = function (dateString) {
        var m = moment(dateString, "DD/MM/YYYY", true);
        return m.isValid() ? m.toDate() : new Date(NaN);
      };

      $mdDateLocaleProvider.firstDayOfWeek = 1;

      $routeProvider
        .when("/", {
          //controller: 'LoginController',
          template: "<sd-login></sd-login>",
        })

        /*.when('/detalle/polizas', {
	        	template: '<detalle-sd></detalle-sd>'
	        })*/

        .when("/detalle/cliente", {
          template: '<detalle-sd tipo="clientes"></detalle-sd>',
        })

        .when("/busqueda_presupuestos", {
          template: "<busqueda-presupuesto></busqueda-presupuesto>",
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

        // .when('/renovacion-polizas', {
        // 	template: '<renovacion-polizas-app></renovacion-polizas-app>'
        // })

        .when("/estadisticas_movil", {
          template: "<estadisticas-movil-app></estadisticas-movil-app>",
        })
        .when("/tarificador_hogar", {
          template: "<sd-hogar></sd-hogar>",
        })
        .when("/area_privada", {
          template: "<sd-tarificador></sd-tarificador>",
        })
        .when("/entregas", {
          template: "<sd-entregas></sd-entregas>",
        })
        .when("/generacion_token", {
          template: "<sd-generar-token></sd-generar-token>",
        })
        .when("/recuperar_codigo_pin", {
          template: "<sd-recuperar-codigo-pin></sd-recuperar-codigo-pin>",
        })
        .when("/preciario_terminales", {
          template: "<sd-preciario-terminales></sd-preciario-terminales>",
        })
        .when("/consentimientos", {
          template:
            "<sd-consentimientos-terminales></sd-consentimientos-terminales>",
        })
        .when("/ampliar_fecha_terminal", {
          template: "<sd-ampliar-fecha-terminal></sd-ampliar-fecha-terminal>",
        })
        .when("/nuevo_cliente", {
          template: "<sd-cliente></sd-cliente>",
        })
        .when("/recibos_devueltos_dashboard", {
          template:
            "<sd-recibos-devueltos-dashboard></sd-recibos-devueltos-dashboard>",
        })

        .when("/movil_dashboard", {
          template: "<sd-movil-dashboard></sd-movil-dashboard>",
        })

        .when("/informes_list", {
          template: "<sd-informes></sd-informes>",
        })

        .when("/informes_siniestros_list", {
          template: "<sd-informes-siniestros></sd-informes-siniestros>",
        })

        .when("/documentacion", {
          template: "<documentacion-app></documentacion-app>",
        })

        .when("/broker", {
          template: "<broker-app></broker-app>",
        })

        .when("/ficheros_subir_fichero:nombre", {
          template: "<sd-up-file></sd-up-file>",
        })

        .when("/ficheros_subir_fichero", {
          template: "<sd-up-file></sd-up-file>",
        })

        .when("/ficheros_subir_facturas", {
          template: "<sd-up-file></sd-up-file>",
        })

        .when("/simulacion_tarifas", {
          template: "<simulacion-app></simulacion-app>",
        })

        .when("/renovacion_polizas", {
          template: "<polizas-app></polizas-app>",
        })

        .when("/recibos_impresion", {
          template: "<impresion-app></impresion-app>",
        })

        .when("/polizas_list/:param", {
          template: "<busqueda-app></busqueda-app>",
        })

        .when("/mediador_new", {
          template: "<mediador-sd></mediador-sd>",
        })

        .when("/mediador_new1", {
          template: "<detalle-mediador></detalle-mediador>",
        })

        .when("/:nombre", {
          template: "<busqueda-app></busqueda-app>",
        })

        .when("/impuestos/:param", {
          template: "<impuestos-app></impuestos-app>",
        });

      /*.when('/busqueda/:nombre/:id', {
	        	template: '<busqueda-app></busqueda-app>'
	        })
	        .when('/pendientes/:nombre', {
	        	template: '<busqueda-app></busqueda-app>'
	        })*/

      //.otherwise({ redirectTo: '/' });
      //Para evitar de guardar caches!
      if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
      }

      // Answer edited to include suggestions from comments
      // because previous version of code introduced browser-related errors

      //disable IE ajax request caching
      $httpProvider.defaults.headers.get["If-Modified-Since"] =
        "Mon, 26 Jul 1997 05:00:00 GMT";
      // extra
      $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache";
      $httpProvider.defaults.headers.get["Pragma"] = "no-cache";

      $translateProvider
        .useStaticFilesLoader({
          prefix: BASE_SRC + "/app-localization/locale-",
          suffix: ".json",
        })
        .preferredLanguage(window.navigator.language.slice(0, 2))
        .useSanitizeValueStrategy("sanitizeParameters");

      /*
		$httpProvider.interceptors.push(['$q', 'version', function($q, version) {
			return {
				'request': function (request) {
					if (request.url.substr(-5) == '.html') {
						request.params = {
							v: version
						}
					}
					return $q.resolve(request);
				}
			}
		}]);
		*/
      $mdIconProvider
        .icon("ico-documentacion", "src/img/broker/ico_documentacion.svg", 15)
        .icon("ico-formacion", "src/img/broker/ico_formacion.svg", 15)
        .icon("ico-noticias", "src/img/broker/ico_noticias.svg", 15)
        .icon("ico-emailing", "src/img/broker/ico_emailing.svg", 15);
    },
  ]);

  ng.module("App").run([
    "$rootScope",
    "$location",
    "$cookies",
    "$http",
    "$window",
    "version",
    "TiposService",
    function appRun(
      $rootScope,
      $location,
      $cookies,
      $http,
      $window,
      version,
      TiposService
    ) {
      // keep user logged in after page refresh
      $rootScope.globals = $cookies.getObject("globals") || {};
      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common["Authorization"] =
          "Basic " + $rootScope.globals.currentUser.authdata;
      }

      $rootScope.$on("$locationChangeStart", function (event, next, current) {
        // redirect to login page if not logged in and trying to access a restricted page
        var restrictedPage =
          $.inArray($location.path(), [
            "/login",
            "/register",
            "/passforgotten",
          ]) === -1;
        var loggedIn = $rootScope.globals.currentUser;
        if (restrictedPage && !loggedIn) {
          localStorage.clear();
          $location.path("/");
        }
      });

      $rootScope.lang = "es";

      // $window.addEventListener('focus', $rootScope.checkVersion);
    },
  ]);

  ng.module("App").filter("trusted", [
    "$sce",
    function ($sce) {
      return function (url) {
        return $sce.trustAsResourceUrl(url);
      };
    },
  ]);
})(window.angular);
