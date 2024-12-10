(function (ng) {


    //Crear componente de app
    var clienteComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', 'BASE_SRC', '$mdDialog', '$translate', 'validacionesService', '$location', 'sharePropertiesService', 'TiposService', 'ClienteService', 'ColectivoService', 'LocalidadesService', 'HogarService', 'constantsTipos'],
        require: {
            parent: '^sdApp'
        }
    }



    clienteComponent.controller = function clienteComponentControler($q, BASE_SRC, $mdDialog, $translate, validacionesService, $location, sharePropertiesService, TiposService, ClienteService, ColectivoService, LocalidadesService, HogarService, constantsTipos) {
        vm = this;
        vm.db = sharePropertiesService.get('db');
        vm.tipos = {};
        vm.colectivos = {};
        vm.calendar = {};
        vm.numDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        var msgConfirm = $mdDialog.confirm()
        .title($translate.instant('MSG_WANT_DELETE'))
        .ariaLabel('Lucky day')
        .ok('Aceptar')
        .cancel('Cancelar');
        vm.navegador = bowser.name.toLowerCase();
        vm.date = new Date();
        
        this.$onInit = function () {
            if (window.location.hash == "#!/nuevo_cliente") {//Data reducido nuevo cliente, solo comprueba los campos requeridos del formulario de nuevo cliente
                $q.all({ 'datosRequest': validacionesService.getDataNuevo(), 'dictRequest': validacionesService.getDict() }).then(function (data) {
                    vm.form = data.datosRequest.data;
                    vm.form.ID_TIPO_DOCUMENTO.value = 4;
                    vm.dictionary = data.dictRequest.dict;
                    vm.loaded = true;
                });
            } else {
                $q.all({ 'datosRequest': validacionesService.getData(), 'dictRequest': validacionesService.getDict() }).then(function (data) {
                    vm.form = data.datosRequest.data;
                    vm.form.ID_TIPO_DOCUMENTO.value = 4;
                    vm.dictionary = data.dictRequest.dict;
                    vm.loaded = true;
                });
            }

            //Cargar permisos
    		if(vm.parent.getPermissions != undefined) {
                vm.permisos = vm.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    		}

    		if(vm.parent.listServices.listTipoDocumento != null && vm.parent.listServices.listTipoDocumento.length > 0){
            	vm.tipos.tiposDocumento = vm.parent.listServices.listTipoDocumento;
    		} else {
    			TiposService.getTipoDocumento({})
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
    		
            TiposService.getSexo({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.sexo = response.data.TIPOS.TIPO;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });

            if(vm.parent.listServices.listSituaCliente != null && vm.parent.listServices.listSituaCliente.length > 0){
            	vm.tipos.situaCliente = vm.parent.listServices.listSituaCliente;
    		} else {
    			TiposService.getSituaCliente({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.situaCliente = response.data.TIPOS.TIPO;
                        vm.parent.listServices.listSituaCliente = vm.tipos.situaCliente;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
    		}

            if(vm.parent.listServices.listMedioPago != null && vm.parent.listServices.listMedioPago.length > 0){
            	vm.tipos.pago = vm.parent.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.pago = response.data.TIPOS.TIPO;
                        vm.parent.listServices.listMedioPago = vm.tipos.pago;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
    		}

            if(vm.parent.listServices.listTiposVia != null && vm.parent.listServices.listTiposVia.length > 0){
            	vm.tipos.tiposVia = vm.parent.listServices.listTiposVia;
    		} else {
    			HogarService.getTiposVia({})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.tiposVia = response.data.TIPO_VIA;
                        vm.parent.listServices.listTiposVia = vm.tipos.tiposVia;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                    }
                });
    		}

            TiposService.getTipos({ "ID_CODIGO": constantsTipos.ESTADO_CIVIL })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.estadoCivil = response.data.TIPOS.TIPO;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });

            if(vm.parent.listServices.listProvincias != null && vm.parent.listServices.listProvincias.length > 0){
            	vm.tipos.provincias = vm.parent.listServices.listProvincias;
    		} else {
    			TiposService.getProvincias()
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.provincias = response.data.TIPOS.TIPO;
                        vm.parent.listServices.listProvincias = vm.tipos.provincias;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
    		}
            
            if(vm.parent.listServices.listNacionalidades != null && vm.parent.listServices.listNacionalidades.length > 0){
            	vm.tipos.paises = vm.parent.listServices.listNacionalidades;
            	if(vm.tipos.paises != undefined && vm.form != undefined && vm.form.ID_TIPO_DOCUMENTO.value != undefined && (vm.form.ID_TIPO_DOCUMENTO.value =='1' || vm.form.ID_TIPO_DOCUMENTO.value =='2')){
            		vm.autocomplete.NACIONALIDAD = vm.tipos.paises.find(element => element.CO_ISO_A3 == 'ESP');
    			}
    		} else {
    			TiposService.getNacialidades()
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        vm.tipos.paises = response.data.PAISES.PAIS;
                        vm.parent.listServices.listNacionalidades = vm.tipos.paises;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
    		}

            if(vm.parent.listServices.listColectivos != null && vm.parent.listServices.listColectivos.length > 0){
    			vm.colectivos = vm.parent.listServices.listColectivos;
    		} else {
    			ColectivoService.getListColectivos({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
    					vm.parent.listServices.listColectivos = vm.colectivos;
    				}
    			}, function callBack(response) {
    				if(response.status == 406 || response.status == 401){
    					vm.parent.logout();
    				}
    			});
    		}
            
            var bdy = document.getElementsByTagName('body');
            bdy[0].style.backgroundColor = '#fff';
        }

        this.loadTemplate = function() {
            if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return "src/cliente/cliente2.view.html";
            } else {
                return 'src/error/404.html';
            }
        }

