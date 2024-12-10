(function(ng) {	


	//Crear componente de app
    var preAccidentesComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', 'TiposService', 'BusquedaService', 'SolicitudService'],
    		require: {
            	parent:'^sdApp'
    		},
    		bindings: {
    			idRamo:'<',
    			idColectivo:'<'
    		}
    }
    
    
    
    preAccidentesComponent.controller = function preAccidentesComponentControler($q, $location, TiposService, BusquedaService, SolicitudService){
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.form = {};
    	vm.polizas = [];
    	vm.tiposSolicitud = [];
    	
    	this.loadTemplate=function(){
    		return "src/presupuesto/form.presupuesto.view/pre.accidentes.html";
    	}
    	
    	//Abrir calendarios
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	
    }
    
    ng.module('App').component('preAccidentesApp', Object.create(preAccidentesComponent));
    
    
    
})(window.angular);