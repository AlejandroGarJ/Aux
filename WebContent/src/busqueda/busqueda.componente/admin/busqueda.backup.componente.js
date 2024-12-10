(function(ng) {	


	//Crear componente de app
    var backupComponente = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['BASE_SRC', '$location', 'FicherosService', '$mdDialog', '$scope', 'TiposService'],
    		require: {
            	parent:'^sdApp'
            }
    }
    
    
    
    backupComponente.controller = function backupComponentetControler(BASE_SRC, $location, FicherosService, $mdDialog, $scope, TiposService){
    	var vm=this;
    	vm.listFiles = [];
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');

    	
    	this.$onInit = function(){
    		
    		if(vm.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.getPermissions('back_up');
    		}
    		
			vm.url = $location.url();
			var tipo = '';
			var json = {};
			
            vm.json = json;
			
			
    	}
    	
    	this.$onChanges = function(){
    		vm.gridOptions.data = vm.listFicheros;
    	}
    	
    	this.loadTemplate = function() {
			if(vm.permisos != undefined && vm.permisos.EXISTE != false) {
                return BASE_SRC+'busqueda/busqueda.view/admin/busqueda.backup.view.html';
            } else {
                return 'src/error/404.html';
            }
    	}
    	
    	vm.gridOptions = {
    			enableSorting: true,
    			enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    enableCellEdit: false,
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
      		      {field: 'NO_COMPANIA', displayName: 'Aseguradora', cellTooltip: function(row){return row.entity.NO_COMPANIA}},
      		      {field: ' ', displayName: 'Descargar', cellTemplate: '<div ng-if="row.entity.DESCARGAR != false" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargarFichero($event,row.entity, row)">Descargar</a></div>'},
				  ],
    		    onRegisterApi: function( gridApi ) {
    		    	vm.gridApi = gridApi;
      		      
    		    	vm.listaSeleccionados = [];
    		    	
    		    	gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
        	        });
    		    	
                    gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
					});
					gridApi.selection.on.rowSelectionChangedBatch($scope, function (fila) {
        	            vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
        	        });
    		    	
	  	      		vm.gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
	  	      			  if(newValue != oldValue){
	  	      				  console.log(rowEntity);
	  	      				  vm.colModificado[rowEntity[colDef.field]] = 'colModificado';
	  	      				  if(!rowEntity.IS_NEW)
	  	      					  rowEntity.IS_UPDATED = true;
	  	      			  }
	  	    		});
      		    }
		}
		vm.seleccionable = function(fila) {
			return true;
		}

        vm.recargarListado = function(){
            FicherosService.getFicheros(vm.json)
            .then(function successCallback(response){
                if(response.status == 200){
                    vm.listFicheros = response.data.FICHEROS.FICHERO;
                    vm.gridOptions.data = vm.listFicheros;
                }
            }, function callBack(response){
                msg.textContent("Se ha producido un error al cargar los ficheros.");
                $mdDialog.show(msg);
                if(response.status == 406 || response.status == 401){
                    vm.parent.logout();
                }
            });
        }
    	
    	$(document).on('change', '#file_sf', function(e) {
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
    
    
    	vm.descargarFichero = function(event, row){
    		FicherosService.downloadFichero({"NO_RUTA_ORIGEN":row.NO_RUTA_ORIGEN,"NO_ARCHIVO":row.NO_ARCHIVO})
			.then(function successCallback(response){
				if(response.status == 200){
					saveAs(new Blob([response.data]), row.NO_ARCHIVO);
				}
			});
    	}

    
    }
    ng.module('App').component('busquedaBackup', Object.create(backupComponente));
    
})(window.angular);