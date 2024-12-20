import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app',  // Este es el selector que Angular buscará en el HTML
  template: `
  daw`,
  standalone: false,

})
export class AppComponent {
  title = 'Mi App Angular';

    constructor(){}

  ngOnInit(){
    console.log("Se inicia el app component")
  }
  ngOnDestroy(){
    console.log("Se destruye el componente app-component")
  }
}
