(function(ng) {	


	//Crear componente de app
    var estadisticasMovilComponent = {
        controllerAs: '$ctrl',
        template:'<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject:['$mdDialog', '$scope', 'MovilService'],
        require: {
            parent:'^sdApp'
        }
    }
    
    
    
    estadisticasMovilComponent.controller = function estadisticasMovilComponentControler($mdDialog, $scope, MovilService) {
		var vm = this;
		vm.loading = false;
    	var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		vm.file = {};
    	
    	this.$onInit = function() {

    		vm.loading = true;
    		setTimeout(
				function(){

		            if(angular.element( document.querySelector('#chart01'))[0] != undefined) {
		                var myChart = new Chart(angular.element( document.querySelector('#chart01'))[0], {
		                    type: 'line',
		                    data: {
								labels: ['1 Oct', '2 Oct', '3 Oct', '4 Oct', '5 Oct', '6 Oct'],
								datasets: [{
									label: 'Pólizas VI',
									data: [23, 18, 15, 25, 15, 12],
									fill: true,
									backgroundColor: 'rgba(74, 160, 205, 0.2)',
									borderColor: 'rgb(74, 160, 205)',
									borderWidth: "1",
									pointBorderWidth: 1,
									tension: 0.2
								},{
									label: 'Prepólizas PC',
									data: [10, 5, 18, 15, 10, 8, 19],
									fill: false,
									borderColor: 'rgb(238, 158, 95)',
									borderWidth: "1",
									pointBorderWidth: 1,
									tension: 0.2
								}]
							},
		                    options: {
								indexAxis: 'x',
								scales: {
									xAxes: [{
										gridLines: {
											display: false
										}
									}],
									yAxes: [{
										beginAtZero: true,
										gridLines: {
											display: false
										}
									}]
								}
		                    }
		                });
		            }

					if(angular.element( document.querySelector('#chart02'))[0] != undefined) {
						var myChart = new Chart(angular.element( document.querySelector('#chart02'))[0], {
							type: 'line',
							data: {
								labels: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
								datasets: [{
									label: 'Pólizas VI',
									data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 18, 15, 25, 15, 12, 0, 0, 0, 0, 0, 0, 0, 0],
									fill: true,
									backgroundColor: 'rgba(91, 198, 21, 0.1)',
									borderColor: 'rgb(91, 198, 21)',
									borderWidth: "1",
									pointBorderWidth: 1,
									tension: 0.2
								},{
									label: 'Prepólizas PC',
									data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,10, 5, 18, 15, 10, 8, 19, 0, 0, 0, 0, 0, 0, 0],
									fill: true,
									backgroundColor: 'rgba(234, 195, 68,0.1)',
									borderColor: 'rgb(234, 195, 68)',
									borderWidth: "1",
									pointBorderWidth: 1,
									tension: 0.2
								}]
							},
							options: {
								indexAxis: 'x',
								scales: {
									xAxes: [{
										gridLines: {
											display: false
										}
									}],
									yAxes: [{
										gridLines: {
											display: false
										}
									}]
								}
							}
						});
					}

		    		vm.loading = false;
		    		$scope.$apply();
				},
			2000);
            
    	}
    	
    	this.$onChanges = function() {}
    	
    	this.loadTemplate = function() {
    		return "src/movil/movil.views/estadisticas_movil.view.html";
    	}

		vm.navTo = function(appPath) {
			window.location = window.location.origin + window.location.pathname + appPath;
		}



    }
    
    ng.module('App').component('estadisticasMovilApp', Object.create(estadisticasMovilComponent));
    
})(window.angular);