(function (ng) {

    //Crear componente de app
    var detalleComponent = {
        controllerAs: '$ctrl',
        template: '<poliza-rgpd read-only="$ctrl.readOnly" datos-cliente="$ctrl.datosCliente" ng-if="$ctrl.loadTemplate == \'rgpd_polizas\'"></poliza-rgpd>' +
        	'<poliza-sd read-only="$ctrl.readOnly" datos-cliente="$ctrl.datosCliente" ng-if="$ctrl.loadTemplate == \'poliza\'"></poliza-sd>' +
        	'<cliente-rgpd is-consultagdpr="$ctrl.isConsultagdpr" ng-if="$ctrl.loadTemplate == \'rgpd_clientes\'"></cliente-rgpd>' +
            '<cliente-sd is-consultagdpr="$ctrl.isConsultagdpr" ng-if="$ctrl.loadTemplate == \'cliente\'"></cliente-sd>' +
            '<solicitud-sd call-get-detail="$ctrl.callGetDetail" datos-cliente="$ctrl.datosCliente" ng-if="$ctrl.loadTemplate == \'solicitud\'"></solicitud-sd>' +
            '<recibo-sd ng-if="$ctrl.loadTemplate == \'recibo\'"></recibo-sd>' +
            '<recibo-devuelto-sd ng-if="$ctrl.loadTemplate == \'recibodevuelto\'"></recibo-devuelto-sd>' +
            '<det-reclamacion ng-if="$ctrl.loadTemplate == \'reclamaciones\'"></det-reclamacion>' +
            '<remesa-sd ng-if="$ctrl.loadTemplate == \'remesa\'"></remesa-sd>' +
            '<tarifa-sd ng-if="$ctrl.loadTemplate == \'tarifas\'"></tarifa-sd>' +
            '<userws-sd ng-if="$ctrl.loadTemplate == \'userws\'"></userws-sd>' +
            '<usuario-sd ng-if="$ctrl.loadTemplate == \'usuario\'"></usuario-sd>' +
            '<siniestro-sd ng-if="$ctrl.loadTemplate == \'siniestro\'"></siniestro-sd>' +
            '<aseguradora-sd ng-if="$ctrl.loadTemplate == \'aseguradora\'"></aseguradora-sd> ' + 
            '<colaborador-sd ng-if="$ctrl.loadTemplate == \'colaborador\'"></colaborador-sd> ' +
            '<reaseguradora-sd ng-if="$ctrl.loadTemplate == \'reaseguradora\'"></reaseguradora-sd> ' +
            '<fichero-sd ng-if="$ctrl.loadTemplate == \'fichero\'"></fichero-sd> ' +
            '<fichero-error-sd ng-if="$ctrl.loadTemplate == \'ficheroerror\'"></fichero-error-sd> ' +
            '<colectivo-sd ng-if="$ctrl.loadTemplate == \'colectivo\'"></colectivo-sd> ' +
            '<detalle-movistar ng-if="$ctrl.loadTemplate == \'dispositivo\'"></detalle-movistar> ' +
            '<producto-sd ng-if="$ctrl.loadTemplate == \'producto\'"></producto-sd> ' +
            '<proveedor-sd ng-if="$ctrl.loadTemplate == \'proveedor\'"></proveedor-sd> ' +
            '<movimiento-sd ng-if="$ctrl.loadTemplate == \'movimiento\'"></movimiento-sd> ' +
            '<mediador-sd ng-if="$ctrl.loadTemplate == \'mediador\'"></mediador-sd> ',
        $inject: ['$q', 'sharePropertiesService', '$location', '$uibModal', 'BusquedaService', 'BASE_APP', '$mdDialog', 'BASE_SRC'],
        bindings: {
            idDetalle: '<',
            tipo: '<',
            permisos: '<',
            datosCliente: '<',
            callGetDetail: '<',
            isConsultagdpr: '<',
            readOnly: '<'
        },
        require: {
        	pre:'^sdApp',
            parent: '^busquedaApp'
        }
    }
    
   
    detalleComponent.controller = function detalleComponentControler($q, sharePropertiesService, $location, $uibModal, BusquedaService, BASE_APP, $mdDialog, BASE_SRC) {
        var vm = this;
        //vm.db=sharePropertiesService.get('db');
        vm.nuevo = false;
        var url = window.location;
        var tipo;
        var isclient = false;
        
        
        
        this.$onChanges = function (bindings) {
            vm.datos=null;
            vm.datos = bindings.idDetalle.currentValue;
            
            if(vm.parent.url == 'clientes' || vm.parent.url == 'rgpd_clientes'){
            	vm.isclient = true;
            }
            if(vm.parent.url == 'solicitudes'){
            	vm.isclient = false;
            }
            
            
            
            if(bindings.permisos != undefined){
                vm.permisos = bindings.permisos.currentValue;
            }
            
            
            var tipo = vm.tipo;
            vm.colectivos = vm.parent.colectivos;
    		/*vm.list = vm.datos.LST_ASEGURADOS;
    		angular.forEach(vm.list, function(values,key){
    			console.log(values.ID_TIPO_CLIENTE);
    			if(values.ID_TIPO_CLIENTE == 1){
    				vm.pagador = vm.list[key];
    			}
    			else if(values.ID_TIPO_CLIENTE == 2){
    				vm.conductor = vm.list[key];
    			}
    			else{
    				vm.tomador = vm.list[key];
    			}
    		});*/

            this.loadTemplate = cargarPlantilla(tipo);


            
    		/*if(/clientes$/.test(url)){
    			var json = {
            			"LST_ASEGURADOS":[
            				{
            					"ID_CLIENTE":vm.datos.ID_CLIENTE
            				}
            			]
            	};
            	BusquedaService.buscar(json, 'polizas')
        		.then(function successCallback(response){
        			if(response.status === 200){
        				console.log(response.data);
        				if(response.data.NUMERO_POLIZAS>0){
        					$.each(response.data.POLIZAS.POLIZA, function(index, value) {
                                var fechaEfecto = response.data.POLIZAS.POLIZA[index].FD_INICIO;
                                var fechaVencimiento = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO;
                                var fechaEmision = response.data.POLIZAS.POLIZA[index].FD_EMISION;
                                var fechaAlta = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA;
                                var fechaMod = response.data.POLIZAS.POLIZA[index].FT_USU_MOD;

                                if(fechaEfecto != null && fechaEfecto != ""){
                                	var n2 = response.data.POLIZAS.POLIZA[index].FD_INICIO.indexOf(':');
                                	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-2 : fechaEfecto.length);
                                	response.data.POLIZAS.POLIZA[index].FD_INICIO = fechaEfecto;                                    	
                                }

                                if(fechaVencimiento != null && fechaVencimiento != ""){
                                	var n2 = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO.indexOf(':');
                                	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-2 : fechaVencimiento.length);
                                	response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO = fechaVencimiento;
                                }
                                
                                if(fechaEmision != null && fechaEmision != ""){
                                	var n2 = response.data.POLIZAS.POLIZA[index].FD_EMISION.indexOf(':');
                                	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-2 : fechaEmision.length);
                                	response.data.POLIZAS.POLIZA[index].FD_EMISION = fechaEmision;
                                }
                                
                                if(fechaAlta != null && fechaAlta != ""){
                                	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA.indexOf(':');
                                	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-2 : fechaAlta.length);
                                	response.data.POLIZAS.POLIZA[index].FT_USU_ALTA = fechaAlta;
                                }
                                
                                if(fechaMod != null && fechaMod != ""){
                                	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_MOD.indexOf(':');
                                	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-2 : fechaMod.length);
                                	response.data.POLIZAS.POLIZA[index].FT_USU_MOD = fechaMod;
                                }
                            });
        					//Pintar la tabla
                         	sharePropertiesService.set('polizas', response.data.POLIZAS.POLIZA);
                            //localStorage.polizas = JSON.stringify(sharePropertiesService.get('polizas'));
        					
                            vm.polizas = sharePropertiesService.get('polizas');
                            vm.polizas = vm.polizas.slice(0,10);
                            
                            vm.totalItems = response.data.NUMERO_POLIZAS;
                            console.log(vm.totalItems);
                            vm.showTable=true;
                            
        				}else{                           
        					//localStorage.polizas = "";
        					
        					vm.showTable=false;
        				}
                        
        		}},function errorCallback(response){
        			vm.showTable=false;
                    alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
        		});
    		}*/

        }

        //Buscar la lista
        vm.searchFromDetalle = function (form, tipo) {
            //localStorage.clear();
            var lista = [];
            vm.listDatos = {};
            vm.vista = 2;

            vm.parent.detalleCliente = form;

            BusquedaService.buscar(form, tipo)
                .then(function successCallback(response) {
                    if (response.status === 200) {
                       
                        var respuesta = mapLista(tipo, response);
                        if (respuesta.list_total > 0) {
                            lista = respuesta.list_datos

                            vm.listDatos = { "listas": lista, "tipo": tipo };

                            sharePropertiesService.set(tipo, lista);

                            vm.totalItems = respuesta.list_total;
                            //vm.gridOptions.data = sharePropertiesService.get('polizas');
                            //localStorage[tipo] = JSON.stringify(lista);

                            vm.dsActive = 0;
                            vm.vista = 4;
                        }
                        else {
                            vm.vista = 3;
                        }

                    }

                }, function errorCallback(response) {
    				/*vm.completed="";
                    vm.mensajeBuscar = true;
                    vm.loading = false;*/
                    if (response.status == 406 || response.status == 401) {
                        vm.parent.logout();
                    }
                    else {
                        vm.vista = 1;
                    }

                });
        }

        //Cargar los datos necesarios que ha elegido
    	/*if(localStorage.poliza != null && localStorage.poliza != "" && /polizas$/.test(url)){
    		vm.datos = JSON.parse(localStorage.poliza);
    		vm.list = vm.datos.LST_ASEGURADOS;
    		console.log(vm.list);
    		angular.forEach(vm.list, function(values,key){
    			console.log(values.ID_TIPO_CLIENTE);
    			if(values.ID_TIPO_CLIENTE == 1){
    				vm.pagador = vm.list[key];
    			}
    			else if(values.ID_TIPO_CLIENTE == 2){
    				vm.conductor = vm.list[key];
    			}
    			else{
    				vm.tomador = vm.list[key];
    			}
    		});
    	}
    	else{
    		vm.datos = JSON.parse(localStorage.cliente);
    		console.log(vm.datos);
    		for(var i=0;i<vm.db.tipoDoc.length;i++){
        		if(vm.db.tipoDoc[i].id == vm.datos.ID_TIPO_DOCUMENTO){
        			vm.selected=vm.db.tipoDoc[i];
        		}
        	}
    	}*/

        function cargarPlantilla(tipo) {
            //    		if(tipo == "poliza"){
            //    			return "poliza";
            //    		}
            //    		else if(tipo == "cliente"){
            //    			return "cliente";
            //    		}
            //    		else if(tipo == "recibo"){
            //    			return "recibo";
            //    		}
            //    		else if(tipo == "solicitud"){
            //    			return "solicitud";
            //    		}
            //    		else if(tipo == "tarifas"){
            //    			return "tarifas";
            //    		}
            //    		else if(tipo == "usuario"){
            //    			return "usuario";
            //    		}
            //    		else if(tipo == "siniestro"){
            //    			return "siniestro;
            //    		}
            return tipo;
        }

        //Marcha atras
        vm.atras = function () {
            window.history.back();
        }

        //Abrir la sección
        vm.mostrarSeccion = function (id, seccion, id2) {
            $(seccion).slideDown();
            $(id).hide();
            $(id2).show();
        }

        //Cerrar la sección
        vm.ocultarSeccion = function (id, seccion, id2) {
            $(seccion).slideUp();
            $(id).hide();
            $(id2).show();
        }

        //Paginación
        vm.currentPage = 1;
        vm.maxSize = 10;
        vm.itemsPerPage = 10;
        vm.totalItems = 0;
        vm.mensajeBuscar = true;

        vm.changePage = function (key) {
            vm[key] = sharePropertiesService.get(key);
            localStorage.page = vm.currentPage;
            vm[key] = vm[key].slice(((vm.currentPage - 1) * vm.itemsPerPage), ((vm.currentPage) * vm.itemsPerPage));
        }

    	/*vm.filtrar = function(filtro){
    		vm.parent.buscar(filtro, 'polizas');
    	}*/

        //Mostrar las tablas
        //this.$onChanges = function(){
        //vm.showTable = function(tipo){
    	/*var json = {
    			"LST_ASEGURADOS":[
    				{
    					"ID_CLIENTE":vm.datos.ID_CLIENTE
    				}
    			]
    	};
    	BusquedaService.buscar(json, 'polizas')
		.then(function successCallback(response){
			if(response.status === 200){
				console.log(response.data);
				if(response.data.NUMERO_POLIZAS>0){
					$.each(response.data.POLIZAS.POLIZA, function(index, value) {
                        var fechaEfecto = response.data.POLIZAS.POLIZA[index].FD_INICIO;
                        var fechaVencimiento = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO;
                        var fechaEmision = response.data.POLIZAS.POLIZA[index].FD_EMISION;
                        var fechaAlta = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA;
                        var fechaMod = response.data.POLIZAS.POLIZA[index].FT_USU_MOD;

                        if(fechaEfecto != null && fechaEfecto != ""){
                        	var n2 = response.data.POLIZAS.POLIZA[index].FD_INICIO.indexOf(':');
                        	fechaEfecto = fechaEfecto.substring(0, n2 != -1 ? n2-2 : fechaEfecto.length);
                        	response.data.POLIZAS.POLIZA[index].FD_INICIO = fechaEfecto;                                    	
                        }

                        if(fechaVencimiento != null && fechaVencimiento != ""){
                        	var n2 = response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO.indexOf(':');
                        	fechaVencimiento = fechaVencimiento.substring(0, n2 != -1 ? n2-2 : fechaVencimiento.length);
                        	response.data.POLIZAS.POLIZA[index].FD_VENCIMIENTO = fechaVencimiento;
                        }
                        
                        if(fechaEmision != null && fechaEmision != ""){
                        	var n2 = response.data.POLIZAS.POLIZA[index].FD_EMISION.indexOf(':');
                        	fechaEmision = fechaEmision.substring(0, n2 != -1 ? n2-2 : fechaEmision.length);
                        	response.data.POLIZAS.POLIZA[index].FD_EMISION = fechaEmision;
                        }
                        
                        if(fechaAlta != null && fechaAlta != ""){
                        	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_ALTA.indexOf(':');
                        	fechaAlta = fechaAlta.substring(0, n2 != -1 ? n2-2 : fechaAlta.length);
                        	response.data.POLIZAS.POLIZA[index].FT_USU_ALTA = fechaAlta;
                        }
                        
                        if(fechaMod != null && fechaMod != ""){
                        	var n2 = response.data.POLIZAS.POLIZA[index].FT_USU_MOD.indexOf(':');
                        	fechaMod = fechaMod.substring(0, n2 != -1 ? n2-2 : fechaMod.length);
                        	response.data.POLIZAS.POLIZA[index].FT_USU_MOD = fechaMod;
                        }
                    });
					//Pintar la tabla
                 	sharePropertiesService.set('polizas', response.data.POLIZAS.POLIZA);
                    //localStorage.polizas = JSON.stringify(sharePropertiesService.get('polizas'));
					
                    vm.polizas = sharePropertiesService.get('polizas');
                    vm.polizas = vm.polizas.slice(0,10);
                    
                    vm.totalItems = response.data.NUMERO_POLIZAS;
                    console.log(vm.totalItems);
                    vm.showTable=true;
                    
				}else{                           
					//localStorage.polizas = "";
					
					vm.showTable=false;
				}
                
		}},function errorCallback(response){
			vm.showTable=false;
            alert("En estos momentos no podemos procesar tu solicitud. Si el problema persiste puedes ponerte en contacto con nosotros.");
		});*/

        //Botón para ver el detalle
        vm.verDetalle = function (fila, key) {
            if (key == 'poliza') {
                localStorage.poliza = JSON.stringify(fila);
                $location.path('/detalle/polizas');
            }
            else if (key == 'cliente') {
                localStorage.cliente = JSON.stringify(fila);
                $location.path('/detalle/cliente');
            }
            else {
                localStorage.cliente = JSON.stringify(fila);
                $location.path('/detalle/recibo');
            }
        }

        //Abrir presupuesto
        vm.crearPresupuesto = function () {
            $uibModal.open({
                templateUrl: BASE_APP + 'src/detalle/cliente.modal.html',
                plain: true,
                backdrop: true,
                windowClass: 'app-modal-window',
                controller: ['$scope', '$http', function ($scope, $http) {
                    $scope.showBoton = true;
                    $scope.abrirRamo = function () {
                        $('#modalCuerpo').html('<iframe src="http://10.102.10.219:8080/TarificadorWeb/?userId=' + $scope.ramos + '&type=10" style="width:100%; min-height:700px; border:none;"></iframe>');
                    	/*$http.get('http://10.102.10.219:8080/TarificadorWeb/?userId='+$scope.ramo+'&type=10')
                    		.then(function (response){
                    			$('#modalCuerpo').html('<iframe src="http://10.102.10.219:8080/TarificadorWeb/?userId="'+$scope.ramo+'"&type=10" style="width:100%; heigth:500px"></iframe>');
                    		})*/
                        $scope.showBoton = false;
                    };

                }]
            });
        }

        vm.openRecibo = function () {
            var uibModalInstance = $uibModal.open({
                template: '<detalle-poliza-modal></detalle-poliza-modal>',
                plain: true,
                size: 'lg',
                windowClass: 'app-modal-window',
                component: 'detallePolizaModal'
                /*controllerAs: 'md',
                controller: ['$scope', function($scope,$uibModalInstance){
                	var md=this;
                	md.poliza=vm.datos;
                	md.db=vm.db;
                	
                	console.log(md.poliza);
                	
                    md.crearRecibo = function(){
                    	console.log(md.recibo);
                    	angular.forEach(md.recibo, function(data, key) {
                            console.log(key);
                            if (dict != undefined && dict.required) {
                                if (value == "") {
                                    data.$error['required'] = 'Campo obligatorio';
                                }
                            }
                        });
                    	
                    	$scope.cancel = function(){
                            $uibModalInstance.dismiss('cancel');
                        };
                    };
                }]*/
            });
        }


        //Cambiar formato de la fecha
        vm.dateFormat = function dateFormat(fecha) {
            //var fecha2 = Date(fecha);
            var anio = fecha.getFullYear();

            var mes = fecha.getMonth() + 1;
            var mes = mes.toString().length == 1 ? "0" + mes.toString() : mes;

            var diaString = fecha.getDate().toString();
            var dia = diaString.length == 1 ? "0" + diaString : diaString;

            var fechaFormat = anio + "-" + mes + "-" + dia;
            return fechaFormat;
        }
        
        vm.abrirDialogo = function(msg){
    		$mdDialog.show({
    			templateUrl: BASE_SRC+'detalle/detalle.modals/accept.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    //targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    		    	var md = this;

    		    	md.msg = msg;
    				
    				md.hide = function() {
    	    	      $mdDialog.hide();
    	    	    };

    	    	    md.cancel = function() {
    	    	      $mdDialog.cancel();
    	    	    };

    	    	    md.answer = function(answer) {
    	    	      $mdDialog.hide(answer);
    	    	    };
              
                }]
    		});
    	}


        //Mapear los datos devueltos.
        function mapLista(tipo, data) {
            var map = {};
            switch (tipo) {
                case 'polizas':
                    map = getPolizas(data);
                    break;
                case 'clientes':
                    map = getClientes(data);
                    break;
                case 'solicitud':
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
                case 'recibosByPoliza':
                    map = getRecibos(data);
                    break;
                case 'siniestros':
                    map = getSiniestros(data);
                    break;
                case 'comisionistasByPoliza':
                    map.list_total = data.data.NUMERO_COMISIONISTASPOLIZA
                    break;
                case 'presupuestos':
                    map = getPresupuestos(data);
                    break;
                case 'riesgos':
                    map = getRiesgos(data);
                    break;
            }
            return map;
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
                    return (list[key].toUpperCase().includes(uppercaseQuery));
                else
                    return (list[key].toUpperCase().indexOf(uppercaseQuery) >= 0);
            };
        }
    }



    ng.module('App').component('detalleSd', Object.create(detalleComponent));

})(window.angular);


