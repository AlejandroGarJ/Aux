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
							errors='Error de documento';
						}
						else errors="";
	    			}else{
	    				if(!validateCIF(values)){
							errors='Error de documento';
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