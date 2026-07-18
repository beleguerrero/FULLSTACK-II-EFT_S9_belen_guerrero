import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CategoriaData } from '../../services/modelos';
import { ProductoService } from '../../services/producto-service';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  categorias: CategoriaData[] = [];
  cargando: boolean = true;

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.productoService.apiObtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos.slice(0, 4);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
