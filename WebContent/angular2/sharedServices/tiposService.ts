import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { downgradeInjectable } from "@angular/upgrade/static";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root", // El servicio estará disponible de manera global
})
export class TiposService {
  readonly URL: string;
  readonly TOKEN: string | null = null;
  readonly AUTH_HEADER: HttpHeaders;
  constructor(
    @Inject("$injector") private $injector: any,
    @Inject(HttpClient) private http: HttpClient
  ) {
    this.URL = this.$injector.get("BASE_CON");
    const perfilString = window.sessionStorage.getItem("perfil");
    if (perfilString) {
      this.TOKEN = JSON.parse(perfilString).token;
    }
    this.AUTH_HEADER = new HttpHeaders().set(
      "Authorization",
      `Token ${this.TOKEN}`
    );
  }

  getProvincias(): Observable<any> {
    return this.http.post(this.URL + "/tipos/getProvincias", null, {
      headers: this.AUTH_HEADER,
      observe: "response",
    });
  }

  getProgramas(payload: any): Observable<any> {
    return this.http.post(this.URL + "/tipos/getTiposPrograma", payload, {
      headers: this.AUTH_HEADER,
      observe: "response",
    });
  }

  getMediosPago(payload: any): Observable<any> {
    return this.http.post(this.URL + "/tipos/getTiposMedioPago", payload, {
      headers: this.AUTH_HEADER,
      observe: "response",
    });
  }

  getTipos(payload: any): Observable<any> {
    return this.http.post(this.URL + "/tipos/getTipos", payload, {
      headers: this.AUTH_HEADER,
      observe: "response",
    });
  }

  altaMediador(payload: any): Observable<any> {
    return this.http.put(this.URL + "/ciaRamoProducto/altaMediador", payload, {
      headers: this.AUTH_HEADER,
      observe: "response",
    });
  }
}
