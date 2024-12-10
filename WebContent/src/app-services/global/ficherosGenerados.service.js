var getFicherosGenerados = function(response){
	
	var respuesta;
	
	if(response.data.NUMERO_FICHEROS>0){
		$.each(response.data.FICHEROS.FICHERO, function(index, value) {
			var fechaAlta = response.data.FICHEROS.FICHERO[index].FT_USU_ALTA;

            if(fechaAlta != null && fechaAlta != ""){
            	var n2 = response.data.FICHEROS.FICHERO[index].FT_USU_ALTA.indexOf(':');
            	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-3 : fechaAlta.length);
            	response.data.FICHEROS.FICHERO[index].FT_USU_ALTA = fechaAlta;
            }
            
            if(response.data.FICHEROS.FICHERO[index].IN_EJECUTADO)
            	response.data.FICHEROS.FICHERO[index].IN_EJECUTADO = "Si";
            else
            	response.data.FICHEROS.FICHERO[index].IN_EJECUTADO = "No";

        });

		respuesta = {
			"list_total": response.data.NUMERO_FICHEROS,
			"list_datos" : response.data.FICHEROS.FICHERO,
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