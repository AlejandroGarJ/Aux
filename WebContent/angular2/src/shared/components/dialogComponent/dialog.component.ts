import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { DIALOG_TYPES } from "../../enums/dialogTypes";
@Component({
  selector: "app-dialog",
  templateUrl: "./dialog.component.html",
  styleUrl: "./dialog.component.css",
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
  ],
})
export class DialogComponent {
  buttonType = DIALOG_TYPES;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string; type: string }
  ) {}
}
