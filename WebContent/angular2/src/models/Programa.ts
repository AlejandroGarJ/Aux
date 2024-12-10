import { Contacto } from "./Contacto";

export type Programa = {
  ID_PROGRAMA: number;
  DS_TIPO_POLIZA: String;
  LST_ID_TIPO_MEDIO_PAGO: number[];
  PO_COMISION: number;
  LISTA_CONTACTOS: Contacto[];
};
