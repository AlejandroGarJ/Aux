(function(ng) {	

	//Crear componente de busqueda
    var filtrosDispositivosMovilesComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['BASE_SRC', 'MovilService'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
    		}
    } 
    
    filtrosDispositivosMovilesComponent.controller = function filtrosDispositivosMovilesComponentController(BASE_SRC, MovilService){
    	var vm=this;

    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){

			MovilService.getDevices({})
			.then(function successCallback(response) {
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						vm.lstDevicesF = [];
						vm.lstBrandsF = [];
						if(response.data != null && response.data.TERMINALES.length > 0) {
							vm.lstDevicesF = response.data.TERMINALES;
						    for(var i = 0; i < vm.lstDevicesF.length; i++) {
								var device = {
									'brandId': vm.lstDevicesF[i].brandId,
									'brandName': vm.lstDevicesF[i].brandName
								}
								if(vm.lstBrandsF.map(x => x.brandId).indexOf(vm.lstDevicesF[i].brandId) == -1) {
									vm.lstBrandsF.push(device);
								}
							}
						}
					}
				}else{
					msg.textContent(response.data.DS_RESULT);
					$mdDialog.show(msg);
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function(){
    		return BASE_SRC + "filtros/filtros.view/admin/filtros.dispositivosMoviles.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if(vm.form == undefined){
    			vm.form = {};
			}
    		if(vm.parent.filtrar(vm.form, tipo, true)){
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    	}
    	
    	vm.querySearch = function(query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
        }

        function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                if(key != "modelName")
                    return (list[key].indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
			};
		}
        
        
    }    
    ng.module('App').component('filtrosDispositivosMovilesApp', Object.create(filtrosDispositivosMovilesComponent));    
})(window.angular);