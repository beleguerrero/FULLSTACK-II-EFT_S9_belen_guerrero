import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map, of, switchMap } 	from "rxjs";
import { HttpClient } from "@angular/common/http";

import { Usuario, UsuarioVip } from "./modelos";

interface registrarOpciones {
	nombre				  : string;
	usuario				? : string | null;
	correo				  : string;
	pass				? : string | null;
	re_pass				? : string | null;
	fecha_nacimiento	  : string;
	direccion			? : string | null;
	visita				? : boolean;
}

interface actualizarOpciones {
	id 					  : string;
	nombre 				? : string | null;
	usuario 			? : string | null;
	correo 				? : string | null;
	pass 				? : string | null;
	fecha_nacimiento 	? : string | null;
	direccion 			? : string | null;
	rol 				? : string | null;
}

@Injectable({
	providedIn: 'root'
})
export class UsuarioService {
	
	private readonly urlUsuarios = 'http://localhost:3000/usuarios';
	private readonly urlUsuariosVip = 'http://localhost:3000/usuarios_vip';
	
	private usuarios: Usuario[] = [];
	private usuarios_vip: UsuarioVip[] = [];

	constructor(
		private http: HttpClient,
	) {
		this.inicializarUsuarios();
		this.inicializarUsuariosVip();
	}

	public inicializarUsuarios(): void {
		this.http.get<Usuario[]>(this.urlUsuarios).subscribe({
			next: usuarios => {
				this.usuarios = usuarios;
			},
			error: () => {
				this.usuarios = [];
			}
		});
	}

	private inicializarUsuariosVip(): void {
		this.http.get<UsuarioVip[]>(this.urlUsuariosVip).subscribe({
			next: usuarios_vip => {
				this.usuarios_vip = usuarios_vip;
			},
			error: () => {
				this.usuarios_vip = [];
			}
		});
	}


	/**
	 * Obtiene lista de usuarios desde la API.
	 * @returns Observable con array de los usuarios.
	 */
	apiObtenerUsuarios(): Observable<Usuario[]> {
		return this.http.get<Usuario[]>(this.urlUsuarios);
	}


	/**
	 * Obtiene lista de los usuarios vip desde la API.
	 * @returns Observable con array de los usuarios vip.
	 */
	apiObtenerUsuariosVip(): Observable<UsuarioVip[]> {
		return this.http.get<UsuarioVip[]>(this.urlUsuariosVip);
	}


	/**
	 * Obtiene usuarios por su correo desde la API.
	 * @param correo String con el correo para identificar al usuario.
	 * @returns Observable con el usuario encontrado, puede ser nulo.
	 */
	apiObtenerUsuariosPorCorreo(correo: string): Observable<Usuario[] | null> {
		return this.http.get<Usuario[]>(`${this.urlUsuarios}?email=${correo}`).pipe(
			map(usuarios => usuarios ?? null)
		);
	}


	/**
	 * Crea un nuevo usuario desde la API.
	 * @param usuario Objeto usuario a crear.
	 * @returns Observable con el usuario creado.
	 */
	apiCrearUsuario(usuario: Usuario): Observable<Usuario> {
		return this.http.post<Usuario>(this.urlUsuarios, usuario);
	}


	/**
	 * Crea un nuevo usuario vuo¿p desde la API.
	 * @param usuario_vip Objeto usuario vip a crear.
	 * @returns Observable con el usuario vip creado.
	 */
	apiCrearUsuarioVip(usuario_vip: UsuarioVip): Observable<UsuarioVip> {
		return this.http.post<UsuarioVip>(this.urlUsuariosVip, usuario_vip);
	}


	/**
	 * Actualiza un usuario desde la API.
	 * @param usuario Objeto usuario a actualizar.
	 * @returns Observable del usuario actualizado.
	 */
	apiActualizarUsuario(usuario: Usuario): Observable<Usuario> {
		return this.http.put<Usuario>(`${this.urlUsuarios}/${usuario.id}`, usuario);
	}


	/**
	 * Actualiza un usuario vip desde la API.
	 * @param usuario_vip Objeto usuario vip a actualizar.
	 * @returns Observable del usuario vip actualizado.
	 */
	apiActualizarUsuarioVip(usuario_vip: UsuarioVip): Observable<UsuarioVip> {
		return this.http.put<UsuarioVip>(`${this.urlUsuariosVip}/${usuario_vip.id}`, usuario_vip);
	}


	obtenerUsuarios(): Usuario[] {
		return [...this.usuarios];
	}


