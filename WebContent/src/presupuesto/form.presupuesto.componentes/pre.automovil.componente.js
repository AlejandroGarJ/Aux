(function (ng) {


    //Crear componente de app
    var preAutoComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['BASE_SRC', '$rootScope', '$location', '$timeout', '$mdDialog', '$mdToast', 'PresupuestoService', 'BusquedaService','PolizaService', 'TiposService', 'MotorService', 'LocalidadesService', 'ValidacionPagoService', 'HogarService'],
        require: {
            parent: '^sdApp',
            pre: '^sdPresupuesto',
            clave: '^busquedaPresupuesto'
        },
        bindings: {
            tipo: '<',
            tarifas: '<'

        }
    }

    preAutoComponent.controller = function preAutoComponentControler(BASE_SRC, $rootScope, $location, $timeout, $mdDialog, $mdToast, PresupuestoService, PolizaService, BusquedaService, TiposService, MotorService, LocalidadesService, ValidacionPagoService, HogarService) {
        var vm = this;
        vm.calendar = {};
        vm.form = {};
        vm.indice = 1;
        vm.tiposSolicitud = [];
        vm.tipos = {};
        var x2js = new X2JS();
        vm.newAccesorio = [];
        vm.formulario = "";
        var aux = {};
        vm.tipoBanco = "IBAN";
        vm.accesorios = [];
        vm.noChangeConductor = true;
        //vm.form.ID_CATEGORIA = 1;

        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

        vm.tiposConductor = [{
            "TIPO_CONDUCTOR": "DATOS_TOMADOR",
            "IS_TOMADOR": "IN_TOMADOR_ES_PAGADOR"
        }, {
            "TIPO_CONDUCTOR": "DATOS_CONDUCTOR_PRINCIPAL",
            "IS_TOMADOR": "IN_TOMADOR_ES_PRINCIPAL"
        }, {
            "TIPO_CONDUCTOR": "DATOS_PROPIETARIO",
            "IS_TOMADOR": "IN_TOMADOR_ES_PROPIETARIO"
        }, {
            "TIPO_CONDUCTOR": "DATOS_CONDUCTOR_OCASIONAL",
            "IS_TOMADOR": "IN_CONDUCTOR_OCASIONAL"
        }];

        this.$onInit = function () {
            vm.isTomador = ["llenar", 0, 0, 0];
            vm.isAsegurado = 1;
            vm.isSeleccionada = false;

            if (vm.clave.parent.url == 'presupuestos') {
                vm.medidaResumen = 207; //137
                vm.medidaEdicion = 294; //223
            } else if (vm.clave.parent.url == 'clientes') {
                vm.medidaResumen = 246; //176
                vm.medidaEdicion = 333; //262
            }

            MotorService.getMarcas(vm.tipo)
                .then(function successCallback(response) {
                    vm.marcas = response.data.MARCA;
                });
            
            TiposService.getNoField("categorias")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.categorias = response.data.FIELD;
                }
            });
            TiposService.getNoField("sexo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.sexo = response.data.FIELD;
                }
            });    
            TiposService.getNoField("usoVehiculo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.usoVehiculo = response.data.FIELD;
                }
            });
            TiposService.getNoField("aparcamiento")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.aparcamiento = response.data.FIELD;
                }
            });
            TiposService.getNoField("kmAnuales")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.kmAnuales = response.data.FIELD;
                }
            });
            TiposService.getNoField("aniosVehiculo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.aniosVehiculo = response.data.FIELD;
                }
            });
            TiposService.getNoField("accesorioVehiculo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.accesorioVehiculo = response.data.FIELD;
                }
            });
            TiposService.getNoField("tipoMatricula")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.tipoMatricula = response.data.FIELD;
                }
            });        
            TiposService.getNoField("tiempoCia")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.tiempoCia = response.data.FIELD;
                }
            });
            TiposService.getNoField("tiempoSinSiniestros")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.tiempoSinSiniestros = response.data.FIELD;
                }
            });
            TiposService.getNoField("siniestrosUltimo")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.siniestrosUltimo = response.data.FIELD;
                }
            });
            TiposService.getNoField("bonusMalus")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.bonusMalus = response.data.FIELD;
                }
            });
            TiposService.getNoField("multas")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.multas = response.data.FIELD;
                }
            });
            TiposService.getNoField("formaPago")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.formaPago = response.data.FIELD;
                }
            });
            TiposService.getNoField("capitalZurich")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.capitalZurich = response.data.FIELD;
                }
            });
            TiposService.getNoField("defensaZurich")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.defensaZurich = response.data.FIELD;
                }
            });			
            TiposService.getNoField("dtoComision")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.dtoComision = response.data.FIELD;
                }
            });	
            TiposService.getNoField("relacionPrincipal")
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.tipos.relacionPrincipal = response.data.FIELD;
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

            TiposService.getTipoDocumento({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        //Filtro para tipos de documento, eliminamos los que no correspondan
                        response.data.TIPOS.TIPO = _.remove(response.data.TIPOS.TIPO, function (value) {
                            return (value.ID_TIPO_DOCUMENTO == 1 || value.ID_TIPO_DOCUMENTO == 4);
                        });
                        vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });

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


            TiposService.getCiasAntecedentes({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.compania = response.data.FIELD;
                    }
                });

            //            TiposService.getCompania({})
            //                .then(function successCallback(response) {
            //                    if (response.status == 200) {
            //                        vm.tipos.compania = response.data.TIPOS.TIPO;
            //                    }
            //                });

