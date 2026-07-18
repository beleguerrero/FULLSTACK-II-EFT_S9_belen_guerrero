
// usuarios
export interface Usuario {
	id: string;
	name: string;
	username: string | null;
	email: string;
	pass: string | null;
	birthdate: Date;
	address: string | null;
	role: string;
}

export interface UsuarioVip {
	id: string;
	usuario_id: Usuario['id'];
	card_number: number;
	start_date: Date;
	end_date: Date;
}


// carrito
export interface DetalleCarritoData {
	producto_id: ProductoData['id'];
	cantidad: number;
}

export interface CarritoData {
	id: string;
	usuario_id: Usuario['id'] | null;
	activo: boolean;
	detalles: DetalleCarritoData[];
}

// para checkout**
export interface ProductoCarrito {
  producto_id: ProductoData['id'];
  nombre: ProductoData['name'];
  slug: ProductoData['slug'];
  imagen: ProductoData['image'];
  cantidad: number;
  precio: number;
  monto_descuento: number | null;
}

export interface HistorialPedido {
	estado: string;
	fecha: Date | string;
	observacion: string | null
}

export interface DetalleEnvio {
  direccion: string;
  ciudad: string,
  region: string,
  nombre_contacto: string;
  telefono_contacto: string
}

export interface Pedido {
	id: string;
	usuario_id: Usuario['id'] | null;
  es_vip: boolean;
	carrito_id: CarritoData['id'];
	fecha: Date;
	estado: string;
	detalle_pedido: ProductoCarrito[];
  detalle_envio: DetalleEnvio;
  detalle_totales: ResumenCarrito;
  tipo_pago: string;
	historial_estado: HistorialPedido[];
}

export interface ResumenCarrito {
  total_productos: number;
  total_productos_sin_dcto: number;
  descuento: number;
  descuento_vip: number;
  total_envio: number;
  total_final: number;
}


// productos
export interface ProductoData {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_amount: number | null;
  slug: string;
  image: string;
  category_id: CategoriaData['id'];
  stock: number;
}


// categorías
export interface CategoriaData {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}