	/**
	 * Crea un nuevo usuario. Rol BÁSICO por defecto.
	 * @param opciones Objeto con la información del usuario a registrar.
	 * @returns Observable de objeto con estado, respuesta y usuario.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 * - usuario: objeto usuario, puede ser nulo.
	 */
	registrar(
		{ nombre, usuario=null, correo, pass=null, re_pass=null, fecha_nacimiento, direccion=null, visita=false }: registrarOpciones
	): Observable<{ estado: number; respuesta: string, usuario: Usuario | null }> {
		const nombre_limpio = nombre.trim();
		const correo_limpio = correo.trim().toLowerCase();
		const rol           = visita === true ? 'VISITA' : 'BÁSICO';

		let usuario_limpio    : string | null = null;
		let pass_limpio       : string | null = null;
		let direccion_limpio  : string | null = null;

		if(!visita) {
			if(!usuario)    return of ({ estado: 0, respuesta: 'Falta usuario', usuario: null });
			if(!pass)       return of ({ estado: 0, respuesta: 'Falta contraseña', usuario: null });

			usuario_limpio    = usuario.trim().toLowerCase();
			pass_limpio       = pass.trim();
			direccion_limpio  = direccion ? direccion.trim() : '';
	
			const usuarios = this.usuarios;
	
			const existeCorreo = usuarios.some(u => u.email.toLowerCase() === correo_limpio);
			if(existeCorreo) return of ({ estado: 0, respuesta: 'Ya existe una cuenta con ese correo', usuario: null });
	
			if(!usuario) return of ({ estado: 0, respuesta: 'Falta usuario', usuario: null });
	
			const existeUsuario = usuarios.some(u => u.username!.toLowerCase() === usuario_limpio && u.role !== 'VISITA');
			if(existeUsuario) return of ({ estado: 0, respuesta: 'Ya existe una cuenta con ese usuario', usuario: null });
		}
				
		const nuevoUsuario: Usuario = {
			id			: crypto.randomUUID(),
			name		: nombre_limpio,
			username	: usuario_limpio,
			email		: correo_limpio,
			pass		: pass_limpio,
			birthdate 	: new Date(fecha_nacimiento),
			address		: direccion_limpio,
			role		: rol
		}

		return this.apiCrearUsuario(nuevoUsuario).pipe(
			map(usuarioCreado => {
				this.usuarios.push(usuarioCreado);
				return { estado: 1, respuesta: 'Usuario creado correctamente', usuario: nuevoUsuario };
			})
		);
	}


	/**
	 * Permite acualizar los datos de un usuario.
	 * @param opciones Objeto con la información del usuario a actualizar.
	 * @returns Observable de objeto con estado, respuesta y usuario.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 * - usuario: objeto usuario, puede ser nulo.
	 */
	actualizarUsuario(
		{ id, nombre=null, usuario=null, correo=null, pass=null, fecha_nacimiento=null, direccion=null, rol=null }: actualizarOpciones
	): Observable<{ estado: number; respuesta: string; usuario: Usuario | null }> {

		const usuarios = this.usuarios;

		const usuarioEncontrado = usuarios.find(u => u.id === id);
		if(!usuarioEncontrado) return of ({ estado: 0, respuesta: 'No se encontró usuario', usuario: null });

		if(correo) {
			const existeCorreo = usuarios.some(u => u.email.toLowerCase() === correo.trim().toLowerCase());
			if(existeCorreo) return of ({ estado: 0, respuesta: 'Ya existe una cuenta con ese correo', usuario: null });
		}

		if(usuario) {
			const existeUsuario = usuarios.some(u => u.username!.toLowerCase() === usuario.trim().toLowerCase() &&u.role !== 'VISITA');
			if(existeUsuario) return of ({ estado: 0, respuesta: 'Ya existe una cuenta con ese usuario', usuario: null });
		}
				
		if(nombre)           usuarioEncontrado.name      = nombre.trim();
		if(usuario)          usuarioEncontrado.username  = usuario.trim();
		if(correo)           usuarioEncontrado.email     = correo.trim();
		if(pass)             usuarioEncontrado.pass      = pass.trim();
		if(fecha_nacimiento) usuarioEncontrado.birthdate = new Date(fecha_nacimiento);
		if(direccion)        usuarioEncontrado.address   = direccion.trim();
		if(rol)              usuarioEncontrado.role      = rol.trim();

		return this.apiActualizarUsuario(usuarioEncontrado).pipe(
			map(usuarioActualizado => {
				this.usuarios.push(usuarioActualizado);
				return { estado: 1, respuesta: 'Usuario actualizado correctamente', usuario: usuarioEncontrado };
			})
		);
	}


