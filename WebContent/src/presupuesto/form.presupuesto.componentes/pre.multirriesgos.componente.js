(function (ng) {


    //Crear componente de app
    var preMultirriesgosComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$rootScope', '$location', '$timeout', '$mdDialog', 'TiposService', 'BusquedaService', 'SolicitudService', 'PresupuestoService', 'LocalidadesService', 'ValidacionPagoService', 'HogarService'],
        require: {
            parent: '^sdApp',
            pre: '^sdPresupuesto',
            clave: '^busquedaPresupuesto'
        },
        bindings: {
            idRamo: '<',
            idColectivo: '<',
            tarifas: '<'
        }
    }

    preMultirriesgosComponent.controller = function preMultirriesgosComponentControler($rootScope, $location, $timeout, $mdDialog, TiposService, BusquedaService, SolicitudService, PresupuestoService, LocalidadesService, ValidacionPagoService, HogarService) {
        var vm = this;
        vm.tipos = {};
        vm.calendar = {};
        vm.indice = 1;
        vm.form = {};
        vm.polizas = [];
        vm.tiposSolicitud = [];
        vm.formulario = "";
        var x2js = new X2JS();
        var aux = {};
        vm.joyas = 1;
        vm.objeto = 1;
        vm.tipoBanco = "IBAN";
        vm.cargar = false;
        vm.presupuesto = [];
        vm.emitido = '0';
        vm.listaProvincias = [];

        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');


        this.$onInit = function () {

            if (vm.clave.parent.url == 'presupuestos') {
                vm.medidaResumen = 207; //137
                vm.medidaEdicion = 294; //223
            }
            else if (vm.clave.parent.url == 'clientes') {
                vm.medidaResumen = 246; //176
                vm.medidaEdicion = 333; //262
            }

            TiposService.getProvincias()
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.provincias = response.data.TIPOS.TIPO;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

            TiposService.getNacialidades()
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.paises = response.data.PAISES.PAIS
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

            TiposService.getTipos({
                "ID_CODIGO": "18"
            })
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.civiles = response.data.TIPOS.TIPO;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

            TiposService.getTipoDocumento({})
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

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
            


            //Si el presupuesto es nuevo
            if (vm.pre.detalles.ID_PRESUPUESTO == undefined) {
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

                if (cliente.FD_CARNET != undefined) {
                    DATOS_PAGADOR['FD_CARNET'] = new Date(cliente.FD_CARNET);
                }
                if (cliente.FD_NACIMIENTO != undefined) {
                    DATOS_PAGADOR["FD_NACIMIENTO"] = new Date(cliente.FD_NACIMIENTO);
                }

                var DATOS_TOMADOR = {
                    "NU_PLANTA": 0,
                    "IN_DOCUMENTACION_ELECTRONICA": false
                }
                var IS_CONTRATACION = false;
                
                objJSON = {
            		'PRESUPUESTO_MULTIRRIESGOS': {
            			'DATOS_PAGADOR': DATOS_PAGADOR,
            			'IS_CONTRATACION': IS_CONTRATACION,
            			'DATOS_TOMADOR': DATOS_TOMADOR
            		}
                }
//                objJSON['PRESUPUESTO_MULTIRRIESGOS'] = { DATOS_PAGADOR, IS_CONTRATACION, DATOS_TOMADOR };
//                vm.pre.detalles.XM_ENVIADO = x2js.js2xml(objJSON);
//                vm.datos = x2js.xml2js(vm.pre.detalles.XM_ENVIADO).PRESUPUESTO_MULTIRRIESGOS;
            }//Si el presupuesto ya existe
            else if (vm.pre.detalles != undefined && vm.pre.detalles != null) {
                aux = JSON.parse(JSON.stringify(vm.pre.detalles));
//                vm.datos = x2js.xml2js(aux.XM_ENVIADO).PRESUPUESTO_MULTIRRIESGOS;
                vm.emitido = aux.IN_EMITIDO;
                console.log(vm.datos);
                if (vm.datos.DATOS_PRESTAMO == "") {
                    vm.datos.DATOS_PRESTAMO = {};
                }
                if (vm.datos.DETALLE_JOYAS == "") {
                    vm.datos.DETALLE_JOYAS = {};
                }
                if (vm.datos.DETALLE_VALOR_ESPECIAL == "") {
                    vm.datos.DETALLE_VALOR_ESPECIAL = {};
                }
                for (persona in vm.datos) {
                    if (vm.datos[persona] == "") {
                        vm.datos[persona] = {};
                    }
                    if (vm.datos[persona].FD_NACIMIENTO != undefined && typeof vm.datos[persona].FD_NACIMIENTO === 'string') {
                        vm.datos[persona].FD_NACIMIENTO = new Date(vm.datos[persona].FD_NACIMIENTO.substr(0, 10));
                    } else {
                        vm.datos[persona].FD_NACIMIENTO = null;
                    }
                    if (vm.datos[persona].FD_INICIO != undefined && typeof vm.datos[persona].FD_INICIO === 'string') {
                        vm.datos[persona].FD_INICIO = new Date(vm.datos[persona].FD_INICIO.substr(0, 10));
                    } else {
                        vm.datos[persona].FD_INICIO = null;
                    }
                    if (vm.datos[persona].FD_VENCIMIENTO != undefined && typeof vm.datos[persona].FD_VENCIMIENTO === 'string') {
                        vm.datos[persona].FD_VENCIMIENTO = new Date(vm.datos[persona].FD_VENCIMIENTO.substr(0, 10));
                    } else {
                        vm.datos[persona].FD_VENCIMIENTO = null;
                    }
                    for (dato in vm.datos[persona]) {
                        if ((vm.datos[persona][dato] == "true" || vm.datos[persona][dato] == "false")) {
                            vm.datos[persona][dato] = (vm.datos[persona][dato] == "true");
                        }
                    }
                }
                vm.datosTomador = vm.datos.DATOS_TOMADOR;
                if (vm.datos.BLOCK_DIRECCION_VIVIENDA != undefined) {
                    vm.direccionVivienda = vm.datos.BLOCK_DIRECCION_VIVIENDA;
                }
                vm.tarificacion = x2js.xml2js(vm.pre.detalles.XM_RESPUESTA);
                if (vm.tarificacion != null) {
                    if (Array.isArray(vm.tarificacion.TARIFAS.lstTarifas.TARIFA)) { //Tarifas si array u objeto único
                        vm.tarifas = vm.tarificacion.TARIFAS.lstTarifas.TARIFA;
                    } else {
                        vm.tarifas = [];
                        vm.tarifas.push(vm.tarificacion.TARIFAS.lstTarifas.TARIFA);
                    }
                }
                
                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL != undefined) {
                    HogarService.getLocalidades(vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL)
                    .then(function successCallBack(response) {
                        vm.estadoCatastro = response.data.ID_RESULT;
                    }, function errorCallBack(response) { });
                }

            }
            else {
                vm.isNuevo = true;
            }
        }

        this.$onChanges = function () {
            if (vm.pre.tarifas != undefined) {
                vm.tarifas = vm.pre.tarifas;
                if (vm.tarifas.length > 0) {
                    vm.vista = 3;
                }
            }

        }

        this.loadTemplate = function() {
            vm.llave = vm.pre.llave;
            if (vm.llave == "presupuesto" || vm.llave == "nuevo") {
                return "src/presupuesto/form.presupuesto.view/pre.multirriesgos.html";      
            } else if (vm.llave == "contratar") {
                return "src/presupuesto/form.presupuesto.view/pre.contratar.multirriesgos.html";
            } else if (vm.llave == "resumen") {
                return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.multirriesgos.html";
            }
        }

        //Identificar la localidad por pueblos
        vm.updateDir = function (tipo, valor) {
            if (valor.length == 5) {
                vm.localidades = [];
                vm.form.NO_PROVINCIA = [];

                vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA = '';
                vm.tipoViaSeleccionada = null;
                vm.viaSeleccionada = null;

                HogarService.getLocalidades(valor)
                .then(function successCallBack(response) {
                    if (!Array.isArray(response.data.LOCALIDAD)) {
                        vm.localidades = [];
                        vm.localidades.push(response.data.LOCALIDAD);
                    } else {
                        vm.localidades = response.data.LOCALIDAD;
                        if (vm.localidades.length > 1) {
                            LocalidadesService.elegirLocalidad(vm.localidades, vm.datos[tipo]);
                        } else
                            vm.datos[tipo].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                    }

                    vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                    vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                    vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].NO_PROVINCIA;

                    vm.estadoCatastro = response.data.ID_RESULT;

                }, function errorCallBack(response) { });
            } else {
            	vm.datos[tipo].NO_LOCALIDAD = null;
                vm.datos[tipo].CO_PROVINCIA = null;
                vm.datos[tipo].DS__CO_PROVINCIA = null;
            }
        }

        //Funcion para tipo de mensaje
        vm.filtro = function () {
            vm.resultadoMensaje = null;
            men = null;
            tam = 0;
            //Compruebo si es LIST_MENSAJE o LIST_MESSAGE porque al pintarlo por 1a vez devuelve LIST_MENSAJE, pero al pintar 
            //cuando tarificas, devuelve LIST_MESSAGE
            if (vm.tarifaSeleccionada.LIST_MENSAJE != undefined || vm.tarifaSeleccionada.LIST_MENSAJE != null) {
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

                } else {
                    men = vm.tarifaSeleccionada.LIST_MENSAJE;
                    if (men.MENSAJE.CO_MESSAGE_TYPE === "ERROR") {
                        vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
                    } else if (men.MENSAJE.CO_MESSAGE_TYPE === "WARN") {
                        vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
                    } else if (men.MENSAJE.CO_MESSAGE_TYPE === "INFO") {
                        vm.resultadoMensaje = (men.MENSAJE.CO_MESSAGE_TYPE);
                    }
                }
            } else if (vm.tarifaSeleccionada.LIST_MESSAGE != undefined || vm.tarifaSeleccionada.LIST_MESSAGE != null) {
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

                } else {
                    men = vm.tarifaSeleccionada.LIST_MESSAGE;
                    if (men.CO_MESSAGE_TYPE === "ERROR") {
                        vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
                    } else if (men.CO_MESSAGE_TYPE === "WARN") {
                        vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
                    } else if (men.CO_MESSAGE_TYPE === "INFO") {
                        vm.resultadoMensaje = (men.CO_MESSAGE_TYPE);
                    }
                }
            } else if (vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT == 0 || vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT == undefined || vm.tarifaSeleccionada.IM_PRIMA_ANUAL_TOT == null) {
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
            } else if (prima == undefined) {
                vm.resultadoMensaje = "PRIMA";
                vm.comprobarTarifaSeleccionada();
                vm.isSeleccionada = false;
                vm.indiceFila = null;
                vm.resultadoMensaje = null;
            } else {
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
            if (tarifa.LIST_MENSAJE != null && tarifa.LIST_MENSAJE != undefined) {
                if (Array.isArray(tarifa.LIST_MENSAJE.MENSAJE)) {
                    vm.men = tarifa.LIST_MENSAJE.MENSAJE;
                } else {
                    vm.men = tarifa.LIST_MENSAJE;
                }
                vm.tarifa = tarifa;
            } else if (tarifa.LIST_MESSAGE != null && tarifa.LIST_MESSAGE != undefined) {
                if (Array.isArray(tarifa.LIST_MESSAGE)) {
                    vm.men = tarifa.LIST_MESSAGE[0];
                } else {
                    vm.men = tarifa.LIST_MESSAGE;
                }
                vm.tarifa = tarifa;
            } else {
                vm.men = {
                    "CO_MESSAGE": "-1",
                    "CO_MESSAGE_TYPE": "ERROR",
                    "DS_MESSAGE": "Se ha producido un error al contactar con la aseguradora"
                }
                vm.tarifa = tarifa;
            }
        }

        //Si tomador es pagador o no
        vm.tomadorEsPagador = function (valor) {
            if (valor == '1') {
                if (vm.datos.DATOS_PAGADOR != undefined) {
                	for(var dato in vm.datos.DATOS_PAGADOR){
                		vm.datos.DATOS_TOMADOR[dato] = vm.datos.DATOS_PAGADOR[dato];
                	}
                    // Recuperar datos perdidos en la figura de tomador
                    if(vm.datos.DATOS_PAGADOR.FD_NACIMIENTO != undefined) {
                        vm.datos.DATOS_TOMADOR.FD_NACIMIENTO = vm.datos.DATOS_PAGADOR.FD_NACIMIENTO;
                    }
                }
                vm.datos.DATOS_TOMADOR.IN_TOMADOR_ES_PAGADOR = 1;
            } else if (valor == '0') {
                vm.datos.DATOS_TOMADOR = {};
                vm.datos.DATOS_TOMADOR.IN_TOMADOR_ES_PAGADOR = 0;
            }
        }

        //Validar Tarifa
        vm.validarTarifa = function () {

            vm.cargar = true;

            for (item in vm.datos.DETALLE_JOYAS) {
                if (vm.datos.DETALLE_JOYAS[item] == "" || vm.datos.DETALLE_JOYAS == undefined) {
                    delete vm.datos.DETALLE_JOYAS[item];
                }
            }
            for (item in vm.datos.DETALLE_VALOR_ESPECIAL) {
                if (vm.datos.DETALLE_VALOR_ESPECIAL[item] == "" || vm.datos.DETALLE_VALOR_ESPECIAL == undefined) {
                    delete vm.datos.DETALLE_VALOR_ESPECIAL[item];
                }
            }

            var datosLlamada = {
                'OTARIFA': vm.tarifaSeleccionada,
                'OPRESUPUESTO': vm.pre.detalles,
                'OTARIFA_INDIVIDUAL': {}
            }

            datosLlamada.OPRESUPUESTO.IS_CONTRATACION = true;
            var objJSON = {};
            objJSON['PRESUPUESTO_MULTIRRIESGOS'] = vm.datos;

			for(persona in vm.datos){
				for(dato in vm.datos[persona]){
					if(vm.datos[persona][dato] == null || vm.datos[persona][dato] == undefined){
						delete vm.datos[persona][dato];
					}	
				}
			}
			
//            datosLlamada.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);

            PresupuestoService.getTarificacionIndividual(datosLlamada)
                .then(function successCallback(response) {
                    vm.cargar = false;
                    //console.log(response.data);

                    if (response.status == 200) {
                    	if(response.data.CO_ESTADO == 0 || response.data.CO_ESTADO == 6 || response.data.ID_RESULT == 99){
							vm.isValidada = false;
						}else{
							vm.isValidada = true;
						}
                        vm.statusTarifa = response.statusText;
                        vm.validada = response.data;
                        vm.presupuesto = response.data;
                        vm.listMessages = response.data.LIST_MESSAGE;
                        mensajes = response.data.LIST_MESSAGE;
                        vm.mensa = new Array();
                        angular.forEach(mensajes,
                            function (item) {
                                vm.mensa.push(item);
                            });
                        console.log('Mensajes devueltos-> ', vm.mensa);

                        //console.log('Validada', vm.validada.LIST_MENSAJE.MENSAJE[0].CO_MESSAGE_TYPE);
                    } else {
                        vm.cargar = false;
                        msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
                        $mdDialog.show(msg);
                        vm.isValidada = false;
                        console.log('Response no 200 tarifa individual: ', response);
                    }

                }, function errorCallback(response) {
                    vm.cargar = false;
                    msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
                    $mdDialog.show(msg);
                    vm.isValidada = false;
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
        }

        //Si vivienda a asegurar es igual al domicilio del tomador
        //metemos block_direccion_vivienda en datos_tomador
        vm.viviendaAseguradaTomador = function (valor) {
            if (valor == '01' || valor == '1' || valor == 1) {
            	//Cuando contratas directamene al tarificar, vm.direccion vivienda siempre es null aunque haya vm.datos.BLOCK_DIRECCION_VIVIENDA
            	if (vm.direccionVivienda == undefined){
            		//Si block_direccion_vivienda existe, clonar el objeto en vm.direccionVivienda
                	if(vm.datos.BLOCK_DIRECCION_VIVIENDA == undefined){
                		vm.direccionVivienda = {};
                	}else{
                		vm.direccionVivienda = JSON.parse(JSON.stringify(vm.datos.BLOCK_DIRECCION_VIVIENDA));
                	}
                }
                vm.datos.BLOCK_DIRECCION_VIVIENDA = vm.direccionVivienda;
                for (item in vm.datos.BLOCK_DIRECCION_VIVIENDA) {
                    if (item != 'IN_DVTOMADOR_ES_DVASEGURADA')
                        vm.datos.DATOS_TOMADOR[item] = vm.datos.BLOCK_DIRECCION_VIVIENDA[item];
                }
                vm.datos.DATOS_TOMADOR.IN_DVTOMADOR_ES_DVASEGURADA = 1;
            }
            else if (valor == 2) {
                vm.datos.BLOCK_DIRECCION_VIVIENDA = {};
                vm.datos.DATOS_TOMADOR.IN_DVTOMADOR_ES_DVASEGURADA = 2;
            }
        }
        //Añadir joya
        vm.anadirJoya = function () {
            if (vm.joyas <= 2) {
                vm.joyas++;
            } else {
                msg.textContent("No se pueden añadir más joyas.");
                $mdDialog.show(msg);
            }
        }

        //Añadir objeto
        vm.anadirObjeto = function () {
            if (vm.objeto <= 2) {
                vm.objeto++;
            } else {
                msg.textContent("No se pueden añadir más objetos.");
                $mdDialog.show(msg);
            }
        }

        //Calcular continente a asegurar
        vm.calcularContinente = function () {
            var detallesVivienda = {};
            detallesVivienda = {};
            detallesVivienda['BLOCK_USO_REGIMEN'] = vm.datos.BLOCK_USO_REGIMEN;
            detallesVivienda['BLOCK_INFORMACION_VIVIENDA'] = vm.datos.BLOCK_INFORMACION_VIVIENDA;
            PresupuestoService.getCapitales(detallesVivienda)
                .then(function successCallback(response) {
                    if (response.data != null) {
                        vm.valorContinente = response.data.BLOCK_CAPITALES.IM_VALOR_CONTINENTE;
                        vm.valorContenido = response.data.BLOCK_CAPITALES.IM_VALOR_CONTENIDO;
                        vm.cambiarContinente();
                        vm.cambiarContenido();
                    }

                }, function errorCallback(response) {
                });

        }

        vm.cambiarContinente = function () {
            if (vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE >= vm.valorContinente) {
                document.getElementById("valorContinente").className = "letraVerde";
            } else if (vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE < (vm.valorContinente - (vm.valorContinente * 0.1))) {
                document.getElementById("valorContinente").className = "letraNaranja";
            } else {
                document.getElementById("valorContinente").className = "letraGris";
            }
        }

        vm.cambiarContenido = function () {
            if (vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTENIDO >= vm.valorContenido) {
                document.getElementById("valorContenido").className = "letraVerde";
            } else if (vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTENIDO < (vm.valorContenido - (vm.valorContenido * 0.1))) {
                document.getElementById("valorContenido").className = "letraNaranja";
            } else {
                document.getElementById("valorContenido").className = "letraGris";
            }
        }

        vm.contratarInTarificacion = function (index, detalles, tipo, tarifa) {
        	vm.indice = 1;
        	vm.indiceFila = index;
            vm.tarifaSeleccionada = tarifa;
            vm.isSeleccionada = true;
            vm.clave.verDetalle(detalles, tipo);
        }

        vm.contratar = function () {
        	//Validación de IBAN
        	if(vm.tipoBanco == 'IBAN'){
         	   if(!ValidacionPagoService.validarIban(vm.datos.DATOS_PAGO.CO_IBAN)){
         		   msg.textContent('Número de IBAN incorrecto');
 				   $mdDialog.show(msg);
         		   return false;   
         	   }
            }	
        	vm.loadContratar = true;
        	vm.listMessagesCon = [];
        	
            var objJSON = {};
            objJSON['PRESUPUESTO_MULTIRRIESGOS'] = vm.datos;

            //Añadir datos de direcciones al pagador
            for(var dato in vm.datos.BLOCK_DIRECCION_VIVIENDA){
				if(vm.datos.DATOS_PAGADOR == undefined){
					vm.datos.DATOS_PAGADOR = {};
				}
            	vm.datos.DATOS_PAGADOR[dato] = vm.datos.BLOCK_DIRECCION_VIVIENDA[dato];
            }
            
            //Eliminar datos vacíos
            for(persona in objJSON['PRESUPUESTO_MULTIRRIESGOS']) {
    			for(dato in objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona]) {
    				if(objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona][dato] === '' || objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona][dato] === undefined || objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona][dato] === null || objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona][dato] === 'NaN'){
    					delete objJSON['PRESUPUESTO_MULTIRRIESGOS'][persona][dato];
    				}
    			}
    		}

