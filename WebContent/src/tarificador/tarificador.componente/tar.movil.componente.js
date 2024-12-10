(function (ng) {


    //Crear componente de app
    var tarMovilComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$window', '$q', '$mdDialog', '$location', 'BASE_SRC', 'MovilService'],
        require: {
            parent: '^sdApp'
        }
    }



    tarMovilComponent.controller = function tarMovilComponentControler($window, $q, $mdDialog, $location, BASE_SRC, MovilService) {
        vm = this;
        vm.loading = false;
        vm.price = 0;
        vm.priceFranquicia = 0;
        vm.step = 1;
        vm.calc = false;
        vm.acceptTC = false;
        vm.acceptAdds = false;
        var msg = $mdDialog.alert().clickOutsideToClose(true).ok('Aceptar');
        vm.objMovil = {};
        vm.coversWMO = [];
        vm.objMovil.modalidad = "";
        vm.isPrepoliza = false;
        vm.msgPrepoliza = "";
        vm.importesFranquicia = null;
        vm.tieneImportesFranquicia = false;
        vm.campaign = null;

        this.loadTemplate = function () {
            return "src/tarificador/tarificador.view/tar.movil.html";
        }

        this.$onInit = function () {
            vm.medidaEdicion = 167;
        }

        this.$onChanges = function () {

        }

        vm.check_num = function (num) {

            vm.nodevice = false;
            vm.nodeviceBtns = false;
            vm.objMovil.imei = null;
            vm.objMovil.opComercial = null;
            vm.objMovil.brandName = null;
            vm.selModel = null;
            vm.objMovil.saleDate = null;
            vm.price = 0;
            vm.priceFranquicia = 0;
            vm.step = 1;
            vm.dataWarning = true;
            vm.isPrepoliza = false;
            vm.msgPrepoliza = "";
            vm.importesFranquicia = null;
            vm.tieneImportesFranquicia = false;
            vm.campaign = null;

            if (num && num.toString().length == 9) {

                MovilService.uninsured_devices({msisdn: num})
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            if (response.data.code == 0) {
                                vm.lstDevices = response.data.result;
                                vm.selModel = {};
                                if (vm.lstDevices.length > 0) {
                                    if (vm.lstDevices.length == 1) {
                                        vm.objDevice = vm.lstDevices[0];
                                        vm.objMovil.brandName = vm.objDevice.brandName;
                                        vm.objMovil.imei = vm.objDevice.imei;
                                        vm.objMovil.opComercial = vm.objDevice.opComercial;
                                        vm.coversWMO = vm.objDevice.device.coversWMO;

                                        if (vm.objDevice.policyId != null && vm.objDevice.policyNumber == null) {
                                            vm.msgWarning = 'El cliente ya tiene una póliza precontratada para ese imei. Para realizar el test pulse el siguiente botón ';
                                            vm.nodevice = true;
                                            vm.nodeviceBtns = true;
                                        } else {

                                            if (vm.objDevice.creationUser == 'ONE_CLICK') {
                                                vm.objMovil.saleDate = vm.objDevice.feVentaTerminal;
                                            }

                                            if (vm.objDevice.model_aprox == 1) {
                                                if (vm.objDevice.device.jsConfiguration && JSON.parse(vm.objDevice.device.jsConfiguration).length > 0 && JSON.parse(vm.objDevice.device.jsConfiguration)[0].groupName) {
                                                    vm.check_model(JSON.parse(vm.objDevice.device.jsConfiguration)[0].groupName);
                                                }
                                            } else {
                                                vm.lstModels = [vm.objDevice.device];
                                                vm.selModel = vm.lstModels[0];

                                                if (vm.selModel != null && vm.objMovil.saleDate != null) {
                                                    // vm.rateMovil();
                                                }
                                            }
                                        }

                                    } else {
                                        /* POP UP */
                                        vm.modalDevices(vm.lstDevices);
                                    }
                                } else {
                                    vm.msgWarning = 'No se han encontrado datos del número introducido';
                                    vm.nodevice = true;
                                }
                            }
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            // vm.parent.logout();
                            // $location.path('/');
                        }
                        if (response.data != null) {
                            if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                                vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                            } else {
                                vm.msgWarning = response.data.msg;
                            }
                            vm.loading = false;
                            vm.nodevice = true;
                        }
                    });
            }
        }

        vm.check_model = function (model) {

            MovilService.model_aprox({model: model})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if (response.data.code == 0) {
                            vm.lstModels = response.data.result;

                            //Seleccionar modelo si antes ya estaba seleccionado
                            //Al cambiar de lstModels, no marca bien el modelo
                            if (vm.selModel != null && vm.selModel.modelId != null) {
                                var modelo = vm.lstModels.find(x => x.modelId == vm.selModel.modelId);
                                if (modelo != null) {
                                    vm.selModel = modelo;
                                }
                            }
                        }
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                });
        }

        vm.setFranquiciaMovil = function (obj) {
            if (obj.franquicia != null) {
                //Si en la franquicia viene JSON
                if (isNaN(parseInt(obj.franquicia))) {
                    var franquicias = JSON.parse(obj.franquicia);
                    if (franquicias.length > 0) {
                        franquicias.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));
                        vm.priceFranquicia = franquicias[0].amount;
                    } else {
                        vm.priceFranquicia = 0;
                    }
                } else {
                    vm.priceFranquicia = obj.franquicia;
                }
            } else {
                vm.priceFranquicia = 0;
            }
        }

        vm.rateMovil = function () {
            vm.nodevice = false;
            vm.objMovil.brandId = vm.selModel.brandId;
            vm.objMovil.terminalToken = vm.objDevice.token;
            vm.objMovil.budgetId = vm.objDevice.budgetId;
            vm.objMovil.codPrecom = vm.selModel.codPrecom != null ? vm.selModel.codPrecom : vm.objDevice.codPrecom;
            vm.objMovil.deviceId = vm.selModel.modelId;
            vm.objMovil.modelName = vm.selModel.modelName;
            vm.importesFranquicia = null;
            vm.tieneImportesFranquicia = false;
            vm.campaign = null;

            var obj = JSON.parse(JSON.stringify(vm.objMovil));
            obj.saleDate = vm.formatDate(vm.objMovil.saleDate);

            vm.checkRequired(obj);
            if (vm.dataWarning == false) {

                vm.calc = true;
                // vm.dataWarning = false;

                MovilService.rateMovilAP(obj)
                    .then(function successCallback(response) {
                        if (response.status == 200) {

                            if (response.data.result != null && response.data.result.franquicia != null) {
                                var objFranquicia = JSON.parse(response.data.result.franquicia);
                                if (typeof objFranquicia == "object") {
                                    vm.tieneImportesFranquicia = true;
                                    vm.importesFranquicia = {
                                        SCREEN_DAMAGE: objFranquicia.find(x => x.damageType == "SCREEN_DAMAGE") != null ? objFranquicia.find(x => x.damageType == "SCREEN_DAMAGE").amount : null,
                                        OTHER: objFranquicia.find(x => x.damageType == "OTHER") != null ? objFranquicia.find(x => x.damageType == "OTHER").amount : null,
                                        STOLEN: objFranquicia.find(x => x.damageType == "STOLEN") != null ? objFranquicia.find(x => x.damageType == "STOLEN").amount : null,
                                    }
                                }
                            }

                            if (response.data.result != null && response.data.result.campaign != null) {
                                vm.campaign = response.data.result.campaign;
                            }

                            if (response.data.code == 0) {
                                vm.price = response.data.result.receiptPrice;
                                if (vm.tieneImportesFranquicia != true) {
                                    vm.setFranquiciaMovil(response.data.result);
                                }

                                vm.calc = false;
                            } else {
                                if (response.data.result != null && response.data.result.receiptPrice != null) {
                                    vm.price = response.data.result.receiptPrice;
                                    if (vm.tieneImportesFranquicia != true) {
                                        vm.setFranquiciaMovil(response.data.result);
                                    }
                                } else {
                                    vm.price = 0;
                                    vm.priceFranquicia = 0;
                                }
                                vm.msgWarning = response.data.msg;
                                vm.nodevice = true;
                                vm.calc = false;
                            }
                        }
                    }, function callBack(response) {
                        vm.calc = false;
                        vm.loading = false;
                        vm.nodevice = true;
                        if (response.status == 406 || response.status == 401) {
                            // vm.parent.logout();
                            // $location.path('/');
                        }
                        if (response.data != null) {
                            if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                                vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                            } else {
                                vm.msgWarning = response.data.msg;
                            }
                        } else {
                            vm.msgWarning = "Ha ocurrido un error al realizar la operación.";
                        }
                    });
            }
        }

        vm.modalDevices = function (devices) {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'tarificador/tarificador.modal/dispositivos.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: false,
                escapeToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    vm.objDevice = {};

                    if (devices != undefined && devices.length > 1) {
                        md.lstDevices = devices;
                    }

                    md.selDevice = function (device) {
                        if (device != undefined) {
                            vm.objDevice = device;
                            vm.objMovil.brandName = device.brandName;
                            vm.objMovil.modelName = device.modelName;
                            vm.objMovil.imei = device.imei;
                            vm.objMovil.opComercial = device.opComercial;
                            vm.coversWMO = device.device.coversWMO;

                            if (device.policyId != null && device.policyNumber == null) {
                                vm.msgWarning = 'El cliente ya tiene una póliza precontratada para ese imei. Para realizar el test pulse el siguiente botón ';
                                vm.nodevice = true;
                                vm.nodeviceBtns = true;
                            } else {

                                if (device.creationUser == 'ONE_CLICK') {
                                    vm.objMovil.saleDate = device.feVentaTerminal;
                                }

                                if (device.model_aprox == 1) {
                                    if (device.device.jsConfiguration && JSON.parse(device.device.jsConfiguration).length > 0 && JSON.parse(device.device.jsConfiguration)[0].groupName) {
                                        vm.check_model(JSON.parse(device.device.jsConfiguration)[0].groupName);
                                    }
                                    vm.lstModels = [device.device];
                                } else {
                                    vm.lstModels = [device.device];
                                }
                                vm.selModel = device.device;
                                if (vm.selModel != null && vm.objMovil.saleDate != null) {
                                    // vm.rateMovil();
                                }
                            }

                            md.cancel();
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

        vm.validateDevice = function () {

            vm.calc = true;

            var obj = {
                'token': vm.objMovil.terminalToken,
                'in_lopd': true
            }

            MovilService.validate(obj)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if (response.data.code == 0) {
                            vm.objPres = response.data.result;
                            vm.objPres.feVentaTerminal = vm.formatDate(vm.objPres.feVentaTerminal);
                            vm.step = 2;

                            var dateNow = new Date();
                            vm.insDateFrom = vm.formatDateToShow(dateNow);
                            vm.insDateTo = vm.formatDateToShow(dateNow.setFullYear(dateNow.getFullYear() + 1));

                            vm.nombreCompleto = "";
                            if (vm.objPres.nombre != null) {
                                vm.nombreCompleto += vm.objPres.nombre;
                            }
                            if (vm.objPres.apellido_1) {
                                vm.nombreCompleto += " " + vm.objPres.apellido_1;
                            }
                            if (vm.objPres.apellido_2) {
                                vm.nombreCompleto += " " + vm.objPres.apellido_2;
                            }

                            vm.calc = false;
                        } else {
                            vm.calc = false;
                            vm.msgWarning = response.data.msg;
                            vm.nodevice = true;
                        }
                    }
                }, function callBack(response) {

                    if (response.data != null) {
                        if ((response.status === 400 || response.status === 500 || response.status === 900) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                            vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                        } else {
                            vm.msgWarning = response.data.msg;
                        }
                        vm.nodevice = true;
                        vm.calc = false;
                    }
                });
        }

        vm.contract = function () {

            if (vm.objPres.email != '' && vm.objPres.email != undefined) {
                vm.calc = true;
                vm.nodevice = false;
                vm.warningCon = false;
                var obj = {
                    'token': vm.objPres.token,
                    'email': vm.objPres.email,
                    'in_lopd': vm.acceptAdds,
                    'sendSMS': true,
                    'canal': 4
                }

                MovilService.contract(obj)
                    .then(function successCallback(response) {
                        if (response.status == 200) {
                            if (response.data.code == 0 || response.data.code == 250) {
                                vm.objPol = response.data.result;

                                for (var i = 0; i < vm.objPol.subjects.length; i++) {
                                    if (vm.objPol.subjects[i].subjectTypeCode == 'TO') {
                                        vm.objHolder = vm.objPol.subjects[i];
                                        vm.holderSurnames = vm.objHolder.surname1 + ' ' + vm.objHolder.surname2;
                                    }
                                }

                                vm.efectDate = vm.formatDateToShow(vm.objPol.efectDate);
                                vm.expirationDate = vm.formatDateToShow(vm.objPol.expirationDate);

                                vm.calc = false;
                                vm.step = 3;

                                if (response.data.code == 250) {
                                    vm.msgPrepoliza = response.data.msg;
                                    vm.isPrepoliza = true;
                                }
                            } else if (response.data.code == 205) {
                                vm.calc = false;
                                vm.msgWarning = response.data.msg;
                                vm.nodevice = true;
                                vm.step = 3;
                            } else {
                                vm.calc = false;
                                vm.msgWarning = response.data.msg;
                                vm.nodevice = true;
                            }
                        }
                    }, function callBack(response) {
                        if (response.status == 406 || response.status == 401) {
                            // vm.parent.logout();
                            // $location.path('/');
                        }
                        if (response.data != null) {
                            if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                                vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                            } else {
                                vm.msgWarning = response.data.msg;
                            }
                            vm.calc = false;
                            vm.nodevice = true;
                        }
                    });
            } else {
                if (vm.objPres.email == '' || vm.objPres.email == undefined) {
                    vm.warningCon = true;
                    vm.msgWarningCon = 'Debe indicar el email';
                }
            }
        }

        vm.sendSms = function () {

            vm.nodeviceBtns = false;

            var obj = {
                'msisdn': vm.objDevice.msisdn,
                'token': vm.objDevice.terminalToken
            }

            MovilService.sendLinkApp(obj)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if (response.data.code == 0) {
                            // response.data.result;
                            vm.msgWarning = response.data.msg;
                            vm.nodevice = true;
                        }
                    }
                }, function callBack(response) {
                    if (response.data != null) {
                        if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                            vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                        } else {
                            vm.msgWarning = response.data.msg;
                        }
                    }
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                });
        }

        vm.confirmKO = function () {

            vm.nodeviceBtns = false;

            MovilService.confirmKO({'token': vm.objDevice.token})
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        if (response.data.code == 0) {
                            // response.data.result;
                            vm.msgWarning = response.data.msg;
                            vm.nodevice = true;
                        }
                    }
                }, function callBack(response) {
                    if (response.data != null) {
                        if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                            vm.msgWarning = "CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio;
                        } else {
                            vm.msgWarning = response.data.msg;
                        }
                    }
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                });
        }

        vm.checkRequired = function (obj) {
            for (var data in obj) {
                if (obj[data] == '' || obj[data] == undefined) {
                    vm.dataWarning = true;
                    return
                } else {
                    vm.dataWarning = false;
                }
            }
        }

        vm.checkMail = function (option) {
            if (option == 'accept') {
                vm.anotherMail = false;
            } else {
                vm.anotherMail = false;
                vm.objPres.email = '';
            }
        }

        vm.sendMailConditions = function () {

            var obj = {
                'policyNumber': vm.objPol.policyNumber,
                'no_email': vm.objHolder.email,
                'token': vm.objDevice.terminalToken
            }

            MovilService.send_mail_conditions(obj)
                .then(function successCallback(response) {
                    if (response.status == 200) {
                        msg.textContent(response.data.msg);
                        $mdDialog.show(msg);
                    }
                }, function callBack(response) {
                    if (response.data != null) {
                        if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                            msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
                            $mdDialog.show(msg);
                        } else {
                            msg.textContent(response.data.msg);
                            $mdDialog.show(msg);
                        }
                    }
                    if (response.status == 406 || response.status == 401) {
                        // vm.parent.logout();
                        // $location.path('/');
                    }
                });
        }


        vm.formatDate = function (date) {
            if (date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())) {

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

        vm.formatDateToShow = function (date) {
            if (date != null && date != undefined && date != "" && !isNaN(new Date(date).getFullYear())) {

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

                return day + "/" + month + "/" + year;
            }
        }

        vm.validate = function (form2Validate) {
            if (form2Validate.$valid) {
                if (vm.step == 2) {
                    vm.contract();
                }
            } else {
                objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                if (objFocus != undefined) {
                    objFocus.focus();
                }
            }
        }

        vm.nuevoCliente = function () {
            vm.step = 1;
            vm.nodevice = false;
            vm.nodeviceBtns = false;
            vm.objMovil.imei = null;
            vm.objMovil.opComercial = null;
            vm.objMovil.brandName = null;
            vm.selModel = null;
            vm.objMovil.saleDate = null;
            vm.objMovil = {};
            vm.objMovil.modalidad = "";
            vm.price = 0;
            vm.priceFranquicia = 0;
            vm.dataWarning = true;
            vm.isPrepoliza = false;
            vm.msgPrepoliza = "";
            vm.importesFranquicia = null;
            vm.tieneImportesFranquicia = false;
            vm.campaign = null;
        }

        vm.openPoliza = function (nuPoliza) {
            $window.location.href = window.location.origin + window.location.pathname + '#!/polizas_list/?policyNumber=' + nuPoliza;
        }

        vm.navTo = function (appPath) {
            window.location = window.location.origin + window.location.pathname + appPath;
        }


    }
    ng.module('App').component('tarMovilApp', Object.create(tarMovilComponent));

})(window.angular);