	/**
	 * Agrega un nuevo usuario al local storage de usuario VIP.
	 * @param usuario_id ID del usuario.
	 * @param tarjeta Número de tarjeta.
	 * @param fecha_inicio Fecha de inicio de la suscripción VIP.
	 * @param fecha_termino Fecha de Término de la suscripción VIP.
	 * @returns Objeto con estado, respuesta y usuario.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 * - usuario: objeto Usuario modificado, puede ser nulo.
	 */
	registrar_vip(
		usuario_id: string, tarjeta: number, fecha_inicio: string, fecha_termino: string
	): Observable<{ estado: number; respuesta: string, usuario: Usuario | null }> {

		const usuarios = this.usuarios;

		const usuarioEncontrado = usuarios.find(u => u.id === usuario_id);
		if(!usuarioEncontrado) return of ({ estado: 0, respuesta: 'Usuario no encontrado', usuario: null });

		const es_vip = this.esUsuarioVip(usuario_id);
		if(es_vip) return of ({ estado: 0, respuesta: 'Ya es usuario vip', usuario: null });
				
		const nuevoUsuarioVip: UsuarioVip = {
			id			: crypto.randomUUID(),
			usuario_id	: usuario_id,
			card_number	: tarjeta,
			start_date	: new Date(fecha_inicio),
			end_date	: new Date(fecha_termino)
		}

		return this.apiCrearUsuarioVip(nuevoUsuarioVip).pipe(
			switchMap(usuarioVipCreado => {
				this.usuarios_vip.push(usuarioVipCreado);
				
				const rol = usuarioEncontrado.role;
				if(rol === 'VIP') return of ({ estado: 1, respuesta: 'Usuario creado correctamente', usuario: usuarioEncontrado });
				

				return this.actualizarUsuario({
					id	: usuario_id,
					rol : 'VIP'
				}).pipe(
					map(resultado => ({
						estado		: resultado.estado,
						respuesta	: resultado.respuesta,
						usuario		: resultado.usuario
					}))
				);
			})
		);
	}


	/**
	 * Permite actualizar los datos de un usuario VIP en el local storage de usuarios_vip.
	 * @param usuario_id ID del usuario. Obligatorio.
	 * @param tarjeta Número de tarjeta. Opcional.
	 * @param fecha_inicio Fecha de inicio de la suscripción VIP. Opcional.
	 * @param fecha_termino Fecha de término de la suscripcipon VIP. Opcional.
	 * @returns Objeto con estado y respuesta.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 */
	actualizarUsuarioVip(
		usuario_id: string, tarjeta: number | null, fecha_inicio: Date | null, fecha_termino: Date | null
	): Observable<{ estado: number; respuesta: string }> {
		
		const usuarios_vip = this.usuarios_vip;

		const vipEncontrado = usuarios_vip.find(vip => vip.usuario_id === usuario_id);
		if(!vipEncontrado) return of ({ estado: 0, respuesta: 'No se encontró usuario vip' });


		if(tarjeta)         vipEncontrado.card_number = tarjeta;
		if(fecha_inicio)    vipEncontrado.start_date  = fecha_inicio;
		if(fecha_termino)   vipEncontrado.end_date    = fecha_termino;


		return this.apiActualizarUsuarioVip(vipEncontrado).pipe(
			map(vipActualizado => {
				this.usuarios_vip.push(vipActualizado);
				return { estado: 1, respuesta: 'Usuario vip actualizado correctamente' };
			})
		);
	}


	/**
	 * Premite obtener el ID de un usuario por su correo.
	 * @param correo Correo electrónico del usuario.
	 * @returns ID del usuario, puede ser nulo.
	 */
	obtenerUsuarioId(correo:string): string | null {
		const correo_limpio = correo.trim().toLowerCase();
		const usuarios = this.usuarios
		
		const usuarioEncontrado = usuarios.find(
			u => u.email.toLowerCase() === correo_limpio
		);
		if(usuarioEncontrado) {
			return usuarioEncontrado.id;
		}
		return null;
	}


	/**
	 * Retorna un bool que indica si el usuario es VIP o no.
	 * Revisa si existe en usuarios_vip y su fecha de término.
	 * @param usuario_id ID del usuario.
	 * @returns boolean que indica si es o no un usuario VIP.
	 */
	public esUsuarioVip(usuario_id:string): boolean {

		const vipEncontrado = this.usuarios_vip.find(
			vip => vip.usuario_id === usuario_id
		)

		if(vipEncontrado) {
			// revisar fecha de término
			const fecha_actual = new Date();
			const fecha_termino = new Date(vipEncontrado.end_date);

			if(fecha_termino.setHours(0,0,0,0) > fecha_actual.setHours(0,0,0,0)) {
				return true;
			}
		}
		
		return false;
	}
}
