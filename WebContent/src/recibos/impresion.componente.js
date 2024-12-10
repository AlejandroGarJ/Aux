(function(ng) {	


	//Crear componente de app
    var impresionComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['TiposService', 'BASE_SRC'],
    		require: {
            	parent:'^sdApp'
            }
    }

    impresionComponente.controller = function impresionComponenteControler(TiposService, BASE_SRC){
    	var vm=this;
    	vm.tipos = {};
    	
    	this.$onInit = function(){
    		TiposService.getCompania({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.TIPOS.TIPO;
				}
			});
    		TiposService.getProvincias({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.provincias = response.data.TIPOS.TIPO;
				}
			});
    	}
    	
    	this.loadTemplate = function(){
    		return BASE_SRC+'recibos/impresion.view.html';
    	}
    	
    	vm.addFile = function(){
    		vm.listFiles.push({});
    	}
    	
    }
    ng.module('App').component('impresionApp', Object.create(impresionComponente));
    
})(window.angular);