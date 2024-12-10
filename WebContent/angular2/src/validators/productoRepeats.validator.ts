import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

export function productoRepeats(PARTNERS: FormArray): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value.ID_PROGRAMA;
    const isDuplicate = PARTNERS.controls.some((group) => {
      return (
        group !== control.parent &&
        group.get("ID_PROGRAMA")?.value.ID_PROGRAMA === value
      );
    });

    if (isDuplicate) {
      return { duplicateIDPrograma: { value } };
    }
    return null;
  };
}