//            vm.presupuesto.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);

            PresupuestoService.emitirPresupuesto(vm.presupuesto)
                .then(function successCallback(response) {
                	vm.loadContratar = false;
                    if (response.status == 200) {
                    	if(response.data.CO_ESTADO != 0){
                            txt = 'Presupuesto contratado';
                            if(response.data.NU_POLIZA != undefined && response.data.NU_POLIZA != ""){
                                txt += ' con Póliza ' + response.data.NU_POLIZA;
                            }
                 	   }else{
                 		   txt = 'Ha ocurrido un error al contratar el presupuesto.';
                 	   }
                    	if(response.data.LIST_MESSAGE != undefined){
							vm.listMessagesCon = response.data.LIST_MESSAGE;
						}
						msg.textContent(txt);
						$mdDialog.show(msg);
                    }

                }, function errorCallback(response) {
                	vm.loadContratar = false;
                    msg.textContent("Error al contratar presupuesto");
                    $mdDialog.show(msg);
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
        }
        
        function validar(form2Validate) {
            if (form2Validate) {
                objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();     
                msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
                $mdDialog.show(msg);
                if(objFocus != undefined){
                    objFocus.focus();
                }
                vm.indice = vm.indice;
            } else {
            	if(vm.indice<5){
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
                    	vm.formulario="formSubmitEmision";
                        validar(vm.formEmision);
                        if(!vm.formEmision){
                        	vm.validarTarifa();
                        }
                        break;
                        case 4:
                        	vm.indice = vm.indice + 1;
                        break;
                        case 5: 
                        	vm.formulario="formSubmitPago";
                            validar(vm.formDatosPago);
                            if(!vm.formDatosPago){
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
                        vm.formulario = "formSubmitVivienda";
                        validar(vm.formVivienda);
                        getDatosCat();
                        break;
                    case 2:
                        vm.formulario = "formSubmitCaracteristicas";
                        validar(vm.formCaracteristicas);
                        break;
                    case 3:
                        vm.formulario = "formSubmitCapitales";
                        validar(vm.formCapitales);
                        break;
                    case 4:
                        vm.formulario = "formSubmitOtros";
                        validar(vm.formOtros);
                        if(!vm.formOtros){
                        	vm.indice=5;
                        	vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_MULTIRRIESGOS');	
                        }
                        break;
                    default:
                        vm.formulario = "formSubmitVivienda";
                        vm.indice = 1;
                        break;

                }
            }

        }

        vm.changePago = function(tipo){
        	if(tipo == 'bancaria'){
        		if(vm.datos.DATOS_PAGO != undefined && vm.datos.DATOS_PAGO.CO_IBAN != undefined){
        			delete vm.datos.DATOS_PAGO.CO_IBAN;
        		}
        	}else{
        		if(vm.datos.DATOS_PAGO != undefined){
        			if(vm.datos.DATOS_PAGO.CO_BANCO != undefined){
        				delete vm.datos.DATOS_PAGO.CO_BANCO;
        			}
        			if(vm.datos.DATOS_PAGO.NO_SUCURSAL != undefined){
        				delete vm.datos.DATOS_PAGO.NO_SUCURSAL;
        			}
        			if(vm.datos.DATOS_PAGO.NU_DC != undefined){
        				delete vm.datos.DATOS_PAGO.NU_DC;
        			}
        			if(vm.datos.DATOS_PAGO.NU_CUENTA != undefined){
        				delete vm.datos.DATOS_PAGO.NU_CUENTA;
        			}
        		}
        	}
        }
        
        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }

        // Búsquedas AutoComplete
    	vm.querySearch = function(query, list, key){
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
			if(key == 'DS_TIPO_VIA') {
				var uppercaseQuery = query.charAt(0).toUpperCase() + query.slice(1);
			} else {
				var uppercaseQuery = query.toUpperCase();
			}
	
    		return function filterFn(list) {
    			if(key == 'DS_TIPO_VIA')
                    return (list[key].indexOf(uppercaseQuery) === 0);
                else if(key == 'via')
    				return (list.indexOf(uppercaseQuery) >= 0);
    			else
    				return (list[key].indexOf(uppercaseQuery) >= 0);
    		};
        }
        
        vm.buscarVias = function (txt) {

            objDir = {
                'NO_PROVINCIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.DS__CO_PROVINCIA,
                'NO_MUNICIPIO': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD,
                'NO_TIPO_VIA': vm.tipoViaSeleccionada.CO_TIPO_VIA,
                'NOMBRE_VIA': txt
            };

            vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA = '';
            
            if(txt.length == 3) {
                // var deferred = $q.defer();
                HogarService.getVias(objDir)
                .then(function successCallback(response) {
                    if(response) {
                        vm.listaVias = response.data.LISTA_VIAS;
                    }
                    else{
                        vm.listaVias = [];
                    }
                    
                });
            } 
        }

        vm.buscarDireccionesSug = function () {
            
            vm.objDirNum = JSON.parse(JSON.stringify(objDir));
            vm.objDirNum.NOMBRE_VIA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION
            vm.objDirNum.NUMERO = vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO

            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA = '';
            
            HogarService.getDatosCatastralesDir(vm.objDirNum)
            .then(function successCallback(response) {

                if(response != undefined) {
                    if(response.data.DIRECCIONES_SUGERIDAS != undefined) {

                        vm.listaDireccionesSug = response.data.DIRECCIONES_SUGERIDAS;

                        vm.listaBloques = [];
                        vm.listaEscaleras = [];
                        vm.listaPlantas = [];
                        vm.listaPuertas = [];

                        for(var i = 0; i < vm.listaDireccionesSug.length; i++) {
                            if(vm.listaDireccionesSug[i].BLOQUE != undefined) {
                                if(vm.listaBloques.indexOf(vm.listaDireccionesSug[i].BLOQUE) == -1) {
                                    vm.listaBloques.push(vm.listaDireccionesSug[i].BLOQUE);
                                }
                            } else {
                                if(vm.listaDireccionesSug[i].ESCALERA != undefined) {
                                    if(vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                        vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                                    }
                                } else {
                                    if(vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                        vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                    }
                                }
                            } 
                        }

                    } else if(response.data.DATOS_CATASTRALES != undefined) {
                        if(response.data.DATOS_CATASTRALES.CO_REFERENCIA != undefined) {
                            vm.listaBloques = [];
                            vm.listaEscaleras = [];
                            vm.listaPlantas = [];
                            vm.listaPuertas = [];
                        }

                    }
                } 
            });
        }

        vm.listarPisos = function(tipoListado) {

            switch (tipoListado) {
                case 'bloque':
                    vm.listaEscaleras = [];
                    vm.listaPlantas = [];
                    vm.listaPuertas = [];

                    for(var i = 0; i < vm.listaDireccionesSug.length; i++) {
                        if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                            if(vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                            }
                        }
                    }
                    break;
                case 'escalera':
                    vm.listaPlantas = [];
                    vm.listaPuertas = [];
    
                    for(var i = 0; i < vm.listaDireccionesSug.length; i++) {

                        if(vm.listaBloques.length > 0) {
                            if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    if(vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                        vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                    }
                                }
                            }
                        } else {
                            if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                if(vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                    vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                }
                            }
                        }
                    }
                    break;
                case 'planta':
                    vm.listaPuertas = [];

                    for(var i = 0; i < vm.listaDireccionesSug.length; i++) {

                        if(vm.listaBloques.length > 0) {
                            if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                        vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                    }
                                }
                            }
                        } else {
                            if(vm.listaEscaleras.length > 0) {
                                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                        vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                    }
                                }
                            } else {
                                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                    vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                }
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        function getDatosCat() {

            if(vm.estadoCatastro == 0) {
                vm.objDirCom = JSON.parse(JSON.stringify(vm.objDirNum));
                vm.objDirCom.BLOQUE = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL;
                vm.objDirCom.ESCALERA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA;
                vm.objDirCom.PLANTA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA
                vm.objDirCom.PUERTA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA

                HogarService.getDatosCatastralesDir(vm.objDirCom)
                .then(function successCallback(response) {

                    if(response != undefined) {
                        vm.datosCatastrales = response.data.DATOS_CATASTRALES;

                        vm.datos.BLOCK_INFORMACION_VIVIENDA.CA_METROS_CUADRADOS = vm.datosCatastrales.NU_SUPERFICIE
                        vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION = vm.datosCatastrales.NU_ANYO_CONSTRUCCION

                    }
                    
                });
            }
        }
    }

    ng.module('App').component('preMultirriesgosApp', Object.create(preMultirriesgosComponent));



})(window.angular);