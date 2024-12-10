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
import { Inject, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static"; // Asegúrate de que estás importando esto
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
export function HttpLoaderFactory(http) {
    return new TranslateHttpLoader(http, "./src/app-localization/locale-", ".json");
}
let AppModule = class AppModule {
    constructor(upgrade) {
        this.upgrade = upgrade;
        this.dowgradeServices();
    }
    dowgradeServices() { }
    ngDoBootstrap() {
        // Asegúrate de que 'myApp' es el nombre del módulo AngularJS
        this.upgrade.bootstrap(document.body, ["App"]);
    }
};
AppModule = __decorate([
    NgModule({
        imports: [
            BrowserModule,
            UpgradeModule,
            BrowserAnimationsModule,
            HttpClientModule,
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient],
                },
            }),
        ],
        declarations: [],
        providers: [],
    }),
    __param(0, Inject(UpgradeModule)),
    __metadata("design:paramtypes", [UpgradeModule])
], AppModule);
export { AppModule };
