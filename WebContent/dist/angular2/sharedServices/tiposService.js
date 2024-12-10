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
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
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
        this.AUTH_HEADER = new HttpHeaders().set("Authorization", `Token ${this.TOKEN}`);
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
};
TiposService = __decorate([
    Injectable({
        providedIn: "root", // El servicio estará disponible de manera global
    }),
    __param(0, Inject("$injector")),
    __param(1, Inject(HttpClient)),
    __metadata("design:paramtypes", [Object, HttpClient])
], TiposService);
export { TiposService };
