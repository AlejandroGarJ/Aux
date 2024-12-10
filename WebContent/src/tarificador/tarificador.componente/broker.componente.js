(function(ng) {	


	//Crear componente de app
    var brokerComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$window', '$q', '$location', '$timeout','$mdDialog', '$sce', 'BASE_SRC', 'BrokerService', 'TiposService', 'ClienteService', 'DescargaService', 'ExportService', 'constantsTipos'],
    		require: {
            	parent:'^sdApp',
				tar: '^?sdTarificador',
    		},
			bindings: {
				submenu: '&'
			}
    }
    
    brokerComponent.controller = function brokerComponentControler($scope, $window, $q, $location, $timeout, $mdDialog, $sce, BASE_SRC, ClienteService, BrokerService, TiposService, DescargaService, ExportService, constantsTipos) {
		var vm = this;
		vm.loading = true;
		vm.isTarMovil = false;
        vm.submenu = true;
		vm.showVideo = false;
		vm.listProgramas = [];
		vm.listProductos = [];
		vm.tipos = {};
		vm.datos = {};
		vm.video = {};
		// vm.showPubli = true;
		var idCampaignNotice = 2;
		var idCampaignEmailing = 3;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.iframeUrl = '';
		var ruta = "src/img/broker/";
		vm.videoComercial = {};
        vm.listaVideos = [];
		// vm.templateDocumentacion = "src/documentacion/documentacion.view.html";
		
    	this.$onInit = function() {

			var perfil = null;
        	vm.perfil = null;
            vm.mediador = null;
			var idMediador;
    		vm.rol = window.sessionStorage.rol;
			var idProgramaUrl = vm.parent.getUrlParam('idPrograma', $location.url());
			vm.showMenu = '';
			vm.showCibernovedades = false;
			vm.tipos.noticias = [];
			vm.tipos.documentacion = [];
			vm.tipos.formacion = [];

			if ($window.sessionStorage.perfil != null && $window.sessionStorage.perfil != "") {
				perfil = JSON.parse($window.sessionStorage.perfil);
				vm.perfil = JSON.parse($window.sessionStorage.perfil);

				if (perfil.adicional != null && perfil.adicional.ID_COMPANIA != null) {
					if(vm.parent.mediador != undefined && Object.keys(vm.parent.mediador).length != 0){
						vm.mediador = {
								ID_COMPANIA: vm.parent.mediador.ID_COMPANIA,
								NO_COMPANIA: vm.parent.mediador.NO_COMPANIA
							}
							idMediador = vm.parent.mediador.ID_COMPANIA;
					}else{
						vm.mediador = {
							ID_COMPANIA: perfil.adicional.ID_COMPANIA,
							NO_COMPANIA: perfil.adicional.NO_COMPANIA
						}
						idMediador = vm.mediador.ID_COMPANIA;
					}
				}

				if (perfil.productos != null && perfil.productos.length > 0) {
                    var programa = null;
                    
                    for (var i = 0; i < perfil.productos.length; i++) {
                        var programa = perfil.productos[i];
                        
                        //Añadimos el producto
                        vm.listProductos.push({
                            ID_PRODUCTO: programa.ID_PRODUCTO,
                            DS_PRODUCTO: programa.DS_PRODUCTO,
                            NO_PRODUCTO: programa.NO_PRODUCTO,
                            ID_PROGRAMA: programa.ID_PROGRAMA,
                            DS_PROGRAMA: programa.DS_PROGRAMA,
                            ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
                        });
                                                
                        //Comprobamos si el programa está ya en la lista. Si no está, se añade
                        var existePrograma = vm.listProgramas.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
                        if (existePrograma == -1) {
                            vm.listProgramas.push({
                                ID_PROGRAMA: programa.ID_PROGRAMA,
                                DS_PROGRAMA: programa.DS_PROGRAMA,
                                ID_PRODUCTO: programa.ID_PRODUCTO
                            })
                        }
                        
                    }

                    if (vm.listProgramas.length == 1) {
                        vm.ID_PROGRAMA = vm.listProgramas[0].ID_PROGRAMA;
                    }
                }
            }

			//Comprobar si existe el idPrograma en la url
            if (idProgramaUrl != null && idProgramaUrl != "") {
				vm.ID_PROGRAMA = parseInt(idProgramaUrl); 
            }

			if(vm.ID_PROGRAMA != undefined){
				vm.dsPrograma = vm.listProgramas.find(x => x.ID_PROGRAMA == vm.ID_PROGRAMA).DS_PROGRAMA;
				vm.pageName = 'portalgestor:'+vm.dsPrograma+':espacio-broker:home';
			}

			TiposService.getTipos({"ID_CODIGO": constantsTipos.FICHEROS})
			.then(function successCallback(response) {
				if (response.status === 200) {
					if(response.data.ID_RESULT == 0){
						vm.tipos.ficheros = response.data.TIPOS.TIPO;
						// vm.tipos.ficheros = vm.tipos.ficheros.filter(x => x.DS_TIPOS.startsWith(EB_));
						vm.tipos.documentacion = vm.tipos.ficheros.filter(x => x.ID_TIPOS == 21012 || x.ID_TIPOS == 21013 || x.ID_TIPOS == 21014 || x.ID_TIPOS == 21015);
						vm.tipos.documentacion.unshift({ID_TIPOS: 0, DS_TIPOS: 'EB_Todos'});
						vm.tipos.formacion = vm.tipos.ficheros.filter(x => x.ID_TIPOS == 21016 || x.ID_TIPOS == 21017 || x.ID_TIPOS == 21018);
						vm.tipos.formacion.unshift({ID_TIPOS: 0, DS_TIPOS: 'EB_Todos'});
					} 
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});

			TiposService.getTipos({"ID_CODIGO": constantsTipos.SUBTIPO_CAMPANA})
			.then(function successCallback(response) {
				if (response.status === 200) {
					if(response.data.ID_RESULT == 0){
						vm.tipos.noticias = response.data.TIPOS.TIPO; // mostrar solo que comiencen por ID_TIPO: 2 (NOTICIAS)
						vm.tipos.noticias.unshift({CO_TIPO: '20', DS_TIPOS: 'Todos'});
						vm.tipos.noticias = vm.tipos.noticias.filter(x => x.CO_TIPO.startsWith(idCampaignNotice));
					} 
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
			});

			BrokerService.getFilesBroker(idMediador, vm.ID_PROGRAMA)
			.then(function successCallback(response){
				if(response.status == 200){
					if(response.data.ID_RESULT == 0){
						if(response.data.LIST_DOCUMENTOS != undefined){
							vm.listDocuments = response.data.LIST_DOCUMENTOS; 
							vm.listDocumentacion = vm.listDocuments.filter(x => x.ID_TIPO_ARCHIVO == 21012 || x.ID_TIPO_ARCHIVO == 21013 || x.ID_TIPO_ARCHIVO == 21014 || x.ID_TIPO_ARCHIVO == 21015);
							vm.showCibernovedades = true;
							$mdDialog.cancel();
						}else{
							msg.textContent("No se han encontrado documentos.");
							$mdDialog.show(msg);
							vm.parent.dataLayerError(99, 'errorType', true, 'No se han encontrado documentos.', 'No se han encontrado documentos.', vm.pageName, vm.dsPrograma);
							vm.navTo('#!/area_privada?emp=true');
						}
					} else {
						msg.textContent(response.data.DS_RESULT);
						$mdDialog.show(msg);
						vm.parent.dataLayerError(response.data.ID_RESULT, 'errorType', true, response.data.DS_RESULT, response.data.DS_RESULT, vm.pageName, vm.dsPrograma);
						vm.navTo('#!/area_privada?emp=true');
					}
					vm.loading = true;
				}
			}, function callBack(response){
				msg.textContent("Se ha producido un error al cargar los documentos.");
				$mdDialog.show(msg);
				vm.parent.dataLayerError(99, 'errorType', true, 'Se ha producido un error al cargar los documentos.', 'Se ha producido un error al cargar los documentos.', vm.pageName, vm.dsPrograma);
				if(response.status == 406 || response.status == 401){
					vm.parent.logout();
				}
				vm.loading = false;
			});		

			if(idMediador == 4){
				vm.listaVideos = [];

			} else if(idMediador == 2 || idMediador == 614){
				vm.listaVideos = [
					{title: "Video comercial del producto", name: "9AxRc0KXDMQ?si=f_22pUVFfsdp6jow", thumbnailsUrl: ruta+"comercial.jpg", mediador: idMediador},
					{title: "Introducción al Ciberseguro", name:"cFlkgPnyRbw?si=tw4L5wWHQnCWoSSs", thumbnailsUrl: ruta+"introduccion.jpg", mediador: idMediador},
					{title: "Coberturas", name: "7Q-nSGQ9CU0?si=8im1zJzTef14oseA", thumbnailsUrl: ruta+"coberturas.jpg", mediador: idMediador}, 
					{title: "Contratación", name:"yNgL50p6FhE?si=2VQMlV-VsN1SK6DT", thumbnailsUrl: ruta+"contratacion.jpg", mediador: idMediador},
					{title: "Ayuda con el Acceso al Portal Gestor: Instrucciones para Usuarios", name:"B8kb2PdgsdA", thumbnailsUrl: ruta+"Acceso.jpg", mediador: idMediador},
					{title: "Tarificador: Tutorial Completo para Empezar a Cotizar", name:"uT8qFND_M88", thumbnailsUrl: ruta+"Ayuda_cotizar.jpg", mediador: idMediador},
					{title: "Cómo Visualizar Actividades Cotizables: Guía Paso a Paso", name:"ujU3tmQXSwA", thumbnailsUrl: ruta+"Actividades_Cotizables.jpg", mediador: idMediador}
				]; 
			
			} else {
				vm.listaVideos = [
					{title: "Video comercial del producto", name: "9AxRc0KXDMQ?si=f_22pUVFfsdp6jow", thumbnailsUrl: ruta+"comercial.jpg", mediador: idMediador},
					{title: "Introducción al Ciberseguro", name:"oKS_JiMbPBY", thumbnailsUrl: ruta+"introduccion.jpg", mediador: idMediador},
					{title: "Coberturas", name: "0reIfLiIP1A", thumbnailsUrl: ruta+"coberturas.jpg", mediador: idMediador}, 
					{title: "Contratación", name:"MpiroOJ75vY", thumbnailsUrl: ruta+"contratacion.jpg", mediador: idMediador},
					{title: "Ayuda con el Acceso al Portal Gestor: Instrucciones para Usuarios", name:"B8kb2PdgsdA", thumbnailsUrl: ruta+"Acceso.jpg", mediador: idMediador},
					{title: "Tarificador: Tutorial Completo para Empezar a Cotizar", name:"uT8qFND_M88", thumbnailsUrl: ruta+"Ayuda_cotizar.jpg", mediador: idMediador},
					{title: "Cómo Visualizar Actividades Cotizables: Guía Paso a Paso", name:"ujU3tmQXSwA", thumbnailsUrl: ruta+"Actividades_Cotizables.jpg", mediador: idMediador}
				]; 
			}

			// vm.videoComercial = {title: "Video comercial del producto", name: "9AxRc0KXDMQ?si=f_22pUVFfsdp6jow", thumbnailsUrl: ruta+"comercial.jpg"};
			
			// vm.cargarVideo(videoComercial);

			BrokerService.getCampaignsByFilter({"ID_TIPO_CAMPAIGN": idCampaignNotice})
			.then(function successCallback(response) {
				if (response.status === 200) {
					if (response.data.ID_RESULT == 0) {
						vm.listaNoticias = response.data.CAMPAIGNS;
					}
				}
			});
			
			BrokerService.getCampaignsByFilter({"ID_TIPO_CAMPAIGN": idCampaignEmailing})
			.then(function successCallback(response) {
				if (response.status === 200) {
					if (response.data.ID_RESULT == 0) {
						vm.listaEmailing = response.data.CAMPAIGNS;
					}
				}
			});
		}	
		
    	this.$onChanges = function(){
			
    	}
    	
    	this.loadTemplate=function() {
			return "src/tarificador/tarificador.view/broker.html";
			
    	}
    	
    	vm.validarFormulario = function(form){
    		for(var i=0; i<form.length; i++){
    			if(form[i]==true){
					msg.textContent('Se deben rellenar correctamente los datos de este paso antes de continuar');
					$mdDialog.show(msg)
        			break;
        		}
    		}
		}

		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}

		vm.changeMenu = function(menu){
			delete vm.ID_TIPO_ARCHIVO;
			delete vm.ID_SUBTIPO_CAMPAIGN;
			vm.showSubMenu = '';
    		vm.showMenu = menu;

			const spans = document.querySelectorAll('.nav .nav-item span'); 			
			spans.forEach(span => {
				span.addEventListener('click', () => {
				spans.forEach(s => s.classList.remove('highlighted'));
				
				span.classList.add('highlighted');
				});
			});
			const spanSelector = document.querySelector('.menuBroker[ng-click*='+vm.showMenu+']');
			spanSelector.classList.add('highlighted');

			vm.parent.dataLayer('portalgestor:'+vm.dsPrograma+':espacio-broker:'+vm.showMenu, vm.dsPrograma);
    		// if (menu == 'documentacion') {
			// 	vm.listDocumentacion = vm.listDocuments.filter(x => x.ID_TIPO_ARCHIVO == 21012 || x.ID_TIPO_ARCHIVO == 21013 || x.ID_TIPO_ARCHIVO == 21014 || x.ID_TIPO_ARCHIVO == 21015);
    		// 	vm.loadUrl = '#!/documentacion?idPrograma='+vm.ID_PROGRAMA;
			// } else if(menu == 'siniestros') {
			// 	vm.loadUrl = '#!/siniestros_list?idPrograma='+vm.ID_PROGRAMA
			// }
			vm.pageName ='portalgestor:'+vm.dsPrograma+':espacio-broker:'+vm.showMenu;
    	}

		vm.changeSubMenu = function(submenu){
			const spanSelector = document.querySelector('.menuBroker[ng-click*='+vm.showMenu+']');
    		vm.showSubMenu = submenu.replace('EB_', '').toLowerCase();
			if(vm.showSubMenu == 'todos'){
				vm.changeMenu(vm.showMenu);
			}
			spanSelector.classList.add('highlighted');
			vm.parent.dataLayer('portalgestor:'+vm.dsPrograma+':espacio-broker:'+vm.showMenu+':'+vm.showSubMenu, vm.dsPrograma);

			vm.pageName = 'portalgestor:'+vm.dsPrograma+':espacio-broker:'+vm.showMenu+':'+vm.showSubMenu;
    	}

		vm.cargarVideo = function(video){
			dataLayer.push({
				'event' : 'asyncGTM',
				'componentType': 'input',
				'componentTitle': video.title,
				'componentContent': 'video'
			});

			vm.videoLink = 'https://www.youtube.com/embed/'+video.name;
			vm.trustedVideoLink = '';
			
			vm.trustedVideoLink = $sce.trustAsResourceUrl(vm.videoLink);
			vm.showVideo = true;

			$mdDialog.show({
				templateUrl: BASE_SRC + 'tarificador/tarificador.modal/video.modal.html',
				controllerAs: '$ctrl',
                clickOutsideToClose: false,

				controller:['$mdDialog', function($mdDialog){
					var md = this;
					md.showVideo = vm.showVideo;
					md.videoLink = vm.videoLink;

					md.cancel = function() {
                        $mdDialog.cancel();
						// if(vm.showPubli)
						// 	vm.showPubli = !vm.showPubli;
                    };  
				}]
			});
		}

		vm.showDsCampaign = function(idSubcampaign){
			var dsCampaign = "";
			if(vm.tipos.noticias != undefined){
				var notice = vm.tipos.noticias.find(x => x.CO_TIPO == idSubcampaign);

				if(notice != undefined){
					dsCampaign = notice.DS_TIPOS;
				}

			}
			return dsCampaign;
		}

		vm.openUrl = function(noticia){

			dataLayer.push({
				'event' : 'asyncGTM',
				'componentType': 'input',
				'componentTitle': noticia.DS_SHORT,
				'componentContent': 'noticia'
			});

			window.open(noticia.DS_LONG, '_blank'); 

			// IFRAME
			// vm.openIframe = true;
			// vm.iframeUrl = noticia.DS_LONG;

			// $mdDialog.show({
			// 	templateUrl: BASE_SRC + 'tarificador/tarificador.modal/video.modal.html',
			// 	controllerAs: '$ctrl',
            //     clickOutsideToClose: false,

			// 	controller:['$mdDialog', function($mdDialog){
			// 		var md = this;
			// 		md.openIframe = vm.openIframe;
			// 		md.iframeUrl = vm.iframeUrl;

			// 		md.cancel = function() {
            //             $mdDialog.cancel();
            //         };  
			// 	}]
			// });
		}

		vm.trustedImageLink = function(url){
			$sce.trustAsUrl(url);
		}

		vm.getResourceUrl = function(url){
			return url != undefined ? $sce.trustAs($sce.RESOURCE_URL, 'data:image/png;base64,'+url) : 'src/img/broker/preview.jpg';
		}

		vm.getDocuments = function(idTipoArchivo){
			return vm.listDocuments.filter(x => x.ID_TIPO_ARCHIVO == idTipoArchivo).length;
		}

		vm.buscarDocumentacion = function(mediador, programa){
    		if(vm.formDocumentacion.$invalid == true) {
				objFocus = angular.element('.ng-empty.ng-invalid-required:visible');
				msg.textContent('Seleccione los datos necesarios');
				$mdDialog.show(msg);
				if(objFocus != undefined) {
					objFocus.focus();
				}
    		} else {
				mediador = vm.ID_COMPANIA !=  null ? vm.ID_COMPANIA : vm.perfil.adicional.ID_COMPANIA;
				vm.parent.abrirModalcargar(true);
    			BrokerService.getFilesBroker(mediador, programa)
    			.then(function successCallback(response){
    				if(response.status == 200){
						if(response.data.ID_RESULT == 0){
							if(response.data.LIST_DOCUMENTOS != undefined){
								vm.listDocuments = response.data.LIST_DOCUMENTOS; // 
								$mdDialog.cancel();
							}else{
								msg.textContent('No se han encontrado documentos.');
								$mdDialog.show(msg);
								vm.parent.dataLayerError(99, 'errorType', true, 'No se han encontrado documentos.', 'No se han encontrado documentos.', vm.pageName, vm.dsPrograma);
							}
						} else {
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
							vm.parent.dataLayerError(response.data.ID_RESULT, 'errorType', true, response.data.DS_RESULT, response.data.DS_RESULT, vm.pageName, vm.dsPrograma);
						}
    					
    				}
    			}, function callBack(response){
    				msg.textContent("Se ha producido un error al cargar los documentos.");
    				$mdDialog.show(msg);
					vm.parent.dataLayerError(99, 'errorType', true, 'Se ha producido un error al cargar los documentos.', 'Se ha producido un error al cargar los documentos.', vm.pageName, vm.dsPrograma);
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
			
    	}

		vm.downloadFile = function (file, preview) {
			dataLayer.push({
				'event' : 'asyncGTM',
				'componentType': 'button',
				'componentTitle': file.NO_ARCHIVO,
				'componentContent': 'documento'
			});
			// vm.parent.abrirModalcargar(true);
			ExportService.downloadFile(file.ID_ARCHIVO)
            .then(function successCallback(response) {	
				if(response.ID_RESULT != null && response.ID_RESULT != 0) {
					vm.cargando = false;
					msg.textContent(response.DS_RESULT);
					$mdDialog.show(msg);
					vm.parent.dataLayerError(response.ID_RESULT, 'errorType', true, response.DS_RESULT, response.DS_RESULT, vm.pageName, vm.dsPrograma);
				} else {
					if(preview){
						const blob = new Blob([response.data], { type: 'application/pdf' });
                		vm.cargaDocumento(blob);
						// vm.parent.abrirModalcargar(false);
					} else {
						saveAs(new Blob([response.data]), file.NO_ARCHIVO);
						msg.textContent('Documento descargado correctamente');
						$mdDialog.show(msg);
					}
				}
            }, function callBack(response){
                msg.textContent('Se ha producido un error al descargar el archivo');
                $mdDialog.show(vm.msg);
				vm.parent.dataLayerError(response.ID_RESULT, 'errorType', true, 'Se ha producido un error al descargar el archivo', 'Se ha producido un error al descargar el archivo', vm.pageName, vm.dsPrograma);
                if(response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
		}
 
		vm.cargaDocumento = function(blob) {
			vm.showDocument = true;
			url = URL.createObjectURL(blob);
			window.open(url, '_blank');

			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 1000);  
		}

		vm.getEmailing = function (emailing) {

			dataLayer.push({
				'event' : 'asyncGTM',
				'componentType': 'button',
				'componentTitle': emailing,
				'componentContent': 'emailing'
			});

			fetch(emailing)
				.then(response => response.text())
				.then(html => {
					var archivoBlob = new Blob([html], { type: 'text/html' });

					var link = document.createElement('a');
					link.href = window.URL.createObjectURL(archivoBlob);
					link.download = emailing; 
					link.style.display = 'none';
					document.body.appendChild(link);

					link.click();
					link.remove();
				})
				.catch(error => {
					msg.textContent('Error al descargar el archivo');
					$mdDialog.show(msg);
					vm.parent.dataLayerError(99, 'errorType', true, 'Error al descargar el archivo.', 'Error al descargar el archivo.', vm.pageName, vm.dsPrograma);
				});
		}

	}
    
    ng.module('App').component('brokerApp', Object.create(brokerComponent));
    
    
    
})(window.angular);