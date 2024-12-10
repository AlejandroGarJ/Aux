(function(ng) {	


	//Crear componente de app
    var preSaludComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$location', '$mdDialog', '$timeout', 'TiposService', 'BusquedaService', 'SolicitudService', 'PresupuestoService', 'LocalidadesService', 'ValidacionPagoService', 'HogarService'],
    		require: {
            	parent:'^sdApp',
            	pre:'^sdPresupuesto',
            	clave: '^busquedaPresupuesto'
    		},
		    bindings: {
				tarifas:'<'
			}
    }
    
    
    
    preSaludComponent.controller = function preSaludComponentControler($rootScope, $location, $mdDialog, $timeout, TiposService, BusquedaService, SolicitudService, PresupuestoService, LocalidadesService, ValidacionPagoService, HogarService){
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.form = {};
    	vm.polizas = [];
    	vm.tiposSolicitud = [];
    	vm.newsBeneficiarios = [];
    	var x2js = new X2JS();
    	var aux = {};
    	vm.tipoBanco = "IBAN";
    	vm.cargar = false;
    	vm.presupuesto = [];
		vm.emitido = '0';
		
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		if(vm.clave.parent.url == 'presupuestos') {
    			vm.medidaResumen = 207; //137
                vm.medidaEdicion = 294; //223
			}
    		else if(vm.clave.parent.url == 'clientes') {
    			vm.medidaResumen = 246; //176
                vm.medidaEdicion = 333; //262
    		}
    		
    		HogarService.getTiposVia({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.tiposVia = response.data.TIPO_VIA;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
            TiposService.getNoField("sexo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.sexo = response.data.FIELD;
                }
            });    
            
    		
    		//Tipos para los combos
    		TiposService.getTipoDocumento({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getProvincias()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.provincias = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getNacialidades()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.paises = response.data.PAISES.PAIS
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getTipos({"ID_CODIGO": "18"})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.civiles = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		console.log(vm.pre.detalles);
    		//Si el presupuesto es nuevo
    		if(vm.pre.detalles.ID_PRESUPUESTO==undefined){
    			var objJSON = {};
				var cliente = vm.pre.detalles.OCLIENTE;
				
				if(cliente.NO_APELLIDO2!=undefined){
					nombre = cliente.NO_NOMBRE + " " + cliente.NO_APELLIDO1 + " " + cliente.NO_APELLIDO2;
				}else{
					nombre = cliente.NO_NOMBRE + " " + cliente.NO_APELLIDO1;
				}
				var DATOS_PAGADOR = {
						"CO_NACIONALIDAD":cliente.CO_NACIONALIDAD,
						"CO_PAIS":cliente.CO_NACIONALIDAD,
						"DS__ID_ESTADO_CIVIL":cliente.DS_ESTADO_CIVIL,
						"ID_TIPO_DOCUMENTO":cliente.ID_TIPO_DOCUMENTO,
						"NO_EMAIL":cliente.NO_EMAIL,
						"NO_NOMBRE_COMPLETO":nombre,
						"NU_DOCUMENTO":cliente.NU_DOCUMENTO,
						"NU_TELEFONO":cliente.NU_TELEFONO1,
						"ID_CLIENTE":cliente.ID_CLIENTE,
						"NO_APELLIDO2":cliente.NO_APELLIDO2,
						"NO_APELLIDO1":cliente.NO_APELLIDO1,
						"NO_NOMBRE":cliente.NO_NOMBRE,
						"ID_ESTADO_CIVIL":cliente.ID_ESTADO_CIVIL,
						"ID_SEXO":cliente.ID_SEXO
				}

				for(dato in DATOS_PAGADOR) {
					if(DATOS_PAGADOR[dato] == undefined) {
							delete DATOS_PAGADOR[dato];
					}
			}

				if(cliente.FD_CARNET!=undefined){
					DATOS_PAGADOR['FD_CARNET'] = new Date(cliente.FD_CARNET);
				}
				if(cliente.FD_NACIMIENTO!=undefined){
					DATOS_PAGADOR["FD_NACIMIENTO"] = new Date(cliente.FD_NACIMIENTO);
				}
				
				objJSON = {
					'PRESUPUESTO_SALUD': {
						'DATOS_PAGADOR': DATOS_PAGADOR,
						"DATOS_PAGO": { "ID_FORMAPAGO": 2 }
					}
				}
				// objJSON['PRESUPUESTO_SALUD'] = {DATOS_PAGADOR};
				vm.datosPagador = DATOS_PAGADOR;
//				vm.pre.detalles.XM_ENVIADO = x2js.js2xml(objJSON);
//				vm.datos = x2js.xml2js(vm.pre.detalles.XM_ENVIADO).PRESUPUESTO_SALUD;
    		}//Si el presupuesto ya existe
    		else if(vm.pre.detalles != undefined && vm.pre.detalles != null){
    			aux = JSON.parse(JSON.stringify(vm.pre.detalles));
//	    		vm.datos = x2js.xml2js(aux.XM_ENVIADO).PRESUPUESTO_SALUD;
    			vm.emitido = aux.IN_EMITIDO;
	    		for(persona in vm.datos){
	    			if(vm.datos[persona].FD_NACIMIENTO != undefined && typeof vm.datos[persona].FD_NACIMIENTO === 'string'){
	    				vm.datos[persona].FD_NACIMIENTO = new Date(vm.datos[persona].FD_NACIMIENTO.substr(0, 10));
	    			} else {
	    				vm.datos[persona].FD_NACIMIENTO = null;
	    			}
	    			if(vm.datos[persona].IN_FARMACIA_REEMBOLSO!=undefined){
	    				vm.datos[persona].IN_FARMACIA_REEMBOLSO = (vm.datos[persona].IN_FARMACIA_REEMBOLSO == "true");
	    			}
	    			if(vm.datos[persona].IN_DENTAL_REEMBOLSO!=undefined){
	    				vm.datos[persona].IN_DENTAL_REEMBOLSO = (vm.datos[persona].IN_DENTAL_REEMBOLSO == "true");
	    			}
	    			if(vm.datos[persona].FD_INICIO != undefined && typeof vm.datos[persona].FD_INICIO === 'string') {
	    				vm.datos[persona].FD_INICIO = new Date(vm.datos[persona].FD_INICIO.substr(0, 10)); 
	    			} else {
	    				vm.datos[persona].FD_INICIO = null;
	    			}
	    			if(vm.datos[persona]==""){
	    				vm.datos[persona] = {};
	    			}
	    		}
	    		vm.tarificacion = x2js.xml2js(vm.pre.detalles.XM_RESPUESTA);
				if(vm.tarificacion!=null){
					if (Array.isArray(vm.tarificacion.TARIFAS.lstTarifas.TARIFA)) { //Tarifas si array u objeto único
						vm.tarifas = vm.tarificacion.TARIFAS.lstTarifas.TARIFA;
					} else {
						vm.tarifas = [];
                        vm.tarifas.push(vm.tarificacion.TARIFAS.lstTarifas.TARIFA);
					}
				}
	    		vm.datosTomador = vm.datos.DATOS_TOMADOR;
	    		vm.datosAsegurado = vm.datos.DATOS_PERSONA_ASEGURADA
	    		
	    		console.log(vm.datos);
    		}
    		else{
    			vm.isNuevo = true;
    		}
    		if(vm.clave.llave=="presupuesto"){
    			vm.tarifas = [];
    		}
    	}
    	
    	this.$onChanges = function () {
            if (vm.pre.tarifas != undefined && vm.pre.tarifas != "undefined") {
                vm.tarifas = vm.pre.tarifas;
                if (vm.tarifas.length > 0) {
                    vm.vista = 3;
                }
            }

        }
    	
    	this.loadTemplate=function(){
    		vm.llave = vm.pre.llave;
			if (vm.llave == "presupuesto" || vm.llave=="nuevo") {
				return "src/presupuesto/form.presupuesto.view/pre.salud.html";
			} else if (vm.llave == "contratar") {
				return "src/presupuesto/form.presupuesto.view/pre.contratar.salud.html";
			} else if (vm.llave== "resumen") {
				return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.salud.html";
			}
    	}
    
    	//Identificar la localidad por código postal
		vm.updateDir = function (tipo,valor) {
			if (valor.length == 5) {
				vm.localidades = [];
				vm.form.NO_PROVINCIA = [];
				TiposService.getLocalidades(valor)
					.then(function successCallBack(response) {
						if (!Array.isArray(response.data.LOCALIDAD)) {
							vm.localidades = [];
							vm.localidades.push(response.data.LOCALIDAD);
						} else {
							vm.localidades = response.data.LOCALIDAD;
							if(vm.localidades.length>1){
								LocalidadesService.elegirLocalidad(vm.localidades,vm.datos[tipo]);
							}else
								vm.datos[tipo].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
						}
						
						vm.datos[tipo].NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
						vm.datos[tipo].CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
						vm.datos[tipo].DS__CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
						
					}, function errorCallBack(response) {});
			}
		}
    	
		//Funcion para tipo de mensaje
		vm.filtro = function () {
			vm.resultadoMensaje = null;
			men = null;
			tam = 0;
			//Compruebo si es LIST_MENSAJE o LIST_MESSAGE porque al pintarlo por 1a vez devuelve LIST_MENSAJE, pero al pintar 
			//cuando tarificas, devuelve LIST_MESSAGE
			if(vm.tarifaSeleccionada.LIST_MENSAJE!=undefined || vm.tarifaSeleccionada.LIST_MENSAJE!=null){
				if (Array.isArray(vm.tarifaSeleccionada.LIST_MENSAJE.MENSAJE)) {
					men = vm.tarifaSeleccionada.LIST_MENSAJE.MENSAJE;
					tam = men.length;
					for (var i = 0; i < tam; i++) {
						if (men[i].CO_MESSAGE_TYPE === "ERROR") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						} else if (men[i].CO_MESSAGE_TYPE === "WARN") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						} else if (men[i].CO_MESSAGE_TYPE === "INFO") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						}

					}

				}else{
					men = vm.tarifaSeleccionada.LIST_MENSAJE;
					if (men.MENSAJE.CO_MESSAGE_TYPE === "ERROR") {
						vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
					} else if (men.MENSAJE.CO_MESSAGE_TYPE === "WARN") {
						vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
					} else if (men.MENSAJE.CO_MESSAGE_TYPE === "INFO") {
						vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
					}
				}
			}else if(vm.tarifaSeleccionada.LIST_MESSAGE!=undefined || vm.tarifaSeleccionada.LIST_MESSAGE!=null){
				if (Array.isArray(vm.tarifaSeleccionada.LIST_MESSAGE)) {
					men = vm.tarifaSeleccionada.LIST_MESSAGE;
					tam = men.length;
					for (var i = 0; i < tam; i++) {
						if (men[i].CO_MESSAGE_TYPE === "ERROR") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						} else if (men[i].CO_MESSAGE_TYPE === "WARN") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						} else if (men[i].CO_MESSAGE_TYPE === "INFO") {
							vm.resultadoMensaje = (men[i].CO_MESSAGE_TYPE);
							break;
						}

					}

				}else{
					men = vm.tarifaSeleccionada.LIST_MESSAGE;
					if (men.CO_MESSAGE_TYPE === "ERROR") {
						vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
					} else if (men.CO_MESSAGE_TYPE === "WARN") {
						vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
					} else if (men.CO_MESSAGE_TYPE === "INFO") {
						vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
					}
				}
			}else if(vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT == 0 || vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT == undefined || vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT==null){
            	vm.resultadoMensaje = 'ERROR';
            }
			
		}
    	
		//Comprobar si hay tarifa seleccionada
		vm.comprobarTarifaSeleccionada = function () {

			if (vm.isSeleccionada == undefined || vm.resultadoMensaje == "ERROR" || vm.resultadoMensaje == "PRIMA" || vm.isSeleccionada == false) {

				if (vm.isSeleccionada == undefined || vm.isSeleccionada == false) {
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#popupContainer')))
						.clickOutsideToClose(true)
						.title('Advertencia')
						.htmlContent('Debe seleccionar la tarifa con la <br> que se desea hacer la <strong>contratación</strong>')
						.ok('Aceptar')
					);
				} else if (vm.resultadoMensaje == "ERROR" || vm.resultadoMensaje == "PRIMA") {
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#popupContainer')))
						.clickOutsideToClose(true)
						.title('Advertencia')
						.htmlContent('La tarifa seleccionada <strong>no se puede contratar</strong>')
						.ok('Aceptar')
					);
				}
				vm.isSeleccionada = false;
			} else {
				vm.isSeleccionada = true;
			}
		}
		
    	//Colorear fila seleccionada en lista de tarifas 
		vm.setSelected = function (index, tarifa) {
			vm.indiceFila = index;
			vm.tarifaSeleccionada = tarifa;
			vm.filtro();
			prima = vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT;
			//console.log('Tarifa Validada-> ', vm.validada.LIST_MENSAJE.MENSAJE.CO_MESSAGE_TYPE); //[1].LIST_MENSAJE.MENSAJE.CO_MESSAGE_TYPE

			if (vm.resultadoMensaje === "ERROR") {
				vm.comprobarTarifaSeleccionada();
				vm.isSeleccionada = undefined;
				vm.indiceFila = null;
			}else if (prima == undefined) {
				vm.resultadoMensaje = "PRIMA";
				vm.comprobarTarifaSeleccionada();
				vm.isSeleccionada = false;
				vm.indiceFila = null;
				vm.resultadoMensaje = null;
			}else {
				vm.isSeleccionada = true;
			}

			console.log('Fila seleccionada-> ', index);
			console.log(tarifa);
			console.log(vm.isSeleccionada);
		}
		
		//Mensajes de tarifas
		vm.verTooltip = function (tarifa) {
			//Compruebo si es LIST_MENSAJE o LIST_MESSAGE porque al pintarlo por 1a vez devuelve LIST_MENSAJE, pero al pintar 
			//cuando tarificas, devuelve LIST_MESSAGE
			if(tarifa.LIST_MENSAJE!=null && tarifa.LIST_MENSAJE!=undefined){
				if (Array.isArray(tarifa.LIST_MENSAJE.MENSAJE)) {
					vm.men = tarifa.LIST_MENSAJE.MENSAJE;
				} else {
					vm.men = tarifa.LIST_MENSAJE;
				}
				vm.tarifa = tarifa;
			}else if(tarifa.LIST_MESSAGE!=null && tarifa.LIST_MESSAGE!=undefined){
				if (Array.isArray(tarifa.LIST_MESSAGE)) {
					vm.men = tarifa.LIST_MESSAGE[0];
				} else {
					vm.men = tarifa.LIST_MESSAGE;
				}
				vm.tarifa = tarifa;
			}else{
            	vm.men = {
            			"CO_MESSAGE": "-1",
        				"CO_MESSAGE_TYPE": "ERROR",
            			"DS_MESSAGE":"Se ha producido un error al contactar con la aseguradora"
                	}
                	vm.tarifa = tarifa;
                }
		}
		
		//Si tomador es pagador o no
	    vm.tomadorEsPagador = function(valor){
	    	if(valor=='1'){
	    		if(vm.datos.DATOS_PAGADOR!=undefined){
					vm.datos.DATOS_TOMADOR = vm.datos.DATOS_PAGADOR;
					// Recuperar datos perdidos en la figura de tomador
					if(vm.datos.DATOS_PAGADOR.FD_NACIMIENTO != undefined && typeof vm.datos.DATOS_PAGADOR.FD_NACIMIENTO === 'string') {
						vm.datos.DATOS_TOMADOR.FD_NACIMIENTO = new Date(vm.datos.DATOS_PAGADOR.FD_NACIMIENTO.substr(0, 10));
					}
	    		}
	    		vm.datos.DATOS_TOMADOR.IN_TOMADOR_ES_PAGADOR = 1;
	    	}else if(valor=='0'){
	    		if(vm.datosTomador!=undefined){
	    			vm.datos.DATOS_TOMADOR = vm.datosTomador;
	    		}
	    		vm.datos.DATOS_TOMADOR.IN_TOMADOR_ES_PAGADOR = 0;
	    	}
	    }
	    
	  //Si asegurado es tomador o no
	    vm.aseguradoEsTomador = function(valor){
	    	if(valor=='1'){
	    		if(vm.datos.DATOS_TOMADOR!=undefined){
	    			vm.datos.DATOS_PERSONA_ASEGURADA = vm.datos.DATOS_TOMADOR;
	    		}
	    		vm.datos.DATOS_PERSONA_ASEGURADA.IN_TOMADOR_ES_ASEGURADO = 1;
	    	}else if(valor=='0'){
	    		vm.datos.DATOS_PERSONA_ASEGURADA = [];
	    		vm.datos.DATOS_PERSONA_ASEGURADA.IN_TOMADOR_ES_ASEGURADO = 0;
	    	}
	    }
	    
	  //Validar Tarifa
		vm.validarTarifa = function () {
			
			vm.cargar = true;
			
			var datosLlamada = {
					'OTARIFA' : vm.tarifaSeleccionada,
					'OPRESUPUESTO' : vm.pre.detalles,
					'OTARIFA_INDIVIDUAL' : {}
			}
			
			datosLlamada.OPRESUPUESTO.IS_CONTRATACION = true;
			var objJSON = {};
    		objJSON['PRESUPUESTO_SALUD'] = vm.datos;

			for(persona in vm.datos){
				for(dato in vm.datos[persona]){
					if(vm.datos[persona][dato] == null || vm.datos[persona][dato] == undefined){
						delete vm.datos[persona][dato];
					}	
				}
			}
			
//    		datosLlamada.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);
			
			PresupuestoService.getTarificacionIndividual(datosLlamada)
				.then(function successCallback(response) {
					vm.cargar = false;

					if (response.status == 200) {
						if(response.data.CO_ESTADO == 0 || response.data.CO_ESTADO == 6){
							vm.isValidada = false;
						}else{
							vm.isValidada = true;
						}
						console.log('Response 200 tarifa individual: ', response);
						vm.statusTarifa = response.statusText;
						vm.validada = response.data;
						vm.presupuesto = response.data;
						vm.listMessages = response.data.LIST_MESSAGE;
						mensajes = response.data.LIST_MENSAJE;
						vm.mensa = new Array();
						angular.forEach(mensajes,
							function (item){
							vm.mensa.push(item);
							});
							console.log('Mensajes devueltos-> ', vm.mensa);

					} else {
						vm.cargar = false;
						vm.isValidada = false;
						msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
						$mdDialog.show(msg);
					}

				}, function errorCallback(response) {
					vm.cargar = false;
					vm.isValidada = false;
					msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
					$mdDialog.show(msg);
					if (response.status == 406 || response.status == 401) {
	                       vm.parent.logout();
	                   }
				});
		}
		
		vm.contratarInTarificacion = function(index, detalles, tipo, tarifa){
			vm.indiceFila = index;
			vm.tarifaSeleccionada = tarifa;
			vm.isSeleccionada = true;
			vm.clave.verDetalle(detalles,tipo);
		}
		
		vm.contratar = function(){
			if(vm.tipoBanco == 'IBAN'){
         	   if(!ValidacionPagoService.validarIban(vm.datos.DATOS_PAGO.CO_IBAN)){
         		   msg.textContent('Número de IBAN incorrecto');
 				   $mdDialog.show(msg);
         		   return false;   
         	   }
            }	
			var objJSON = {};
			objJSON['PRESUPUESTO_SALUD'] = vm.datos;

			for(persona in objJSON['PRESUPUESTO_SALUD']) {
    			for(dato in objJSON['PRESUPUESTO_SALUD'][persona]) {
    				if(objJSON['PRESUPUESTO_SALUD'][persona][dato] === '' || objJSON['PRESUPUESTO_SALUD'][persona][dato] === undefined || objJSON['PRESUPUESTO_SALUD'][persona][dato] === null || objJSON['PRESUPUESTO_SALUD'][persona][dato] === 'NaN'){
    					delete objJSON['PRESUPUESTO_SALUD'][persona][dato];
    				}
    			}
    		}

//			vm.presupuesto.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);
			
			PresupuestoService.emitirPresupuesto(vm.presupuesto)
			.then(function successCallback(response) {
				
				if(response.status==200){
					if(response.data.CO_ESTADO != 0){
						var txt = 'Presupuesto contratado';
						if(response.data.NU_SOLICITUD != undefined && response.data.NU_SOLICITUD != ""){
							txt += ' con solicitud ' + response.data.NU_SOLICITUD;
						}
						msg.textContent(txt);
						$mdDialog.show(msg);
					}else if(response.data.CO_ESTADO == 0){
						msg.textContent("Error al contratar presupuesto");
						$mdDialog.show(msg);
					}
					if(response.data.LIST_MESSAGE != undefined){
						vm.listMessagesCon = response.data.LIST_MESSAGE;
					}
				}
				
			}, function errorCallback(response) {
				msg.textContent("Error al contratar presupuesto");
				$mdDialog.show(msg);
				if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
			});
		}
		
		vm.tipoB = function () {
			console.log('Tipo de banco', vm.tipoBanco);
		}
		
		vm.validar = function(form2Validate) {
            if (form2Validate) {
				objFocus=angular.element('.ng-empty.ng-invalid-required:visible');       
				msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
				$mdDialog.show(msg);    
				if(objFocus != undefined){
                    objFocus.focus();
                }
                vm.indice = vm.indice;
            } else {
            	if(vm.llave!="contratar"){
            		vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_SALUD');
            	}else if(vm.indice<5){
            		vm.indice = vm.indice + 1;
            	}
            }
        }

		vm.siguiente = function (ind) {
            if (vm.llave == "contratar") {
                
                switch(ind){
                    case 1: 
                    vm.indice = vm.indice + 1;
                    break;
                    case 2:
                    if(!vm.isSeleccionada){
                        vm.comprobarTarifaSeleccionada();
                    }else{
                        vm.indice = vm.indice + 1;
                    }
                    break;
                    case 3:
                    	vm.formulario=vm.formEmision;
                        vm.validar(vm.formEmision.$invalid);
                        if(!vm.formEmision.$invalid){
                        	vm.validarTarifa();
                        }
                        break;
                    case 4:
                    	vm.indice = vm.indice + 1;
                    	break;
                    case 5: 
                    	vm.formulario=vm.formPago;
                        vm.validar(vm.formPago.$invalid);
                        if(!vm.formPago.$invalid){
                        	vm.contratar();
                        }
                        vm.indice=5;
                        break;
                    default: break;
                }
            }
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }
    	
    }
    
    ng.module('App').component('preSaludApp', Object.create(preSaludComponent));
    
    
    
})(window.angular);