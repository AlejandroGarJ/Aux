import "zone.js";
import "@angular/compiler";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app.module";
import { downgradeComponent, } from "@angular/upgrade/static";
import { COMPONENTS } from "./angular2/angularComponentsDeclaration";
/* Recorrer los componentes Angular y usar ngDowngrade para usarlos desde Angularjs */
COMPONENTS.forEach((component) => {
    window.app.directive((component.name.charAt(0).toLowerCase() + component.name.slice(1)).replace("Component", ""), downgradeComponent({ component }));
});
/* Arrancar la aplicación */
platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => {
    console.error("Error bootstrapping the module:", err);
    if (err instanceof Error) {
        console.error("Error stack trace:", err.stack);
    }
})
    .then(() => { });
