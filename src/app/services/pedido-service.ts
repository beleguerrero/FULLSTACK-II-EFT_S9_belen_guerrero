import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, map, switchMap, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";

import { Pedido, ProductoCarrito, ResumenCarrito, DetalleEnvio, Usuario } from "./modelos";

import { UsuarioService } from "./usuario-service";
import { CarritoService } from "./carrito-service";


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

	private readonly urlPedidos = 'http://localhost:3000/pedidos';

	private pedidos: Pedido[] = [];

	constructor(
		private usuarioService: UsuarioService,
		private carritoService: CarritoService,
		private http: HttpClient,
	) {
		this.inicializarPedidos();
	}

	private inicializarPedidos(): void {
		this.http.get<Pedido[]>(this.urlPedidos).subscribe({
			next: pedidos => {
				this.pedidos = pedidos;
			},
			error: () => {
				this.pedidos = [];
			}
		});
	}


	/**
	 * Obtiene los pedidos de un usuario desde la API.
	 * @param usuario_id String con el ID del usuario.
	 * @returns Observable con los pedidos encontrados, puede ser nulo.
	 */
	apiObtenerPedidosUsuario(usuario_id: string): Observable<Pedido[]> {
		return this.http.get<Pedido[]>(`${this.urlPedidos}?usuario_id=${usuario_id}`).pipe(
			map(pedidos => pedidos ?? null)
		);
	}


	/**
	 * Crea un nuevo pedido desde la API.
	 * @param pedido Objeto pedido a crear.
	 * @returns Observable del perdido creado.
	 */
	apiCrearPedido(pedido: Pedido): Observable<Pedido> {
		return this.http.post<Pedido>(this.urlPedidos, pedido);
	}

	
	obtenerPedidos(): Pedido[] {
		return [...this.pedidos];
	}

	
	/**
	 * Agrega un pedido, si usuario_id es nulo, crea un usuario visita.
	 * @param usuario_id String del ID del usuario, puede ser nulo.
	 * @param nombre String, nombre de la persona que realizó el pedido.
	 * @param correo String, correo de la persona que realizó el pedido.
	 * @param fecha_nacimiento String con la fecha de nacimiento de la persona.
	 * @param es_vip Boolean, que indica si el pedido lo realizó un usuario vip.
	 * @param carrito_id String del ID del carrito del cual se crea el pedido.
	 * @param estado String del estado del pedido.
	 * @param detalle_envio Objeto DetalleEnvio para el pedido.
	 * @param tipo_pago String del tipo de pago del pedido.
	 * @param detalle_pedido Objeto ProductoCarrito para el pedido.
	 * @param detalle_totales Objeto ResumenCarrito para el pedido.
	 * @returns Observable de objeto con estado y respuesta
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 */
	agregarPedido(
		usuario_id		: string | null,
		nombre			: string,
		correo			: string,
		fecha_nacimiento: string,
		es_vip			: boolean,
		carrito_id		: string,
		estado			: string,
		detalle_envio	: DetalleEnvio,
		tipo_pago		: string,
		detalle_pedido	: ProductoCarrito[],
		detalle_totales : ResumenCarrito,
	): Observable<{ estado: number; respuesta: string }> {

		let usuarioObservable: Observable<Usuario>;

		const usuarios = this.usuarioService.obtenerUsuarios();
		if(usuario_id) {
			const usuarioEncontrado = usuarios.find(u => u.id === usuario_id);
			if(!usuarioEncontrado) return of ({ estado: 0, respuesta: 'Usuaio no encontrado' });

			usuarioObservable = of (usuarioEncontrado);
			
		} else {
			// agregar visita
			usuarioObservable = this.usuarioService.registrar({
				nombre: nombre, correo:correo, fecha_nacimiento:fecha_nacimiento, visita: true
			}).pipe(
				switchMap(resultado => {
					if(resultado.usuario === null) return throwError(() => new Error(resultado.respuesta));
					return of (resultado.usuario)
				})
			);
		}

		const carritos = this.carritoService.obtenerCarritos();
		const carritoEncontrado = carritos.find(c => c.id === carrito_id && c.activo === true);
		if(!carritoEncontrado) return of ({ estado: 0, respuesta: 'Carrito no encontrado' });

		return usuarioObservable.pipe(
			switchMap(usuario => {

				const nuevoPedido: Pedido = {
					id				: crypto.randomUUID(),
					usuario_id		: usuario.id,
					es_vip			: es_vip,
					carrito_id		: carrito_id,
					fecha			: new Date(),
					estado			: estado,
					detalle_pedido	: detalle_pedido,
					detalle_envio	: detalle_envio,
					detalle_totales	: detalle_totales,
					tipo_pago		: tipo_pago,
					historial_estado: [{
						estado		: estado,
						fecha		: new Date(),
						observacion	: null
					}]
				};

				return this.apiCrearPedido(nuevoPedido).pipe(
					map(() => usuario)
				);
			}),

			switchMap(usuario => 
				this.carritoService.actualizarCarrito(carrito_id, usuario.id, false, null)
			),

			map(() => ({
				estado: 1,
				respuesta: 'Pedido completado'
			}))

		);
	}
}
