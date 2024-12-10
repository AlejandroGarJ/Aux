var getPolizas = function(response){
	var respuesta;

		//console.log(response.data);
	if(response.data.NUMERO_POLIZAS>0){
		$.each(response.data.POLIZAS.POLIZA, function(index, value) {
            var fechaEfecto = response.data.POLIZAS.POLIZA[index].FD_INICIO;
            var fechaVencimiento = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO;
            var fechaEmision = response.data.POLIZAS.POLIZA[index].FD_EMISION;
            var fechaAlta = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA;
            var fechaMod = response.data.POLIZAS.POLIZA[index].FT_USU_MOD;

            if(fechaEfecto != null && fechaEfecto != ""){
            	var n2 = response.data.POLIZAS.POLIZA[index].FD_INICIO.indexOf(':');
            	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-3 : fechaEfecto.length);
            	response.data.POLIZAS.POLIZA[index].FD_INICIO = fechaEfecto;                                    	
            }

            if(fechaVencimiento != null && fechaVencimiento != ""){
            	var n2 = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO.indexOf(':');
            	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-3 : fechaVencimiento.length);
            	response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO = fechaVencimiento;
            }
            
            // if(fechaEmision != null && fechaEmision != ""){
            // 	var n2 = response.data.POLIZAS.POLIZA[index].FD_EMISION.indexOf(':');
            // 	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-3 : fechaEmision.length);
            // 	response.data.POLIZAS.POLIZA[index].FD_EMISION = fechaEmision;
            // }
            
            if(fechaAlta != null && fechaAlta != ""){
            	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA.indexOf(':');
            	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-3 : fechaAlta.length);
            	response.data.POLIZAS.POLIZA[index].FT_USU_ALTA = fechaAlta;
            }
            
            if(fechaMod != null && fechaMod != ""){
            	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_MOD.indexOf(':');
            	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-3 : fechaMod.length);
            	response.data.POLIZAS.POLIZA[index].FT_USU_MOD = fechaMod;
            }
            
            var list = response.data.POLIZAS.POLIZA[index].LST_ASEGURADOS;
    		angular.forEach(list, function(values,key){
    			if(values.ID_TIPO_CLIENTE == 1){
    				response.data.POLIZAS.POLIZA[index].pagador = list[key];
    			}
    			else if(values.ID_TIPO_CLIENTE == 2){
    				response.data.POLIZAS.POLIZA[index].asegurados = list[key];
    			}
				else if(values.ID_TIPO_CLIENTE == 3){
    				response.data.POLIZAS.POLIZA[index].tomador = list[key];
    			}
				else if(values.ID_TIPO_CLIENTE == 14){
    				response.data.POLIZAS.POLIZA[index].autorizado = list[key];
    			}
    			else{
    				response.data.POLIZAS.POLIZA[index].otros = list[key];
    			}
    		});
            
        });
		respuesta = {
			"list_total": response.data.NUMERO_POLIZAS,
			"list_datos" : response.data.POLIZAS.POLIZA,
			"status" : response.status,
		}
	}
	else{
		respuesta = {
			"status" : response.status
		}	
	}
	
	return respuesta;
	
}