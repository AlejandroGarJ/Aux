"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["angular2_src_detalle_detalle_componentes_detalle_mediador_detalle_mediador_component_ts"],{

/***/ "./angular2/sharedServices/tiposService.ts":
/*!*************************************************!*\
  !*** ./angular2/sharedServices/tiposService.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TiposService: () => (/* binding */ TiposService)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2022/http.mjs");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2022/core.mjs");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


let TiposService = class TiposService {
    constructor($injector, http) {
        this.$injector = $injector;
        this.http = http;
        this.TOKEN = null;
        this.URL = this.$injector.get("BASE_CON");
        const perfilString = window.sessionStorage.getItem("perfil");
        if (perfilString) {
            this.TOKEN = JSON.parse(perfilString).token;
        }
        this.AUTH_HEADER = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpHeaders().set("Authorization", `Token ${this.TOKEN}`);
    }
    getProvincias() {
        return this.http.post(this.URL + "/tipos/getProvincias", null, {
            headers: this.AUTH_HEADER,
            observe: "response",
        });
    }
    getProgramas(payload) {
        return this.http.post(this.URL + "/tipos/getTiposPrograma", payload, {
            headers: this.AUTH_HEADER,
            observe: "response",
        });
    }
    getMediosPago(payload) {
        return this.http.post(this.URL + "/tipos/getTiposMedioPago", payload, {
            headers: this.AUTH_HEADER,
            observe: "response",
        });
    }
    getTipos(payload) {
        return this.http.post(this.URL + "/tipos/getTipos", payload, {
            headers: this.AUTH_HEADER,
            observe: "response",
        });
    }
    altaMediador(payload) {
        return this.http.put(this.URL + "/ciaRamoProducto/altaMediador", payload, {
            headers: this.AUTH_HEADER,
            observe: "response",
        });
    }
};
TiposService = __decorate([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injectable)({
        providedIn: "root", // El servicio estará disponible de manera global
    }),
    __param(0, (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.Inject)("$injector")),
    __param(1, (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.Inject)(_angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpClient)),
    __metadata("design:paramtypes", [Object, _angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpClient])
], TiposService);



/***/ }),

/***/ "./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component.ts":
/*!*************************************************************************************************!*\
  !*** ./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component.ts ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DetalleMediadorComponent: () => (/* binding */ DetalleMediadorComponent)
/* harmony export */ });
/* harmony import */ var _angular_compiler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/compiler */ "./node_modules/@angular/compiler/fesm2022/compiler.mjs");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2022/core.mjs");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/fesm2022/button.mjs");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/fesm2022/core.mjs");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/fesm2022/input.mjs");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/select */ "./node_modules/@angular/material/fesm2022/select.mjs");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/fesm2022/icon.mjs");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/fesm2022/form-field.mjs");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/fesm2022/card.mjs");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm2022/forms.mjs");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/tooltip */ "./node_modules/@angular/material/fesm2022/tooltip.mjs");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm2022/common.mjs");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2022/http.mjs");
/* harmony import */ var _sharedServices_tiposService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../sharedServices/tiposService */ "./angular2/sharedServices/tiposService.ts");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/fesm2022/ngx-translate-core.mjs");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/fesm2020/angular-flex-layout.mjs");
/* harmony import */ var _validators_productoRepeats_validator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../validators/productoRepeats.validator */ "./angular2/src/validators/productoRepeats.validator.ts");
/* harmony import */ var _shared_enums_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/enums/constants */ "./angular2/src/shared/enums/constants.ts");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/fesm2022/dialog.mjs");
/* harmony import */ var _shared_components_dialogComponent_dialog_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/components/dialogComponent/dialog.component */ "./angular2/src/shared/components/dialogComponent/dialog.component.ts");
/* harmony import */ var _shared_enums_dialogTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../shared/enums/dialogTypes */ "./angular2/src/shared/enums/dialogTypes.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};









 // Si usas tarjetas (cards)












