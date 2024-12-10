(function(ng) {	


	//Crear componente de busqeuda
    var ficheroErrorComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    ficheroErrorComponent.controller = function ficheroErrorComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC){
    	var vm=this;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.form = vm.parent.form;
            vm.dictionary = vm.parent.dictionary;
            vm.active=0;
			vm.vista = 1;
	        vm.screenHeight = $window.innerHeight;
    		vm.colectivos = vm.parent.colectivos;
			vm.numDetalles = [];
    		
    		angular.forEach(vm.parent.compartir, function(value, key){
				vm[key] = value;
			});
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('ficheros_errores_list');
				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		//Cargar las listas

			if(localStorage.errorFicheros != undefined && localStorage.errorFicheros != ""){
				angular.forEach(vm.parent.pages, function(value, key){
					vm[key] = value;
				});
				
				/*var info = vm.parent.cargarBusqueda('errorFicheros');
				angular.forEach(info, function(value, key){
					vm[key] = value;
				});*/
			}
			else{
				localStorage.clear();
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
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{
						field: 'CO_ERROR', 
						displayName: 'Tipo de dato', 
						cellTooltip: function(row){return row.entity.CO_ERROR},
						grouping: {
							groupPriority: 0
						},
						sort: {
							priority: 0,
							direction: 'asc'
						}
					},
					{
						field: 'NO_FICHEROS_PROCESADO',
						displayName: 'Fichero',
						cellTemplate: '<div class="ui-grid-cell-contents">' +
							'<a ng-if="row.entity.JS_DESCRIPCION" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'ficheroerror\', row)">' +
								'{{row.entity.NO_FICHEROS_PROCESADO}}' +
							'</a>' +
							'<span ng-if="!row.entity.JS_DESCRIPCION">' +
								'{{row.entity.NO_FICHEROS_PROCESADO}}' +
							'</span>' +
						'</div>',
						cellTooltip: function(row){return row.entity.NO_FICHEROS_PROCESADO}
					},
					{
						field: 'NO_COMPANIA', 
						displayName: 'Aseguradora', 
						cellTooltip: function(row){return row.entity.NO_COMPANIA}
					},
					{field: 'DS_TIPO_COLECTIVO', displayName: 'Partner', cellTooltip: function(row){return row.entity.DS_TIPO_COLECTIVO}},
					{field: 'DS_TIPO_MEDIO_PAGO', displayName: 'Vía de pago', cellTooltip: function(row){return row.entity.DS_TIPO_MEDIO_PAGO}},
					{field: 'DS_NIVEL_ERROR', displayName: 'Nivel error', cellTooltip: function(row){return row.entity.DS_NIVEL_ERROR}},
					{field: 'CO_DATO', displayName: 'Código', cellTooltip: function(row){return row.entity.CO_DATO}},
					{field: 'DS_ERROR', displayName: 'Descripción', cellTooltip: function(row){return row.entity.DS_ERROR}},
					{field: 'OB_ERROR', displayName: 'Observaciones', cellTooltip: function(row){return row.entity.OB_ERROR}},
					{field: 'FT_USU_ALTA', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Creado en', cellTooltip: function(row){return row.entity.FT_USU_ALTA}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		    }
    	}
    	
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.errorFicheros.html";
    	}
    	
    	
    	//Botón para ver el detalle
    	// vm.verDetalle = function(fila, key, index){
    	// 	if(!vm.numDetalles.includes(fila)){
    	// 		vm.numDetalles.push(fila);
    		
	    // 		vm.cargarDetalle = true;
	    // 		$timeout(function(){
	    // 			vm.active = vm.numDetalles.length;
	    			
	    // 			vm.actives = vm.numDetalles.length+1;
	    // 			vm.cargarDetalle = false;
	    			
	    // 		},3000)
    	// 	}
    	// }
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
    	// vm.cerrarTab = function(index){
    		
    	// 	console.log(index);
    	// 	vm.numDetalles.splice(index,1);
    	// 	vm.active = 0;
    	// 	console.log(vm.numDetalles);

    	// }
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
//				 vm.completed=2;
//	             vm.mensajeBuscar = false;
//	             vm.loading = true;
			}
			else{
				$('#checkVacio').slideDown().delay(1500).slideUp();
			}
    	}
    }
    
    ng.module('App').component('busquedaErrorficheros', Object.create(ficheroErrorComponent));
    
})(window.angular);