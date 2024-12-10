(function () {
    'use strict';

    angular
        .module('App')
        .factory('UsuarioWSService', UsuarioWSService);

    //Es un servicio de busqueda como hacer las consultas.
    UsuarioWSService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', '$window', 'BASE_CON'];
    function UsuarioWSService($http, $cookies, $rootScope, $timeout, $window, BASE_CON) {

     	var coToken = _.get($rootScope, 'globals.currentUser.coToken');
    	var token = _.get($rootScope, 'globals.currentUser.token');
    	token = token || '';
    	
        var service = {};
        service.saveUser = saveUser;
        service.getUserPermisos = getUserPermisos;
        service.getUserByCia = getUserByCia;
        service.saveLanguageUser = saveLanguageUser;
        service.getListUsuarios = getListUsuarios;
        service.reactivaUsuario = reactivaUsuario;
        service.desbloquearUsuario = desbloquearUsuario;
        return service;     
        
        
        function saveUser(json) {
            var url=BASE_CON+"/usuariosWS/saveUser";
            return post(url,token,json);
        }
        
        function getUserPermisos(json){
        	var url=BASE_CON+"/usuariosWS/getUserPermisos";
            return post(url,token,json);
        }
        
        function getUserByCia(id){
        	var url=BASE_CON+"/usuariosWS/getUserByCia/" + id;
            return get(url,token);
        }
        
        function saveLanguageUser(lang){
        	var url=BASE_CON+"/usuariosWS/saveLanguageUser/" + lang;
            return get(url,token);
        }
        
        function getListUsuarios(json){
	    	var url = BASE_CON+'/usuariosWS/getListUsuarios';
	    	return post(url,token,json);
        }
        
        //Reactivar usuario
        function reactivaUsuario(user) {
            var url=BASE_CON+"/usuariosWS/reactivaUsuario/" +user;
            return get(url,token);
        }

        //Desbloquear usuario
        function desbloquearUsuario(user) {
            var url=BASE_CON+"/usuariosWS/desbloquearUsuario/" +user;
            return get(url,token);
        }
        
        //Get
        function post(url, token, json){
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';

            if (json != null && url != `${BASE_CON}/usuariosWS/saveUser`) {
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
         	coToken = _.get($rootScope, 'globals.currentUser.coToken');
        	token = _.get($rootScope, 'globals.currentUser.token');
        	token = token || '';
        	return $http({
                method: 'GET',
                url: url,
                headers: {'Authorization': coToken + ' ' + token , 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}	//Permiso para la petición.
            });
        }
    };
    
})();