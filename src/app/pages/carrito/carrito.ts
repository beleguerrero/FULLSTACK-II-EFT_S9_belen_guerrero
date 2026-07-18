import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

import { ResumenCompra } from '../../components/resumen-compra/resumen-compra';

import { CarritoService } from '../../services/carrito-service';
import { Auth } from '../../services/auth';
import { ProductoService } from '../../services/producto-service';
import { ProductoData, ProductoCarrito, ResumenCarrito } from '../../services/modelos';


import { formatearPrecio, obtenerPorcentajeDcto, obtenerPrecioFinal } from '../../utils/product-utils';
import { calcularResumen, obtenerProductoCarrito } from '../../utils/carrito-utils';
import { toastSuccess, toastError } from '../../utils/swal-utils';


@Component({
  selector: 'app-carrito',
  imports: [
    RouterLink,
    CommonModule,
    ResumenCompra,
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  productosCarrito: ProductoCarrito[] = [];
  resumenCarrito: ResumenCarrito = {
    total_productos: 0,
    total_productos_sin_dcto: 0,
    descuento: 0,
    descuento_vip: 0,
    total_envio: 0,
    total_final: 0,
  }

  formatearPrecio = formatearPrecio;
  obtenerPorcentajeDcto = obtenerPorcentajeDcto;
  obtenerPrecioFinal = obtenerPrecioFinal;

  productos: ProductoData[] = [];
  cargando: boolean = true;

  constructor(
    public carritoService: CarritoService,
    public authService: Auth,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }


  /**
   * Carga los productos desde la API y actualiza la información del carrito actual.
   * Si existe un carrito activo, obtiene el detalle de los productos y calcula el resumen de la compra.
   */
  cargarProductos(): void {
    this.productoService.apiObtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
        
        this.carritoService.carritoActual$.subscribe(carrito => {
          if(!carrito) {
            this.productosCarrito = [];
            return;
          }

          this.productosCarrito = obtenerProductoCarrito(carrito.detalles, this.productos);

          const es_vip = this.authService.esVip;
          this.resumenCarrito = calcularResumen(this.productosCarrito, es_vip);
          
          this.cargando = false;
          this.cdr.detectChanges();
        });

      },
      error: () => {
        this.cargando = false;
      }
    })
  }


  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param pc Producto del carrito cuya cantidad será modificada.
   * @param event Evento del selector de cantidad.
   */
  cambioCantidad(pc: ProductoCarrito, event: Event): void {
    const cantidad = Number((event.target as HTMLSelectElement).value);
    const producto_id = pc.producto_id;
    const carrito =  this.carritoService.carritoActual;
    
    if(carrito) {
      this.carritoService.actualizarCantidadCarrito(carrito.id, producto_id, cantidad).subscribe(resultado => {
        if(resultado.estado === 0) {
          toastError(resultado.respuesta);
        } else {
          toastSuccess('Modificado correctamente');
        }
      });
    }
  }

  
  /**
   * Elimina un producto del carrito.
   * @param producto_id ID del producto que se eliminará del carrito.
   */
  eliminarProductoCarrito(producto_id: string): void {
    const carrito = this.carritoService.carritoActual;

    if(carrito) {
      this.carritoService.actualizarCantidadCarrito(carrito.id, producto_id, 0).subscribe(resultado => {
        if(resultado.estado === 0) {
          toastError(resultado.respuesta);
        } else {
          toastSuccess('Eliminado correctamente');
        }
      });
    }
  }
}
