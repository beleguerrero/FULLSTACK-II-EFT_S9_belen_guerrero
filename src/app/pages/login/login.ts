import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';
import { CarritoService } from '../../services/carrito-service';

import { getHtmlErrores, obtenerErroresFormulario } from '../../utils/form-util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  formularioLogin: FormGroup;

  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = '';

  constructor(
    public authService: Auth,
    private router: Router,
    private fb: FormBuilder,
    public carritoService: CarritoService,
  ) {
    this.formularioLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required]],
    })
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioLogin.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioLogin.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }


  /**
   * Valida el formulario, y realiza el login.
   * Si es exitosa, redirige a la página de inicio; si no muestra el mensaje de error.
   */
  ingresar(): void {

    if(this.formularioLogin.invalid) {
      this.enviado = true;
      this.formularioLogin.markAllAsTouched();
      this.respuesta = getHtmlErrores(obtenerErroresFormulario(this.controles, this.formularioLogin));
      return;
    }

    const { correo, pass } = this.formularioLogin.getRawValue() as {
      correo: string;
      pass: string;
    }

    this.authService.login(correo, pass).subscribe(resultado => {
      this.enviado = true;

      this.estado = resultado.estado;
      this.respuesta = getHtmlErrores([resultado.respuesta]);
  
      if(this.estado === 1) {
        const usuario = this.authService.usuarioActual;
        this.limpiarForm();
  
        if(usuario) {
          this.carritoService.guardarCarritoActual(usuario.id);
        } else {
          this.carritoService.guardarCarritoActual(null);
        }
  
        this.router.navigate(['/']);  // home
      }
    });
  }


  /**
   * Limpia los inputs del formulario.
   */
  limpiarForm(): void {
    this.formularioLogin.reset({
      correo: '',
      pass: '',
    });

    this.enviado = false;
  }
}
