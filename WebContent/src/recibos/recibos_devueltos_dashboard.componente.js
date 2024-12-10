(function (ng) {


    //Crear componente de app
    var recibosDevueltosDashboardComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', 'BASE_SRC', '$mdDialog','$window', 'validacionesService', '$location', 'sharePropertiesService', 'TiposService', 'ReciboService', 'ClienteService', 'ColectivoService', 'LocalidadesService', 'HogarService'],
        require: {
            parent: '^sdApp'
        }
    }



    recibosDevueltosDashboardComponent.controller = function recibosDevueltosDashboardComponentControler($q, BASE_SRC, $mdDialog, $window, validacionesService, $location, sharePropertiesService, TiposService, ReciboService, ClienteService, ColectivoService, LocalidadesService, HogarService) {
        vm = this;
        vm.db = sharePropertiesService.get('db');
        vm.dataGrafico = ['1121212','123234'];
        vm.labelsGrafico = ['1121212','123234'];
        vm.rol = $window.sessionStorage.rol;
        
        this.$onInit = function () {

            //Cargar permisos
    		if(vm.parent.getPermissions != undefined) {
                vm.permisos = vm.parent.getPermissions($location.$$url.substring(1, $location.$$url.length));
    		}

			TiposService.getTipoDocumento({})
            .then(function successCallback(response) {
                if (response.status == 200) {
                    vm.tipos={};
                    vm.tipos.tiposDocumento = response.data.TIPOS.TIPO;
                    vm.parent.listServices.listTipoDocumento = vm.tipos.tiposDocumento;
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });
			
			ReciboService.getDevueltos({})
            .then(function successCallback(response) {

                if (response.status == 200) {
                    vm.nuRecibos = response.data;                 
                    
                    if(vm.nuRecibos.PENDIENTES != undefined && vm.nuRecibos.AUTOMATICOS != undefined &&  vm.nuRecibos.GESTIONADOS != undefined &&  vm.nuRecibos.EN_PROCESO != undefined){
                    	 vm.nuRecibosTotales = (vm.nuRecibos.PENDIENTES + vm.nuRecibos.AUTOMATICOS + vm.nuRecibos.GESTIONADOS + vm.nuRecibos.EN_PROCESO);
                    }else{
                    	vm.nuRecibosTotales = 0;
                    }
                                     
                    //Cargar los gráficos
        			if(vm.nuRecibos != null && vm.nuRecibos != undefined){
        	        	var datosRecibos = {
        	        			total: vm.nuRecibosTotales,
        	        			pendienteGestion: vm.nuRecibos.PENDIENTES,
        	        			gestionados: vm.nuRecibos.GESTIONADOS,
        	        			gestionadosAuto: vm.nuRecibos.AUTOMATICOS,
        	        			enProceso: vm.nuRecibos.EN_PROCESO,
        	        			porcentajeGestionados: vm.nuRecibos.PORCENTAJE_GESTIONADOS
        	        	};
                	
                	
        	        	var options = {
        	            	legend: {
        	            		display: false,
        	            	},
        	            	title: {
        	                    display: false,
        	                },
        	                tooltips: {
        	                	enabled: false
        	                }
        	            };   	
        	        	
        	        	//PENDIENTES DE GESTIÓN
        	            if(angular.element( document.querySelector('#chartPendienteGestion'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartPendienteGestion'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.pendienteGestion, datosRecibos.total],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.pendienteGestion, datosRecibos.total - datosRecibos.pendienteGestion],
        	                            backgroundColor: [ "#3a7d00", "#d2d2d2" ],
        	        	                hoverBackgroundColor: [ "#3a7d00", "#d2d2d2" ]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }

        	        	//GESTIONADOS
        	            if(angular.element( document.querySelector('#chartGestionados'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartGestionados'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.gestionados, datosRecibos.total],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.gestionados, datosRecibos.total - datosRecibos.gestionados],
        	                            backgroundColor: [ "#5bc500", "#d2d2d2" ],
        	        	                hoverBackgroundColor: [ "#5bc500", "#d2d2d2" ]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }

        	        	//GESTIONADOS AUTOMÁTICAMENTE
        	            if(angular.element( document.querySelector('#chartAutomaticos'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartAutomaticos'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.gestionadosAuto, datosRecibos.total],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.gestionadosAuto, datosRecibos.total - datosRecibos.gestionadosAuto],
        	                            backgroundColor: [ "#b6ff77", "#d2d2d2" ],
        	        	                hoverBackgroundColor: [ "#b6ff77", "#d2d2d2" ]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }

        	        	//EN PROCESO
        	            if(angular.element( document.querySelector('#chartEnProceso'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartEnProceso'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.enProceso, datosRecibos.total],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.enProceso, datosRecibos.total - datosRecibos.enProceso],
        	                            backgroundColor: [ "#2EC076", "#d2d2d2" ],
        	        	                hoverBackgroundColor: [ "#2EC076", "#d2d2d2" ]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }

        	        	//PORCENTAJE
        	            if(angular.element( document.querySelector('#chartPorcentaje'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartPorcentaje'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.porcentajeGestionados, datosRecibos.total],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.porcentajeGestionados, 100 - datosRecibos.porcentajeGestionados],
        	                            backgroundColor: [ "#FF7F3B" , "#d2d2d2" ],
        	        	                hoverBackgroundColor: ["#FF7F3B" , "#d2d2d2" ]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }

        	        	//RECIBOS TOTALES
        	            if(angular.element( document.querySelector('#chartTotales'))[0] != undefined) {
        	                var myChart = new Chart(angular.element( document.querySelector('#chartTotales'))[0], {
        	                    type: 'doughnut',
        	                    data: {
        	                        labels: [datosRecibos.pendienteGestion, datosRecibos.gestionados, datosRecibos.gestionadosAuto, datosRecibos.enProceso],
        	                        datasets: [{
        	                            label: 'Recibos',
        	                            data: [datosRecibos.pendienteGestion, datosRecibos.gestionados, datosRecibos.gestionadosAuto, datosRecibos.enProceso],
        	                            backgroundColor: [ "#3a7d00", "#5bc500", "#b6ff77", "#2EC076"],
        	        	                hoverBackgroundColor: ["#3a7d00", "#5bc500", "#b6ff77", "#2EC076"]
        	                        }]
        	                    },
        	                    options: options
        	                });
        	            }
        	        }
                }
            }, function callBack(response) {
                if (response.status == 406 || response.status == 401) {
                    vm.parent.logout();
                }
            });

        }
        
        this.formatPercent = function(x) {

            if (x != null && typeof x == "string" && x.includes(',')) {
                x = x.replace(',','.');
            }

            if (isNaN(x) === true) {
                x = 0;
            }
            if (x == undefined) {
                x = 0;
            }
            if (typeof x === "string") {
                x = parseFloat(x);
            }
            x = x.toFixed(2);
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
        }

        this.redirectUrl = function (id) {
        	$location.path('recibos_devueltos_list').search(id);
        	$location.replace();
        	//window.location.replace("#!/recibos_devueltos_list?" + id);
        }
        
        this.loadTemplate = function() {
           return "src/recibos/recibos_devueltos_dashboard.view.html";
        }

        vm.changeForm = function (docu) {
            
        }
        

    }

    

    ng.module('App').component('sdRecibosDevueltosDashboard', Object.create(recibosDevueltosDashboardComponent));

})(window.angular);