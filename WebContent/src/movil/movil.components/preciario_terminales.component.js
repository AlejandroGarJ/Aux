(function(ng) {	


	//Crear componente de app
    var preciarioTerminalesComponent = {
        controllerAs: '$ctrl',
        template:'<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject:['$mdDialog', '$scope', 'MovilService'],
        require: {
            parent:'^sdApp'
        }
    }
    
    
    
    preciarioTerminalesComponent.controller = function preciarioTerminalesComponentControler($mdDialog, $scope, MovilService) {
		var vm = this;
		vm.loading = false;
		vm.cutMH = 149;
		vm.NO_ARCHIVO = "Seleccionar archivo"
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.file = {};
    	
    	this.$onInit = function() {}
    	
    	this.$onChanges = function() {}
    	
    	this.loadTemplate = function() {
    		return "src/movil/movil.views/preciario_terminales.view.html";
    	}
    	

    	
    	$(document).on('change', '#subirInforme', function(e) {
			if(e) {

				$scope.$apply();
				var f = document.getElementById('subirInforme').files[0];

				file = this.files[0];
	    		vm.NO_ARCHIVO = file.name;

				vm.parent.getBase64(file);			
			}
			vm.listaArchivos = vm.parent.listArchivos;
		});

    	
    	vm.uploadPreciario = function() {
    		if (vm.listaArchivos == null || vm.listaArchivos == "" || vm.listaArchivos.length <= 0) {
				msg.textContent("Seleccione un archivo antes de subir");
				$mdDialog.show(msg);
    		} else {
        		vm.parent.uploadFiles(vm.listaArchivos, 'terminales', null);
        		vm.listaArchivos = [];
        		vm.NO_ARCHIVO = "Seleccionar archivo";
    		}
    	}
    	
    	$(document).on('click', '#descargarPreciario', function(e) {
    	    vm.parent.abrirModalcargar(true);
			MovilService.downloadPreciario({})
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						
						if (response.data.LST_ADJUNTOS != null && response.data.LST_ADJUNTOS.length > 0 && response.data.LST_ADJUNTOS[0].ARCHIVO != null) {
						    saveAs(new Blob([response.data.LST_ADJUNTOS[0].ARCHIVO], { type: 'application/vnd.ms-excel' }), response.data.LST_ADJUNTOS[0].NO_ARCHIVO);
						}
						
						msg.textContent("Se ha descargado el preciario correctamente");
						$mdDialog.show(msg);
					}else{
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				}
			}, function errorCallBack(response){
				if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
                    vm.parent.cambiarDatosModal("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
        	    } else {
                    vm.parent.cambiarDatosModal('Ha ocurrido un error al descargar el preciario');
        	    }
            });
    		
    	});

    }
    
    ng.module('App').component('sdPreciarioTerminales', Object.create(preciarioTerminalesComponent));
    
    
    
})(window.angular);