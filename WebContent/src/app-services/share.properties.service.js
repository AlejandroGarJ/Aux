(function (ng) {

    'use strict';
    ng.module('App')
	.factory('sharePropertiesService', function() {
		var savedData = {}
		savedData.properties = {}
		savedData.properties.db = {}


		savedData.set = set;
		savedData.get = get;
		savedData.remove = remove;

		savedData.properties.db.tipoDoc= [
			{"id": 3, "key": "cif", "text": "CIF"},
            {"id": 2, "key": "nie", "text": "NIE"},
            {"id": 1, "key": "nif", "text": "NIF"},
            {"id": 4, "key": "otros", "text": "Otros(Internacional)"},
            {"id": 5, "key": "pasaporte", "text": "Pasaporte"}
		];
		savedData.properties.db.aseguradoras = [
            {"id": 1, "key": "adeslas", "text": "Adeslas"},
            {"id": 2, "key": "allianz", "text": "Allianz"},
            {"id": 3, "key": "caser", "text": "Caser"},
            {"id": 4, "key": "legalitas", "text": "Legálitas"}
        ];

        savedData.properties.db.ramos = [
            {"id": 60, "key": "accidentes", "text": "Accidentes"},
            {"id": 170, "key": "asistencia_viaje", "text": "Asistencia en Viaje"},
            {"id": 10, "key": "automoviles", "text": "Automóviles"},
            {"id": 321, "key": "caucion", "text": "Caución"},
            {"id": 190, "key": "contingencias", "text": "Contingencias"},
            {"id": 300, "key": "credito", "text": "Crédito"},
            {"id": 100, "key": "danios_materiales", "text": "Daños Materiales"},
            {"id": 230, "key": "decesos", "text": "Decesos"},
            {"id": 120, "key": "diversos", "text": "Diversos"},
            {"id": 102, "key": "equipos_electronicos", "text": "Equipos Electrónicos"},
            {"id": 70, "key": "incendios", "text": "Incendios"},
            {"id": 441, "key": "maquinaria", "text": "Maquinaria"},
            {"id": 101, "key": "montaje", "text": "Montaje"},
            {"id": 11, "key": "moto", "text": "Moto"},
            {"id": 20, "key": "multirriesgos", "text": "Multirriesgos"},
            {"id": 110, "key": "perdida_beneficios", "text": "Pérdida de Beneficios"},
            {"id": 103, "key": "perdida_pecuniarias", "text": "Pérdida Pecuniaria"},
            {"id": 180, "key": "proteccion_juridica", "text": "Protección Jurídica"},
            {"id": 30, "key": "responsabilidad_civil", "text": "Responsabilidad Civil"},
            {"id": 301, "key": "responsabilidad_medioambiental", "text": "Responsabilidad Medioambiental"},
            {"id": 80, "key": "robos", "text": "Robos"},
            {"id": 50, "key": "salud", "text": "Salud"},
            {"id": 220, "key": "salud_dental", "text": "Salud Dental"},
            {"id": 40, "key": "transportes", "text": "Transportes"},
            {"id": 200, "key": "vida", "text": "Vida"}
        ];
        
        savedData.properties.db.sexo = [
        	{"id": 1, "key": "sexo", "text": "Hombre"},
            {"id": 2, "key": "sexo", "text": "Mujer"},
        ]
        
        savedData.properties.db.estadoCivil = [
            {"id": 183, "key": "casado", "text": "Casado/a"},
            {"id": 2, "key": "divorciado", "text": "Divorciado/a"},
            {"id": 3, "key": "pareja", "text": "Pareja de hecho"},
            {"id": 4, "key": "separado", "text": "Separado/a"},
            {"id": 5, "key": "soltero", "text": "Soltero/a"},
            {"id": 6, "key": "viudo", "text": "Viudo/a"}
        ]
        
        savedData.properties.db.nacionalidad = [
        	{"id": "ESP", "key": "nacionalidad", "text": "España"},
            {"id": "ALE", "key": "nacionalidad", "text": "Alemania"},
            {"id": "IND", "key": "nacionalidad", "text": "Indía"},
            {"id": "IRA", "key": "nacionalidad", "text": "Irán"},
            {"id": "EEUU", "key": "nacionalidad", "text": "EEUU"}
        ]


        savedData.properties.db.productos = [
            {"id": 1, "key": "adeslas", "text": "Auto"},
            {"id": 2, "key": "allianz", "text": "Allianz Auto Flota"},
            {"id": 3, "key": "caser", "text": "Auto Plus"},
            {"id": 4, "key": "legalitas", "text": "Vehículo Comercial"}
        ];

        savedData.properties.db.periodicidad = [
            {"id": 1, "key": "anual", "text": "Anual"},
            {"id": 2, "key": "bimensual", "text": "Bimensual"},
            {"id": 3, "key": "cuatrimestral", "text": "Cuatrimestral"},
            {"id": 4, "key": "mensual", "text": "Mensual"},
            {"id": 5, "key": "no_informada", "text": "No Informada"},
            {"id": 6, "key": "semestral", "text": "Semestral"},
            {"id": 7, "key": "trimestral", "text": "Trimestral"},
            {"id": 8, "key": "unica", "text": "Única"}
        ];

        savedData.properties.db.via_de_pago = [
            {"id": 1, "key": "aseguradora", "text": "Aseguradora"},
            {"id": 2, "key": "cobro_broker", "text": "Cobro Broker"},
            {"id": 3, "key": "pleyade", "text": "Pleyade"},
            {"id": 4, "key": "pleyade_banco", "text": "Pleyade Banco"},
            {"id": 5, "key": "pleyade_broker", "text": "Pleyade Broker"},
            {"id": 6, "key": "pleyade_nomina", "text": "Pleyade Nomina"},
            {"id": 7, "key": "servicios_broker", "text": "Servicios Broker"}
        ];   
        
        savedData.properties.db.laboral=[
        	{"id": 1, "key": "activo", "text": "Activo"},
        	{"id": 2, "key": "activo_alta_direccion", "text": "Activo alta direccion"},
        	{"id": 3, "key": "activo_nucleo_corporativo", "text": "Activo nucleo corporativo"},
        	{"id": 4, "key": "ex_activo", "text": "Ex-activo"},
        	{"id": 5, "key": "familiar", "text": "Familiar"},
        	{"id": 0, "key": "sin_notificar", "text": "Sin notificar"},
        ];
        
        savedData.properties.db.colectivo = [
        	{"id": 1, "key": "particulares", "text": "Particulares"},
        	{"id": 9, "key": "empleados", "text": "Empleados"},
            {"id": 10, "key": "accionistas", "text": "Accionistas"},
            {"id": 11, "key": "medicos_de_cataluña", "text": "Médicos de Cataluña"},
            {"id": 13, "key": "affinity_general", "text": "Affinity general"},
            {"id": 14, "key": "gestor_seguros", "text": "Gestor seguros"},
            {"id": 15, "key": "drivies", "text": "Drivies"},
            {"id": 16, "key": "uni_rasa", "text": "Uni Rasa"},
            {"id": 17, "key": "esprosys", "text": "Esprosys"},
            {"id": 18, "key": "Alkora", "text": "Alkora"},
            {"id": 44, "key": "bansabadell_renting", "text": "Bansabadell Renting"},
            {"id": 76, "key": "fuden/satse", "text": "Fuden/Satse"},
            {"id": 11, "key": "funcionarios", "text": "Funcionarios"},
            {"id": 2, "key": "seguros_colectivos", "text": "Seguros colectivos"},
            {"id": 3, "key": "empresa", "text": "Empresas"},
            {"id": 4, "key": "salud_individual", "text": "Salud individual"},
            {"id": 5, "key": "salud_colectivo", "text": "Salud colectivo"},
            {"id": 6, "key": "internacional", "text": "Internacional"},
            {"id": 7, "key": "proveedores", "text": "Proveedores"},
            {"id": 8, "key": "movil", "text": "Móvil"},
            {"id": 79, "key": "aux_enfermeria", "text": "Aux enfermería (SAE)"},
            {"id": 83, "key": "resto_codem/satse", "text": "Resto de CODEM/SATSE (Antiguo ATS)"},
            {"id": 24, "key": "segurmec", "text": "Segurmec"},
            {"id": 84, "key": "intermediarios2000", "text": "Intermediarios2000"}
        ];
        
        savedData.properties.db.campanas = [
        	{"id": 1, "key": "maxbonificacion", "text": "Máxima bonificación"},
        	{"id": 2, "key": "campaign_si2", "text": "CAMPAIGN_SORTEO_IPADMINI_2013"},
        	{"id": 3, "key": "campaign_adw", "text": "CAMPAIGN_ADWORKS"},
        	{"id": 4, "key": "campaign_tuseguro", "text": "CAMPAIGN_TUSEGURO"},
        	{"id": 5, "key": "campaign_hd", "text": "CAMPAIGN_HOGAR_DEFAULT"},
        	{"id": 6, "key": "campaign_vc", "text": "CAMPAIGN_VIDA_CRUZADA"},
        	{"id": 7, "key": "campana_blackfriday", "text": "Campaña de Black Friday"},
        	{"id": 8, "key": "campaign_bf", "text": "CAMPAIGN_BLACK_FRIDAY"},
        	{"id": 9, "key": "prueba_camapana", "text": "Prueba de campaña"}
        ]
        
        savedData.properties.db.canal = [
        	{"id": 1, "key": "affinity", "text": "Affinity"},
        	{"id": 2, "key": "drivies", "text": "Drivies"},
        	{"id": 3, "key": "gestor_seguros", "text": "Gestor seguros"},
        	{"id": 4, "key": "intermediacion", "text": "Intermediación"},
        	{"id": 5, "key": "portal_cliente", "text": "Portal del cliente"},
        	{"id": 6, "key": "proveedores", "text": "Proveedores"},
        	{"id": 7, "key": "tarificadorweb", "text": "TarificadorWEB"}
        ]
        
		 function set(key,value) {
		   savedData.properties[key] = value;
		 }

		 function get(key) {
		  return  savedData.properties[key];
		 }

		 function remove(key) {
		  return  delete savedData.properties[key];
		 }


		 return  savedData;


	})

})(angular);