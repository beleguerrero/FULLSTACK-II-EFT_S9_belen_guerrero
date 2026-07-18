
import { Injectable } 		from "@angular/core";
import { BehaviorSubject, Observable, map, of, switchMap } 	from "rxjs";
import { HttpClient } from "@angular/common/http";

import { CarritoData, DetalleCarritoData } from "./modelos";
import { UsuarioService } from "./usuario-service";


/**
 * Servicios para el carrito.
 */
@Injectable({
  providedIn: 'root'
})
export class CarritoService {

	private readonly urlCarritos = 'http://localhost:3000/carritos';

	private carritos: CarritoData[] = [];

	constructor(
		private usuarioService: UsuarioService,
		private http: HttpClient,
	) {
		this.inicializarCarritos();
	}

	private inicializarCarritos(): void {
		this.http.get<CarritoData[]>(this.urlCarritos).subscribe({
			next: carritos => {
				this.carritos = carritos;
			},
			error: () => {
				this.carritos = [];
			}
		});
	}

	

	/**
	 * Obtiene lista de carritos desde la API.
	 * @returns Observable con array de los carritos.
	 */
	apiObtenerCarritos(): Observable<CarritoData[]> {
		return this.http.get<CarritoData[]>(this.urlCarritos);
	}


	/**
	 * Obtiene un carrito por su ID y activo desde la API.
	 * @param id String con el ID del carrito.
	 * @param activo Boolean para el filtro de activo.
	 * @returns Observable con el carrito encontrado, puede ser nulo.
	 */
	apiObtenerCarritoPorId(id: string, activo:boolean = true): Observable<CarritoData | null> {
		return this.http.get<CarritoData[]>(`${this.urlCarritos}?id=${id}&activo=${activo}`).pipe(
			map(carritos => carritos[0] ?? null)
		);
	}


	/**
	 * Obtiene un carritp por su usuario y activo desde la API.
	 * @param usuario_id String con el Id del usuario, puede ser nulo.
	 * @param activo Boolean para el filtro de activo.
	 * @returns Observable con el carrito encontrado, puede ser nulo.
	 */
	apiObtenerCarritoPorUsuario(usuario_id: string | null, activo:boolean = true): Observable<CarritoData | null> {
		const usuario_filtro = usuario_id ? `&usuario_id=${usuario_id}` : ''
		return this.http.get<CarritoData[]>(`${this.urlCarritos}?activo=${activo}${usuario_filtro}`).pipe(
			map(carritos => {
				if(usuario_id === null) return carritos.find(c => c.usuario_id === null) ?? null;
				
				return carritos[0] ?? null;
			})
		);
	}


	/**
	 * Crea un nuevo carrito desde la API.
	 * @param carrito Objeto carrito a crear.
	 * @returns Observable del carrito creado.
	 */
	apiCrearCarrito(carrito: CarritoData): Observable<CarritoData> {
		return this.http.post<CarritoData>(this.urlCarritos, carrito);
	}

	
	/**
	 * Actuliaza un carrito desde la API.
	 * @param carrito Objeto carrito a actualizar.
	 * @returns Observable del carrito actualizado.
	 */
	apiActualizarCarrito(carrito: CarritoData): Observable<CarritoData> {
		return this.http.put<CarritoData>(`${this.urlCarritos}/${carrito.id}`, carrito);
	}


	/**
	 * Elimina carrito por su ID desde la API.
	 * @param carrito_id ID del carrito a eliminar.
	 * @returns Ovservable vacío-
	 */
	apiEliminarCarrito(carrito_id: string): Observable<void> {
		return this.http.delete<void>(`${this.urlCarritos}/${carrito_id}`);
	}



	private sumaCarritoSubject = new BehaviorSubject<number> (0);
	sumaCarrito$ = this.sumaCarritoSubject.asObservable();

	private carritoActualSubject = new BehaviorSubject<CarritoData | null> (null);
	carritoActual$ = this.carritoActualSubject.asObservable();

	guardarCarritoActual(usuario_id: string | null): void {
		this.apiObtenerCarritoPorUsuario(usuario_id).subscribe(carrito => {
			if(carrito) {
				this.carritoActualSubject.next(carrito);
				const cantidad = this.obtenerSumaCantidad(carrito);
				this.sumaCarritoSubject.next(cantidad);
			} else {
				this.carritoActualSubject.next(null);
				this.sumaCarritoSubject.next(0);
			}
		});
	}

	get carritoActual(): CarritoData | null {
		return this.carritoActualSubject.value;
	}

	obtenerCarritos(): CarritoData[] {
		return [...this.carritos];
	}


