import "@angular/compiler";
import { Component, inject, Inject, OnInit } from "@angular/core";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { NativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatError, MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card"; // Si usas tarjetas (cards)
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { TiposService } from "../../../../sharedServices/tiposService";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { Provincia } from "angular2/src/models/Provincia";
import { productoRepeats } from "../../../validators/productoRepeats.validator";
import { CONSTANTS } from "../../../shared/enums/constants";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { PruebaComponent } from "../../../componentePrueba/prueba.component";
import { DialogComponent } from "../../../shared/components/dialogComponent/dialog.component";
import { DIALOG_TYPES } from "../../../shared/enums/dialogTypes";
import { Dialog } from "@angular/cdk/dialog";
@Component({
  selector: "detalle-mediador",
  templateUrl: "./detalle.mediador.component.html",
  styleUrl: "./detalle.mediador.component.css",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    NativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    TranslateModule,
    FlexLayoutModule,
    MatError,
    MatButtonModule,
    DialogComponent,
  ],
  providers: [TranslateService, HttpClient],
})
export class DetalleMediadorComponent {
  readonly dialog = inject(MatDialog);
  form: FormGroup;
  mediador: any | null = null;
  provincias: Provincia[] = [];
  productosDisponibles: any[] = [];
  productosSeleccionados: any;
  mediosPago: any;
  tiposDestinatario: any = [];
  tiposContacto: any = [];

  constructor(
    @Inject(TranslateService) public translate: TranslateService,
    @Inject(HttpClient) public http: HttpClient,
    @Inject(TiposService) private tiposService: TiposService
  ) {
    /* Default language of translate */
    this.translate.setDefaultLang("es");

    /* Inicializar el formulario */

    this.form = new FormGroup({
      NO_COMPANIA: new FormControl("", [Validators.required]),
      NO_COMERCIAL: new FormControl("", [Validators.required]),
      NU_CIF: new FormControl("", [Validators.required]),
      NO_DIRECCION: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      CO_POSTAL: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      NO_LOCALIDAD: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      ID_PROVINCIA: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      NO_EMAIL: new FormControl("email@gmail.cpom", [
        Validators.required,
        Validators.email,
      ]),
      /* Declarar FormArray para PARTNERS */
      PARTNERS: new FormArray([]),
    });
    this.addPartner();
  }

