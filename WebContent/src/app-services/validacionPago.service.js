(function () {
    'use strict';

    angular
        .module('App')
        .factory('ValidacionPagoService', ValidacionPagoService);

    ValidacionPagoService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'BASE_CON'];
    function ValidacionPagoService($http, $cookies, $rootScope, $timeout, BASE_CON) {
    	
    	var service = {};
        service.validarIban = validarIban;
        service.validarCuenta = validarCuenta;
        
        //Para validar cuenta
//        service.calculaDCParcial = calculaDCParcial;
//        service.rellenaCeros = rellenaCeros;
        
        //Para validar IBAN
        service.modulo97 = modulo97;
        service.getnumIBAN = getnumIBAN;
        return service;
        
        function validarIban(IBAN) {
            if(IBAN != undefined){
	            //Se pasa a Mayusculas
	            IBAN = IBAN.toUpperCase();
	            //Se quita los blancos de principio y final.
	            IBAN = IBAN.trim();
	            IBAN = IBAN.replace(/\s/g, ""); //Y se quita los espacios en blanco dentro de la cadena
	
	            var letra1,letra2,num1,num2;
	            var isbanaux;
	            var numeroSustitucion;
	            //La longitud debe ser siempre de 24 caracteres
	            if (IBAN.length != 24) {
	                return false;
	            }
	
	            // Se coge las primeras dos letras y se pasan a números
	            letra1 = IBAN.substring(0, 1);
	            letra2 = IBAN.substring(1, 2);
	            num1 = service.getnumIBAN(letra1);
	            num2 = service.getnumIBAN(letra2);
	            //Se sustituye las letras por números.
	            isbanaux = String(num1) + String(num2) + IBAN.substring(2);
	            // Se mueve los 6 primeros caracteres al final de la cadena.
	            isbanaux = isbanaux.substring(6) + isbanaux.substring(0,6);
	
	            //Se calcula el resto, llamando a la función modulo97, definida más abajo
	            var resto = service.modulo97(isbanaux);
	            if (resto == 1){
	                return true;
	            }else{
	                return false;
	            }
            }
        }

        function modulo97(iban) {
            var parts = Math.ceil(iban.length/7);
            var remainer = "";

            for (var i = 1; i <= parts; i++) {
                remainer = String(parseFloat(remainer+iban.substr((i-1)*7, 7))%97);
            }

            return remainer;
        }

        function getnumIBAN(letra) {
            var ls_letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return ls_letras.search(letra) + 10;
        }
        
//         ============= VALIDAR CUENTA BANCARIA =============
        function validarCuenta(val){
            var banco = val.CO_BANCO;
            var sucursal = val.NO_SUCURSAL;
            var dc = val.NU_DC;
            var cuenta= val.NU_CUENTA;
            var CCC = banco+sucursal+dc+cuenta;
            if (!/^[0-9]{20}$/.test(banco+sucursal+dc+cuenta)){
                return false;
            }
            else
            {
                var valores = new Array(1, 2, 4, 8, 5, 10, 9, 7, 3, 6);
                var control = 0;
                for (var i=0; i<=9; i++)
                control += parseInt(cuenta.charAt(i)) * valores[i];
                control = 11 - (control % 11);
                if (control == 11) control = 0;
                else if (control == 10) control = 1;
                if(control!=parseInt(dc.charAt(1))) {
                    return false;
                }
                control=0;
                var zbs="00"+banco+sucursal;
                for (i=0; i<=9; i++)
                    control += parseInt(zbs.charAt(i)) * valores[i];
                control = 11 - (control % 11);
                if (control == 11) control = 0;
                    else if (control == 10) control = 1;
                if(control!=parseInt(dc.charAt(0))) {
                    return false;
                }
                return true;
            }
        }
        
    };
    
})();