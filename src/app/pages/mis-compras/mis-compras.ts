import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ResumenCompra } from '../../components/resumen-compra/resumen-compra';
import { ProductosCompra } from '../../components/productos-compra/productos-compra';
import { Auth } from '../../services/auth';
import { PedidoService } from '../../services/pedido-service';
import { Pedido } from '../../services/modelos';

import { formatearPrecio, obtenerPrecioFinal } from '../../utils/product-utils';

interface PedidoConCantidad extends Pedido {
  cantidad_productos: number;
}
@Component({
  selector: 'app-mis-compras',
  imports: [
    CommonModule,
    RouterLink,
    ProductosCompra,
    ResumenCompra,
  ],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras {

  pedidosUsuario: PedidoConCantidad[] = [];
  cargando: boolean = true;

  formatearPrecio = formatearPrecio;
  obtenerPrecioFinal = obtenerPrecioFinal;

  constructor(
    public authService: Auth,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }


  /**
   * Carga los pedidos del usuario desde la API y calcula la cantidad total de productos por pedido.
   */
  cargarPedidos(): void {
    const usuarioActual = this.authService.usuarioActual;
    if(!usuarioActual) return;

    this.pedidoService.apiObtenerPedidosUsuario(usuarioActual.id).subscribe({
      next: pedidos => {
        this.pedidosUsuario = pedidos.map(pedido => ({
          ...pedido,
          cantidad_productos: pedido.detalle_pedido.reduce(
            (total, item) => total + item.cantidad, 0
          )
        }))
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pedidosUsuario = [];
        this.cargando = false;
      }
    });
  }
}
