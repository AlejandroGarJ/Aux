import "@angular/compiler";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
@Component({
  selector: "prueba",
  templateUrl: "./prueba.component.html",
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
  ],
  standalone: true,
  styleUrl: "./prueba.component.css",
})
export class PruebaComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}
  array = [1, 2, 3, 4, 5, 6];
  message: string = "Hola123";
}
