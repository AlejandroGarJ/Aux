(function(ng) {	


	//Crear componente de app
    var presupuestoComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$rootScope', '$q', '$location', '$timeout', 'TiposService', 'BusquedaService', 'PresupuestoService','$mdDialog', 'BASE_SRC', 'DescargaService', 'ClienteService'],
    		require: {
            	parent:'^sdApp',
            	busquedaPresupuesto: '^?busquedaPresupuesto'
    		},
    		bindings: {
    			llave:'<',
    			idRamo:'<',
    			idColectivo:'<',
    			idCliente:'<',
    			detalles:'<'
    		}
    }
    
    
    
    presupuestoComponent.controller = function presupuestoComponentControler($rootScope, $q, $location, $timeout, TiposService, BusquedaService, PresupuestoService, $mdDialog, BASE_SRC, DescargaService, ClienteService){
    	var vm=this;
    	vm.tipos = {};
    	vm.calendar = {};
    	vm.form = {};
    	vm.polizas = [];
    	vm.tiposSolicitud = [];
    	var init = false;
    	var x2js = new X2JS();
    	vm.cargar = 0;
    	var datos = {};
    	vm.mostrar = true;
    	vm.ordenaPrima = 0;
    	vm.ordenaProducto = 0;
    	vm.ordenaCompania = 0;
    	vm.ordenaModalidad = 0;
		var url = $location.url();
		
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	this.$onInit = function(){
    		vm.tipoRamo = vm.idRamo;
    		
//    		ClienteService.getCliente({"ID_CLIENTE":vm.detalles.OCLIENTE.ID_CLIENTE})
//            .then(function successCallback(response) {
//                vm.detalles.OCLIENTE = response.data;
//            }, function errorCallBack(response) {
//                
//            });
    		TiposService.getRamos({"IN_TARIFICABLE": true})
			.then(function successCallback(response){
				if(response.status == 200){
					vm.tipos.ramos = response.data.TIPOS.TIPO;
				}
			}, function callBack(response){
				if(response.status == 406 || response.status == 401){
                	vm.parent.logout();
                }
			});
    		
    		PresupuestoService.getAseguradorasTarificables({'ID_RAMO':vm.idRamo, 'idColectivo':vm.idColectivo})
    		.then(function successCallback(response){
    			if(response.status == 200)
    				vm.aseguradoras = response.data.CIAS_RAMOS;
    		}, function errorCallback(response){
    			
    		});
    	}
    	this.$onChanges = function(){
    		vm.tipoRamo = vm.idRamo;
    	}
    	
    	this.loadTemplate=function(){
    		return "src/presupuesto/presupuesto.view.html";
    	}
    	
    	//Tarificar presupuestos
    	vm.tarificarPresupuestos = function(obj, tipo){
			vm.vista = 0;
			vm.cargar = true;
			
			//Si el presupuesto es nuevo no tiene detalles, le ponemos algunos datos
    		if(vm.detalles!=undefined && vm.detalles!=null){
    			datos = {'PRESUPUESTO':vm.detalles};
    		}else{
    			datos = {'PRESUPUESTO':{}};
    			datos.PRESUPUESTO.ID_RAMO = vm.idRamo;
        		datos.PRESUPUESTO.ID_TIPO_COLECTIVO = vm.idColectivo;
        		datos.PRESUPUESTO.OCLIENTE = vm.idCliente;
        		datos.PRESUPUESTO.NO_RAMO = vm.aseguradoras[0].NO_RAMO;
    		}
    		
    		//Para guardar BLOCK_SELECCION_VEHICULO
    		if(vm.form.VERSION != undefined || vm.form.VERSION != null){
    			obj['BLOCK_SELECCION_VEHICULO'] = {};
    			obj.BLOCK_SELECCION_VEHICULO.FD_LANZAMIENTO = vm.form.VERSION.FD_LANZAMIENTO;
    			obj.BLOCK_SELECCION_VEHICULO.CO_TIPO = parseInt(vm.form.VERSION.CO_TIPO);
    			obj.BLOCK_SELECCION_VEHICULO.CO_MODELO = parseInt(vm.form.VERSION.CO_MODELO);
    			obj.BLOCK_SELECCION_VEHICULO.CO_CATEGORIA = parseInt(vm.form.VERSION.CO_CATEGORIA);
    			obj.BLOCK_SELECCION_VEHICULO.ID_MARCA_AUTO = parseInt(vm.form.VERSION.CO_MARCA);
    			obj.BLOCK_SELECCION_VEHICULO.CO_VERSION = parseInt(vm.form.VERSION.CO_VERSION);
    			obj.BLOCK_SELECCION_VEHICULO.DS__CO_MODELO = vm.form.VERSION.DS_MODELO;
    			obj.BLOCK_SELECCION_VEHICULO.DS__ID_MARCA_AUTO = vm.form.VERSION.DS_MARCA;
    			obj.BLOCK_SELECCION_VEHICULO.DS__CO_VERSION = vm.form.VERSION.DS_VERSION;
    			obj.BLOCK_SELECCION_VEHICULO.NO_VEHICULO_SELECCIONADO = vm.form.VERSION.DS_VERSION + " - F.LANZ: " + vm.form.VERSION.FD_LANZAMIENTO + " - PUERTAS: " + vm.form.VERSION.NU_PUERTAS + " - POT: " + vm.form.VERSION.NU_POTENCIA + " - TARA: " + vm.form.VERSION.NU_CILINDRADA + " - PLAZAS: " + vm.form.VERSION.NU_PLAZAS
    		
    			if (vm.idColectivo == 30 || vm.idColectivo == 31) {
    				obj.BLOCK_SELECCION_VEHICULO.IM_VALOR = parseFloat(vm.form.VERSION.IM_VALOR);
        			obj.BLOCK_SELECCION_VEHICULO.NU_POTENCIA = vm.form.VERSION.NU_POTENCIA;
        			obj.BLOCK_SELECCION_VEHICULO.IM_ACCESORIOS = parseFloat(vm.form.VERSION.IM_ACCESORIOS);
        			obj.BLOCK_SELECCION_VEHICULO.IM_VALOR_TOTAL = parseFloat(vm.form.VERSION.IM_VALOR_TOTAL);
    			}
    		}
    		
    		obj.IS_CONTRATACION = false;
    		
    		var objJSON = {};
    		objJSON[tipo] = obj;
    		
    		for(persona in obj){
    			for(dato in obj[persona]){
    				if(obj[persona][dato]===""||obj[persona][dato]===undefined || obj[persona][dato]===null || obj[persona][dato] === 'NaN'){
    					delete obj[persona][dato];
    				}

    				if((vm.idColectivo == 30 || vm.idColectivo == 31) && dato==='IM_PRECIO'){
    					delete obj[persona][dato];
    				}
    			}
    		}
    		
//    		datos.PRESUPUESTO.XM_ENVIADO = x2js.js2xml(objJSON);
    		datos.PRESUPUESTO.IS_CONTRATACION = false;
    		vm.tarifas = [];
    		
    		PresupuestoService.getTarificacionByAseguradora(datos)
     		.then(function successCallback(response){

     			if(response.data.TARIFAS != null || response.data.TARIFAS != undefined){
     				//Ordenar la lista por prima 
     				response.data.TARIFAS.sort(function (a, b){
     				    return (b.IM_PRIMA_ANUAL_TOT + a.IM_PRIMA_ANUAL_TOT);
     				});
     				
     				//Mientras devuelva objeto único
     				if(response.data.TARIFAS.length==undefined){
     					for(var i=0; i<response.data.TARIFAS.length; i++){
     						if(response.data.TARIFAS[i].ID_COMPANIA!=undefined){
     							vm.tarifas.push(response.data.TARIFAS[i]);
     						}
     					}
     				}else{
     					for(var j=0; j<response.data.TARIFAS.length; j++){
     						if(response.data.TARIFAS[j].ID_COMPANIA!=undefined){
     							vm.tarifas.push(response.data.TARIFAS[j]);
     						}
     					}
     				}
 				}
     			
            	if(vm.tarifas.length>0)
            		datos.PRESUPUESTO.LIST_TARIFAS = vm.tarifas;
            	else
            		vm.vista = 4;

    			datos.PRESUPUESTO.XM_RESPUESTA = null;
    			
    			//Para recargar listado
    			vm.listaPresupuestos = vm.busquedaPresupuesto.gridOptions.data;
    			var index = vm.listaPresupuestos.indexOf(vm.detalles);
    			
            	//Guardar póliza
            	PresupuestoService.savePresupuesto(datos.PRESUPUESTO)
            	.then(function successCallback(response){
					if(response.status == 200){
						if(response.data.ID_RESULT !=0){
							msg.textContent(response.data.DS_RESULT);
							$mdDialog.show(msg);
						} else if(response.data.ID_RESULT ==0){	

						datos.PRESUPUESTO = response.data;
						vm.detalles = response.data;
								
						if (vm.idColectivo == 30 || vm.idColectivo == 31) {
							obj.BLOCK_SELECCION_VEHICULO.IM_PRECIO = parseFloat(obj.BLOCK_SELECCION_VEHICULO.IM_VALOR);
						}
						
						//Recargar listado
						if(index == -1){
							//Si no existe llamo al presupuesto para que me devuelva los datos necesarios para el ui-grid
							BusquedaService.buscar({"ID_PRESUPUESTO":datos.PRESUPUESTO.ID_PRESUPUESTO},'presupuestos')
							.then(function successCallback(response){
								var nuevoPresupuesto = response.data.PRESUPUESTOS[0];
								nuevoPresupuesto.FT_USU_ALTA = nuevoPresupuesto.FT_USU_ALTA.substr(0,10);
								vm.busquedaPresupuesto.gridOptions.data.push(nuevoPresupuesto);
							}, function errorCallback(response){
								
							});
							
						}else if(index > -1){
							response.data.FT_USU_ALTA = response.data.FT_USU_ALTA.substr(0,10);
							if(response.data.FT_USU_MOD != undefined && response.data.FT_USU_MOD != "undefined"){
								response.data.FT_USU_MOD = response.data.FT_USU_MOD.substr(0,10);
							}
							if(response.data.FD_VENCIMIENTO != undefined && response.data.FD_VENCIMIENTO != "undefined"){
								response.data.FD_VENCIMIENTO = response.data.FD_VENCIMIENTO.substr(0,10);
							}
							vm.busquedaPresupuesto.gridOptions.data[index] = response.data;
						}	
					
					}
				}
            		
         		},function(error) {
					msg.textContent("Se ha producido un error al guardar el presupuesto.");
					$mdDialog.show(msg);
         			if (error.status == 406 || error.status == 401) {
                        vm.parent.logout();
                    }
                });
            	
            	vm.cargar = false;
     			
     		},function(error) {
                   if (error.status == 406 || error.status == 401) {
                       vm.parent.logout();
                   }
     			   vm.cargar = false;
            });
       }
    		
        	
    	
//    	$rootScope.prop = $timeout(function(){vm.tarificarPresupuestos(vm.datos)}, 1000);
//    	
//    	$timeout.cancel($rootScope.prop);
    	
		//función padre para ver las garantias
    	vm.verGarantias=function(ev, tarifa){
        	$mdDialog.show({
        		templateUrl: BASE_SRC+'presupuesto/form.presupuesto.modal/garantia.modal.html',
    			controllerAs: '$ctrl',
    			clickOutsideToClose:true,
    			parent: angular.element(document.body),
    		    targetEvent: ev,
    		    fullscreen:false,
    		    controller:['$mdDialog', function($mdDialog){
    				var md = this;
    				
    				md.tarifa = tarifa;
    				md.vista = 0;
    	    		BusquedaService.buscar({"ID_COMP_RAMO_PROD":md.tarifa.ID_COMP_RAMO_PROD},"garantiasByProducto")
    	    		.then(function successCallback(response){
    	    			md.garantias = response.data.GARANTIAS;
    	    			if(response.data.NUMERO_GARANTIAS==0){
    	    				md.vista = 3;
    	    			}else{
    	    				md.vista = 4;
    	    			}
    	    		},function errorCallBack(response){
    	    			if(response.status == 406 || response.status == 401){
    	                	vm.parent.logout();
    	                }
    	    		});
    	    		
    				
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
    	
    	vm.enviarPresupuestoPDF = function(){
    		if(vm.tarifas!=undefined && datos!=undefined )
    			DescargaService.enviarPresupuestoPDF(vm.tarifas,datos.PRESUPUESTO);
			else {
				msg.textContent("No se dispone de ninguna tarifa para exportar el presupuesto");
				$mdDialog.show(msg);
			}
//    			DescargaService.enviarPresupuestoPDF(vm.detalles.LIST_TARIFAS,vm.detalles);
    	}
    	
    	vm.descargarPresupuesto = function(){
    		if(vm.tarifas!=undefined && datos!=undefined )
    			DescargaService.descargarPresupuesto(vm.tarifas,datos.PRESUPUESTO);
			else {
				msg.textContent("No se dispone de ninguna tarifa para exportar el presupuesto");
				$mdDialog.show(msg);
			}
//    			DescargaService.descargarPresupuesto(vm.detalles.LIST_TARIFAS,vm.detalles);
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
    	
    	vm.mostrarDatos = function(){
    		if(vm.mostrar) {
    			vm.mostrar = false;
    		}
    		else {
    			vm.mostrar = true;
    		}
    	}
    	
    	vm.ordenarTabla = function(dato){
			
			if(dato=='aseguradora'){
				if(vm.ordenaCompania==0){
					vm.ordenaCompania = 1;
					vm.tarifas.sort(function (a, b){
						if(a.NO_COMPANIA==undefined)
							a.NO_COMPANIA = "";
						if(b.NO_COMPANIA==undefined)
							b.NO_COMPANIA = "";
						var x = a.NO_COMPANIA.toLowerCase();
					    var y = b.NO_COMPANIA.toLowerCase();
					    if (x < y) {return -1;}
					    if (x > y) {return 1;}
					    return 0;
	 				});
				}else{
					vm.ordenaCompania = 0;
					vm.tarifas.sort(function (a, b){
						if(a.NO_COMPANIA==undefined)
							a.NO_COMPANIA = "";
						if(b.NO_COMPANIA==undefined)
							b.NO_COMPANIA = "";
						var x = a.NO_COMPANIA.toLowerCase();
					    var y = b.NO_COMPANIA.toLowerCase();
					    if (x < y) {return 1;}
					    if (x > y) {return -1;}
					    return 0;
	 				});
				}
			}else if(dato=='producto'){
				if(vm.ordenaProducto==0){
					vm.ordenaProducto = 1;
					vm.tarifas.sort(function (a, b){
						if(a.NO_PRODUCTO==undefined)
							a.NO_PRODUCTO = "";
						if(b.NO_PRODUCTO==undefined)
							b.NO_PRODUCTO = "";
						var x = a.NO_PRODUCTO.toLowerCase();
					    var y = b.NO_PRODUCTO.toLowerCase();
					    if (x < y) {return -1;}
					    if (x > y) {return 1;}
					    return 0;
	 				});
				}else{
					vm.ordenaProducto = 0;
					vm.tarifas.sort(function (a, b){
						if(a.NO_PRODUCTO==undefined)
							a.NO_PRODUCTO = "";
						if(b.NO_PRODUCTO==undefined)
							b.NO_PRODUCTO = "";
						var x = a.NO_PRODUCTO.toLowerCase();
					    var y = b.NO_PRODUCTO.toLowerCase();
					    if (x < y) {return 1;}
					    if (x > y) {return -1;}
					    return 0;
	 				});
				}
			}else if(dato=='prima'){
				if(vm.ordenaPrima==0){
					vm.ordenaPrima = 1;
					vm.tarifas.sort(function (a, b){
						if(a.IM_PRIMA_ANUAL_TOT==undefined)
							a.IM_PRIMA_ANUAL_TOT = null;
						if(b.IM_PRIMA_ANUAL_TOT==undefined)
							b.IM_PRIMA_ANUAL_TOT = null;
						return (b.IM_PRIMA_ANUAL_TOT - a.IM_PRIMA_ANUAL_TOT);
	 				});
				}else{
					vm.ordenaPrima = 0;
					vm.tarifas.sort(function (a, b){
						if(a.IM_PRIMA_ANUAL_TOT==undefined)
							a.IM_PRIMA_ANUAL_TOT = null;
						if(b.IM_PRIMA_ANUAL_TOT==undefined)
							b.IM_PRIMA_ANUAL_TOT = null;
						return (a.IM_PRIMA_ANUAL_TOT - b.IM_PRIMA_ANUAL_TOT);
	 				});
				}
			}else if(dato=='modalidad'){
				if(vm.ordenaModalidad==0){
					vm.ordenaModalidad = 1;
					vm.tarifas.sort(function (a, b){
						if(a.NO_MODALIDAD==undefined)
							a.NO_MODALIDAD = "";
						if(b.NO_MODALIDAD==undefined)
							b.NO_MODALIDAD = "";
						var x = a.NO_MODALIDAD.toLowerCase();
					    var y = b.NO_MODALIDAD.toLowerCase();
					    if (x < y) {return -1;}
					    if (x > y) {return 1;}
					    return 0;
	 				});
				}else{
					vm.ordenaModalidad = 0;
					vm.tarifas.sort(function (a, b){
						if(a.NO_MODALIDAD==undefined)
							a.NO_MODALIDAD = "";
						if(b.NO_MODALIDAD==undefined)
							b.NO_MODALIDAD = "";
						var x = a.NO_MODALIDAD.toLowerCase();
					    var y = b.NO_MODALIDAD.toLowerCase();
					    if (x < y) {return 1;}
					    if (x > y) {return -1;}
					    return 0;
	 				});
				}
			}
		}
    	
    }
    
    ng.module('App').component('sdPresupuesto', Object.create(presupuestoComponent));
    
    
    
})(window.angular);