	/**
	 * Acualiza la cantidad de un producto en un carrito
	 * @param carrito_id ID del carrito.
	 * @param producto_id ID del producto.
	 * @param cantidad cantidad que se actualizará. Si es nulo solo agrega uno. Si es 0 elimina.
	 * @returns Observable de objeto con estado y respuesta.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 */
	actualizarCantidadCarrito(
		carrito_id: string | null, producto_id: string, cantidad: number | null
	): Observable<{ estado: number; respuesta: string }> {
		const carritos = this.carritos;

		const carritoEncontrado = carritos.find(
			c => c.id === carrito_id &&
			c.activo === true
		);

		if(carritoEncontrado) {
			// ver si ya hay detalle con el mismo producto
			const detalles = carritoEncontrado.detalles;
			
			const productoDetalleEncontrado = detalles.find(
				pd => pd.producto_id === producto_id
			);

			if(productoDetalleEncontrado) {
				if(cantidad === null) {
					
					// botón agregar al carrito, se agrega uno más
					if(productoDetalleEncontrado.cantidad < 10) {
						productoDetalleEncontrado.cantidad ++;
					} else {
						return of ({ estado: 0, respuesta: 'No puede agregar más del mismo producto' });
					}
				
				} else {
					
					if(cantidad === 0) {
						// eliminar
						const indice = detalles.findIndex(d => d.producto_id === producto_id);
						if(indice !== -1) {
							detalles.splice(indice, 1);
						}
						if(carritoEncontrado.detalles.length === 0) {
							this.carritos = this.carritos.filter(
								c => c.id !== carritoEncontrado.id
							);
							// eliminar api
							return this.apiEliminarCarrito(carritoEncontrado.id).pipe(
								map(() => {
									this.guardarCarritoActual(carritoEncontrado.id);
									return { estado: 1, respuesta: 'Carrito eliminado' };
								})
							);
						}
					} else {
						if(cantidad <= 10) {
							productoDetalleEncontrado.cantidad = cantidad;
						} else {
							return of ({ estado: 0, respuesta: 'No puede agregar más del mismo producto' });
						}
					}
				}

			} else {
				detalles.push({
					producto_id : producto_id,
					cantidad	: 1
				})
			}
			
			return this.apiActualizarCarrito(carritoEncontrado).pipe(
				map(carritoActualizado => {
					this.guardarCarritoActual(carritoActualizado.usuario_id);
					return { estado: 1, respuesta: 'Agregado correctamente' };
				})
			);
		}

		return of ({ estado: 1, respuesta: 'Carrito no encontrado' });
	}


	/**
	 * Agrega UN producto al carrito, si no existe lo crea.
	 * @param usuario_id ID del usuario.
	 * @param producto_id ID del producto.
	 * @returns Observable de objeto con estado y respuesta.
	 * - estado: 0 error | 1 correcto.
	 * - respuesta: mensaje.
	 */
	agregarCarrito(
		usuario_id: string | null, producto_id: string
	): Observable<{ estado: number; respuesta: string }> {
		
		const carritos = this.carritos;

		const carritoEncontrado = carritos.find(
			c => c.usuario_id === usuario_id &&
			c.activo === true
		);
		if(carritoEncontrado) return this.actualizarCantidadCarrito(carritoEncontrado.id, producto_id, null);

		const nuevoCarrito: CarritoData = {
			id			: crypto.randomUUID(),
			usuario_id	: usuario_id,
			activo		: true,
			detalles	: [{
				producto_id	: producto_id,
				cantidad	: 1
			}]
		}

		return this.apiCrearCarrito(nuevoCarrito).pipe(
			map(nuevoCarrito => {
				this.carritos.push(nuevoCarrito);
				this.guardarCarritoActual(usuario_id);
				return { estado: 1, respuesta: 'Agregado correctamente' };
			})
		);
	}


	/**
	 * Retorna la suma de todos los productos del carrito de un usuario.
	 * @param usuario_id ID del usuario.
	 * @returns observable number con la cantidad total.
	 */
	obtenerSumaCantidad(carrito: CarritoData | null): number {
		if(!carrito) {
			return 0;
		}
		return carrito.detalles.reduce((total, detalle) => total + detalle.cantidad, 0);
	}

	actualizarCarrito(
		id: string, usuario_id: string | null, activo: boolean | null, detalles: DetalleCarritoData[] | null
	): Observable<{ estado: number; respuesta: string }> {

		const carritos = this.carritos;

		const carritoEncontrado = carritos.find(c => c.id === id);
		if(!carritoEncontrado) return of ({ estado: 0, respuesta: 'Carrito no encontrado' });

		if(usuario_id) {
			const usuarios = this.usuarioService.obtenerUsuarios();

			const usuarioEncontrado = usuarios.find(u => u.id === usuario_id);
			if(!usuarioEncontrado) return of ({ estado: 0, respuesta: 'Usuario no encontrado' });
			
			carritoEncontrado.usuario_id = usuario_id;
		}

		if(activo !== null) carritoEncontrado.activo = activo;
		if(detalles) carritoEncontrado.detalles = detalles;

		return this.apiActualizarCarrito(carritoEncontrado).pipe(
			map(() => {
				this.guardarCarritoActual(usuario_id);
				return { estado: 1, respuesta: 'Carrito actualizado correctamente' };
			})
		);
	}
}