let DetalleMediadorComponent = class DetalleMediadorComponent {
    constructor(translate, http, tiposService) {
        this.translate = translate;
        this.http = http;
        this.tiposService = tiposService;
        this.dialog = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_7__.MatDialog);
        this.mediador = null;
        this.provincias = [];
        this.productosDisponibles = [];
        this.tiposDestinatario = [];
        this.tiposContacto = [];
        /* Default language of translate */
        this.translate.setDefaultLang("es");
        /* Inicializar el formulario */
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroup({
            NO_COMPANIA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            NO_COMERCIAL: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            NU_CIF: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            NO_DIRECCION: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.minLength(3),
            ]),
            CO_POSTAL: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.minLength(3),
            ]),
            NO_LOCALIDAD: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.minLength(3),
            ]),
            ID_PROVINCIA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.pattern(/^\d+$/),
            ]),
            NO_EMAIL: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("email@gmail.cpom", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.email,
            ]),
            /* Declarar FormArray para PARTNERS */
            PARTNERS: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormArray([]),
        });
        this.addPartner();
    }
    ngOnInit() {
        this.getProvincias();
        this.getProgramas();
        this.getMediosPago();
        this.getTiposContacto();
        this.getTiposDestinatario();
    }
    openDialog(enterAnimationDuration, exitAnimationDuration, message, type) {
        return this.dialog.open(_shared_components_dialogComponent_dialog_component__WEBPACK_IMPORTED_MODULE_4__.DialogComponent, {
            enterAnimationDuration,
            exitAnimationDuration,
            data: {
                message,
                type,
            },
        });
    }
    onSubmit() {
        if (this.form.valid) {
            this.openDialog("200ms", "200ms", "¿Seguro que quieres guardar el mediador?", _shared_enums_dialogTypes__WEBPACK_IMPORTED_MODULE_5__.DIALOG_TYPES.confirm)
                .afterClosed()
                .subscribe((res) => {
                if (res === "yes") {
                    this.mediador = this.form.value;
                    this.tiposService.altaMediador(this.mediador).subscribe((res) => {
                    });
                }
            });
        }
        else {
            this.form.markAllAsTouched();
            this.openDialog("200ms", "200ms", "Revisa los datos introducidos", _shared_enums_dialogTypes__WEBPACK_IMPORTED_MODULE_5__.DIALOG_TYPES.ok);
        }
    }
    verPagos() {
    }
    /* Acceder al array de partners de el formGroup */
    get PARTNERS() {
        return this.form.get("PARTNERS");
    }
    addPartner() {
        const partnerGroup = new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroup({
            ID_PROGRAMA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                (0,_validators_productoRepeats_validator__WEBPACK_IMPORTED_MODULE_2__.productoRepeats)(this.PARTNERS),
            ]),
            DS_TIPO_POLIZA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            LST_ID_TIPO_MEDIO_PAGO: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            PO_COMISION: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl(12, [
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.min(0),
                _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.max(100),
            ]),
            LISTA_CONTACTOS: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormArray([
                new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroup({
                    ID_TIPOCONTACTO: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
                    NO_PERSONA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
                    NO_EMAIL: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [
                        _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.email,
                        _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required,
                    ]),
                    IN_TIPO_DESTINATARIO: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
                }),
            ]),
        });
        /* Para que cuando ID_PROGRAMA sea 2 tenga los campos de harmony */
        this.PARTNERS.push(partnerGroup);
        const idPrograma = partnerGroup.get("ID_PROGRAMA");
        if (idPrograma) {
            idPrograma.valueChanges.subscribe((newVal) => {
                if (newVal) {
                    if (newVal === 2) {
                        partnerGroup.addControl("HARMONY_CONF", new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroup({
                            brokerName: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
                            brokerInfo: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
                        }));
                    }
                    else {
                        if (partnerGroup.get("HARMONY_CONF")) {
                            partnerGroup.removeControl("HARMONY_CONF");
                        }
                    }
                }
            });
        }
    }
    deletePrograma(indexPrograma) {
        this.openDialog("200ms", "200ms", "¿Seguro que quieres eliminar el programa?", _shared_enums_dialogTypes__WEBPACK_IMPORTED_MODULE_5__.DIALOG_TYPES.confirm)
            .afterClosed()
            .subscribe((res) => {
            if (res === "yes") {
                this.PARTNERS.removeAt(indexPrograma);
            }
        });
    }
    addContacto(index) {
        this.PARTNERS.controls[index]["controls"].LISTA_CONTACTOS.push(new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroup({
            ID_TIPOCONTACTO: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            NO_PERSONA: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            NO_EMAIL: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.email, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
            IN_TIPO_DESTINATARIO: new _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControl("", [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]),
        }));
    }
    deleteContacto(indexPrograma, indexContacto) {
        this.openDialog("200ms", "200ms", "¿Seguro que quieres eliminar el contacto?", _shared_enums_dialogTypes__WEBPACK_IMPORTED_MODULE_5__.DIALOG_TYPES.confirm)
            .afterClosed()
            .subscribe((res) => {
            if (res === "yes") {
                this.PARTNERS.controls[indexPrograma]["controls"]["LISTA_CONTACTOS"].removeAt(indexContacto);
            }
        });
    }
    ver() {
        this.mediador = this.form.value;
    }
    getProvincias() {
        this.tiposService.getProvincias().subscribe((res) => {
            if (res.status === 200) {
                this.provincias = res.body.TIPOS.TIPO;
            }
        });
    }
    getProgramas() {
        this.tiposService
            .getProgramas({ IS_CONDICIONADO: true })
            .subscribe((res) => {
            if (res.status === 200) {
                this.productosDisponibles = res.body.TIPOS.TIPO;
            }
        });
    }
    getMediosPago() {
        this.tiposService.getMediosPago({}).subscribe((res) => {
            if (res.status === 200) {
                this.mediosPago = res.body.TIPOS.TIPO;
            }
        });
    }
    getTiposContacto() {
        this.tiposService
            .getTipos({ ID_CODIGO: _shared_enums_constants__WEBPACK_IMPORTED_MODULE_3__.CONSTANTS.TIPOS_CONTACTO })
            .subscribe((res) => {
            if (res.status === 200) {
                this.tiposContacto = res.body.TIPOS.TIPO;
            }
        });
    }
    getTiposDestinatario() {
        this.tiposService
            .getTipos({ ID_CODIGO: _shared_enums_constants__WEBPACK_IMPORTED_MODULE_3__.CONSTANTS.IN_TIPO_DESTINATARIO })
            .subscribe((res) => {
            if (res.status === 200) {
                this.tiposDestinatario = res.body.TIPOS.TIPO;
            }
        });
    }
};
DetalleMediadorComponent = __decorate([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.Component)({
        selector: "detalle-mediador",
        templateUrl: 'angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component.html',
        styleUrl: 'angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component.css',
        standalone: true,
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_9__.CommonModule,
            _angular_material_button__WEBPACK_IMPORTED_MODULE_10__.MatButtonModule,
            _angular_material_card__WEBPACK_IMPORTED_MODULE_11__.MatCardModule,
            _angular_material_core__WEBPACK_IMPORTED_MODULE_12__.NativeDateModule,
            _angular_material_input__WEBPACK_IMPORTED_MODULE_13__.MatInputModule,
            _angular_material_select__WEBPACK_IMPORTED_MODULE_14__.MatSelectModule,
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__.MatIconModule,
            _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__.MatFormFieldModule,
            _angular_material_core__WEBPACK_IMPORTED_MODULE_12__.MatOptionModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormsModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_8__.ReactiveFormsModule,
            _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_17__.MatTooltipModule,
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_18__.TranslateModule,
            _angular_flex_layout__WEBPACK_IMPORTED_MODULE_19__.FlexLayoutModule,
            _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__.MatError,
            _angular_material_button__WEBPACK_IMPORTED_MODULE_10__.MatButtonModule,
            _shared_components_dialogComponent_dialog_component__WEBPACK_IMPORTED_MODULE_4__.DialogComponent,
        ],
        providers: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_18__.TranslateService, _angular_common_http__WEBPACK_IMPORTED_MODULE_20__.HttpClient],
    }),
    __param(0, (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.Inject)(_ngx_translate_core__WEBPACK_IMPORTED_MODULE_18__.TranslateService)),
    __param(1, (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.Inject)(_angular_common_http__WEBPACK_IMPORTED_MODULE_20__.HttpClient)),
    __param(2, (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.Inject)(_sharedServices_tiposService__WEBPACK_IMPORTED_MODULE_1__.TiposService)),
    __metadata("design:paramtypes", [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_18__.TranslateService,
        _angular_common_http__WEBPACK_IMPORTED_MODULE_20__.HttpClient,
        _sharedServices_tiposService__WEBPACK_IMPORTED_MODULE_1__.TiposService])
], DetalleMediadorComponent);



