var getAseguradoras = function(response){
	
	var respuesta;
	
	if(response.data.NUMERO_ASEGURADORAS>0){
		$.each(response.data.ASEGURADORAS.ASEGURADORA, function(index, value) {
            var fdCreado = response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_ALTA;
            var fdModificado = response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_MOD;
            if(fdCreado != null && fdCreado != ""){
            	var n2 = response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_ALTA.indexOf(':');
            	fdCreado = fdCreado.substring(0, n2 != -1 ? n2-3 : fdCreado.length);
            	response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_ALTA = fdCreado;                                	
            }
            if(fdModificado != null && fdModificado != ""){
            	var n2 = response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_MOD.indexOf(':');
            	fdModificado = fdModificado.substring(0, n2 != -1 ? n2-3 : fdModificado.length);
            	response.data.ASEGURADORAS.ASEGURADORA[index].FT_USU_MOD = fdModificado;                                	
            }

        });

		respuesta = {
			"list_total": response.data.NUMERO_ASEGURADORAS,
			"list_datos" : response.data.ASEGURADORAS.ASEGURADORA,
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