import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Auth } from '../../services/auth';
import { ResumenCarrito } from '../../services/modelos';

import { formatearPrecio } from '../../utils/product-utils';

@Component({
  selector: 'app-resumen-compra',
  imports: [
    CommonModule,
  ],
  templateUrl: './resumen-compra.html',
  styleUrl: './resumen-compra.css',
})
export class ResumenCompra {

  @Input() resumenCompra: ResumenCarrito = {
    total_productos: 0,
    total_productos_sin_dcto: 0,
    descuento: 0,
    descuento_vip: 0,
    total_envio: 0,
    total_final: 0,
  };

  formatearPrecio = formatearPrecio;

  constructor(
    public authService: Auth,
  ) {}
}