/***/ }),

/***/ "./angular2/src/shared/components/dialogComponent/dialog.component.ts":
/*!****************************************************************************!*\
  !*** ./angular2/src/shared/components/dialogComponent/dialog.component.ts ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DialogComponent: () => (/* binding */ DialogComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2022/core.mjs");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/fesm2022/button.mjs");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/fesm2022/dialog.mjs");
/* harmony import */ var _enums_dialogTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../enums/dialogTypes */ "./angular2/src/shared/enums/dialogTypes.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};




let DialogComponent = class DialogComponent {
    constructor(data) {
        this.data = data;
        this.buttonType = _enums_dialogTypes__WEBPACK_IMPORTED_MODULE_0__.DIALOG_TYPES;
    }
};
DialogComponent = __decorate([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.Component)({
        selector: "app-dialog",
        templateUrl: 'angular2/src/shared/components/dialogComponent/dialog.component.html',
        styleUrl: 'angular2/src/shared/components/dialogComponent/dialog.component.css',
        standalone: true,
        imports: [
            _angular_material_button__WEBPACK_IMPORTED_MODULE_2__.MatButtonModule,
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__.MatDialogActions,
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__.MatDialogClose,
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__.MatDialogTitle,
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__.MatDialogContent,
        ],
    }),
    __param(0, (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.Inject)(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__.MAT_DIALOG_DATA)),
    __metadata("design:paramtypes", [Object])
], DialogComponent);



