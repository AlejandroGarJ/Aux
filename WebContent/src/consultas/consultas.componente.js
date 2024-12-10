(function(ng) {	


	//Crear componente de busqeuda
    var consultaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['ClienteService'],
    		require: {
            	
            }
    }
 
    consultaComponent.controller = function consultaComponentController(ClienteService){
    	var vm=this;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		
    		ClienteService.getCliente({"ID_CLIENTE":452})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				
    			}
    		}, function errorCallback(response){
    			
    		});
    		
    	}
    	
    	this.$onChanges = function(){
    		
    	}
    	
    	this.$doCheck = function(){
    		
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"consultas/consultas.view.html";
    	}
    	
    	vm.mostrarCliente = function(){
    		ClienteService.getCliente({"ID_CLIENTE":452})
    		.then(function successCallback(response){
    			if(response.status == 200){
    				
    			}
    		}, function errorCallback(response){
    			
    		});
    	}
    	
    	
    }

    
    ng.module('App').component('consultaSd', Object.create(consultaComponent));
    
})(window.angular);