var getProcesos = function(response){
	var respuesta;

	if(response.data.NU_PROCESOS>0){
		$.each(response.data.PROCESOS, function(index, value) {
            var fechaInicio = response.data.PROCESOS[index].FT_USU_ALTA;
            var fechaEmision = response.data.PROCESOS[index].FT_USU_MOD;

            if(fechaInicio != null && fechaInicio != ""){
            	var n2 = response.data.PROCESOS[index].FT_USU_ALTA.indexOf(':');
            	fechaInicio = fechaInicio.substring(0, n2 != -1 ? n2-3 : fechaInicio.length);
            	response.data.PROCESOS[index].FT_USU_ALTA = fechaInicio;                                    	
            }
            if(fechaEmision != null && fechaEmision != ""){
            	var n2 = response.data.PROCESOS[index].FT_USU_MOD.indexOf(':');
            	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-3 : fechaEmision.length);
            	response.data.PROCESOS[index].FT_USU_MOD = fechaEmision;                                    	
            }
        });
		respuesta = {
			"list_total": response.data.NU_PROCESOS,
			"list_datos" : response.data.PROCESOS,
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