(function(ng) {	


	//Crear componente de app
    var consentimientosTerminalesComponent = {
        controllerAs: '$ctrl',
        template:'<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject:['$mdDialog', '$scope', 'MovilService'],
        require: {
            parent:'^sdApp'
        }
    }
    
    
    
    consentimientosTerminalesComponent.controller = function consentimientosTerminalesComponentControler($mdDialog, $scope, MovilService) {
		var vm = this;
		vm.loading = false;
		vm.cutMH = 169;
		vm.NO_ARCHIVO = "Seleccionar archivo"
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.file = {};
    	
    	this.$onInit = function() {}
    	
    	this.$onChanges = function() {}
    	
    	this.loadTemplate = function() {
    		return "src/movil/movil.views/consentimientos.view.html";
    	}
    	
    	$(document).on('change', '#subirInforme', function(e) {
    		var reader,
			file = this.files[0];
    		vm.NO_ARCHIVO = file.name;
    		
			e.preventDefault();
	
			if (!file)
				return;
	
			reader = new FileReader();
			reader.onload = function(){
				var base64 = reader.result.split("base64,")[1];
				var binary_string = window.atob(base64);
			    var len = binary_string.length;
			    var bytes = [];
			    for (var i = 0; i < len; i++) {
			        bytes.push(binary_string.charCodeAt(i));
			    }
			    
			    vm.archivo = {
					"ARCHIVO": bytes,
		        	"NO_ARCHIVO": vm.NO_ARCHIVO
		        };
				
				$scope.$apply();
			}
			reader.readAsDataURL(file);
    	});

    	vm.enviarInforme = function() {		 				
           vm.parent.abrirModalcargar(true);
           var mail = vm.form.email;
			MovilService.enviarConsentimiento({"email": mail})
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.code== 0){
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					}else{
						msg.textContent(response.data.msg);
						$mdDialog.show(msg);
					}
				}
			}, function errorCallBack(response){
				if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
	                vm.parent.cambiarDatosModal("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
        	    } else {
                    vm.parent.cambiarDatosModal('Ha ocurrido enviar el informe');
        	    }
            });
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
    	
    	vm.subirInforme =  function() {
    		vm.parent.abrirModalcargar(true);

 			MovilService.subirConsentimiento(vm.archivo)
 			.then(function successCallback(response){
 				if(response.status == 200){
 					if(response.data.code== 0){
 						msg.textContent(response.data.msg);
 						$mdDialog.show(msg);
 					}else{
 						msg.textContent(response.data.msg);
 						$mdDialog.show(msg);
 					}
 				}
 			}, function errorCallBack(response){
 				if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
 	                vm.parent.cambiarDatosModal("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
        	    } else {
                    vm.parent.cambiarDatosModal('Ha ocurrido un error al enviar el informe');
        	    }
             });
    	}	

    }
    
    ng.module('App').component('sdConsentimientosTerminales', Object.create(consentimientosTerminalesComponent));
    
    
    
})(window.angular);