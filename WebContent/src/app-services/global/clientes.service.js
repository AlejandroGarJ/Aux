var getClientes = function(response){
	
	var respuesta;
	
	if(response.data.NUMERO_CLIENTES>0){
		$.each(response.data.CLIENTES.CLIENTE, function(index, value) {
            var fechaNacimiento = response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO;
            var fechaCarnet = response.data.CLIENTES.CLIENTE[index].FD_CARNET;
            if(fechaNacimiento != null && fechaNacimiento != ""){
            	var n2 = response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO.indexOf(':');
            	fechaNacimiento = fechaNacimiento.substring(0, n2 != -1 ? n2-3 : fechaNacimiento.length);
            	response.data.CLIENTES.CLIENTE[index].FD_NACIMIENTO = fechaNacimiento;                                	
            }
            if(fechaCarnet != null && fechaCarnet != ""){
            	var n2 = response.data.CLIENTES.CLIENTE[index].FD_CARNET.indexOf(':');
            	fechaCarnet = fechaCarnet.substring(0, n2 != -1 ? n2-3 : fechaCarnet.length);
            	response.data.CLIENTES.CLIENTE[index].FD_CARNET = fechaCarnet;                                	
            }
            
            if(response.data.CLIENTES.CLIENTE[index].IN_CLIENTE_VIP){
    			response.data.CLIENTES.CLIENTE[index].IN_CLIENTE_VIP="SI";
    		}else{
    			response.data.CLIENTES.CLIENTE[index].IN_CLIENTE_VIP="NO";
    		}
    		if(response.data.CLIENTES.CLIENTE[index].IN_LOPD){
    			response.data.CLIENTES.CLIENTE[index].IN_LOPD="SI";
    		}else{
    			response.data.CLIENTES.CLIENTE[index].IN_LOPD="NO";
    		}
    		if(response.data.CLIENTES.CLIENTE[index].IN_PUBLICIDAD){
    			response.data.CLIENTES.CLIENTE[index].IN_PUBLICIDAD="SI";
    		}else{
    			response.data.CLIENTES.CLIENTE[index].IN_PUBLICIDAD="NO";
    		}
            
        });
        
		

		respuesta = {
			"list_total": response.data.NUMERO_CLIENTES,
			"list_datos" : response.data.CLIENTES.CLIENTE,
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