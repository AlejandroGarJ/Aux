(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', 'ClienteService', '$scope', '$mdDialog', 'PolizaService', 'ConcesionService', 'TiposService', 'SolicitudService', '$templateCache'],
    		require: {
            	parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($q, $location, $timeout, $window,validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, ClienteService, $scope, $mdDialog, PolizaService, ConcesionService, TiposService, SolicitudService, $templateCache) {
    	var vm=this;
    	//vm.db=sharePropertiesService.get('db');
    	var url=window.location;
    	vm.numDetalles = [];
    	vm.nomDetalles = [];
    	vm.cargarDetalle = true;
    	vm.actives = 0;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		$templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
			vm.vista = 1;
			
			//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions('solicitudes_renting_list');
				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		//Cargar las listas

    		ConcesionService.getConcesionesCias({})
            .then(function successCallback(response) {
            	if(response.data != undefined){
            		if(response.data.CONCESIONESCOMPANIAS.CONCESIONCOMPANIA != undefined){
            			vm.listConcesiones = response.data.CONCESIONESCOMPANIAS.CONCESIONCOMPANIA;
                		
    					vm.listConcesiones.sort(function (a, b){
    						if(a.NO_NOMBRE==undefined)
    							a.NO_NOMBRE = "";
    						if(b.NO_NOMBRE==undefined)
    							b.NO_NOMBRE = "";
    						var x = a.NO_NOMBRE.toLowerCase();
    					    var y = b.NO_NOMBRE.toLowerCase();
    					    if (x < y) {return -1;}
    					    if (x > y) {return 1;}
    					    return 0;
    	 				});
            			
            		}
            	}
            }, function errorCallBack(response) {
                
            });	
    		
    		TiposService.getCompania({})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listAseguradoras = response.data.TIPOS.TIPO;
				}
			});
    		
			if(localStorage.renting != undefined && localStorage.renting != ""){
				angular.forEach(vm.parent.pages, function(value, key){
					vm[key] = value;
				});
				
				var info = vm.parent.cargarBusqueda('renting');
				angular.forEach(info, function(value, key){
					vm[key] = value;
				});
			}
			else{
				localStorage.clear();
			}
    	}
    	
    	//Reaccionar los cambios por los componentes
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
    	
    	//UI.GRID Configurado
    	vm.gridOptions = {
    			enableRowSelection: true,
				enableSelectAll: true,
				selectionRowHeaderWidth: 29,
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
				paginationPageSize: 30,
				showGridFooter: true,
				gridFooterTemplate: '<div class="leyendaInferior">' +
                	'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'solicitudes\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
					'<div class="contenedorElemento"><span>Errores</span><span class="elementoLeyenda leyendaRojo"></span></div>' +
                	'<div class="contenedorElemento"><span>Avisos</span><span class="elementoLeyenda leyendaAmarillo"></span></div>' +
                	'<div class="contenedorElemento"><span>Empresa</span><span class="elementoLeyenda leyendaNaranja"></span></div>' +
                	'</div>',
    		    paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
//    		      {name:'Ver', cellTemplate:'<button id="editar" type="submit" class="btn btn-info btn-sm" title="Ver cliente" ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'solicitud\', row)">'+
//		           			'<span style="font-size: small" class="glyphicon glyphicon-eye-open"></span>'+
//		            		 '</button>',
// 	                         width: 36,
// 	                         enableSorting:false, enableColumnMenu : false
//    		      },
    		      {field: 'ID_SOLICITUD', displayName: 'Solicitud', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'renting\', row)">{{row.entity.ID_SOLICITUD}}</a></div>'},
    		      {field: 'OCLIENTE.NO_NOMBRE_COMPLETO', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'cliente\', row)">{{row.entity.OCLIENTE.NO_NOMBRE_COMPLETO}}</a></div>', displayName: 'Concesión'},    		      
    		      {field: 'ODATOS_RENTING.contratoRenovacion', displayName: 'Contrato'},    		      
    		      {field: 'ODATOS_RENTING.matricula', displayName: 'Matrícula'},
    		      {field: 'OPOLIZA.NU_POLIZA', cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'poliza\', row)">{{row.entity.OPOLIZA.NU_POLIZA}}</a></div>', displayName: 'Póliza'},
    		      {field: 'DS_SITUACION_SOLICITUD', displayName: 'Estado'},    		      
    		      {field: 'OPOLIZA.NO_COMPANIA', displayName: 'Aseguradora'},
    		      {field: 'ODATOS_RENTING.fechaCarnetConducir',  cellFilter: 'date:\'dd/MM/yyyy  hh:mm\'', displayName: 'Fecha de carnet'},
    		      {field: 'ODATOS_RENTING.fechaNacimientoConductor', cellFilter: 'date:\'dd/MM/yyyy  hh:mm\'', displayName: 'Fecha de nacimiento'},
    		      {field: 'ODATOS_RENTING.marca', displayName: 'Marca'},
    		      {field: 'ODATOS_RENTING.modelo', displayName: 'Modelo'},    	
    		      {field: 'FD_ENTRADA', cellFilter: 'date:\'dd/MM/yyyy hh:mm\'', displayName: 'Fecha Alta'},
    		      {field: 'FD_VALIDACION', cellFilter: 'date:\'dd/MM/yyyy\  hh:mm\'', displayName: 'Fecha Validación'},
    		      {field: 'FD_CIERRE', cellFilter: 'date:\'dd/MM/yyyy\  hh:mm\'', displayName: 'Fecha Resolución'}
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
    		    	
      		    }
    	}
    	vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.renting.html";
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}
    	
    	vm.confirmarSolicitud = function(){
    		if(vm.listaSeleccionados != undefined && Array.isArray(vm.listaSeleccionados) && vm.listaSeleccionados.length > 0){
    			var existeAseguradora = true;
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				if(vm.listaSeleccionados[i].OPOLIZA == undefined || vm.listaSeleccionados[i].OPOLIZA.ID_COMPANIA == undefined){
    					existeAseguradora = false;
    					break;
    				}
    			}
    			if(!existeAseguradora){
    				msg.textContent("No es posible confirmar las solicitudes seleccionadas dado que existe alguna sin aseguradora asignada");
    				$mdDialog.show(msg);
    			}else{
    				SolicitudService.confirmarSolicitudRenting(vm.listaSeleccionados)
    				.then(function successCallback(response){
    					if(response.status == 200){
    						vm.listAseguradoras = response.data.TIPOS.TIPO;
    					}
    				});
    			}
    		}else{
    			msg.textContent("Seleccione al menos una solicitud");
				$mdDialog.show(msg);
    		}
    	}
    	
    	vm.asignarConcesion = function(){
    		if(vm.listaSeleccionados != undefined && Array.isArray(vm.listaSeleccionados) && vm.listaSeleccionados.length > 0){
    			var existeConcesion = false;
    			for(var i = 0; i < vm.listaSeleccionados.length; i++){
    				if(vm.listaSeleccionados[i].OCLIENTE != undefined && vm.listaSeleccionados[i].OCLIENTE.NO_NOMBRE_COMPLETO != undefined && vm.listaSeleccionados[i].OCLIENTE.NO_NOMBRE_COMPLETO.trim() != ''){
    					existeConcesion = true;
    					break;
    				}
    			}
    			if(!existeConcesion){
    				$mdDialog.show({
    	                templateUrl: BASE_SRC + 'detalle/detalle.modals/asignar_concesion.modal.html',
    	                controllerAs: '$ctrl',
    	                clickOutsideToClose: true,
    	                parent: angular.element(document.body),
    	                fullscreen: false,
    	                controller: ['$mdDialog', function ($mdDialog) {
    	                    var md = this;
    	                    md.listConcesiones = vm.listConcesiones;
    	                    md.concesionSeleccionada = {};
    	                    
    	                    md.asociar = function (concesion) {
    	                    	for(var i = 0; i < vm.listaSeleccionados.length; i++){
    	                    		vm.listaSeleccionados[i].OCLIENTE.ID_CLIENTE = concesion.ID_CLIENTE;
    	                    	}
    	                    	
    	                    	SolicitudService.asociarDatosRenting(vm.listaSeleccionados)
    	        				.then(function successCallback(response){
    	        					if(response.status == 200){
    	        						vm.listAseguradoras = response.data.TIPOS.TIPO;
    	        					}
    	        				});
    	                    }
    	                    
    	                    md.cancel = function () {
    	                        $mdDialog.cancel();
    	                    };
    	                    
    	                }]
    	            })
    			}else{
    				msg.textContent("Al menos una de las solicitudes seleccionadas tienen concesión.");
    				$mdDialog.show(msg);
    			}
    		}else{
    			msg.textContent("Seleccione al menos una solicitud");
				$mdDialog.show(msg);
    		}
    	}
    	
    	vm.asignarAseguradora = function(){
    		if(vm.listaSeleccionados != undefined && Array.isArray(vm.listaSeleccionados) && vm.listaSeleccionados.length > 0){
    			$mdDialog.show({
	                templateUrl: BASE_SRC + 'detalle/detalle.modals/asignar_aseguradora.modal.html',
	                controllerAs: '$ctrl',
	                clickOutsideToClose: true,
	                parent: angular.element(document.body),
	                fullscreen: false,
	                controller: ['$mdDialog', function ($mdDialog) {
	                    var md = this;
	                    md.listAseguradoras = vm.listAseguradoras;
	                    md.aseguradoraSeleccionada = {};
	                    
	                    md.asociar = function (aseguradora) {
	                    	for(var i = 0; i < vm.listaSeleccionados.length; i++){
	                    		vm.listaSeleccionados[i].IN_RESUELVE_ASEGURADORA  = aseguradora.ID_COMPANIA;
	                    	}
	                    	
	                    	SolicitudService.asociarDatosRenting(vm.listaSeleccionados)
	        				.then(function successCallback(response){
	        					if(response.status == 200){
	        						vm.listAseguradoras = response.data.TIPOS.TIPO;
	        					}
	        				});
	                    }
	                    
	                    md.cancel = function () {
	                        $mdDialog.cancel();
	                    };
	                    
	                }]
	            })
    		}else{
    			msg.textContent("Seleccione al menos una solicitud");
				$mdDialog.show(msg);
    		}
    	}
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		vm.llave = {};
            vm.llave = key;
            if(key=='cliente'){
            	if(fila.OCLIENTE != undefined){
            		ClienteService.getCliente({"ID_CLIENTE":fila.OCLIENTE.ID_CLIENTE})
                    .then(function successCallback(response) {
                        vm.detallesCliente = response.data;
                        vm.llave = 'cliente';
                        vm.cargarDetalle(vm.detallesCliente);
                    }, function errorCallBack(response) {
                        
                    });	
            	}
            }else if(key == 'poliza'){
            	if(fila.OPOLIZA != undefined){
                	PolizaService.getPolizasByFilter({ "ID_POLIZA": fila.OPOLIZA.ID_POLIZA })
                    .then(function successCallback(response) {
                        vm.detallesPoliza = response.data.POLIZAS.POLIZA[0];
                        vm.llave = 'poliza';
                        vm.cargarDetalle(vm.detallesPoliza);
                    }, function errorCallBack(response) {

                    });
            	}
            }else if(key == 'renting'){
                vm.cargarDetalle(fila);
            }
    	}
    	
    	vm.cargarDetalle = function(fila) {

            var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
                if(vm.numDetalles[i] != null) {
                    if(vm.numDetalles[i].ID_SOLICITUD === fila.ID_SOLICITUD){
                        existe = true;
                        break;
                    }
    			}
    		}
    		if(!existe) {
    			if(vm.numDetalles.length < 1) {
					vm.numDetalles.push(fila);
					vm.nomDetalles.push(vm.llave);
					vm.active = vm.numDetalles.length;
				} else {
					if(vm.numDetalles[0] == null) {
                        msg.textContent('Hay un nuevo formulario de solicitud abierto');
                        $mdDialog.show(msg);
                    } else {
                        msg.textContent('Ya hay un detalle de solicitud abierto');
                        $mdDialog.show(msg);
                    }
				}
			} else {
                vm.active = vm.numDetalles.length;
            }

        }
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(index){
    		
    		console.log(index);
    		vm.numDetalles.splice(index,1);
    		vm.nomDetalles.splice(index,1);
    		vm.active = 0;
    		console.log(vm.numDetalles);

    	}
    	
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    }

    
    ng.module('App').component('busquedaRenting', Object.create(busquedaComponent));
    
})(window.angular);