/***/ }),

/***/ "./angular2/src/shared/enums/constants.ts":
/*!************************************************!*\
  !*** ./angular2/src/shared/enums/constants.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONSTANTS: () => (/* binding */ CONSTANTS)
/* harmony export */ });
var CONSTANTS;
(function (CONSTANTS) {
    CONSTANTS[CONSTANTS["TIPOS_CONTACTO"] = 14] = "TIPOS_CONTACTO";
    CONSTANTS[CONSTANTS["IN_TIPO_DESTINATARIO"] = 576] = "IN_TIPO_DESTINATARIO";
})(CONSTANTS || (CONSTANTS = {}));


/***/ }),

/***/ "./angular2/src/shared/enums/dialogTypes.ts":
/*!**************************************************!*\
  !*** ./angular2/src/shared/enums/dialogTypes.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DIALOG_TYPES: () => (/* binding */ DIALOG_TYPES)
/* harmony export */ });
const DIALOG_TYPES = {
    confirm: "confirm",
    ok: "ok",
};


/***/ }),

/***/ "./angular2/src/validators/productoRepeats.validator.ts":
/*!**************************************************************!*\
  !*** ./angular2/src/validators/productoRepeats.validator.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   productoRepeats: () => (/* binding */ productoRepeats)
/* harmony export */ });
function productoRepeats(PARTNERS) {
    return (control) => {
        const value = control.value.ID_PROGRAMA;
        const isDuplicate = PARTNERS.controls.some((group) => {
            var _a;
            return (group !== control.parent &&
                ((_a = group.get("ID_PROGRAMA")) === null || _a === void 0 ? void 0 : _a.value.ID_PROGRAMA) === value);
        });
        if (isDuplicate) {
            return { duplicateIDPrograma: { value } };
        }
        return null;
    };
}


/***/ })

}]);