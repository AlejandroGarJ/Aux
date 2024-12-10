(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'UsuarioWSService', 'TiposService', 'constantsTipos'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, UsuarioWSService, TiposService, constantsTipos){
    	var vm=this;
    	var json = {};
		var url=window.location
		vm.numDetalles = [];
		vm.canales = [];
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		vm.isNew = false;
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		//Cargar las listas
			if(localStorage.alarmas != undefined && localStorage.alarmas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.alarmas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			if(/pendientes/.test(url)){
				vm.parent.buscar({}, "alarmas");
			}
			
			TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.canales = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
            vm.active = 0;
    		vm.gridOptions.data = vm.listBusqueda;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{field: 'NO_USUARIO', 
					displayName: 'Usuario', 
					cellTooltip: function(row){return row.entity.NO_USUARIO},
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'userWs\', row)">{{row.entity.NO_USUARIO}}</a></div>',
					},
				  {field: 'NO_NOMBRE', displayName: 'Nombre', cellTooltip: function(row){return row.entity.NO_NOMBRE}}, 
    		      {field: 'NO_APELLIDO1', displayName: 'Apellido', cellTooltip: function(row){return row.entity.NO_APELLIDO1}},
				  {field: 'NO_EMAIL', displayName: 'Email', cellTooltip: function(row){return row.entity.NO_EMAIL}}, 
				  {field: 'NO_COMPANIA', displayName: 'Colaborador / Mediador', cellTooltip: function(row){return row.entity.NO_COMPANIA},  enableCellEdit: true,  editDropdownValueLabel: 'NO_COMPANIA', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.$ctrl.colModificado[row.entity.NO_COMPANIA]">{{row.entity.NO_COMPANIA}}</div>'},
    		      {field: 'DS_TIPO', displayName: 'Canal', cellTooltip: function(row){
    		    	   return row.entity.canal
    		    	  }
				  } 

    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		    }
    	}
		
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.usuarios.html";
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
		
		//Abrir modal de nuevo usuario ws
        vm.openNewUserWS = function() {
        	vm.isNew = true;
        	vm.numDetalles.push(null);
            vm.active = vm.numDetalles.length;
    	}
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null && vm.numDetalles[i].NO_USUARIO === fila.NO_USUARIO){
    				existe = true;
    				break;
    			}
    		}
    		
    		if(!existe){
    			vm.numDetalles.push(fila);
                vm.active = vm.numDetalles.length;
    		}else {
                vm.active = vm.numDetalles.length;
            }
        	vm.isNew = false;
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
            var detallesAbiertos = [];
            
            if(vm.numDetalles != null){
                for(var i = 0; i < vm.numDetalles.length; i++){
                    detallesAbiertos.push(vm.numDetalles[i]);
                }
            }
            

            detallesAbiertos.splice(index,1);
            vm.numDetalles = [];
            setTimeout( function () { 
                    for(var i = 0; i < detallesAbiertos.length; i++){
                        vm.numDetalles.push(detallesAbiertos[i]);
                    }
                    
                    vm.active = vm.numDetalles.length;
                }, 
            10);

    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	//Creamos JSON
    	function rellenarJSON(){
    		json = {};
    		vm.isError = false;
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || value.value==null){
    				delete vm.form[key];
    			}
				else{
					if(value.value instanceof Date){
						json[key]=vm.parent.dateFormat(value.value);
						
						//Comprueba las fechas que no sean al revés
						angular.forEach(vm.form, function(value2, key2){
							if(!vm.isError){
								vm.isError = vm.parent.validFechas(key2, value2.value, key, value.value);
							}
						});
					}
					else if(typeof(value.value) == 'object'){
						json[key]=[]
						for(var i=0;i<value.value.length;i++){
							json[key][i]=value.value[i].id;
						}
						json[key]=json[key].toString();
					}
					else{
						json[key]=value.value;
					}
					
				}
    		});
    	}
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		localStorage.clear();
    		rellenarJSON();
    		
			console.log(vm.json);
			
			if(!vm.isError){
				if(Object.keys(json).length !== 0){
				}
				else{
					$('#checkVacio').slideDown().delay(1500).slideUp();
				}
			}
			else{
				$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
			}
		}
		
    }

    
    ng.module('App').component('busquedaUsuarios', Object.create(busquedaComponent));
    
})(window.angular);