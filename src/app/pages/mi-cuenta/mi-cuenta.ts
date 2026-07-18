import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

import { Auth } from '../../services/auth';
import { UsuarioService } from '../../services/usuario-service';

import { getHtmlErrores, obtenerErroresFormulario, getFechaStr } from '../../utils/form-util';
import { passValidator, passIgualesValidator, edadMinimaValidator } from '../../validators/custom-validators';
import { toastError, toastSuccess } from '../../utils/swal-utils';

@Component({
  selector: 'app-mi-cuenta',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta {

  formularioMiCuenta: FormGroup;
  formularioPass: FormGroup;

  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = 'Ha ocurrido un error';
  
  enviado_pass: boolean = false;
  estado_pass: number = 0;
  respuesta_pass: string = 'Ha ocurrido un error';
  
  
  constructor(
    public authService: Auth,
    public usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.formularioMiCuenta = this.fb.group({
      nombre            : ['', [Validators.required, Validators.minLength(3)]],
      usuario           : ['', [Validators.required, Validators.minLength(3)]],
      correo            : ['', [Validators.required, Validators.email]],
      fecha_nacimiento  : ['', [Validators.required, edadMinimaValidator(13)]],
      direccion         : ['']
    });
    this.formularioPass = this.fb.group({
      pass    : ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), passValidator()]],
      re_pass : ['', [Validators.required]],
    }, {
      validators: [passIgualesValidator('pass', 're_pass')]
    });

    const usuarioActual = this.authService.usuarioActual;
    if(usuarioActual) {
      this.formularioMiCuenta.patchValue({
        nombre            : usuarioActual.name,
        usuario           : usuarioActual.username,
        correo            : usuarioActual.email,
        fecha_nacimiento  : getFechaStr(usuarioActual.birthdate),
        direccion         : usuarioActual.address
      })
    }

  }

  get controlesMiCuenta(): { [key: string]: AbstractControl } {
    return this.formularioMiCuenta.controls;
  }

  get controlesPass(): { [key: string]: AbstractControl } {
    return this.formularioPass.controls;
  }

  campoInvalidoMiCuenta(nombreCampo: string): boolean {
    const control = this.formularioMiCuenta.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  campoInvalidoPass(nombreCampo: string): boolean {
    const control = this.formularioPass.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado_pass)
    );
  }



  /**
   * Actualiza los datos de un usuario (excepto su contraseña).
   * Valida el formulario, y lo envía al servicio que actualiza al usuario.
   * Si es exitosa, muestra un mensaje de éxito; si no muestra el mensaje de error.
   */
  miCuenta(): void {

    if(this.formularioMiCuenta.invalid) {
      this.enviado = true;
      this.formularioMiCuenta.markAllAsTouched();
      this.respuesta = getHtmlErrores(obtenerErroresFormulario(this.controlesMiCuenta, this.formularioMiCuenta));
      return;
    }

    const usuarioActual = this.authService.usuarioActual;
    if(!usuarioActual) {
      this.enviado = true;
      this.respuesta = getHtmlErrores([this.respuesta]);
      return;
    }

    const { nombre, usuario, correo, fecha_nacimiento, direccion } = this.formularioMiCuenta.getRawValue() as {
      nombre            : string;
      usuario           : string;
      correo            : string;
      fecha_nacimiento  : string;
      direccion         : string;
    }

    let usuario_: string | null = usuario;
    if(usuarioActual.username === usuario) {
      usuario_ = null;
    }

    let correo_: string | null = correo;
    if(usuarioActual.email === correo) {
      correo_ = null;
    }

    this.usuarioService.actualizarUsuario({
      id                : usuarioActual.id,
      nombre            : nombre,
      usuario           : usuario_,
      correo            : correo_,
      fecha_nacimiento  : fecha_nacimiento,
      direccion         : direccion
    }).subscribe(resultado => {      
      this.enviado = true;
      
      this.estado = resultado.estado;
      if(this.estado === 1) {
        
        if(this.authService.logueado && resultado.usuario) {
          this.authService.guardarSesion(resultado.usuario);
        }
  
        this.respuesta = resultado.respuesta;
        toastSuccess(this.respuesta);
      
      } else {
        
        // toastError(this.respuesta);
        this.respuesta = getHtmlErrores([resultado.respuesta]);
        return;
      
      }
    });
    
  }



  /**
   * Actualiza la contraseña de un usuario.
   * Valida el formulario, y lo envía al servicio que actualiza al usuario.
   * Si es exitosa, muestra un mensaje de éxito; si no muestra el mensaje de error.
   */
  pass(): void {


    if(this.formularioPass.invalid) {
      this.enviado_pass = true;
      this.formularioPass.markAllAsTouched();
      this.respuesta_pass = getHtmlErrores(obtenerErroresFormulario(this.controlesPass, this.formularioPass));
      return;
    }

    const usuarioActual = this.authService.usuarioActual;
    if(!usuarioActual) {
      this.enviado_pass = true;
      this.respuesta_pass = getHtmlErrores([this.respuesta_pass]);
      return;
    }

    const { pass, re_pass } = this.formularioPass.getRawValue() as {
      pass    : string,
      re_pass : string
    }


    this.usuarioService.actualizarUsuario({
      id    : usuarioActual.id,
      pass  : pass
    }).subscribe(resultado => {
      this.enviado_pass = true;

      this.estado_pass = resultado.estado;
      if(this.estado_pass === 1) {
        
        if(this.authService.logueado && resultado.usuario) {
          this.authService.guardarSesion(resultado.usuario);
        }
  
        this.respuesta_pass = resultado.respuesta;
        this.limpiarForm('formularioPass');
  
        toastSuccess(this.respuesta_pass);
      
      } else {
        
        // toastError(this.respuesta_pass);
        this.respuesta_pass = getHtmlErrores([resultado.respuesta]);
        return;
      
      }
    });
  }


  /**
   * Limpia los inputs del formulario.
   * @param nombre_formulario String con el nombre del formulario a limpiar.
   */
  limpiarForm(nombre_formulario:string): void {
    if(nombre_formulario === 'formularioMiCuenta') {
      this.formularioMiCuenta.reset({
        nombre: '',
        usuario: '',
        correo: '',
        fecha_nacimiento: '',
        direccion: ''
      });
      this.enviado = false;
    }

    if(nombre_formulario === 'formularioPass') {
      this.formularioPass.reset({
        pass: '',
        re_pass: ''
      })
      this.enviado_pass = false;
    }

  }
}
