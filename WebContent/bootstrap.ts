import "zone.js";
import "@angular/compiler";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app.module";
import {
  downgradeComponent,
  downgradeInjectable,
} from "@angular/upgrade/static";
import { COMPONENTS } from "./angular2/angularComponentsDeclaration";
import { DetalleMediadorComponent } from "./angular2/src/detalle/detalle.componentes/detalle.mediador/detalle.mediador.component";
import { AppComponent } from "./angular2/../app.component";

/* Definir el tipo de window.app */
declare global {
  interface Window {
    app: angular.IModule;
  }
}

/* Recorrer los componentes Angular y usar ngDowngrade para usarlos desde Angularjs */
/* COMPONENTS.forEach((component) => {
  window.app.directive(
    (component.name.charAt(0).toLowerCase() + component.name.slice(1)).replace(
      "Component",
      ""
    ),
    downgradeComponent({ component }) as angular.IDirectiveFactory
  );
}); */
console.log()

window.app.directive(
  (DetalleMediadorComponent.name.charAt(0).toLowerCase() + DetalleMediadorComponent.name.slice(1)).replace(
    "Component",
    ""
  ),
  downgradeComponent({ component:DetalleMediadorComponent, propagateDigest: false }) as angular.IDirectiveFactory
);

/* Arrancar la aplicación */
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    console.error("Error bootstrapping the module:", err);
    if (err instanceof Error) {
      console.error("Error stack trace:", err.stack);
    }
  })
  .then(() => {});
