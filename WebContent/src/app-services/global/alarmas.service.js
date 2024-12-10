var getAlarmas = function(response){
	
	var respuesta;
	
	if(response.data.NUMERO_ALARMAS>0){
		$.each(response.data.ALARMAS.ALARMA, function(index, value) {
            var fdCreado = response.data.ALARMAS.ALARMA[index].FT_USU_ALTA;
            if(fdCreado != null && fdCreado != ""){
            	var n2 = response.data.ALARMAS.ALARMA[index].FT_USU_ALTA.indexOf(':');
            	fdCreado = fdCreado.substring(0, n2 != -1 ? n2-3 : fdCreado.length);
            	response.data.ALARMAS.ALARMA[index].FT_USU_ALTA = fdCreado;                                	
            }
            
            
        });

		respuesta = {
			"list_total": response.data.NUMERO_ALARMAS,
			"list_datos" : response.data.ALARMAS.ALARMA,
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