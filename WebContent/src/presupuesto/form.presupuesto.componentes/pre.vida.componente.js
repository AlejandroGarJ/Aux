(function(ng) {	


	//Crear componente de app
    var preVidaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$location', '$timeout', 'TiposService', 'PresupuestoService', 'BusquedaService', 'SolicitudService', 'ClienteService', '$mdDialog', 'LocalidadesService', 'ValidacionPagoService', 'HogarService'],
    		require: {
            	parent:'^sdApp',
            	pre:'^sdPresupuesto',
            	clave: '^busquedaPresupuesto'
    		},
		    bindings: {
				tarifas:'<'
			}
    }
    
    
    
    preVidaComponent.controller = function preVidaComponentControler($rootScope, $location, $timeout, TiposService, PresupuestoService, BusquedaService, SolicitudService, ClienteService, $mdDialog, LocalidadesService, ValidacionPagoService, HogarService) {
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.form = {};
    	vm.tiposSolicitud = [];
    	var x2js = new X2JS();
    	var aux = {};
    	vm.formulario = "";
    	vm.tipoBanco = "IBAN";
    	vm.cargar = false;
    	vm.presupuesto = [];
		vm.emitido = '0';
		
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	this.$onInit = function(){
    		
    		if (vm.clave.parent.url == 'presupuestos') {
                vm.medidaResumen = 207; //137
                vm.medidaEdicion = 294; //223
            } else if (vm.clave.parent.url == 'clientes') {
                vm.medidaResumen = 246; //176
                vm.medidaEdicion = 333; //262
            }
    		
    		vm.isTomador = 1;
    		vm.isParticular = 0;
    		vm.coberturas = {
    				"isFallecimiento":1,
    				"isAccidente":0,
    				"isInvalidezAccidente":0,
    				"isInvalidez":0,
    				"isInvalidezAbsoluta":0
    		}
    		
    		angular.forEach(vm.pre.idCliente, function(value, key){
    			vm.form[key] = [];
    			if(key != "FT_USU_MOD" && key != "NO_USU_MOD"){
    				if(key=="FD_NACIMIENTO" || key == "FD_CARNET"){
    					fecha = value;
    					var n2 = value.indexOf(':');
    	            	values = fecha.substring(0, n2 != -1 ? n2-3 : fecha.length);
    	            	vm.form[key] = new Date(values);
    				}
    				else
    					vm.form[key] = value;
    			}
    		});
    		
            TiposService.getNoField("sexo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.sexo = response.data.FIELD;
                }
            });            
            TiposService.getNoField("modalidadVida")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.modalidadVida = response.data.FIELD;
                }
            });    
            TiposService.getNoField("coProfesion")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.coProfesion = response.data.FIELD;
                }
            });
            TiposService.getNoField("formaPago")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.formaPago = response.data.FIELD;
                }
            });

    		
    		//Tipos para los combos
    		TiposService.getTipoDocumento({})
			.then(function successCallback(response){
				if(response.status == 200){
                    //Filtro para tipos de documento, eliminamos los que no correspondan
                        response.data.TIPOS.TIPO = _.remove(response.data.TIPOS.TIPO, function (value) {
                            return (value.ID_TIPO_DOCUMENTO==1 || value.ID_TIPO_DOCUMENTO==2 ||value.ID_TIPO_DOCUMENTO==4);
                        });
					vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		// Tipos de vias
			HogarService.getTiposVia({})
			.then(function successCallback(response) {
				if (response.status == 200) {
					vm.tipos.tiposVia = response.data.TIPO_VIA;
				}
			}, function callBack(response) {
				if (response.status == 406 || response.status == 401) {
					vm.parent.logout();
				}
			});
    		
    		TiposService.getProvincias({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.provincias = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getNacialidades({})
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
    		
    		TiposService.getTipos({"ID_CODIGO": "15"})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.profesionales = response.data.TIPOS.TIPO;
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
				
				var TARIF_VIDA = DATOS_PAGADOR;
				vm.datosTarifVida = TARIF_VIDA;
				
				objJSON = {
						'PRESUPUESTO_VIDA': {
							'DATOS_PAGADOR': DATOS_PAGADOR,
							'TARIF_VIDA': TARIF_VIDA
						}
				}
//				objJSON['PRESUPUESTO_VIDA'] = {DATOS_PAGADOR,TARIF_VIDA};
//				vm.pre.detalles.XM_ENVIADO = x2js.js2xml(objJSON);
//				vm.datos = x2js.xml2js(vm.pre.detalles.XM_ENVIADO).PRESUPUESTO_VIDA;
    		}//Si el presupuesto ya existe
    		else if(vm.pre.detalles != undefined && vm.pre.detalles != null){
    			aux = JSON.parse(JSON.stringify(vm.pre.detalles));
//	    		vm.datos = x2js.xml2js(aux.XM_ENVIADO).PRESUPUESTO_VIDA;
    			vm.emitido = aux.IN_EMITIDO;
	    		
    			for(persona in vm.datos){
	    			if(vm.datos[persona].FD_NACIMIENTO != undefined && typeof vm.datos[persona].FD_NACIMIENTO === 'string'){
	    				vm.datos[persona].FD_NACIMIENTO = new Date(vm.datos[persona].FD_NACIMIENTO.substr(0, 10));
	    			} else {
	    				vm.datos[persona].FD_NACIMIENTO = null;
	    			}
	    			if(vm.datos[persona].FD_INICIO != undefined && typeof vm.datos[persona].FD_INICIO === 'string') {
	    				vm.datos[persona].FD_INICIO = new Date(vm.datos[persona].FD_INICIO.substr(0, 10)); 
	    			} else {
	    				vm.datos[persona].FD_INICIO = null;
	    			}
	    		}
    			
	    		if(vm.datosPagador!=undefined){
	    			vm.datos.DATOS_PAGADOR = vm.datosPagador;
	    		}
	    		vm.datosTomador = vm.datos.DATOS_TOMADOR;
	    		vm.datosTarifVida = vm.datos.TARIF_VIDA;
	    		if(vm.datos.FRANJA_HORARIA==""){
	    			vm.datos.FRANJA_HORARIA = {};
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
	    		console.log(vm.datos);
    		}
    		else{
    			vm.isNuevo = true;
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
			if (vm.llave=="presupuesto" || vm.llave=="nuevo") {
				return "src/presupuesto/form.presupuesto.view/pre.vida.html";
			} else if (vm.llave == "contratar") {
				return "src/presupuesto/form.presupuesto.view/pre.contratar.vida.html";
			} else if (vm.llave == "resumen") {
				return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.vida.html";
			}
    	}
    	
    	
    	//Borrar o conseguir datos del cliente
    	vm.getCliente = function(isTomador){
    		if(isTomador == 1){
    			angular.forEach(vm.pre.idCliente, function(value, key){
        			vm.form[key] = [];
        			if(key != "FT_USU_MOD" && key != "NO_USU_MOD"){
        				if(key=="FD_NACIMIENTO" || key == "FD_CARNET"){
        					fecha = value;
        					var n2 = value.indexOf(':');
        	            	values = fecha.substring(0, n2 != -1 ? n2-3 : fecha.length);
        	            	vm.form[key] = new Date(values);
        				}
        				else
        					vm.form[key] = value;
        			}
        		});
    		}
    		else
    			vm.form = {};
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
		
		//Si tomador es ASEGURADO o no
	    vm.tomadorEsAsegurado = function(valor){
	    	if(valor=='02'){
	    		vm.datos.TARIF_VIDA = {};
	    		vm.datos.TARIF_VIDA.IN_TOMADOR_ES_ASEGURADO = 2;
	    	}else if(valor=='01'){
	    		if(vm.datosTarifVida==undefined)
	    			vm.datosTarifVida = {};
	    		vm.datos.DATOS_TOMADOR = vm.datosTarifVida;
	    		vm.datos.TARIF_VIDA = vm.datosTarifVida;
	    		vm.datos.TARIF_VIDA.IN_TOMADOR_ES_ASEGURADO = 1;
	    	}
	    }
	    
	  //Identificar la localidad por código postal
		vm.updateDir = function (tipoConductor,valor) {
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
								LocalidadesService.elegirLocalidad(vm.localidades,vm.datos[tipoConductor]);
							}else
								vm.datos[tipoConductor].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
						}
						
						vm.datos[tipoConductor].NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
						vm.datos[tipoConductor].CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
						vm.datos[tipoConductor].DS__CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
						
					}, function errorCallBack(response) {});
			}
		}
		
		//Validar Tarifa
		vm.validarTarifa = function () {
			vm.cargar = true;
			vm.datosLlamada = {
					'OTARIFA' : vm.tarifaSeleccionada,
					'OPRESUPUESTO' : vm.pre.detalles,
					'OTARIFA_INDIVIDUAL' : {}
			}
			
			vm.datosLlamada.OPRESUPUESTO.IS_CONTRATACION = true;
			var objJSON = {};
    		objJSON['PRESUPUESTO_VIDA'] = vm.datos;

			for(persona in vm.datos){
				for(dato in vm.datos[persona]){
					if(vm.datos[persona][dato] == null || vm.datos[persona][dato] == undefined){
						delete vm.datos[persona][dato];
					}	
				}
			}
			
//    		vm.datosLlamada.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);
			
			PresupuestoService.getTarificacionIndividual(vm.datosLlamada)
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
						console.log('Response no 200 tarifa individual: ', response);
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
		
		vm.contratar = function(){
			if(vm.tipoBanco == 'IBAN'){
         	   if(!ValidacionPagoService.validarIban(vm.datos.DATOS_PAGO.CO_IBAN)){
         		   msg.textContent('Número de IBAN incorrecto');
 				   $mdDialog.show(msg);
         		   return false;   
         	   }
            }	
			var objJSON = {};
			objJSON['PRESUPUESTO_VIDA'] = vm.datos;
			
			for(persona in objJSON['PRESUPUESTO_VIDA']) {
    			for(dato in objJSON['PRESUPUESTO_VIDA'][persona]) {
    				if(objJSON['PRESUPUESTO_VIDA'][persona][dato] === '' || objJSON['PRESUPUESTO_VIDA'][persona][dato] === undefined || objJSON['PRESUPUESTO_VIDA'][persona][dato] === null || objJSON['PRESUPUESTO_VIDA'][persona][dato] === 'NaN'){
    					delete objJSON['PRESUPUESTO_VIDA'][persona][dato];
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
		
		vm.contratarInTarificacion = function(index, detalles, tipo, tarifa){
			vm.indice = 1;
			vm.indiceFila = index;
			vm.tarifaSeleccionada = tarifa;
			vm.isSeleccionada = true;
			vm.clave.verDetalle(detalles,tipo);
		}
		
		vm.actualizarNacionalidad = function(docu,cond){
            if(docu==1 || docu==2){
                    vm.datos[cond].CO_PAIS= 'ESP';
                            }else{
                                vm.datos[cond].CO_PAIS = vm.datos[cond].CO_PAIS;
                            }
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
            	if(vm.llave!="contratar" && vm.indice<3){
            		vm.indice = vm.indice + 1;
            		vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_VIDA');
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
            else if (vm.llave == "presupuesto" || vm.llave == "nuevo") {
                switch (ind) {
                    case 1:
                            vm.formulario = "formSubmitAsegurados";
                            vm.validar(vm.formAsegurados);
                        
                        break;
                    case 2:
                           vm.formulario = "formSubmitOtros";
                           vm.validar(vm.formOtros);
                        break;
                    default:
                        vm.formulario = "formSubmitAsegurados";
                        vm.indice = 1;
                        break;
                }
            }
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }
    	
    }
    
    ng.module('App').component('preVidaApp', Object.create(preVidaComponent));
    
    
    
})(window.angular);