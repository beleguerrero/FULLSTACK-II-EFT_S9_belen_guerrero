import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

import { Auth } from '../../services/auth';
import { UsuarioService } from '../../services/usuario-service';

import { getHtmlErrores, obtenerErroresFormulario, getFechaStr, getFechaTerminoStr } from '../../utils/form-util';
import { toastSuccess, toastError } from '../../utils/swal-utils';

@Component({
  selector: 'app-ser-vip',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './ser-vip.html',
  styleUrl: './ser-vip.css',
})
export class SerVip {

  formularioSerVip: FormGroup;

  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = 'Ha ocurrido un error';

  constructor(
    public authService: Auth,
    public usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formularioSerVip = this.fb.group({
      n_tarjeta : ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^\d+$/)]],
      duracion  : ['', [Validators.required]],
      terminos  : [false, [Validators.requiredTrue]],
    })
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioSerVip.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioSerVip.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }


  /**
   * Registra un nuevo usuario vip  y actualiza el rol del usuario.
   * Valida el formulario y lo envía al servicio de registro vip.
   * Si es exitosa, redirige a la página de inicio; si no muestra el mensaje de error.
   */
  serVip(): void {

    const errores = obtenerErroresFormulario(this.controles, this.formularioSerVip);
    if(this.formularioSerVip.invalid) {
      this.enviado = true;
      this.formularioSerVip.markAllAsTouched();
      this.respuesta = getHtmlErrores(errores);
      return;
    }

    if(errores.length > 0) {
      this.enviado = true;
      this.respuesta = getHtmlErrores(errores);
      return;
    }
    
    const usuario = this.authService.usuarioActual;
    if(!usuario) {
      this.enviado = true;
      this.respuesta = getHtmlErrores([this.respuesta]);
      return;
    }

    const { n_tarjeta, duracion, terminos } = this.formularioSerVip.getRawValue() as {
      n_tarjeta : number,
      duracion  : string,
      terminos  : boolean;
    }
    const fecha_actual = new Date();
    const fecha_inicio = getFechaStr(fecha_actual);
    const fecha_termino = getFechaTerminoStr(fecha_inicio, duracion);


    this.usuarioService.registrar_vip(
      usuario.id, n_tarjeta, fecha_inicio, fecha_termino
    ).subscribe(resultado => {
      this.enviado = true;
  
      if(this.authService.logueado && resultado.usuario) {
        this.authService.guardarSesion(resultado.usuario);
      }
  
      this.estado = resultado.estado;
      if(this.estado === 1 ) {
        
        this.respuesta = resultado.respuesta;
        this.limpiarForm();
  
        toastSuccess(this.respuesta);
        this.router.navigate(['/']);
      
      } else {
        
        this.limpiarForm();
        // toastError(this.respuesta);
        this.respuesta = getHtmlErrores([resultado.respuesta]);
        return;
      
      }
    });
  }


  /**
   * Limmpia los inputs del formulario.
   */
  limpiarForm(): void {
    this.formularioSerVip.reset({
      n_tarjeta: '',
      terminos: '',
    });

    this.enviado = false;
  }
}
