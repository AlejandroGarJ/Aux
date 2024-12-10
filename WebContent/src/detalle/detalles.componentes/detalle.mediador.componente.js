(function (ng) {
  //Crear componente de app
  var mediadorComponent = {
    controllerAs: "$ctrl",
    template: '<div ng-include="$ctrl.loadTemplate()"></div>',
    $inject: [
      "$window",
      "$location",
      "$scope",
      "$mdDialog",
      "BusquedaService",
      "TiposService",
      "uiGridConstants",
      "BASE_SRC",
      "CommonUtils",
      "constantsTipos",
    ],
    require: {
      parent: "^sdApp",
      // parent:'^detalleSd',
      // busqueda:'^busquedaApp',
      // busquedaMediadores: '^?busquedaMediadores'
    },
  };

  mediadorComponent.controller = function mediadorComponentControler(
    $window,
    $location,
    $scope,
    $mdDialog,
    BusquedaService,
    TiposService,
    uiGridConstants,
    BASE_SRC,
    CommonUtils,
    constantsTipos
  ) {
    var vm = this;
    var url = window.location;
    vm.datos = {};
    vm.listFiles = [];
    vm.tipos = {};
    vm.listaContactos = [];
    var msg = $mdDialog.alert().clickOutsideToClose(true).ok("Aceptar");
    var msgConfirm = $mdDialog
      .confirm()
      .title("¿Quieres eliminar este elemento?")
      .ariaLabel("Lucky day")
      .ok("Acepar")
      .cancel("Cancelar");

    this.$onInit = function (bindings) {
      vm.showTable = 0;
      // vm.datos = vm.parent.datos;
      vm.load = true;
      vm.tipos.programa = [];
      vm.tipos.productos = [];
      vm.tipos.pago = [];

      //Cargar permisos
      if (vm.parent.getPermissions != undefined) {
        vm.permisos = vm.parent.getPermissions(
          $location.$$url.substring(1, $location.$$url.length)
        );
      }

      // vm.tipos.productos = JSON.parse($window.sessionStorage.perfil).productos;

      if (
        vm.parent.listServices.listMedioPago != null &&
        vm.parent.listServices.listMedioPago.length > 0
      ) {
        vm.tipos.pago = vm.parent.listServices.listMedioPago;
      } else {
        TiposService.getMedioPago({}).then(
          function successCallback(response) {
            if (response.status == 200) {
              vm.tipos.pago = response.data.TIPOS.TIPO;
              vm.parent.listServices.listMedioPago = vm.tipos.pago;
            }
          },
          function callBack(response) {
            if (response.status == 406 || response.status == 401) {
              vm.parent.logout();
            }
          }
        );
      }

      if (
        vm.parent.listServices.listProvincias != null &&
        vm.parent.listServices.listProvincias.length > 0
      ) {
        vm.tipos.provincias = vm.parent.listServices.listProvincias;
      } else {
        TiposService.getProvincias().then(
          function successCallback(response) {
            if (response.status == 200) {
              vm.tipos.provincias = response.data.TIPOS.TIPO;
              vm.parent.listServices.listProvincias = vm.tipos.provincias;
            }
          },
          function callBack(response) {
            if (response.status == 406 || response.status == 401) {
              vm.parent.pre.logout();
            }
          }
        );
      }

      TiposService.getProgramas({ IS_CONDICIONADO: true }).then(
        function successCallback(response) {
          if (response.status == 200) {
            vm.tipos.programa = response.data.TIPOS.TIPO;
          }
        },
        function callBack(response) {
          if (response.status == 406 || response.status == 401) {
            vm.parent.logout();
          }
        }
      );

      TiposService.getTipos({ ID_CODIGO: constantsTipos.TIPOS_CONTACTO }).then(
        function successCallback(response) {
          if (response.status == 200) {
            if (response.data.TIPOS != undefined) {
              vm.listTiposContacto = response.data.TIPOS.TIPO;
            }
          }
        },
        function callBack(response) {
          if (response.status == 406 || response.status == 401) {
            vm.parent.logout();
          }
        }
      );

      TiposService.getTipos({
        ID_CODIGO: constantsTipos.IN_TIPO_DESTINATARIO,
      }).then(
        function successCallback(response) {
          if (response.status == 200) {
            if (response.data.TIPOS != undefined) {
              vm.lstRecipientType = response.data.TIPOS.TIPO;
            }
          }
        },
        function callBack(response) {
          if (response.status == 406 || response.status == 401) {
            vm.parent.logout();
          }
        }
      );
    };

    this.$onChanges = function () {};

    //Cargar la plantilla de busqueda
    this.loadTemplate = function () {
      if (vm.permisos != undefined && vm.permisos.EXISTE != false) {
        return BASE_SRC + "detalle/detalles.views/detalle.mediador.html";
      } else {
        return "src/error/404.html";
      }
    };

    vm.addMediador = function () {
      if (vm.formMediador.$valid) {
        var json = vm.datos;

        vm.parent.abrirModalcargar(true);
        TiposService.altaMediador(json).then(
          function successCallBack(response) {
            if (response.status == 200) {
              if (response.data.ID_RESULT == 0) {
                msg.textContent("Mediador guardado correctamente");
                $mdDialog.show(msg);
              } else {
                msg.textContent(response.data.DS_RESULT);
                $mdDialog.show(msg);
              }
            }
          },
          function errorCallBack(response) {
            vm.status == response.status;
            vm.parent.cambiarDatosModal("Error al guardar el mediador");
          }
        );
      } else {
        objFocus = angular
          .element(".ng-empty.ng-invalid-required:visible")
          .first();
        if (objFocus != undefined) {
          objFocus.focus();
        }
        msg.textContent("Rellena los datos requeridos.");
        $mdDialog.show(msg);
      }
    };

    vm.saveMediador = function (json) {
      if (json != undefined) {
        vm.parent.abrirModalcargar(true);
        TiposService.altaMediador(json).then(
          function successCallBack(response) {
            if (response.status == 200) {
              if (response.data.ID_RESULT == 0) {
                vm.parent.cambiarDatosModal("Se ha editado correctamente");
              } else {
                vm.parent.cambiarDatosModal(response.data.DS_RESULT);
              }
            }
          },
          function errorCallBack(response) {
            vm.status == response.status;
            vm.parent.cambiarDatosModal("Error al editar el mediador");
          }
        );
      }
    };

    vm.validar = function (form2Validate) {
      if (form2Validate) {
        objFocus = angular.element(".ng-empty.ng-invalid-required:visible");
        msg.textContent(
          "Se deben rellenar correctamente los datos de este paso antes de continuar"
        );
        $mdDialog.show(msg);
        if (objFocus != undefined) {
          objFocus.focus();
        }
      } else {
        vm.addMediador();
      }
    };

    vm.anadirContacto = function () {
      var i = 0;
      var keepGoing = true;
      vm.listaContactos = vm.datos.LISTA_CONTACTOS;
      if (vm.listaContactos != undefined) {
        //Comprueba los inputs si están vacíos.
        angular.forEach(vm.listaContactos, function (value, key) {
          angular.forEach(value, function (valor, key) {
            if (keepGoing) {
              if (valor === "") {
                i++;
                if (i > 2) {
                  keepGoing = false;
                }
              } else {
                i = 0;
                return;
              }
            }
          });
        });
        //Si supera mas de 2 inputs vacíos, no se añadira nueva fila
        if (i == 0)
          vm.listaContactos.push({
            ID_TIPOCONTACTO: "",
            NO_PERSONA: "",
            NO_EMAIL: "",
            ID_PROGRAMA: "",
          });
      } else {
        //Si no tienen filas, se añade una nueva.
        vm.listaContactos = [];
        vm.listaContactos.push({
          ID_TIPOCONTACTO: "",
          NO_PERSONA: "",
          NO_EMAIL: "",
          ID_PROGRAMA: "",
        });
      }
    };

    vm.eliminarContacto = function () {
      $mdDialog.show(msgConfirm).then(
        function () {
          if (vm.contacto != undefined) {
            vm.contacto.pop();
          }
        },
        function () {}
      );
    };
  };

  ng.module("App").component("mediadorSd", Object.create(mediadorComponent));
})(window.angular);
