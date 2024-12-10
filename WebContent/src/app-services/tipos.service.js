(function () {
  "use strict";

  angular.module("App").factory("TiposService", TiposService);

  //Es un servicio de busqueda como hacer las consultas.
  TiposService.$inject = [
    "$http",
    "$cookies",
    "$rootScope",
    "$timeout",
    "$window",
    "BASE_CON",
  ];
  function TiposService(
    $http,
    $cookies,
    $rootScope,
    $timeout,
    $window,
    BASE_CON
  ) {
    //    	var token = JSON.parse($window.sessionStorage.perfil).token;
    var coToken = _.get($rootScope, "globals.currentUser.coToken");
    var token = _.get($rootScope, "globals.currentUser.token");
    token = token || "";

    var service = {};
    service.getCompania = getCompania;
    service.getComisionista = getComisionista;
    service.getProducto = getProducto;
    service.getRamos = getRamos;
    service.getTipos = getTipos;
    service.getCodigos = getCodigos;
    service.getProvincias = getProvincias;
    service.getCampaign = getCampaign;
    service.getSituaCliente = getSituaCliente;
    service.getSexo = getSexo;
    service.getTipoCliente = getTipoCliente;
    service.getTipoDocumento = getTipoDocumento;
    service.getTipoDocumentoByProducto = getTipoDocumentoByProducto;
    service.getVia = getVia;
    service.getSituaSolicitud = getSituaSolicitud;
    service.getFormasPago = getFormasPago;
    service.getMotivosAnul = getMotivosAnul;
    service.getSituaPolizas = getSituaPolizas;
    service.getProgramas = getProgramas;
    service.getProgramasProveedor = getProgramasProveedor;
    service.getMedioPago = getMedioPago;
    service.getTiposRecibo = getTiposRecibo;
    service.getSituaRecibo = getSituaRecibo;
    service.getEstadosSiniestro = getEstadosSiniestro;
    service.getNacialidades = getNacionalidades;
    service.getMonedas = getMonedas;
    service.getLocalidades = getLocalidades;
    service.getRamoCompania = getRamoCompania;
    service.getCompRamoProd = getCompRamoProd;
    service.getGarantias = getGarantias;
    service.getCiasRamo = getCiasRamo;
    service.getProductosByAseguradora = getProductosByAseguradora;
    service.getCiasAntecedentes = getCiasAntecedentes;
    service.getFields = getFields;
    service.getNoField = getNoField;
    service.getMotivosConsultas = getMotivosConsultas;
    service.saveSituacionCliente = saveSituacionCliente;
    service.saveMotivosAnulacion = saveMotivosAnulacion;
    service.saveTiposCliente = saveTiposCliente;
    service.saveTiposPrograma = saveTiposPrograma;
    service.saveMailProgramaProveedor = saveMailProgramaProveedor;
    service.saveSituacionesPoliza = saveSituacionesPoliza;
    service.saveSituacionesRecibo = saveSituacionesRecibo;
    service.saveEstadosSiniestro = saveEstadosSiniestro;
    service.saveTiposDocumento = saveTiposDocumento;
    service.saveTiposSexo = saveTiposSexo;
    service.saveTiposVia = saveTiposVia;
    service.saveTipos = saveTipos;
    service.saveTiposMedioPago = saveTiposMedioPago;
    service.saveFormasPago = saveFormasPago;
    service.saveListRamos = saveListRamos;
    service.saveListProductos = saveListProductos;
    service.filtroReport = filtroReport;
    service.getPolArchives = getPolArchives;
    service.isPrepoliza = isPrepoliza;
    service.isConsentimiento = isConsentimiento;
    service.getTipoUnidad = getTipoUnidad;
    service.getTipoComision = getTipoComision;
    service.getAmmount = getAmmount;
    service.getQuarters = getQuarters;
    service.isFirmaDigital = isFirmaDigital;
    service.altaMediador = altaMediador;

    return service;

    function filtroReport(tipo) {
      var url = BASE_CON + "/reports/filtroReport/" + tipo;
      return extraerTipos(url, token, "GET");
    }
    function getCompania(json) {
      var url = BASE_CON + "/tipos/getListCompanias";
      return extraerTipos3(json, url, token);
    }
    function getComisionista() {
      var url = BASE_CON + "/tipos/getListComisionista";
      return extraerTipos(url, token, "POST");
    }
    function getProducto(json) {
      var url = BASE_CON + "/tipos/getProducto";
      return extraerTipos3(json, url, token);
    }
    function getRamos(json) {
      var url = BASE_CON + "/tipos/getListRamo";
      return extraerTipos3(json, url, token);
    }
    function getTipos(json) {
      var url = BASE_CON + "/tipos/getTipos";
      return extraerTipos3(json, url, token);
    }
    function getCodigos() {
      var url = BASE_CON + "/tipos/getCodigos";
      return extraerTipos(url, token, "POST");
    }
    function getProvincias() {
      var url = BASE_CON + "/tipos/getProvincias";
      return extraerTipos(url, token, "POST");
    }
    function getCampaign(json) {
      var url = BASE_CON + "/tipos/getCampaign";
      return extraerTipos3(json, url, token);
    }
    function getSituaCliente(json) {
      var url = BASE_CON + "/tipos/getSituacionCliente";
      return extraerTipos3(json, url, token);
    }
    function getSexo(json) {
      var url = BASE_CON + "/tipos/getTiposSexo";
      return extraerTipos3(json, url, token);
    }
    function getTipoCliente(json) {
      var url = BASE_CON + "/tipos/getTiposCliente";
      return extraerTipos3(json, url, token);
    }
    function getTipoDocumento(json) {
      var url = BASE_CON + "/tipos/getTipoDocumento";
      return extraerTipos3(json, url, token);
    }
    function getTipoDocumentoByProducto(producto) {
      var url = BASE_CON + "/external/getTiposDocumento/" + producto;
      return extraerTipos(url, token, "GET");
    }
    function getVia(json) {
      var url = BASE_CON + "/tipos/getTipoVia";
      return extraerTipos3(json, url, token);
    }
    function getSituaSolicitud() {
      var url = BASE_CON + "/tipos/getSituacionSolicitud";
      return extraerTipos(url, token, "POST");
    }
    function getFormasPago(json) {
      var url = BASE_CON + "/tipos/getFormasPago";
      return extraerTipos3(json, url, token);
    }
    function getMotivosAnul(json) {
      var url = BASE_CON + "/tipos/getCausasAnulacion";
      return extraerTipos3(json, url, token);
    }
    function getSituaPolizas(json) {
      var url = BASE_CON + "/tipos/getSituacionPoliza";
      return extraerTipos3(json, url, token);
    }
    function getProgramas(json) {
      var url = BASE_CON + "/tipos/getTiposPrograma";
      return extraerTipos2(json, url, token, "POST");
    }
    function getProgramasProveedor(json) {
      var url = BASE_CON + "/tipos/getTiposProgramaProveedor";
      return extraerTipos2(json, url, token, "POST");
    }
    function getMedioPago(json) {
      var url = BASE_CON + "/tipos/getTiposMedioPago";
      return extraerTipos3(json, url, token);
    }
    function getTiposRecibo() {
      var url = BASE_CON + "/tipos/getTiposRecibo";
      return extraerTipos(url, token, "POST");
    }
    function getSituaRecibo(json) {
      var url = BASE_CON + "/tipos/getSituacionesRecibo";
      return extraerTipos3(json, url, token);
    }
    function getEstadosSiniestro(json) {
      var url = BASE_CON + "/tipos/getEstadosSinietro";
      return extraerTipos3(json, url, token);
    }
    function getNacionalidades() {
      var url = BASE_CON + "/tipos/getNacionalidad";
      return extraerTipos(url, token, "POST");
    }
    function getMonedas() {
      var url = BASE_CON + "/tipos/getListMonedasRecibo";
      return extraerTipos(url, token, "POST");
    }
    function getLocalidades(get) {
      var url = BASE_CON + "/recursos/localidades/" + get;
      return extraerTipos(url, token, "GET");
    }
    function getRamoCompania(json) {
      var url = BASE_CON + "/ciaRamoProducto/getRamoCompania";
      return extraerTipos3(json, url, token);
    }
    function getCompRamoProd(json) {
      var url = BASE_CON + "/ciaRamoProducto/getCompRamoProd";
      return extraerTipos3(json, url, token);
    }
    function getGarantias(json) {
      var url = BASE_CON + "/garantias/getGarantiasByProducto";
      return extraerTipos3(json, url, token);
    }
    function getCiasRamo(json) {
      var url = BASE_CON + "/tipos/getCiasRamo";
      return extraerTipos3(json, url, token);
    }
    function getProductosByAseguradora(json) {
      var url = BASE_CON + "/aseguradoras/getProductosByAseguradora";
      return extraerTipos3(json, url, token);
    }
    function getCiasAntecedentes(json) {
      var url = BASE_CON + "/recursos/motor/fields/CIA";
      return extraerTipos2(json, url, token, "GET");
    }
    function getFields(json) {
      var url = BASE_CON + "/external/getFields/bancos";
      return extraerTipos2(json, url, token, "GET");
    }
    function getNoField(json) {
      var url = BASE_CON + "/external/getFields/" + json;
      return extraerTipos2(json, url, token, "GET");
    }
    function getPolArchives(json) {
      var url = BASE_CON + "/tipos/getArchivosPolizas";
      return extraerTipos3(json, url, token);
    }
    function getMotivosConsultas(json) {
      var url = BASE_CON + "/tipos/getMotivosConsultas/" + json;
      return extraerTipos(url, token, "GET");
    }
    function saveSituacionCliente(json) {
      var url = BASE_CON + "/tipos/saveSituacionCliente";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveMotivosAnulacion(json) {
      var url = BASE_CON + "/tipos/saveMotivosAnulacion";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposCliente(json) {
      var url = BASE_CON + "/tipos/saveTiposCliente";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposPrograma(json) {
      var url = BASE_CON + "/tipos/saveTiposPrograma";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveMailProgramaProveedor(json) {
      var url = BASE_CON + "/tipos/saveMailProgramaProveedor";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveSituacionesPoliza(json) {
      var url = BASE_CON + "/tipos/saveSituacionesPoliza";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveSituacionesRecibo(json) {
      var url = BASE_CON + "/tipos/saveSituacionesRecibo";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveEstadosSiniestro(json) {
      var url = BASE_CON + "/tipos/saveEstadosSiniestro";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposDocumento(json) {
      var url = BASE_CON + "/tipos/saveTiposDocumento";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposSexo(json) {
      var url = BASE_CON + "/tipos/saveTiposSexo";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposVia(json) {
      var url = BASE_CON + "/tipos/saveTiposVia";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTipos(json) {
      var url = BASE_CON + "/tipos/saveTipos";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveTiposMedioPago(json) {
      var url = BASE_CON + "/tipos/saveTiposMedioPago";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveFormasPago(json) {
      var url = BASE_CON + "/tipos/saveFormasPago";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveListRamos(json) {
      var url = BASE_CON + "/ciaRamoProducto/saveListRamos";
      return extraerTipos2(json, url, token, "PUT");
    }
    function saveListProductos(json) {
      var url = BASE_CON + "/ciaRamoProducto/saveListProductos";
      return extraerTipos2(json, url, token, "PUT");
    }
    function altaMediador(json) {
      var url = BASE_CON + "/ciaRamoProducto/altaMediador";
      return extraerTipos2(json, url, token, "PUT");
    }
    function getTipoUnidad() {
      var url = BASE_CON + "/tipos/TYPE_UNIT";
      return extraerTipos(url, token, "GET");
    }
    function getTipoComision() {
      var url = BASE_CON + "/tipos/TYPE_COMI";
      return extraerTipos(url, token, "GET");
    }

    function isPrepoliza(producto) {
      var url = BASE_CON + "/tipos/isPrepoliza";
      if (producto != null) {
        url += "/" + producto;
      }
      return extraerTipos(url, token, "GET");
    }

    function isFirmaDigital(producto) {
      var url = BASE_CON + "/tipos/isFirmaDigital";
      if (producto != null) {
        url += "/" + producto;
      }
      return extraerTipos(url, token, "GET");
    }

    function isConsentimiento(id) {
      var url = BASE_CON + "/tipos/isConsentimiento/" + id;
      return extraerTipos(url, token, "GET");
    }
    function getAmmount(id) {
      var url = BASE_CON + "/tipos/getAmmount/" + id;
      return extraerTipos(url, token, "GET");
    }

    function getQuarters(id) {
      var url = `${BASE_CON}/tipos/getTrimestreCiber/${id}`;
      return extraerTipos(url, token, "GET");
    }

    function extraerTipos(url, token, method) {
      coToken = _.get($rootScope, "globals.currentUser.coToken");
      token = _.get($rootScope, "globals.currentUser.token");
      token = token || "";
      return $http({
        method: method,
        url: url,
        data: {},
        headers: {
          Authorization: coToken + " " + token,
          "Content-Type": "application/json",
          lang: $window.sessionStorage.lang,
        }, //Permiso para la petición.
      });
    }

    function extraerTipos2(json, url, token, method) {
      coToken = _.get($rootScope, "globals.currentUser.coToken");
      token = _.get($rootScope, "globals.currentUser.token");
      token = token || "";

      if (
        json != null &&
        _.get($rootScope, "globals.currentUser.idRol") != null &&
        typeof json == "object"
      ) {
        json.ID_ROL = _.get($rootScope, "globals.currentUser.idRol");
      }

      return $http({
        method: method,
        url: url,
        data: json == null ? {} : json,
        headers: {
          Authorization: coToken + " " + token,
          "Content-Type": "application/json",
          lang: $window.sessionStorage.lang,
        }, //Permiso para la petición.
      });
    }

    function extraerTipos3(json, url, token) {
      coToken = _.get($rootScope, "globals.currentUser.coToken");
      token = _.get($rootScope, "globals.currentUser.token");
      token = token || "";

      if (
        json != null &&
        _.get($rootScope, "globals.currentUser.idRol") != null &&
        typeof json == "object"
      ) {
        json.ID_ROL = _.get($rootScope, "globals.currentUser.idRol");
      }

      return $http({
        method: "POST",
        url: url,
        data: json == null ? {} : json,
        headers: {
          Authorization: coToken + " " + token,
          "Content-Type": "application/json",
          lang: $window.sessionStorage.lang,
        }, //Permiso para la petición.
      });
    }
  }
})();
