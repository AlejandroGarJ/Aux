(function (ng) {


    //Crear componente de app
    var movilDashboardComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', 'BASE_SRC', '$mdDialog','$window', 'validacionesService', '$location', 'sharePropertiesService', 'TiposService'],
        require: {
            parent: '^sdApp'
        }
    }



    movilDashboardComponent.controller = function movilDashboardComponentControler($q, BASE_SRC, $mdDialog, $window, validacionesService, $location, sharePropertiesService, TiposService) {
        vm = this;
        vm.db = sharePropertiesService.get('db');
        vm.rol = $window.sessionStorage.rol;
        
        this.$onInit = function () {

            //Cargar permisos
    		if(vm.parent.getPermissions != undefined) {
                vm.permisos = vm.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    		}

			TiposService.getTipoDocumento({})
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos={};
                    vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
                    vm.parent.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
			
        }

        this.redirectUrl = function (url) {
        	$location.path(url);
        	$location.replace(url);
        	//window.location.replace("#!/recibos_devueltos_list?" + id);
        }
        
        this.loadTemplate = function() {
            //if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return "src/movil/movil_dashboard.view.html";
            //} else {
            //    return 'src/error/404.html';
            //}
        }

    }

    

    ng.module('App').component('sdMovilDashboard', Object.create(movilDashboardComponent));

})(window.angular);