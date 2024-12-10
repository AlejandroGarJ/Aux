(function(ng) {	


	//Crear componente de busqeuda
    var busquedaAvisosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', '$timeout', '$window', '$translate', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'BASE_SRC', '$mdDialog', 'FicherosService', 'TiposService', '$scope'],
    		require: {
            	parent:'^busquedaApp',
            	appParent: '^sdApp'
            },
            bindings:{
            	listBusqueda:'<',
            	view:'<',
            	dsActive:'<'
            }
    }
 
    busquedaAvisosComponent.controller = function busquedaAvisosComponentController($q, $location, $timeout, $window, $translate, validacionesService, sharePropertiesService, BusquedaService, BASE_SRC, $mdDialog, FicherosService, TiposService, $scope){
    	var vm=this;
    	var json = {};
		var url=window.location
		vm.numDetalles = [];
		vm.canales = [];
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		vm.vista = 1;
    		
    		if(vm.parent.parent.getPermissions != undefined){
        		vm.permisos = vm.parent.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    			vm.parent.ckPermisos = vm.permisos;
    		}
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

    	this.getGridOptions = function () {
    		var vv = vm;
    		return {
    			enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 30,
                showGridFooter: true,
                enableRowHashing: false,
				gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
                '<div class="contenedorElemento"><a ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
                '</div>',
                paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		    columnDefs: [
					{field: 'IDENTIFICADOR', 
					displayName: 'ID Contrato', enableCellEdit: false, width: '10%',
					cellTemplate: '<div class="ui-grid-cell-contents"><a ng-if="row.entity.ID_ARCHIVO != null" ng-click="grid.appScope.$ctrl.abrirDetalle(row.entity)">{{row.entity.IDENTIFICADOR}}</a></div>',
	                },
				  {field: 'NO_ARCHIVO', displayName: 'Nombre contrato', enableCellEdit: false, 
	                	cellTooltip: function(row){return row.entity.NO_ARCHIVO}},
				  {field: 'FECHA_PREAVISO', displayName: 'Fecha preaviso', enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getFechaPreaviso(row.entity)}}</div>'},
  				  {field: 'DIAS_PREAVISO', displayName: 'Días antes preaviso', enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDiaPreaviso(row.entity)}}</div>'},
  				  {field: 'FECHA_VENCIMIENTO', displayName: 'Fecha vencimiento', enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getFechaVencimiento(row.entity)}}</div>'},
				  {field: 'NU_DIAS_PREAVISO_VENCIMIENTO', displayName: 'Días antes vencimiento', enableCellEdit: false},
				  {field: 'NO_RUTA', displayName: 'Ruta', enableCellEdit: false, 
	                	cellTooltip: function(row){return row.entity.NO_RUTA}},
                    {
                        name: ' ',
                        cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center"><a ng-if="row.entity.ID_ARCHIVO != null" ng-click="grid.appScope.$ctrl.descargarArchivo(row.entity)" style="font-family: TelefonicaWebRegular;font-size: 1em;"><i class="fas fa-download" style="margin-right: 5px"></i></a></div>',
                        width: '5%',
                    },
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		    }
    		}
    	}
    	
    	vm.gridOptions = this.getGridOptions();
		
		vm.seleccionable = function(fila) {
			return true;
		}
    	
    	//Cargar la plantilla de busqueda
    	this.loadTemplate = function() {
			return BASE_SRC+"busqueda/busqueda.view/admin/busqueda.avisos.html";
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
    	
    	//Descargar archivo
    	vm.descargarArchivo = function (archivo) {
    		var obj = {
                "ID_ARCHIVO": archivo.ID_ARCHIVO,
                "ID_TIPO_ARCHIVO": archivo.ID_TIPO_ARCHIVO,
                "NO_ARCHIVO": archivo.NO_ARCHIVO,
                "NO_RUTA_ORIGEN": archivo.NO_RUTA
            }
    		
    		vm.appParent.abrirModalcargar(true);
    		FicherosService.download(archivo.ID_ARCHIVO)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data != null){
						saveAs(new Blob([response.data]), archivo.NO_ARCHIVO);
						msg.textContent($translate.instant('MSG_FILE_DOWNLOADED'));
						$mdDialog.show(msg);
					}else{
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response) {
					if(response.status == 500){
						msg.textContent($translate.instant('ERROR_DOWNLOAD_FILE'));
						$mdDialog.show(msg);
					}
			});
    	}
    	
    	vm.getFechaPreaviso = function (data) {
    		var fecha = "";
    		if (data != null && data.NU_DIAS_PREAVISO != null && typeof data.NU_DIAS_PREAVISO == "string") {
    			var fechaPreavisoSplit = data.NU_DIAS_PREAVISO.split(",");
    			if (fechaPreavisoSplit.length == 2) {
                    fecha = fechaPreavisoSplit[0];
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getDiaPreaviso = function (data) {
    		var fecha = "";
    		if (data != null && data.NU_DIAS_PREAVISO != null && typeof data.NU_DIAS_PREAVISO == "string") {
    			var fechaPreavisoSplit = data.NU_DIAS_PREAVISO.split(",");
    			if (fechaPreavisoSplit.length == 2) {
                    fecha = fechaPreavisoSplit[1];
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getFechaVencimiento = function (data) {
    		var fecha = "";
    		if (data != null && data.FD_VENCIMIENTO != null && typeof data.FD_VENCIMIENTO == "string") {
    			var fechaVencimiento = new Date(data.FD_VENCIMIENTO);
    			if (fechaVencimiento != null) {
                    fecha = moment(fechaVencimiento).format('DD/MM/YYYY');
    			}
    		}
    		return fecha;
    	}
    	
    	vm.getDiaVencimiento = function (data) {
    		var fecha = "";
    		if (data != null && data.FD_VENCIMIENTO != null && typeof data.FD_VENCIMIENTO == "string") {
    			var fechaVencimientoSplit = data.FD_VENCIMIENTO.split(",");
    			if (fechaVencimientoSplit.length == 2) {
                    fecha = fechaVencimientoSplit[1];
    			}
    		}
    		return fecha;
    	}
    	
    	//Mostrar detalle del aviso
    	vm.abrirDetalle = function (archivo) {
    		$mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/detalle_aviso.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this;
                    md.archivo = archivo;
                    md.form = {};
                    md.minDate = new Date();
                    
                    md.$onInit = function(){
                		if(archivo != null && archivo.FD_VENCIMIENTO != null && archivo.FD_VENCIMIENTO != ""){
                			var fdVencimientoSplit = archivo.FD_VENCIMIENTO.split(',');
                			if (fdVencimientoSplit.length == 2) {
                        		md.form.FD_VENCIMIENTO = md.dateStringToDate(fdVencimientoSplit[0]);
                        		md.form.NU_DIAS_VENCIMIENTO = parseInt(fdVencimientoSplit[1]);
                			}
                		}
                		if(archivo != null && archivo.NU_DIAS_PREAVISO != null && archivo.NU_DIAS_PREAVISO != ""){
                			var diasPreavisoSplit = archivo.NU_DIAS_PREAVISO.split(',');
                			if (diasPreavisoSplit.length == 2) {
                        		md.form.FD_PREAVISO = md.dateStringToDate(diasPreavisoSplit[0]);
                        		md.form.NU_DIAS_PREAVISO = parseInt(diasPreavisoSplit[1]);
                			}
                		}
                	}
                    
                    md.dateStringToDate = function (date) {
                    	if (date != null && typeof date == "string") {
                    		var dateSplit = date.split("/");
                    		var day = dateSplit[0];
                    		var month = dateSplit[1];
                    		var year = dateSplit[2];
                    		return new Date(year + "-" + month + "-" + day);
                    	} return "";
                    }
                    
                    md.guardar = function () {
                    	if(!md.formAviso) {
                    		md.form.FD_PREAVISO = moment(md.form.FD_PREAVISO).format('DD/MM/YYYY');
                    		md.form.FD_VENCIMIENTO = moment(md.form.FD_VENCIMIENTO).format('DD/MM/YYYY');
                    		
                    		md.archivo.NU_DIAS_PREAVISO =  md.form.FD_PREAVISO + "," + md.form.NU_DIAS_PREAVISO;
                    		md.archivo.FD_VENCIMIENTO = md.form.FD_VENCIMIENTO + "," + md.form.NU_DIAS_VENCIMIENTO;

                    		md.cargar = true;
                    		FicherosService.avisoFinContrato([md.archivo])
                            .then(function successCallback(response) {
                        		md.cargar = false;
                                $mdDialog.cancel();
                                if (response.data.ID_RESULT == 0) {
                                    msg.textContent("Se ha guardado correctamente");
                                    vm.parent.recargarListado();
                                } else {
                                    msg.textContent("Ha ocurrido un error al guardar el aviso.");
                                }
                                $mdDialog.show(msg);
                            }, function errorCallback(response) {
                        		md.cargar = false;
                                msg.textContent("Ha ocurrido un error al guardar el aviso.");
                                $mdDialog.show(msg);
                                if (response.status == 406) {
                                    vm.parent.parent.logout();
                                }
                            })
                        } else {
                            objFocus = angular.element('.ng-empty.ng-invalid-required:visible').first();
                            if(objFocus != undefined) {
                                objFocus.focus();
                            }
                        }
                    }
                    
                    md.cancel = function () {
                    	$mdDialog.cancel();
                    }

                }]
            });
    	}
    }

    
    ng.module('App').component('busquedaAvisos', Object.create(busquedaAvisosComponent));
    
})(window.angular);