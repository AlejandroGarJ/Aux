(function (ng) {
	
    'use strict';
    	
    //Componente de header
    var impuestosComponent = {
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        controllerAs: '$ctrl',
        $inject: ['$routeParams','$filter','$mdDialog','BASE_SRC'],
        require: {
        	parent:'^sdApp'
        }
    };

    impuestosComponent.controller = function impuestosComponentController(routeParams, filter, $mdDialog, BASE_SRC) {
    	
        var vm = this;

        vm.lista = [
	        {
	        	"fd_ini": "01/01/18",
	        	"fd_fin": "01/01/19",
	        	"ds_tipo": "TURISMO",
	        	"in_tipo": "2,10",
	        	"ano": 2018,
	        	"po_ips" : "6,00 %",
	        	"po_clea" : "0,15 %",
	        	"im_ofesauto" : "0,07",
	        	"im_capital_fallec" : "12.000,00",
	        	"po_ccs_acc" : "0,0005 %",
	        	"po_ccs_so" : "1,50 %"
	        },
	        {
	        	"fd_ini": "02/01/18",
	        	"fd_fin": "02/01/19",
	        	"ds_tipo": "TURISMO",
	        	"in_tipo": "2,20",
	        	"ano": 2018,
	        	"po_ips" : "6,00 %",
	        	"po_clea" : "0,15 %",
	        	"im_ofesauto" : "0,07",
	        	"im_capital_fallec" : "12.000,00",
	        	"po_ccs_acc" : "0,0005 %",
	        	"po_ccs_so" : "1,50 %"
	        },
	        {
	        	"fd_ini": "03/01/18",
	        	"fd_fin": "03/01/19",
	        	"ds_tipo": "TURISMO",
	        	"in_tipo": "3,10",
	        	"ano": 2018,
	        	"po_ips" : "6,00 %",
	        	"po_clea" : "0,16 %",
	        	"im_ofesauto" : "0,07",
	        	"im_capital_fallec" : "16.000,00",
	        	"po_ccs_acc" : "0,0605 %",
	        	"po_ccs_so" : "6,50 %"
	        },
	        {
	        	"fd_ini": "03/01/18",
	        	"fd_fin": "03/01/19",
	        	"ds_tipo": "TURISMO",
	        	"in_tipo": "3,10",
	        	"ano": 2017,
	        	"po_ips" : "2,00 %",
	        	"po_clea" : "0,55 %",
	        	"im_ofesauto" : "1,07",
	        	"im_capital_fallec" : "112.000,00",
	        	"po_ccs_acc" : "0,0125 %",
	        	"po_ccs_so" : "4,50 %"
	        },
	        {
	        	"fd_ini": "02/01/18",
	        	"fd_fin": "03/01/19",
	        	"ds_tipo": "TURISMO",
	        	"in_tipo": "3,10",
	        	"ano": 2018,
	        	"po_ips" : "7,00 %",
	        	"po_clea" : "0,21 %",
	        	"im_ofesauto" : "0,17",
	        	"im_capital_fallec" : "15.000,00",
	        	"po_ccs_acc" : "0,0005 %",
	        	"po_ccs_so" : "1,70 %"
	        },
        ];
        
//        vm.listaVehiculos = [
//            {"id": 1, "nombre": "Turismo"},
//            {"id": 2, "nombre": "Monovolumen"},
//            {"id": 3, "nombre": "Todoterreno"},
//            {"id": 4, "nombre": "Comercial derivado de turismo"},
//            {"id": 5, "nombre": "Motocicletas"},
//            {"id": 6, "nombre": "Comercial derivado de TT"},
//            {"id": 7, "nombre": "Ciclomotores"},
//            {"id": 8, "nombre": "Furgones y camiones ligeros"},
//            {"id": 9, "nombre": "Furgones habilitado a pasajeros"},
//            {"id": 10, "nombre": "Furgones pesados(+3,5 T de PMA)"},
//            {"id": 11, "nombre": "Camiones(+3,5 T de PMA)"},
//            {"id": 12, "nombre": "Tracto-camión(Cabeza tractora)"},
//            {"id": 13, "nombre": "Tractores"},
//            {"id": 14, "nombre": "Vehículos industriales"},
//            {"id": 15, "nombre": "Remolque roulotte"},
//            {"id": 16, "nombre": "Remolque de tractor"},
//            {"id": 17, "nombre": "Remolque de camión"},
//            {"id": 18, "nombre": "Remolque para cabeza de tractora, semiremolque"},
//            {"id": 19, "nombre": "Bicicletas con motor"},
//            {"id": 20, "nombre": "Autocares y autobuses"},
//            {"id": 21, "nombre": "Sin catalogar"}
//        ];
        
        vm.gridOptions = {
        		enableSorting: true,
    			enableHorizontalScrollbar: 0,
    			paginationPageSizes: [15,30,50],
    		    paginationPageSize: 15,
    		    treeRowHeaderAlwaysVisible: true,
    		    animateRows: true,
		        enableRangeSelection: true,
		        rowData: null,
		        enableSorting:true,
    		    columnDefs: [
    		      {field: "ano", displayName: "Año", grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '20%'},
				  {field: "fd_ini", displayName: "Fecha inicio", cellTooltip: function(row){return row.entity.fd_ini}},
    		      {field: "fd_fin", displayName: "Fecha fin", cellTooltip: function(row){return row.entity.fd_fin}}
    		    ],
    		    onRegisterApi: function( gridApi ) {
      		      vm.gridApi = gridApi;
      		      //gridApi = gridApi.core.resfresh;
      		      //console.log(gridApi);
      		    }
    	}
        
        vm.gridOptions.data = vm.lista;
        
        vm.modalShown = false;
        
        vm.anadirImpuesto = function() {
            vm.modalShown = !vm.modalShown;
        };
        
        this.$onInit = function() {   
        	if(routeParams.param=="ccsc"){
        		vm.gridOptions.columnDefs.unshift(
        			{field: "ds_tipo", displayName: "Tipo", cellTooltip: function(row){return row.entity.ds_tipo}},
          		    {field: "in_tipo", displayName: "Interés", cellTooltip: function(row){return row.entity.in_tipo}});
        		vm.templateUrl = BASE_SRC+'flotas/impuestos/impuesto.modal/ccsc.modal.html';
        	}else if(routeParams.param=="tarc"){
        		vm.gridOptions.columnDefs.unshift(
        			{field: "po_ips", displayName: "PO_IPS", cellTooltip: function(row){return row.entity.po_ips}},
          		    {field: "po_clea", displayName: "PO_CLEA", cellTooltip: function(row){return row.entity.po_clea}},
          		    {field: "im_ofesauto", displayName: "Impuesto ofesauto", cellTooltip: function(row){return row.entity.im_ofesauto}},
        		    {field: "im_capital_fallec", displayName: "Impuesto capital fallecimiento", cellTooltip: function(row){return row.entity.im_capital_fallec}},
        		    {field: "po_ccs_acc", displayName: "PO_CC_ACC", cellTooltip: function(row){return row.entity.po_ccs_acc}},
          		    {field: "po_ccs_so", displayName: "PO_CCS_SO", cellTooltip: function(row){return row.entity.po_ccs_so}});
        		vm.templateUrl = BASE_SRC+'flotas/impuestos/impuesto.modal/tarc.modal.html';
        		}
        	vm.param = routeParams.param;
        }
        
        this.loadTemplate = function() {
        	return 'src/flotas/impuestos/impuestos.view.html';
        }
        
        this.$onChanges = function(){
        	vm.gridOptions.data = vm.lista;
        }
        
        this.$doCheck = function() {
        	if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
        }
        
        vm.anadirImpuesto=function(ev){
        	console.log("--anadirImpuesto()--");
        	$mdDialog.show({
        		templateUrl: vm.templateUrl,
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				
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
    		})
        }
        
    }  
    
    ng.module('App').component('impuestosApp', impuestosComponent);
    
})(window.angular);