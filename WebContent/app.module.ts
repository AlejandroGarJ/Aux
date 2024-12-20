import { DoBootstrap, inject, Inject, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { downgradeComponent, UpgradeModule } from "@angular/upgrade/static"; // Asegúrate de que estás importando esto
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppComponent } from "./app.component";
import { DetalleMediadorComponent } from "./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component";
import { Router, RouterModule,  Routes } from "@angular/router";
import { CommonModule } from "@angular/common";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    "./src/app-localization/locale-",
    ".json"
  );
}

/* const appRoutes: Routes = [
  { path: 'de', loadComponent: () => import('./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component').then(m => m.DetalleMediadorComponent),} // Ruta para el componente About
]; */
const appRoutes: Routes = [

]



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
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
  providers: [Router],
  
  
})
export class AppModule implements DoBootstrap {
  
  constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {
    this.dowgradeServices();
  }

  dowgradeServices() {}

  ngDoBootstrap() {
    console.log("Se arranca Angularjs desde AppModule");
    // Asegúrate de que 'myApp' es el nombre del módulo AngularJS
    this.upgrade.bootstrap(document.body, ["App"]);

    
  }
}
