(function(ng) {	

	//Crear componente de app
    var entregasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$scope', 'uiGridConstants','BASE_SRC', '$mdDialog', 'FicherosService', 'MovilService'],
    		require: {
    			appParent: '^sdApp'
    		},
            bindings: {
            	datos: '<'
            }
    }
    
    entregasComponent.controller = function entregasComponentControler($location, $scope,uiGridConstants, BASE_SRC, $mdDialog, FicherosService, MovilService){
    	var vm=this;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.archivoDescarga = null;
		vm.archivo = null;
		vm.templateString = "";
    
    	this.$onInit = function() {
    		if (vm.datos != null && vm.datos.LIST_ARCHIVOS != null && vm.datos.LIST_ARCHIVOS.length > 0) {
    			vm.archivo = vm.datos.LIST_ARCHIVOS[0];
    			if (vm.archivo.NO_ARCHIVO != null && vm.archivo.NO_RUTA != null) {
    				vm.appParent.abrirModalcargar(true);
    	    		FicherosService.downloadFichero({"NO_RUTA_ORIGEN": vm.archivo.NO_RUTA,"NO_ARCHIVO": vm.archivo.NO_ARCHIVO})
    				.then(function successCallback(response){
    					vm.archivoDescarga = response.data;
    					readBlob(response.data);
        				$mdDialog.cancel();
    				});
    			}
    		}

			if(vm.datos.ID_TIPO_ENTREGA == 3) {
				MovilService.getChangelog()
				.then(function successCallback(response) {
					if(response.data) {
						vm.changelogHtml = `data:text/html;charset=UTF-8,${encodeURIComponent(response.data)}`;
					}
				});
			}
    	}
    	
    	function readBlob(file) {
		    var reader = new FileReader();

		    reader.onload = function(readerEvt) {
		      var binaryString = readerEvt.target.result;
		      vm.templateString = binaryString;
		    };

		    reader.readAsBinaryString(file);
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
            return BASE_SRC + "detalle/detalles.views/detalle.entregas.html";
    	}
    	
    	vm.descargarArchivo = function () {
			saveAs(new Blob([vm.archivoDescarga]), vm.archivo.NO_ARCHIVO);
    	}
    }   
    
    ng.module('App').component('entregaSd', Object.create(entregasComponent));
    
})(window.angular);