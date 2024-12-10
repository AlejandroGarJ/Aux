(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', 'AseguradoraService', '$mdDialog'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, AseguradoraService, $mdDialog){
    	var vm=this;
    	var json = {};
    	var url=window.location;
    	vm.numDetalles = [];
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		//Cargar las listas
			if(localStorage.comisionistas != undefined && localStorage.comisionistas != ""){
				vm.gridOptions.data = JSON.parse(localStorage.comisionistas);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			if(vm.parent.parent.getPermissions != undefined) {
				vm.permisos = vm.parent.parent.getPermissions($location.$$path.substring(1, $location.$$path.length));
				vm.parent.ckPermisos = vm.permisos;
    		}
			
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		//vm.active = vm.dsActive;
            vm.active = 0;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    paginationPageSize: 30,
    		    columnDefs: [
    		      {field: 'ID_COMPANIA', 
      		    	  displayName: 'Identificador', 
      		    	  cellTooltip: function(row){return row.entity.ID_COMPANIA},
      		    	  cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'comisionistas\', row)">{{row.entity.ID_COMPANIA}}</a></div>'
      		      },
      		      {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function(row){return row.entity.NO_COMPANIA}},
      		      {field: 'NU_CIF', displayName: 'NIF', cellTooltip: function(row){return row.entity.NU_DOCUMENTO}},
      		      {field: 'NO_LOCALIDAD', displayName: 'Localidad', cellTooltip: function(row){return row.entity.NO_LOCALIDAD}},
      		      {field: 'NU_TELEFONO', displayName: 'Teléfono', cellTooltip: function(row){return row.entity.NU_TELEFONO}},
      		      {field: 'NO_EMAIL', displayName: 'Email', cellTooltip: function(row){return row.entity.NO_EMAIL}},
      		      {field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}},
      		      {field: 'FT_USU_MOD', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Modificado en', cellTooltip: function(row){return row.entity.FT_USU_MOD}},
      		      {name:' ', cellTemplate:'<div ng-if="grid.appScope.$ctrl.permisos.IN_BORRADO == true" class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.eliminarAseguradora(row.entity)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>', 
					        //cellClass: "td-trash",
	                    width: 36,
					        enableSorting:false, enableColumnMenu:false
	  		      }
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.colaboradores.html";
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i].ID_COMPANIA === fila.ID_COMPANIA){
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
    	}
    	
    	//Abrir pantalla de nuevo colaborador
    	vm.nuevoColaborador = function(){
    		vm.numDetalles.push({});
            vm.active = vm.numDetalles.length;
    	}
    	
    	vm.eliminarAseguradora = function(row){
    		
    		$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_aseguradora.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose:true,
                parent: angular.element(document.body),
                fullscreen:false,
                controller:['$mdDialog', function($mdDialog){
                var md = this;
                var json = {
                    "ID_COMPANIA":row.ID_COMPANIA,
                    "IT_VERSION":row.IT_VERSION
                };
                
                md.borrar = function(option){
                  if(option){
                	  AseguradoraService.borrarAseguradora(json)
	                    .then(function successCallback(response){
	                    	if (response.data.ID_RESULT == 0) {
	  	                        for(var i=0;i<vm.gridOptions.data.length;i++){
	  	                          if(vm.gridOptions.data[i].ID_COMPANIA == row.ID_COMPANIA){
	  	                            vm.gridOptions.data.splice(i, 1);
	  	                          }
	  	                        }
	  	                        msg.textContent('Ha sido borrado con éxito');
	                    	} else {
		                    	msg.textContent(response.data.DS_RESULT);
	                    	}

	                        $mdDialog.hide();
	                        $mdDialog.cancel();         
						    $mdDialog.show(msg);
	                    }, function errorCallback(response){
	                    	msg.textContent('Ha ocurrido un error al eliminar. Contacte con el administrador.');
						    $mdDialog.show(msg);
	                      if(response.status == 406){
	                        vm.parent.logout();
	                      }
	                    })
                  }
                  else
                     $mdDialog.cancel();
                }
                
              }]
            });
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
    }

    
    ng.module('App').component('busquedaColaboradores', Object.create(busquedaComponent));
    
})(window.angular);