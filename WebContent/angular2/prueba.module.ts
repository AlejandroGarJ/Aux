import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';

// Rutas del módulo

const routes: Routes = [

]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule,
    AppComponent // Exporta RouterModule para que pueda ser usado por otros módulos si es necesario
  ],
  providers: [
    Router
  ]
})
export class PruebaModule {

  constructor(){
    console.log("Aqui inicia prueba mmodule")
  }
}
