(function (ng) {


    //Crear componente de app
    var preHogarComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$scope', '$route', '$location', '$window', '$timeout', '$mdDialog', 'TiposService', 'BusquedaService', 'SolicitudService', 'PresupuestoService', 'LocalidadesService', 'ValidacionPagoService', 'HogarService', 'PolizaService', 'BASE_SRC', 'ClienteService', 'constantsTipos'],
        require: {
            parent: '^sdApp',
            pre: '^?sdPresupuesto',
            clave: '^?busquedaPresupuesto'
        },
        bindings: {
            idRamo: '<',
            idColectivo: '<',
            tarifas: '<'
        }
    }

    preHogarComponent.controller = function preHogarComponentControler($scope, $route, $location, $window, $timeout, $mdDialog, TiposService, $sce, PresupuestoService, LocalidadesService, ValidacionPagoService, HogarService, PolizaService, BASE_SRC, ClienteService, constantsTipos) {
        var vm = this;
        vm.tipos = {};
        vm.listCatastro = false;
        vm.google = false;
        vm.manual = false;
        vm.catastro = false;
        vm.busquedaViv = false;
        vm.rol = $window.sessionStorage.rol;
        vm.usoVivienda = false;
        vm.datDireccion = false;
        vm.puedeContratar = true;
        vm.cargando = false;
        vm.apisSL = false;
        vm.dirNormRC = false;
        vm.viviendaValidada = false;
        var msg = $mdDialog.alert().clickOutsideToClose(true).ok('Aceptar');
        vm.optCatastro = false;
        vm.optManual = false;
        vm.direccionValida = true;
        vm.showResult = false;
        vm.refreshAutocomplete = false;
        vm.busquedaManual = false;
        vm.maxDateEfect = new Date();
        vm.maxDateEfect = new Date(vm.maxDateEfect.setMonth(vm.maxDateEfect.getMonth() + 3));

        /*GOOGLE VARIABLES*/
        vm.optGoogle = false
        vm.googleAutocompleteReady = false
        vm.inputSearchLoading = $sce.trustAsHtml("<div style=\"margin-right: 8px\" class=\"lds-ring\"><div></div><div></div><div></div><div></div></div> Conectando con Google, por favor espera...")
        vm.inputSearchReady = $sce.trustAsHtml("<img id=\"img-icon-google\" style=\"margin-right: 8px;height: 12px;\" src=\"src/img/segurodigital/small-google-icon-2023.png\"/>Introduce la dirección de la vivienda")

        vm.requireNumber = false
        vm.requireCodPostal = false

        vm.normalizandoDireccion = false
        vm.direccionNormalizada = false
        vm.riesgoConfirmado = false
        vm.confirmandoRiesgo = false

        vm.tipologiaVivienda = ""

        vm.buscandolocalidades = false
        vm.blockChangeAseguradora = false

        vm.catastroEnMantenimiento = false
        vm.vivValidada = false;
        vm.propiedadVertical = false
        vm.useCatastro = true;
        vm.responseLocalidades = []

        this.$onInit = function () {
            //Indica el paso en el que estamos, para renderizar un html u otro
            vm.pasoPresupuesto = 1;
            vm.anoRenovacion = ((new Date().getFullYear()) - 30);

            if (vm.pre != null && vm.pre.llave == "contratar") {
                vm.pasoPresupuesto = 2;
            }

            TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.CONFIGURACION,
                    "CO_TIPO": "APIS_SL"
                })
                .then(function successCallback(response) {
                    if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                        if (response.data.TIPOS.TIPO[0].DS_TIPOS == "true" || response.data.TIPOS.TIPO[0].DS_TIPOS == true) {
                            vm.apisSL = true;
                        } else {
                            vm.apisSL = false;
                        }
                    } else {
                        vm.apisSL = false;
                    }
                    localStorage.setItem('apisSL', vm.apisSL);
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });

            TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.CONFIGURACION,
                    "CO_TIPO": "API_KEY_GOOGLE_PLACEMENTS"
                })
                .then(function successCallback(response) {
                    if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {
                        vm.tokenGoogle = response.data.TIPOS.TIPO[0].DS_TIPOS;
                        vm.loadScriptGoogle();
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });

            if (vm.parent.listServices.listTiposVia != null && vm.parent.listServices.listTiposVia.length > 0) {
                vm.tipos.tiposVia = vm.parent.listServices.listTiposVia;
            } else {
                HogarService.getTiposVia({})
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            vm.tipos.tiposVia = response.data.TIPO_VIA
                            vm.parent.listServices.listTiposVia = vm.tipos.tiposVia;
                            if (vm.isEdited == true) {
                                vm.setRoadType();
                            }
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.parent.logout();
                        }
                    });
            }

            if(vm.parent.listServices.listNacionalidades != null && vm.parent.listServices.listNacionalidades.length > 0) {
                vm.tipos.paises = vm.parent.listServices.listNacionalidades;
            } else {
                TiposService.getNacialidades()
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.paises = response.data.PAISES.PAIS
                        vm.parent.listServices.listNacionalidades = vm.tipos.paises;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            }
            
            if(vm.parent.listServices.listBancos != null && vm.parent.listServices.listBancos.length > 0) {
                vm.bancos = vm.parent.listServices.listBancos;
            } else {
                HogarService.getBancos({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.bancos = response.data.FIELD;
                        vm.parent.listServices.listBancos = vm.bancos;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            }
            
            //Si el presupuesto es nuevo
            if (vm.pre != null && vm.pre.detalles.ID_PRESUPUESTO == undefined) {
                vm.cargando = false;
                vm.isNew = true;
                if (vm.pre.detalles.OCLIENTE != undefined) {
                    var objClient = JSON.parse(JSON.stringify(vm.pre.detalles.OCLIENTE));
                    var lstData = ['NO_NOMBRE', 'NO_APELLIDO1', 'FD_NACIMIENTO', 'ID_TIPO_DOCUMENTO', 'NU_DOCUMENTO', 'CO_NACIONALIDAD', 'NO_EMAIL', 'NU_TELEFONO'];
                    vm.blockDatosTomador = {};
                    for (var i = 0; i < lstData.length; i++) {
                        for (data in objClient) {
                            if (objClient[data] != undefined) {
                                if (data != 'NU_TELEFONO1') {
                                    if (lstData[i] == data) {
                                        vm.blockDatosTomador[data] = objClient[data];
                                    }
                                } else {
                                    vm.blockDatosTomador['NU_TELEFONO'] = objClient['NU_TELEFONO1'];
                                }
                            }
                        }
                    }

                    if (objClient.NO_APELLIDO2 != null) {
                        vm.blockDatosTomador.NO_APELLIDO1 = vm.blockDatosTomador.NO_APELLIDO1 + " " + objClient.NO_APELLIDO2;
                    }
                }

                var perfil = JSON.parse(sessionStorage.getItem('perfil'));
                if (perfil != null) {
                    vm.colectivos = perfil.colectivos;
                    vm.idColectivo = null;
                    var colectivosTarificables = vm.getColectivosTarificables();

                    if (vm.colectivos.length == 1) {
                        vm.idColectivo = vm.colectivos[0].ID_TIPO_POLIZA;
                    } else if (colectivosTarificables != null && colectivosTarificables.length == 1) {
                        vm.idColectivo = colectivosTarificables[0].ID_TIPO_POLIZA;
                        vm.colectivo = colectivosTarificables[0];
                    } else {
                        vm.showColectivos();
                    }
                }
            } else if (vm.pre != null && vm.pre.detalles != undefined && vm.pre.detalles != null) {
                vm.isEdited = true;
                vm.presuEdited = true;
                if(vm.pre.llave == 'presupuesto')
                    vm.indice = 2;

                if (vm.pre.detalles.ID_PRESUPUESTO != undefined && vm.pre.detalles.ID_PRESUPUESTO != null) {
                    vm.idPresupuesto = vm.pre.detalles.ID_PRESUPUESTO;
                }

                if (vm.pre.detalles.PRESU_MODEL != null && vm.pre.detalles.PRESU_MODEL != undefined) {
                    vm.datos = JSON.parse(JSON.stringify(vm.pre.detalles.PRESU_MODEL));
                } else if (vm.pre.detalles.HOGAR != null && vm.pre.detalles.HOGAR != undefined) {
                    vm.datos = JSON.parse(JSON.stringify(vm.pre.detalles.HOGAR));
                }

                if(vm.pre.llave == 'presupuesto' || vm.pre.llave == 'resumen')
                    vm.resumenVivienda(vm.datos.BLOCK_DIRECCION_VIVIENDA);

                vm.datos.NO_USUARIO = JSON.parse($window.sessionStorage.perfil).usuario;
                if (vm.tipos.tiposVia != undefined) {
                    vm.setRoadType();
                }

                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.IN_CATASTRO == false)
                    vm.estadoCatastro = 902;

                vm.cambiarAseguradora = true;
                if (vm.pre.detalles != null && vm.pre.detalles.LIST_TARIFAS != null && vm.pre.detalles.LIST_TARIFAS.length > 0) {
                    var idCompaniaTarifa = vm.pre.detalles.LIST_TARIFAS[0].ID_COMPANIA;
                    if (idCompaniaTarifa == 78) {
                        vm.codAseguradora = 2; // 1 = SL / 2 = BBVA
                    } else {
                        vm.codAseguradora = 1
                    }
                    vm.cambiarAseguradora = false;
                }
                
                vm.getCombAseguradoras()
                // if (vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL)
                //     vm.getAseguradora(vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL);

                if (vm.pre.detalles != null && vm.pre.detalles.OCLIENTE != null && vm.pre.detalles.OCLIENTE.NU_DOCUMENTO != null) {
                    ClienteService.getCliente({
                            NU_DOCUMENTO: vm.pre.detalles.OCLIENTE.NU_DOCUMENTO
                        })
                        .then(function successCallback(data) {
                            if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                                vm.clienteBuscado = data.data;
                                vm.existeCliente = true;
                                vm.documentoBuscado = true;
                                vm.documentoBuscadoContratacion = true;
                                var cliente = data.data;

                                if (vm.datos.DATOS_TOMADOR != null) {
                                    //Añadir a los datos del tomador algunos campos que no los guardaba
                                    var listCampos = ["CO_NACIONALIDAD", "ID_TIPO_DOCUMENTO", "NU_TELEFONO", "FD_NACIMIENTO", "NO_APELLIDO1", "NO_EMAIL", "NO_NOMBRE", "NU_DOCUMENTO", "NU_TELEFONO1"];
                                    for (var i = 0; i < listCampos.length; i++) {
                                        if (cliente[listCampos[i]] != null && vm.datos.DATOS_TOMADOR[listCampos[i]] == null) {
                                            vm.datos.DATOS_TOMADOR[listCampos[i]] = cliente[listCampos[i]];
                                        } else if (vm.datos.DATOS_TOMADOR[listCampos[i]] != null && cliente[listCampos[i]] == null) {
                                            cliente[listCampos[i]] = vm.datos.DATOS_TOMADOR[listCampos[i]];
                                            if (listCampos[i] == "NU_TELEFONO") {
                                                cliente.NU_TELEFONO1 = vm.datos.DATOS_TOMADOR[listCampos[i]];
                                            }
                                        }
                                    }
                                }

                                vm.camposEditablesDescarga = {
                                    NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                                    NO_APELLIDO1: (cliente.NO_APELLIDO1 == null || cliente.NO_APELLIDO1 == "") ? true : false,
                                    NO_EMAIL: true,
                                    NU_TELEFONO: (cliente.NU_TELEFONO1 == null || cliente.NU_TELEFONO1 == "") ? true : false,
                                    NU_DOCUMENTO: (cliente.NU_DOCUMENTO == null || cliente.NU_DOCUMENTO == "") ? true : false
                                }
                                vm.camposEditablesContratacion = {
                                    ID_TIPO_DOCUMENTO: (cliente.ID_TIPO_DOCUMENTO == null || cliente.ID_TIPO_DOCUMENTO == "") ? true : false,
                                    NU_DOCUMENTO: (cliente.NU_DOCUMENTO == null || cliente.NU_DOCUMENTO == "") ? true : false,
                                    CO_NACIONALIDAD: (cliente.CO_NACIONALIDAD == null || cliente.CO_NACIONALIDAD == "") ? true : false,
                                    NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                                    NO_APELLIDO1: true,
                                    FD_NACIMIENTO: (cliente.FD_NACIMIENTO == null || cliente.FD_NACIMIENTO == "") ? true : false,
                                    NO_EMAIL: !vm.emailCorrect(cliente.NO_EMAIL) ? true : false,
                                    NU_TELEFONO: (cliente.NU_TELEFONO1 == null || cliente.NU_TELEFONO1 == "") ? true : false,
                                    CO_IBAN: true
                                }

                                //Si tenemos solo el primer apellido
                                if (cliente.NO_APELLIDO1 != null) {
                                    //Comprobamos si este apellido_1 contiene 2 apellidos, si no, dejamos editable
                                    if (cliente.NO_APELLIDO1.split(" ").length > 1) {
                                        vm.camposEditablesContratacion.NO_APELLIDO1 = false;
                                    } else {
                                        vm.camposEditablesContratacion.NO_APELLIDO1 = true;
                                    }
                                }
                            }
                        }, function callBack(response) {});
                }

                if (vm.datos != undefined) {

                    vm.blockDatosPago = null;
                    vm.blockDatosTomador = null;
                    vm.blockCapitales = null;
                    vm.blockDatosPrestamo = null;

                    if (vm.datos.DATOS_TOMADOR != null && vm.datos.DATOS_TOMADOR != undefined) {
                        vm.blockDatosTomador = vm.datos.DATOS_TOMADOR;
                    }

                    if (vm.datos.DATOS_PAGO != null && vm.datos.DATOS_PAGO != undefined) {
                        vm.blockDatosPago = vm.datos.DATOS_PAGO;
                    }

                    if (vm.datos.DATOS_PRESTAMO != null && vm.datos.DATOS_PRESTAMO != undefined) {
                        vm.blockDatosPrestamo = vm.datos.DATOS_PRESTAMO;
                    }

                    if (vm.datos.BLOCK_CAPITALES != null && vm.datos.BLOCK_CAPITALES != undefined) {
                        vm.blockCapitales = JSON.parse(JSON.stringify(vm.datos.BLOCK_CAPITALES));
                    }

                    //Añadimos a textoBusquedaNombreVia el valor que viene de bbdd para pintarlo
                    vm.textoBusquedaNombreVia = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION;

                    vm.objDir = {
                        'NO_PROVINCIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.DS__CO_PROVINCIA,
                        'NO_MUNICIPIO': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD,
                        'NO_TIPO_VIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_TIPO_VIA,
                        'NOMBRE_VIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION
                    };

                }

                if (vm.pre.llave == "presupuesto") {
                    //Si es nuevo o se edite, llamar a getPlantilla para recoger el codAseguradora
                    if (vm.cambiarAseguradora != false) {
                        HogarService.getPlantilla(vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA)
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.codAseguradora = response.data.ID_RESULT; // 1 = SL / 2 = BBVA
                            }
                            // vm.cargando = false;
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                    }
                } else if (vm.pre.llave == "contratar") {
                    //Cuando estemos en la pantalla contratar
                    //Montamos el objeto que vamos a usar, ya que el que nos viene no nos vale 
                    vm.objPres = {
                        PRESUPUESTO: {
                            HOGAR: vm.pre.detalles.HOGAR,
                            ID_RAMO: vm.pre.detalles.ID_RAMO,
                            NO_USUARIO: JSON.parse($window.sessionStorage.perfil).usuario
                        },
                        ID_PRESUPUESTO: vm.pre.detalles.ID_PRESUPUESTO,
                        MODALIDADES: {
                            MODALIDAD: []
                        }
                    }

                    //Comprobamos que el presupuesto se puede contratar
                    //Se puede contratar cuando la fecha de modificación o contratación, no superen 15 días desde hoy
                    var fechaCreacion = vm.pre.detalles.FT_USU_ALTA;
                    var fechaModificacion = vm.pre.detalles.FT_USU_MOD;
                    var fechaHastaPermitido = new Date();
                    var fechaActual = new Date().getTime();

                    if (fechaModificacion != null) {
                        fechaHastaPermitido = new Date(fechaModificacion);
                    } else if (fechaCreacion != null) {
                        fechaHastaPermitido = new Date(fechaCreacion);
                    }

                    fechaHastaPermitido = new Date(fechaHastaPermitido.setDate(fechaHastaPermitido.getDate() + 15));

                    if (fechaActual > fechaHastaPermitido.getTime()) {
                        vm.puedeContratar = false;
                    } else {
                        vm.puedeContratar = true;
                    }

                    //Si al contratar, el presupuesto tiene modalidad ya seleccionada, se preselecciona la modalidad
                    if (vm.pre.detalles.LIST_TARIFA_EMISION != null && vm.pre.detalles.LIST_TARIFA_EMISION[0] != null) {
                        var modalidadSeleccionada = vm.pre.detalles.LIST_TARIFA_EMISION[0];
                        vm.modalidad = modalidadSeleccionada;
                        vm.precioModalidad = vm.modalidad.IM_PRIMA_ANUAL_TOT;
                        vm.tipo = vm.modalidad.ID_MODALIDAD;

                        if (vm.modalidad != null && vm.modalidad.LIST_GARANTIA != null) {
                            vm.modalidad.GARANTIAS = {
                                GARANTIA: vm.modalidad.LIST_GARANTIA
                            }
                            if (vm.modalidad.LIST_GARANTIA.find(x => x.ID_GARANTIA == 1079) != null) {
                                vm.serLinBla = true;
                            }
                            if (vm.modalidad.LIST_GARANTIA.find(x => x.ID_GARANTIA == 1081) != null) {
                                vm.serExp = true;
                            }
                        }
                        if(vm.modalidad)
                            vm.objPres.PRESUPUESTO.MODALIDAD = vm.modalidad;
                    }

                    //Añadimos las modalidades al objeto(si tiene)
                    if (vm.pre.detalles.LIST_TARIFAS != undefined) {
                        var listModalidades = [];
                        for (var i = 0; i < vm.pre.detalles.LIST_TARIFAS.length; i++) {
                            var modalidad = vm.pre.detalles.LIST_TARIFAS[i];
                            var garantias = [];

                            if (modalidad.LIST_GARANTIA != undefined) {
                                for (var j = 0; j < modalidad.LIST_GARANTIA.length; j++) {
                                    garantias.push(modalidad.LIST_GARANTIA[j]);
                                }
                                modalidad.GARANTIAS = {
                                    GARANTIA: garantias
                                }
                            } else {
                                //Si la modalidad no tiene garantías ponemos vm.tieneGarantias a false para que muestre un mensaje
                                vm.tieneGarantias = false;
                            }

                            listModalidades.push(modalidad);
                        }
                        vm.objPres.MODALIDADES.MODALIDAD = listModalidades;
                        vm.listaModalidades = listModalidades;
                    } else {
                        //Si no hay tarifas en la pantalla de contratación, ponemos vm.tieneGarantias a false para que muestre un mensaje
                        vm.tieneGarantias = false;
                        vm.puedeContratar = false;
                    }

                    if (vm.cambiarAseguradora != false) {
                        //Llamamos a getPlantilla para recoger codigo de la aseguradora
                        HogarService.getPlantilla(vm.objPres.PRESUPUESTO.HOGAR.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA)
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.codAseguradora = response.data.ID_RESULT; // 1 = SL / 2 = BBVA
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                    }

                    if (vm.pre.detalles.LIST_CAMPAIGN && vm.pre.detalles.LIST_CAMPAIGN.length > 0) {
                        vm.promocion = vm.pre.detalles.LIST_CAMPAIGN[0];
                        vm.objPres.PRESUPUESTO.ID_PROMO = vm.promocion.ID_CAMPAIGN;
                        vm.dsPromocion = vm.promocion.DS_LONG;
                        vm.dsPromocionShort = vm.promocion.DS_SHORT;
                        vm.rangoPromocion = vm.promocion.NO_RANGO;
                        vm.parrLegal = vm.promocion.DS_LONG_DESC;

                        if(vm.parrLegal != null) {
                            vm.txtLegal = true;
                            vm.parrLegal = $sce.trustAsHtml(vm.parrLegal);
                        }
                        if(vm.dsPromocionShort != null && vm.pre.detalles.LIST_TARIFA_EMISION && vm.pre.detalles.LIST_TARIFA_EMISION[0].IM_PRIMA_ANUAL) {
                            porcPromo = vm.rangoPromocion / 100;
                            vm.importeReembolso = (vm.pre.detalles.LIST_TARIFA_EMISION[0].IM_PRIMA_ANUAL * porcPromo).toFixed(2);
            
                            if (vm.importeReembolso != null) {
                                vm.dsPromocionNoImp = true;
                                vm.importeDesc = (vm.pre.detalles.LIST_TARIFA_EMISION[0].IM_PRIMA_ANUAL_TOT - vm.importeReembolso).toFixed(2);
                                vm.dsPromocionShort = vm.dsPromocionShort.replace('[importeReembolso]', vm.importeReembolso).replace('[importeDesc]', vm.importeDesc);
            
                                if (vm.dsPromocionShort) {
                                    vm.viewPromo = true;
                                    $sce.trustAsHtml(vm.dsPromocionShort);
                                }
                            }
                        } else {
                            vm.dsPromocionShort = "Importe a reembolsar por promoción en la primera anualidad : " + vm.rangoPromocion + " % de la prima neta anual."
                        }
                    }

                    if (vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PRESTAMO != null && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PRESTAMO.IN_PRESTAMO == true) {
                        vm.deshabilitarCheckHipoteca = true;
                    }
                    if (vm.objPres.MODALIDADES && vm.objPres.MODALIDADES.MODALIDAD && vm.objPres.MODALIDADES.MODALIDAD.length > 0) {
                        var producto = vm.objPres.MODALIDADES.MODALIDAD[0].ID_COMP_RAMO_PROD;
                        vm.getTipoDocumentoByProducto(producto);
                    }
                    if (vm.objPres.PRESUPUESTO && vm.objPres.PRESUPUESTO.HOGAR && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR.length > 35 && vm.codAseguradora == 1) {
                        vm.errorLongitudTitular = true;
                        var mostrandoErrorTitular = false;
                        setTimeout(function () {
                            if (mostrandoErrorTitular == false && vm.formHogarTomador != null && vm.formHogarTomador.titularCuenta != null) {
                                vm.formHogarTomador.titularCuenta.$touched = true;
                                vm.formHogarTomador.titularCuenta.$setValidity('maxLength', false);
                                mostrandoErrorTitular = true;
                            }
                        }, 1000)
                    }

                } else if (vm.pre.llave == "resumen") {

                    //Si estamos en el resumen
                    //Si no se ha emitido
                    if (vm.pre.detalles.IN_EMITIDO != '1') {

                        //Creamos objeto a usar
                        vm.datos.MODALIDADES = {
                            MODALIDAD: []
                        }

                        //Añadimos las tarifas si tiene
                        if (vm.pre.detalles.LIST_TARIFAS != undefined) {
                            var listModalidades = [];
                            for (var i = 0; i < vm.pre.detalles.LIST_TARIFAS.length; i++) {
                                var modalidad = vm.pre.detalles.LIST_TARIFAS[i];
                                var garantias = [];

                                if (modalidad.LIST_GARANTIA != undefined) {
                                    for (var j = 0; j < modalidad.LIST_GARANTIA.length; j++) {
                                        garantias.push(modalidad.LIST_GARANTIA[j]);
                                    }
                                    modalidad.GARANTIAS = {
                                        GARANTIA: garantias
                                    }
                                }
                                listModalidades.push(modalidad);
                            }
                            vm.datos.MODALIDADES.MODALIDAD = listModalidades;
                        }

                        //Lamamos a getPlantilla para recoger el código de la aseguradora
                        /*HogarService.getPlantilla(vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA)
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.codAseguradora = response.data.ID_RESULT; // 1 = SL / 2 = BBVA
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });*/
                    } else {
                        //Si el presupuesto está emitido no tendrá PRESU_MODEL, por lo que usamos el campo JS_ENVIADO
                        if(vm.pre.detalles.JS_ENVIADO)
                            vm.datos = JSON.parse(vm.pre.detalles.JS_ENVIADO);

                        vm.datos.MODALIDADES = {
                            MODALIDAD: []
                        };

                        //Estando ya emitido, en vez de recoger LIST_TARIFAS recogemos LIST_TARIFAS_EMISION
                        if (vm.pre.detalles.LIST_TARIFA_EMISION != undefined && vm.pre.detalles.LIST_TARIFA_EMISION != null) {
                            var listModalidades = [];
                            for (var i = 0; i < vm.pre.detalles.LIST_TARIFA_EMISION.length; i++) {
                                var modalidad = vm.pre.detalles.LIST_TARIFA_EMISION[i];
                                var garantias = [];

                                if (modalidad.LIST_GARANTIA != undefined) {
                                    for (var j = 0; j < modalidad.LIST_GARANTIA.length; j++) {
                                        garantias.push(modalidad.LIST_GARANTIA[j]);
                                    }
                                    modalidad.GARANTIAS = {
                                        GARANTIA: garantias
                                    }
                                }
                                listModalidades.push(modalidad);
                            }
                            vm.datos.MODALIDADES.MODALIDAD = listModalidades;
                        }
                    }
                }

                if (vm.datos.DATOS_PAGO != undefined && vm.datos.DATOS_PAGO != null) {
                    if (vm.datos.DATOS_PAGO.FD_INICIO != null && vm.datos.DATOS_PAGO.FD_INICIO != undefined) {
                        vm.datos.DATOS_PAGO.FD_INICIO = new Date(vm.datos.DATOS_PAGO.FD_INICIO);
                    }
                }
            }

            TiposService.getTipos({'ID_CODIGO': 22, 'CO_TIPO': `MOSTRAR_BONI_${vm.rol}`})
            .then(function successCallback(response) {
            	if(response.data.TIPOS && response.data.TIPOS.TIPO && response.data.TIPOS.TIPO.length > 0) {
                    vm.showModalityRefund = true;
            	} else {
                    vm.showModalityRefund = false;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

        }

        this.loadTemplate = function () {
            if (vm.pre != null) {
                vm.llave = vm.pre.llave;
            } else if (vm.llave != "contratar") {
                vm.llave = "nuevo";
            }
            if (vm.llave == "presupuesto" || vm.llave == "nuevo") {
                if (vm.pasoPresupuesto == 1) {
                    return "src/presupuesto/form.presupuesto.view/hogar.view/pre.hogar.paso1.html";
                } else if (vm.pasoPresupuesto == 2) {
                    // vm.llave = 'contratar';
                    return "src/presupuesto/form.presupuesto.view/hogar.view/pre.hogar.paso2.html";

                } else if (vm.pasoPresupuesto == 3) {
                    return "src/presupuesto/form.presupuesto.view/hogar.view/pre.hogar.paso3.html";
                }
            } else if (vm.llave == "contratar") {
                return "src/presupuesto/form.presupuesto.view/hogar.view/pre.hogar.paso2.html";
            } else if (vm.llave == "resumen") {
                return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.hogar.html";
            }
        }

        this.$onChanges = function () {}

        vm.changeFlujo = function (flujo) {
			
            if (!vm.datos || !vm.datos.BLOCK_USO_REGIMEN || !vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA) {

                msg.textContent("Antes de elegir una opción de búsqueda debes establecer la titularidad de la vivienda.");
                $mdDialog.show(msg)

            } else {
                vm.borrarForm();

                // const ID_REGIMEN_VIVENDA_PASO1 = vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA;
                //
                // vm.datos = {};
                // vm.datos.BLOCK_DIRECCION_VIVIENDA = {
                // 	"NO_DIRECCION_COMPLETA": "",
                // 	"ID_ROL": ""
                // }

                // vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA = ID_REGIMEN_VIVENDA_PASO1;

                switch (flujo) {

                    case "google":
                        vm.optGoogle === true ? vm.optGoogle = false : vm.optGoogle = true
                        vm.optCatastro = false
                        vm.optManual = false

                        vm.requireNumber = undefined
                        vm.requireCodPostal = undefined

                        break;

                    case "catastro":
                        vm.optGoogle = false;
                        vm.optCatastro === true ? vm.optCatastro = false : vm.optCatastro = true;
                        vm.optManual = false;
                        break;

                    case "manual":

                        vm.optGoogle = false;
                        vm.optCatastro = false;
                        vm.optManual === true ? vm.optManual = false : vm.optManual = true;
                        break;
                }
            }
        }


        /*=================== INICIALIZACIÓN GOOGLE PLACE AUTOCOMPLETE ===================*/

        vm.loadScriptGoogle = function () {

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&output=json&key=' + vm.tokenGoogle;
            document.body.appendChild(script);
            setTimeout(function () {
                vm.initAutocomplete();
            }, 500);
        }

        vm.initAutocomplete = function () {
            if (typeof google == 'undefined') {
                setTimeout(function () {
                    vm.initAutocomplete();
                }, 500);
            } else {

                vm.sessionToken = new google.maps.places.AutocompleteSessionToken();

                vm.componentForm = {
                    street_number: 'long_name',
                    route: 'long_name',
                    country: 'long_name',
                    postal_code: 'short_name',
                    administrative_area_level_1: "long_name",
                    administrative_area_level_2: "long_name",
                    locality: "long_name"
                };

                vm.optionsForm = {
                    types: ["address"],
                    fields: ["place_id", "address_components"],
                    componentRestrictions: {
                        country: "es"
                    },
                    sessionToken: vm.sessionToken
                };

                var input = document.getElementById('input_google_search');
                if (input)
                    input.placeholder = '';

                autocomplete = new google.maps.places.Autocomplete(input, vm.optionsForm);

                autocomplete.addListener('place_changed', vm.fillInAddress);

                document.getElementById("input_google_search").addEventListener('focusout', function () {
                    //Refrescar token
                    setTimeout(function () {
                        if ((autocomplete.sessionToken && autocomplete.sessionToken.Qn !== vm.sessionToken.Qn) || vm.direccionSeleccionada === false) {
                            vm.refreshTokenPlace();
                        }
                        vm.direccionSeleccionada = false;
                    }, 500);
                }, false);
            }

            vm.googleAutocompleteReady = true;
        }

        vm.refreshTokenPlace = function () {
            vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
            autocomplete.setOptions({
                sessionToken: vm.sessionToken
            });
            if (!angular.element('#input_google_search').val()) {
                autocomplete.set('place', null);
            }
        }

        // vm.deshabilitarCatastro = function () {
        //     if(vm.codAseguradora === '2')
        //         vm.deshabilitarCatastro = trueº
        // }

        vm.setRegimenVivienda = function (regimenVivienda) {
            /*
            SANTA LUCIA: Propietario para uso (01); Inquilino (02); Propietario (para alquiler) (03)
            BBVA: NO APLICA
             */

            if(vm.viviendaValidada === true
                || vm.dirNormRC === true
                || vm.dirNormViv === true
                || vm.riesgoConfirmado === true
                || vm.direccionNormalizada === true
                || vm.blockChangeAseguradora)
                return

            if (!vm.datos)
                vm.datos = {}

            if (!vm.datos.BLOCK_USO_REGIMEN)
                vm.datos.BLOCK_USO_REGIMEN = {}

            vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA = regimenVivienda;

        }

        vm.setUsoVivienda = function (usoVivienda) {
            /*
            SANTA LUCIA: Vivienda Principal/Habitual (H); Vivienda Secundaria (S)
            BBVA: Vivienda Principal/Habitual (H); Vivienda Secundaria (S); Vivienda alquilada (SOLO Propietario)
             */

            if (!vm.datos.BLOCK_USO_REGIMEN)
                vm.datos.BLOCK_USO_REGIMEN = {};

            vm.datos.BLOCK_USO_REGIMEN.ID_USO_VIVIENDA = usoVivienda;
        }

        vm.setTipologiaVivienda = function (CO_FIELD) {

            if(vm.dirNormViv === true || vm.riesgoConfirmado === true)
                return

            if (!vm.datos.BLOCK_INFORMACION_VIVIENDA)
                vm.datos.BLOCK_INFORMACION_VIVIENDA = {}

            vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_VIVIENDA = CO_FIELD
            vm.tipologiaVivienda = CO_FIELD

        }

        /*=================== FUNCIONES ASIGNADAS A GOOGLE PLACE AUTOCOMPLETE ===================*/

        vm.validarDireccionAseguradora = function () {

            vm.normalizandoDireccion = true

            const streetNumber = $("#input_street_number").val();
            const postalCode = $("#input_postal_code").val();

            if (streetNumber !== undefined) {
                vm.datos.BLOCK_DIRECCION_VIVIENDA.STREET_NUMBER = streetNumber
            } else {
                msg.textContent("Número de vía incorrecto. Por favor, revísalo y vuelve a intentarlo.");
                $mdDialog.show(msg);
                return
            }

            if (postalCode !== undefined) {
                vm.datos.BLOCK_DIRECCION_VIVIENDA.POSTAL_CODE = postalCode
            } else {
                msg.textContent("Código Postal incorrecto. Por favor, revísalo y vuelve a intentarlo.");
                $mdDialog.show(msg);
                return
            }

            vm.getAseguradora(vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL);

            vm.requireNumber = false
            vm.requireCodPostal = false
            vm.selectedPlace = true

            vm.refreshTokenPlace();

            // vm.normalizandoDireccion = false

        }


        vm.fillInAddress = function () {

            vm.CO_REFERENCIA = ""
            vm.refenciaCat = false
            vm.noCatastro = false

            const inputGoogleSearch = $("#input_google_search");

            const place = autocomplete.getPlace();

            if (!place)
                return

            if (!vm.datos)
                vm.datos = {};

            if (!vm.datos.BLOCK_DIRECCION_VIVIENDA)
                vm.datos.BLOCK_DIRECCION_VIVIENDA = {
                    "NO_DIRECCION_COMPLETA": "",
                    "ID_ROL": ""
                }

            inputGoogleSearch.addClass('searchBoxGoogle')

            if(place.address_components === undefined){
                msg.textContent("Por favor, selecciona una dirección de la lista desplegable")
                $mdDialog.show(msg)
                return
            }

            if (place.address_components) {

                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO = undefined
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA = undefined

                place.address_components.forEach((component) => {

                    const componentType = component.types[0];

                    if (vm.componentForm[componentType]) {

                        const componentValue = component[vm.componentForm[componentType]];

                        switch (componentType) {
                            case "route":
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION_COMPLETA = componentValue;
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION != null)
                                    vm.dire = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION_COMPLETA;
                                break;
                            case "street_number":
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NUMERO = componentValue;
                                break;
                            case "postal_code":
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL = componentValue;
                                break;
                            case "locality":
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO = componentValue;
                                break;
                            case "administrative_area_level_2":
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA = componentValue;
                                break;
                            case "administrative_area_level_1":
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA === undefined)
                                    vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA = componentValue;
                                break;
                            default:
                                break;
                        }
                    }
                });

                place.address_components.forEach((component) => {

                    const componentType = component.types[0];

                    if (componentType === "street_number")
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.STREET_NUMBER = component.long_name;

                    if (componentType === "postal_code")
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL = component.long_name

                });
            }

            vm.requireNumber = !vm.datos.BLOCK_DIRECCION_VIVIENDA.STREET_NUMBER
            vm.requireCodPostal = !vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL
            
            if(vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL)
                vm.getLocalidadesGoogle(vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL);

            $scope.$digest()
        }

        vm.setProvinciaGoogle = function (){

            vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA = vm.responseLocalidades.find( localidad => localidad.NO_LOCALIDAD === vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO).NO_PROVINCIA

        }

        vm.getLocalidadesGoogle = function (codPostal) {
            if(codPostal && codPostal.length == 5) {
            	if(isNaN(codPostal)){
                    msg.textContent('Por favor, introduce un código postal válido');
                    $mdDialog.show(msg);
            	} else {
                    HogarService.getPlantilla(codPostal.substring(0, 2))
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            vm.codAseguradora = response.data.ID_RESULT; // 1 = SL / 2 = BBVA
                            vm.getLocalidades(codPostal);
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.parent.logout();
                        }
                    });
                }
            }
        }

        vm.getLocalidades = function (codPostal, setCompany) {

            vm.buscandolocalidades = true

            if(codPostal === undefined){
                msg.textContent("Por favor, introduce el código postal para cargar las localidad/es asociada/s.")
                $mdDialog.show(msg)
                return
            }

            vm.localidades = [];
            if(vm.optGoogle && setCompany)
                vm.normalizandoDireccion = true;
            HogarService.getLocalidades(codPostal, vm.codAseguradora !== undefined ? vm.codAseguradora : '1')
                .then(function successCallBack(response) {
                    if (response.data.ID_RESULT === 0 || response.data.ID_RESULT === 902) {
                        vm.responseLocalidades = response.data.LOCALIDAD
                        for (var i = 0; i < response.data.LOCALIDAD.length; i++) {
                            vm.localidades.push(response.data.LOCALIDAD[i].NO_LOCALIDAD);
                        }
                        if(vm.optGoogle) {
                            if(vm.responseLocalidades.length == 1) {
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO = vm.responseLocalidades[0].NO_LOCALIDAD;
                                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA = vm.responseLocalidades[0].NO_PROVINCIA;
                            }
                            if(setCompany)
                                vm.callNormalizadorGoogle();
                        }
                    }
                    vm.buscandolocalidades = false
                }, function errorCallBack(response) {
                    msg.textContent("No hemos podido recuperar las localidades asociadas al Codigo Postal " + vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL);
                    $mdDialog.show(msg);
                    vm.buscandolocalidades = false
                });

            $scope.$applyAsync();
        }

        vm.getTipoViaGoogle = function (nombre, campo) {
            if (vm.tipos.tiposVia != null && vm.tipos.tiposVia.length > 0) {
                for (var i = 0; i < vm.tipos.tiposVia.length; i++) {
                    var via = vm.tipos.tiposVia[i];
                    if (nombre.toUpperCase().startsWith(via.DS_TIPO_VIA.toUpperCase())) {
                        return via[campo];
                    }
                }
            }
        }


        vm.editPlace = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/accept-cancel.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.header = '¿Está seguro de editar la dirección seleccionada?';
                    md.msg = 'Al confirmar esta acción se procederá a borrar los datos de la dirección seleccionada';

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.accept = function () {
                        angular.element('#autocomplete_search').val('')
                        autocomplete.set('place', null);
                        vm.deleteVariables();
                        $mdDialog.cancel();
                        vm.loadScriptGoogle();
                    };
                }]
            });
        }

        vm.comenzarDeNuevoGoogle = function () {

            // if (vm.direccionNormalizada === true) {

                let confirmReloadDialog = $mdDialog.confirm()
                    .textContent("Se borrarán todos los datos. ¿Deseas continuar?")
                    .clickOutsideToClose(true)
                    .ok('Aceptar')
                    .cancel('Cancelar');

                $mdDialog
                    .show(confirmReloadDialog)
                    .then(function () {

                        vm.normalizandoDireccion = false
                        vm.direccionNormalizada = false

                        document.formVivienda.reset()
                        vm.deleteVariables()
                        vm.changeFlujo('google')

                    }, function () {
                        $mdDialog.cancel()
                    });
            // }
        }
        
        vm.comenzarDeNuevoRefCatastral = function () {

            let confirmReloadDialog = $mdDialog.confirm()
                .textContent("Se borrarán todos los datos. ¿Deseas continuar?")
                .clickOutsideToClose(true)
                .ok('Aceptar')
                .cancel('Cancelar');

            $mdDialog
                .show(confirmReloadDialog)
                .then(function () {

                    vm.dirNormRC = false;
                    vm.normalizandoDireccion = false;

                    document.formVivienda.reset();
                    vm.deleteVariables();
                    vm.changeFlujo('catastro');
                    
                }, function () {
                    $mdDialog.cancel()
                });
        }
        
        vm.comenzarDeNuevoManual = function () {

            let confirmReloadDialog = $mdDialog.confirm()
                .textContent("Se borrarán todos los datos. ¿Deseas continuar?")
                .clickOutsideToClose(true)
                .ok('Aceptar')
                .cancel('Cancelar');

            $mdDialog
                .show(confirmReloadDialog)
                .then(function () {
                    vm.dirNormViv = false;
                    vm.validandoViv = false;

                    document.formVivienda.reset();
                    vm.deleteVariables();
                    vm.changeFlujo('manual');
                    
                }, function () {
                    $mdDialog.cancel()
                });
        }

        vm.borrarForm = function () {

            document.formVivienda.reset();
            vm.deleteVariables();

        }
        
        vm.newBudget = function () {
        	$route.reload();
        }

        vm.deleteVariables = function () {
            vm.datos.BLOCK_DIRECCION_VIVIENDA = {};
            vm.datos.BLOCK_INFORMACION_VIVIENDA = {};
            vm.datos.BLOCK_CAPITALES = {};
            vm.datos.DATOS_PAGO = {};
            vm.datos.DATOS_TOMADOR = {};
            vm.objDirCom = {};
            vm.objDirNum = {};
            vm.idPadre = "";
            if (vm.datosCatastrales)
                vm.datosCatastrales.CO_REFERENCIA = "";
            delete vm.datos.BLOCK_USO_REGIMEN.ID_USO_VIVIENDA;
            delete vm.direccionVivienda;
            delete vm.detallesVivienda;
            delete vm.codAseguradora;
            delete vm.listaBloques;
            delete vm.listaEscaleras;
            delete vm.listaPlantas;
            delete vm.listaPuertas;
            delete vm.CODIGO_POSTAL;
            delete vm.CO_REFERENCIA;
            delete vm.dirEleg;
            delete vm.listCatastro;
            delete vm.tipologiaVivienda;
            delete vm.tipoViaSeleccionada;
            delete vm.textoBusquedaVia;
            delete vm.textoBusquedaNombreVia;
            delete vm.dirNormViv;
            delete vm.listaDireccionesSug;
            vm.selectedPlace = false;
            vm.optGoogle = false;
            vm.optCatastro = false;
            vm.optManual = false;
            vm.busquedaViv = false;
            vm.regimen = false;
            vm.viviendaValidada = false;
            vm.dirNormRC = false;
            vm.dirNormViv = false;
            vm.normalizandoDireccion = false;
            vm.direccionNormalizada = false
            vm.riesgoConfirmado = false
            vm.dirCambiada = false;
            vm.blockChangeAseguradora = false
            vm.catastroEnMantenimiento = false
            vm.useCatastro = true
            vm.direccionValida = true;
        }

        //Identificar aseguradora
        vm.getAseguradora = function (valor) {
            if (valor != undefined && valor.length == 5) {
            	if(isNaN(valor)){
                    msg.textContent("Por favor, introduce un código postal válido.");
                    $mdDialog.show(msg);
            	}else{
	                HogarService.getPlantilla(valor.substring(0, 2))
	                    .then(function successCallback(response) {
	                        if (response.status == 200) {
	                            if(vm.datos.BLOCK_USO_REGIMEN && vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA == '02')
	                                vm.codAseguradora = 1;
	                            else
	                                vm.codAseguradora = response.data.ID_RESULT; // 1 = SL / 2 = BBVA
	                            vm.cargando = false;
	                            if (vm.optGoogle) {
	                                vm.callNormalizadorGoogle();
	                            } else if (vm.optManual) {
	                                vm.updateDir('BLOCK_DIRECCION_VIVIENDA', vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL, false, true);
	                            }
	
	                            vm.getCombAseguradoras();
	                        }
	                    }, function errorCallBack(response) {
	
	                    });
            	}
            }

 //          $scope.$digest()

        }

        vm.getCombAseguradoras = function () {
            if (vm.codAseguradora == 1) {
                //Tipos vivienda de SL
                if (vm.parent.listServices.listTipoVivienda_sl != null && vm.parent.listServices.listTipoVivienda_sl.length > 0) {
                    vm.tiposVivienda_sl = vm.parent.listServices.listTipoVivienda_sl;
                } else if (!vm.tiposVivienda_sl) {
                    HogarService.getTiposVivienda2({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.tiposVivienda_sl = response.data.FIELD;
                                vm.tiposVivienda_sl = vm.tiposVivienda_sl.sort(function (a, b) {
                                    if (a.CO_FIELD > b.CO_FIELD) {
                                        return 1;
                                    }
                                    if (a.CO_FIELD < b.CO_FIELD) {
                                        return -1;
                                    }
                                    return 0;
                                });
                                vm.parent.listServices.listTipoVivienda_sl = vm.tiposVivienda_sl;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }

                //Usos vivienda SL
                if (vm.parent.listServices.listUsoVivienda_sl != null && vm.parent.listServices.listUsoVivienda_sl.length > 0) {
                    vm.usosVivienda_sl = vm.parent.listServices.listUsoVivienda_sl;
                } else if (!vm.usosVivienda_sl) {
                    HogarService.getUsosVivienda2({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.usosVivienda_sl = response.data.FIELD;
                                vm.parent.listServices.listUsoVivienda_sl = vm.usosVivienda_sl;
                                vm.usoVivienda = true;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }

                if (vm.parent.listServices.listSituacionVivienda_sl != null && vm.parent.listServices.listSituacionVivienda_sl.length > 0) {
                    vm.situacionesVivienda = vm.parent.listServices.listSituacionVivienda_sl;
                } else if (!vm.situacionesVivienda) {
                    HogarService.getSituacionesVivienda({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.situacionesVivienda = response.data.FIELD;
                                vm.parent.listServices.listSituacionVivienda_sl = vm.situacionesVivienda;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }

                if (vm.parent.listServices.listRegimenVivienda_sl != null && vm.parent.listServices.listRegimenVivienda_sl.length > 0) {
                    vm.regimenesVivienda = vm.parent.listServices.listRegimenVivienda_sl;
                } else if (!vm.regimenesVivienda) {
                    HogarService.getRegimenesVivienda2({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.regimenesVivienda = response.data.FIELD;
                                vm.parent.listServices.listRegimenVivienda_sl = vm.regimenesVivienda;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }
            } else if (vm.codAseguradora == 2) {
                //Tipos vivienda de BBVA
                if (vm.parent.listServices.listTipoVivienda_bbva != null && vm.parent.listServices.listTipoVivienda_bbva.length > 0) {
                    vm.tiposVivienda_bbva = vm.parent.listServices.listTipoVivienda_bbva;
                } else if (!vm.tiposVivienda_bbva) {
                    HogarService.getTiposVivienda({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.tiposVivienda_bbva = response.data.FIELD;

                                vm.tiposVivienda_bbva = vm.tiposVivienda_bbva.sort(function (a, b) {
                                    if (a.CO_FIELD > b.CO_FIELD) {
                                        return 1;
                                    }
                                    if (a.CO_FIELD < b.CO_FIELD) {
                                        return -1;
                                    }
                                    return 0;
                                });

                                vm.parent.listServices.listTipoVivienda_bbva = vm.tiposVivienda_bbva;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }

                //Usos vivienda BBVA
                if (vm.parent.listServices.listUsoVivienda_bbva != null && vm.parent.listServices.listUsoVivienda_bbva.length > 0) {
                    vm.usosVivienda_bbva = vm.parent.listServices.listUsoVivienda_bbva;
                } else if (!vm.usosVivienda_bbva) {
                    HogarService.getUsosVivienda({})
                        .then(function successCallback(response) {
                            if (response.status == 200) {
                                vm.usosVivienda_bbva = response.data.FIELD;
                                vm.parent.listServices.listUsoVivienda_bbva = vm.usosVivienda_bbva;
                                vm.usoVivienda = true;
                            }
                        }, function callBack(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.parent.logout();
                            }
                        });
                }

                if(vm.parent.listServices.listRegimenVivienda_bbva != null && vm.parent.listServices.listRegimenVivienda_bbva.length > 0) {
                    vm.regimenesVivienda_bbva = vm.parent.listServices.listRegimenVivienda_bbva;
                } else if(!vm.regimenesVivienda_bbva) {
                    HogarService.getRegimenesVivienda({})
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            vm.regimenesVivienda_bbva = response.data.FIELD;
                            vm.parent.listServices.listRegimenVivienda_bbva = vm.regimenesVivienda_bbva;
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.parent.logout();
                        }
                    });
                }

            }
        }

        //Llamar al catastro para ver posibles numeros
        vm.callNormalizadorGoogle = function () {

            vm.listaBloques = [];
            vm.listaEscaleras = [];
            vm.listaPlantas = [];
            vm.listaPuertas = [];

            if(vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA ==='02' && vm.codAseguradora === 2){
                msg.textContent("Info: se ha establecido Santa Lucía como aseguradora debido a la titularidad de vivienda indicada: 'INQUILINO'")
                $mdDialog.show(msg)
                vm.codAseguradora = 1;
                vm.blockChangeAseguradora = true;
            }

            if (vm.datos != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.NUMERO != "" && vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION_COMPLETA != "") {

                vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_ROL = vm.rol;
                vm.direccionNormalizada = false
                // vm.normalizandoDireccion = true;
                HogarService.getNormalizadorDirecciones(vm.datos.BLOCK_DIRECCION_VIVIENDA, vm.codAseguradora)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                            vm.cargando = false;

                            if (response.data.ID_RESULT !== 0) {

                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.direccionNormalizada = false;
                                vm.normalizandoDireccion= false;

                            } else {
                                vm.direccionNormalizada = true;
                            }

                            if (response.data.CATASTRO != undefined) {
                                vm.dirEleg = response.data.CATASTRO;
                                if (vm.dirEleg != undefined) {
                                    vm.datos.BLOCK_DIRECCION_VIVIENDA = vm.dirEleg;
                                }
                            }
                            vm.idPadre = response.data.ID_PADRE;

                            if (response.data.ID_RESULT == 0) {
                                vm.noValidate = true;

                                if (response.data.DATOS_CATASTRALES != undefined) {
                                    vm.datosCatastrales = response.data.DATOS_CATASTRALES;
                                } else {
                                    vm.noCatastro = true;
                                }
                                if (response.data.DIRECCIONES_SUGERIDAS != undefined) {
                                    vm.listaDireccionesSug = response.data.DIRECCIONES_SUGERIDAS;

                                    vm.listaBloques = [];
                                    vm.listaEscaleras = [];
                                    vm.listaPlantas = [];
                                    vm.listaPuertas = [];

                                    for (var i = 0; i < vm.listaDireccionesSug.length; i++) {
                                        if (vm.listaDireccionesSug[i].BLOQUE != undefined) {
                                            if (vm.listaBloques.indexOf(vm.listaDireccionesSug[i].BLOQUE) == -1) {
                                                vm.listaBloques.push(vm.listaDireccionesSug[i].BLOQUE);
                                            }
                                        } else {
                                            if (vm.listaDireccionesSug[i].ESCALERA != undefined) {
                                                if (vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                                    vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                                                }
                                            } else {
                                                if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                                    vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                                }
                                            }
                                        }
                                    }

                                    if (vm.listaBloques.length > 0 && vm.listaEscaleras.length > 0) {
                                        for (let i = 0; i < vm.listaDireccionesSug.length; i++) {
                                            if (!vm.listaDireccionesSug[i].BLOQUE) {
                                                vm.listaDireccionesSug[i].BLOQUE = '--Sin bloque--';
                                            }

                                        }
                                        vm.listaBloques.push('--Sin bloque--');
                                    }

                                    if (vm.listaEscaleras.length > 0 && vm.listaPlantas.length > 0) {
                                        for (let i = 0; i < vm.listaDireccionesSug.length; i++) {
                                            if (!vm.listaDireccionesSug[i].ESCALERA) {
                                                vm.listaDireccionesSug[i].ESCALERA = '--Sin escalera--';
                                            }
                                        }
                                        vm.listaEscaleras.push('--Sin escalera--');
                                    }

                                    if (vm.listaBloques.length == 1) {
                                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL = vm.listaBloques[0];
                                        vm.listarPisos('bloque');
                                    }
                                    if (vm.listaEscaleras.length == 1) {
                                        vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA = vm.listaEscaleras[0];
                                        vm.listarPisos('escalera');
                                    }

                                    vm.listCatastro = true;

                                    if (!response.data.CATASTRO.ID_TIPO_VIA && !response.data.CATASTRO.CO_TIPO_VIA) {
                                        vm.modalVias(null);
                                    }

                                } else {
                                    if (vm.codAseguradora == 1) {
										vm.objDir = {};
										vm.objDir = vm.dirEleg;
										vm.buscarDireccionesSug(true)
                                        vm.inputFr = true;
                                    }
                                }
                            }
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {}
                    });
            }

            vm.getCombAseguradoras();

        }

        vm.listarPisos = function (tipoListado) {

            switch (tipoListado) {
                case 'bloque':
                    vm.listaEscaleras = [];
                    vm.listaPlantas = [];
                    vm.listaPuertas = [];

                    if (!vm.isEdited) {
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA = '';
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA = '';
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = '';
                    }

                    var existe = false;

                    for (var i = 0; i < vm.listaDireccionesSug.length; i++) {
                        if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                            if (vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                if (vm.listaDireccionesSug[i].ESCALERA != null) {
                                    vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                                    existe = true;
                                }
                            }
                        } else {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PORTAL == '' && vm.listaDireccionesSug[i].BLOQUE == '--Sin bloque--') {
                                if (vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                    if (vm.listaDireccionesSug[i].ESCALERA != null) {
                                        vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                                        existe = true;
                                    }
                                }
                            }
                        }
                    }

                    if (existe == false) {
                        if (vm.listaEscaleras.length == 0) {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA != undefined && vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA != "") {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA != null) {
                                    vm.listaEscaleras.push(vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA);
                                }
                            } else {
                                for (var i = 0; i < vm.listaDireccionesSug.length; i++) {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                        existe = true;
                                        if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                            if (vm.listaDireccionesSug[i].PLANTA != null) {
                                                vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                            }
                                        }
                                    }
                                }
                                if (existe == false) {
                                    if (vm.listaPlantas.length == 0 && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != undefined && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != "") {
                                        if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != null) {
                                            vm.listaPlantas.push(vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    break;
                case 'escalera':
                    vm.listaPlantas = [];
                    vm.listaPuertas = [];

                    var existe = false;
                    vm.sinEsc = false;

                    if (!vm.isEdited) {
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA = '';
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = '';
                    }

                    for (var i = 0; i < vm.listaDireccionesSug.length; i++) {

                        if (vm.listaBloques.length > 0) {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    existe = true;
                                    if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                        if (vm.listaDireccionesSug[i].PLANTA != null) {
                                            vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                        }
                                    }
                                }
                            } else {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == '' && vm.listaDireccionesSug[i].BLOQUE == '--Sin bloque--') {
                                    existe = true;
                                    if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                        if (vm.listaDireccionesSug[i].PLANTA != null) {
                                            vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                        }
                                    }
                                }
                            }
                        } else {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                existe = true;
                                if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                    if (vm.listaDireccionesSug[i].PLANTA != null) {
                                        vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                    }
                                }
                            } else {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == '' && vm.listaDireccionesSug[i].ESCALERA == '--Sin escalera--') {
                                    existe = true;
                                    vm.sinEsc = true;
                                    if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                        if (vm.listaDireccionesSug[i].PLANTA != null) {
                                            vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (existe == false) {
                        if (vm.listaPlantas.length == 0 && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != undefined && vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != "") {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA != null) {
                                vm.listaPlantas.push(vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA);
                            }
                        }
                    }

                    if (vm.listaPlantas.length == 1) {
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA = vm.listaPlantas[0];
                        vm.listarPisos('planta');
                    }

                    break;
                case 'planta':
                    vm.listaPuertas = [];
                    var existe = false;

                    if (!vm.isEdited) {
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = '';
                    }

                    for (var i = 0; i < vm.listaDireccionesSug.length; i++) {

                        if (vm.listaBloques.length > 0) {
                            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                        if (vm.listaPuertas.indexOf(vm.listaDireccionesSug[i].PUERTA) == -1) {
                                            if (vm.listaDireccionesSug[i].PUERTA != null) {
                                                existe = true;
                                                vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == '') {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                        if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                            if (vm.listaPuertas.indexOf(vm.listaDireccionesSug[i].PUERTA) == -1) {
                                                if (vm.listaDireccionesSug[i].PUERTA != null) {
                                                    existe = true;
                                                    vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (vm.listaEscaleras.length > 0) {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == vm.listaDireccionesSug[i].ESCALERA) {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                        if (vm.listaPuertas.indexOf(vm.listaDireccionesSug[i].PUERTA) == -1) {
                                            if (vm.listaDireccionesSug[i].PUERTA != null) {
                                                existe = true;
                                                vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                            }
                                        }
                                    }
                                } else {
                                    if ((vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == '') && (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA)) {
                                        vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                    }
                                }
                            } else {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                    if (vm.listaDireccionesSug[i].PUERTA != null) {
                                        existe = true;
                                        vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                    }
                                }
                            }
                        }
                    }

                    if (existe == false) {
                        for (var i = 0; i < vm.listaDireccionesSug.length; i++) {
                            if (vm.listaBloques.length > 0) {
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == vm.listaDireccionesSug[i].BLOQUE) {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                        if (vm.listaPuertas.indexOf(vm.listaDireccionesSug[i].PUERTA) == -1) {
                                            if (vm.listaDireccionesSug[i].PUERTA != null) {
                                                existe = true;
                                                vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                            }
                                        }
                                    }
                                } else {
                                    if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == '') {
                                        if (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == vm.listaDireccionesSug[i].PLANTA) {
                                            if (vm.listaPuertas.indexOf(vm.listaDireccionesSug[i].PUERTA) == -1) {
                                                if (vm.listaDireccionesSug[i].PUERTA != null) {
                                                    existe = true;
                                                    vm.listaPuertas.push(vm.listaDireccionesSug[i].PUERTA);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (vm.listaPuertas.length == 1) {
                        vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = vm.listaPuertas[0];
                    }

                    break;
                default:
                    break;
            }
        }

        vm.anterior = function () {
            if (vm.llave == "contratar" && vm.indice == 1) {
                vm.blockDatosPago = vm.datos.DATOS_PAGO;
                vm.blockDatosTomador = vm.datos.DATOS_TOMADOR;
                vm.blockDatosPrestamo = vm.datos.DATOS_PRESTAMO;
                vm.blockCapitales = vm.datos.BLOCK_CAPITALES;
                vm.blockCapitalesCopy = vm.datos.BLOCK_CAPITALES;

                // vm.llave = "nuevo";

                if (vm.pre != null) {
                    vm.pre.llave = "nuevo";
                }
                vm.pasoPresupuesto = 1;
            } else {
                vm.indice = vm.indice - 1;
            }
            vm.showErrorTarifica = false;
        }

        vm.siguiente = function (ind) {
            msg.htmlContent(null);
            if (vm.llave == "contratar") {

                switch (ind) {
                    case 1:
                        // vm.tarificaIndividual();
                        vm.indice = vm.indice + 1;
                        break;
                    case 2:
                        vm.indice = vm.indice + 1;
                        break;
                    case 3:
                        break;
                    case 4:
                        break;
                    case 5:
                        break;
                    default:
                        break;
                }
            } else if (vm.llave == "presupuesto" || vm.llave == "nuevo") {
                switch (ind) {
                    case 1:
                        vm.formulario = "formSubmitVivienda";
                        var coReferencia = null;

                        //Comprobar si la vivienda es antigua para mostrar el check de reforma, en BBVA
                        if (vm.codAseguradora == 2 && vm.datos && vm.datos.BLOCK_INFORMACION_VIVIENDA && vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION != null && (new Date().getFullYear() - vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION) >= 100) {
                            vm.antiguo = true;
                        }

                        if (vm.datosCatastrales != undefined && vm.datosCatastrales.CO_REFERENCIA != undefined && vm.datosCatastrales.CO_REFERENCIA != "") {
                            vm.datos.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA = vm.datosCatastrales.CO_REFERENCIA;
                        }

                        if (vm.estadoCatastro != 0) {
                            viviendaCom = vm.comprobarDireccion();
                        }

                        if (vm.datos.ERROR_CATASTRO_PERMITIR) {
                            objValidaDireccion.ERROR_CATASTRO_PERMITIR = vm.datos.ERROR_CATASTRO_PERMITIR;
                        }

                        if (vm.codAseguradora == 1) {
                            vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_SITUACION_VIVIENDA = '01';
                        }

                        vm.viviendaValidada = true;
                        validar(vm.formVivienda);

                        break;
                    case 2:
                        vm.formulario = "formSubmitCaracteristicas";
                        validar(vm.formCaracteristicas);
                        break;
                    case 3:
                        vm.formulario = "formSubmitCapitales";
                        vm.showErrorTarifica = false;

                        if (vm.datos.DATOS_PRESTAMO != null && vm.datos.DATOS_PRESTAMO.IN_PRESTAMO == true && (vm.datos.DATOS_PRESTAMO.IM_PRESTAMO == 0 || vm.datos.DATOS_PRESTAMO.IM_PRESTAMO == "0" || vm.datos.DATOS_PRESTAMO.IM_PRESTAMO == null)) {
                            msg.textContent('El importe del préstamo hipotecario debe de ser mayor a 0');
                            $mdDialog.show(msg);
                            return null;
                        }

                        if (vm.datos.DATOS_PAGO != null && vm.datos.DATOS_PAGO.FD_INICIO != null) {
                            var hoy60 = new Date(new Date().setDate(new Date().getDate() + 365));
                            var fechaInicio = vm.datos.DATOS_PAGO.FD_INICIO;
                            if (fechaInicio > hoy60) {
                                msg.textContent('Excluidas las contrataciones con una fecha superior a 365 días');
                                $mdDialog.show(msg);
                                return null;
                            }
                        }

                        if(vm.checkPastDate()) {
                            msg.textContent('La fecha de inicio no puede ser anterior a hoy');
                            $mdDialog.show(msg);
                            return;
                        }
                            

                        vm.confirmarVivienda();
                        break;
                    case 4:
                        break;
                    default:
                        vm.formulario = "formSubmitVivienda";
                        vm.indice = 1;
                        break;
                }
            }
        }


        vm.comprobarDireccion = function () {
            if (!vm.CO_REFERENCIA && (vm.listaBloques != undefined && vm.listaBloques.length > 0 && !vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL ||
                    (vm.listaEscaleras != undefined && vm.listaEscaleras.length > 0 && !vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA) ||
                    (vm.listaPlantas != undefined && vm.listaPlantas.length > 0 && !vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA) ||
                    (vm.listaPuertas != undefined && vm.listaPuertas.length > 0 && !vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA))) {
                return false;
            } else {
                return true;
            }
        }

        vm.validaDireccionNormalizada = function () {

            const objValidaDireccion = vm.datos.BLOCK_DIRECCION_VIVIENDA;

            vm.confirmandoRiesgo = true
            vm.riesgoConfirmado = false

            HogarService.validaDireccionNormalizada(objValidaDireccion, vm.codAseguradora, true)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                        if (response.data.ID_RESULT === 0) {

                            vm.riesgoConfirmado = true

                            vm.permitirContinuar = true;
                            vm.busquedaViv = true;

                            vm.datos.BLOCK_INFORMACION_VIVIENDA = response.data.BLOCK_INFORMACION_VIVIENDA
                            vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_VIVIENDA = vm.tipologiaVivienda

                            vm.direccionVivienda = response.data.BLOCK_DIRECCION_VIVIENDA
                            response.data.BLOCK_DIRECCION_VIVIENDA.CO_REFERENCIA = vm.datos.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA
                            response.data.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL = response.data.BLOCK_INFORMACION_VIVIENDA.CODIGO_POSTAL
                            vm.resumenVivienda(response.data.BLOCK_DIRECCION_VIVIENDA)

                            if (vm.codAseguradora === 1) {
                                vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_SITUACION_VIVIENDA = '01'
                            }

                            if (vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION && vm.codAseguradora === 2)
                                vm.comprobarACons(vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION)

                        } else if (response.data.ID_RESULT == 1112 || response.data.ID_RESULT == 730) {
                            var confirmViv = $mdDialog.confirm()
                                .textContent(response.data.DS_RESULT)
                                .ok('Aceptar')
                                .cancel('Cancelar');

                            $mdDialog.show(confirmViv).then(function () {
                                vm.datos.BLOCK_INFORMACION_VIVIENDA = response.data.BLOCK_INFORMACION_VIVIENDA;
                                vm.direccionVivienda = response.data.BLOCK_DIRECCION_VIVIENDA;
                                vm.busquedaViv = true;
                                vm.permitirContinuar = true;
                                vm.resumenVivienda(response.data.BLOCK_DIRECCION_VIVIENDA)
                                if(vm.direccion != undefined && vm.numero != undefined && vm.provincia != undefined
                            		&& vm.municipio != undefined){
									
									vm.vivValidada = true;
								}

                            }, function () {
                                $mdDialog.cancel();
                                vm.noValidate = false;
                                return null;
                            });
                        }
                    } else {
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
                    }

                    vm.confirmandoRiesgo = false
                    vm.cargando = false;

                }, function errorCallback(response) {
                    vm.cargando = false;
                });
        }

        vm.comprobarACons = function (ac) {
            ac = ac.toString();
            vm.antiguo = false;
            if (ac.length == 4 && !isNaN(ac)) {
                if ((new Date().getFullYear() - ac) >= 100) {
                    vm.antiguo = true;
                    vm.aReforma = new Date().getFullYear() - 30;
                } else {
                    vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION = 0
                }
            }
        }

        vm.getResRF = function () {
            if (vm.CO_REFERENCIA && vm.viviendaRef != undefined) {
                vm.vivAsegurar = vm.viviendaRef.NO_TIPO_VIA + " " + vm.viviendaRef.NO_DIRECCION + ", Nº " + vm.viviendaRef.NU_NUMERO;
                if (vm.viviendaRef.NO_PORTAL && vm.viviendaRef.NO_PORTAL != "")
                    vm.vivAsegurar += ", PORTAL: " + vm.viviendaRef.NO_PORTAL;
                if (vm.viviendaRef.NO_ESCALERA && vm.viviendaRef.NO_ESCALERA != "")
                    vm.vivAsegurar += ", ESC: " + vm.viviendaRef.NO_ESCALERA;
                if (vm.viviendaRef.NU_PLANTA && vm.viviendaRef.NU_PLANTA != "")
                    vm.vivAsegurar += ", PL: " + vm.viviendaRef.NU_PLANTA;
                if (vm.viviendaRef.NO_PUERTA && vm.viviendaRef.NO_PUERTA != "")
                    vm.vivAsegurar += ", PUERTA: " + vm.viviendaRef.NO_PUERTA;

                vm.vivAsegurar.toUpperCase();
            }
        }

        function validar(form2Validate) {
            msg.htmlContent(null);
            if (form2Validate) {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
                $mdDialog.show(msg);
                if (objFocus != undefined) {
                    objFocus.focus();
                }
                vm.indice = vm.indice;
            } else {
                if (vm.indice < 3) {
                    if (vm.indice == 2) {
                        if (!vm.datos.BLOCK_INFORMACION_VIVIENDA.IM_SUPERFICIE_ANEXA) {
                            vm.datos.BLOCK_INFORMACION_VIVIENDA.IM_SUPERFICIE_ANEXA = 0;
                        }
                        vm.calcularContinente();
                    }
                    vm.indice = vm.indice + 1;
                } else if (vm.indice == 3) {

                    if (vm.codAseguradora == 1) {
                        vm.checkCapitales(vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE, 'continente');
                    }

                    if (vm.capSLOK != false) {
                        /* COMPROBAR FECHA DE INICIO */
                        var actualDate = new Date();
                        var fechaInicio = new Date(vm.datos.DATOS_PAGO.FD_INICIO);
                        actualDate.setHours(0, 0, 0);
                        fechaInicio.setHours(0, 1, 0);

                        if (actualDate <= fechaInicio) {
                            vm.calcular();
                        } else {
                            msg.textContent('Fecha de inicio no puede ser anterior a hoy');
                            $mdDialog.show(msg);
                        }
                    }

                }
            }
        }

        vm.checkCapitales = function (importe, capital) {
            /*
                REGIMEN SL
                01 propietario prop
                02 inquilino
                03 propietario alqu
            */
            msg.htmlContent(null);
            if (vm.codAseguradora == 1) {
                if (capital == 'continente') {
                    if (vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA != 2) {
                        if (parseFloat(importe) < parseFloat(vm.bloqCapitalesCopy.IM_VALOR_CONTINENTE)) {
                            msg.textContent('Por favor, cambia el valor del Continente, no puede ser inferior a ' + vm.bloqCapitalesCopy.IM_VALOR_CONTINENTE + '€.');
                            $mdDialog.show(msg);
                            vm.capSLOK = false;
                        } else {
                            if (parseFloat(importe) > parseFloat(vm.bloqCapitalesCopy.IM_VALOR_CONTINENTE * 1.2)) {
                                msg.textContent('Por favor, cambia el valor del Continente, no puede superar un incremento mayor del 20% respecto al recomendado.');
                                $mdDialog.show(msg);
                                vm.capSLOK = false;
                            } else {
                                vm.capSLOK = true;
                            }
                        }
                    } else {
                        if (vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA == 2) {
                            if ((parseFloat(importe) == 15000) || (parseFloat(importe) >= parseFloat(vm.bloqCapitalesCopy.IM_VALOR_CONTINENTE) && parseFloat(importe) <= parseFloat(vm.bloqCapitalesCopy.IM_VALOR_CONTINENTE * 1.2))) {
                                vm.capSLOK = true;
                            } else {
                                msg.textContent('Por favor, cambia el valor del Continente, no es válido.');
                                $mdDialog.show(msg);
                                vm.capSLOK = false;
                            }
                        }
                    }

                }
            }

        }


        //Calcular continente a asegurar
        vm.calcularContinente = function () {
            vm.cargando = true;

            if (vm.detallesVivienda) {
                /*if (vm.direccionVivienda && Object.entries(vm.direccionVivienda).length > 0)
                    vm.detallesVivienda['BLOCK_DIRECCION_VIVIENDA'] = vm.direccionVivienda;
                else*/ if (vm.datos.BLOCK_DIRECCION_VIVIENDA)
                    vm.detallesVivienda['BLOCK_DIRECCION_VIVIENDA'] = vm.datos.BLOCK_DIRECCION_VIVIENDA;
                if (vm.datos.BLOCK_USO_REGIMEN)
                    vm.detallesVivienda['BLOCK_USO_REGIMEN'] = vm.datos.BLOCK_USO_REGIMEN;
                if (vm.datos.BLOCK_INFORMACION_VIVIENDA)
                    vm.detallesVivienda['BLOCK_INFORMACION_VIVIENDA'] = vm.datos.BLOCK_INFORMACION_VIVIENDA;
            } else {
                vm.detallesVivienda = {};

                vm.detallesVivienda['BLOCK_USO_REGIMEN'] = vm.datos.BLOCK_USO_REGIMEN;
                vm.detallesVivienda['BLOCK_INFORMACION_VIVIENDA'] = vm.datos.BLOCK_INFORMACION_VIVIENDA;

                if (vm.datos.BLOCK_DIRECCION_VIVIENDA) {
                    if(vm.isEdited) {
                        vm.detallesVivienda['BLOCK_DIRECCION_VIVIENDA'] = vm.datos.BLOCK_DIRECCION_VIVIENDA;
                    } else {
                        vm.detallesVivienda.BLOCK_DIRECCION_VIVIENDA = {
                            'CO_POSTAL': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL != vm.direccionVivienda.CO_POSTAL) ? vm.direccionVivienda.CO_POSTAL : vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL ? vm.datos.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL : vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL,
                            'NO_LOCALIDAD': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO != undefined ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_MUNICIPIO : vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD,
                            'CO_PROVINCIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA,
                            'DS__CO_PROVINCIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA != undefined ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA : vm.datos.BLOCK_DIRECCION_VIVIENDA.DS__CO_PROVINCIA,
                            'CO_PROVINCIA_INE': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA != undefined ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_PROVINCIA : vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA_INE,
                            'ID_TIPO_VIA': vm.dirEleg != undefined && vm.dirEleg.ID_TIPO_VIA != undefined ? vm.dirEleg.ID_TIPO_VIA : vm.direccionVivienda && vm.direccionVivienda.ID_TIPO_VIA ? vm.direccionVivienda.ID_TIPO_VIA : vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA,
                            // 'NO_DIRECCION': vm.datos.BLOCK_DIRECCION_VIVIENDA.NOMBRE_VIA == vm.direccionVivienda.NO_DIRECCION ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NOMBRE_VIA : vm.direccionVivienda.NO_DIRECCION,
                            'NO_DIRECCION': vm.direccionVivienda && vm.direccionVivienda.NO_DIRECCION && vm.datos.BLOCK_DIRECCION_VIVIENDA.NOMBRE_VIA ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NOMBRE_VIA == vm.direccionVivienda.NO_DIRECCION ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NOMBRE_VIA : vm.direccionVivienda.NO_DIRECCION : vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION,
                            'NO_DIRECCION_COMPLETA': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION_COMPLETA,
                            'NU_NUMERO': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.NUMERO == undefined) ? vm.direccionVivienda.NU_NUMERO : vm.datos.BLOCK_DIRECCION_VIVIENDA.NUMERO ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NUMERO :  vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO,
                            'NO_PORTAL': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL == undefined) ? vm.direccionVivienda.NO_PORTAL : vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL,
                            'NO_ESCALERA': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA == undefined) ? vm.direccionVivienda.NO_ESCALERA : vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA,
                            'NU_PLANTA': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA == undefined) ? vm.direccionVivienda.NU_PLANTA : vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA,
                            'NO_PUERTA': vm.direccionVivienda && (vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA == undefined) ? vm.direccionVivienda.NO_PUERTA : vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA,
                            'ID_LOCALIDAD': vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD,
                            'CO_TIPO_VIA': vm.direccionVivienda && vm.direccionVivienda.CO_TIPO_VIA != undefined ? vm.direccionVivienda.CO_TIPO_VIA : vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_TIPO_VIA ? vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_TIPO_VIA : vm.tipos.tiposVia.find(x => x.ID_TIPO_VIA == vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA).CO_TIPO_VIA,
                            'NO_TIPO_VIA': vm.dirEleg != undefined && vm.dirEleg.DS_TIPO_VIA != undefined ? vm.dirEleg.DS_TIPO_VIA : vm.direccionVivienda && vm.direccionVivienda.DS_TIPO_VIA ? vm.direccionVivienda.DS_TIPO_VIA : vm.tipos.tiposVia.find(x => x.ID_TIPO_VIA == vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA).DS_TIPO_VIA,
                            'CO_POBLACION': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POBLACION,
                            'CO_VIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_VIA,
                            'CO_MUNICIPIO': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_MUNICIPIO
                        }
                    }
                } else {
                    vm.detallesVivienda['BLOCK_DIRECCION_VIVIENDA'] = vm.datos.BLOCK_DIRECCION_VIVIENDA;
                }
            }
            /*
            var fd_inicio_format =  moment(vm.datos.DATOS_PAGO.FD_INICIO).format('YYYY-MM-DD');
            
            if(vm.datos.BLOCK_DIRECCION_VIVIENDA){
 				if(vm.isEdited) {
                    vm.detallesVivienda['DATOS_PAGO'] = vm.datos.DATOS_PAGO;
                } else {
					vm.detallesVivienda.DATOS_PAGO ={
						'FD_INICIO': fd_inicio_format
					}
				}
        	}else{
 				vm.detallesVivienda['DATOS_PAGO'] = vm.datos.DATOS_PAGO;
			}*/

            if (vm.codAseguradora == 1) {
                vm.detallesVivienda.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_REHABILITACION = '';
                vm.detallesVivienda.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_CONSTRUCCION = '';
                vm.detallesVivienda.BLOCK_INFORMACION_VIVIENDA.ID_CALIDAD_CONSTRUCCION = '01';
            } else {
                vm.estadoCatastro == 0 ? vm.detallesVivienda.BLOCK_DIRECCION_VIVIENDA.IN_CATASTRO = true : vm.detallesVivienda.BLOCK_DIRECCION_VIVIENDA.IN_CATASTRO = false;
            }

            if (vm.datos.BLOCK_INFORMACION_VIVIENDA != null && vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION == 1) {
                vm.detallesVivienda.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION = ((new Date().getFullYear()) - 30);
            }

            if (vm.datos.BLOCK_INFORMACION_VIVIENDA != null && vm.codAseguradora == 2) {
                if (vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_CALIDAD_CONSTRUCCION == null) {
                    vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_CALIDAD_CONSTRUCCION = "01";
                }
                if (vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_SITUACION_VIVIENDA == null) {
                    vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_SITUACION_VIVIENDA = "0";
                }
                if (vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_CONSTRUCCION == null) {
                    vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_CONSTRUCCION = "";
                }
                if (vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_METROS_COMUNES == null) {
                    vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_METROS_COMUNES = 0;
                }
            }

            if (vm.idFather)
                vm.detallesVivienda.ID_PADRE = vm.idFather;

            vm.datos.BLOCK_DIRECCION_VIVIENDA = vm.detallesVivienda.BLOCK_DIRECCION_VIVIENDA;

            HogarService.getCapitales(vm.detallesVivienda, vm.codAseguradora)
                .then(function successCallback(response) {
                    if (response.data.ID_RESULT == 0) {
                        // vm.datos.BLOCK_CAPITALES = {};
                        vm.valorContinente = response.data.BLOCK_CAPITALES.IM_VALOR_CONTINENTE;
                        vm.valorContenido = response.data.BLOCK_CAPITALES.IM_VALOR_CONTENIDO;

                        if (vm.isEdited == true) {
                            if (vm.datos.BLOCK_CAPITALES != null && Object.entries(vm.datos.BLOCK_CAPITALES).length > 0) {
                                response.data.BLOCK_CAPITALES.IM_VALOR_CONTINENTE = vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE;
                                response.data.BLOCK_CAPITALES.IM_VALOR_CONTENIDO = vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTENIDO;

                                if (vm.codAseguradora == 2) {
                                    response.data.BLOCK_CAPITALES.IM_OBJETOS_VALOR_EN_VIVIENDA = vm.datos.BLOCK_CAPITALES.IM_OBJETOS_VALOR_EN_VIVIENDA;
                                    response.data.BLOCK_CAPITALES.IM_VALOR_ANEXOS = vm.datos.BLOCK_CAPITALES.IM_VALOR_ANEXOS;
                                    response.data.BLOCK_CAPITALES.IM_JOYAS_EN_VIVIENDA = vm.datos.BLOCK_CAPITALES.IM_JOYAS_EN_VIVIENDA;
                                }
                            }
                        }

                        if (vm.isEdited == true && vm.datos.BLOCK_CAPITALES != null) {
                            response.data.BLOCK_CAPITALES.IM_VALOR_COMUNES = vm.datos.BLOCK_CAPITALES.IM_VALOR_COMUNES;
                        } else if (response.data.BLOCK_CAPITALES.IM_VALOR_COMUNES == null) {
                            response.data.BLOCK_CAPITALES.IM_VALOR_COMUNES = 0;
                        }

                        vm.bloqCapitalesCopy = JSON.parse(JSON.stringify(response.data.BLOCK_CAPITALES));
                        vm.datos.BLOCK_CAPITALES = response.data.BLOCK_CAPITALES;

                        // vm.datos.BLOCK_CAPITALES.IM_VALOR_COMUNES = 0;
                        if (response.data.ID_SIMULACION != undefined) {
                            vm.idSimulacion = response.data.ID_SIMULACION;
                            vm.datos.ID_SIMULACION = vm.idSimulacion;
                        }

                        if (vm.blockDatosPago != null) {
                            vm.datos.DATOS_PAGO = vm.blockDatosPago;
                        }
                        if (vm.blockDatosTomador != null) {
                            vm.datos.DATOS_TOMADOR = vm.blockDatosTomador;
                        }
                        if (vm.blockDatosPrestamo != null) {
                            vm.datos.DATOS_PRESTAMO = vm.blockDatosPrestamo;
                        } else if (vm.datos.DATOS_PRESTAMO == null) {
                            vm.datos.DATOS_PRESTAMO = {};
                            vm.datos.DATOS_PRESTAMO.IN_PRESTAMO = false;
                        }
                        if (vm.blockCapitales != null) {
                            vm.datos.BLOCK_CAPITALES = JSON.parse(JSON.stringify(vm.bloqCapitalesCopy));
                        } else {
                            vm.blockCapitales = JSON.parse(JSON.stringify(vm.datos.BLOCK_CAPITALES));
                        }

                        if (vm.codAseguradora == 1) {
                            if (vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA == 2) {
                                vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE = 15000;
                            }
                        }

                        vm.cambiarContinente();
                        vm.cambiarContenido();
                    } else {
                        msg.htmlContent(null);
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
                        vm.indice = 2;
                    }
                    vm.cargando = false;
                }, function errorCallback(response) {
                    vm.cargando = false;
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

        vm.confirmarVivienda = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'presupuesto/form.presupuesto.modal/viviendas' + vm.codAseguradora + '.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

                    md.aceptar = function () {
                        //Si los capitales están rellenos, llamar a setCapitales
                        if (vm.formCapitales == false) {
                            vm.setCapitales();
                        } else {
                            validar(vm.formCapitales);
                        }
                        md.cancel();
                    }

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                }]
            });

        }

        vm.setCapitales = function () {
            vm.modalidad = null;
            msg.htmlContent(null);
            if (vm.codAseguradora == 2) {

                //Validar que el valor de los anexos y bienes especiales no estén vacíos
                if (vm.datos.BLOCK_CAPITALES != null) {
                    for (var campo in vm.datos.BLOCK_CAPITALES) {
                        if (vm.datos.BLOCK_CAPITALES[campo] === "" || vm.datos.BLOCK_CAPITALES[campo] == null) {
                            vm.datos.BLOCK_CAPITALES[campo] = 0;
                        }
                    }
                }

                //Si los capitales se han editado, llamar a setCapitales
                if ((JSON.stringify(vm.bloqCapitalesCopy) != JSON.stringify(vm.datos.BLOCK_CAPITALES)) ||
                    (vm.valorContenido != vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTENIDO || vm.valorContinente != vm.datos.BLOCK_CAPITALES.IM_VALOR_CONTINENTE || vm.datos.BLOCK_CAPITALES.IM_VALOR_ANEXOS != 0 || vm.datos.BLOCK_CAPITALES.IM_VALOR_COMUNES != 0)) {
                    vm.cargando = true;

                    HogarService.setCapitales(vm.datos)
                        .then(function successCallback(response) {
                            if (response.data.ID_RESULT == 0) {
                                validar(vm.formCapitales);
                            } else {
                                vm.cargando = false;
                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                            }
                            // vm.cargando = false;
                        }, function errorCallback(response) {
                            vm.cargando = false;
                        });
                } else {
                    validar(vm.formCapitales);
                }
            } else {
                validar(vm.formCapitales);
            }
        }

        vm.calcular = function () {
            vm.cargando = true;
            vm.showErrorTarifica = false;
            vm.error = false;

            if (vm.datos != undefined && vm.datos.DATOS_PAGO != undefined && vm.datos.DATOS_PAGO.FD_INICIO != undefined) {
                vm.datos.DATOS_PAGO.FD_INICIO = new Date(vm.datos.DATOS_PAGO.FD_INICIO);
                var fecha = vm.datos.DATOS_PAGO.FD_INICIO;
                var anyo = fecha.getFullYear();
                var mes = fecha.getMonth() + 1;
                if (mes.toString().length === 1) {
                    mes = "0" + mes;
                }
                // var dia = fecha.getDate() + 1;
                var dia = fecha.getDate();
                if (dia.toString().length === 1) {
                    dia = "0" + dia;
                }
                vm.datos.DATOS_PAGO.FD_INICIO = anyo + "-" + mes + "-" + dia;
            }

            if (vm.idFather)
                vm.datos.ID_PADRE = vm.idFather;

            var datos = {
                ID_RAMO: 20,
                HOGAR: vm.datos,
                NO_USUARIO: JSON.parse($window.sessionStorage.perfil).usuario
            }

            datos.HOGAR.BLOCK_INFORMACION_VIVIENDA.ID_CALIDAD_CONSTRUCCION = '01';
            datos.HOGAR.BLOCK_INFORMACION_VIVIENDA.ID_SITUACION_VIVIENDA = '01';

            if (vm.idPresupuesto != undefined && vm.idPresupuesto != null) {
                datos.ID_PRESUPUESTO = vm.idPresupuesto;
            }
            if (vm.idSimulacion != undefined) {
                datos.HOGAR.ID_SIMULACION = vm.idSimulacion;
            }
            if (vm.idColectivo != undefined) {
                datos.ID_TIPO_POLIZA = vm.idColectivo;
            }

            if (datos.HOGAR.DATOS_PAGO.ID_FORMAPAGO == null) {
                datos.HOGAR.DATOS_PAGO.ID_FORMAPAGO = 2;
            }

            vm.bloquearModalidadesBBVA = false;
            HogarService.tarifica(datos, vm.codAseguradora)
                .then(function successCallback(response) {

                    if (response.data != null) {
                        if (response.data.ID_RESULT == 0) {
                            // vm.pasoPresupuesto = 2;
                            vm.objPres = response.data;
                            vm.objPres.NO_USUARIO = JSON.parse($window.sessionStorage.perfil).usuario;
                            if (response.data.ID_PRESUPUESTO)
                                vm.idPresupuesto = response.data.ID_PRESUPUESTO;

                            //Comprobar si tiene promoción
                            if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD.length > 0 && vm.objPres.MODALIDADES.MODALIDAD[0].LST_PROMOCIONES != null && vm.objPres.MODALIDADES.MODALIDAD[0].LST_PROMOCIONES.length > 0) {
                                vm.promocion = vm.objPres.MODALIDADES.MODALIDAD[0].LST_PROMOCIONES[0];
                                if (vm.objPres.PRESUPUESTO != null) {
                                    vm.objPres.PRESUPUESTO.ID_PROMO = vm.promocion.ID_CAMPAIGN;
                                    vm.dsPromocion = vm.promocion.DS_LONG;
                                    vm.dsPromocionShort = vm.promocion.DS_SHORT;
                                    vm.rangoPromocion = vm.promocion.NO_RANGO;
                                    vm.parrLegal = vm.promocion.DS_LONG_DESC;

                                    if (vm.parrLegal != null) {
                                        vm.txtLegal = true;
                                        vm.parrLegal = $sce.trustAsHtml(vm.parrLegal);
                                    }
                                }
                            }

                            if (vm.codAseguradora == 1) {
                                vm.modalidadesSL = [];
                                //Comprobar que las modalidades existan
                                if (vm.objPres.MODALIDADES != null && vm.objPres.MODALIDADES.MODALIDAD != null && vm.objPres.MODALIDADES.MODALIDAD.length > 0) {

                                    for (var i = 0; i < vm.objPres.MODALIDADES.MODALIDAD.length; i++) {
                                        var modalidad = vm.objPres.MODALIDADES.MODALIDAD[i];
                                        var idFormaPago = 2;
                                        //Recoger el id_forma_pago con el que hemos tarificado
                                        if (vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO != null) {
                                            idFormaPago = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO;
                                        }

                                        //Añadir las modalidades a la lista que tengan la misma forma de pago
                                        if (modalidad.ID_FORMAPAGO == idFormaPago) {
                                            vm.modalidadesSL.push(modalidad);
                                        }
                                    }

                                    //Ordenar lista por prima anual
                                    vm.modalidadesSL = vm.modalidadesSL.sort(function (a, b) {
                                        if (a.IM_PRIMA_ANUAL_TOT > b.IM_PRIMA_ANUAL_TOT) {
                                            return 1;
                                        }
                                        if (a.IM_PRIMA_ANUAL_TOT < b.IM_PRIMA_ANUAL_TOT) {
                                            return -1;
                                        }
                                        // a must be equal to b
                                        return 0;
                                    });
                                }
                            }

                            vm.indice = 4;
                        } else {
                            vm.msgErrorTarifica = response.data;
                            vm.showErrorTarifica = true;
                        }
                    }
                    vm.cargando = false;
                }, function errorCallback(response) {
                    msg.htmlContent(null);
                    msg.textContent("Lo sentimos, ha ocurrido un error. Vuelve a intentarlo pasados unos minutos.");
                    $mdDialog.show(msg);
                    vm.cargando = false;
                });
        }


        vm.mostrarPrecio = function (tipo) {
            var formaPago = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO;
            var modalidad = null;
            if (vm.codAseguradora == 2) {
                if (vm.objPres.PRESUPUESTO != undefined && vm.objPres.MODALIDADES != undefined && vm.objPres.MODALIDADES.MODALIDAD != undefined) {
                    for (var i = 0; i < vm.objPres.MODALIDADES.MODALIDAD.length; i++) {
                        if (vm.objPres.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == tipo) {
                            modalidad = vm.objPres.MODALIDADES.MODALIDAD[i];
                            break;
                        }
                    }
                }
            } else {
                if (vm.objPres.PRESUPUESTO != undefined && vm.objPres.MODALIDADES != undefined && vm.objPres.MODALIDADES.MODALIDAD != undefined) {
                    for (var i = 0; i < vm.objPres.MODALIDADES.MODALIDAD.length; i++) {
                        if (vm.objPres.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == tipo && vm.objPres.MODALIDADES.MODALIDAD[i].ID_FORMAPAGO == formaPago) {
                            modalidad = vm.objPres.MODALIDADES.MODALIDAD[i];
                            break;
                        }
                    }
                }
            }

            if (modalidad != null) {
                return modalidad.IM_PRIMA_ANUAL_TOT;
            } else {
                return 0;
            }
        }


        vm.formatPrice = function (x) {
            if (x != null && typeof x == "string" && x.includes(',')) {
                x = x.replace(',', '.');
            }

            if (isNaN(x) === true) {
                x = 0;
            }
            if (x == undefined) {
                x = 0;
            }
            if (typeof x === "string") {
                x = parseFloat(x);
            }
            x = x.toFixed(2);
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
        }

        vm.verDetalleCoberturas = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'presupuesto/form.presupuesto.modal/coberturas' + vm.codAseguradora + '.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

                    md.aceptar = function () {
                        md.cancel();
                    }

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                    md.verCoberturas = function (tipo) {
                        $mdDialog.show({
                            templateUrl: BASE_SRC + 'presupuesto/form.presupuesto.modal/cob_modalidad.modal.html',
                            controllerAs: '$ctrl',
                            clickOutsideToClose: false,
                            parent: angular.element(document.body),
                            //targetEvent: ev,
                            fullscreen: false,
                            controller: ['$mdDialog', function ($mdDialog) {
                                var mdm = this;
                                mdm.tipo = tipo;
                                mdm.codAseguradora = vm.codAseguradora;
                                mdm.aceptar = function () {
                                    md.cancel();
                                }

                                mdm.hide = function () {
                                    $mdDialog.hide();
                                };

                                mdm.cancel = function () {
                                    $mdDialog.cancel();
                                };

                                mdm.answer = function (answer) {
                                    $mdDialog.hide(answer);
                                };

                            }]
                        });
                    }

                }]
            });
        }


        vm.tarificaIndividual = function () {

            vm.error = false;
            vm.cargando = true;

            var obj = JSON.parse(JSON.stringify(vm.objPres));
            obj.MODALIDADES.MODALIDAD = [];
            obj.MODALIDADES.MODALIDAD.push(vm.modalidad);

            if (vm.idFather)
                obj.PRESUPUESTO.HOGAR.ID_PADRE = vm.idFather;

            //Llamada a tarifica individual
            HogarService.tarificaIndividual(obj)
                .then(function successCallback(response) {
                    if (response.data != null) {
                        if (response.data.ID_RESULT == 0) {
                            vm.afterTarificaIndividualOK(response);
                        } else if (response.data.ID_RESULT == 1201) {
                            var confirm = $mdDialog.confirm()
                                .textContent(response.data.DS_RESULT)
                                .ok('Continuar con la contratación')
                                .cancel('Cancelar');

                            $mdDialog.show(confirm).then(function () {
                                vm.afterTarificaIndividualOK(response);
                            }, function () {
                                $mdDialog.cancel();
                            });
                        } else {
                            vm.error = true;
                            vm.msgErrorTarifica = response.data;
                        }
                    }
                    vm.cargando = false;
                }, function errorCallback(response) {
                    vm.cargando = false;
                });
        }


        vm.afterTarificaIndividualOK = function (response) {
            vm.viewPromo1 = vm.viewPromo2 = vm.viewPromo3 = false;
            // vm.datos = response.data;
            vm.objPresInd = response.data;
            if (vm.llave != 'contratar') {
                vm.pasoPresupuesto = 2;
                if (vm.pre != null) {
                    vm.pre.llave = 'contratar';
                } else {
                    vm.llave = 'contratar';
                }
            }
            vm.indice = 2;

            if (vm.dsPromocionShort != null && vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_ANUAL) {
                vm.dsPromocionShort = vm.promocion.DS_SHORT;
                porcPromo = vm.rangoPromocion / 100;
                vm.importeReembolso = (vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_ANUAL * porcPromo).toFixed(2);

                if (vm.importeReembolso != null) {
                    vm.dsPromocionNoImp = true;
                    vm.importeDesc = (vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_ANUAL_TOT - vm.importeReembolso).toFixed(2);
                    vm.dsPromocionShort = vm.dsPromocionShort.replace('[importeReembolso]', vm.importeReembolso).replace('[importeDesc]', vm.importeDesc);

                    if (vm.dsPromocionShort) {
                        vm.viewPromo = true;
                        $sce.trustAsHtml(vm.dsPromocionShort);
                    }
                }
            } else {
                vm.dsPromocionShort = "Importe a reembolsar por promoción en la primera anualidad : " + vm.rangoPromocion + " % de la prima neta anual."
            }

            //Comprobar si tiene hipoteca
            if (vm.objPresInd.PRESUPUESTO != null && vm.objPresInd.PRESUPUESTO.HOGAR != null && vm.objPresInd.PRESUPUESTO.HOGAR.DATOS_PRESTAMO != null && vm.objPresInd.PRESUPUESTO.HOGAR.DATOS_PRESTAMO.IN_PRESTAMO == true) {
                vm.deshabilitarCheckHipoteca = true;
            }
            if (vm.objPresInd.MODALIDADES && vm.objPresInd.MODALIDADES.MODALIDAD && vm.objPresInd.MODALIDADES.MODALIDAD.length > 0) {
                var producto = vm.objPresInd.MODALIDADES.MODALIDAD[0].ID_COMP_RAMO_PROD;
                vm.getTipoDocumentoByProducto(producto);
                vm.objPres.PRESUPUESTO.MODALIDAD = vm.objPresInd.MODALIDADES.MODALIDAD[0];
            }

            if (vm.objPresInd.PRESUPUESTO && vm.objPresInd.PRESUPUESTO.HOGAR && vm.objPresInd.PRESUPUESTO.HOGAR.DATOS_PAGO && vm.objPresInd.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR && vm.objPresInd.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR.length > 35 && vm.codAseguradora == 1) {
                vm.errorLongitudTitular = true;
                var mostrandoErrorTitular = false;
                setTimeout(function () {
                    if (mostrandoErrorTitular == false && vm.formHogarTomador != null && vm.formHogarTomador.titularCuenta != null) {
                        vm.formHogarTomador.titularCuenta.$touched = true;
                        vm.formHogarTomador.titularCuenta.$setValidity('maxLength', false);
                        mostrandoErrorTitular = true;
                    }
                }, 1000)
            }
        }


        vm.formatDate = function (date) {
            if (date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())) {

                //Igualar la variable date a new Date(date) por si el valor es una fecha ya formateada anteriormente 

                date = new Date(date);

                var year = date.getFullYear();

                var month = date.getMonth() + 1;
                if (month.toString().length == 1) {
                    month = "0" + month;
                }

                var day = date.getDate();
                if (day.toString().length == 1) {
                    day = "0" + day;
                }

                return year + "-" + month + "-" + day;
            }
        }

        vm.emitir = function () {
            msg.htmlContent(null);
            if (vm.formHogarTomador.$invalid == true) {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if (objFocus != undefined) {
                    objFocus.focus();
                }
                msg.textContent("Rellene los datos correctamente");
                $mdDialog.show(msg);
            } else {
                vm.cargando = true;
                var bloqDatosPago = null;
                var bloqDatosTomador = null;
                var bloqDireccion = null;
                var listRequiredTomador = ["NO_NOMBRE", "NO_APELLIDO1", "NU_DOCUMENTO", "ID_TIPO_DOCUMENTO", "FD_NACIMIENTO", "NU_TELEFONO", 'NO_EMAIL'];
                var listRequiredPago = ["CO_IBAN", "NO_TITULAR"];
                var errorRequired = false;
                var mensajeError = "";
                var perfil = vm.parent.perfil;
                var usuario = "";

                if (perfil != null) {
                    perfil = JSON.parse(perfil);
                    usuario = perfil.usuario;
                }

                if (vm.datos.DATOS_TOMADOR.ID_TIPO_DOCUMENTO == 2) {
                    listRequiredTomador = ["NO_APELLIDO1", "NU_DOCUMENTO", "ID_TIPO_DOCUMENTO", "NU_TELEFONO", 'NO_EMAIL'];
                }
                vm.objPres.PRESUPUESTO.HOGAR.DATOS_TOMADOR = vm.datos.DATOS_TOMADOR;
                if (vm.otroAsegurado != undefined && vm.otroAsegurado == true) {
                    if (vm.datos.DATOS_PERSONA_ASEGURADA != undefined) {
                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_PERSONA_ASEGURADA = vm.datos.DATOS_PERSONA_ASEGURADA;
                    }
                } else {
                    if (vm.otroAsegurado == false) {
                        vm.datos.DATOS_PERSONA_ASEGURADA = {};
                    }
                }

                //Rellenar variables con sus correspondientes bloques
                if (vm.objPres.PRESUPUESTO != undefined && vm.objPres.PRESUPUESTO.HOGAR != undefined) {
                    bloqDatosPago = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO;
                    bloqDatosTomador = vm.objPres.PRESUPUESTO.HOGAR.DATOS_TOMADOR;
                    bloqDireccion = vm.objPres.PRESUPUESTO.HOGAR.BLOCK_DIRECCION_VIVIENDA;
                    if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PERSONA_ASEGURADA != undefined) {
                        bloqDatosAsegurado = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PERSONA_ASEGURADA;
                    } else {
                        bloqDatosAsegurado = {};
                    }

                    if (bloqDatosTomador != null && bloqDatosTomador != undefined) {
                        bloqDatosTomador.FD_NACIMIENTO = vm.formatDate(bloqDatosTomador.FD_NACIMIENTO);
                        if (vm.codAseguradora == 2) {
                            bloqDatosTomador.CO_NACIONALIDAD = 'ESP';
                        }
                        bloqDatosTomador.ID_SEXO = 1;
                    }

                    for (var i in bloqDireccion) {
                        bloqDatosTomador[i] = bloqDireccion[i];
                    }
                    if (vm.codAseguradora == 1) {
                        if (bloqDatosAsegurado != null && bloqDatosAsegurado != undefined) {
                            if (Object.keys(bloqDatosAsegurado).length > 0 && bloqDatosAsegurado.constructor === Object) {
                                bloqDatosAsegurado.FD_NACIMIENTO = vm.formatDate(bloqDatosAsegurado.FD_NACIMIENTO);
                                bloqDatosAsegurado.ID_SEXO = 1;
                            }
                        }
                    }
                    if (bloqDatosPago != null && bloqDatosPago != undefined) {
                        bloqDatosPago.FD_INICIO = vm.formatDate(bloqDatosPago.FD_INICIO);
                    }
                }

                //Añadir póliza de isPolizaTraspaso
                if (vm.isPolizaTraspaso == true && vm.datos.NU_POLIZA_TRASPASO != null) {
                    vm.objPres.PRESUPUESTO.HOGAR.NU_POLIZA_TRASPASO = vm.datos.NU_POLIZA_TRASPASO;
                }

                //Recorrer bloque de tomador para comprobar qu están todos los datos requeridos
                for (var i = 0; i < listRequiredTomador.length; i++) {
                    if (vm.comprobarDatos(bloqDatosTomador[listRequiredTomador[i]])) {
                        errorRequired = true;
                        mensajeError = "Rellene correctamente los datos del tomador";
                        break;
                    } else {
                        if (listRequiredTomador[i] == 'NO_APELLIDO1') {
                            if (bloqDatosTomador.NO_APELLIDO1.trim().includes(" ") != true && bloqDatosTomador.ID_TIPO_DOCUMENTO != 4 && bloqDatosTomador.ID_TIPO_DOCUMENTO != 2) {
                                errorRequired = true;
                                mensajeError = "Rellene correctamente los dos apellidos del tomador";
                                break;
                            }
                        }
                    }
                }

                //Recorrer bloque de pago para comprobar qu están todos los datos requeridos
                if (errorRequired != true) {
                    for (var i = 0; i < listRequiredPago.length; i++) {
                        if (listRequiredPago[i] == "CO_IBAN" && !vm.comprobarDatos(bloqDatosPago[listRequiredPago[i]])) {
                            //Si el IBAN está relleno, validar que el IBAN es correcto
                            if (!ValidacionPagoService.validarIban(bloqDatosPago[listRequiredPago[i]])) {
                                errorRequired = true;
                                mensajeError = "Rellene correctamente el IBAN.";
                                break;
                            } else if (bloqDatosPago[listRequiredPago[i]].includes(" ")) {
                                bloqDatosPago[listRequiredPago[i]] = bloqDatosPago[listRequiredPago[i]].replaceAll(" ", "");
                            }
                        } else if (vm.comprobarDatos(bloqDatosPago[listRequiredPago[i]])) {
                            errorRequired = true;
                            mensajeError = "Rellene correctamente los datos de la cuenta.";
                            break;
                        }
                    }
                }

                if (errorRequired == false) {

                    if(vm.llave == 'contratar')
                        vm.objPresInd = JSON.parse(JSON.stringify(vm.objPres));

                    if (vm.objPresInd != undefined) {

                        vm.objPresInd.PRESUPUESTO.HOGAR = vm.objPres.PRESUPUESTO.HOGAR;
                        vm.objPresInd.NO_USUARIO = usuario;

                        // if (vm.promocion != null) {
                        //     vm.objPresInd.PRESUPUESTO.HOGAR.IM_GESTION = (0.2 * vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_TOT).toFixed(2);
                        // }

                        vm.objPresInd.PRESUPUESTO.HOGAR['CONSENTIMIENTOS'] = vm.getConsentLst('emision');

                        if (vm.idFather)
                            vm.objPresInd.PRESUPUESTO.HOGAR.ID_PADRE = vm.idFather;

                        HogarService.emite(vm.objPresInd)
                        .then(function successCallback(response) {

                            if (response.data != null) {
                                if (response.data.ID_RESULT == 0) {

                                    // vm.objPresFin = response.data;
                                    vm.objPresInd = response.data;
                                    var msgResponse = "Se ha emitido correctamente";

                                    if (response.data.NU_POLIZA != undefined && response.data.NU_POLIZA != null) {
                                        msgResponse = "Se ha emitido correctamente con número de póliza " + response.data.NU_POLIZA;
                                    }

                                    vm.primaTotFormatEmision = 0;
                                    vm.primaTotAnualFormatEmision = 0;
                                    if (vm.objPresInd.PRESUPUESTO && vm.objPresInd.PRESUPUESTO.MODALIDAD) {
                                        vm.primaTotFormatEmision = vm.formatPrice(vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_TOT);
                                        vm.primaTotAnualFormatEmision = vm.formatPrice(vm.objPresInd.PRESUPUESTO.MODALIDAD.IM_PRIMA_ANUAL_TOT);
                                    }

                                    msg.htmlContent(null);
                                    msg.textContent(msgResponse);
                                    $mdDialog.show(msg);
                                    vm.indice = 3;
                                } else {
                                    var textHtml = "";
                                    if (response.data.MESSAGES != null && response.data.MESSAGES.MESSAGE != null) {
                                        for (var i = 0; i < response.data.MESSAGES.MESSAGE.length; i++) {
                                            var mensaje = response.data.MESSAGES.MESSAGE[i];
                                            textHtml += "<p>" + mensaje.DS_MESSAGE + "</p>";
                                        }
                                    } else {
                                        textHtml = response.data.DS_RESULT;
                                    }

                                    msg.textContent(null);
                                    msg.htmlContent(textHtml);
                                    $mdDialog.show(msg);
                                    
                                    $route.reload();
                                }
                            }
                            vm.cargando = false;
                        }, function errorCallback(response) {
                            vm.cargando = false;
                        });
                    }

                } else {
                    vm.cargando = false;
                    objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                    msg.textContent(mensajeError);
                    $mdDialog.show(msg);
                    if (objFocus != undefined) {
                        objFocus.focus();
                    }
                }
            }

        }

        vm.seleccionarModalidad = function (tipo) {
            if(vm.modalidad && vm.modalidad.ID_MODALIDAD == tipo && vm.codAseguradora == 2)
                return
            vm.modalidad = null;
            vm.precioAnual = 0;
            vm.precioSemestral = 0;
            vm.precioTrimestral = 0;
            vm.nombreModalidad = "";
            vm.tipo = tipo;

            if (vm.codAseguradora == 2) {
                vm.listaModalidades = JSON.parse(JSON.stringify(vm.objPres.MODALIDADES.MODALIDAD));
                var isAsis = false;
                var garantiaLB = null;
                var isProt = false;
                var garantiaSE = null;

                if (vm.isEdited != true || vm.datos.DATOS_PAGO.ID_FORMAPAGO == null) {
                    vm.datos.DATOS_PAGO.ID_FORMAPAGO = 2;
                }

                for (var i = 0; i < vm.listaModalidades.length; i++) {
                    for(let j = 0; j < vm.listaModalidades[i].GARANTIAS.GARANTIA.length; j++) {
                        if(((vm.listaModalidades[i].GARANTIAS.GARANTIA[j].ID_GARANTIA == 1079 || vm.listaModalidades[i].GARANTIAS.GARANTIA[j].ID_GARANTIA == 1081) && vm.listaModalidades[i].ID_MODALIDAD != 244) || (vm.listaModalidades[i].ID_MODALIDAD == 244 && vm.listaModalidades[i].GARANTIAS.GARANTIA[j].ID_GARANTIA == 1079))
                            vm.listaModalidades[i].GARANTIAS.GARANTIA[j].IN_SELECTED = false;
                    }
                    if (vm.listaModalidades[i].ID_MODALIDAD == tipo) {
                        vm.modalidad = vm.listaModalidades[i];
                        vm.precioModalidad = vm.modalidad.IM_PRIMA_ANUAL_TOT;
                        vm.idModalidadSel = vm.modalidad.ID_MODALIDAD;
                        break;
                    }
                }

                if (vm.modalidad.GARANTIAS != undefined && vm.modalidad.GARANTIAS.GARANTIA != undefined) {
                    for (var i = 0; i < vm.modalidad.GARANTIAS.GARANTIA.length; i++) {
                        if (vm.modalidad.GARANTIAS.GARANTIA[i].ID_GARANTIA == 1079) {
                            garantiaLB = vm.modalidad.GARANTIAS.GARANTIA[i];
                            vm.serLinBla = vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                            vm.precioLB = vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                        }
                        if (vm.modalidad.GARANTIAS.GARANTIA[i].ID_GARANTIA == 1081) {
                            garantiaSE = vm.modalidad.GARANTIAS.GARANTIA[i];
                            vm.serExp = vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                            vm.precioAE = vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                        }
                    }
                }

                if (garantiaLB == null) {
                    vm.serLinBla = false;
                }

                if (garantiaSE == null) {
                    vm.serExp = false;
                }

                vm.nombreModalidad = vm.modalidad.NO_MODALIDAD;
                vm.deleteFracData();
                // vm.getPrecios(vm.modalidad.NO_MODALIDAD, vm.modalidad.ID_FORMAPAGO);
            } else {
                vm.listaModalidades = JSON.parse(JSON.stringify(vm.objPres.MODALIDADES.MODALIDAD));
                var isAsis = false;
                var asisGarantia = null;
                var isProt = false;
                var protGarantia = null;

                for (var i = 0; i < vm.listaModalidades.length; i++) {
                    if (vm.listaModalidades[i].ID_MODALIDAD == tipo && vm.listaModalidades[i].ID_FORMAPAGO == vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO) {
                        vm.modalidad = vm.listaModalidades[i];
                        vm.precioModalidad = vm.listaModalidades[i].IM_PRIMA_ANUAL_TOT;
                        if (vm.modalidad.ID_MODALIDAD != 245) {
                            vm.retarificar = false;
                        }
                        break;
                    }
                }

                if (vm.modalidad.GARANTIAS != undefined && vm.modalidad.GARANTIAS.GARANTIA != undefined) {
                    for (var i = 0; i < vm.modalidad.GARANTIAS.GARANTIA.length; i++) {
                        if (vm.modalidad.GARANTIAS.GARANTIA[i].CO_COBERTURA == "AUR") {
                            asisGarantia = vm.modalidad.GARANTIAS.GARANTIA[i];
                            vm.asisUrgHogar = vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                        }
                        if (vm.modalidad.GARANTIAS.GARANTIA[i].CO_COBERTURA == "PJV") {
                            protGarantia = vm.modalidad.GARANTIAS.GARANTIA[i];
                            vm.protJurVivienda = vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED;
                        }
                    }
                }

                if (asisGarantia == null) {
                    vm.asisUrgHogar = false;
                }

                if (protGarantia == null) {
                    vm.protJurVivienda = false;
                }

                if (vm.modalidad.NO_MODALIDAD == "B") {
                    vm.nombreModalidad = "Esencial Plus";
                } else if (vm.modalidad.NO_MODALIDAD == "M") {
                    vm.nombreModalidad = "Ampliado";
                } else if (vm.modalidad.NO_MODALIDAD == "V") {
                    vm.nombreModalidad = "Premium";
                }
            }
        }



        vm.seleccionarGarantia = function (idGarantia, valor) {
            valor = !valor;
            if (vm.codAseguradora == 2) {

                if (idGarantia == 1079) {
                    vm.serLinBla = valor;
                } else {
                    vm.serExp = valor;
                }
                if (vm.modalidad.GARANTIAS != undefined && vm.modalidad.GARANTIAS.GARANTIA != undefined) {
                    for (var i = 0; i < vm.modalidad.GARANTIAS.GARANTIA.length; i++) {
                        if (vm.modalidad.GARANTIAS.GARANTIA[i].ID_GARANTIA == idGarantia) {
                            vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED = valor;

                            if (valor == true) {
                                vm.precioModalidad += vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                            } else {
                                vm.precioModalidad -= vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                            }
                        }
                    }
                }

                if((vm.serLinBla || vm.serExp) && vm.modalidad.ID_FORMAPAGO != 2) {
                    let objFrac = JSON.parse(JSON.stringify(vm.objPres));
                    for(let i = 0; i < objFrac.MODALIDADES.MODALIDAD.length; i++) {
                        if(objFrac.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == vm.modalidad.ID_MODALIDAD) {
                            objFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_ANUAL_TOT = vm.precioModalidad;
                        }
                    }
                    vm.getBbvaFrac(objFrac);
                } else {
                    vm.deleteFracData();
                }

            } else {
                vm.retarificar = true;
                if (idGarantia == 'PJV') {
                    vm.protJurVivienda = valor;
                } else {
                    vm.asisUrgHogar = valor;
                }
            }
        }

        vm.deleteFracData = function() {
            if(vm.objPresFrac)
                delete vm.objPresFrac;
            if(vm.fracFst)
                delete vm.fracFst;
            if(vm.fracSnd)
                delete vm.fracSnd;
        }

        vm.getBbvaFrac = function(objFrac) {
            vm.cargaRecalcular = true;
            HogarService.fraccionamiento(objFrac)
            .then(function successCallback(response) {
                vm.cargaRecalcular = false;
                if(response.data && response.data.ID_RESULT == 0) {
                    vm.objPresPreFrac = JSON.parse(JSON.stringify(vm.objPres));
                    vm.objPresFrac = response.data;
                    vm.getBbvaFracAmounts(vm.modalidad.ID_MODALIDAD);
                }
            },
            function errorCallback(response) {
                vm.cargaRecalcular = false;
            });
        }

        vm.getBbvaFracAmounts = function(idMod) {
            if(vm.objPresFrac && vm.objPresFrac.MODALIDADES && vm.objPresFrac.MODALIDADES.MODALIDAD) {
                for(let i = 0; i < vm.objPresFrac.MODALIDADES.MODALIDAD.length; i++) {
                    if(idMod == vm.objPresFrac.MODALIDADES.MODALIDAD[i].ID_MODALIDAD &&
                        vm.objPresFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_TOT && vm.objPresFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_RESTO_TOT) {
                        vm.fracFst = vm.objPresFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_TOT;
                        vm.fracSnd = vm.objPresFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_RESTO_TOT;
                    }
                }
            }
        }

        vm.changeFormaPago = function (formaPago) {
            if (vm.codAseguradora == 1) {
                for (var i = 0; i < vm.listaModalidades.length; i++) {
                    if (vm.listaModalidades[i].ID_MODALIDAD == vm.tipo && vm.listaModalidades[i].ID_FORMAPAGO == formaPago) {
                        vm.modalidad = vm.listaModalidades[i];
                        vm.precioModalidad = vm.modalidad.IM_PRIMA_ANUAL_TOT;
                        if (vm.objPres != undefined && vm.objPres.PRESUPUESTO != undefined && vm.objPres.PRESUPUESTO.HOGAR != undefined && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO != undefined) {
                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO = formaPago;
                        }

                        vm.datos.DATOS_PAGO.ID_FORMAPAGO = parseInt(formaPago);
                        break;
                    }
                }
            } else {
                vm.cargaRecalcular = true;
                vm.bloquearModalidadesBBVA = true;
                if (vm.objPres != undefined && vm.objPres.PRESUPUESTO != undefined && vm.objPres.PRESUPUESTO.HOGAR != undefined && vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO != undefined) {
                    vm.formaPagoAnterior = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO;
                    vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO = formaPago;
                }

                vm.datos.DATOS_PAGO.ID_FORMAPAGO = formaPago;
                vm.objPres.PRESUPUESTO.MODALIDAD = vm.modalidad;


                if (!vm.objPres.PRESUPUESTO.ID_PRESUPUESTO) {
                    if (vm.objPres.ID_PRESUPUESTO)
                        vm.objPres.PRESUPUESTO.ID_PRESUPUESTO = vm.objPres.ID_PRESUPUESTO;
                }

                if (vm.idFather)
                    vm.objPres.PRESUPUESTO.HOGAR.ID_PADRE = vm.idFather;

                
                HogarService.tarifica(vm.objPres.PRESUPUESTO, vm.codAseguradora)
                .then(function successCallback(response) {
                    vm.cargaRecalcular = false;
                    if (response.data != null) {
                        if (response.data.ID_RESULT == 0) {
                            vm.datos = response.data.PRESUPUESTO.HOGAR;
                            vm.objPres = response.data;
                            vm.bloquearModalidadesBBVA = false;

                            if (vm.objPres != null && vm.objPres.PRESUPUESTO != null) {
                                vm.modalidades = vm.objPres.MODALIDADES.MODALIDAD;

                                for (var i = 0; i < vm.modalidades.length; i++) {
                                    if (vm.modalidades[i].ID_MODALIDAD == vm.idModalidadSel) {
                                        vm.modalidad = vm.modalidades[i];
                                        vm.precioModalidad = vm.modalidad.IM_PRIMA_ANUAL_TOT;
                                    }
                                }

                                for (var i = 0; i < vm.modalidad.GARANTIAS.GARANTIA.length; i++) {
                                    if (vm.modalidad.GARANTIAS.GARANTIA[i].ID_GARANTIA == 1079) {
                                        vm.precioLB = vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                                        if (vm.serLinBla == true) {
                                            vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED = true;
                                            vm.precioModalidad += vm.precioLB;
                                        }
                                    }
                                    if (vm.modalidad.GARANTIAS.GARANTIA[i].ID_GARANTIA == 1081) {
                                        vm.precioAE = vm.modalidad.GARANTIAS.GARANTIA[i].IM_PRIMA_NETA;
                                        if (vm.serExp == true && vm.modalidad.ID_MODALIDAD != 244) {
                                            vm.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED = true;
                                            vm.precioModalidad += vm.precioAE;
                                        }
                                    }
                                }
                            }

                            /*llamar a fraccionar si alguna de las modalidades está seleccionada*/
                            if((formaPago == 3 || formaPago == 5) && (vm.serLinBla || vm.serExp)) {
                                let objFrac = JSON.parse(JSON.stringify(vm.objPres));
                                for(let i = 0; i < objFrac.MODALIDADES.MODALIDAD.length; i++) {
                                    if(objFrac.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == vm.modalidad.ID_MODALIDAD) {
                                        objFrac.MODALIDADES.MODALIDAD[i].IM_PRIMA_ANUAL_TOT = vm.precioModalidad;
                                    }
                                }
                                vm.getBbvaFrac(objFrac);
                            }

                            if (vm.datos.DATOS_PAGO != null && vm.datos.DATOS_PAGO.ID_FORMAPAGO != null) {
                                vm.datos.DATOS_PAGO.ID_FORMAPAGO = parseInt(vm.datos.DATOS_PAGO.ID_FORMAPAGO);
                            }
                        } else {
                            msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);

                            vm.datos.DATOS_PAGO.ID_FORMAPAGO = vm.formaPagoAnterior;
                        }
                    }
                    // vm.cargaRecalcular = false;
                }, function errorCallback(response) {
                    vm.cargaRecalcular = false;
                    vm.bloquearModalidadesBBVA = false;
                });
            }
            vm.getPrecios(vm.modalidad.NO_MODALIDAD, formaPago);
        }


        vm.getPrecios = function (tipo, formaPago) {
            var modalidadAnual = null;
            var modalidadSemestral = null;
            var modalidadTrimestral = null;

            if (vm.codAseguradora == 1) {
                for (var i = 0; i < vm.listaModalidades.length; i++) {
                    if (vm.listaModalidades[i].NO_MODALIDAD == tipo) {
                        if (vm.listaModalidades[i].ID_FORMAPAGO == '2') {
                            modalidadAnual = vm.listaModalidades[i];
                        } else if (vm.listaModalidades[i].ID_FORMAPAGO == '3') {
                            modalidadSemestral = vm.listaModalidades[i];
                        } else if (vm.listaModalidades[i].ID_FORMAPAGO == '5') {
                            modalidadTrimestral = vm.listaModalidades[i];
                        }
                    }
                }

                vm.precioAnual = modalidadAnual.IM_PRIMA_ANUAL_TOT - vm.modalidad.IM_PRIMA_ANUAL_TOT;
                vm.precioSemestral = modalidadSemestral.IM_PRIMA_ANUAL_TOT - vm.modalidad.IM_PRIMA_ANUAL_TOT;
                vm.precioTrimestral = modalidadTrimestral.IM_PRIMA_ANUAL_TOT - vm.modalidad.IM_PRIMA_ANUAL_TOT;
            } else {

            }
        }


        vm.getTipoDocumentoByProducto = function (producto) {
            TiposService.getTipoDocumentoByProducto(producto)
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
                    vm.parent.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
        }


        vm.valDirReferenciaCatastral = function (CO_POBLACION) {
            vm.normalizandoDireccion = true;

            objValRC = {
                "CO_REFERENCIA": vm.CO_REFERENCIA,
                "CODIGO_POSTAL": vm.CODIGO_POSTAL,
                'CO_POBLACION': CO_POBLACION ? CO_POBLACION : ''
            };
            // if(CO_POBLACION)
            //     objValRC.CO_POBLACION = CO_POBLACION;

            HogarService.valDirReferenciaCatastral(objValRC, vm.codAseguradora)
            .then(function successCallback(response) {
                if (response.status === 200) {
                    if (response.data.ID_RESULT === 0) {

                        if(response.data.LISTA_LOCALIDADES && response.data.LISTA_LOCALIDADES.LOCALIDAD && response.data.LISTA_LOCALIDADES.LOCALIDAD.length > 0) {
                            vm.selLocality(response.data.LISTA_LOCALIDADES.LOCALIDAD);
                        } else {
                            var propiedadVertical = false
                            vm.busquedaViv = true;
                            vm.noValidate = true;
                            vm.dirNormRC = true;
                            vm.datos.BLOCK_INFORMACION_VIVIENDA = response.data.BLOCK_INFORMACION_VIVIENDA;

                            /*Corresponde a edificios de propiedad vertical (un sólo propietario de la finca), en general antiguos,
                                en los que el catastro no tiene excesiva información. SIGNIFICA: TODOS*/
                            if(response.data.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA ==='T'
                            && response.data.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA === 'OD'
                            && response.data.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA === 'OS'){
                                response.data.BLOCK_DIRECCION_VIVIENDA.NO_ESCALERA = ''
                                response.data.BLOCK_DIRECCION_VIVIENDA.NU_PLANTA = ''
                                response.data.BLOCK_DIRECCION_VIVIENDA.NO_PUERTA = ''
                                vm.propiedadVertical = true
                            }

                            vm.direccionVivienda = response.data.BLOCK_DIRECCION_VIVIENDA;
                            vm.dirEleg = response.data.BLOCK_DIRECCION_VIVIENDA;
                            response.data.BLOCK_DIRECCION_VIVIENDA.CO_REFERENCIA = response.data.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA
                            response.data.BLOCK_DIRECCION_VIVIENDA.CODIGO_POSTAL = response.data.BLOCK_INFORMACION_VIVIENDA.CODIGO_POSTAL
                            vm.resumenVivienda(response.data.BLOCK_DIRECCION_VIVIENDA);
                            vm.datos.BLOCK_DIRECCION_VIVIENDA = response.data.BLOCK_DIRECCION_VIVIENDA;
                            vm.detallesVivienda = {};

                            if(vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA == '02')
                                vm.codAseguradora = 1;
                            else
                                vm.codAseguradora = response.data.BLOCK_DIRECCION_VIVIENDA.ID_COMPANIA_CATASTRO;
                            vm.normalizandoDireccion = false;
                            vm.getCombAseguradoras();
                        }

                    } else if (response.data.ID_RESULT === 1112 || response.data.ID_RESULT == 730) {
                        var confirmViv = $mdDialog.confirm()
                            .textContent(response.data.DS_RESULT)
                            .ok('Aceptar')
                            .cancel('Cancelar');

                        $mdDialog.show(confirmViv).then(function () {
                            vm.direccionValida = true;
                            vm.datos.BLOCK_INFORMACION_VIVIENDA = response.data.BLOCK_INFORMACION_VIVIENDA;
                            vm.direccionVivienda = response.data.BLOCK_DIRECCION_VIVIENDA;
                            vm.dirNormRC = true;
                            vm.busquedaViv = true;
                            vm.dirEleg = response.data.BLOCK_DIRECCION_VIVIENDA;
                            vm.resumenVivienda(response.data.BLOCK_DIRECCION_VIVIENDA);
                            vm.datos.BLOCK_DIRECCION_VIVIENDA = response.data.BLOCK_DIRECCION_VIVIENDA;
                            vm.detallesVivienda = {};

                            vm.codAseguradora = response.data.BLOCK_DIRECCION_VIVIENDA.ID_COMPANIA_CATASTRO;
                            vm.getCombAseguradoras();

                        }, function () {
                            $mdDialog.cancel();
                            vm.normalizandoDireccion = false;
                            vm.dirNormRC = false;
                            vm.noValidate = false;
                            return null;
                        });

                    } else {
                        vm.dirNormRC = false;
                        vm.normalizandoDireccion = false;
                        msg.textContent(response.data.DS_RESULT);
                        $mdDialog.show(msg);
                    }
                }
            }, function callBack(response) {
                if (response.status === 406 || response.status === 401) {}
            });
        }

        vm.selLocality = function(localities) {
    		$mdDialog.show({
    			templateUrl: `${BASE_SRC}localidades/localidades.modal.html`,
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;
                    md.localidades = localities;
    				
    		    	md.elegirLocalidad = function(locality){
                        vm.valDirReferenciaCatastral(locality.CO_POBLACION)
    		    		$mdDialog.hide();
    		    	}
    		    	
    				md.hide = function() {
                        vm.normalizandoDireccion = false;
		    	        $mdDialog.hide();
		    	    };

		    	    md.cancel = function() {
                        vm.normalizandoDireccion = false;
		    	        $mdDialog.cancel();
		    	    };
              
                }]
    		});
    	}

        vm.cambiarDatos = function () {
            vm.direccionVivienda = vm.datos.BLOCK_DIRECCION_VIVIENDA;
            vm.dirCambiada = true;
            vm.resumenVivienda(vm.datos.BLOCK_DIRECCION_VIVIENDA);
        }

        vm.cambiarAseguradora = function () {
            vm.busquedaViv = false;
            vm.viviendaValidada = false;
            vm.useCatastro = true
            vm.catastroEnMantenimiento = false
            vm.datos.BLOCK_INFORMACION_VIVIENDA.ID_TIPO_VIVIENDA = null
            vm.listaDireccionesSug = null

            if(vm.datos.BLOCK_USO_REGIMEN.ID_REGIMEN_VIVIENDA ==='02' && vm.codAseguradora === 2){
                msg.textContent("Info: se ha establecido Santa Lucía como aseguradora debido a la titularidad de vivienda indicada: 'INQUILINO'")
                $mdDialog.show(msg)
                vm.codAseguradora = 1;
                vm.blockChangeAseguradora = true;
            }

            if (vm.dirNormRC) {
                vm.dirNormRC = false;
                vm.dirCambiada = false;
                vm.valDirReferenciaCatastral();

            } else if (vm.optManual) {

                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA !== '' || vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION !== ''){

                    const dialogChangeAseg = $mdDialog.confirm()
                        .textContent("Info: deberás rellenar los datos de nuevo para validarlos en el sistema de la aseguradora que has seleccionado.")
                        .ok('Aceptar')
                        .cancel('Cancelar');

                    $mdDialog.show(dialogChangeAseg).then(function () {
                            vm.dirNormViv = false;
                            vm.busquedaViv = true;

                            vm.updateDir('BLOCK_DIRECCION_VIVIENDA', vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL, false, false);

                        }, function () {
                            $mdDialog.cancel();
                            vm.borrarForm();
                            return null;
                        });
                }else{
                    vm.updateDir('BLOCK_DIRECCION_VIVIENDA', vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL, false, false);
                }
            }

            vm.getCombAseguradoras();
        }

        vm.resumenVivienda = function (vivienda) {
            if (vivienda.NO_DIRECCION_COMPLETA)
                vm.direccion = vivienda.NO_DIRECCION_COMPLETA;
            else
                vm.direccion = `${vivienda.NO_TIPO_VIA ? vivienda.NO_TIPO_VIA : vivienda.CO_TIPO_VIA ? vivienda.CO_TIPO_VIA : ''} ${vivienda.NO_DIRECCION}`.toUpperCase();
            vm.numero = vivienda.NUMERO != undefined ? vivienda.NUMERO : vivienda.NU_NUMERO;
            vm.codPostal = vivienda.CODIGO_POSTAL != undefined ? vivienda.CODIGO_POSTAL : vivienda.CO_POSTAL;
            vm.municipio = vivienda.NO_MUNICIPIO != undefined ? vivienda.NO_MUNICIPIO : vivienda.NO_LOCALIDAD;
            vm.provincia = vivienda.NO_PROVINCIA != undefined ? vivienda.NO_PROVINCIA : vivienda.DS__CO_PROVINCIA;
            vm.bloque = vivienda.BLOQUE != undefined ? vivienda.BLOQUE : vivienda.NO_PORTAL;
            vm.escalera = vivienda.ESCALERA != undefined ? vivienda.ESCALERA : vivienda.NO_ESCALERA;
            vm.planta = vivienda.PLANTA != undefined ? vivienda.PLANTA : vivienda.NU_PLANTA;
            vm.puerta = vivienda.PUERTA != undefined ? vivienda.PUERTA : vivienda.NO_PUERTA;
            vm.refCatastral = vivienda.CO_REFERENCIA ? vivienda.CO_REFERENCIA : '';
        }


        //Identificar la localidad por pueblos
        vm.updateDir = function (tipo, valor, isEdited, buscarDireccionesSugeridas) {
            vm.buscarDireccionesSugeridas = buscarDireccionesSugeridas;
            if (valor != undefined && valor.length == 5 && !isNaN(valor)) {
                vm.localidades = [];

                vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA = '';
                vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = '';
                vm.tipoViaSeleccionada = null;
                vm.viaSeleccionada = null;
                vm.textoBusquedaNombreVia = "";

                vm.cargandoCP = true;

                if(vm.codAseguradora === undefined){
                    msg.textContent("No se ha podido recuperar información asociada al código postal introducido.");
                    $mdDialog.show(msg)
                    return
                }

                if (vm.apisSL == true) {

                    HogarService.getLocalidades(valor, vm.codAseguradora)
                        .then(function successCallBack(response) {

                            if (response.data.ID_RESULT === 0 || response.data.ID_RESULT === 902) {

                                if(response.data.ID_RESULT === 902) {
                                    vm.catastroEnMantenimiento = true
                                }else {
                                    vm.catastroEnMantenimiento = false
                                }

                                if (!Array.isArray(response.data.LOCALIDAD)) {
                                    vm.localidades = [];
                                    vm.localidades.push(response.data.LOCALIDAD);
                                } else {
                                    vm.localidades = response.data.LOCALIDAD;
                                    if (vm.localidades.length > 1) {
                                        if (isEdited != true) {
                                            LocalidadesService.elegirLocalidad(vm.localidades, vm.datos[tipo], true);
                                        }
                                    } else
                                        vm.datos[tipo].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                                }

                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD != null) {
                                    var indice = vm.localidades.findIndex(x => x.ID_LOCALIDAD == vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD);
                                    if (indice > -1) {
                                        vm.datos[tipo].NO_LOCALIDAD = vm.localidades[indice].NO_LOCALIDAD;
                                        vm.datos[tipo].CO_PROVINCIA = vm.localidades[indice].CO_PROVINCIA;
                                        vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[indice].CO_PROVINCIA_INE;
                                        vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[indice].CO_PROVINCIA_INE;
                                        vm.datos[tipo].CO_MUNICIPIO = vm.localidades[indice].CO_MUNICIPIO;
                                        vm.datos[tipo].CO_POBLACION = vm.localidades[indice].CO_POBLACION;
                                    } else {
                                        if (isEdited && vm.datos[tipo].CO_POBLACION) {
                                            for (let i = 0; i < vm.localidades.length; i++) {
                                                if (vm.localidades[i].CO_POBLACION && vm.datos[tipo].CO_POBLACION == vm.localidades[i].CO_POBLACION) {
                                                    vm.datos[tipo].NO_LOCALIDAD = vm.localidades[i].NO_LOCALIDAD;
                                                    vm.datos[tipo].CO_PROVINCIA = vm.localidades[i].CO_PROVINCIA;
                                                    vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[i].CO_PROVINCIA_INE;
                                                    vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[i].CO_PROVINCIA_INE;
                                                    vm.datos[tipo].CO_MUNICIPIO = vm.localidades[i].CO_MUNICIPIO;
                                                    vm.datos[tipo].CO_POBLACION = vm.localidades[i].CO_POBLACION;
                                                    break;
                                                }
                                            }
                                        } else {
                                            vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                                            vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                                            vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA_INE;
                                            vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[0].CO_PROVINCIA_INE;
                                            vm.datos[tipo].CO_MUNICIPIO = vm.localidades[0].CO_MUNICIPIO;
                                            vm.datos[tipo].CO_POBLACION = vm.localidades[0].CO_POBLACION;
                                        }
                                    }
                                } else {
                                    vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                                    vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                                    vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA_INE;
                                    vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[0].CO_PROVINCIA_INE;
                                    vm.datos[tipo].CO_MUNICIPIO = vm.localidades[0].CO_MUNICIPIO;
                                    vm.datos[tipo].CO_POBLACION = vm.localidades[0].CO_POBLACION;
                                }

                                vm.estadoCatastro = response.data.ID_RESULT;
                                vm.cargandoCP = false;
                                vm.disabledCatastro = false;

                                if (vm.estadoCatastro == 902) {
                                    vm.disabledCatastro = true;
                                    msg.textContent(response.data.DS_RESULT);
                                    $mdDialog.show(msg);
                                }

                                if (response.data.ID_PADRE)
                                    vm.idFather = response.data.ID_PADRE;

                            } else if(response.data.ID_RESULT == 99){ 
                            	 msg.textContent("El código postal no es válido.");
                                 $mdDialog.show(msg);
                                 vm.cargandoCP = false;
                                 
                            } else {
                                vm.cargandoCP = false;
                                vm.disabledCatastro = true;
                                vm.estadoCatastro = 902;
                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                            }

                            const codAseguradoraVias = (vm.catastroEnMantenimiento === true || vm.useCatastro === false) ? 1 : 2;

                            if (vm.buscarDireccionesSugeridas == true && vm.objDir && vm.objDir.NOMBRE_VIA) {
                                if (vm.apisSL == true) {

                                    HogarService.getVias(vm.objDir, codAseguradoraVias)
                                        .then(function successCallback(response) {
                                            if (response.data.ID_RESULT == 0) {
	
												if(vm.codAseguradora == 1){
													vm.listaVias = response.data.LISTA_COMPLEJA_VIAS != null ? response.data.LISTA_COMPLEJA_VIAS.map(item => item.NO_VIA_COMPLETA) : [];
                                            	    vm.listaComplejaVias = response.data.LISTA_COMPLEJA_VIAS != null ? response.data.LISTA_COMPLEJA_VIAS : [];
												}else{
													vm.listaVias = response.data.LISTA_VIAS;
												}
//                                                vm.listaVias = response.data.LISTA_VIAS;
//                                                vm.listaComplejaVias = response.data.LISTA_COMPLEJA_VIAS != null ? response.data.LISTA_COMPLEJA_VIAS : [];
                                            } else {
                                                txtMsg = response.data.DS_RESULT;
                                                msg.htmlContent(null);
                                                msg.textContent(txtMsg);
                                                $mdDialog.show(msg);
                                                vm.listaVias = [];
                                                vm.listaComplejaVias = [];
                                            }
                                            //Llamar a buscarDireccionesSug
                                            vm.buscarDireccionesSug(false);
                                        });
                                } else {
                                    //Llamar a buscarDireccionesSug
                                    vm.buscarDireccionesSug(false);
                                }
                            }

                        }, function errorCallBack(response) {
                            vm.cargandoCP = false;
                        });
                } else if (vm.apisSL == false) {
                    HogarService.getLocalidades(valor)
                        .then(function successCallBack(response) {

                            if (response.data.ID_RESULT == 0 || response.data.ID_RESULT == 902) {
                                if (!Array.isArray(response.data.LOCALIDAD)) {
                                    vm.localidades = [];
                                    vm.localidades.push(response.data.LOCALIDAD);
                                } else {
                                    vm.localidades = response.data.LOCALIDAD;
                                    if (vm.localidades.length > 1) {
                                        if (isEdited != true) {
                                            LocalidadesService.elegirLocalidad(vm.localidades, vm.datos[tipo]);
                                        }
                                    } else
                                        vm.datos[tipo].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                                }

                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA != null && vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD != null) {
                                    var indice = vm.localidades.findIndex(x => x.ID_LOCALIDAD == vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_LOCALIDAD);
                                    if (indice > -1) {
                                        vm.datos[tipo].NO_LOCALIDAD = vm.localidades[indice].NO_LOCALIDAD;
                                        vm.datos[tipo].CO_PROVINCIA = vm.localidades[indice].CO_PROVINCIA;
                                        vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[indice].CO_PROVINCIA_INE;
                                        vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[indice].CO_PROVINCIA_INE;
                                    } else {
                                        vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                                        vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                                        vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA_INE;
                                        vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[0].CO_PROVINCIA_INE;
                                    }
                                } else {
                                    vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                                    vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                                    vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA_INE;
                                    vm.datos[tipo].CO_PROVINCIA_INE = vm.localidades[0].CO_PROVINCIA_INE;
                                }

                                vm.estadoCatastro = response.data.ID_RESULT;
                                vm.cargandoCP = false;
                                vm.disabledCatastro = false;

                                if (vm.estadoCatastro == 902) {
                                    vm.disabledCatastro = true;
                                    msg.textContent(response.data.DS_RESULT);
                                    $mdDialog.show(msg);
                                }

                                if (response.data.ID_PADRE)
                                    vm.idFather = response.data.ID_PADRE;

                            } else {
                                vm.cargandoCP = false;
                                vm.disabledCatastro = true;
                                vm.estadoCatastro = 902;
                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                            }

                        }, function errorCallBack(response) {
                            vm.cargandoCP = false;
                        });
                }

            } else {
                if (vm.datos != undefined) {
                    if (vm.datos[tipo] != undefined) {
                        vm.datos[tipo].NO_LOCALIDAD = null;
                        vm.datos[tipo].CO_PROVINCIA = null;
                        vm.datos[tipo].DS__CO_PROVINCIA = null;
                        vm.datos[tipo].CO_PROVINCIA_INE = null;
                    }
                }
            }
        }

        // Búsquedas AutoComplete
        vm.querySearch = function (query, list, key) {
			
			if(list == undefined){
				list = [];
			}
			
            var results = query ? list.filter(createFilterFor(query, key)) : list;
            var deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                if (key == 'DS_TIPO_VIA')
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) === 0);
                else if (key == 'via') {
                    if (vm.apisSL == false) {
                        return (list.toUpperCase().indexOf(uppercaseQuery) >= 0);
                    } else {
                        return (list.toUpperCase().indexOf(uppercaseQuery) >= 0);
                    }
                } else
                    return (list[key].indexOf(uppercaseQuery) >= 0);
            };
        }

        vm.getVia = function (type, id) {
            var text = "";
            if (vm.tipos != null && vm.tipos.tiposVia != null) {
                if (type == "NO_TIPO_VIA") {
                    return vm.tipos.tiposVia.find(x => x.ID_TIPO_VIA == id).DS_TIPO_VIA;
                } else {
                    return vm.tipos.tiposVia.find(x => x.ID_TIPO_VIA == id).CO_TIPO_VIA;
                }
            }
            return text;
        }
        
        vm.refrescar = function(txt){

			 $timeout(function () {
				vm.busquedaManual = true;
				vm.textoBusquedaNombreVia = txt;
             });
		}

        vm.buscarVias = function (txt) {
			
			if(vm.loadVias){
				return;
			}
			
            vm.objDir = {
                'NO_PROVINCIA': vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA_INE,
                'NO_MUNICIPIO': vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD,
                'CO_POBLACION': vm.apisSL == false ? null : vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POBLACION,
                'NO_TIPO_VIA': vm.tipoViaSeleccionada != null && vm.tipoViaSeleccionada.CO_TIPO_VIA != "" ? vm.tipoViaSeleccionada.CO_TIPO_VIA : "",
                'NOMBRE_VIA': txt
            };

            if (vm.idFather)
                vm.objDir.ID_PADRE = vm.idFather;

            vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA = '';
            vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA = '';
			
			vm.textoBusquedaNombreVia = txt;
			
            if (txt.length == 3 || vm.busquedaManual) {
				vm.listaVias = vm.buscarViasAseg();
				if(vm.busquedaManual){
					vm.refreshAutocomplete = true;
					vm.busquedaManual = false;
				}

            
            }else if(txt.length>0 && txt.length < 3){
				if(vm.busquedaManual){
					vm.listaVias = vm.buscarViasAseg();
					vm.refreshAutocomplete = true;

				}else{
					if(vm.refreshAutocomplete){
						vm.refreshAutocomplete = false;
					}else{
						vm.listaVias = ['Buscar: ' + txt];
						vm.showResult = false;
					}	
				}
			}
        }
        
        vm.buscarViasAseg = function (){
			vm.loadVias = true;
			vm.showResult = false;
            HogarService.getVias(vm.objDir, vm.codAseguradora)
                .then(function successCallback(response) {
					
                    if (response.data.ID_RESULT == 0) {
                        vm.listaVias = response.data.LISTA_VIAS;
                        if(vm.codAseguradora == '1'){
							vm.listaComplejaVias = response.data.LISTA_COMPLEJA_VIAS != null ? response.data.LISTA_COMPLEJA_VIAS : [];
							vm.listaVias = response.data.LISTA_COMPLEJA_VIAS != null ? response.data.LISTA_COMPLEJA_VIAS.map(item => item.NO_VIA_COMPLETA) : [];
						}
						
						
                    } else {
                        vm.listaVias = [];
                        vm.listaComplejaVias = [];
                    }
                    
                    vm.showResult = true;
                    vm.textoBusquedaNombreVia = vm.objDir.NOMBRE_VIA;
                    
                    $timeout(function () {
                        angular.element('#autocompleteVia').focus();
                    }, 1);
					
					
					vm.loadVias = false;
					
                    return vm.listaVias;
                    
                }, function errorCallback(response) {
                    vm.loadVias = false;
                    vm.showResult = true;
                });
		}

        vm.getCoVia = function () {
            var coVia = "";
            if (vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION != null && vm.listaComplejaVias != null && vm.listaComplejaVias.length > 0) {
				var coTipoVia = vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_TIPO_VIA;
                var noVia = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION;
                var via = "";
                if(coTipoVia != null){
					via = vm.listaComplejaVias.find((x => x.NO_VIA == noVia && x.NO_TIPO_VIA == coTipoVia));
				}else{
					via = vm.listaComplejaVias.find(x => x.NO_VIA_COMPLETA == noVia);
				}
                
                if (via != null) {
                    coVia = via.CO_VIA;
                }
            }
            return coVia;
        }

		vm.getInfoVia = function(nombreViaCompleto){
					
			var infoVia = vm.listaComplejaVias.find(x => x.NO_VIA_COMPLETA == nombreViaCompleto);
			
			return infoVia;
						
		}
		
		
        vm.buscarDireccionesSug = function (changeDireccion) {

            if (vm.objDir != undefined) {
                vm.objDirNum = JSON.parse(JSON.stringify(vm.objDir));

                if (vm.apisSL == false) {
                    vm.objDirNum.NOMBRE_VIA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION
                    vm.objDirNum.NUMERO = vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO
                } else {
                    vm.objDirNum.NOMBRE_VIA = vm.objDirNum.NOMBRE_VIA  != null ? vm.objDirNum.NOMBRE_VIA : vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION;
                    vm.objDirNum.NUMERO = vm.objDirNum.NUMERO != null ? vm.objDirNum.NUMERO : vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO;
                    vm.objDirNum.CO_MUNICIPIO = vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_MUNICIPIO;
                    vm.objDirNum.CO_PROVINCIA = vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA;
                    vm.objDirNum.CO_VIA = vm.objDirNum.CO_VIA != null ? vm.objDirNum.CO_VIA : vm.getCoVia();
                }

                if(vm.objDirNum.ESCALERA !== undefined)
                    vm.objDir.ESCALERA = vm.objDir.ESCALERA.toUpperCase()
            }

            msg.htmlContent(null);
            vm.listaDireccionesSug = [];
            var condicionIf = null;
            condicionIf = vm.objDirNum != undefined && checkAddressObj(vm.objDirNum);
            

            if (condicionIf) {
                if (changeDireccion == null) {
                    vm.cargandoNumero = true;
                }
                HogarService.getDatosCatastralesDir(vm.objDirNum, vm.codAseguradora)
                    .then(function successCallback(response) {

                        if (response != undefined) {
                            if (response.data.DIRECCIONES_SUGERIDAS != undefined) {
								vm.listCatastro = true;								
                                vm.listaDireccionesSug = response.data.DIRECCIONES_SUGERIDAS;

                                vm.listaBloques = [];
                                vm.listaEscaleras = [];
                                vm.listaPlantas = [];
                                vm.listaPuertas = [];

                                for (var i = 0; i < vm.listaDireccionesSug.length; i++) {
                                    if (vm.listaDireccionesSug[i].BLOQUE != undefined && vm.listaDireccionesSug[i].BLOQUE != '') {
                                        if (vm.listaBloques.indexOf(vm.listaDireccionesSug[i].BLOQUE) == -1) {
                                            vm.listaBloques.push(vm.listaDireccionesSug[i].BLOQUE);
                                        }
                                    } else {
                                        if (vm.listaDireccionesSug[i].ESCALERA != undefined && vm.listaDireccionesSug[i].ESCALERA != '') {
                                            if (vm.listaEscaleras.indexOf(vm.listaDireccionesSug[i].ESCALERA) == -1) {
                                                vm.listaEscaleras.push(vm.listaDireccionesSug[i].ESCALERA);
                                            }
                                        } else {
                                            if (vm.listaPlantas.indexOf(vm.listaDireccionesSug[i].PLANTA) == -1) {
                                                vm.listaPlantas.push(vm.listaDireccionesSug[i].PLANTA);
                                            }
                                        }
                                    }
                                }

                                if (vm.listaBloques.length > 0 && vm.listaEscaleras.length > 0) {
                                    for (let i = 0; i < vm.listaDireccionesSug.length; i++) {
                                        if (!vm.listaDireccionesSug[i].BLOQUE) {
                                            vm.listaDireccionesSug[i].BLOQUE = '--Sin bloque--';
                                        }
                                    }
                                    vm.listaBloques.push('--Sin bloque--');
                                }

                                if (vm.listaEscaleras.length > 0 && vm.listaPlantas.length > 0) {
                                    for (let i = 0; i < vm.listaDireccionesSug.length; i++) {
                                        if (!vm.listaDireccionesSug[i].ESCALERA) {
                                            vm.listaDireccionesSug[i].ESCALERA = '--Sin escalera--';
                                        }
                                    }
                                    vm.listaEscaleras.push('--Sin escalera--');
                                }

                                if (vm.listaBloques.length == 1) {
                                    vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL = vm.listaBloques[0];
                                    vm.listarPisos('bloque');
                                }
                                if (vm.listaEscaleras.length == 1) {
                                    vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA = vm.listaEscaleras[0];
                                    vm.listarPisos('escalera');
                                }

                                //Cuando changeDireccion es false llamamos a listarPisos para recoger los valores de los demás selects
                                if (changeDireccion == false) {
                                    vm.listarPisos('bloque');
                                    vm.listarPisos('escalera');
                                    vm.listarPisos('planta');
                                }


                            } else if (response.data.DATOS_CATASTRALES != undefined) {
                                if (response.data.DATOS_CATASTRALES.CO_REFERENCIA != undefined) {
                                    //                        	vm.listaDireccionesSug = [];
                                    //                        	vm.listaDireccionesSug.push(response.data.DATOS_CATASTRALES);
                                    vm.listaBloques = [];
                                    vm.listaEscaleras = [];
                                    vm.listaPlantas = [];
                                    vm.listaPuertas = [];
                                    vm.datosCatastrales = response.data.DATOS_CATASTRALES;
                                }                               
                            }

                            if (response.data.ID_RESULT == 104) {
                                if (response.data.NUMEROS_SUGERIDOS != undefined && response.data.NUMEROS_SUGERIDOS.length > 0) {
                                    var txtNumeros = '';
                                    for (var i = 0; i < response.data.NUMEROS_SUGERIDOS.length; i++) {
                                        txtNumeros += response.data.NUMEROS_SUGERIDOS[i] + ', ';
                                    }
                                    txtNumeros = txtNumeros.slice(0, txtNumeros.length - 2);
                                }
                                txtMsg = response.data.DS_RESULT;
                                if (txtNumeros != null && txtNumeros != "") {
                                    txtMsg += '. Los números posibles son ' + txtNumeros;
                                }
                                msg.textContent(txtMsg);
                                $mdDialog.show(msg);
                            } else if (response.data.ID_RESULT == 704 || response.data.ID_RESULT == 99) {
                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                            }

                        }
                        vm.cargandoNumero = false;
                    });
            }
        }

        function checkAddressObj(obj) {
            let valid = false;
            if (obj && (obj.NO_MUNICIPIO && obj.NO_MUNICIPIO != '') && (obj.NO_PROVINCIA && obj.NO_PROVINCIA != '') && 
                (obj.NOMBRE_VIA && obj.NOMBRE_VIA != '') && (obj.NUMERO && obj.NUMERO != '')){
	
				if(vm.codAseguradora == '1'){
					valid = true
				}else{
					if(obj.NO_TIPO_VIA && obj.NO_TIPO_VIA != ''){
						valid = true
					} 
				}
			}

            return valid;
        }


        vm.validaDireccion = function () {
            vm.validandoViv = true;
			
			if(vm.codAseguradora == '1'){
			
				let infoVia = vm.getInfoVia(vm.viaSeleccionada);
				
				vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA = infoVia.ID_TIPO_VIA;
				vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_TIPO_VIA = infoVia.NO_TIPO_VIA;
				vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_TIPO_VIA = infoVia.DS_TIPO_VIA;
				vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION = infoVia.NO_VIA;
				
				if(vm.listaDireccionesSug != undefined && vm.listaDireccionesSug.length > 0){
					for(var i = 0; i<vm.listaDireccionesSug.length; i++){
						if(vm.listaDireccionesSug[i].BLOQUE == vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL
						    && vm.listaDireccionesSug[i].ESCALERA == vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA
						     && vm.listaDireccionesSug[i].PLANTA == vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA
						      && vm.listaDireccionesSug[i].PUERTA == vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA){
							
							vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION = vm.listaDireccionesSug[i].DATOS_CATASTRALES.NU_ANYO_CONSTRUCCION;
							vm.datos.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA = vm.listaDireccionesSug[i].DATOS_CATASTRALES.CO_REFERENCIA;
							vm.datos.BLOCK_INFORMACION_VIVIENDA.CA_METROS_CUADRADOS = vm.listaDireccionesSug[i].DATOS_CATASTRALES.NU_SUPERFICIE;
							
						}
						
					}
				}else if(vm.datosCatastrales != undefined){
						vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION = vm.datosCatastrales.NU_ANYO_CONSTRUCCION;
						vm.datos.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA = vm.datosCatastrales.CO_REFERENCIA;
						vm.datos.BLOCK_INFORMACION_VIVIENDA.CA_METROS_CUADRADOS = vm.datosCatastrales.NU_SUPERFICIE;
					
					
				}
			}

            var objValidaDireccion = {
                "CO_POSTAL": vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POSTAL,
                "CO_PROVINCIA": vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA,
                "CO_TIPO_VIA": vm.codAseguradora != '1' ? vm.getVia('CO_TIPO_VIA', vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA) : vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_TIPO_VIA,
                "DS__CO_PROVINCIA": vm.datos.BLOCK_DIRECCION_VIVIENDA.DS__CO_PROVINCIA,
                "ID_TIPO_VIA": vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA,
                "NO_DIRECCION": vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION,
                "NO_ESCALERA": vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA,
                "NO_LOCALIDAD": vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_LOCALIDAD,
                "NO_PORTAL": vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL,
                "NO_PUERTA": vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA,
                "NO_TIPO_VIA": vm.codAseguradora != '1' ? vm.getVia('NO_TIPO_VIA', vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA) : vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_TIPO_VIA,
                "NU_NUMERO": vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO,
                "NU_PLANTA": vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA,
                "CO_POBLACION": vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_POBLACION
            }

            var objValidateAddress = {
                'BLOCK_DIRECCION_VIVIENDA': objValidaDireccion
            }
            if (vm.idFather) {
                objValidateAddress.ID_PADRE = vm.idFather;
            }
            
            HogarService.validaDireccion(objValidateAddress, vm.codAseguradora)
                .then(function successCallback(response) {
                    if (response.data.ID_RESULT == 0) {
                        // vm.busquedaViv = true;
                        vm.dirNormViv = true;
                        vm.permitirContinuar = true;
                        var errorMensaje = false;
                        var txtMensaje = "";
                        vm.validandoViv = false;

                        vm.dirEleg = objValidateAddress;
                        vm.resumenVivienda(objValidateAddress.BLOCK_DIRECCION_VIVIENDA);

                        if (response.data.LIST_MESSAGE != null && response.data.LIST_MESSAGE.length > 0) {
                            for (var i = 0; i < response.data.LIST_MESSAGE.length; i++) {
                                var mensaje = response.data.LIST_MESSAGE[i];
                                if (mensaje.CO_MESSAGE_TYPE == "WARN" || mensaje.CO_MESSAGE_TYPE == "ERROR") {
                                    txtMensaje += "<p>" + mensaje.DS_MESSAGE + "</p><br>";
                                    errorMensaje = true;
                                }
                                if (mensaje.CO_MESSAGE_TYPE == "ERROR") {
                                    vm.permitirContinuar = false;
                                }
                            }
                            vm.validandoViv = false;
                        }

                        //Si hay algún mensaje con error, bloquear paso
                        if (errorMensaje == true) {
                            vm.direccionValida = false;
                            var confirm = $mdDialog.confirm()
                                .htmlContent(txtMensaje)
                                .ok('Aceptar')
                                .cancel('Cancelar');

                            $mdDialog.show(confirm).then(function () {
                                if (vm.permitirContinuar == true) {
                                    vm.direccionValida = true;
                                    getDatosCat();
                                } else {
                                    $mdDialog.cancel();
                                }
                            });
                            vm.cargando = false;
                            vm.validandoViv = false;
                            return null;
                        }
						if(vm.codAseguradora != 1){
							getDatosCat();
						}
                        

                    } else {
                        vm.dirNormViv = false;
                        vm.dirEleg = false;
                        vm.direccionValida = false;
                        
                        var textContent = 'Lo sentimos, ha ocurrido un error al validar dirección';
                        if (response.data.ID_RESULT == 722) {
                            textContent = 'Esta vivienda ya está asegurada con Santa Lucia';
                        } else if (response.data.DS_RESULT != null) {
                            textContent = response.data.DS_RESULT;
                        }

                        var confirm = $mdDialog.confirm()
                            .htmlContent(textContent)
                            .ok('Aceptar')
                        	.cancel('Cancelar');

                        $mdDialog.show(confirm).then(function () {
                            vm.direccionValida = true;
                            vm.dirNormViv = true;
                            vm.resumenVivienda(objValidateAddress.BLOCK_DIRECCION_VIVIENDA);
                            if (vm.apisSL == false) {
                                getDatosCat();
                            } else {
                                if (vm.codAseguradora != 1) {
                                    getDatosCat();
                                }
                            }
                            
                            if(vm.direccion != undefined && vm.numero != undefined && vm.provincia != undefined
                            	&& vm.municipio != undefined){
								vm.vivValidada = true;
							}
                        });

                    }
                    vm.cargando = false;
                    vm.validandoViv = false;
                }, function errorCallback(response) {
                    vm.cargando = false;
                });
        }

        function getDatosCat() {

            if (vm.datos != null && vm.datos.BLOCK_INFORMACION_VIVIENDA != null && vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION != null) {
                vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION = null;
            }

            if (vm.estadoCatastro == 0) {
                vm.objDirCom = JSON.parse(JSON.stringify(vm.objDirNum));
                vm.objDirCom.BLOQUE = vm.datos.BLOCK_DIRECCION_VIVIENDA.PORTAL;
                vm.objDirCom.ESCALERA = vm.datos.BLOCK_DIRECCION_VIVIENDA.ESCALERA;
                vm.objDirCom.PLANTA = vm.datos.BLOCK_DIRECCION_VIVIENDA.PLANTA;
                vm.objDirCom.PUERTA = vm.datos.BLOCK_DIRECCION_VIVIENDA.PUERTA;
                vm.objDirCom.NUMERO = vm.datos.BLOCK_DIRECCION_VIVIENDA.NU_NUMERO;
                vm.objDirCom.NOMBRE_VIA = vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_DIRECCION;
                vm.objDirCom.CO_MUNICIPIO = vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_MUNICIPIO;
                vm.objDirCom.CO_VIA = vm.getCoVia();
                vm.objDirCom.CO_PROVINCIA = vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_PROVINCIA;

                //Resetear el campo de antiguo
                vm.antiguo = false;

                HogarService.getDatosCatastralesDir(vm.objDirCom, vm.codAseguradora)
                    .then(function successCallback(response) {

                        if (response.data != undefined) {                    
                            if (response.data.ID_RESULT == 0) {
                            	vm.dirNormViv = true;
                                vm.datosCatastrales = response.data.DATOS_CATASTRALES;
                                vm.valorAnoConstruccion = vm.datosCatastrales.NU_ANYO_CONSTRUCCION;
                                vm.valorSuperficie = vm.datosCatastrales.NU_SUPERFICIE;

                                if (vm.datosCatastrales.NU_ANYO_CONSTRUCCION != null && (new Date().getFullYear() - vm.datosCatastrales.NU_ANYO_CONSTRUCCION) >= 100) {
                                    vm.antiguo = true;
                                }

                                if (vm.datos.BLOCK_INFORMACION_VIVIENDA == undefined) {
                                    vm.datos.BLOCK_INFORMACION_VIVIENDA = {};
                                }
                                if (vm.datos.BLOCK_DIRECCION_VIVIENDA != undefined) {
                                    vm.direccionVivienda = vm.datos.BLOCK_DIRECCION_VIVIENDA;
                                    if (vm.tipoViaSeleccionada) {
                                        vm.direccionVivienda.CO_TIPO_VIA = vm.tipoViaSeleccionada.CO_TIPO_VIA;
                                        vm.direccionVivienda.DS_TIPO_VIA = vm.tipoViaSeleccionada.DS_TIPO_VIA;
                                        vm.direccionVivienda.ID_TIPO_VIA = vm.tipoViaSeleccionada.ID_TIPO_VIA;
                                    }
                                }

                                if (vm.antiguo == true && vm.datos != null && vm.datos.BLOCK_INFORMACION_VIVIENDA != null) {
                                    vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_RENOVACION = "0";
                                }

                                vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION = vm.datosCatastrales.NU_ANYO_CONSTRUCCION;
                                vm.datos.BLOCK_INFORMACION_VIVIENDA.CO_REFERENCIA = vm.datosCatastrales.CO_REFERENCIA;

                                var condicionIf = null;
                                if (vm.apisSL == false) {
                                    condicionIf = vm.datosCatastrales.LISTA_CONSTRUCCIONES != undefined;
                                } else {
                                    condicionIf = vm.datosCatastrales.LISTA_CONSTRUCCIONES != undefined && vm.codAseguradora == 2;
                                }

                                if (condicionIf) {
                                    sumaSuperficie = 0;
                                    sumaAnexos = 0;
                                    for (var i = 0; i < vm.datosCatastrales.LISTA_CONSTRUCCIONES.length; i++) {
                                        switch (vm.datosCatastrales.LISTA_CONSTRUCCIONES[i].NO_TIPO_USO) {
                                            case 'VIVIENDA':
                                                sumaSuperficie += vm.datosCatastrales.LISTA_CONSTRUCCIONES[i].NU_SUPERFICIE;
                                                break;
                                            case 'ELEMENTOS COMUNES':
                                                vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_METROS_COMUNES = vm.datosCatastrales.LISTA_CONSTRUCCIONES[i].NU_SUPERFICIE;
                                                break;
                                            case 'APARCAMIENTO':
                                            case 'ALMACEN':
                                                sumaAnexos += vm.datosCatastrales.LISTA_CONSTRUCCIONES[i].NU_SUPERFICIE;
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    vm.datos.BLOCK_INFORMACION_VIVIENDA.CA_METROS_CUADRADOS = sumaSuperficie;
                                    vm.datos.BLOCK_INFORMACION_VIVIENDA.IM_SUPERFICIE_ANEXA = sumaAnexos;
                                } else {
                                    var sumaSuperficie = 0;
                                    if (vm.datosCatastrales.NU_SUPERFICIE != null) {
                                        sumaSuperficie += vm.datosCatastrales.NU_SUPERFICIE;
                                    }
                                    vm.datos.BLOCK_INFORMACION_VIVIENDA.CA_METROS_CUADRADOS = sumaSuperficie;
                                }
                                
                            }else if(response.data.ID_RESULT == 107){
                                    msg.textContent("No se han encontrado resultados con los datos introducidos. Es posible que no puedas finalizar la contratación.");
                                    $mdDialog.show(msg)
                                    vm.dirNormViv = false;
                                    vm.dirEleg = false;
                                    vm.direccionValida = false;
                            } else {
                                msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.dirNormViv = false;
                                vm.dirEleg = false;
                                vm.direccionValida = false;
                                vm.textoBusquedaNombreVia = "";

                                //Comprobar si la vivienda es antigua para mostrar el check de reforma, en BBVA
                                if (vm.codAseguradora == 2 && vm.datos && vm.datos.BLOCK_INFORMACION_VIVIENDA && vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION != null && (new Date().getFullYear() - vm.datos.BLOCK_INFORMACION_VIVIENDA.NU_ANIO_CONSTRUCCION) >= 100) {
                                    vm.antiguo = true;
                                }
                            }
                        }
                    });
            	}
        	}

        vm.checkDocument = function (bloque, form) {
            var valValue = false;
            if (vm.datos[bloque] != null && vm.datos[bloque].ID_TIPO_DOCUMENTO != null && vm.datos[bloque].NU_DOCUMENTO != null) {
                ClienteService.validaTipoDocumento({
                        'NU_DOCUMENTO': vm.datos[bloque].NU_DOCUMENTO,
                        'ID_TIPO_DOCUMENTO': vm.datos[bloque].ID_TIPO_DOCUMENTO
                    })
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            if (vm[form] && vm[form].documentNumber && response.data != null) {
                                vm[form].documentNumber.$setValidity('docValidation', response.data);
                            }
                        }
                    }, function callBack(response) {
                        vm[form].documentNumber.$setValidity('docValidation', false);
                    });
            }
        }

        vm.changeDocumento = function (bloque) {
        	//Si se ha seleccionado NIF, marcar como nacionalidad España
        	if (vm.datos[bloque].ID_TIPO_DOCUMENTO == 1) {
        		vm.datos[bloque].CO_NACIONALIDAD = 'ESP';
        		if (vm.datos.DATOS_TOMADOR.NO_NOMBRE == null && vm.camposEditablesContratacion.NO_NOMBRE == false && vm.clienteBuscado.NO_NOMBRE != null) {
					vm.datos.DATOS_TOMADOR.NO_NOMBRE = vm.clienteBuscado.NO_NOMBRE;
				}
        	} 
        	//Si se ha marcado NIE, desmarcar España y no poder seleccionarlo
        	else if (vm.datos[bloque].ID_TIPO_DOCUMENTO == 4) {
        		vm.datos[bloque].CO_NACIONALIDAD = null;
        	}
        	else if (vm.datos[bloque].ID_TIPO_DOCUMENTO == 2 && bloque == "DATOS_TOMADOR") {
        		vm.datos.DATOS_TOMADOR.FD_NACIMIENTO = null;
        		vm.datos.DATOS_TOMADOR.NO_NOMBRE = null;
        	}
        }

        vm.abrirAccesoMovistar = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'presupuesto/form.presupuesto.modal/protocolo_acceso_movistar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                //targetEvent: ev,
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

                    md.$onInit = function () {
                        md.datos = vm.datos;
                    }

                    md.buscarCliente = function () {
                        vm.documentoBuscado = true;
                        md.loadCliente = true;
                        md.clienteEncontradoMovistar = null;
                        ClienteService.getClienteMovistar({
                                NU_DOCUMENTO: vm.datos.DATOS_TOMADOR.NU_DOCUMENTO
                            })
                            .then(function successCallback(data) {
                                if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {

                                    var cliente = data.data;
                                    vm.clienteBuscado = cliente;
                                    vm.datos.DATOS_TOMADOR = cliente;
                                    vm.camposEditablesContratacion = {
                                        ID_TIPO_DOCUMENTO: (cliente.ID_TIPO_DOCUMENTO == null || cliente.ID_TIPO_DOCUMENTO == "") ? true : false,
                                        NU_DOCUMENTO: true,
                                        CO_NACIONALIDAD: (cliente.CO_NACIONALIDAD == null || cliente.CO_NACIONALIDAD == "") ? true : false,
                                        NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                                        NO_APELLIDO1: true,
                                        FD_NACIMIENTO: (cliente.FD_NACIMIENTO == null || cliente.FD_NACIMIENTO == "") ? true : false,
                                        NO_EMAIL: true,
                                        NU_TELEFONO: true,
                                        CO_IBAN: true
                                    }

                                    if (cliente.NU_TELEFONO1 != null && cliente.NU_TELEFONO1 != "") {
                                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_TELEFONO1;
                                        vm.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_TELEFONO1;
                                    } else if (cliente.NU_FAX != null && cliente.NU_FAX != "") {
                                        vm.objPres.PRESUPUESTO.HOGAR.NU_TELEFONO = cliente.NU_FAX;
                                        vm.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_FAX;
                                    }

                                    if (cliente.ID_TIPO_DOCUMENTO == 1 && cliente.CO_NACIONALIDAD == null) {
                                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_TOMADOR.CO_NACIONALIDAD = "ESP";
                                        vm.datos.DATOS_TOMADOR.CO_NACIONALIDAD = "ESP";
                                    }

                                    if (cliente.LIST_CUENTASBANCARIAS != null && cliente.LIST_CUENTASBANCARIAS.length > 0 && vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                                        if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                        }
                                        if (cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.CO_IBAN = cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN;
                                            vm.camposEditablesContratacion.CO_IBAN = true;
                                        }
                                    }
                                    if (cliente.NO_APELLIDO1 != null && cliente.NO_APELLIDO2 != null) {
                                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_TOMADOR.NO_APELLIDO1 = cliente.NO_APELLIDO1 + " " + cliente.NO_APELLIDO2;
                                    }

                                    if (vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                                        if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                        }
                                        var titular = cliente.NO_NOMBRE;
                                        if (cliente.NO_APELLIDO1 != null) {
                                            titular += " " + cliente.NO_APELLIDO1;
                                        }
                                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR = titular;
                                        vm.camposEditablesContratacion.NO_TITULAR = true;
                                    }

                                    md.clienteEncontradoMovistar = true;
                                    md.cancel();
                                } else {
                                    vm.camposEditablesContratacion = {
                                        ID_TIPO_DOCUMENTO: true,
                                        NU_DOCUMENTO: true,
                                        CO_NACIONALIDAD: true,
                                        NO_NOMBRE: true,
                                        NO_APELLIDO1: true,
                                        FD_NACIMIENTO: true,
                                        NO_EMAIL: true,
                                        NU_TELEFONO: true,
                                        CO_IBAN: true
                                    }
                                    md.clienteEncontradoMovistar = false;
                                }
                                md.loadCliente = false;
                            }, function callBack(response) {
                                md.loadCliente = false;
                            });
                    }

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                }]
            });
        }

        vm.buscarClienteContratacion = function () {
            vm.documentoBuscadoContratacion = true;
            vm.clienteEncontradoContratacion = null;

            //Eliminar datos del tomador
            for (var campo in vm.datos.DATOS_TOMADOR) {
                if (campo != "NU_DOCUMENTO") {
                    vm.datos.DATOS_TOMADOR[campo] = null;
                }
            }

            if (vm.datos.DATOS_TOMADOR.NU_DOCUMENTO != undefined && vm.datos.DATOS_TOMADOR.NU_DOCUMENTO != "") {
                vm.loadClienteContratacion = true;
                ClienteService.getCliente({
                        NU_DOCUMENTO: vm.datos.DATOS_TOMADOR.NU_DOCUMENTO
                    })
                    .then(function successCallback(data) {
                        if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                            vm.clienteEncontradoContratacion = true;

                            var cliente = data.data;
                            vm.clienteBuscado = cliente;
                            vm.datos.DATOS_TOMADOR = cliente;
                            vm.camposEditablesContratacion = {
                                ID_TIPO_DOCUMENTO: (cliente.ID_TIPO_DOCUMENTO == null || cliente.ID_TIPO_DOCUMENTO == "") ? true : false,
                                NU_DOCUMENTO: true,
                                CO_NACIONALIDAD: (cliente.CO_NACIONALIDAD == null || cliente.CO_NACIONALIDAD == "") ? true : false,
                                NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                                NO_APELLIDO1: true,
                                FD_NACIMIENTO: (cliente.FD_NACIMIENTO == null || cliente.FD_NACIMIENTO == "") ? true : false,
                                NO_EMAIL: !vm.emailCorrect(cliente.NO_EMAIL) ? true : false,
                                NU_TELEFONO: (cliente.NU_TELEFONO == null || cliente.NU_TELEFONO == "") ? true : false
                            }

                            if (cliente.NU_TELEFONO1 != null && cliente.NU_TELEFONO1 != "") {
                                vm.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_TELEFONO1;
                                vm.camposEditablesContratacion.NU_TELEFONO = false;
                            } else if (cliente.NU_FAX != null && cliente.NU_FAX != "") {
                                vm.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_FAX;
                                vm.camposEditablesContratacion.NU_TELEFONO = false;
                            } else {
                                vm.camposEditablesContratacion.NU_TELEFONO = true;
                            }

                            if (cliente.ID_TIPO_DOCUMENTO == 1 && cliente.CO_NACIONALIDAD == null) {
                                vm.datos.DATOS_TOMADOR.CO_NACIONALIDAD = "ESP";
                            }

                            if (cliente.NO_APELLIDO1 != null && cliente.NO_APELLIDO2 != null) {
                                vm.datos.DATOS_TOMADOR.NO_APELLIDO1 = cliente.NO_APELLIDO1 + " " + cliente.NO_APELLIDO2;
                                vm.camposEditablesContratacion.NO_APELLIDO1 = false;
                            } else if (cliente.NO_APELLIDO1 != null && cliente.NO_APELLIDO2 == null) {
                                //Comprobamos si este apellido_1 contiene 2 apellidos, si no, dejamos editable
                                if (cliente.NO_APELLIDO1.split(" ").length > 1) {
                                    vm.camposEditablesContratacion.NO_APELLIDO1 = false;
                                } else {
                                    vm.camposEditablesContratacion.NO_APELLIDO1 = true;
                                }
                            }

                            if (cliente.LIST_CUENTASBANCARIAS != null && cliente.LIST_CUENTASBANCARIAS.length > 0) {
                                if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                    vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                }
                                if (cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
                                    vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.CO_IBAN = cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN;
                                    vm.camposEditablesContratacion.CO_IBAN = true;
                                }
                            }

                            if (vm.objPres && vm.objPres.PRESUPUESTO && vm.objPres.PRESUPUESTO.HOGAR) {
                                if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                    vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                }
                                
                                if(cliente.NO_NOMBRE == undefined || cliente.NO_NOMBRE.trim() == ""){
                                	vm.camposEditablesContratacion.NO_NOMBRE = true;
                                	vm.camposEditablesContratacion.NO_APELLIDO1 = true;
                                }
                                
                                var titular = cliente.NO_NOMBRE;
                                if (cliente.NO_APELLIDO1 != null) {
                                    titular += " " + cliente.NO_APELLIDO1;
                                    
	                                if(cliente.NO_APELLIDO1 == undefined || cliente.NO_APELLIDO1.trim() == ""){
	                                	vm.camposEditablesContratacion.NO_APELLIDO1 = true;
	                                	vm.camposEditablesContratacion.NO_NOMBRE = true;
	                                }
                                }
                                vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR = titular;
                                vm.camposEditablesContratacion.NO_TITULAR = true;
                            }

                            if (vm.formHogarTomador && vm.formHogarTomador.documentNumber) {
                                vm.formHogarTomador.documentNumber.$setValidity('docValidation', true);
                            }

                            vm.loadClienteContratacion = false;                                                    
                            
                        } else if (data.data.ID_RESULT == 103) {
                            var msg = $mdDialog.alert().multiple(true)
                                .textContent(data.data.DS_RESULT)
                                .ok('Aceptar');
                            vm.loadClienteContratacion = false;
                            vm.clienteEncontradoContratacion = false;
                            vm.documentoBuscadoContratacion = false;
                            $mdDialog.show(msg);
                        } else {
                            vm.camposEditablesContratacion = {
                                ID_TIPO_DOCUMENTO: true,
                                NU_DOCUMENTO: true,
                                CO_NACIONALIDAD: true,
                                NO_NOMBRE: true,
                                NO_APELLIDO1: true,
                                FD_NACIMIENTO: true,
                                NO_EMAIL: true,
                                NU_TELEFONO: true
                            }
                            vm.loadClienteContratacion = false;
                            vm.clienteEncontradoContratacion = false;
                        }
                    }, function callBack(response) {
                        vm.loadClienteContratacion = false;
                    });
            }
        }

        vm.emailCorrect = function (email) {
            if (email != null && email != "") {
                return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
            } else {
                return false;
            }
        }

        vm.abrirModalResumen = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/resumen_hogar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.objPresInd = vm.llave == 'contratar' && !vm.objPresInd ? JSON.parse(JSON.stringify(vm.objPres)) : vm.objPresInd;
                    md.modalidad = vm.modalidad;
                    md.garantiasOpcionales = [];
                    md.formatPrice = vm.formatPrice;
                    md.codAseguradora = vm.codAseguradora;
                    md.datos = vm.datos;
                    md.objPres = vm.objPres;
                    md.parent = vm.parent;
                    md.promocion = vm.promocion;
                    md.textoBusquedaVia = vm.textoBusquedaVia;
                    if (md.modalidad.GARANTIAS != null && md.modalidad.GARANTIAS.GARANTIA != null && md.modalidad.GARANTIAS.GARANTIA.length > 0) {
                        for (var i = 0; i < md.modalidad.GARANTIAS.GARANTIA.length; i++) {
                            if (md.modalidad.GARANTIAS.GARANTIA[i].IN_OPCIONAL == true && md.modalidad.GARANTIAS.GARANTIA[i].IN_SELECTED == true) {
                                md.garantiasOpcionales.push(md.modalidad.GARANTIAS.GARANTIA[i]);
                            }
                        }
                    } else if (md.modalidad.LIST_GARANTIA != null && md.modalidad.LIST_GARANTIA.length > 0) {
                        for (var i = 0; i < md.modalidad.LIST_GARANTIA.length; i++) {
                            if ([1079, 1081].includes(md.modalidad.LIST_GARANTIA[i].ID_GARANTIA)) {
                                md.garantiasOpcionales.push(md.modalidad.LIST_GARANTIA[i]);
                            }
                        }
                    } else if (garantiasOpcionales.length == 0) {
                        md.garantiaOpcional = 'No se han encontrado garantías opcionales';
                    }

                    md.emitir = function () {
                        vm.emitir();
                        $mdDialog.hide();
                    }

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                }]
            })
        }

        vm.comprobarDatos = function (dato) {
            if (dato == null || dato == undefined || dato == "") {
                return true;
            } else {
                return false;
            }
        }

        vm.getConsentLst = function (type) {
            let consentLst = [];
            let consentObjPresu = {
                ID_TIPO_CONSENTIMIENTO: 2,
                DS_CONSENTIMIENTO: 'Cesión de datos personales presupuesto hogar',
                FD_CONSENTIMIENTO: new Date(),
                CONSENTIMIENTO: vm.consentPresu,
                ID_ENTIDAD: vm.objPres.ID_PRESUPUESTO
            }
            let consentObj = {
                ID_TIPO_CONSENTIMIENTO: 1,
                DS_CONSENTIMIENTO: 'Cesión de datos personales contratación hogar',
                FD_CONSENTIMIENTO: new Date(),
                CONSENTIMIENTO: vm.consent,
                ID_ENTIDAD: vm.objPres.ID_PRESUPUESTO
            }

            if (type == "presupuesto" && vm.showConsentimentoPresu == true) {
                consentLst.push(consentObjPresu);
            } else if (type == "emision" && vm.showConsentimentoContra == true) {
                consentLst.push(consentObj);
            }

            return consentLst;
        }

        vm.abrirModalDocumentacion = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/documentacion_hogar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                draggable: true,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.codAseguradora = vm.codAseguradora;

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                }]
            })
        }

        vm.descargarPoliza = function () {
            if (vm.objPresInd != undefined && vm.objPresInd.NU_POLIZA != undefined) {
                vm.cargando = true;
                PolizaService.getCondiciones(vm.objPresInd.NU_POLIZA)
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            vm.cargando = false;
                            let utf8decoder = new TextDecoder();
                            var mensajeUArchivo = utf8decoder.decode(response.data);
                            if (mensajeUArchivo.search('ID_RESULT') != -1 && mensajeUArchivo.search('DS_RESULT') != -1) {
                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                if (objtMensajeUArchivo.ID_RESULT != 0) {
                                    vm.cargando = false;
                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
                                    $mdDialog.show(msg);
                                }
                            } else {

                                if (vm.codAseguradora == 2) {
                                    saveAs(new Blob([response.data]), 'Condiciones_Particulares.pdf');
                                } else {
                                    saveAs(new Blob([response.data]), "MPLSLC_condiciones_particulares_" + vm.objPresInd.NU_POLIZA + ".pdf");
                                }

                                msg.textContent('Las condiciones particulares de la póliza se han descargado correctamente')
                                $mdDialog.show(msg);
                            }
                        } else {
                            vm.cargando = false;
                            msg.textContent('Se ha producido un error al descargar las condiciones');
                            $mdDialog.show(msg);
                        }
                    }, function (error) {
                        msg.textContent('Se ha producido un error al descargar las condiciones');
                        $mdDialog.show(msg);
                        vm.cargando = false;
                    });
            }
        }

        vm.descargarPresupuesto = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'presupuesto/form.presupuesto.modal/descarga.presupuesto.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.datos = JSON.parse(JSON.stringify(vm.datos));
                    md.mensaje = null;
                    md.enviarMail = false;
                    md.documentoBuscado = vm.documentoBuscado;
                    md.camposEditablesDescarga = vm.camposEditablesDescarga;
                    md.codAseguradora = vm.codAseguradora;
                    md.consentPresu = vm.consentPresu;
                    md.showConsentimentoPresu = vm.showConsentimentoPresu;
                    md.isEdited = vm.isEdited;
                    md.existeCliente = vm.existeCliente;

                    md.$onInit = function () {
                        if (vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                            vm.objPres.PRESUPUESTO.HOGAR.CONSENTIMIENTOS = vm.getConsentLst("presupuesto");
                        }
                    }

                    md.changeConsentPresu = function () {
                        md.consentPresu = !md.consentPresu;
                        vm.consentPresu = md.consentPresu;
                        if (vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                            vm.objPres.PRESUPUESTO.HOGAR.CONSENTIMIENTOS = vm.getConsentLst("presupuesto");
                        }
                    }

                    md.descargar = function () {
                        if (md.formDownloadBudget.$valid) {


                            if (vm.modalidad != undefined && vm.objPres != undefined) {
                                for (var i = 0; i < vm.modalidad.GARANTIAS.GARANTIA.length; i++) {
                                    var garantia = vm.modalidad.GARANTIAS.GARANTIA[i];
                                    if (garantia.ID_GARANTIA == 1079) {
                                        if (vm.serLinBla == true) {
                                            garantia.IN_SELECTED = true;
                                        } else {
                                            garantia.IN_SELECTED = false;
                                        }
                                    }
                                    if (garantia.ID_GARANTIA == 1081 && vm.modalidad.ID_MODALIDAD != 244) {
                                        if (vm.serExp == true) {
                                            garantia.IN_SELECTED = true;
                                        } else {
                                            garantia.IN_SELECTED = false;
                                        }
                                    }
                                }
                                vm.modalidad.IM_PRIMA_ANUAL_TOT = vm.precioModalidad.toFixed(2);
                                if(!vm.modalidad.ID_PRODUCTO)
                                    vm.modalidad.ID_PRODUCTO = vm.modalidad.ID_COMP_RAMO_PROD;
                                md.cargar = true;
                                var obj = JSON.parse(JSON.stringify(vm.objPres));
                                obj.PRESUPUESTO.HOGAR.DATOS_TOMADOR = JSON.parse(JSON.stringify(md.datos.DATOS_TOMADOR));
                                obj.MODALIDADES.MODALIDAD = [];
                                obj.MODALIDADES.MODALIDAD.push(vm.modalidad);

                                if ($location.url().includes('area_privada')) {
                                    vm.presupuestoEnviado = true;
                                    md.setearDatosTomador();
                                    PresupuestoService.descargaPresupuestoExt(obj, false)
                                        .then(function (data) {
                                            if (data.status === 200) {
                                                let utf8decoder = new TextDecoder();
                                                var mensajeUArchivo = utf8decoder.decode(data.data);
                                                if (mensajeUArchivo.search('ID_RESULT') != -1) {
                                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                                    if (objtMensajeUArchivo.ID_RESULT != 0) {
                                                        md.mensaje = "Ha ocurrido un error en la exportación";
                                                        if (objtMensajeUArchivo.DS_RESULT != null) {
                                                            md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        }
                                                        msg.textContent(md.mensaje);
                                                        $mdDialog.show(msg);
                                                        md.cancel();
                                                        md.cargar = false;
                                                    }
                                                } else {
                                                    saveAs(new Blob([data.data], {
                                                        type: 'application/pdf'
                                                    }), vm.objPres.ID_PRESUPUESTO + '.pdf');
                                                    md.cancel();
                                                }
                                            }
                                        })
                                } else {
                                    vm.presupuestoEnviado = true;
                                    md.setearDatosTomador();
                                    PresupuestoService.descargaPresupuesto(obj, false)
                                        .then(function successCallback(response) {
                                            if (response.status == 200) {
                                                let utf8decoder = new TextDecoder();
                                                var mensajeUArchivo = utf8decoder.decode(response.data);

                                                if (mensajeUArchivo.search('ID_RESULT') != -1) {
                                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                                    if (objtMensajeUArchivo.ID_RESULT != 0) {
                                                        md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        if (objtMensajeUArchivo.DS_RESULT != null) {
                                                            md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        }
                                                        msg.textContent(md.mensaje);
                                                        $mdDialog.show(msg);
                                                        md.cancel();
                                                        md.cargar = false;
                                                    }
                                                } else {
                                                    saveAs(new Blob([response.data], {
                                                        type: 'application/pdf'
                                                    }), vm.objPres.ID_PRESUPUESTO + '.pdf');
                                                    md.cancel();
                                                }
                                                md.cargar = false;
                                            } else {
                                                md.cargar = false;
                                                md.mensaje = 'Se ha producido un error al descargar el presupuesto.';
                                                msg.textContent(md.mensaje);
                                                $mdDialog.show(msg);
                                            }
                                        }, function (error) {
                                            md.cargar = false;
                                            md.mensaje = 'Se ha producido un error al descargar el presupuesto.';
                                            msg.textContent(md.mensaje);
                                            $mdDialog.show(msg);
                                        });
                                }
                            }
                        } else {

                            md.cargar = false;
                            objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if (objFocus != undefined) {
                                objFocus.focus();
                            }
                            var msgFile = $mdDialog.alert().multiple(true)
                                .textContent('Rellene todos los campos correctamente.')
                                .ok('Aceptar');
                            $mdDialog.show(msgFile);
                        }
                    }

                    md.enviarMail = function () {
                        if (md.formDownloadBudget.$valid) {


                            if (vm.modalidad != undefined && vm.objPres != undefined) {
                                md.cargar = true;
                                vm.modalidad.IM_PRIMA_ANUAL_TOT = vm.precioModalidad.toFixed(2);
                                var obj = JSON.parse(JSON.stringify(vm.objPres));
                                obj.PRESUPUESTO.HOGAR.DATOS_TOMADOR = JSON.parse(JSON.stringify(md.datos.DATOS_TOMADOR));
                                obj.MODALIDADES.MODALIDAD = [];
                                obj.MODALIDADES.MODALIDAD.push(vm.modalidad);

                                if ($location.url().includes('area_privada')) {
                                    vm.presupuestoEnviado = true;
                                    md.setearDatosTomador();
                                    PresupuestoService.descargaPresupuestoExt(obj, true)
                                        .then(function (data) {

                                            if (data.status === 200) {
                                                let utf8decoder = new TextDecoder();
                                                var mensajeUArchivo = utf8decoder.decode(data.data);
                                                if (mensajeUArchivo.search('ID_RESULT') != -1) {
                                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                                    if (objtMensajeUArchivo.ID_RESULT != 0) {
                                                        md.mensaje = "Ha ocurrido un error en el envío";
                                                        if (objtMensajeUArchivo.DS_RESULT != null) {
                                                            md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        }
                                                        msg.textContent(md.mensaje);
                                                        $mdDialog.show(msg);
                                                        md.cancel();
                                                        md.cargar = false;
                                                    }
                                                } else {
                                                    md.cargar = false;
                                                    md.mensaje = 'Se ha enviado el presupuesto correctamente';
                                                    msg.textContent(md.mensaje);
                                                    $mdDialog.show(msg);
                                                }
                                            }
                                        })
                                } else {
                                    vm.presupuestoEnviado = true;
                                    md.setearDatosTomador();
                                    PresupuestoService.descargaPresupuesto(obj, true)
                                        .then(function successCallback(response) {
                                            if (response.status === 200) {
                                                let utf8decoder = new TextDecoder();
                                                var mensajeUArchivo = utf8decoder.decode(response.data);
                                                if (mensajeUArchivo.search('ID_RESULT') != -1) {
                                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                                                    if (objtMensajeUArchivo.ID_RESULT != 0) {
                                                        md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        if (objtMensajeUArchivo.DS_RESULT != null) {
                                                            md.mensaje = objtMensajeUArchivo.DS_RESULT;
                                                        }
                                                        msg.textContent(md.mensaje);
                                                        $mdDialog.show(msg);
                                                        md.cancel();
                                                        md.cargar = false;
                                                    }
                                                } else {
                                                    md.cargar = false;
                                                    md.mensaje = 'Se ha enviado el presupuesto correctamente';
                                                    msg.textContent(md.mensaje);
                                                    $mdDialog.show(msg);
                                                }
                                            }
                                        }, function (error) {
                                            md.cargar = false;
                                            md.mensaje = 'Se ha producido un error al enviar el presupuesto';
                                            msg.textContent(md.mensaje);
                                            $mdDialog.show(msg);
                                        });
                                }
                            }
                        } else {

                            md.cargar = false;
                            objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if (objFocus != undefined) {
                                objFocus.focus();
                            }
                            var msgFile = $mdDialog.alert().multiple(true)
                                .textContent('Rellene todos los campos correctamente.')
                                .ok('Aceptar');
                            $mdDialog.show(msgFile);
                        }
                    }

                    md.buscarCliente = function () {
                        vm.documentoBuscado = true;
                        md.clienteEncontrado = null;
                        md.loadCliente = true;

                        //Eliminar datos del tomador
                        for (var campo in md.datos.DATOS_TOMADOR) {
                            if (campo == "NU_TELEFONO" && vm.datos.DATOS_TOMADOR[campo] != null && vm.datos.DATOS_TOMADOR[campo] != "") {
                                md.datos.DATOS_TOMADOR[campo] = vm.datos.DATOS_TOMADOR.NU_TELEFONO;
                            } else if (campo != "NU_DOCUMENTO") {
                                md.datos.DATOS_TOMADOR[campo] = null;
                            }
                        }

                        ClienteService.getCliente({
                                NU_DOCUMENTO: md.datos.DATOS_TOMADOR.NU_DOCUMENTO
                            })
                            .then(function successCallback(data) {
                                if (data != null && data.data.ID_RESULT == 0 && data.data.ID_CLIENTE != null) {
                                    md.clienteEncontrado = true;

                                    var cliente = data.data;
                                    vm.clienteBuscado = cliente;
                                    md.datos.DATOS_TOMADOR = cliente;

                                    if (cliente.NO_EMAIL != null) {
                                        md.datos.DATOS_TOMADOR.NO_EMAIL2 = cliente.NO_EMAIL.slice();
                                    }

                                    vm.camposEditablesDescarga = {
                                        NO_NOMBRE: (cliente.NO_NOMBRE == null || cliente.NO_NOMBRE == "") ? true : false,
                                        NO_APELLIDO1: (cliente.NO_APELLIDO1 == null || cliente.NO_APELLIDO1 == "") ? true : false,
                                        NO_EMAIL: !vm.emailCorrect(cliente.NO_EMAIL) ? true : false,
                                        NU_TELEFONO: (cliente.NU_TELEFONO1 == null || cliente.NU_TELEFONO1 == "") ? true : false
                                    }

                                    if (cliente.NU_TELEFONO1 != null && cliente.NU_TELEFONO1 != "") {
                                        md.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_TELEFONO1;
                                    } else if (cliente.NU_FAX != null && cliente.NU_FAX != "") {
                                        md.datos.DATOS_TOMADOR.NU_TELEFONO = cliente.NU_FAX;
                                    }

                                    //Si tenemos apellido 1 y 2
                                    if (cliente.NO_APELLIDO1 != null && cliente.NO_APELLIDO2 != null) {
                                        md.datos.DATOS_TOMADOR.NO_APELLIDO1 = cliente.NO_APELLIDO1 + " " + cliente.NO_APELLIDO2;
                                    }
                                    
                                    if(cliente.NO_NOMBRE == undefined || cliente.NO_NOMBRE.trim() == ""){
                                    	vm.camposEditablesDescarga.NO_NOMBRE = true;
                                    	vm.camposEditablesDescarga.NO_APELLIDO1 = true;
                                    }
                                    if(cliente.NO_APELLIDO1 == undefined || cliente.NO_APELLIDO1.trim() == ""){
                                    	vm.camposEditablesDescarga.NO_APELLIDO1 = true;
                                    	vm.camposEditablesDescarga.NO_NOMBRE = true;
                                    }

                                    if (cliente.ID_TIPO_DOCUMENTO == 1 && cliente.CO_NACIONALIDAD == null) {
                                        md.datos.DATOS_TOMADOR.CO_NACIONALIDAD = "ESP";
                                    }

                                    if (cliente.LIST_CUENTASBANCARIAS != null && cliente.LIST_CUENTASBANCARIAS.length > 0 && vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                                        if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                        }
                                        if (cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.CO_IBAN = cliente.LIST_CUENTASBANCARIAS[0].CO_IBAN;
                                            if(vm.camposEditablesContratacion != undefined)
                                            	vm.camposEditablesContratacion.CO_IBAN = true;
                                        }
                                    }

                                    if (vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                                        if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                            vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                                        }
                                        var titular = cliente.NO_NOMBRE;
                                        if (cliente.NO_APELLIDO1 != null) {
                                            titular += " " + cliente.NO_APELLIDO1;
                                        }
                                        vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.NO_TITULAR = titular;
                                        if(vm.camposEditablesContratacion != undefined)
                                        	vm.camposEditablesContratacion.NO_TITULAR = true;
                                    }

                                    md.loadCliente = false;
                                } else if (data.data.ID_RESULT == 103) {
                                    var msg = $mdDialog.alert().multiple(true)
                                        .textContent(data.data.DS_RESULT)
                                        .ok('Aceptar');
                                    md.loadCliente = false;
                                    md.clienteEncontrado = false;
                                    vm.documentoBuscado = false;
                                    $mdDialog.show(msg);
                                } else {
                                    vm.camposEditablesDescarga = {
                                        NO_NOMBRE: true,
                                        NO_APELLIDO1: true,
                                        NO_EMAIL: true,
                                        NU_TELEFONO: true,
                                        CO_IBAN: true
                                    }
                                    md.loadCliente = false;
                                    md.clienteEncontrado = false;
                                }

                                md.documentoBuscado = vm.documentoBuscado;
                                md.camposEditablesDescarga = vm.camposEditablesDescarga;
                            }, function callBack(response) {
                                md.loadCliente = false;
                            });
                    }

                    md.setearDatosTomador = function () {
                        vm.documentoBuscadoContratacion = true;
                        vm.datos.DATOS_TOMADOR = md.datos.DATOS_TOMADOR;
                        vm.clienteBuscado = JSON.parse(JSON.stringify(md.datos.DATOS_TOMADOR));
                        vm.camposEditablesContratacion = {
                            ID_TIPO_DOCUMENTO: (md.datos.DATOS_TOMADOR.ID_TIPO_DOCUMENTO == null || md.datos.DATOS_TOMADOR.ID_TIPO_DOCUMENTO == "") ? true : false,
                            NU_DOCUMENTO: (md.datos.DATOS_TOMADOR.NU_DOCUMENTO == null || md.datos.DATOS_TOMADOR.NU_DOCUMENTO == "") ? true : false,
                            CO_NACIONALIDAD: (md.datos.DATOS_TOMADOR.CO_NACIONALIDAD == null || md.datos.DATOS_TOMADOR.CO_NACIONALIDAD == "") ? true : false,
                            NO_NOMBRE: (md.datos.DATOS_TOMADOR.NO_NOMBRE == null || md.datos.DATOS_TOMADOR.NO_NOMBRE == "") ? true : false,
                            NO_APELLIDO1: true,
                            FD_NACIMIENTO: (md.datos.DATOS_TOMADOR.FD_NACIMIENTO == null || md.datos.DATOS_TOMADOR.FD_NACIMIENTO == "") ? true : false,
                            NO_EMAIL: !vm.emailCorrect(md.datos.DATOS_TOMADOR.NO_EMAIL) ? true : false,
                            NU_TELEFONO: (md.datos.DATOS_TOMADOR.NU_TELEFONO == null || md.datos.DATOS_TOMADOR.NU_TELEFONO == "") ? true : false
                        }

                        if (vm.datos.DATOS_TOMADOR.LIST_CUENTASBANCARIAS != null && vm.datos.DATOS_TOMADOR.LIST_CUENTASBANCARIAS.length > 0 && vm.objPres != null && vm.objPres.PRESUPUESTO != null && vm.objPres.PRESUPUESTO.HOGAR != null) {
                            if (vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO == null) {
                                vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO = {};
                            }
                            if (vm.datos.DATOS_TOMADOR.LIST_CUENTASBANCARIAS[0].CO_IBAN != null) {
                                vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.CO_IBAN = vm.datos.DATOS_TOMADOR.LIST_CUENTASBANCARIAS[0].CO_IBAN;
                                vm.camposEditablesContratacion.CO_IBAN = true;
                            }
                        }

                        //Si tenemos solo el primer apellido
                        if (md.datos.DATOS_TOMADOR.NO_APELLIDO1 != null) {
                            //Comprobamos si este apellido_1 contiene 2 apellidos, si no, dejamos editable
                            if (md.datos.DATOS_TOMADOR.NO_APELLIDO1.split(" ").length > 1) {
                                vm.camposEditablesContratacion.NO_APELLIDO1 = false;
                            } else {
                                vm.camposEditablesContratacion.NO_APELLIDO1 = true;
                            }
                        }
                    }

                    md.checkDocument = function (bloque, form) {
                        var valValue = false;
                        if (md.datos[bloque] != null && md.datos[bloque].NU_DOCUMENTO != null) {
                            ClienteService.validaDocumento({
                                    'NU_DOCUMENTO': md.datos[bloque].NU_DOCUMENTO
                                })
                                .then(function successCallback(response) {
                                    if (response.status == 200) {
                                        if (md[form] && md[form].documentNumber) {
                                            if (response.data.ID_RESULT != 103) {
                                                md[form].documentNumber.$setValidity('docValidation', true);
                                            } else {
                                                md[form].documentNumber.$setValidity('docValidation', false);
                                            }
                                        }
                                    }
                                }, function callBack(response) {
                                    md[form].documentNumber.$setValidity('docValidation', false);
                                });
                        }
                    }

                    md.hide = function () {
                        $mdDialog.hide();
                    };

                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                    md.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                }]
            })
        }

        vm.showRefund = function(id, type) {
        	var formaPago = vm.objPres.PRESUPUESTO.HOGAR.DATOS_PAGO.ID_FORMAPAGO;
        	var modalidad = null;
        	if(vm.codAseguradora == 2) {
                if(vm.objPres.PRESUPUESTO != undefined && vm.objPres.MODALIDADES != undefined && vm.objPres.MODALIDADES.MODALIDAD != undefined) {
                    for(var i = 0; i < vm.objPres.MODALIDADES.MODALIDAD.length; i++) {
                        if(vm.objPres.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == id) {
                            modalidad = vm.objPres.MODALIDADES.MODALIDAD[i];
                            break;
                        }
                    }
                }
            } else {
                if(vm.objPres.PRESUPUESTO != undefined && vm.objPres.MODALIDADES != undefined && vm.objPres.MODALIDADES.MODALIDAD != undefined) {
                    for(var i = 0; i < vm.objPres.MODALIDADES.MODALIDAD.length; i++) {
                        if(vm.objPres.MODALIDADES.MODALIDAD[i].ID_MODALIDAD == id && vm.objPres.MODALIDADES.MODALIDAD[i].ID_FORMAPAGO == formaPago) {
                            modalidad = vm.objPres.MODALIDADES.MODALIDAD[i];
                            break;
                        }
                    }
                }
            }
        	
        	if(modalidad && modalidad.IM_PRIMA_ANUAL)
        		return type == 'amount' ? (modalidad.IM_PRIMA_ANUAL_TOT - (modalidad.IM_PRIMA_ANUAL * parseInt(vm.rangoPromocion) / 100).toFixed(2)) : (modalidad.IM_PRIMA_ANUAL * parseInt(vm.rangoPromocion) / 100).toFixed(2);
        	else
        		return 0;
        }
        
        vm.recalcular = function(){
            vm.cargando = true;

            var obj = {
                ID_RAMO: vm.objPres.PRESUPUESTO.ID_RAMO,
                ID_PROMO: vm.promocion != null ? vm.promocion.ID_CAMPAIGN : null,
                HOGAR: vm.datos,
                ID_PRESUPUESTO: vm.idPresupuesto,
                MODALIDAD: vm.modalidad,
                NO_USUARIO: JSON.parse($window.sessionStorage.perfil).usuario
            }

            if(obj.MODALIDAD.GARANTIAS != undefined && obj.MODALIDAD.GARANTIAS.GARANTIA != undefined){
                if(vm.asisUrgHogar == true){

                    var objAsis = {
                        NO_GARANTIA: "Asistencia Urgente",
                        IN_OPCIONAL: true,
                        IN_SELECTED: true,
                        CO_COBERTURA: "AUR"
                    }

                    //Comprobamos si ya existe la garantía en el objeto
                    //Si no existe, se añade a la lista
                	var indexAsis = obj.MODALIDAD.GARANTIAS.GARANTIA.findIndex(x => x.CO_COBERTURA == "AUR");
                    if (indexAsis == -1) {
                    	obj.MODALIDAD.GARANTIAS.GARANTIA.push(objAsis);
                    }
                } else {
                	var indexAsis = obj.MODALIDAD.GARANTIAS.GARANTIA.findIndex(x => x.CO_COBERTURA == "AUR");
                    if (indexAsis > -1) {
                    	obj.MODALIDAD.GARANTIAS.GARANTIA.splice(indexAsis, 1);
                    }
                }
                
                if(vm.protJurVivienda == true){
                	var objProt = {
                        NO_GARANTIA: "Protección Jurídica de la Vivienda",
                        IN_OPCIONAL: true,
                        IN_SELECTED: true,
                        CO_COBERTURA: "PJV"
                    }

                    //Comprobamos si ya existe la garantía en el objeto
                    //Si no existe, se añade a la lista
                	var indexProt = obj.MODALIDAD.GARANTIAS.GARANTIA.findIndex(x => x.CO_COBERTURA == "PJV");
                    if (indexProt == -1) {
                    	obj.MODALIDAD.GARANTIAS.GARANTIA.push(objProt);
                    }
                } else {
                	var indexProt = obj.MODALIDAD.GARANTIAS.GARANTIA.findIndex(x => x.CO_COBERTURA == "PJV");
                    if (indexProt > -1) {
                    	obj.MODALIDAD.GARANTIAS.GARANTIA.splice(indexProt, 1);
                    }
                }
            }

            HogarService.tarifica(obj, vm.codAseguradora)
            .then(function successCallback(response) {
                if (response.data != null) {
                    if(response.data.ID_RESULT == 0) {
                        vm.objPresBU = JSON.parse(JSON.stringify(vm.objPres));
                        vm.objPres = response.data;
                        vm.retarificar = false;
                        
                        if (vm.modalidad != null) {
                            vm.seleccionarModalidad(vm.modalidad.ID_MODALIDAD);
                        }
                    }
                }
                vm.cargando = false;
            }, function errorCallback(response) {
                vm.cargando = false;
            });
        }

        vm.setRoadType = function() {
            for(var i = 0; i < vm.tipos.tiposVia.length; i++){
                if(vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA == vm.tipos.tiposVia[i].ID_TIPO_VIA){
                    vm.textoBusquedaVia = vm.tipos.tiposVia[i].DS_TIPO_VIA;
                    vm.tipoViaSeleccionada = vm.tipos.tiposVia[i];
                    
                    if(vm.objDir != null && vm.objDir != undefined && (vm.objDir.NO_TIPO_VIA == undefined || vm.objDir.NO_TIPO_VIA == null)){
                        vm.objDir.NO_TIPO_VIA = vm.tipos.tiposVia[i].CO_TIPO_VIA;
                    }

                    break;
                }
            }
        }

        vm.summaryOpts = function(opt) {
            vm.pre.busquedaPresupuesto.cerrarTab(vm.pre.detalles, opt);
            // vm.pre.busquedaPresupuesto.verDetalle(vm.pre.detalles, opt);
        }
        
        vm.valVivienda = function(){
        	vm.vivValidada = true;
        	
        	if(vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA != undefined){
        	  via = vm.tipos.tiposVia.find(x => x.ID_TIPO_VIA == vm.datos.BLOCK_DIRECCION_VIVIENDA.ID_TIPO_VIA);
        	 
        	  if(via != undefined){
        		 vm.datos.BLOCK_DIRECCION_VIVIENDA.NO_TIPO_VIA = via.DS_TIPO_VIA;
        		 vm.datos.BLOCK_DIRECCION_VIVIENDA.CO_TIPO_VIA = via.CO_TIPO_VIA;
        		 vm.datos.BLOCK_DIRECCION_VIVIENDA.DS_TIPO_VIA = via.DS_TIPO_VIA
        	  }
        	}
        	
        	vm.dirEleg = vm.datos.BLOCK_DIRECCION_VIVIENDA;
        	vm.direccionVivienda = vm.datos.BLOCK_DIRECCION_VIVIENDA;
        	vm.resumenVivienda(vm.datos.BLOCK_DIRECCION_VIVIENDA);
        }

        vm.checkPastDate = function() {
            var actualDate = new Date();
            var fechaInicio = new Date(vm.datos.DATOS_PAGO.FD_INICIO);
            actualDate.setHours(0, 0, 0);
            fechaInicio.setHours(0, 1, 0);

            if (actualDate <= fechaInicio)
                return false;
            else
                return true;
        }

    }

    ng.module('App').component('preHogarApp', Object.create(preHogarComponent));



})(window.angular);