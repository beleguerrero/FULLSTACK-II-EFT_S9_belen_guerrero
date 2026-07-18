
import { ResumenCarrito, ProductoCarrito, DetalleCarritoData, ProductoData } from "../services/modelos";
import { obtenerPrecioFinal } from "./product-utils";


/**
 * Obtiene el resumen de una compra a partir de los productos del carrito.
 * @param productosCarrito Array de productos del carrito.
 * @param es_vip Indica si el usuario es vip para aplicar descuentos y envío gratuito.
 * @returns Objeto ResumenCarrito con los totales calculados:
 * - total_productos: Total de los productos con descuentos aplicados.
 * - total_productos_sin_dcto: Total de los productos sin descuentos.
 * - descuento: Monto total de descuento.
 * - descuento_vip: Monto total de solo el descuento vip
 * - total_envio: Costo del envío (0 para usuarios VIP).
 * - total_final: Total final de la compra, incluyendo el costo de envío.
 */
export function calcularResumen(productosCarrito: ProductoCarrito[], es_vip: boolean): ResumenCarrito {

  const totalProductos = productosCarrito.reduce(
    (total, item) => total + (obtenerPrecioFinal(item.precio, item.monto_descuento, es_vip) * item.cantidad), 0
  );

  const totalProductosSinDcto = productosCarrito.reduce(
    (total, item) => total + (item.precio * item.cantidad), 0
  );

  const totalDcto = productosCarrito.reduce(
    (total, item) => total + (obtenerPrecioFinal(item.precio, item.monto_descuento, false) * item.cantidad),
    0
  );

  const descuento = totalProductosSinDcto - totalDcto;

  let totalEnvio = 4990;
  let descuentoVip = 0;
  if(es_vip) {
    totalEnvio = 0;
    descuentoVip = (totalProductosSinDcto - totalProductos) - descuento;
  }

  return {
    total_productos: totalProductos,
    total_productos_sin_dcto: totalProductosSinDcto,
    descuento: descuento,
    descuento_vip: descuentoVip,
    total_envio: totalEnvio,
    total_final: totalProductos + totalEnvio
  };
}


/**
 * Obtiene la información completa de los productos contenidos en un carrito.
 * @param detalle_carrito Array de detalle del carrito.
 * @param productos Array de productos.
 * @returns Objeto ProductoCarrito con la información necesaria para mostrar y calcular el carrito.
 */
export function obtenerProductoCarrito(detalle_carrito: DetalleCarritoData[], productos: ProductoData[]): ProductoCarrito[] {
  return detalle_carrito.map(
    detalle => {
      const producto = productos.find(
        p => p.id === detalle.producto_id
      );

      if(!producto) return null;

      return {
        producto_id: producto.id,
        nombre: producto.name,
        precio: producto.price,
        monto_descuento: producto.discount_amount,
        slug: producto.slug,
        imagen: producto.image,
        cantidad: detalle.cantidad,
      };
    }
  ).filter(
    (item): item is ProductoCarrito => item !== null
  );
}