(function (ng) {
    var modalPolizaComponent = {
        controllerAs: 'md',
        template: '<div ng-include="md.loadTemplate()"></div>',
        $inject: ['sharePropertiesService', 'BASE_APP'],
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        }
    }

    modalPolizaComponent.controller = function detalleComponentControler(sharePropertiesService, BASE_APP) {
        var md = this;
        md.db = sharePropertiesService.get('db');

        this.loadTemplate = function () {
            return BASE_APP + 'src/detalle/polizas.modal.html';
        }

        md.crearRecibo = function () {
            var users = [
                { firstName: "John", lastName: "Doe", age: 28, gender: "male" },
                { firstName: "Jane", lastName: "Doe", age: 5, gender: "female" },
                { firstName: "Jim", lastName: "Carrey", age: 54, gender: "male" },
                { firstName: "Kate", lastName: "Winslet", age: 40, gender: "female" }
            ];

            var user = _.find(users, { lastName: "Doe", gender: "male" });

            angular.forEach(md.recibo, function (data, key) {

            });

            //md.close({$value: 'cancel'});
        }

        md.cancel = function () {
            md.dismiss({ $value: 'cancel' });
        }

    }

    ng.module('App').component('detallePolizaModal', Object.create(modalPolizaComponent));

})(window.angular);

