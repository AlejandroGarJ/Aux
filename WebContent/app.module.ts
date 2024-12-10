import { DoBootstrap, Inject, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static"; // Asegúrate de que estás importando esto
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { FlexLayoutModule } from "@angular/flex-layout";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    "./src/app-localization/locale-",
    ".json"
  );
}

@NgModule({
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
})
export class AppModule implements DoBootstrap {
  constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {
    this.dowgradeServices();
  }

  dowgradeServices() {}

  ngDoBootstrap() {
    // Asegúrate de que 'myApp' es el nombre del módulo AngularJS
    this.upgrade.bootstrap(document.body, ["App"]);
  }
}
