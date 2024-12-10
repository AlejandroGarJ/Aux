(function(ng) {	


	//Crear componente de app
    var solicitudReclamacionComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$q', '$location', '$window', '$mdDialog', '$timeout', 'BASE_SRC', 'TiposService','PolizaService', 'BusquedaService', 'SolicitudService', 'MotorService', 'LocalidadesService','AseguradoraService', '$templateCache'],
    		require: {
            	parent:'^sdApp',
				busqueda: '^busquedaApp',
				busquedaReclamaciones: '^busquedaReclamaciones'
            },
            bindings: {
            	tipoHead:'<',
            	detalleCliente:'<'
            }
    }
//    /ciaRamoProducto/getRamoCompania    id_ramo
    solicitudReclamacionComponent.controller = function solicitudReclamacionComponentControler($scope, $q, $location, $window, $mdDialog, $timeout, BASE_SRC, TiposService, PolizaService, BusquedaService, SolicitudService, MotorService, LocalidadesService, AseguradoraService, $templateCache){
    	var vm=this;
    	vm.noPoliza = false;
    	vm.polbuscadas = false;
    	vm.msg = $mdDialog.alert();
		vm.msg.ok('Aceptar');
		vm.msg.clickOutsideToClose(true);
		vm.compania = false;
    	
    	this.$onInit = function(){
    		
    		TiposService.getRamos({"IN_CONSULTA": true})
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.ramosFiltrados = response.data.TIPOS.TIPO;
                }
			}, function callBack(response){
					if(response.status == 406 || response.status == 401){
	                	vm.parent.logout();
	                	$location.path('/');
	                }
			});
    		
	    		TiposService.getSituaCliente({})
	    		.then(function successCallback(response){
	     			if(response.status == 200){
	     				if(response.data.ID_RESULT == 0){
	     					vm.companias = response.data.TIPOS.TIPO;
	     				}
	     			}
	    		}, function callBack(response){
	    			if(response.status == 406 || response.status == 401){
	                	vm.parent.logout();
	                	$location.path('/');
	                }
	    		});
	    		
				if($location.$$url == '/reclamaciones_list'){
	    			vm.medida = 220;
	    		}
    	}
    	
    	this.$onChanges = function(){
    	}
    	
    	this.loadTemplate=function(){
    			return "src/solicitud/tipos.solicitud/solicitud.reclamacion.html";
    	}
    	
    	//Busqueda del cliente por documento
    	vm.busClient = function(documento){
    		if(documento != undefined &&  documento != null && documento != ' '){
	    		BusquedaService.buscar({"NU_DOCUMENTO": documento }, "clientes")
		 		.then(function successCallback(response){
		 			if(response.status == 200){
		 				if(response.data.ID_RESULT == 0){
			  	 			if(response.data.NUMERO_CLIENTES > 0 ){
			  	 				vm.form.OCLIENTE = response.data.CLIENTES.CLIENTE[0];	
				  	 				if(vm.companias.find( data => data.ID_SITUACION_CLIENTE == vm.form.OCLIENTE.ID_SITUACION_CLIENTE)){
				  						vm.dsSituacion = vm.companias.find( data => data.ID_SITUACION_CLIENTE == vm.form.OCLIENTE.ID_SITUACION_CLIENTE).DS_SITUACION_CLIENTE;
				  						vm.compania = true;
				  						vm.idSituacion = vm.form.OCLIENTE.ID_SITUACION_CLIENTE;
				  	 				}
			  	 			}else{
			  	 				vm.form.OCLIENTE = [];
			  	 				vm.compania = false;
			  	 			}
		 				}else{
							vm.msg.textContent(response.data.DS_RESULT)
						    $mdDialog.show(vm.msg);
		 				}
		 			}
		 		});
    		}
    	}	
    	
    	//Autocomplete compañias
    	vm.filtrarAseg = function(query, list, key){
    		var results = query ? list.filter( createFilterFor(query, key) ) : list;
    		var deferred;
    		if (self.simulateQuery) {
		        deferred = $q.defer();
		        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		        return deferred.promise;
    		}
    		else {
		        return results;
		    }
    	}
    	
    	function createFilterFor(query, key) {
			var uppercaseQuery = query.toUpperCase();
    		return function filterFn(list) {
				if(key == 'DS_SITUACION_CLIENTE')
					return (list[key].indexOf(uppercaseQuery) >= 0);
                else
					return (list[key].indexOf(uppercaseQuery) === 0);
			};
        }

    	
    	//buscar polizas del cliente seleccionado
    	vm.buscarPolizas = function(idCliente, idRamo) {    
    		vm.polizas = [];
    		
    		PolizaService.getPolizasByFilter({"LST_ASEGURADOS":
    								[{"NU_DOCUMENTO": idCliente}],
    								"ID_RAMO": idRamo})
    		.then(function successCallback(response){	
	 			if(response.status == 200){
	 				if(response.data.NUMERO_POLIZAS == 0){
	 					vm.noPoliza = true;
	 					vm.polbuscadas = true;
	 				}
	 				if(response.data.ID_RESULT == 0){
	 					vm.polizas = response.data.POLIZAS.POLIZA;
	 					vm.polbuscadas = true;
	 					vm.noPoliza = false;
	 					vm.getMotivosReclamacion(idRamo);
	 				}
	 			}else{
	 				vm.msg.textContent(response.data.DS_RESULT)
				    $mdDialog.show(vm.msg);
	 			}	 						  	
    		});
    	}

    	
    	//Buscar motivos de la consulta según el filtro seleccionado
    	vm.getMotivosReclamacion = function(idRamo){
    		
	    	TiposService.getMotivosConsultas(idRamo)
	        .then(function successCallback(response) {
	            if (response.status == 200) {
	                vm.motivos = response.data.TIPOS.TIPO;   
	            }
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
	            	vm.parent.logout();
	            	$location.path('/');
	            }
			});
    	}
    	 	
    	vm.nuevaSolicitudReclamacion = function(){
    		var hoy = new Date();
    		
    		if(vm.form.OPOLIZA == 0){
    			vm.msg.textContent("Elíja una póliza sobre la que hacer la reclamación.")
			    $mdDialog.show(vm.msg);
    			return;
    		}
    		
    		vm.perfilLogeado = JSON.parse($window.sessionStorage.perfil);
			vm.form = {...vm.form,
				'CO_USU_EMISOR': vm.perfilLogeado.usuario,
				'CO_USU_RECEPTOR': vm.perfilLogeado.usuario,
				'NO_USU_EMISOR': vm.perfilLogeado.nombreCompleto,
				'NO_USU_ALTA': vm.perfilLogeado.nombreCompleto,
				'NO_USUARIO': vm.perfilLogeado.nombreCompleto,
				'ID_SITUACION_SOLICITUD': 1,
				"IN_ENVIO_DOCUMENTACION": true,
				"IN_ENVIO_MAIL_CLIENTE": true,
			}
			
			if(vm.form.OPOLIZA != 0){               
                vm.form.CONSULTA_EXTERNA.DATOS_POLIZA = {...vm.form.CONSULTA_EXTERNA.DATOS_POLIZA,
                		"ID_RAMO" : vm.form.OPOLIZA.ID_RAMO,
                		"ID_COMPANIA" : vm.form.OPOLIZA.ID_COMPANIA,
                }
			}
			
			if(vm.form.CONSULTA_EXTERNA.ID_MOTIVO != undefined){
				vm.dsMotivo = vm.motivos.find( data => data.ID_MOTIVO == vm.form.CONSULTA_EXTERNA.ID_MOTIVO).DS_MOTIVO;
				vm.inTelefono = vm.motivos.find( data => data.ID_MOTIVO == vm.form.CONSULTA_EXTERNA.ID_MOTIVO).IN_TELEFONO;
			}
			
			if(vm.dsSituacion == undefined){				
				vm.form.OCLIENTE = {...vm.form.OCLIENTE,
						"ID_SITUACION_CLIENTE" : vm.tipoAseguradoraSeleccionada.ID_SITUACION_CLIENTE,
						"DS_SITUACION_CLIENTE" : vm.tipoAseguradoraSeleccionada.DS_SITUACION_CLIENTE,
					}
			}
			
			vm.form.CONSULTA_EXTERNA = {...vm.form.CONSULTA_EXTERNA,
			    "DS_MOTIVO" : vm.dsMotivo,
			    "IN_TELEFONO" : vm.inTelefono,
			}
			
			vm.form.OTIPO_SOLICITUD = {...vm.form.OTIPO_SOLICITUD,
				 "DS_TIPO_SOLICITUD": "Consulta Externa",
				 "ID_TIPO_SOLICITUD": 34,
				}

			vm.form.CONSULTA_EXTERNA.XML_OBSERVACIONES = {...vm.form.CONSULTA_EXTERNA.XML_OBSERVACIONES,
				    "IN_FD_EFECTO" : 1,
				    "FD_EFECTO" : hoy,
				}
			
	    	if(vm.listaArchivos != undefined && vm.listaArchivos.length > 0) {
				vm.form.LIST_ARCHIVOS = vm.listaArchivos;
			}
	    	
	    	vm.solicitud = JSON.parse(JSON.stringify(vm.form));
	    	vm.parent.abrirModalcargar(true);
			SolicitudService.nuevaSolicitud(vm.solicitud)
			.then(function successCallBack(response) {
				if(response.status == 200) {
					if(response.data.ID_RESULT == 0){
						 if(response.data.ID_RESULT != null && response.data.ID_RESULT != undefined){
				                delete response.data.ID_RESULT;
				                delete response.data.DS_RESULT;
				            }
						vm.parent.cambiarDatosModal('Reclamación creada correctamente');
	
						vm.solicitudCreada = response.data;

						if(vm.busquedaReclamaciones.numDetalles.length > 0) {
							vm.busquedaReclamaciones.numDetalles.splice(0, 1);
						}
						vm.busquedaReclamaciones.numDetalles.push(vm.solicitudCreada);
						}else{
							vm.msg.textContent(response.data.DS_RESULT)
						    $mdDialog.show(vm.msg);
						}
					}
			}, function errorCallBack(response) {
				if(response.status == 500){
					vm.parent.cambiarDatosModal('Se ha producido un error al crear la nueva reclamación. Contacte con el administrador');
                }
			});		
		}

    	
    	
  //Servicio ficheros adjuntos
		vm.deleteFile = function(file){
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].name === file.name){
					vm.listaArchivos.splice(i,1);
					break;
				}
			}
		}
		$(document).on('change', '#file_sr', function() {
			vm.subir();
		});
		
		vm.subir = function() {
			var f = document.getElementById('file_sr').files[0];
			var existe = false;
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].NO_ARCHIVO === f.name){
					existe = true;
					break;
				}
			}
			if(existe){
				// vm.msg.textContent('Ya existe un archivo con ese nombre');
				// $mdDialog.show(vm.msg);
			} else {
				var reader = new FileReader();
				reader.onload = function(){
					var base64 = reader.result.split("base64,")[1];
					var binary_string = window.atob(base64);
				    var len = binary_string.length;
				    var bytes = [];
				    for (var i = 0; i < len; i++) {
				        bytes.push(binary_string.charCodeAt(i));
				    }
				    
				    var archivo = {
			    		"DESCARGAR": false,
			        	"ARCHIVO": bytes,
			        	"NO_ARCHIVO": f.name,
						"ID_TIPO": 222,
						'ESTADO': 'Pendiente'
			        };
				    
				    vm.listaArchivos.push(archivo);
					
					$scope.$apply();
				}
				reader.readAsDataURL(f);
			}
		}

		vm.upload = function($file) {
			var existe = false;
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].name === $file.name){
					existe = true;
					break;
				}
			}
			if(existe){
				vm.msg.textContent('Ya existe un archivo con ese nombre');
				$mdDialog.show(vm.msg);
			}else{
				var reader = new FileReader();
			    reader.onload = function() {
			        var dataUrl = reader.result;
			        var base64 = dataUrl.split(',')[1];
			        var archivo = {
			        	"ARCHIVO": base64,
			        	"NO_ARCHIVO": $file.name,
			        	"ID_TIPO": 222
			        };
			        vm.listaArchivos.push(archivo);
			    };
			    reader.readAsDataURL($file);
			}

    	}
    }
    ng.module('App').component('reclamacionSolicitud', Object.create(solicitudReclamacionComponent));
    
    
    
})(window.angular);