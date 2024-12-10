var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import "@angular/compiler";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { NativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatError, MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card"; // Si usas tarjetas (cards)
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { TiposService } from "../../../../sharedServices/tiposService";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { productoRepeats } from "angular2/src/validators/productoRepeats.validator";
let DetalleMediadorComponent = class DetalleMediadorComponent {
    constructor(translate, http, tiposService) {
        this.translate = translate;
        this.http = http;
        this.tiposService = tiposService;
        this.mediador = null;
        this.provincias = [];
        this.productosDisponibles = [];
        /* Default language of translate */
        this.translate.setDefaultLang("es");
        /* Inicializar el formulario */
        this.form = new FormGroup({
            NO_COMPANIA: new FormControl("", [Validators.required]),
            NO_COMERCIAL: new FormControl("", [Validators.required]),
            NU_CIF: new FormControl("", [Validators.required]),
            NO_DIRECCION: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            CO_POSTAL: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            NO_LOCALIDAD: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            ID_PROVINCIA: new FormControl("", [
                Validators.required,
                Validators.pattern(/^\d+$/),
            ]),
            NO_EMAIL: new FormControl("", [Validators.required, Validators.email]),
            /* Declarar FormArray para PARTNERS */
            PARTNERS: new FormArray([
                new FormGroup({
                    ID_PROGRAMA: new FormControl("", [
                        Validators.required,
                        productoRepeats(this.PARTNERS),
                    ]),
                    email: new FormControl("", [Validators.required, Validators.email]),
                    telefono: new FormControl("", [Validators.required]),
                }),
            ]),
        });
    }
    ngOnInit() {
        this.getProvincias();
        this.getProgramas();
        console.log(this.PARTNERS);
    }
    onSubmit() {
        this.mediador = this.form.value;
    }
    /* Acceder al array de partners de el formGroup */
    get PARTNERS() {
        return this.form.get("PARTNERS");
    }
    addPartner() {
        this.PARTNERS.push(new FormGroup({
            ID_PROGRAMA: new FormControl("", [Validators.required]),
            email: new FormControl("", [Validators.required, Validators.email]),
            telefono: new FormControl("", [Validators.required]),
        }));
    }
    ver() {
        console.log(this.PARTNERS.controls[0]["controls"]["ID_PROGRAMA"]);
    }
    initPartners() { }
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
                console.log(this.productosDisponibles);
            }
        });
    }
};
DetalleMediadorComponent = __decorate([
    Component({
        selector: "detalle-mediador",
        templateUrl: "./detalle.mediador.component.html",
        styleUrl: "./detalle.mediador.component.css",
        standalone: true,
        imports: [
            CommonModule,
            MatButtonModule,
            MatCardModule,
            NativeDateModule,
            MatInputModule,
            MatSelectModule,
            MatIconModule,
            MatFormFieldModule,
            MatOptionModule,
            FormsModule,
            ReactiveFormsModule,
            MatTooltipModule,
            TranslateModule,
            FlexLayoutModule,
            MatError,
        ],
        providers: [TranslateService, HttpClient],
    }),
    __param(0, Inject(TranslateService)),
    __param(1, Inject(HttpClient)),
    __param(2, Inject(TiposService)),
    __metadata("design:paramtypes", [TranslateService,
        HttpClient,
        TiposService])
], DetalleMediadorComponent);
export { DetalleMediadorComponent };
