var getPresupuestos = function(response){
	var respuesta;

	if(response.data.NUMERO_PRESUPUESTOS>0){
		$.each(response.data.PRESUPUESTOS, function(index, value) {
            var fechaInicio = response.data.PRESUPUESTOS[index].FT_USU_ALTA;
            var fechaEmision = response.data.PRESUPUESTOS[index].FT_USU_MOD;

            if(fechaInicio != null && fechaInicio != ""){
            	var n2 = response.data.PRESUPUESTOS[index].FT_USU_ALTA.indexOf(':');
            	fechaInicio = fechaInicio.substring(0, n2 != -1 ? n2-3 : fechaInicio.length);
            	response.data.PRESUPUESTOS[index].FT_USU_ALTA = fechaInicio;                                    	
            }
            if(fechaEmision != null && fechaEmision != ""){
            	var n2 = response.data.PRESUPUESTOS[index].FT_USU_MOD.indexOf(':');
            	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-3 : fechaEmision.length);
            	response.data.PRESUPUESTOS[index].FT_USU_MOD = fechaEmision;                                    	
            }
        });
		respuesta = {
			"list_total": response.data.NUMERO_PRESUPUESTOS,
			"list_datos" : response.data.PRESUPUESTOS,
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