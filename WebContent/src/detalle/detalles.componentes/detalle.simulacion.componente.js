(function(ng) {	

	//Crear componente de app
    var simulacionComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$scope', '$q', '$location', 'uiGridConstants', 'BASE_SRC','BusquedaService','SimulacionService','$mdDialog'],
    		require: {
    			parent:'^simulacionApp'
    		},
			bindings: {simulacion: '='}
    }
    
    simulacionComponent.controller = function simulacionComponentControler($scope, $q, $location, uiGridConstants, BASE_SRC, BusquedaService, SimulacionService, $mdDialog){
    	var vm=this;
    	var url=window.location;
    	var suma = 0;
		vm.LST_SIMULACION_GARANTIA=[];
		vm.LST_SIMULACION_NEGOCIO=[];
		vm.LST_SIMULACION_CLIENTE=[];
		vm.LST_SIMULACION_CLIENTE_GAR=[];
		vm.mostrar = true;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
		
		vm.treeOptions = {
			nodeChildren: "children",
		    dirSelectable: true,
		    injectClasses: {
		        ul: "a1",
		        li: "a2",
		        liSelected: "a7",
		        iExpanded: "a3",
		        iCollapsed: "a4",
		        iLeaf: "a5",
		        label: "a6",
		        labelSelected: "a8"
		    }
    	}
		
		//LST_NEGOCIOS depende de tipo de simulación,(industrial/directivo)
    	vm.LST_NEGOCIOS = [];
    	
    	vm.gridNegocios = {
		    enableSorting: true,
		    showTreeExpandNoChildren: true,
		    treeRowHeaderAlwaysVisible: true,
		    columnDefs: [
		      { name: 'name', displayName:'Descripción Negocio', enableCellEdit: false, width:"25%"},
		      { name: 'GAR', displayName:'% Garantía', enableCellEdit: true, editableCellTemplate: '<div>\
		            <form name="inputForm" ng-show="row.entity.$$treeLevel == null">\
		            <input type="number" ng-class="\'colt\' + col.uid"\
		            ui-grid-editor ng-model="MODEL_COL_FIELD">\
		            </form></div>'},
		      { name: 'EMP', displayName:'% Empresa', enableCellEdit: true, editableCellTemplate: '<div>\
		            <form name="inputForm" ng-show="row.entity.$$treeLevel == 1">\
		            <input type="number" ng-class="\'colt\' + col.uid"\
		            ui-grid-editor ng-model="MODEL_COL_FIELD">\
		            </form></div>'},
		      { name: 'NEG', displayName:'% Negocio', enableCellEdit: true, editableCellTemplate: '<div>\
		            <form name="inputForm" ng-show="row.entity.$$treeLevel == 0">\
		            <input type="number" ng-class="\'colt\' + col.uid"\
		            ui-grid-editor ng-model="MODEL_COL_FIELD">\
		            </form></div>'},
		      { name: 'GENERAL', displayName:'% General Global', enableCellEdit: false},
		      { name: 'GLOBAL', displayName:'% Global', enableCellEdit: false, aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true},
		      { name: 'total', displayName:'Total', enableCellEdit: false}
		      ],
		    data: vm.LST_NEGOCIOS,
		    onRegisterApi: registerApi
    	}
		
		//Se cargan los valores de la simulación, si venimos desde una simulación guardada
		//Se recuperan de base de datos empresas y negocios
		//Se recuperan los impuestos a día de simulación, y si es una simulación nueva, los impuestos a día de hoy
    	this.$onInit = function() {
			console.log("onInit");
    		vm.cargar=false;
			
			var date = new Date().toISOString().split('T')[0];
			//Si viene de una simulación del grid, se meten los datos recuperados de la simulación
			if (vm.simulacion!=null){
				vm.form={};
				vm.form.ID_TIPO_POLIZA=vm.simulacion.ID_TIPO_POLIZA;
				vm.form.IN_TERMINADO=vm.simulacion.IN_TERMINADO;
				vm.form.NO_SIMULACION=vm.simulacion.NO_SIMULACION;
				vm.form.TX_OBSERVACIONES=vm.simulacion.TXT_OBSERVACIONES;
				vm.form.FD_INICIO=vm.simulacion.FD_INI;
				if (vm.sim==undefined || vm.sim==null){
					vm.sim={};
				}
				
				if (vm.simulacion.LST_SIMULACION_NEGOCIO!=undefined)
					vm.LST_SIMULACION_NEGOCIO=vm.simulacion.LST_SIMULACION_NEGOCIO;
				if (vm.simulacion.LST_SIMULACION_CLIENTE!=undefined)
					vm.LST_SIMULACION_CLIENTE=vm.simulacion.LST_SIMULACION_CLIENTE;
				if (vm.simulacion.LST_SIMULACION_CLIENTE_GAR!=undefined)
					vm.LST_SIMULACION_CLIENTE_GAR=vm.simulacion.LST_SIMULACION_CLIENTE_GAR;
				
				date = vm.simulacion.FD_INI.split('T')[0];
				
			}
			//Se cargan los impuestos de la fecha, del día en curso para nuevos presupuestos, y de la fecha del presupuesto seleccionado para los recuperados.
			var json = {"FD_INI_TO":date,
						"FD_FIN_FROM":date	};
        	
			BusquedaService.buscar(json, 'impuestos')
			.then(function successCallback(response){
				if(response.status == 200){
					console.log("Busqueda impuestos OK");
					vm.impuestos={};
					if (response.data.LISTA_IMPUESTOS!=null)
						vm.impuestos = response.data.LISTA_IMPUESTOS.IMPUESTOS[0];
					else
						vm.mostrar = false;
				}
			}, function callBack(response){
				msg.textContent('Error ' + response.status);
				$mdDialog.show(msg);
			});
			
			//Búsqueda de negocios
			var json = {};
			BusquedaService.buscar(json, 'negocios')
			.then(function successCallback(response){
				if(response.status == 200){
					console.log("Busqueda negocios OK");
					vm.listaNegocios = response.data.LISTA_NEGOCIOS.NEGOCIOS;
				}
			}, function callBack(response){
				msg.textContent('Error ' + response.status);
				$mdDialog.show(msg);
			});
			
    	}
		
		//Se cargan los grids de negocios con los valores guradados en la simulación que se está recuperando
		this.$postLink = function() {
		console.log("PostLink");
		console.log(vm);
			if (vm.simulacion!=null){
				if (vm.simulacion.LST_SIMULACION_GARANTIA!=undefined){

					vm.LST_SIMULACION_GARANTIA=vm.simulacion.LST_SIMULACION_GARANTIA;
					for(var i=0; i<vm.LST_SIMULACION_GARANTIA.length; i++){
						if (vm.LST_SIMULACION_GARANTIA[i].ID_GARANTIA==null)
							vm.sim.GLOBAL=vm.LST_SIMULACION_GARANTIA[i].PO_INCREMENTO;
						else {
							var campo="g"+vm.LST_SIMULACION_GARANTIA[i].ID_GARANTIA;
							vm.sim[campo]=vm.LST_SIMULACION_GARANTIA[i].PO_INCREMENTO;
						}
					}
				}
				rellenaEmpresasYNegocios(vm.simulacion.ID_TIPO_POLIZA);
			}
		}
		
		this.onlyOneDaySelectable = function(date) {
			var month = date.getMonth();
			var tipoSimulacion = vm.form.ID_TIPO_POLIZA;
			//Directivos
			if (tipoSimulacion == 30)
				return month === 6;
			else if (tipoSimulacion == 32)
				return month === 0;
		}
		
    	this.loadTemplate=function(){
    		return BASE_SRC + "detalle/detalles.views/detalle.simulacion.html";
    	}
		  	
    	function registerApi(gridApi){
			console.log("registerApi");
    		vm.gridApi = gridApi;
    		vm.gridApi.edit.on.afterCellEdit($scope, function(row, column, newValue, oldValue){
				console.log("registerApi-afterCellEdit");
    			for(var i = 0; i < vm.gridApi.grid.treeBase.tree.length; i++){
    				for(var j = 0; j < vm.gridApi.grid.treeBase.tree[i].children.length; j++){
						//Cuando escribimos un porcentaje para el negocio se expande en sus hijos
    					if(vm.gridApi.grid.treeBase.tree[i].row.entity.NEG != undefined){
    						vm.gridApi.grid.treeBase.tree[i].children[j].row.entity.NEG = vm.gridApi.grid.treeBase.tree[i].row.entity.NEG;
    					}
    					for(var k = 0; k < vm.gridApi.grid.treeBase.tree[i].children[j].children.length; k++){
							//Cuando escribimos un porcentaje para la empresa se expande a sus hijos
    						if(vm.gridApi.grid.treeBase.tree[i].children[j].row.entity.EMP != undefined){
    							vm.gridApi.grid.treeBase.tree[i].children[j].children[k].row.entity.EMP = vm.gridApi.grid.treeBase.tree[i].children[j].row.entity.EMP;
    						}
							//?
    						if(vm.gridApi.grid.treeBase.tree[i].row.entity.NEG != undefined){
    							vm.gridApi.grid.treeBase.tree[i].children[j].children[k].row.entity.NEG = vm.gridApi.grid.treeBase.tree[i].row.entity.NEG;
        					}
    					}
    				}
        		}
				//Suma del total
    			for(var i = 0; i < vm.gridApi.grid.rows.length; i++){
					var total=0;
					var valor=0;
        			vm.gridApi.grid.rows[i].entity.total = 0;
        			
            		angular.forEach(vm.gridApi.grid.rows[i].entity, function(value, clave){
            			if(clave != "total" && clave != "$$hashKey" && clave != "$$treeLevel" && clave != "name" && clave != "id"){
							valor = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
							if (valor != 0){
								total = total + ((100+total)*valor)/100;
								vm.gridApi.grid.rows[i].entity.total=total;
							}
						}
            		})
        		}
    		});
    	}
    	
    	vm.calcularParam = function(key){
    		
    		for(var i = 0; i < vm.gridApi.grid.rows.length; i++){
				var total=0;
				var valor=0;
    			vm.gridApi.grid.rows[i].entity.total = 0;
    			
    			//Suma de global
        		vm.gridApi.grid.rows[i].entity.GLOBAL = vm.sim.GLOBAL;
        		//los ids del gridapi son del tipo negocio_empresa_idgarantia (en el nivel de garantía que es que que nos interesa en este momento)
				var splitted = vm.gridApi.grid.rows[i].entity.id.split("_");
				if (splitted.length == 3){
					if("g"+splitted[2] == key){
						vm.gridApi.grid.rows[i].entity.GENERAL = vm.sim[key];
					}
				}
				//Calculo el total
        		angular.forEach(vm.gridApi.grid.rows[i].entity, function(value, clave){
        			if(clave != "total" && clave != "$$hashKey" && clave != "$$treeLevel" && clave != "name" && clave != "id"){
						valor = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
						if (valor != 0){
							total = total + ((100+total)*valor)/100;
							vm.gridApi.grid.rows[i].entity.total=total;
						}
					}
        		});	
    		}
    	}
    	
		//Resultados de la simulación
    	var results = [];
    	
    	vm.gridResult = {
			enableSorting: true,
		    showTreeExpandNoChildren: true,
		    treeRowHeaderAlwaysVisible: true,
		    columnDefs: [
		      { name: 'name', displayName:'Descripción Negocio'},
		      { name: 'IM_PRIMA_NETA', displayName:'Prima neta actual'},
		      { name: 'IM_PRIMA_SIM', displayName:'Prima neta simulada'},
		      { name: 'IM_PRIMA_TOTAL', displayName:'Prima total actual'},
		      { name: 'IM_PRIMA_TOTAL_SIM', displayName:'Prima total simulada'},
		      { name: 'IM_SINIESTRALIDAD', displayName:'Siniestralidad actual'},
		      { name: 'IM_SINIESTRALIDAD_SIM', displayName:'Siniestralidad simulada'}
		    ],
		    data: results
    	}
		
		//Evento lanzado al cambiar la fecha de tarifas vigentes
		vm.getImpuestos=function(){
			var day = String(vm.form.FD_INICIO.getDate());
			if (day.length < 2)
				day = '0' + day;
			var month = String((vm.form.FD_INICIO.getMonth())+1);
			if (month.length < 2)
				month = '0' + month;
			var year = String(vm.form.FD_INICIO.getFullYear());
			var date = year + '-' + month + '-' + day;

			var json = {"FD_INI_TO":date,
						"FD_FIN_FROM":date	};
        	
			BusquedaService.buscar(json, 'impuestos')
			.then(function successCallback(response){
				if(response.status == 200){
					if (response.data.nuImpuestos=1){
						vm.impuestos = response.data.LISTA_IMPUESTOS.IMPUESTOS[0];
					} else {
						vm.impuestos = {};
					}
				}
			}, function callBack(response){
				msg.textContent('Error al obtener los impuestos vigentes en la fecha seleccionada (' + response.status + ')');
				$mdDialog.show(msg);
			});
			
		}
		
		//Evento lanzado al cambiar el tipo de simulación
		vm.datosTipoSimulacion=function(){
			//Búsqueda de negocios
			var tipoSimulacion = vm.form.ID_TIPO_POLIZA;
			vm.form.FD_INICIO=null;
			vm.LST_NEGOCIOS=[];
			
			rellenaEmpresasYNegocios(tipoSimulacion);
		}

		//Evento lanzado al pulsar sobre el botón de CALCULAR
		vm.calculaSimulacion=function(){
			vm.cargar = true;
			rellenaListasCalculoSimulacion();
			var fdFin="";
			if (vm.form.FD_INICIO!=undefined)
				fdFin=getFechaFin(vm.form.FD_INICIO);
			vm.results=[];
			var tipoSimulacion = vm.form.ID_TIPO_POLIZA;
			var json = {"ID_TIPO_POLIZA":tipoSimulacion,
						"FD_INI":getFechaJSONFormat(vm.form.FD_INICIO),
						"FD_FIN":fdFin,
						"LISTA_IMPUESTOS":vm.impuestos,
						"LST_SIMULACION_CLIENTE_GAR":vm.LST_SIMULACION_CLIENTE_GAR
						};
			console.log(json);
			SimulacionService.calculaSimulacion(json)
			.then(function successCallback(response){
				if(response.status == 200){
					vm.cargar = false;
					if (response.data.NUMERO_NEGOCIOS>0){
						vm.primaGarantias = response.data.LISTA_NEGOCIOS.NEGOCIOS;
						var negocio="";
						for (var i=0; i < vm.primaGarantias.length; i++){
							if (negocio!=vm.primaGarantias[i].CO_NEGOCIO){
								vm.results.push({name: (vm.primaGarantias[i].CO_NEGOCIO+" - "+vm.primaGarantias[i].NO_NEGOCIO), id: (String(vm.primaGarantias[i].ID_NEGOCIO)), $$treeLevel: 0});
								negocio=vm.primaGarantias[i].CO_NEGOCIO;
							}
							vm.results.push({name: (vm.primaGarantias[i].NO_NOMBRE), id: (vm.primaGarantias[i].ID_NEGOCIO)+"_"+(vm.primaGarantias[i].ID_CLIENTE), $$treeLevel: 1});
							for (var j=0; j < vm.primaGarantias[i].LST_GARANTIAS.length; j++){
								var garantia = vm.primaGarantias[i].LST_GARANTIAS[j];
								vm.results.push({name: (garantia.NO_GARANTIA), id: (vm.primaGarantias[i].ID_NEGOCIO)+"_"+(vm.primaGarantias[i].ID_CLIENTE)+"_"+(garantia.ID_GARANTIA), IM_PRIMA_NETA:Number(garantia.NU_PRIMA_NETA).toFixed(2), IM_PRIMA_TOTAL:Number(garantia.NU_PRIMA_TOTAL).toFixed(2), IM_PRIMA_SIM:Number(garantia.NU_PRIMA_NETA_SIM).toFixed(2), IM_PRIMA_TOTAL_SIM:Number(garantia.NU_PRIMA_TOTAL_SIM).toFixed(2)});
							}
						}
					} else {
						vm.primaGarantias = {};
					}

					//Variables para el alamcenamiento del total de empresas y negocios
					var nivel1="";
					var nivel0="";
					var indice0=0;
					var indice1=0;
					var sumaTotal1=0;
					var sumaNeta1=0;
					var sumaSimTotal1=0;
					var sumaSimNeta1=0;
					var sumaTotal0=0;
					var sumaNeta0=0;
					var sumaSimTotal0=0;
					var sumaSimNeta0=0;
					//Recorrer de nuevo el árbol para la suma de empresas y negocios
					for (var i=0; i < vm.results.length; i++){
						if (vm.results[i].$$treeLevel!=undefined){
							if (vm.results[i].$$treeLevel==0){
								if (i>0){
									vm.results[indice0]={name: nivel0, $$treeLevel: 0, IM_PRIMA_NETA: Number(sumaNeta0).toFixed(2), IM_PRIMA_TOTAL: Number(sumaTotal0).toFixed(2), IM_PRIMA_SIM:Number(sumaSimNeta0).toFixed(2), IM_PRIMA_TOTAL_SIM:Number(sumaSimTotal0).toFixed(2)};
								}
								indice0=i;
								nivel0=vm.results[i].name;
								sumaTotal0=0;
								sumaNeta0=0;
								sumaSimNeta0=0;
								sumaSimTotal0=0;
							}
							else if (vm.results[i].$$treeLevel==1){
								if (i>1){
									vm.results[indice1]={name: nivel1, $$treeLevel: 1, IM_PRIMA_NETA: Number(sumaNeta1).toFixed(2), IM_PRIMA_TOTAL: Number(sumaTotal1).toFixed(2), IM_PRIMA_SIM:Number(sumaSimNeta1).toFixed(2), IM_PRIMA_TOTAL_SIM:Number(sumaSimTotal1).toFixed(2)};
								}
								indice1=i;
								nivel1=vm.results[i].name;
								sumaTotal1=0;
								sumaNeta1=0;
								sumaSimNeta1=0;
								sumaSimTotal1=0;
							}
						}
						else {
							sumaNeta1=		Number(sumaNeta1)		+Number(vm.results[i].IM_PRIMA_NETA);
							sumaTotal1=		Number(sumaTotal1)		+Number(vm.results[i].IM_PRIMA_TOTAL);
							sumaNeta0=		Number(sumaNeta0)		+Number(vm.results[i].IM_PRIMA_NETA);
							sumaTotal0=		Number(sumaTotal0)		+Number(vm.results[i].IM_PRIMA_TOTAL);
							sumaSimNeta0=	Number(sumaSimNeta0)	+Number(vm.results[i].IM_PRIMA_SIM);
							sumaSimTotal0=	Number(sumaSimTotal0)	+Number(vm.results[i].IM_PRIMA_TOTAL_SIM);
							sumaSimNeta1=	Number(sumaSimNeta1)	+Number(vm.results[i].IM_PRIMA_SIM);
							sumaSimTotal1=	Number(sumaSimTotal1)	+Number(vm.results[i].IM_PRIMA_TOTAL_SIM);
						}
					}
					vm.results[indice0]={name: nivel0, $$treeLevel: 0, IM_PRIMA_NETA: Number(sumaNeta0).toFixed(2), IM_PRIMA_TOTAL: Number(sumaTotal0).toFixed(2), IM_PRIMA_SIM:Number(sumaSimNeta0).toFixed(2), IM_PRIMA_TOTAL_SIM:Number(sumaSimTotal0).toFixed(2)};
					vm.results[indice1]={name: nivel1, $$treeLevel: 1, IM_PRIMA_NETA: Number(sumaNeta1).toFixed(2), IM_PRIMA_TOTAL: Number(sumaTotal1).toFixed(2), IM_PRIMA_SIM:Number(sumaSimNeta1).toFixed(2), IM_PRIMA_TOTAL_SIM:Number(sumaSimTotal1).toFixed(2)};
					
					vm.gridResult.data=vm.results;
				}
			}, function callBack(response) {
				msg.textContent('Error al calcular las primas para la simulación (' + response.status + ')');
				$mdDialog.show(msg);
				vm.cargar = false;
			});
		}
		
		function rellenaEmpresasYNegocios(idTipoSimulacion){
			console.log("rellenaEmpresasYNegocios");
			var json = {"ID_TIPO_POLIZA":idTipoSimulacion};
			BusquedaService.buscar(json, 'empresasTipoSimulacion')
			.then(function successCallback(response){
				if(response.status == 200){
					vm.listaEmpresas = response.data.LISTA_NEGOCIOS.NEGOCIOS;
					for (var i=0; i < vm.listaNegocios.length; i++){
						if (vm.listaNegocios[i].ID_TIPO_POLIZA==idTipoSimulacion){
							console.log(vm.listaNegocios[i]);
							//variable para almacenar el porcentaje de variación de un negocio
							var NEGvalue=null;
							var NEGtotal=null;
							var negocioJSON={name: (vm.listaNegocios[i].CO_NEGOCIO+" - "+vm.listaNegocios[i].NO_NEGOCIO), id:(String(vm.listaNegocios[i].ID_NEGOCIO)), $$treeLevel: 0};
							//NEGOCIOS, nivel 0 del árbol
							if (vm.LST_SIMULACION_NEGOCIO!=undefined && vm.LST_SIMULACION_NEGOCIO!= null && vm.LST_SIMULACION_NEGOCIO.length>0){
								for(var ii=0; ii<vm.LST_SIMULACION_NEGOCIO.length; ii++){
									var datoBBDD = vm.LST_SIMULACION_NEGOCIO[ii];
									if (datoBBDD.ID_NEGOCIO==vm.listaNegocios[i].ID_NEGOCIO)
										NEGvalue=datoBBDD.PO_INCREMENTO;
								}
							}
							if (NEGvalue!=null){
								negocioJSON.NEG=NEGvalue;
								NEGtotal=NEGvalue;
							}
							
							if (vm.sim===undefined)
								vm.sim={};
							
							if (vm.sim.GLOBAL!=undefined && vm.sim.GLOBAL!=null && vm.sim.GLOBAL!=0){
								negocioJSON.GLOBAL=vm.sim.GLOBAL;
								if (NEGvalue!=null)
									NEGtotal=NEGtotal + ((100+NEGvalue)*vm.sim.GLOBAL)/100;
								else
									NEGtotal=vm.sim.GLOBAL;
							}
							negocioJSON.total=Number(NEGtotal).toFixed(2);
							
							vm.LST_NEGOCIOS.push(negocioJSON);
							
							for (var j=0; j < vm.listaEmpresas.length; j++){
								if (vm.listaEmpresas[j].CO_NEGOCIO == vm.listaNegocios[i].CO_NEGOCIO){
									//EMPRESAS asociadas al negocio, nivel 1 del árbol
									var empresaJSON={name: (vm.listaEmpresas[j].NO_NOMBRE), id: (vm.listaNegocios[i].ID_NEGOCIO)+"_"+(vm.listaEmpresas[j].ID_CLIENTE), $$treeLevel: 1};
									//variable para almacenar el porcentaje de variación de una empresa de un negocio
									var EMPvalue=null;
									var EMPtotal=null;
									if (vm.LST_SIMULACION_CLIENTE!=undefined && vm.LST_SIMULACION_CLIENTE!= null && vm.LST_SIMULACION_CLIENTE.length>0){
										for(var jj=0; jj<vm.LST_SIMULACION_CLIENTE.length; jj++){
											var datoBBDD = vm.LST_SIMULACION_CLIENTE[jj];
											if ((datoBBDD.ID_CLIENTE)==vm.listaEmpresas[j].ID_CLIENTE)
												EMPvalue=datoBBDD.PO_INCREMENTO;
										}
									}
									if (NEGvalue!=null){
										empresaJSON.NEG=NEGvalue;
										EMPtotal=NEGvalue;
									}
									if (EMPvalue!=null){
										empresaJSON.EMP=EMPvalue;
										if (NEGvalue!=null){
											EMPtotal=EMPtotal + ((100+EMPtotal)*EMPvalue)/100;
										}else{
											EMPtotal=EMPvalue;
										}
									}
										
									if (vm.sim.GLOBAL!=undefined && vm.sim.GLOBAL!=null && vm.sim.GLOBAL!=0){
										empresaJSON.GLOBAL=vm.sim.GLOBAL;
										if (EMPtotal!=null)
											EMPtotal=EMPtotal + ((100+EMPtotal)*vm.sim.GLOBAL)/100;
										else
											EMPtotal=vm.sim.GLOBAL;
									}	
									empresaJSON.total=Number(EMPtotal).toFixed(2);
									
									vm.LST_NEGOCIOS.push(empresaJSON);
									
									if (vm.listaEmpresas[j].LST_GARANTIAS != null){
										for (var k=0; k<vm.listaEmpresas[j].LST_GARANTIAS.length; k++){
											//variable para almacenar el porcentaje de variación de una garantía de una empresa de un negocio
											var EMPGARvalue=null;
											var empresaGarJSON={name: (vm.listaEmpresas[j].LST_GARANTIAS[k].NO_GARANTIA), id: (vm.listaEmpresas[j].ID_NEGOCIO)+"_"+(vm.listaEmpresas[j].ID_CLIENTE)+"_"+(vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA)};
											//GARANTIAS asociadas a la empresa
											if (vm.LST_SIMULACION_CLIENTE_GAR!=undefined && vm.LST_SIMULACION_CLIENTE_GAR!= null && vm.LST_SIMULACION_CLIENTE_GAR.length>0){
												for(var kk=0; kk<vm.LST_SIMULACION_CLIENTE_GAR.length; kk++){
													var datoBBDD = vm.LST_SIMULACION_CLIENTE_GAR[kk];
													if ((datoBBDD.ID_CLIENTE+"_"+datoBBDD.ID_GARANTIA)==vm.listaEmpresas[j].ID_CLIENTE+"_"+vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA)
														EMPGARvalue=datoBBDD.PO_INCREMENTO;
												}	
											}
											//Variable para el total
											var total = 0;
											//Se aplica a cada fila del grid los valores de sus negocios/empresas/garantías que le afecten
											if (EMPGARvalue!=null){
												empresaGarJSON.GAR=EMPGARvalue;
												total = total + ((100+total)*EMPGARvalue)/100;
											}
											if (EMPvalue!=null){
												empresaGarJSON.EMP=EMPvalue;
												total = total + ((100+total)*EMPvalue)/100;
											}
											if (NEGvalue!=null){
												empresaGarJSON.NEG=NEGvalue;
												total = total + ((100+total)*NEGvalue)/100;
											}
											//MULTIPLICADOR GENERAL (afecta a todas las garantías de todas las empresas de todos los negocios)
											if (vm.sim.GLOBAL!=undefined && vm.sim.GLOBAL!=null && vm.sim.GLOBAL!=0){
												empresaGarJSON.GLOBAL=vm.sim.GLOBAL;
												total = total + ((100+total)*vm.sim.GLOBAL)/100;
											}
											
											//MULTIPLICADORES GENERALES DE GARANTIAS (afecta a una garantías de todas las empresas de todos los negocios)
											if (vm.sim.g127!=undefined && vm.sim.g127!=null && vm.sim.g127!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="127"){
												empresaGarJSON.GENERAL=vm.sim.g127;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g158!=undefined && vm.sim.g158!=null && vm.sim.g158!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="158"){
												empresaGarJSON.GENERAL=vm.sim.g158;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g622!=undefined && vm.sim.g622!=null && vm.sim.g622!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="622"){
												empresaGarJSON.GENERAL=vm.sim.g622;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g29!=undefined && vm.sim.g29!=null && vm.sim.g29!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="29"){
												empresaGarJSON.GENERAL=vm.sim.g29;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g128!=undefined && vm.sim.g128!=null && vm.sim.g128!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="128"){
												empresaGarJSON.GENERAL=vm.sim.g128;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g126!=undefined && vm.sim.g126!=null && vm.sim.g126!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="126"){
												empresaGarJSON.GENERAL=vm.sim.g126;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g129!=undefined && vm.sim.g129!=null && vm.sim.g129!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="129"){
												empresaGarJSON.GENERAL=vm.sim.g129;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g978!=undefined && vm.sim.g978!=null && vm.sim.g978!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="978"){
												empresaGarJSON.GENERAL=vm.sim.g978;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (vm.sim.g802!=undefined && vm.sim.g802!=null && vm.sim.g802!=0 && vm.listaEmpresas[j].LST_GARANTIAS[k].ID_GARANTIA=="802"){
												empresaGarJSON.GENERAL=vm.sim.g802;
												total = total + ((100+total)*empresaGarJSON.GENERAL)/100;
											}
											if (total!=0)
												empresaGarJSON.total=Number(total).toFixed(2);
												
											vm.LST_NEGOCIOS.push(empresaGarJSON);
										}
									}
								}
							}
						}
					}
					vm.gridNegocios.data=vm.LST_NEGOCIOS;
					//vm.gridNegocios.core.refresh();
				}
			}, function callBack(response){
				msg.textContent('Error ' + response.status);
				$mdDialog.show(msg);
			});
		}
		
		//Función usada al guardar, rellena las listas que se pasan en el json de las consultas a BBDD
		function rellenaListasSimulacion(){
			vm.LST_SIMULACION_CLIENTE_GAR=[];
			vm.LST_SIMULACION_CLIENTE=[];
			vm.LST_SIMULACION_NEGOCIO=[];
			vm.LST_SIMULACION_GARANTIA=[];
			//Recorrer el grid de porcentajes totales distintos de 0 para aplicarlos en las primas
			for(var i = 0; i < vm.gridApi.grid.rows.length; i++){
				var entityActual = vm.gridApi.grid.rows[i].entity;
				if (entityActual!=undefined && entityActual.total!=undefined && entityActual.total!=0){
					if (entityActual.$$treeLevel==undefined){
						if (entityActual.GAR!=undefined && entityActual.GAR!=0){
							var splitted = entityActual.id.split("_");
							if (splitted.length == 3){
								vm.LST_SIMULACION_CLIENTE_GAR.push({"ID_CLIENTE":splitted[1], "ID_NEGOCIO":splitted[0], "ID_GARANTIA": splitted[2], "PO_INCREMENTO":entityActual.GAR});
							}
						}
					} else if (entityActual.$$treeLevel==1){
						if (entityActual.EMP!=undefined && entityActual.EMP!=0){
							var splitted = entityActual.id.split("_");
							if (splitted.length == 2){
								vm.LST_SIMULACION_CLIENTE.push({"ID_CLIENTE":splitted[1], "ID_NEGOCIO":splitted[0], "PO_INCREMENTO":entityActual.EMP});
							}
						}
					} else if (entityActual.$$treeLevel==0){
						if (entityActual.NEG!=undefined && entityActual.NEG!=0){
							vm.LST_SIMULACION_NEGOCIO.push({"ID_NEGOCIO":entityActual.id, "PO_INCREMENTO":entityActual.NEG});
						}
					} 
				}
			}
			if (vm.sim!=undefined){
				if (vm.sim.GLOBAL!=undefined && vm.sim.GLOBAL!=null && vm.sim.GLOBAL!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.GLOBAL});
				if (vm.sim.g127!=undefined && vm.sim.g127!=null && vm.sim.g127!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g127, "ID_GARANTIA":"127"});
				if (vm.sim.g158!=undefined && vm.sim.g158!=null && vm.sim.g158!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g158, "ID_GARANTIA":"158"});
				if (vm.sim.g622!=undefined && vm.sim.g622!=null && vm.sim.g622!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g622, "ID_GARANTIA":"622"});
				if (vm.sim.g29!=undefined && vm.sim.g29!=null && vm.sim.g29!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g29, "ID_GARANTIA":"29"});
				if (vm.sim.g128!=undefined && vm.sim.g128!=null && vm.sim.g128!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g128, "ID_GARANTIA":"128"});
				if (vm.sim.g126!=undefined && vm.sim.g126!=null && vm.sim.g126!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g126, "ID_GARANTIA":"126"});
				if (vm.sim.g129!=undefined && vm.sim.g129!=null && vm.sim.g129!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g129, "ID_GARANTIA":"129"});
				if (vm.sim.g978!=undefined && vm.sim.g978!=null && vm.sim.g978!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g978, "ID_GARANTIA":"978"});
				if (vm.sim.g802!=undefined && vm.sim.g802!=null && vm.sim.g802!=0)
					vm.LST_SIMULACION_GARANTIA.push({"PO_INCREMENTO": vm.sim.g802, "ID_GARANTIA":"802"});
			} else {
				vm.sim=null;
			}
			if (vm.LST_SIMULACION_CLIENTE_GAR === undefined || vm.LST_SIMULACION_CLIENTE_GAR.length == 0) {
				vm.LST_SIMULACION_CLIENTE_GAR=null;
				//console.log(vm.LST_SIMULACION_CLIENTE_GAR);
			}
			if (vm.LST_SIMULACION_CLIENTE === undefined || vm.LST_SIMULACION_CLIENTE.length == 0) {
				vm.LST_SIMULACION_CLIENTE=null;
				//console.log(vm.LST_SIMULACION_CLIENTE);
			}
			if (vm.LST_SIMULACION_NEGOCIO === undefined || vm.LST_SIMULACION_NEGOCIO.length == 0) {
				vm.LST_SIMULACION_NEGOCIO=null;
				//console.log(vm.LST_SIMULACION_NEGOCIO);
			}
			if (vm.LST_SIMULACION_GARANTIA === undefined || vm.LST_SIMULACION_GARANTIA.length == 0) {
				vm.LST_SIMULACION_GARANTIA=null;
				//console.log(vm.LST_SIMULACION_GARANTIA);
			}
		}
		
		//Para el calculo de la simulación cojo los totales calculados en la tabla para las garantias de cada empresa
		function rellenaListasCalculoSimulacion(){
			vm.LST_SIMULACION_CLIENTE_GAR=[];
			//Recorrer el grid de porcentajes totales distintos de 0 para aplicarlos en las primas
			for(var i = 0; i < vm.gridApi.grid.rows.length; i++){
				var entityActual = vm.gridApi.grid.rows[i].entity;
				if (entityActual!=undefined && entityActual.total!=undefined && entityActual.total!=0){
					if (entityActual.$$treeLevel==undefined){
						var splitted = entityActual.id.split("_");
						if (splitted.length == 3){
							vm.LST_SIMULACION_CLIENTE_GAR.push({"ID_CLIENTE":splitted[1], "ID_NEGOCIO":splitted[0], "ID_GARANTIA": splitted[2], "PO_INCREMENTO":entityActual.total});
						}
					} 
				}
			}
			if (vm.LST_SIMULACION_CLIENTE_GAR === undefined || vm.LST_SIMULACION_CLIENTE_GAR.length == 0) {
				vm.LST_SIMULACION_CLIENTE_GAR=null;
				//console.log(vm.LST_SIMULACION_CLIENTE_GAR);
			}
		}
		
		//Evento lanzado al pulsar sobre el botón de LIMPIAR
		vm.limpiar=function(){
			vm.form={};
			if (vm.simulacion!=null){
				vm.form.NO_SIMULACION=vm.simulacion.NO_SIMULACION;
			}
			vm.sim={};
			vm.LST_SIMULACION_CLIENTE_GAR=[];
			vm.LST_SIMULACION_CLIENTE=[];
			vm.LST_SIMULACION_NEGOCIO=[];
			vm.LST_SIMULACION_GARANTIA=[];
			vm.LST_NEGOCIOS=[];
			vm.impuestos=[];
			vm.gridResult.data=[];
			vm.gridNegocios.data=vm.LST_NEGOCIOS;
//			vm.gridApi.grid.clearAllFilters();
		}
		
		//Evento lanzado al pulsar sobre el botón de GUARDAR
		vm.guardar=function(finalizar){
			vm.cargar = true;
			var fdFin="";
			if (vm.form.FD_INICIO!=undefined)
				fdFin=getFechaFin(vm.form.FD_INICIO);
			
			rellenaListasSimulacion();
			
			var json = {"FD_FIN": fdFin,
						"FD_INI": getFechaJSONFormat(vm.form.FD_INICIO),
						"ID_TIPO_POLIZA": vm.form.ID_TIPO_POLIZA,
						"NO_SIMULACION":vm.form.NO_SIMULACION,
						"TXT_OBSERVACIONES":vm.form.TX_OBSERVACIONES
						};
						
			if (finalizar){
				json.IN_TERMINADO=true;
			}else{
				json.IN_TERMINADO=false;
			}
			if (vm.simulacion!=undefined && vm.simulacion.ID_SIMULACION_M!=undefined && vm.simulacion.ID_SIMULACION_M!=null){
				json.ID_SIMULACION_M=vm.simulacion.ID_SIMULACION_M;
			}
			
			if (vm.LST_SIMULACION_GARANTIA!=undefined && vm.LST_SIMULACION_GARANTIA!=null && vm.LST_SIMULACION_GARANTIA.length>0){
				json.LST_SIMULACION_GARANTIA=vm.LST_SIMULACION_GARANTIA;
			}
			if (vm.LST_SIMULACION_NEGOCIO!=undefined && vm.LST_SIMULACION_NEGOCIO!=null && vm.LST_SIMULACION_NEGOCIO.length>0){
				json.LST_SIMULACION_NEGOCIO=vm.LST_SIMULACION_NEGOCIO;
			}
			if (vm.LST_SIMULACION_CLIENTE!=undefined && vm.LST_SIMULACION_CLIENTE!=null && vm.LST_SIMULACION_CLIENTE.length>0){
				json.LST_SIMULACION_CLIENTE=vm.LST_SIMULACION_CLIENTE;
			}
			if (vm.LST_SIMULACION_CLIENTE_GAR!=undefined && vm.LST_SIMULACION_CLIENTE_GAR!=null && vm.LST_SIMULACION_CLIENTE_GAR.length>0){
				json.LST_SIMULACION_CLIENTE_GAR=vm.LST_SIMULACION_CLIENTE_GAR;
			}
			//console.log(json);
			SimulacionService.saveSimulacion(json)
			.then(function successCallback(response){
				if(response.status == 200){
					vm.simulacion=json;
					vm.cargar = false;
					if (finalizar) {
						msg.textContent('Se han guardado los parámetros de la simulación con éxito');
						$mdDialog.show(msg);
						vm.form.IN_TERMINADO=true;
					} else {
						msg.textContent('Se han guardado los parámetros de la simulación y se han generado los recibos de la simulación con éxito');
						$mdDialog.show(msg);
					}
				}
			}, function callBack(response){
				vm.cargar = false;
				msg.textContent('Error al guardar los parámetros de la simulación (' + response.status + ')');
				$mdDialog.show(msg);
			});
		}
		
	}
	function getFechaFin(fechaIniStr){
	//console.log(fechaIni);
		var fechaIni = new Date(fechaIniStr);
		var month = (fechaIni.getMonth())+1;
		var year = fechaIni.getFullYear();
		var date = "";
	//console.log(month+" "+year);
		if (month==1){
			date=year+"-12-31";
		}
		else if (month==7){
			date=(year+1)+"-06-30";
		}
		return date;
	}
	
	function getFechaJSONFormat(fecha){
		var fechaAsDate = new Date(fecha);
		var day = String(fechaAsDate.getDate());
		if (day.length < 2)
			day = '0' + day;
		var month = String((fechaAsDate.getMonth())+1);
		if (month.length < 2)
			month = '0' + month;
		var year = String(fechaAsDate.getFullYear());
		return year + '-' + month + '-' + day;
	}
	
    ng.module('App').component('simulacionSd', Object.create(simulacionComponent));
    
    ng.module('App').directive("isAdd", function(){
		  return function(scope, element, attrs){
		  	if(!(attrs.isAdd == "")){
		  		scope.$parent.isFocused = false;
		  	}
		  	else
		  		scope.$parent.isFocused = true;
		  }
	});
    
})(window.angular);


