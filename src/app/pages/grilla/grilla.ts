import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ProductItem } from '../../components/product-item/product-item';
import { CategoriaData } from '../../services/modelos';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-grilla',
  standalone: true,
  imports: [
    CommonModule,
    ProductItem,
  ],
  templateUrl: './grilla.html',
  styleUrl: './grilla.css',
})
export class Grilla implements OnInit {
  categoria?: CategoriaData;

  cargando: boolean = true;
  slugActual: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private productoService: ProductoService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.slugActual = String(params.get('slug'));
      this.cargarCategoria(this.slugActual);
    });
  }


  /**
   * Obtiene la categoría por el slug de la url, si no redirige a página 404.
   * @param slug String con el slug de la categoría.
   */
  cargarCategoria(slug: string): void {
    this.productoService.apiObtenerCategoriaPorSlug(slug).subscribe({
      next: (categoria) => {
        this.cargando = false;
        
        if(categoria) {
          this.categoria = categoria;
        } else {
          this.router.navigate(['/404']);
          return;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }

    });
  }
}
