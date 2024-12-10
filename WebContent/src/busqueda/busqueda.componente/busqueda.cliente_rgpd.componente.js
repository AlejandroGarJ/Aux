
(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$translate', '$timeout', '$interval', '$window', '$mdDialog', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', "ClienteService",  'uiGridConstants','BASE_SRC'],
    		require: {
				parent:'^busquedaApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<',
                isConsultagdpr: '<'
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($translate, $timeout, $interval, $window, $mdDialog,validacionesService, $routeParams, sharePropertiesService, BusquedaService,TiposService, ClienteService, uiGridConstants, BASE_SRC){
    	var vm=this;
    	vm.mensajeBuscar = true;
    	vm.numDetalles = [];
		vm.cargarDetalle = [];
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.screenHeight = $window.innerHeight;
    	    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
            vm.active=0;
    		vm.vista = 1;
    		
    		//Cargar permisos
    		if(vm.parent.parent.getPermissions != undefined){
				vm.permisos = vm.parent.parent.getPermissions("rgpd_clientes");
				vm.parent.ckPermisos = vm.permisos;
    		}
    		
    		//Cargar las listas
			if(localStorage.clientes != undefined && localStorage.clientes != ""){
				vm.gridOptions.data = JSON.parse(localStorage.clientes);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}
			
			if($routeParams.id != undefined && $routeParams.id != null && $routeParams.id != ''){
				if(!vm.numDetalles.includes({'ID_CLIENTE':$routeParams.id})){
	    			vm.numDetalles.push({'ID_CLIENTE':$routeParams.id});
		    		vm.cargarDetalle = true;
		    		$timeout(function(){
		    			vm.active = vm.numDetalles.length;	    			
		    			vm.actives = vm.numDetalles.length+1;
		    			vm.cargarDetalle = false;	    			
		    		},3000)
                }
				vm.vista = 4;
			}
			
			if(vm.permisos != undefined && vm.gridOptions != null && vm.gridOptions.columnDefs != null){
				var indexColumnBorrado = vm.gridOptions.columnDefs.findIndex(x => x.name == "ELIMINAR");
				if (indexColumnBorrado != null && indexColumnBorrado > -1) {
					vm.gridOptions.columnDefs[indexColumnBorrado].visible = vm.permisos.IN_BORRADO;
				}
			}
			
    	}
    	
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;

            vm.active = 0;

            //Si estamos cargando el listado de clientes, recogemos el form del filtro y lo añadimos a una variable
            if (vm.active == 0 && vm.view == 4 && vm.parent.url == "rgpd_clientes") {
                vm.filtroCliente = vm.parent.form;
            }

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            }
    	}
    	
    	this.$doCheck = function(){
    		if(vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
    		
            if (vm.active == 0) {
                vm.parent.url = "rgpd_clientes";
                vm.parent.urlExport = '';
            }
        }

    	//UI.GRID Configurado
    	vm.gridOptions = {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
                paginationPageSize: 30,
                enableAutoFitColumns: true,
                showGridFooter: true,
                gridFooterTemplate: '<div class="leyendaInferior"><div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'clientes\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div></div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
                columnDefs: [
                  {field: 'NU_DOCUMENTO',
    		    	  displayName: 'Documento', width:85,
    		    	  cellTooltip: function(row){return row.entity.NU_DOCUMENTO},//minWidth: "90", width: "*",
    		      	  cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity,\'rgpd_clientes\', row)">{{row.entity.NU_DOCUMENTO}}</a></div>'
    		      },
                  {field: 'NO_NOMBRE_COMPLETO',width:'*', displayName: 'Nombre', cellTooltip: function(row){return row.entity.NO_NOMBRE_COMPLETO}},
    		      {field: 'IN_PUBLICIDAD',width:85, cellTemplate:'<div ng-if="row.entity.NU_PRESUPUESTOS>0 || row.entity.NU_POLIZAS_CONTRATADAS>0" class="ui-grid-cell-contents">{{row.entity.IN_PUBLICIDAD}}</div><div ng-if="row.entity.NU_PRESUPUESTOS==0 && row.entity.NU_POLIZAS_CONTRATADAS==0" class="ui-grid-cell-contents">No disponible</div>', cellTooltip: function(row){return row.entity.IN_PUBLICIDAD}},
    		      {field: 'NU_TELEFONO1',width:85, cellTemplate:'<div ng-if="row.entity.NU_PRESUPUESTOS>0 || row.entity.NU_POLIZAS_CONTRATADAS>0" class="ui-grid-cell-contents">{{row.entity.NU_TELEFONO1}}</div><div ng-if="row.entity.NU_PRESUPUESTOS==0 && row.entity.NU_POLIZAS_CONTRATADAS==0" class="ui-grid-cell-contents">No disponible</div>', cellTooltip: function(row){return row.entity.NU_TELEFONO1}},
    		      {field: 'NO_EMAIL', cellTemplate:'<div ng-if="row.entity.NU_PRESUPUESTOS>0 || row.entity.NU_POLIZAS_CONTRATADAS>0" class="ui-grid-cell-contents">{{row.entity.NO_EMAIL}}</div><div ng-if="row.entity.NU_PRESUPUESTOS==0 && row.entity.NU_POLIZAS_CONTRATADAS==0" class="ui-grid-cell-contents">No disponible</div>', cellTooltip: function(row){return row.entity.NO_EMAIL}},
    	          {field: 'NO_USU_ALTA', displayName: 'Creado por',cellTooltip: function (row) {if (row.entity != undefined) return row.entity.NO_USU_ALTA;}},
    	          {field: 'FT_USU_ALTA',displayName: 'Creado en',cellFilter: 'date:\'dd/MM/yyyy\'',cellTooltip: function (row) {if (row.entity != undefined)return row.entity.FT_USU_ALTA;} },
       		      {name:'ELIMINAR', cellTemplate:'<div class="ui-grid-cell-contents td-trash"><a ng-click="grid.appScope.$ctrl.eliminarCliente(row.entity)"><span style="font-size: small" class="glyphicon glyphicon-trash"></span></a></div>', 
                            width: 36,
					        enableSorting:false, enableColumnMenu:false
					}
    		    ],
    		    onRegisterApi: function( gridApi ) {
                    vm.gridApi = gridApi;
                    if($window.sessionStorage.rol != '1'){
                        vm.gridOptions.columnDefs[8].visible = false;
                    }
					
					vm.parent.translateHeaders(vm.gridOptions);
      		    }
    	}

    	//Función para colorear la fila, en realidad lo pinta en una celda. 
    	//Esta función no vale para clientes y para solicitudes no se recoge este dato.
    	function colorearEstado(entidad){
    		if(entidad.ID_SITUAPOLIZA == 2){
    			return 'filaCancelada';
    		}
    	}
    	
    	//Eliminar 
    	vm.eliminarCliente = function(fila){
        $mdDialog.show({
            templateUrl: BASE_SRC + 'detalle/detalle.modals/delete_cliente.modal.html',
            controllerAs: '$ctrl',
            clickOutsideToClose:true,
            parent: angular.element(document.body),
            fullscreen:false,
            controller:['$mdDialog', function($mdDialog){
            var md = this;
            var jsonBorrar = {
                "ID_CLIENTE":fila.ID_CLIENTE,
                "IT_VERSION":fila.IT_VERSION
            };
            
            md.borrarCliente = function(option){
              if(option){
                ClienteService.borrarClientes(jsonBorrar)
                .then(function successCallback(response){
                  $mdDialog.hide();

                  var clientes = [];
                  for(var i=0;i<vm.gridOptions.data.length;i++){
                    if(vm.gridOptions.data[i].ID_CLIENTE != fila.ID_CLIENTE){
                      clientes.push(vm.gridOptions.data[i]);
                    }
                  }
                  
                  vm.gridOptions.data = clientes;
                  localStorage.clientes = clientes;
                  $mdDialog.cancel();         
				  msg.textContent("Cliente borrado con éxito");
				  $mdDialog.show(msg);
                }, function errorCallback(response){
					msg.textContent("Ha ocurrido un error al eliminar cliente. Contacte con el administrador");
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
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/busqueda.clientes_rgpd.html";
    	}
    	
    	//Borrar casillas al cambiar
    	vm.clearModel = function(){
    		angular.forEach(vm.form, function(value, key) {
    			value.value = "";
    		});
    	}    	
    	
    	//Botón para ver el detalle
    	vm.verDetalle = function(fila, key, index){
    		cargarDetalle(fila);
    	}
    	
    	//Boton de cerrar tabs
    	vm.cerrarTab = function(tab){
    		var index = vm.numDetalles.indexOf(tab);
    		var listaTabs = [];
    		
    		//Para intercambiar clientes en la misma pestaña
    		vm.numDetalles.splice(index,1);
    		
    	}
    	
    	this.resetErrors = function(id) {
            vm.form[id].$error = {};
        }
    	
    	
    	//Función para cargar los datos al abrir el tab.
    	function cargarDetalle(fila){
    		var existe = false;
    		for(var i = 0; i < vm.numDetalles.length; i++){
    			if(vm.numDetalles[i].ID_CLIENTE === fila.ID_CLIENTE){
    				existe = true;
    				break;
    			}
    		}
    		if(!existe) {	
    			
    			//Para intercambiar clientes en la misma pestaña
    			if (vm.numDetalles.length > 0) {
    				vm.numDetalles = [];
        			setTimeout( function () { 
    	    				vm.numDetalles.push(fila);
    	    				vm.active = vm.numDetalles.length;
        				}, 
        			10);
    			} else {
    				vm.numDetalles.push(fila);
    				vm.active = vm.numDetalles.length;
    			}
    			
			} else {
                vm.active = vm.numDetalles.length;
            }
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
    	
    	$interval(function(){
    		for(var i = 1; i <= vm.numDetalles.length; i++){
    			vm.cargarDetalle[vm.numDetalles.length] = false;	  
    		} 			
		},3000);
    	
    }
    
    ng.module('App').component('busquedaClienteRgpd', Object.create(busquedaComponent));
    
})(window.angular);