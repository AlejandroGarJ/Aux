(function(ng) {	
	
	//Crear componente de app
    var footerComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$cookies', '$location', '$window', '$timeout', '$mdDialog', 'AuthenticationService', 'sharePropertiesService', 'FlashService', 'BASE_SRC'],
    		require:{
            }
    }
    
    footerComponente.controller = function footerComponenteController($rootScope, $cookies, $location, $window, $timeout, $mdDialog, AuthenticationService, sharePropertiesService, FlashService, BASE_SRC){
    	var vm=this;

    	this.loadTemplate=function(){
    		return "src/footer/footer.view.html"
		}
    	
    	vm.mostrarPolitica = function (tipo) {
    		$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/' + tipo + '.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;

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
    	
    }
    
    ng.module('App').component('sdFooter', Object.create(footerComponente));
    
})(window.angular);