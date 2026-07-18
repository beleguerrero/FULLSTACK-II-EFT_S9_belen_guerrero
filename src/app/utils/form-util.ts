import { AbstractControl, FormGroup } from "@angular/forms";


/**
 * Obtiene código html listo para mostrar en alerta de errores del formulario.
 * @param errores Array de string con mensaje se error.
 * @returns código html en una cadena de texto con los mensajes de error formateados en una lista.
 */
export function getHtmlErrores(errores: string[]): string {
  let alerta_html = '';

  if(errores.length > 0) {
    alerta_html += `
      <p>¡Atención!</p>
      <ul>
    `;

    errores.forEach(err => {
      alerta_html += `<li>${err}</li>`;
    });

    alerta_html += '</ul>';
  }
  return alerta_html;
}


/**
 * Obtiene los mensajes de error de un formulario.
 * @param controles controles del formulario.
 * @param formulario FormGroup
 * @returns Array se string con mensajes de error.
 */
export function obtenerErroresFormulario(controles: { [key: string]: AbstractControl}, formulario:FormGroup): string[] {
  const errores: string[] = [];

  Object.keys(controles).forEach(nombreCampo => {
    const control = formulario.get(nombreCampo);

    if(!control?.errors) {
      const tarjetas_validas = ['1111222233334444','5555666677778888'];
      
      if(nombreCampo == 'n_tarjeta') {
        const valor = control?.value;
        
        if(!tarjetas_validas.includes(valor)) {
          errores.push('Debe ingresar una tarjeta válida')
        }
      }
      return;
    }


    let campo = nombreCampo.replace('_', ' ');
    campo = campo == 'pass'               ? 'contraseña'            : campo;
    campo = campo == 're pass'            ? 'repetir contraseña'    : campo;
    campo = campo == 'fecha nacimiento'   ? 'fecha de nacimiento'   : campo;
    campo = campo == 'n tarjeta'          ? 'número de tarjeta'     : campo;
    campo = campo == 'direccion'          ? 'dirección'             : campo;
    campo = campo == 'region'             ? 'región'                : campo;
    campo = campo == 'nombre contacto'    ? 'nombre de contacto'    : campo;
    campo = campo == 'telefono contacto'  ? 'teléfono de contacto'  : campo;
    campo = campo == 'tipo pago'          ? 'tipo de pago'          : campo;



    if(control.errors['required']) {
      if(campo == 'terminos') {
        errores.push('Debe aceptar los términos')
      } else if(campo == 'duracion') {
        errores.push('Debe seleccionar duración');
      } else {
        errores.push(`Debe ingresar ${campo}`);
      }
    }

    if(control.errors['minlength']) {
      if(nombreCampo == 'n_tarjeta') {
        errores.push('Debe ingresar una tarjeta válida')
      } else {
        errores.push(
          `${campo} debe tener un mínimo de ${control.errors['minlength'].requiredLength} caracteres`
        );
      }
    }

    if(control.errors['maxlength']) {
      if(nombreCampo == 'n_tarjeta') {
        errores.push('Debe ingresar una tarjeta válida')
      } else {
        errores.push(
          `${campo} debe tener un máximo de ${control.errors['maxlength'].requiredLength} caracteres`
        );
      }
    }

    if(control.errors['email']) {
      errores.push('Debe ingresar un correo válido');
    }

    if(control.errors['edad_minima_valida']) {
      errores.push(`No puede tener menos de ${control.errors['edad_minima_valida'].valor} años`);
    }

    if(control.errors['pass_valida']) {
      errores.push(
        'La contraseña debe contener al menos una mayúscula y un número'
      );
    }
  });

  // error a nivel formulario
  if(formulario.errors?.['pass_iguales_valida']) {
    errores.push('Las contraseñas no coinciden');
  }

  return errores;
}


/**
 * Obtiene los años de una fecha.
 * @param fecha Fecha en string o Date.
 * @returns Un númerico con los años.
 */
export function getAniosFecha(fecha: string | Date): number {
  const nacimiento = fecha instanceof Date ? fecha : new Date(fecha);

  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const mes = hoy.getMonth() - nacimiento.getMonth();

  if(mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}


/**
 * Retorna un con  string de una fecha, elimina la hora.
 * @param fecha Fecha en string o Date.
 * @returns Misma fecha en cadena de texto.
 */
export function getFechaStr(fecha: Date | string): string {
  return new Date(fecha).toISOString().split('T')[0];
}


/**
 * Retorna cuál sería la fecha de término, enviado una fecha de inicio y duración.
 * @param fecha_inicio Fecha de inicio en string.
 * @param duracion Tipo de duración, puede ser:
 * - 1: 15 días.
 * - 2: 1 mes.
 * - 3: 3 meses.
 * - 4: 6 meses.
 * - 5: 1 año.
 * @returns Una fecha en cadena de texto sin hora.
 */
export function getFechaTerminoStr(fecha_inicio: string, duracion: string): string {
  const fecha = new Date(fecha_inicio);

  switch(duracion) {
    case '1':
      // 15 días
      fecha.setDate(fecha.getDate() + 15);
      break;
    case '2':
      // 1 mes
      fecha.setMonth(fecha.getMonth() + 1);
      break;
    case '3':
      // 3 meses
      fecha.setMonth(fecha.getMonth() + 3);
      break;
    case '4':
      // 6 meses
      fecha.setMonth(fecha.getMonth() + 6);
      break;
    case '5':
      // 1 año
      fecha.setFullYear(fecha.getFullYear() + 1);
      break;
  }

  return fecha.toISOString().split('T')[0];
}

