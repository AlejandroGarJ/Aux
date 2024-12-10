(function(ng) {	

	//Crear componente de busqueda
    var filtrosAseguradorasComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'uiGridConstants', 'BASE_SRC', '$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp'
            }
    } 
    
    filtrosAseguradorasComponent.controller = function filtrosAseguradorasComponentController($routeParams, sharePropertiesService, BusquedaService, TiposService, uiGridConstants, BASE_SRC, $mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.tipos = {};
		var url=window.location;
		var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		vm.colectivos = vm.parent.colectivos;
    		
    		if(/productos/.test(url)){
    			vm.typeText = "producto";
    			vm.tipoText = "productos";
				vm.key ="DS_PRODUCTO";
				
				TiposService.getCompania()
				.then(function successCallback(response){
					if(response.status == 200){
						vm.tipos.compania = response.data.TIPOS.TIPO;
					}
				});
				TiposService.getRamos()
				.then(function successCallback(response){
					if(response.status == 200){
						vm.tipos.ramos = response.data.TIPOS.TIPO;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
					}
				});
    		}
    		else if(/ramos/.test(url)){
    			vm.typeText = "ramo";
    			vm.tipoText = "ramos";
    			vm.key = "NO_RAMO";
    		}
    		else if(/via/.test(url)){
    			vm.tipoText = "tipos de vía";
    			vm.typeText = "tiposVia";
    			vm.key = "DS_TIPO_VIA";
    		}
    		else if(/documento/.test(url)){
    			vm.tipoText = "tipos de documento";
    			vm.typeText = "tiposDocumento";
    			vm.key = "DS_TIPO_DOCUMENTO";
    		}
    		else if(/sexo/.test(url)){
    			vm.tipoText = "tipos de sexo";
    			vm.typeText = "tiposSexo";
    			vm.key = "DS_SEXO";
    		}
    		else if(/situacion_poliza/.test(url)){
    			vm.tipoText = "estados de poliza";
    			vm.typeText = "statPoliza";
    			vm.key = "DS_SITUAPOLIZA";
    		}
    		else if(/situacion_cliente/.test(url)){
    			vm.tipoText = "estados de cliente";
    			vm.typeText = "statCliente";
    			vm.key = "DS_SITUACION_CLIENTE";
    		}
    		else if(/situacion_recibo/.test(url)){
    			vm.tipoText = "estados de recibo";
    			vm.typeText = "statRecibo";
    			vm.key = "DS_SITUARECIBO";
    		}
    		else if(/estados_siniestro/.test(url)){
    			vm.tipoText = "estados de siniestro";
    			vm.typeText = "statSiniestro";
    			vm.key = "DS_ESTADO_SINIESTRO";
    		}
    		else if(/programa/.test(url)){
    			vm.tipoText = "tipos de programa";
    			vm.typeText = "programa";
    			vm.key = "DS_PROGRAMA";
    		}
    		else if(/tipos/.test(url)){
    			vm.typeText = "tiposTipos";
    			vm.tipoText = "tipos";
    			vm.key = "DS_TIPOS";
    			TiposService.getCodigos()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.codigos = response.data.TIPOS.TIPO;
    				}
    			})
    		}
    		else if(/anulacion/.test(url)){
    			vm.typeText = "anul";
    			vm.tipoText = "motivos de anulación";
    			vm.key = "DS_CAUSAANULACION";
				TiposService.getTipos({"ID_CODIGO": constantsTipos.TIPOS_CAUSA_ANULACION})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.tipos.usos = response.data.TIPOS.TIPO;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
	                	vm.parent.logout();
	                }
				});
    		}
    		else if(/sujetos/.test(url)){
    			vm.typeText = "sujetos";
    			vm.tipoText = "tipos del cliente";
    			vm.key = "DS_TIPO_CLIENTE";
    		}
    		else if(/colectivos/.test(url)){
    			vm.tipoText = "partners";
    			vm.typeText = "colectivos";
    			vm.key = "DS_TIPO_POLIZA";
    		}
    		else if(/formas/.test(url)){
    			vm.tipoText = "formas de pago";
    			vm.typeText = "formas_pago";
    			vm.key = "DS_FORMAPAGO";
    		}
    		else if(/medio/.test(url)){
    			vm.tipoText = "medios de pago";
    			vm.typeText = "medio_pago";
    			vm.key = "DS_TIPO_MEDIO_PAGO";
    		}
    		
    		
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/admin/filtros.maestros.html";
    	}
    	
    	vm.buscar = function(tipo){
    		if(tipo == 'tipo-producto' && vm.form == undefined){
    			vm.form = {
    					'NO_PRODUCTO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-ramo' && vm.form == undefined){
    			vm.form = {
    					'NO_RAMO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-sujetos' && vm.form == undefined){
    			vm.form = {
    					'DS_TIPO_CLIENTE':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-programa' && (vm.form == undefined || vm.form.DS_PROGRAMA == undefined || vm.form.DS_PROGRAMA == '')){
    			vm.form = {
    					'DS_PROGRAMA':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-anul' && vm.form == undefined) {
				msg.textContent('Debe introducir al menos un criterio de búsqueda');
				$mdDialog.show(msg);
    			return false;
    		}else if(tipo == 'tipo-statPoliza' && (vm.form == undefined || vm.form.DS_SITUAPOLIZA == '' || vm.form.DS_SITUAPOLIZA == undefined)){
    			vm.form = {
    					'DS_SITUAPOLIZA':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-statCliente' && (vm.form == undefined || vm.form.DS_SITUACION_CLIENTE == '' || vm.form.DS_SITUACION_CLIENTE == undefined)){
    			vm.form = {
    					'DS_SITUACION_CLIENTE':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-statRecibo' && (vm.form == undefined || vm.form.DS_SITUARECIBO == '' || vm.form.DS_SITUARECIBO == undefined)){
    			vm.form = {
    					'DS_SITUARECIBO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-statSiniestro' && (vm.form == undefined || vm.form.DS_ESTADO_SINIESTRO == '' || vm.form.DS_ESTADO_SINIESTRO == undefined)){
    			vm.form = {
    					'DS_ESTADO_SINIESTRO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-tiposDocumento' && (vm.form == undefined || vm.form.DS_TIPO_DOCUMENTO == '' || vm.form.DS_TIPO_DOCUMENTO == undefined)){
    			vm.form = {
    					'DS_TIPO_DOCUMENTO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-tiposSexo' && (vm.form == undefined || vm.form.DS_SEXO == '' || vm.form.DS_SEXO == undefined)){
    			vm.form = {
    					'DS_SEXO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-tiposVia' && (vm.form == undefined || vm.form.DS_TIPO_VIA == '' || vm.form.DS_TIPO_VIA == undefined)){
    			vm.form = {
    					'DS_TIPO_VIA':{
    						'value': ''
    					}
    			}
    		}else if(tipo == 'tipo-tiposTipos' && (vm.form == undefined || ((vm.form.ID_TIPO_INTERNO == '' || vm.form.ID_TIPO_INTERNO == undefined) && (vm.form.DS_TIPOS == '' || vm.form.DS_TIPOS == undefined) && (vm.form.CO_TIPO == '' || vm.form.CO_TIPO == undefined) && (vm.form.ID_CODIGO == '' || vm.form.ID_CODIGO == undefined) && (vm.form.NO_CODIGO == '' || vm.form.NO_CODIGO == undefined)))){
    			vm.form = {
    					'DS_TIPOS':{
    						'value': ''
    					}
    			}
    		}else if(tipo == "tipo-medio_pago" && (vm.form == undefined || vm.form.DS_TIPO_MEDIO_PAGO == '' || vm.form.DS_TIPO_MEDIO_PAGO == undefined)){
    			vm.form = {
    					'DS_TIPO_MEDIO_PAGO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == "tipo-formas_pago" && (vm.form == undefined || vm.form.DS_FORMAPAGO == '' || vm.form.DS_FORMAPAGO == undefined)){
    			vm.form = {
    					'DS_FORMAPAGO':{
    						'value': ''
    					}
    			}
    		}else if(tipo == "tipo-colectivos" && (vm.form == undefined || vm.form.DS_TIPO_POLIZA == '' || vm.form.DS_TIPO_POLIZA == undefined)){
    			vm.form = {
    					'DS_TIPO_POLIZA':{
    						'value': ''
    					}
    			}
    		}
    		
    		if(vm.parent.filtrar(vm.form, tipo, true)){
    			//$('#checkVacio').text("Las fechas están mal");
    			$('#checkVacio').slideDown().delay(1500).slideUp();
    		}
    	}
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
			vm.autocomplete = null;
    	}
    	
    }    
    ng.module('App').component('filtrosMaestrosApp', Object.create(filtrosAseguradorasComponent));    
})(window.angular);