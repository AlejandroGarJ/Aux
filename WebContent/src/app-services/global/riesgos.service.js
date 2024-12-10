var getRiesgos = function(response){
	var respuesta;

	if(response.data.NUMERO_RIESGOS>0){
		$.each(response.data.RIESGOS.RIESGO, function(index, value) {
            var fechaVencimiento = response.data.RIESGOS.RIESGO[index].FT_VENCIMIENTO;

            if(fechaVencimiento != null && fechaVencimiento != ""){
            	var n2 = response.data.RIESGOS.RIESGO[index].FT_VENCIMIENTO.indexOf(':');
            	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-3 : fechaVencimiento.length);
            	response.data.RIESGOS.RIESGO[index].FT_VENCIMIENTO = fechaVencimiento;                                    	
            }
        });
		respuesta = {
			"list_total": response.data.NUMERO_RIESGOS,
			"list_datos" : response.data.RIESGOS.RIESGO,
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