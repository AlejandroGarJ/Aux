(function(ng) {	


	//Crear componente de busqeuda
    var busquedaComponent = {
    		controllerAs: '$ctrl',
    		template: '<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject: ['$translate', '$window', 'CommonUtils', 'sharePropertiesService', 'BusquedaService', 'TiposService', '$mdSidenav', '$mdUtil', 'BASE_SRC', 'ExportService', 'DescargaService', '$mdDialog', 'ColectivoService', 'ConversorService', 'AseguradoraService', 'UsuarioWSService', 'MovilService', 'ProveedoresService', 'FicherosService', 'constantsTipos', 'uiGridExporterService'],
    		require: {
            	parent: '^sdApp',
            }
    }
 
    busquedaComponent.controller = function busquedaComponentController($translate, $window, CommonUtils, sharePropertiesService, BusquedaService, TiposService, BASE_SRC, ExportService, DescargaService, $mdDialog, ColectivoService, ConversorService, AseguradoraService, UsuarioWSService, MovilService, ProveedoresService, FicherosService, constantsTipos, uiGridExporterService){
    	var vm=this;
    	var url=$window.location;
    	vm.compartir = {};
        vm.isPendiente = false;
        vm.msg = $mdDialog.alert();
        vm.msg.ok('Aceptar');
        vm.msg.clickOutsideToClose(true);
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.urlExport = '';
        vm.ckPermisos = {'EXISTE': true};
        vm.pagination = false;
    	
    	vm.changePage = function (key, nupage){
    		vm[key] = sharePropertiesService.get(key);
    		localStorage.page = nupage;
    		return vm[key].slice(((nupage-1)*vm.pages.itemsPerPage), ((nupage)*vm.pages.itemsPerPage));
    	}
    	
    	var perfil=JSON.parse($window.sessionStorage.perfil);
    	vm.perfil = perfil.usuario;
    	
//		vm.colectivos=perfil.colectivos;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){

            vm.lang = 'es';
            
    		if(vm.parent.listServices.listColectivos != null && vm.parent.listServices.listColectivos.length > 0){
    			vm.colectivos = vm.parent.listServices.listColectivos;
    		} else {
    			ColectivoService.getListColectivos({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					if(response.data.ID_RESULT == 0){
	    					vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
	    					vm.parent.listServices.listColectivos = vm.colectivos;
    					}else{
    						msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
    					}
    				}
    			}, function callBack(response) {
    				if(response.status == 406 || response.status == 401){
    					vm.parent.logout();
    				}
    			});
    		}
    		
			if(vm.parent.listServices.listTiposRiesgos != null && vm.parent.listServices.listTiposRiesgos.length > 0) {
                vm.tpRiesgos = vm.parent.listServices.listTiposRiesgos;
            } else {
            	TiposService.getTipos({
                    "ID_CODIGO": constantsTipos.TIPOS_RIESGO_PRESUP
                })
                .then(function successCallback(response) {
                    if (response.status == 200) {
                    	vm.tpRiesgos = response.data.TIPOS.TIPO;                    	
                    	vm.parent.listServices.listTiposRiesgos = vm.tpRiesgos;
                    }
                }, function callBack(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                });
            }
			
    		if (/polizas_campaign_list/.test(url))
                vm.url = "campana";
            else if (/gestion_programas/.test(url))
            	vm.url = "programas";
            else if (/conf_avisos/.test(url))
            	vm.url = "avisos";
    		else if (/ficheros_datosaseguradora_list/.test(url))
                vm.url = "datosAseguradora";
            else if (/recibos_movimientos/.test(url))
                vm.url = "recibos";
            else if (/procesos_main/.test(url)) {
                vm.url = "procesos";
                vm.isPendiente = true;
            } else if (/remesas/.test(url))
                vm.url = "remesas";
            else if (/renting/.test(url))
                vm.url = "renting";
            else if (/solicitudes/.test(url))
                vm.url = "solicitudes";
            else if (/presupuestos/.test(url))
                vm.url = "presupuestos";
            else if (/alarmas/.test(url))
                vm.url = "alarmas";
            else if (/errores_list/.test(url))
                vm.url = "ficherosErrores";
            else if (/procesados/.test(url))
                vm.url = "ficherosProcesados";
            else if (/generados/.test(url))
                vm.url = "ficherosGenerados";
			else if (/reaseguradoras/.test(url))
                vm.url = "reaseguradoras";
            else if (/aseguradoras/.test(url))
                vm.url = "aseguradoras";
            else if (/comisionistas/.test(url))
                vm.url = "colaboradores";
            else if (/concesion/.test(url))
                vm.url = "concesiones";
            else if (/ficheros_conversor_list/.test(url))
                vm.url = "conversor";
            else if (/garantias/.test(url))
                vm.url = "garantias";
//            else if (/ficheros_usuariosws_list/.test(url))
//                vm.url = "userws";
            else if (/usuarios/.test(url))
                vm.url = "usuarios";
            else if (/reclamaciones/.test(url))
                vm.url = "reclamaciones";
            else if (/continente/.test(url)) {
                vm.url = "contenido";
                vm.isPendiente = true;
            } else if (/catalogo/.test(url) || /colectivos/.test(url) || /formas_pago/.test(url) || /medio_pago/.test(url) || /tipos_via/.test(url) || /tipos_documento/.test(url) || /tipos_sexo/.test(url) || /situacion/.test(url) || /estados/.test(url) || /anulacion/.test(url) || /tipos/.test(url) || /sujetos/.test(url) || /programa/.test(url))
                vm.url = "maestros";
            else if (/polizas_tiper/.test(url))
                vm.url = "polizas_tiper";
            else if (/rgpd_polizas/.test(url))
                vm.url = "rgpd_polizas";
            else if (/polizas/.test(url))
                vm.url = "polizas";
            else if (/rgpd_clientes/.test(url))
                vm.url = "rgpd_clientes";
            else if (/clientes/.test(url))
            	vm.url = "clientes";
            else if (/recibos_list/.test(url))
                vm.url = "ultRecibos";
            else if (/recibos_devueltos/.test(url))
                vm.url = "recibosDevueltos";
            else if (/siniestros/.test(url))
                vm.url = "siniestros";
            else if (/movimientos_economicos/.test(url))
                vm.url = "movimientos_economicos";
            else if (/tarifas/.test(url))
                vm.url = "tarifas";
            else if (/informes_geo/.test(url))
                vm.url = "geografica";
            else if (/bajas_vehiculos/.test(url))
                vm.url = "bajas_vehiculos";
            else if (/codpostales/.test(url))
                vm.url = "cp";
            else if (/consulta_gdpr/.test(url))
                vm.url = "consultagdpr";
            else if (/gestion_terminales/.test(url))
                vm.url = "dispositivos_moviles";
            else if (/envios_movistar_main/.test(url))
                vm.url = "enviosMovistar";
            else if (/portabilidad/.test(url))
                vm.url = "portabilidad";
            else if (/confirmacion_rtr/.test(url))
                vm.url = "confirmacion_rtr";
            else if (/back_up/.test(url))
            	vm.url = "backup";
            else if (/proveedores_list/.test(url))
            	vm.url = "proveedores";
            else if (/firma_digital/.test(url))
            	vm.url = "firma_digital";
                
            if (/pendientes/.test(url))  // || /devueltos/.test(url)
               vm.isPendiente = true;

            angular.element('body').css('background-color', 'white');

			$translate(['DOCUMENT_NUMBER', 'NAME', 'ENROLLMENT', 'PARTNER', 'VIP', 'ADVERTISING', 'TELEPHONE',
				'EMAIL', 'REQUEST_TYPE', 'REQUEST', 'CLIENT', 'POLICY_NU', 'STATUS', 'CHANNEL', 'RECEPTOR',
				'CREATED_BY', 'CREATED_ON', 'DATE_VALIDATION', 'DATE_CONFIRMATION', 'DATE_RESOLUTION', 'CLAIM_NUMBER',
				'LIABILITY', 'BRANCH', 'DATE_INCIDENCE', 'DATE_OPENING', 'DATE_CLOSING', 'SEE', 'POLICY_HOLDER',
				'PRODUCT', 'TOTAL', 'DATE_ISSUANCE', 'DATE_INCEPTION', 'DATE_EXPIRATION', 'RECEIPT', 'CLIENT',
				'PAYMENT_METHOD', 'DATE_START', 'NET_PREMIUM', 'DATE_ACCOUNTING', 'REMITTANCE', 'SENT_SAP', 'PRESUSPENDED',
				'SAP_SHIPPING_NUMBER', 'BUDGET_NUMBER', 'EDITED_ON', 'EDITED_BY', 'MOVEMENT_ID', 'MOVEMENT_TYPE', 'DESCRIPTION',
				'SUPPLIER', 'DATE_MOVEMENT', 'COMPENSATION', 'PAYMENT', 'RESERVATION']).then(function (translations) {
				vm.TRANSLATE = {
					DOCUMENT_NUMBER: translations['DOCUMENT_NUMBER'],
					NAME: translations['NAME'],
					ENROLLMENT: translations['ENROLLMENT'],
					PARTNER: translations['PARTNER'],
					VIP: translations['VIP'],
					ADVERTISING: translations['ADVERTISING'],
					TELEPHONE: translations['TELEPHONE'],
					EMAIL: translations['EMAIL'],
					REQUEST_TYPE: translations['REQUEST_TYPE'],
					REQUEST: translations['REQUEST'],
					CLIENT: translations['CLIENT'],
					POLICY: translations['POLICY_NU'],
					STATUS: translations['STATUS'],
					CHANNEL: translations['CHANNEL'],
					RECEPTOR: translations['RECEPTOR'],
					CREATED_BY: translations['CREATED_BY'],
					CREATED_ON: translations['CREATED_ON'],
					DATE_VALIDATION: translations['DATE_VALIDATION'],
					DATE_CONFIRMATION: translations['DATE_CONFIRMATION'],
					DATE_RESOLUTION: translations['DATE_RESOLUTION'],
					CLAIM: translations['CLAIM_NUMBER'],
					LIABILITY: translations['LIABILITY'],
					BRANCH: translations['BRANCH'],
					DATE_INCIDENCE: translations['DATE_INCIDENCE'],
					DATE_OPENING: translations['DATE_OPENING'],
					DATE_CLOSING: translations['DATE_CLOSING'],
					SEE: translations['SEE'],
					POLICY_HOLDER: translations['POLICY_HOLDER'],
					PRODUCT: translations['PRODUCT'],
					TOTAL: translations['TOTAL'],
					DATE_ISSUANCE: translations['DATE_ISSUANCE'],
					DATE_INCEPTION: translations['DATE_INCEPTION'],
					DATE_EXPIRATION: translations['DATE_EXPIRATION'],
					RECEIPT: translations['RECEIPT'],
					CLIENT: translations['CLIENT'],
					PAYMENT_METHOD: translations['PAYMENT_METHOD'],
					DATE_START: translations['DATE_START'],
					NET_PREMIUM: translations['NET_PREMIUM'],
					DATE_ACCOUNTING: translations['DATE_ACCOUNTING'],
					REMITTANCE: translations['REMITTANCE'],
					SENT_SAP: translations['SENT_SAP'],
					PRESUSPENDED: translations['PRESUSPENDED'],
					SAP_SHIPPING_NUMBER: translations['SAP_SHIPPING_NUMBER'],
					BUDGET: translations['BUDGET_NUMBER'],
					EDITED_ON: translations['EDITED_ON'],
					EDITED_BY: translations['EDITED_BY'],
					MOVEMENT_ID: translations['MOVEMENT_ID'],
					MOVEMENT_TYPE: translations['MOVEMENT_TYPE'],
					DESCRIPTION: translations['DESCRIPTION'],
					SUPPLIER: translations['SUPPLIER'],
					DATE_MOVEMENT: translations['DATE_MOVEMENT'],
					COMPENSATION: translations['COMPENSATION'],
					PAYMENT: translations['PAYMENT'],
					RESERVATION: translations['RESERVATION']
				}
			});
        }

		vm.translateHeaders = function(table) {
			if(table != undefined) {
				for(var i = 0; i < table.columnDefs.length; i++) {
					var column = table.columnDefs[i];
					switch(table.columnDefs[i]['field']) {
						case 'NU_DOCUMENTO':
							column.displayName = vm.TRANSLATE.DOCUMENT_NUMBER;
							break;
						case 'NO_NOMBRE_COMPLETO':
							column.displayName = vm.TRANSLATE.NAME;
							break;
						case 'NU_MATRICULA':
							column.displayName = vm.TRANSLATE.ENROLLMENT;
							break;
						case 'DS_TIPOEMPLEADO':
						case 'DS_TIPO_COLECTIVO':
						case 'OPOLIZA.DS_TIPO_POLIZA':
						case 'DS_TIPO_POLIZA':
							column.displayName = vm.TRANSLATE.PARTNER;
							break;
						case 'IN_CLIENTE_VIP':
							column.displayName = vm.TRANSLATE.VIP;
							break;
						case 'IN_LOPD':
							column.displayName = vm.TRANSLATE.ADVERTISING;
						case 'IN_PUBLICIDAD':
							column.displayName = vm.TRANSLATE.ADVERTISING;
							break;
						case 'NU_TELEFONO1':
							column.displayName = vm.TRANSLATE.TELEPHONE;
							break;
						case 'NO_EMAIL':
							column.displayName = vm.TRANSLATE.EMAIL;
							break;
						case 'OTIPO_SOLICITUD.DS_TIPO_SOLICITUD':
							column.displayName = vm.TRANSLATE.REQUEST_TYPE;
							break;
						case 'ID_SOLICITUD':
							column.displayName = vm.TRANSLATE.REQUEST;
							break;
						case 'OCLIENTE.NO_NOMBRE_COMPLETO':
						case 'OPOLIZA.LST_ASEGURADOS[0].NO_NOMBRE_COMPLETO':
							column.displayName = vm.TRANSLATE.CLIENT;
							break;
						case 'OPOLIZA.NU_POLIZA':
						case 'NU_POLIZA':
							column.displayName = vm.TRANSLATE.POLICY;
							break;
						case 'DS_SITUACION_SOLICITUD':
						case 'DS_ESTADO_SINIESTRO':
						case 'ID_SITUAPOLIZA':
						case 'DS_SITUARECIBO':
						case 'DS_ESTADO_PRESUPUESTO':
							column.displayName = vm.TRANSLATE.STATUS;
							break;
						case 'DS_TIPO':
						case 'CO_CANAL':
						case 'DS_SOURCE_ALTA':
							column.displayName = vm.TRANSLATE.CHANNEL;
							break;
						case 'CO_USU_RECEPTOR':
							column.displayName = vm.TRANSLATE.RECEPTOR;
							break;
						case 'NO_USU_EMISOR':
						case 'NO_USU_ALTA':
							column.displayName = vm.TRANSLATE.CREATED_BY;
							break;
						case 'FT_USU_ALTA':
							column.displayName = vm.TRANSLATE.CREATED_ON;
							break;
						case 'FD_VALIDACION':
							column.displayName = vm.TRANSLATE.DATE_VALIDATION;
							break;
						case 'FD_CONFIRMACION':
							column.displayName = vm.TRANSLATE.DATE_CONFIRMATION;
							break;
						case 'FD_CIERRE':
							column.displayName = vm.TRANSLATE.DATE_RESOLUTION;
							break;
						case 'NU_SINIESTRO':
							column.displayName = vm.TRANSLATE.CLAIM;
							break;
						case 'DS_RESPONSABILIDAD':
							column.displayName = vm.TRANSLATE.LIABILITY;
							break;
						case 'OPOLIZA.NO_RAMO':
						case 'NO_RAMO':
							column.displayName = vm.TRANSLATE.BRANCH;
							break;
						case 'FD_OCURRENCOMPANIA':
							column.displayName = vm.TRANSLATE.DATE_INCIDENCE;
							break;
						case 'FD_APERTURA':
							column.displayName = vm.TRANSLATE.DATE_OPENING;
							break;
						case 'FD_TERMINACION':
							column.displayName = vm.TRANSLATE.DATE_CLOSING;
							break;
						case 'tomador.NO_NOMBRE_COMPLETO':
							column.displayName = vm.TRANSLATE.POLICY_HOLDER;
							break;
						case 'DS_PRODUCTO':
						case 'OPOLIZA.NO_PRODUCTO':
							column.displayName = vm.TRANSLATE.PRODUCT;
							break;
						case 'IM_PRIMA_TOTAL':
						case 'IM_RECIBO_TOTAL':
						case 'OPOLIZA.IM_PRIMA_TOTAL':
						case 'IM_TOTAL':
							column.displayName = vm.TRANSLATE.TOTAL;
							break;
						case 'FD_EMISION':
							column.displayName = vm.TRANSLATE.DATE_ISSUANCE;
							break;
						case 'FD_INICIO':
							column.displayName = vm.TRANSLATE.DATE_INCEPTION;
							break;
						case 'FD_VENCIMIENTO':
						case 'FD_VCTO_REC':
							column.displayName = vm.TRANSLATE.DATE_EXPIRATION;
							break;
						case 'NU_RECIBO':
							column.displayName = vm.TRANSLATE.RECEIPT;
							break;
						case 'OPAGADOR.NO_NOMBRE_COMPLETO':
							column.displayName = vm.TRANSLATE.CLIENT;
							break;
						case 'DS_TIPO_MEDIO_PAGO':
							column.displayName = vm.TRANSLATE.PAYMENT_METHOD;
							break;
						case 'FD_INICIO_REC':
							column.displayName = vm.TRANSLATE.DATE_START;
							break;
						case 'IM_PRIMANETA':
							column.displayName = vm.TRANSLATE.NET_PREMIUM;
							break;
						case 'FD_SAP':
							column.displayName = vm.TRANSLATE.DATE_ACCOUNTING;
							break;
						case 'ID_RECIBO_REMESA':
							column.displayName = vm.TRANSLATE.REMITTANCE;
							break;
						case 'NU_SAP':
							column.displayName = vm.TRANSLATE.SAP_SHIPPING_NUMBER;
							break;
						case 'ID_PRESUPUESTO':
							column.displayName = vm.TRANSLATE.BUDGET;
							break;
						case 'FT_USU_MOD':
							column.displayName = vm.TRANSLATE.EDITED_ON;
							break;
						case 'NO_USU_MOD':
							column.displayName = vm.TRANSLATE.EDITED_BY;
							break;
						case 'Ver':
							column.displayName = vm.TRANSLATE.SEE;
							break;
						case 'enviado_sap':
						case 'NU_SAP':
							column.displayName = vm.TRANSLATE.SENT_SAP;
							break;
						case 'Presuspendida':
							column.displayName = vm.TRANSLATE.PRESUSPENDED;
							break;
						case 'ID_MOV_ECOM':
							column.displayName = vm.TRANSLATE.MOVEMENT_ID;
							break;
						case 'CO_TIPOMOV':
							column.displayName = vm.TRANSLATE.MOVEMENT_TYPE;
							break;
						case 'oMovEconGaran.DS_CONCEPTO':
							column.displayName = vm.TRANSLATE.DESCRIPTION;
							break;
						case 'DS_PERCEPTOR':
							column.displayName = vm.TRANSLATE.SUPPLIER;
							break;
						case 'FT_MOV':
							column.displayName = vm.TRANSLATE.DATE_MOVEMENT;
							break;
						case 'IM_INDEMNIZACION':
							column.displayName = vm.TRANSLATE.COMPENSATION;
							break;
						case 'IM_PAGO':
							column.displayName = vm.TRANSLATE.PAYMENT;
							break;
						case 'IM_RESERVA':
							column.displayName = vm.TRANSLATE.RESERVATION;
							break;
						default:
							break;
					}
				}
			}
		}

        //Buscar la lista
        vm.buscar = function (form, tipo) {
        	vm.form = form;
        	vm.tipo = tipo;
            var lista = [];
            vm.listDatos = {};
            vm.vista = 2;
        	vm.isAdhoc = false;

            var queTipo = "";
            if(tipo != null && tipo != undefined)
            queTipo = tipo.split('-');

            if (queTipo.length == 1) {
                BusquedaService.buscar(form, tipo)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.ID_RESULT == 0){
	                            if(response.data.PAGINAR != undefined) {
	                                vm.pagination = response.data.PAGINAR;
	                                if(vm.pagination) {
	                                    vm.checkType(response.data);
	                                    vm.msg.textContent('Se ha encontrado un total de ' + vm.searchResult.total + ' ' + vm.searchResult.type + ', superando el límite de resultados establecido\n' +
	                                        'Solo se mostrarán los primeros ' + response.data.LIMIT + ' registros')
							            $mdDialog.show(vm.msg);
	                                }
	                            }
	                            if(form.CO_PRESUPUESTO == 'AD-HOC'){
	                            	vm.isAdhoc = true;
	                            }
	                            var respuesta = mapLista(tipo, response);
	                            if (respuesta.list_total > 0) {
	                                lista = respuesta.list_datos
	
	                                vm.listDatos = lista;
	
	                                sharePropertiesService.set(tipo, lista);
	
	                                vm.totalItems = respuesta.list_total;
	//                                if (lista.length <= 9999) {
	//                                    localStorage[tipo] = JSON.stringify(lista);
	//                                }
	
	
	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                        	}else{
                        		msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                        	}
	                    }
                    if(response.status === 500){
                    	vm.msg.textContent("Se ha producido un error al realizar la búsqueda. Contacte con el administrador.")
					    $mdDialog.show(vm.msg);
                    }
                    	
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });
            } else {
                if (queTipo[1] == 'errorFicherosMovil') { 
                	MovilService.traceabilityFilter(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.code == 0){
                                if (response.data.entity && response.data.entity.length > 0) {

                                    vm.listDatos = response.data.entity;

                                    sharePropertiesService.set(tipo, lista);
                                    vm.totalItems = response.data.entity;

                                    vm.dsActive = 0;
                                    vm.vista = 4;
                                } else {
                                    vm.vista = 3;
                                }
                        	} else {
                            	msg.textContent(response.data.msg);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                            }
                        }
                    }, function errorCallback(response) {
                    	if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
    					  	 msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
    	                     $mdDialog.show(msg);
    	        	     } else {
    	        	    	 msg.textContent(response.data.msg);
    	        	    	 $mdDialog.show(msg);
    	        	     }
                    	
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });
                } else if (queTipo[1] == 'aseguradoras' || queTipo[1] == 'comisionistas') {
                	AseguradoraService.getAseguradorasByFilter(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_ASEGURADORAS > 0) {
	
	                                    vm.listDatos = response.data.ASEGURADORAS;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_ASEGURADORAS;
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	} else{
		                            	msg.textContent(response.data.DS_RESULT);
		                                $mdDialog.show(msg);
		                                vm.vista = 3;
	                                }
	                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'producto') {
    //                 TiposService.getProducto(form)
    //                     .then(function successCallback(response) {
    //                         if (response.status === 200) {
    //                         	if(response.data.ID_RESULT == 0){
	//                                 if (response.data.NUMERO_TIPOS > 0) {
	
	//                                     vm.listDatos = response.data.TIPOS.TIPO;
	
	//                                     sharePropertiesService.set(tipo, lista);
	//                                     vm.totalItems = response.data.NUMERO_TIPOS;
	// //                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	//                                     vm.dsActive = 0;
	//                                     vm.vista = 4;
	//                                 } else {
	//                                     vm.vista = 3;
	//                                 }
    //                         	}else{
    //                         		msg.textContent(response.data.DS_RESULT);
	//                                 $mdDialog.show(msg);
	//                                 vm.vista = 3;
    //                         	}
    //                         }
    //                     }, function errorCallback(response) {
    //                         if (response.status == 406 || response.status == 401) {
    //                             vm.vista = 1;
    //                             vm.parent.logout();
    //                         } else {
    //                             vm.vista = 1;
    //                         }
	//                     });
					AseguradoraService.getProductosByFilter(form)
					.then(function successCallback(response) {
						if (response.status === 200) {
							if(response.data.ID_RESULT == 0) {
								if(response.data.NU_PRODUCTOS > 0) {
									vm.listDatos = response.data.PRODUCTOS.PRODUCTO;
									sharePropertiesService.set(tipo, lista);
									vm.totalItems = response.data.NU_PRODUCTOS;
									vm.dsActive = 0;
									vm.vista = 4;
								} else {
									vm.vista = 3;
								}
							}else{
								msg.textContent(response.data.DS_RESULT);
								$mdDialog.show(msg);
								vm.vista = 3;
							}
						}
					}, function errorCallback(response) {
						if (response.status == 406 || response.status == 401) {
							vm.vista = 1;
							vm.parent.logout();
						} else {
							vm.vista = 1;
						}
					});
				} else if (queTipo[1] == 'ramo') {
                    TiposService.getRamos(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                            	msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                            }
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'campana') {
                    TiposService.getCampaign(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.length > 0) {
	
	                                    vm.listDatos = response.data;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data;
	                                    localStorage[queTipo[1]] = JSON.stringify(response.data);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                            	msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                            }
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'formas_pago') {
                    TiposService.getFormasPago(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
                            		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'medio_pago') {
                    TiposService.getMedioPago(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
                             		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'tiposTipos') {
                    TiposService.getTipos(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
                            		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'tiposVia') {
                    TiposService.getVia(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
                            		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'tiposDocumento') {
                    TiposService.getTipoDocumento(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
                            		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'tiposSexo') {
                    TiposService.getSexo(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                             	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                             	}else{
                            		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'statPoliza') {
                    TiposService.getSituaPolizas(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                        	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'statCliente') {
                    TiposService.getSituaCliente(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                        	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'statRecibo') {
                    TiposService.getSituaRecibo(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                        	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'statSiniestro') {
                    TiposService.getEstadosSiniestro(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	 }else{
 	                        		msg.textContent(response.data.DS_RESULT);
 	                                $mdDialog.show(msg);
 	                               vm.vista = 3;
 	                        	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'anul') {
                    TiposService.getMotivosAnul(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                             	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	                                    sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
	                            }else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                        	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                } else if (queTipo[1] == 'programa') {
                    TiposService.getProgramas(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                         	if(response.data.ID_RESULT == 0){
	                            if (response.data.NUMERO_TIPOS > 0) {
	
	                                vm.listDatos = response.data.TIPOS.TIPO;
	
	                                sharePropertiesService.set(tipo, lista);
	                                vm.totalItems = response.data.NUMERO_TIPOS;
	//                                localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	
	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                         	 }else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
	                         }
                        }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });
                }else if (queTipo[1] == 'sujetos') {
                    TiposService.getTipoCliente(form)
                        .then(function successCallback(response) {
                            if (response.status === 200) {
                            	if(response.data.ID_RESULT == 0){
	                                if (response.data.NUMERO_TIPOS > 0) {
	
	                                    vm.listDatos = response.data.TIPOS.TIPO;
	
	    								sharePropertiesService.set(tipo, lista);
	                                    vm.totalItems = response.data.NUMERO_TIPOS;
	//                                    localStorage[queTipo[1]] = JSON.stringify(response.data.TIPOS.TIPO);
	    		
	                                    vm.dsActive = 0;
	                                    vm.vista = 4;
	                                } else {
	                                    vm.vista = 3;
	                                }
                            	}else{
	                        		msg.textContent(response.data.DS_RESULT);
	                                $mdDialog.show(msg);
	                                vm.vista = 3;
                            	}
                            }
                        }, function errorCallback(response) {
                            if (response.status == 406 || response.status == 401) {
                                vm.vista = 1;
                                vm.parent.logout();
                            } else {
                                vm.vista = 1;
                            }
                        });
                }else if (queTipo[1] == 'datosAseguradora') {
                	ConversorService.getDatosAseguradoraByFilter(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.ID_RESULT == 0){
	                            if (response.data.NUMERO_CONVERSOR > 0) {
	
	                                vm.listDatos = response.data.CONVERSORES;
	
									sharePropertiesService.set(tipo, lista);
	                                vm.totalItems = response.data.NUMERO_CONVERSOR;
	//                                localStorage[queTipo[1]] = JSON.stringify(response.data.CONVERSORES);
			
	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                        	}else{
                        		msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                        	}
                        }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });
                }else if (queTipo[1] == 'conversor') {
                	ConversorService.getConversorByFilter(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.ID_RESULT == 0){
	                            if (response.data.NUMERO_CONVERSOR > 0) {
	
	                                vm.listDatos = response.data.CONVERSORES;
	
									sharePropertiesService.set(tipo, lista);
	                                vm.totalItems = response.data.NUMERO_CONVERSOR;
	//                                localStorage[queTipo[1]] = JSON.stringify(response.data.CONVERSORES);
			
	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                        	}else{
                        		msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                        	}
                        }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });    
                }else if (queTipo[1] == 'userWs') {
                	UsuarioWSService.getListUsuarios(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.ID_RESULT == 0){
	                            if (response.data.NUMERO_USUARIOS > 0) {
	
	                                vm.listDatos = response.data.USUARIOS;
	
									sharePropertiesService.set(tipo, lista);
	                                vm.totalItems = response.data.NUMERO_USUARIOS;

	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                         	}else{
                        		msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                        	}
                        }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
							msg.textContent("Ha ocurrido un error al recuperar usuarios");
							$mdDialog.show(msg);
                        }
                    });  
            }
//                else if (queTipo[1] == 'colectivos') {
//                    a = form.DS_TIPO_POLIZA + "$"
//                    b = "^" + form.DS_TIPO_POLIZA
//                    vm.listDatos = _.filter(vm.colectivos, function (o) {
//                        return (new RegExp(form.DS_TIPO_POLIZA)).test(o.DS_TIPO_POLIZA.toLowerCase());
//                    });
//                    vm.dsActive = 0;
//                    vm.vista = 4;
//                }
                else if (queTipo[1] == 'colectivos') {
                	ColectivoService.getColectivosFiltroUsuario(form)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                        	if(response.data.ID_RESULT == 0){
	                            if (response.data.NUMERO_COLECTIVOS > 0) {
	
	                                vm.listDatos = response.data.COLECTIVOS.COLECTIVO;
	
									sharePropertiesService.set(tipo, lista);
	                                vm.totalItems = response.data.NUMERO_COLECTIVOS;
	//                                localStorage[queTipo[1]] = JSON.stringify(response.data.COLECTIVOS.COLECTIVO);
			
	                                vm.dsActive = 0;
	                                vm.vista = 4;
	                            } else {
	                                vm.vista = 3;
	                            }
                           	}else{
                        		msg.textContent(response.data.DS_RESULT);
                                $mdDialog.show(msg);
                                vm.vista = 3;
                        	}
	                   }
                    }, function errorCallback(response) {
                        if (response.status == 406 || response.status == 401) {
                            vm.vista = 1;
                            vm.parent.logout();
                        } else {
                            vm.vista = 1;
                        }
                    });
            } else if(queTipo[1] == 'terminales'){
                MovilService.getDevices(form)
                .then(function successCallback(response) {
                     if (response.status === 200) {
                         if(response.data.ID_RESULT == 0){
                             if (response.data.NUMERO_TERMINALES > 0) {
 
                                 vm.listDatos = response.data.TERMINALES;
 
                                 sharePropertiesService.set(tipo, lista);
                                 vm.totalItems = response.data.NUMERO_TERMINALES
         
                                 vm.dsActive = 0;
                                 vm.vista = 4;
                             } else {
                                 vm.vista = 3;
                             }
                        }else{
                         vm.vista = 3;
                         }
                    }
                 }, function errorCallback(response) {
                     if (response.status == 406 || response.status == 401) {
                         vm.vista = 1;
                         vm.parent.logout();
                     } else {
                         vm.vista = 1;
                     }
                 });
            } else if(queTipo[1] == 'portabilidad'){
                MovilService.uninsured_devices(form)
                .then(function successCallback(response) {
                	if(response.data.code == 0 && response.data.result != null){
						 if (response.data.result.length > 0) {

							 vm.listDatos = response.data.result;

							 vm.dsActive = 0;
							 vm.vista = 4;
						 } else {
							 vm.vista = 3;
						 }
					} else {
                       msg.textContent(response.data.msg);
                       $mdDialog.show(msg);
						vm.vista = 3;
					}
                 }, function errorCallback(response) {
                	  if ((response.status == 400 || response.status == 500) && response.data.error != null && response.data.error.codigoErrorNegocio != null) {
 					  	 msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
 	                     $mdDialog.show(msg);
 	        	     } else {
 	        	    	 msg.textContent(response.data.msg);
	                     $mdDialog.show(msg);
 	        	     }
                     if (response.status == 406 || response.status == 401) {
                         vm.vista = 1;
                         vm.parent.logout();
                     } else {
                         vm.vista = 1;
                     }
                 });
            } else if(queTipo[1] == 'fusion'){
            	if (form == null) {
            		form = {};
            	}
            	form.comercialOps = ["WEB_CARRITO", "WCA_LIBRE", "WCA_DISPOSITIVOS"];
            	MovilService.uninsured_devices(form)
                .then(function successCallback(response) {
                	if(response.data != null && response.data.result != null && response.data.result.length > 0){
						 vm.listDatos = response.data.result;
						 vm.dsActive = 0;
						 vm.vista = 4;
					} else {
					    if (response.data.msg != null) {
	                       msg.textContent(response.data.msg);
					    } else {
	                       msg.textContent("No se ha encontrado ningún dato");
					    }
	                   $mdDialog.show(msg);
					   vm.vista = 3;
					}
                 }, function errorCallback(response) {
                 	 if (response.data != null && response.data.error != null && response.data.error.descripcionErrorNegocio != null) {
                         msg.textContent("CODERRROR-" + response.data.error.codigoErrorNegocio + " DESC: " + response.data.error.descripcionErrorNegocio);
                         $mdDialog.show(msg);
                 	 } else if (response.data != null && response.data.msg != null) {
                         msg.textContent(response.data.msg);
                         $mdDialog.show(msg);
                 	 }
                     if (response.status == 406 || response.status == 401) {
                         vm.vista = 1;
                         vm.parent.logout();
                     } else {
                         vm.vista = 1;
                     }
                 });
            } else if(queTipo[1] == 'proveedores'){
            	ProveedoresService.getListProvPrograma(form)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                    	if(response.data.ID_RESULT == 0){
                            if (response.data.PROVEEDORESPROGRAMAS != null && response.data.PROVEEDORESPROGRAMAS.length > 0) {

                                vm.listDatos = response.data.PROVEEDORESPROGRAMAS;

								sharePropertiesService.set(tipo, lista);
                                vm.totalItems = vm.listDatos.length;

                                vm.dsActive = 0;
                                vm.vista = 4;
                            } else {
                                vm.vista = 3;
                            }
                     	} else {
                    		msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                            vm.vista = 3;
                    	}
                    }
                }, function errorCallback(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.vista = 1;
                        vm.parent.logout();
                    } else {
                        vm.vista = 1;
						msg.textContent("Ha ocurrido un error al recuperar usuarios");
						$mdDialog.show(msg);
                	}
                });
            } else if(queTipo[1] == 'avisos'){
            	FicherosService.getFicherosType(form)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                    	if(response.data.ID_RESULT == 0){
                            if (response.data.RESULT != null && response.data.RESULT.length > 0) {

                                vm.listDatos = response.data.RESULT;

								sharePropertiesService.set(tipo, lista);
                                vm.totalItems = vm.listDatos.length;

                                vm.dsActive = 0;
                                vm.vista = 4;
                            } else {
                                vm.vista = 3;
                            }
                     	} else {
                    		msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                            vm.vista = 3;
                    	}
                    }
                }, function errorCallback(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.vista = 1;
                        vm.parent.logout();
                    } else {
                        vm.vista = 1;
						msg.textContent("Ha ocurrido un error al recuperar contratos");
						$mdDialog.show(msg);
                	}
                });
            } else if(queTipo[1] == 'programas'){
            	//TODO
            	TiposService.getProgramas(form)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                    	if(response.data.ID_RESULT == 0){
                            if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {

                                vm.listDatos = response.data.TIPOS.TIPO;

								sharePropertiesService.set(tipo, lista);
                                vm.totalItems = vm.listDatos.length;

                                vm.dsActive = 0;
                                vm.vista = 4;
                            } else {
                                vm.vista = 3;
                            }
                     	} else {
                    		msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                            vm.vista = 3;
                    	}
                    }
                }, function errorCallback(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.vista = 1;
                        vm.parent.logout();
                    } else {
                        vm.vista = 1;
						msg.textContent("Ha ocurrido un error al recuperar programas");
						$mdDialog.show(msg);
                	}
                });
            } else if(queTipo[1] == 'programasProveedor'){
            	//TODO
            	TiposService.getProgramasProveedor(form)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                    	if(response.data.ID_RESULT == 0){
                            if (response.data.TIPOS != null && response.data.TIPOS.TIPO != null && response.data.TIPOS.TIPO.length > 0) {

                                vm.listDatos = response.data.TIPOS.TIPO;

								sharePropertiesService.set(tipo, lista);
                                vm.totalItems = vm.listDatos.length;

                                vm.dsActive = 0;
                                vm.vista = 4;
                            } else {
                                vm.vista = 3;
                            }
                     	} else {
                    		msg.textContent(response.data.DS_RESULT);
                            $mdDialog.show(msg);
                            vm.vista = 3;
                    	}
                    }
                }, function errorCallback(response) {
                    if (response.status == 406 || response.status == 401) {
                        vm.vista = 1;
                        vm.parent.logout();
                    } else {
                        vm.vista = 1;
						msg.textContent("Ha ocurrido un error al recuperar programas");
						$mdDialog.show(msg);
                	}
                });
            } else if(queTipo[1] == 'movistar'){
                MovilService.getDevicesMovistar(form)
                .then(function successCallback(response) {
                     if (response.status === 200) {
                             if (response.data.code == 0) {
                            	 if(response.data.entity.length > 0){
	                                 vm.listDatos = response.data.entity;
	 
	                                 sharePropertiesService.set(tipo, lista);
	         
	                                 vm.dsActive = 0;
	                                 vm.vista = 4;
                            	 }else {
                                     vm.vista = 3;
                                 }
                             } else {
                                 vm.vista = 3;
                             }
                    }
                 }, function errorCallback(response) {
                     if (response.status == 406 || response.status == 401) {
                         vm.vista = 1;
                     } else {
                         vm.vista = 1;
                     }
                 });
                }
            }
        }
        
        vm.checkType = function(obj) {
            vm.searchResult = {};
            for(var data in obj) {
                switch (data) {
                    case 'NUMERO_CLIENTES':
                        vm.searchResult.type = 'clientes';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_MOV_ECO':
                        vm.searchResult.type = 'movimientos económicos';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_POLIZAS':
                        vm.searchResult.type = 'polizas';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_PRESUPUESTOS':
                        vm.searchResult.type = 'presupuestos';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_RECIBOS':
                        vm.searchResult.type = 'recibos';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_SOLICITUDES':
                        vm.searchResult.type = 'solicitudes';
                        vm.searchResult.total = obj[data];
                        break;
                    case 'NUMERO_SINIESTROS':
                        vm.searchResult.type = 'siniestros';
                        vm.searchResult.total = obj[data];
                        break;
                    default:
                        break;
                }
            }
        }
    	
    	//var stop=0;
        //while(stop<3){
        this.$onChanges = function () {
//            var perfil = this.parent.getPerfil();
            //console.log(perfil);
//            if (perfil != "undefined") {
//                var perfil = JSON.parse(perfil);
//                vmcolectivos = perfil.colectivos;
                /*vm.colectivos=[];
                for(var i=0;i<colectivos.length;i++){
                	vm.colectivos[i]={
                		"id":colectivos[i].ID_TIPO_POLIZA,
                		"text":colectivos[i].DS_TIPO_POLIZA
                	};
                }*/
//            }
        }


        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
            if(vm.ckPermisos != undefined && vm.ckPermisos.EXISTE == true) {
                return BASE_SRC + "busqueda/busqueda.view.html";
            } else {
                return "src/error/404.html";
            }
        }

        //Compartir esa función en todas las busquedas
        vm.verDetalle = function (fila, numDetalles) {
            return cargarDetalle(fila);
        }

        // //Función para cargar los datos al abrir el tab.
        // function cargarDetalle(fila, numDetalles) {
        //     var json = {};
        //     if (!numDetalles.includes(fila)) {
        //         numDetalles.push(fila);

        //         json.cargarDetalle = true;
        //         $timeout(function () {
        //             json.active = vm.numDetalles.length;
        //             json.actives = vm.numDetalles.length + 1;
        //             json.cargarDetalle = false;
        //         }, 3000)
        //     }
        //     return json;
        // }

        //Función para cargar los datos al abrir el tab.
        function cargarDetalle(fila, numDetalles) {
            var json = {};
            if (numDetalles.indexOf(fila)) {
                numDetalles.push(fila);

                json.cargarDetalle = true;
                $timeout(function () {
                    json.active = vm.numDetalles.length;
                    json.actives = vm.numDetalles.length + 1;
                    json.cargarDetalle = false;
                }, 3000)
            }
            return json;
        }

        //Salir del logout
        vm.logout = function () {
            vm.parent.logout();
        }

        //Mapear los datos devueltos.
        function mapLista(tipo, data) {
            var map = {};
            switch (tipo) {
                case 'polizas':
                case 'rgpd_polizas':
                case 'firma_digital':
                    map = getPolizas(data);
                    break;
                case 'reclamaciones':
                    map = getSolicitudes(data);
                    break;
                case 'clientes':
                case 'rgpd_clientes':
                    map = getClientes(data);
                    break;
                case 'consultagdpr':
                    map = getClientes(data);
                    break;
                case 'solicitud':
                    map = getSolicitudes(data);
                    break;
                case 'missolicitud':
                    map = getSolicitudes(data);
                    break;
                case 'recibos':
                    map = getRecibos(data);
                    break;
                case 'remesas':
                    map = getRecibos(data);
                    break;
                case 'ultRecibos':
                    map = getRecibos(data);
                    break;
                case 'recibosDevueltos':
                    map = getRecibos(data);
                    break;
                case 'siniestros':
                    map = getSiniestros(data);
                    break;
                case 'movimientoSiniestros':
					if (data.data.MOVSECONOMICOS != null && data.data.MOVSECONOMICOS.MOVECONOMICOS != null) {
	                    map.list_total = data.data.NUMERO_MOV_ECO;
	                    map.list_datos = map.list_total > 0 ? data.data.MOVSECONOMICOS.MOVECONOMICOS : null;
					}
                    break;
                case 'alarmas':
                    map = getAlarmas(data);
                    break;
                case 'ficherosProcesados':
                    map = getFicherosProcesados(data);
                    break;
                case 'ficherosGenerados':
                    map = getFicherosGenerados(data);
                    break;
                case 'errorFicheros':
                    map = getFicherosProcesados(data);
                    break;
                case 'enviosMovistar':
                    map = getTerminales(data);
                    break;
                case 'movimientoSiniestros':
                    map = getMovimientosEconomicos(data);
                    break;
                case 'codpostal':
                    map.list_total = data.data.NUMERO_CODPOSTALES;
                    map.list_datos = map.list_total > 0 ? data.data.CODPOSTALES.CODPOSTAL : null;
                    break;
                case 'usuarios':
                    map.list_total = data.data.NUMERO_USUARIOS;
                    map.list_datos = map.list_total > 0 ? data.data.USUARIOS : null;
                    break;
                case 'concesion':
                    map.list_total = data.data.NUMERO_CONCESIONESCOMPANIAS;
                    map.list_datos = map.list_total > 0 ? data.data.CONCESIONESCOMPANIAS.CONCESIONCOMPANIA : null;
                    break;
                case 'presupuestos':
                    map = getPresupuestos(data);
					break;
                case 'presupuestosRed':
                    map = getPresupuestos(data);
					break;
                case 'procesos':
                    map = getProcesos(data);
					break;
					/*case 'colaboradores':
                    	map.list_total = data.data.
                    	map.list_datos = data.data.*/
					
				case 'tarifas':
					console.log(data);
					if(typeof data.data.tarifas != 'undefined'){
						map = {
								"list_total": data.data.nuTarifas,
								"list_datos" : data.data.tarifas.TARIFAS,
								"status" : data.status
							}
					}else{
						map = {
								"list_total": data.data.nuTarifas,
								"list_datos": [],
								"status" : data.status
							}
					}
					
					break;
				case 'garantias':
					console.log(data);
					if(typeof data.data.GARANTIAS != 'undefined'){
						map = {
								"list_total": data.data.NUMERO_GARANTIAS,
								"list_datos" : data.data.GARANTIAS,
								"status" : data.status
							}
					}else{
						map = {
								"list_total": data.data.NUMERO_GARANTIAS,
								"list_datos": [],
								"status" : data.status
							}
					}
					
					break;
			}
			return map;
		}

        vm.exportarExcel = function(){
        	
            var filtro = vm.form;
            vm.msg.textContent('Ha ocurrido un error al exportar');
            vm.msgOk = "Descarga correcta";
        	if (filtro != undefined) {
        		
                vm.parent.abrirModalcargar(true);
        		if (vm.url == "alarmas" && vm.isPendiente == false) {
		        	ExportService.exportarAlarmas(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_alarmas_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
                    });
                } else if (vm.url == "alarmas" && vm.isPendiente == true) {
                        ExportService.exportarAlarmasPendientes(filtro)
                        .then(function successCallback(response) {
    		            	vm.parent.cambiarDatosModal(vm.msgOk);
                            if (response.status === 200) {
	                                let utf8decoder = new TextDecoder();
	                                var mensajeUArchivo = utf8decoder.decode(response.data);
	                                if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                    var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                    if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                        msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                        $mdDialog.show(msg);
	                                    } 
	                                } else {
	                                    saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_alarmas_pendientes_exportado.xlsx');
	                                }
                            }
                        }, function errorCallback(response){
                            vm.parent.abrirModalcargar(false);
                            $mdDialog.show(vm.msg);
                    });
        		} else if (vm.url == "clientes" && vm.urlExport == '') {
		        	ExportService.exportarClientes(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_clientes_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "polizas" || vm.urlExport == 'polizas') {
		        	ExportService.exportarPolizas(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent("Ha ocurrido un error en la exportación");
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_polizas_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "presupuestos" || vm.urlExport == 'presupuestos') {
		        	ExportService.exportarPresupuestos(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_presupuestos_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "recibos" || vm.urlExport == 'recibos' || vm.url == "ultRecibos" || vm.url == "recibosDevueltos") {
		        	ExportService.exportarRecibos(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_recibos_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
                    });
                } else if (vm.url == "remesas") {
		        	ExportService.exportarRemesas(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_remesas_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "renting") {
		        	ExportService.exportarRenting(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_renting_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "riesgos" || vm.urlExport == 'riesgos') {
		        	ExportService.exportarRiesgos(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
		                		let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_riesgos_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "siniestros" || vm.urlExport == 'siniestros' || vm.url == "movimientos_economicos") {
		        	ExportService.exportarSiniestros(filtro)
		            .then(function successCallback(response) {
		            	if (vm.form.IS_SELECTED != null) {
		            		delete vm.form.IS_SELECTED;
		            	}
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                            	var nombreArchivo = "listado_siniestros_exportado.xlsx";
	                            	
	                            	if (vm.url == "movimientos_economicos") {
	                            		nombreArchivo = "listado_movimientos_exportado.xlsx";
	                            	}
	                            	
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), nombreArchivo);
	                            }
		                }
		            }, function errorCallback(response){
		            	if (vm.form.IS_SELECTED != null) {
		            		delete vm.form.IS_SELECTED;
		            	}
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
        		} else if (vm.url == "solicitudes" && vm.tipo == 'solicitud'|| vm.urlExport == 'solicitudes') {
		        	ExportService.exportarSolicitudes(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_solicitudes_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });
                } else if (vm.url == "solicitudes" && vm.tipo == "missolicitud") {
		        	ExportService.exportarSolicitudesPendientes(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_solicitudes_pendientes_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
                    });
                } else if (vm.url == "ficherosErrores") {
		        	ExportService.exportarErrores(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_ficheros_errores_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
                    });
                } else if (vm.url == "ficherosProcesados") {
		        	ExportService.exportarProcesados(filtro)
		            .then(function successCallback(response) {
		            	vm.parent.cambiarDatosModal(vm.msgOk);
		                if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_ficheros_procesados_exportado.xlsx');
	                            }
		                }
		            }, function errorCallback(response){
                        vm.parent.abrirModalcargar(false);
                        $mdDialog.show(vm.msg);
		            });

	        	} else if (vm.url == "ficherosGenerados") {
	                ExportService.exportarProcesados(filtro)
	                .then(function successCallback(response) {
	                    vm.parent.cambiarDatosModal(vm.msgOk);
	                    if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_ficheros_generados_exportado.xlsx');
	                            }
	                    }
	                }, function errorCallback(response){
	                    vm.parent.abrirModalcargar(false);
	                    $mdDialog.show(vm.msg);
	                });		
	                
	        	} else if (vm.url == "enviosMovistar" || vm.urlExport == 'dispositivos') {
	                ExportService.exportarDispositivos(filtro)
	                .then(function successCallback(response) {
	                    if (response.status === 200) {
	                            let utf8decoder = new TextDecoder();
	                            var mensajeUArchivo = utf8decoder.decode(response.data);
	                            if(mensajeUArchivo.search('ID_RESULT') != -1) {
	                                var objtMensajeUArchivo = JSON.parse(mensajeUArchivo);
	                                if(objtMensajeUArchivo.ID_RESULT != 0) {
	                                    msg.textContent(objtMensajeUArchivo.DS_RESULT);
	                                    $mdDialog.show(msg);
	                                } 
	                            } else {
	        	                    vm.parent.cambiarDatosModal(vm.msgOk);
	                                saveAs(new Blob([response.data], { type: 'application/vnd.ms-excel' }), 'listado_dispositivos_exportado.xlsx');
	                            }
	                    }
	                }, function errorCallback(response){
	                    vm.parent.abrirModalcargar(false);
	                    $mdDialog.show(vm.msg);
	                });			
                
	        	
        	} else {
                vm.msg.textContent('Realice una nueva búsqueda para exportar los resultados a excel');
                $mdDialog.show(vm.msg);
        	}
    		}
        }
        
        //Cerrar/Abrir sideNav

        vm.recargarListado = function(type){
            
            if(type == 'usuarios'){
                vm.tipo = 'usuarios';
                if(vm.form == undefined || vm.form == null){
                    vm.form = {};
                }
            }
            
            vm.buscar(vm.form,vm.tipo);
            
        }
        
        vm.lockLeft = true;

        vm.lateral = function () {
            if (vm.lockLeft == true) {
                vm.lockLeft = false;
            } else {
                vm.lockLeft = true;
            }
        }

		vm.querySearch = function (query, list, key) {
            if (list != undefined) {
                var results = query ? list.filter(createFilterFor(query, key)) : list,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
        }
        function createFilterFor(query, key) {
            var uppercaseQuery = query.toUpperCase();

            return function filterFn(list) {
                if (key != "text")
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) === 0);
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
            };
        }

		vm.exportarExcelGrid = function (grid, gridApi, name) {
			if (grid != null && gridApi != null) {
				grid.exporterExcelFilename = name;
			    uiGridExporterService.excelExport(gridApi, 'all', 'all');
			}
		}
		
        vm.getUrlParam = function( name, url ) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            return results == null ? null : results[1];
        }  
        
		vm.checkMenuOption = function(lst, id, subId) {
            return CommonUtils.checkMenuOption(lst, id, subId);
        }

    }

    ng.module('App').component('busquedaApp', Object.create(busquedaComponent));

})(window.angular);