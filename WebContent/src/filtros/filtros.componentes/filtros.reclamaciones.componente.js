(function(ng) {	

	//Crear componente de busqueda
    var filtrosReclamacionesComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$window', '$routeParams', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'SolicitudService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosReclamacionesComponent.controller = function filtrosReclamacionesComponentController($location, $window, $routeParams, validacionesService, sharePropertiesService, BusquedaService, SolicitudService, TiposService, ColectivoService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
    	vm.calendar = {};
    	vm.motivos = [];
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
    		TiposService.getSituaSolicitud()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.estadoSolicitud = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                	$location.path('/');
                }
			});
    		
    		//Cargar tipos de canal
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.canales = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                	$location.path('/');
                }
			});
    		
    		//Cargar tipos de colectivo
			// ColectivoService.getListColectivos({})
			// .then(function successCallback(response) {
			// 	if(response.status == 200){
			// 		vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
			// 	}
			// }, function callBack(response) {
			// 	if(response.status == 406 || response.status == 401){
			// 		vm.parent.logout();
			// 		$location('/');
			// 	}
			// });
			vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
    	}
			
			//Cargar tipos de jurídica
    		TiposService.getSituaCliente({})
    		.then(function successCallback(response){
     			if(response.status == 200){
     				if(response.data.ID_RESULT == 0){
     					vm.companias = response.data.TIPOS.TIPO;
     				}
     			}
    		}, function callBack(response){
    			if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                	$location.path('/');
                }
    		});

    	
    		//Cargar motivos de consultas (viajes)
	    	TiposService.getMotivosConsultas(20)
	        .then(function successCallback(response) {
	            if (response.status == 200) {
	            	if(response.data.ID_RESULT == 0){
		                vm.motivos1 = response.data.TIPOS.TIPO;   
		                if(vm.motivos1 != undefined){
			            	for(var i=0; i<vm.motivos1.length ; i++){
			    	    		vm.motivos.push(vm.motivos1[i]);
			    	    	}
		                }
	            	}
	            }	
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
	            	vm.parent.logout();
	            	$location.path('/');
	            }
			});
    	
	    	if(vm.motivos1 != undefined){
	    		//Cargar motivos de consultas (salud)
		    	TiposService.getMotivosConsultas(103)
		        .then(function successCallback(response) {
		            if (response.status == 200) {
		                vm.motivos2 = response.data.TIPOS.TIPO;  
			                for(var i=0; i< vm.motivos2.length ; i++){
			                	if(vm.motivos2[i].ID_RAMO != undefined){
				                		vm.motivos.push(vm.motivos2[i]);
				                	}
			                }
		            }
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
		            	vm.parent.logout();
		            	$location.path('/');
		            }
				});
	    	}
	    		//Cargar usuarios receptores (asignado a)
            SolicitudService.getUsuariosGestores({"ID_GRUPO_ROL": $window.sessionStorage.rol})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.usuarios = response.data.USUARIOS;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
	                	vm.parent.logout();
	                	$location.path('/');
	                }
				});
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de filtro
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.reclamaciones.html";
    	}
    	
    	vm.buscar = function(tipo) {
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
					if(value.value == "" || value.value==null){
							delete vm.form[key];
						}
					});
				if(vm.parent.filtrar(vm.form, tipo)){
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
    		vm.autocomplete = null;
    	}
   }    
    ng.module('App').component('filtrosReclamacionesApp', Object.create(filtrosReclamacionesComponent));    
})(window.angular);