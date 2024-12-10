(function (ng) {

    //Crear componente de app
    var detReclamacionComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$scope', '$q', '$window', 'sharePropertiesService', '$location', '$mdDialog', 'validacionesService','AseguradoraService', 'BusquedaService', 'SolicitudService', 'PolizaService', 'TiposService', 'uiGridConstants', 'BASE_SRC', 'DescargaService', '$templateCache', 'FicherosService', 'ExportService'],
        require: {
			appParent: '^sdApp',
            parent: '^detalleSd',
            busqueda: '^busquedaApp',
            busquedaReclamaciones: '^?busquedaReclamaciones'
        }
    }
    
    detReclamacionComponent.controller = function detReclamacionComponentControler($scope, $q, $window, sharePropertiesService, $location, $mdDialog, validacionesService, AseguradoraService, BusquedaService, SolicitudService, PolizaService, TiposService, uiGridConstants, BASE_SRC, DescargaService, $templateCache, FicherosService, ExportService) {
        var vm = this;
        vm.db = sharePropertiesService.get('db');
        var url = window.location;
        vm.form = {};
        vm.tipos = {};
        aux = {};
        vm.listaArchivos = [];
        vm.msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);

        $templateCache.put('ui-grid/selectionRowHeaderButtons',
			"<div class=\"ui-grid-selection-row-header-buttons\" ng-class=\"{'ui-grid-row-selected': row.isSelected , 'ui-grid-icon-cancel':!grid.appScope.$ctrl.seleccionable(row.entity), 'ui-grid-icon-ok':grid.appScope.$ctrl.seleccionable(row.entity)}\" ng-click=\"selectButtonClick(row, $event)\"></div>"
	    );
        
        this.$onInit = function (bindings) {

        	if(vm.appParent.getPermissions != undefined){
        		vm.permisos = vm.appParent.getPermissions(510);
        		console.log(vm.permisos);
    		}
        	
            //Recortar la altura dependiendo desde donde se visualizan los detalles del recibo
            if (vm.parent.parent.url == 'reclamaciones')
                vm.medida = 205;
            else if (vm.parent.parent.url == 'clientes' || vm.parent.parent.url == 'polizas')
                vm.medida = 244;
            
          //Recuperar reclamacion para mostrar detalles
            SolicitudService.getSolicitud(vm.parent.datos.ID_SOLICITUD)
            .then(function successCallBack(response) {
                if (response.status == 200) {

                    aux = JSON.parse(JSON.stringify(response.data));
                    vm.datos = response.data;
                    
                    if (vm.datos.LIST_ARCHIVOS != undefined) {
                        vm.listaArchivos = _.toArray(vm.datos.LIST_ARCHIVOS);
                    }
                    
                    //Cambiar formato fecha
                    angular.forEach(vm.datos, function (value, key) {
                        vm.form[key] = {};
                        if (key == "FT_USU_ALTA" || key == "FD_VALIDACION" || key == "FD_CONFIRMACION" || key == "FD_CIERRE" || key == "FD_ENTRADA") {
                            fecha = vm.datos[key];
                            var n2 = vm.datos[key].indexOf(':');
                            values = fecha.substring(0, n2 != -1 ? n2 - 3 : fecha.length);
                            vm.form[key].value = new Date(values);
                        } else
                            vm.form[key].value = vm.datos[key];
                    });
                    
                }
            }, function errorCallBack(response) {
                    $q.all({
                        'datosRequest': validacionesService.getData(),
                        'dictRequest': validacionesService.getDict()
                    }).then(function (data) {
                        vm.form = data.datosRequest.data;
                        vm.dictionary = data.dictRequest.dict;
                    });
                });
            	
    		//Recuperar gestores para el combo de reasignar
            SolicitudService.getUsuariosGestores({"ID_GRUPO_ROL": $window.sessionStorage.rol})
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos.gestores = response.data.USUARIOS;
                }
            });
        }

        this.loadTemplate = function () {
        	 return BASE_SRC + "detalle/detalles.views/detalle.reclamacion.html";
        }
        
        //Modal Reasignar
        vm.reasignar = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/reasignar.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    var md = this
                    md.gestores = vm.tipos.gestores;
                    md.datos = vm.datos;
                    md.perfil = JSON.parse($window.sessionStorage.perfil);
                    md.usuarioReceptor = '';

                    md.reasignarSolicitud = function () {
                        md.datos.CO_USU_RECEPTOR = md.usuarioReceptor;
                        var reasignacion = SolicitudService.getReasignarSolicitud(md.datos);

                        reasignacion.then(function successCallback(response) {
                            if (response.status == 200) {
                                alerta = $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Reasignación correcta')
                                    .textContent('Reasignado a: ' + md.datos.NO_USU_RECEPTOR)
                                    .ok('Cerrar');
                                $mdDialog.show(alerta);
                            }
                        });
                        $mdDialog.cancel();
                    }
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };

                }]
            });
        }


        //Modal Rechazar
        vm.rechazoSolicitud = function () {
            $mdDialog.show({
                templateUrl: BASE_SRC + 'detalle/detalle.modals/rechazarSolicitud.modal.html',
                controllerAs: '$ctrl',
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                fullscreen: false,
                controller: ['$mdDialog', function ($mdDialog) {
                    md = this
                    md.datos = vm.datos;
                    md.perfil = JSON.parse($window.sessionStorage.perfil);
                    md.rechazarSolicitud = function () {
                    	vm.appParent.abrirModalcargar(true);
                        var rechazo = SolicitudService.getRechazarSolicitud(md.datos);
                        md.datos.CO_USU_RECEPTOR = md.perfil.usuario;
                        rechazo.then(function successCallback(response) {
                            if (response.status == 200) {
                            	vm.appParent.cambiarDatosModal('La reclamación ha sido modificada correctamente');
                            	vm.datos = response.data;
                            }
                        });
                    }
                    md.cancel = function () {
                        $mdDialog.cancel();
                    };
                }]
            });
        }
        
		 vm.rechazarSolicitud = function (form) {
	            angular.forEach(form, function (value, key) {
	                form[key].value = undefined;               
	            });
	            return form;
	        }
		 
		 
        //Descargar archivo
        vm.descargarArchivo = function (file) {
        	vm.appParent.abrirModalcargar(true);
            ExportService.downloadFile(file.ID_ARCHIVO)
            .then(function successCallback(response) {
            	vm.appParent.abrirModalcargar(false);
                if (response.status === 200) {
                    saveAs(new Blob([response.data]), file.NO_ARCHIVO);
                }
            }, function callBack(response){
            	vm.appParent.cambiarDatosModal('Se ha producido un error al descargar el archivo');
                if(response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                    $location.path('/');
                }
            });
        };

        vm.deleteFile = function(file) {
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].NO_ARCHIVO === file.NO_ARCHIVO){
					vm.listaArchivos.splice(i,1);
					break;
				}
			}
		}
        
		$(document).on('change', '#file_rec', function() {
            vm.subir();
		});
		
		vm.subir = function() {
			var f = document.getElementById('file_rec').files[0];
			var existe = false;
			for(var i = 0; i < vm.listaArchivos.length; i++){
				if(vm.listaArchivos[i].NO_ARCHIVO === f.name){
					existe = true;
					break;
				}
			}
			if(existe){
				// vm.msg.textContent('Ya existe un archivo con ese nombre');
				// $mdDialog.show(vm.msg);
			} else {
				var reader = new FileReader();
				reader.onload = function(){
					var base64 = reader.result.split("base64,")[1];
					var binary_string = window.atob(base64);
				    var len = binary_string.length;
				    var bytes = [];
				    for (var i = 0; i < len; i++) {
				        bytes.push(binary_string.charCodeAt(i));
				    }
				    
				    var archivo = {
			    		"DESCARGAR": false,
			        	"ARCHIVO": bytes,
			        	"NO_ARCHIVO": f.name,
						"ID_TIPO": 222,
						'ESTADO': 'Pendiente'
			        };
				    
				    vm.listaArchivos.push(archivo);
					
					$scope.$apply();
				}
				reader.readAsDataURL(f);
			}
		}
		
		//Validar la solicitud
		 vm.validarSolicitud = function() {
	            if(vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 3) {
	                if(vm.datos.OPOLIZA.NU_POLIZA == undefined) {
	                    vm.msg.textContent('El número de póliza es obligatorio');
	                    $mdDialog.show(vm.msg);
	                } else {
	                	vm.gestionarSolicitud();
	                }
	            } else {
	                vm.gestionarSolicitud();
	            }
	        }

		 //Gestionar la solicitud
	        vm.gestionarSolicitud = function() {
	            var tipoGestion = undefined;
	            if(vm.datos.OTIPO_SOLICITUD.ID_TIPO_SOLICITUD == 28) {
	                tipoGestion = 'modificarReclamacion';
	            } else {
	                tipoGestion = 'gestionar'
	            }

	            if(tipoGestion != undefined) {

	                if(vm.listaArchivos != undefined && vm.listaArchivos.length > 0) {
	                    vm.datos.LIST_ARCHIVOS = vm.listaArchivos;
	                }

	                if(vm.datos.XM_ENVIADO != null && vm.datos.XM_ENVIADO != undefined){
	                	delete vm.datos.XM_ENVIADO;
	                }
	                
	                if(vm.datos.ID_RESULT != null && vm.datos.ID_RESULT != undefined){
	                    delete vm.datos.ID_RESULT;
	                    delete vm.datos.DS_RESULT;
	                }
	                vm.appParent.abrirModalcargar(true);
	                SolicitudService.gestionarSolicitud(vm.datos, tipoGestion)
	                .then(function successCallBack(response) {
	                    if(response.status == 200) {
	                    	if(response.data.ID_RESULT == 0){
	                            vm.datos = response.data;
	                            
	                            if(vm.busquedaReclamaciones.gridOptions.data != undefined){
	                                var listSolicitudes = vm.busquedaReclamaciones.gridOptions.data;
	                                for(var i = 0; i < listSolicitudes.length; i++){
	                                    if(listSolicitudes[i].ID_SOLICITUD === response.data.ID_SOLICITUD){
	                                        listSolicitudes[i] = response.data;
	                                        break;
	                                    }
	                                }
	                            }

		                        vm.msg.textContent("Reclamación gestionada correctamente")
							    $mdDialog.show(vm.msg);
		                        vm.busquedaReclamaciones.gridOptions.core.refresh();
	                        
	                    	}else {
		                        vm.msg.textContent(response.data.DS_RESULT)
		                        $mdDialog.show(vm.msg);
		                    }
	                    }                     
	                }, function errorCallBack(response) {
	                	vm.appParent.cambiarDatosModal('Se ha producido un error al gestionar la reclamación. Contacte con el administrador');
	    			});
	            }
	        }
            
            
   }
    ng.module('App').component('detReclamacion', Object.create(detReclamacionComponent));

})(window.angular);
        