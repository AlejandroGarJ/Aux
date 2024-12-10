(function () {
    'use strict';

    angular
        .module('App')
        .factory('FicherosService', FicherosService);

    FicherosService.$inject = ['$http', '$rootScope', '$window', 'BASE_CON'];
    function FicherosService($http, $rootScope, $window, BASE_CON) {
    	
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.getFicheros = getFicheros;
        service.getFicherosDocumentacion = getFicherosDocumentacion;
        service.getFicherosGenerados = getFicherosGenerados;
        service.getErroresFicheros  = getErroresFicheros;
        service.ejecutaFichero = ejecutaFichero;
        service.getCias = getCias;
        service.getFicherosByAseguradora = getFicherosByAseguradora;
        service.getFicherosGenerados = getFicherosGenerados;
        service.uploadAseguradorasFiles = uploadAseguradorasFiles;
        service.download = download;
        service.downloadFichero = downloadFichero;
        service.sendDocumentation = sendDocumentation;
        service.getFicherosType = getFicherosType;
        service.removeDocumentation = removeDocumentation;
        service.avisoFinContrato = avisoFinContrato;
        return service;
       
        function getFicheros(json) {
        	var url=BASE_CON+"/ficheros/getFicheros";
            return post(url,token,json);
        }
        
        function getFicherosDocumentacion(programa, mediador) {
        	var url=BASE_CON+"/ficheros/getFicherosDocumentacion/"+programa;
        	if (mediador != null && mediador != "") {
        		url += "?mediador=" + mediador;
        	}
            return get(url,token);
        }
        
        function getFicherosGenerados(json) {
        	var url=BASE_CON+"/ficheros/getFicherosGenerados";
            return post(url,token,json);
        }
        
        function getCias(tipo) {
        	var url=BASE_CON+"/ficheros/getCias/" + tipo;
            return get(url,token);
        }
        
        function getErroresFicheros (json) {
        	var url=BASE_CON+"/ficheros/getErroresFicheros ";
            return post(url,token,json);
        }
        
        function ejecutaFichero (json) {
        	var url=BASE_CON+"/ficheros/ejecutaFichero ";
            return post(url,token,json);
        }
        
        function getFicherosByAseguradora (id) {
        	var url=BASE_CON+"/ficheros/getFicherosByAseguradora/" + id;
            return get(url,token);
        }
        
        function getFicherosGenerados (id, tipo) {
           url = BASE_CON+'/ficheros/getFicherosByAseguradora/'+id+'?tipo='+tipo;
           return get(url,token);
        }
        
        function uploadAseguradorasFiles (json) {
        	var url=BASE_CON+"/ficheros/uploadAseguradorasFiles";
            return post(url,token,json);
        }
        
        function download (id) {
        	var url=BASE_CON+"/ficheros/download/" + id;
            return getBlob(url,token);
        }
        
        function downloadFichero (json) {
        	var url=BASE_CON+"/ficheros/downloadAseg";
            return postBlob(url,token,json);
        }
        
        //Recuperar documentación ya subida
        function getFicherosType (json) {
        	var url=BASE_CON+"/ficheros/getFicherosType";
            return post(url,token,json);
        }
        
        //Enviar documentación
        function sendDocumentation(json, tipo){
            var url=BASE_CON+"/"+ tipo +"/subirDocumentacion";
            return post(url,token,json);
        }
        
      //Borrar documentación
        function removeDocumentation(id){
            var url=BASE_CON+"/ficheros/delete/"+ id;
            return fDelete(url,token,id);
        }
        
        //Guardar aviso
        function avisoFinContrato (json) {
            var url=BASE_CON+"/ficheros/avisoFinContrato";
            return put(url,token,json);
        }
        
        //Download
          function postBlob(url, token, json){
          	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
          	token = _.get($rootScope, 'globals.currentUser.token');
          	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
          	return $http({
          		responseType: 'blob',
                  method: 'POST',
                  url: url,
                  data: json,
                  headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
              });
          }
          
          //Download
            function getBlob(url, token){
            	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
            	token = _.get($rootScope, 'globals.currentUser.token');
            	token = token || '';
            	return $http({
            		responseType: 'blob',
                    method: 'GET',
                    url: url,
                    headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
                });
            }
        
        //Put
        function put(url, token, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'PUT',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
        
        //Post
        function post(url, token, json){
        	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';

            if (json != null) {
            	json.ID_ROL = _.get($rootScope, 'globals.currentUser.idRol');
            }
            
        	return $http({
                method: 'POST',
                url: url,
                data: json,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
        
      //Get
      function get(url, token){
      	  var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	  token = _.get($rootScope, 'globals.currentUser.token');
      	  token = token || '';
    	  return $http({
              method: 'GET',
              url: url,
              headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
          });
      }
      
    //Delete
      function fDelete(url, token){
      	  var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	  token = _.get($rootScope, 'globals.currentUser.token');
      	  token = token || '';
    	  return $http({
              method: 'DELETE',
              url: url,
              headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
          });
      }
        
    };
    
})();