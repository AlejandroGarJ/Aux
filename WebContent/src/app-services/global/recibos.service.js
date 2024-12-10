var getRecibos = function(response){
	var respuesta;
	if(response.data.ID_RESULT == 0){
		if(response.data.NUMERO_RECIBOS>0){
			$.each(response.data.RECIBOS.RECIBO, function(index, value) {
	            var fechaInicio = response.data.RECIBOS.RECIBO[index].FD_INICIO_REC;
	            var fechaEmision = response.data.RECIBOS.RECIBO[index].FD_EMISION;
	            var fechaSap = response.data.RECIBOS.RECIBO[index].FD_SAP;
	            var fechaVcto = response.data.RECIBOS.RECIBO[index].FD_VCTO_REC;
	
	            if(fechaInicio != null && fechaInicio != ""){
	            	var n2 = response.data.RECIBOS.RECIBO[index].FD_INICIO_REC.indexOf(':');
	            	fechaInicio = fechaInicio.substring(0, n2 != -1 ? n2-3 : fechaInicio.length);
	            	response.data.RECIBOS.RECIBO[index].FD_INICIO_REC = fechaInicio;                                    	
	            }
	            if(fechaEmision != null && fechaEmision != ""){
	            	var n2 = response.data.RECIBOS.RECIBO[index].FD_EMISION.indexOf(':');
	            	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-3 : fechaEmision.length);
	            	response.data.RECIBOS.RECIBO[index].FD_EMISION = fechaEmision;                                    	
	            }
	            if(fechaSap != null && fechaSap != ""){
	            	var n2 = response.data.RECIBOS.RECIBO[index].FD_SAP.indexOf(':');
	            	fechaSap = fechaSap.substring(0, n2 != -1 ? n2-3 : fechaSap.length);
	            	response.data.RECIBOS.RECIBO[index].FD_SAP = fechaSap;                                    	
	            }
	            if(fechaVcto != null && fechaVcto != ""){
	            	var n2 = response.data.RECIBOS.RECIBO[index].FD_VCTO_REC.indexOf(':');
	            	fechaVcto = fechaVcto.substring(0, n2 != -1 ? n2-3 : fechaVcto.length);
	            	response.data.RECIBOS.RECIBO[index].FD_VCTO_REC = fechaVcto;                                    	
	            }
	        });
			respuesta = {
				"list_total": response.data.NUMERO_RECIBOS,
				"list_datos" : response.data.RECIBOS.RECIBO,
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
	respuesta = {
			"ID_RESULT": response.data.ID_RESULT,
			"DS_RESULT": response.data.DS_RESULT,
			"status" : response.status,
		}
	return respuesta;
}