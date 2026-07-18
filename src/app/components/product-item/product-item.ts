import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductoData } from '../../services/modelos';
import { ProductoService } from '../../services/producto-service';

import { Auth } from '../../services/auth';
import { CarritoService } from '../../services/carrito-service';

import { formatearPrecio, obtenerPorcentajeDcto, obtenerPrecioFinal } from '../../utils/product-utils';

import { toastError, toastSuccess } from '../../utils/swal-utils';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
})
export class ProductItem implements OnInit {
  @Input() categoria?: string;
  @Input() ids?: string[];
  
  productos: ProductoData[] = [];
  cargando: boolean = true;

  formatearPrecio = formatearPrecio;
  obtenerPorcentajeDcto = obtenerPorcentajeDcto;
  obtenerPrecioFinal = obtenerPrecioFinal;

  constructor(
    public authService: Auth,
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.apiObtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    })
  }


  get productosFiltrados(): ProductoData[] {

    if(this.categoria) {
      return this.productos.filter(p => p.category_id === this.categoria);
    }

    if(this.ids?.length) {
      return this.productos.filter(p => this.ids!.includes(p.id));
    }
    
    return this.productos;
  }
  
  agregarAlCarrito(producto_id: string): void {
    const usuario = this.authService.usuarioActual;

    let usuario_id = null;

    if(usuario) {
      usuario_id = usuario.id;
    }

    this.carritoService.agregarCarrito(usuario_id, producto_id).subscribe(resultado => {
      if(resultado.estado === 0) {
        toastError(resultado.respuesta);
      } else {
        toastSuccess(resultado.respuesta)
      }
    });
  }
}
