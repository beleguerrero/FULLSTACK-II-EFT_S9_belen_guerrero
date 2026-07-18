import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';
import { UsuarioService } from '../../services/usuario-service';

import { getHtmlErrores, obtenerErroresFormulario } from '../../utils/form-util';
import { passValidator, passIgualesValidator } from '../../validators/custom-validators';
import { toastError, toastSuccess } from '../../utils/swal-utils';

@Component({
  selector: 'app-recuperar',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {

  formularioRecuperar: FormGroup;

  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = 'Ha ocurrido un error';

  constructor(
    public authService: Auth,
    public usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formularioRecuperar = this.fb.group({
      correo  : ['', [Validators.required, Validators.email]],
      pass    : ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), passValidator()]],
      re_pass : ['', [Validators.required]],
    }, {
      validators: [passIgualesValidator('pass', 're_pass')]
    });
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioRecuperar.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioRecuperar.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }


  /**
   * Actualiza la contraseña de un usuario.
   * Valida el formulario, y lo envía al servicio que actualiza al usuario.
   * Si es exitosa, redirige al login; si no muestra el mensaje de error.
   */
  recuperar(): void {

    if(this.formularioRecuperar.invalid) {
      this.enviado = true;
      this.formularioRecuperar.markAllAsTouched();
      this.respuesta = getHtmlErrores(obtenerErroresFormulario(this.controles, this.formularioRecuperar));
      return;
    }

    const { correo, pass, re_pass } = this.formularioRecuperar.getRawValue() as {
      correo  : string;
      pass    : string;
      re_pass : string;
    }
    

    const usuario_id = this.usuarioService.obtenerUsuarioId(correo);
    if(!usuario_id) {
      this.enviado = true;
      this.respuesta = getHtmlErrores(['No existe una cuenta con ese correo']);
      return;
    }

    
    this.usuarioService.actualizarUsuario({
      id    : usuario_id,
      pass  : pass
    }).subscribe(resultado => {
      this.enviado = true;
      
      this.estado = resultado.estado;
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
    this.formularioRecuperar.reset({
      correo: '',
      pass: '',
      re_pass: '',
    });

    this.enviado = false;
  }

}
