
import { ValidatorFn,AbstractControl, ValidationErrors } from "@angular/forms";

import { getAniosFecha } from "../utils/form-util";


/**
 * Valida que una contraseña cumpla con las reglas.
 * La contraseña debe contener al menos una letra mayúscula y un número.
 * @returns Función validadora que retorna nulo si la contraseña es válida o un objeto de errores pass_valida en caso contrario.
 */
export function passValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value || '';

    if(!valor) {
      return null;
    }

    const regex_pass   = /^(?=.*[A-Z])(?=.*\d).+$/

    const pass_valida = regex_pass.test(valor);

    if(pass_valida) {
      return null;
    }

    return {
      pass_valida: true
    };
  }
}


/**
 * Valida que la edad mímina se cumpla.
 * @param edadMinima Número que indica la edad mínima.
 * @returns Función validadora que retorna nulo si es válida o un on objeto con la edad mínima.
 */
export function edadMinimaValidator(edadMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if(!valor) {
      return null;
    }
  
    if(getAniosFecha(valor) >= edadMinima) {
      return null;
    }

    return {
      edad_minima_valida: {
        valor: edadMinima,
      }
    };
  };
}


/**
 * Valida de pass y re_pass sean idénticas.
 * @param pass String con la contraseña.
 * @param re_pass String con repite contraseña.
 * @returns Función validadora que retorna nulo si ambas contraseñas son iguales o un objeto en caso contrario.
 */
export function passIgualesValidator(pass: string, re_pass: string): ValidatorFn {
  return (formulario: AbstractControl): ValidationErrors | null => {
    const pass$ = formulario.get(pass)?.value;
    const re_pass$ = formulario.get(re_pass)?.value;

    if(!pass$ || !re_pass$) {
      return null;
    }

    return pass$ === re_pass$ ? null : { pass_iguales_valida: true };
  };
}
