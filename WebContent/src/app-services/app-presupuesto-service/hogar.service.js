(function () {
    'use strict';

    angular
        .module('App')
        .factory('HogarService', HogarService);


    HogarService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function HogarService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

        
    	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';

    	var apisSL = false;
        var service = {};
        service.getProvincias = getProvincias;
        service.getMunicipios = getMunicipios;
        service.getVias = getVias;
        service.getDatosCatastralesDir = getDatosCatastralesDir;

        service.getLocalidades = getLocalidades;
        service.getTiposVia = getTiposVia;
        service.getPlantilla = getPlantilla;

        service.getTiposVivienda = getTiposVivienda;
        service.getRegimenesVivienda = getRegimenesVivienda;
        service.getUsosVivienda = getUsosVivienda;
        service.getSituacionesVivienda = getSituacionesVivienda;
        service.getTiposVivienda2 = getTiposVivienda2;
        service.getRegimenesVivienda2 = getRegimenesVivienda2;
        service.getUsosVivienda2 = getUsosVivienda2;
        service.getBancos = getBancos;

        service.getCapitales = getCapitales;
        service.setCapitales = setCapitales;
        service.tarifica = tarifica;
        service.tarificaIndividual = tarificaIndividual;
        service.emite = emite;
        service.validaDireccion = validaDireccion;
        service.fraccionamiento = fraccionamiento;

        service.descargarPresupuesto = descargarPresupuesto;
        service.condicionadoPresupuesto = condicionadoPresupuesto;
        service.getNormalizadorDirecciones= getNormalizadorDirecciones;
        service.validaDireccionNormalizada = validaDireccionNormalizada;
        service.valDirReferenciaCatastral = valDirReferenciaCatastral;

        return service;

        function validaDireccion(json, codAseguradora) {
        	var url = BASE_CON + '/external/validaDireccion/' + codAseguradora;
            return post(url, token, json);
        }
        
        function getProvincias() {
        	var url = BASE_CON + '/catastro/getProvincias';
        	var json = {};
            return get(url, token, json);
        }
        
        function getMunicipios(json) {
        	var url = BASE_CON + '/catastro/getMunicipios';
            return post(url, token, json);
        }

        function getVias(json, aseguradora) {
        	var url = "";
        	apisSL = getApisSL();
        	if (apisSL == true) {
                url = BASE_CON + '/catastro/getVias/' + aseguradora;
        	} else {
                url = BASE_CON + '/catastro/getVias';
        	}
            return post(url, token, json);
        }

        function getDatosCatastralesDir(json, aseguradora) {
        	var url = "";
        	apisSL = getApisSL();
        	if (apisSL == true) {
                url = BASE_CON + '/catastro/getDatosCatastralesDir';
                
                if (aseguradora != null) {
                    url +=  "/" + aseguradora;
                }
        	} else {
            	url = BASE_CON + '/catastro/getDatosCatastralesDir';
        	}

            return post(url, token, json);
        }


        function getLocalidades(json, aseguradora) {
        	var url = "";
        	apisSL = getApisSL();
        	if (apisSL == true) {
                url = BASE_CON + '/external/localidades/' + aseguradora + '/' + json;
        	} else {
                url = BASE_CON + '/external/localidades/' + json;
        	}
            return get(url, token, json);
        }

        function getTiposVia(json) {
        	var url = BASE_CON + '/recursos/vias';
            return get(url, token, json);
        }
        
        function getPlantilla(json) {
        	var url = BASE_CON + '/external/getPlantilla/' + json;
            return get(url, token, json);
        }


        function getTiposVivienda(json) {
        	var url = BASE_CON + '/external/getFields/tipoVivienda';
            return get(url, token, json);
        }

        function getRegimenesVivienda(json) {
        	var url = BASE_CON + '/external/getFields/regimenVivienda';
            return get(url, token, json);
        }

        function getUsosVivienda(json) {
        	var url = BASE_CON + '/external/getFields/usoVivienda';
            return get(url, token, json);
        }

        function getSituacionesVivienda(json) {
        	var url = BASE_CON + '/external/getFields/situacionVivienda';
            return get(url, token, json);
        }

        function getTiposVivienda2(json) {
        	var url = BASE_CON + '/external/getFields/tipoVivienda2';
            return get(url, token, json);
        }

        function getRegimenesVivienda2(json) {
        	var url = BASE_CON + '/external/getFields/regimenVivienda2';
            return get(url, token, json);
        }

        function getUsosVivienda2(json) {
        	var url = BASE_CON + '/external/getFields/usoVivienda2';
            return get(url, token, json);
        }

        function getBancos(json) {
        	var url = BASE_CON + '/external/getFields/bancos';
            return get(url, token, json);
        }

        function getCapitales(json, codAseguradora) {
        	var url = BASE_CON + '/external/getCapitales/' + codAseguradora;
            return post(url, token, json);
        }

        function setCapitales(json) {
        	var url = BASE_CON + '/external/setCapitales';
            return post(url, token, json);
        }

        function tarifica(json, codAseguradora) {
        	var url = BASE_CON + '/external/tarifica/' + codAseguradora;
            return post(url, token, json);
        }

        function fraccionamiento(json) {
        	var url = `${BASE_CON}/external/fraccionamiento`;
            return post(url, token, json);
        }
        
        function tarificaIndividual(json) {
        	var url = BASE_CON + '/external/tarificaIndividual';
            return post(url, token, json);
        }
        
        function emite(json) {
        	var url = BASE_CON + '/external/emite';
            return post(url, token, json);
        }
        
        function condicionadoPresupuesto(json) {
            var url = BASE_CON + '/external/condicionadoPresupuesto';
            return getBlob(url, token, json);
        }

        function descargarPresupuesto(json) {
        	var url = BASE_CON + '/presupuestos/getPresupuestoFromDisk';
            return post(url, token, json);
        }

        function getApisSL() {
        	var campo = localStorage.getItem('apisSL');
            if (campo != null && (campo == "true" || campo == true)) {
            	campo = true;
            } else {
            	campo = false;
            }
            return campo;
        }
        
        function getNormalizadorDirecciones(json, id){
        	var url = BASE_CON + '/catastro/getNormalizadorDirecciones/' + id;
        	return post(url, token, json);
        }
        
        function validaDireccionNormalizada(json, id, vivAsegurada){
        	var url = BASE_CON + '/external/validaDireccionNormalizada/' + id + "?aseg=" + vivAsegurada; 
        	return post(url, token, json);
        }
        
        function valDirReferenciaCatastral(json, id){
        	if(id != undefined){
        		var url = BASE_CON + '/catastro/getDireccionCompletaByRC?id=' + id; 
        	}else{
        		var url = BASE_CON + '/catastro/getDireccionCompletaByRC'; 
        	}
        	return post(url, token, json);
        }
        
        // Get
        function get(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }

        // Post
        function post(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }
        
        function getBlob(url, token, json){
            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                responseType: 'arraybuffer',
                headers: {'Authorization': token , 'Content-Type': 'application/json'}	//Permiso para la petición.
            });
        }
    };
    
})();