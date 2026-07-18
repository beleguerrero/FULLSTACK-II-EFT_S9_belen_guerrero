import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';
import { UsuarioService } from '../../services/usuario-service';

import { getHtmlErrores, obtenerErroresFormulario } from '../../utils/form-util';
import { passValidator, passIgualesValidator, edadMinimaValidator } from '../../validators/custom-validators';
import { toastError, toastSuccess } from '../../utils/swal-utils';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})

export class Registro {
  formularioRegistro: FormGroup;

  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = 'Ha ocurrido un error';

  constructor(
    public authService: Auth,
    public usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formularioRegistro = this.fb.group({
      nombre            : ['', [Validators.required, Validators.minLength(3)]],
      usuario           : ['', [Validators.required, Validators.minLength(3)]],
      correo            : ['', [Validators.required, Validators.email]],
      pass              : ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), passValidator()]],
      re_pass           : ['', [Validators.required]],
      fecha_nacimiento  : ['', [Validators.required, edadMinimaValidator(13)]],
      direccion         : ['']
    }, {
      validators: [passIgualesValidator('pass', 're_pass')]
    })
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioRegistro.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioRegistro.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }


  /**
   * Registra a un usuario.
   * Valida el formulario y lo envía al servicio de registro.
   * Si es exitosa, redirige al login; si no muestra el mensaje de error.
   */
  registrar(): void {

    if(this.formularioRegistro.invalid) {
      this.enviado = true;
      this.formularioRegistro.markAllAsTouched();
      this.respuesta = getHtmlErrores(obtenerErroresFormulario(this.controles, this.formularioRegistro));
      return;
    }

    const { nombre, usuario, correo, pass, re_pass, fecha_nacimiento, direccion } = this.formularioRegistro.getRawValue() as {
      nombre          : string;
      usuario         : string;
      correo          : string;
      pass            : string;
      re_pass         : string;
      fecha_nacimiento: string;
      direccion       : string;
    }
    

    this.usuarioService.registrar({
      nombre            : nombre,
      usuario           : usuario,
      correo            : correo,
      pass              : pass,
      fecha_nacimiento  : fecha_nacimiento,
      direccion         : direccion
    }).subscribe(resultado => {
      this.enviado = true;
      
      this.estado = resultado.estado;    
      this.respuesta = resultado.respuesta;
      if(this.estado === 1) {
        
        this.respuesta = resultado.respuesta;
        this.limpiarForm();
  
        toastSuccess(this.respuesta);
        this.router.navigate(['/login']);
      
      } else {
        
        // toastError(this.respuesta);
        this.respuesta = getHtmlErrores([resultado.respuesta]);
        return;
      
      }
    });
  }


  /**
   * Limpia los inputs del formulario.
   */
  limpiarForm(): void {
    this.formularioRegistro.reset({
      nombre: '',
      usuario: '',
      correo: '',
      pass: '',
      re_pass: '',
      fecha_nacimiento: '',
      direccion: ''
    });

    this.enviado = false;
  }
}
