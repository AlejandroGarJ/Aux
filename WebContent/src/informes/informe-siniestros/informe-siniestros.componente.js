(function(ng) {	


	//Crear componente de busqeuda
    var informesSiniestrosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$templateCache', '$scope', 'TiposService', 'BASE_SRC', 'ExportService', 'ColectivoService', '$mdDialog', '$window', '$q', '$translate', 'BusquedaService', 'DescargaService', 'ReciboService', 'UsuarioService', 'AseguradoraService', 'constantsTipos'],
    		require: {
            	parent:'^sdApp'
            }
    }
 
    informesSiniestrosComponent.controller = function informesSiniestrosComponentController($templateCache, $scope, TiposService, BASE_SRC, ExportService, ColectivoService, $mdDialog, $window, $q, $translate, BusquedaService, DescargaService, ReciboService, UsuarioService, AseguradoraService, constantsTipos) {
    	var vm = this;
		vm.tipos = {};
		vm.colectivos = {};
		vm.option = 0;
		var msg = $mdDialog.alert() .ok('Aceptar') .clickOutsideToClose(true);
		vm.cargando = false;
		vm.form = {};
        vm.tipos.programa = [];
        vm.tipos.productos = [];
		vm.myDateFormat =  owDateFormat('MM/YYYY');
		vm.maxDate = new Date();
		vm.productosMulti = [];
		vm.selectedmodelProductos = [];
		vm.mostrarRecibos = false;
		vm.listaSeleccionados = [];
		vm.listaPadres = {
			1: false,
			2: false,
			3: false,
			4: false
		}
	    vm.fechaLiqRecibo = "FD_LIQ_IPS";
		vm.fechaMes = null;
		vm.fdCriterioFrom = null;
		vm.fdCriterioTo = null;
		vm.exports = false;
		vm.isSelected = true;
		vm.isBordero = false;
		vm.maxDateTo = new Date(vm.maxDate.getFullYear(), vm.maxDate.getMonth() + 1, vm.maxDate.getDate());
		vm.minDateTo = new Date();
		
		vm.mostrarRecibos = false;
		vm.tipoInforme = -14;
		vm.ID_PROGRAMA = [];
		vm.LIQ_TEL = false;
		vm.cargando = false;
    	
    	this.$onInit = function(){
    		$templateCache.put('ui-grid/selectionRowHeaderButtons',"<div class=\"ui-grid-selection-row-header-buttons ui-grid-icon-ok\" ng-class=\"{'ui-grid-row-selected': row.isSelected}\" ng-click=\"selectButtonClick(row, $event)\">&nbsp;</div>");
    		
			var perfil = JSON.parse($window.sessionStorage.perfil);
    		vm.tipos.colectivosProducto = vm.getEstructuraColectivo();

            var colectivosGrouped = vm.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
            vm.tipos.colectivosProducto = vm.sortColectivos(colectivosGrouped);
            
            if (perfil != null) {
                if (perfil.productos != null && perfil.productos.length > 0) {
            		var programa = null;
    				
    				for (var i = 0; i < perfil.productos.length; i++) {
    					var programa = perfil.productos[i];
    					
    					//Añadimos el producto
    		    		vm.tipos.productos.push({
    		    			ID_PRODUCTO: programa.ID_PRODUCTO,
    		    			DS_PRODUCTO: programa.DS_PRODUCTO,
    		    			NO_PRODUCTO: programa.NO_PRODUCTO,
    		    			ID_PROGRAMA: programa.ID_PROGRAMA,
							DS_PROGRAMA: programa.DS_PROGRAMA,
	                        ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
	                        DS_TIPO_POLIZA: vm.getDsColectivo(programa.ID_TIPO_POLIZA)
    		    		});
    		    		
    		    		//Añadir al listado de productos múltiples
    		    		if (vm.productosMulti.findIndex(x => x.id == programa.ID_PRODUCTO) == -1) {
							vm.productosMulti.push({
								id: programa.ID_PRODUCTO,
								label: programa.DS_PRODUCTO,
								ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
								DS_TIPO_POLIZA: vm.getDsColectivo(programa.ID_TIPO_POLIZA)
							});
    		    		}
    		    		
    		    		//Comprobamos si el programa está ya en la lista. Si no está, se añade
    					var existePrograma = vm.tipos.programa.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
    					if (existePrograma == -1) {
    						vm.tipos.programa.push({
    							ID_PROGRAMA: programa.ID_PROGRAMA,
    							DS_PROGRAMA: programa.DS_PROGRAMA,
    							IN_PARTICULAR: programa.IN_PARTICULAR
    						})
    					}
    					
    				}

    				if (vm.tipos.programa.length == 1) {
    					vm.ID_PROGRAMA = [];
    					vm.ID_PROGRAMA.push(vm.tipos.programa[0].ID_PROGRAMA);
    					vm.changePrograma();
    				}
                }
            }
            
            if (perfil != undefined) {
                vm.colectivos = perfil.colectivos;
            }
            
            if(vm.parent.listServices.listCanales != null && vm.parent.listServices.listCanales.length > 0){
    			vm.tipos.canales = vm.parent.listServices.listCanales;
    		} else {
    			TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.canales = response.data.TIPOS.TIPO;
    					vm.parent.listServices.listCanales = vm.tipos.canales;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		TiposService.getMedioPago()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.pago = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getCompania()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.compania = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getRamos()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.ramos = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		TiposService.getComisionista()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.comisionistas = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});

			TiposService.getEstadosSiniestro()
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.estados = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});

			ColectivoService.getListColectivos({})
			.then(function succesCallback(response) {
				if(response.status == 200){
					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
			
			UsuarioService.getUsuariosByFilter({'ID_COMPANIA': '2', 'ID_TIPOCOLECTIVO': '116'})
			.then(function succesCallback(response) {
				if(response.status == 200){
					vm.clients = response.data.USUARIOS;
				}
			}, function callBack(response) {
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
			
			AseguradoraService.getAseguradorasByFilter({ IN_COMISIONISTA: false, IN_REASEGURADORA: false })
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.proveedores = response.data.ASEGURADORAS;
				}
			}, function successCallback(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});
    	}
    	
    	vm.getDsColectivo = function (idColectivo) {
        	var listColectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
        	var dsColectivo = "";
        	
        	if (listColectivos != null && listColectivos.length > 0) {
        		var colectivo = listColectivos.find(x => x.ID_TIPO_POLIZA == idColectivo);
        		
        		if (colectivo != null) {
        			dsColectivo = colectivo.DS_TIPO_POLIZA;
        		}
        	}
        	
        	return dsColectivo;
        }
    	
        vm.dateFormat = function dateFormat(fecha){
			var fechaFormat = moment(fecha).format('DD/MM/YYYY')
            return fechaFormat;
        }
    	
    	this.loadTemplate = function(){
    		return BASE_SRC+'informes/informe-siniestros/informe.siniestros.view.html';
    	}
    	
		vm.exportarExcel = function() {
			if(Object.keys(vm.form).length != 0 && vm.form != undefined) {

				var fdLista = ["FT_SITUACION_FROM", "FT_SITUACION_TO", "FT_MOV_FROM", "FT_MOV_TO", "FD_SAP", "FD_SAP_HASTA", "FD_CRITERIO_FROM", "FD_CRITERIO_TO", "FD_APERTURA_FROM", "FD_APERTURA_TO", "FD_OCURRENCIA_FROM", "FD_OCURRENCIA_TO", "FT_FROM", "FT_TO", "FD_CIERRE_FROM", "FD_CIERRE_TO", "FD_TERMINACION_FROM", "FD_TERMINACION_TO", "FD_LIQUIDADO_FROM", "FD_LIQUIDADO_TO"];
				
				//Formatear fechas
				for (var i = 0; i < fdLista.length; i++) {
					if (vm.form[fdLista[i]] != null) {
						vm.form[fdLista[i]] = vm.parent.dateFormat(vm.form[fdLista[i]]);
					}
				}
				
				var informe = JSON.parse(JSON.stringify(vm.form));
				if((vm.tipoInforme == -14 || vm.tipoInforme == -15) && vm.tipo == 'movimientos'){
					vm.tipoInforme = -15;
				} else if((vm.tipoInforme == -14 || vm.tipoInforme == -15) && vm.tipo =='detalle'){
					vm.tipoInforme = -14;
				}
				
				informe.LIMIT = 50;
				informe.TIPO_INFORME = vm.tipoInforme;
				informe.IS_SELECTED = vm.isSelected;
				
				vm.cargando = true;
				vm.mostrarRecibos = false;
				ExportService.exportarInformes(informe)
				.then(function successCallback(response) {
					if(response.status == 200) {

						let utf8decoder = new TextDecoder();
                        mensajeUArchivo = utf8decoder.decode(response.data);
                        if(mensajeUArchivo.search('ID_RESULT') != -1) {
        					vm.gridInformesLiq.data = [];
                        	objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                        	if(objtMensajeUArchivo.ID_RESULT != 0) {
                        		vm.cargando = false;
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
                        	} else { 
//                         		saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_informe_exportado.xlsx');
// 						        vm.cargando = false;
                        	}
                        } else {
							if(vm.isSelected == false) {
								vm.cargando = false;
								vm.mostrarRecibos = true;
								vm.gridInformesLiq.data = JSON.parse(mensajeUArchivo);
								vm.exports = true
								vm.isSelected = true;
							} else {
								saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_informe_exportado.xlsx');
								vm.cargando = false;
                        	}
						}
					}
					vm.mostrarRecibos = true;
				}, function errorCallBack(response) {
					vm.mostrarRecibos = true;
					vm.cargando = false;
					msg.textContent('Ha ocurrido un error al exportar');
					$mdDialog.show(msg);
				});
			} 
		}

		vm.exportarPDF = function() {
			if(Object.keys(vm.form).length != 0 && vm.form != undefined) {
				
				var fdLista = ["FD_SAP", "FD_SAP_HASTA", "FD_CRITERIO_FROM", "FD_CRITERIO_TO", "FD_APERTURA_FROM", "FD_APERTURA_TO", "FD_OCURRENCIA_FROM", "FD_OCURRENCIA_TO", "FD_CIERRE_FROM", "FD_CIERRE_TO"];
				
				//Formatear fechas
				for (var i = 0; i < fdLista.length; i++) {
					if (vm.form[fdLista[i]] != null) {
						vm.form[fdLista[i]] = vm.parent.dateFormat(vm.form[fdLista[i]]);
					}
				}
				
				var informe = JSON.parse(JSON.stringify(vm.form));
				if(vm.tipoInforme == 'auditores' && informe.OCLIENTE != undefined) {
					informe.ID_CLIENTE = vm.form.OCLIENTE.ID_CLIENTE;
					delete informe.OCLIENTE;
				}
				informe.LIMIT = 50;
				informe.TIPO_INFORME = vm.tipoInforme;
				
                if (informe.TIPO_INFORME == -9) {
//                	informe.IN_ENVIO_LIQ = true;
                	
                	if (informe.FD_SAP_HASTA == null) {
                		informe.FD_SAP_HASTA = vm.parent.dateFormat(new Date());
                	}
                }

				vm.cargando = true;
				ExportService.exportarInformesPDF(informe)
				.then(function successCallback(response) {
					if(response.status == 200) {

						let utf8decoder = new TextDecoder();
                        mensajeUArchivo = utf8decoder.decode(response.data);
                        if(mensajeUArchivo.search('ID_RESULT') != -1) {
                        	objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
                        	if(objtMensajeUArchivo.ID_RESULT != 0) {
                        		vm.cargando = false;
								msg.textContent(objtMensajeUArchivo.DS_RESULT);
								$mdDialog.show(msg);
                        	} else { 
//                         		saveAs(new Blob([response.data], { type: 'application/pdf' }), 'informe_exportado.pdf');
// 						        vm.cargando = false;
                        	}
                        } else {
                        	saveAs(new Blob([response.data], { type: 'application/pdf' }), 'informe_exportado.pdf');
							vm.cargando = false;
                        }
					}			
					
				}, function errorCallBack(response) {
					vm.cargando = false;
					msg.textContent('Ha ocurrido un error al exportar');
					$mdDialog.show(msg);
				});
			}
		}
		
		vm.changeFechaMes = function () {
			if (vm.fechaMes != null) {
				if (vm.form == null) {
					vm.form = {}
				}
				
				if (vm.option != 26) {
					vm.form.FT_SAP = null;
					vm.form.FT_FROM = moment(vm.fechaMes).format('YYYY-MM-DD');
					
					var ftTo = new Date(vm.fechaMes.getFullYear(), vm.fechaMes.getMonth() + 1, 0);
					vm.form.FT_TO = moment(ftTo).format('YYYY-MM-DD');
				} else {
					vm.form.FD_INICIO_FROM = moment(vm.fechaMes).format('YYYY-MM-DD');
					
					var ftTo = new Date(vm.fechaMes.getFullYear(), vm.fechaMes.getMonth() + 1, 0);
					vm.form.FD_INICIO_TO = moment(ftTo).format('YYYY-MM-DD');
				}
			}
		}
		
		vm.changeFechaMesMediador = function (fecha) {
			if (vm.fechaMes != null) {
				if (vm.form == null) {
					vm.form = {}
				}
				vm.form[fecha + "FROM"] = moment(vm.fechaMes).format('YYYY-MM-DD');
				
				var ftTo = new Date(vm.fechaMes.getFullYear(), vm.fechaMes.getMonth() + 1, 0);
				vm.form[fecha + "TO"] = moment(ftTo).format('YYYY-MM-DD');
			}
		}

		vm.changeFechaMesPartner = function (fecha) {
			if(vm.fdCriterioFrom != null || vm.fdCriterioTo != null) {
				if(vm.form == null) {
					vm.form = {};
				}
				vm.fdCriterioTo = new Date(vm.fdCriterioFrom.getFullYear(), vm.fdCriterioFrom.getMonth() + 1, vm.fdCriterioFrom.getDate());
				vm.form[fecha] = moment(new Date(vm.fdCriterioFrom.getFullYear(), vm.fdCriterioFrom.getMonth(), 20)).format('YYYY-MM-DD');
				vm.form['FD_CRITERIO_TO'] = moment(new Date(vm.fdCriterioFrom.getFullYear(), vm.fdCriterioFrom.getMonth() + 1, 19)).format('YYYY-MM-DD');
			}
		}

		vm.generarInforme = function(tipoInforme, visualizar) {
			//Si es IPS, añadir todos los productos
			if ((tipoInforme == "impuestosMensual" || tipoInforme == "tireaTXTMensual") && vm.form.IN_PENDIENTES != true) {
				vm.ID_PROGRAMA = [];
				for (var i = 0; i < vm.tipos.programa.length; i++) {
					if (vm.tipos.programa[i].IN_PARTICULAR == '2') {
						vm.ID_PROGRAMA.push(vm.tipos.programa[i].ID_PROGRAMA);
					}
				}
				vm.changePrograma();
			}
			//Comprobar que en IPS y Tirea se hayan seleccionado productos
			if ((tipoInforme == "impuestosMensual" || tipoInforme == "tireaTXTMensual") && (vm.ID_PROGRAMA == null || vm.ID_PROGRAMA.length == 0)) {
				var confirm = $mdDialog.confirm()
					.textContent('No se ha seleccionado ningún producto, ¿seleccionamos todos?')
					.ariaLabel('Confirm')
					.ok('Aceptar')
					.cancel('Cancelar');
	
				$mdDialog.show(confirm).then(function() {
					vm.ID_PROGRAMA = [];
					for (var i = 0; i < vm.tipos.programa.length; i++) {
						if (vm.tipos.programa[i].IN_PARTICULAR == '2') {
							vm.ID_PROGRAMA.push(vm.tipos.programa[i].ID_PROGRAMA);
						}
					}
					vm.changePrograma();
					vm.generarInforme(tipoInforme, visualizar);
					return null;
				}, function() {
					return null;
				});
				return null;
			}
	
			if (tipoInforme != "preciarioSemanal") {
				var fdLista = ["FD_SAP", "FD_SAP_HASTA", "FD_CRITERIO_FROM", "FD_CRITERIO_TO", "FT_FROM", "FT_TO", "FD_TO", "FD_FROM", "FD_TERMINACION_FROM", "FD_TERMINACION_TO", "FD_LIQUIDADO_FROM", "FD_LIQUIDADO_TO", "FD_EMISION_FROM", "FD_EMISION_TO", "FD_INICIO_FROM", "FD_INICIO_TO"];
				
				//Formatear fechas
				for (var i = 0; i < fdLista.length; i++) {
					if (vm.form[fdLista[i]] != null) {
						vm.form[fdLista[i]] = vm.parent.dateFormat(vm.form[fdLista[i]]);
					}
				}
			}

			if (vm.form.ID_PROGRAMA != null) {
				var dsPrograma = vm.tipos.programa.find(x => x.ID_PROGRAMA == vm.form.ID_PROGRAMA);
				if (dsPrograma != null) {
					vm.form.DS_PROGRAMA = dsPrograma.DS_PROGRAMA;
				}
			}

			if ((tipoInforme == "borderoMensual" || tipoInforme == "renovaciones") && vm.ID_PROGRAMA != null) {
				vm.form.ID_PROGRAMA = vm.ID_PROGRAMA;
				// vm.form.LST_ID_COMP_RAMO_PROD = [vm.ID_PROGRAMA];
			}
			
			vm.form.IS_FICHERO = !visualizar;

			if (tipoInforme == "borderoSiniestros") {
				vm.form.IS_FICHERO = true;
				if (vm.form.LST_ID_TIPO_POLIZA != null) {
					delete vm.form.LST_ID_TIPO_POLIZA;
				}
			}

			if (tipoInforme == "informeLOVYS" || tipoInforme == "reportBBVA") {
				vm.form.IS_FICHERO = undefined;
			}

			vm.cargando = true;
			vm.mostrarRecibos = false;
			
			ExportService.reports(vm.form, tipoInforme)
			.then(function successCallback(response) {
				if(response.status == 200) {
					if (response.data.ID_RESULT == 0 && response.data.LST_ADJUNTOS != null && response.data.LST_ADJUNTOS.length > 0 && visualizar != true) {
						
						if (response.data.LST_ADJUNTOS[0].ARCHIVO) {
							var binary = '';
							var bytes = new Uint8Array(response.data.LST_ADJUNTOS[0].ARCHIVO);
							var len = bytes.byteLength;
							for (var i = 0; i < len; i++) {
								binary += String.fromCharCode( bytes[ i ] );
							}
							
							var formato = "";
							
							if (response.data.LST_ADJUNTOS[0].NO_ARCHIVO != null) {
								formato = response.data.LST_ADJUNTOS[0].NO_ARCHIVO.split('.');	
								
								if (formato.length > 0 && formato[1] != null) {
									formato = formato[1];
								} else if (tipoInforme == "tireaTXTMensual") {
									formato = "octet-stream";
								} else {
									response.data.LST_ADJUNTOS[0].NO_ARCHIVO += ".xls";
									formato = "xls";
								}
							} else {
								if (tipoInforme == "tireaTXTMensual") {
									formato = "octet-stream";
									var nombreTirea = "C0810_Q0001_REC_" + moment(new Date()).format('YYYYMMDDhhmmss');
									response.data.LST_ADJUNTOS[0].NO_ARCHIVO = nombreTirea;
								} else {
									formato = "xls";
									response.data.LST_ADJUNTOS[0].NO_ARCHIVO = tipoInforme;
								}
							}

							DescargaService.descargarArchivo(response.data.LST_ADJUNTOS[0].NO_ARCHIVO, formato, window.btoa(binary));
							
							msg.textContent("Se ha generado el informe correctamente");
						} else if (response.data.LST_ADJUNTOS[0].DS_RESULT != null) {
							msg.textContent(response.data.LST_ADJUNTOS[0].DS_RESULT);
							$mdDialog.show(msg);
						} else {
							msg.textContent('Ha ocurrido un error al generar el informe');
							$mdDialog.show(msg);
						}						
						vm.exports = true;
					} else if (response.data.ID_RESULT == 0 && response.data.LST_RECIBOS != null && response.data.LST_RECIBOS.length > 0) {
						vm.mostrarRecibos = true;
						vm.gridInformesLiq.data = response.data.LST_RECIBOS;
						
						vm.exports = true;
					} else {
						msg.textContent($translate.instant('NOT_FOUND_RESULTS'));
						$mdDialog.show(msg);
						vm.gridInformesLiq.data = [];
					}
					vm.mostrarRecibos = true;
				} else {
					msg.textContent('Ha ocurrido un error al generar el informe');
					$mdDialog.show(msg);
				}		
				vm.cargando = false;
				
			}, function errorCallBack(response) {
				vm.cargando = false;
				msg.textContent('Ha ocurrido un error al generar el informe');
				$mdDialog.show(msg);
			});
		}
		
		vm.getProductosByPrograma = function () {
			var listaProductos = [];
			if (vm.ID_PROGRAMA != null && vm.ID_PROGRAMA.length > 0) {
				for (var i = 0; i < vm.tipos.productos.length; i++) {
					var producto = vm.tipos.productos[i];
					if (vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA) && !listaProductos.includes(producto.CO_PRODUCTO)) {
						listaProductos.push(producto.CO_PRODUCTO);
					}
				}
			}
			
			return listaProductos;
		}
		
		vm.getFicherosReport = function (tipo) {
			ExportService.getFicherosReport(tipo)
			.then(function successCallback(response) {
				if(response.status == 200) {
					if (response.data.ID_RESULT == 0 && response.data.LST_ADJUNTOS != null && response.data.LST_ADJUNTOS.length > 0) {
						
						if (response.data.LST_ADJUNTOS[0].ARCHIVO) {
							var binary = '';
						    var bytes = new Uint8Array(response.data.LST_ADJUNTOS[0].ARCHIVO);
						    var len = bytes.byteLength;
						    for (var i = 0; i < len; i++) {
						        binary += String.fromCharCode( bytes[ i ] );
						    }
						    
						    var formato = response.data.LST_ADJUNTOS[0].NO_ARCHIVO.split('.');
						    
						    if (formato.length > 0 && formato[formato.length - 1] != null) {
						    	formato = formato[formato.length - 1];
						    }
						    
						    DescargaService.descargarArchivo(response.data.LST_ADJUNTOS[0].NO_ARCHIVO, formato, window.btoa(binary));
						} else {
//							Si no existe el campo ARCHIVO, se hace la petición de descargar enviando el ID_ARCHIVO
//							var id = response.data.LST_ADJUNTOS[0].ID_ARCHIVO;
//							var nombre = response.data.LST_ADJUNTOS[0].NO_ARCHIVO;
//							vm.downloadFile(id, nombre);
							msg.textContent('Ha ocurrido un error al generar el informe');
							$mdDialog.show(msg);
						}
					}
				}		
			}, function errorCallBack(response) {
				vm.cargando = false;
				msg.textContent('Ha ocurrido un error al generar el informe');
				$mdDialog.show(msg);
			});
		}
		
		vm.downloadFile = function (id, nombre) {
			ExportService.downloadFile(id)
            .then(function successCallback(response) {
            	let utf8decoder = new TextDecoder();
				var mensajeUArchivo = utf8decoder.decode(response.data);
				var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
				if(objtMensajeUArchivo.ID_RESULT != null && objtMensajeUArchivo.ID_RESULT != 0) {
					vm.cargando = false;
					msg.textContent(objtMensajeUArchivo.DS_RESULT);
					$mdDialog.show(msg);
				} else {
					saveAs(new Blob([response.data]), nombre);
				}
            }, function callBack(response){
                vm.msg.textContent("Se ha producido un error al descargar el archivo");
                $mdDialog.show(vm.msg);
                if(response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
		}
		
		vm.validarFormulario = function(form2Validate, tipoExport, tipoInforme, visualizar) {
			if(!form2Validate && tipoInforme != "preciarioSemanal") {
				objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Seleccione los datos necesarios para exportar');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
			} else {
				if(tipoExport == 'pdf') {
					vm.exportarPDF();
				} else if (tipoExport == 'xls') {
					vm.exportarExcel();
				} else if (tipoExport == 'informe') {
					vm.generarInforme(tipoInforme, visualizar);
				}
			}
		}
		
		//Limpiar formulario
    	vm.limpiar = function(form) {
			if(vm.option != 117) {
				angular.forEach(form, function(value,key){
					form[key] = undefined;
				});
			}
    		vm.mostrarRecibos = false;
			vm.listaSeleccionados = [];
			vm.fechaMes = null;
			vm.fdCriterioFrom = null;
			vm.fdCriterioTo = null;
			vm.ID_PROGRAMA = [];
			vm.tipos.colectivosProducto = vm.getEstructuraColectivo();
			vm.gridInformesLiq.data = [];
			return form;
		}

		vm.querySearchAsync = function(query) {
    		if(query.length >= 3){
	    		var deferred = $q.defer();
	    		BusquedaService.buscar({"NO_NOMBRE_COMPLETO":query}, "clientes")
		 		.then(function successCallback(response){
		 			if(response.data.NUMERO_CLIENTES > 0){
		 				vm.clientes = response.data.CLIENTES.CLIENTE;
		 				deferred.resolve(response.data.CLIENTES.CLIENTE);
		 			}
		 			else{
		 				vm.clientes = [];
		 			}
    		    });
    		   return deferred.promise;
    		}
    		else{
    			vm.clientes = [];
    		}
    	}
		
		vm.getProductos = function (tipo) {
			vm.listProductos = [];
			TiposService.filtroReport(tipo)
	 		.then(function successCallback(response){
	 			if(response.data.ID_RESULT == 0){
	 				vm.listProductos = response.data.LST_PRODUCTOS;
	 			} else {
	 				vm.listProductos = [];
	 			}
		    });
		}
		
//Liquidar mediador
		vm.liquidarMediador = function() {
			var noUsuMod = JSON.parse(vm.parent.perfil).usuario;
			var idTipo = 0;
			var listRecibos = [];
			if(vm.listaSeleccionados.length != 0) {
				
				mostrar = true;
				for(var i = 0; i < vm.listaSeleccionados.length; i++){
					if(vm.listaSeleccionados[i].IN_ENVIO_LIQ_SAP == true){
						mostrar = false;
					}
		
                    listRecibos.push({ ID_RECIBO_H: vm.listaSeleccionados[i].ID_RECIBO_H });
                }
				
				if(mostrar != false) {
					
					$mdDialog.show({
		                templateUrl: BASE_SRC + 'busqueda/busqueda.modals/add_observacion_recibo.modal.html',
		                controllerAs: '$ctrl',
		                clickOutsideToClose: true,
		                parent: angular.element(document.body),
		                fullscreen: false,
		                controller: ['$mdDialog', function ($mdDialog) {
		                	var re = this;
		                	re.aceptar = function () {
		                		re.cancel();
			        			vm.cargando = true;
			        			vm.mostrarRecibos = false;
		                		ReciboService.updateLiquidacionesRecibos(listRecibos, re.obs, idTipo, noUsuMod)
		            			.then(function successCallback(response) {
		    						
		            				if (response.data.ID_RESULT == 0) {
		                				if (vm.parent.recargarListado != null) {
		                    				vm.parent.recargarListado();
		                				}
		    							msg.textContent("Se ha liquidado correctamente");
		    							$mdDialog.show(msg);
		    							vm.changeSelected();
		            				} else {
		    							msg.textContent(response.data.DS_RESULT);
		    							$mdDialog.show(msg);
		            				}
		            				vm.cargando = false;
				        			vm.mostrarRecibos = true;
		    							
		                        }, function errorCallback(response) {
		    						msg.textContent("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
		    						$mdDialog.show(msg);
		                            if (response.status == 406) {
		                            	vm.parent.parent.logout();
		                            }
		                        })
		                	}
		                	
		                	re.cancel = function() {
	            			  vm.cargando = false;
	                	      $mdDialog.cancel();
	                	    };
		                }]
		            })
				}
				else {
					msg.textContent('Revise que los recibos seleccionados no estén liquidados');
					$mdDialog.show(msg);
				}
			} else {
				msg.textContent('No hay ningún recibo seleccionado');
				$mdDialog.show(msg);
			}
		}

		vm.changeLiqTel = function () {
			vm.mostrarRecibos = false;
			vm.listaSeleccionados = [];
			vm.fechaMes = null;
			if (vm.form != null) {
				if (vm.LIQ_TEL == true) {
					vm.form.ID_COMPANIA = undefined;
					vm.form.LST_ID_COMP_RAMO_PROD = undefined;
					vm.form.LST_ID_TIPO_POLIZA = undefined;
					vm.form.TIPO_INFORME = undefined;

					if (vm.form.FD_CRITERIO_FROM != null) {
						vm.form.FD_LIQUIDADO_FROM = vm.form.FD_CRITERIO_FROM;
						vm.form.FD_CRITERIO_FROM = undefined;
					}	
					if (vm.form.FD_CRITERIO_TO != null) {
						vm.form.FD_LIQUIDADO_TO = vm.form.FD_CRITERIO_TO;
						vm.form.FD_CRITERIO_TO = undefined;
					}	
				} else {
					vm.form.DS_PROGRAMA = undefined;
					vm.form.ID_PROGRAMA = undefined;
					vm.ID_PROGRAMA = [];

					if (vm.form.FD_CRITERIO_FROM != null) {
						vm.form.FD_LIQUIDADO_FROM = vm.form.FD_CRITERIO_FROM;
						vm.form.FD_CRITERIO_FROM = undefined;
					}	
					if (vm.form.FD_CRITERIO_TO != null) {
						vm.form.FD_LIQUIDADO_TO = vm.form.FD_CRITERIO_TO;
						vm.form.FD_CRITERIO_TO = undefined;
					}	
				}

				if (vm.form.IN_ENVIO_LIQ == false) {
					vm.getFechaMediador();
					vm.form.FD_LIQUIDADO_TO = undefined;
					vm.form.FD_LIQUIDADO_FROM = undefined;
					vm.form.FD_CRITERIO_TO = undefined;
					vm.form.FD_CRITERIO_FROM = undefined;
				} else {
					vm.form.FD_SAP_HASTA = null;
			    	vm.fechaMes = null;
				}
			}
		}
		
		vm.changePrograma = function () {
    		if (vm.ID_PROGRAMA != null && vm.tipos.productos != null) {
				vm.selectedmodelProductos = [];
				vm.productosMulti = [];
				vm.tipos.colectivosProducto = [];
    			for (var i = 0; i < vm.tipos.productos.length; i++) {
    				var producto = vm.tipos.productos[i];
    				
    				var existe = false;
    				if (vm.isBordero == true && vm.ID_PROGRAMA == producto.ID_PROGRAMA) {
    					existe = true;
    				} else if (vm.isBordero != true && vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA)) {
    					existe = true;
    				}
    				
    				if (existe) {
    					
    					if (vm.productosMulti.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
							vm.productosMulti.push({
								id: producto.ID_PRODUCTO,
								label: producto.DS_PRODUCTO,
								ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
								DS_TIPO_POLIZA: vm.getDsColectivo(producto.ID_TIPO_POLIZA)
							});
    					}
    					
    					if (vm.selectedmodelProductos.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
							vm.selectedmodelProductos.push({
								id: producto.ID_PRODUCTO,
								label: producto.DS_PRODUCTO
							});
    					}

    					//Añadimos los colectivos
    					if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
    						var obj = {
        		    			ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
        		    			DS_TIPO_POLIZA: vm.getDsColectivo(producto.ID_TIPO_POLIZA),
        		    			ID_PRODUCTO: producto.ID_PRODUCTO,
        		    			DS_PRODUCTO: producto.DS_PRODUCTO
        		    		};

        		    		var colectivoPadre = vm.getColectivoPadre(producto.ID_TIPO_POLIZA);
        		    		if (colectivoPadre.ID_TIPOCOLECTIVO_PADRE == undefined) {
        		    			obj.IS_PADRE = true;
                                obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPO_POLIZA;
        		    		} else {
        		    			obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPOCOLECTIVO_PADRE;
        		    		}
        		    		
        		    		if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
            		    		vm.tipos.colectivosProducto.push(obj);
        		    		}
        		    		
        		    		if (obj.IS_PADRE != true && colectivoPadre != null && vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == colectivoPadre.ID_TIPOCOLECTIVO_PADRE) == -1) {
        		    			vm.tipos.colectivosProducto.push({
                                    ID_TIPOCOLECTIVO_PADRE: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
            		    			ID_TIPO_POLIZA: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
            		    			DS_TIPO_POLIZA: colectivoPadre.DS_TIPO_POLIZA_PADRE,
            		    			ID_PRODUCTO: producto.ID_PRODUCTO,
            		    			DS_PRODUCTO: producto.DS_PRODUCTO,
            		    			IS_PADRE: true
            		    		});
        		    		}
    					}
    				}
    			}
    			
                var colectivosGrouped = vm.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.sortColectivos(colectivosGrouped);
    		} else {
    			vm.selectedmodelProductos = [];
				vm.productosMulti = [];
				vm.tipos.colectivosProducto = [];
				vm.tipos.colectivosProducto = vm.getEstructuraColectivo();
                var colectivosGrouped = vm.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.sortColectivos(colectivosGrouped);
    		}
    		
    		if (vm.form == undefined) {
    			vm.form = {};
    		}
    		vm.form.LST_ID_TIPO_POLIZA = [];
    		vm.onSelectionChanged();
    	}
		
		vm.getColectivoPadre = function (idColectivo) {
        	var listColectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
        	var padreColectivo = {};
        	
        	if (listColectivos != null && listColectivos.length > 0) {
        		var padreColectivo = listColectivos.find(x => x.ID_TIPO_POLIZA == idColectivo);
        	}
        	
        	return padreColectivo;
        }
		
		vm.onSelectionChanged = function (item) {
			if (vm.form == undefined) {
				vm.form = {};
			}
    		if (vm.form.LST_ID_COMP_RAMO_PROD == undefined) {
    			vm.form.LST_ID_COMP_RAMO_PROD = [];
    		} else {
    			vm.form.LST_ID_COMP_RAMO_PROD = [];
    		}

    		if (vm.selectedmodelProductos != null && vm.selectedmodelProductos.length > 0) {
    			for (var i = 0; i < vm.selectedmodelProductos.length; i++) {
    				
    				if (!vm.form.LST_ID_COMP_RAMO_PROD.includes(vm.selectedmodelProductos[i].id)) {
        				vm.form.LST_ID_COMP_RAMO_PROD.push(vm.selectedmodelProductos[i].id);
    				}
    			}
    		} else {
    			vm.form.LST_ID_COMP_RAMO_PROD = [];
        		vm.tipos.colectivosProducto = JSON.parse(window.sessionStorage.perfil).colectivos;
        		vm.tipos.colectivosProducto = vm.getEstructuraColectivo();
    		}
    	}
		
		vm.getEstructuraColectivo = function () {
            var listaColectivo = JSON.parse(window.sessionStorage.perfil).colectivos;
            
            //Recorremos lista de colectivos para añadir los colectivos padre
            for (var i = 0; i < listaColectivo.length; i++) {
                var colectivo = listaColectivo[i];
                
                //Si en la lista aún no está añadido el padre
                if (colectivo.ID_TIPOCOLECTIVO_PADRE != null && listaColectivo.findIndex(x => x.ID_TIPO_POLIZA == colectivo.ID_TIPOCOLECTIVO_PADRE) == -1) {
                    listaColectivo.push({
                        ID_TIPO_POLIZA: colectivo.ID_TIPOCOLECTIVO_PADRE,
                        DS_TIPO_POLIZA: colectivo.DS_TIPO_POLIZA_PADRE,
                        IS_PADRE: true
                    });
                } 
                //Si no tiene padre, le ponemos como si fuese padre
                else if (colectivo.ID_TIPOCOLECTIVO_PADRE == null) {
                    listaColectivo[i].IS_PADRE = true;
                }
            }
            
            listaColectivo.sort(function (a, b) {
              if (a.ID_TIPO_POLIZA > b.ID_TIPO_POLIZA) {
                return 1;
              }
              if (a.ID_TIPO_POLIZA < b.ID_TIPO_POLIZA) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });
            
            return listaColectivo;
        }
		
		vm.changeColectivos = function (colectivo) {
			if (vm.form == null) {
				vm.form = {};
			}

			if (vm.form.LST_ID_TIPO_POLIZA == null) {
				vm.form.LST_ID_TIPO_POLIZA = []
			}

			//Si hemos seleccionado un colectivo padre
			if (colectivo.IS_PADRE == true) {

				//Si el colectivo ya estaba añadido, lo deseleccionamos y deseleccionamos los hijos
				if (vm.form.LST_ID_TIPO_POLIZA != null && vm.form.LST_ID_TIPO_POLIZA.includes(colectivo.ID_TIPO_POLIZA)) {
                    var index = vm.form.LST_ID_TIPO_POLIZA.findIndex(x => x == colectivo.ID_TIPO_POLIZA);
//                    vm.form.LST_ID_TIPO_POLIZA.value.slice(index, 1);

                    //Recorremos los colectivos para encontrar los hijos y eliminarlos de la listaColectivo
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && vm.form.LST_ID_TIPO_POLIZA.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                    		var indexHijo = vm.form.LST_ID_TIPO_POLIZA.findIndex(x => x == vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                    		vm.form.LST_ID_TIPO_POLIZA.splice(indexHijo, 1);
                    	}
                    } 
				} 
                //Si no está añadido a la lista, se añade y se seleccionan todos sus hijos
				else {
//                    vm.form.LST_ID_TIPO_POLIZA.value.push(colectivo.ID_TIPO_POLIZA);

                    //Recorremos los productos para encontrar sus hijos y añadirlos
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && !vm.form.LST_ID_TIPO_POLIZA.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                    		vm.form.LST_ID_TIPO_POLIZA.push(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                    	}
                    } 
				}
			} else {
                if (vm.form.LST_ID_TIPO_POLIZA.includes(colectivo.ID_TIPO_POLIZA) && vm.form.LST_ID_TIPO_POLIZA.includes(colectivo.ID_TIPOCOLECTIVO_PADRE)) {
                	var indexColectivoPadre = vm.form.LST_ID_TIPO_POLIZA.findIndex(x => x == colectivo.ID_TIPOCOLECTIVO_PADRE);
                	vm.form.LST_ID_TIPO_POLIZA.splice(indexColectivoPadre, 1);
                }
			}
		}
    	
		vm.getDsColectivo = function (idColectivo) {
        	var listColectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
        	var dsColectivo = "";
        	
        	if (listColectivos != null && listColectivos.length > 0) {
        		var colectivo = listColectivos.find(x => x.ID_TIPO_POLIZA == idColectivo);
        		
        		if (colectivo != null) {
        			dsColectivo = colectivo.DS_TIPO_POLIZA;
        		}
        	}
        	
        	return dsColectivo;
        }
		
		vm.mediadorRequired = function () {
			if (vm.LIQ_TEL == true) {
				return false
			} else if (vm.ID_PROGRAMA != null && vm.ID_PROGRAMA.length > 0) {
				return false;
			} else {
				return true;
			}
		}
	    
	    vm.changePendiente = function () {
	    	vm.form.FT_FROM = null;
	    	vm.form.FT_TO = null;
	    	vm.mostrarRecibos = false;
	    	
	    	if (vm.form.IN_PENDIENTES == true) {
		    	var actualDate = new Date();
		    	var lastMonth = new Date(actualDate.setMonth(actualDate.getMonth() - 1));
		    	var daysLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
		    	var dateLastMonth = new Date(lastMonth.setDate(daysLastMonth));
		    	vm.fechaMes = moment(dateLastMonth).format('YYYY-MM-DD');
		    	vm.form.FT_SAP = moment(dateLastMonth).format('YYYY-MM-DD');
	    	} else {
	    		vm.fechaMes = null;
		    	vm.form.FT_SAP = null;
	    	}
	    }
	    
	    vm.initPendientes = function () {
	    	if (vm.form == null) {
	    		vm.form = {};
	    	}
	    	vm.form.IN_PENDIENTES = true;
	    	vm.changePendiente();
	    }
		
		vm.liquidarRecibos = function (tipo) {
			var obj = {
				LST_RECIBOS_LIQUIDADOS: vm.listaSeleccionados,
				TIPO_INFORME: tipo
			}
			
			vm.mostrarRecibos = false;
			vm.cargando = true;
			ExportService.guardaFechaLiq(obj)
			.then(function successCallback(response) {

				if (response.data != null) {
					if (response.data.ID_RESULT == 0) {
						msg.textContent('Los recibos se han liquidado correctamente');
						$mdDialog.show(msg);
						
						//Recargar listado
						if (vm.fechaLiqRecibo == "FD_LIQ_TIREA") {
							vm.validarFormulario(vm.informeBordero.$valid, 'informe', 'tireaTXTMensual', true);
						} else {
							vm.validarFormulario(vm.informeMensualImpuestos.$valid, 'informe', 'impuestosMensual', true);
						}
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
					}
				} else {
					msg.textContent('Ha ocurrido un error al liquidar los recibos');
					$mdDialog.show(msg);
				}
				vm.mostrarRecibos = true;
				vm.cargando = false;
			}, function errorCallBack(response) {
				vm.mostrarRecibos = true;
				vm.cargando = false;
				msg.textContent('Ha ocurrido un error al liquidar los recibos');
				$mdDialog.show(msg);
			});

		}

		vm.changeSelected = function(){
			vm.isSelected = false;
			vm.validarFormulario(vm.informeComisionista.$valid, 'xls');
		}
		
		//UI.GRID Configurado
		vm.gridInformesLiq = {
			enableSorting: true,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [15, 30, 50],
			paginationPageSize: 15,
			enableRowSelection: true,
			enableSelectAll: true,
			selectionRowHeaderWidth: 29,
			paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
			data: [],
			columnDefs: [
				{field: 'OPOLIZA.NU_POLIZA', displayName: 'Número póliza', cellTooltip: function (row) { return row.entity.OPOLIZA.NU_POLIZA }},
				{ field: 'OPAGADOR.NO_NOMBRE_COMPLETO', displayName: 'Nombre', cellTooltip: function (row) { return row.entity.OPAGADOR.NO_NOMBRE_COMPLETO }},
				{field: 'NU_RECIBO', displayName: 'Número recibo', cellTooltip: function (row) { return row.entity.NU_RECIBO }},
				{ field: 'IM_RECIBO_TOTAL', cellFilter: 'currency:"€" : 2', displayName: 'Importe Total', cellTooltip: function (row) { return row.entity.IM_RECIBO_TOTAL }},
				{ field: 'DS_SITUARECIBO', displayName: 'Estado', cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.$ctrl.getDsSituaRecibo(row.entity.ID_SITUARECIBO)}}</div>', cellTooltip: function (row) { return row.entity.DS_SITUARECIBO }},
				{ field: 'OPOLIZA.NO_MEDIADOR', displayName: 'Mediador', width: "20%", cellTooltip: function (row) { return row.entity.OPOLIZA.NO_MEDIADOR }},
				{ field: 'FD_SAP', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha cobro', cellTooltip: function (row) { return row.entity.FD_SAP }},
				{ field: 'FD_LIQ_IPS', cellFilter: 'date:\'dd/MM/yyyy\'', displayName: 'Fecha liquidación', cellTooltip: function (row) { return row.entity.FD_LIQ_IPS }}
			]
		}
		
		vm.getDsSituaRecibo = function (id) {
			if (id == 2) {
				return "Cobrado";
			} else if (id == 6) {
				return "Devuelto";
			} else {
				return "";
			}
		}
    	  
		vm.gridInformesLiq.isRowSelectable = function(fila) {
			if (fila.entity[vm.fechaLiqRecibo] != null) {
				return false;
			} else {
			    return true;
			}
		}
    	    
		vm.gridInformesLiq.onRegisterApi = function (gridApi) {
			vm.gridApi = gridApi;
			
			vm.listaSeleccionados = [];
			
			gridApi.selection.on.rowSelectionChanged($scope, function (fila) {
				vm.elementoSeleccionado = fila.entity;
				console.log("Recibo " + fila.entity.NU_RECIBO + " seleccionado: " + fila.isSelected);
				vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
			});
			gridApi.selection.on.rowSelectionChangedBatch($scope, function (filas) {
				vm.listaSeleccionados = vm.gridApi.selection.getSelectedRows();
				console.log(vm.listaSeleccionados.length + ' elemento/s seleccionado/s')
			});
		}
		
		vm.clickPadre = function (numero) {
			if (vm.listaPadres != null && vm.listaPadres[numero] != null) {
				vm.listaPadres[numero] = !vm.listaPadres[numero];
			}
		}
		
		function owDateFormat(format) {
			return {
				formatDate: function (date) {
					if (date) return moment(date).format(format);
					else return null;
				},
				parseDate: function (dateString) {
					if (dateString) {
						var m = moment(dateString, format, true);
						return m.isValid() ? m.toDate() : new Date(NaN);
					}
					else return null;
				}
			};
		}
		
		vm.groupColectivos = function (xs, key) {
            return xs.reduce(function(rv, x) {
                if (x.IS_PADRE == true && x.ID_TIPOCOLECTIVO_PADRE == null) {
                    x.ID_TIPOCOLECTIVO_PADRE = x.ID_TIPO_POLIZA;
                }
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }
        
        vm.sortColectivos = function (listColectivos) {
            var listColectivosSorted = [];
            if (listColectivos != null) {
                for (colectivo in listColectivos) {
                    //Ordenamos los colectivos según el IS_PADRE
                    listColectivos[colectivo].sort(function(x, y) {
                        // true values first
						return (x.IS_PADRE && !y.IS_PADRE) ? -1 : (!x.IS_PADRE && y.IS_PADRE) ? 1 : x.DS_TIPO_POLIZA.localeCompare(y.DS_TIPO_POLIZA);
                        // false values first
                        // return (x === y)? 0 : x? 1 : -1;
                    });
                    
                    //Recorrer lista de un grupo de colectivos
                    for (var i = 0; i < listColectivos[colectivo].length; i++) {
                        listColectivosSorted.push(listColectivos[colectivo][i]);
                    }
                }
            }
            return listColectivosSorted;
        }
        
        vm.initLiqMediador = function () {
        	vm.LIQ_TEL = true;
        }
        
        vm.getFechaMediador = function () {
        	var actualDate = new Date();
	    	var lastMonth = new Date(actualDate.setMonth(actualDate.getMonth() - 1));
	    	var daysLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
	    	var dateLastMonth = new Date(lastMonth.setDate(daysLastMonth));
	    	vm.fechaMes = moment(dateLastMonth).format('YYYY-MM-DD');
	    	vm.form.FD_SAP_HASTA = moment(dateLastMonth).format('YYYY-MM-DD');
        }
        
        vm.changeTipoSiniestro = function () {
        	var lstFechas = ['FD_LIQUIDADO_FROM', 'FD_LIQUIDADO_TO', 'FD_CRITERIO_FROM', 'FD_CRITERIO_TO'];
        	
        	if (vm.tipo == 'detalle') {
            	for (var i = 0; i < lstFechas.length; i++) {
            		if (vm.form[lstFechas[i]] != null) {
            			delete vm.form[lstFechas[i]];
            		}
            	}
        	}
        	
        	vm.form.NU_DOCUMENTO = null;
        }
        
        vm.fechaRequiredSiniestro = function (fecha) {
        	var required = false;
        	if (vm.tipo != "movimientos") {
            	if (fecha == 'FD_OCURRENCIA_FROM') {
            		if ((vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null) || vm.form.FD_OCURRENCIA_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_OCURRENCIA_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null) || vm.form.FD_OCURRENCIA_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_APERTURA_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null) || vm.form.FD_APERTURA_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_APERTURA_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null) || vm.form.FD_APERTURA_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CIERRE_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null) || vm.form.FD_CIERRE_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CIERRE_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null) || vm.form.FD_CIERRE_FROM != null) {
            			required = true;
            		}
            	}
        	} else {
        		if (fecha == 'FD_OCURRENCIA_FROM') {
            		if ((vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_OCURRENCIA_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_OCURRENCIA_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_OCURRENCIA_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_APERTURA_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_APERTURA_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_APERTURA_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_APERTURA_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CIERRE_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_CIERRE_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CIERRE_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_CIERRE_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CRITERIO_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CRITERIO_TO == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_CRITERIO_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_CRITERIO_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_LIQUIDADO_TO == null) || vm.form.FD_CRITERIO_FROM != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_LIQUIDADO_FROM') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_LIQUIDADO_TO == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null) || vm.form.FD_LIQUIDADO_TO != null) {
            			required = true;
            		}
            	} else if (fecha == 'FD_LIQUIDADO_TO') {
            		if ((vm.form.FD_OCURRENCIA_FROM == null && vm.form.FD_OCURRENCIA_TO == null && vm.form.FD_APERTURA_FROM == null && vm.form.FD_APERTURA_TO == null && vm.form.FD_CIERRE_TO == null && vm.form.FD_CIERRE_FROM == null && vm.form.FD_LIQUIDADO_FROM == null && vm.form.FD_CRITERIO_FROM == null && vm.form.FD_CRITERIO_TO == null) || vm.form.FD_LIQUIDADO_FROM != null) {
            			required = true;
            		}
            	}
        	}
        	return required;
        }
    }
    
    ng.module('App').component('sdInformesSiniestros', Object.create(informesSiniestrosComponent));
    
})(window.angular);