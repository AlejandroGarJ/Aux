(function (ng) {
	
    'use strict';
    	
    //Componente de header
    var polizasComponent = {
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        controllerAs: '$ctrl',
        $inject: ['$routeParams','BASE_SRC','$mdDialog'],
        require: {
        	parent:'^sdApp'
        }
    };

    polizasComponent.controller = function polizasComponentController(routeParams, BASE_SRC, $mdDialog) {
    	
        var vm = this;
        
        vm.listaTipoFlotas = [
          {"tipo":"IND"},
          {"tipo":"DIR"},
          {"tipo":"PCF"}
          ]
        
        vm.listaAseguradora = [
           {"nombre":"Plusultra"}
           ]
        
        vm.lista = [
            {"cod_negocio":3392,
             "desc": "TELEFONICA COMUNICACIONES",
             "estado": "Pendiente",
             "contador": 0
            },
            {"cod_negocio":3391,
             "desc": "TELEFONICA Moviles España",
             "estado": "Pendiente",
	 		 "contador": 0
            },
            {"cod_negocio":3390,
            "desc": "TELEFONICA Ingenieria de seguridad",
            "estado": "Pendiente",
 			"contador": 0
 			},
 			{"cod_negocio":3392,
	         "desc": "TELEFONICA COMUNICACIONES",
	         "estado": "Pendiente",
	         "contador": 0
	        },
	        {"cod_negocio":3391,
	         "desc": "TELEFONICA Moviles España",
	         "estado": "Pendiente",
	 		 "contador": 0
	        },
	        {"cod_negocio":3390,
	        "desc": "TELEFONICA Ingenieria de seguridad",
	        "estado": "Pendiente",
			"contador": 0},
			{"cod_negocio":3392,
	         "desc": "TELEFONICA COMUNICACIONES",
	         "estado": "Pendiente",
	         "contador": 0
	        },
	        {"cod_negocio":3391,
	         "desc": "TELEFONICA Moviles España",
	         "estado": "Pendiente",
	 		 "contador": 0
	        },
	        {"cod_negocio":3390,
	        "desc": "TELEFONICA Ingenieria de seguridad",
	        "estado": "Pendiente",
			"contador": 0},
			{"cod_negocio":3392,
	          "desc": "TELEFONICA COMUNICACIONES",
	          "estado": "Pendiente",
	          "contador": 0
	         },
	         {"cod_negocio":3391,
	          "desc": "TELEFONICA Moviles España",
	          "estado": "Pendiente",
	 		 "contador": 0
	         },
	         {"cod_negocio":3390,
	         "desc": "TELEFONICA Ingenieria de seguridad",
	         "estado": "Pendiente",
			"contador": 0}
        ];
        
        vm.gridOptions = {
    		enableSorting: true,
			enableHorizontalScrollbar: true,
			paginationPageSizes: [15,30,50],
		    paginationPageSize: 15,
		    treeRowHeaderAlwaysVisible: true,
		    animateRows: true,
	        enableRangeSelection: true,
	        rowData: null,
	        enableSorting:true,
		    columnDefs: [
		      {field: "cod_negocio", superCol: "nueva_cartera", displayName: "Código negocio", sort: { priority: 0, direction: 'desc' }, width: '20%'},
			  {field: "desc", displayName: $translate.instant('DESCRIPTION'), cellTooltip: function(row){return row.entity.fd_ini}},
			  {field: "estado", displayName: "Estado", cellTooltip: function(row){return row.entity.fd_fin}},
			  {field: "contador", displayName: "Contador", cellTooltip: function(row){return row.entity.fd_fin}}
		    ],
		    onRegisterApi: function( gridApi ) {
  		      vm.gridApi = gridApi;
  		      //gridApi = gridApi.core.resfresh;
  		      //console.log(gridApi);
  		    }
    	}
        
        vm.gridOptions.data = vm.lista;
        
        this.$onInit = function() {
        }
        
        this.loadTemplate = function() {
        	return  BASE_SRC + 'polizas/polizas.view.html';
        }
        
        this.$onChanges = function(){
        	vm.gridOptions.data = vm.lista;
        }
        
        this.$doCheck = function() {
        	if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
        }
        
    }  
    
    ng.module('App').component('polizasApp', polizasComponent);
    
})(window.angular);