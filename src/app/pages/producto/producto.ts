import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { CategoriaData, ProductoData } from '../../services/modelos';
import { ProductoService } from '../../services/producto-service';
import { ProductItem } from '../../components/product-item/product-item';
import { Auth } from '../../services/auth';
import { CarritoService } from '../../services/carrito-service';

import { formatearPrecio, obtenerPorcentajeDcto, obtenerPrecioFinal } from '../../utils/product-utils';

import { ChangeDetectorRef } from '@angular/core';
import { toastError, toastSuccess } from '../../utils/swal-utils';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    ProductItem
  ],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto implements OnInit {
  producto?: ProductoData;
  productosRelacionados: string[] = [];
  NombreCategoria: string = '';

  formatearPrecio = formatearPrecio;
  obtenerPorcentajeDcto = obtenerPorcentajeDcto;
  obtenerPrecioFinal = obtenerPrecioFinal;

  slugActual: string = '';
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: Auth,
    public carritoService: CarritoService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.slugActual = String(params.get('slug'));
      this.cargarProducto(this.slugActual);
    });
  }


  /**
   * Obtiena un poducto por el slug de la url y le carga productos relacionados de su misma categoría, si no redirige a página 404.
   * @param slug String con el slug del producto.
   */
  cargarProducto(slug: string): void {
    this.productoService.apiObtenerProductoPorSlug(slug).subscribe({
      next: (producto) => {
        this.cargando = false;
        
        if(producto) {
          this.producto = producto;
          let categoria = this.producto.category_id;
          let id = this.producto.id;

          this.productoService.apiObtenerCategoriaPorId(categoria).subscribe({
            next: categoria => {
              this.NombreCategoria = '';
              if(categoria) {
                this.NombreCategoria = categoria.name;
              }
            }
          })

          this.productoService.apiObtenerProductosPorCategoria(producto.category_id).subscribe({
            next: (productos) => {
              this.productosRelacionados = [];

              if(productos) {
                const rel = productos.filter((p) => {
                  return p.category_id === categoria && p.id !== id;
                }).slice(0, 3);
      
                const ids = rel.map(p => p.id);
                this.productosRelacionados = ids;
              }
              
              this.cdr.detectChanges();
            },
            error: () => {
              this.cargando = false;
            }
          })
          
        } else {
          this.router.navigate(['/404']);
          return;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });

  }



  /**
   * Agrega un producto al carrito y muestra mensaje de respuesta si fue exitoso o no.
   * @param producto_id String con el ID del producto.
   */
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