//            BusquedaService.buscar({
//                    "LST_ASEGURADOS": [{
//                        "ID_CLIENTE": vm.pre.detalles.OCLIENTE.ID_CLIENTE
//                    }],
//                    "ID_RAMO": 10
//                }, "polizas")
            
                 PolizaService.getAntecedentesPlzs({
                    "LST_ASEGURADOS": [{
                        "ID_CLIENTE": vm.pre.detalles.OCLIENTE.ID_CLIENTE
                    }],
                    "ID_RAMO": 10
                })
                .then(function successCallback(response) {
                    vm.cargar = true;
                    if(vm.datos != undefined){
                    	if(vm.datos.DATOS_ASEGURADO == undefined || vm.datos.DATOS_ASEGURADO == ""){
                    		vm.datos.DATOS_ASEGURADO = {};
                    	}
                    }
                    if (response.status == 200) {
                        if (response.data.NUMERO_POLIZAS > 0) {
                            vm.tipos.polizas = response.data.POLIZAS.POLIZA;
                            vm.cargar = false;
                        	if(vm.datos.DATOS_ASEGURADO.IN_ASEGURADO_OTRA_CIA == undefined){
                        		vm.datos.DATOS_ASEGURADO.IN_ASEGURADO_OTRA_CIA = '01';
                        	}
                        }else{
                        	if(vm.datos.DATOS_ASEGURADO.IN_ASEGURADO_OTRA_CIA == undefined){
                        		vm.datos.DATOS_ASEGURADO.IN_ASEGURADO_OTRA_CIA = '02';
                        	}
                        }
                    }
                });

            //vm.cliente = vm.pre.idCliente;
            angular.forEach(vm.pre.idCliente, function (value, key) {
                vm.form[key] = [];
                if (key != "FT_USU_MOD" && key != "NO_USU_MOD") {
                    if (key == "FD_NACIMIENTO" || key == "FD_CARNET") {
                        fecha = value;
                        var n2 = value.indexOf(':');
                        values = fecha.substring(0, n2 != -1 ? n2 - 3 : fecha.length);
                        vm.form[key][0] = new Date(values);
                    } else
                        vm.form[key][0] = value;
                }
            });
            if (vm.pre.detalles.ID_PRESUPUESTO == undefined) {
                var objJSON = {};
                var cliente = vm.pre.detalles.OCLIENTE;

                if(cliente.NO_APELLIDO2!=undefined){
					nombre = cliente.NO_NOMBRE + " " + cliente.NO_APELLIDO1 + " " + cliente.NO_APELLIDO2;
				}else{
					nombre = cliente.NO_NOMBRE + " " + cliente.NO_APELLIDO1;
				}

                var DATOS_PAGADOR = {
                    "CO_NACIONALIDAD": cliente.CO_NACIONALIDAD,
                    "CO_PAIS": cliente.CO_NACIONALIDAD,
                    "DS__ID_ESTADO_CIVIL": cliente.DS_ESTADO_CIVIL,
                    "ID_TIPO_DOCUMENTO": cliente.ID_TIPO_DOCUMENTO,
                    "NO_EMAIL": cliente.NO_EMAIL,
                    "NO_NOMBRE_COMPLETO": nombre,
                    "NU_DOCUMENTO": cliente.NU_DOCUMENTO,
                    "NU_TELEFONO": cliente.NU_TELEFONO1,
                    "ID_CLIENTE": cliente.ID_CLIENTE,
                    "NO_APELLIDO2": cliente.NO_APELLIDO2,
                    "NO_APELLIDO1": cliente.NO_APELLIDO1,
                    "NO_NOMBRE": cliente.NO_NOMBRE,
                    "ID_ESTADO_CIVIL": cliente.ID_ESTADO_CIVIL,
                    "ID_SEXO": cliente.ID_SEXO
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

                objJSON = {
            		'PRESUPUESTO_AUTO': {
            			'DATOS_PAGADOR': DATOS_PAGADOR
            		}
                }
//                objJSON['PRESUPUESTO_AUTO'] = {
//                    DATOS_PAGADOR
//                };
             //   vm.pre.detalles.XM_ENVIADO = x2js.js2xml(objJSON);
                vm.datos = null;
             //   vm.datos = x2js.xml2js(vm.pre.detalles.XM_ENVIADO).PRESUPUESTO_AUTO;
                
                convertirJson(vm.datos);

                console.log('Nuevo Presupuesto, vm.datos:', vm.datos);
            } //Si el presupuesto ya existe
            else if (vm.pre.detalles != undefined && vm.pre.detalles != null) {

                aux = JSON.parse(JSON.stringify(vm.pre.detalles));

                if (vm.pre.detalles.FD_VENCIMIENTO != undefined && typeof vm.pre.detalles.FD_VENCIMIENTO === 'string') {
                    if (vm.pre.detalles.FD_VENCIMIENTO.length > 10)
                        vm.pre.detalles.FD_VENCIMIENTO = vm.pre.detalles.FD_VENCIMIENTO.substr(0, 10);
                }

                if (aux.XM_ENVIADO != undefined) {
                	vm.datos = {};
                	
                    if(vm.pre.detalles.ID_RAMO === 11) {
                        vm.datos = x2js.xml2js(aux.XM_ENVIADO).PRESUPUESTO_MOTO;
                    }
                    if(vm.pre.detalles.ID_RAMO === 10) {
                        vm.datos = x2js.xml2js(aux.XM_ENVIADO).PRESUPUESTO_AUTO;
                    }
                    if(vm.aux.XM_ENVIADO != null && vm.aux.XM_ENVIADO != undefined){
                        delete vm.aux.XM_ENVIADO;
                    }
                    vm.tarificacion = x2js.xml2js(vm.pre.detalles.XM_RESPUESTA);
                    if (vm.datos.DETALLE_ACCESORIOS != undefined) {
                        vm.numAccesorios = vm.datos.DETALLE_ACCESORIOS.NU_ACCESORIOS;
                    }
                    if (vm.datos.BLOCK_SELECCION_VEHICULO != undefined) {
                        //                    	vm.pre.form.VERSION = {};
                        //                    	for (dato in vm.datos.BLOCK_SELECCION_VEHICULO) {
                        //                    		if (dato == 'IM_VALOR' || dato == 'IM_ACCESORIOS' || dato == 'IM_VALOR_TOTAL' || dato == 'NU_POTENCIA') {
                        //                    			vm.pre.form.VERSION[dato] = vm.datos.BLOCK_SELECCION_VEHICULO[dato];
                        //                    		}
                        //                		}
                        if (vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR != undefined) {
                            vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO = vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR;
                        }
                    }

                    if (vm.tarificacion != null) {
                        if (Array.isArray(vm.tarificacion.TARIFAS.lstTarifas.TARIFA)) { //Tarifas si array u objeto único
                            vm.tarifas = vm.tarificacion.TARIFAS.lstTarifas.TARIFA;
                        } else {
                            vm.tarifas = [];
                            vm.tarifas.push(vm.tarificacion.TARIFAS.lstTarifas.TARIFA);
                        }
                    }

                    //Accesorios en presupuesto -> array
                    if (vm.numAccesorios != 0) {
                        new1 = _.toArray(vm.datos.DETALLE_ACCESORIOS); //Datos en accesorios a array
                        new2 = _.drop(new1); //Eliminamos primer indice 'NU_ACCESORIOS'
                        vm.newAccesorio = _.chunk(new2, 2); //Formamos parejas con los datos restantes 'NO_ACCESORIO1' - IM_ACCESORIO1
                    }
                    //Fin accesorios

                    if (vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31) {
                        if (vm.datos.DATOS_TOMADOR == undefined) {
                            vm.datos.DATOS_TOMADOR = {};
                            vm.datos.DATOS_TOMADOR = vm.datos.DATOS_PAGADOR;
                        } else {
                            vm.datos.DATOS_TOMADOR = vm.datos.DATOS_PAGADOR;
                        }
                    }
                    vm.datosTomador = vm.datos.DATOS_TOMADOR;
                    vm.datosTomadorCopia = JSON.parse(JSON.stringify(vm.datos.DATOS_TOMADOR));
                    vm.datosConductorPrincipal = vm.datos.DATOS_CONDUCTOR_PRINCIPAL;
                    vm.datosPropietario = vm.datos.DATOS_PROPIETARIO;
                    vm.blockVerificacionRiesgo = vm.datos.BLOCK_VERIFICACION_RIESGO;
                    vm.searchMarca = vm.datos.BLOCK_SELECCION_VEHICULO.DS__ID_MARCA_AUTO;
                    vm.searchModelo = vm.datos.BLOCK_SELECCION_VEHICULO.DS__CO_MODELO;
                    vm.searchVersion = vm.datos.BLOCK_SELECCION_VEHICULO.DS__CO_VERSION;


                    for (persona in vm.datos) {
                        for (dato in vm.datos[persona]) {
                            if (vm.datos[persona] == "")
                                vm.datos[persona] = [];
                            if ((vm.datos[persona][dato] == "true" || vm.datos[persona][dato] == "false") && dato != "IN_ASISTENCIA_VIAJE") {
                                vm.datos[persona][dato] = (vm.datos[persona][dato] == "true");
                            }
                        }
                    }
                    angular.forEach(vm.datos, function (value, key) {
                        if (key == 'DATOS_VEHICULO' || key == 'DATOS_ASEGURADO' || key == 'DATOS_TOMADOR' || key == 'DATOS_PROPIETARIO' || key == 'DATOS_CONDUCTOR_PRINCIPAL' || key == 'DATOS_CONDUCTOR_OCASIONAL' || key == 'DATOS_PAGO' || key == 'DATOS_PAGADOR') {

                            if (vm.datos[key].FD_NACIMIENTO != undefined) {

                                // if (typeof vm.datos[key].FD_NACIMIENTO === 'object') {
                                //     var momentin = moment(vm.datos[key].FD_NACIMIENTO);
                                //     vm.datos[key].FD_NACIMIENTO = momentin.format('DD-MM-YYYY');
                                // } else {
                                //     vm.datos[key].FD_NACIMIENTO = new Date(vm.datos[key].FD_NACIMIENTO.substr(0, 10));
                                // }
                                if (typeof vm.datos[key].FD_NACIMIENTO !== 'object') {
                                    vm.datos[key].FD_NACIMIENTO = new Date(vm.datos[key].FD_NACIMIENTO.substr(0, 10));
                                }
                            } else {
                                vm.datos[key].FD_NACIMIENTO = null;
                            }
                            if (vm.datos[key].FD_CARNET != undefined) {

                                // if (typeof vm.datos[key].FD_CARNET === 'object') {
                                //     var momentin = moment(vm.datos[key].FD_CARNET);
                                //     vm.datos[key].FD_CARNET = momentin.format('DD-MM-YYYY');
                                // } else {
                                //     vm.datos[key].FD_CARNET = new Date(vm.datos[key].FD_CARNET.substr(0, 10));
                                // }
                                if (typeof vm.datos[key].FD_CARNET !== 'object') {
                                    vm.datos[key].FD_CARNET = new Date(vm.datos[key].FD_CARNET.substr(0, 10));
                                }

                            } else {
                                vm.datos[key].FD_CARNET = null;
                            }
                            if (vm.datos[key].FD_INICIO != undefined) {
                                if (typeof vm.datos[key].FD_INICIO !== 'object') {
                                    vm.datos[key].FD_INICIO = new Date(vm.datos[key].FD_INICIO.substr(0, 10));
                                }
                            } else {
                                vm.datos[key].FD_INICIO = null;
                            }
                            if (vm.datos[key].FD_VENCIMIENTO != undefined) {
                                if (typeof vm.datos[key].FD_VENCIMIENTO !== 'object') {
                                    vm.datos[key].FD_VENCIMIENTO = new Date(vm.datos[key].FD_VENCIMIENTO.substr(0, 10));
                                }
                            } else {
                                vm.datos[key].FD_VENCIMIENTO = null;
                            }
                            if (vm.datos[key].FD_ADQUISICION_VEHICULO != undefined) {
                                if (typeof vm.datos[key].FD_ADQUISICION_VEHICULO !== 'object') {
                                    vm.datos[key].FD_ADQUISICION_VEHICULO = new Date(vm.datos[key].FD_ADQUISICION_VEHICULO.substr(0, 10));
                                }
                            } else {
                                vm.datos[key].FD_ADQUISICION_VEHICULO = null;
                            }
                            if (vm.datos[key].FD_MATRICULACION != undefined) {
                                if (typeof vm.datos[key].FD_MATRICULACION !== 'object') {
                                    vm.datos[key].FD_MATRICULACION = new Date(vm.datos[key].FD_MATRICULACION.substr(0, 10));
                                }
                            } else {
                                vm.datos[key].FD_MATRICULACION = null;
                            }
                        }
                    })
                } else {
                    vm.isNuevo = true;
                }
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

        this.loadTemplate = function () {
            vm.llave = vm.pre.llave;
            if (vm.llave == "presupuesto" || vm.llave == "nuevo") {
                if (vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31)
                    return "src/presupuesto/form.presupuesto.view/pre.automovilFlotas.html";
                else
                    return "src/presupuesto/form.presupuesto.view/pre.automovil.html";
            } else if (vm.llave == "contratar") {
                if (vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31)
                    return "src/presupuesto/form.presupuesto.view/pre.contratar.automovilFlotas.html";
                return "src/presupuesto/form.presupuesto.view/pre.contratar.automovil.html";
            } else if (vm.llave == "resumen") {
                if (vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31)
                    return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.automovilFlotas.html";
                return "src/presupuesto/form.presupuesto.view/resumen.view/pre.resumen.automovil.html";
            }

        }

        vm.querySearch = function (query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
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
        }

        function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                if (key != "text")
                    return (list[key].indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].indexOf(uppercaseQuery) >= 0);
            };
        }

        //Conseguir datos de marcas
        vm.getMarcas = function () {
            vm.datos.BLOCK_SELECCION_VEHICULO.NO_VEHICULO_SELECCIONADO = "";
            vm.searchMarca = "";
            vm.searchModelo = "";
            vm.searchVersion = "";
            MotorService.getMarcas(vm.datos.BLOCK_SELECCION_VEHICULO.CO_CATEGORIA)
                .then(function successCallback(response) {
                    vm.marcas = response.data.MARCA;
                });
        }

        //Conseguir datos de modelos
        vm.getModelos = function () {
            if(vm.form.MARCA != undefined && vm.form.MARCA != null && vm.form.MARCA != " "){
                if( vm.marcas != undefined){
                    vm.marca = true;
                }
            vm.datos.BLOCK_SELECCION_VEHICULO.NO_VEHICULO_SELECCIONADO = "";
            vm.searchModelo = "";
            vm.searchVersion = "";
            MotorService.getModelos(vm.datos.BLOCK_SELECCION_VEHICULO.CO_CATEGORIA, vm.form.MARCA.CO_MARCA)
                .then(function successCallback(response) {
                    vm.modelos = response.data.MODELO;
                });
            }
         }

        //Conseguir datos de versiones
        vm.getVersiones = function () {
            if(vm.form.MODELO != undefined && vm.form.MODELO != null && vm.form.MODELO != " "){
                if( vm.modelos != undefined){
                    vm.modelo = true;
                }
            vm.datos.BLOCK_SELECCION_VEHICULO.NO_VEHICULO_SELECCIONADO = "";
            vm.searchVersion = "";
            MotorService.getVersiones(vm.datos.BLOCK_SELECCION_VEHICULO.CO_CATEGORIA, vm.form.MARCA.CO_MARCA, vm.form.MODELO.CO_MODELO)
                .then(function successCallback(response) {
                    vm.versiones = response.data.VERSION;
                    for (var i = 0; i < vm.versiones.length; i++) {
                        vm.versiones[i].text = vm.versiones[i].DS_VERSION + " - F.LANZ: " + vm.versiones[i].FD_LANZAMIENTO + " - PUERTAS: " + vm.versiones[i].NU_PUERTAS + " - POT: " + vm.versiones[i].NU_POTENCIA + " - TARA: " + vm.versiones[i].NU_CILINDRADA + " - PLAZAS: " + vm.versiones[i].NU_PLAZAS;
                    }
                });
            }
        }

        vm.getVehiculoSeleccionado = function () {
            if(vm.form.MARCA != undefined && vm.form.MODELO != undefined && vm.pre.form.VERSION != undefined){
	            if (vm.datos.BLOCK_SELECCION_VEHICULO == undefined)
	                vm.datos.BLOCK_SELECCION_VEHICULO = [];
	            vm.datos.BLOCK_SELECCION_VEHICULO.NO_VEHICULO_SELECCIONADO = vm.form.MARCA.DS_MARCA + ' ' + vm.form.MODELO.DS_MODELO + ' ' + vm.pre.form.VERSION.text;
	            }
        }
        //Identificar la localidad por pueblos
        vm.updateDir = function (tipo, valor) {
            if (typeof (valor) != 'undefined') {
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
                                if (vm.localidades.length > 1) {
                                    LocalidadesService.elegirLocalidad(vm.localidades, vm.datos[tipo]);
                                } else
                                    vm.datos[tipo].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                            }

                            vm.datos[tipo].NO_LOCALIDAD = vm.localidades[0].NO_LOCALIDAD;
                            vm.datos[tipo].CO_PROVINCIA = vm.localidades[0].CO_PROVINCIA;
                            vm.datos[tipo].DS__CO_PROVINCIA = vm.localidades[0].NO_PROVINCIA;

                        }, function errorCallBack(response) {});
                }else{
                	if(vm.datos[tipo] != undefined){
                		vm.datos[tipo].NO_LOCALIDAD = null;
                        vm.datos[tipo].CO_PROVINCIA = null;
                        vm.datos[tipo].DS__CO_PROVINCIA = null;
                	}
                }
            }

        }

        //Actualizar accesorio
        vm.updateAccesorio = function () {
            vm.newAccesorio.push();
            for (x = 0; x < vm.numAccesorios; x++) {

                vm.datos.DETALLE_ACCESORIOS['NO_ACCESORIO' + (x + 1)] = vm.newAccesorio[x][0];
                vm.datos.DETALLE_ACCESORIOS['IM_ACCESORIO' + (x + 1)] = vm.newAccesorio[x][1];
            }
            vm.numAccesorios = vm.newAccesorio.length;
            vm.datos.DETALLE_ACCESORIOS.NU_ACCESORIOS = vm.numAccesorios;
        }

        //Añadir nuevo linea Accesorio limitado a 10
        vm.addAccesorio = function () {

            if (vm.numAccesorios >= 5 && vm.tarifaSeleccionada.ID_COMPANIA === "585") {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Advertencia Pelayo')
                    .htmlContent('Para incluir más de <strong>5 accesorios</strong> con Pelayo,<br> se debe realizar la emisión a través de <strong>su portal</strong>.')
                    .ok('Aceptar')
                );
            } else if (vm.numAccesorios <= 10) {
                vm.newAccesorio.push({});
            } else {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Advertencia')
                    .htmlContent('<strong>Ha alcanzado en número máximo de accesorios</strong>.')
                    .ok('Aceptar')
                );
            }
        }

        vm.calcularTotal = function () {

            var accesorios = vm.datos.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS;
            var precio = vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO;

            if (accesorios == undefined || accesorios == null)
                accesorios = 0;
            if (precio == undefined || precio == null)
                precio = 0;

            vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR_TOTAL = parseFloat(accesorios) + parseFloat(precio);

            if (vm.pre.form.VERSION != null) {
                vm.pre.form.VERSION.IM_ACCESORIOS = accesorios;
                vm.pre.form.VERSION.IM_VALOR = precio;
                vm.pre.form.VERSION.IM_VALOR_TOTAL = vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR_TOTAL;
            } else {
                msg.textContent('Seleccione primero un vehículo para calcular el valor total');
                $mdDialog.show(msg);
            }
        }

        //Mostrar modal garantías
        vm.calcularTarificacion = function () {
            var datos = {
                'PRESUPUESTO': aux
            };
          //  datos.PRESUPUESTO.XM_ENVIADO = x2js.js2xml(vm.datos);

            var callTarifas = vm.pre.tarificarPresupuestos(datos);

            callTarifas.then(function successCallback(response) {
                console.log(response.data);

                $rootScope.prop = $timeout(function () {
                    vm.calcularTarificacion(vm.datos)
                }, 10000);

                if (response.status == 200) {
                    vm.tarifas = response.data.TARIFAS;
                    vm.vista = 3;
                }

            }, function errorCallback(response) {
                console.log('Error Modal Garantias-> ', response);

            });
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

        //Comprobar si hay tarifa seleccionada
        vm.comprobarTarifaSeleccionada = function () {

            if (vm.resultadoMensaje == "ERROR" || vm.resultadoMensaje == "PRIMA") {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Advertencia')
                    .htmlContent('La tarifa seleccionada <strong>no se puede contratar</strong>')
                    .ok('Aceptar')
                );
            } else if (vm.isSeleccionada == false || vm.isSeleccionada == false) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Advertencia')
                    .htmlContent('Debe seleccionar la tarifa con la <br> que se desea hacer la <strong>contratación</strong>')
                    .ok('Aceptar')
                );
            } else {
                vm.isSeleccionada = true;
            }
        }

        //Validar Tarifa
        vm.validarTarifa = function () {

            vm.cargarValidacion = true;

            var datosLlamada = {
                'OPRESUPUESTO': vm.pre.detalles,
                'OTARIFA': vm.tarifaSeleccionada,
                'OTARIFA_INDIVIDUAL': {}
            };
            
            datosLlamada.OPRESUPUESTO.IS_CONTRATACION = true;
            var objJSON = {};
            objJSON['PRESUPUESTO_AUTO'] = vm.datos;

			for(persona in vm.datos){
				for(dato in vm.datos[persona]){
					if(vm.datos[persona][dato] == null || vm.datos[persona][dato] == undefined){
						delete vm.datos[persona][dato];
					}	
				}
			}
			
          //  datosLlamada.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);

            PresupuestoService.getTarificacionIndividual(datosLlamada)
			.then(function successCallback(response) {
				vm.cargarValidacion = false;

				if (response.status == 200) {
					if(response.data.CO_ESTADO == 0 || response.data.CO_ESTADO == 6 || response.data.ID_RESULT == 99){
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
					vm.cargarValidacion = false;
					vm.isValidada = false;
					msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
					$mdDialog.show(msg);
				}

			}, function errorCallback(response) {
				vm.cargarValidacion = false;
				vm.isValidada = false;
				msg.textContent('Ha ocurrido un error al validar. Contacte con el administrador.');
				$mdDialog.show(msg);
				if (response.status == 406 || response.status == 401) {
                       vm.parent.logout();
                   }
			});
        }

        vm.contactoEsTomador = function (valor) {
            if (vm.datos.BLOCK_VERIFICACION_RIESGO.FRANJA_HORARIA != undefined)
                var franjaHoraria = vm.datos.BLOCK_VERIFICACION_RIESGO.FRANJA_HORARIA;
            if (valor == '02' || valor == '2' || valor == 2) {
                vm.datos.BLOCK_VERIFICACION_RIESGO = {};
                vm.datos.BLOCK_VERIFICACION_RIESGO.FRANJA_HORARIA = franjaHoraria;
                vm.datos.BLOCK_VERIFICACION_RIESGO.IN_TOMADOR_ES_CONTACTO = '02';
            } else if (valor == '01' || valor == '1' || valor == 1) {
                vm.datos.BLOCK_VERIFICACION_RIESGO.IN_TOMADOR_ES_CONTACTO = '01';
            }
        }

        vm.tiposPersonas = function (conductor, isTomador, valor) {
            switch (conductor) {
	            case "DATOS_TOMADOR":
	                if (valor == "01" || valor == 1 || valor == '1') {
	                        if(vm.pre.detalles != undefined){
	                            if(vm.pre.detalles.ID_PRESUPUESTO == undefined){
	                                    if (vm.datos.DATOS_PAGADOR == undefined)
	                                        vm.datos.DATOS_PAGADOR = {};
	                                    
	                                    //Si tomador es pagador, clonar objeto
	                                    vm.datos.DATOS_TOMADOR = {};
	                                    for(var dato in vm.datos.DATOS_PAGADOR){
	                                    	vm.datos.DATOS_TOMADOR[dato] = vm.datos.DATOS_PAGADOR[dato];
	                                    }
	                            }
	                        }
	
	
	                    vm.datos[conductor][isTomador] = '01';
	                } else {
	                	if(vm.datos.DATOS_TOMADOR != undefined){
	                		vm.datos.DATOS_TOMADOR = {};
	                	}
	                    vm.datos[conductor][isTomador] = '02';
	                }
	                break;
                case "DATOS_CONDUCTOR_PRINCIPAL":
                	if(vm.noChangeConductor == true){
                		vm.noChangeConductor == false
                		if (vm.pre.idColectivo != 31 ) {
                            if (valor == "01" || valor == 1 || valor == '1') {
                                if (vm.datos.DATOS_TOMADOR == undefined)
                                    vm.datos.DATOS_TOMADOR = {};
                                
                                //Si principal es tomador, clonar objeto
                                vm.datos.DATOS_CONDUCTOR_PRINCIPAL = {};
                                for(var dato in vm.datos.DATOS_TOMADOR){
                                	vm.datos.DATOS_CONDUCTOR_PRINCIPAL[dato] = vm.datos.DATOS_TOMADOR[dato];
                                }
                                
                                vm.datos[conductor][isTomador] = '01';
                            } else {
                            	if(vm.datos.DATOS_CONDUCTOR_PRINCIPAL != undefined){
                            		vm.datos.DATOS_CONDUCTOR_PRINCIPAL = {};
                            	}
                                vm.datos[conductor][isTomador] = '02';
                            }
                        }
                        break;	
                	}
                case "DATOS_PROPIETARIO":
                    if (valor == "01" || valor == 1 || valor == '1') {
                        if (vm.datos.DATOS_TOMADOR == undefined)
                            vm.datos.DATOS_TOMADOR = {};
                        
                        //Si propietario es tomador, clonar objeto
                        vm.datos.DATOS_PROPIETARIO = {};
                        for(var dato in vm.datos.DATOS_TOMADOR){
                        	vm.datos.DATOS_PROPIETARIO[dato] = vm.datos.DATOS_TOMADOR[dato];
                        }
                        
                        vm.datos[conductor][isTomador] = '01';
                    } else {
                    	if(vm.datos.DATOS_PROPIETARIO != undefined){
                    		vm.datos.DATOS_PROPIETARIO = {};
                    	}
                        vm.datos[conductor][isTomador] = '02';
                    }
                    break;
                case "DATOS_CONDUCTOR_OCASIONAL":
                	if (valor == "01" || valor == 1 || valor == '1') {
                        vm.datos[conductor][isTomador] = '01';
                    } else
                        vm.datos[conductor][isTomador] = '02';
                    break;
            }
        }
        
        vm.validarConductores = function(){
        	
        	if(vm.datos.DATOS_CONDUCTOR_PRINCIPAL != undefined && vm.datos.DATOS_CONDUCTOR_PRINCIPAL.IN_TOMADOR_ES_PRINCIPAL == '01'){
        		vm.datos.DATOS_CONDUCTOR_PRINCIPAL = {};
                for(var dato in vm.datos.DATOS_TOMADOR){
                	vm.datos.DATOS_CONDUCTOR_PRINCIPAL[dato] = vm.datos.DATOS_TOMADOR[dato];
                }
        	}
        	if(vm.datos.DATOS_PROPIETARIO != undefined && vm.datos.DATOS_PROPIETARIO.IN_TOMADOR_ES_PROPIETARIO == '01'){
        		vm.datos.DATOS_PROPIETARIO = {};
                for(var dato in vm.datos.DATOS_TOMADOR){
                	vm.datos.DATOS_PROPIETARIO[dato] = vm.datos.DATOS_TOMADOR[dato];
                }
        	}
        	
        	vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_AUTO');
        	
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
                vm.isSeleccionada = false;
                vm.indiceFila = null;
                vm.resultadoMensaje = null;
            } else if (prima == undefined) {
                vm.resultadoMensaje = "PRIMA";
                vm.comprobarTarifaSeleccionada();
                vm.isSeleccionada = false;
                vm.indiceFila = null;
                vm.resultadoMensaje = null;
            } else {
                vm.isSeleccionada = true;
            }

        }

        vm.seleccionarPoliza = function (nuPoliza) {
        	
            if(nuPoliza != undefined && nuPoliza != null && nuPoliza != ""){
                
                vm.poliza = vm.tipos.polizas.find( data => data.ID_POLIZA == nuPoliza);
                vm.NO_COMPANIA = vm.poliza.NO_COMPANIA;
                vm.ID_COMPANIA = vm.poliza.ID_COMPANIA;
                
            for (var i = 0; i < vm.tipos.polizas.length; i++) {
                if (vm.tipos.polizas[i].ID_POLIZA == nuPoliza) {
                    if (typeof (vm.tipos.polizas[i].FD_EMISION) != 'undefined') {
                        emision = moment(vm.tipos.polizas[i].FD_EMISION);
                        actual = moment();
                        vm.diferencia = actual.diff(emision, 'years', true);
                        vm.diferencia = Math.round(vm.diferencia);
                        if (vm.diferencia < 10) {
                            vm.total = '0' + vm.diferencia.toString();
                        } else {
                            vm.total = vm.diferencia.toString();
                        }
                    } else {
                        vm.total = null;
                    }
                    vm.datos.DATOS_ASEGURADO.CA_TIEMPO_OTRA_CIA = vm.total;

                    // Comprobar tiempo sin siniestros
                    vm.comprobarSiniestros(vm.tipos.polizas[i].NU_POLIZA);
                    // Comprobar compañía anterior
                    vm.comprobarCompa(vm.tipos.polizas[i].NO_COMPANIA);

                    if (typeof (vm.tipos.polizas[i].DS_SITUA_RIESGO) != 'undefined') {
                        vm.datos.DATOS_ASEGURADO.NU_MATRICULA_ANTERIOR = vm.tipos.polizas[i].DS_SITUA_RIESGO.split('|')[0];
                    } else {
                        vm.datos.DATOS_ASEGURADO.NU_MATRICULA_ANTERIOR = null;
                    }
                    if (typeof (vm.tipos.polizas[i].FD_VENCIMIENTO) != 'undefined') {
                        vm.datos.DATOS_ASEGURADO.FD_VENCIMIENTO = new Date(vm.tipos.polizas[i].FD_VENCIMIENTO);
                    } else {
                        vm.datos.DATOS_ASEGURADO.FD_VENCIMIENTO = null;
                    }
                    if (typeof (vm.tipos.polizas[i].ID_MODALIDAD) != 'undefined') {
                        vm.datos.DATOS_ASEGURADO.ID_MODALIDAD_AUTO_ANT = vm.tipos.polizas[i].ID_MODALIDAD;
                    } else {
                        vm.datos.DATOS_ASEGURADO.ID_MODALIDAD_AUTO_ANT = null;
                    }
                    // Se está machacando el CO_FIELD del select con el ID_COMPANIA de la póliza
                    // if (typeof (vm.tipos.polizas[i].ID_COMPANIA) != 'undefined') {
                    //     vm.datos.DATOS_ASEGURADO.ID_COMPANIA_AUTO = vm.tipos.polizas[i].ID_COMPANIA;
                    // } else {
                    //     vm.datos.DATOS_ASEGURADO.ID_COMPANIA_AUTO = null;
                    // }
                    vm.datos.DATOS_ASEGURADO.NU_POLIZA = vm.tipos.polizas[i].NU_POLIZA;
                }
            }
            vm.datos.DATOS_ASEGURADO.ID_COMPANIA_AUTO = vm.poliza.CO_COMPANIA;
        }
     }
        
        vm.cambCom = function(){
            vm.datos.DATOS_ASEGURADO.ID_COMPANIA_AUTO = vm.poliza.CO_COMPANIA;
       }
        
        
        vm.comprobarSiniestros = function(nuPoliza) {
            BusquedaService.buscar({"OPOLIZA": {"NU_POLIZA": nuPoliza}}, 'siniestros')
            .then(function successCallback(response) {
                if (response.status == 200) {

                    if(response.data.NUMERO_SINIESTROS > 0) {
                        var siniestros = response.data.SINIESTROS.SINIESTRO;
                        var siniestrosOrdenados = _.sortBy(siniestros, 'FD_OCURRENCOMPANIA');
						var ultSiniestro = siniestrosOrdenados[siniestrosOrdenados.length - 1];
						var hoy = new Date();
						var difer = hoy.getFullYear() - new Date(ultSiniestro.FD_OCURRENCOMPANIA).getFullYear();
                        if(difer < 10) {
                            vm.datos.DATOS_ASEGURADO.CA_TIEMPO_SIN_SINIESTROS = '0' + difer.toString();
                        } else {
                            vm.datos.DATOS_ASEGURADO.CA_TIEMPO_SIN_SINIESTROS = difer.toString();
                        }
                        
                    } else {
                        vm.datos.DATOS_ASEGURADO.CA_TIEMPO_SIN_SINIESTROS = '00';
                    }
                }
            }, function callBack(response) {
            });
        }

        vm.comprobarCompa = function(nomCompa) {
            for(var i = 0; i < vm.tipos.compania.length; i++) {
                if(nomCompa == vm.tipos.compania[i].DS_FIELD) {
                    vm.datos.DATOS_ASEGURADO.ID_COMPANIA_AUTO = vm.tipos.compania[i].CO_FIELD;
                    break;
                }
            }
        }

        vm.contratar = function () {
           if(vm.tipoBanco == 'IBAN'){
        	   if(!ValidacionPagoService.validarIban(vm.datos.DATOS_PAGO.CO_IBAN)){
        		   msg.textContent('Número de IBAN incorrecto');
				   $mdDialog.show(msg);
        		   return false;   
        	   }
           }
           else if(vm.tipoBanco == 'bancaria'){
        	   if(!ValidacionPagoService.validarCuenta(vm.datos.DATOS_PAGO)){
        		   msg.textContent('Número de cuenta bancaria incorrecto');
				   $mdDialog.show(msg);
        		   return false;   
        	   }
           }
           
           vm.loadContratar = true;
           
		   var objJSON = {};
           objJSON['PRESUPUESTO_AUTO'] = vm.datos;

           for(persona in objJSON['PRESUPUESTO_AUTO']) {
       			for(dato in objJSON['PRESUPUESTO_AUTO'][persona]) {
       				if(objJSON['PRESUPUESTO_AUTO'][persona][dato] === '' || objJSON['PRESUPUESTO_AUTO'][persona][dato] === undefined || objJSON['PRESUPUESTO_AUTO'][persona][dato] === null || objJSON['PRESUPUESTO_AUTO'][persona][dato] === 'NaN'){
       					delete objJSON['PRESUPUESTO_AUTO'][persona][dato];
       				}
       			}
       		}

           //vm.presupuesto.OPRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);

           PresupuestoService.emitirPresupuesto(vm.presupuesto)
               .then(function successCallback(response) {
            	   vm.loadContratar = false;
            	   var txt = '';
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

        vm.actualizarNacionalidad = function (docu, cond) {
            if (docu == 1) {
                vm.datos[cond].CO_PAIS = 'ESP';
            } else {
                vm.datos[cond].CO_PAIS = vm.datos[cond].CO_PAIS;
            }
        }

        vm.calcularValores = function () {
            //            vm.datos.IM_VALOR = vm.pre.form.VERSION.IM_VALOR;
            //            vm.datos.NU_POTENCIA = vm.pre.form.VERSION.NU_POTENCIA;
            //
            //            if (vm.datos.IM_VALOR == undefined)
            //                vm.datos.IM_VALOR = 0;
            //            if (vm.datos.IM_ACCESORIOS == undefined)
            //                vm.datos.IM_ACCESORIOS = 0;
            //
            //            vm.datos.IM_VALOR_TOTAL = parseFloat(vm.datos.IM_VALOR) + parseFloat(vm.datos.IM_ACCESORIOS);

            vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO = vm.pre.form.VERSION.IM_PRECIO;
            vm.datos.BLOCK_SELECCION_VEHICULO.NU_POTENCIA = vm.pre.form.VERSION.NU_POTENCIA;

            if (vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO == undefined)
                vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO = 0;
            if (vm.datos.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS == undefined)
                vm.datos.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS = 0;

            vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR_TOTAL = parseFloat(vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO) + parseFloat(vm.datos.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS);
            vm.pre.form.VERSION.IM_VALOR = vm.datos.BLOCK_SELECCION_VEHICULO.IM_PRECIO;
            vm.pre.form.VERSION.IM_ACCESORIOS = vm.datos.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS;
            vm.pre.form.VERSION.IM_VALOR_TOTAL = vm.datos.BLOCK_SELECCION_VEHICULO.IM_VALOR_TOTAL;
        }

        //        vm.calcularTotal = function () {
        //            vm.datos.IM_VALOR_TOTAL = parseFloat(vm.datos.IM_VALOR) + parseFloat(vm.datos.IM_ACCESORIOS);
        //        }

        vm.contratarInTarificacion = function (index, detalles, tipo, tarifa) {
        	vm.indice = 1;
            vm.indiceFila = index;
            vm.tarifaSeleccionada = tarifa;
            vm.isSeleccionada = true;
            vm.clave.verDetalle(detalles, tipo);
        }
        
        //Convertir datos si están en el formato incorrecto (fechas y enteros)
        function convertirJson(jsn) {
        	var cliente = vm.pre.detalles.OCLIENTE;
            
            for(tipoCliente in vm.datos) {
                for (atrb in vm.datos[tipoCliente]) {
                    if(atrb == 'ID_CLIENTE' || atrb == 'ID_ESTADO_CIVIL' || atrb == 'ID_SEXO' || atrb == 'ID_TIPO_DOCUMENTO') {
                        if(typeof atrb === 'string') {
                            jsn[tipoCliente][atrb] = parseInt(vm.datos[tipoCliente][atrb]);
                        }
                    }
                    if(atrb == 'FD_CARNET' || atrb == 'FD_NACIMIENTO') {
                        if(typeof atrb === 'string') {
                            jsn[tipoCliente][atrb] = new Date(cliente[atrb]);
                        }
                    }
                }
            }
        }
        
        function validar(form2Validate) {
        	if (form2Validate) {
                objFocus=angular.element('.ng-empty.ng-invalid-required:visible');    
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
                        if(vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31){
                            vm.formulario = "formSubmitVehiculoFlotas";
                            validar(vm.formVehiculoFlotas);
                        }else{
                            vm.formulario = "formSubmitVehiculo";
                            validar(vm.formVehiculo);
                        }
                        break;
                    case 2:
                        if(vm.pre.idColectivo == 30 || vm.pre.idColectivo == 31){
                            vm.formulario = "formSubmitAseguradosFlotas";
                            validar(vm.formAseguradosFlotas);
                        }else{
                            vm.formulario = "formSubmitAsegurados";
                            validar(vm.formAsegurados);

                            if(!vm.formAseguradosFlotas) {
                                vm.indice = 3;
                                vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_FLOTA');
                            }
                        }
                        break;
                    case 3:
                        vm.formulario = "formSubmitSeguros";
                        validar(vm.formSeguros);    
                        break;
                    case 4:
                        vm.formulario = "formSubmitOtros";
                        validar(vm.formOtros);
                        if(!vm.formOtros){
                        	vm.indice=5;
                            vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_AUTO');	
                        }
                        break;
            
                    default:
                        vm.formulario = "formSubmitVehiculo";
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

    }

    ng.module('App').component('preAutoApp', Object.create(preAutoComponent));

})(window.angular);