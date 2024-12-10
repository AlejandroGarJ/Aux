(function () {
    'use strict';

    angular
        .module('App')
        .factory('AuthenticationService', AuthenticationService);
    
    
    //Auntenticación del login y tambien para las peticiones.
    AuthenticationService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'UserService', '$window', 'BASE_CON'];
    function AuthenticationService($http, $cookies, $rootScope, $timeout, UserService, $window, BASE_CON) {
        var service = {};

        service.login = login;
        service.loginCode = loginCode;
        service.validateMovistar = validateMovistar;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;
        service.validateToken = validateToken;

        return service;
        
        function login(username, password, mfa) {

            var response;
//            var authdata = hex_md5(Base64.encode(username + ':' + password));
//            var authdata = b64_hmac_md5('Tarificador', Base64.encode(username + ':' + password));
//            var authdata = Base64.encode(username + ':' + password);
            var clave = "2de3d5608c5ec503a4387fda93cffaf2"; //Intermediacion en md5
            var contenido = Base64.encode(username + ':' + password);
            var authdata = cifrarStr(clave, contenido);
            var contentType = 'application/json';
            var url = BASE_CON + '/users/login2a';

            return $http({
                method: 'POST',
                url: url,
                data: '',
               
            	headers: {'Authorization':'TokenP ' + authdata, 'Content-Type': 'application/json', 'tipo-mfa' : + mfa}
            });
        }
        
        function loginCode(codeResponse, codeMail) {

            var response;

            var contenido = Base64.encode(codeResponse + ':' + codeMail);
            var contentType = 'application/json';
            var url = BASE_CON + '/users/login2a';

            return $http({
                method: 'POST',
                url: url,
                data: '',
            	headers: {'Authorization':'TokenF ' + contenido, 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });

        }
        
        function cifrarStr(clave,str){

            var s = [], j = 0, x, res = '';
            for (var i = 0; i < 256; i++) {
                s[i] = i;
            }
            for (i = 0; i < 256; i++) {
                j = (j + s[i] + clave.charCodeAt(i % clave.length)) % 256;
                x = s[i];
                s[i] = s[j];
                s[j] = x;
            }
            i = 0;
            j = 0;
            for (var y = 0; y < str.length; y++) {
                i = (i + 1) % 256;
                j = (j + s[i]) % 256;
                x = s[i];
                s[i] = s[j];
                s[j] = x;
                res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
            }
            return btoa(res);
        }

        
        function validateMovistar (token) {
            var response;
            var contentType = 'application/json';
            var url = BASE_CON + '/users/validateSSOMovistar';

            return $http({
                method: 'POST',
                url: url,
                data: {},
                headers: {'Authorization':"TokenM " + token, 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }

        function validateToken (token) {
            var url = BASE_CON + '/users/validateToken';
            return $http({
                method: 'POST',
                url: url,
                data: {},
                headers: {'Authorization':"Token " + token, 'Content-Type': 'application/json', 'lang': $window.sessionStorage.lang}
            });
        }

        function SetCredentials(username, token, coToken, idRol) {

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    token: token,
                    coToken: coToken,
                    idRol: idRol
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