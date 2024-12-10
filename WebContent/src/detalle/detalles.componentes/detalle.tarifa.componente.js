(function(ng) {	

	//Crear componente de app
    var tarifaComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$q', '$location', 'BASE_SRC','ui.grid','ui.grid.edit','MotorService','TarifaService','NegocioService','$window','EmpresaService','ProductoService','TiposService','BusquedaService', 'constantsTipos'],
    		require: {
    			parent:'^detalleSd',
    			busqueda:'^busquedaApp'
    		}
    }
    
    tarifaComponent.controller = function tarifaComponentControler($q, $location, BASE_SRC, uiGridConstants, MotorService, TarifaService, NegocioService, $window, EmpresaService, ProductoService, TiposService, BusquedaService, constantsTipos){
    	var vm=this;
    	var url=window.location;
    	vm.domicilios = [];
    	vm.bancos = [];
    	vm.form = {};
    	
    	this.$onInit = function() {
    		
    		vm.vista = 3;
    		
    		//Conseguir tipos de tarifa segun los colectivos del usuario
    		vm.colectivos = vm.parent.colectivos;
    		vm.listaColectivos = [];
    		for(var i=0; i<vm.colectivos.length; i++){
    			console.log(vm.colectivos[i]);
    			//if(vm.colectivos[i].ID_TIPO_POLIZA==30 || vm.colectivos[i].ID_TIPO_POLIZA==32){
    			if(vm.colectivos[i].ID_TIPO_POLIZA==3 || vm.colectivos[i].ID_TIPO_POLIZA==5){
    				vm.listaColectivos.push(vm.colectivos[i]);
    			}
    		}
    		
    		TiposService.getTipos({"ID_CODIGO": constantsTipos.LISTA_VEHICULOS})
			.then(function successCallback(response){
				console.log(response.data);
				vm.listaVehiculos = response.data.TIPOS.TIPO;
			});
    		
    		vm.listaGarantias = [];
    	}
    	
    	vm.listaPropiedades = {
	    	im_clea: {nombre:"PO_CLEA",codigo:"po_clea",valor:0.15},
	    	im_ips: {"nombre":"PO_IPS","codigo":"po_ips","valor":6},
	    	im_ofesauto: {"nombre":"IM_OFESAUTO","codigo":"im_ofesauto","valor":0.07},
	    	po_ccs_so:{"nombre":"PO_CCS_SO","codigo":"po_ccs_so","valor":1.5},
	    	im_capital_fallec:{"nombre":"Impuesto capital fallec.","codigo":"im_capital_fallec","valor":12000},
	    	po_ccs_acc:{"nombre":"PO_CCS_ACC","codigo":"po_ccs_acc","valor":0.0005},
	    	furgones_camiones:{"nombre":"Furgones y camiones","codigo":"furgones_camiones","valor":2.1},
	    	furgones_pesados:{"nombre":"Furgones pesados","codigo":"furgones_pesados","valor":9},
	    	camiones:{"nombre":"Camiones","codigo":"camiones","valor":9},
	    	monovolumen:{"nombre":"Monovolumen","codigo":"monovolumen","valor":2.1},
	    	motocicletas:{"nombre":"Motocicleta","codigo":"motocicletas","valor":1.2},
	    	turismo:{"nombre":"Turismo","codigo":"turismo","valor":2.1},
	    	vehiculos_industriales:{"nombre":"Vehículo industrial","codigo":"vehiculos_industriales","valor":10.5},
	    	furgones_hab_pasajeros:{"nombre":"Furgones habilitado a pasajeros","codigo":"furgones_hab_pasajeros","valor":2.1},
	    	comercial_derivado_tt:{"nombre":"Comercial derivado de TT","codigo":"comercial_derivado_tt","valor":2.1},
	    	tracto_camion:{"nombre":"Tracto-camión","codigo":"tracto_camion","valor":2.1},
	    	remolque_camion:{"nombre":"Remolque camión","codigo":"remolque_camion","valor":5.2},
	    	comercial_derivado_turismo:{"nombre":"Comercial derivado de turismo","codigo":"comercial_derivado_turismo","valor":2.1},
	    	todo_terreno:{"nombre":"Todoterreno","codigo":"todo_terreno","valor":2.1}
    	}
    	
    	vm.gridOptions = {
    			enableCellEdit: false,
    		    showColumnFooter: true,
        		enableSorting: true,
    			enableHorizontalScrollbar: true,
    		    treeRowHeaderAlwaysVisible: true,
    		    animateRows: true,
    	        enableRangeSelection: true,
    	        rowData: null,
    	        enableSorting:true,
    		    columnDefs: [
    		      {field: "NO_GARANTIA", displayName: "Código de garantía", footerCellTemplate: '<div class="ui-grid-cell-contents">Total</div>', width: '23%', sort: { priority: 0, direction: 'desc' }},
    			  {field: "prima_neta", enableCellEdit: true, displayName: "Prima neta", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true, cellTooltip: function(row){return row.entity.prima_neta}},
    			  {field: "prima_total", displayName: "Prima total", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}},
    			  {field: "im_clea", displayName: "IM_CLEA", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return (row.entity.prima_total)}},
				  {field: "im_ips", displayName: "IM_IPS", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}},
				  {field: "im_ofesauto", displayName: "IM_OFESAUTO", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}},
				  {field: "im_ccs_so", displayName: "IM_CCS_SO", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}},
				  {field: "im_ccs_re", displayName: "IM_CCS_RE", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}},
				  {field: "im_ccs_acc", displayName: "IM_CCS_ACC", aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,cellTooltip: function(row){return row.entity.prima_total}}
				],

				onRegisterApi: function( gridApi ) {
				      vm.gridApi = gridApi;
				      vm.filas = [];
				      vm.suma = 0;
				      vm.fila = vm.gridApi.grid.options;
				      vm.gridApi.edit.on.afterCellEdit(null, function(row, column, newValue, oldValue){
				    	  for(var i=0; i<vm.gridApi.grid.options.data.length; i++){
				    		if(typeof vm.fila.data[i].prima_neta!=="undefined" && vm.fila.data[i].prima_neta!="" && vm.fila.data[i].prima_neta!=null && vm.fila.data[i].prima_neta>0){
				    			vm.fila.data[i].im_clea = ((vm.fila.data[i].prima_neta*vm.listaPropiedades.im_clea.valor)/100).toFixed(2);
				    			vm.fila.data[i].im_ips = (vm.fila.data[i].prima_neta*(vm.listaPropiedades.im_ips.valor/100)).toFixed(2);	
				    			vm.fila.data[i].im_ofesauto = (vm.listaPropiedades.im_ofesauto.valor).toFixed(2);
				    			vm.fila.data[i].im_ccs_so = 0.00;
				    			vm.fila.data[i].im_ccs_acc = (vm.listaPropiedades.po_ccs_acc.valor).toFixed(2);
				    		  
				    		  //Para calcular im_ccs_re, que es la propiedad del vehículo repartida proporcionalmente según prima_neta
				    		  //Se recorre las filas para sumar todas las primas netas
				    		  for(var j=0; j<vm.gridApi.grid.options.data.length; j++){
					    		  if(vm.fila.data[j].prima_neta!=null && vm.fila.data[j].prima_neta != undefined && vm.fila.data[j].prima_neta!=""){
					    			  vm.suma += parseFloat(vm.fila.data[j].prima_neta);
					    		  }
					    	  }
				    		  //Calcula la parte proporcional
				    		  if(typeof vm.form.idVehiculo!="undefined"){
				    			  vm.fila.data[i].im_ccs_re = ((vm.form.idVehiculo*vm.fila.data[i].prima_neta)/vm.suma).toFixed(2);
				    		  }else{
				    			  vm.fila.data[i].im_ccs_re = 0.00;
				    		  }
					    		  
					    	  vm.suma = 0;
					    	  vm.filas = [];
					    	  vm.fila.data[i].prima_total = (parseFloat(vm.fila.data[i].prima_neta) + parseFloat(vm.fila.data[i].im_clea) + parseFloat(vm.fila.data[i].im_ips) + parseFloat(vm.fila.data[i].im_ofesauto) + parseFloat(vm.fila.data[i].im_ccs_so) + parseFloat(vm.fila.data[i].im_ccs_re) + parseFloat(vm.fila.data[i].im_ccs_acc)).toFixed(2);
				    	}else{
				    		  vm.fila.data[i].im_clea = undefined;
				    		  vm.fila.data[i].im_ips = undefined;
				    		  vm.fila.data[i].im_ofesauto = undefined;
				    		  vm.fila.data[i].im_ccs_so = undefined;
				    		  vm.fila.data[i].im_ccs_re = undefined;
				    		  vm.fila.data[i].im_ccs_acc = undefined;
				    		  vm.fila.data[i].prima_total = undefined;
				    	  }
				    		//vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
			      		      //console.log(gridApi);
		  		    	  }
		  		      })
			      }
    	}   
    	
    	//Cuando valor del combobox tarifa cambia
		vm.cambiarTarifa = function(){
			vm.idTarifa = vm.form.idTarifa;
			console.log("cambiarTarifa: " + vm.idTarifa);
			
			//Conseguir tipos de negocio
        	NegocioService.getNegociosByTarifa(vm.idTarifa)
    		.then(function successCallback(response){
    			vm.listaNegocios = response.data.negocios.NEGOCIOS;
    		});
		}
    	
    	//Cuando valor del combobox negocio cambia
		vm.cambiarNegocio = function(){
			vm.idNegocio = vm.form.idNegocio;
			console.log("cambiarNegocio: " + vm.idNegocio);
			
			//Conseguir tipos de empresa
        	EmpresaService.getEmpresas((vm.idNegocio).toString())
    		.then(function successCallback(response){
    			vm.listaEmpresas = response.data.empresas.EMPRESAS;
    		});
		}
		
		//Cuando valor del combobox empresa cambia
		vm.cambiarEmpresa = function(){
			//Conseguir productos
			ProductoService.getProductos()
    		.then(function successCallback(response){
    			vm.listaProductos = response.data.Productos.Producto;
    		});
		}
		
    	vm.buscarGarantias = function(){
    		BusquedaService.buscar({"ID_COMP_RAMO_PROD":vm.form.idProducto.ID_COMP_RAMO_PROD},"garantiasByProducto")
    		.then(function successCallback(response){
    			console.log("garantiasasasassa: ");
    			console.log(response.data);
    			if(response.status == 200){
    				if(typeof response.data.GARANTIAS == "undefined"){
    					vm.vista = 4;
    					vm.listaGarantias = {};
    				}else{
    					vm.vista = 5;
    					vm.listaGarantias = response.data.GARANTIAS.Garantia;
    				}
    				vm.gridOptions.data = vm.listaGarantias;
				}
    		});
    		
    		vm.suma = 0;
			for(var i=0; i<vm.gridApi.grid.options.data.length; i++){
				if(typeof vm.gridApi.grid.options.data[i].prima_neta!=="undefined" && vm.gridApi.grid.options.data[i].prima_neta!="" && vm.gridApi.grid.options.data[i].prima_neta!=null && vm.fila.data[i].prima_neta>0){
					  //Para calcular im_ccs_re, que es la propiedad del vehículo repartida proporcionalmente según prima_neta
		    		  //Se recorre las filas para sumar todas las primas netas
		    		  for(var j=0; j<vm.gridApi.grid.options.data.length; j++){
			    		  if(vm.gridApi.grid.options.data[j].prima_neta!=null && vm.gridApi.grid.options.data[j].prima_neta != undefined && vm.gridApi.grid.options.data[j].prima_neta!=""){
			    			  vm.suma += parseFloat(vm.gridApi.grid.options.data[j].prima_neta);
			    		  }
			    	  }
		    		  //Calcula la parte proporcional
		    		  if(typeof vm.form.idVehiculo!="undefined"){
		    			  vm.gridApi.grid.options.data[i].im_ccs_re = (vm.form.idVehiculo*vm.gridApi.grid.options.data[i].prima_neta)/vm.suma;
		    		  }else{
		    			  vm.gridApi.grid.options.data[i].im_ccs_re = 0;
		    		  }
		  			  vm.suma=0;
				 }
			}
			vm.suma=0;
			vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    	}
    	
		vm.calcular = function(row){
			console.log("valor: " + (row.prima_neta * 0.15)/100);
		}
    	
		vm.cambiarTipoVehiculo = function(){
			vm.form.idMarca = undefined;
			vm.form.idModelo = undefined;
			vm.form.idVersion = undefined;
			console.log(vm.form.idVehiculo);
    		MotorService.getMarcas(vm.form.idVehiculo)
    		.then(function successCallback(response){
    			vm.marcas = response.data.MARCA;
    		});
			
			vm.suma = 0;
			for(var i=0; i<vm.gridApi.grid.options.data.length; i++){
				if(typeof vm.gridApi.grid.options.data[i].prima_neta!=="undefined" && vm.gridApi.grid.options.data[i].prima_neta!="" && vm.gridApi.grid.options.data[i].prima_neta!=null && vm.fila.data[i].prima_neta>0){
					  //Para calcular im_ccs_re, que es la propiedad del vehículo repartida proporcionalmente según prima_neta
		    		  //Se recorre las filas para sumar todas las primas netas
		    		  for(var j=0; j<vm.gridApi.grid.options.data.length; j++){
			    		  if(vm.gridApi.grid.options.data[j].prima_neta!=null && vm.gridApi.grid.options.data[j].prima_neta != undefined && vm.gridApi.grid.options.data[j].prima_neta!=""){
			    			  vm.suma += parseFloat(vm.gridApi.grid.options.data[j].prima_neta);
			    		  }
			    	  }
		    		  //Calcula la parte proporcional
		    		  if(typeof vm.form.idVehiculo!="undefined"){
		    			  vm.gridApi.grid.options.data[i].im_ccs_re = (vm.form.idVehiculo*vm.gridApi.grid.options.data[i].prima_neta)/vm.suma;
		    		  }else{
		    			  vm.gridApi.grid.options.data[i].im_ccs_re = 0;
		    		  }
		  			  vm.suma=0;
				 }
			}
			vm.suma=0;
			vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
		}
		
    	vm.querySearch = function(query, list, key){
    		var results = query ? list.filter( createFilterFor(query, key) ) : list,
    		          deferred;
    		if (self.simulateQuery) {
		        deferred = $q.defer();
		        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		        return deferred.promise;
    		} 
    		else {
		        return results;
		    }
    	}
    	
    	function createFilterFor(query, key) {
    		var uppercaseQuery = query.toUpperCase();
	
    		return function filterFn(list) {
    			if(key != "DS_VERSION")
    				return (list[key].indexOf(uppercaseQuery) === 0);
    			else
    				return (list[key].indexOf(uppercaseQuery) >= 0);
    		};
    	}
    	
    	//Conseguir datos de modelos
    	vm.getModelos = function(){
    		vm.searchModelo = "";
    		vm.searchVersion = "";
    		console.log('vm.form.idMarca: ' + vm.form.idMarca.CO_MARCA);
    		MotorService.getModelos(1, vm.form.idMarca.CO_MARCA)
    		.then(function successCallback(response){
    			vm.modelos = response.data.MODELO;
    		});
    	}
    	
    	//Conseguir datos de versiones
    	vm.getVersiones = function(){
    		vm.searchVersion = "";
    		MotorService.getVersiones(1, vm.form.idMarca.CO_MARCA, vm.form.idModelo.CO_MODELO)
    		.then(function successCallback(response){
    			vm.versiones = response.data.VERSION;
    			for (var i = 0; i < vm.versiones.length; i++) {
					vm.versiones[i].text = vm.versiones[i].DS_VERSION +"- F.LANZ:"+vm.versiones[i].FD_LANZAMIENTO+" - PUERTAS:"+vm.versiones[i].NU_PUERTAS+" - POT:"+vm.versiones[i].NU_POTENCIA+" - TARA:"+vm.versiones[i].NU_CILINDRADA+" - PLAZAS:"+vm.versiones[i].NU_PLAZAS;
				}
    			console.log(vm.versiones);
    		});
    		
    	}
    	
    	//Guardar tarifa
    	vm.guardarTarifa = function(){
    		vm.datos = vm.gridApi.data;
    	}
    	
    	this.$doCheck = function() {
        	if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
        }
    	
    	this.$onChange = function() {
        	if(vm.gridApi != undefined)
    			vm.gridApi.core.resfresh;
        	
        }
    	
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.tarifa.html";
    	}

    	vm.changeTabs = function(index){
    		vm.showTable = index;
    	}
    	

    }   
    
    
    ng.module('App').component('tarifaSd', Object.create(tarifaComponent));
    
})(window.angular);
