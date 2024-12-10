(function () {
    'use strict';

    angular
        .module('App')
        .factory('LocalidadesService', LocalidadesService);

    //Es un servicio de busqueda como hacer las consultas.
    LocalidadesService.$inject = ['$http', '$rootScope', 'BASE_CON','BASE_SRC','$mdDialog'];
    function LocalidadesService($http, $rootScope, BASE_CON, BASE_SRC,$mdDialog) {
    	
        var service = {};
        service.elegirLocalidad = elegirLocalidad;
        return service;     
       
        function elegirLocalidad(localidades,datos, setDatosSL){
    		$mdDialog.show({
    			templateUrl: BASE_SRC+'localidades/localidades.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;

    		    	md.localidades = localidades;
    		    	md.setDatosSL = setDatosSL;
    				
    		    	md.elegirLocalidad = function(localidad){
    		    		datos.ID_LOCALIDAD = localidad.ID_LOCALIDAD;
    		    		datos.NO_LOCALIDAD = localidad.NO_LOCALIDAD
    		    		
    		    		if (md.setDatosSL == true) {
    		    			datos.CO_PROVINCIA = localidad.CO_PROVINCIA;
    		    			datos.DS__CO_PROVINCIA = localidad.CO_PROVINCIA_INE;
    		    			datos.CO_PROVINCIA_INE = localidad.CO_PROVINCIA_INE;
    		    			datos.CO_MUNICIPIO = localidad.CO_MUNICIPIO;
    		    			datos.CO_POBLACION = localidad.CO_POBLACION;
    		    		}
    		    		
    		    		$mdDialog.hide();
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
    };
    
})();