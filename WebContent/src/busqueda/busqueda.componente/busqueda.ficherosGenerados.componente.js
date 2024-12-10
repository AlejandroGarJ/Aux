(function(ng) {	


	//Crear componente de busqeuda
    var ficheroGeneradoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', '$translate', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'FicherosService'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    ficheroGeneradoComponent.controller = function ficheroGeneradoComponentController($q, $location, $timeout, $window, $translate, validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, FicherosService){
    	var vm=this;
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.form = vm.parent.form;
            vm.dictionary = vm.parent.dictionary;
            vm.active=0;
			vm.vista = 1;
			vm.numDetalles = [];
	    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
			
			
    		vm.colectivos = vm.parent.colectivos;
    		
    		angular.forEach(vm.parent.compartir, function(value, key){
				vm[key] = value;
			});
    		
    		//Cargar permisos
    		/*if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('ficheros_generados');
				vm.parent.ckPermisos = vm.permisos;
    		}*/
    		
    		
    		//Cargar las listas
			if(localStorage.ficherosGenerados != undefined && localStorage.ficherosGenerados != ""){
				angular.forEach(vm.parent.pages, function(value, key){
					vm[key] = value;
				});
			}
			else{
				localStorage.clear();
			}
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		vm.active = 0;
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
    	}

        vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 30;
            
            var totalItems = vm.gridOptions.totalItems;
            if (totalItems > vm.gridOptions.paginationPageSize) {
            	totalItems = vm.gridOptions.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight) + "px"
            };
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
		    	  {field: 'NO_TIPO_ARCHIVO', 
		    		  grouping: {
		                  groupPriority: 0
		              },
		              sort: {
		                  priority: 0,
		                  direction: 'asc'
	                  },
      		    	  displayName: 'Aseguradora', 
      		    	  width:'30 %',
      		    	  cellTooltip: function(row){return row.entity.NO_TIPO_ARCHIVO}
      		      },
    		      {field: 'NO_ARCHIVO', displayName: 'Fichero', width:'25 %', cellTooltip: function(row){return row.entity.NO_ARCHIVO}},
    		      {field: 'NO_TIPO_ARCHIVO', displayName: 'Tipo de fichero', width:'15 %', cellTooltip: function(row){return row.entity.NO_TIPO_ARCHIVO}},
    		      {field: 'NO_USU_ALTA', displayName: 'Creado por',  width:'10 %', cellTooltip: function(row){return row.entity.NO_USU_ALTA}},
    		      {field: 'FT_USU_ALTA', displayName: 'Creado en', cellFilter: 'date:\'dd/MM/yyyy\'', width:'10 %', cellTooltip: function(row){return row.entity.FT_USU_ALTA}},
    		      {field: 'Descargar', displayName: '', 
    		    	  width:'10 %',
    		    	  cellTemplate: '<div ng-if="row.entity.NO_TIPO_ARCHIVO != undefined" class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.descargar(row.entity)"><span style="font-size: 22px; top: 0;" class="glyphicon glyphicon-download"></a></div>',  
    		    	  cellTooltip: function(row){return row.entity.IN_EJECUTADO}},
    		    ],
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.ficherosGenerados.html";
    	}
    	
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i] === fila){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe){
    			vm.numDetalles.push(fila);
                vm.active = vm.numDetalles.length;
    		}else{
    			vm.active = vm.numDetalles.length;
    		}
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
    	
    	//Buscar la lista
    	vm.buscar=function(tipo){
    		vm.json={};
    		localStorage.clear();
    		
    		angular.forEach(vm.form, function(value, key) {
				if(value.value == "" || (value.value == 3 && key=='tipo')){
    				delete vm.form[key];
    			}
				else{
					vm.json[key]=value.value;
				}
			});
			
			console.log(vm.json);
			
			if(Object.keys(vm.json).length !== 0){
			}
			else{
				$('#checkVacio').slideDown().delay(1500).slideUp();
			}
    	}
    	
        vm.descargar = function(row){
        	
        	FicherosService.downloadFichero({"NO_ARCHIVO":row.NO_ARCHIVO, "NO_RUTA_ORIGEN": row.NO_RUTA_DESTINO})
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.config.data != null){
						saveAs(new Blob([response.data]), row.NO_ARCHIVO);
					}else{
						msg.textContent("Ha ocurrido un error. Archivo no encontrado.");
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response) {
					if(response.status == 500) {
						
						if(row.NO_RUTA_DESTINO.includes('/sal')) {

							let pathAr = row.NO_RUTA_DESTINO.slice(1).split('/');
							if(pathAr.length == 2) {
								let path = `/${pathAr[0]}/backup/${pathAr[1]}`;
								FicherosService.downloadFichero({'NO_ARCHIVO':row.NO_ARCHIVO, 'NO_RUTA_ORIGEN': path})
								.then(function successCallback(response){
									if(response.status == 200){
										if(response.config.data != null){
											saveAs(new Blob([response.data]), row.NO_ARCHIVO);
										}else{
											msg.textContent('Ha ocurrido un error. Archivo no encontrado.');
											$mdDialog.show(msg);
										}
									}
								}, function callBack(response) {
										if(response.status == 500){
											msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE') +' Archivo no encontrado.');
											$mdDialog.show(msg);
										}
								});
							}

						} else {
							msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE')+ ' Archivo no encontrado.');
							$mdDialog.show(msg);
						}
						
					}
			});
        }
    }


    
    ng.module('App').component('busquedaFicheroGenerado', Object.create(ficheroGeneradoComponent));
    
})(window.angular);