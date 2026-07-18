
import { ProductoData } from "../services/modelos";


/**
 * Retorna un precio en formato $ 00.000.
 * @param precio Precio numérico.
 * @returns El mismo precio en formateado.
 */
export function formatearPrecio(precio: number): string {
  return '$ ' + precio.toLocaleString('es-CL');
}



/**
 * Obtiene el número de descuento de un producto.
 * @param precio precio sin descuento.
 * @param monto_descuento valor de descuento, puede ser nulo.
 * @param es_vip Boolean que indica si debe aplicar el descuento para los VIP.
 * @returns Número de descuento.
 */
export function obtenerPorcentajeDcto(precio: number, monto_descuento: number | null, es_vip :boolean): number {
	const precioFinal = obtenerPrecioFinal(precio, monto_descuento, es_vip);

	return Math.round(
		(1 - precioFinal / precio) * 100
	);
}


/**
 * Calcula el precio final de un producto, ya sea si tiene descuento y/o VIP.
 * @param precio precio sin descuento.
 * @param monto_descuento valor de descuento, puede ser nulo.
 * @param es_vip Boolean que indica si debe aplicar el descuento para los VIP.
 * @returns Precio final de un producto.
 */
export function obtenerPrecioFinal(precio: number, monto_descuento: number | null, es_vip: boolean): number {
	// let precio = producto.price;

	if(monto_descuento) {
		precio -= monto_descuento;
	}

	if(es_vip) {
		precio = precio * ((100 - 10) / 100);
	}

	return Math.round(precio);
}
