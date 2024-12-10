(function(ng) {	

	//Crear componente de app
    var colectivoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', '$mdDialog', 'BusquedaService', 'AseguradoraService','TiposService', 'uiGridConstants','BASE_SRC', 'ColectivoService', 'UsuarioService', '$scope'],
    		require: {
    			appParent: '^sdApp',
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp',
    			busquedaMaestros: '^busquedaMaestros'
    		},
    		bindings: {
                idDetalle: '<',
            }
    }
    
    colectivoComponent.controller = function colectivoComponentControler($location, $mdDialog, BusquedaService,AseguradoraService,TiposService,uiGridConstants, BASE_SRC, ColectivoService, UsuarioService, $scope){
    	var vm=this;
    	var url=window.location;
    	vm.datos = {};
    	vm.listFiles = [];
		vm.tipos = {};
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.listSubcolectivos = [];
		
    	this.$onInit = function(bindings) {
    		vm.datos = vm.parent.idDetalle;
    		vm.load = true;
    		
    		if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			console.log(vm.permisos);
    		}
    		
    		ColectivoService.getColectivosFiltroUsuario({})
    		.then(function successCallBack(response){
    			if(response.status == 200){
    				vm.listSubcolectivos = response.data.COLECTIVOS.COLECTIVO;
//					var colectivos = response.data.COLECTIVOS.COLECTIVO;
//					for(var i = 0; i < colectivos.length; i++){
//						if(colectivos[i].ID_TIPOCOLECTIVO_PADRE == undefined){
//							vm.listSubcolectivos.push(colectivos[i]);
//						}
//					}
				}
    		});
    		
    		UsuarioService.getUsuariosByFilter({})
    		.then(function successCallBack(response){
    			if(response.status == 200){
    				vm.listUsuarios = response.data.USUARIOS;
    				if(vm.listUsuarios == undefined){
    					vm.listUsuarios = {};
    				}
    				vm.gridOptions.data = vm.listUsuarios;
    				$scope.$apply;
				}
    			vm.load = false;
    		});
    		
    		if(vm.datos != undefined && vm.datos.ID_TIPO_POLIZA != undefined){
    			ColectivoService.getDetalleColectivo({"ID_TIPO_POLIZA": vm.datos.ID_TIPO_POLIZA})
	    		.then(function successCallBack(response){
	    			if(response.status == 200){
						vm.datos = response.data;
					}
	    		});
    		}
    	}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC + "detalle/detalles.views/detalle.colectivo.html";
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.gridOptions = {
            	paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableCellEdit: false,
    		    columnDefs: [
      		      {field: 'NO_USUARIO', displayName: 'Usuario', cellTooltip: function(row){return row.entity.NO_USUARIO}},
      		      {field: 'NO_GRUPO_ROL', displayName: 'Grupo', cellTooltip: function(row){return row.entity.NO_GRUPO_ROL}},
      		      {field: 'IS_SELECTED', displayName: 'Asignado', 
      		    	  cellTemplate: '<div ng-if="row.entity.IS_SELECTED == true" class="ui-grid-cell-contents td-trash">Sí</div><div ng-if="row.entity.IS_SELECTED == false" class="ui-grid-cell-contents td-trash">No</div>',
      		    	  cellTooltip: function(row){return row.entity.IS_SELECTED}}],
    		    onRegisterApi: function( gridApi ) {
    		    	vm.gridApi = gridApi;
      		    }
    	}
    	
    	vm.saveColectivo = function(){
    		if(!vm.formAseguradora.$invalid){
				vm.appParent.abrirModalcargar(true);
    			ColectivoService.guardarColectivo(vm.datos)
	    		.then(function successCallBack(response){
	    			if(response.data.ID_RESULT == 0){
						vm.datos = response.data;
						vm.appParent.cambiarDatosModal('Se ha guardado correctamente');
						vm.busquedaMaestros.cerrarTab(vm.busquedaMaestros.active-1);
						vm.busquedaMaestros.parent.recargarListado();
					}else{
						vm.appParent.cambiarDatosModal(response.data.DS_RESULT);
					}
	    		}, function error(error){
					vm.appParent.cambiarDatosModal('Ha ocurrido un error al guardar');
    			});
    		}else{
    			vm.validar(vm.formAseguradora.$invalid);
    		}
    	}
    	
    	vm.validar = function(form2Validate) {
            if (form2Validate) {
				objFocus=angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
                vm.indice = vm.indice;
            } else {
            	vm.indice = vm.indice + 1;
//                vm.pre.tarificarPresupuestos(vm.datos, 'PRESUPUESTO_VIDA');
            }
        }

		vm.siguiente = function (ind) {
			if(ind == 1){
				vm.validar(vm.formAseguradora.$invalid);
			}else{
				vm.indice = vm.indice + 1;
			}
        }

        vm.anterior = function () {
            vm.indice = vm.indice - 1;
        }
    	
    	
    	
    	//Cambiar tabs
    	vm.changeTabs = function(index){
    		vm.showTable = index;
    	}   	
    }   
    
    ng.module('App').component('colectivoSd', Object.create(colectivoComponent));
    
})(window.angular);