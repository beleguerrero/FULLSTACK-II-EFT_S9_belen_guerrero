
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, map } from 'rxjs';

import { Usuario } from './modelos';
import { UsuarioService } from './usuario-service';

const CLAVE_SESION = 'rottenAppleSesion'

/**
 * Servicios de autenticación.
 */
@Injectable({
	providedIn: 'root'
})
export class Auth {

	private usuarios: Usuario[] = [];
	
	constructor(
		private usuarioService : UsuarioService,
	) {}
	
	private usuarioActualSubject = new BehaviorSubject<Usuario | null>(this.cargarSesion());
	usuarioActual$ = this.usuarioActualSubject.asObservable();
	
	get usuarioActual(): Usuario | null {
		return this.usuarioActualSubject.value;
	}


	get logueado(): boolean {
		return this.usuarioActual !== null;
	}


	get esVip(): boolean {
		if(!this.logueado) return false;
		if(this.usuarioActual && this.usuarioActual.role === 'VIP') return true;
		return false;
	}


	/**
	 * Guarda una sesión para el usuario siempre y cuando el correo y la contraseña coincidan con los datos del usuario.
	 * Actualiza el rol del usuario si corresponde.
	 * @param correo Correo electrónico del usuario.
	 * @param pass Contraseña del usuario.
	 * @returns Observable de objeto con estado y respuesta.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 */
	login(
		correo: string, pass: string
	): Observable<{ estado: number, respuesta: string }> {
		const correo_limpio = correo.trim().toLowerCase();
		const pass_limpio 	= pass.trim();

		const usuarios = this.usuarioService.obtenerUsuarios();

		const usuarioEncontrado = usuarios.find(
			u =>
				u.email.toLowerCase() === correo_limpio &&
				u.pass === pass_limpio &&
				u.role !== 'VISITA'
		);
		if(!usuarioEncontrado) return of ({ estado: 0, respuesta: 'Correo o clave incorrecta' });

		// revisar si es vip vigente
		const es_vip 		= this.usuarioService.esUsuarioVip(usuarioEncontrado.id);
		const rol 			= usuarioEncontrado.role;
		let actualizar		= false;
		let rol_actualizar 	= '';
		
		if(es_vip && rol !=='VIP') {
			actualizar = true;
			rol_actualizar = 'VIP';
		}
		
		if(!es_vip && rol !=='BÁSICO') {
			actualizar = true;
			rol_actualizar = 'BÁSICO';
		}
		
		if(actualizar) {
			return this.usuarioService.actualizarUsuario({
				id	: usuarioEncontrado.id,
				rol : rol_actualizar
			}).pipe(
				map(resultado => {

					if(resultado.estado === 0 || !resultado.usuario) {
						return { estado: 0, respuesta: 'Ha ocurrido un error' }
					}

					this.guardarSesion(resultado.usuario)
					return { estado: 1, respuesta: 'Inicio sesión correcto 1' }
				})
			);
		}

		this.guardarSesion(usuarioEncontrado);
		return of ({ estado: 1, respuesta: 'Inicio sesión correcto 2' });
  	}


	/**
	 * Elimina sesión del session storage.
	 */
	logout(): void {
		sessionStorage.removeItem(CLAVE_SESION);
		this.usuarioActualSubject.next(null);
	}


	private cargarSesion(): Usuario | null {
		const sesionGuardada = sessionStorage.getItem(CLAVE_SESION);

		if(!sesionGuardada) {
			return null;
		}

		try{
			return JSON.parse(sesionGuardada) as Usuario;
		} catch {
			sessionStorage.removeItem(CLAVE_SESION);
			return null;
		}
	}


	/**
	 * Guarda un objeto usuario en el session storage.
	 * @param usuario Objeto usuario.
	 */
	guardarSesion(usuario: Usuario): void {
		sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
		this.usuarioActualSubject.next(usuario);
	}

}