  ngOnInit(): void {
    this.getProvincias();
    this.getProgramas();
    this.getMediosPago();
    this.getTiposContacto();
    this.getTiposDestinatario();
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string,
    message: string,
    type: string
  ) {
    return this.dialog.open(DialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      data: {
        message,
        type,
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.openDialog(
        "200ms",
        "200ms",
        "¿Seguro que quieres guardar el mediador?",
        DIALOG_TYPES.confirm
      )
        .afterClosed()
        .subscribe((res) => {
          if (res === "yes") {
            this.mediador = this.form.value;
            console.log(this.mediador);
            this.tiposService.altaMediador(this.mediador).subscribe((res) => {
              console.log(res);
            });
          }
        });
    } else {
      this.form.markAllAsTouched();

      this.openDialog(
        "200ms",
        "200ms",
        "Revisa los datos introducidos",
        DIALOG_TYPES.ok
      );
    }
  }

  verPagos() {
    console.log(this.PARTNERS.controls[0]);
  }
  /* Acceder al array de partners de el formGroup */
  get PARTNERS() {
    return this.form.get("PARTNERS") as FormArray;
  }

  addPartner() {
    const partnerGroup = new FormGroup<any>({
      ID_PROGRAMA: new FormControl("", [
        Validators.required,
        productoRepeats(this.PARTNERS),
      ]),
      DS_TIPO_POLIZA: new FormControl("", [Validators.required]),

      LST_ID_TIPO_MEDIO_PAGO: new FormControl("", [Validators.required]),
      PO_COMISION: new FormControl(12, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
      LISTA_CONTACTOS: new FormArray([
        new FormGroup({
          ID_TIPOCONTACTO: new FormControl("", [Validators.required]),
          NO_PERSONA: new FormControl("", [Validators.required]),
          NO_EMAIL: new FormControl("", [
            Validators.email,
            Validators.required,
          ]),
          IN_TIPO_DESTINATARIO: new FormControl("", [Validators.required]),
        }),
      ]),
    });

    /* Para que cuando ID_PROGRAMA sea 2 tenga los campos de harmony */
    this.PARTNERS.push(partnerGroup);
    const idPrograma = partnerGroup.get("ID_PROGRAMA");
    if (idPrograma) {
      idPrograma.valueChanges.subscribe((newVal) => {
        if (newVal) {
          console.log(newVal);
          if (newVal === 2) {
            partnerGroup.addControl(
              "HARMONY_CONF",
              new FormGroup({
                brokerName: new FormControl("", [Validators.required]),
                brokerInfo: new FormControl("", [Validators.required]),
              })
            );
          } else {
            if (partnerGroup.get("HARMONY_CONF")) {
              partnerGroup.removeControl("HARMONY_CONF");
            }
          }
        }
      });
    }
  }

  deletePrograma(indexPrograma: number) {
    this.openDialog(
      "200ms",
      "200ms",
      "¿Seguro que quieres eliminar el programa?",
      DIALOG_TYPES.confirm
    )
      .afterClosed()
      .subscribe((res) => {
        if (res === "yes") {
          this.PARTNERS.removeAt(indexPrograma);
        }
      });
  }

  addContacto(index: number) {
    this.PARTNERS.controls[index]["controls"].LISTA_CONTACTOS.push(
      new FormGroup({
        ID_TIPOCONTACTO: new FormControl("", [Validators.required]),
        NO_PERSONA: new FormControl("", [Validators.required]),
        NO_EMAIL: new FormControl("", [Validators.email, Validators.required]),
        IN_TIPO_DESTINATARIO: new FormControl("", [Validators.required]),
      })
    );
  }

  deleteContacto(indexPrograma: number, indexContacto: number) {
    this.openDialog(
      "200ms",
      "200ms",
      "¿Seguro que quieres eliminar el contacto?",
      DIALOG_TYPES.confirm
    )
      .afterClosed()
      .subscribe((res) => {
        if (res === "yes") {
          this.PARTNERS.controls[indexPrograma]["controls"][
            "LISTA_CONTACTOS"
          ].removeAt(indexContacto);
        }
      });
  }

  ver() {
    this.mediador = this.form.value;
    console.log(this.mediador);
  }

  private getProvincias() {
    this.tiposService.getProvincias().subscribe((res) => {
      if (res.status === 200) {
        this.provincias = res.body.TIPOS.TIPO;
      }
    });
  }

  private getProgramas() {
    this.tiposService
      .getProgramas({ IS_CONDICIONADO: true })
      .subscribe((res) => {
        if (res.status === 200) {
          this.productosDisponibles = res.body.TIPOS.TIPO;
        }
      });
  }

  private getMediosPago() {
    this.tiposService.getMediosPago({}).subscribe((res) => {
      if (res.status === 200) {
        this.mediosPago = res.body.TIPOS.TIPO;
        console.log(this.mediosPago);
      }
    });
  }

  private getTiposContacto() {
    this.tiposService
      .getTipos({ ID_CODIGO: CONSTANTS.TIPOS_CONTACTO })
      .subscribe((res) => {
        if (res.status === 200) {
          this.tiposContacto = res.body.TIPOS.TIPO;
        }
      });
  }
  private getTiposDestinatario() {
    this.tiposService
      .getTipos({ ID_CODIGO: CONSTANTS.IN_TIPO_DESTINATARIO })
      .subscribe((res) => {
        if (res.status === 200) {
          this.tiposDestinatario = res.body.TIPOS.TIPO;
          console.log(this.tiposDestinatario);
        }
      });
  }
}
