import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';
import { ProductoCarrito } from '../../services/modelos';

import { formatearPrecio, obtenerPrecioFinal } from '../../utils/product-utils';

@Component({
  selector: 'app-productos-compra',
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './productos-compra.html',
  styleUrl: './productos-compra.css',
})
export class ProductosCompra {

  @Input() productosCompra: ProductoCarrito[] = [];

  formatearPrecio = formatearPrecio;
  obtenerPrecioFinal = obtenerPrecioFinal;

  constructor(
    public authService: Auth
  ) {}

}
