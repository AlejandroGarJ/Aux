var getSiniestros = function(response){
	
	var respuesta;
	
	if(response.data.NUMERO_SINIESTROS>0){
		$.each(response.data.SINIESTROS.SINIESTRO, function(index, value) {
            var fdApertura = response.data.SINIESTROS.SINIESTRO[index].FD_APERTURA;
            var fdOcurrencia = response.data.SINIESTROS.SINIESTRO[index].FD_OCURRENCOMPANIA;
            if(fdApertura != null && fdApertura != ""){
            	var n2 = response.data.SINIESTROS.SINIESTRO[index].FD_APERTURA.indexOf(':');
            	fdApertura = fdApertura.substring(0, n2 != -1 ? n2-3 : fdApertura.length);
            	response.data.SINIESTROS.SINIESTRO[index].FD_APERTURA = fdApertura;                                	
            }
            if(fdOcurrencia != null && fdOcurrencia != ""){
            	var n2 = response.data.SINIESTROS.SINIESTRO[index].FD_OCURRENCOMPANIA.indexOf(':');
            	fdOcurrencia = fdOcurrencia.substring(0, n2 != -1 ? n2-3 : fdOcurrencia.length);
            	response.data.SINIESTROS.SINIESTRO[index].FD_OCURRENCOMPANIA = fdOcurrencia;                                	
            }
            
        });

		respuesta = {
			"list_total": response.data.NUMERO_SINIESTROS,
			"list_datos" : response.data.SINIESTROS.SINIESTRO,
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