//        this.updateModel = function (id) {
//            vm.resetErrors(id);
//            var required = "";
//            if (id == 'NU_DOCUMENTO') {
//                if (this.form.ID_TIPO_DOCUMENTO.value != "") {
//                    if (this.form.ID_TIPO_DOCUMENTO.value == "1" || this.form.ID_TIPO_DOCUMENTO.value == "4") {
//                        if (!validateCIF(this.form.NU_DOCUMENTO.value)) {
//                            required = 'Error de documento';
//                        }
//                        else vm.resetErrors(id);
//                    }
//                    else {
//                        if (!validateDNI(this.form.NU_DOCUMENTO.value)) {
//                            required = 'Error de documento';
//                        }
//                        else vm.resetErrors(id);
//                    }
//                }
//                else if (this.form.NU_DOCUMENTO.value == undefined || this.form.NU_DOCUMENTO.value == "") {
//                    vm.resetErrors(id);
//                }
//                else {
//                    required = "Elige un tipo";
//                }
//
//                this.form.NU_DOCUMENTO.$error = { required };
//            }
//            else {
//                if (this.form[id].value != "") {
//                    vm.resetErrors(id);
//                }
//            }
//        }

        vm.resetErrors = function (id) {
            vm.form[id].$error = {};
        }

        vm.changeForm = function (docu) {
            vm.changeDoc = vm.form.ID_TIPO_DOCUMENTO.value;
            console.log(vm.changeDoc);
            if (docu != undefined && docu.length === 9) {
                vm.tipoDoc(docu);
            }
            
            //this.updateModel('NU_DOCUMENTO');
            //localStorage.tipo=vm.tipoDoc;
        }
        
        vm.putMatricula = function () {
            var situa = vm.form.ID_SITUACION_LABORAL.value;
            if (situa == 1 || situa == 4 || situa == 5)
                vm.show = true;
            else
                vm.show = false;
        }

        //Identificar la localidad por código postal
        vm.updateDir = function (valor, index) {
            if (valor != undefined && valor.length == 5) {
                vm.localidades = [];
                TiposService.getLocalidades(valor)
                    .then(function successCallBack(response) {
                        if (!Array.isArray(response.data.LOCALIDAD)) {
                            vm.localidades = [];
                            vm.localidades.push(response.data.LOCALIDAD);
                        } else {
                            vm.localidades = response.data.LOCALIDAD;
                            if (vm.localidades.length > 1) {
                                LocalidadesService.elegirLocalidad(vm.localidades, vm.dirs[index]);
                            } else
                                vm.dirs[index].ID_LOCALIDAD = response.data.LOCALIDAD[0].ID_LOCALIDAD;
                        }

                        vm.dirs[index].NO_LOCALIDAD = response.data.LOCALIDAD[0].NO_LOCALIDAD;
                        vm.dirs[index].CO_PROVINCIA = response.data.LOCALIDAD[0].CO_PROVINCIA;
                        vm.dirs[index].DS__CO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;
                        vm.dirs[index].NO_PROVINCIA = response.data.LOCALIDAD[0].NO_PROVINCIA;

                    }, function errorCallBack(response) { 
                        msg.textContent('No hemos podido verificar el código postal como válido. Por favor, revísalo');
    				    $mdDialog.show(msg);
                    });
            }
        }


        vm.anadirDir = function () {
            var i = 0;
            var keepGoing = true;

            if (vm.dirs != undefined) { //Comprueba los inputs si están vacíos.
                angular.forEach(vm.dirs, function (value, key) {
                    angular.forEach(value, function (valor, key) {
                        if (key != "IN_CORRESPONDENCIA") {
                            if (keepGoing) {
                                if (valor === "") {
                                    i++;
                                    if (i > 2) {
                                        keepGoing = false;
                                    }
                                }
                                else {
                                    i = 0;
                                    return;
                                }
                            }
                        }


                    });
                });
                //Si supera mas de 6 inputs vacíos, no se añadira nueva fila
                if (i == 0)
                    vm.dirs.push({ "ID_TIPO_VIA": "", "NO_DIRECCION": "", "NU_NUMERO": "", "CO_POSTAL": "", "NO_LOCALIDAD": "", "CO_PROVINCIA": "", "IN_CORRESPONDENCIA": false, "localidades": [] });

            } else {//Si no tienen filas, se añade una nueva.
                vm.dirs = [];
                vm.dirs.push({ "ID_TIPO_VIA": "", "NO_DIRECCION": "", "NU_NUMERO": "", "CO_POSTAL": "", "NO_LOCALIDAD": "", "CO_PROVINCIA": "", "IN_CORRESPONDENCIA": false, "localidades": [] });
            }
        }

        vm.eliminarFila = function(){
        	
       	 $mdDialog.show(msgConfirm).then(function() {
       
	        	if (vm.dirs != undefined){
	        		vm.dirs.pop();
	        	}
       	   }, function() {
       		   
       	   });
       }	
        
        vm.anadirBanco = function () {
            var i = 0;
            var keepGoing = true;

            if (vm.bancos != undefined) { //Comprueba los inputs si están vacíos.
                angular.forEach(vm.bancos, function (value, key) {
                    angular.forEach(value, function (valor, key) {
                        if (keepGoing) {
                            if (valor === "") {
                                i++;
                                if (i > 6) {
                                    keepGoing = false;
                                }
                            }
                            else {
                                i = 0;
                                return;
                            }
                        }

                    });
                });
                //Si supera mas de 6 inputs vacíos, no se añadira nueva fila
                if (i == 0)
                    vm.bancos.push({ "NU_BANCO": "", "NU_SUCURSAL": "", "NU_DC": "", "NU_CUENTA": "", "CO_IBAN": "", "CO_BIC": "" });

            } else {//Si no tienen filas, se añade una nueva.
                vm.bancos = [];
                vm.bancos.push({ "NU_BANCO": "", "NU_SUCURSAL": "", "NU_DC": "", "NU_CUENTA": "", "CO_IBAN": "", "CO_BIC": "" });
            }
        }
        
        vm.eliminarFilaBan = function(){
        	
          	 $mdDialog.show(msgConfirm).then(function() {
          
   	        	if (vm.bancos != undefined){
   	        		vm.bancos.pop();
   	        	}
          	   }, function() {
          		   
          	   });
          }	

        vm.tipoDoc = function (docu) {
            if (docu != "undefined") {
                str = docu.toUpperCase().replace(/\s/, '');
                var dni = /^(\d{8})([A-Z])$/;
                var cif = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
                var nie = /^[XYZ]\d{7,8}[A-Z]$/;;

                if (dni.test(str)) {
                    vm.form.ID_TIPO_DOCUMENTO.value = 1;
                    //validateDNI(str)
                } else if (nie.test(str)) {
                    vm.form.ID_TIPO_DOCUMENTO.value = 4;
                    //validateDNI(str)
                } else if (cif.test(str)) {
                    vm.form.ID_TIPO_DOCUMENTO.value = 2;
                    //validateCIF(str)
                }
            }

        }

        vm.altaCliente = function () {
            isErrors = false;
            json = {};
            vm.arrayClientes = [];

            if(vm.formCliente.$valid == false){
                objFocus=angular.element('.ng-empty.ng-invalid-required:visible').first();
                msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
                $mdDialog.show(msg);
                if(objFocus != undefined) {
					objFocus.focus();
				}
                isErrors = true;
             }
             else
            {
                angular.forEach(vm.form, function (data, key) {
                    if(data.value instanceof Date){
						data.value=vm.parent.dateFormat(data.value);
						vm.form[key]=data.value;
					}

                    var dict = vm.dictionary[key];
                    if(dict != undefined && dict.format) {
                        if (vm.form.ID_TIPO_DOCUMENTO.value === 2) {
                            if (!validateCIF(data.value)) {
                                required = 'Error de documento';
                                isErrors = true;
                            }
                            else vm.resetErrors(key);
                        }
                        else if(vm.form.ID_TIPO_DOCUMENTO.value === 1 || vm.form.ID_TIPO_DOCUMENTO.value === 4) {
                            if (!validateDNI(data.value)) {
                                required = 'Error de documento';
                                isErrors = true;
                            }
                            else vm.resetErrors(key);
                        }
                    }
                    if(data.value != null) {
                        json[key] = data.value;
                    }
                });

                //Eliminar datos innecesarios si se ha cambiado NIF/NIE por CIF
                if(json.ID_TIPO_DOCUMENTO == 2) {
                    for(atr in json) {
                        if(atr == 'NO_APELLIDO1' || atr == 'NO_APELLIDO2' || atr == 'ID_SEXO' ||
                            atr == 'FD_NACIMIENTO' || atr == 'FD_CARNET' || atr == 'ID_SITUACION_LABORAL') {
                            if(json[atr] != undefined) {
                                delete json[atr];
                            }
                        }
                    }
                }

                if (vm.dirs != undefined) {
                    json.LIST_DOMICILIOS = vm.dirs;
                    $.each(vm.dirs, function (index, value) {
                        delete json.LIST_DOMICILIOS[index].localidades;
                        json.LIST_DOMICILIOS[index].IN_CORRESPONDENCIA = vm.dirs[index].IN_CORRESPONDENCIA ? 1 : 0;
    					if (json.LIST_DOMICILIOS[index].ID_TIPO_VIA == "") {
    						delete json.LIST_DOMICILIOS[index].ID_TIPO_VIA;
    					}
                    });
                }
                if (vm.bancos != undefined) {
                    json.LIST_CUENTASBANCARIAS = vm.bancos;
                }

                if(isErrors == false) {
                    //Comprobar si el DNI existe      
                    ClienteService.getCliente({ "NU_DOCUMENTO": json.NU_DOCUMENTO })
                    .then(function successCallBack(response) {
                        if (response.data != undefined && response.data != "" && response.data.NU_VALOR_CLIENTE != 0) {
                            msg.textContent('El cliente ya existe en la base de datos');
                            $mdDialog.show(msg);
                        } else {                      
                        	vm.parent.abrirModalcargar(true);
                            ClienteService.addCliente(json)
                            .then(function successCallBack(response) {
                                if(response.data.ID_RESULT == 0){                               
                                    vm.parent.cambiarDatosModal('Cliente registrado correctamente');
                                    console.log(response.data);
                                    angular.forEach(vm.form, function (datos, key) {
                                        vm.form[key].value = "";
                                    });
                                    vm.arrayClientes[0] = response.data;
                                    // vm.numDetalles.push(response.data);
                                    localStorage.clientes = JSON.stringify(vm.arrayClientes);
                                    $location.path('/clientes_main');
                                } else {
                                    vm.parent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
                                }
                            }, function errorCallBack(response) {
                                vm.parent.cambiarDatosModal('En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.');
                                console.log(response);
                                if (response.status == 406 || response.status == 401) {
                                    vm.parent.logout();
                                }
                            });
                        }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.parent.logout();
                        }
                    });
                }
            }
        }

        function validateCIF(doc) {
            //Quitamos el primer caracter y el ultimo digito
            var valuedoc = doc.substr(1, doc.length - 2);
    
            var suma = 0;
    
            //Sumamos las docras pares de la cadena
            for (var i = 1; i < valuedoc.length; i = i + 2) {
                suma = suma + parseInt(valuedoc.substr(i, 1));
            }
    
            var suma2 = 0;
    
            //Sumamos las docras impares de la cadena
            for (var i = 0; i < valuedoc.length; i = i + 2) {
                var result = parseInt(valuedoc.substr(i, 1)) * 2;
                if (String(result).length == 1) {
                    // Un solo caracter
                    suma2 = suma2 + parseInt(result);
                } else {
                    // Dos caracteres. Los sumamos...
                    suma2 = suma2 + parseInt(String(result).substr(0, 1)) + parseInt(String(result).substr(1, 1));
                }
            }
    
            // Sumamos las dos sumas que hemos realizado
            suma = suma + suma2;
    
            var unidad = String(suma).substr(String(suma).length - 1, 1);
            unidad = 10 - parseInt(unidad);
    
            var primerCaracter = doc.substr(0, 1).toUpperCase();
    
            if (primerCaracter.match(/^[FJKNPQRSUVW]$/)) {
                //Empieza por .... Comparamos la ultima letra
                if (String.fromCharCode(64 + unidad).toUpperCase() == doc.substr(doc.length - 1, 1).toUpperCase())
                    return true;
            } else if (primerCaracter.match(/^[XYZ]$/)) {
                //Se valida como un dni
                var newdoc;
                if (primerCaracter == "X")
                    newdoc = doc.substr(1);
                else if (primerCaracter == "Y")
                    newdoc = "1" + doc.substr(1);
                else if (primerCaracter == "Z")
                    newdoc = "2" + doc.substr(1);
                return validateDNI(newdoc);
            } else if (primerCaracter.match(/^[ABCDEFGHLM]$/)) {
                //Se revisa que el ultimo valor coincida con el calculo
                if (unidad == 10)
                    unidad = 0;
                if (doc.substr(doc.length - 1, 1) == String(unidad))
                    return true;
            }
            msg.textContent('Formato erroneo de CIF');
            $mdDialog.show(msg);
            return false;
        }
        
        vm.changeClientePotencial = function () {
        	if (vm.CLIENTE_POTENCIAL == true) {
        		vm.form.NU_DOCUMENTO.value = "";
        		vm.form.ID_TIPO_DOCUMENTO.value = '5';
        	} else {
        		vm.form.ID_TIPO_DOCUMENTO.value = null;
        	}
        }
        
        vm.checkDocument = function () {
        	var valValue = false;
        	if (vm.form != null && vm.form.ID_TIPO_DOCUMENTO.value != null && vm.form.NU_DOCUMENTO.value != null) {
        		ClienteService.validaTipoDocumento({ 'NU_DOCUMENTO': vm.form.NU_DOCUMENTO.value, 'ID_TIPO_DOCUMENTO': vm.form.ID_TIPO_DOCUMENTO.value })
				.then(function successCallback(response) {
					if(response.status == 200) {
						if (vm.formCliente && vm.formCliente.documentNumber && response.data != null) {
							vm.formCliente.documentNumber.$setValidity('docValidation', response.data);
						}
					}
				}, function callBack(response) {
					vm.formCliente.documentNumber.$setValidity('docValidation', false);
				});
        	}
        }
        
        vm.changeTipoDocumento = function () {
        	if (vm.form.ID_TIPO_DOCUMENTO.value == '4') {
        		vm.form.CO_NACIONALIDAD.value = null;
        	}
        }
        
        //Funcion para validar DNI y NIE
        function validateDNI(documento) {
            var numero, lt, ltra;
            var expresion_regular_dni_nie = /^[XYZ]?\d{5,8}[A-Z]$/;
    
            if(documento != undefined) {
                documento = documento.toUpperCase();
    
                if (expresion_regular_dni_nie.test(documento) === true) {
                    numero = documento.substr(0, documento.length - 1);
                    numero = numero.replace('X', 0);
                    numero = numero.replace('Y', 1);
                    numero = numero.replace('Z', 2);
                    //lt2 = documento.substr(0,1);
                    lt = documento.substr(documento.length - 1, 1);
                    numero = numero % 23;
                    ltra = 'TRWAGMYFPDXBNJZSQVHLCKET';
                    ltra = ltra.substring(numero, numero + 1);
                    if (ltra != lt) {
                        if (vm.form.ID_TIPO_DOCUMENTO.value === 1) {
                            msg.textContent('La letra del NIF/DNI no se corresponde');
                            $mdDialog.show(msg);
                        } else if (vm.form.ID_TIPO_DOCUMENTO.value === 4) {
                            msg.textContent('La letra no se corresponde con el NIE');
                            $mdDialog.show(msg);
                        }
    
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    if (vm.form.ID_TIPO_DOCUMENTO.value === 1) {
                        msg.textContent('NIF/DNI erroneo, formato no válido');
                        $mdDialog.show(msg);
                    } else if (vm.form.ID_TIPO_DOCUMENTO.value === 4) {
                        msg.textContent('NIE erroneo, formato no válido');
                        $mdDialog.show(msg);
                    }
                    return false;
                }
            }
        }

    }

    

    ng.module('App').component('sdCliente', Object.create(clienteComponent));

})(window.angular);